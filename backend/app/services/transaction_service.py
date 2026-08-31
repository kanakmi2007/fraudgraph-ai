import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from app.database.mongodb import mongo_client
from app.database.neo4j import neo4j_client
from app.services.risk_service import calculate_account_risk
from app.services.alert_service import create_alert_from_detection

def process_transaction(tx_data: Dict[str, Any]) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]]]:
    """
    Core Ingestion Pipeline:
    1. Assign ID & timestamp if missing
    2. Store in MongoDB
    3. Update Neo4j graph
    4. Calculate Risk Score & explainable reasons
    5. Trigger Alert if risk >= 60.0 or patterns flagged
    """
    if "transaction_id" not in tx_data:
        tx_data["transaction_id"] = f"TX-{uuid.uuid4().hex[:8].upper()}"
    if "timestamp" not in tx_data:
        tx_data["timestamp"] = datetime.utcnow().isoformat() + "Z"

    sender_id = tx_data["sender_account"]
    receiver_id = tx_data["receiver_account"]

    # 1. Insert into MongoDB
    mongo_client.insert_transaction(tx_data)

    # 2. Update Neo4j Graph
    neo4j_client.add_transaction_edge(sender_id, receiver_id, tx_data)

    # Fetch accounts & evaluate risk
    sender_acc = mongo_client.get_account(sender_id) or {
        "account_id": sender_id, "customer_id": f"CUST-{sender_id}", "name": sender_id,
        "account_type": "SAVINGS", "bank": "HDFC Bank", "country": "India", "city": "Mumbai",
        "created_at": datetime.utcnow().isoformat() + "Z", "status": "ACTIVE", "risk_score": 0.0,
        "risk_level": "LOW", "device_id": "DEV-01", "phone": "+919876543210", "email": f"{sender_id.lower().replace(' ', '.')}@example.com"
    }
    receiver_acc = mongo_client.get_account(receiver_id) or {
        "account_id": receiver_id, "customer_id": f"CUST-{receiver_id}", "name": receiver_id,
        "account_type": "SAVINGS", "bank": "ICICI Bank", "country": "India", "city": "Mumbai",
        "created_at": datetime.utcnow().isoformat() + "Z", "status": "ACTIVE", "risk_score": 0.0,
        "risk_level": "LOW", "device_id": "DEV-02", "phone": "+919876543211", "email": f"{receiver_id.lower().replace(' ', '.')}@example.com"
    }

    sender_txs = mongo_client.get_account_transactions(sender_id, limit=100)
    receiver_txs = mongo_client.get_account_transactions(receiver_id, limit=100)

    # 3. Calculate Risk for Receiver
    r_score, r_level, r_patterns, r_reasons, _ = calculate_account_risk(receiver_acc, receiver_txs)
    receiver_acc["risk_score"] = r_score
    receiver_acc["risk_level"] = r_level
    mongo_client.insert_account(receiver_acc)
    neo4j_client.add_account_node(receiver_id, {"risk_score": r_score, "risk_level": r_level})

    # Calculate Risk for Sender
    s_score, s_level, s_patterns, s_reasons, _ = calculate_account_risk(sender_acc, sender_txs)
    sender_acc["risk_score"] = s_score
    sender_acc["risk_level"] = s_level
    mongo_client.insert_account(sender_acc)
    neo4j_client.add_account_node(sender_id, {"risk_score": s_score, "risk_level": s_level})

    # Update transaction risk fields
    max_risk = max(r_score, s_score)
    tx_data["risk_score"] = max_risk
    tx_data["risk_level"] = r_level if r_score >= s_score else s_level
    tx_data["detected_patterns"] = list(set(r_patterns + s_patterns))
    mongo_client.insert_transaction(tx_data)

    # 4. Trigger Alert if High Risk or Patterns Detected
    generated_alert = None
    if max_risk >= 60.0 or len(tx_data["detected_patterns"]) > 0:
        primary = receiver_id if r_score >= s_score else sender_id
        patterns = r_patterns if r_score >= s_score else s_patterns
        evidence = r_reasons if r_score >= s_score else s_reasons
        inv_accounts = list(set([sender_id, receiver_id] + neo4j_client.get_neighbors(primary)))
        inv_txs = [t["transaction_id"] for t in (receiver_txs if r_score >= s_score else sender_txs)]
        tot_amt = sum(t.get("amount", 0.0) for t in (receiver_txs if r_score >= s_score else sender_txs))

        generated_alert = create_alert_from_detection(
            primary_account=primary,
            risk_score=max_risk,
            detected_patterns=patterns,
            evidence=evidence,
            involved_accounts=inv_accounts,
            transaction_ids=inv_txs,
            total_amount=tot_amt
        )

    return tx_data, generated_alert

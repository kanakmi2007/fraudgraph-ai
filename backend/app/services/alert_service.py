import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.database.mongodb import mongo_client

def create_alert_from_detection(
    primary_account: str,
    risk_score: float,
    detected_patterns: List[str],
    evidence: List[str],
    involved_accounts: List[str],
    transaction_ids: List[str],
    total_amount: float
) -> Dict[str, Any]:
    """Create a structured Fraud Alert in MongoDB"""
    if risk_score >= 81.0:
        severity = "CRITICAL"
    elif risk_score >= 61.0:
        severity = "HIGH"
    elif risk_score >= 31.0:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    pattern_title = ", ".join([p.replace("_", " ") for p in detected_patterns]) if detected_patterns else "Suspicious Activity"
    title = f"Alert: {primary_account} ({pattern_title})"

    alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
    alert_data = {
        "alert_id": alert_id,
        "title": title,
        "severity": severity,
        "risk_score": risk_score,
        "primary_account": primary_account,
        "involved_accounts": list(set(involved_accounts)),
        "transaction_ids": list(set(transaction_ids)),
        "detected_patterns": detected_patterns,
        "evidence": evidence,
        "total_amount": round(total_amount, 2),
        "transaction_count": len(transaction_ids),
        "time_window": "60 Minutes",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "status": "OPEN",
        "assigned_to": None
    }

    mongo_client.insert_alert(alert_data)
    return alert_data

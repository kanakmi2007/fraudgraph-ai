import numpy as np
import pandas as pd
from typing import List, Dict, Any
from app.database.neo4j import neo4j_client

def extract_account_features(account_id: str, account_txs: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Extract numerical features for ML model anomaly detection & scoring.
    """
    incoming = [t for t in account_txs if t.get("receiver_account") == account_id]
    outgoing = [t for t in account_txs if t.get("sender_account") == account_id]
    
    unique_senders = len(set(t.get("sender_account") for t in incoming))
    unique_receivers = len(set(t.get("receiver_account") for t in outgoing))
    
    inc_amounts = [t.get("amount", 0.0) for t in incoming]
    outg_amounts = [t.get("amount", 0.0) for t in outgoing]
    all_amounts = inc_amounts + outg_amounts
    
    total_inc = sum(inc_amounts)
    total_outg = sum(outg_amounts)
    
    avg_amt = float(np.mean(all_amounts)) if all_amounts else 0.0
    std_amt = float(np.std(all_amounts)) if len(all_amounts) > 1 else 0.0
    max_amt = float(np.max(all_amounts)) if all_amounts else 0.0
    
    # Count transactions in structuring range [8000, 9999]
    structuring_count = sum(1 for a in all_amounts if 8000 <= a <= 9999)
    
    in_deg = neo4j_client.get_in_degree(account_id)
    out_deg = neo4j_client.get_out_degree(account_id)
    
    return {
        "unique_senders": float(unique_senders),
        "unique_receivers": float(unique_receivers),
        "total_incoming_volume": float(total_inc),
        "total_outgoing_volume": float(total_outg),
        "avg_transaction_amount": avg_amt,
        "std_transaction_amount": std_amt,
        "max_transaction_amount": max_amt,
        "structuring_count": float(structuring_count),
        "graph_in_degree": float(in_deg),
        "graph_out_degree": float(out_deg),
        "total_tx_count": float(len(all_amounts))
    }

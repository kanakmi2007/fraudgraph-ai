from typing import List, Dict, Any

def detect_fan_in(account_id: str, account_txs: List[Dict[str, Any]], window_minutes: int = 60, min_incoming_accounts: int = 5) -> Dict[str, Any]:
    """
    Pattern 1: Fan-In
    Many accounts transfer money into one target account in a short period.
    """
    incoming_txs = [tx for tx in account_txs if tx.get("receiver_account") == account_id]
    if len(incoming_txs) < min_incoming_accounts:
        return {"detected": False, "score": 0.0, "details": {}}

    unique_senders = set(tx.get("sender_account") for tx in incoming_txs)
    total_amount = sum(tx.get("amount", 0.0) for tx in incoming_txs)
    
    if len(unique_senders) >= min_incoming_accounts:
        # Calculate risk score proportional to sender density
        score = min(100.0, 50.0 + (len(unique_senders) * 7.5))
        return {
            "detected": True,
            "pattern": "FAN_IN",
            "score": score,
            "details": {
                "unique_incoming_accounts": len(unique_senders),
                "sender_accounts": list(unique_senders),
                "total_amount": total_amount,
                "transaction_count": len(incoming_txs),
                "time_window_minutes": window_minutes
            },
            "evidence": f"Fan-In detected: {len(unique_senders)} unique accounts transferred total ₹{total_amount:,.2f} into {account_id} across {len(incoming_txs)} transactions."
        }
    
    return {"detected": False, "score": 0.0, "details": {}}

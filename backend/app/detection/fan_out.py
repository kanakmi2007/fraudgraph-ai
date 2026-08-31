from typing import List, Dict, Any

def detect_fan_out(account_id: str, account_txs: List[Dict[str, Any]], window_minutes: int = 60, min_outgoing_accounts: int = 5) -> Dict[str, Any]:
    """
    Pattern 2: Fan-Out
    One account sends funds to many distinct accounts in a short period.
    """
    outgoing_txs = [tx for tx in account_txs if tx.get("sender_account") == account_id]
    if len(outgoing_txs) < min_outgoing_accounts:
        return {"detected": False, "score": 0.0, "details": {}}

    unique_receivers = set(tx.get("receiver_account") for tx in outgoing_txs)
    total_amount = sum(tx.get("amount", 0.0) for tx in outgoing_txs)
    
    if len(unique_receivers) >= min_outgoing_accounts:
        score = min(100.0, 50.0 + (len(unique_receivers) * 7.5))
        return {
            "detected": True,
            "pattern": "FAN_OUT",
            "score": score,
            "details": {
                "unique_outgoing_accounts": len(unique_receivers),
                "receiver_accounts": list(unique_receivers),
                "total_amount": total_amount,
                "transaction_count": len(outgoing_txs),
                "time_window_minutes": window_minutes
            },
            "evidence": f"Fan-Out detected: {account_id} transferred total ₹{total_amount:,.2f} to {len(unique_receivers)} unique destination accounts."
        }
    
    return {"detected": False, "score": 0.0, "details": {}}

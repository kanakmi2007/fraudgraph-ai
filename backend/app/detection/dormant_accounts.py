from typing import List, Dict, Any

def detect_dormant_activation(account_data: Dict[str, Any], account_txs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Pattern 6: Dormant Account Activation
    Detect accounts registered as DORMANT or with very low historical activity that suddenly receive / transfer high volume.
    """
    status = account_data.get("status", "ACTIVE")
    total_volume = sum(tx.get("amount", 0.0) for tx in account_txs)
    tx_count = len(account_txs)

    if (status == "DORMANT" and tx_count > 0) or (tx_count <= 5 and total_volume >= 200000.0):
        score = min(100.0, 70.0 + (total_volume / 10000.0))
        return {
            "detected": True,
            "pattern": "DORMANT_ACTIVATION",
            "score": score,
            "details": {
                "account_status": status,
                "transaction_count": tx_count,
                "total_volume": total_volume
            },
            "evidence": f"Dormant Account Activation anomaly: Account in '{status}' status processed sudden high transaction volume of ₹{total_volume:,.2f} across {tx_count} transfers."
        }

    return {"detected": False, "score": 0.0, "details": {}}

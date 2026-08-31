from typing import List, Dict, Any

def detect_structuring(account_id: str, account_txs: List[Dict[str, Any]], lower_bound: float = 8000.0, upper_bound: float = 9999.0) -> Dict[str, Any]:
    """
    Pattern 5: Structuring / Smurfing
    Detect repeated transactions positioned just below regulatory reporting thresholds (e.g. ₹8,000 - ₹9,999).
    """
    structured_txs = [
        tx for tx in account_txs
        if lower_bound <= tx.get("amount", 0.0) <= upper_bound
    ]

    if len(structured_txs) >= 3:
        total_amount = sum(tx.get("amount", 0.0) for tx in structured_txs)
        avg_amount = total_amount / len(structured_txs)
        score = min(100.0, 55.0 + (len(structured_txs) * 8.0))
        return {
            "detected": True,
            "pattern": "STRUCTURING",
            "score": score,
            "details": {
                "structured_tx_count": len(structured_txs),
                "total_amount": total_amount,
                "average_amount": avg_amount,
                "threshold_range": [lower_bound, upper_bound]
            },
            "evidence": f"Structuring/Smurfing signal: Flagged {len(structured_txs)} transactions ranging between ₹{lower_bound:,.0f} and ₹{upper_bound:,.0f} (Avg: ₹{avg_amount:,.2f}) designed to stay below reporting limits."
        }

    return {"detected": False, "score": 0.0, "details": {}}

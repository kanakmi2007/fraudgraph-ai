from typing import List, Dict, Any, Optional
from datetime import datetime

def parse_iso(ts_str: str) -> Optional[datetime]:
    try:
        return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except Exception:
        return None

def detect_rapid_movement(account_id: str, account_txs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Pattern 4: Rapid Money Movement
    Detect funds entering an account and exiting within a very short timeframe (< 10 minutes).
    """
    incoming = [tx for tx in account_txs if tx.get("receiver_account") == account_id]
    outgoing = [tx for tx in account_txs if tx.get("sender_account") == account_id]

    rapid_pairs = []
    for inc in incoming:
        inc_ts = parse_iso(inc.get("timestamp", ""))
        if not inc_ts:
            continue
        for outg in outgoing:
            outg_ts = parse_iso(outg.get("timestamp", ""))
            if not outg_ts:
                continue
            time_diff = (outg_ts - inc_ts).total_seconds()
            if 0 <= time_diff <= 600:  # Within 10 minutes (600 seconds)
                rapid_pairs.append({
                    "in_tx": inc.get("transaction_id"),
                    "out_tx": outg.get("transaction_id"),
                    "sender": inc.get("sender_account"),
                    "receiver": outg.get("receiver_account"),
                    "in_amount": inc.get("amount"),
                    "out_amount": outg.get("amount"),
                    "duration_seconds": time_diff
                })

    if rapid_pairs:
        score = min(100.0, 60.0 + (len(rapid_pairs) * 10.0))
        fastest = min(rapid_pairs, key=lambda x: x["duration_seconds"])
        mins = int(fastest["duration_seconds"] // 60)
        secs = int(fastest["duration_seconds"] % 60)
        return {
            "detected": True,
            "pattern": "RAPID_MOVEMENT",
            "score": score,
            "details": {
                "rapid_pass_through_count": len(rapid_pairs),
                "fastest_pass_through": fastest,
                "pairs": rapid_pairs
            },
            "evidence": f"Rapid Fund Velocity detected: Received funds were passed out within {mins}m {secs}s (Total pass-through events: {len(rapid_pairs)})."
        }

    return {"detected": False, "score": 0.0, "details": {}}

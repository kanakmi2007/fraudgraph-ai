from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.database.mongodb import mongo_client
from app.services.graph_service import get_graph_for_account
from app.services.risk_service import calculate_account_risk

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("")
def list_accounts(
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    min_risk: Optional[float] = None,
    limit: int = 200
) -> List[Dict[str, Any]]:
    accounts = mongo_client.get_all_accounts(limit=1000)
    
    if search:
        s = search.lower()
        accounts = [a for a in accounts if s in a["account_id"].lower() or s in a["name"].lower() or s in a.get("bank", "").lower()]
    if risk_level:
        accounts = [a for a in accounts if a.get("risk_level") == risk_level.upper()]
    if min_risk is not None:
        accounts = [a for a in accounts if a.get("risk_score", 0.0) >= min_risk]
        
    return accounts[:limit]

@router.get("/{account_id}")
def get_account_detail(account_id: str) -> Dict[str, Any]:
    acc = mongo_client.get_account(account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
        
    txs = mongo_client.get_account_transactions(account_id, limit=100)
    risk_score, risk_level, patterns, evidence, _ = calculate_account_risk(acc, txs)
    
    graph_data = get_graph_for_account(account_id, hops=1)
    
    inc_vol = sum(t["amount"] for t in txs if t.get("receiver_account") == account_id)
    outg_vol = sum(t["amount"] for t in txs if t.get("sender_account") == account_id)
    
    return {
        "account": acc,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "detected_patterns": patterns,
        "evidence": evidence,
        "stats": {
            "transaction_count": len(txs),
            "incoming_volume": round(inc_vol, 2),
            "outgoing_volume": round(outg_vol, 2),
            "connected_nodes_count": len(graph_data.get("nodes", []))
        },
        "recent_transactions": txs[:20],
        "mini_graph": graph_data
    }

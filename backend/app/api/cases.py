from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.database.mongodb import mongo_client
from app.models.case import CaseCreate, CaseNote

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("")
def list_cases(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    analyst: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    cases = mongo_client.get_all_cases(limit=200)
    
    if status:
        cases = [c for c in cases if c.get("status") == status.upper()]
    if priority:
        cases = [c for c in cases if c.get("priority") == priority.upper()]
    if analyst:
        cases = [c for c in cases if analyst.lower() in c.get("assigned_analyst", "").lower()]

    return cases[:limit]

@router.get("/{case_id}")
def get_case_detail(case_id: str) -> Dict[str, Any]:
    c = mongo_client.get_case(case_id)
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")
        
    accounts = [mongo_client.get_account(acc_id) for acc_id in c.get("involved_accounts", []) if mongo_client.get_account(acc_id)]
    txs = [mongo_client.get_transaction(tx_id) for tx_id in c.get("involved_transactions", []) if mongo_client.get_transaction(tx_id)]
    
    return {
        "case": c,
        "accounts": accounts,
        "transactions": txs
    }

@router.put("/{case_id}")
def update_case_status(
    case_id: str,
    status: Optional[str] = None,
    assigned_analyst: Optional[str] = None,
    note_text: Optional[str] = None
) -> Dict[str, Any]:
    c = mongo_client.get_case(case_id)
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")

    now_str = datetime.utcnow().isoformat() + "Z"

    if status:
        c["status"] = status.upper()
    if assigned_analyst:
        c["assigned_analyst"] = assigned_analyst
    if note_text:
        notes = c.get("notes", [])
        notes.append({
            "author": assigned_analyst or "Investigator",
            "timestamp": now_str,
            "text": note_text
        })
        c["notes"] = notes

    c["updated_at"] = now_str
    mongo_client.insert_case(c)
    return c

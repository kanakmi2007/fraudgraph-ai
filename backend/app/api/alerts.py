import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.database.mongodb import mongo_client
from app.models.case import CaseCreate

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
def list_alerts(
    severity: Optional[str] = None,
    pattern: Optional[str] = None,
    status: Optional[str] = None,
    min_risk: Optional[float] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    alerts = mongo_client.get_all_alerts(limit=500)
    
    if severity:
        alerts = [a for a in alerts if a.get("severity") == severity.upper()]
    if pattern:
        alerts = [a for a in alerts if pattern.upper() in [p.upper() for p in a.get("detected_patterns", [])]]
    if status:
        alerts = [a for a in alerts if a.get("status") == status.upper()]
    if min_risk is not None:
        alerts = [a for a in alerts if a.get("risk_score", 0.0) >= min_risk]

    return alerts[:limit]

@router.get("/{alert_id}")
def get_alert_detail(alert_id: str) -> Dict[str, Any]:
    al = mongo_client.get_alert(alert_id)
    if not al:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    primary_acc = mongo_client.get_account(al["primary_account"])
    
    txs = []
    for tx_id in al.get("transaction_ids", [])[:20]:
        t = mongo_client.get_transaction(tx_id)
        if t:
            txs.append(t)
            
    return {
        "alert": al,
        "primary_account_detail": primary_acc,
        "transactions": txs
    }

@router.post("/{alert_id}/case")
def convert_alert_to_case(alert_id: str, payload: Optional[CaseCreate] = None) -> Dict[str, Any]:
    al = mongo_client.get_alert(alert_id)
    if not al:
        raise HTTPException(status_code=404, detail="Alert not found")

    case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.utcnow().isoformat() + "Z"

    initial_note = payload.initial_note if payload and payload.initial_note else "Case created from alert investigation."

    case_data = {
        "case_id": case_id,
        "alert_id": alert_id,
        "title": payload.title if payload and payload.title else f"Investigation: {al['title']}",
        "priority": payload.priority if payload and payload.priority else al.get("severity", "HIGH"),
        "status": "OPEN",
        "assigned_analyst": payload.assigned_analyst if payload and payload.assigned_analyst else "Senior Financial Analyst",
        "involved_accounts": al.get("involved_accounts", []),
        "involved_transactions": al.get("transaction_ids", []),
        "notes": [
            {
                "author": "System Investigator",
                "timestamp": now_str,
                "text": initial_note
            }
        ],
        "evidence": al.get("evidence", []),
        "created_at": now_str,
        "updated_at": now_str
    }

    mongo_client.insert_case(case_data)
    
    # Update alert status
    al["status"] = "UNDER_INVESTIGATION"
    mongo_client.insert_alert(al)

    return case_data

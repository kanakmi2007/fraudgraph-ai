from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.graph_service import get_graph_for_account, get_graph_for_alert

router = APIRouter(prefix="/graph", tags=["Graph Visualizations"])

@router.get("/account/{account_id}")
def fetch_account_graph(account_id: str, hops: int = 2) -> Dict[str, Any]:
    return get_graph_for_account(account_id, hops=hops)

@router.get("/alert/{alert_id}")
def fetch_alert_graph(alert_id: str) -> Dict[str, Any]:
    return get_graph_for_alert(alert_id)

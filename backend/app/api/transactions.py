from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.database.mongodb import mongo_client
from app.services.transaction_service import process_transaction
from app.models.transaction import TransactionCreate

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("")
def list_transactions(
    sender: Optional[str] = None,
    receiver: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    risk_level: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
) -> List[Dict[str, Any]]:
    txs = mongo_client.get_all_transactions(limit=2000)
    
    if sender:
        txs = [t for t in txs if sender.lower() in t.get("sender_account", "").lower()]
    if receiver:
        txs = [t for t in txs if receiver.lower() in t.get("receiver_account", "").lower()]
    if min_amount is not None:
        txs = [t for t in txs if t.get("amount", 0.0) >= min_amount]
    if max_amount is not None:
        txs = [t for t in txs if t.get("amount", 0.0) <= max_amount]
    if risk_level:
        txs = [t for t in txs if t.get("risk_level") == risk_level.upper()]

    return txs[skip : skip + limit]

@router.get("/{transaction_id}")
def get_transaction_detail(transaction_id: str) -> Dict[str, Any]:
    tx = mongo_client.get_transaction(transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.post("")
def create_transaction_endpoint(payload: TransactionCreate) -> Dict[str, Any]:
    tx_data = payload.dict()
    processed_tx, alert = process_transaction(tx_data)
    return {
        "transaction": processed_tx,
        "alert": alert
    }

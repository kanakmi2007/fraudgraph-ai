from pydantic import BaseModel, Field
from typing import List, Optional

class Transaction(BaseModel):
    transaction_id: str
    sender_account: str
    receiver_account: str
    amount: float
    currency: str = "INR"
    timestamp: str
    transaction_type: str = "TRANSFER"  # TRANSFER, WIRE, UPI, ATM, CASH_DEPOSIT
    channel: str = "MOBILE"  # MOBILE, WEB, ATM, BRANCH
    device_id: str
    ip_address: str
    location: str = "Mumbai, IN"
    status: str = "COMPLETED"  # COMPLETED, PENDING, REJECTED, FLAGGED
    risk_score: float = 0.0
    risk_level: str = "LOW"  # LOW, MEDIUM, HIGH, CRITICAL
    detected_patterns: List[str] = []

class TransactionCreate(BaseModel):
    sender_account: str
    receiver_account: str
    amount: float
    currency: str = "INR"
    transaction_type: str = "TRANSFER"
    channel: str = "MOBILE"
    device_id: Optional[str] = "DEV-DEFAULT"
    ip_address: Optional[str] = "192.168.1.1"
    location: Optional[str] = "Mumbai, IN"

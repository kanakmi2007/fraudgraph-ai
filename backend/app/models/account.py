from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Account(BaseModel):
    account_id: str
    customer_id: str
    name: str
    account_type: str = "SAVINGS"  # SAVINGS, CURRENT, BUSINESS, DIGITAL_WALLET
    bank: str
    country: str = "India"
    city: str = "Mumbai"
    created_at: str
    status: str = "ACTIVE"  # ACTIVE, SUSPENDED, FROZEN, DORMANT
    risk_score: float = 0.0
    risk_level: str = "LOW"  # LOW, MEDIUM, HIGH, CRITICAL
    device_id: str
    phone: str
    email: str

class AccountCreate(BaseModel):
    account_id: str
    customer_id: str
    name: str
    account_type: str = "SAVINGS"
    bank: str
    country: str = "India"
    city: str = "Mumbai"
    created_at: Optional[str] = None
    status: str = "ACTIVE"
    risk_score: float = 0.0
    risk_level: str = "LOW"
    device_id: str
    phone: str
    email: str

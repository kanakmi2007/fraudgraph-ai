from pydantic import BaseModel, Field
from typing import List, Optional

class Alert(BaseModel):
    alert_id: str
    title: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    risk_score: float
    primary_account: str
    involved_accounts: List[str]
    transaction_ids: List[str]
    detected_patterns: List[str]
    evidence: List[str]
    total_amount: float
    transaction_count: int
    time_window: str
    created_at: str
    status: str = "OPEN"  # OPEN, UNDER_INVESTIGATION, ESCALATED, RESOLVED, DISMISSED
    assigned_to: Optional[str] = None

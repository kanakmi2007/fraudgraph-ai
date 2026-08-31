from pydantic import BaseModel, Field
from typing import List, Optional

class CaseNote(BaseModel):
    author: str
    timestamp: str
    text: str

class Case(BaseModel):
    case_id: str
    alert_id: str
    title: str
    priority: str = "HIGH"  # LOW, MEDIUM, HIGH, CRITICAL
    status: str = "OPEN"  # OPEN, UNDER_INVESTIGATION, ESCALATED, RESOLVED
    assigned_analyst: str = "Analyst #1"
    involved_accounts: List[str]
    involved_transactions: List[str]
    notes: List[CaseNote] = []
    evidence: List[str] = []
    created_at: str
    updated_at: str

class CaseCreate(BaseModel):
    alert_id: str
    title: Optional[str] = None
    priority: str = "HIGH"
    assigned_analyst: str = "Senior Investigator"
    initial_note: Optional[str] = None

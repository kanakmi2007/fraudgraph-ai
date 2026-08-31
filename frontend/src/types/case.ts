export interface CaseNote {
  author: string;
  timestamp: string;
  text: string;
}

export interface Case {
  case_id: string;
  alert_id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'ESCALATED' | 'RESOLVED';
  assigned_analyst: string;
  involved_accounts: string[];
  involved_transactions: string[];
  notes: CaseNote[];
  evidence: string[];
  created_at: string;
  updated_at: string;
}

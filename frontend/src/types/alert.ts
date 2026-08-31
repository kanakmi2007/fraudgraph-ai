export interface Alert {
  alert_id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  primary_account: string;
  involved_accounts: string[];
  transaction_ids: string[];
  detected_patterns: string[];
  evidence: string[];
  total_amount: number;
  transaction_count: number;
  time_window: string;
  created_at: string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'ESCALATED' | 'RESOLVED' | 'DISMISSED';
  assigned_to?: string | null;
}

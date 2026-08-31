export interface Transaction {
  transaction_id: string;
  sender_account: string;
  receiver_account: string;
  amount: number;
  currency?: string;
  timestamp: string;
  transaction_type?: string;
  channel: string;
  device_id?: string;
  ip_address?: string;
  location?: string;
  status?: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detected_patterns: string[];
}

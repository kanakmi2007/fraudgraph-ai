export interface Account {
  account_id: string;
  customer_id: string;
  name: string;
  account_type: string;
  bank: string;
  country: string;
  city: string;
  created_at: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN' | 'DORMANT';
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  device_id: string;
  phone: string;
  email: string;
}

export interface AccountDetailResponse {
  account: Account;
  risk_score: number;
  risk_level: string;
  detected_patterns: string[];
  evidence: string[];
  stats: {
    transaction_count: number;
    incoming_volume: number;
    outgoing_volume: number;
    connected_nodes_count: number;
  };
  recent_transactions: any[];
  mini_graph: {
    nodes: any[];
    edges: any[];
  };
}

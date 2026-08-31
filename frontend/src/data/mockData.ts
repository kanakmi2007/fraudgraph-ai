import { Account, AccountDetailResponse } from '../types/account';
import { Alert } from '../types/alert';
import { Transaction } from '../types/transaction';
import { Case } from '../types/case';

export const MOCK_PEOPLE_ACCOUNTS: Account[] = [
  {
    account_id: 'Vikram Malhotra',
    customer_id: 'CUST-1001',
    name: 'Vikram Malhotra',
    account_type: 'BUSINESS',
    bank: 'HDFC Bank',
    country: 'India',
    city: 'Mumbai',
    created_at: '2024-01-15T08:00:00Z',
    status: 'ACTIVE',
    risk_score: 94,
    risk_level: 'CRITICAL',
    device_id: 'DEV-991',
    phone: '+91 98765 43210',
    email: 'vikram.malhotra@example.com'
  },
  {
    account_id: 'Rahul Sharma',
    customer_id: 'CUST-1002',
    name: 'Rahul Sharma',
    account_type: 'SAVINGS',
    bank: 'ICICI Bank',
    country: 'India',
    city: 'Delhi',
    created_at: '2024-02-10T09:30:00Z',
    status: 'ACTIVE',
    risk_score: 85,
    risk_level: 'HIGH',
    device_id: 'DEV-992',
    phone: '+91 98123 45678',
    email: 'rahul.sharma@example.com'
  },
  {
    account_id: 'Rohan Singh',
    customer_id: 'CUST-1003',
    name: 'Rohan Singh',
    account_type: 'CURRENT',
    bank: 'Kotak Bank',
    country: 'India',
    city: 'Bangalore',
    created_at: '2024-01-20T11:15:00Z',
    status: 'ACTIVE',
    risk_score: 80,
    risk_level: 'HIGH',
    device_id: 'DEV-993',
    phone: '+91 98234 56789',
    email: 'rohan.singh@example.com'
  },
  {
    account_id: 'Priya Mehta',
    customer_id: 'CUST-1004',
    name: 'Priya Mehta',
    account_type: 'SAVINGS',
    bank: 'Axis Bank',
    country: 'India',
    city: 'Mumbai',
    created_at: '2024-03-01T14:00:00Z',
    status: 'ACTIVE',
    risk_score: 65,
    risk_level: 'MEDIUM',
    device_id: 'DEV-994',
    phone: '+91 98345 67890',
    email: 'priya.mehta@example.com'
  },
  {
    account_id: 'Aman Verma',
    customer_id: 'CUST-1005',
    name: 'Aman Verma',
    account_type: 'SAVINGS',
    bank: 'SBI',
    country: 'India',
    city: 'Pune',
    created_at: '2024-03-05T10:00:00Z',
    status: 'ACTIVE',
    risk_score: 60,
    risk_level: 'MEDIUM',
    device_id: 'DEV-995',
    phone: '+91 98456 78901',
    email: 'aman.verma@example.com'
  },
  {
    account_id: 'Neha Kapoor',
    customer_id: 'CUST-1006',
    name: 'Neha Kapoor',
    account_type: 'SAVINGS',
    bank: 'HDFC Bank',
    country: 'India',
    city: 'Chandigarh',
    created_at: '2024-03-12T16:20:00Z',
    status: 'ACTIVE',
    risk_score: 55,
    risk_level: 'MEDIUM',
    device_id: 'DEV-996',
    phone: '+91 98567 89012',
    email: 'neha.kapoor@example.com'
  },
  {
    account_id: 'Sneha Patel',
    customer_id: 'CUST-1007',
    name: 'Sneha Patel',
    account_type: 'SAVINGS',
    bank: 'ICICI Bank',
    country: 'India',
    city: 'Ahmedabad',
    created_at: '2024-02-18T12:00:00Z',
    status: 'ACTIVE',
    risk_score: 25,
    risk_level: 'LOW',
    device_id: 'DEV-997',
    phone: '+91 98678 90123',
    email: 'sneha.patel@example.com'
  },
  {
    account_id: 'Ananya Gupta',
    customer_id: 'CUST-1008',
    name: 'Ananya Gupta',
    account_type: 'SAVINGS',
    bank: 'Axis Bank',
    country: 'India',
    city: 'Kolkata',
    created_at: '2024-02-25T15:30:00Z',
    status: 'ACTIVE',
    risk_score: 18,
    risk_level: 'LOW',
    device_id: 'DEV-998',
    phone: '+91 98789 01234',
    email: 'ananya.gupta@example.com'
  },
  {
    account_id: 'Arjun Nair',
    customer_id: 'CUST-1009',
    name: 'Arjun Nair',
    account_type: 'CURRENT',
    bank: 'Federal Bank',
    country: 'India',
    city: 'Kochi',
    created_at: '2024-01-30T10:45:00Z',
    status: 'ACTIVE',
    risk_score: 15,
    risk_level: 'LOW',
    device_id: 'DEV-999',
    phone: '+91 98890 12345',
    email: 'arjun.nair@example.com'
  },
  {
    account_id: 'Meera Joshi',
    customer_id: 'CUST-1010',
    name: 'Meera Joshi',
    account_type: 'SAVINGS',
    bank: 'Bank of Baroda',
    country: 'India',
    city: 'Indore',
    created_at: '2024-03-02T13:15:00Z',
    status: 'ACTIVE',
    risk_score: 12,
    risk_level: 'LOW',
    device_id: 'DEV-1000',
    phone: '+91 98901 23456',
    email: 'meera.joshi@example.com'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    transaction_id: 'TX-001',
    sender_account: 'Rahul Sharma',
    receiver_account: 'Priya Mehta',
    amount: 8900.0,
    timestamp: '2026-08-30T10:01:00Z',
    channel: 'UPI',
    risk_score: 45.0,
    risk_level: 'MEDIUM',
    detected_patterns: ['STRUCTURING']
  },
  {
    transaction_id: 'TX-002',
    sender_account: 'Rahul Sharma',
    receiver_account: 'Aman Verma',
    amount: 9100.0,
    timestamp: '2026-08-30T10:02:00Z',
    channel: 'UPI',
    risk_score: 45.0,
    risk_level: 'MEDIUM',
    detected_patterns: ['STRUCTURING']
  },
  {
    transaction_id: 'TX-003',
    sender_account: 'Rahul Sharma',
    receiver_account: 'Neha Kapoor',
    amount: 8700.0,
    timestamp: '2026-08-30T10:03:00Z',
    channel: 'UPI',
    risk_score: 45.0,
    risk_level: 'MEDIUM',
    detected_patterns: ['STRUCTURING']
  },
  {
    transaction_id: 'TX-004',
    sender_account: 'Priya Mehta',
    receiver_account: 'Vikram Malhotra',
    amount: 8500.0,
    timestamp: '2026-08-30T10:05:00Z',
    channel: 'MOBILE',
    risk_score: 78.0,
    risk_level: 'HIGH',
    detected_patterns: ['FAN_IN']
  },
  {
    transaction_id: 'TX-005',
    sender_account: 'Aman Verma',
    receiver_account: 'Vikram Malhotra',
    amount: 8900.0,
    timestamp: '2026-08-30T10:06:00Z',
    channel: 'MOBILE',
    risk_score: 75.0,
    risk_level: 'HIGH',
    detected_patterns: ['FAN_IN']
  },
  {
    transaction_id: 'TX-006',
    sender_account: 'Neha Kapoor',
    receiver_account: 'Vikram Malhotra',
    amount: 8400.0,
    timestamp: '2026-08-30T10:07:00Z',
    channel: 'MOBILE',
    risk_score: 73.0,
    risk_level: 'HIGH',
    detected_patterns: ['FAN_IN']
  },
  {
    transaction_id: 'TX-007',
    sender_account: 'Vikram Malhotra',
    receiver_account: 'Rohan Singh',
    amount: 25000.0,
    timestamp: '2026-08-30T10:09:00Z',
    channel: 'WIRE',
    risk_score: 94.0,
    risk_level: 'CRITICAL',
    detected_patterns: ['FAN_IN', 'RAPID_MOVEMENT', 'CIRCULAR_FLOW']
  },
  {
    transaction_id: 'TX-008',
    sender_account: 'Rohan Singh',
    receiver_account: 'Rahul Sharma',
    amount: 20000.0,
    timestamp: '2026-08-30T10:12:00Z',
    channel: 'WIRE',
    risk_score: 85.0,
    risk_level: 'HIGH',
    detected_patterns: ['CIRCULAR_FLOW']
  },
  {
    transaction_id: 'TX-009',
    sender_account: 'Sneha Patel',
    receiver_account: 'Ananya Gupta',
    amount: 3500.0,
    timestamp: '2026-08-30T09:15:00Z',
    channel: 'UPI',
    risk_score: 12.0,
    risk_level: 'LOW',
    detected_patterns: []
  },
  {
    transaction_id: 'TX-010',
    sender_account: 'Arjun Nair',
    receiver_account: 'Meera Joshi',
    amount: 5000.0,
    timestamp: '2026-08-30T08:45:00Z',
    channel: 'NETBANKING',
    risk_score: 10.0,
    risk_level: 'LOW',
    detected_patterns: []
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    alert_id: 'ALT-DEMO-001',
    primary_account: 'Vikram Malhotra',
    involved_accounts: ['Rahul Sharma', 'Priya Mehta', 'Aman Verma', 'Neha Kapoor', 'Vikram Malhotra', 'Rohan Singh'],
    transaction_ids: ['TX-001', 'TX-004', 'TX-007'],
    title: 'Suspicious money network detected around Vikram Malhotra',
    risk_score: 94,
    severity: 'CRITICAL',
    detected_patterns: ['FAN_IN', 'RAPID_MOVEMENT', 'CIRCULAR_FLOW'],
    evidence: [
      'Several people sent money to the same account within a short time window.',
      'Money moved through multiple connected accounts within minutes.',
      'Money eventually returned to the account where it started.'
    ],
    transaction_count: 8,
    time_window: '11 minutes',
    total_amount: 87400.0,
    created_at: '2026-08-30T10:15:00Z',
    status: 'OPEN'
  },
  {
    alert_id: 'ALT-DEMO-002',
    primary_account: 'Rahul Sharma',
    involved_accounts: ['Rahul Sharma', 'Priya Mehta', 'Aman Verma', 'Neha Kapoor'],
    transaction_ids: ['TX-001', 'TX-002', 'TX-003'],
    title: 'Structuring transfers sent to multiple accounts',
    risk_score: 75,
    severity: 'HIGH',
    detected_patterns: ['FAN_OUT', 'STRUCTURING'],
    evidence: [
      'One person sent money to several accounts within a short time.',
      'Multiple transactions sent with amounts just below reporting limits.'
    ],
    transaction_count: 3,
    time_window: '5 minutes',
    total_amount: 26700.0,
    created_at: '2026-08-30T10:04:00Z',
    status: 'OPEN'
  },
  {
    alert_id: 'ALT-DEMO-003',
    primary_account: 'Rohan Singh',
    involved_accounts: ['Vikram Malhotra', 'Rohan Singh', 'Rahul Sharma'],
    transaction_ids: ['TX-007', 'TX-008'],
    title: 'Rapid movement of high volume funds',
    risk_score: 65,
    severity: 'MEDIUM',
    detected_patterns: ['RAPID_MOVEMENT'],
    evidence: [
      'Money passed through this account immediately after receipt.'
    ],
    transaction_count: 2,
    time_window: '3 minutes',
    total_amount: 25000.0,
    created_at: '2026-08-30T10:10:00Z',
    status: 'OPEN'
  }
];

export const MOCK_CASES: Case[] = [
  {
    case_id: 'CASE-FG-001',
    alert_id: 'ALT-DEMO-001',
    title: 'Suspicious money network involving Vikram Malhotra',
    assigned_analyst: 'Analyst #1042',
    status: 'UNDER_INVESTIGATION',
    priority: 'CRITICAL',
    created_at: '2026-08-30T10:20:00Z',
    updated_at: '2026-08-30T10:30:00Z',
    involved_accounts: ['Rahul Sharma', 'Priya Mehta', 'Aman Verma', 'Neha Kapoor', 'Vikram Malhotra', 'Rohan Singh'],
    involved_transactions: ['TX-001', 'TX-004', 'TX-007'],
    evidence: [
      'Several people sent money to Vikram Malhotra around the same time.',
      'Funds moved out to Rohan Singh within minutes.',
      'Circular money flow returned to Rahul Sharma.'
    ],
    notes: [
      {
        author: 'Analyst #1042',
        timestamp: '2026-08-30T10:25:00Z',
        text: 'Initial review confirmed coordinated fan-in pattern into Vikram Malhotra. Freeze request placed for high-risk transfer channels.'
      }
    ]
  },
  {
    case_id: 'CASE-FG-002',
    alert_id: 'ALT-DEMO-002',
    title: 'Structuring transfers by Rahul Sharma',
    assigned_analyst: 'Analyst #1042',
    status: 'OPEN',
    priority: 'HIGH',
    created_at: '2026-08-30T10:08:00Z',
    updated_at: '2026-08-30T10:08:00Z',
    involved_accounts: ['Rahul Sharma', 'Priya Mehta', 'Aman Verma', 'Neha Kapoor'],
    involved_transactions: ['TX-001', 'TX-002', 'TX-003'],
    evidence: [
      'Three consecutive transfers sent just under ₹10,000 threshold limits.'
    ],
    notes: [
      {
        author: 'Analyst #1042',
        timestamp: '2026-08-30T10:10:00Z',
        text: 'Reviewing historical baselines for Rahul Sharma.'
      }
    ]
  }
];

export const MOCK_DASHBOARD_STATS = {
  kpis: {
    total_transactions: 500,
    total_volume: 485000.0,
    active_alerts: 8,
    critical_alerts: 3,
    suspicious_networks: 4,
    high_risk_accounts: 6
  },
  risk_distribution: [
    { level: 'LOW', value: 420 },
    { level: 'MEDIUM', value: 48 },
    { level: 'HIGH', value: 26 },
    { level: 'CRITICAL', value: 6 }
  ],
  alerts_by_pattern: [
    { pattern: 'Fan-In (Many → One)', count: 12 },
    { pattern: 'Fan-Out (One → Many)', count: 9 },
    { pattern: 'Circular Money Flow', count: 7 },
    { pattern: 'Rapid Velocity', count: 14 },
    { pattern: 'Structuring', count: 8 }
  ],
  recent_feed: MOCK_TRANSACTIONS
};

export const MOCK_GRAPH_DATA = {
  nodes: [
    { id: 'Rahul Sharma', name: 'Rahul Sharma', risk_score: 85, risk_level: 'HIGH', bank: 'HDFC Bank', is_primary: false },
    { id: 'Priya Mehta', name: 'Priya Mehta', risk_score: 65, risk_level: 'MEDIUM', bank: 'ICICI Bank', is_primary: false },
    { id: 'Aman Verma', name: 'Aman Verma', risk_score: 60, risk_level: 'MEDIUM', bank: 'Axis Bank', is_primary: false },
    { id: 'Neha Kapoor', name: 'Neha Kapoor', risk_score: 55, risk_level: 'MEDIUM', bank: 'SBI', is_primary: false },
    { id: 'Vikram Malhotra', name: 'Vikram Malhotra', risk_score: 94, risk_level: 'CRITICAL', bank: 'HDFC Bank', is_primary: true },
    { id: 'Rohan Singh', name: 'Rohan Singh', risk_score: 80, risk_level: 'HIGH', bank: 'Kotak Bank', is_primary: false }
  ],
  edges: [
    { id: 'E1', source: 'Rahul Sharma', target: 'Priya Mehta', amount: 8900 },
    { id: 'E2', source: 'Rahul Sharma', target: 'Aman Verma', amount: 9100 },
    { id: 'E3', source: 'Rahul Sharma', target: 'Neha Kapoor', amount: 8700 },
    { id: 'E4', source: 'Priya Mehta', target: 'Vikram Malhotra', amount: 8500 },
    { id: 'E5', source: 'Aman Verma', target: 'Vikram Malhotra', amount: 8900 },
    { id: 'E6', source: 'Neha Kapoor', target: 'Vikram Malhotra', amount: 8400 },
    { id: 'E7', source: 'Vikram Malhotra', target: 'Rohan Singh', amount: 25000 },
    { id: 'E8', source: 'Rohan Singh', target: 'Rahul Sharma', amount: 20000 }
  ]
};

export const getMockAccountDetail = (accountId: string): AccountDetailResponse => {
  const acc = MOCK_PEOPLE_ACCOUNTS.find(a => a.account_id === accountId) || {
    account_id: accountId,
    customer_id: `CUST-${accountId.replace(/\s+/g, '')}`,
    name: accountId,
    account_type: 'SAVINGS',
    bank: 'HDFC Bank',
    country: 'India',
    city: 'Mumbai',
    created_at: new Date().toISOString(),
    status: 'ACTIVE',
    risk_score: 75,
    risk_level: 'HIGH',
    device_id: 'DEV-101',
    phone: '+91 98765 00000',
    email: `${accountId.toLowerCase().replace(/\s+/g, '.')}@example.com`
  };

  const txs = MOCK_TRANSACTIONS.filter(t => t.sender_account === accountId || t.receiver_account === accountId);
  const incoming = txs.filter(t => t.receiver_account === accountId).reduce((sum, t) => sum + t.amount, 0);
  const outgoing = txs.filter(t => t.sender_account === accountId).reduce((sum, t) => sum + t.amount, 0);

  return {
    account: acc,
    risk_score: acc.risk_score,
    risk_level: acc.risk_level,
    detected_patterns: acc.risk_score >= 80 ? ['FAN_IN', 'CIRCULAR_FLOW'] : ['STRUCTURING'],
    evidence: [
      'Several people sent money to this account in a short period.',
      'Quickly moved most of the received funds out to connected people.'
    ],
    stats: {
      incoming_volume: incoming || 25800,
      outgoing_volume: outgoing || 25000,
      transaction_count: txs.length || 6,
      connected_nodes_count: 6
    },
    recent_transactions: txs.length > 0 ? txs : MOCK_TRANSACTIONS.slice(0, 4),
    mini_graph: MOCK_GRAPH_DATA
  };
};

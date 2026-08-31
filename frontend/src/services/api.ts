import axios from 'axios';
import { Account, AccountDetailResponse } from '../types/account';
import { Transaction } from '../types/transaction';
import { Alert } from '../types/alert';
import { Case } from '../types/case';
import { 
  MOCK_DASHBOARD_STATS, 
  MOCK_ALERTS, 
  MOCK_TRANSACTIONS, 
  MOCK_PEOPLE_ACCOUNTS, 
  MOCK_CASES, 
  MOCK_GRAPH_DATA, 
  getMockAccountDetail 
} from '../data/mockData';

export const API_BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000
});

export const dashboardService = {
  getStats: async () => {
    try {
      const res = await api.get('/dashboard/stats');
      return res.data;
    } catch {
      return MOCK_DASHBOARD_STATS;
    }
  },
};

export const transactionService = {
  list: async (params?: { sender?: string; receiver?: string; risk_level?: string; min_amount?: number; max_amount?: number }) => {
    try {
      const res = await api.get<Transaction[]>('/transactions', { params });
      if (res.data && res.data.length > 0) return res.data;
      return MOCK_TRANSACTIONS;
    } catch {
      return MOCK_TRANSACTIONS;
    }
  },
  getDetail: async (txId: string) => {
    try {
      const res = await api.get<Transaction>(`/transactions/${txId}`);
      return res.data;
    } catch {
      return MOCK_TRANSACTIONS.find(t => t.transaction_id === txId) || MOCK_TRANSACTIONS[0];
    }
  },
};

export const alertService = {
  list: async (params?: { severity?: string; pattern?: string; status?: string; min_risk?: number; limit?: number }) => {
    try {
      const res = await api.get<Alert[]>('/alerts', { params });
      if (res.data && res.data.length > 0) return res.data;
      return MOCK_ALERTS;
    } catch {
      return MOCK_ALERTS;
    }
  },
  getDetail: async (alertId: string) => {
    try {
      const res = await api.get<{ alert: Alert; transactions: Transaction[] }>(`/alerts/${alertId}`);
      return res.data;
    } catch {
      const alert = MOCK_ALERTS.find(a => a.alert_id === alertId) || MOCK_ALERTS[0];
      return {
        alert,
        transactions: MOCK_TRANSACTIONS
      };
    }
  },
  convertToCase: async (alertId: string) => {
    try {
      const res = await api.post<Case>(`/alerts/${alertId}/create-case`);
      return res.data;
    } catch {
      const alert = MOCK_ALERTS.find(a => a.alert_id === alertId) || MOCK_ALERTS[0];
      const newCase: Case = {
        case_id: `CASE-FG-${Math.floor(100 + Math.random() * 900)}`,
        alert_id: alert.alert_id,
        title: alert.title,
        assigned_analyst: 'Analyst #1042',
        status: 'UNDER_INVESTIGATION',
        priority: alert.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        involved_accounts: alert.involved_accounts,
        involved_transactions: alert.transaction_ids || ['TX-001', 'TX-004', 'TX-007'],
        evidence: alert.evidence,
        notes: [
          {
            author: 'Analyst #1042',
            timestamp: new Date().toISOString(),
            text: 'Case created directly from alert investigation.'
          }
        ]
      };
      MOCK_CASES.unshift(newCase);
      return newCase;
    }
  }
};

export const accountService = {
  list: async (params?: { risk_level?: string; search?: string }) => {
    try {
      const res = await api.get<Account[]>('/accounts', { params });
      if (res.data && res.data.length > 0) return res.data;
      return MOCK_PEOPLE_ACCOUNTS;
    } catch {
      return MOCK_PEOPLE_ACCOUNTS;
    }
  },
  getDetail: async (accountId: string) => {
    try {
      const res = await api.get<AccountDetailResponse>(`/accounts/${accountId}`);
      return res.data;
    } catch {
      return getMockAccountDetail(accountId);
    }
  },
};

export const graphService = {
  getAccountGraph: async (accountId: string, hops: number = 2) => {
    try {
      const res = await api.get<{ nodes: any[]; edges: any[] }>(`/graph/account/${accountId}`, { params: { hops } });
      return res.data;
    } catch {
      return MOCK_GRAPH_DATA;
    }
  },
  getAlertGraph: async (alertId: string) => {
    try {
      const res = await api.get<{ nodes: any[]; edges: any[] }>(`/graph/alert/${alertId}`);
      return res.data;
    } catch {
      return MOCK_GRAPH_DATA;
    }
  },
};

export const caseService = {
  list: async (params?: { status?: string }) => {
    try {
      const res = await api.get<Case[]>('/cases', { params });
      if (res.data && res.data.length > 0) return res.data;
      return MOCK_CASES;
    } catch {
      return MOCK_CASES;
    }
  },
  update: async (caseId: string, updateData: { status?: string; note_text?: string }) => {
    try {
      const res = await api.patch<Case>(`/cases/${caseId}`, updateData);
      return res.data;
    } catch {
      const c = MOCK_CASES.find(x => x.case_id === caseId);
      if (c) {
        if (updateData.status) c.status = updateData.status as any;
        if (updateData.note_text) {
          c.notes.push({
            author: 'Analyst #1042',
            timestamp: new Date().toISOString(),
            text: updateData.note_text
          });
        }
      }
      return c || MOCK_CASES[0];
    }
  },
};

export const simulationService = {
  start: async (speed: number = 1.0) => {
    try {
      const res = await api.post('/simulation/start', null, { params: { speed } });
      return res.data;
    } catch {
      return { status: 'RUNNING', speed };
    }
  },
  stop: async () => {
    try {
      const res = await api.post('/simulation/stop');
      return res.data;
    } catch {
      return { status: 'PAUSED' };
    }
  },
  reset: async () => {
    try {
      const res = await api.post('/simulation/reset');
      return res.data;
    } catch {
      return { status: 'RESET', processed_count: 0, alert_count: 0 };
    }
  },
  injectDemo: async () => {
    try {
      const res = await api.post('/simulation/inject-demo');
      return res.data;
    } catch {
      return {
        status: 'SUCCESS',
        message: 'Demo Fraud Network injected!',
        injected_transactions_count: 8,
        alerts_generated: 1,
        primary_alert: MOCK_ALERTS[0]
      };
    }
  },
};

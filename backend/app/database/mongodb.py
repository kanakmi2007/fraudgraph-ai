import logging
from typing import Dict, List, Any, Optional
from pymongo import MongoClient
from app.utils.config import settings

logger = logging.getLogger("fraudgraph.mongodb")

class MongoDBClient:
    def __init__(self):
        self.is_connected = False
        self.client = None
        self.db = None
        
        # In-memory storage fallback if MongoDB daemon is unavailable
        self.in_memory_accounts: Dict[str, Dict[str, Any]] = {}
        self.in_memory_transactions: Dict[str, Dict[str, Any]] = {}
        self.in_memory_alerts: Dict[str, Dict[str, Any]] = {}
        self.in_memory_cases: Dict[str, Dict[str, Any]] = {}

    def connect(self):
        try:
            self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client[settings.MONGODB_DB_NAME]
            self.is_connected = True
            logger.info(f"Connected to MongoDB at {settings.MONGODB_URI}")
            print(f"[DATABASE NOTICE] Connected to live MongoDB at {settings.MONGODB_URI}")
        except Exception as e:
            self.is_connected = False
            logger.warning(f"MongoDB not available ({e}). Using in-memory document database store.")
            print(f"[DATABASE NOTICE] MongoDB unavailable ({e}). Operating in high-speed In-Memory Document Store mode.")

    def close(self):
        if self.client and self.is_connected:
            self.client.close()

    # --- Accounts ---
    def insert_account(self, account_data: Dict[str, Any]):
        acc_id = account_data["account_id"]
        self.in_memory_accounts[acc_id] = account_data
        if self.is_connected:
            try:
                self.db.accounts.update_one({"account_id": acc_id}, {"$set": account_data}, upsert=True)
            except Exception as e:
                logger.error(f"MongoDB insert_account error: {e}")

    def get_account(self, account_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected:
            try:
                acc = self.db.accounts.find_one({"account_id": account_id}, {"_id": 0})
                if acc:
                    return acc
            except Exception:
                pass
        return self.in_memory_accounts.get(account_id)

    def get_all_accounts(self, limit: int = 1000) -> List[Dict[str, Any]]:
        if self.is_connected:
            try:
                accounts = list(self.db.accounts.find({}, {"_id": 0}).limit(limit))
                if accounts:
                    return accounts
            except Exception:
                pass
        return list(self.in_memory_accounts.values())[:limit]

    def update_account(self, account_id: str, update_data: Dict[str, Any]):
        if account_id in self.in_memory_accounts:
            self.in_memory_accounts[account_id].update(update_data)
        if self.is_connected:
            try:
                self.db.accounts.update_one({"account_id": account_id}, {"$set": update_data})
            except Exception as e:
                logger.error(f"MongoDB update_account error: {e}")

    # --- Transactions ---
    def insert_transaction(self, transaction_data: Dict[str, Any]):
        tx_id = transaction_data["transaction_id"]
        self.in_memory_transactions[tx_id] = transaction_data
        if self.is_connected:
            try:
                self.db.transactions.update_one({"transaction_id": tx_id}, {"$set": transaction_data}, upsert=True)
            except Exception as e:
                logger.error(f"MongoDB insert_transaction error: {e}")

    def get_transaction(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected:
            try:
                tx = self.db.transactions.find_one({"transaction_id": transaction_id}, {"_id": 0})
                if tx:
                    return tx
            except Exception:
                pass
        return self.in_memory_transactions.get(transaction_id)

    def get_all_transactions(self, limit: int = 5000, skip: int = 0) -> List[Dict[str, Any]]:
        if self.is_connected:
            try:
                txs = list(self.db.transactions.find({}, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit))
                if txs:
                    return txs
            except Exception:
                pass
        all_txs = sorted(self.in_memory_transactions.values(), key=lambda x: x.get("timestamp", ""), reverse=True)
        return all_txs[skip : skip + limit]

    def get_account_transactions(self, account_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        if self.is_connected:
            try:
                query = {"$or": [{"sender_account": account_id}, {"receiver_account": account_id}]}
                txs = list(self.db.transactions.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit))
                if txs:
                    return txs
            except Exception:
                pass
        result = [
            tx for tx in self.in_memory_transactions.values()
            if tx.get("sender_account") == account_id or tx.get("receiver_account") == account_id
        ]
        return sorted(result, key=lambda x: x.get("timestamp", ""), reverse=True)[:limit]

    # --- Alerts ---
    def insert_alert(self, alert_data: Dict[str, Any]):
        alert_id = alert_data["alert_id"]
        self.in_memory_alerts[alert_id] = alert_data
        if self.is_connected:
            try:
                self.db.alerts.update_one({"alert_id": alert_id}, {"$set": alert_data}, upsert=True)
            except Exception as e:
                logger.error(f"MongoDB insert_alert error: {e}")

    def get_alert(self, alert_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected:
            try:
                al = self.db.alerts.find_one({"alert_id": alert_id}, {"_id": 0})
                if al:
                    return al
            except Exception:
                pass
        return self.in_memory_alerts.get(alert_id)

    def get_all_alerts(self, limit: int = 1000) -> List[Dict[str, Any]]:
        if self.is_connected:
            try:
                alerts = list(self.db.alerts.find({}, {"_id": 0}).sort("created_at", -1).limit(limit))
                if alerts:
                    return alerts
            except Exception:
                pass
        return sorted(self.in_memory_alerts.values(), key=lambda x: x.get("created_at", ""), reverse=True)[:limit]

    def update_alert(self, alert_id: str, update_data: Dict[str, Any]):
        if alert_id in self.in_memory_alerts:
            self.in_memory_alerts[alert_id].update(update_data)
        if self.is_connected:
            try:
                self.db.alerts.update_one({"alert_id": alert_id}, {"$set": update_data})
            except Exception as e:
                logger.error(f"MongoDB update_alert error: {e}")

    # --- Cases ---
    def insert_case(self, case_data: Dict[str, Any]):
        case_id = case_data["case_id"]
        self.in_memory_cases[case_id] = case_data
        if self.is_connected:
            try:
                self.db.cases.update_one({"case_id": case_id}, {"$set": case_data}, upsert=True)
            except Exception as e:
                logger.error(f"MongoDB insert_case error: {e}")

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected:
            try:
                c = self.db.cases.find_one({"case_id": case_id}, {"_id": 0})
                if c:
                    return c
            except Exception:
                pass
        return self.in_memory_cases.get(case_id)

    def get_all_cases(self, limit: int = 500) -> List[Dict[str, Any]]:
        if self.is_connected:
            try:
                cases = list(self.db.cases.find({}, {"_id": 0}).sort("updated_at", -1).limit(limit))
                if cases:
                    return cases
            except Exception:
                pass
        return sorted(self.in_memory_cases.values(), key=lambda x: x.get("updated_at", ""), reverse=True)[:limit]

    def update_case(self, case_id: str, update_data: Dict[str, Any]):
        if case_id in self.in_memory_cases:
            self.in_memory_cases[case_id].update(update_data)
        if self.is_connected:
            try:
                self.db.cases.update_one({"case_id": case_id}, {"$set": update_data})
            except Exception as e:
                logger.error(f"MongoDB update_case error: {e}")

    def clear_all(self):
        self.in_memory_accounts.clear()
        self.in_memory_transactions.clear()
        self.in_memory_alerts.clear()
        self.in_memory_cases.clear()
        if self.is_connected:
            try:
                self.db.accounts.delete_many({})
                self.db.transactions.delete_many({})
                self.db.alerts.delete_many({})
                self.db.cases.delete_many({})
            except Exception as e:
                logger.error(f"MongoDB clear_all error: {e}")

mongo_client = MongoDBClient()

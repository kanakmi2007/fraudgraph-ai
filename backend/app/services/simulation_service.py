import asyncio
import random
import logging
from datetime import datetime
from typing import Dict, List, Any, Callable, Optional
from app.database.mongodb import mongo_client
from app.services.transaction_service import process_transaction

logger = logging.getLogger("fraudgraph.simulation")

class LiveSimulationManager:
    def __init__(self):
        self.is_running = False
        self.speed = 1.0  # seconds per transaction
        self.processed_count = 0
        self.alert_count = 0
        self.listeners: List[Callable[[Dict[str, Any]], None]] = []

    def start(self, speed: float = 1.0):
        self.is_running = True
        self.speed = speed

    def stop(self):
        self.is_running = False

    def reset(self):
        self.is_running = False
        self.processed_count = 0
        self.alert_count = 0

    def register_listener(self, listener: Callable[[Dict[str, Any]], None]):
        self.listeners.append(listener)

    def unregister_listener(self, listener: Callable[[Dict[str, Any]], None]):
        if listener in self.listeners:
            self.listeners.remove(listener)

    async def in_memory_broadcast(self, event: Dict[str, Any]):
        for listener in self.listeners:
            try:
                if asyncio.iscoroutinefunction(listener):
                    await listener(event)
                else:
                    listener(event)
            except Exception as e:
                logger.error(f"Error broadcasting simulation event: {e}")

    def generate_random_simulated_transaction(self) -> Dict[str, Any]:
        accounts = mongo_client.get_all_accounts(limit=100)
        if len(accounts) < 2:
            sender_id = "Rahul Sharma"
            receiver_id = "Vikram Malhotra"
        else:
            sender, receiver = random.sample(accounts, 2)
            sender_id = sender["account_id"]
            receiver_id = receiver["account_id"]

        is_suspicious = random.random() < 0.15
        if is_suspicious:
            amount = random.choice([8900.0, 9100.0, 8700.0, 9000.0, 450000.0])
        else:
            amount = round(random.uniform(200.0, 15000.0), 2)

        return {
            "sender_account": sender_id,
            "receiver_account": receiver_id,
            "amount": amount,
            "currency": "INR",
            "transaction_type": random.choice(["TRANSFER", "UPI", "WIRE"]),
            "channel": random.choice(["MOBILE", "WEB"]),
            "device_id": f"DEV-{random.randint(100, 999)}",
            "ip_address": f"192.168.{random.randint(1, 254)}.{random.randint(1, 254)}",
            "location": random.choice(["Mumbai, IN", "Delhi, IN", "Bangalore, IN", "Hyderabad, IN"])
        }

    async def step_simulation(self) -> Dict[str, Any]:
        tx_input = self.generate_random_simulated_transaction()
        tx, alert = process_transaction(tx_input)
        self.processed_count += 1
        if alert:
            self.alert_count += 1

        event = {
            "type": "LIVE_TRANSACTION",
            "transaction": tx,
            "alert": alert,
            "processed_count": self.processed_count,
            "alert_count": self.alert_count,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        await self.in_memory_broadcast(event)
        return event

simulation_manager = LiveSimulationManager()

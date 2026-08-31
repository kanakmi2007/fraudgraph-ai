from datetime import datetime, timedelta
from fastapi import APIRouter
from typing import Dict, Any
from app.services.simulation_service import simulation_manager
from app.services.transaction_service import process_transaction
from app.database.mongodb import mongo_client
from app.database.neo4j import neo4j_client

router = APIRouter(prefix="/simulation", tags=["Live Simulation"])

@router.post("/start")
def start_simulation(speed: float = 1.0) -> Dict[str, Any]:
    simulation_manager.start(speed)
    return {"status": "RUNNING", "speed": speed}

@router.post("/stop")
def stop_simulation() -> Dict[str, Any]:
    simulation_manager.stop()
    return {"status": "PAUSED"}

@router.post("/reset")
def reset_simulation() -> Dict[str, Any]:
    simulation_manager.reset()
    return {"status": "RESET", "processed_count": 0, "alert_count": 0}

@router.post("/inject-demo")
def inject_demo_network() -> Dict[str, Any]:
    """
    Injects the coherent Demo Fraud Network using human-readable fictional names:
    Rahul Sharma -> (Priya Mehta, Aman Verma, Neha Kapoor) -> Vikram Malhotra -> Rohan Singh -> Rahul Sharma
    """
    now = datetime.utcnow()

    demo_tx_sequence = [
        {"transaction_id": "TX-001", "sender_account": "Rahul Sharma", "receiver_account": "Priya Mehta", "amount": 8900.0, "timestamp": (now - timedelta(minutes=20)).isoformat() + "Z", "channel": "UPI"},
        {"transaction_id": "TX-002", "sender_account": "Rahul Sharma", "receiver_account": "Aman Verma", "amount": 9100.0, "timestamp": (now - timedelta(minutes=18)).isoformat() + "Z", "channel": "UPI"},
        {"transaction_id": "TX-003", "sender_account": "Rahul Sharma", "receiver_account": "Neha Kapoor", "amount": 8700.0, "timestamp": (now - timedelta(minutes=16)).isoformat() + "Z", "channel": "UPI"},
        {"transaction_id": "TX-004", "sender_account": "Priya Mehta", "receiver_account": "Vikram Malhotra", "amount": 8500.0, "timestamp": (now - timedelta(minutes=12)).isoformat() + "Z", "channel": "MOBILE"},
        {"transaction_id": "TX-005", "sender_account": "Aman Verma", "receiver_account": "Vikram Malhotra", "amount": 8900.0, "timestamp": (now - timedelta(minutes=10)).isoformat() + "Z", "channel": "MOBILE"},
        {"transaction_id": "TX-006", "sender_account": "Neha Kapoor", "receiver_account": "Vikram Malhotra", "amount": 8400.0, "timestamp": (now - timedelta(minutes=8)).isoformat() + "Z", "channel": "MOBILE"},
        {"transaction_id": "TX-007", "sender_account": "Vikram Malhotra", "receiver_account": "Rohan Singh", "amount": 25000.0, "timestamp": (now - timedelta(minutes=5)).isoformat() + "Z", "channel": "WIRE"},
        {"transaction_id": "TX-008", "sender_account": "Rohan Singh", "receiver_account": "Rahul Sharma", "amount": 20000.0, "timestamp": (now - timedelta(minutes=2)).isoformat() + "Z", "channel": "WIRE"}
    ]

    injected_txs = []
    generated_alerts = []

    for tx in demo_tx_sequence:
        processed, alert = process_transaction(tx)
        injected_txs.append(processed)
        if alert:
            generated_alerts.append(alert)

    primary_alert = generated_alerts[-1] if generated_alerts else None

    return {
        "status": "SUCCESS",
        "message": "Demo Fraud Network (Rahul -> Priya/Aman/Neha -> Vikram -> Rohan -> Rahul) injected successfully!",
        "injected_transactions_count": len(injected_txs),
        "alerts_generated": len(generated_alerts),
        "primary_alert": primary_alert
    }

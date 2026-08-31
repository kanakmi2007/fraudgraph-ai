import random
import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.mongodb import mongo_client
from app.database.neo4j import neo4j_client
from app.services.transaction_service import process_transaction

FICTIONAL_PEOPLE = [
    {"name": "Rahul Sharma", "bank": "HDFC Bank", "city": "Mumbai", "type": "BUSINESS"},
    {"name": "Priya Mehta", "bank": "ICICI Bank", "city": "Delhi", "type": "SAVINGS"},
    {"name": "Aman Verma", "bank": "Axis Bank", "city": "Bangalore", "type": "SAVINGS"},
    {"name": "Neha Kapoor", "bank": "State Bank of India", "city": "Pune", "type": "SAVINGS"},
    {"name": "Rohan Singh", "bank": "Kotak Bank", "city": "Kolkata", "type": "CURRENT"},
    {"name": "Sneha Patel", "bank": "Bank of Baroda", "city": "Ahmedabad", "type": "SAVINGS"},
    {"name": "Vikram Malhotra", "bank": "HSBC", "city": "Mumbai", "type": "BUSINESS"},
    {"name": "Ananya Gupta", "bank": "HDFC Bank", "city": "Delhi", "type": "SAVINGS"},
    {"name": "Arjun Nair", "bank": "ICICI Bank", "city": "Chennai", "type": "SAVINGS"},
    {"name": "Karan Shah", "bank": "Axis Bank", "city": "Mumbai", "type": "CURRENT"},
    {"name": "Meera Joshi", "bank": "SBI", "city": "Hyderabad", "type": "SAVINGS"},
    {"name": "Riya Khanna", "bank": "Kotak Bank", "city": "Pune", "type": "SAVINGS"}
]

def generate_synthetic_dataset():
    print("==================================================")
    print("Generating FraudGraph AI Human-Readable Demo Dataset...")
    print("==================================================")

    mongo_client.connect()
    neo4j_client.connect()
    mongo_client.clear_all()
    neo4j_client.clear()

    now = datetime.utcnow()

    # 1. Create Accounts using Fictional People Names as Account IDs
    accounts = []
    for i, p in enumerate(FICTIONAL_PEOPLE):
        acc_id = p["name"]
        cust_id = f"CUST-00{i+1}"
        acc_data = {
            "account_id": acc_id,
            "customer_id": cust_id,
            "name": p["name"],
            "account_type": p["type"],
            "bank": p["bank"],
            "country": "India",
            "city": p["city"],
            "created_at": (now - timedelta(days=random.randint(100, 500))).isoformat() + "Z",
            "status": "ACTIVE",
            "risk_score": 0.0,
            "risk_level": "LOW",
            "device_id": f"DEV-{i+101}",
            "phone": f"+9198765{i+1000:04d}",
            "email": f"{p['name'].lower().replace(' ', '.')}@demo-fin.com"
        }
        accounts.append(acc_data)
        mongo_client.insert_account(acc_data)
        neo4j_client.add_account_node(acc_id, {"name": p["name"], "bank": p["bank"]})

    print(f"[OK] Created {len(accounts)} Fictional People Accounts")

    # 2. Ingest Baseline Normal Transactions
    print("Ingesting baseline normal transfers...")
    for i in range(25):
        s_acc, r_acc = random.sample(accounts, 2)
        tx_data = {
            "transaction_id": f"TX-NORM-{i+1:03d}",
            "sender_account": s_acc["account_id"],
            "receiver_account": r_acc["account_id"],
            "amount": round(random.uniform(500.0, 5000.0), 2),
            "currency": "INR",
            "timestamp": (now - timedelta(days=random.randint(1, 10), minutes=random.randint(5, 120))).isoformat() + "Z",
            "transaction_type": "UPI",
            "channel": "MOBILE",
            "device_id": s_acc["device_id"],
            "ip_address": f"192.168.1.{random.randint(10, 99)}",
            "location": s_acc["city"] + ", IN"
        }
        mongo_client.insert_transaction(tx_data)
        neo4j_client.add_transaction_edge(s_acc["account_id"], r_acc["account_id"], tx_data)

    # 3. Inject Coherent Demo Fraud Network
    # Flow:
    # Rahul Sharma -> Priya Mehta (₹8,900)
    # Rahul Sharma -> Aman Verma (₹9,100)
    # Rahul Sharma -> Neha Kapoor (₹8,700)
    # Priya Mehta -> Vikram Malhotra (₹8,500)
    # Aman Verma -> Vikram Malhotra (₹8,900)
    # Neha Kapoor -> Vikram Malhotra (₹8,400)
    # Vikram Malhotra -> Rohan Singh (₹25,000)
    # Rohan Singh -> Rahul Sharma (₹20,000)

    print("\nInjecting Coherent Demo Fraud Network (Rahul -> Priya/Aman/Neha -> Vikram -> Rohan -> Rahul)...")

    demo_tx_sequence = [
        # Fan-Out & Structuring from Rahul Sharma
        {"transaction_id": "TX-001", "sender_account": "Rahul Sharma", "receiver_account": "Priya Mehta", "amount": 8900.0, "timestamp": (now - timedelta(minutes=20)).isoformat() + "Z", "channel": "UPI"},
        {"transaction_id": "TX-002", "sender_account": "Rahul Sharma", "receiver_account": "Aman Verma", "amount": 9100.0, "timestamp": (now - timedelta(minutes=18)).isoformat() + "Z", "channel": "UPI"},
        {"transaction_id": "TX-003", "sender_account": "Rahul Sharma", "receiver_account": "Neha Kapoor", "amount": 8700.0, "timestamp": (now - timedelta(minutes=16)).isoformat() + "Z", "channel": "UPI"},
        
        # Fan-In into Vikram Malhotra
        {"transaction_id": "TX-004", "sender_account": "Priya Mehta", "receiver_account": "Vikram Malhotra", "amount": 8500.0, "timestamp": (now - timedelta(minutes=12)).isoformat() + "Z", "channel": "MOBILE"},
        {"transaction_id": "TX-005", "sender_account": "Aman Verma", "receiver_account": "Vikram Malhotra", "amount": 8900.0, "timestamp": (now - timedelta(minutes=10)).isoformat() + "Z", "channel": "MOBILE"},
        {"transaction_id": "TX-006", "sender_account": "Neha Kapoor", "receiver_account": "Vikram Malhotra", "amount": 8400.0, "timestamp": (now - timedelta(minutes=8)).isoformat() + "Z", "channel": "MOBILE"},

        # Rapid Layering to Rohan Singh
        {"transaction_id": "TX-007", "sender_account": "Vikram Malhotra", "receiver_account": "Rohan Singh", "amount": 25000.0, "timestamp": (now - timedelta(minutes=5)).isoformat() + "Z", "channel": "WIRE"},

        # Circular Loop Completion back to Rahul Sharma
        {"transaction_id": "TX-008", "sender_account": "Rohan Singh", "receiver_account": "Rahul Sharma", "amount": 20000.0, "timestamp": (now - timedelta(minutes=2)).isoformat() + "Z", "channel": "WIRE"}
    ]

    for tx in demo_tx_sequence:
        process_transaction(tx)

    alerts = mongo_client.get_all_alerts()
    print("==================================================")
    print(f"[OK] Demo Dataset Seeded Successfully!")
    print(f"  Monitored Fictional People: {len(mongo_client.get_all_accounts())}")
    print(f"  Total Transactions: {len(mongo_client.get_all_transactions())}")
    print(f"  Generated Fraud Alerts: {len(alerts)}")
    print("==================================================")

if __name__ == "__main__":
    generate_synthetic_dataset()

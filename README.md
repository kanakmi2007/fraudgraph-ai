# FraudGraph AI - AI-Powered Financial Crime Detection & Network Investigation Platform

**FraudGraph AI** is an enterprise-grade financial intelligence and crime detection platform designed to detect complex money laundering networks, circular flows, fan-in/fan-out velocity spikes, structuring (smurfing), and rapid money movement that single-transaction filters miss.

> *"Fraud rarely looks suspicious in a single transaction. It becomes suspicious when we analyze relationships, transaction flows, behavioral patterns, and networks of accounts over time."*

---

## 🌟 Key Features

1. **Transaction & Financial Graph Ingestion**: Ingests high-throughput transaction streams into MongoDB and constructs dynamic directed graphs in Neo4j.
2. **Advanced Financial Crime Pattern Engine**:
   - **Fan-In Detection**: Identifies multiple accounts transferring funds to a single target within tight time windows.
   - **Fan-Out Detection**: Identifies single accounts rapidly dispersing funds to many destination accounts.
   - **Circular Money Flow (Cycle Traversal)**: Traverses multi-hop loops (`A -> B -> C -> D -> A`) using graph cycle algorithms.
   - **Rapid Money Movement**: Detects high-velocity pass-through transfers (< 10 min time deltas between hops).
   - **Structuring / Smurfing**: Identifies repeated transfers positioned just below regulatory reporting limits (e.g., ₹8,900, ₹9,100).
   - **Dormant Account Activation**: Flags low-activity or dormant accounts experiencing sudden multi-lakh volume spikes.
3. **Hybrid Risk Engine**:
   $$\text{Final Risk Score} = 0.30 \times \text{Rule Score} + 0.40 \times \text{Graph Score} + 0.30 \times \text{ML Anomaly Score}$$
4. **Explainable AI Evidence**: Generates empirical human-readable bullet-point evidence for every alert.
5. **Interactive Network Investigation Workstation**: Cytoscape.js canvas with directed arrows, color-coded node risk, size scaling by degree/score, path highlighting, zoom/pan/fit controls, and slide-over account drawer.
6. **Real-Time Live Monitoring & WebSockets**: WebSocket streaming feed (`ws://localhost:8000/ws/live`) with Play/Pause/Reset controls and real-time TPS counter.
7. **Guaranteed Benchmark Hackathon Demo**: Instant one-click injection of a deterministic multi-hop laundering network (`A -> B,C,D,E -> X -> Y -> A`).

---

## 🛠️ Technology Stack

- **Frontend**: React (TypeScript), Vite, Tailwind CSS, Lucide Icons, Recharts, Cytoscape.js (Dagre layout).
- **Backend**: Python 3.13, FastAPI, Pydantic v2, Uvicorn, WebSockets.
- **Databases**: MongoDB (Document store) & Neo4j (Graph database).
- **Dual Engine Architecture**: Built-in automatic fallback to NetworkX and in-memory document stores if database daemons are offline.
- **Data & ML**: Pandas, NumPy, Scikit-learn (Isolation Forest + Random Forest ensemble), NetworkX.

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### 1. Clone & Setup Backend
```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed synthetic dataset (500+ accounts, 5,000+ transactions, 6 fraud networks)
python scripts/generate_data.py

# Start FastAPI backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Backend API interactive documentation is available at: `http://localhost:8000/docs`

### 2. Setup & Launch Frontend
```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install frontend dependencies
npm install

# Start Vite React dev server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🎬 How to Demonstrate at Hackathons

1. **Overview Dashboard (`http://localhost:5173/dashboard`)**:
   - Inspect live KPIs, total transaction volume, active alerts count, and risk distribution charts.
2. **Alert Center (`http://localhost:5173/alerts`)**:
   - Filter by severity (`CRITICAL`, `HIGH`). Click **"Investigate Network"** on any alert.
3. **Interactive Investigation Workstation (`http://localhost:5173/investigation/ALT-DEMO`)**:
   - Interact with the Cytoscape graph canvas: zoom, pan, click nodes to open the slide-over **Account Intelligence Drawer**.
   - Review explainable evidence reasons in **"WHY WAS THIS FLAGGED?"**.
   - Click **"Escalate & Create Official Case"** to convert the alert into an analyst case.
4. **Live Simulation (`http://localhost:5173/live`)**:
   - Click **"Start Simulation"** to stream live transactions over WebSockets.
   - Click **"Inject Demo Network"** to deterministically inject the benchmark laundering network (`A -> B,C,D,E -> X -> Y -> A`).

---

## 📁 System Architecture & Directory Structure

```
FraudGraph AI/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI Routers (dashboard, accounts, transactions, alerts, cases, graph, simulation)
│   │   ├── database/     # MongoDB & Neo4j client implementations + NetworkX fallback
│   │   ├── detection/    # Fraud pattern algorithms (fan_in, fan_out, cycles, rapid_movement, structuring, dormant)
│   │   ├── ml/           # Feature engineering & ML anomaly prediction model
│   │   ├── models/       # Pydantic data schemas
│   │   ├── services/     # Core services (risk_service, transaction_service, alert_service, simulation_service)
│   │   └── main.py       # FastAPI application entrypoint & WebSockets
│   ├── scripts/          # Synthetic data generator & seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # UI Components (NetworkGraph, RiskBadge, RiskGauge, AlertCard, AccountPanel, Sidebar, Header)
│   │   ├── pages/        # 7 Main Pages (Dashboard, Alerts, Investigation, Accounts, AccountDetails, Transactions, Cases, LiveMonitoring)
│   │   ├── services/     # Axios API & WebSocket service
│   │   └── App.tsx       # Main router & layout state
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 📜 License
Built for Hackathon Demonstration. Open Source & MIT Licensed.

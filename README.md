# FraudGraph AI

FraudGraph AI is a hackathon project that explores a simple idea:

**What if transactions were viewed as a network instead of being checked one by one?**

The project is a prototype designed to help understand suspicious money movement between different people and accounts.

---

## The Idea

Fraud does not always involve one obviously suspicious transaction. Sometimes, the pattern only becomes visible when multiple transactions are viewed together.

For example:

Rahul → Amit → Vikram → Rahul

If money moves through several accounts and eventually returns to the original account, it may be worth investigating.

Similarly, money can be split into smaller transactions or moved quickly through multiple accounts. FraudGraph AI tries to make such patterns easier to notice.

---

## What Does the Project Do?

FraudGraph AI uses demo transaction data to create a clearer view of how money moves between connected accounts.

The application allows users to:

- View overall transaction activity
- Identify suspicious activity
- Explore transaction details
- Check account connections
- Investigate transaction networks
- Understand why certain activity has been flagged

The aim is not to automatically declare an account fraudulent. Instead, the prototype highlights activity that may require further investigation.

---

## Features

### Dashboard

Provides an overview of transaction activity, suspicious activity, active alerts, and high-risk networks.

### Alerts

Highlights activity that appears unusual and provides a reason for why it has been flagged.

### Transaction Explorer

Allows users to view and explore transaction data using simple demo information.

### Account Information

Provides information about an account's activity and its connections with other accounts.

### Network Investigation

Visualizes how different accounts are connected and how money moves through the network.

### Demo Mode

Uses synthetic transaction data to demonstrate the working of the prototype.

---

## Patterns Demonstrated

### Circular Money Flow

Money moves through multiple accounts and eventually returns to the starting account.

    A → B → C → A

### Structuring

A larger amount is divided into multiple smaller transactions.

### Rapid Movement

Money enters an account and is transferred out again within a short period of time.

### Suspicious Networks

Multiple accounts are connected in a way that may require further investigation.

---

## How It Works

    Demo Transaction Data
            ↓
    Transaction Analysis
            ↓
    Pattern Detection
            ↓
    Risk Identification
            ↓
    Suspicious Activity
            ↓
    Dashboard and Investigation

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Cytoscape.js
- Recharts
- Axios

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

### Data and Analysis

- Pandas
- NumPy
- Scikit-learn
- XGBoost
- NetworkX

### Database

- MongoDB
- Neo4j

### Data

- Synthetic / Mock Transaction Data

---

## Project Structure

    fraudgraph-ai/
    │
    ├── frontend/        # User interface and dashboard
    ├── backend/         # API and application logic
    ├── README.md
    └── docker-compose.yml

---

## Demo Data

The project uses synthetic/mock transaction data created for demonstration purposes.

The names and transactions shown in the application are fictional. No real banking or personal financial data is used.

---

## Project Status

FraudGraph AI was built as a hackathon prototype to explore how transaction relationships and money flow patterns can make suspicious activity easier to understand.

The current version focuses on demonstrating the core concept using synthetic transaction data.

from fastapi import APIRouter
from typing import Dict, Any
from app.database.mongodb import mongo_client
from app.database.neo4j import neo4j_client

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats() -> Dict[str, Any]:
    accounts = mongo_client.get_all_accounts(limit=5000)
    txs = mongo_client.get_all_transactions(limit=10000)
    alerts = mongo_client.get_all_alerts(limit=5000)

    total_tx_count = len(txs)
    total_volume = sum(t.get("amount", 0.0) for t in txs)
    accounts_monitored = len(accounts)
    
    active_alerts = len([a for a in alerts if a.get("status") in ["OPEN", "UNDER_INVESTIGATION"]])
    critical_alerts = len([a for a in alerts if a.get("severity") == "CRITICAL"])
    high_risk_accounts = len([acc for acc in accounts if acc.get("risk_score", 0.0) >= 61.0])
    
    # Suspicious networks (distinct cycle count + high-risk clusters)
    cycles = neo4j_client.get_cycles()
    suspicious_networks = max(len(cycles), len([a for a in alerts if a.get("severity") in ["HIGH", "CRITICAL"]]))

    detection_rate = round((len(alerts) / total_tx_count * 100.0), 2) if total_tx_count > 0 else 0.0

    # Risk Distribution Breakdown
    risk_dist = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for acc in accounts:
        level = acc.get("risk_level", "LOW")
        risk_dist[level] = risk_dist.get(level, 0) + 1

    # Alerts by Pattern Breakdown
    pattern_counts: Dict[str, int] = {}
    for al in alerts:
        for p in al.get("detected_patterns", []):
            pattern_counts[p] = pattern_counts.get(p, 0) + 1

    # Live Recent Transaction Feed (top 15)
    recent_feed = txs[:15]

    return {
        "kpis": {
            "total_transactions": total_tx_count,
            "total_volume": round(total_volume, 2),
            "accounts_monitored": accounts_monitored,
            "active_alerts": active_alerts,
            "critical_alerts": critical_alerts,
            "high_risk_accounts": high_risk_accounts,
            "suspicious_networks": suspicious_networks,
            "detection_rate": detection_rate
        },
        "risk_distribution": [
            {"name": "Low Risk (0-30)", "value": risk_dist.get("LOW", 0), "color": "#10B981"},
            {"name": "Medium Risk (31-60)", "value": risk_dist.get("MEDIUM", 0), "color": "#F59E0B"},
            {"name": "High Risk (61-80)", "value": risk_dist.get("HIGH", 0), "color": "#F97316"},
            {"name": "Critical Risk (81-100)", "value": risk_dist.get("CRITICAL", 0), "color": "#EF4444"}
        ],
        "alerts_by_pattern": [
            {"pattern": p.replace("_", " "), "count": c}
            for p, c in pattern_counts.items()
        ],
        "recent_feed": recent_feed
    }

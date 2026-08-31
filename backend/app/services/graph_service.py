from typing import Dict, List, Any, Optional
from app.database.neo4j import neo4j_client
from app.database.mongodb import mongo_client

def get_graph_for_account(account_id: str, hops: int = 2) -> Dict[str, Any]:
    """Fetch graph nodes and edges centered around account_id"""
    graph_data = neo4j_client.get_subgraph([account_id], hops=hops)
    
    # Enrich nodes with latest Mongo account risk information
    for n in graph_data["nodes"]:
        acc = mongo_client.get_account(n["id"])
        if acc:
            n["name"] = acc.get("name", n["id"])
            n["bank"] = acc.get("bank", "Unknown")
            n["risk_score"] = acc.get("risk_score", 0.0)
            n["risk_level"] = acc.get("risk_level", "LOW")
            n["status"] = acc.get("status", "ACTIVE")

    return graph_data

def get_graph_for_alert(alert_id: str) -> Dict[str, Any]:
    """Fetch graph nodes and edges for an investigation alert"""
    alert = mongo_client.get_alert(alert_id)
    if not alert:
        return {"nodes": [], "edges": []}

    primary = alert.get("primary_account")
    involved = alert.get("involved_accounts", [])
    if primary and primary not in involved:
        involved.append(primary)

    graph_data = neo4j_client.get_subgraph(involved, hops=1)
    
    # Highlight primary node & cycle paths
    for n in graph_data["nodes"]:
        if n["id"] == primary:
            n["is_primary"] = True
        acc = mongo_client.get_account(n["id"])
        if acc:
            n["name"] = acc.get("name", n["id"])
            n["bank"] = acc.get("bank", "Unknown Bank")
            n["risk_score"] = acc.get("risk_score", 0.0)
            n["risk_level"] = acc.get("risk_level", "LOW")

    return graph_data

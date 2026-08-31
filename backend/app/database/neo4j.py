import logging
import networkx as nx
from typing import Dict, List, Any, Optional, Tuple
from neo4j import GraphDatabase
from app.utils.config import settings

logger = logging.getLogger("fraudgraph.neo4j")

class Neo4jClient:
    def __init__(self):
        self.driver = None
        self.is_connected = False
        # In-memory graph engine powered by NetworkX
        self.nx_graph = nx.DiGraph()

    def connect(self):
        try:
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
            )
            # Verify connectivity
            self.driver.verify_connectivity()
            self.is_connected = True
            logger.info(f"Connected to Neo4j at {settings.NEO4J_URI}")
            print(f"[GRAPH NOTICE] Connected to live Neo4j database at {settings.NEO4J_URI}")
        except Exception as e:
            self.is_connected = False
            logger.warning(f"Neo4j database unavailable ({e}). Using NetworkX High-Performance In-Memory Graph Engine.")
            print(f"[GRAPH NOTICE] Neo4j unavailable ({e}). Operating in high-speed NetworkX Graph Engine mode.")

    def close(self):
        if self.driver and self.is_connected:
            self.driver.close()

    def add_account_node(self, account_id: str, properties: Optional[Dict[str, Any]] = None):
        props = properties or {}
        self.nx_graph.add_node(account_id, **props, node_type="Account")
        if self.is_connected:
            query = """
            MERGE (a:Account {account_id: $account_id})
            SET a += $props
            """
            try:
                with self.driver.session() as session:
                    session.run(query, account_id=account_id, props=props)
            except Exception as e:
                logger.error(f"Neo4j add_account_node error: {e}")

    def add_transaction_edge(self, sender: str, receiver: str, tx_data: Dict[str, Any]):
        tx_id = tx_data["transaction_id"]
        amount = tx_data["amount"]
        timestamp = tx_data["timestamp"]
        channel = tx_data.get("channel", "MOBILE")

        # NetworkX edge update
        self.nx_graph.add_node(sender, node_type="Account")
        self.nx_graph.add_node(receiver, node_type="Account")
        
        # Store multi-edge metadata or edge attributes
        if not self.nx_graph.has_edge(sender, receiver):
            self.nx_graph.add_edge(sender, receiver, transactions=[])
        
        edge_data = self.nx_graph[sender][receiver]
        if "transactions" not in edge_data:
            edge_data["transactions"] = []
        edge_data["transactions"].append(tx_data)
        edge_data["latest_amount"] = amount
        edge_data["latest_timestamp"] = timestamp

        if self.is_connected:
            query = """
            MATCH (a:Account {account_id: $sender})
            MATCH (b:Account {account_id: $receiver})
            CREATE (a)-[r:TRANSFERRED_TO {
                transaction_id: $tx_id,
                amount: $amount,
                timestamp: $timestamp,
                channel: $channel
            }]->(b)
            """
            try:
                with self.driver.session() as session:
                    session.run(query, sender=sender, receiver=receiver, tx_id=tx_id, amount=amount, timestamp=timestamp, channel=channel)
            except Exception as e:
                logger.error(f"Neo4j add_transaction_edge error: {e}")

    def get_cycles(self, max_length: int = 5) -> List[List[str]]:
        """Find circular money flows using NetworkX simple cycles algorithm"""
        try:
            all_cycles = []
            for cycle in nx.simple_cycles(self.nx_graph):
                if 3 <= len(cycle) <= max_length:
                    all_cycles.append(cycle)
                if len(all_cycles) >= 50:
                    break
            return all_cycles
        except Exception as e:
            logger.error(f"Error extracting cycles: {e}")
            return []

    def get_in_degree(self, account_id: str) -> int:
        return self.nx_graph.in_degree(account_id) if account_id in self.nx_graph else 0

    def get_out_degree(self, account_id: str) -> int:
        return self.nx_graph.out_degree(account_id) if account_id in self.nx_graph else 0

    def get_neighbors(self, account_id: str) -> List[str]:
        if account_id not in self.nx_graph:
            return []
        predecessors = list(self.nx_graph.predecessors(account_id))
        successors = list(self.nx_graph.successors(account_id))
        return list(set(predecessors + successors))

    def get_subgraph(self, account_ids: List[str], hops: int = 1) -> Dict[str, Any]:
        """Extract nodes & edges for Cytoscape visualization"""
        expanded_nodes = set(account_ids)
        for acc_id in account_ids:
            if acc_id in self.nx_graph:
                current_layer = {acc_id}
                for _ in range(hops):
                    next_layer = set()
                    for node in current_layer:
                        next_layer.update(self.nx_graph.predecessors(node))
                        next_layer.update(self.nx_graph.successors(node))
                    expanded_nodes.update(next_layer)
                    current_layer = next_layer

        nodes_list = []
        for n in expanded_nodes:
            node_data = self.nx_graph.nodes.get(n, {})
            nodes_list.append({
                "id": n,
                "label": n,
                "type": node_data.get("node_type", "Account"),
                "risk_score": node_data.get("risk_score", 0.0),
                "risk_level": node_data.get("risk_level", "LOW")
            })

        edges_list = []
        for u in expanded_nodes:
            for v in expanded_nodes:
                if self.nx_graph.has_edge(u, v):
                    edge_attrs = self.nx_graph[u][v]
                    txs = edge_attrs.get("transactions", [])
                    total_amount = sum(t.get("amount", 0) for t in txs)
                    latest_tx = txs[-1] if txs else {}
                    edges_list.append({
                        "id": f"{u}->{v}",
                        "source": u,
                        "target": v,
                        "amount": total_amount,
                        "count": len(txs),
                        "transaction_id": latest_tx.get("transaction_id", ""),
                        "timestamp": edge_attrs.get("latest_timestamp", "")
                    })

        return {"nodes": nodes_list, "edges": edges_list}

    def clear(self):
        self.nx_graph.clear()
        if self.is_connected:
            try:
                with self.driver.session() as session:
                    session.run("MATCH (n) DETACH DELETE n")
            except Exception as e:
                logger.error(f"Neo4j clear error: {e}")

neo4j_client = Neo4jClient()

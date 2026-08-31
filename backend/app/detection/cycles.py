from typing import List, Dict, Any
from app.database.neo4j import neo4j_client

def detect_circular_flow(account_id: str) -> Dict[str, Any]:
    """
    Pattern 3: Circular Money Flow
    Detect cycles involving account_id (e.g. A -> B -> C -> A or A -> B -> C -> D -> A).
    """
    cycles = neo4j_client.get_cycles(max_length=6)
    account_cycles = [c for c in cycles if account_id in c]
    
    if account_cycles:
        primary_cycle = account_cycles[0]
        cycle_str = " -> ".join(primary_cycle) + " -> " + primary_cycle[0]
        score = min(100.0, 75.0 + (len(account_cycles) * 5.0))
        return {
            "detected": True,
            "pattern": "CIRCULAR_FLOW",
            "score": score,
            "details": {
                "cycle_count": len(account_cycles),
                "primary_cycle": primary_cycle,
                "cycle_path": cycle_str,
                "all_cycles": account_cycles
            },
            "evidence": f"Circular Money Flow detected: Account participates in {len(account_cycles)} circular loop(s). Key cycle path: [{cycle_str}]."
        }
    
    return {"detected": False, "score": 0.0, "details": {}}

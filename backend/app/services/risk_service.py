from typing import List, Dict, Any, Tuple
from app.detection.fan_in import detect_fan_in
from app.detection.fan_out import detect_fan_out
from app.detection.cycles import detect_circular_flow
from app.detection.rapid_movement import detect_rapid_movement
from app.detection.structuring import detect_structuring
from app.detection.dormant_accounts import detect_dormant_activation
from app.ml.prediction import get_ml_risk_score
from app.database.neo4j import neo4j_client

def calculate_account_risk(account_data: Dict[str, Any], account_txs: List[Dict[str, Any]]) -> Tuple[float, str, List[str], List[str], List[Dict[str, Any]]]:
    """
    Hybrid Risk Scoring Engine:
    Final Risk = 0.30 * Rule Score + 0.40 * Graph Score + 0.30 * ML Score
    Returns: (final_score, risk_level, detected_pattern_names, human_reasons, detection_results)
    """
    account_id = account_data["account_id"]

    # 1. Evaluate Rule Engines
    rule_results = []
    fan_in_res = detect_fan_in(account_id, account_txs)
    if fan_in_res["detected"]: rule_results.append(fan_in_res)

    fan_out_res = detect_fan_out(account_id, account_txs)
    if fan_out_res["detected"]: rule_results.append(fan_out_res)

    rapid_res = detect_rapid_movement(account_id, account_txs)
    if rapid_res["detected"]: rule_results.append(rapid_res)

    struct_res = detect_structuring(account_id, account_txs)
    if struct_res["detected"]: rule_results.append(struct_res)

    dormant_res = detect_dormant_activation(account_data, account_txs)
    if dormant_res["detected"]: rule_results.append(dormant_res)

    if rule_results:
        rule_score = sum(r["score"] for r in rule_results) / len(rule_results)
    else:
        rule_score = 0.0

    # 2. Evaluate Graph / Network Score
    cycle_res = detect_circular_flow(account_id)
    if cycle_res["detected"]:
        rule_results.append(cycle_res)
        cycle_score = cycle_res["score"]
    else:
        cycle_score = 0.0

    in_deg = neo4j_client.get_in_degree(account_id)
    out_deg = neo4j_client.get_out_degree(account_id)
    total_degree = in_deg + out_deg

    degree_score = min(100.0, total_degree * 8.0)
    graph_score = 0.6 * cycle_score + 0.4 * degree_score

    # 3. Evaluate ML Anomaly Score
    ml_score = get_ml_risk_score(account_id, account_txs)

    # 4. Combine into Final Hybrid Score
    final_score = round(0.30 * rule_score + 0.40 * graph_score + 0.30 * ml_score, 1)
    final_score = min(100.0, max(0.0, final_score))

    # Risk level assignment
    if final_score >= 81.0:
        risk_level = "CRITICAL"
    elif final_score >= 61.0:
        risk_level = "HIGH"
    elif final_score >= 31.0:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # 5. Build Human-Readable Evidence Reasons
    detected_patterns = [r["pattern"] for r in rule_results]
    human_reasons = []

    if fan_in_res["detected"]:
        human_reasons.append(fan_in_res["evidence"])
    if fan_out_res["detected"]:
        human_reasons.append(fan_out_res["evidence"])
    if cycle_res["detected"]:
        human_reasons.append(cycle_res["evidence"])
    if rapid_res["detected"]:
        human_reasons.append(rapid_res["evidence"])
    if struct_res["detected"]:
        human_reasons.append(struct_res["evidence"])
    if dormant_res["detected"]:
        human_reasons.append(dormant_res["evidence"])
    
    if in_deg > 3 or out_deg > 3:
        human_reasons.append(f"High Network Density: Connected to {in_deg} incoming accounts and {out_deg} outgoing destination accounts.")
    if ml_score >= 65.0:
        human_reasons.append(f"Behavioral Anomaly: Machine Learning model calculated {ml_score:.1f}% statistical deviation from normal transaction baseline.")

    if not human_reasons:
        human_reasons.append("Normal transaction behavior observed across standard baseline windows.")

    return final_score, risk_level, list(set(detected_patterns)), human_reasons, rule_results

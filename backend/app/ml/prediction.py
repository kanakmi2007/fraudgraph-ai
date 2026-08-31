from typing import List, Dict, Any
from app.ml.feature_engineering import extract_account_features
from app.ml.model import ml_model

def get_ml_risk_score(account_id: str, account_txs: List[Dict[str, Any]]) -> float:
    """Extract features and calculate ML Anomaly Score"""
    features = extract_account_features(account_id, account_txs)
    score = ml_model.predict_anomaly_score(features)
    return score

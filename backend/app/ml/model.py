import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from typing import Dict, List, Any

class FraudMLModel:
    def __init__(self):
        self.isolation_forest = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        self.rf_classifier = RandomForestClassifier(n_estimators=50, random_state=42)
        self.is_trained = False
        self._initialize_dummy_training()

    def _initialize_dummy_training(self):
        """Train initial model baseline on synthetic feature ranges"""
        np.random.seed(42)
        # Normal accounts: low degree, low structuring, normal amounts
        normal_samples = np.random.uniform(low=[1, 1, 1000, 1000, 2000, 500, 10000, 0, 1, 1, 5],
                                           high=[4, 4, 50000, 50000, 15000, 4000, 30000, 0, 3, 3, 30],
                                           size=(300, 11))
        # Suspicious accounts: high degree, high structuring, high volume, rapid velocity
        suspicious_samples = np.random.uniform(low=[6, 6, 200000, 200000, 8500, 200, 9500, 4, 5, 5, 40],
                                              high=[20, 20, 2000000, 2000000, 9800, 500, 9900, 15, 18, 18, 200],
                                              size=(50, 11))
        
        X = np.vstack([normal_samples, suspicious_samples])
        y = np.array([0] * 300 + [1] * 50)
        
        self.isolation_forest.fit(X)
        self.rf_classifier.fit(X, y)
        self.is_trained = True

    def predict_anomaly_score(self, feature_dict: Dict[str, float]) -> float:
        feature_vector = np.array([[
            feature_dict.get("unique_senders", 0.0),
            feature_dict.get("unique_receivers", 0.0),
            feature_dict.get("total_incoming_volume", 0.0),
            feature_dict.get("total_outgoing_volume", 0.0),
            feature_dict.get("avg_transaction_amount", 0.0),
            feature_dict.get("std_transaction_amount", 0.0),
            feature_dict.get("max_transaction_amount", 0.0),
            feature_dict.get("structuring_count", 0.0),
            feature_dict.get("graph_in_degree", 0.0),
            feature_dict.get("graph_out_degree", 0.0),
            feature_dict.get("total_tx_count", 0.0)
        ]])
        
        # Isolation forest decision score -> convert to 0-100 anomaly probability
        raw_iso = self.isolation_forest.score_samples(feature_vector)[0]
        # raw_iso is typically in [-0.8, -0.3] for anomalies, [0.0, 0.5] for normal
        iso_score = max(0.0, min(100.0, (0.5 - raw_iso) * 100.0))
        
        rf_prob = self.rf_classifier.predict_proba(feature_vector)[0][1] * 100.0
        
        final_ml_score = 0.5 * iso_score + 0.5 * rf_prob
        return float(np.round(final_ml_score, 2))

ml_model = FraudMLModel()

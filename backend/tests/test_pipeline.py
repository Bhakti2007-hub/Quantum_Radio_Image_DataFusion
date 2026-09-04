"""Automated test suite verifying the research ML and Quantum pipeline components."""
import unittest
import numpy as np
import json
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.data.dataset_loader import MultimodalDatasetManager
from backend.data.synthetic_generator import generate_multimodal_dataset
from backend.radio.analysis import analyze_radio_modality
from backend.image.preprocessing import analyze_image_modality
from backend.fusion.early_fusion import EarlyFusionPipeline
from backend.fusion.intermediate_fusion import IntermediateFusionPipeline
from backend.fusion.late_fusion import LateFusionPipeline
from backend.quantum.quantum_classifier import QuantumTargetClassifier
from backend.quantum.circuit_visualizer import generate_circuit_metadata
from backend.app import create_app

class TestQuantumRadioImageFusion(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manager = MultimodalDatasetManager.get_instance()
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_01_dataset_generation(self):
        df = generate_multimodal_dataset(n_samples=50, random_seed=42)
        self.assertEqual(len(df), 50)
        self.assertIn("target_class", df.columns)
        self.assertIn("rssi_dbm", df.columns)
        self.assertIn("edge_density", df.columns)

    def test_02_radio_analysis(self):
        res = analyze_radio_modality()
        self.assertIn("distributions", res)
        self.assertIn("correlation_matrix", res)
        self.assertIn("pca_projection", res)
        self.assertTrue(len(res["pca_projection"]["points"]) > 0)

    def test_03_image_analysis(self):
        res = analyze_image_modality()
        self.assertIn("distributions", res)
        self.assertIn("pca_projection", res)

    def test_04_fusion_pipelines(self):
        X_rf, y, _ = self.manager.get_radio_features()
        X_img, _, _ = self.manager.get_image_features()

        # Early fusion
        early = EarlyFusionPipeline(classifier_name="random_forest")
        m_early = early.train(X_rf, X_img, y)
        self.assertGreater(m_early["accuracy"], 0.70)

        # Intermediate fusion
        inter = IntermediateFusionPipeline(classifier_name="svm", latent_dim_per_modality=3)
        m_inter = inter.train(X_rf, X_img, y)
        self.assertGreater(m_inter["accuracy"], 0.70)

        # Late fusion
        late = LateFusionPipeline(model_type="random_forest", rf_weight=0.5)
        m_late = late.train(X_rf, X_img, y)
        self.assertGreater(m_late["accuracy"], 0.70)

    def test_05_quantum_circuit_and_classifier(self):
        circuit = generate_circuit_metadata(n_qubits=4, reps=2, feature_map_type="ZZFeatureMap")
        self.assertEqual(circuit["n_qubits"], 4)
        self.assertTrue(len(circuit["gates"]) > 0)

        X_rf, y, _ = self.manager.get_radio_features()
        X_img, _, _ = self.manager.get_image_features()

        q_clf = QuantumTargetClassifier(n_qubits=4, reps=2, feature_map_name="ZZFeatureMap")
        m_q = q_clf.train_and_evaluate(X_rf, X_img, y, test_size=0.25)
        self.assertIn("accuracy", m_q)
        self.assertIn("quantum_metadata", m_q)
        self.assertEqual(m_q["quantum_metadata"]["execution_type"], "Quantum Simulation")

    def test_06_api_endpoints(self):
        # Health
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["status"], "healthy")

        # Datasets
        res = self.client.get("/api/datasets")
        self.assertEqual(res.status_code, 200)

        # Radio Analysis
        res = self.client.get("/api/radio/analysis")
        self.assertEqual(res.status_code, 200)

        # Fusion train
        res = self.client.post("/api/fusion/train", json={"strategy": "all", "classifier": "random_forest"})
        self.assertEqual(res.status_code, 200)

        # Live prediction
        res = self.client.post("/api/predict", json={
            "radio_features": {
                "rssi_dbm": -60.0,
                "snr_db": 18.0,
                "carrier_freq_ghz": 2.4,
                "bandwidth_mhz": 20.0,
                "doppler_shift_khz": 4.5
            },
            "image_features": {
                "edge_density": 0.68,
                "aspect_ratio": 1.05,
                "spatial_entropy": 5.6
            }
        })
        self.assertEqual(res.status_code, 200)
        pred_data = json.loads(res.data)
        self.assertIn("detection_result", pred_data)
        self.assertIn("modality_comparisons", pred_data)

if __name__ == "__main__":
    unittest.main()

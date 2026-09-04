"""In-memory model storage for active inference across classical, fusion, and quantum models."""
from typing import Optional
from backend.models.classical_models import ClassicalModalityTrainer
from backend.fusion.early_fusion import EarlyFusionPipeline
from backend.fusion.intermediate_fusion import IntermediateFusionPipeline
from backend.fusion.late_fusion import LateFusionPipeline
from backend.quantum.quantum_classifier import QuantumTargetClassifier

class ActiveModelStore:
    _instance = None

    def __init__(self):
        self.radio_model: Optional[ClassicalModalityTrainer] = None
        self.image_model: Optional[ClassicalModalityTrainer] = None
        self.early_fusion: Optional[EarlyFusionPipeline] = None
        self.intermediate_fusion: Optional[IntermediateFusionPipeline] = None
        self.late_fusion: Optional[LateFusionPipeline] = None
        self.quantum_model: Optional[QuantumTargetClassifier] = None

    @classmethod
    def get_instance(cls) -> "ActiveModelStore":
        if cls._instance is None:
            cls._instance = ActiveModelStore()
        return cls._instance

model_store = ActiveModelStore.get_instance()

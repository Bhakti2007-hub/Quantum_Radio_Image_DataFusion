/**
 * TypeScript Interfaces for Quantum ML Radio-Image Data Fusion Platform
 */

export interface DatasetSummary {
  dataset_name: string;
  dataset_type: string;
  total_samples: number;
  radio_features_count: number;
  image_features_count: number;
  total_features_count: number;
  classes: string[];
  class_distribution: Record<string, number>;
  missing_values_count: number;
  missing_values_per_col: Record<string, number>;
  radio_feature_names: string[];
  image_feature_names: string[];
  sample_records: any[];
}

export interface RadioAnalysisData {
  total_samples: number;
  features: string[];
  distributions: Record<string, {
    mean: number;
    std: number;
    min: number;
    max: number;
    median: number;
    histogram: { bin: string; count: number; mid: number }[];
  }>;
  correlation_matrix: {
    features: string[];
    matrix: number[][];
  };
  feature_importance: { feature: string; importance: number }[];
  pca_projection: {
    points: {
      sample_id: number;
      x: number;
      y: number;
      target_class: string;
      class_label: number;
      rssi_dbm: number;
      snr_db: number;
      doppler_shift_khz: number;
    }[];
    explained_variance: number[];
    total_variance: number;
  };
  class_profiles: Record<string, {
    mean_rssi: number;
    mean_snr: number;
    mean_doppler: number;
    sample_count: number;
  }>;
  research_note: string;
}

export interface ImageAnalysisData {
  total_samples: number;
  features: string[];
  distributions: Record<string, any>;
  pca_projection: {
    points: {
      sample_id: number;
      x: number;
      y: number;
      target_class: string;
      class_label: number;
      edge_density: number;
      aspect_ratio: number;
      spatial_entropy: number;
    }[];
    explained_variance: number[];
    total_variance: number;
  };
  research_note: string;
}

export interface ModelMetrics {
  model_name: string;
  modality: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  precision_weighted?: number;
  recall_weighted?: number;
  f1_weighted?: number;
  roc_auc?: number | null;
  confusion_matrix: number[][];
  per_class?: Record<string, { precision: number; recall: number; f1: number; support: number }>;
  train_time_sec: number;
  inference_time_ms: number;
  sample_count?: number;
  quantum_metadata?: {
    execution_type: string;
    simulation_backend: string;
    qubits: number;
    feature_map: string;
    circuit_depth: number;
    total_quantum_gates: number;
    kernel_computation_time_sec: number;
    sample_kernel_heatmap?: number[][];
  };
}

export interface CircuitInfo {
  n_qubits: number;
  repetitions: number;
  feature_map_type: string;
  entanglement: string;
  wires: { qubit: number; label: string }[];
  gates: {
    type: string;
    name: string;
    qubit?: number;
    control?: number;
    target?: number;
    layer: number;
    params?: string[];
    description: string;
  }[];
  total_gates: number;
  circuit_depth: number;
  ascii_diagram: string;
  simulation_backend: string;
}

export interface PredictionResponse {
  detection_result: {
    target_class: string;
    confidence: number;
    confidence_percent: string;
  };
  modality_comparisons: {
    radio_only: {
      model: string;
      predicted_class: string;
      confidence: number;
      probabilities: number[];
    };
    image_only: {
      model: string;
      predicted_class: string;
      confidence: number;
      probabilities: number[];
    };
    classical_fusion: {
      model: string;
      predicted_class: string;
      confidence: number;
      probabilities: number[];
    };
    quantum_fusion: {
      model: string;
      predicted_class: string;
      confidence: number;
      probabilities: number[];
      quantum_metadata?: any;
    };
  };
  target_classes: string[];
  inputs: {
    radio_features: Record<string, number>;
    image_features: Record<string, number>;
    thumbnail_b64?: string;
  };
}

export interface ExperimentEntry {
  experiment_id: string;
  timestamp: string;
  model_name: string;
  modality: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc?: number;
  train_time_sec: number;
  inference_time_ms: number;
  confusion_matrix: number[][];
  per_class?: Record<string, any>;
  quantum_metadata?: any;
  execution_mode: string;
}

export interface ResearchInsightsResponse {
  has_data: boolean;
  total_experiments_evaluated: number;
  best_radio_f1: number | null;
  best_image_f1: number | null;
  best_fusion_f1: number | null;
  best_quantum_f1: number | null;
  fusion_gain_f1: number;
  insights: {
    title: string;
    type: string;
    category: string;
    statement: string;
  }[];
}

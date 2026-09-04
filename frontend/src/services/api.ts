/**
 * REST API client for Quantum ML Radio-Image Data Fusion Platform
 */
import {
  DatasetSummary,
  RadioAnalysisData,
  ImageAnalysisData,
  CircuitInfo,
  PredictionResponse,
  ExperimentEntry,
  ResearchInsightsResponse
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; simulation_mode: string }> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDatasetSummary(): Promise<DatasetSummary> {
  const res = await fetch(`${API_BASE}/datasets`);
  if (!res.ok) throw new Error('Failed to fetch dataset summary');
  return res.json();
}

export async function resetSyntheticDataset(nSamples: number = 500): Promise<DatasetSummary> {
  const res = await fetch(`${API_BASE}/datasets/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ n_samples: nSamples }),
  });
  if (!res.ok) throw new Error('Failed to reset dataset');
  return res.json();
}

export async function uploadDatasetFile(formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/datasets/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
}

export async function fetchRadioAnalysis(): Promise<RadioAnalysisData> {
  const res = await fetch(`${API_BASE}/radio/analysis`);
  if (!res.ok) throw new Error('Failed to fetch radio analysis');
  return res.json();
}

export async function fetchImageAnalysis(): Promise<ImageAnalysisData> {
  const res = await fetch(`${API_BASE}/image/analysis`);
  if (!res.ok) throw new Error('Failed to fetch image analysis');
  return res.json();
}

export async function analyzeUploadedImage(formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/image/analyze`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to analyze image');
  return res.json();
}

export async function trainFusionModels(params: {
  strategy?: string;
  classifier?: string;
  rf_weight?: number;
  latent_dim?: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/fusion/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to train fusion pipeline');
  return res.json();
}

export async function trainQuantumModel(params: {
  n_qubits?: number;
  reps?: number;
  feature_map?: string;
  C?: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/quantum/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Quantum simulation error');
  }
  return res.json();
}

export async function fetchCircuitDetails(params: {
  n_qubits?: number;
  reps?: number;
  feature_map?: string;
}): Promise<CircuitInfo> {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/quantum/circuit?${q}`);
  if (!res.ok) throw new Error('Failed to fetch circuit structure');
  return res.json();
}

export async function executeLivePrediction(payload: {
  radio_features?: Record<string, number>;
  image_features?: Record<string, number>;
  sample_id?: number;
}): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Prediction execution failed');
  return res.json();
}

export async function fetchModelComparison(): Promise<{
  comparison_table: ExperimentEntry[];
  best_model_id: string | null;
  best_f1: number;
}> {
  const res = await fetch(`${API_BASE}/models/comparison`);
  if (!res.ok) throw new Error('Failed to fetch model comparison');
  return res.json();
}

export async function fetchExperiments(): Promise<{
  total_experiments: number;
  experiments: ExperimentEntry[];
}> {
  const res = await fetch(`${API_BASE}/experiments`);
  if (!res.ok) throw new Error('Failed to fetch experiment history');
  return res.json();
}

export async function clearExperiments(): Promise<any> {
  const res = await fetch(`${API_BASE}/experiments/clear`, { method: 'POST' });
  return res.json();
}

export async function fetchInsights(): Promise<ResearchInsightsResponse> {
  const res = await fetch(`${API_BASE}/insights`);
  if (!res.ok) throw new Error('Failed to fetch research insights');
  return res.json();
}

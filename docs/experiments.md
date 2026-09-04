# Experimental Results & Benchmark Findings

## 1. Empirical Performance Summary

| Architecture | Sensing Modality | Accuracy | Macro F1 | Inference Latency |
| :--- | :--- | :---: | :---: | :---: |
| Radio Random Forest | RF Only (9 Feats) | ~82.4% | ~0.821 | ~0.35 ms |
| Optical Random Forest | Image Only (12 Feats) | ~86.8% | ~0.865 | ~0.40 ms |
| Early Fusion (RF + Image) | Multimodal Concatenation | **~96.8%** | **~0.967** | **~0.45 ms** |
| Intermediate Fusion | Latent PCA Embeddings | ~94.4% | ~0.942 | ~0.60 ms |
| Late Fusion | Soft Voting Consensus | ~93.6% | ~0.935 | ~0.75 ms |
| Quantum QSVC (Simulation) | 4-Qubit ZZFeatureMap | **~92.8%** | **~0.925** | **~2.80 ms** |

## 2. Key Takeaways
1. **Multimodal Synergy**: Early Fusion achieves a **+10.2% F1 improvement** over the best standalone optical modality, confirming strong physical complementarity.
2. **Quantum Competitiveness**: Simulated QSVC on a 4-qubit PCA manifold achieves **92.8% Accuracy**, showing effective non-linear separation in the simulated quantum Hilbert space.

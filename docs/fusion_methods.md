# Multimodal Data Fusion Strategies

## 1. Early Fusion (Feature-Level Concatenation)

$$\mathbf{z}_{\text{early}} = [\mathbf{x}_{rf} \mathbin{\Vert} \mathbf{x}_{\text{img}}] \in \mathbb{R}^{d_{rf} + d_{img}}$$

- Normalized RF and optical feature vectors are concatenated before being passed to a unified classifier.
- **Advantage**: Allows the classifier to directly exploit cross-modal correlations (e.g. low SNR coinciding with high optical edge density).
- **Latency**: Sub-millisecond evaluation (~0.2ms / sample).

---

## 2. Intermediate Fusion (Latent Embedding Fusion)

$$\mathbf{h}_{rf} = \mathbf{W}_{rf} \mathbf{x}_{rf}, \quad \mathbf{h}_{\text{img}} = \mathbf{W}_{\text{img}} \mathbf{x}_{\text{img}}$$
$$\mathbf{z}_{\text{inter}} = [\mathbf{h}_{rf} \mathbin{\Vert} \mathbf{h}_{\text{img}}] \in \mathbb{R}^{2d}$$

- Each modality is independently projected into a lower-dimensional representation subspace via modality-specific PCA transformation before joint classification.
- **Advantage**: Prevents high-variance RF features from overwhelming subtle visual texture moments.

---

## 3. Late Fusion (Decision-Level Soft Voting)

$$P_{\text{late}}(y \mid \mathbf{x}) = \alpha P_{rf}(y \mid \mathbf{x}_{rf}) + (1 - \alpha) P_{\text{img}}(y \mid \mathbf{x}_{\text{img}})$$

- Independent classifiers are trained per modality.
- Prediction probability vectors are combined via weighted consensus.
- **Advantage**: Fault-tolerant; if one sensing channel experiences catastrophic failure or spoofing, the other modality preserves baseline functionality.

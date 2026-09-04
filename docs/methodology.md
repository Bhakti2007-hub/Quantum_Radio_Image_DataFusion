# Research Methodology & Experimental Design

## 1. Overview of Experimental Protocol

The multimodal wireless target detection experimental pipeline is structured into 11 rigorous stages to ensure reproducibility, data hygiene, and leak-free evaluation:

1. **Multimodal Data Acquisition**: Tabulation of raw RF baseband IQ statistics and synchronized optical image samples.
2. **Data Preprocessing & Quality Verification**: Median imputation for missing values, outlier bounding, and stratified $K$-fold or train/test splitting ($75\%$ training, $25\%$ testing).
3. **Radio Feature Engineering**: Computation of electromagnetic and kinematic properties (RSSI, SNR, Carrier Frequency, Bandwidth, Doppler Shift, Phase Variance, Path Loss, Spectral Kurtosis, PAPR).
4. **Optical Feature Extraction**: Extraction of spatial bounding contours, edge energy densities, spatial entropy, RGB color moments, and texture co-occurrence approximations.
5. **Feature Normalization**: Z-score standardization ($\mu=0, \sigma=1$) to prevent features with wide numerical scales (e.g. RSSI vs phase) from biasing gradient optimization.
6. **Multimodal Feature Fusion**: Formulation of three distinct fusion paradigms:
   - Early Fusion: Feature concatenation $\mathbf{z} = [\mathbf{x}_{rf} \mathbin{\Vert} \mathbf{x}_{img}]$
   - Intermediate Fusion: Latent embedding projection $\mathbf{z} = [\mathbf{h}_{rf} \mathbin{\Vert} \mathbf{h}_{img}]$
   - Late Fusion: Decision-level soft probabilistic consensus $P(y) = \alpha P_{rf} + (1-\alpha) P_{img}$
7. **Classical ML Modeling**: Training Random Forest ensembles, Support Vector Machines with RBF kernels, and Regularized Logistic Regression classifiers.
8. **Quantum Feature Encoding**: Projecting normalized multimodal features into $n$-qubit bounded phase rotation angles $\theta_i \in [0, \pi]$.
9. **Quantum ML Modeling**: Computing exact quantum statevector overlaps $\kappa(\mathbf{x}, \mathbf{x}') = |\langle \Phi(\mathbf{x}) | \Phi(\mathbf{x}') \rangle|^2$ via $ZZ$-feature maps and fitting Quantum Support Vector Classifiers (QSVC).
10. **Performance Evaluation**: Computing Accuracy, Precision (Macro/Weighted), Recall (Macro/Weighted), F1-Scores, ROC-AUC, and empirical confusion matrices.
11. **Empirical Synthesis**: Generating dynamic research findings evaluating multimodal synergy $\Delta F_1$ and quantum feasibility.

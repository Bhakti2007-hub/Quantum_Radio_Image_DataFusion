# Quantum ML for Radio–Image Data Fusion in Wireless Target Detection

An end-to-end, research-grade multimodal machine learning and quantum computing platform investigating how complementary information from radio-frequency (RF) signals and optical imagery can be fused using Classical Machine Learning and Quantum Machine Learning (QSVC / Quantum Kernel) techniques to enhance wireless target detection.

---

## 1. Research Overview

Target detection and classification in modern aerospace, defense, counter-UAS, and autonomous navigation domains require high reliability under adverse conditions (e.g., weather obscuration, non-line-of-sight propagation, electronic interference, optical camouflage).

- **Radio-Frequency (RF) Sensing**: Captures kinematic Doppler velocity, micro-Doppler rotor dynamics, received signal power (RSSI), carrier harmonics, and channel path loss. Works reliably through fog, smoke, and beyond optical line-of-sight.
- **Optical Image Sensing**: Captures high-resolution spatial contours, geometric aspect ratios, surface textures, and color moment distributions.
- **Multimodal Data Fusion**: Synthesizes the complementary physical properties of both modalities to minimize Bayesian error bounds.
- **Quantum Machine Learning (QML)**: Maps multimodal features into non-linear Hilbert space quantum statevectors via parameterized $ZZ$-feature map circuits $\Phi(\mathbf{x})$, evaluating quantum kernel Gram matrices $\kappa(\mathbf{x}, \mathbf{x}') = |\langle \Phi(\mathbf{x}) | \Phi(\mathbf{x}') \rangle|^2$ for classification via Quantum Support Vector Classifiers (QSVC).

> [!NOTE]
> All quantum algorithms in this repository operate under **Simulated Quantum Processing** using Qiskit and exact statevector simulation to uphold rigorous research integrity.

---

## 2. Target Classes

1. `UAV_Drone`: Quadcopter / fixed-wing agile target with distinctive high micro-Doppler rotor signatures (4.8 kHz) and compact square visual contours.
2. `Ground_Vehicle`: Terrestrial vehicle characterized by low Doppler velocity (1.2 kHz), wide multipath bandwidth, and elongated aspect ratio.
3. `Civil_Aircraft`: High radial velocity Doppler shift (8.5 kHz), line-of-sight high SNR, and aerodynamic streamlined optical geometry.
4. `Maritime_Vessel`: Surface watercraft with sea surface multipath phase fluctuation, oceanic texture contrast, and slow drift velocity.
5. `Clutter_Noise`: Ambient RF thermal noise and diffuse optical background devoid of targets.

---

## 3. Architecture & Project Structure

```text
Quantum_Radio_Image_DataFusion/
├── backend/
│   ├── app.py                      # Flask REST API server
│   ├── config.py                   # Configuration and hyperparameter constants
│   ├── requirements.txt            # Python dependencies
│   ├── data/
│   │   ├── dataset_loader.py       # Multimodal dataset manager (Real & Synthetic)
│   │   ├── preprocessing.py        # Leak-free scaling, PCA reduction, train/test split
│   │   └── synthetic_generator.py  # Synthetic multimodal data generator
│   ├── radio/
│   │   ├── feature_extraction.py   # RF feature calculation & IQ statistics
│   │   └── analysis.py             # RF correlation, histograms, & 2D PCA
│   ├── image/
│   │   ├── feature_extraction.py   # Optical moments, edge density, & texture
│   │   └── preprocessing.py        # Visual manifold PCA & distributions
│   ├── fusion/
│   │   ├── early_fusion.py         # Feature concatenation [X_rf || X_img]
│   │   ├── intermediate_fusion.py  # Latent PCA embedding fusion [H_rf || H_img]
│   │   └── late_fusion.py          # Decision consensus (α P_rf + (1-α) P_img)
│   ├── models/
│   │   ├── classical_models.py     # Random Forest, SVM, Logistic Regression
│   │   ├── model_store.py          # Active trained model cache for live inference
│   │   └── evaluation.py           # Metrics computation
│   ├── quantum/
│   │   ├── quantum_features.py     # Bounded [0, π] rotation angle encoder
│   │   ├── quantum_kernel.py       # Qiskit Statevector Quantum Kernel engine
│   │   ├── quantum_classifier.py   # Quantum Support Vector Classifier (QSVC)
│   │   └── circuit_visualizer.py   # Quantum circuit gate diagrams & ASCII export
│   ├── routes/
│   │   ├── datasets.py             # Dataset API endpoints
│   │   ├── analysis.py             # Radio & Image analysis API
│   │   ├── fusion.py               # Multimodal fusion training API
│   │   ├── quantum.py              # Quantum ML training & circuit API
│   │   ├── prediction.py           # Live 4-paradigm inference API
│   │   ├── experiments.py          # Experiment logging & comparison API
│   │   └── insights.py             # Dynamic empirical research insights
│   ├── utils/
│   │   ├── metrics.py              # Precision, Recall, F1, ROC-AUC, Confusion Matrix
│   │   └── logging_config.py       # Server logger
│   └── tests/
│       └── test_pipeline.py        # Automated unit test suite
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components (MetricCard, CircuitViewer, etc.)
│   │   ├── pages/                  # 11 Major research pages
│   │   ├── services/               # REST API client
│   │   ├── types.ts                # TypeScript data interfaces
│   │   ├── index.css               # Natural academic research lab design system
│   │   ├── App.tsx                 # Main application shell
│   │   └── main.tsx                # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docs/                           # Detailed scientific documentation
└── README.md
```

---

## 4. Installation & Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ / npm

### Step 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Start Flask Backend Server (Runs on http://127.0.0.1:5000)
python app.py
```

### Step 2: Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server (Runs on http://localhost:5173)
npm run dev
```

### Step 3: Run Backend Test Suite
```bash
# From the project root:
python -m unittest backend/tests/test_pipeline.py
```

---

## 5. Major Application Pages

1. **Research Overview**: Research introduction, 4 core research metrics, interactive workflow flowchart, and problem formulation.
2. **Dataset Explorer**: Synthetic and real dataset ingestion, dataset quality validator, feature tabs (Radio, Image, Fused), and sample tabular records.
3. **Radio Analysis**: RF parameter histograms (RSSI, SNR, Doppler, PAPR, Kurtosis), correlation matrix heatmap, Gini importance ranking, and 2D PCA kinematic scatter plot.
4. **Image Analysis**: Interactive optical feature extractor, dimension inspector, visual descriptor histograms, and 2D visual manifold scatter projection.
5. **Data Fusion Lab**: Interactive training and comparative evaluation across Early Fusion (concatenation), Intermediate Fusion (latent embeddings), and Late Fusion (soft voting consensus).
6. **Quantum ML Lab**: Quantum feature pipeline with bounded phase mapping, interactive quantum circuit visualizer (wires & ASCII diagram), Quantum Kernel Gram matrix ($K_{ij}$) heatmap, and QSVC benchmark.
7. **Model Comparison**: Unified benchmark matrix comparing Radio-only vs Image-only vs Classical Fusion vs Quantum ML with F1-score and Accuracy bar charts.
8. **Target Detection**: Interactive live testing console: RF sliders + optical image upload $\to$ live simultaneous inference producing 4 model verdicts with confidence bars.
9. **Experiment Results**: Audit trail of executed runs with timestamps, parameter tracking, confusion matrices, and JSON export.
10. **Research Insights**: Dynamically synthesized scientific findings derived from empirical benchmark performance.
11. **About the Research**: 11-step methodology breakdown, theoretical derivations, sensing applications, and limitations.

---

## 6. Research Integrity & Ethical Standards

- **No Hardcoded Metrics**: All performance scores (Accuracy, Precision, Recall, F1, Latency) are dynamically computed from actual train/test splits.
- **Explicit Simulation Tagging**: Quantum algorithms are clearly labeled as **Quantum Simulation** executed via Statevector mathematics.
- **Dataset Transparency**: Demonstration data is explicitly labeled as **Synthetic Demonstration Dataset**.
- **No Exaggerated Supremacy Claims**: Quantum kernel performance is compared objectively against classical equivalents on identical dimensionality manifolds.

---

## 7. Research Applications

- **Counter-UAS & Air Defense**: Detecting low-RCS rogue drones in urban terrain through micro-Doppler radar and thermal/optical imaging.
- **Autonomous Driving & Robotics**: Fusing 77 GHz radar and camera streams for all-weather object classification.
- **Maritime Surveillance**: Separating vessels from complex sea surface clutter reflections.
- **Smart Remote Sensing**: Airborne target tracking under smoke, fog, or RF jamming.

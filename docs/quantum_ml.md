# Quantum Machine Learning (QSVC & Quantum Kernel)

## 1. Theoretical Foundation

In Quantum Machine Learning for target classification, classical data vectors $\mathbf{x} \in \mathbb{R}^d$ are mapped into an exponentially large $2^n$-dimensional Hilbert space via a parameterized unitary circuit:
$$|\Phi(\mathbf{x})\rangle = U_{\Phi}(\mathbf{x})|0\rangle^{\otimes n}$$

### ZZ-Feature Map Architecture
The $ZZ$-Feature Map consists of Hadamard superposition gates followed by single-qubit phase rotations and two-qubit entangling gates:
$$U_{\Phi}(\mathbf{x}) = \left( \prod_{(j, k) \in E} \exp\left(i \phi_{jk}(\mathbf{x}) Z_j Z_k\right) \prod_{j=1}^n \exp\left(i \phi_j(\mathbf{x}) Z_j\right) H^{\otimes n} \right)^r$$
where:
- $\phi_j(\mathbf{x}) = x_j$
- $\phi_{jk}(\mathbf{x}) = (\pi - x_j)(\pi - x_k)$
- $r$ is the repetition count.

### Quantum Kernel Gram Matrix
The Quantum Kernel measures the transition fidelity (state overlap) between two encoded quantum states:
$$K_{ij} = \kappa(\mathbf{x}_i, \mathbf{x}_j) = |\langle \Phi(\mathbf{x}_i) | \Phi(\mathbf{x}_j) \rangle|^2$$

This kernel matrix is symmetric, positive semi-definite ($K \succeq 0$), and can be directly used as a precomputed Gram matrix in a dual-form Support Vector Classifier (QSVC).

### Simulation Mode
All quantum experiments are simulated via statevector linear algebra using Qiskit 2.5 and exact analytical projection.

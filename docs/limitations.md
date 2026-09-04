# Limitations & Future Research Directions

## 1. Known Technical Limitations

1. **Simulation Scalability**:
   - Quantum statevector simulation scales with $\mathcal{O}(2^n)$ in classical memory. Consequently, simulated experiments are practically bounded to $n \le 8$ qubits on classical workstations.
2. **Synchronized Multimodal Alignment**:
   - The current pipeline operates under the assumption of discrete temporal synchronization between RF packets and optical shutter frames.
3. **Synthetic Demonstration Data**:
   - While physically grounded with realistic micro-Doppler and optical texture distributions, real field deployments encounter arbitrary electromagnetic clutter, antenna polarization mismatches, and multi-emitter interference.

## 2. Future Scope
1. **NISQ Hardware Execution**: Deploying quantum circuits to physical IBM Quantum superconducting processors via Qiskit Runtime service.
2. **Continuous IQ Streaming**: Implementing real-time streaming Doppler spectrogram ingestion using Software-Defined Radios (SDR / USRP / RTL-SDR).
3. **Variational Quantum Classifiers (VQC)**: Exploring parameterized variational ansatzes trained via quantum natural gradients.

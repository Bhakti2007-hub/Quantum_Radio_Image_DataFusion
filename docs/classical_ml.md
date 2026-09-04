# Classical Machine Learning Baselines

## 1. Classifiers Implemented

1. **Random Forest Classifier (Ensemble)**:
   - Evaluates non-linear decision boundaries with $100$ estimators.
   - Computes Gini impurity feature importance rankings for RF and optical features.
   - Resilient against correlated features.

2. **Support Vector Classifier (SVC with RBF Kernel)**:
   - Maximizes margin in dual space using Radial Basis Function kernel:
     $$K(\mathbf{x}, \mathbf{x}') = \exp(-\gamma \Vert \mathbf{x} - \mathbf{x}' \Vert^2)$$
   - Calibrated probability estimates for multi-class confidence reporting.

3. **Regularized Logistic Regression (Linear Baseline)**:
   - L2-regularized multinomial logistic regression.
   - Provides a linear baseline to benchmark against non-linear classical and quantum feature maps.

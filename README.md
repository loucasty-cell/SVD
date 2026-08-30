# Chapter 7: Singular Value Decomposition (SVD) — Interactive Demo

An interactive, production-ready educational Streamlit application developed for the Linear Algebra course demonstration at the **University of Information Technology (UIT)**.

---

## ?? Key Features & Modules

### ?? Module 1: Bases & Fundamental Subspaces of SVD (Slide Section 7.2)
- **Explicit Step-by-Step Solver**: Calculates $A^TA$, $AA^T$, eigenvalues $\lambda_i$, singular values $\sigma_i = \sqrt{\lambda_i}$, right singular vectors $V$, and left singular vectors $U$ with step-by-step verification.
- **Rank-1 Matrix Expansion**: Visualizes $A = \sum_{i=1}^r \sigma_i u_i v_i^T$ via interactive Seaborn heatmap grids and cumulative convergence metrics.
- **Four Fundamental Subspaces**: Explicitly identifies and constructs orthonormal bases for $C(A)$, $N(A^T)$, $C(A^T)$, and $N(A)$, with automated verification of the **Rank-Nullity Theorem**.

### ?? Module 2: Geometry, Polar Decomposition & Pseudoinverse (Slide Section 7.4)
- **Geometric Transformation (Unit Circle $\to$ Ellipse)**: 3-stage visual breakdown showing $V^T x$ (Rotation/Reflection), $\Sigma V^T x$ (Stretching), and $U\Sigma V^T x = Ax$ (Final Rotation).
- **Spectral Norm**: Computes $\|A\|_2 = \sigma_1 = \max_{x \neq 0} \frac{\|Ax\|}{\|x\|}$.
- **Polar Decomposition ($A = QS$)**: Factors real matrices into orthogonal rotation/reflection $Q = UV^T$ and symmetric positive semidefinite stretch $S = V\Sigma V^T$.
- **Moore-Penrose Pseudoinverse ($A^+$)**: Evaluates $A^+ = V\Sigma^+ U^T$, verifies Penrose conditions $AA^+A = A$ and $A^+AA^+ = A^+$, computes projection matrices $AA^+$ and $A^+A$, and highlights special textbook cases (e.g., $A^+ = \frac{1}{4}A$).

### ??? Module 3: Image Processing & Low-Rank Compression
- **Low-Rank Image Approximation**: Computes $A_k = \sum_{i=1}^k \sigma_i u_i v_i^T$ with an interactive slider for rank $k \in [1, r]$.
- **Metrics Dashboard**: Displays real-time Storage Savings Ratio $\frac{k(m+n+1)}{mn}$ and Peak Signal-to-Noise Ratio (PSNR in dB).
- **Spectral Energy & Decay Analysis**: Semilog singular value decay plot and cumulative energy threshold table (50%, 75%, 90%, 95%, 99%).
- **Built-in Presets & File Uploader**: Comes with procedural grayscale presets (zero external files required) and supports custom user uploads (PNG/JPG/BMP).

---

## ?? Quick Start

### 1. Requirements
Ensure Python 3.10+ is installed. Install dependencies:
```bash
pip install -r requirements.txt
```

### 2. Run Application
Launch the Streamlit demo:
```bash
streamlit run app.py
```
Open **http://localhost:8501** in your browser.

---

## ?? Pre-loaded Textbook Presets
- **Example 1**: $A = \begin{bmatrix} 3 & 0 \\ 4 & 5 \end{bmatrix}$ ($\sigma_1 = \sqrt{45}, \sigma_2 = \sqrt{5}$, Polar Decomposition $Q, S$)
- **Example 2a**: $A = \begin{bmatrix} 0 & 4 \\ 0 & 0 \end{bmatrix}$ (Rank-1 deficient)
- **Example 2b**: $A = \begin{bmatrix} 0 & 4 \\ 1 & 0 \end{bmatrix}$ (Problem Set 1)
- **Example 3**: $A = \begin{bmatrix} 2 & 2 \\ -1 & 1 \end{bmatrix}$ (Problem Set 2)
- **Example 4**: $A = \begin{bmatrix} 1 & 1 \\ 1 & 1 \end{bmatrix}$ (Rank-1 non-invertible, Pseudoinverse $A^+ = \frac{1}{4}A$)

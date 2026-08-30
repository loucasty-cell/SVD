"""
SVD Chapter 7 -- Interactive Demo Application
University of Information Technology (UIT)
"""

import warnings
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.linalg import polar
from PIL import Image
import streamlit as st

warnings.filterwarnings("ignore")

st.set_page_config(
    page_title="SVD Demo -- Chapter 7 | UIT",
    page_icon="U+1F522",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
    <style>
    .main-header {
        background: linear-gradient(135deg, #1a3a5c 0%, #0d6e6e 100%);
        padding: 1.2rem 2rem; border-radius: 10px;
        margin-bottom: 1.5rem; color: white;
    }
    .main-header h1 { margin:0; font-size:1.9rem; font-weight:700; }
    .main-header p  { margin:.3rem 0 0; opacity:.85; font-size:.95rem; }
    div[data-testid="metric-container"] {
        background:#f0f4f8; border-left:4px solid #0d6e6e;
        border-radius:6px; padding:.5rem 1rem;
    }
    .badge-ok  { color:#1a7a1a; font-weight:700; font-size:1.05rem; }
    .badge-err { color:#c0392b; font-weight:700; font-size:1.05rem; }
    </style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────
# MATH FUNCTIONS
# ─────────────────────────────────────────────────────

_EPS = 1e-10
PALETTE = {
    "dark_blue": "#1a3a5c", "teal": "#0d6e6e",
    "orange": "#e07b39",    "red": "#c0392b",
    "green": "#27ae60",
}


def compute_svd_stepwise(A):
    A = A.astype(float)
    m, n = A.shape
    ATA = A.T @ A
    AAT = A @ A.T
    eig_vals_raw, V_raw = np.linalg.eigh(ATA)
    idx = np.argsort(eig_vals_raw)[::-1]
    eig_vals = eig_vals_raw[idx]
    V = V_raw[:, idx]
    sigma_all = np.sqrt(np.maximum(eig_vals, 0.0))
    rank = int(np.sum(sigma_all > _EPS))
    U = np.zeros((m, m))
    for i in range(rank):
        U[:, i] = A @ V[:, i] / sigma_all[i]
    if m > rank:
        rng = np.random.default_rng(42)
        Q_full, _ = np.linalg.qr(
            np.hstack([U[:, :rank], rng.standard_normal((m, m - rank))])
        )
        U = Q_full
        for i in range(rank):
            if np.dot(U[:, i], A @ V[:, i]) < 0:
                U[:, i] *= -1
    Sigma_mat = np.zeros((m, n))
    for i in range(min(m, n, rank)):
        Sigma_mat[i, i] = sigma_all[i]
    Vt = V.T
    recon_err = float(np.linalg.norm(A - U @ Sigma_mat @ Vt, "fro"))
    rank1 = [sigma_all[i] * np.outer(U[:, i], Vt[i, :]) for i in range(rank)]
    return {
        "A": A, "m": m, "n": n,
        "ATA": ATA, "AAT": AAT,
        "eigenvalues_ATA": eig_vals,
        "singular_values": sigma_all,
        "rank": rank,
        "V": V, "U": U, "Sigma_mat": Sigma_mat, "Vt": Vt,
        "reconstruction_error": recon_err,
        "rank1_components": rank1,
        "subspaces": {
            "col_space": U[:, :rank],
            "left_null": U[:, rank:],
            "row_space": V[:, :rank],
            "null_space": V[:, rank:],
        },
    }


def rank_k_approximation(U, sigma, Vt, k):
    m, n = U.shape[0], Vt.shape[1]
    Ak = np.zeros((m, n))
    for i in range(k):
        Ak += sigma[i] * np.outer(U[:, i], Vt[i, :])
    return Ak


def compute_polar_decomposition(U, sigma, V):
    Vt = V.T
    Q = U @ Vt
    k = min(V.shape[1], len(sigma))
    S_sym = V[:, :k] @ np.diag(sigma[:k]) @ Vt[:k, :]
    Sig_rect = np.zeros((U.shape[0], V.shape[0]))
    for i in range(min(U.shape[0], V.shape[0], len(sigma))):
        Sig_rect[i, i] = sigma[i]
    A_r = U @ Sig_rect @ Vt
    qs_err = float(np.linalg.norm(Q @ S_sym - A_r, "fro"))
    det_Q = float(np.linalg.det(Q)) if Q.shape[0] == Q.shape[1] else 0.0
    return {"Q": Q, "S": S_sym, "det_Q": det_Q, "QS_error": qs_err}


def compute_pseudoinverse(U, sigma, Vt, m, n):
    sigma_plus = np.where(sigma > _EPS, 1.0 / sigma, 0.0)
    Sig_plus = np.zeros((n, m))
    for i in range(min(m, n, len(sigma_plus))):
        Sig_plus[i, i] = sigma_plus[i]
    V = Vt.T
    A_plus = V @ Sig_plus @ U.T
    Sig_rect = np.zeros((m, n))
    for i in range(min(m, n, len(sigma))):
        Sig_rect[i, i] = sigma[i]
    A = U @ Sig_rect @ Vt
    proj_col = A @ A_plus
    proj_row = A_plus @ A
    err1 = float(np.linalg.norm(A @ A_plus @ A - A, "fro"))
    err2 = float(np.linalg.norm(A_plus @ A @ A_plus - A_plus, "fro"))
    return {
        "A_plus": A_plus, "Sigma_plus": Sig_plus,
        "proj_col": proj_col, "proj_row": proj_row,
        "err_prop1": err1, "err_prop2": err2,
    }


def compression_ratio(m, n, k):
    return k * (m + n + 1) / (m * n)


def psnr(original, compressed):
    mse = np.mean((original.astype(float) - compressed.astype(float)) ** 2)
    if mse < 1e-12:
        return float("inf")
    return 20 * np.log10(255.0 / np.sqrt(mse))


# ─────────────────────────────────────────────────────
# PLOT FUNCTIONS
# ─────────────────────────────────────────────────────


def plot_svd_geometry(svd):
    U  = svd["U"][:2, :2]
    S2 = svd["Sigma_mat"][:2, :2]
    Vt2 = svd["Vt"][:2, :2]
    sig = svd["singular_values"][:2]
    theta = np.linspace(0, 2 * np.pi, 400)
    circle = np.array([np.cos(theta), np.sin(theta)])
    s1 = Vt2 @ circle
    s2 = S2  @ s1
    s3 = U   @ s2
    fig = plt.figure(figsize=(15, 5), facecolor="white")
    axes = fig.subplots(1, 3)
    titles = [
        r"Stage 1: $V^T x$ (Rotation/Reflection)",
        r"Stage 2: $\Sigma V^T x$ (Stretching)",
        r"Stage 3: $U\Sigma V^T x = Ax$ (Final Rotation)",
    ]
    clrs  = [PALETTE["orange"], PALETTE["teal"], PALETTE["dark_blue"]]
    stages = [s1, s2, s3]
    v1c = Vt2[:, 0]; v2c = Vt2[:, 1]
    u1c = U[:, 0];   u2c = U[:, 1]
    for idx, (ax, stage, title, color) in enumerate(zip(axes, stages, titles, clrs)):
        ax.set_facecolor("#f9f9f9")
        ax.axhline(0, color="gray", lw=0.5, ls="--")
        ax.axvline(0, color="gray", lw=0.5, ls="--")
        ax.plot(stage[0], stage[1], color=color, lw=2)
        ax.fill(stage[0], stage[1], color=color, alpha=0.08)
        if idx == 0:
            for vec, lbl, c in [(Vt2 @ v1c, r"$V^T v_1$", PALETTE["dark_blue"]),
                                 (Vt2 @ v2c, r"$V^T v_2$", PALETTE["red"])]:
                ax.annotate("", xy=vec, xytext=(0,0),
                            arrowprops=dict(arrowstyle="->", color=c, lw=2))
                if np.linalg.norm(vec) > 0.05:
                    ax.text(*(vec * 1.2), lbl, color=c, fontsize=9, ha="center")
        elif idx == 1:
            for vec, lbl, c in [
                (S2 @ Vt2 @ v1c, rf"$\sigma_1={sig[0]:.2f}$", PALETTE["dark_blue"]),
                (S2 @ Vt2 @ v2c, rf"$\sigma_2={sig[1]:.2f}$" if len(sig)>1 else "", PALETTE["red"]),
            ]:
                if np.linalg.norm(vec) > 0.01:
                    ax.annotate("", xy=vec, xytext=(0,0),
                                arrowprops=dict(arrowstyle="->", color=c, lw=2))
                    ax.text(vec[0]*1.15, vec[1]*1.15, lbl, color=c, fontsize=9, ha="center")
        else:
            for val, u, lbl, c in [
                (sig[0], u1c, r"$\sigma_1 u_1$", PALETTE["dark_blue"]),
                (sig[1] if len(sig)>1 else 0, u2c, r"$\sigma_2 u_2$", PALETTE["red"]),
            ]:
                if val > 0.01:
                    vec = val * u
                    ax.annotate("", xy=vec, xytext=(0,0),
                                arrowprops=dict(arrowstyle="->", color=c, lw=2))
                    ax.text(vec[0]*1.15, vec[1]*1.15, lbl, color=c, fontsize=9, ha="center")
        ax.set_title(title, fontsize=10, pad=8, fontweight="bold")
        ax.set_aspect("equal")
        lim = max(1.6, np.max(np.abs(stage)) * 1.3) if stage.size > 0 else 1.6
        ax.set_xlim(-lim, lim); ax.set_ylim(-lim, lim)
        ax.grid(True, alpha=0.3)
    fig.suptitle("Geometric Action of SVD: Unit Circle to Ellipse",
                 fontsize=13, fontweight="bold", y=1.02)
    fig.tight_layout()
    return fig


def plot_singular_value_decay(sigma, rank):
    sig = sigma[:rank] if rank > 0 else sigma
    if len(sig) == 0:
        fig, ax = plt.subplots(1, 1, figsize=(6,3))
        ax.text(0.5, 0.5, "No singular values", ha="center", va="center")
        return fig
    idx = np.arange(1, len(sig) + 1)
    energy = np.cumsum(sig**2) / (np.sum(sig**2) + 1e-12)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4.5), facecolor="white")
    ax1.bar(idx, sig, color=PALETTE["teal"], edgecolor="white", alpha=0.85)
    ax1.set_yscale("log")
    ax1.set_xlabel("Index i", fontsize=11)
    ax1.set_ylabel("Singular value (log scale)", fontsize=11)
    ax1.set_title("Singular Value Decay", fontsize=12, fontweight="bold")
    if len(idx) <= 20: ax1.set_xticks(idx)
    ax1.grid(True, axis="y", alpha=0.4)
    ax2.plot(idx, energy*100, "o-", color=PALETTE["dark_blue"], lw=2, markersize=5)
    for thresh, col, lbl in [(0.90, PALETTE["green"], "90%"),
                              (0.95, PALETTE["orange"], "95%"),
                              (0.99, PALETTE["red"],    "99%")]:
        ax2.axhline(thresh*100, color=col, ls="--", lw=1.4, label=lbl)
    ax2.set_xlabel("Rank k", fontsize=11)
    ax2.set_ylabel("Cumulative Energy (%)", fontsize=11)
    ax2.set_title("Cumulative Energy Captured", fontsize=12, fontweight="bold")
    if len(idx) <= 20: ax2.set_xticks(idx)
    ax2.set_ylim(0, 105)
    ax2.legend(title="Threshold", fontsize=9)
    ax2.grid(True, alpha=0.4)
    fig.tight_layout()
    return fig


def plot_rank1_heatmaps(svd):
    comps = svd["rank1_components"]
    r = len(comps)
    A = svd["A"]
    if r == 0:
        fig, ax = plt.subplots(figsize=(4,3))
        ax.text(0.5, 0.5, "Zero matrix", ha="center", va="center")
        return fig
    ncols = min(r + 1, 5)
    fig, axes = plt.subplots(1, ncols, figsize=(ncols*3, 3.5), facecolor="white")
    if ncols == 1: axes = [axes]
    vmax = max(np.max(np.abs(A)), 0.01)
    do_annot = A.shape[0] <= 5
    for i in range(min(r, ncols-1)):
        sns.heatmap(comps[i], ax=axes[i], cmap="RdBu_r", center=0,
                    vmin=-vmax, vmax=vmax, annot=do_annot, fmt=".2f",
                    cbar=False, linewidths=0.5)
        lbl = f"sigma_{i+1} * u_{i+1} * v_{i+1}^T"
        axes[i].set_title(lbl, fontsize=9)
        axes[i].set_xticks([]); axes[i].set_yticks([])
    sns.heatmap(A, ax=axes[-1], cmap="RdBu_r", center=0,
                vmin=-vmax, vmax=vmax, annot=do_annot, fmt=".2f",
                cbar=True, linewidths=0.5)
    axes[-1].set_title("A  (full sum)", fontsize=10, color=PALETTE["dark_blue"])
    axes[-1].set_xticks([]); axes[-1].set_yticks([])
    fig.suptitle("Rank-1 Decomposition Components", fontsize=12, fontweight="bold")
    fig.tight_layout()
    return fig


def plot_image_comparison(original, compressed, k, ratio, psnr_val):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5), facecolor="white")
    ax1.imshow(np.clip(original,0,255), cmap="gray", vmin=0, vmax=255)
    ax1.set_title(f"Original  {original.shape[0]}x{original.shape[1]}", fontsize=12)
    ax1.axis("off")
    psnr_str = f"{psnr_val:.1f} dB" if not np.isinf(psnr_val) else "inf dB"
    ax2.imshow(np.clip(compressed,0,255), cmap="gray", vmin=0, vmax=255)
    ax2.set_title(f"Rank-{k}  |  Ratio={ratio:.3f}  PSNR={psnr_str}", fontsize=12)
    ax2.axis("off")
    fig.tight_layout()
    return fig


# ─────────────────────────────────────────────────────
# UI HELPERS
# ─────────────────────────────────────────────────────

PRESETS = {
    "Example 1 -- Slide 7.2 & 7.4 (sigma=sqrt(45), sqrt(5))":
        np.array([[3., 0.], [4., 5.]]),
    "Example 2a -- PS1  [[0,4],[0,0]]":
        np.array([[0., 4.], [0., 0.]]),
    "Example 2b -- PS1  [[0,4],[1,0]]":
        np.array([[0., 4.], [1., 0.]]),
    "Example 3 -- PS2  [[2,2],[-1,1]]":
        np.array([[2., 2.], [-1., 1.]]),
    "Example 4 -- Rank-1 / Pseudoinverse  [[1,1],[1,1]]":
        np.array([[1., 1.], [1., 1.]]),
    "Custom Matrix": None,
}

SAMPLE_IMAGES = {
    "Checkerboard (64x64)": "checkerboard",
    "Gradient (128x128)":   "gradient",
    "Random Texture (64x64)": "texture",
}


def make_sample_image(name):
    if name == "checkerboard":
        block = np.kron([[1,0]*4, [0,1]*4]*4, np.ones((4,4))) * 220
        return np.clip(block[:64, :64], 0, 255).astype(float)
    elif name == "gradient":
        x = np.linspace(0, 255, 128)
        return (np.outer(x, x) / 255.0).astype(float)
    else:
        rng = np.random.default_rng(0)
        base = rng.integers(80, 180, (8, 8)).astype(np.uint8)
        img = Image.fromarray(base).resize((64, 64), Image.NEAREST)
        return np.array(img, dtype=float)


def matrix_input_widget(rows, cols, default, key_prefix):
    data = []
    for r in range(rows):
        row_cols = st.columns(cols)
        row_vals = []
        for c in range(cols):
            dv = float(default[r, c]) if r < default.shape[0] and c < default.shape[1] else 0.0
            val = row_cols[c].number_input(
                f"[{r},{c}]", value=dv, step=0.5, format="%.4f",
                label_visibility="collapsed",
                key=f"{key_prefix}_r{r}c{c}",
            )
            row_vals.append(val)
        data.append(row_vals)
    return np.array(data, dtype=float)


def display_matrix_latex(M, name="M", dp=4):
    M_r = np.round(M, dp)
    rows_str = r" \\ ".join(
        " & ".join(f"{v:.{dp}f}" for v in row) for row in M_r
    )
    st.latex(rf"{name} = \begin{{bmatrix}} {rows_str} \end{{bmatrix}}")


def display_matrix_table(M, label="", dp=4):
    import pandas as pd
    df = pd.DataFrame(
        np.round(M, dp),
        index=[f"r{i+1}" for i in range(M.shape[0])],
        columns=[f"c{j+1}" for j in range(M.shape[1])],
    )
    if label: st.caption(label)
    st.dataframe(df, use_container_width=True)


def badge(ok, extra=""):
    if ok:
        return f'<span class="badge-ok">OK {extra}</span>'
    return f'<span class="badge-err">FAIL {extra}</span>'


# ─────────────────────────────────────────────────────
# MAIN APP
# ─────────────────────────────────────────────────────


def main():
    import pandas as pd

    st.markdown(
        '''<div class="main-header">
          <h1>&#128290; Chapter 7: Singular Value Decomposition</h1>
          <p>Interactive Demo &nbsp;|&nbsp; University of Information Technology (UIT)
             &nbsp;|&nbsp; Linear Algebra</p>
        </div>''',
        unsafe_allow_html=True,
    )

    with st.sidebar:
        st.markdown("### Matrix Input")
        preset_name = st.selectbox("Quick Preset", list(PRESETS.keys()), index=0)
        default_A = PRESETS[preset_name] if PRESETS[preset_name] is not None else np.eye(2)
        st.markdown("---")
        c1, c2 = st.columns(2)
        rows   = c1.selectbox("Rows (m)", [2,3,4,5], index=0, key="dim_rows")
        cols_n = c2.selectbox("Cols (n)", [2,3,4,5], index=0, key="dim_cols")
        A_default = np.zeros((rows, cols_n))
        r_min = min(rows, default_A.shape[0])
        c_min = min(cols_n, default_A.shape[1])
        A_default[:r_min, :c_min] = default_A[:r_min, :c_min]
        st.markdown("**Edit Matrix A**")
        A_input = matrix_input_widget(rows, cols_n, A_default, "mat")
        st.markdown("---")
        compute_btn = st.button("Compute SVD", type="primary", use_container_width=True)
        if compute_btn or "svd_result" not in st.session_state:
            with st.spinner("Computing..."):
                st.session_state["svd_result"] = compute_svd_stepwise(A_input)
                st.session_state["A_input"]    = A_input
        svd = st.session_state["svd_result"]
        A   = st.session_state["A_input"]
        st.markdown("---")
        st.markdown("**Summary**")
        st.metric("Shape",  f"{svd['m']} x {svd['n']}")
        st.metric("Rank",   svd["rank"])
        st.metric("||A||2 = sigma1",
                  f"{svd['singular_values'][0]:.4f}" if svd["rank"] > 0 else "0")
        st.metric("Recon. Error", f"{svd['reconstruction_error']:.2e}")

    tab1, tab2, tab3 = st.tabs([
        "Module 1 -- SVD and Subspaces",
        "Module 2 -- Geometry and Pseudoinverse",
        "Module 3 -- Image Compression",
    ])

    # ════════════ TAB 1 ════════════
    with tab1:
        st.subheader("Module 1: Bases and Fundamental Subspaces of SVD")

        with st.expander("Step 1: Compute A^T A and A A^T", expanded=True):
            st.latex(r"A^T A \in \mathbb{R}^{n \times n} \qquad A A^T \in \mathbb{R}^{m \times m}")
            c1, c2, c3 = st.columns(3)
            with c1:
                st.markdown("**Matrix A**")
                display_matrix_latex(A, "A")
                display_matrix_table(A, f"A ({svd['m']}x{svd['n']})")
            with c2:
                st.markdown("**A^T A**")
                display_matrix_latex(svd["ATA"], "A^T A")
                display_matrix_table(svd["ATA"], f"ATA ({svd['n']}x{svd['n']})")
            with c3:
                st.markdown("**A A^T**")
                display_matrix_latex(svd["AAT"], "A A^T")
                display_matrix_table(svd["AAT"], f"AAT ({svd['m']}x{svd['m']})")

        with st.expander("Step 2: Eigenvalues to Singular Values", expanded=True):
            st.latex(r"A^T A v_i = \lambda_i v_i \qquad \sigma_i = \sqrt{\lambda_i} \geq 0")
            evals = svd["eigenvalues_ATA"]
            svals = svd["singular_values"]
            df_sv = pd.DataFrame({
                "i": range(1, len(evals)+1),
                "lambda_i = eig(ATA)": np.round(evals, 6),
                "sigma_i = sqrt(lambda_i)": np.round(svals, 6),
                "Non-zero?": ["Yes" if s > _EPS else "Zero" for s in svals],
            }).set_index("i")
            st.dataframe(df_sv, use_container_width=True)
            st.info(f"Rank(A) = {svd['rank']}")

        with st.expander("Step 3: Right Singular Vectors V (eigenvectors of A^T A)", expanded=True):
            st.latex(r"A^T A v_i = \lambda_i v_i \Rightarrow V = [v_1 | \cdots | v_n]")
            c1, c2 = st.columns(2)
            with c1: display_matrix_latex(svd["V"], "V")
            with c2: display_matrix_table(svd["V"], f"V ({svd['n']}x{svd['n']})")
            oe = np.linalg.norm(svd["Vt"] @ svd["V"] - np.eye(svd["n"]), "fro")
            ok = oe < 1e-8
            st.markdown(f"Orthonormality ||V^TV - I||_F = {oe:.2e}  " + badge(ok, "VTV=I"),
                        unsafe_allow_html=True)

        with st.expander("Step 4: Left Singular Vectors U (via u_i = A v_i / sigma_i)", expanded=True):
            st.latex(r"u_i = \frac{A v_i}{\sigma_i}, \quad i = 1, \ldots, r")
            c1, c2 = st.columns(2)
            with c1: display_matrix_latex(svd["U"], "U")
            with c2: display_matrix_table(svd["U"], f"U ({svd['m']}x{svd['m']})")
            if svd["rank"] > 0:
                rows_ver = []
                for i in range(svd["rank"]):
                    ui_c = A @ svd["V"][:, i] / svd["singular_values"][i]
                    err  = np.linalg.norm(np.abs(ui_c) - np.abs(svd["U"][:, i]))
                    rows_ver.append({
                        "i": i+1,
                        "sigma_i": round(svd["singular_values"][i], 6),
                        "||A v_i/s_i - u_i||": f"{err:.2e}",
                        "Match?": "Yes" if err < 1e-8 else "No",
                    })
                st.dataframe(pd.DataFrame(rows_ver).set_index("i"), use_container_width=True)
            ue = np.linalg.norm(svd["U"] @ svd["U"].T - np.eye(svd["m"]), "fro")
            st.markdown(f"Orthonormality ||UU^T - I||_F = {ue:.2e}  " + badge(ue < 1e-8, "UUT=I"),
                        unsafe_allow_html=True)

        with st.expander("Step 5: Full Sigma and Verification A = U Sigma V^T", expanded=True):
            st.latex(r"A = U \Sigma V^T \qquad \Sigma_{ii} = \sigma_i")
            A_recon = svd["U"] @ svd["Sigma_mat"] @ svd["Vt"]
            c1, c2, c3 = st.columns(3)
            with c1:
                st.markdown("**Sigma**")
                display_matrix_latex(svd["Sigma_mat"], r"\Sigma")
                display_matrix_table(svd["Sigma_mat"], f"Sigma ({svd['m']}x{svd['n']})")
            with c2:
                st.markdown("**U Sigma V^T (Reconstruction)**")
                display_matrix_latex(A_recon, r"U\Sigma V^T")
                display_matrix_table(A_recon, "Reconstructed A")
            with c3:
                st.markdown("**Error A - U Sigma V^T (should be ~0)**")
                display_matrix_table(A - A_recon, "Difference")
            err = svd["reconstruction_error"]
            st.markdown(f"Frobenius error ||A - USigmaVT||_F = {err:.2e}  " + badge(err < 1e-8, "A=USigmaVT"),
                        unsafe_allow_html=True)

        st.divider()
        st.markdown("### 1.2 -- Rank-1 Matrix Expansion")
        st.latex(r"A = \sum_{i=1}^{r} \sigma_i \, u_i \, v_i^T")
        if svd["rank"] == 0:
            st.warning("Zero matrix -- no rank-1 components.")
        else:
            fig_r1 = plot_rank1_heatmaps(svd)
            st.pyplot(fig_r1, use_container_width=True); plt.close(fig_r1)
            sigma_all = svd["singular_values"]
            r = svd["rank"]
            rows_cum = []
            A_cum = np.zeros_like(A)
            for i in range(r):
                A_cum = A_cum + svd["rank1_components"][i]
                rows_cum.append({
                    "k": i+1,
                    "||A_k - A||_F": f"{np.linalg.norm(A_cum - A):.8f}",
                    "Energy %": f"{np.sum(sigma_all[:i+1]**2)/np.sum(sigma_all[:r]**2)*100:.2f}",
                })
            st.markdown("**Cumulative Convergence:**")
            st.dataframe(pd.DataFrame(rows_cum).set_index("k"), use_container_width=True)

        st.divider()
        st.markdown("### 1.3 -- Four Fundamental Subspaces")
        st.latex(r"\mathbb{R}^n = C(A^T) \oplus N(A) \qquad \mathbb{R}^m = C(A) \oplus N(A^T)")
        sub = svd["subspaces"]
        sub_info = [
            ("col_space",  "Column Space C(A)",   "u_1,...,u_r"),
            ("left_null",  "Left Nullspace N(A^T)", "u_{r+1},...,u_m"),
            ("row_space",  "Row Space C(A^T)",     "v_1,...,v_r"),
            ("null_space", "Nullspace N(A)",        "v_{r+1},...,v_n"),
        ]
        c4 = st.columns(4)
        for col_w, (key, name, basis) in zip(c4, sub_info):
            M = sub[key]
            with col_w:
                st.markdown(f"**{name}**")
                st.caption(f"Basis: {basis}")
                if M.shape[1] == 0:
                    st.info("Trivial (dim = 0)")
                    st.metric("Dimension", 0)
                else:
                    st.metric("Dimension", M.shape[1])
                    display_matrix_table(M)
        dim_c  = sub["col_space"].shape[1]
        dim_nl = sub["null_space"].shape[1]
        ok_rn  = dim_c + dim_nl == svd["n"]
        st.markdown(
            f"**Rank-Nullity:** rank + nullity = {dim_c} + {dim_nl} = {dim_c+dim_nl} = n = {svd['n']}  "
            + badge(ok_rn), unsafe_allow_html=True)

    # ════════════ TAB 2 ════════════
    with tab2:
        st.subheader("Module 2: Geometry, Polar Decomposition and Pseudoinverse")

        st.markdown("### 2.1 -- Unit Circle to Ellipse Geometric Transformation")
        st.latex(r"x \xrightarrow{V^T} V^T x \xrightarrow{\Sigma} \Sigma V^T x \xrightarrow{U} Ax")
        if svd["m"] < 2 or svd["n"] < 2:
            st.warning("Need at least 2x2 matrix for geometry.")
        else:
            sigma = svd["singular_values"]
            mc1, mc2, mc3 = st.columns(3)
            mc1.metric("sigma_1 (max stretch)", f"{sigma[0]:.4f}")
            if len(sigma) > 1: mc2.metric("sigma_2", f"{sigma[1]:.4f}")
            mc3.metric("||A||_2 = sigma_1", f"{sigma[0]:.4f}")
            fig_geo = plot_svd_geometry(svd)
            st.pyplot(fig_geo, use_container_width=True); plt.close(fig_geo)
            st.latex(r"\|A\|_2 = \sigma_1 = \max_{x \neq 0} \frac{\|Ax\|}{\|x\|}")
            st.caption("Unit circle maps to an ellipse with semi-axes sigma_1*u_1, sigma_2*u_2.")

        st.divider()
        st.markdown("### 2.2 -- Polar Decomposition A = Q S")
        st.latex(r"Q = UV^T \;(\text{orthogonal}) \qquad S = V\Sigma V^T \;(\text{symmetric PSD})")
        if svd["m"] != svd["n"]:
            st.info("Non-square: using scipy.linalg.polar.")
            try:
                Q_p, S_p = polar(A, side="right")
                pd_res = {
                    "Q": Q_p, "S": S_p,
                    "det_Q": float(np.linalg.det(Q_p)) if Q_p.shape[0]==Q_p.shape[1] else 0.0,
                    "QS_error": float(np.linalg.norm(Q_p @ S_p - A, "fro")),
                }
            except Exception as e:
                st.error(str(e))
                pd_res = compute_polar_decomposition(svd["U"], svd["singular_values"], svd["V"])
        else:
            pd_res = compute_polar_decomposition(svd["U"], svd["singular_values"], svd["V"])
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("**Q = U V^T  (Orthogonal)**")
            display_matrix_latex(pd_res["Q"], "Q")
            display_matrix_table(pd_res["Q"])
            dq = pd_res["det_Q"]
            kind = "pure rotation" if abs(dq-1.0)<1e-8 else "rotation + reflection"
            st.caption(f"det(Q) = {dq:.4f}  => {kind}")
        with c2:
            st.markdown("**S = V Sigma V^T  (Symmetric PSD)**")
            display_matrix_latex(pd_res["S"], "S")
            display_matrix_table(pd_res["S"])
            eigs_S = np.linalg.eigvalsh(pd_res["S"])
            psd_ok = bool(np.all(eigs_S > -1e-8))
            st.caption(f"Eigenvalues of S: {np.round(np.sort(eigs_S)[::-1], 4)}  {'PSD OK' if psd_ok else 'FAIL'}")
        qs_err = pd_res["QS_error"]
        st.markdown(f"Verification ||QS - A||_F = {qs_err:.2e}  " + badge(qs_err<1e-8, "A=QS"),
                    unsafe_allow_html=True)

        st.divider()
        st.markdown("### 2.3 -- Moore-Penrose Pseudoinverse A+")
        st.latex(r"A^+ = V\Sigma^+ U^T \qquad \Sigma^+_{ii} = 1/\sigma_i \;(\text{if } \sigma_i \neq 0)")
        pi_res = compute_pseudoinverse(svd["U"], svd["singular_values"], svd["Vt"], svd["m"], svd["n"])
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("**Sigma+ (inverted diagonal)**")
            display_matrix_latex(pi_res["Sigma_plus"], r"\Sigma^+")
            display_matrix_table(pi_res["Sigma_plus"], f"Sigma+ ({svd['n']}x{svd['m']})")
        with c2:
            st.markdown("**A+ = V Sigma+ U^T**")
            display_matrix_latex(pi_res["A_plus"], "A^+")
            display_matrix_table(pi_res["A_plus"], f"A+ ({svd['n']}x{svd['m']})")
        v1_ok = pi_res["err_prop1"] < 1e-8
        v2_ok = pi_res["err_prop2"] < 1e-8
        c1, c2 = st.columns(2)
        with c1:
            st.latex(r"(1)\quad A A^+ A = A")
            st.markdown(f"||AA+A - A||_F = {pi_res['err_prop1']:.2e}  " + badge(v1_ok),
                        unsafe_allow_html=True)
        with c2:
            st.latex(r"(2)\quad A^+ A A^+ = A^+")
            st.markdown(f"||A+AA+ - A+||_F = {pi_res['err_prop2']:.2e}  " + badge(v2_ok),
                        unsafe_allow_html=True)
        st.markdown("**Projection Matrices:**")
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("$AA^+$ -- projects onto C(A)")
            display_matrix_latex(pi_res["proj_col"], "AA^+")
            display_matrix_table(pi_res["proj_col"])
        with c2:
            st.markdown("$A^+A$ -- projects onto C(A^T)")
            display_matrix_latex(pi_res["proj_row"], "A^+A")
            display_matrix_table(pi_res["proj_row"])
        if svd["m"]==2 and svd["n"]==2 and np.allclose(A, np.ones((2,2))):
            st.success("Special Case Example 4: A+ = (1/4) A")
            st.latex(r"A^+ = \frac{1}{4}A")
            is_q = np.allclose(pi_res["A_plus"], A/4, atol=1e-8)
            st.markdown(f"Verified A+ = A/4:  " + badge(is_q), unsafe_allow_html=True)

    # ════════════ TAB 3 ════════════
    with tab3:
        st.subheader("Module 3: Image Processing and Low-Rank SVD Compression")
        st.latex(r"A = U\Sigma V^T \;\Rightarrow\; A_k = \sum_{i=1}^k \sigma_i u_i v_i^T")
        st.markdown("### 3.0 -- Image Source")
        img_source = st.radio("Image source:", ["Built-in sample", "Upload image"], horizontal=True)
        img_gray = None
        if img_source == "Built-in sample":
            sample_key = st.selectbox("Select sample", list(SAMPLE_IMAGES.keys()))
            img_gray = make_sample_image(SAMPLE_IMAGES[sample_key])
        else:
            uploaded = st.file_uploader("Upload (PNG/JPG/BMP)", type=["png","jpg","jpeg","bmp"])
            if uploaded:
                img_gray = np.array(Image.open(uploaded).convert("L"), dtype=float)
            else:
                st.info("Please upload or switch to built-in sample.")
        if img_gray is None:
            st.stop()
        img_gray = np.clip(img_gray, 0, 255)
        m_img, n_img = img_gray.shape
        st.caption(f"Image: {m_img} x {n_img} grayscale pixels")
        img_id = (img_gray.shape, float(img_gray.sum()))
        if st.session_state.get("img_id") != img_id:
            with st.spinner("Computing SVD of image..."):
                U_img, S_img, Vt_img = np.linalg.svd(img_gray, full_matrices=False)
                st.session_state["img_svd"] = (U_img, S_img, Vt_img)
                st.session_state["img_id"]  = img_id
        U_img, S_img, Vt_img = st.session_state["img_svd"]
        r_img = int(np.sum(S_img > _EPS))
        st.markdown("### 3.1 -- Rank-k Approximation")
        k_max = min(r_img, min(m_img, n_img))
        if k_max == 0:
            st.error("Zero-rank image."); st.stop()
        k = st.slider("Rank k:", 1, k_max, min(20, k_max))
        Ak  = rank_k_approximation(U_img, S_img, Vt_img, k)
        Ak_c = np.clip(Ak, 0, 255)
        ratio  = compression_ratio(m_img, n_img, k)
        psnr_v = psnr(img_gray, Ak_c)
        mc1, mc2, mc3, mc4 = st.columns(4)
        mc1.metric("Rank k", k)
        mc2.metric("Compression Ratio", f"{ratio:.4f}")
        mc3.metric("Storage Saved", f"{(1-ratio)*100:.1f}%")
        mc4.metric("PSNR", f"{psnr_v:.1f} dB" if not np.isinf(psnr_v) else "inf dB")
        fig_img = plot_image_comparison(img_gray, Ak_c, k, ratio, psnr_v)
        st.pyplot(fig_img, use_container_width=True); plt.close(fig_img)
        st.latex(
            rf"\text{{Compression Ratio}} = \frac{{k(m+n+1)}}{{mn}} = "
            rf"\frac{{{k}({m_img}+{n_img}+1)}}{{{m_img}\times{n_img}}} = {ratio:.4f}"
        )
        st.divider()
        st.markdown("### 3.2 -- Singular Value Decay and Energy Analysis")
        n_disp = min(r_img, 100)
        fig_decay = plot_singular_value_decay(S_img[:n_disp], n_disp)
        st.pyplot(fig_decay, use_container_width=True); plt.close(fig_decay)
        st.caption(f"Showing first {n_disp} of {r_img} singular values.")
        cum_energy = np.cumsum(S_img**2) / (np.sum(S_img**2) + 1e-12)
        rows_thr = []
        for t in [0.50, 0.75, 0.90, 0.95, 0.99]:
            k_t = int(np.searchsorted(cum_energy, t)) + 1
            r_t = compression_ratio(m_img, n_img, k_t)
            rows_thr.append({
                "Energy Threshold": f"{t*100:.0f}%",
                "Min Rank k": k_t,
                "Compression Ratio": f"{r_t:.4f}",
                "Storage Saved": f"{(1-r_t)*100:.1f}%",
            })
        st.markdown("**Rank Required for Each Energy Threshold:**")
        st.dataframe(pd.DataFrame(rows_thr).set_index("Energy Threshold"),
                     use_container_width=True)


if __name__ == "__main__":
    main()
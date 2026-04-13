"""
Poster chart generator — SD Crack Classification
Run this after executing CrackClassification.ipynb to get MobileNetV2 results.

STEP 1: Fill in your MobileNetV2 results below (printed by cells 18 & 20 of the notebook).
STEP 2: Run:  python generate_charts.py
STEP 3: Charts saved to poster_figures/
"""

import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec

os.makedirs("poster_figures", exist_ok=True)

# ── PASTE YOUR MOBILENETV2 RESULTS HERE ─────────────────────────────────────
# (printed by notebook Cell 18 / Cell 20)
MOBILENET_ACCURACY  = None   # e.g. 0.9720
MOBILENET_PRECISION = None   # e.g. 0.9810
MOBILENET_RECALL    = None   # e.g. 0.9540
MOBILENET_F1        = None   # e.g. 0.9673
MOBILENET_AUC       = None   # e.g. 0.9950

TFLITE_ACCURACY  = None      # e.g. 0.9710  (from Cell 20)
TFLITE_PRECISION = None
TFLITE_RECALL    = None
TFLITE_F1        = None
# ─────────────────────────────────────────────────────────────────────────────

# ── Baseline results (from notebook output cell 9) ───────────────────────────
BASELINE = {
    "Logistic\nRegression": {"acc": 0.5714, "prec": 1.0000, "rec": 0.1429, "f1": 0.2500,
                             "ms": 0.22,   "kb": 383.7,   "color": "#64748b"},
    "KNN":                   {"acc": 0.5357, "prec": 1.0000, "rec": 0.0714, "f1": 0.1333,
                             "ms": 284.1,  "kb": 19827,   "color": "#94a3b8"},
    "Decision\nTree":        {"acc": 0.7500, "prec": 0.8889, "rec": 0.5714, "f1": 0.6957,
                             "ms": 0.07,   "kb": 2.3,     "color": "#f59e0b"},
    "Random\nForest":        {"acc": 0.7500, "prec": 0.8889, "rec": 0.5714, "f1": 0.6957,
                             "ms": 39.4,   "kb": 349.5,   "color": "#f97316"},
    "MLP":                   {"acc": 0.6786, "prec": 0.8571, "rec": 0.4286, "f1": 0.5714,
                             "ms": 2.78,   "kb": 46065,   "color": "#8b5cf6"},
    "SVM":                   {"acc": 0.7500, "prec": 1.0000, "rec": 0.5000, "f1": 0.6667,
                             "ms": 32.1,   "kb": 19512,   "color": "#ec4899"},
}

# Inject MobileNetV2 if results are available
if MOBILENET_ACCURACY is not None:
    BASELINE["MobileNetV2\n(full)"] = {
        "acc": MOBILENET_ACCURACY, "prec": MOBILENET_PRECISION,
        "rec": MOBILENET_RECALL,   "f1": MOBILENET_F1,
        "ms": 6.0, "kb": 8533, "color": "#22c55e",
    }
if TFLITE_ACCURACY is not None:
    BASELINE["MobileNetV2\nTFLite"] = {
        "acc": TFLITE_ACCURACY, "prec": TFLITE_PRECISION,
        "rec": TFLITE_RECALL,   "f1": TFLITE_F1,
        "ms": 6.0, "kb": 8533, "color": "#06b6d4",
    }

MODELS = list(BASELINE.keys())
COLORS = [BASELINE[m]["color"] for m in MODELS]

# ── STYLE ─────────────────────────────────────────────────────────────────────
plt.rcParams.update({
    "figure.facecolor": "#0f172a",
    "axes.facecolor":   "#1e293b",
    "axes.edgecolor":   "#334155",
    "axes.labelcolor":  "#e2e8f0",
    "xtick.color":      "#94a3b8",
    "ytick.color":      "#94a3b8",
    "text.color":       "#e2e8f0",
    "grid.color":       "#334155",
    "grid.linewidth":   0.6,
    "font.family":      "DejaVu Sans",
})

def save(name):
    path = f"poster_figures/{name}.png"
    plt.savefig(path, dpi=180, bbox_inches="tight", facecolor=plt.rcParams["figure.facecolor"])
    plt.close()
    print(f"  Saved: {path}")


# ══════════════════════════════════════════════════════════════════════════════
# CHART 1 — Model Comparison: Accuracy & F1
# ══════════════════════════════════════════════════════════════════════════════
print("Generating Chart 1: Model Comparison...")
fig, ax = plt.subplots(figsize=(11, 5))

x = np.arange(len(MODELS))
w = 0.38
accs = [BASELINE[m]["acc"] for m in MODELS]
f1s  = [BASELINE[m]["f1"]  for m in MODELS]

bars_acc = ax.bar(x - w/2, accs, w, label="Accuracy", color=COLORS, alpha=0.9, zorder=3)
bars_f1  = ax.bar(x + w/2, f1s,  w, label="F1-Score", color=COLORS, alpha=0.55, zorder=3,
                  edgecolor=COLORS, linewidth=1.2)

# Value labels
for bar in bars_acc:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.012,
            f"{bar.get_height():.2f}", ha='center', va='bottom', fontsize=7.5, color="#e2e8f0")
for bar in bars_f1:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.012,
            f"{bar.get_height():.2f}", ha='center', va='bottom', fontsize=7.5, color="#94a3b8")

ax.set_xticks(x)
ax.set_xticklabels(MODELS, fontsize=9)
ax.set_ylim(0, 1.12)
ax.set_ylabel("Score")
ax.set_title("Model Comparison: Accuracy & F1-Score", fontsize=13, pad=12, color="#f1f5f9")
ax.yaxis.grid(True, zorder=0)
ax.set_axisbelow(True)

solid = mpatches.Patch(color="#94a3b8", alpha=0.9, label="Accuracy (solid)")
hatch = mpatches.Patch(color="#94a3b8", alpha=0.55, label="F1-Score (faded)")
ax.legend(handles=[solid, hatch], loc="upper left", fontsize=9,
          facecolor="#1e293b", edgecolor="#475569")

# Highlight MobileNetV2 if present
for i, m in enumerate(MODELS):
    if "MobileNetV2" in m:
        ax.axvline(x[i], color="#22c55e", alpha=0.15, linewidth=18, zorder=1)

fig.tight_layout()
save("chart1_model_comparison")


# ══════════════════════════════════════════════════════════════════════════════
# CHART 2 — Precision vs Recall
# ══════════════════════════════════════════════════════════════════════════════
print("Generating Chart 2: Precision vs Recall...")
fig, ax = plt.subplots(figsize=(7, 6))

for m, c in zip(MODELS, COLORS):
    prec = BASELINE[m]["prec"]
    rec  = BASELINE[m]["rec"]
    ax.scatter(rec, prec, color=c, s=120, zorder=5)
    label = m.replace("\n", " ")
    offset = (0.015, 0.008)
    ax.annotate(label, (rec, prec),
                xytext=(rec + offset[0], prec + offset[1]),
                fontsize=7.5, color="#cbd5e1",
                arrowprops=dict(arrowstyle="-", color="#475569", lw=0.6))

# F1 iso-curves
for f1_val in [0.2, 0.4, 0.6, 0.8]:
    r_range = np.linspace(0.01, 1.0, 200)
    p_range = f1_val * r_range / (2 * r_range - f1_val)
    mask = (p_range >= 0) & (p_range <= 1)
    ax.plot(r_range[mask], p_range[mask], "--", color="#334155", linewidth=0.8, zorder=1)
    # label at right edge
    idx = np.where(mask)[0]
    if len(idx):
        ax.text(r_range[idx[-1]] + 0.01, p_range[idx[-1]], f"F1={f1_val}",
                fontsize=6.5, color="#475569", va='center')

ax.set_xlim(0, 1.1)
ax.set_ylim(0, 1.1)
ax.set_xlabel("Recall")
ax.set_ylabel("Precision")
ax.set_title("Precision–Recall Trade-off", fontsize=13, pad=12, color="#f1f5f9")
ax.grid(True, alpha=0.3)
fig.tight_layout()
save("chart2_precision_recall")


# ══════════════════════════════════════════════════════════════════════════════
# CHART 3 — Speed vs Accuracy (log scale for speed)
# ══════════════════════════════════════════════════════════════════════════════
print("Generating Chart 3: Speed vs Accuracy...")
fig, ax = plt.subplots(figsize=(8, 5.5))

# Bubble size = model size in KB (log scaled)
for m, c in zip(MODELS, COLORS):
    ms  = BASELINE[m]["ms"]
    acc = BASELINE[m]["acc"]
    kb  = BASELINE[m]["kb"]
    size = max(30, np.log10(kb + 1) * 60)
    ax.scatter(ms, acc, color=c, s=size, alpha=0.85, zorder=5, edgecolors="#e2e8f0", linewidths=0.5)
    label = m.replace("\n", " ")
    ax.annotate(label, (ms, acc), xytext=(ms * 1.08, acc + 0.008),
                fontsize=7.5, color="#cbd5e1")

ax.set_xscale("log")
ax.set_xlabel("Inference Time (ms/image, log scale)")
ax.set_ylabel("Accuracy")
ax.set_title("Speed vs Accuracy\n(bubble size ∝ model size)", fontsize=13, pad=12, color="#f1f5f9")
ax.grid(True, alpha=0.3)

# Ideal region annotation
ax.annotate("← Ideal region\n  (fast + accurate)", xy=(0.5, 0.95),
            fontsize=8, color="#22c55e", alpha=0.7,
            xycoords=('axes fraction', 'axes fraction'))

fig.tight_layout()
save("chart3_speed_vs_accuracy")


# ══════════════════════════════════════════════════════════════════════════════
# CHART 4 — Dataset Composition
# ══════════════════════════════════════════════════════════════════════════════
print("Generating Chart 4: Dataset Composition...")
fig, axes = plt.subplots(1, 2, figsize=(10, 4.5))

# Left: Pie chart
sizes  = [14357, 3921]
labels = ["Non-Crack\n14,357", "Crack\n3,921"]
clrs   = ["#22c55e", "#ef4444"]
explode = (0, 0.06)
wedges, texts, autotexts = axes[0].pie(
    sizes, labels=labels, colors=clrs, explode=explode,
    autopct='%1.1f%%', startangle=140,
    textprops={"color": "#e2e8f0", "fontsize": 10},
    wedgeprops={"edgecolor": "#0f172a", "linewidth": 2}
)
for at in autotexts:
    at.set_color("#0f172a")
    at.set_fontsize(10)
    at.set_fontweight("bold")
axes[0].set_title("Class Distribution\n(18,278 total images)", fontsize=12, color="#f1f5f9")
axes[0].set_facecolor("#0f172a")

# Right: Bar showing imbalance ratio
ratio = 14357 / 3921
bar_data = [14357, 3921]
bar_labels = ["Non-Crack", "Crack"]
bar_colors = ["#22c55e", "#ef4444"]
bars = axes[1].bar(bar_labels, bar_data, color=bar_colors, alpha=0.85,
                   edgecolor=["#16a34a", "#dc2626"], linewidth=1.5, width=0.5)
for bar, val in zip(bars, bar_data):
    axes[1].text(bar.get_x() + bar.get_width()/2, bar.get_height() + 150,
                 f"{val:,}", ha='center', va='bottom', fontsize=10, color="#e2e8f0")
axes[1].set_ylabel("Image Count")
axes[1].set_title(f"Class Imbalance\n({ratio:.1f}:1 non-crack to crack)", fontsize=12, color="#f1f5f9")
axes[1].yaxis.grid(True, alpha=0.3, zorder=0)
axes[1].set_axisbelow(True)
axes[1].set_ylim(0, 17000)

fig.suptitle("Concrete Crack Dataset", fontsize=14, color="#f1f5f9", y=1.01)
fig.tight_layout()
save("chart4_dataset")


# ══════════════════════════════════════════════════════════════════════════════
# CHART 5 — All Metrics Grouped Bar (if MobileNetV2 results available)
# ══════════════════════════════════════════════════════════════════════════════
if MOBILENET_ACCURACY is not None:
    print("Generating Chart 5: Full Metrics Comparison...")
    fig, ax = plt.subplots(figsize=(12, 5.5))
    metrics = ["Accuracy", "Precision", "Recall", "F1"]
    keys    = ["acc", "prec", "rec", "f1"]
    x = np.arange(len(MODELS))
    n = len(metrics)
    width = 0.18
    offsets = np.linspace(-(n-1)/2, (n-1)/2, n) * width
    metric_colors = ["#22d3ee", "#f59e0b", "#f87171", "#a78bfa"]

    for i, (metric, key, mc) in enumerate(zip(metrics, keys, metric_colors)):
        vals = [BASELINE[m][key] for m in MODELS]
        ax.bar(x + offsets[i], vals, width, label=metric, color=mc, alpha=0.85, zorder=3)

    ax.set_xticks(x)
    ax.set_xticklabels(MODELS, fontsize=9)
    ax.set_ylim(0, 1.15)
    ax.set_ylabel("Score")
    ax.set_title("All Metrics: Model Comparison", fontsize=13, pad=12, color="#f1f5f9")
    ax.legend(loc="upper left", fontsize=9, facecolor="#1e293b", edgecolor="#475569")
    ax.yaxis.grid(True, alpha=0.3, zorder=0)
    ax.set_axisbelow(True)
    fig.tight_layout()
    save("chart5_all_metrics")
else:
    print("  Skipping Chart 5 (MobileNetV2 results not filled in yet)")


print("\nDone! Charts saved to poster_figures/")
print("Fill in MOBILENET_ACCURACY etc. at the top of this file to unlock Chart 5.")

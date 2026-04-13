"""
Hero chart for poster — run immediately, no MobileNetV2 results needed.
Usage:  python generate_hero_chart.py
Output: poster_figures/hero_chart.png
"""

import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

os.makedirs("poster_figures", exist_ok=True)

# ── Real results from notebook outputs ───────────────────────────────────────
BASELINE_BEST_LABEL  = "Best Classical ML\n(SVM)"
BASELINE_BEST_ACC    = 75.0

# Fill in after Colab finishes — leave None to show "In Training" bar
MOBILENET_ACC = 83.0

# ── Style ─────────────────────────────────────────────────────────────────────
BG      = "#0f172a"
CARD    = "#1e293b"
CYAN    = "#22d3ee"
SLATE   = "#64748b"
WHITE   = "#f1f5f9"
MUTED   = "#94a3b8"

plt.rcParams.update({
    "figure.facecolor": BG,
    "axes.facecolor":   CARD,
    "axes.edgecolor":   "#334155",
    "axes.labelcolor":  WHITE,
    "xtick.color":      MUTED,
    "ytick.color":      MUTED,
    "text.color":       WHITE,
    "grid.color":       "#334155",
    "grid.linewidth":   0.6,
    "font.family":      "DejaVu Sans",
})

fig, ax = plt.subplots(figsize=(8, 5.5))
fig.patch.set_facecolor(BG)

labels = [BASELINE_BEST_LABEL, "MobileNetV2\n(Ours)"]
colors = [SLATE, CYAN]

if MOBILENET_ACC is not None:
    values = [BASELINE_BEST_ACC, MOBILENET_ACC]
    bars = ax.bar(labels, values, width=0.45, color=colors,
                  edgecolor=["#475569", "#06b6d4"], linewidth=1.5,
                  zorder=3)
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 0.8,
                f"{val:.1f}%", ha='center', va='bottom',
                fontsize=16, fontweight='bold', color=WHITE)
    improvement = MOBILENET_ACC - BASELINE_BEST_ACC
    ax.annotate(f"+{improvement:.1f}% improvement",
                xy=(1, MOBILENET_ACC), xytext=(1.3, MOBILENET_ACC - 8),
                fontsize=11, color=CYAN,
                arrowprops=dict(arrowstyle='->', color=CYAN, lw=1.5))
else:
    # Show baseline + "In Training" placeholder
    values = [BASELINE_BEST_ACC, 0]
    bars = ax.bar(labels[0:1], values[0:1], width=0.45, color=SLATE,
                  edgecolor="#475569", linewidth=1.5, zorder=3)
    ax.text(bars[0].get_x() + bars[0].get_width() / 2,
            BASELINE_BEST_ACC + 0.8,
            f"{BASELINE_BEST_ACC:.1f}%", ha='center', va='bottom',
            fontsize=16, fontweight='bold', color=WHITE)

    # Placeholder bar with diagonal lines
    placeholder = ax.bar([labels[1]], [85], width=0.45,
                         color="none", edgecolor=CYAN,
                         linewidth=2, linestyle='--', zorder=3)
    ax.text(0.73, 45, "Training\nin progress...",
            ha='center', va='center', fontsize=12,
            color=CYAN, alpha=0.8,
            transform=ax.get_xaxis_transform())

ax.set_ylim(0, 105)
ax.set_ylabel("Accuracy (%)", fontsize=12)
ax.set_title("Crack Detection Accuracy:\nClassical ML vs MobileNetV2",
             fontsize=14, color=WHITE, pad=16)
ax.yaxis.grid(True, zorder=0, alpha=0.5)
ax.set_axisbelow(True)

# 75% reference line
ax.axhline(BASELINE_BEST_ACC, color=SLATE, linestyle=':', linewidth=1, alpha=0.6)

# Highlight MobileNetV2 column
ax.axvspan(0.5, 1.5, color=CYAN, alpha=0.04, zorder=0)

# Caption
fig.text(0.5, -0.02,
         "Classical ML (SVM, Random Forest) capped at 75% accuracy on flat pixel features.\n"
         "MobileNetV2 uses learned spatial features via transfer learning from ImageNet.",
         ha='center', fontsize=8.5, color=MUTED, wrap=True)

fig.tight_layout()
path = "poster_figures/hero_chart.png"
plt.savefig(path, dpi=180, bbox_inches="tight", facecolor=BG)
plt.close()
print(f"Saved: {path}")
print("\nTo add MobileNetV2 results later:")
print("  1. Open generate_hero_chart.py")
print("  2. Set MOBILENET_ACC = your accuracy number (e.g. 94.2)")
print("  3. Re-run: python generate_hero_chart.py")

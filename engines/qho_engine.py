"""
Quantum Harmonic Oscillator Simulation Engine
==============================================
Generates wavefunctions, probability densities, and comparison plots.
Run: python qho_engine.py

This is the exact Python engine behind the interactive HTML module.
You can modify parameters, add anharmonicity, or switch to numerical
finite-difference methods to compare with the analytical Hermite solution.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.special import eval_hermite

# ============================================================
# PARAMETERS
# ============================================================
n = 3                              # Principal quantum number
m = 1.0                            # mass (natural units: m = omega = hbar = 1)
omega = 1.0                        # oscillator frequency
hbar = 1.0                         # reduced Planck's constant

x_min, x_max = -8, 8              # plot range in units of sqrt(hbar/m*omega)
N_points = 2000

# Coherent state mixing (for animation / superposition)
m_mix = 2                          # Mix n and m_mix in superposition
alpha_mix = 0.5                    # Relative amplitude

# ============================================================
# PHYSICS ENGINE
# ============================================================

# Characteristic length scale
l0 = np.sqrt(hbar / (m * omega))
x = np.linspace(x_min, x_max, N_points)
xi = x / l0                        # Dimensionless coordinate

def hermite_polynomial(n, xi):
    """Hermite polynomial H_n(xi) using scipy."""
    return eval_hermite(n, xi)

def psi_qho(n, xi, l0):
    """
    Exact normalized wavefunction for the 1D quantum harmonic oscillator.
    
    psi_n(x) = (1 / sqrt(2^n n!)) * (m*omega / (pi*hbar))^(1/4) * H_n(xi) * exp(-xi^2/2)
    """
    norm = 1.0 / np.sqrt(2**n * np.math.factorial(n)) * (m * omega / (np.pi * hbar))**0.25
    Hn = hermite_polynomial(n, xi)
    gaussian = np.exp(-xi**2 / 2)
    return norm * Hn * gaussian / np.sqrt(l0)

def psi_superposition(n, m, xi, l0, coeff_n=1/np.sqrt(2), coeff_m=1/np.sqrt(2)):
    """Superposition of two states: c_n * psi_n + c_m * psi_m (normalized)."""
    psi_n = psi_qho(n, xi, l0)
    psi_m = psi_qho(m, xi, l0)
    psi_total = coeff_n * psi_n + coeff_m * psi_m
    # Normalize
    dx = x[1] - x[0]
    norm = np.sqrt(np.trapezoid(psi_total**2, x))
    return psi_total / norm

def classical_probability(n, x, m, omega, hbar):
    """
    Classical probability distribution for a harmonic oscillator with energy E_n.
    P_cl(x) ~ 1 / sqrt(E_n - V(x)) inside turning points.
    """
    E_n = (n + 0.5) * hbar * omega
    V = 0.5 * m * omega**2 * x**2
    P = np.zeros_like(x)
    mask = E_n > V
    P[mask] = 1.0 / np.sqrt(E_n - V[mask])
    # Normalize
    dx = x[1] - x[0]
    P = P / np.trapezoid(P, x)
    return P

def potential(x, m, omega):
    return 0.5 * m * omega**2 * x**2

# ============================================================
# PLOT 1: Wavefunction and Probability
# ============================================================
psi_n = psi_qho(n, xi, l0)
prob_n = psi_n**2
V = potential(x, m, omega)

fig, axes = plt.subplots(2, 1, figsize=(12, 8), facecolor='#0a0a0f')

# Color palette
accent_blue = '#00d4ff'
accent_pink = '#ff4081'
accent_purple = '#b388ff'
accent_yellow = '#ffd740'

for ax in axes:
    ax.set_facecolor('#0a0a0f')
    ax.tick_params(colors='#8080a0', labelsize=9)
    ax.xaxis.label.set_color('#8080a0')
    ax.yaxis.label.set_color('#8080a0')
    ax.spines['bottom'].set_color('#2a2a3a')
    ax.spines['top'].set_color('#2a2a3a')
    ax.spines['left'].set_color('#2a2a3a')
    ax.spines['right'].set_color('#2a2a3a')
    ax.grid(color='#1a1a28', linestyle='-', linewidth=0.5)

# Top: Wavefunction
E_n = (n + 0.5) * hbar * omega
axes[0].plot(x, psi_n, color=accent_blue, linewidth=2, label=fr'$\psi_{{{n}}}(x)$')
axes[0].fill_between(x, psi_n, alpha=0.08, color=accent_blue)
axes[0].axhline(y=E_n, color=accent_purple, linestyle='--', linewidth=1.5, label=fr'$E_{{{n}}} = {E_n:.2f}\hbar\omega$')
axes[0].plot(x, V, color='white', linestyle='-', linewidth=1, alpha=0.2, label='$V(x)$')
axes[0].set_xlabel('x (natural units)')
axes[0].set_ylabel('$\\psi(x)$, E, V(x)')
axes[0].set_title(f'Quantum Harmonic Oscillator — n = {n}', color='white', fontsize=13, pad=15)
axes[0].legend(facecolor='#12121a', edgecolor='#2a2a3a', labelcolor='white')

# Bottom: Probability density
axes[1].plot(x, prob_n, color=accent_pink, linewidth=2, label=fr'$|\\psi_{{{n}}}|^2$')
axes[1].fill_between(x, prob_n, alpha=0.12, color=accent_pink)

# Classical comparison
P_cl = classical_probability(n, x, m, omega, hbar)
axes[1].plot(x, P_cl, color=accent_yellow, linewidth=2, linestyle='--', alpha=0.8, label='Classical $P_{cl}(x)$')

# Turning points
x_turn = np.sqrt(2 * E_n / (m * omega**2))
axes[1].axvline(x=x_turn, color='white', linestyle=':', alpha=0.3)
axes[1].axvline(x=-x_turn, color='white', linestyle=':', alpha=0.3)
axes[1].set_xlabel('x (natural units)')
axes[1].set_ylabel('Probability density')
axes[1].legend(facecolor='#12121a', edgecolor='#2a2a3a', labelcolor='white')

plt.tight_layout()
plt.savefig('qho_n{}.png'.format(n), dpi=150, facecolor='#0a0a0f', edgecolor='none', bbox_inches='tight')
print(f"Saved: qho_n{n}.png")

# ============================================================
# PLOT 2: Superposition state animation frames
# ============================================================
if m_mix != n and m_mix >= 0:
    fig2, ax2 = plt.subplots(figsize=(10, 5), facecolor='#0a0a0f')
    ax2.set_facecolor('#0a0a0f')
    ax2.tick_params(colors='#8080a0', labelsize=9)
    ax2.spines['bottom'].set_color('#2a2a3a')
    ax2.spines['top'].set_color('#2a2a3a')
    ax2.spines['left'].set_color('#2a2a3a')
    ax2.spines['right'].set_color('#2a2a3a')
    ax2.grid(color='#1a1a28', linestyle='-', linewidth=0.5)
    ax2.set_xlabel('x', color='#8080a0')
    ax2.set_ylabel('$|\\psi(x,t)|^2$', color='#8080a0')
    ax2.set_title(f'Superposition n={n} + m={m_mix} — Time Evolution', color='white', fontsize=12, pad=12)

    omega_n = (n + 0.5) * omega
    omega_m = (m_mix + 0.5) * omega

    times = np.linspace(0, 2 * np.pi / abs(omega_m - omega_n), 5)
    colors_t = plt.cm.cool(np.linspace(0, 1, len(times)))

    for i, t in enumerate(times):
        coeff_n = np.cos(0.5 * (omega_n + omega_m) * t)
        coeff_m = np.sin(0.5 * (omega_n + omega_m) * t)
        psi_t = psi_superposition(n, m_mix, xi, l0, coeff_n, coeff_m)
        prob_t = psi_t**2
        ax2.plot(x, prob_t, color=colors_t[i], linewidth=1.5, alpha=0.7, label=f't = {t:.2f}')

    ax2.legend(facecolor='#12121a', edgecolor='#2a2a3a', labelcolor='white', loc='upper right')
    plt.tight_layout()
    plt.savefig('qho_superposition.png', dpi=150, facecolor='#0a0a0f', edgecolor='none', bbox_inches='tight')
    print("Saved: qho_superposition.png")

# ============================================================
# PLOT 3: Energy level diagram
# ============================================================
fig3, ax3 = plt.subplots(figsize=(4, 7), facecolor='#0a0a0f')
ax3.set_facecolor('#0a0a0f')
ax3.tick_params(colors='#8080a0', labelsize=9)
ax3.spines['bottom'].set_color('#2a2a3a')
ax3.spines['top'].set_color('#2a2a3a')
ax3.spines['left'].set_color('#2a2a3a')
ax3.spines['right'].set_color('#2a2a3a')
ax3.set_xlim(-0.5, 1.5)
ax3.set_ylim(-0.3, 11.5)
ax3.set_xticks([])
ax3.set_ylabel('Energy ($\\hbar\\omega$)', color='#8080a0')
ax3.set_title('Energy Levels', color='white', fontsize=11)

for i in range(11):
    E = (i + 0.5)
    ax3.hlines(E, 0, 1, color=accent_cyan if i == n else '#3a3a55', linewidth=2.5 if i == n else 1)
    ax3.text(1.1, E, f'n={i}, E={E:.1f}ℏω', color='white' if i == n else '#505070', va='center', fontsize=9)

ax3.axhline(y=0.5, color=accent_purple, linestyle=':', alpha=0.5)
ax3.text(-0.4, 0.5, 'ZPE', color=accent_purple, va='center', fontsize=8)

plt.tight_layout()
plt.savefig('qho_levels.png', dpi=150, facecolor='#0a0a0f', edgecolor='none', bbox_inches='tight')
print("Saved: qho_levels.png")

# ============================================================
# TABLE: Key quantities
# ============================================================
print("\n" + "="*50)
print("QUANTUM HARMONIC OSCILLATOR — COMPUTED QUANTITIES")
print("="*50)
print(f"n                    = {n}")
print(f"Energy E_n          = {(n+0.5):.3f} ℏω")
print(f"Zero-point energy   = 0.500 ℏω")
print(f"⟨x⟩                 = {np.trapezoid(x * prob_n, x):.4f}")
print(f"⟨x²⟩                = {np.trapezoid(x**2 * prob_n, x):.4f}")
print(f"⟨p_x⟩               = 0.0000 (stationary state)")
print(f"Classical turning   = ±{np.sqrt(2*(n+0.5)):.3f}")
print(f"Nodes in ψ_{n}      = {n}")
print("="*50)

plt.show()

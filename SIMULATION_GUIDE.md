# Quantum Lab — Simulation Guide
Quick reference for all 16 physics engines, their parameters, and what they teach.

---

## Module 00 — Crystal to Quantum
**What it simulates:** Zooms from macroscopic crystal (1 cm) down to the quantum realm (0.1 nm). Fires photons at a silicon lattice and visualizes electron excitation, absorption, and emission.
**Key concepts:** Scale bridging, lattice structure, photon-matter interaction, band-gap absorption.

---

## Module 01 — Quantum Harmonic Oscillator (QHO)
**What it simulates:** The canonical quantum bound state. Hermite wavefunctions ψₙ(x), time evolution, superpositions, and coherent states. Classical turning points, Wigner function, and zero-point energy.
**Key concepts:** Quantization, standing waves, nodes, zero-point energy, classical-quantum correspondence.

### QHO Parameters
| Parameter | Symbol | Range | What it controls |
|-----------|--------|-------|----------------|
| **Quantum number n** | n | 0–10 | Eigenstate |n⟩. Adds n nodes. Energy Eₙ = (n + ½)ℏω. |
| **Second state m** | m | 0–10 | Used only in superposition mode: |Ψ⟩ = c₀|n⟩ + c₁|m⟩. |
| **Re(α)** | Re(α) | 0–5 | Coherent-state displacement in position: ⟨x⟩ = √2 Re(α). |
| **Im(α)** | Im(α) | −5 to +5 | Coherent-state displacement in momentum: ⟨p⟩ = √2 Im(α). |
| **Speed** | — | 0.1–3× | Animation speed for time evolution. |
| **Time t** | t | — | Current phase of the oscillating wavefunction. |

### QHO Live Readouts
| Readout | Meaning |
|---------|---------|
| **Energy E** | Expectation value ⟨E⟩ for the current state |
| **Zero-point** | E₀ = ½ℏω (never zero, even at T = 0 K) |
| **Classical turning** | ±√(2E) — the amplitude a classical oscillator with the same energy would reach |
| **⟨x⟩** | Mean position. Zero for eigenstates; oscillates for coherent states. |
| **⟨x²⟩** | Position variance. Related to Δx = √(⟨x²⟩ − ⟨x⟩²). |
| **Δx** | Position uncertainty. For n = 0: Δx = √(ℏ/2mω). Grows as √n. |

---

## Module 02 — Hydrogen Atom
**What it simulates:** Exact analytical radial wavefunctions Rₙₗ(r), probability densities |ψ|², and angular orbitals Yₗₘ. Transitions with selection rules, spectral lines, and fine structure.
**Key concepts:** Atomic orbitals, quantum numbers (n, l, m), Bohr radius, Rydberg energy, spectral series.

### Hydrogen Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Principal quantum number n | 1–6 | Shell radius and energy Eₙ = −13.6 eV / n² |
| Angular quantum number l | 0 to n−1 | Orbital shape (s, p, d, f...) |
| Magnetic quantum number m | −l to +l | Orientation in space |
| B-field | 0–5 T | Zeeman splitting of energy levels |
| Initial nᵢ / Final nբ | 1–6 | Spectral transition for photon emission/absorption |

---

## Module 03 — Spin-1/2 & Quantum Measurement
**What it simulates:** The Bloch sphere, Stern-Gerlach apparatus, and quantum gate operations. Tracks qubit states through rotations and projections.
**Key concepts:** Superposition, measurement collapse, Bloch vector, quantum gates (X, Y, Z, H), expectation values.

### Spin Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| θ (polar angle) | 0–π | Bloch-sphere latitude; |0⟩ at north pole, |1⟩ at south |
| φ (azimuthal) | 0–2π | Bloch-spphere longitude; phase between |0⟩ and |1⟩ |
| B-field direction | X/Y/Z | Measurement axis for Stern-Gerlach |
| Gate sequence | — | Applies RX, RY, RZ, or Hadamard to the state |

---

## Module 04 — Kronig-Penney Model
**What it simulates:** 1D periodic square-well potential. Solves the exact transcendental equation for allowed energy bands and forbidden gaps.
**Key concepts:** Band formation, Brillouin zone, reduced vs extended zone schemes, effective mass, gap opening.

### KP Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Potential height V₀ | 0–20 ℏ²/ma² | Barrier strength — larger V₀ → wider gaps |
| Barrier width b | 0–1.0 a | Fraction of unit cell occupied by barrier |
| Lattice constant a | 0.5–2.0 | Period of the crystal |
| Zone scheme | Reduced / Extended | How bands are folded/unfolded in k-space |

---

## Module 05 — Energy Bands & Density of States
**What it simulates:** Tight-binding band structures in 1D, 2D (square + hexagonal/graphene), and 3D. DOS by k-space sampling. ARPES-style photoemission cuts.
**Key concepts:** Dispersion relation, van Hove singularities, dimensionality effects, Dirac cones in graphene.

### Bands Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Dimension | 1D / 2D / 3D / Graphene | Lattice geometry and DOS scaling |
| Hopping t | 0.1–3 eV | Nearest-neighbor overlap → band width |
| On-site ε | −2 to +2 eV | Energy offset of atomic orbital |
| Show BZ | On/Off | Brillouin zone boundary overlay |

---

## Module 06 — Fermi Surface & Temperature
**What it simulates:** Fermi-Dirac occupation f(E), 3D wireframe Fermi sphere, thermal smearing shell, and 2D k-space occupation maps.
**Key concepts:** Pauli exclusion, degeneracy pressure, Fermi temperature Tբ, chemical potential shift, classical vs quantum gases.

### Fermi Surface Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Temperature T | 0–1000 K | Thermal smearing of the Fermi edge |
| Fermi energy Eբ | 1–10 eV | Radius of the Fermi sphere |
| Show classical | Toggle | Overlays Maxwell-Boltzmann for comparison |

---

## Module 07 — Electrical Conductivity
**What it simulates:** Multi-electron drift with random scattering, Bloch-Grüneisen resistivity ρ(T), mean free path vs temperature, Hall effect, and Ioffe-Regel limit.
**Key concepts:** Drude model, Matthiessen's rule, Umklapp processes, Wiedemann-Franz law, metal-insulator boundary.

### Conductivity Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Electric field E | 0.001–0.1 V/nm | Drift acceleration of electrons |
| Scattering time τ | 1–100 fs | Mean time between collisions |
| Temperature T | 10–600 K | Phonon population → resistivity |
| Material | Cu / Al / Si | Debye temperature and carrier density |

---

## Module 08 — Superconductivity
**What it simulates:** BCS energy gap Δ(T), Meissner effect (perfect diamagnetism χ = −1), London penetration depth λₗ(T), and critical field Hc(T).
**Key concepts:** Cooper pairs, gap ratio 2Δ/kBTC ≈ 3.52, two-fluid model, type-I vs type-II.

### Superconductivity Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Temperature T | 0–15 K | Gap closure and normal-state transition |
| Critical Tc | 1–135 K | Material property (Nb=9.2, YBCO=93, Hg-1223=135) |
| Magnetic field H | 0–0.5 T | Suppresses superconductivity above Hc(T) |
| Material | Nb / Al / YBCO / Hg-1223 | Sets Tc and Hc₀ automatically |

---

## Module 09 — Intrinsic Semiconductors
**What it simulates:** Carrier density nᵢ(T), conductivity σ(T), and band diagram with animated electron/hole populations.
**Key concepts:** Thermal activation across Eg, effective density of states Nc/Nv, mid-gap Fermi level, intrinsic regime.

### Intrinsic Semi Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Temperature T | 50–800 K | Exponential activation of carriers |
| Material | Si / Ge / GaAs / GaN / Diamond | Band gap Eg, Nc, Nv, mobility |
| Electron mobility μₑ | 100–5000 cm²/Vs | Drift velocity in E-field |
| Hole mobility μₕ | 50–2000 cm²/Vs | Complement to electron transport |

---

## Module 10 — Doped Semiconductors
**What it simulates:** Charge neutrality solver (n + Na⁺ = p + Nd⁺), Fermi-level shift with temperature, and animated band diagram with dopant levels.
**Key concepts:** Donors/acceptors, extrinsic vs intrinsic regimes, freeze-out, compensation, conductivity type.

### Doped Semi Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Donor concentration Nd | 10¹²–10²⁰ cm⁻³ | n-type doping level |
| Acceptor concentration Na | 10¹²–10²⁰ cm⁻³ | p-type doping level |
| Temperature T | 50–700 K | Freeze-out → saturation → intrinsic |
| Material | Si / Ge / GaAs | Band gap and effective masses |

---

## Module 11 — Junctions & Devices
**What it simulates:** Ideal diode I-V, solar cell curves with MPP tracker, Schottky thermionic emission, and band-bending diagrams.
**Key concepts:** p-n junction, built-in potential, saturation current, ideality factor n, fill factor, efficiency.

### Junction Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Temperature T | 200–500 K | kT dependence of I-V slope |
| Saturation current I₀ | 10⁻²¹–10⁻⁹ A | Material and area dependent |
| Light current Iₗ | 0–10 mA | Photogenerated current (solar cell) |
| Ideality factor n | 1.0–2.0 | 1 = ideal diffusion, 2 = recombination |
| Barrier height φb | 0.3–1.2 eV | Schottky metal-semiconductor junction |
| Material | Si / GaAs / Ge | Band gap and I₀ preset |

---

## Module 12 — Optics & Dispersion
**What it simulates:** Complex refractive index n + iκ from Drude and Lorentz models. Reflectivity R(ω), plasma edge, and absorption coefficient.
**Key concepts:** Plasma frequency ωₚ, dielectric function ε(ω), metallic reflection vs transparency, skin depth.

### Optics Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Plasma frequency ωₚ | 1–25 eV | Free-electron resonance (Si≈16.6, Au≈9.0) |
| Damping γ | 0.01–1 eV | Collision broadening of Drude peak |
| Material | Si / Au / Ag / Cu / Al / GaAs | Sets ωₚ and γ to literature values |
| Refractive index n | 1.0–5.0 | Real part for direct comparison |
| Extinction κ | 0–2.0 | Imaginary part → absorption |

---

## Module 13 — Laser Physics
**What it simulates:** Cavity modes, gain spectrum, threshold condition (gₜₕ = α + (1/2L)ln(1/R²)), population inversion, and gain saturation.
**Key concepts:** Stimulated emission, cavity resonance, lasing threshold, telecom wavelengths, MPP.

### Laser Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Band gap Eg | 0.1–4.0 eV | Determines emission wavelength λ = 1240/Eg nm |
| Cavity length L | 100–2000 nm | Mode spacing Δλ = λ² / 2nL |
| Refractive index n | 1.0–4.0 | Optical path in cavity |
| Mirror reflectivity R | 0.1–0.99 | Loss term in threshold equation |
| Internal loss α | 0–50 cm⁻¹ | Absorption and scattering |
| Pumping rate | 0.1–5.0 | Population inversion N₂/N₁ |
| Material | GaAs / InGaAsP / GaN / CO₂ / HeNe | Presets Eg and telecom band |

---

## Module 14 — Magnetism
**What it simulates:** Magnetic susceptibility χ(T): Curie law (C/T), Curie-Weiss law (C/(T−θ)), and Brillouin-like M(T) with hysteresis loops.
**Key concepts:** Ferromagnetic order, paramagnetism, diamagnetism, Curie temperature Tc, coercivity Hc.

### Magnetism Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Temperature T | 10–1200 K | Thermal disorder vs exchange energy |
| Curie constant C | 0.1–5.0 | Magnetic moment density |
| Weiss temperature θ | −50 to +100 K | Sign of exchange (ferro θ > 0, antiferro θ < 0) |
| Saturation magnetization Ms | 0–2.5 | Normalized spontaneous M at T = 0 |
| Coercivity Hc | 0–0.2 | Field needed to flip magnetization |
| Curie temperature Tc | 0–1400 K | Where ferromagnetism vanishes |
| Material | Fe / Ni / Co / Gd / Cu | Literature Tc, Ms, Hc presets |

---

## Module 15 — Thermal Properties
**What it simulates:** Heat capacity Cv(T): Debye T³ law at low T, Dulong-Petit 3R at high T, plus electronic γT term for metals. Thermal conductivity κ via Wiedemann-Franz law.
**Key concepts:** Phonon density of states, Debye temperature θD, Einstein model, electronic vs lattice contributions.

### Thermal Parameters
| Parameter | Range | What it controls |
|-----------|-------|----------------|
| Temperature T | 5–800 K | Thermal energy kT vs ℏω |
| Debye temperature θD | 100–2500 K | Characteristic phonon cutoff (Diamond=2220, Si=640) |
| Electronic γ | 0–0.01 | Cₑₗ = γT coefficient for metals |
| Material type | Metal / Insulator / Semiconductor | Switches electronic term on/off |
| Material | Quartz / Cu / Al / Diamond / Si | Sets θD and γ automatically |

---

## Quick Reference: Natural Units Used
| Module | Mass | Length | Energy | Time |
|--------|------|--------|--------|------|
| QHO (01) | m = 1 | √(ℏ/mω) | ℏω | 1/ω |
| Hydrogen (02) | mₑ | a₀ (Bohr) | eV | — |
| KP (04) | m = 1 | a (lattice) | ℏ²/ma² | — |
| Bands (05) | m = 1 | a (lattice) | eV | — |
| Fermi (06) | m = 1 | nm⁻¹ | eV | — |
| Conductivity (07) | mₑ | nm | eV | fs |
| Superconductivity (08) | mₑ | nm | meV | — |
| Semiconductors (09–11) | mₑ | cm³ | eV | — |
| Optics (12) | mₑ | — | eV | — |
| Laser (13) | mₑ | nm | eV | — |
| Magnetism (14) | — | — | — | — |
| Thermal (15) | — | — | J/mol·K | — |

---

*Last updated: 2026-05-12*

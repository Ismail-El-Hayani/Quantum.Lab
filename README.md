# ⚛ Physics Playground

**Learn Physics by Playing** — An interactive, gamified learning platform covering quantum mechanics, solid-state physics, and device physics through hands-on experiments and puzzles.

No textbooks. No lectures. Drag electrons, tune lasers, freeze atoms — discover equations through experiments.

---

## Features

- **16 Interactive Laboratories** — From quantum fundamentals to thermal properties
- **60+ Challenges & Puzzles** — Gamified progression with XP, levels, and badges
- **Live Simulations** — Real-time Plotly.js visualizations with interactive controls
- **Beautiful 3D Universe Background** — Particle system with constellation tracking
- **Gamification** — Level up from "Quantum Initiate" through the curriculum
- **Progressive Storyline** — Timeline navigation connecting all modules
- **Responsive Design** — Works on desktop and tablet

## Module Roadmap

| Lab | Module | Topic |
|:---:|:------:|-------|
| 00 | Crystal → Quantum | 3D zoom journey through a silicon crystal |
| 01 | Quantum Harmonic Oscillator | Energy ladders, wavefunctions, laser tuning |
| 02 | Hydrogen Atom | Orbital building, spectral puzzles |
| 03 | Spin-1/2 & Measurement | Bloch sphere, Stern-Gerlach, quantum gates |
| 04 | Kronig-Penney Model | Crystal designer, bandgap engineering |
| 05 | Energy Bands & DOS | Fermi level, material design |
| 06 | Fermi Surface & Temperature | 3D Fermi surfaces, temperature effects |
| 07 | Electrical Conductivity | Circuit builder, drift race, superconductivity intro |
| 08 | Superconductivity | BCS gap, Meissner effect, isotope puzzle |
| 09 | Intrinsic Semiconductors | Bandgap, carrier concentration, conductivity |
| 10 | Doped Semiconductors | n-type/p-type, compensation, mobility |
| 11 | Junctions & Devices | p-n junction, solar cells, LEDs |
| 12 | Optics & Dispersion | Refractive index, thin films, Fresnel, coherence |
| 13 | Laser Physics | Stimulated emission, cavity modes, telecom lasers |
| 14 | Magnetism | Ising model, hysteresis, Curie-Weiss, GMR |
| 15 | Thermal Properties | Debye model, electronic specific heat, Wiedemann-Franz |

## Getting Started

### Option 1: Open directly

Open `index.html` in a modern browser (Chrome, Firefox, Edge recommended). No build step required.

### Option 2: Serve locally (recommended for best performance)

**Windows:**
```batch
serve.bat
```

**Linux/macOS:**
```bash
chmod +x serve.sh && ./serve.sh
```

Then open `http://localhost:8000` in your browser.

Some modules load scripts dynamically — a local server avoids CORS issues.

### Option 3: Python one-liner

```bash
python -m http.server 8000
```

## Technology Stack

- **Vanilla JavaScript (ES5)** — No framework, maximum compatibility
- **Plotly.js 2.27** — Interactive scientific visualizations
- **MathJax 3** — LaTeX equation rendering
- **Canvas API** — Custom universe background engine
- **CSS3** — Glassmorphism design, custom properties, animations

## Project Structure

```
quantum-lab/
├── index.html                  # Main hub / lab selection
├── shared_*.js                 # Shared UI, game state, effects, interactivity
├── shared_styles.css           # Global design system
├── assets/
│   └── universe-bg.js          # 3D particle background engine
├── modules/
│   ├── 00_crystal_to_quantum/  # Intro module (Three.js 3D)
│   ├── 01_qho/                 # Quantum harmonic oscillator
│   ├── 02_hydrogen/            # Hydrogen atom
│   ├── 03_spin/                # Spin & measurement
│   ├── 04_kronig_penney/       # Kronig-Penney model
│   ├── 05_energy_bands/        # Energy bands & DOS
│   ├── 06_fermi_surface/       # Fermi surface
│   ├── 07_conductivity/        # Electrical conductivity
│   ├── 08_superconductivity/   # Superconductivity
│   ├── 09_intrinsic_semiconductors/
│   ├── 10_doped_semiconductors/
│   ├── 11_junctions_devices/
│   ├── 12_optics_dispersion/
│   ├── 13_laser_physics/
│   ├── 14_magnetism/
│   └── 15_thermal_properties/
├── engines/
│   └── qho_engine.py           # Python simulation engine
├── README.md
└── .gitignore
```

## Gamification System

- **XP (Experience Points):** Earned by completing challenges and puzzles
- **Levels:** 100 XP per level; track progress on the hero XP bar
- **Modules Explored:** `/15` tracker in the navbar
- **Progress Rings:** Per-module completion percentage on each lab card
- **Preview Plot:** Hover any lab card to see a live waveform preview

## Contributing

Contributions welcome! Ideas for new modules, challenges, or visual improvements:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

See individual module files for the pattern (each module typically has `*_sim.js` for physics, `*_apps_games.js` for challenges).

## License

Academic project — MIT License. Built for the Nano Master program in Atomic Physics & Solid State.

---

*"The only way to learn physics is to do physics."*

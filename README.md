# ⚛ Quantum Lab

**Learn Physics by Experimenting** — An interactive physics laboratory covering quantum mechanics, solid-state physics, and device physics through live simulations and guided exercises.

No textbooks. No lectures. Drag electrons, tune lasers, freeze atoms — discover equations through experiments.

---

## Features

- **16 Interactive Laboratories** — From quantum fundamentals to thermal properties
- **Live Simulations** — Real-time Plotly.js visualizations with interactive controls
- **Unified Lab Interface** — Every module follows the same 4-tab layout (Overview → Theory → Simulation → Exercises) with a persistent Lab Navigator sidebar
- **Interactive Periodic Table** — 118 elements with solid-state properties, 18 semiconductor materials, integrated into Module 00
- **3D Universe Background** — Particle system with constellation tracking
- **Custom Physics Engines** — 24,400+ lines of hand-written simulation JavaScript across 43 module JS files
- **Python Engine** — QHO Hermite polynomial generator (`engines/qho_engine.py`)
- **Responsive Design** — Works on desktop and tablet

## Module Roadmap

| Lab | Module | Topic |
|:---:|:------:|-------|
| 00 | Crystal → Quantum | 3D zoom journey through a silicon crystal, periodic table integration |
| 01 | Quantum Harmonic Oscillator | Energy ladders, wavefunctions, laser tuning |
| 02 | Hydrogen Atom | Orbital building, spectral puzzles |
| 03 | Spin-1/2 & Measurement | Bloch sphere, Stern-Gerlach, quantum gates |
| 04 | Kronig-Penney Model | Periodic potentials, band gaps, wave packets |
| 05 | Energy Bands & DOS | Fermi level, material design |
| 06 | Fermi Surface & Temperature | 3D Fermi surfaces, temperature effects |
| 07 | Electrical Conductivity | Electron drift, resistivity, Hall effect |
| 08 | Superconductivity | BCS gap, Meissner effect, isotope puzzle |
| 09 | Intrinsic Semiconductors | Bandgap, carrier concentration, conductivity |
| 10 | Doped Semiconductors | n-type/p-type, compensation, mobility |
| 11 | Junctions & Devices | p-n junction, solar cells, LEDs |
| 12 | Optics & Dispersion | Refractive index, thin films, Fresnel, coherence |
| 13 | Laser Physics | Stimulated emission, cavity modes, telecom lasers |
| 14 | Magnetism | Ising model, hysteresis, Curie-Weiss, GMR |
| 15 | Thermal Properties | Debye model, electronic specific heat, Wiedemann-Franz |

## Getting Started

### Option 1: Serve locally (recommended)

ES modules + importmap + jsDelivr CDN require `http://` — browsers silently fail under `file://`.

**Windows:** double-click `serve.bat`
**Linux/macOS/WSL:** `chmod +x serve.sh && ./serve.sh`

Then open `http://127.0.0.1:8080/` in your browser.

### Option 2: Python one-liner

```bash
python -m http.server 8080
```

Then open `http://127.0.0.1:8080/`.

## Technology Stack

- **Vanilla JavaScript (ES5/ES6)** — No framework, maximum compatibility
- **Plotly.js 2.27** — Interactive scientific visualizations (local vendor copy in Module 01, CDN elsewhere)
- **MathJax 3** — LaTeX equation rendering
- **Three.js** — 3D crystal-to-quantum intro (Module 00)
- **Canvas API** — Custom universe background engine
- **CSS3** — Glassmorphism design, custom properties, animations

## Project Structure

```
quantum-lab/
├── index.html                  # Main hub — 16-module card grid
├── module-template.html        # Reference template for module structure
├── universe-background.html    # Standalone universe bg demo
├── shared_styles.css           # Global design system (701 lines)
├── shared_lab.js               # Unified module bootstrapper: tab switching, Lab Navigator
├── shared_effects.js           # Cursor glow, scroll reveal, 3D tilt, spotlight
├── shared_interactive.js       # Sliders, drag/drop, matching, experiment recorder
├── shared_ui.js                # Tooltips
├── shared_periodic.js          # Periodic table renderer + 118-element database (976 lines)
├── assets/
│   └── universe-bg.js          # 3D particle background engine
├── engines/
│   └── qho_engine.py           # Python QHO Hermite polynomial generator
├── modules/
│   ├── 00_crystal_to_quantum/  # Three.js 3D intro + periodic table
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
│   ├── 12_optics_dispersion/   # Snell, Fresnel, thin films, spectral
│   ├── 13_laser_physics/
│   ├── 14_magnetism/
│   └── 15_thermal_properties/
├── serve.bat                   # Windows dev server launcher
├── serve.sh                    # Linux/macOS dev server launcher
├── README.md
├── SIMULATION_GUIDE.md         # Parameter reference for all 16 modules
├── PROJECT_LOG.md              # Development history & architecture
├── UNIFIED_UI_PLAN.md          # UI unification plan (all phases complete)
├── SONAR_INVENTORY.md          # SonarQube issue inventory
├── Rules.md                    # Agent rules for subagents
└── .gitignore
```

## Module Architecture

Every module (01–15) follows the unified lab template:

- **4 tabs:** Overview · Theory · Simulation · Exercises (Exercises is provided by the template; modules 01–15 currently ship Overview/Theory/Simulation, with exercises content living in the Simulation tab)
- **Lab Navigator sidebar:** Cross-module navigation links, simulation controls, live readouts
- **Compatibility shim:** Legacy `setGameMode()` calls aliased to `switchTab()` so existing exercise JS works unmodified
- **File pattern:** `*_sim.js` (physics engine), `*_apps.js` / `*_apps_games.js` (exercises; files in modules 01, 08–15 are superseded legacy and not loaded), `*_equations.js` (MathJax), `*_embed.js` / `*_sections.js` (sub-tab content)

Module 00 is the exception — its Simulation tab is full-width (no sidebar) to preserve the immersive Three.js experience.

## Contributing

Contributions welcome! Ideas for new modules, challenges, or visual improvements:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

See `module-template.html` for the canonical module structure and `Rules.md` for agent guidelines.

## License

Academic project — MIT License.

---

*"The only way to learn physics is to do physics."*
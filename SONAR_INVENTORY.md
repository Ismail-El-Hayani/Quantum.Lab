# SonarQube Issue Inventory

Generated for quantum-lab cleanup session.

## 1. Long Functions (cognitive complexity)

| File | Function | Lines | Start Line |
|------|----------|-------|------------|
| modules/04_kronig_penney/kp_wavepacket_embed.js | wpCanvasEmbed() | 314 | 58 |
| modules/07_conductivity/cond_sim.js | condDrawFrame() | 269 | 276 |
| modules/08_superconductivity/sc_sim.js | initCooperAnimation() | 257 | 283 |
| modules/00_crystal_to_quantum/cq_sim.js | animate() | 210 | 1888 |
| modules/14_magnetism/mag_sim.js | drawIsing() | 207 | 370 |
| modules/09_intrinsic_semiconductors/is_sim.js | initIS3D() | 205 | 163 |
| modules/13_laser_physics/lp_sim.js | lpDrawSemiconductorCavity() | 193 | 266 |
| modules/11_junctions_devices/jd_sim.js | drawPNJunction() | 169 | 63 |
| modules/00_crystal_to_quantum/cq_sim.js | handlePhotonInteraction() | 165 | 1404 |
| modules/09_intrinsic_semiconductors/is_sim.js | updateIS3D() | 159 | 398 |
| modules/12_optics_dispersion/od_sim.js | animate() | 155 | 535 |
| modules/00_crystal_to_quantum/cq_sim.js | handleWaveCollision() | 147 | 1204 |
| modules/01_qho/qho_sim.js | updateAtomPlot() | 128 | 386 |
| modules/00_crystal_to_quantum/cq_sim.js | updatePhotons() | 115 | 840 |
| modules/04_kronig_penney/kp_wavepacket_embed.js | draw() | 115 | 192 |
| modules/15_thermal_properties/tp_canvas.js | stepPhysics() | 114 | 131 |
| modules/03_spin/spin_sim.js | initSpin() | 113 | 440 |
| modules/08_superconductivity/sc_sim.js | initMeissnerAnimation() | 113 | 545 |
| modules/15_thermal_properties/tp_canvas.js | drawFrame() | 111 | 275 |
| modules/12_optics_dispersion/od_sim.js | _odDrawSpectralScene() | 110 | 824 |
| modules/00_crystal_to_quantum/cq_sim.js | exciteAndEmit() | 104 | 1644 |
| modules/08_superconductivity/sc_sim.js | draw() | 104 | 552 |
| modules/08_superconductivity/sc_sim.js | initGapAnimation() | 93 | 664 |
| modules/13_laser_physics/lp_sim.js | lpDrawGasCavity() | 93 | 462 |
| modules/00_crystal_to_quantum/cq_sim.js | buildCluster() | 91 | 239 |
| modules/07_conductivity/cond_sim.js | condPhysicsStep() | 91 | 182 |
| modules/14_magnetism/mag_sim.js | initMagnetism() | 91 | 776 |
| modules/07_conductivity/cond_sim.js | condInitLattice() | 90 | 45 |
| modules/13_laser_physics/lp_sim.js | lpUpdatePhotons() | 90 | 142 |
| modules/08_superconductivity/sc_sim.js | physicsStep() | 89 | 414 |
| modules/00_crystal_to_quantum/cq_sim.js | buildEMWave() | 87 | 966 |
| modules/01_qho/qho_sim.js | initQHO() | 87 | 655 |
| modules/03_spin/spin_sim.js | plotBlochSphere() | 84 | 143 |
| modules/10_doped_semiconductors/ds_sim.js | drawBandDiagram() | 83 | 143 |
| modules/11_junctions_devices/jd_sim.js | drawZener() | 83 | 235 |
| modules/06_fermi_surface/fs_sim.js | fsDrawFrame() | 81 | 200 |
| modules/08_superconductivity/sc_sim.js | draw() | 81 | 674 |

## 2. innerHTML Variable Assignments (XSS risk)

- `shared_interactive.js:128` — `this.el.innerHTML = this.lines.map(function(l) {`
- `modules/00_crystal_to_quantum/cq_sim.js:1555` — `if (msg) msg.innerHTML = scaleLabel() + ': <span style="color:#00f0ff">' +`
- `modules/00_crystal_to_quantum/cq_sim.js:1564` — `if (msg) msg.innerHTML = scaleLabel() + ': <span style="color:#ff4ecd">' +`
- `modules/00_crystal_to_quantum/cq_sim.js:1745` — `if (msg2) msg2.innerHTML = scaleLabel() + ': <span style="color:#4ade80">' +`
- `modules/03_spin/spin_apps_games.js:516` — `btns.innerHTML = nextStage.next.map(function(opt, i) {`
- `modules/06_fermi_surface/fs_apps_games.js:51` — `if (earnedBadge) { div.innerHTML = b.icon + ' \u003cspan style="color:var(--accent-green);">' + b.na`
- `modules/07_conductivity/cond_apps_games.js:299` — `el.innerHTML = t.label;`
- `modules/07_conductivity/cond_apps_games.js:307` — `zone.innerHTML = z.label;`
- `modules/07_conductivity/cond_apps_games.js:310` — `if (got === z.ans) { zone.classList.add('correct'); zone.innerHTML = z.label + ' ✓'; }`
- `modules/08_superconductivity/sc_sim.js:189` — `elState.innerHTML = isSC ? '<span class="tc-badge">Superconducting</span>' : '<span class="normal-ba`
- `modules/12_optics_dispersion/od_sim.js:108` — `beamLegend.innerHTML = [`

## 3. Console Logs still in production code

- `modules/01_qho/qho_apps_games.js:10`
- `modules/01_qho/validate_module.js:10`
- `modules/01_qho/validate_module.js:11`
- `modules/01_qho/validate_module.js:12`
- `modules/01_qho/validate_module.js:115`
- `modules/01_qho/validate_module.js:116`
- `modules/03_spin/spin_apps.js:160`
- `modules/03_spin/spin_apps.js:176`
- `modules/03_spin/spin_apps_games.js:47`
- `modules/07_conductivity/cond_sim.js:160`
- `modules/09_intrinsic_semiconductors/is_sim.js:166`
- `modules/09_intrinsic_semiconductors/is_sim.js:845`
- `modules/12_optics_dispersion/od_sim.js:60`
- `modules/13_laser_physics/lp_sim.js:44`

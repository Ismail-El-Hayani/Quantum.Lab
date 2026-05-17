/**
 * shared_ui.js — Tooltip system + navigation guards for all modules
 * Loads once per page; adds tooltip CSS, registers parameter descriptions.
 */

(function(){
  'use strict';

  // Prevent re-loading
  if (window._sharedUI) return;
  window._sharedUI = true;

  // ====== TOOLTIP CSS ======
  if (!document.getElementById('shared-ui-css')) {
    var style = document.createElement('style');
    style.id = 'shared-ui-css';
    style.textContent = `
      .param-tip { position: relative; display: inline-block; cursor: help; border-bottom: 1px dashed rgba(128,128,160,0.3); transition: color 0.15s; }
      .param-tip:hover { color: var(--accent-cyan, #00f0ff); border-bottom-color: var(--accent-cyan, #00f0ff); }
      .param-tip .tip-bubble {
        display: none; position: absolute; bottom: calc(100% + 8px); left: 0; width: max-content; max-width: 340px;
        background: #1a1a28; color: #e0e0f0; padding: 0.7rem 1rem; border-radius: 10px;
        border: 1px solid #3a3a55; font-size: 0.78rem; line-height: 1.5; z-index: 10000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5); pointer-events: none;
        text-transform: none; letter-spacing: normal; font-weight: 400; text-align: left;
        white-space: normal;
      }
      .param-tip:hover .tip-bubble { display: block; }
      .param-tip .tip-bubble::after {
        content: ''; position: absolute; top: 100%; left: 16px; border: 6px solid transparent;
        border-top-color: #3a3a55;
      }
      .param-tip .tip-label { font-weight: 600; color: var(--accent-cyan, #00f0ff); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.3rem; }
      .param-tip .tip-unit { color: #8080a0; font-size: 0.7rem; }
    `;
    document.head.appendChild(style);
  }

  // ====== PARAMETER DATABASE ======
  var PARAM_DB = {
    // 01 QHO
    'Quantum number n':     'Energy level n = 0,1,2,… Higher n = more nodes, larger spatial extent. Real: phonon quanta in a solid',
    'Superposition (m)':    'Second state in ψ = (ψₙ + ψₘ)/√2. Set m=0 for pure eigenstate. Basis of quantum computing gates and wave packets',
    'Anharmonicity xₑ':   'Non-harmonic correction: Eᵥ = ħω[(v+½) - xₑ(v+½)²]. Real: H₂ xₑ≈0.03, CO xₑ≈0.006. Causes overtone compression',
    // 02 Hydrogen
    'Principal quantum number n': 'Eₙ = -13.6/n² eV. ⟨r⟩ ≈ n² a₀. Higher n = larger orbit. In quantum dots: n labels shell filling',
    'Angular momentum l': 'Shape: 0=s sphere, 1=p dumbbell, 2=d clover. Rule: 0 ≤ l < n. Determines orbital angular momentum',
    'Initial state nᵢ':   'Excited state electron occupies before decay. Spontaneous emission: photon carries energy ΔE = Eᵢ - Eբ',
    'Final state nբ':     'Lower state after transition. Selection rules: Δl = ±1. Example: 3→2 gives Hα at 656.3 nm',
    // 03 Spin
    'Polar angle θ':      'Bloch latitude. θ=0 = pure |↑⟩, θ=π/2 = equal superposition. NMR: set by RF pulse tip angle',
    'Azimuthal angle φ':  'Relative phase between |↑⟩ and |↓⟩. Controls precession axis. Ramsey: Δφ measures energy splitting',
    'Magnetic field B':   'Tesla. ν_Larmor = gμ_BB/h ≈ 28 GHz/T. ESR at 0.3 T → X-band ~9.5 GHz. NMR at 11.7 T → 500 MHz',
    // 04 KP
    'Barrier height V₀':  'Energy barrier in eV. Higher V₀ = less tunneling = wider gaps. Real semiconductors: E_g = 0.1–3 eV',
    'Lattice constant a': 'Well width in nm. Smaller a = stronger confinement = wider bands. Si a = 0.543 nm, Graphene a = 0.246 nm',
    'Barrier width b':    'Barrier width in nm. Wider b = less overlap = narrower bands. Superlattices: b controls miniband width',
    // 05 Bands
    'Hopping t':          'Nearest-neighbor transfer energy in eV. W = zt sets bandwidth. Si: t ≈ 1–2 eV, Graphene: t ≈ 2.7 eV',
    'On-site ε':          'Atomic orbital energy in eV. Shifts band rigidly. In alloys: disorder in ε creates Anderson localization',
    // 06 Fermi
    'Temperature T':      'Kelvin. Smearing width ≈ 4 k_BT around E_F. Cu at 300K: k_BT ≈ 25 meV ≪ E_F = 7 eV. Safe to approximate T=0',
    'Fermi energy E_F':   'Characteristic electron-gas energy. E_F = (ħ²/2m)(3π²n)^{2/3}. Cu: 7 eV → v_F = 1.6×10⁶ m/s',
    // 07 Conductivity
    'E field':            'Electric field V/nm. F = -eE drives drift. In wires: E = V/L. Household: ~10⁻⁴ V/m, nanodevices: ~10⁶ V/m',
    'Scattering time τ':  'Average collision time in fs. τ = λ/v_F. Cu at 300K: τ ≈ 27 fs, λ ≈ 40 nm. Pure Cu at 4K: τ ~ 10 ps'
  };

  // ====== APPLY TO CONTROL LABELS ======
  function wrapTooltips() {
    document.querySelectorAll('.control-label').forEach(function(el){
      if (el.classList.contains('param-tip')) return;
      var text = el.textContent.trim();
      var tip = PARAM_DB[text];
      if (!tip) {
        // Try stripping parenthesized content
        text = text.split('(')[0].trim();
        // Also strip subscript unicode
        text = text.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, '');
        tip = PARAM_DB[text];
      }
      if (tip) {
        el.classList.add('param-tip');
        var bubble = document.createElement('span');
        bubble.className = 'tip-bubble';
        bubble.innerHTML = '<div class="tip-label">' + text + '</div>' + tip;
        el.appendChild(bubble);
      }
    });
  }

  // ====== APPLY TO LIVE TABLE HEADERS ======
  function wrapTableTips() {
    document.querySelectorAll('th, td:first-child').forEach(function(el){
      if (el.parentElement.parentElement.tagName.toLowerCase() !== 'tbody') return;
      if (el.classList.contains('param-tip')) return;
      var text = el.textContent.trim();
      var tip = PARAM_DB[text];
      if (tip) {
        el.classList.add('param-tip');
        var bubble = document.createElement('span');
        bubble.className = 'tip-bubble';
        bubble.innerHTML = '<div class="tip-label">' + text + '</div>' + tip;
        el.appendChild(bubble);
      }
    });
  }

  // Run once now and on DOM mutations
  function applyAll() { wrapTooltips(); wrapTableTips(); }
  applyAll();
  new MutationObserver(applyAll).observe(document.body, { childList: true, subtree: true });

})();

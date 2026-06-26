/**
 * Thermal Properties — Apps wiring (tp_apps.js)
 * Playground wiring: Cv(T), κ(T), thermal expansion overlays.
 */
'use strict';

function tpExtraPlot(id, traces, layout, cfg) {
  const el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || { responsive: true, displayModeBar: false });
}

function animateTPPlots() {
  var ids = ['plot-cv','plot-kappa'];
  ids.forEach(function(id) {
    var el = document.getElementById(id); if (!el) return;
    Plotly.animate(id, null, { transition: { duration: 300, easing: 'cubic-in-out' }, frame: { duration: 300 } }).catch(function(){});
  });
}

function setupTPPlayground() {
  var sliders = ['slider-T-tp','slider-thetaD','slider-gamma'];
  sliders.forEach(function(k) {
    var el = document.getElementById(k); if (!el) return;
    el.addEventListener('input', function once() {
      try { animateTPPlots(); } catch(e){}
      if (window.__GameState) __GameState.addXP(1, 'tp_playground');
      el.removeEventListener('input', once);
    });
  });
  var sel = document.getElementById('select-type-tp');
  if (sel) {
    sel.addEventListener('change', function once() {
      if (window.__GameState) __GameState.addXP(2, 'tp_playground');
      sel.removeEventListener('change', once);
    });
  }

  var firstExplore = true;
  setTimeout(function() {
    if (firstExplore && window.__GameState) {
      firstExplore = false;
      __GameState.addXP(10, 'tp_first_explore');
      var badges = __GameState.get('achievements') || [];
      if (!badges.includes('tp-explorer')) {
        badges.push('tp-explorer');
        __GameState.set('achievements', badges);
      }
    }
  }, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupTPPlayground);
} else {
  setupTPPlayground();
}

function initTP() {
  if (typeof initThermal === 'function' && !window.__TP_thermalInited) { initThermal(); window.__TP_thermalInited = true; }
  if (typeof updateVisibleTPPlot === 'function') updateVisibleTPPlot(getActiveTPSubTab());
  if (typeof updateLiveTP === 'function') updateLiveTP();
}
window.initTP = initTP;

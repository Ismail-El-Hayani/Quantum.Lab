/**
 * Optics & Dispersion — Apps wiring (od_apps.js)
 * Playground wiring: Drude ε(ω), reflectivity, Lorentz model overlays.
 */
'use strict';

function odExtraPlot(id, traces, layout, cfg) {
  const el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || { responsive: true, displayModeBar: false });
}

function animateODPlots() {
  var ids = ['plot-drude','plot-reflectivity'];
  ids.forEach(function(id) {
    var el = document.getElementById(id); if (!el) return;
    Plotly.animate(id, null, { transition: { duration: 300, easing: 'cubic-in-out' }, frame: { duration: 300 } }).catch(function(){});
  });
}

function setupODPlayground() {
  var sliders = ['slider-wp','slider-gamma','slider-n-od','slider-kappa-od'];
  sliders.forEach(function(k) {
    var el = document.getElementById(k); if (!el) return;
    el.addEventListener('input', function() {
      try { animateODPlots(); } catch(e){}
      if (window.__GameState) __GameState.addXP(1, 'od_playground');
    });
  });

  var firstExplore = true;
  setTimeout(function() {
    if (firstExplore && window.__GameState) {
      firstExplore = false;
      __GameState.addXP(10, 'od_first_explore');
      var badges = __GameState.get('achievements') || [];
      if (!badges.includes('od-explorer')) {
        badges.push('od-explorer');
        __GameState.set('achievements', badges);
      }
    }
  }, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupODPlayground);
} else {
  setupODPlayground();
}

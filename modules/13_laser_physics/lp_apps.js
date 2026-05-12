/**
 * Laser Physics — Apps wiring (lp_apps.js)
 * Playground wiring: cavity modes, gain spectrum, linewidth overlays.
 */
'use strict';

function lpExtraPlot(id, traces, layout, cfg) {
  const el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || { responsive: true, displayModeBar: false });
}

function animateLPPlots() {
  var ids = ['plot-cavity','plot-gain'];
  ids.forEach(function(id) {
    var el = document.getElementById(id); if (!el) return;
    Plotly.animate(id, null, { transition: { duration: 300, easing: 'cubic-in-out' }, frame: { duration: 300 } }).catch(function(){});
  });
}

function setupLPPlayground() {
  var sliders = ['slider-Eg','slider-L','slider-n-lp','slider-R','slider-alpha'];
  sliders.forEach(function(k) {
    var el = document.getElementById(k); if (!el) return;
    el.addEventListener('input', function() {
      try { animateLPPlots(); } catch(e){}
      if (window.__GameState) __GameState.addXP(1, 'lp_playground');
    });
  });

  var firstExplore = true;
  setTimeout(function() {
    if (firstExplore && window.__GameState) {
      firstExplore = false;
      __GameState.addXP(10, 'lp_first_explore');
      var badges = __GameState.get('achievements') || [];
      if (!badges.includes('lp-explorer')) {
        badges.push('lp-explorer');
        __GameState.set('achievements', badges);
      }
    }
  }, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupLPPlayground);
} else {
  setupLPPlayground();
}

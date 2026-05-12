/**
 * Magnetism — Apps wiring (mag_apps.js)
 * Playground wiring: susceptibility, Curie-Weiss, hysteresis overlays.
 */
'use strict';

function magExtraPlot(id, traces, layout, cfg) {
  const el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || { responsive: true, displayModeBar: false });
}

function animateMAGPlots() {
  var ids = ['plot-susceptibility','plot-hysteresis'];
  ids.forEach(function(id) {
    var el = document.getElementById(id); if (!el) return;
    Plotly.animate(id, null, { transition: { duration: 300, easing: 'cubic-in-out' }, frame: { duration: 300 } }).catch(function(){});
  });
}

function setupMAGPlayground() {
  var sliders = ['slider-T-mag','slider-C','slider-theta','slider-Ms'];
  sliders.forEach(function(k) {
    var el = document.getElementById(k); if (!el) return;
    el.addEventListener('input', function() {
      try { animateMAGPlots(); } catch(e){}
      if (window.__GameState) __GameState.addXP(1, 'mag_playground');
    });
  });

  var firstExplore = true;
  setTimeout(function() {
    if (firstExplore && window.__GameState) {
      firstExplore = false;
      __GameState.addXP(10, 'mag_first_explore');
      var badges = __GameState.get('achievements') || [];
      if (!badges.includes('mag-explorer')) {
        badges.push('mag-explorer');
        __GameState.set('achievements', badges);
      }
    }
  }, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupMAGPlayground);
} else {
  setupMAGPlayground();
}

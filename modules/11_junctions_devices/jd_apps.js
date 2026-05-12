/**
 * Junctions & Devices — Apps wiring (jd_apps.js)
 * Playground wiring: band-diagram, diode I-V, depletion, solar cell overlays.
 */
'use strict';

function jdExtraPlot(id, traces, layout, cfg) {
  const el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || { responsive: true, displayModeBar: false });
}

function animateJDPlots() {
  var ids = ['plot-band-junction','plot-diode-iv','plot-depletion'];
  ids.forEach(function(id) {
    var el = document.getElementById(id); if (!el) return;
    Plotly.animate(id, null, { transition: { duration: 300, easing: 'cubic-in-out' }, frame: { duration: 300 } }).catch(function(){});
  });
}

function setupJDPlayground() {
  var sliders = ['slider-Na','slider-Nd','slider-T-jd','slider-Vbias','slider-Isc'];
  sliders.forEach(function(k) {
    var el = document.getElementById(k); if (!el) return;
    el.addEventListener('input', function() {
      try { animateJDPlots(); } catch(e){}
      if (window.__GameState) __GameState.addXP(1, 'jd_playground');
    });
  });

  var firstExplore = true;
  setTimeout(function() {
    if (firstExplore && window.__GameState) {
      firstExplore = false;
      __GameState.addXP(10, 'jd_first_explore');
      var badges = __GameState.get('achievements') || [];
      if (!badges.includes('jd-explorer')) {
        badges.push('jd-explorer');
        __GameState.set('achievements', badges);
      }
    }
  }, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupJDPlayground);
} else {
  setupJDPlayground();
}

/**
 * Doped Semiconductors — Apps wiring
 */
'use strict';
function animateDSPlots() {
  var ids = ['plot-fermi-shift','plot-carrier-temp','plot-conductivity-doped'];
  ids.forEach(function(id) {
    var el = document.getElementById(id); if (!el) return;
    Plotly.animate(id, null, { transition: { duration: 300, easing: 'cubic-in-out' }, frame: { duration: 300 } }).catch(function(){});
  });
}
function setupDSPlayground() {
  ['slider-Nd','slider-Na','slider-T-ds','select-material-ds','select-doping-type'].forEach(function(k) {
    var el = document.getElementById(k); if (!el) return;
    el.addEventListener('change', function() {
      try { animateDSPlots(); } catch(e){}
      if (window._GameState) _GameState.addXP(1, 'ds_playground');
    });
  });
  setTimeout(function() {
    if (window._GameState) { _GameState.addXP(10, 'ds_first_explore'); _GameState.earnedBadges.add('ds-explorer'); _GameState.save(); }
  }, 5000);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupDSPlayground); else setupDSPlayground();

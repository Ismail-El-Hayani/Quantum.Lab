/**
 * Junctions & Devices -- Apps wiring (jd_apps.js v2)
 * Playground wiring: device tabs, Canvas+Plotly refresh, slider handlers, XP rewards.
 */
'use strict';

function jdExtraPlot(id, traces, layout, cfg) {
  const el = document.getElementById(id);
  if (!el || typeof Plotly === 'undefined') return;
  Plotly.react(id, traces, layout, cfg || { responsive: true, displayModeBar: false });
}

function animateJDPlots() {
  var ids = ['plot-diode-iv','plot-zener-iv','plot-tunnel-iv','plot-mos-iv','plot-mos-iv-pmos','plot-transfer','plot-transfer-nmos','plot-transfer-pmos','plot-depletion','plot-depletion-zener','plot-depletion-tunnel'];
  ids.forEach(function(id) {
    var el = document.getElementById(id); if (!el || typeof Plotly === 'undefined') return;
    Plotly.animate(id, null, { transition: { duration: 300, easing: 'cubic-in-out' }, frame: { duration: 300 } }).catch(function(){});
  });
}

function setupJDPlayground() {
  var sliders = ['slider-Na','slider-Nd','slider-T-jd','slider-Vbias','slider-Isc','slider-Vgate'];
  sliders.forEach(function(k) {
    var el = document.getElementById(k); if (!el) return;
    el.addEventListener('input', function() {
      try { animateJDPlots(); } catch(e){}
      if (window.__GameState) __GameState.addXP(1, 'jd_playground');
    });
  });

  // device tab button styling helper (called from setJDDevice in sim)
  window._refreshDeviceTabs = function(activeDev){
    ['pn','zener','tunnel','nmos','pmos'].forEach(function(dev){
      var btn=document.getElementById('tab-'+dev);
      if(btn){ btn.classList.toggle('active', dev===activeDev); }
    });
  };

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

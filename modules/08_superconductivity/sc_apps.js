/**
 * Superconductivity — Apps (playground wiring)
 * Interactive playground plots: gap vs temp, magnetization, penetration depth.
 */

'use strict';

function scExtraPlot(id, traces, layout, cfg) {
  const el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || { responsive: true, displayModeBar: false });
}

function highlightCurrentState() {
  const T = scState.T;
  const Tc = scState.Tc;
  const gap0 = gapZero(Tc);
  const Hc = criticalField(T, Tc, scState.H0);
  const gapAnno = {
    x: T, y: gapRatio(T, Tc) * gap0,
    text: T < Tc ? 'SC: Δ(T) = ' + (gapRatio(T, Tc) * gap0).toFixed(2) + ' meV' : 'Normal: Δ = 0',
    font: { color: T < Tc ? '#00f0ff' : '#ff4ecd', size: 10 },
    showarrow: true, arrowhead: 2, ax: 30, ay: -30
  };
  const chiAnno = {
    x: T, y: susceptibility(T, Tc, scState.H),
    text: T < Tc && scState.H < Hc ? 'Meissner: χ = -1' : 'χ = 0',
    font: { color: T < Tc ? '#00f0ff' : '#ff4ecd', size: 10 },
    showarrow: true, arrowhead: 2, ax: 30, ay: -30
  };
  return { gapAnno, chiAnno };
}

function animateSCPlots() {
  const ids = ['plot-gap-temp', 'plot-magnetization', 'plot-penetration'];
  ids.forEach(function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    Plotly.animate(id, null, {
      transition: { duration: 300, easing: 'cubic-in-out' },
      frame: { duration: 300 }
    }).catch(function() {});
  });
}

function setupSCPlayground() {
  const sliderT = document.getElementById('slider-T-sc');
  const sliderH = document.getElementById('slider-H');
  const selectMat = document.getElementById('select-material-sc');

  if (sliderT) {
    sliderT.addEventListener('change', function() {
      try { animateSCPlots(); } catch (e) {}
      if (window._GameState) _GameState.addXP(1, 'sc_playground');
    });
  }
  if (sliderH) {
    sliderH.addEventListener('change', function() {
      try { animateSCPlots(); } catch (e) {}
      if (window._GameState) _GameState.addXP(1, 'sc_playground');
    });
  }
  if (selectMat) {
    selectMat.addEventListener('change', function() {
      try { animateSCPlots(); } catch (e) {}
      if (window._GameState) _GameState.addXP(2, 'sc_playground');
    });
  }

  let firstExplore = true;
  const checkFirst = function() {
    if (firstExplore && window._GameState) {
      firstExplore = false;
      _GameState.addXP(10, 'sc_first_explore');
      _GameState.earnedBadges.add('sc-explorer');
      _GameState.save();
    }
  };
  setTimeout(checkFirst, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSCPlayground);
} else {
  setupSCPlayground();
}

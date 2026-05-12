/**
 * Intrinsic Semiconductors — Apps (playground wiring)
 */

'use strict';

function isExtraPlot(id, traces, layout, cfg) {
  var el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || { responsive: true, displayModeBar: false });
}

function animateISPlots() {
  var ids = ['plot-carrier-density', 'plot-conductivity'];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    Plotly.animate(id, null, {
      transition: { duration: 300, easing: 'cubic-in-out' },
      frame: { duration: 300 }
    }).catch(function() {});
  });
}

function setupISPlayground() {
  var sliderT = document.getElementById('slider-T-is');
  var selectMat = document.getElementById('select-material-is');
  var sliderMue = document.getElementById('slider-mue');
  var sliderMuh = document.getElementById('slider-muh');

  if (sliderT) {
    sliderT.addEventListener('change', function() {
      try { animateISPlots(); } catch (e) {}
      if (window._GameState) _GameState.addXP(1, 'is_playground');
    });
  }
  if (selectMat) {
    selectMat.addEventListener('change', function() {
      try { animateISPlots(); } catch (e) {}
      if (window._GameState) _GameState.addXP(2, 'is_playground');
    });
  }
  if (sliderMue) {
    sliderMue.addEventListener('change', function() {
      try { animateISPlots(); } catch (e) {}
      if (window._GameState) _GameState.addXP(1, 'is_playground');
    });
  }
  if (sliderMuh) {
    sliderMuh.addEventListener('change', function() {
      try { animateISPlots(); } catch (e) {}
      if (window._GameState) _GameState.addXP(1, 'is_playground');
    });
  }

  var firstExplore = true;
  var checkFirst = function() {
    if (firstExplore && window._GameState) {
      firstExplore = false;
      _GameState.addXP(10, 'is_first_explore');
      _GameState.earnedBadges.add('is-explorer');
      _GameState.save();
    }
  };
  setTimeout(checkFirst, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupISPlayground);
} else {
  setupISPlayground();
}

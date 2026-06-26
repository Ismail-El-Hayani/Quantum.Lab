/**
 * Laser Physics — Apps wiring (lp_apps.js v5)
 * Playground interaction, XP hooks, mode-switching animation control.
 *
 * NOTE: setGameMode lives in ../../shared_games.js.  We do NOT redefine it here
 * — instead we wrap the shared version so animation start/stop still fires.
 */
'use strict';

(function() {
  // Wrap the shared setGameMode so lp_sim.js doesn't have to fight
  // for the same window.global.  This keeps shared_challenge/puzzle
  // hooks intact while adding our animation pause/resume.
  var _orig = window.setGameMode;
  if (_orig && typeof _orig === 'function') {
    window.setGameMode = function(mode) {
      _orig(mode);
      if (window.lpStartAnim && window.lpStopAnim) {
        if (mode === 'play') { lpStartAnim(); }
        else { lpStopAnim(); }
      }
    };
  }
})();

function setupLPPlayground() {
  // XP on any slider movement (pumping included)
  var sliders = ['slider-Eg','slider-L','slider-n-lp','slider-R','slider-alpha','slider-pumping'];
  sliders.forEach(function(k) {
    var el = document.getElementById(k);
    if (!el) return;
    el.addEventListener('input', function() {
      if (window.__GameState) __GameState.addXP(1, 'lp_playground');
    });
  });

  // First explore badge after 5s
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

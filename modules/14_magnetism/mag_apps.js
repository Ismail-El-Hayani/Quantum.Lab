/**
 * Magnetism — Apps wiring (mag_apps.js)
 * XP logging + playground setup only. All plotting lives in mag_sim.js.
 */
'use strict';

function setupMAGPlayground() {
  // XP logging pass-through for sliders that actually exist in the DOM.
  var sliders = ['slider-T-mag','slider-H','slider-J','slider-magnet-strength'];
  sliders.forEach(function(k){
    var el = document.getElementById(k); if (!el) return;
    // one-time XP bump on first interaction
    el.addEventListener('input', function once() {
      if (window.__GameState) __GameState.addXP(1, 'mag_playground');
      el.removeEventListener('input', once);
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

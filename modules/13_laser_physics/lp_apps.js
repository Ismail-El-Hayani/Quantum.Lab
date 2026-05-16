/**
 * Laser Physics — Apps wiring (lp_apps.js v4)
 * XP hooks, playground interaction wiring, mode switching.
 */
'use strict';

function setGameMode(mode) {
  ['play','challenge','puzzle'].forEach(function(m) {
    var sec = document.getElementById('section-' + m);
    var btn = document.getElementById('mode-' + m);
    if (sec) sec.style.display = (m === mode) ? 'block' : 'none';
    if (btn) {
      if (m === mode) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  if (window.lpStartAnim && window.lpStopAnim) {
    if (mode === 'play') lpStartAnim();
    else lpStopAnim();
  }
}

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

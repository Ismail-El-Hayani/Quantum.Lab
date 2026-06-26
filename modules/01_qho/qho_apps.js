/**
 * QHO Applications placeholder
 * Module 01 — Quantum Harmonic Oscillator
 * The current Module 01 layout keeps all interactive physics in the Playground,
 * Challenges and Puzzles tabs; no separate application panel is used.
 */
'use strict';

function factorial(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function linspace(a, b, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(a + i * (b - a) / (n - 1));
  return out;
}

function initQHOApps() {
  // No standalone app panels in this layout.
}

if (document.readyState !== 'loading') {
  setTimeout(initQHOApps, 0);
} else {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(initQHOApps, 0); });
}

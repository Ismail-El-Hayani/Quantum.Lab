/**
 * shared_lab.js — Unified Lab Bootstrapper for Quantum Lab
 * Tab switching, Lab Navigator, module jump, control initialization
 */
'use strict';

/* ── Lab Module Registry ── */
var LAB_MODULES = [
  { num: '00', slug: '00_crystal_to_quantum', title: 'Crystal → Quantum', icon: '💎' },
  { num: '01', slug: '01_qho', title: 'QHO', icon: '〰️' },
  { num: '02', slug: '02_hydrogen', title: 'Hydrogen Atom', icon: '⚛️' },
  { num: '03', slug: '03_spin', title: 'Spin & Measurement', icon: '🧲' },
  { num: '04', slug: '04_kronig_penney', title: 'Kronig-Penney Model', icon: '📐' },
  { num: '05', slug: '05_energy_bands', title: 'Energy Bands & DOS', icon: '📊' },
  { num: '06', slug: '06_fermi_surface', title: 'Fermi Surface', icon: '🌐' },
  { num: '07', slug: '07_conductivity', title: 'Electrical Conductivity', icon: '⚡' },
  { num: '08', slug: '08_superconductivity', title: 'Superconductivity', icon: '❄️' },
  { num: '09', slug: '09_intrinsic_semiconductors', title: 'Intrinsic Semiconductors', icon: '🔶' },
  { num: '10', slug: '10_doped_semiconductors', title: 'Doped Semiconductors', icon: '🔷' },
  { num: '11', slug: '11_junctions_devices', title: 'Junctions & Devices', icon: '🔌' },
  { num: '12', slug: '12_optics_dispersion', title: 'Optics & Dispersion', icon: '💡' },
  { num: '13', slug: '13_laser_physics', title: 'Laser Physics', icon: '🔦' },
  { num: '14', slug: '14_magnetism', title: 'Magnetism', icon: '🧿' },
  { num: '15', slug: '15_thermal_properties', title: 'Thermal Properties', icon: '🔥' },
];

/**
 * switchTab — Switch visible tab section
 * Removes .active from all tab buttons, adds it to the matching button,
 * shows the corresponding tab section, and initializes tab-specific logic.
 * @param {string} tabId — 'overview', 'simulation', 'exercises', etc.
 */
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  var targetBtn = document.querySelector('[data-tab="' + tabId + '"]');
  if (targetBtn) targetBtn.classList.add('active');

  document.querySelectorAll('.tab-section').forEach(function (section) {
    section.style.display = 'none';
  });
  var targetSection = document.getElementById('tab-' + tabId);
  if (targetSection) {
    targetSection.style.display = 'block';
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (tabId === 'simulation' && typeof window.initSimulation === 'function') {
    window.initSimulation();
  }
  if (tabId === 'exercises' && typeof window.initExercises === 'function') {
    window.initExercises();
  }
  if (tabId === 'theory' && typeof window.initTheory === 'function') {
    window.initTheory();
  }
}

/**
 * populateNavigator — Build the Lab Navigator sidebar listing all modules
 * @param {number|string} currentModule — Module number 0-15 for the active module
 */
function populateNavigator(currentModule) {
  var container = document.getElementById('lab-navigator');
  if (!container) return;

  var current = String(currentModule);
  var frag = document.createDocumentFragment();

  LAB_MODULES.forEach(function (mod) {
    var link = document.createElement('a');
    link.className = 'nav-link';
    if (mod.num === current) link.classList.add('current');
    link.href = '../' + mod.slug + '/index.html';
    link.textContent = mod.icon + ' ' + mod.num + ' — ' + mod.title;
    frag.appendChild(link);
  });

  container.appendChild(frag);
}

/**
 * initLabTabs — Initialize tab click handlers and activate default tab
 * @param {string} [defaultTab] — Optional tab to activate; falls back to
 *   body's data-tab attribute or the first active tab or first tab
 * @returns {function} Cleanup function that removes all event listeners
 */
function initLabTabs(defaultTab) {
  var body = document.body;
  var moduleNum = body.getAttribute('data-module');
  populateNavigator(moduleNum);

  var btns = document.querySelectorAll('.tab-btn');
  var handlers = [];

  btns.forEach(function (btn) {
    var handler = function () {
      var tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab);
    };
    btn.addEventListener('click', handler);
    handlers.push({ el: btn, handler: handler });
  });

  var tab = defaultTab || body.getAttribute('data-tab');
  if (!tab) {
    var activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn) {
      tab = activeBtn.getAttribute('data-tab');
    } else if (btns.length > 0) {
      tab = btns[0].getAttribute('data-tab');
    }
  }
  if (tab) switchTab(tab);

  return function cleanup() {
    handlers.forEach(function (h) {
      h.el.removeEventListener('click', h.handler);
    });
  };
}

/**
 * initModuleControls — Wire up slider controls for simulation
 * Looks for a global sliderConfig on the window and builds sliders
 * into the #sim-controls element.
 * @returns {object|null} SliderGroup instance or null
 */
function initModuleControls() {
  var container = document.getElementById('sim-controls');
  if (!container) return null;

  var config = window.sliderConfig;
  if (!config) return null;

  if (typeof window.SliderGroup !== 'function') {
    console.warn('[shared_lab] SliderGroup not available');
    return null;
  }

  return new window.SliderGroup(container, config);
}

/**
 * buildModuleJump — Populate the top-bar #module-jump <select> with
 * all 16 modules and navigate on change.
 * @param {number|string} currentModule — Current module number
 */
function buildModuleJump(currentModule) {
  var select = document.getElementById('module-jump');
  if (!select) return;

  var current = String(currentModule);

  LAB_MODULES.forEach(function (mod) {
    var opt = document.createElement('option');
    opt.value = mod.slug;
    opt.textContent = mod.num + ' — ' + mod.title;
    if (mod.num === current) opt.selected = true;
    select.appendChild(opt);
  });

  select.addEventListener('change', function () {
    var slug = select.value;
    if (slug) {
      window.location.href = '../' + slug + '/index.html';
    }
  });
}

/* ── Auto-initialization ── */
document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  var moduleNum = body.getAttribute('data-module') || '';

  initLabTabs();

  if (document.getElementById('module-jump')) {
    buildModuleJump(moduleNum);
  }
});

/* ── Expose to window ── */
window.switchTab = switchTab;
window.initLabTabs = initLabTabs;
window.populateNavigator = populateNavigator;
window.LAB_MODULES = LAB_MODULES;

/**
 * Intrinsic Semiconductors — Physics Engine (v1)
 * Band gap, carrier density, conductivity, Fermi level.
 * Units: T in K, Eg in eV, mobility in cm²/Vs, n in cm⁻³.
 */

'use strict';

var kB_eV = 8.617e-5;

var isState = {
  T: 300,
  Eg: 1.12,
  mu_e: 1400,
  mu_h: 450,
  material: 'Si',
  Nc: 2.8e19,
  Nv: 1.04e19
};

function intrinsicCarrierDensity(Eg, T, Nc, Nv) {
  // ni = sqrt(Nc*Nv) * exp(-Eg / (2*kB*T))
  var pref = Math.sqrt(Nc * Nv);
  var exponent = -Eg / (2 * kB_eV * T);
  return pref * Math.exp(exponent);
}

function conductivityIntrinsic(ni, mu_e, mu_h) {
  var q = 1.602e-19;
  return q * ni * (mu_e + mu_h);
}

function fermiMidGap(Eg) {
  return Eg / 2;
}

function _plotIS(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}

var IS_PLOT_CFG = { responsive: true, displayModeBar: false };

function isLayout(title, xtitle, ytitle, extra) {
  var base = {
    margin: { t: 25, r: 10, b: 45, l: 60 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 }
  };
  if (extra) { for (var k in extra) base[k] = extra[k]; }
  return base;
}

function plotCarrierDensity() {
  var T = [];
  var n = [];
  var Tc = isState.T;
  var Eg = isState.Eg;
  for (var t = 50; t <= 800; t += 10) {
    T.push(t);
    n.push(intrinsicCarrierDensity(Eg, t, isState.Nc, isState.Nv));
  }
  var currN = intrinsicCarrierDensity(Eg, Tc, isState.Nc, isState.Nv);

  _plotIS('plot-carrier-density', [
    { x: T, y: n, mode: 'lines', name: 'ni(T)',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    },
    { x: [Tc, Tc], y: [1e5, 1e20], mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' },
      name: 'Current T = ' + Tc.toFixed(0) + ' K'
    }
  ], isLayout(null, 'T (K)', 'ni (cm⁻³)', { yaxis: { type: 'log', range: [5, 20] } }), IS_PLOT_CFG);
}

function plotConductivity() {
  var T = [];
  var sig = [];
  var Eg = isState.Eg;
  var mu_e = isState.mu_e;
  var mu_h = isState.mu_h;
  for (var t = 50; t <= 800; t += 10) {
    T.push(t);
    var ni = intrinsicCarrierDensity(Eg, t, isState.Nc, isState.Nv);
    sig.push(conductivityIntrinsic(ni, mu_e, mu_h));
  }
  var currS = conductivityIntrinsic(intrinsicCarrierDensity(Eg, isState.T, isState.Nc, isState.Nv), mu_e, mu_h);

  _plotIS('plot-conductivity', [
    { x: T, y: sig, mode: 'lines', name: 'σ(T)',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    },
    { x: [isState.T, isState.T], y: [1e-12, currS * 100], mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' },
      name: 'Current T = ' + isState.T.toFixed(0) + ' K'
    }
  ], isLayout(null, 'T (K)', 'σ (S/cm)', { yaxis: { type: 'log', range: [-12, 2] } }), IS_PLOT_CFG);
}

function updateBandDiagram() {
  var container = document.getElementById('band-diagram');
  if (!container) return;
  // Remove old particles
  var old = container.querySelectorAll('.band-particle');
  old.forEach(function(el) { el.remove(); });

  var ni = intrinsicCarrierDensity(isState.Eg, isState.T, isState.Nc, isState.Nv);
  // Visual scale: max particles for visual feedback at high ni
  var count = Math.min(Math.round((Math.log10(ni) - 8) * 1.5), 20);
  if (isState.T < 50) count = 0;

  var conduction = container.querySelector('.band-conduction');
  var valence = container.querySelector('.band-valence');
  var w = container.clientWidth;
  var h = container.clientHeight;

  for (var i = 0; i < count; i++) {
    var eDot = document.createElement('div');
    eDot.className = 'band-particle electron-dot';
    eDot.style.left = (Math.random() * (w - 20) + 10) + 'px';
    eDot.style.top = (Math.random() * (h * 0.38) + 6) + 'px';
    container.appendChild(eDot);

    var hDot = document.createElement('div');
    hDot.className = 'band-particle hole-dot';
    hDot.style.left = (Math.random() * (w - 20) + 10) + 'px';
    hDot.style.bottom = (Math.random() * (h * 0.38) + 6) + 'px';
    container.appendChild(hDot);
  }
}

function updateLiveIS() {
  var ni = intrinsicCarrierDensity(isState.Eg, isState.T, isState.Nc, isState.Nv);
  var sig = conductivityIntrinsic(ni, isState.mu_e, isState.mu_h);
  var ef = fermiMidGap(isState.Eg);

  var elN = document.getElementById('live-n');
  if (elN) elN.textContent = ni.toExponential(2) + ' cm⁻³';

  var elEf = document.getElementById('live-ef');
  if (elEf) elEf.textContent = ef.toFixed(2) + ' eV';

  var elSig = document.getElementById('live-sigma');
  if (elSig) elSig.textContent = sig.toExponential(2) + ' S/cm';

  var elReg = document.getElementById('live-regime');
  if (elReg) {
    var html = (isState.Eg < 3) ? '<span class="tc-badge">Semiconductor</span>' : '<span class="normal-badge">Insulator</span>';
    elReg.innerHTML = html;
  }

  updateBandDiagram();
}

function setMaterialIS(Eg, Nc, Nv, name) {
  isState.Eg = Eg;
  isState.Nc = Nc;
  isState.Nv = Nv;
  isState.material = name;
}

function initIntrinsicSemi() {
  var sliderT = document.getElementById('slider-T-is');
  var selectMat = document.getElementById('select-material-is');
  var sliderMue = document.getElementById('slider-mue');
  var sliderMuh = document.getElementById('slider-muh');

  if (sliderT) {
    sliderT.addEventListener('input', function() {
      isState.T = parseFloat(this.value);
      var el = document.getElementById('val-T-is');
      if (el) el.textContent = isState.T.toFixed(0);
      plotCarrierDensity(); plotConductivity(); updateLiveIS();
    });
  }

  if (selectMat) {
    selectMat.addEventListener('change', function() {
      var Eg = parseFloat(this.value);
      var name = this.options[this.selectedIndex].text;
      var Nc = 2.8e19, Nv = 1.04e19;
      if (Eg === 0.67) { Nc = 1.04e19; Nv = 6.0e18; }
      else if (Eg === 3.4) { Nc = 2.3e18; Nv = 4.6e18; }
      else if (Eg === 1.42) { Nc = 4.7e17; Nv = 7.0e18; }
      else if (Eg === 2.4) { Nc = 3.0e18; Nv = 1.3e19; }
      else if (Eg === 5.5) { Nc = 1.0e18; Nv = 1.0e18; }
      setMaterialIS(Eg, Nc, Nv, name.split('—')[0].trim());
      var el = document.getElementById('val-Eg');
      if (el) el.textContent = Eg.toFixed(2);
      plotCarrierDensity(); plotConductivity(); updateLiveIS();
    });
  }

  if (sliderMue) {
    sliderMue.addEventListener('input', function() {
      isState.mu_e = parseFloat(this.value);
      var el = document.getElementById('val-mue');
      if (el) el.textContent = isState.mu_e.toFixed(0);
      plotConductivity(); updateLiveIS();
    });
  }

  if (sliderMuh) {
    sliderMuh.addEventListener('input', function() {
      isState.mu_h = parseFloat(this.value);
      var el = document.getElementById('val-muh');
      if (el) el.textContent = isState.mu_h.toFixed(0);
      plotConductivity(); updateLiveIS();
    });
  }

  plotCarrierDensity(); plotConductivity(); updateLiveIS();
}

initIntrinsicSemi();
window.initIntrinsicSemi = initIntrinsicSemi;

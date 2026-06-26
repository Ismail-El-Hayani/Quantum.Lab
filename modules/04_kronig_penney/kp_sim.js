/**
 * Kronig-Penney Model — Physics Engine
 * Exact transcendental equation solver for 1D periodic square-well potential.
 * Now includes Finite Barrier Tunneling visualization.
 * Units: m = ħ = 1 (natural), energy in ħ²/ma², length in a.
 */

'use strict';

// ============ STATE ============
let state = { V0:5, b:0.2, a:1.0, E:2.0, scheme:'reduced', numK:200 };

// Cache for solveBands so plotBands + updateLiveReadouts share one computation
let __kpBandsCache = { key: null, result: null };

// ============ PHYSICS ============

// Solve for Periodic Bands (Kronig-Penney Transcendental)
function rhs(E, V0, a, b) {
  if(E<=0) return Infinity;
  const w = a - b;
  const alpha = Math.sqrt(2*E);
  if(E < V0) {
    const beta = Math.sqrt(2*(V0-E));
    if(alpha<1e-10 || beta<1e-10) return Infinity;
    return Math.cos(alpha*w)*Math.cosh(beta*b) + (beta*beta - alpha*alpha)/(2*alpha*beta)*Math.sin(alpha*w)*Math.sinh(beta*b);
  } else {
    const bp = Math.sqrt(2*(E-V0));
    if(alpha<1e-10 || bp<1e-10) return Infinity;
    return Math.cos(alpha*w)*Math.cos(bp*b) - (bp*bp + alpha*alpha)/(2*alpha*bp)*Math.sin(alpha*w)*Math.sin(bp*b);
  }
}

function bisect(fn, target, lo, hi, eps) {
  eps = eps || 1e-6;
  let flo = fn(lo) - target, fhi = fn(hi) - target;
  if(flo*fhi > 0) return null;
  for(let i=0;i<50;i++){
    let mid=(lo+hi)/2, fmid=fn(mid)-target;
    if(Math.abs(fmid)<eps) return mid;
    if(flo*fmid<0){hi=mid;fhi=fmid;}
    else{lo=mid;flo=fmid;}
  }
  return (lo+hi)/2;
}

function solveBands(V0, a, b, numK) {
  const key = [V0, a, b, numK].join('|');
  if (__kpBandsCache.key === key) return __kpBandsCache.result;

  const kvals = [];
  for(let i=0;i<numK;i++) kvals.push(-Math.PI/a + 2*Math.PI/a * i/(numK-1));
  const bands = [[],[],[],[],[]];
  const dE = 0.015, Emax = V0 + 6;

  for(let ik=0; ik<kvals.length; ik++){
    let k = kvals[ik];
    let target = Math.cos(k*a);
    let roots = [];
    let Eprev = 0.005;
    let fprev = rhs(Eprev,V0,a,b) - target;
    for(let E=0.02; E<Emax; E+=dE){
      let f = rhs(E,V0,a,b) - target;
      if(fprev*f < 0){
        let r = bisect((e)=>rhs(e,V0,a,b), target, E-dE, E);
        if(r!==null) roots.push(r);
      }
      fprev = f; Eprev = E;
    }
    roots.sort((a,b)=>a-b);
    for(let ib=0; ib<Math.min(roots.length,5); ib++){
      bands[ib].push({k:k, E:roots[ib]});
    }
  }
  __kpBandsCache = { key: key, result: {kvals, bands} };
  return __kpBandsCache.result;
}

/**
 * Tunneling Physics Solver
 * Calculates the wave function psi(x) for a single barrier of width 'w' at x=[0, w].
 * Uses exact stationary-state matching. Three regions:
 *   I   (x < 0):       ψ_I   = A e^{ikx} + B e^{-ikx}
 *   II  (0 ≤ x ≤ w):   ψ_II  = C e^{κx} + D e^{-κx}   (E < V₀, κ = √(2m(V₀−E))/ℏ)
 *                      ψ_II  = C e^{ik'x} + D e^{-ik'x} (E > V₀, k' = √(2m(E−V₀))/ℏ)
 *   III (x > w):       ψ_III = F e^{ik(x−w)}
 *
 * Transmission coefficient (exact, from continuity at x=0 and x=w):
 *   E < V₀:   T = [1 + V₀² sinh²(κw) / (4E(V₀−E))]⁻¹
 *   E > V₀:   T = [1 + V₀² sin²(k'w)  / (4E(E−V₀))]⁻¹
 *   E = V₀:   T = [1 + V₀w²/2]⁻¹          (limit of both branches)
 * Reflection: R = 1 − T, but the reflection amplitude B is complex.
 * The visual below is a qualitative real-part sketch, not the exact matching solution.
 */
function solveTunneling(E, V0, w, x_range) {
  const k = Math.sqrt(2 * E);
  let psi_real = [], psi_prob = [], potential = [];

  // Exact transmission coefficient T
  let T;
  if (E < V0) {
    const kappa = Math.sqrt(2 * (V0 - E));
    // T = [1 + V0² sinh²(κw) / (4E(V0−E))]⁻¹
    T = 1 / (1 + Math.pow(V0, 2) * Math.pow(Math.sinh(kappa * w), 2) / (4 * E * (V0 - E)));
  } else if (E > V0) {
    const k_prime = Math.sqrt(2 * (E - V0));
    // T = [1 + V0² sin²(k'w) / (4E(E−V0))]⁻¹
    T = 1 / (1 + Math.pow(V0, 2) * Math.pow(Math.sin(k_prime * w), 2) / (4 * E * (E - V0)));
  } else {
    // E = V0 limit: both E<V0 and E>V0 formulas converge to T = 1/(1 + V0*w²/2)
    T = 1 / (1 + 0.5 * V0 * w * w);
  }

  // Visualization uses a qualitative real-part sketch (not exact matching)
  // Region I:  Re(ψ) ≈ cos(kx−ωt) + √R·cos(−kx−ωt)  (interference fringes)
  // Region II: Re(ψ) ≈ cos(ωt)·exp(−κx)  for E<V0  (exponential decay)
  //            Re(ψ) ≈ cos(k'x−ωt)        for E>V0  (oscillation inside barrier)
  // Region III: Re(ψ) ≈ √T·cos(k(x−w)−ωt)
  const A = 1.0;
  const time = Date.now() * 0.002;

  x_range.forEach(x => {
    let val = 0;
    let prob = 0;

    if (x < 0) {
      // Region I: Incident + Reflected  →  |ψ|² = 1 + R + 2√R·cos(2kx)
      const R = Math.sqrt(1 - T);
      val = A * (Math.cos(k * x - time) + R * Math.cos(-k * x - time));
      prob = A * A * (1 + R * R + 2 * R * Math.cos(2 * k * x));
    } else if (x >= 0 && x <= w) {
      // Region II: Inside Barrier
      if (E < V0) {
        const kappa = Math.sqrt(2 * (V0 - E));
        // Evanescent wave: |ψ|² ∝ exp(−2κx), decay length = 1/(2κ)
        const decay = Math.exp(-kappa * x);
        val = A * Math.cos(time) * decay;
        prob = A * A * Math.exp(-2 * kappa * x);
      } else {
        const k_prime = Math.sqrt(2 * (E - V0));
        // E > V0: propagating inside barrier
        val = A * Math.cos(k_prime * x - time);
        prob = A * A;
      }
    } else {
      // Region III: Transmitted
      const F = Math.sqrt(T);
      val = F * Math.cos(k * (x - w) - time);
      prob = F * F;
    }
    psi_real.push(val);
    psi_prob.push(prob);
    potential.push((x >= 0 && x <= w) ? V0 : 0);
  });

  return { psi_real, psi_prob, potential, T };
}

// ============ PLOTTING ============
function plotPotential(){
  let x=[], V=[];
  const a=state.a, b=state.b, V0=state.V0;
  for(let xi=-2*a; xi<=2*a; xi+=0.01){
    let xa = xi - Math.floor(xi/a)*a;
    if(xa<0) xa += a;
    x.push(xi); V.push(xa < b ? V0 : 0);
  }
  _plot('plot-potential',[
    {x:x,y:V,mode:'lines',fill:'tozeroy',fillcolor:'rgba(179,136,255,0.15)',line:{color:'#c084fc',width:2},name:'V(x)'}
  ],{
    margin:{t:20,r:10,b:40,l:50},
    paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',
    font:{family:'JetBrains Mono,monospace',color:'#8080a0',size:11},
    xaxis:{title:'x (lattice units)',color:'#505070',gridcolor:'#1a1a28'},
    yaxis:{title:'V(x)',color:'#505070',gridcolor:'#1a1a28'},
    showlegend:false
  },{responsive:true,displayModeBar:false});
}

function plotTunneling() {
  const x_vals = [];
  for(let x=-2; x<=4; x+=0.02) x_vals.push(x);

  // Single barrier at [0, b] for visual simplicity (using a as scale)
  const w = state.b;
  const { psi_real, psi_prob, potential, T } = solveTunneling(state.E, state.V0, w, x_vals);

  const traces = [
    {
      x: x_vals, y: potential, mode: 'lines',
      line: {color: '#c084fc', width: 2 },
      name: 'Potential V(x)', fill: 'tozeroy', fillcolor: 'rgba(192,132,252,0.1)'
    },
    {
      x: x_vals, y: psi_real, mode: 'lines',
      line: {color: '#00f0ff', width: 2 },
      name: 'Re(ψ)',
    },
    {
      x: x_vals, y: psi_prob, mode: 'lines',
      line: {color: '#ff4ecd', width: 2, dash: 'dot' },
      name: '|ψ|²',
    }
  ];

  const layout = {
    margin:{t:20,r:10,b:40,l:50},
    paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',
    font:{family:'JetBrains Mono,monospace',color:'#8080a0',size:11},
    xaxis:{title:'x',color:'#505070',gridcolor:'#1a1a28'},
    yaxis:{title:'Amplitude',color:'#505070',gridcolor:'#1a1a28', range: [-1.5, 2.5]},
    legend:{x:0.02,y:0.98,bgcolor:'rgba(10,10,15,0.8)',bordercolor:'#2a2a3a',borderwidth:1},
    hovermode:'closest'
  };

  _plot('plot-tunneling', traces, layout, {responsive:true,displayModeBar:false});
}

const colors = ['#00f0ff','#c084fc','#ff4ecd','#4ade80','#ffd740'];
function plotBands(){
  const {kvals, bands} = solveBands(state.V0, state.a, state.b, state.numK);
  const traces = [];

  for(let ib=0; ib<bands.length; ib++){
    if(bands[ib].length<3) continue;
    let x = bands[ib].map(p=>p.k);
    let y = bands[ib].map(p=>p.E);
    let label = ib===0 ? 'VB' : ib===1 ? 'CB' : 'Band '+(ib+1);
    traces.push({
      x:x, y:y, mode:'lines',
      name:label,
      line:{color:colors[ib%colors.length],width:2}
    });
  }

  if(state.scheme==='reduced'){
    let xfre = [], yfre = [];
    for(let k=-Math.PI/state.a; k<=Math.PI/state.a; k+=0.01){
      xfre.push(k); yfre.push(k*k/2);
    }
    traces.push({x:xfre,y:yfre,mode:'lines',name:'Free e⁻',line:{color:'rgba(255,255,255,0.2)',width:1.5,dash:'dot'}});
  }

  traces.push({x:[-Math.PI/state.a,-Math.PI/state.a],y:[0,state.V0*1.5],mode:'lines',name:'BZ edge',line:{color:'rgba(255,255,255,0.15)',width:1}});
  traces.push({x:[Math.PI/state.a,Math.PI/state.a],y:[0,state.V0*1.5],mode:'lines',showlegend:false,line:{color:'rgba(255,255,255,0.15)',width:1}});

  let ymax = Math.max(state.V0+2, ...bands.flat().map(p=>p.E));
  let layout = {
    margin:{t:25,r:10,b:40,l:55},
    paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',
    font:{family:'JetBrains Mono,monospace',color:'#8080a0',size:11},
    xaxis:{title:'k (π/a)',color:'#505070',gridcolor:'#1a1a28'},
    yaxis:{title:'E (ℏ²/ma²)',color:'#505070',gridcolor:'#1a1a28'},
    legend:{x:0.02,y:0.98,bgcolor:'rgba(10,10,15,0.8)',bordercolor:'#2a2a3a',borderwidth:1},
    hovermode:'x unified'
  };

  if(state.scheme==='reduced'){
    layout.xaxis.tickmode = 'array';
    layout.xaxis.tickvals = [-Math.PI/state.a, 0, Math.PI/state.a];
    layout.xaxis.ticktext = ['-1','0','+1'];
    layout.xaxis.range = [-Math.PI/state.a, Math.PI/state.a];
    layout.xaxis.autorange = false;
  }

  if(state.scheme==='extended'){
    const extTraces=[];
    for(let ib=0; ib<bands.length; ib++){
      if(bands[ib].length<3) continue;
      let base = bands[ib];
      [-2,-1,0,1,2].forEach(n=>{
        let shift = n*2*Math.PI/state.a;
        extTraces.push({
          x: base.map(p=>p.k + shift),
          y: base.map(p=>p.E),
          mode:'lines',
          name: 'Band '+(ib+1)+' (n='+n+')',
          line: {color: colors[ib%colors.length], width: 1.5, dash: n===0 ? 'solid' : 'dot'}
        });
      });
    }
    // Replace traces with extended ones + BZ edges
    traces.length = 0;
    traces.push(...extTraces);
    traces.push({x:[-Math.PI/state.a,-Math.PI/state.a],y:[0,ymax],mode:'lines',name:'BZ edge',line:{color:'rgba(255,255,255,0.15)',width:1}});
    traces.push({x:[Math.PI/state.a,Math.PI/state.a],y:[0,ymax],mode:'lines',showlegend:false,line:{color:'rgba(255,255,255,0.15)',width:1}});
    // Extended zone: keep a clean x-axis across all repeated zones
    layout.xaxis.tickmode = 'array';
    layout.xaxis.tickvals = [-5,-4,-3,-2,-1,0,1,2,3,4,5].map(v=>v*Math.PI/state.a);
    layout.xaxis.ticktext = ['-5','-4','-3','-2','-1','0','+1','+2','+3','+4','+5'];
    layout.xaxis.autorange = true;
  }

  layout.yaxis.range = [0, ymax*1.05];
  _plot('plot-bands', traces, layout, {responsive:true,displayModeBar:false});
}

// ============ RESPONSIVE RESIZE WHEN PLAYGROUND BECOMES VISIBLE ============
var _kpPlotIds = ['plot-potential', 'plot-tunneling', 'plot-bands'];
function _resizeKPPlots() {
  if (typeof Plotly === 'undefined') return;
  var section = document.getElementById('section-play');
  if (!section || section.style.display === 'none') return;
  _kpPlotIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el && el.data) {
      try { Plotly.Plots.resize(el); } catch(e) {}
    }
  });
}
window.addEventListener('resize', _resizeKPPlots);

var _kpPlayObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(m) {
    if (m.attributeName === 'style' && m.target.id === 'section-play') {
      if (m.target.style.display !== 'none') {
        // If init deferred updateAll, run it in the next frame so the click stays responsive.
        if (_kpUpdatePending) {
          _kpUpdatePending = false;
          requestAnimationFrame(updateAll);
        }
        _resizeKPPlots();
        setTimeout(_resizeKPPlots, 50);
        setTimeout(_resizeKPPlots, 150);
      }
    }
  });
});
if (document.getElementById('section-play')) {
  _kpPlayObserver.observe(document.getElementById('section-play'), { attributes: true });
}

// ============ UI ============
// Track which plots need a full rebuild (vs just resize) when their sub-tab is shown.
var _plotDirty = { potential: false, tunneling: false, bands: false };

function setPlayMode(mode) {
  var modes = ['potential', 'tunneling', 'bands'];
  modes.forEach(function(m) {
    var btn = document.getElementById('pg-mode-' + m);
    var view = document.getElementById('pg-view-' + m);
    if (btn) btn.classList.toggle('active', m === mode);
    if (view) view.style.display = (m === mode ? '' : 'none');
  });
  // Show/hide sidebar controls depending on which canvas is active
  document.querySelectorAll('.pg-control-scope').forEach(function(el) {
    var show = el.classList.contains('scope-global');
    if (mode === 'tunneling' && el.classList.contains('scope-tunneling')) show = true;
    if (mode === 'bands' && el.classList.contains('scope-bands')) show = true;
    el.style.display = show ? '' : 'none';
  });
  // Build or rebuild the plot for this sub-tab.
  var plotMap = { potential: plotPotential, tunneling: plotTunneling, bands: plotBands };
  var idMap = { potential: 'plot-potential', tunneling: 'plot-tunneling', bands: 'plot-bands' };
  var el = document.getElementById(idMap[mode]);
  if (!el) return;
  if (!el.children.length || _plotDirty[mode]) {
    // First time shown, or slider values changed since last build.
    plotMap[mode]();
    _plotDirty[mode] = false;
  } else if (typeof Plotly !== 'undefined') {
    // Plot is current — just resize to fill the now-visible container.
    requestAnimationFrame(function() { Plotly.Plots.resize(el); });
    setTimeout(function() { Plotly.Plots.resize(el); }, 60);
  }
}
window.setPlayMode = setPlayMode;

function initPlaygroundControls() {
  // Default to potential view on first load
  setPlayMode('potential');
}

function setScheme(s){
  state.scheme = s;
  var btnR = document.getElementById('btn-reduced');
  var btnE = document.getElementById('btn-extended');
  if(btnR) btnR.classList.toggle('active', s==='reduced');
  if(btnE) btnE.classList.toggle('active', s==='extended');
  updateAll();
}
window.setScheme = setScheme;

function _fmtVal(value, unit) {
  var num = Number(value).toFixed(1);
  if (unit) return num + ' \u003cspan class="unit-tag"\u003e' + unit + '\u003c/span\u003e';
  return num;
}

// updateAll: rebuilds the visible plot + live readouts.
// Marks non-visible plots as dirty so they get rebuilt when their sub-tab is activated.
// Called on slider 'change' (drag end) and on first Playground open.
function updateAll(){
  // Only rebuild the plot that is actually visible — the other two
  // will be rebuilt on-demand when their sub-tab is activated.
  updateVisiblePlayground();
  // Mark the other two plots as dirty (data changed, need rebuild on next show).
  var active = getActivePlayMode();
  var allModes = ['potential', 'tunneling', 'bands'];
  for (var i = 0; i < allModes.length; i++) {
    if (allModes[i] !== active) _plotDirty[allModes[i]] = true;
  }
  // Live readouts always update (cheap thanks to solveBands cache).
  updateLiveReadouts(state.V0, state.a, state.b);
}
window.updateAll = updateAll;

// Fast update: only the playground sub-tab that is currently visible
function getActivePlayMode() {
  var modes = ['potential', 'tunneling', 'bands'];
  for (var i = 0; i < modes.length; i++) {
    var btn = document.getElementById('pg-mode-' + modes[i]);
    if (btn && btn.classList.contains('active')) return modes[i];
  }
  return 'potential';
}

function updateVisiblePlayground() {
  var mode = getActivePlayMode();
  if (mode === 'potential') plotPotential();
  else if (mode === 'tunneling') plotTunneling();
  else if (mode === 'bands') plotBands();
}
window.updateVisiblePlayground = updateVisiblePlayground;

// Animation loop for tunneling — only draw when tunneling tab is active
function animateTunneling() {
  if (getActivePlayMode() === 'tunneling') {
    plotTunneling();
  }
  requestAnimationFrame(animateTunneling);
}
window.animateTunneling = animateTunneling;

// Live readout updater
// Effective mass m* = ℏ² / (d²E/dk²) computed at the band minimum (not mid-array)
function updateLiveReadouts(V0, a, b) {
  var result;
  if (typeof solveBands === 'function') {
    result = solveBands(V0, a, b, 200);
  }
  if (!result) return;
  var bands = result.bands;
  var gaps = [];
  var widths = [];
  var masses = [];

  // Helper: compute d²E/dk² at the band minimum (edge-safe)
  function massAtBandMin(band) {
    if (!band || band.length < 5) return '—';
    var E_vals = band.map(function(p){ return p.E; });
    var min_idx = E_vals.indexOf(Math.min.apply(null, E_vals));
    var dk = band[1].k - band[0].k;
    if (Math.abs(dk) < 1e-10) return '—';
    var d2E;
    if (min_idx === 0) {
      d2E = (band[2].E - 2*band[1].E + band[0].E) / (dk*dk);
    } else if (min_idx >= band.length - 1) {
      d2E = (band[band.length-1].E - 2*band[band.length-2].E + band[band.length-3].E) / (dk*dk);
    } else {
      d2E = (band[min_idx+1].E - 2*band[min_idx].E + band[min_idx-1].E) / (dk*dk);
    }
    return d2E > 1e-10 ? (1/d2E).toFixed(3) : '—';
  }

  for (var ib = 0; ib < 4; ib++) {
    // Gaps and widths require both band ib and ib+1
    if (bands[ib] && bands[ib].length > 2 && bands[ib+1] && bands[ib+1].length > 2) {
      var top = Math.max.apply(null, bands[ib].map(function(p){ return p.E; }));
      var bot = Math.min.apply(null, bands[ib+1].map(function(p){ return p.E; }));
      gaps.push(bot - top);
      var botBand = Math.min.apply(null, bands[ib].map(function(p){ return p.E; }));
      widths.push(top - botBand);
    } else {
      gaps.push(null); widths.push(null);
    }
    // Effective mass only needs band ib itself
    masses.push(massAtBandMin(bands[ib]));
  }
  var el1 = document.getElementById('live-gap1'); if (el1) el1.textContent = (gaps[0] !== null ? gaps[0].toFixed(3) : '—');
  var el2 = document.getElementById('live-gap2'); if (el2) el2.textContent = (gaps[1] !== null ? gaps[1].toFixed(3) : '—');
  var el3 = document.getElementById('live-width1'); if (el3) el3.textContent = (widths[0] !== null ? widths[0].toFixed(3) : '—');
  var el4 = document.getElementById('live-width2'); if (el4) el4.textContent = (widths[1] !== null ? widths[1].toFixed(3) : '—');
  var el5 = document.getElementById('live-mass1'); if (el5) el5.textContent = masses[0];
  var el6 = document.getElementById('live-mass2'); if (el6) el6.textContent = masses[1];
}
window.updateLiveReadouts = updateLiveReadouts;

// ============ INIT ============
function initKP() {
  var sliderV0 = document.getElementById('slider-v0');
  var sliderB = document.getElementById('slider-b');
  var sliderA = document.getElementById('slider-a');
  var sliderE = document.getElementById('slider-e');

  var fastUpdatePending = false;
  var fullUpdateTimeout = null;

  function scheduleFastUpdate() {
    if (fastUpdatePending) return;
    fastUpdatePending = true;
    requestAnimationFrame(function() {
      fastUpdatePending = false;
      updateVisiblePlayground();
    });
  }

  function scheduleFullUpdate() {
    if (fullUpdateTimeout) clearTimeout(fullUpdateTimeout);
    fullUpdateTimeout = setTimeout(function() {
      fullUpdateTimeout = null;
      updateAll();
    }, 120);
  }

  function onSliderInput() {
    scheduleFastUpdate();
    scheduleFullUpdate();
  }

  function onSliderChange() {
    if (fullUpdateTimeout) clearTimeout(fullUpdateTimeout);
    fullUpdateTimeout = null;
    updateAll();
  }

  if(sliderV0){
    sliderV0.addEventListener('input',function(){
      state.V0 = parseFloat(this.value);
      var el = document.getElementById('val-v0'); if(el) el.innerHTML = _fmtVal(state.V0, 'ℏ²/ma²');
      onSliderInput();
    });
    sliderV0.addEventListener('change', onSliderChange);
  }
  if(sliderB){
    sliderB.addEventListener('input',function(){
      state.b = parseFloat(this.value) * state.a;
      var el = document.getElementById('val-b'); if(el) el.textContent = (state.b/state.a).toFixed(2);
      onSliderInput();
    });
    sliderB.addEventListener('change', onSliderChange);
  }
  if(sliderA){
    sliderA.addEventListener('input',function(){
      let ratio = state.b / state.a;
      state.a = parseFloat(this.value);
      state.b = ratio * state.a;
      var elA = document.getElementById('val-a'); if(elA) elA.innerHTML = _fmtVal(state.a, 'a');
      var elB = document.getElementById('val-b'); if(elB) elB.textContent = ratio.toFixed(2);
      onSliderInput();
    });
    sliderA.addEventListener('change', onSliderChange);
  }
  if(sliderE){
    sliderE.addEventListener('input',function(){
      state.E = parseFloat(this.value);
      var el = document.getElementById('val-e'); if(el) el.innerHTML = _fmtVal(state.E, 'ℏ²/ma²');
      onSliderInput();
    });
    sliderE.addEventListener('change', onSliderChange);
  }

  var btnRed = document.getElementById('btn-reduced');
  var btnExt = document.getElementById('btn-extended');
  if (btnRed) {
    btnRed.addEventListener('click', function() {
      setScheme('reduced');
    });
  }
  if (btnExt) {
    btnExt.addEventListener('click', function() {
      setScheme('extended');
    });
  }

  initPlaygroundControls();

  // Defer heavy plotting until Playground is actually visible.
  var section = document.getElementById('section-play');
  if (section && section.style.display !== 'none') {
    updateAll();
  } else {
    _kpUpdatePending = true;
  }
  animateTunneling();
}

var _kpUpdatePending = false;

window.initKP = initKP;
window.initPlaygroundControls = initPlaygroundControls;

// ============ OVERRIDE setGameMode FOR THIS MODULE ============
// Bypass shared_games.js smooth-scroll for Playground; keep instant jump + resize.
(function() {
  var origSetGameMode = window.setGameMode;

  function fastPlaygroundSwitch(mode) {
    if (mode !== 'play') {
      if (typeof origSetGameMode === 'function') origSetGameMode(mode);
      return;
    }

    // For 'play' we replicate the shared toggle logic but skip smooth scroll.
    document.querySelectorAll('.game-mode-btn').forEach(function(b) { b.classList.remove('active'); });
    var btn = document.getElementById('mode-play');
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.mode-section').forEach(function(s) { s.style.display = 'none'; });
    var section = document.getElementById('section-play');
    if (section) {
      section.style.display = 'block';
      // Instant jump — no smooth animation
      window.scrollTo({ top: section.offsetTop, behavior: 'auto' });
    }

    var container = document.querySelector('.game-container');
    if (container) container.setAttribute('data-active-mode', 'play');

    // Trigger init + resize (defer heavy plotting so the click stays responsive)
    if (typeof initPlayground === 'function') initPlayground();
    _resizeKPPlots();
    requestAnimationFrame(function() {
      _resizeKPPlots();
      if (_kpUpdatePending) {
        _kpUpdatePending = false;
        updateAll();
      }
    });
  }

  window.__fastPlaygroundSwitch = fastPlaygroundSwitch;

  window.setGameMode = function(mode) {
    if (mode === 'play') {
      fastPlaygroundSwitch(mode);
    } else if (typeof origSetGameMode === 'function') {
      origSetGameMode(mode);
    }
  };
})();

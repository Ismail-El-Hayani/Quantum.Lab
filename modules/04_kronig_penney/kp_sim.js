/**
 * Kronig-Penney Model — Physics Engine
 * Exact transcendental equation solver for 1D periodic square-well potential.
 * Now includes Finite Barrier Tunneling visualization.
 * Units: m = ħ = 1 (natural), energy in ħ²/ma², length in a.
 */

'use strict';

// ============ STATE ============
let state = { V0:5, b:0.2, a:1.0, E:2.0, scheme:'reduced', numK:200 };

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
  return {kvals, bands};
}

/**
 * Tunneling Physics Solver
 * Calculates the wave function psi(x) for a single barrier of width 'w' at x=[0, w]
 * Implementation based on Schrödinger continuity conditions.
 */
function solveTunneling(E, V0, w, x_range) {
  const k = Math.sqrt(2 * E);
  let psi_real = [], psi_prob = [], potential = [];

  // Transmission coefficient T calculation
  let T;
  if (E < V0) {
    const kappa = Math.sqrt(2 * (V0 - E));
    T = 1 / (1 + Math.pow(V0, 2) * Math.pow(Math.sinh(kappa * w), 2) / (4 * E * (V0 - E)));
  } else if (E > V0) {
    const k_prime = Math.sqrt(2 * (E - V0));
    T = 1 / (1 + Math.pow(V0, 2) * Math.pow(Math.sin(k_prime * w), 2) / (4 * E * (E - V0)));
  } else {
    T = 1; // E = V0 case
  }

  // For visualization, we'll simulate a wave packet/steady state
  // We Use a normalized incident amplitude A=1
  const A = 1.0;
  const time = Date.now() * 0.002;

  x_range.forEach(x => {
    let val = 0;
    let prob = 0;

    if (x < 0) {
      // Region I: Incident + Reflected
      // Re(psi) = cos(kx - wt) + Reflectance*cos(-kx - wt)
      const R = Math.sqrt(1-T);
      val = A * (Math.cos(k * x - time) + R * Math.cos(-k * x - time));
      prob = A*A * (1 + R*R + 2*R*Math.cos(2*k*x));
    } else if (x >= 0 && x <= w) {
      // Region II: Inside Barrier (Evanescent or higher-k)
      if (E < V0) {
        const kappa = Math.sqrt(2 * (V0 - E));
        // Simplified decay for visual clarity
        const decay = Math.exp(-kappa * x);
        val = A * Math.cos(time) * decay;
        prob = A*A * Math.exp(-2 * kappa * x);
      } else {
        const k_prime = Math.sqrt(2 * (E - V0));
        val = A * Math.cos(k_prime * x - time);
        prob = A*A;
      }
    } else {
      // Region III: Transmitted
      const F = Math.sqrt(T);
      val = F * Math.cos(k * (x - w) - time);
      prob = F*F;
    }
    psi_real.push(val);
    psi_prob.push(prob);
    potential.push( (x >= 0 && x <= w) ? V0 : 0 );
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
    xaxis:{title:'k (π/a)',color:'#505070',gridcolor:'#1a1a28',tickmode:'array',tickvals:[-Math.PI/state.a,0,Math.PI/state.a],ticktext:['-1','0','+1']},
    yaxis:{title:'E (ħ²/ma²)',color:'#505070',gridcolor:'#1a1a28'},
    legend:{x:0.02,y:0.98,bgcolor:'rgba(10,10,15,0.8)',bordercolor:'#2a2a3a',borderwidth:1},
    hovermode:'x unified'
  };

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
  }

  layout.yaxis.range = [0, ymax*1.05];
  _plot('plot-bands', traces, layout, {responsive:true,displayModeBar:false});
}

// ============ UI ============
function setScheme(s){
  state.scheme = s;
  var btnR = document.getElementById('btn-reduced');
  var btnE = document.getElementById('btn-extended');
  if(btnR) btnR.classList.toggle('active', s==='reduced');
  if(btnE) btnE.classList.toggle('active', s==='extended');
  updateAll();
}
window.setScheme = setScheme;

function updateAll(){
  plotPotential();
  plotTunneling();
  plotBands();
  updateLiveReadouts(state.V0, state.a, state.b);
}
window.updateAll = updateAll;

// Animation loop for tunneling
function animateTunneling() {
  plotTunneling();
  requestAnimationFrame(animateTunneling);
}

// Live readout updater
function updateLiveReadouts(V0, a, b) {
  if (typeof solveBands !== 'function') return;
  var result = solveBands(V0, a, b, 200);
  var bands = result.bands;
  var gaps = [];
  var widths = [];
  var masses = [];
  for (var ib = 0; ib < 4; ib++) {
    if (bands[ib] && bands[ib].length > 2 && bands[ib+1] && bands[ib+1].length > 2) {
      var top = Math.max.apply(null, bands[ib].map(function(p){ return p.E; }));
      var bot = Math.min.apply(null, bands[ib+1].map(function(p){ return p.E; }));
      gaps.push(bot - top);
      var botBand = Math.min.apply(null, bands[ib].map(function(p){ return p.E; }));
      widths.push(top - botBand);
      var d2E = 0;
      if (bands[ib].length > 4) {
        var mid = Math.floor(bands[ib].length/2);
        var dk = bands[ib][mid+1].k - bands[ib][mid].k;
        if (Math.abs(dk) > 1e-10) {
          d2E = (bands[ib][mid+1].E - 2*bands[ib][mid].E + bands[ib][mid-1].E)/(dk*dk);
        }
      }
      masses.push(d2E > 1e-10 ? (1/d2E).toFixed(3) : '—');
    } else {
      gaps.push(null); widths.push(null); masses.push('—');
    }
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

  if(sliderV0){
    sliderV0.addEventListener('input',function(){
      state.V0 = parseFloat(this.value);
      var el = document.getElementById('val-v0'); if(el) el.textContent = state.V0.toFixed(1);
      updateAll();
    });
  }
  if(sliderB){
    sliderB.addEventListener('input',function(){
      state.b = parseFloat(this.value) * state.a;
      var el = document.getElementById('val-b'); if(el) el.textContent = (state.b/state.a).toFixed(2);
      updateAll();
    });
  }
  if(sliderA){
    sliderA.addEventListener('input',function(){
      let ratio = state.b / state.a;
      state.a = parseFloat(this.value);
      state.b = ratio * state.a;
      var elA = document.getElementById('val-a'); if(elA) elA.textContent = state.a.toFixed(1);
      var elB = document.getElementById('val-b'); if(elB) elB.textContent = ratio.toFixed(2);
      updateAll();
    });
  }
  if(sliderE){
    sliderE.addEventListener('input',function(){
      state.E = parseFloat(this.value);
      var el = document.getElementById('val-e'); if(el) el.textContent = state.E.toFixed(1);
      updateAll();
    });
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

  updateAll();
  animateTunneling();
}

window.initKP = initKP;

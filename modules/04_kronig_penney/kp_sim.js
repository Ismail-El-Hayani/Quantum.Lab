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
    T = 1 / (1 + (Math.pow(V0, 2) * Math.pow(Math.sinh(kappa * w), 2)) / (4 * E * (V0 - E)));
  } else if (E > V0) {
    const k_prime = Math.sqrt(2 * (E - V0));
    T = 1 / (1 + (Math.pow(V0, 2) * Math.pow(Math.sin(k_prime * w), 2)) / (4 * E * (E - V0)));
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
function _plot(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}

function plotPotential(){
  let x=[], V=[];
  const a=state.a, b=state.b, V0=state.V0;
  for(let xi=-2*a; xi<=2*a; xi+=0.01){
    let xa = xi - Math.floor(xi/a)*a;
    if(xa<0) xa += a;
    x.push(xi); V.push(xa < b ? V0 : 0);
  }
  _plot('plot-potential',[\n    {x:x,y:V,mode:'lines',fill:'tozeroy',fillcolor:'rgba(179,136,255,0.15)',line:{color:'#c084fc',width:2},name:'V(x)'}\n  ],{\n    margin:{t:20,r:10,b:40,l:50},\n    paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',\n    font:{family:'JetBrains Mono,monospace',color:'#8080a0',size:11},\n    xaxis:{title:'x (lattice units)',color:'#505070',gridcolor:'#1a1a28'},\n    yaxis:{title:'V(x)',color:'#505070',gridcolor:'#1a1a28'},\n    showlegend:false\n  },{responsive:true,displayModeBar:false});\n}

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
function plotBands(){\n  const {kvals, bands} = solveBands(state.V0, state.a, state.b, state.numK);\n  const traces = [];\n\n  for(let ib=0; ib<bands.length; ib++){\n    if(bands[ib].length<3) continue;\n    let x = bands[ib].map(p=>p.k);\n    let y = bands[ib].map(p=>p.E);\n    traces.push({\n      x:x, y:y, mode:'lines',\n      name:'Band '+(ib+1),\n      line:{color:colors[ib%colors.length],width:2}\n    });\n  }\n\n  if(state.scheme==='reduced'){\n    let xfre = [], yfre = [];\n    for(let k=-Math.PI/state.a; k<=Math.PI/state.a; k+=0.01){\n      xfre.push(k); yfre.push(k*k/2);\n    }\n    traces.push({x:xfre,y:yfre,mode:'lines',name:'Free e⁻',line:{color:'rgba(255,255,255,0.2)',width:1.5,dash:'dot'}});\n  }\n\n  traces.push({x:[-Math.PI/state.a,-Math.PI/state.a],y:[0,state.V0*1.5],mode:'lines',name:'BZ edge',line:{color:'rgba(255,255,255,0.15)',width:1}});\n  traces.push({x:[Math.PI/state.a,Math.PI/state.a],y:[0,state.V0*1.5],mode:'lines',showlegend:false,line:{color:'rgba(255,255,255,0.15)',width:1}});\n\n  let ymax = Math.max(state.V0+2, ...bands.flat().map(p=>p.E));\n  let layout = {\n    margin:{t:25,r:10,b:40,l:55},\n    paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',\n    font:{family:'JetBrains Mono,monospace',color:'#8080a0',size:11},\n    xaxis:{title:'k (π/a)',color:'#505070',gridcolor:'#1a1a28',tickmode:'array',tickvals:[-Math.PI/state.a,0,Math.PI/state.a],ticktext:['-1','0','+1']},\n    yaxis:{title:'E (ħ²/ma²)',color:'#505070',gridcolor:'#1a1a28'},\n    legend:{x:0.02,y:0.98,bgcolor:'rgba(10,10,15,0.8)',bordercolor:'#2a2a3a',borderwidth:1},\n    hovermode:'x unified'\n  };\n\n  if(state.scheme==='extended'){\n    const extTraces=[];\n    for(let ib=0; ib<bands.length; ib++){\n      if(bands[ib].length<3) continue;\n      let base = bands[ib];\n      [-2,-1,0,1,2].forEach(n=>{\n        let shift = n*2*Math.PI/state.a;\n        extTraces.push({\n          x: base.map(p=>p.k + shift),\n          y: base.map(p=>p.E),\n          mode:'lines',\n          line:{color:colors[ib%colors.length],width:1.8},\n          showlegend: n===0,\n          name: 'Band '+(ib+1)\n        });\n      });\n    }\n    layout.xaxis.title='k';\n    layout.xaxis.tickmode='auto';\n    layout.xaxis.tickvals = undefined;\n    layout.xaxis.ticktext = undefined;\n    layout.xaxis.range = [-3*Math.PI/state.a, 3*Math.PI/state.a];\n    _plot('plot-bands', extTraces, layout, {responsive:true,displayModeBar:false});\n  } else {\n    _plot('plot-bands', traces, layout, {responsive:true,displayModeBar:false});\n  }\n\n  let gap1='—', gap2='—', w1='—', w2='—', m1='—', m2='—';\n  if(bands[0].length>0 && bands[1].length>0){\n    let bot0 = Math.min(...bands[0].map(p=>p.E));\n    let top0 = Math.max(...bands[0].map(p=>p.E));\n    let bot1 = Math.min(...bands[1].map(p=>p.E));\n    gap1 = (bot1 - top0).toFixed(3);\n    w1 = (top0 - bot0).toFixed(3);\n    let pts0 = bands[0].filter(p=>Math.abs(p.k)<0.3).sort((a,b)=>a.k-b.k);\n    if(pts0.length>=3){\n      let dk = pts0[1].k - pts0[0].k;\n      let dE2 = pts0[2].E - 2*pts0[1].E + pts0[0].E;\n      if(Math.abs(dE2)>1e-8) m1 = (dk*dk/dE2).toFixed(3);\n    }\n    let ptsT = bands[0].filter(p=>Math.abs(Math.abs(p.k)-Math.PI/state.a)<0.2).sort((a,b)=>Math.abs(a.k)-Math.abs(b.k));\n    if(ptsT.length>=3){\n      let dk = ptsT[1].k - ptsT[0].k;\n      let dE2 = ptsT[2].E - 2*ptsT[1].E + ptsT[0].E;\n      if(Math.abs(dE2)>1e-8) m2 = (dk*dk/dE2).toFixed(3);\n    }\n  }\n  if(bands[1].length>0 && bands[2].length>0){\n    let top1 = Math.max(...bands[1].map(p=>p.E));\n    let bot2 = Math.min(...bands[2].map(p=>p.E));\n    gap2 = (bot2 - top1).toFixed(3);\n    let bot1 = Math.min(...bands[1].map(p=>p.E));\n    w2 = (top1 - bot1).toFixed(3);\n  }\n  var elG1 = document.getElementById('live-gap1'); if(elG1) elG1.textContent = gap1;\n  var elG2 = document.getElementById('live-gap2'); if(elG2) elG2.textContent = gap2;\n  var elW1 = document.getElementById('live-width1'); if(elW1) elW1.textContent = w1;\n  var elW2 = document.getElementById('live-width2'); if(elW2) elW2.textContent = w2;\n  var elM1 = document.getElementById('live-mass1'); if(elM1) elM1.textContent = m1;\n  var elM2 = document.getElementById('live-mass2'); if(elM2) elM2.textContent = m2;\n}



// ============ UI ============
function setScheme(s){\n  state.scheme = s;\n  var btnR = document.getElementById('btn-reduced');\n  var btnE = document.getElementById('btn-extended');\n  if(btnR) btnR.classList.toggle('active', s==='reduced');\n  if(btnE) btnE.classList.toggle('active', s==='extended');\n  updateAll();\n}\nwindow.setScheme = setScheme;\n\nfunction updateAll(){\n  plotPotential();\n  plotTunneling();\n  plotBands();\n  updateLiveReadouts(state.V0, state.a, state.b);\n}\nwindow.updateAll = updateAll;\n\n// Animation loop for tunneling
function animateTunneling() {\n  plotTunneling();\n  requestAnimationFrame(animateTunneling);\n}\n\n// Live readout updater
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
\n// ============ INIT ============
function initKP() {\n  var sliderV0 = document.getElementById('slider-v0');\n  var sliderB = document.getElementById('slider-b');\n  var sliderA = document.getElementById('slider-a');\n  var sliderE = document.getElementById('slider-e');\n\n  if(sliderV0){\n    sliderV0.addEventListener('input',function(){\n      state.V0 = parseFloat(this.value);\n      var el = document.getElementById('val-v0'); if(el) el.textContent = state.V0.toFixed(1);\n      updateAll();\n    });\n  }\n  if(sliderB){\n    sliderB.addEventListener('input',function(){\n      state.b = parseFloat(this.value) * state.a;\n      var el = document.getElementById('val-b'); if(el) el.textContent = (state.b/state.a).toFixed(2);\n      updateAll();\n    });\n  }\n  if(sliderA){\n    sliderA.addEventListener('input',function(){\n      let ratio = state.b / state.a;\n      state.a = parseFloat(this.value);\n      state.b = ratio * state.a;\n      var elA = document.getElementById('val-a'); if(elA) elA.textContent = state.a.toFixed(1);\n      var elB = document.getElementById('val-b'); if(elB) elB.textContent = ratio.toFixed(2);\n      updateAll();\n    });\n  }\n  if(sliderE){\n    sliderE.addEventListener('input',function(){\n      state.E = parseFloat(this.value);\n      var el = document.getElementById('val-e'); if(el) el.textContent = state.E.toFixed(1);\n      updateAll();\n    });\n  }\n\n  var btnRed = document.getElementById('btn-reduced');\n  var btnExt = document.getElementById('btn-extended');\n  if (btnRed) {\n    btnRed.addEventListener('click', function() {\n      setScheme('reduced');\n    });\n  }\n  if (btnExt) {\n    btnExt.addEventListener('click', function() {\n      setScheme('extended');\n    });\n  }\n\n  updateAll();\n  animateTunneling();\n}\n\nwindow.initKP = initKP;\n
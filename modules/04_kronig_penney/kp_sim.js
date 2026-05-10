/**
 * Kronig-Penney Model — Physics Engine
 * Exact transcendental equation solver for 1D periodic square-well potential.
 * Units: m = ħ = 1 (natural), energy in ħ²/ma², length in a.
 */

'use strict';

// ============ STATE ============
let state = { V0:5, b:0.2, a:1.0, scheme:'reduced', numK:200 };

// ============ PHYSICS ============
function rhs(E, V0, a, b) {
  if(E<0) return Infinity;
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

const colors = ['#00f0ff','#c084fc','#ff4ecd','#4ade80','#ffd740'];
function plotBands(){
  const {kvals, bands} = solveBands(state.V0, state.a, state.b, state.numK);
  const traces = [];

  for(let ib=0; ib<bands.length; ib++){
    if(bands[ib].length<3) continue;
    let x = bands[ib].map(p=>p.k);
    let y = bands[ib].map(p=>p.E);
    traces.push({
      x:x, y:y, mode:'lines',
      name:'Band '+(ib+1),
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
          line:{color:colors[ib%colors.length],width:1.8},
          showlegend: n===0,
          name: 'Band '+(ib+1)
        });
      });
    }
    layout.xaxis.title='k';
    layout.xaxis.tickmode='auto';
    layout.xaxis.tickvals = undefined;
    layout.xaxis.ticktext = undefined;
    layout.xaxis.range = [-3*Math.PI/state.a, 3*Math.PI/state.a];
    _plot('plot-bands', extTraces, layout, {responsive:true,displayModeBar:false});
  } else {
    _plot('plot-bands', traces, layout, {responsive:true,displayModeBar:false});
  }

  let gap1='—', gap2='—', w1='—', w2='—', m1='—', m2='—';
  if(bands[0].length>0 && bands[1].length>0){
    let bot0 = Math.min(...bands[0].map(p=>p.E));
    let top0 = Math.max(...bands[0].map(p=>p.E));
    let bot1 = Math.min(...bands[1].map(p=>p.E));
    gap1 = (bot1 - top0).toFixed(3);
    w1 = (top0 - bot0).toFixed(3);
    let pts0 = bands[0].filter(p=>Math.abs(p.k)<0.3).sort((a,b)=>a.k-b.k);
    if(pts0.length>=3){
      let dk = pts0[1].k - pts0[0].k;
      let dE2 = pts0[2].E - 2*pts0[1].E + pts0[0].E;
      if(Math.abs(dE2)>1e-8) m1 = (dk*dk/dE2).toFixed(3);
    }
    let ptsT = bands[0].filter(p=>Math.abs(Math.abs(p.k)-Math.PI/state.a)<0.2).sort((a,b)=>Math.abs(a.k)-Math.abs(b.k));
    if(ptsT.length>=3){
      let dk = ptsT[1].k - ptsT[0].k;
      let dE2 = ptsT[2].E - 2*ptsT[1].E + ptsT[0].E;
      if(Math.abs(dE2)>1e-8) m2 = (dk*dk/dE2).toFixed(3);
    }
  }
  if(bands[1].length>0 && bands[2].length>0){
    let top1 = Math.max(...bands[1].map(p=>p.E));
    let bot2 = Math.min(...bands[2].map(p=>p.E));
    gap2 = (bot2 - top1).toFixed(3);
    let bot1 = Math.min(...bands[1].map(p=>p.E));
    w2 = (top1 - bot1).toFixed(3);
  }
  var elG1 = document.getElementById('live-gap1'); if(elG1) elG1.textContent = gap1;
  var elG2 = document.getElementById('live-gap2'); if(elG2) elG2.textContent = gap2;
  var elW1 = document.getElementById('live-width1'); if(elW1) elW1.textContent = w1;
  var elW2 = document.getElementById('live-width2'); if(elW2) elW2.textContent = w2;
  var elM1 = document.getElementById('live-mass1'); if(elM1) elM1.textContent = m1;
  var elM2 = document.getElementById('live-mass2'); if(elM2) elM2.textContent = m2;
}

function plotRealBands(){
  const points = ['Γ','X','K','Γ','L'];
  const coords = [0,1,2.4,3.7,4.4];
  const N=80;
  const Egamma = 0, EL = -0.8, EX = -1.0;
  let traces=[];

  for(let band=0; band<3; band++){
    let x=[]; let y=[];
    for(let i=0;i<=coords[1]*N;i++){
      let t=i/(coords[1]*N);
      let k=t;
      let m = band===0 ? 0.5 : (band===1?0.08:0.15);
      let E = -m*k*k - (band===2?0.34:0);
      x.push(coords[0] + k*coords[1]); y.push(E);
    }
    for(let i=1;i<=Math.round((coords[2]-coords[1])*N);i++){
      let t=i/((coords[2]-coords[1])*N);
      let k=t;
      let E = EX + 0.3*(1-Math.cos(Math.PI*k/2));
      x.push(coords[1] + k*(coords[2]-coords[1])); y.push(E);
    }
    for(let i=1;i<=Math.round((coords[3]-coords[2])*N);i++){
      let t=i/((coords[3]-coords[2])*N);
      let k=t;
      let E = -(0.5*k*k);
      x.push(coords[2] + k*(coords[3]-coords[2])); y.push(E);
    }
    traces.push({x:x,y:y,mode:'lines',name:['Heavy Hole','Light Hole','Split-off'][band],line:{color:['#00f0ff','#4ade80','#ffd740'][band],width:2}});
  }

  let xcb=[], ycb=[];
  for(let i=0;i<=coords[1]*N;i++){
    let t=i/(coords[1]*N);
    let E = 1.42 + 0.067*t*t + 0.3*Math.sin(Math.PI*t)*Math.sin(Math.PI*t);
    xcb.push(coords[0]+t*coords[1]); ycb.push(E);
  }
  traces.push({x:xcb,y:ycb,mode:'lines',name:'Conduction',line:{color:'#ff4ecd',width:2.5}});

  _plot('plot-real-bands', traces, {
    margin:{t:25,r:10,b:50,l:55},
    paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',
    font:{family:'JetBrains Mono,monospace',color:'#8080a0',size:11},
    xaxis:{title:'',color:'#505070',gridcolor:'#1a1a28',tickmode:'array',tickvals:coords,ticktext:points},
    yaxis:{title:'E (eV) relative to VBM',color:'#505070',gridcolor:'#1a1a28'},
    legend:{x:0.02,y:0.98,bgcolor:'rgba(10,10,15,0.8)',bordercolor:'#2a2a3a',borderwidth:1}
  },{responsive:true,displayModeBar:false});
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
  plotBands();
}
window.updateAll = updateAll;

// ============ INIT ============
function initKP() {
  var sliderV0 = document.getElementById('slider-v0');
  var sliderB = document.getElementById('slider-b');
  var sliderA = document.getElementById('slider-a');

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
  plotRealBands();
}

initKP();
window.initKP = initKP;

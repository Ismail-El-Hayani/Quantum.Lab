/**
 * Junctions & Devices — Physics Engine + Canvas Visualisations (v4)
 * Devices: p-n diode, Zener diode, Tunnel diode, n-MOSFET, p-MOSFET
 * 2D Canvas: animated electrons/holes, barrier, current arrows, band edges
 */
'use strict';

/* ========================= CONSTANTS ========================= */
const q_eV   = 1.602e-19;
const kB_eV  = 8.617e-5;
const eps_si = 11.7;
const eps0   = 8.854e-14; // F/cm
const ni300  = 1.0e10;    // cm^-3 at 300 K
const qC     = 1.602e-19; // Coulomb

/* ========================= STATE ========================= */
var JD = {
  device: 'pn',       // 'pn' | 'zener' | 'tunnel' | 'nmos' | 'pmos'
  T: 300,
  Na: 1e16, Nd: 1e16,
  Vbias: 0.0,
  Vgate: 0.0,
  photons: 0,
  time: 0,
  /* live particles (re-used arrays for Canvas frames) */
  elec: [], holes: [],
  frames: 0
};

/* ========================= MATERIAL ========================= */
var JD_MATERIALS = {
  'Si':   { Eg: 1.12, I0: 1e-12, phi_b: 0.8, ni: 1e10, eps: 11.7, label: 'Silicon' },
  'GaAs': { Eg: 1.42, I0: 1e-18, phi_b: 0.9, ni: 2.1e6, eps: 12.9, label: 'GaAs' },
  'Ge':   { Eg: 0.67, I0: 1e-9,  phi_b: 0.5, ni: 2.4e13, eps: 16.0, label: 'Germanium' }
};
var MAT = JD_MATERIALS.Si;

/* ========================= HELPERS ========================= */
function _getni(T) { return ni300 * Math.pow(T/300,1.5) * Math.exp(-q_eV*MAT.Eg/(2*kB_eV*300) * (300/T - 1)); }
function Vbi(Na,Nd,T){ var niT=_getni(T); return kB_eV*T*Math.log(Na*Nd/(niT*niT)); }
function Wdep(Na,Nd,VbiV,Vbias,T){
  var eps = eps0*MAT.eps;
  var Vj  = Math.max(VbiV - Vbias, 0.01);
  return Math.sqrt( (2*eps/q_eV)*(1/Na + 1/Nd)*Vj );
}
function idealDiodeI(V,T,I0,n){ return I0*(Math.exp(V/(n*kB_eV*T))-1); }

/* safe Plotly */
function jdLayout(title,xt,yt,extra){
  var base={margin:{t:25,r:10,b:45,l:55},paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',
    font:{family:'JetBrains Mono, monospace',color:'#8080a0',size:11},
    xaxis:{title:xt,color:'#505070',gridcolor:'#1a1a28',zerolinecolor:'#2a2a3a'},
    yaxis:{title:yt,color:'#505070',gridcolor:'#1a1a28',zerolinecolor:'#2a2a3a'},
    legend:{x:0.02,y:0.98,bgcolor:'rgba(10,10,15,0.8)',bordercolor:'#2a2a3a',borderwidth:1},hovermode:'x unified'};
  if(extra){if(extra.xaxis)Object.assign(base.xaxis,extra.xaxis);if(extra.yaxis)Object.assign(base.yaxis,extra.yaxis);var r={};for(var k in extra){if(k!=='xaxis'&&k!=='yaxis')r[k]=extra[k];}Object.assign(base,r);}
  return base;
}

/* ========================= 2D CANVAS LATTICE ========================= */
function initParticles(count,type){ var arr=[]; for(var i=0;i<count;i++){ arr.push({x:Math.random(),y:Math.random(),vx:(Math.random()-0.5)*0.4e-3,vy:(Math.random()-0.5)*0.4e-3,alive:true}); } return arr; }

/* --- p-n junction band drawing --- */
function drawPNJunction(ctx,W,H,state){
  var Na=state.Na, Nd=state.Nd, T=state.T, Vb=state.Vbias;
  var vbi=Vbi(Na,Nd,T);
  var eps=eps0*MAT.eps;
  var w=Wdep(Na,Nd,vbi,Vb,T)*1e5; // cm -> nm scale, *1e5 for display
  var scaleX=W/200; // 200 nm total domain shown
  var centre=W/2;
  var xn=w*Na/(Na+Nd), xp=w*Nd/(Na+Nd);
  var leftEdge=centre-xp*scaleX, rightEdge=centre+xn*scaleX;

  // band energies (display units)
  var EcTop=60, EcBot=H-60, bandRange=EcBot-EcTop;
  var EgDisp=bandRange*0.35;

  // compute Ec and Ev at pixel x
  function bandCurve(xp){
    var dx=xp-centre;
    var psi=0;
    if(dx< -xp*scaleX) psi=0;
    else if(dx> xn*scaleX) psi=1;
    else { var xi=dx/scaleX; if(xi<0) psi=0.5/(1+Math.exp(-xi*2/xp)); else psi=0.5*(1+Math.tanh(xi*2/xn)); }
    // built-in + bias: barrier height = vbi - Vb
    var barrier=Math.max(vbi-Vb,0);
    var Ec=EcTop+0.2*bandRange+barrier*8*(psi-0.5);
    var Ev=Ec-EgDisp;
    return {Ec:Ec,Ev:Ev,psi:psi};
  }

  // background zones
  ctx.fillStyle='rgba(74,222,128,0.04)'; ctx.fillRect(0,0,leftEdge,H); // p-side tint
  ctx.fillStyle='rgba(0,240,255,0.04)'; ctx.fillRect(rightEdge,0,W-rightEdge,H); // n-side tint
  ctx.fillStyle='rgba(255,240,150,0.06)'; ctx.fillRect(leftEdge,0,rightEdge-leftEdge,H); // depletion tint

  // draw band edges
  ctx.lineWidth=2.5;
  ctx.beginPath(); for(var xx=0;xx<=W;xx+=2){ var b=bandCurve(xx); if(xx===0) ctx.moveTo(xx,b.Ec); else ctx.lineTo(xx,b.Ec); }
  ctx.strokeStyle='#ff4ecd'; ctx.stroke();
  ctx.beginPath(); for(var xx2=0;xx2<=W;xx2+=2){ var b2=bandCurve(xx2); if(xx2===0) ctx.moveTo(xx2,b2.Ev); else ctx.lineTo(xx2,b2.Ev); }
  ctx.strokeStyle='#4ade80'; ctx.stroke();

  // Fermi level (dashed)
  var EF=EcTop+0.2*bandRange-(vbi-Vb)*0.5;
  ctx.strokeStyle='#ffd54f'; ctx.setLineDash([6,4]); ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,EF); ctx.lineTo(W,EF); ctx.stroke(); ctx.setLineDash([]);

  // labels
  ctx.fillStyle='#ff4ecd'; ctx.font='bold 11px JetBrains Mono'; ctx.fillText('Ec (conduction)',8,EcTop+16);
  ctx.fillStyle='#4ade80'; ctx.fillText('Ev (valence)',8,H-12);
  ctx.fillStyle='#ffd54f'; ctx.fillText('EF (Fermi)',8,EF-6);
  ctx.fillStyle='#8888a0'; ctx.font='11px JetBrains Mono';
  ctx.fillText('p-type',16,H/2); ctx.textAlign='right'; ctx.fillText('n-type',W-16,H/2); ctx.textAlign='left';

  // depletion region markers
  if(rightEdge-leftEdge>4){
    ctx.strokeStyle='rgba(255,240,150,0.5)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(leftEdge,20); ctx.lineTo(leftEdge,H-20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rightEdge,20); ctx.lineTo(rightEdge,H-20); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,240,150,0.7)'; ctx.font='10px JetBrains Mono'; ctx.fillText('depletion',leftEdge+4,H-24);
  }

  // particle generation each frame
  if(state.elec.length===0) state.elec=initParticles(80,'e');
  if(state.holes.length===0) state.holes=initParticles(80,'h');

  // movement + rendering
  var t=state.time;
  var elecCount=0, holeCount=0;

  // electrons: majority in n-side, minority in p-side
  state.elec.forEach(function(p){
    var b=bandCurve(p.x);
    var inN=p.x>rightEdge/W, inP=p.x<leftEdge/W, inDep=p.x>=leftEdge/W && p.x<=rightEdge/W;

    // thermal motion
    p.x += p.vx + (Math.random()-0.5)*0.003;
    p.y += p.vy + (Math.random()-0.5)*0.003;

    // bias drift
    if(Vb>0){ // forward: electrons drift n→p (left)
      if(inN || inDep) p.x -= 0.0008*Math.abs(Vb);
    }else if(Vb<0){ // reverse: swept away from junction
      if(inDep) p.x += (p.x>0.5?0.001:-0.001)*Math.abs(Vb);
    }

    // boundaries + recombination
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    if(p.y<0) p.y=0.001; if(p.y>1) p.y=0.999;

    var px=p.x*W, py=b.Ec+10+(p.y-0.5)*25;
    if(py<b.Ec+3) py=b.Ec+3; if(py>H-20) py=H-20;

    var show=false;
    if(inN){ show=true; p.alive=true; }
    else if(inDep && Vb>0 && Math.random()>0.7){ show=true; p.alive=true; }
    else if(inP && Vb>0 && Math.random()>0.92){ show=true; } // diffusion minority tail
    else if(inP && Vb<=0){ p.alive=false; } // recombined / swept away in reverse
    else if(inDep && Vb<=0){ p.alive=false; }

    if(show && p.alive){
      // electron dot
      ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fillStyle='#00f0ff'; ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fillStyle='rgba(0,240,255,0.12)'; ctx.fill();
      elecCount++;
      // velocity arrow for obvious drift
      if(Math.abs(Vb)>0.1 && inDep){
        ctx.strokeStyle='rgba(0,240,255,0.5)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(px-10,py-2); ctx.lineTo(px+2,py-2); ctx.stroke();
      }
    }
  });

  // holes: majority in p-side
  state.holes.forEach(function(p){
    var b=bandCurve(p.x);
    var inN=p.x>rightEdge/W, inP=p.x<leftEdge/W, inDep=p.x>=leftEdge/W && p.x<=rightEdge/W;
    p.x += p.vx + (Math.random()-0.5)*0.003;
    p.y += p.vy + (Math.random()-0.5)*0.003;

    if(Vb>0){ // forward: holes drift p→n (right)
      if(inP || inDep) p.x += 0.0008*Math.abs(Vb);
    }else if(Vb<0){
      if(inDep) p.x += (p.x<0.5?-0.001:0.001)*Math.abs(Vb);
    }

    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    if(p.y<0) p.y=0.001; if(p.y>1) p.y=0.999;

    var px=p.x*W, py=b.Ev-10+(p.y-0.5)*25;
    if(py<b.Ec+3) py=b.Ec+3; if(py>b.Ev-3) py=b.Ev-3;

    var show=false;
    if(inP){ show=true; p.alive=true; }
    else if(inDep && Vb>0 && Math.random()>0.7){ show=true; p.alive=true; }
    else if(inN && Vb>0 && Math.random()>0.92){ show=true; }
    else if(inN && Vb<=0){ p.alive=false; }
    else if(inDep && Vb<=0){ p.alive=false; }

    if(show && p.alive){
      // hole = ring
      ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.strokeStyle='#ff4ecd'; ctx.lineWidth=1.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2); ctx.fillStyle='rgba(255,78,205,0.10)'; ctx.fill();
      holeCount++;
      if(Math.abs(Vb)>0.1 && inDep){
        ctx.strokeStyle='rgba(255,78,205,0.5)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(px-2,py-2); ctx.lineTo(px+10,py-2); ctx.stroke();
      }
    }
  });

  // conventional current arrow overlay
  ctx.font='bold 12px JetBrains Mono';
  if(Vb>0.1){
    ctx.fillStyle='rgba(74,222,128,0.85)'; ctx.fillText('Forward current (p -> n)',W/2-70,20);
    ctx.strokeStyle='rgba(74,222,128,0.6)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W/2-40,30); ctx.lineTo(W/2+40,30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2+40,25); ctx.lineTo(W/2+40,35); ctx.lineTo(W/2+52,30); ctx.closePath(); ctx.fill();
  }else if(Vb<-0.1){
    ctx.fillStyle='rgba(255,85,85,0.85)'; ctx.fillText('Reverse leakage (tiny)',W/2-60,20);
    ctx.strokeStyle='rgba(255,85,85,0.4)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(W/2+40,30); ctx.lineTo(W/2-40,30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2-40,25); ctx.lineTo(W/2-40,35); ctx.lineTo(W/2-52,30); ctx.closePath(); ctx.fill();
  }else{
    ctx.fillStyle='rgba(128,128,160,0.7)'; ctx.fillText('Equilibrium (no net current)',W/2-75,20);
  }

  // readout
  ctx.fillStyle='#8080a0'; ctx.font='10px JetBrains Mono';
  ctx.fillText('Vbi='+vbi.toFixed(3)+'V  W='+w.toFixed(1)+'nm  I='+idealDiodeI(Vb,T,MAT.I0,1.0).toExponential(2)+'A',8,H-4);
}

/* --- Zener diode: emphasise breakdown + tunneling electrons --- */
function drawZener(ctx,W,H,state){
  var Na=state.Na*3, Nd=state.Nd*3, T=state.T, Vb=state.Vbias;
  var vbi=Vbi(Na,Nd,T);
  var w=Wdep(Na,Nd,vbi,Vb,T)*1e5;
  var scaleX=W/140, centre=W/2;
  var xn=w*Na/(Na+Nd), xp=w*Nd/(Na+Nd);
  var leftEdge=centre-xp*scaleX, rightEdge=centre+xn*scaleX;

  var EcTop=60, EcBot=H-60, bandRange=EcBot-EcTop, EgDisp=bandRange*0.35;
  var breakdown=-vbi*0.85; // approx zener knee

  function bandCurve(xp2){
    var dx=xp2-centre;
    var psi=0;
    if(dx<-xp*scaleX) psi=0;
    else if(dx>xn*scaleX) psi=1;
    else{ var xi=dx/scaleX; if(xi<0) psi=0.5/(1+Math.exp(-xi*2/xp)); else psi=0.5*(1+Math.tanh(xi*2/xn)); }
    var barrier=Math.max(vbi-Vb,0);
    var Ec=EcTop+0.2*bandRange+barrier*8*(psi-0.5);
    var Ev=Ec-EgDisp; return {Ec:Ec,Ev:Ev,psi:psi};
  }

  // tinting
  ctx.fillStyle='rgba(74,222,128,0.04)'; ctx.fillRect(0,0,leftEdge,H);
  ctx.fillStyle='rgba(0,240,255,0.04)'; ctx.fillRect(rightEdge,0,W-rightEdge,H);
  ctx.fillStyle='rgba(255,240,150,0.06)'; ctx.fillRect(leftEdge,0,rightEdge-leftEdge,H);

  // band edges
  ctx.lineWidth=2.5;
  ctx.beginPath(); for(var xx=0;xx<=W;xx+=2){ var b=bandCurve(xx); if(xx===0) ctx.moveTo(xx,b.Ec); else ctx.lineTo(xx,b.Ec); }
  ctx.strokeStyle='#ff4ecd'; ctx.stroke();
  ctx.beginPath(); for(var xx2=0;xx2<=W;xx2+=2){ var b2=bandCurve(xx2); if(xx2===0) ctx.moveTo(xx2,b2.Ev); else ctx.lineTo(xx2,b2.Ev); }
  ctx.strokeStyle='#4ade80'; ctx.stroke();

  // valence band on p-side raised, conduction on n-side lowered => triangular barrier in reverse
  var EF=EcTop+0.2*bandRange-(vbi-Vb)*0.5;
  ctx.strokeStyle='#ffd54f'; ctx.setLineDash([6,4]); ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,EF); ctx.lineTo(W,EF); ctx.stroke(); ctx.setLineDash([]);

  // tunneling visualization (only heavy reverse bias)
  if(Vb<breakdown && w<15){
    ctx.strokeStyle='rgba(255,78,205,0.6)'; ctx.setLineDash([4,4]); ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(leftEdge-20,EF); ctx.lineTo(rightEdge+20,EF); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,78,205,0.25)'; ctx.fillRect(leftEdge,EF-10,rightEdge-leftEdge,20);
    ctx.fillStyle='#ff4ecd'; ctx.font='bold 11px JetBrains Mono'; ctx.fillText('BAND-TO-BAND TUNNELING',W/2-65,H/2-20);
    // animated tunneling electrons
    var tunCount=Math.floor(Math.min(Math.abs(Vb-breakdown)*200,60));
    for(var ti=0;ti<tunCount;ti++){
      var tx=leftEdge + Math.random()*(rightEdge-leftEdge);
      var ty=EF+(Math.random()-0.5)*12;
      ctx.beginPath(); ctx.arc(tx,ty,2.5,0,Math.PI*2); ctx.fillStyle='#ff4ecd'; ctx.fill();
    }
  }

  // standard particles
  if(state.elec.length===0) state.elec=initParticles(80,'e');
  if(state.holes.length===0) state.holes=initParticles(80,'h');

  state.elec.forEach(function(p){
    var b=bandCurve(p.x); var inN=p.x>rightEdge/W, inP=p.x<leftEdge/W, inDep=p.x>=leftEdge/W && p.x<=rightEdge/W;
    p.x+=p.vx+(Math.random()-0.5)*0.003; if(Vb<breakdown && inDep) p.x-=0.004;
    else if(Vb<0 && inDep) p.x+=0.001;
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    var px=p.x*W, py=b.Ec+10+(p.y-0.5)*20;
    var show=inN||(inDep&&Vb<breakdown&&Math.random()>0.5);
    if(show){ ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fillStyle='#00f0ff'; ctx.fill(); ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fillStyle='rgba(0,240,255,0.12)'; ctx.fill();}
  });
  state.holes.forEach(function(p){
    var b=bandCurve(p.x); var inN=p.x>rightEdge/W, inP=p.x<leftEdge/W, inDep=p.x>=leftEdge/W && p.x<=rightEdge/W;
    p.x+=p.vx+(Math.random()-0.5)*0.003; if(Vb<breakdown && inDep) p.x+=0.004;
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    var px=p.x*W, py=b.Ev-10+(p.y-0.5)*20;
    var show=inP||(inDep&&Vb<breakdown&&Math.random()>0.5);
    if(show){ ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.strokeStyle='#ff4ecd'; ctx.lineWidth=1.8; ctx.stroke(); ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2); ctx.fillStyle='rgba(255,78,205,0.10)'; ctx.fill();}
  });

  ctx.font='bold 12px JetBrains Mono';
  if(Vb<breakdown){ ctx.fillStyle='rgba(255,85,85,0.9)'; ctx.fillText('ZENER BREAKDOWN — sharp reverse current',W/2-100,20); }
  else if(Vb<0){ ctx.fillStyle='rgba(255,85,85,0.6)'; ctx.fillText('Reverse bias (blocking)',W/2-70,20); }
  else{ ctx.fillStyle='rgba(74,222,128,0.8)'; ctx.fillText('Forward bias (normal diode)',W/2-80,20); }

  ctx.fillStyle='#8080a0'; ctx.font='10px JetBrains Mono';
  ctx.fillText('Vbi='+vbi.toFixed(3)+'V  Vbreak~'+breakdown.toFixed(2)+'V  I='+idealDiodeI(Vb,T,MAT.I0,1.0).toExponential(2)+'A',8,H-4);
}

/* --- Tunnel diode: negative differential resistance visual --- */
function drawTunnel(ctx,W,H,state){
  var Na=state.Na, Nd=state.Nd*3, T=state.T, Vb=state.Vbias;
  var vbi=Vbi(Na,Nd,T);
  var eps=eps0*MAT.eps;
  var w=Wdep(Na,Nd,vbi,Vb,T)*1e5;
  var scaleX=W/120, centre=W/2;
  var xn=w*Na/(Na+Nd), xp=w*Nd/(Na+Nd);
  var leftEdge=centre-xp*scaleX, rightEdge=centre+xn*scaleX;

  var EcTop=60, EcBot=H-60, bandRange=EcBot-EcTop, EgDisp=bandRange*0.30;

  // heavily doped -> degenerate: bands overlap in equilibrium
  function bandCurve(xp2){
    var dx=xp2-centre;
    var psi=0;
    if(dx<-xp*scaleX) psi=0; else if(dx>xn*scaleX) psi=1;
    else{ var xi=dx/scaleX; if(xi<0) psi=0.5/(1+Math.exp(-xi*2/xp)); else psi=0.5*(1+Math.tanh(xi*2/xn)); }
    var barrier=Math.max(vbi-Vb,0);
    // degenerate doping pushes EF into bands
    var Ec=EcTop+0.25*bandRange+barrier*6*(psi-0.5);
    var Ev=Ec-EgDisp; return {Ec:Ec,Ev:Ev};
  }

  ctx.fillStyle='rgba(74,222,128,0.04)'; ctx.fillRect(0,0,leftEdge,H);
  ctx.fillStyle='rgba(0,240,255,0.04)'; ctx.fillRect(rightEdge,0,W-rightEdge,H);
  ctx.fillStyle='rgba(255,240,150,0.06)'; ctx.fillRect(leftEdge,0,rightEdge-leftEdge,H);

  ctx.lineWidth=2.5;
  ctx.beginPath(); for(var xx=0;xx<=W;xx+=2){ var b=bandCurve(xx); if(xx===0) ctx.moveTo(xx,b.Ec); else ctx.lineTo(xx,b.Ec); }
  ctx.strokeStyle='#ff4ecd'; ctx.stroke();
  ctx.beginPath(); for(var xx2=0;xx2<=W;xx2+=2){ var b2=bandCurve(xx2); if(xx2===0) ctx.moveTo(xx2,b2.Ev); else ctx.lineTo(xx2,b2.Ev); }
  ctx.strokeStyle='#4ade80'; ctx.stroke();

  var EF=EcTop+0.25*bandRange-(vbi-Vb)*0.45;
  ctx.strokeStyle='#ffd54f'; ctx.setLineDash([6,4]); ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,EF); ctx.lineTo(W,EF); ctx.stroke(); ctx.setLineDash([]);

  // tunnel window: where filled states on left align with empty states on right
  var overlap=Math.max(0, EF-(EcTop+0.25*bandRange-3*(vbi-Vb)));
  if(Vb>0 && Vb<vbi*0.5 && overlap>0){
    ctx.fillStyle='rgba(0,240,255,0.12)'; ctx.fillRect(leftEdge,EF-15,rightEdge-leftEdge,30);
    ctx.fillStyle='#00f0ff'; ctx.font='bold 11px JetBrains Mono'; ctx.fillText('TUNNEL WINDOW',W/2-45,H/2-20);
    // tunnel electrons
    var nTun=Math.floor(overlap*3);
    for(var ti=0;ti<nTun;ti++){
      var tx=leftEdge+Math.random()*(rightEdge-leftEdge);
      var ty=EF+(Math.random()-0.5)*18;
      ctx.beginPath(); ctx.arc(tx,ty,2,0,Math.PI*2); ctx.fillStyle='#00f0ff'; ctx.fill();
    }
  }

  // particles
  if(state.elec.length===0) state.elec=initParticles(100,'e');
  state.elec.forEach(function(p){
    var b=bandCurve(p.x); var inDep=p.x>=leftEdge/W && p.x<=rightEdge/W;
    p.x+=p.vx+(Math.random()-0.5)*0.005; if(Vb>0 && Vb<vbi*0.5 && inDep) p.x-=0.003;
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    var px=p.x*W, py=b.Ec+10+(p.y-0.5)*20;
    var show=true;
    if(show){ ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fillStyle='#00f0ff'; ctx.fill(); ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fillStyle='rgba(0,240,255,0.12)'; ctx.fill();}
  });

  ctx.font='bold 12px JetBrains Mono';
  if(Vb>0 && Vb<vbi*0.35){ ctx.fillStyle='rgba(0,240,255,0.9)'; ctx.fillText('PEAK: Esaki tunnel current  ->',W/2-70,20); }
  else if(Vb>=vbi*0.35 && Vb<vbi*0.7){ ctx.fillStyle='rgba(255,78,205,0.9)'; ctx.fillText('VALLEY: thermal injection takes over',W/2-100,20); }
  else if(Vb>=vbi*0.7){ ctx.fillStyle='rgba(74,222,128,0.9)'; ctx.fillText('NORMAL forward diffusion',W/2-75,20); }
  else{ ctx.fillStyle='rgba(128,128,160,0.7)'; ctx.fillText('Equilibrium / overlap',W/2-60,20); }

  ctx.fillStyle='#8080a0'; ctx.font='10px JetBrains Mono';
  var Itun=MAT.I0*(Math.exp(Vb/(1.0*kB_eV*T))-1);
  ctx.fillText('Vbi='+vbi.toFixed(3)+'V  Itun='+Itun.toExponential(2)+'A',8,H-4);
}

/* --- n-MOSFET cross-section --- */
function drawNMOS(ctx,W,H,state){
  var Vg=state.Vgate, Vd=state.Vbias, Vth=0.4;
  var tox=8, Lch=60; // nm scale
  var subH=H*0.45, gateY=50, oxideH=28;
  var srcX=W*0.18, drainX=W*0.82, gateL=drainX-srcX;

  // substrate p-type
  ctx.fillStyle='rgba(74,222,128,0.06)'; ctx.fillRect(0,subH,W,H-subH);
  ctx.fillStyle='#4ade80'; ctx.font='11px JetBrains Mono'; ctx.fillText('p-substrate',10,H-10);

  // source n+ (left)
  ctx.fillStyle='rgba(0,240,255,0.18)'; ctx.fillRect(0,subH-35,srcX+10,35);
  ctx.strokeStyle='#00f0ff'; ctx.strokeRect(0,subH-35,srcX+10,35);
  ctx.fillStyle='#00f0ff'; ctx.fillText('n+ Source',10,subH-40);

  // drain n+ (right)
  ctx.fillStyle='rgba(0,240,255,0.18)'; ctx.fillRect(drainX-10,subH-35,W-(drainX-10),35);
  ctx.strokeStyle='#00f0ff'; ctx.strokeRect(drainX-10,subH-35,W-(drainX-10),35);
  ctx.fillStyle='#00f0ff'; ctx.fillText('n+ Drain',drainX,subH-40);

  // oxide
  ctx.fillStyle='rgba(180,180,200,0.15)'; ctx.fillRect(srcX,gateY+oxideH,drainX-srcX,subH-gateY-oxideH);
  ctx.strokeStyle='rgba(180,180,200,0.4)'; ctx.strokeRect(srcX,gateY+oxideH,drainX-srcX,subH-gateY-oxideH);
  ctx.fillStyle='rgba(160,160,180,0.7)'; ctx.fillText('SiO₂',srcX+5,gateY+oxideH+14);

  // gate metal
  ctx.fillStyle='rgba(255,213,79,0.25)'; ctx.fillRect(srcX-8,gateY,drainX-srcX+16,oxideH);
  ctx.strokeStyle='#ffd54f'; ctx.strokeRect(srcX-8,gateY,drainX-srcX+16,oxideH);
  ctx.fillStyle='#ffd54f'; ctx.fillText('Gate (n-MOS)',srcX,gateY-6);

  // channel / inversion layer
  var invDepth=Math.max(0, (Vg-Vth)*1.8);
  if(invDepth>0){
    ctx.fillStyle='rgba(0,240,255,0.18)'; ctx.fillRect(srcX,subH-invDepth,drainX-srcX,invDepth);
    ctx.strokeStyle='rgba(0,240,255,0.5)'; ctx.lineWidth=1; ctx.strokeRect(srcX,subH-invDepth,drainX-srcX,invDepth);
    ctx.fillStyle='#00f0ff'; ctx.font='10px JetBrains Mono'; ctx.fillText('inversion channel',srcX+4,subH-invDepth-3);
  }

  // source barrier (p-n junction between n+ source and p-sub)
  var srcBar=srcX+8;
  ctx.strokeStyle='rgba(180,180,200,0.3)'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(srcBar,subH-35); ctx.lineTo(srcBar,subH); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle='rgba(180,180,200,0.3)';
  ctx.beginPath(); ctx.moveTo(drainX-8,subH-35); ctx.lineTo(drainX-8,subH); ctx.stroke();

  // depletion under gate
  var Wd=Math.max(2, Math.sqrt(2*eps0*MAT.eps*Math.abs(Vg+0.8)/(q_eV*state.Na))*1e7 ); // cm->nm
  ctx.fillStyle='rgba(255,240,150,0.06)'; ctx.fillRect(srcX,subH,drainX-srcX,Wd);

  // electrons
  if(state.elec.length===0) state.elec=initParticles(90,'e');
  state.elec.forEach(function(p){
    p.x+=p.vx+(Math.random()-0.5)*0.004;
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    var px=p.x*W, py=40+(p.y)*(subH-60);
    var inSrc=px<srcX+8, inDrain=px>drainX-8, inChan=px>=srcX && px<=drainX && py>=subH-invDepth;
    var show=inSrc || inDrain || (inChan && invDepth>0);
    if(show){
      if(inChan && Vd>0){ px += (Vd*0.008)*((px-srcX)/(drainX-srcX)); } // drift to drain
      ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fillStyle='#00f0ff'; ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fillStyle='rgba(0,240,255,0.12)'; ctx.fill();
    }
  });

  // current arrow
  ctx.font='bold 12px JetBrains Mono';
  if(Vg>Vth && Vd>0){
    ctx.fillStyle='rgba(74,222,128,0.85)'; ctx.fillText('Ids (S -> D)',W/2-40,20);
    ctx.strokeStyle='rgba(74,222,128,0.6)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W/2-30,30); ctx.lineTo(W/2+50,30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2+50,25); ctx.lineTo(W/2+50,35); ctx.lineTo(W/2+62,30); ctx.closePath(); ctx.fill();
  }else if(Vg<Vth){ ctx.fillStyle='rgba(255,85,85,0.7)'; ctx.fillText('NO CHANNEL (cutoff)',W/2-60,20); }
  else{ ctx.fillStyle='rgba(128,128,160,0.6)'; ctx.fillText('Vd = 0 (no drift)',W/2-50,20); }

  ctx.fillStyle='#8080a0'; ctx.font='10px JetBrains Mono';
  ctx.fillText('Vg='+Vg.toFixed(2)+'V  Vd='+Vd.toFixed(2)+'V  Vth='+Vth.toFixed(2)+'V',8,H-4);
}

/* --- p-MOSFET cross-section --- */
function drawPMOS(ctx,W,H,state){
  var Vg=state.Vgate, Vd=state.Vbias, Vth=-0.45;
  var subH=H*0.45, gateY=50, oxideH=28;
  var srcX=W*0.18, drainX=W*0.82;

  // substrate n-type
  ctx.fillStyle='rgba(0,240,255,0.05)'; ctx.fillRect(0,subH,W,H-subH);
  ctx.fillStyle='#00f0ff'; ctx.font='11px JetBrains Mono'; ctx.fillText('n-substrate',10,H-10);

  // source p+ (left)
  ctx.fillStyle='rgba(255,78,205,0.18)'; ctx.fillRect(0,subH-35,srcX+10,35);
  ctx.strokeStyle='#ff4ecd'; ctx.strokeRect(0,subH-35,srcX+10,35);
  ctx.fillStyle='#ff4ecd'; ctx.fillText('p+ Source',10,subH-40);

  // drain p+ (right)
  ctx.fillStyle='rgba(255,78,205,0.18)'; ctx.fillRect(drainX-10,subH-35,W-(drainX-10),35);
  ctx.strokeStyle='#ff4ecd'; ctx.strokeRect(drainX-10,subH-35,W-(drainX-10),35);
  ctx.fillStyle='#ff4ecd'; ctx.fillText('p+ Drain',drainX,subH-40);

  // oxide
  ctx.fillStyle='rgba(180,180,200,0.15)'; ctx.fillRect(srcX,gateY+oxideH,drainX-srcX,subH-gateY-oxideH);
  ctx.strokeStyle='rgba(180,180,200,0.4)'; ctx.strokeRect(srcX,gateY+oxideH,drainX-srcX,subH-gateY-oxideH);
  ctx.fillStyle='rgba(160,160,180,0.7)'; ctx.fillText('SiO₂',srcX+5,gateY+oxideH+14);

  // gate
  ctx.fillStyle='rgba(255,213,79,0.25)'; ctx.fillRect(srcX-8,gateY,drainX-srcX+16,oxideH);
  ctx.strokeStyle='#ffd54f'; ctx.strokeRect(srcX-8,gateY,drainX-srcX+16,oxideH);
  ctx.fillStyle='#ffd54f'; ctx.fillText('Gate (p-MOS)',srcX,gateY-6);

  // inversion channel (hole accumulation)
  var invDepth=Math.max(0, Math.abs(Vg-Vth)*1.6);
  if(Vg<Vth && invDepth>0){
    ctx.fillStyle='rgba(255,78,205,0.15)'; ctx.fillRect(srcX,subH-invDepth,drainX-srcX,invDepth);
    ctx.strokeStyle='rgba(255,78,205,0.4)'; ctx.lineWidth=1; ctx.strokeRect(srcX,subH-invDepth,drainX-srcX,invDepth);
    ctx.fillStyle='#ff4ecd'; ctx.font='10px JetBrains Mono'; ctx.fillText('hole channel',srcX+4,subH-invDepth-3);
  }

  // depletion
  var Wd=Math.max(2, Math.sqrt(2*eps0*MAT.eps*Math.abs(Vg-0.8)/(q_eV*state.Nd))*1e7 );
  ctx.fillStyle='rgba(255,240,150,0.05)'; ctx.fillRect(srcX,subH,drainX-srcX,Wd);

  // holes
  if(state.holes.length===0) state.holes=initParticles(90,'h');
  state.holes.forEach(function(p){
    p.x+=p.vx+(Math.random()-0.5)*0.004;
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    var px=p.x*W, py=40+(p.y)*(subH-60);
    var inSrc=px<srcX+8, inDrain=px>drainX-8, inChan=px>=srcX && px<=drainX && py>=subH-invDepth;
    var show=inSrc || inDrain || (inChan && invDepth>0);
    if(show){
      if(inChan && Vd<0){ px += (Vd*0.008)*((px-srcX)/(drainX-srcX)); } // holes drift to source
      ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.strokeStyle='#ff4ecd'; ctx.lineWidth=1.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2); ctx.fillStyle='rgba(255,78,205,0.10)'; ctx.fill();
    }
  });

  ctx.font='bold 12px JetBrains Mono';
  if(Vg<Vth && Vd<0){
    ctx.fillStyle='rgba(74,222,128,0.85)'; ctx.fillText('Ids (D -> S, holes)',W/2-60,20);
    ctx.strokeStyle='rgba(74,222,128,0.6)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W/2+40,30); ctx.lineTo(W/2-40,30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2-40,25); ctx.lineTo(W/2-40,35); ctx.lineTo(W/2-52,30); ctx.closePath(); ctx.fill();
  }else if(Vg>Vth){ ctx.fillStyle='rgba(255,85,85,0.7)'; ctx.fillText('NO CHANNEL (cutoff)',W/2-60,20); }
  else{ ctx.fillStyle='rgba(128,128,160,0.6)'; ctx.fillText('Vd = 0 (no drift)',W/2-50,20); }

  ctx.fillStyle='#8080a0'; ctx.font='10px JetBrains Mono';
  ctx.fillText('Vg='+Vg.toFixed(2)+'V  Vd='+Vd.toFixed(2)+'V  Vth='+Vth.toFixed(2)+'V',8,H-4);
}

/* ========================= CANVAS RENDERER DISPATCH ========================= */
var jdCanvasAnim=null;
function renderJDCanvas(){
  var cvs=document.getElementById('canvas-junction'); if(!cvs) return;
  var ctx=cvs.getContext('2d');
  var W=cvs.width, H=cvs.height;
  ctx.clearRect(0,0,W,H);

  // dark background consistent with theme
  ctx.fillStyle='rgba(10,10,18,0.3)'; ctx.fillRect(0,0,W,H);

  switch(JD.device){
    case 'pn':     drawPNJunction(ctx,W,H,JD); break;
    case 'zener':  drawZener(ctx,W,H,JD); break;
    case 'tunnel': drawTunnel(ctx,W,H,JD); break;
    case 'nmos':   drawNMOS(ctx,W,H,JD); break;
    case 'pmos':   drawPMOS(ctx,W,H,JD); break;
    default:       drawPNJunction(ctx,W,H,JD);
  }
  JD.time+=1; JD.frames++;
}
function startJDCanvasLoop(){
  if(jdCanvasAnim) cancelAnimationFrame(jdCanvasAnim);
  (function loop(){ renderJDCanvas(); jdCanvasAnim=requestAnimationFrame(loop); })();
}

/* ========================= PLOTLY I-V CURVES ========================= */
function plotDiodeIV(){
  var Vf=[],If=[],Vr=[],Ir=[],T=JD.T;
  var Vmax=0.8, Vmin=-1.0, I0=MAT.I0;
  for(var v=0;v<=Vmax;v+=0.01){Vf.push(v);If.push(idealDiodeI(v,T,I0,1.0));}
  for(var v2=0;v2>=Vmin;v2-=0.01){Vr.push(v2);Ir.push(idealDiodeI(v2,T,I0,1.0));}
  var Vsc=Vf.slice(); var Isc=Vsc.map(function(v){return idealDiodeI(v,T,I0,1.0)-JD.photons;});
  _plot('plot-diode-iv',[
    {x:Vf,y:If,mode:'lines',name:'Dark I(V)',line:{color:'#00f0ff',width:2}},
    {x:Vr,y:Ir,mode:'lines',name:'Reverse I(V)',line:{color:'#ff4ecd',width:2}},
    {x:Vsc,y:Isc,mode:'lines',name:'Irradiated I(V)',line:{color:'#ffd54f',width:2,dash:'dash'}}
  ],jdLayout(null,'Voltage V (V)','Current I (A)',{
    shapes:[{type:'line',x0:0,x1:0,y0:-1e-6,y1:1e-6,line:{color:'#8080a0',width:1,dash:'dot'}}]
  }),{responsive:true,displayModeBar:false});
}

function plotZenerIV(){
  var V=[],I=[]; var T=JD.T, I0=MAT.I0;
  for(var v=-1.5;v<=0.8;v+=0.01){
    V.push(v);
    var base=idealDiodeI(v,T,I0,1.0);
    var breakdown=-0.8;
    if(v<breakdown){ var tun=0.05*Math.exp(3*(breakdown-v)); base-=tun; }
    I.push(base);
  }
  _plot('plot-zener-iv',[
    {x:V,y:I,mode:'lines',name:'Zener I(V)',line:{color:'#ff4ecd',width:2.5},fill:'tozeroy',fillcolor:'rgba(255,78,205,0.06)'}
  ],jdLayout(null,'Voltage V (V)','Current I (A)',{
    shapes:[{type:'line',x0:0,x1:0,y0:-1,y1:1,line:{color:'#8080a0',width:1,dash:'dot'}}],
    annotations:[{x:-0.7,y:-0.04,text:'Breakdown knee',font:{color:'#ffd54f',size:10},showarrow:false}]
  }),{responsive:true,displayModeBar:false});
}

function plotTunnelIV(){
  var V=[],I=[]; var T=JD.T, I0=MAT.I0, Ip=5e-5, Vp=0.12, Vv=0.35, Iv=2e-6;
  for(var v=-0.2;v<=0.6;v+=0.005){
    V.push(v);
    if(v<0) I.push(I0*(Math.exp(v/(kB_eV*T))-1));
    else if(v<Vp) I.push( I0*(Math.exp(v/(kB_eV*T))-1) + Ip*(v/Vp)*Math.exp(1-v/Vp) );
    else if(v<Vv) I.push( Iv + (Ip-Iv)*Math.exp(-(v-Vp)/0.08) );
    else I.push( I0*(Math.exp(v/(kB_eV*T))-1) + Iv*Math.exp(-(v-Vv)/0.15) );
  }
  _plot('plot-tunnel-iv',[
    {x:V,y:I,mode:'lines',name:'Tunnel I(V)',line:{color:'#00f0ff',width:2.5},fill:'tozeroy',fillcolor:'rgba(0,240,255,0.06)'}
  ],jdLayout(null,'Voltage V (V)','Current I (A)',{
    shapes:[{type:'line',x0:0,x1:0,y0:-1e-5,y1:5e-5,line:{color:'#8080a0',width:1,dash:'dot'}}],
    annotations:[
      {x:0.12,y:5e-5,text:'Peak',font:{color:'#00f0ff',size:10},showarrow:true,arrowhead:2,ax:20,ay:-20},
      {x:0.35,y:2e-6,text:'Valley',font:{color:'#ff4ecd',size:10},showarrow:true,arrowhead:2,ax:-20,ay:-20}
    ]
  }),{responsive:true,displayModeBar:false});
}

function plotMOSFETIV(){
  var cid=(JD.device==='pmos')?'plot-mos-iv-pmos':'plot-mos-iv';
  var Vd=[],Ids=[],T=JD.T;
  var Vth=(JD.device==='pmos')?-0.45:0.4;
  var mu=600, Cox=1e-7, Wch=10, Lch=1; // generic params
  for(var vd=0;vd<=1.0;vd+=0.01){Vd.push(vd);}
  var gates=[0.2,0.5,0.8,1.1];
  if(JD.device==='pmos') gates=[-0.2,-0.5,-0.8,-1.1];
  var traces=gates.map(function(Vg,col){
    var Id=[];
    for(var i=0;i<Vd.length;i++){
      var vd=Vd[i];
      if(JD.device==='nmos'){
        if(Vg<=Vth){ Id.push(0); }
        else if(vd<Vg-Vth){ Id.push(mu*Cox*(Wch/Lch)*((Vg-Vth)*vd - vd*vd/2)*1e-6); }
        else { Id.push(mu*Cox*(Wch/Lch)*Math.pow(Vg-Vth,2)/2*1e-6); }
      }else{
        if(Vg>=Vth){ Id.push(0); }
        else if(vd>Math.abs(Vg-Vth)){ Id.push(mu*Cox*(Wch/Lch)*((Math.abs(Vg-Vth))*Math.abs(vd) - vd*vd/2)*1e-6); }
        else { Id.push(mu*Cox*(Wch/Lch)*Math.pow(Vg-Vth,2)/2*1e-6); }
      }
    }
    var colors=['#ff4ecd','#00f0ff','#4ade80','#ffd54f'];
    return {x:Vd,y:Id,mode:'lines',name:'Vg='+Vg.toFixed(2)+'V',line:{color:colors[col],width:2}};
  });
  var yt=(JD.device==='pmos')?'Ids (p-MOS)':'Ids (n-MOS)';
  _plot(cid,traces,jdLayout(null,'Vds (V)',yt+' (mA)',{
    shapes:[{type:'line',x0:0,x1:0,y0:-1,y1:5,line:{color:'#8080a0',width:1,dash:'dot'}}]
  }),{responsive:true,displayModeBar:false});
}

function plotTransfer(){
  var cid=(JD.device==='pmos')?'plot-transfer-pmos':((JD.device==='nmos')?'plot-transfer-nmos':'plot-transfer');
  var Vg=[],Id=[]; var Vth=(JD.device==='pmos')?-0.45:0.4;
  var mu=600, Cox=1e-7, Wch=10, Lch=1;
  for(var vg=-0.8;vg<=1.5;vg+=0.02){Vg.push(vg);}
  for(var i=0;i<Vg.length;i++){
    var vg=Vg[i];
    if(JD.device==='nmos'){
      if(vg<=Vth) Id.push(0);
      else Id.push(mu*Cox*(Wch/Lch)*Math.pow(vg-Vth,2)/2*1e-6);
    }else{
      if(vg>=Vth) Id.push(0);
      else Id.push(mu*Cox*(Wch/Lch)*Math.pow(vg-Vth,2)/2*1e-6);
    }
  }
  _plot(cid,[
    {x:Vg,y:Id,mode:'lines',name:'Transfer',line:{color:'#ffd54f',width:2.5},fill:'tozeroy',fillcolor:'rgba(255,213,79,0.06)'}
  ],jdLayout(null,'Vgs (V)','Ids (mA)',{shapes:[{type:'line',x0:Vth,x1:Vth,y0:0,y1:Math.max.apply(null,Id),line:{color:'#ff4ecd',width:1,dash:'dot'}}]}),{responsive:true,displayModeBar:false});
}

/* ========================= DEPLETION PLOT ========================= */
function plotDepletion(){
  var cid='plot-depletion';
  if(JD.device==='zener') cid='plot-depletion-zener';
  else if(JD.device==='tunnel') cid='plot-depletion-tunnel';
  else if(JD.device==='nmos'||JD.device==='pmos') return; // MOSFET panels have no band-diagram
  var x=[],Wn=[],Wp=[],Ec=[],Ev=[];
  var Na=JD.Na, Nd=JD.Nd, T=JD.T, Vb=JD.Vbias;
  var vbi=Vbi(Na,Nd,T);
  var w=Wdep(Na,Nd,vbi,Vb,T)*1e5;
  var xn=w*Na/(Na+Nd), xp=w*Nd/(Na+Nd);
  for(var xi=-80;xi<=80;xi+=2){
    x.push(xi);
    var inN=xi>0, inP=xi<0;
    var psi=0;
    if(xi<-xp) psi=0; else if(xi>xn) psi=1; else { if(xi<0) psi=0.5/(1+Math.exp(-xi*2/xp)); else psi=0.5*(1+Math.tanh(xi*2/xn)); }
    var barrier=Math.max(vbi-Vb,0);
    Ec.push(1.2+barrier*0.15*(psi-0.5));
    Ev.push(Ec[Ec.length-1]-1.12);
    Wn.push(inN?w*1e-7:0); Wp.push(inP?w*1e-7:0);// placeholder for region fill
  }
  _plot(cid,[
    {x:x,y:Ec,mode:'lines',name:'Ec',line:{color:'#ff4ecd',width:2}},
    {x:x,y:Ev,mode:'lines',name:'Ev',line:{color:'#4ade80',width:2}}
  ],jdLayout(null,'Position x (nm)','Energy (eV)'),{responsive:true,displayModeBar:false});
}

/* ========================= DEVICE SWITCHING / RENDER ========================= */
function setJDDevice(dev){
  JD.device=dev;
  // reset particles for fresh visual
  JD.elec=[]; JD.holes=[]; JD.time=0;
  // update visible panels
  var ids=['panel-pn','panel-zener','panel-tunnel','panel-nmos','panel-pmos'];
  ids.forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display=(id==='panel-'+dev)?'block':'none'; });
  // sync tab UI
  if(typeof window._refreshDeviceTabs==='function') window._refreshDeviceTabs(dev);
  // refresh plots
  if(dev==='pn'){ plotDiodeIV(); }
  if(dev==='zener'){ plotZenerIV(); }
  if(dev==='tunnel'){ plotTunnelIV(); }
  if(dev==='nmos'||dev==='pmos'){ plotMOSFETIV(); plotTransfer(); }
  plotDepletion();
  updateLiveJD();
}

function jdRefreshAll(){
  switch(JD.device){
    case 'pn': plotDiodeIV(); break;
    case 'zener': plotZenerIV(); break;
    case 'tunnel': plotTunnelIV(); break;
    case 'nmos': case 'pmos': plotMOSFETIV(); plotTransfer(); break;
  }
  plotDepletion(); updateLiveJD();
}

/* ========================= LIVE READOUT ========================= */
function updateLiveJD(){
  var Na=JD.Na, Nd=JD.Nd, T=JD.T, Vb=JD.Vbias;
  var vbi=Vbi(Na,Nd,T);
  var w=Wdep(Na,Nd,vbi,Vb,T)*1e4; // microns
  var xn=w*Na/(Na+Nd), xp=w*Nd/(Na+Nd);
  var I=idealDiodeI(Vb,T,MAT.I0,1.0);
  var Voc=JD.photons>0? kB_eV*T*Math.log(JD.photons/MAT.I0+1):0;

  var eVbi=document.getElementById('live-Vbi'); if(eVbi) eVbi.textContent=vbi.toFixed(3)+' V';
  var eW=document.getElementById('live-W'); if(eW) eW.textContent=w.toFixed(3)+' um';
  var eXp=document.getElementById('live-xnxp'); if(eXp) eXp.textContent='xn='+xn.toFixed(3)+' / xp='+xp.toFixed(3);
  var eI=document.getElementById('live-Ibias'); if(eI) eI.textContent=I.toExponential(2)+' A';
  var eVoc=document.getElementById('live-Voc'); if(eVoc) eVoc.textContent=Voc.toFixed(3)+' V';

  var eDev=document.getElementById('live-device'); if(eDev) eDev.textContent=JD.device.toUpperCase();
}

/* ========================= INITIALISATION ========================= */
function initJunction(){
  var sNa=document.getElementById('slider-Na'); var sNd=document.getElementById('slider-Nd');
  var sT=document.getElementById('slider-T-jd'); var sV=document.getElementById('slider-Vbias');
  var sIph=document.getElementById('slider-Isc'); var sVg=document.getElementById('slider-Vgate');

  function _on(){ jdRefreshAll(); }

  if(sNa) sNa.addEventListener('input',function(){ JD.Na=Math.pow(10,Number.parseFloat(this.value)); var el=document.getElementById('val-Na'); if(el) el.textContent=JD.Na.toExponential(1); _on(); });
  if(sNd) sNd.addEventListener('input',function(){ JD.Nd=Math.pow(10,Number.parseFloat(this.value)); var el=document.getElementById('val-Nd'); if(el) el.textContent=JD.Nd.toExponential(1); _on(); });
  if(sT)  sT.addEventListener('input',function(){ JD.T=Number.parseFloat(this.value); var el=document.getElementById('val-T-jd'); if(el) el.textContent=JD.T; _on(); });
  if(sV)  sV.addEventListener('input',function(){ JD.Vbias=Number.parseFloat(this.value); var el=document.getElementById('val-Vbias'); if(el) el.textContent=JD.Vbias.toFixed(2); _on(); });
  if(sIph) sIph.addEventListener('input',function(){ JD.photons=Number.parseFloat(this.value); var el=document.getElementById('val-Isc'); if(el) el.textContent=JD.photons.toExponential(1); _on(); });
  if(sVg) sVg.addEventListener('input',function(){ JD.Vgate=Number.parseFloat(this.value); var el=document.getElementById('val-Vgate'); if(el) el.textContent=JD.Vgate.toFixed(2); _on(); });

  // device tab wiring (single-shot; inline onclick already triggers setJDDevice)
  //_refreshDeviceTabs is wired in jd_apps.js; no duplicate listeners needed here

  // canvas init
  var cvs=document.getElementById('canvas-junction');
  if(cvs){
    var rect=cvs.parentElement?cvs.parentElement.getBoundingClientRect():{width:600,height:320};
    cvs.width=Math.floor(rect.width||600); cvs.height=320;
    startJDCanvasLoop();
  }

  setJDDevice('pn');
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initJunction); else setTimeout(initJunction,50);
window.initJunction=initJunction;
window.setJDDevice=setJDDevice;
window.jdRefreshAll=jdRefreshAll;

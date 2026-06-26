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
    font:{family:'sans-serif',color:'#8080a0',size:11},
    xaxis:{title:xt,color:'#505070',gridcolor:'#1a1a28',zerolinecolor:'#2a2a3a'},
    yaxis:{title:yt,color:'#505070',gridcolor:'#1a1a28',zerolinecolor:'#2a2a3a'},
    legend:{x:0.02,y:0.98,bgcolor:'rgba(10,10,15,0.8)',bordercolor:'#2a2a3a',borderwidth:1},hovermode:'x unified'};
  if(extra){if(extra.xaxis)Object.assign(base.xaxis,extra.xaxis);if(extra.yaxis)Object.assign(base.yaxis,extra.yaxis);var r={};for(var k in extra){if(k!=='xaxis'&&k!=='yaxis')r[k]=extra[k];}Object.assign(base,r);}
  return base;
}

/* ========================= 2D CANVAS LATTICE ========================= */
function initParticles(count,type){ var arr=[]; for(var i=0;i<count;i++){ arr.push({x:Math.random(),y:Math.random(),vx:(Math.random()-0.5)*0.4e-3,vy:(Math.random()-0.5)*0.4e-3,alive:true}); } return arr; }

/* ========================= CANVAS DRAWING HELPERS ========================= */
function jdGrid(ctx,W,H){
  // subtle vertical position grid
  ctx.strokeStyle='rgba(128,128,160,0.06)'; ctx.lineWidth=1;
  for(var gx=0;gx<W;gx+=60){ ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
  for(var gy=0;gy<H;gy+=50){ ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }
  // central zero line
  ctx.strokeStyle='rgba(128,128,160,0.18)'; ctx.setLineDash([4,4]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
}
function jdAxisLabels(ctx,W,H,labels){
  ctx.fillStyle='rgba(128,128,160,0.7)'; ctx.font='10px sans-serif';
  if(labels.x) ctx.fillText(labels.x,W-40,H-8);
  if(labels.y){ ctx.save(); ctx.translate(10,H/2); ctx.rotate(-Math.PI/2); ctx.textAlign='center'; ctx.fillText(labels.y,0,0); ctx.restore(); }
}
function jdLegend(ctx,W,items){
  var x=W-118, y=14, h=18, pad=4;
  ctx.fillStyle='rgba(10,10,18,0.75)'; ctx.fillRect(x-6,4,124,items.length*h+10); ctx.strokeStyle='rgba(128,128,160,0.2)'; ctx.strokeRect(x-6,4,124,items.length*h+10);
  items.forEach(function(it,i){
    var ly=y+i*h;
    ctx.beginPath(); ctx.arc(x,ly,4,0,Math.PI*2); ctx.fillStyle=it.fill; ctx.fill();
    if(it.stroke){ ctx.strokeStyle=it.stroke; ctx.lineWidth=1.5; ctx.stroke(); }
    ctx.fillStyle='rgba(200,200,220,0.9)'; ctx.font='10px sans-serif'; ctx.fillText(it.label,x+10,ly+3);
  });
}
function jdContactLabels(ctx,W,H,Vb){
  ctx.font='bold 12px sans-serif';
  var leftLabel='p-side', rightLabel='n-side';
  if(Vb>0){ leftLabel='−  p-side'; rightLabel='+  n-side'; }
  else if(Vb<0){ leftLabel='+  p-side'; rightLabel='−  n-side'; }
  ctx.fillStyle='rgba(74,222,128,0.95)'; ctx.textAlign='left'; ctx.fillText(leftLabel,12,26);
  ctx.fillStyle='rgba(0,240,255,0.95)'; ctx.textAlign='right'; ctx.fillText(rightLabel,W-12,26); ctx.textAlign='left';
  ctx.fillStyle='rgba(200,200,220,0.75)'; ctx.font='10px sans-serif';
  ctx.fillText('bias V = '+Vb.toFixed(2)+' V',12,H-22);
}
function jdReadoutFooter(ctx,W,H,lines){
  ctx.fillStyle='rgba(128,128,160,0.9)'; ctx.font='10px sans-serif';
  var text=lines.join('  ·  '); ctx.fillText(text,12,H-6);
}
function jdContacts(ctx,W,H,Vb,sideColors){
  var barW=14;
  // left metal
  var lg=ctx.createLinearGradient(0,0,barW,0); lg.addColorStop(0,'rgba(180,180,200,0.35)'); lg.addColorStop(1,'rgba(180,180,200,0.08)');
  ctx.fillStyle=lg; ctx.fillRect(0,0,barW,H); ctx.strokeStyle='rgba(200,200,220,0.25)'; ctx.strokeRect(0,0,barW,H);
  // right metal
  var rg=ctx.createLinearGradient(W-barW,0,W,0); rg.addColorStop(0,'rgba(180,180,200,0.08)'); rg.addColorStop(1,'rgba(180,180,200,0.35)');
  ctx.fillStyle=rg; ctx.fillRect(W-barW,0,barW,H); ctx.strokeStyle='rgba(200,200,220,0.25)'; ctx.strokeRect(W-barW,0,barW,H);
  // polarity chips
  ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
  if(Vb>0){ ctx.fillStyle='#ff4ecd'; ctx.fillText('−',barW/2,26); ctx.fillStyle='#00f0ff'; ctx.fillText('+',W-barW/2,26); }
  else if(Vb<0){ ctx.fillStyle='#00f0ff'; ctx.fillText('+',barW/2,26); ctx.fillStyle='#ff4ecd'; ctx.fillText('−',W-barW/2,26); }
  else{ ctx.fillStyle='rgba(200,200,220,0.6)'; ctx.fillText('0',barW/2,26); ctx.fillText('0',W-barW/2,26); }
  ctx.textAlign='left';
}

/* --- p-n junction band drawing --- */
function drawPNJunction(ctx,W,H,state){
  var Na=state.Na, Nd=state.Nd, T=state.T, Vb=state.Vbias;
  var vbi=Vbi(Na,Nd,T);
  var eps=eps0*MAT.eps;
  var w=Wdep(Na,Nd,vbi,Vb,T)*1e5; // cm -> nm scale, *1e5 for display
  var scaleX=W/220; // 220 nm total domain shown
  var centre=W/2;
  var xn=w*Na/(Na+Nd), xp=w*Nd/(Na+Nd);
  var leftEdge=Math.max(10, centre-xp*scaleX), rightEdge=Math.min(W-10, centre+xn*scaleX);

  jdGrid(ctx,W,H);

  // band energies (display units): conduction band ABOVE valence band on screen
  var EvTop=56, EvBot=H-56, bandRange=EvBot-EvTop;
  var EgDisp=bandRange*0.35;

  // compute Ec and Ev at pixel x: Ec = Ev + EgDisp, so Ec is higher energy AND lower y (above on screen)
  function bandCurve(xp){
    var dx=xp-centre;
    var psi=0;
    if(dx< -xp*scaleX) psi=0;
    else if(dx> xn*scaleX) psi=1;
    else { var xi=dx/scaleX; if(xi<0) psi=0.5/(1+Math.exp(-xi*2/Math.max(xp,1))); else psi=0.5*(1+Math.tanh(xi*2/Math.max(xn,1))); }
    var barrier=Math.max(vbi-Vb,0);
    var Ev=EvTop+0.2*bandRange+barrier*7.5*(psi-0.5);
    var Ec=Ev+EgDisp; // conduction band above valence band
    return {Ec:Ec,Ev:Ev,psi:psi};
  }

  // background zones with soft gradients
  var gradP=ctx.createLinearGradient(0,0,leftEdge,0); gradP.addColorStop(0,'rgba(74,222,128,0.07)'); gradP.addColorStop(1,'rgba(74,222,128,0.0)');
  ctx.fillStyle=gradP; ctx.fillRect(0,0,leftEdge,H);
  var gradN=ctx.createLinearGradient(rightEdge,0,W,0); gradN.addColorStop(0,'rgba(0,240,255,0.0)'); gradN.addColorStop(1,'rgba(0,240,255,0.07)');
  ctx.fillStyle=gradN; ctx.fillRect(rightEdge,0,W-rightEdge,H);

  // band-gap fill
  ctx.beginPath(); for(var xx=0;xx<=W;xx+=2){ var b=bandCurve(xx); if(xx===0) ctx.moveTo(xx,b.Ev); else ctx.lineTo(xx,b.Ev); }
  for(var xx3=W;xx3>=0;xx3-=2){ var b3=bandCurve(xx3); ctx.lineTo(xx3,b3.Ec); }
  ctx.closePath();
  var gapGrad=ctx.createLinearGradient(0,EvTop,0,EvBot); gapGrad.addColorStop(0,'rgba(255,78,205,0.04)'); gapGrad.addColorStop(1,'rgba(0,240,255,0.04)');
  ctx.fillStyle=gapGrad; ctx.fill();

  // depletion zone vertical band
  if(rightEdge-leftEdge>2){
    var depGrad=ctx.createLinearGradient(leftEdge,0,rightEdge,0);
    depGrad.addColorStop(0,'rgba(255,240,150,0.0)'); depGrad.addColorStop(0.5,'rgba(255,240,150,0.10)'); depGrad.addColorStop(1,'rgba(255,240,150,0.0)');
    ctx.fillStyle=depGrad; ctx.fillRect(leftEdge,0,rightEdge-leftEdge,H);
  }

  // draw band edges with glow: Ec above, Ev below
  ctx.lineWidth=2.5;
  ctx.shadowColor='rgba(255,78,205,0.35)'; ctx.shadowBlur=8;
  ctx.beginPath(); for(var xx4=0;xx4<=W;xx4+=2){ var b4=bandCurve(xx4); if(xx4===0) ctx.moveTo(xx4,b4.Ec); else ctx.lineTo(xx4,b4.Ec); }
  ctx.strokeStyle='#ff4ecd'; ctx.stroke(); ctx.shadowBlur=0;
  ctx.shadowColor='rgba(74,222,128,0.35)'; ctx.shadowBlur=8;
  ctx.beginPath(); for(var xx5=0;xx5<=W;xx5+=2){ var b5=bandCurve(xx5); if(xx5===0) ctx.moveTo(xx5,b5.Ev); else ctx.lineTo(xx5,b5.Ev); }
  ctx.strokeStyle='#4ade80'; ctx.stroke(); ctx.shadowBlur=0;

  // Fermi level (dashed)
  var EF=EvTop+0.2*bandRange+EgDisp*0.5-(vbi-Vb)*0.5;
  ctx.strokeStyle='#ffd54f'; ctx.setLineDash([6,4]); ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,EF); ctx.lineTo(W,EF); ctx.stroke(); ctx.setLineDash([]);

  // labels
  ctx.fillStyle='#ff4ecd'; ctx.font='bold 12px sans-serif'; ctx.fillText('Ec (conduction band)',22,EvTop+18);
  ctx.fillStyle='#4ade80'; ctx.fillText('Ev (valence band)',22,H-38);
  ctx.fillStyle='#ffd54f'; ctx.fillText('E_F (Fermi level)',22,EF+16);

  // depletion region markers
  if(rightEdge-leftEdge>4){
    ctx.strokeStyle='rgba(255,240,150,0.55)'; ctx.lineWidth=1.2; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(leftEdge,20); ctx.lineTo(leftEdge,H-20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rightEdge,20); ctx.lineTo(rightEdge,H-20); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,240,150,0.8)'; ctx.font='10px sans-serif'; ctx.fillText('depletion region',leftEdge+6,H-26);
  }

  jdContacts(ctx,W,H,Vb);

  // particle generation each frame
  if(state.elec.length===0) state.elec=initParticles(90,'e');
  if(state.holes.length===0) state.holes=initParticles(90,'h');

  // movement + rendering
  var elecCount=0, holeCount=0;

  // electrons: majority in n-side, minority in p-side
  state.elec.forEach(function(p){
    var b=bandCurve(p.x);
    var inN=p.x>(rightEdge+14)/W, inP=p.x<(leftEdge-14)/W, inDep=p.x>=(leftEdge-14)/W && p.x<=(rightEdge+14)/W;

    // thermal motion
    p.x += p.vx + (Math.random()-0.5)*0.003;
    p.y += p.vy + (Math.random()-0.5)*0.003;

    // bias drift
    if(Vb>0){ // forward: electrons drift n→p (left)
      if(inN || inDep) p.x -= 0.0008*Math.abs(Vb);
    }else if(Vb<0){ // reverse: swept away from junction, still visible
      if(inDep) p.x += (p.x>0.5?0.002:-0.002)*Math.abs(Vb);
      else if(inP) p.x -= 0.001*Math.abs(Vb);
    }

    // boundaries
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    if(p.y<0) p.y=0.001; if(p.y>1) p.y=0.999;

    var px=p.x*W, py=b.Ec+8+(p.y-0.5)*20;
    if(py<b.Ec+3) py=b.Ec+3; if(py>H-20) py=H-20;

    var show=false;
    if(inN){ show=true; p.alive=true; }
    else if(inDep){ show=true; p.alive=true; }
    else if(inP){ show=(Vb>0 && Math.random()>0.86) || (Vb<=0 && Math.random()>0.70); } // minority tail, always some

    if(show && p.alive!==false){
      // electron dot with glow
      var g=ctx.createRadialGradient(px,py,1,px,py,12);
      g.addColorStop(0,'rgba(0,240,255,0.45)'); g.addColorStop(1,'rgba(0,240,255,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,12,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,3.5,0,Math.PI*2); ctx.fillStyle='#00f0ff'; ctx.fill();
      elecCount++;
      // velocity arrow for obvious drift
      if(Math.abs(Vb)>0.05 && inDep){
        ctx.strokeStyle='rgba(0,240,255,0.6)'; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(px-12,py-3); ctx.lineTo(px+2,py-3); ctx.stroke();
      }
    }
  });

  // holes: majority in p-side
  state.holes.forEach(function(p){
    var b=bandCurve(p.x);
    var inN=p.x>(rightEdge+14)/W, inP=p.x<(leftEdge-14)/W, inDep=p.x>=(leftEdge-14)/W && p.x<=(rightEdge+14)/W;
    p.x += p.vx + (Math.random()-0.5)*0.003;
    p.y += p.vy + (Math.random()-0.5)*0.003;

    if(Vb>0){ // forward: holes drift p→n (right)
      if(inP || inDep) p.x += 0.0008*Math.abs(Vb);
    }else if(Vb<0){
      if(inDep) p.x += (p.x<0.5?-0.002:0.002)*Math.abs(Vb);
      else if(inN) p.x += 0.001*Math.abs(Vb);
    }

    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    if(p.y<0) p.y=0.001; if(p.y>1) p.y=0.999;

    var px=p.x*W, py=b.Ev-8+(p.y-0.5)*20;
    if(py<b.Ec+3) py=b.Ec+3; if(py>b.Ev-3) py=b.Ev-3;

    var show=false;
    if(inP){ show=true; p.alive=true; }
    else if(inDep){ show=true; p.alive=true; }
    else if(inN){ show=(Vb>0 && Math.random()>0.86) || (Vb<=0 && Math.random()>0.70); }

    if(show && p.alive!==false){
      var g=ctx.createRadialGradient(px,py,1,px,py,14);
      g.addColorStop(0,'rgba(255,78,205,0.35)'); g.addColorStop(1,'rgba(255,78,205,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,14,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.strokeStyle='#ff4ecd'; ctx.lineWidth=1.8; ctx.stroke();
      holeCount++;
      if(Math.abs(Vb)>0.05 && inDep){
        ctx.strokeStyle='rgba(255,78,205,0.6)'; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(px-2,py-3); ctx.lineTo(px+12,py-3); ctx.stroke();
      }
    }
  });

  // conventional current arrow overlay
  ctx.font='bold 13px sans-serif';
  if(Vb>0.1){
    ctx.fillStyle='rgba(74,222,128,0.95)'; ctx.fillText('Forward current  p → n',W/2-78,42);
    ctx.strokeStyle='rgba(74,222,128,0.8)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(W/2-40,56); ctx.lineTo(W/2+40,56); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2+40,51); ctx.lineTo(W/2+40,61); ctx.lineTo(W/2+52,56); ctx.closePath(); ctx.fill();
  }else if(Vb<-0.1){
    ctx.fillStyle='rgba(255,85,85,0.95)'; ctx.fillText('Reverse bias — depletion widens',W/2-98,42);
    ctx.strokeStyle='rgba(255,85,85,0.6)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W/2+40,56); ctx.lineTo(W/2-40,56); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2-40,51); ctx.lineTo(W/2-40,61); ctx.lineTo(W/2-52,56); ctx.closePath(); ctx.fill();
  }else{
    ctx.fillStyle='rgba(128,128,160,0.9)'; ctx.fillText('Equilibrium — no net current',W/2-90,42);
  }

  jdContactLabels(ctx,W,H,Vb);
  jdLegend(ctx,W,[
    {fill:'#00f0ff',label:'electron'},
    {fill:'#ff4ecd',stroke:'#ff4ecd',label:'hole'},
    {fill:'#ffd54f',label:'E_F'},
    {fill:'rgba(255,240,150,0.7)',label:'depletion'}
  ]);
  jdReadoutFooter(ctx,W,H,['V_bi='+vbi.toFixed(3)+' V','W='+w.toFixed(1)+' nm','I='+idealDiodeI(Vb,T,MAT.I0,1.0).toExponential(2)+' A']);
  jdAxisLabels(ctx,W,H,{x:'x (nm)',y:'Energy (eV)'});
}

/* --- Zener diode: emphasise breakdown + tunneling electrons --- */
function drawZener(ctx,W,H,state){
  var Na=state.Na*3, Nd=state.Nd*3, T=state.T, Vb=state.Vbias;
  var vbi=Vbi(Na,Nd,T);
  var w=Wdep(Na,Nd,vbi,Vb,T)*1e5;
  var scaleX=W/140, centre=W/2;
  var xn=w*Na/(Na+Nd), xp=w*Nd/(Na+Nd);
  var leftEdge=centre-xp*scaleX, rightEdge=centre+xn*scaleX;

  jdGrid(ctx,W,H);

  // band energies: conduction band ABOVE valence band
  var EvTop=60, EvBot=H-60, bandRange=EvBot-EvTop, EgDisp=bandRange*0.35;
  var breakdown=-vbi*0.85; // approx zener knee

  function bandCurve(xp2){
    var dx=xp2-centre;
    var psi=0;
    if(dx<-xp*scaleX) psi=0;
    else if(dx>xn*scaleX) psi=1;
    else{ var xi=dx/scaleX; if(xi<0) psi=0.5/(1+Math.exp(-xi*2/xp)); else psi=0.5*(1+Math.tanh(xi*2/xn)); }
    var barrier=Math.max(vbi-Vb,0);
    var Ev=EvTop+0.2*bandRange+barrier*8*(psi-0.5);
    var Ec=Ev+EgDisp; return {Ec:Ec,Ev:Ev,psi:psi};
  }

  // background zones
  var gradP=ctx.createLinearGradient(0,0,leftEdge,0); gradP.addColorStop(0,'rgba(74,222,128,0.07)'); gradP.addColorStop(1,'rgba(74,222,128,0.0)');
  ctx.fillStyle=gradP; ctx.fillRect(0,0,leftEdge,H);
  var gradN=ctx.createLinearGradient(rightEdge,0,W,0); gradN.addColorStop(0,'rgba(0,240,255,0.0)'); gradN.addColorStop(1,'rgba(0,240,255,0.07)');
  ctx.fillStyle=gradN; ctx.fillRect(rightEdge,0,W-rightEdge,H);
  // band-gap fill
  ctx.beginPath(); for(var xx=0;xx<=W;xx+=2){ var b=bandCurve(xx); if(xx===0) ctx.moveTo(xx,b.Ev); else ctx.lineTo(xx,b.Ev); }
  for(var xx3=W;xx3>=0;xx3-=2){ var b3=bandCurve(xx3); ctx.lineTo(xx3,b3.Ec); }
  ctx.closePath();
  var gapGrad=ctx.createLinearGradient(0,EvTop,0,EvBot); gapGrad.addColorStop(0,'rgba(255,78,205,0.04)'); gapGrad.addColorStop(1,'rgba(0,240,255,0.04)');
  ctx.fillStyle=gapGrad; ctx.fill();
  // depletion band
  if(rightEdge-leftEdge>2){
    var depGrad=ctx.createLinearGradient(leftEdge,0,rightEdge,0);
    depGrad.addColorStop(0,'rgba(255,240,150,0.0)'); depGrad.addColorStop(0.5,'rgba(255,240,150,0.10)'); depGrad.addColorStop(1,'rgba(255,240,150,0.0)');
    ctx.fillStyle=depGrad; ctx.fillRect(leftEdge,0,rightEdge-leftEdge,H);
  }

  // band edges with glow
  ctx.lineWidth=2.5;
  ctx.shadowColor='rgba(255,78,205,0.35)'; ctx.shadowBlur=8;
  ctx.beginPath(); for(var xx=0;xx<=W;xx+=2){ var b=bandCurve(xx); if(xx===0) ctx.moveTo(xx,b.Ec); else ctx.lineTo(xx,b.Ec); }
  ctx.strokeStyle='#ff4ecd'; ctx.stroke(); ctx.shadowBlur=0;
  ctx.shadowColor='rgba(74,222,128,0.35)'; ctx.shadowBlur=8;
  ctx.beginPath(); for(var xx2=0;xx2<=W;xx2+=2){ var b2=bandCurve(xx2); if(xx2===0) ctx.moveTo(xx2,b2.Ev); else ctx.lineTo(xx2,b2.Ev); }
  ctx.strokeStyle='#4ade80'; ctx.stroke(); ctx.shadowBlur=0;

  // valence band on p-side raised, conduction on n-side lowered => triangular barrier in reverse
  var EF=EvTop+0.2*bandRange+EgDisp*0.5-(vbi-Vb)*0.5;
  ctx.strokeStyle='#ffd54f'; ctx.setLineDash([6,4]); ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,EF); ctx.lineTo(W,EF); ctx.stroke(); ctx.setLineDash([]);

  // tunneling visualization (only heavy reverse bias)
  if(Vb<breakdown && w<15){
    ctx.strokeStyle='rgba(255,78,205,0.6)'; ctx.setLineDash([4,4]); ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(leftEdge-20,EF); ctx.lineTo(rightEdge+20,EF); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,78,205,0.25)'; ctx.fillRect(leftEdge,EF-10,rightEdge-leftEdge,20);
    ctx.fillStyle='#ff4ecd'; ctx.font='bold 11px sans-serif'; ctx.fillText('BAND-TO-BAND TUNNELING',W/2-65,H/2-20);
    // animated tunneling electrons
    var tunCount=Math.floor(Math.min(Math.abs(Vb-breakdown)*200,60));
    for(var ti=0;ti<tunCount;ti++){
      var tx=leftEdge + Math.random()*(rightEdge-leftEdge);
      var ty=EF+(Math.random()-0.5)*12;
      ctx.beginPath(); ctx.arc(tx,ty,3,0,Math.PI*2); ctx.fillStyle='#ff4ecd'; ctx.fill();
      ctx.beginPath(); ctx.arc(tx,ty,6,0,Math.PI*2); ctx.fillStyle='rgba(255,78,205,0.20)'; ctx.fill();
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
    if(show){
      var g=ctx.createRadialGradient(px,py,1,px,py,10); g.addColorStop(0,'rgba(0,240,255,0.40)'); g.addColorStop(1,'rgba(0,240,255,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,10,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fillStyle='#00f0ff'; ctx.fill();
    }
  });
  state.holes.forEach(function(p){
    var b=bandCurve(p.x); var inN=p.x>rightEdge/W, inP=p.x<leftEdge/W, inDep=p.x>=leftEdge/W && p.x<=rightEdge/W;
    p.x+=p.vx+(Math.random()-0.5)*0.003; if(Vb<breakdown && inDep) p.x+=0.004;
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    var px=p.x*W, py=b.Ev-10+(p.y-0.5)*20;
    var show=inP||(inDep&&Vb<breakdown&&Math.random()>0.5);
    if(show){
      var g=ctx.createRadialGradient(px,py,1,px,py,12); g.addColorStop(0,'rgba(255,78,205,0.30)'); g.addColorStop(1,'rgba(255,78,205,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,12,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.strokeStyle='#ff4ecd'; ctx.lineWidth=1.8; ctx.stroke();
    }
  });

  ctx.font='bold 12px sans-serif';
  if(Vb<breakdown){ ctx.fillStyle='rgba(255,85,85,0.9)'; ctx.fillText('ZENER BREAKDOWN — sharp reverse current',W/2-100,22); }
  else if(Vb<0){ ctx.fillStyle='rgba(255,85,85,0.6)'; ctx.fillText('Reverse bias (blocking)',W/2-70,22); }
  else{ ctx.fillStyle='rgba(74,222,128,0.8)'; ctx.fillText('Forward bias (normal diode)',W/2-80,22); }

  jdContacts(ctx,W,H,Vb);
  jdContactLabels(ctx,W,H,Vb);
  jdLegend(ctx,W,[
    {fill:'#00f0ff',label:'electron'},
    {fill:'#ff4ecd',stroke:'#ff4ecd',label:'hole'},
    {fill:'#ffd54f',label:'E_F'},
    {fill:'rgba(255,78,205,0.5)',label:'tunneling'}
  ]);
  jdReadoutFooter(ctx,W,H,['V_bi='+vbi.toFixed(3)+' V','V_break~'+breakdown.toFixed(2)+' V','I='+idealDiodeI(Vb,T,MAT.I0,1.0).toExponential(2)+' A']);
  jdAxisLabels(ctx,W,H,{x:'x (nm)',y:'Energy (eV)'});
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

  jdGrid(ctx,W,H);

  // conduction band ABOVE valence band
  var EvTop=60, EvBot=H-60, bandRange=EvBot-EvTop, EgDisp=bandRange*0.30;

  // heavily doped -> degenerate: bands overlap in equilibrium
  function bandCurve(xp2){
    var dx=xp2-centre;
    var psi=0;
    if(dx<-xp*scaleX) psi=0; else if(dx>xn*scaleX) psi=1;
    else{ var xi=dx/scaleX; if(xi<0) psi=0.5/(1+Math.exp(-xi*2/xp)); else psi=0.5*(1+Math.tanh(xi*2/xn)); }
    var barrier=Math.max(vbi-Vb,0);
    var Ev=EvTop+0.25*bandRange+barrier*6*(psi-0.5);
    var Ec=Ev+EgDisp; return {Ec:Ec,Ev:Ev};
  }

  // background zones + band-gap fill
  var gradP=ctx.createLinearGradient(0,0,leftEdge,0); gradP.addColorStop(0,'rgba(74,222,128,0.07)'); gradP.addColorStop(1,'rgba(74,222,128,0.0)');
  ctx.fillStyle=gradP; ctx.fillRect(0,0,leftEdge,H);
  var gradN=ctx.createLinearGradient(rightEdge,0,W,0); gradN.addColorStop(0,'rgba(0,240,255,0.0)'); gradN.addColorStop(1,'rgba(0,240,255,0.07)');
  ctx.fillStyle=gradN; ctx.fillRect(rightEdge,0,W-rightEdge,H);
  ctx.beginPath(); for(var xx=0;xx<=W;xx+=2){ var b=bandCurve(xx); if(xx===0) ctx.moveTo(xx,b.Ev); else ctx.lineTo(xx,b.Ev); }
  for(var xx3=W;xx3>=0;xx3-=2){ var b3=bandCurve(xx3); ctx.lineTo(xx3,b3.Ec); }
  ctx.closePath();
  var gapGrad=ctx.createLinearGradient(0,EvTop,0,EvBot); gapGrad.addColorStop(0,'rgba(255,78,205,0.04)'); gapGrad.addColorStop(1,'rgba(0,240,255,0.04)');
  ctx.fillStyle=gapGrad; ctx.fill();

  // band edges with glow
  ctx.lineWidth=2.5;
  ctx.shadowColor='rgba(255,78,205,0.35)'; ctx.shadowBlur=8;
  ctx.beginPath(); for(var xx=0;xx<=W;xx+=2){ var b=bandCurve(xx); if(xx===0) ctx.moveTo(xx,b.Ec); else ctx.lineTo(xx,b.Ec); }
  ctx.strokeStyle='#ff4ecd'; ctx.stroke(); ctx.shadowBlur=0;
  ctx.shadowColor='rgba(74,222,128,0.35)'; ctx.shadowBlur=8;
  ctx.beginPath(); for(var xx2=0;xx2<=W;xx2+=2){ var b2=bandCurve(xx2); if(xx2===0) ctx.moveTo(xx2,b2.Ev); else ctx.lineTo(xx2,b2.Ev); }
  ctx.strokeStyle='#4ade80'; ctx.stroke(); ctx.shadowBlur=0;

  var EF=EvTop+0.25*bandRange+EgDisp*0.5-(vbi-Vb)*0.45;
  ctx.strokeStyle='#ffd54f'; ctx.setLineDash([6,4]); ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,EF); ctx.lineTo(W,EF); ctx.stroke(); ctx.setLineDash([]);

  // tunnel window: where filled states on left align with empty states on right
  var overlap=Math.max(0, EF-(EvTop+0.25*bandRange-3*(vbi-Vb)));
  if(Vb>0 && Vb<vbi*0.5 && overlap>0){
    ctx.fillStyle='rgba(0,240,255,0.15)'; ctx.fillRect(leftEdge,EF-15,rightEdge-leftEdge,30);
    ctx.strokeStyle='rgba(0,240,255,0.35)'; ctx.setLineDash([3,3]); ctx.strokeRect(leftEdge,EF-15,rightEdge-leftEdge,30); ctx.setLineDash([]);
    ctx.fillStyle='#00f0ff'; ctx.font='bold 11px sans-serif'; ctx.fillText('TUNNEL WINDOW',W/2-45,H/2-20);
    // tunnel electrons
    var nTun=Math.floor(overlap*3);
    for(var ti=0;ti<nTun;ti++){
      var tx=leftEdge+Math.random()*(rightEdge-leftEdge);
      var ty=EF+(Math.random()-0.5)*18;
      ctx.beginPath(); ctx.arc(tx,ty,2.5,0,Math.PI*2); ctx.fillStyle='#00f0ff'; ctx.fill();
      ctx.beginPath(); ctx.arc(tx,ty,5,0,Math.PI*2); ctx.fillStyle='rgba(0,240,255,0.18)'; ctx.fill();
    }
  }

  // particles: electrons near conduction band (top), holes near valence band (bottom)
  if(state.elec.length===0) state.elec=initParticles(100,'e');
  if(state.holes.length===0) state.holes=initParticles(80,'h');
  state.elec.forEach(function(p){
    var b=bandCurve(p.x); var inDep=p.x>=leftEdge/W && p.x<=rightEdge/W;
    p.x+=p.vx+(Math.random()-0.5)*0.005; if(Vb>0 && Vb<vbi*0.5 && inDep) p.x-=0.003;
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    var px=p.x*W, py=b.Ec+10+(p.y-0.5)*20;
    var g=ctx.createRadialGradient(px,py,1,px,py,9); g.addColorStop(0,'rgba(0,240,255,0.40)'); g.addColorStop(1,'rgba(0,240,255,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,9,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fillStyle='#00f0ff'; ctx.fill();
  });
  state.holes.forEach(function(p){
    var b=bandCurve(p.x); var inDep=p.x>=leftEdge/W && p.x<=rightEdge/W;
    p.x+=p.vx+(Math.random()-0.5)*0.005; if(Vb>0 && Vb<vbi*0.5 && inDep) p.x+=0.003;
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    var px=p.x*W, py=b.Ev-10+(p.y-0.5)*20;
    var g=ctx.createRadialGradient(px,py,1,px,py,11); g.addColorStop(0,'rgba(255,78,205,0.30)'); g.addColorStop(1,'rgba(255,78,205,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,11,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.strokeStyle='#ff4ecd'; ctx.lineWidth=1.8; ctx.stroke();
  });

  ctx.font='bold 12px sans-serif';
  if(Vb>0 && Vb<vbi*0.35){ ctx.fillStyle='rgba(0,240,255,0.9)'; ctx.fillText('PEAK: Esaki tunnel current  ->',W/2-70,22); }
  else if(Vb>=vbi*0.35 && Vb<vbi*0.7){ ctx.fillStyle='rgba(255,78,205,0.9)'; ctx.fillText('VALLEY: thermal injection takes over',W/2-100,22); }
  else if(Vb>=vbi*0.7){ ctx.fillStyle='rgba(74,222,128,0.9)'; ctx.fillText('NORMAL forward diffusion',W/2-75,22); }
  else{ ctx.fillStyle='rgba(128,128,160,0.7)'; ctx.fillText('Equilibrium / overlap',W/2-60,22); }

  jdContacts(ctx,W,H,Vb);
  jdContactLabels(ctx,W,H,Vb);
  jdLegend(ctx,W,[
    {fill:'#00f0ff',label:'electron'},
    {fill:'#ff4ecd',stroke:'#ff4ecd',label:'hole'},
    {fill:'#ffd54f',label:'E_F'},
    {fill:'rgba(0,240,255,0.2)',label:'tunnel window'}
  ]);
  jdReadoutFooter(ctx,W,H,['V_bi='+vbi.toFixed(3)+' V','I_tun='+MAT.I0*(Math.exp(Vb/(1.0*kB_eV*T))-1).toExponential(2)+' A']);
  jdAxisLabels(ctx,W,H,{x:'x (nm)',y:'Energy (eV)'});
}

/* --- n-MOSFET cross-section --- */
function drawNMOS(ctx,W,H,state){
  var Vg=state.Vgate, Vd=state.Vbias, Vth=0.4;
  var subH=H*0.50, gateY=42, oxideH=22, bodyTop=gateY+oxideH, metalH=14;
  var srcX=W*0.16, drainX=W*0.84, gateL=drainX-srcX;

  jdGrid(ctx,W,H);

  // substrate p-type (background bulk)
  var bulkGrad=ctx.createLinearGradient(0,subH,0,H); bulkGrad.addColorStop(0,'rgba(74,222,128,0.09)'); bulkGrad.addColorStop(1,'rgba(74,222,128,0.03)');
  ctx.fillStyle=bulkGrad; ctx.fillRect(0,subH,W,H-subH);
  ctx.fillStyle='rgba(74,222,128,0.25)'; ctx.fillRect(0,subH,W,2);
  ctx.fillStyle='rgba(74,222,128,0.95)'; ctx.font='bold 11px sans-serif'; ctx.fillText('p-type substrate',10,H-32);

  // field oxide / isolation
  ctx.fillStyle='rgba(180,180,200,0.08)'; ctx.fillRect(0,subH,srcX,10); ctx.fillRect(drainX,subH,W-drainX,10);

  // source n+ region + metal contact
  var srcW=srcX+12;
  ctx.fillStyle='rgba(0,240,255,0.22)'; ctx.fillRect(0,subH-34,srcW,34);
  ctx.strokeStyle='rgba(0,240,255,0.55)'; ctx.lineWidth=1.5; ctx.strokeRect(0,subH-34,srcW,34);
  var mg=ctx.createLinearGradient(0,subH-34-metalH,0,subH-34); mg.addColorStop(0,'rgba(200,200,220,0.55)'); mg.addColorStop(1,'rgba(200,200,220,0.15)');
  ctx.fillStyle=mg; ctx.fillRect(0,subH-34-metalH,srcW,metalH); ctx.strokeStyle='rgba(220,220,235,0.35)'; ctx.strokeRect(0,subH-34-metalH,srcW,metalH);
  ctx.fillStyle='#00f0ff'; ctx.font='bold 10px sans-serif'; ctx.fillText('n+ Source',10,subH-34-metalH-4);
  ctx.fillStyle='rgba(200,200,220,0.8)'; ctx.font='9px sans-serif'; ctx.fillText('S',srcW/2,subH-34-metalH+10);

  // drain n+ region + metal contact
  var drainW=W-drainX+12;
  ctx.fillStyle='rgba(0,240,255,0.22)'; ctx.fillRect(drainX-12,subH-34,drainW,34);
  ctx.strokeStyle='rgba(0,240,255,0.55)'; ctx.lineWidth=1.5; ctx.strokeRect(drainX-12,subH-34,drainW,34);
  var dmg=ctx.createLinearGradient(0,subH-34-metalH,0,subH-34); dmg.addColorStop(0,'rgba(200,200,220,0.55)'); dmg.addColorStop(1,'rgba(200,200,220,0.15)');
  ctx.fillStyle=dmg; ctx.fillRect(drainX-12,subH-34-metalH,drainW,metalH); ctx.strokeStyle='rgba(220,220,235,0.35)'; ctx.strokeRect(drainX-12,subH-34-metalH,drainW,metalH);
  ctx.fillStyle='#00f0ff'; ctx.font='bold 10px sans-serif'; ctx.fillText('n+ Drain',drainX-6,subH-34-metalH-4);
  ctx.fillStyle='rgba(200,200,220,0.8)'; ctx.font='9px sans-serif'; ctx.fillText('D',drainX-6+drainW/2,subH-34-metalH+10);

  // gate oxide (insulator between gate metal and substrate)
  ctx.fillStyle='rgba(220,220,235,0.10)'; ctx.fillRect(srcX,bodyTop,drainX-srcX,subH-bodyTop);
  ctx.strokeStyle='rgba(220,220,235,0.35)'; ctx.lineWidth=1; ctx.strokeRect(srcX,bodyTop,drainX-srcX,subH-bodyTop);
  ctx.fillStyle='rgba(220,220,235,0.7)'; ctx.font='10px sans-serif'; ctx.fillText('SiO₂',srcX+4,bodyTop+14);

  // gate metal (thicker, centered over channel)
  var gateH=22;
  var gg=ctx.createLinearGradient(0,gateY,0,gateY+gateH); gg.addColorStop(0,'rgba(255,213,79,0.55)'); gg.addColorStop(1,'rgba(255,213,79,0.20)');
  ctx.fillStyle=gg; ctx.fillRect(srcX-10,gateY,drainX-srcX+20,gateH);
  ctx.strokeStyle='#ffd54f'; ctx.lineWidth=2; ctx.strokeRect(srcX-10,gateY,drainX-srcX+20,gateH);
  ctx.fillStyle='#ffd54f'; ctx.font='bold 11px sans-serif'; ctx.fillText('Gate (n-MOS)',srcX+2,gateY-6);
  ctx.fillStyle='rgba(80,60,20,0.9)'; ctx.font='9px sans-serif'; ctx.fillText('G',(srcX+drainX)/2,gateY+gateH-6);

  // — Gate electric field lines through oxide into channel —
  if(Vg !== 0){
    ctx.strokeStyle='rgba(255,213,79,0.20)'; ctx.lineWidth=1; ctx.setLineDash([3,4]);
    var nLines=5;
    for(var fl=0;fl<nLines;fl++){
      var fx=srcX+gateL*(fl+0.5)/nLines;
      ctx.beginPath(); ctx.moveTo(fx,gateY);
      if(Vg>0){
        // downward arrows: field points into channel
        ctx.lineTo(fx,bodyTop); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx-3,bodyTop-4); ctx.lineTo(fx,bodyTop); ctx.lineTo(fx+3,bodyTop-4); ctx.stroke();
      }else{
        ctx.lineTo(fx,bodyTop+10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx-3,bodyTop+14); ctx.lineTo(fx,bodyTop+10); ctx.lineTo(fx+3,bodyTop+14); ctx.stroke();
      }
    }
    ctx.setLineDash([]);
  }

  // body contact (substrate ground reference)
  ctx.fillStyle='rgba(74,222,128,0.35)'; ctx.fillRect(W-34,H-26,30,22); ctx.strokeStyle='rgba(74,222,128,0.5)'; ctx.strokeRect(W-34,H-26,30,22);
  ctx.fillStyle='rgba(74,222,128,0.9)'; ctx.font='9px sans-serif'; ctx.fillText('B',W-22,H-12);

  // — Inversion channel with charge gradient (source→drain) —
  var Vov=Math.max(0, Vg-Vth);
  var invDepth=Vov*1.7;
  var inSat=Vd>0 && Vd>Vov;
  // channel charge density gradient: highest at source, tapers to pinch-off at drain in saturation
  var pinchX=inSat? (srcX+gateL*Vov/Vd) : drainX; // pinch-off x-position in saturation
  if(pinchX>drainX) pinchX=drainX;
  if(pinchX<srcX+4) pinchX=srcX+4;

  if(invDepth>0){
    invDepth=Math.min(invDepth,26);
    // gradient fill: cyan (high charge) at source → dim at drain/pinch-off
    var chGrad=ctx.createLinearGradient(srcX,0,drainX,0);
    chGrad.addColorStop(0,'rgba(0,240,255,0.30)');
    chGrad.addColorStop((pinchX-srcX)/gateL,'rgba(0,240,255,0.12)');
    chGrad.addColorStop(1,'rgba(0,240,255,0.03)');
    ctx.fillStyle=chGrad; ctx.fillRect(srcX,subH-invDepth,drainX-srcX,invDepth);
    ctx.strokeStyle='rgba(0,240,255,0.55)'; ctx.lineWidth=1.2; ctx.strokeRect(srcX,subH-invDepth,drainX-srcX,invDepth);
    // thinner channel taper in saturation
    if(inSat && pinchX>srcX+4 && pinchX<drainX-4){
      ctx.fillStyle='rgba(0,240,255,0.10)'; ctx.fillRect(pinchX,subH-invDepth,drainX-pinchX,invDepth);
      // pinch-off point marker
      ctx.fillStyle='rgba(255,213,79,0.85)'; ctx.font='bold 9px sans-serif'; ctx.fillText('pinch-off',pinchX-22,subH-invDepth-5);
      ctx.strokeStyle='rgba(255,213,79,0.6)'; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(pinchX,subH-invDepth-10); ctx.lineTo(pinchX,subH+12); ctx.stroke(); ctx.setLineDash([]);
    }
    // channel hatch
    ctx.strokeStyle='rgba(0,240,255,0.20)'; ctx.lineWidth=1;
    for(var hx=srcX;hx<drainX;hx+=14){
      var hxNorm=(hx-srcX)/gateL;
      var hxAlpha=1-Math.min(1, hxNorm/((pinchX-srcX)/gateL));
      ctx.globalAlpha=hxAlpha*0.5;
      ctx.beginPath(); ctx.moveTo(hx,subH); ctx.lineTo(hx+6,subH-invDepth); ctx.stroke();
    }
    ctx.globalAlpha=1;
  }

  // depletion under gate
  var Wd=Math.max(2, Math.sqrt(2*eps0*MAT.eps*Math.abs(Vg+0.8)/(q_eV*state.Na))*1e7 );
  Wd=Math.min(Wd, H-subH-20 );
  ctx.fillStyle='rgba(255,240,150,0.07)'; ctx.fillRect(srcX,subH,drainX-srcX,Wd);
  // DIBL wash: drain field penetration in saturation
  if(inSat && Vd>Vov+0.3){
    ctx.fillStyle='rgba(255,78,205,0.06)'; ctx.fillRect(drainX-40,subH-12,40,Wd+8);
    ctx.fillStyle='rgba(255,78,205,0.08)'; ctx.font='8px sans-serif'; ctx.fillText('DIBL',drainX-32,subH+4);
  }

  // source/drain junction dashed boundaries
  ctx.strokeStyle='rgba(180,180,200,0.25)'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(srcX+8,subH-34); ctx.lineTo(srcX+8,subH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(drainX-8,subH-34); ctx.lineTo(drainX-8,subH); ctx.stroke(); ctx.setLineDash([]);

  // — Electrons with drift from source → drain —
  var VovNorm=Math.min(Vov, 1.5)/1.5;
  var targetN=Math.max(20, Math.round(30+VovNorm*200));
  if(state.elec.length!==targetN){ state.elec=initParticles(targetN,'e'); state.elec.forEach(function(p){ p.y=0.85+Math.random()*0.13; }); }
  state.elec.forEach(function(p){
    // thermal motion
    p.x+=p.vx+(Math.random()-0.5)*0.004;
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    var px=p.x*W, py=42+(p.y)*(subH-60);
    var inSrc=px<srcX+10, inDrain=px>drainX-10, inChan=px>=srcX && px<=drainX && py>=subH-invDepth;
    var show=inSrc || inDrain || (inChan && invDepth>0);
    if(show){
      // drift: electrons accelerate from source toward drain in channel
      if(inChan && Vd>0 && Vov>0){
        var posNorm=(px-srcX)/gateL;
        var driftV=Math.min(3.0 * Vd * VovNorm + 0.1, 4.0);
        px+=driftV;
        if(driftV>0.5){
          ctx.strokeStyle='rgba(0,240,255,0.25)'; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(px-driftV*3,py-2); ctx.lineTo(px,py-2); ctx.stroke();
        }
        if(px>drainX-4){ px=srcX+4+Math.random()*8; py=subH-4-Math.random()*Math.max(invDepth,4); }
      }
      // fade at source entry / drain exit
      var fade=1;
      if(px<srcX+16) fade=Math.max(0.15, (px-srcX)/16);
      if(px>drainX-16) fade=Math.max(0.15, (drainX-px)/16);
      // glow + dot
      var g=ctx.createRadialGradient(px,py,1,px,py,11); g.addColorStop(0,'rgba(0,240,255,'+(0.45*fade)+')'); g.addColorStop(1,'rgba(0,240,255,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,11,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=fade; ctx.beginPath(); ctx.arc(px,py,3.5,0,Math.PI*2); ctx.fillStyle='#00f0ff'; ctx.fill(); ctx.globalAlpha=1;
    }
  });

  // — Operating region annotation + current arrow —
  ctx.font='bold 12px sans-serif';
  if(Vg<=Vth){
    ctx.fillStyle='rgba(255,85,85,0.85)'; ctx.fillText('CUTOFF  — V_G < V_th, no channel',W/2-105,22);
    // subthreshold leakage: exponential with Vg near Vth
    var subI=Math.exp(Math.min((Vg-Vth)/0.050, 0));
    var nLeak=Math.round(subI*50);
    for(var si=0;si<Math.min(nLeak,50);si++){
      var sx=srcX+Math.random()*gateL, sy=subH-2-Math.random()*5;
      var sg=ctx.createRadialGradient(sx,sy,1,sx,sy,6); sg.addColorStop(0,'rgba(0,240,255,0.12)'); sg.addColorStop(1,'rgba(0,240,255,0)');
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,6,0,Math.PI*2); ctx.fill();
    }
  }else if(Vd===0){
    ctx.fillStyle='rgba(128,128,160,0.85)'; ctx.fillText('V_DS = 0 — channel formed, no lateral field',W/2-110,22);
  }else if(Vd>0 && Vd<=Vov){
    ctx.fillStyle='rgba(74,222,128,0.95)'; ctx.fillText('→ LINEAR (triode): I_D ∝ V_DS',W/2-85,22);
    ctx.strokeStyle='rgba(74,222,128,0.75)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(W/2-40,34); ctx.lineTo(W/2+50,34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2+50,29); ctx.lineTo(W/2+50,39); ctx.lineTo(W/2+62,34); ctx.closePath(); ctx.fill();
  }else if(Vd>Vov){
    ctx.fillStyle='rgba(255,213,79,0.95)'; ctx.fillText('→ SATURATION: channel pinched off, I_D flat',W/2-105,22);
    ctx.strokeStyle='rgba(255,213,79,0.75)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(W/2-40,34); ctx.lineTo(W/2+50,34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2+50,29); ctx.lineTo(W/2+50,39); ctx.lineTo(W/2+62,34); ctx.closePath(); ctx.fill();
  }

  // terminal readout
  ctx.font='bold 10px sans-serif';
  ctx.fillStyle=Vd>0?'rgba(255,78,205,0.9)':'rgba(200,200,220,0.5)'; ctx.fillText('S='+Vd.toFixed(2)+' V',srcX-10,subH-34-metalH-18);
  ctx.fillStyle='#00f0ff'; ctx.fillText('G='+Vg.toFixed(2)+' V',srcX+4,gateY-22);
  ctx.fillStyle=Vd>0?'#00f0ff':'rgba(200,200,220,0.5)'; ctx.textAlign='right'; ctx.fillText('D=0 V',drainX+10,subH-34-metalH-18); ctx.textAlign='left';

  jdLegend(ctx,W,[
    {fill:'rgba(0,240,255,0.35)',label:'n+ source / drain'},
    {fill:'rgba(255,213,79,0.45)',label:'gate metal'},
    {fill:'rgba(220,220,235,0.35)',label:'SiO₂ oxide'},
    {fill:'rgba(74,222,128,0.25)',label:'p-substrate'}
  ]);
  var Qs=Vov>0?(1e-7*Vov).toExponential(2):'0';
  var region=Vg<=Vth?'cutoff':(Vd===0?'formed':(Vd<=Vov?'linear':'sat'));
  jdReadoutFooter(ctx,W,H,['V_G='+Vg.toFixed(2)+' V','V_DS='+Vd.toFixed(2)+' V','V_th='+Vth.toFixed(2)+' V','Q_inv~'+Qs+' C/cm²','region: '+region]);
  jdAxisLabels(ctx,W,H,{x:'x (device width)',y:'depth'});
}

/* --- p-MOSFET cross-section --- */
function drawPMOS(ctx,W,H,state){
  var Vg=state.Vgate, Vd=state.Vbias, Vth=-0.45;
  var subH=H*0.50, gateY=42, oxideH=22, bodyTop=gateY+oxideH, metalH=14;
  var srcX=W*0.16, drainX=W*0.84, gateL=drainX-srcX;

  jdGrid(ctx,W,H);

  // substrate n-type
  var bulkGrad=ctx.createLinearGradient(0,subH,0,H); bulkGrad.addColorStop(0,'rgba(0,240,255,0.09)'); bulkGrad.addColorStop(1,'rgba(0,240,255,0.03)');
  ctx.fillStyle=bulkGrad; ctx.fillRect(0,subH,W,H-subH);
  ctx.fillStyle='rgba(0,240,255,0.25)'; ctx.fillRect(0,subH,W,2);
  ctx.fillStyle='rgba(0,240,255,0.95)'; ctx.font='bold 11px sans-serif'; ctx.fillText('n-type substrate',10,H-32);

  // field oxide
  ctx.fillStyle='rgba(180,180,200,0.08)'; ctx.fillRect(0,subH,srcX,10); ctx.fillRect(drainX,subH,W-drainX,10);

  // source p+ region + metal
  var srcW=srcX+12;
  ctx.fillStyle='rgba(255,78,205,0.22)'; ctx.fillRect(0,subH-34,srcW,34);
  ctx.strokeStyle='rgba(255,78,205,0.55)'; ctx.lineWidth=1.5; ctx.strokeRect(0,subH-34,srcW,34);
  var mg=ctx.createLinearGradient(0,subH-34-metalH,0,subH-34); mg.addColorStop(0,'rgba(200,200,220,0.55)'); mg.addColorStop(1,'rgba(200,200,220,0.15)');
  ctx.fillStyle=mg; ctx.fillRect(0,subH-34-metalH,srcW,metalH); ctx.strokeStyle='rgba(220,220,235,0.35)'; ctx.strokeRect(0,subH-34-metalH,srcW,metalH);
  ctx.fillStyle='#ff4ecd'; ctx.font='bold 10px sans-serif'; ctx.fillText('p+ Source',10,subH-34-metalH-4);
  ctx.fillStyle='rgba(200,200,220,0.8)'; ctx.font='9px sans-serif'; ctx.fillText('S',srcW/2,subH-34-metalH+10);

  // drain p+ region + metal
  var drainW=W-drainX+12;
  ctx.fillStyle='rgba(255,78,205,0.22)'; ctx.fillRect(drainX-12,subH-34,drainW,34);
  ctx.strokeStyle='rgba(255,78,205,0.55)'; ctx.lineWidth=1.5; ctx.strokeRect(drainX-12,subH-34,drainW,34);
  var dmg=ctx.createLinearGradient(0,subH-34-metalH,0,subH-34); dmg.addColorStop(0,'rgba(200,200,220,0.55)'); dmg.addColorStop(1,'rgba(200,200,220,0.15)');
  ctx.fillStyle=dmg; ctx.fillRect(drainX-12,subH-34-metalH,drainW,metalH); ctx.strokeStyle='rgba(220,220,235,0.35)'; ctx.strokeRect(drainX-12,subH-34-metalH,drainW,metalH);
  ctx.fillStyle='#ff4ecd'; ctx.font='bold 10px sans-serif'; ctx.fillText('p+ Drain',drainX-6,subH-34-metalH-4);
  ctx.fillStyle='rgba(200,200,220,0.8)'; ctx.font='9px sans-serif'; ctx.fillText('D',drainX-6+drainW/2,subH-34-metalH+10);

  // oxide
  ctx.fillStyle='rgba(220,220,235,0.10)'; ctx.fillRect(srcX,bodyTop,drainX-srcX,subH-bodyTop);
  ctx.strokeStyle='rgba(220,220,235,0.35)'; ctx.lineWidth=1; ctx.strokeRect(srcX,bodyTop,drainX-srcX,subH-bodyTop);
  ctx.fillStyle='rgba(220,220,235,0.7)'; ctx.font='10px sans-serif'; ctx.fillText('SiO₂',srcX+4,bodyTop+14);

  // gate metal
  var gateH=22;
  var gg=ctx.createLinearGradient(0,gateY,0,gateY+gateH); gg.addColorStop(0,'rgba(255,213,79,0.55)'); gg.addColorStop(1,'rgba(255,213,79,0.20)');
  ctx.fillStyle=gg; ctx.fillRect(srcX-10,gateY,drainX-srcX+20,gateH);
  ctx.strokeStyle='#ffd54f'; ctx.lineWidth=2; ctx.strokeRect(srcX-10,gateY,drainX-srcX+20,gateH);
  ctx.fillStyle='#ffd54f'; ctx.font='bold 11px sans-serif'; ctx.fillText('Gate (p-MOS)',srcX+2,gateY-6);
  ctx.fillStyle='rgba(80,60,20,0.9)'; ctx.font='9px sans-serif'; ctx.fillText('G',(srcX+drainX)/2,gateY+gateH-6);

  // — Gate electric field lines through oxide into channel —
  if(Vg !== 0){
    ctx.strokeStyle='rgba(255,213,79,0.20)'; ctx.lineWidth=1; ctx.setLineDash([3,4]);
    var nLines=5;
    for(var fl=0;fl<nLines;fl++){
      var fx=srcX+gateL*(fl+0.5)/nLines;
      ctx.beginPath(); ctx.moveTo(fx,gateY);
      if(Vg<0){
        // holes accumulate: field points into channel
        ctx.lineTo(fx,bodyTop+6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx-3,bodyTop+10); ctx.lineTo(fx,bodyTop+6); ctx.lineTo(fx+3,bodyTop+10); ctx.stroke();
      }else{
        ctx.lineTo(fx,bodyTop); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx-3,bodyTop-4); ctx.lineTo(fx,bodyTop); ctx.lineTo(fx+3,bodyTop-4); ctx.stroke();
      }
    }
    ctx.setLineDash([]);
  }

  // body contact
  ctx.fillStyle='rgba(0,240,255,0.30)'; ctx.fillRect(W-34,H-26,30,22); ctx.strokeStyle='rgba(0,240,255,0.5)'; ctx.strokeRect(W-34,H-26,30,22);
  ctx.fillStyle='rgba(0,240,255,0.9)'; ctx.font='9px sans-serif'; ctx.fillText('B',W-22,H-12);

  // — Inversion channel (hole accumulation) with charge gradient —
  var Vov=Math.max(0, Math.abs(Vg-Vth));
  var invDepth=Vov*1.6;
  var Vsd=Math.abs(Vd);
  var inSat=Vd<0 && Vsd>Vov;
  var pinchX=inSat? (srcX+gateL*Vov/Vsd) : drainX;
  if(pinchX>drainX) pinchX=drainX;
  if(pinchX<srcX+4) pinchX=srcX+4;

  if(Vg<Vth && invDepth>0){
    invDepth=Math.min(invDepth,26);
    // gradient: high hole density near source, tapers to drain/pinch-off
    var chGrad=ctx.createLinearGradient(srcX,0,drainX,0);
    chGrad.addColorStop(0,'rgba(255,78,205,0.28)');
    chGrad.addColorStop((pinchX-srcX)/gateL,'rgba(255,78,205,0.10)');
    chGrad.addColorStop(1,'rgba(255,78,205,0.03)');
    ctx.fillStyle=chGrad; ctx.fillRect(srcX,subH-invDepth,drainX-srcX,invDepth);
    ctx.strokeStyle='rgba(255,78,205,0.5)'; ctx.lineWidth=1.2; ctx.strokeRect(srcX,subH-invDepth,drainX-srcX,invDepth);
    // pinch-off marker in saturation
    if(inSat && pinchX>srcX+4 && pinchX<drainX-4){
      ctx.fillStyle='rgba(255,78,205,0.08)'; ctx.fillRect(pinchX,subH-invDepth,drainX-pinchX,invDepth);
      ctx.fillStyle='rgba(255,213,79,0.85)'; ctx.font='bold 9px sans-serif'; ctx.fillText('pinch-off',pinchX-22,subH-invDepth-5);
      ctx.strokeStyle='rgba(255,213,79,0.6)'; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(pinchX,subH-invDepth-10); ctx.lineTo(pinchX,subH+12); ctx.stroke(); ctx.setLineDash([]);
    }
    // hatch with gradient
    ctx.strokeStyle='rgba(255,78,205,0.20)'; ctx.lineWidth=1;
    for(var hx=srcX;hx<drainX;hx+=14){
      var hxNorm=(hx-srcX)/gateL;
      ctx.globalAlpha=(1-Math.min(1, hxNorm/((pinchX-srcX)/gateL)))*0.4;
      ctx.beginPath(); ctx.moveTo(hx,subH); ctx.lineTo(hx+6,subH-invDepth); ctx.stroke();
    }
    ctx.globalAlpha=1;
  }

  // depletion
  var Wd=Math.max(2, Math.sqrt(2*eps0*MAT.eps*Math.abs(Vg-0.8)/(q_eV*state.Nd))*1e7 );
  Wd=Math.min(Wd, H-subH-20 );
  ctx.fillStyle='rgba(255,240,150,0.06)'; ctx.fillRect(srcX,subH,drainX-srcX,Wd);
  // DIBL wash
  if(inSat && Vsd>Vov+0.3){
    ctx.fillStyle='rgba(0,240,255,0.06)'; ctx.fillRect(drainX-40,subH-12,40,Wd+8);
    ctx.fillStyle='rgba(0,240,255,0.08)'; ctx.font='8px sans-serif'; ctx.fillText('DIBL',drainX-32,subH+4);
  }

  // junction boundaries
  ctx.strokeStyle='rgba(180,180,200,0.25)'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(srcX+8,subH-34); ctx.lineTo(srcX+8,subH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(drainX-8,subH-34); ctx.lineTo(drainX-8,subH); ctx.stroke(); ctx.setLineDash([]);

  // — Holes with drift from source → drain (opposite to nMOS due to polarity) —
  var VovNorm=Math.min(Vov, 1.5)/1.5;
  var targetN=Math.max(20, Math.round(30+VovNorm*200));
  if(state.holes.length!==targetN){ state.holes=initParticles(targetN,'h'); state.holes.forEach(function(p){ p.y=0.85+Math.random()*0.13; }); }
  state.holes.forEach(function(p){
    p.x+=p.vx+(Math.random()-0.5)*0.004;
    if(p.x<0) p.x=0.001; if(p.x>1) p.x=0.999;
    var px=p.x*W, py=42+(p.y)*(subH-60);
    var inSrc=px<srcX+10, inDrain=px>drainX-10, inChan=px>=srcX && px<=drainX && py>=subH-invDepth;
    var show=inSrc || inDrain || (inChan && invDepth>0);
    if(show){
      // holes drift from source (p+) toward drain in channel when Vd<0
      if(inChan && Vd<0 && Vov>0){
        var posNorm=(px-srcX)/gateL;
        var driftV=Math.min(3.0 * Math.abs(Vd) * VovNorm + 0.1, 4.0);
        px+=driftV;
        if(driftV>0.5){
          ctx.strokeStyle='rgba(255,78,205,0.20)'; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(px-driftV*3,py-2); ctx.lineTo(px,py-2); ctx.stroke();
        }
        if(px>drainX-4){ px=srcX+4+Math.random()*8; py=subH-4-Math.random()*Math.max(invDepth,4); }
      }
      // fade at source entry / drain exit
      var fade=1;
      if(px<srcX+16) fade=Math.max(0.15, (px-srcX)/16);
      if(px>drainX-16) fade=Math.max(0.15, (drainX-px)/16);
      var g=ctx.createRadialGradient(px,py,1,px,py,12); g.addColorStop(0,'rgba(255,78,205,'+(0.40*fade)+')'); g.addColorStop(1,'rgba(255,78,205,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,12,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=fade; ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.strokeStyle='#ff4ecd'; ctx.lineWidth=1.8; ctx.stroke(); ctx.globalAlpha=1;
    }
  });

  // — Operating region annotation + current arrow —
  ctx.font='bold 12px sans-serif';
  if(Vg>=Vth){
    ctx.fillStyle='rgba(255,85,85,0.85)'; ctx.fillText('CUTOFF  — V_G > V_th, no hole channel',W/2-105,22);
    var subI=Math.exp(Math.min((Vth-Vg)/0.050, 0));
    var nLeak=Math.round(subI*50);
    for(var si=0;si<Math.min(nLeak,50);si++){
      var sx=srcX+Math.random()*gateL, sy=subH-3-Math.random()*5;
      var sg=ctx.createRadialGradient(sx,sy,1,sx,sy,6); sg.addColorStop(0,'rgba(255,78,205,0.10)'); sg.addColorStop(1,'rgba(255,78,205,0)');
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,6,0,Math.PI*2); ctx.fill();
    }
  }else if(Vd>=0 || Vd===0){
    ctx.fillStyle='rgba(128,128,160,0.85)'; ctx.fillText('V_SD = 0 — channel formed, no lateral field',W/2-110,22);
  }else if(Vd<0 && Vsd<=Vov){
    ctx.fillStyle='rgba(74,222,128,0.95)'; ctx.fillText('→ LINEAR (triode): I_D ∝ V_SD',W/2-85,22);
    // arrow pointing left (hole flow direction: D→S for conventional)
    ctx.strokeStyle='rgba(74,222,128,0.75)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(W/2+40,34); ctx.lineTo(W/2-40,34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2-40,29); ctx.lineTo(W/2-40,39); ctx.lineTo(W/2-52,34); ctx.closePath(); ctx.fill();
  }else if(Vd<0 && Vsd>Vov){
    ctx.fillStyle='rgba(255,213,79,0.95)'; ctx.fillText('→ SATURATION: channel pinched off, I_D flat',W/2-105,22);
    ctx.strokeStyle='rgba(255,213,79,0.75)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(W/2+40,34); ctx.lineTo(W/2-40,34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2-40,29); ctx.lineTo(W/2-40,39); ctx.lineTo(W/2-52,34); ctx.closePath(); ctx.fill();
  }

  // terminal readout
  ctx.font='bold 10px sans-serif';
  ctx.fillStyle=Vd<0?'rgba(0,240,255,0.9)':'rgba(200,200,220,0.5)'; ctx.fillText('S='+(-Vd).toFixed(2)+' V',srcX-10,subH-34-metalH-18);
  ctx.fillStyle='#ff4ecd'; ctx.fillText('G='+Vg.toFixed(2)+' V',srcX+4,gateY-22);
  ctx.fillStyle=Vd<0?'#ff4ecd':'rgba(200,200,220,0.5)'; ctx.textAlign='right'; ctx.fillText('D=0 V',drainX+10,subH-34-metalH-18); ctx.textAlign='left';

  jdLegend(ctx,W,[
    {fill:'rgba(255,78,205,0.35)',label:'p+ source / drain'},
    {fill:'rgba(255,213,79,0.45)',label:'gate metal'},
    {fill:'rgba(220,220,235,0.35)',label:'SiO₂ oxide'},
    {fill:'rgba(0,240,255,0.20)',label:'n-substrate'}
  ]);
  var Qs=Vov>0?(1e-7*Vov).toExponential(2):'0';
  var region=(Vg>=Vth)?'cutoff':(Vd>=0?'formed':(Vsd<=Vov?'linear':'sat'));
  jdReadoutFooter(ctx,W,H,['V_G='+Vg.toFixed(2)+' V','V_DS='+Vd.toFixed(2)+' V','V_th='+Vth.toFixed(2)+' V','Q_inv~'+Qs+' C/cm²','region: '+region]);
  jdAxisLabels(ctx,W,H,{x:'x (device width)',y:'depth'});
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
  (function loop(){
    // Pause animation when Playground section is hidden
    var pg = document.getElementById('section-play');
    if (!pg || pg.style.display === 'none') {
      jdCanvasAnim = requestAnimationFrame(loop);
      return;
    }
    renderJDCanvas();
    jdCanvasAnim=requestAnimationFrame(loop);
  })();
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
  ],jdLayout(null,'Voltage (V)','Current I (A)',{
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
        else if(vd<Vg-Vth){ Id.push(mu*Cox*(Wch/Lch)*((Vg-Vth)*vd - vd*vd/2)); }
        else { Id.push(mu*Cox*(Wch/Lch)*Math.pow(Vg-Vth,2)/2); }
      }else{
        if(Vg>=Vth){ Id.push(0); }
        else if(vd>Math.abs(Vg-Vth)){ Id.push(mu*Cox*(Wch/Lch)*((Math.abs(Vg-Vth))*Math.abs(vd) - vd*vd/2)); }
        else { Id.push(mu*Cox*(Wch/Lch)*Math.pow(Vg-Vth,2)/2); }
      }
    }
    var colors=['#ff4ecd','#00f0ff','#4ade80','#ffd54f'];
    return {x:Vd,y:Id,mode:'lines',name:'Vg='+Vg.toFixed(2)+'V',line:{color:colors[col],width:2}};
  });
  var yt=(JD.device==='pmos')?'I_DS (p-MOS)':'I_DS (n-MOS)';
  _plot(cid,traces,jdLayout(null,'V_DS (V)',yt+' (A)',{
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
      else Id.push(mu*Cox*(Wch/Lch)*Math.pow(vg-Vth,2)/2);
    }else{
      if(vg>=Vth) Id.push(0);
      else Id.push(mu*Cox*(Wch/Lch)*Math.pow(vg-Vth,2)/2);
    }
  }
  _plot(cid,[
    {x:Vg,y:Id,mode:'lines',name:'Transfer',line:{color:'#ffd54f',width:2.5},fill:'tozeroy',fillcolor:'rgba(255,213,79,0.06)'}
  ],jdLayout(null,'V_GS (V)','I_DS (A)',{shapes:[{type:'line',x0:Vth,x1:Vth,y0:0,y1:Math.max.apply(null,Id),line:{color:'#ff4ecd',width:1,dash:'dot'}}]}),{responsive:true,displayModeBar:false});
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
    {x:x,y:Ec,mode:'lines',name:'E_C',line:{color:'#ff4ecd',width:2}},
    {x:x,y:Ev,mode:'lines',name:'E_V',line:{color:'#4ade80',width:2}}
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
  // refresh visible sub-tab only (hidden ones get regenerated on switch via jdReplotVisible)
  if(typeof window.jdReplotVisible==='function'){
    jdReplotVisible(dev, 'iv');
  } else {
    if(dev==='pn'){ plotDiodeIV(); }
    if(dev==='zener'){ plotZenerIV(); }
    if(dev==='tunnel'){ plotTunnelIV(); }
    if(dev==='nmos'||dev==='pmos'){ plotMOSFETIV(); plotTransfer(); }
    plotDepletion();
  }
  updateLiveJD();
}

function jdRefreshAll(){
  // Only refresh the visible sub-tab (hidden ones get regenerated on switch via jdReplotVisible)
  if(typeof window.jdReplotVisible==='function'){
    // Determine which sub-tab is visible
    var panel=document.getElementById('panel-'+JD.device);
    var suffix='iv';
    if(panel){
      var vis=panel.querySelector('.jd-sub-section[style*="display: block"], .jd-sub-section[style*="display:block"]');
      if(vis){
        if(vis.id.indexOf('iv')>=0) suffix='iv';
        else if(vis.id.indexOf('trans')>=0) suffix='trans';
        else if(vis.id.indexOf('dep')>=0) suffix='dep';
      }
    }
    jdReplotVisible(JD.device, suffix);
  } else {
    switch(JD.device){
      case 'pn': plotDiodeIV(); break;
      case 'zener': plotZenerIV(); break;
      case 'tunnel': plotTunnelIV(); break;
      case 'nmos': case 'pmos': plotMOSFETIV(); plotTransfer(); break;
    }
    plotDepletion();
  }
  updateLiveJD();
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
var __JD_ready = false;
function initJunction(){
  if (__JD_ready) return;
  __JD_ready = true;
  var sNa=document.getElementById('slider-Na'); var sNd=document.getElementById('slider-Nd');
  var sT=document.getElementById('slider-T-jd'); var sV=document.getElementById('slider-Vbias');
  var sIph=document.getElementById('slider-Isc'); var sVg=document.getElementById('slider-Vgate');

  function _on(){ jdRefreshAll(); }

  if(sNa) sNa.addEventListener('input',function(){ JD.Na=Math.pow(10,parseFloat(this.value)); var el=document.getElementById('val-Na'); if(el) el.textContent=JD.Na.toExponential(1); _on(); });
  if(sNd) sNd.addEventListener('input',function(){ JD.Nd=Math.pow(10,parseFloat(this.value)); var el=document.getElementById('val-Nd'); if(el) el.textContent=JD.Nd.toExponential(1); _on(); });
  if(sT)  sT.addEventListener('input',function(){ JD.T=parseFloat(this.value); var el=document.getElementById('val-T-jd'); if(el) el.textContent=JD.T; _on(); });
  if(sV)  sV.addEventListener('input',function(){ JD.Vbias=parseFloat(this.value); var el=document.getElementById('val-Vbias'); if(el) el.textContent=JD.Vbias.toFixed(2); _on(); });
  if(sIph) sIph.addEventListener('input',function(){ JD.photons=parseFloat(this.value); var el=document.getElementById('val-Isc'); if(el) el.textContent=JD.photons.toExponential(1); _on(); });
  if(sVg) sVg.addEventListener('input',function(){ JD.Vgate=parseFloat(this.value); var el=document.getElementById('val-Vgate'); if(el) el.textContent=JD.Vgate.toFixed(2); _on(); });

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
window.initJunction=initJunction;
window.setJDDevice=setJDDevice;
window.jdRefreshAll=jdRefreshAll;

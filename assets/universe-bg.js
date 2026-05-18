/**
 * universe-bg.js
 * Reusable animated universe / solar system background.
 * Renders a starfield, nebulae, the Sun, orbiting planets (perspective),
 * asteroid belt, shooting stars, and distant smaller star systems.
 *
 * Usage:
 *   <canvas id="universe-canvas"></canvas>
 *   <script src="assets/universe-bg.js"></script>
 *   <script>UniverseBG.init();</script>
 *
 * Or with custom options:
 *   UniverseBG.init({ planetScale: 1.6, distantSystemCount: 5 });
 */
(function(window, document) {
  'use strict';

  const DEFAULTS = {
    canvasId: 'universe-canvas',
    starDensity: null,       // auto-calculated from viewport
    nebulaCount: null,       // auto
    planetScale: 1.6,        // BIGGER solar system (scale of orbits + planets)
    showOrbits: true,
    showAsteroids: true,
    showShootingStars: true,
    showDistantSystems: true,
    distantSystemCount: 5,
    fps: 60
  };

  const S = Object.assign({}, DEFAULTS);
  let canvas, ctx, W, H, CX, CY, frame = 0, rafId;
  const stars = [], shootingStars = [], nebulae = [];
  let planets = [];
  const orbits = [];
  const asteroids = [];
  const distantSystems = [];

  /* ═════════════════════════ Utils ═════════════════════════ */
  function rminmax(a, b) { return Math.random() * (b - a) + a; }
  function rint(a, b) { return Math.floor(rminmax(a, b + 1)); }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    CX = W / 2;
    CY = H / 2;
  }

  /* ═════════════════════════ Stars ═════════════════════════ */
  function pickStarColor() {
    const roll = Math.random();
    if (roll < 0.7)  return [220,230,255];
    if (roll < 0.85) return [255,240,200];
    if (roll < 0.95) return [180,200,255];
    return [255,200,200];
  }

  function initStars() {
    stars.length = 0;
    const density = S.starDensity || Math.min((W * H) / 3000, 2500);
    for (let i = 0; i < density; i++) {
      const layer = Math.random();
      stars.push({
        x: rminmax(0, W),
        y: rminmax(0, H),
        r: layer < 0.02 ? rminmax(0.6, 1.8) : rminmax(0.2, 1.0),
        alpha: rminmax(0.2, 1.0),
        twinkleSpeed: rminmax(0.005, 0.03),
        twinkleOffset: rminmax(0, Math.PI * 2),
        color: pickStarColor()
      });
    }
  }

  /* ═════════════════════════ Nebulae ═════════════════════════ */
  function pickNebulaColor() {
    const palettes = [[80,40,140],[40,100,180],[180,60,100],[60,160,120]];
    return palettes[rint(0, palettes.length - 1)];
  }

  function initNebulae() {
    nebulae.length = 0;
    const count = S.nebulaCount || Math.floor(W / 500) + 2;
    for (let i = 0; i < count; i++) {
      nebulae.push({
        x: rminmax(0, W),
        y: rminmax(0, H),
        r: rminmax(150, 400),
        color: pickNebulaColor(),
        alpha: rminmax(0.03, 0.08),
        driftX: rminmax(-0.1, 0.1),
        driftY: rminmax(-0.05, 0.05)
      });
    }
  }

  /* ═════════════════════════ Solar system data ═════════════════════════ */
  const PL_D = [
    { n:'Mercury', c:'#b5b5b5', r:2.5, dist:0.18, spd:2.1, glow:'#888' },
    { n:'Venus',   c:'#e8cda8', r:4.0, dist:0.26, spd:1.5, glow:'#cba87a' },
    { n:'Earth',   c:'#4fa4f4', r:4.2, dist:0.36, spd:1.0, glow:'#2d8ad4', ring:'#4fa4f455' },
    { n:'Mars',    c:'#e07050', r:3.0, dist:0.48, spd:0.8, glow:'#c05040' },
    { n:'Jupiter', c:'#d4b896', r:10,  dist:0.68, spd:0.4, glow:'#b89a70', bands:true },
    { n:'Saturn',  c:'#e0d0a0', r:8.5, dist:0.88, spd:0.3, glow:'#c8b888', rings:true },
    { n:'Uranus',  c:'#a0e0e8', r:5.5, dist:1.05, spd:0.2, glow:'#80c8d8' },
    { n:'Neptune', c:'#5060e0', r:5.2, dist:1.20, spd:0.15, glow:'#4050c8' }
  ];

  let baseOrbitR;
  function initPlanets() {
    const sc = S.planetScale;
    baseOrbitR = Math.min(W, H) * 0.18 * sc;
    planets = PL_D.map(pd => ({
      ...pd,
      r: pd.r * sc,                 // scale up planet sizes too
      angle: rminmax(0, Math.PI * 2),
      orbitR: baseOrbitR * pd.dist,
      trail: []
    }));
  }

  function initOrbits() {
    orbits.length = 0;
    PL_D.forEach(pd => { orbits.push({ r: baseOrbitR * pd.dist, alpha: 0.07 }); });
    const inner = baseOrbitR * 0.52;
    const outer = baseOrbitR * 0.64;
    for (let d = inner; d <= outer; d += 12) {
      orbits.push({ r: d, alpha: 0.02 });
    }
  }

  function initAsteroids() {
    asteroids.length = 0;
    if (!S.showAsteroids) return;
    const count = Math.floor(baseOrbitR * 0.3);
    const inner = baseOrbitR * 0.52;
    const outer = baseOrbitR * 0.64;
    for (let i = 0; i < count; i++) {
      const dist = rminmax(inner, outer);
      asteroids.push({
        dist, angle: rminmax(0, Math.PI * 2),
        size: rminmax(0.3, 1.2),
        spd: 0.8 / Math.sqrt(dist / baseOrbitR) * rminmax(0.8, 1.2),
        alpha: rminmax(0.3, 0.7)
      });
    }
  }

  /* ═════════════════════════ Distant star systems (smaller) ═════════════════════════ */
  function pickDistantStarColor() {
    const roll = Math.random();
    if (roll < 0.50) return [220, 100, 80];   // red dwarf
    if (roll < 0.80) return [220, 220, 255];  // white
    if (roll < 0.95) return [180, 200, 255]; // pale blue
    return [255, 220, 150];                   // warm yellow
  }

  function initDistantSystems() {
    distantSystems.length = 0;
    if (!S.showDistantSystems) return;
    const count = S.distantSystemCount || 5;
    const minD = baseOrbitR * 1.1;
    const maxD = Math.max(W, H) * 0.45;

    for (let i = 0; i < count; i++) {
      const sc = rminmax(0.12, 0.32);
      const a = rminmax(0, Math.PI * 2);
      const d = rminmax(minD, maxD);
      const sys = {
        cx: CX + Math.cos(a) * d,
        cy: CY + Math.sin(a) * d * 0.5, // vertical compression
        scale: sc,
        starR: baseOrbitR * sc * 0.07,
        starColor: pickDistantStarColor(),
        planets: []
      };
      // Bounds check
      if (sys.cx < -50) sys.cx = 50; if (sys.cx > W + 50) sys.cx = W - 50;
      if (sys.cy < -30) sys.cy = 30; if (sys.cy > H + 30) sys.cy = H - 30;

      const pCount = rint(2, 4);
      const colors = ['#b5b5b5','#e8cda8','#4fa4f4','#e07050','#d4b896','#a0e0e8'];
      for (let p = 0; p < pCount; p++) {
        sys.planets.push({
          angle: rminmax(0, Math.PI * 2),
          dist: baseOrbitR * sc * (0.22 + p * 0.22),
          r: Math.max(0.6, 2.2 * sc),
          spd: rminmax(0.2, 0.7) / (p + 1),
          color: colors[p % colors.length]
        });
      }
      distantSystems.push(sys);
    }
  }

  /* ═════════════════════════ Drawing helpers ═════════════════════════ */
  function shadeColor(hex, pct) {
    let R = Number.parseInt(hex.substring(1,3),16);
    let G = Number.parseInt(hex.substring(3,5),16);
    let B = Number.parseInt(hex.substring(5,7),16);
    R = Math.min(255, Math.floor(R * (100 + pct) / 100));
    G = Math.min(255, Math.floor(G * (100 + pct) / 100));
    B = Math.min(255, Math.floor(B * (100 + pct) / 100));
    return `rgb(${R},${G},${B})`;
  }

  function drawNebulae() {
    nebulae.forEach(n => {
      n.x += n.driftX; n.y += n.driftY;
      if (n.x < -n.r) n.x = W + n.r;
      if (n.x > W + n.r) n.x = -n.r;
      if (n.y < -n.r) n.y = H + n.r;
      if (n.y > H + n.r) n.y = -n.r;
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      const [cr,cg,cb] = n.color;
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${n.alpha})`);
      grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${n.alpha*0.4})`);
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2); ctx.fill();
    });
  }

  function drawStars() {
    ctx.save();
    stars.forEach(s => {
      const tw = 0.5 + 0.5 * Math.sin(frame * s.twinkleSpeed + s.twinkleOffset);
      const a = s.alpha * tw;
      if (a < 0.05) return;
      ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${a})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
      if (s.r > 1.2) {
        ctx.shadowColor = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},0.4)`;
        ctx.shadowBlur = s.r * 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    ctx.restore();
  }

  function drawSun() {
    const sunR = baseOrbitR * 0.06;
    // Corona
    const corona = ctx.createRadialGradient(CX, CY, sunR*0.4, CX, CY, sunR*4);
    corona.addColorStop(0, 'rgba(255,220,120,0.25)');
    corona.addColorStop(0.2, 'rgba(255,180,60,0.1)');
    corona.addColorStop(1, 'rgba(255,100,20,0)');
    ctx.fillStyle = corona;
    ctx.beginPath(); ctx.arc(CX, CY, sunR*4, 0, Math.PI*2); ctx.fill();
    // Body
    const sg = ctx.createRadialGradient(CX-sunR*0.3, CY-sunR*0.3, sunR*0.1, CX, CY, sunR);
    sg.addColorStop(0, '#fff8e0'); sg.addColorStop(0.3, '#ffd060');
    sg.addColorStop(0.7, '#ff9020'); sg.addColorStop(1, '#ff5010');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(CX, CY, sunR, 0, Math.PI*2); ctx.fill();
    // Flares
    for (let i = 0; i < 8; i++) {
      const a = (frame * 0.002 + (i/8)*Math.PI*2) % (Math.PI*2);
      const fx = CX + Math.cos(a) * sunR * rminmax(0.7, 1.3);
      const fy = CY + Math.sin(a) * sunR * rminmax(0.7, 1.3);
      ctx.fillStyle = `rgba(255,180,40,${0.15 + 0.1*Math.sin(frame*0.01+i)})`;
      ctx.beginPath(); ctx.arc(fx, fy, rminmax(1.5, 4), 0, Math.PI*2); ctx.fill();
    }
  }

  function drawOrbits() {
    if (!S.showOrbits) return;
    orbits.forEach(o => {
      ctx.strokeStyle = `rgba(255,255,255,${o.alpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.ellipse(CX, CY, o.r, o.r*0.35, 0, 0, Math.PI*2);
      ctx.stroke();
    });
  }

  function drawAsteroids() {
    if (!S.showAsteroids) return;
    ctx.fillStyle = 'rgba(180,170,160,0.7)';
    asteroids.forEach(a => {
      a.angle += a.spd * 0.003;
      const ax = CX + Math.cos(a.angle) * a.dist;
      const ay = CY + Math.sin(a.angle) * a.dist * 0.35;
      ctx.globalAlpha = a.alpha;
      ctx.beginPath(); ctx.arc(ax, ay, a.size, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawPlanet(p) {
    const x = CX + Math.cos(p.angle) * p.orbitR;
    const y = CY + Math.sin(p.angle) * p.orbitR * 0.35;
    // Trail
    p.trail.push({ x, y });
    if (p.trail.length > 30) p.trail.shift();
    if (p.trail.length > 2) {
      ctx.beginPath(); ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
      ctx.strokeStyle = `${p.c}22`;
      ctx.lineWidth = p.r * 0.3;
      ctx.stroke();
    }
    // Body
    const grad = ctx.createRadialGradient(x-p.r*0.3, y-p.r*0.3, p.r*0.1, x, y, p.r);
    grad.addColorStop(0, p.c);
    grad.addColorStop(0.65, p.c);
    grad.addColorStop(1, shadeColor(p.c, -40));
    ctx.shadowColor = p.glow;
    ctx.shadowBlur = p.r * 2.5;
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    // Earth ring
    if (p.ring) {
      ctx.strokeStyle = p.ring; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, p.r+2, 0, Math.PI*2); ctx.stroke();
    }
    // Jupiter bands
    if (p.bands) {
      ctx.strokeStyle = 'rgba(160,130,90,0.3)'; ctx.lineWidth = 1;
      for (let off = -p.r*0.5; off <= p.r*0.5; off += p.r*0.25) {
        ctx.beginPath(); ctx.ellipse(x, y+off, p.r*0.9, p.r*0.15, 0, 0, Math.PI*2); ctx.stroke();
      }
    }
    // Saturn rings
    if (p.rings) {
      const rx = p.r * 2.8, ry = p.r * 0.5, tilt = 0.3;
      ctx.strokeStyle = 'rgba(200,190,150,0.25)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, tilt, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = 'rgba(200,190,150,0.15)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(x, y, rx*1.15, ry*1.1, tilt, 0, Math.PI*2); ctx.stroke();
    }
  }

  function drawDistantSystems() {
    if (!S.showDistantSystems) return;
    distantSystems.forEach(sys => {
      // Star glow
      const sg = ctx.createRadialGradient(sys.cx, sys.cy, 0, sys.cx, sys.cy, sys.starR * 3);
      const [sr,sgb,sb] = sys.starColor;
      sg.addColorStop(0, `rgba(${sr},${sgb},${sb},0.35)`);
      sg.addColorStop(0.5, `rgba(${sr},${sgb},${sb},0.1)`);
      sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sys.cx, sys.cy, sys.starR * 3, 0, Math.PI*2); ctx.fill();

      // Star body
      ctx.fillStyle = `rgba(${sr},${sgb},${sb},0.9)`;
      ctx.beginPath(); ctx.arc(sys.cx, sys.cy, Math.max(0.5, sys.starR), 0, Math.PI*2); ctx.fill();

      // Planets + orbits
      ctx.lineWidth = 0.4;
      sys.planets.forEach(p => {
        // faint orbit
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.ellipse(sys.cx, sys.cy, p.dist, p.dist * 0.35, 0, 0, Math.PI*2);
        ctx.stroke();

        p.angle += p.spd * 0.0015;
        const px = sys.cx + Math.cos(p.angle) * p.dist;
        const py = sys.cy + Math.sin(p.angle) * p.dist * 0.35;
        ctx.fillStyle = `${p.color}aa`;
        ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI*2); ctx.fill();
      });
    });
  }

  function spawnShootingStar() {
    if (!S.showShootingStars) return;
    if (Math.random() < 0.003) {
      const ang = rminmax(0.2, 0.8);
      shootingStars.push({
        x: rminmax(0, W), y: rminmax(0, H*0.3),
        vx: Math.cos(ang) * rminmax(8, 16),
        vy: Math.sin(ang) * rminmax(8, 16),
        len: rminmax(30, 80),
        alpha: 1, decay: rminmax(0.015, 0.03)
      });
    }
  }

  function drawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += s.vx; s.y += s.vy; s.alpha -= s.decay;
      if (s.alpha <= 0 || s.x > W || s.y > H) {
        shootingStars.splice(i, 1); continue;
      }
      ctx.strokeStyle = `rgba(220,235,255,${s.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(180,210,255,0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx*(s.len/12), s.y - s.vy*(s.len/12));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  /* ═════════════════════════ Main loop ═════════════════════════ */
  function animate() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    // Deep background
    const bg = ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0, '#02040a');
    bg.addColorStop(0.5, '#050a14');
    bg.addColorStop(1, '#02040a');
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    drawNebulae();
    drawStars();
    spawnShootingStar();
    drawShootingStars();
    drawDistantSystems();   // << smaller star systems behind main one
    drawSun();
    drawOrbits();
    drawAsteroids();
    planets.forEach(p => { p.angle += p.spd * 0.003; drawPlanet(p); });

    rafId = requestAnimationFrame(animate);
  }

  /* ═════════════════════════ Public API ═════════════════════════ */
  window.UniverseBG = {
    init: function(options) {
      Object.assign(S, options || {});
      const id = S.canvasId || 'universe-canvas';
      canvas = document.getElementById(id);
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-3;pointer-events:none;';
        document.body.insertBefore(canvas, document.body.firstChild);
      }
      ctx = canvas.getContext('2d');

      resize();
      window.addEventListener('resize', () => {
        resize(); initStars(); initNebulae(); initPlanets(); initOrbits(); initAsteroids(); initDistantSystems();
      });

      initStars();
      initNebulae();
      initPlanets();
      initOrbits();
      initAsteroids();
      initDistantSystems();

      if (rafId) cancelAnimationFrame(rafId);
      animate();
      return this;
    },

    stop: function() { if (rafId) cancelAnimationFrame(rafId); rafId = null; },
    destroy: function() { this.stop(); if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    getCanvas: function() { return canvas; },

    // Dynamic overrides
    setPlanetScale: function(v) { S.planetScale = v; initPlanets(); initOrbits(); initAsteroids(); initDistantSystems(); },
    setDistantCount: function(v) { S.distantSystemCount = v; initDistantSystems(); }
  };
})(window, document);

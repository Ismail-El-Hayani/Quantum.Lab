/**
 * Wave Packet Canvas Embed — reusable TDSE engine for Playground and standalone modes.
 * Split-operator FFT, multi-barrier, diverging blue-red colormap.
 * Call wpCanvasEmbed({canvas:'id', ...}) to instantiate.
 *
 * Time-dependent Schrodinger equation (units: ℏ = m = 1):
 *   i·∂ψ/∂t = −½·∂²ψ/∂x² + V(x)·ψ
 *
 * Strang split-operator stepping (second-order, unitary):
 *   ψ(t+Δt) = exp(−i·V̂·Δt/2) · F⁻¹{ exp(−i·k²·Δt/2) · F{ exp(−i·V̂·Δt/2) · ψ(t) } }
 * where F = forward FFT, F⁻¹ = inverse FFT, k_j = 2π·j/L.
 *
 * Boundary mask: Gaussian taper at edges (L×12%) suppresses wraparound
 * from periodic FFT discretization, breaking strict unitarity slightly.
 */

'use strict';

/* ============ COMPLEX FFT (Cooley-Tukey in-place, N = power of 2) ============ */
function _fftCore(re, im, invert) {
  var n = re.length;
  for (var i = 1, j = 0; i < n; i++) {
    var bit = n >> 1;
    for (; j & bit; bit >>= 1) { j ^= bit; }
    j ^= bit;
    if (i < j) {
      var tmp = re[i]; re[i] = re[j]; re[j] = tmp;
      tmp = im[i]; im[i] = im[j]; im[j] = tmp;
    }
  }
  for (var len = 2; len <= n; len <<= 1) {
    var ang = 2.0 * Math.PI / len * (invert ? -1.0 : 1.0);
    var wlen_re = Math.cos(ang);
    var wlen_im = Math.sin(ang);
    for (var i = 0; i < n; i += len) {
      var w_re = 1.0, w_im = 0.0;
      for (var j = 0; j < (len >> 1); j++) {
        var u_re = re[i + j];
        var u_im = im[i + j];
        var v_re = re[i + j + (len >> 1)] * w_re - im[i + j + (len >> 1)] * w_im;
        var v_im = re[i + j + (len >> 1)] * w_im + im[i + j + (len >> 1)] * w_re;
        re[i + j] = u_re + v_re;
        im[i + j] = u_im + v_im;
        re[i + j + (len >> 1)] = u_re - v_re;
        im[i + j + (len >> 1)] = u_im - v_im;
        var next_w_re = w_re * wlen_re - w_im * wlen_im;
        var next_w_im = w_re * wlen_im + w_im * wlen_re;
        w_re = next_w_re;
        w_im = next_w_im;
      }
    }
  }
  if (invert) {
    for (var i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }
}

/* ============ EMBED FUNCTION ============
 * opts:
 *   canvas       : string id of canvas element (required)
 *   barrierShape : 'semicircle'|'square'|'gaussian'
 *   V0, width, count, spacing, k0, sigma, dt
 *   running      : bool (auto-play on init?)
 *   stepsPerFrame: number (default 4)
 *   N            : FFT points (default 1024)
 *   L            : domain length (default 24)
 */
function wpCanvasEmbed(opts) {
  var o = opts || {};
  var canvasId = o.canvas;
  var N = o.N || 1024;
  var L = o.L || 24.0;
  var dt = o.dt || 0.001;
  var stepsPerFrame = o.stepsPerFrame || 4;
  var barrierShape = o.barrierShape || 'semicircle';
  var barrierWidth = o.width || 2.0;
  var barrierHeight = o.V0 || 5.0;
  var barrierCount = o.count || 1;
  var barrierSpacing = o.spacing || 4.0;
  var packetCenter = o.packetCenter || -6.0;
  var packetWidth = o.sigma || 1.2;
  var packetMomentum = o.k0 || 3.0;
  var running = !!o.running;

  var dx = L / N;
  var xArr = new Float64Array(N);
  var kArr = new Float64Array(N);
  var V = new Float64Array(N);
  var psiRe = new Float64Array(N);
  var psiIm = new Float64Array(N);
  var time = 0.0;

  for (var i = 0; i < N; i++) xArr[i] = -L / 2.0 + i * dx;
  var dk = 2.0 * Math.PI / L;
  for (var i = 0; i <= N / 2; i++) kArr[i] = i * dk;
  for (var i = N / 2 + 1; i < N; i++) kArr[i] = (i - N) * dk;

  /* ---------- potential builder ----------
   * Three barrier shapes (centered at xc, half-width w/2):
   *   Square:     V(x) = V₀   for |x-xc| ≤ w/2
   *   Semicircle:  V(x) = V₀·√(1-t²)  with t = 2(x-xc)/w,  |x-xc| ≤ w/2
   *   Gaussian:    V(x) = V₀·exp(-(x-xc)²/(2σ²))  with σ = w/4
   * Max-of-all-barriers ensures overlapping barriers take the taller value.
   */
  function buildPotential() {
    var w = barrierWidth;
    var V0 = barrierHeight;
    var count = Math.max(1, Math.floor(barrierCount || 1));
    var spacing = barrierSpacing || 4.0;
    var startX = -(count - 1) * spacing * 0.5;
    for (var i = 0; i < N; i++) V[i] = 0.0;
    for (var b = 0; b < count; b++) {
      var xc = startX + b * spacing;
      for (var i = 0; i < N; i++) {
        var x = xArr[i];
        var Vi = 0.0;
        if (barrierShape === 'square') {
          if (Math.abs(x - xc) <= w / 2.0) Vi = V0;
        } else if (barrierShape === 'semicircle') {
          if (Math.abs(x - xc) <= w / 2.0) {
            var t = 2.0 * (x - xc) / w;
            Vi = V0 * Math.sqrt(Math.max(0.0, 1.0 - t * t));
          }
        } else if (barrierShape === 'gaussian') {
          var sigma = w / 4.0;
          Vi = V0 * Math.exp(-0.5 * ((x - xc) / sigma) * ((x - xc) / sigma));
        }
        if (Vi > V[i]) V[i] = Vi;
      }
    }
  }

  /* ---------- packet init ----------
   * Gaussian wave packet (minimum uncertainty):
   *   ψ(x,0) = (2πσ²)^{-1/4} · exp(-(x-x₀)²/(4σ²)) · exp(i·k₀·x)
   * σ = position width, k₀ = initial momentum, E₀ = k₀²/2.
   * Normalization: Σ |ψ_i|² · dx = 1  →  rescale = 1/√(Σ |ψ_i|² · dx)
   */
  function initPacket() {
    var x0 = packetCenter;
    var sigma = packetWidth;
    var k0 = packetMomentum;
    var norm = 0.0;
    var pre = Math.pow(2.0 * Math.PI * sigma * sigma, -0.25);
    for (var i = 0; i < N; i++) {
      var x = xArr[i];
      var env = pre * Math.exp(-(x - x0) * (x - x0) / (4.0 * sigma * sigma));
      psiRe[i] = env * Math.cos(k0 * x);
      psiIm[i] = env * Math.sin(k0 * x);
      norm += (psiRe[i] * psiRe[i] + psiIm[i] * psiIm[i]);
    }
    var scale = 1.0 / Math.sqrt(norm * dx);
    for (var i = 0; i < N; i++) {
      psiRe[i] *= scale;
      psiIm[i] *= scale;
    }
    time = 0.0;
  }

  /* ---------- time step ----------
   * Strang splitting (second-order, norm-preserving):
   *   ψ → e^{-i·V̂·Δt/2} → F → e^{-i·k²·Δt/2} → F⁻¹ → e^{-i·V̂·Δt/2} ψ
   * where e^{-i·V̂·Δt/2} acts pointwise in x-space and e^{-i·k²·Δt/2}
   * acts pointwise in k-space after/before FFT.
   */
  function step() {
    var re = psiRe, im = psiIm;
    // half potential step:  ψ → e^{-iVΔt/2} ψ  (pointwise rotation in complex plane)
    for (var i = 0; i < N; i++) {
      var c = Math.cos(-V[i] * dt * 0.5);
      var s = Math.sin(-V[i] * dt * 0.5);
      var r = re[i] * c - im[i] * s;
      var j = re[i] * s + im[i] * c;
      re[i] = r; im[i] = j;
    }
    _fftCore(re, im, false);   // ψ(x) → ψ̃(k)
    // kinetic step:  ψ̃ → e^{-ik²Δt/2} ψ̃  (exact free propagation in k-space)
    for (var i = 0; i < N; i++) {
      var K = kArr[i] * kArr[i] * 0.5;   // K = k²/2  (ℏ = m = 1)
      var c = Math.cos(-K * dt);
      var s = Math.sin(-K * dt);
      var r = re[i] * c - im[i] * s;
      var j = re[i] * s + im[i] * c;
      re[i] = r; im[i] = j;
    }
    _fftCore(re, im, true);    // ψ̃(k) → ψ(x)
    // half potential step (second half of the symmetric split)
    for (var i = 0; i < N; i++) {
      var c = Math.cos(-V[i] * dt * 0.5);
      var s = Math.sin(-V[i] * dt * 0.5);
      var r = re[i] * c - im[i] * s;
      var j = re[i] * s + im[i] * c;
      re[i] = r; im[i] = j;
    }
    time += dt;
  }

  /* ---------- damping mask ----------
   * Gaussian absorbing boundary at domain edges:
   *   factor = exp(-(x_edge/(0.35·edge))²)
   * where edge = L×0.12. Suppresses wraparound artifacts from periodic FFT.
   * Slightly breaks unitarity — norm slowly decreases (open boundary simulation).
   */
  function applyMask() {
    var edge = L * 0.12;
    var L2 = L / 2.0;
    for (var i = 0; i < N; i++) {
      var x = xArr[i];
      var factor = 1.0;
      if (x < -L2 + edge) {
        factor *= Math.exp(-Math.pow((-L2 + edge - x) / (edge * 0.35), 2));
      }
      if (x > L2 - edge) {
        factor *= Math.exp(-Math.pow((x - (L2 - edge)) / (edge * 0.35), 2));
      }
      psiRe[i] *= factor;
      psiIm[i] *= factor;
    }
  }

  /* ---------- draw ---------- */
  var animId = null;
  function draw() {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H;
    if (canvas.clientWidth > 0) {
      W = canvas.clientWidth;
      H = canvas.clientHeight || 280;
      if (Math.abs(canvas.width - W) > 2) canvas.width = Math.floor(W);
      if (Math.abs(canvas.height - H) > 2) canvas.height = Math.floor(H);
    }
    W = canvas.width; H = canvas.height;
    if (!W || !H) return;

    var xMin = -L / 2.0, xMax = L / 2.0;
    var xScale = W / (xMax - xMin);
    var re = psiRe, im = psiIm;

    ctx.clearRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = 'rgba(40,40,60,0.4)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= W; gx += Math.floor(W / 12)) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(100,100,140,0.25)';
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();

    // potential
    ctx.beginPath(); ctx.moveTo(0, H);
    var maxVDraw = Math.max(barrierHeight, 1.0);
    for (var i = 0; i < N; i++) {
      var px = (xArr[i] - xMin) * xScale;
      var py = H - (V[i] / (maxVDraw * 1.3)) * (H * 0.32);
      ctx.lineTo(px, py);
    }
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = 'rgba(192,132,252,0.14)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(192,132,252,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // amplitude scale
    var maxAmp = 0.0, maxProb = 0.0;
    for (var i = 0; i < N; i++) {
      var prob = re[i] * re[i] + im[i] * im[i];
      if (prob > maxProb) maxProb = prob;
      if (Math.abs(re[i]) > maxAmp) maxAmp = Math.abs(re[i]);
    }
    if (maxAmp < 1e-12) maxAmp = 1.0;
    var ampScale = Math.min(H * 0.38 / maxAmp, H * 0.45);

    // |psi|^2 fill
    ctx.beginPath(); ctx.moveTo(0, H);
    for (var i = 0; i < N; i++) {
      var px = (xArr[i] - xMin) * xScale;
      var py = H - (re[i] * re[i] + im[i] * im[i]) * ampScale * 2.0;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = 'rgba(255,78,205,0.10)';
    ctx.fill();

    // Re(psi) colored
    ctx.lineWidth = 2.5;
    for (var i = 0; i < N - 1; i++) {
      var x0 = (xArr[i] - xMin) * xScale;
      var x1 = (xArr[i + 1] - xMin) * xScale;
      var y0 = H / 2.0 - re[i] * ampScale;
      var y1 = H / 2.0 - re[i + 1] * ampScale;
      var val = re[i];
      var intensity = Math.min(1.0, Math.abs(val) / (maxAmp * 0.55 + 1e-10));
      var rr, gg, bb;
      if (val < 0.0) {
        rr = Math.round(20 + intensity * 70);
        gg = Math.round(80 + intensity * 175);
        bb = Math.round(220 + intensity * 35);
      } else {
        rr = Math.round(220 + intensity * 35);
        gg = Math.round(80 + intensity * 175);
        bb = Math.round(20 + intensity * 70);
      }
      ctx.strokeStyle = 'rgb(' + rr + ',' + gg + ',' + bb + ')';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }

    // forbidden regions
    var bcount = Math.max(1, Math.floor(barrierCount || 1));
    var bspacing = barrierSpacing || 4.0;
    var bstart = -(bcount - 1) * bspacing * 0.5;
    var pe = packetMomentum * packetMomentum * 0.5;
    if (pe < barrierHeight) {
      for (var b = 0; b < bcount; b++) {
        var xc = bstart + b * bspacing;
        var lpx = ((xc - barrierWidth / 2.0) - xMin) * xScale;
        var rpx = ((xc + barrierWidth / 2.0) - xMin) * xScale;
        ctx.fillStyle = 'rgba(255,215,64,0.06)';
        ctx.fillRect(lpx, 0, rpx - lpx, H);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255,215,64,0.25)';
        ctx.beginPath(); ctx.moveTo(lpx, 0); ctx.lineTo(lpx, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rpx, 0); ctx.lineTo(rpx, H); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = 'rgba(255,215,64,0.5)';
      ctx.font = '10px JetBrains Mono,monospace';
      ctx.fillText(bcount > 1 ? 'forbidden (' + bcount + ' barriers)' : 'forbidden', ((bstart - barrierWidth / 2.0) - xMin) * xScale + 4, H - 10);
    }

    // label
    ctx.fillStyle = '#8080a0';
    ctx.font = '11px JetBrains Mono,monospace';
    ctx.fillText('Re(ψ)  blue(-) → red(+)     |ψ|²     barriers: ' + bcount, 10, 16);

    // ---------- probability readout: P(left), P(barrier), P(right) ----------
    // Integrate |ψ|² dx over three regions relative to the barrier array:
    //  P_left   = Σ_{x <  first_barrier_left}  |ψ_i|² · dx
    //  P_mid    = Σ_{barrier regions}          |ψ_i|² · dx
    //  P_right  = Σ_{x >  last_barrier_right}  |ψ_i|² · dx
    // Total = P_left + P_mid + P_right + P_absorbed, where P_absorbed
    // accounts for the tail removed by the Gaussian edge mask.
    var bstartX = -(bcount - 1) * barrierSpacing * 0.5;
    var firstL = bstartX - barrierWidth / 2.0;
    var lastR  = bstartX + (bcount - 1) * barrierSpacing + barrierWidth / 2.0;
    var pLeft = 0.0, pMid = 0.0, pRight = 0.0;
    for (var i = 0; i < N; i++) {
      var prob_i = re[i] * re[i] + im[i] * im[i];
      var x = xArr[i];
      if (x < firstL) {
        pLeft  += prob_i;
      } else if (x > lastR) {
        pRight += prob_i;
      } else {
        // Inside the 'forbidden' zone (covers all barriers when count > 1)
        pMid += prob_i;
      }
    }
    pLeft  *= dx;
    pMid   *= dx;
    pRight *= dx;

    var elLeft  = document.getElementById('wp-p-left');
    var elMid   = document.getElementById('wp-p-mid');
    var elRight = document.getElementById('wp-p-right');
    if (elLeft)  elLeft.textContent  = pLeft.toFixed(4);
    if (elMid)   elMid.textContent   = pMid.toFixed(4);
    if (elRight) elRight.textContent = pRight.toFixed(4);
  }

  /* ---------- animation loop ---------- */
  function loop() {
    animId = null;
    if (!running) return;
    for (var s = 0; s < stepsPerFrame; s++) {
      step();
      applyMask();
    }
    draw();
    animId = requestAnimationFrame(loop);
  }

  function play() {
    running = true;
    if (!animId) loop();
  }
  function pause() {
    running = false;
  }
  function reset() {
    pause();
    initPacket();
    draw();
  }

  /* ---------- init ---------- */
  buildPotential();
  initPacket();

  // initial draw
  var canvas = document.getElementById(canvasId);
  if (canvas) {
    var parent = canvas.parentElement;
    var targetW = parent ? (parent.clientWidth || 900) : 900;
    canvas.width = Math.max(Math.floor(targetW), 400);
    canvas.height = 280;
    draw();
  }

  // expose API
  var api = {
    play: play,
    pause: pause,
    reset: reset,
    draw: draw,
    rebuild: function() { buildPotential(); draw(); },
    setV0: function(v) { barrierHeight = v; buildPotential(); if (!running) draw(); },
    setWidth: function(v) { barrierWidth = v; buildPotential(); if (!running) draw(); },
    setCount: function(v) { barrierCount = v; buildPotential(); if (!running) draw(); },
    setSpacing: function(v) { barrierSpacing = v; buildPotential(); if (!running) draw(); },
    setShape: function(s) { barrierShape = s; buildPotential(); if (!running) draw(); },
    setK0: function(v) { packetMomentum = v; initPacket(); if (!running) draw(); },
    setSigma: function(v) { packetWidth = v; initPacket(); if (!running) draw(); },
    setDt: function(v) { dt = v; },
    get running() { return running; },
    get time() { return time; }
  };

  // store globally by canvasId for external access
  if (!window._wpEmbeds) window._wpEmbeds = {};
  window._wpEmbeds[canvasId] = api;

  return api;
}
window.wpCanvasEmbed = wpCanvasEmbed;

/**
 * shared_games.js — Gamification engine for Physics Playground
 * XP system, achievements, hints, progress tracking, particle effects
 */

'use strict';

/* ── Safe localStorage wrapper — file:// may block localStorage ── */
var __safeLS = (function(){
  var mem = {};
  try {
    var t = '___test___';
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
    return {
      get: function(k){ return localStorage.getItem(k); },
      set: function(k,v){ localStorage.setItem(k,v); }
    };
  } catch(e) {
    console.warn('[shared_games] localStorage unavailable — using in-memory fallback');
    return {
      get: function(k){ return mem[k] || null; },
      set: function(k,v){ mem[k] = v; }
    };
  }
})();

// ===== SESSION STATE =====
var __GameState = (function() {
  var key = 'physics-playground-v1';
  var data = {};
  try {
    var raw = __safeLS.get(key);
    data = JSON.parse(raw || '{}');
  } catch(e) {
    data = {};
  }

  function save() {
    try { __safeLS.set(key, JSON.stringify(data)); } catch(e) {}
  }

  var msTarget = data.moduleScores || {};
  var earnedSet = new Set(data.earnedBadges || []);
  var xpFunc = function() { return data.xp || 0; };
  xpFunc.valueOf = function() { return data.xp || 0; };
  xpFunc.toString = function() { return String(data.xp || 0); };

  return {
    get: function(k) { return data[k]; },
    set: function(k, v) { data[k] = v; save(); },
    xp: xpFunc,
    addXP: function(n, reason) {
      data.xp = (data.xp || 0) + n;
      if (reason) showXPFloat(n, reason);
      save();
      updateNavXP();
    },
    unlock: function(achievement) {
      data.achievements = data.achievements || [];
      if (!data.achievements.includes(achievement.id)) {
        data.achievements.push(achievement.id);
        showAchievementPopup(achievement);
        save();
        updateNavBadges();
      }
    },
    hasAchievement: function(id) {
      return (data.achievements || []).includes(id);
    },
    getProgress: function(module) { return data['progress_' + module] || 0; },
    setProgress: function(module, pct) {
      data['progress_' + module] = Math.max(data['progress_' + module] || 0, pct);
      save();
    },
    level: function() { return data.level || 1; },
    moduleScores: new Proxy(msTarget, {
      set: function(target, prop, value) {
        target[prop] = value;
        data.moduleScores = target;
        save();
        return true;
      }
    }),
    earnedBadges: {
      add: function(id) {
        earnedSet.add(id);
        data.earnedBadges = Array.from(earnedSet);
        save();
        return this;
      },
      has: function(id) { return earnedSet.has(id); },
      delete: function(id) {
        var result = earnedSet.delete(id);
        data.earnedBadges = Array.from(earnedSet);
        save();
        return result;
      },
      get size() { return earnedSet.size; },
      forEach: function(cb) { earnedSet.forEach(cb); },
      values: function() { return earnedSet.values(); }
    },
    save: save
  };
})();

// ===== XP FLOATING ANIMATION =====
function showXPFloat(n, reason) {
  var el = document.createElement('div');
  el.textContent = '+' + n + ' XP — ' + reason;
  el.style.cssText = 'position:fixed;top:60px;right:20px;background:rgba(0,212,255,0.9);color:#fff;font-family:JetBrains Mono,monospace;font-size:13px;padding:8px 16px;border-radius:8px;z-index:10000;animation:xpIn 0.4s ease, xpOut 0.4s ease 1.8s forwards;box-shadow:0 4px 16px rgba(0,212,255,0.3);';
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 2400);
}

// ===== ACHIEVEMENT POPUP =====
function showAchievementPopup(a) {
  var el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:30px;right:20px;background:var(--bg-elevated);border:1px solid var(--accent-purple);border-radius:16px;padding:16px 20px;z-index:10000;animation:slideUp 0.5s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);max-width:320px;';
  el.innerHTML = '<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent-purple);font-weight:600;margin-bottom:4px;">Achievement Unlocked</div>' +
    '<div style="font-size:15px;font-weight:700;color:var(--text-main);margin-bottom:4px;">' + a.icon + ' ' + a.title + '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);line-height:1.4;">' + a.desc + '</div>' +
    '<div style="font-size:11px;color:var(--accent-cyan);margin-top:6px;font-family:JetBrains Mono,monospace;">+' + a.xp + ' XP</div>';
  document.body.appendChild(el);
  setTimeout(function() { el.style.animation = 'slideDown 0.5s ease forwards'; }, 4000);
  setTimeout(function() { el.remove(); }, 4600);
}

// ===== NAVBAR XP DISPLAY =====
function updateNavXP() {
  var el = document.getElementById('nav-xp');
  if (el) el.textContent = __GameState.xp() + ' XP';
}
function updateNavBadges() {
  var el = document.getElementById('nav-badges');
  if (el) {
    var count = (__GameState.get('achievements') || []).length;
    el.textContent = count + ' badges';
    el.style.display = count ? 'inline-block' : 'none';
  }
}

// ===== PARTICLE BURST (CSS-only celebration) =====
function particleBurst(x, y, color) {
  var colors = color ? [color] : ['#00d4ff','#b388ff','#ff4081','#69f0ae','#ffd740'];
  for (var i = 0; i < 12; i++) {
    var p = document.createElement('div');
    p.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:6px;height:6px;border-radius:50%;background:' + colors[i % colors.length] + ';z-index:10000;pointer-events:none;';
    var angle = (Math.PI * 2 * i) / 12;
    var dist = 40 + Math.random() * 40;
    var tx = x + Math.cos(angle) * dist;
    var ty = y + Math.sin(angle) * dist;
    p.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + (tx-x) + 'px,' + (ty-y) + 'px) scale(0)', opacity: 0 }
    ], { duration: 600 + Math.random() * 200, easing: 'ease-out' });
    document.body.appendChild(p);
    setTimeout(function() { p.remove(); }, 900);
  }
}

// ===== CHALLENGE PANEL BUILDER =====
function buildChallengePanel(opts) {
  var d = document.createElement('div');
  d.className = 'challenge-panel';
  d.innerHTML =
    '<div class="challenge-header">' +
      '<span class="challenge-icon">' + (opts.icon || '') + '</span>' +
      '<span class="challenge-title">' + (opts.title || 'Challenge') + '</span>' +
      '<span class="challenge-difficulty ' + opts.difficulty + '">' + opts.difficulty + '</span>' +
    '</div>' +
    '<div class="challenge-desc">' + (opts.description || '') + '</div>' +
    '<div class="challenge-reward">' + (opts.reward || '') + '</div>' +
    '<div class="challenge-controls" id="' + opts.id + '-controls"></div>' +
    '<div class="challenge-plot" id="' + opts.id + '" style="min-height:280px;"></div>' +
    '<div class="challenge-feedback" id="' + opts.id + '-feedback"></div>';
  return d;
}

// ===== HINT SYSTEM =====
function showHint(hints, level) {
  if (level < 0 || level >= hints.length) return;
  var el = document.getElementById('hint-box');
  if (!el) {
    el = document.createElement('div');
    el.id = 'hint-box';
    el.style.cssText = 'background:rgba(255,215,64,0.08);border-left:3px solid var(--accent-yellow);padding:12px 16px;border-radius:0 8px 8px 0;margin:8px 0;font-size:0.9rem;color:var(--text-main);';
    var container = document.querySelector('.challenge-panel') || document.getElementById('playground');
    if (container) container.appendChild(el);
  }
  el.innerHTML = '<div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent-yellow);font-weight:600;margin-bottom:4px;">Hint (' + (level + 1) + '/' + hints.length + ')</div>' +
    '<div style="line-height:1.5;">' + hints[level] + '</div>';
}

// ===== GAME MODES =====
function setGameMode(mode) {
  document.querySelectorAll('.game-mode-btn').forEach(function(b) { b.classList.remove('active'); });
  var btn = document.getElementById('mode-' + mode);
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.mode-section').forEach(function(s) { s.style.display = 'none'; });
  var section = document.getElementById('section-' + mode);
  if (section) section.style.display = 'block';

  var container = document.querySelector('.game-container');
  if (container) container.setAttribute('data-active-mode', mode);

  if (['play','challenge','puzzle','experiment','thin','coherence'].indexOf(mode) !== -1 && section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (mode === 'challenge' && typeof initChallenges === 'function') initChallenges();
  if (mode === 'puzzle' && typeof initPuzzles === 'function') initPuzzles();
  if (mode === 'experiment' && typeof initExperiments === 'function') initExperiments();
  if (mode === 'thin' && typeof initTF === 'function') {
    initTF();
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([section]).catch(function(err){ console.log('MJ err', err); });
    }
  }
  if (mode === 'coherence') {
    var iframe = document.getElementById('coherence-iframe');
    if (iframe) {
      iframe.style.width  = iframe.parentElement.clientWidth + 'px';
      iframe.contentWindow.postMessage({ action: 'resize' }, '*');
    }
  }
}

// ===== MODULE PROGRESS BAR =====
function setModuleProgress(pct) {
  var el = document.getElementById('module-progress');
  if (el) {
    el.style.width = pct + '%';
    el.style.transition = 'width 0.5s ease';
  }
  var txt = document.getElementById('module-progress-text');
  if (txt) txt.textContent = pct + '% explored';
}

// ===== COMBO SYSTEM =====
var __Combo = { count: 0, last: 0 };
function comboCheck() {
  var now = Date.now();
  if (now - __Combo.last < 8000) {
    __Combo.count++;
    if (__Combo.count >= 3) {
      var bonus = __Combo.count * 5;
      __GameState.addXP(bonus, __Combo.count + '-combo bonus!');
      return { count: __Combo.count, bonus: bonus };
    }
  } else {
    __Combo.count = 1;
  }
  __Combo.last = now;
  return { count: __Combo.count, bonus: 0 };
}

// ===== CORRECT ANSWER CELEBRATION =====
function celebrateCorrect() {
  var combo = comboCheck();
  particleBurst(window.innerWidth / 2, window.innerHeight / 2);
  return combo;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  updateNavXP();
  updateNavBadges();
});

// Expose to window for module access (alias for backward compatibility)
window.__GameState = __GameState;
window._GameState = __GameState;

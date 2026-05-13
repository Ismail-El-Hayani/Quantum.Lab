const fs = require('fs');
const path = require('path');

const baseDir = path.dirname(__filename);
const rootDir = path.resolve(baseDir, '../..');

let errors = 0;
let warnings = 0;

function logError(msg) { console.error('ERROR: ' + msg); errors++; }
function logWarn(msg) { console.warn('WARN:  ' + msg); warnings++; }
function logInfo(msg) { console.log('INFO:  ' + msg); }

// ── 1. Check HTML syntax ──────────────────────────────────────
const htmlPath = path.join(baseDir, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Check for literal backslashes in attributes (escaped quotes that weren't unescaped)
const badEscapes = html.match(/id=\\"/g);
if (badEscapes) {
  logError('HTML contains literal backslash-escaped quotes (id=\\") — ' + badEscapes.length + ' occurrences. These break HTML parsing.');
}

// Check script paths resolve
const scriptSrcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]);
scriptSrcs.forEach(src => {
  let resolved;
  if (src.startsWith('http')) return;
  if (src.startsWith('/')) resolved = path.join(rootDir, src);
  else resolved = path.resolve(baseDir, src);
  if (!fs.existsSync(resolved)) {
    logError('Missing script file: ' + src + ' (looked at ' + resolved + ')');
  }
});

const linkHrefs = [...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map(m => m[1]);
linkHrefs.forEach(href => {
  if (href.startsWith('http')) return;
  let resolved = path.resolve(baseDir, href);
  if (!fs.existsSync(resolved)) {
    logError('Missing linked file: ' + href + ' (looked at ' + resolved + ')');
  }
});

// Check for unclosed tags
const openBody = (html.match(/<body>/g) || []).length;
const closeBody = (html.match(/<\/body>/g) || []).length;
if (openBody !== closeBody) logError('Unbalanced <body> tags: ' + openBody + ' open, ' + closeBody + ' close');

const openHtml = (html.match(/<html[ >]/g) || []).length;
const closeHtml = (html.match(/<\/html>/g) || []).length;
if (openHtml !== closeHtml) logError('Unbalanced <html> tags');

// ── 2. Check JS syntax ────────────────────────────────────────
const jsFiles = ['qho_sim.js', 'qho_apps.js', 'qho_apps_games.js'];
jsFiles.forEach(f => {
  const fp = path.join(baseDir, f);
  if (!fs.existsSync(fp)) { logError('Missing JS file: ' + f); return; }
  const src = fs.readFileSync(fp, 'utf8');
  try {
    new Function(src);
    logInfo(f + ' — syntax OK');
  } catch (e) {
    logError(f + ' — syntax error: ' + e.message.split('\n')[0]);
  }
});

// ── 3. Check for duplicate global definitions ────────────────
const simSrc = fs.readFileSync(path.join(baseDir, 'qho_sim.js'), 'utf8');
const gamesSrc = fs.readFileSync(path.join(baseDir, 'qho_apps_games.js'), 'utf8');
const appsSrc = fs.readFileSync(path.join(baseDir, 'qho_apps.js'), 'utf8');

// Functions defined in both sim and games
const simFuncs = [...simSrc.matchAll(/function\s+(\w+)\s*\(/g)].map(m => m[1]);
const gamesFuncs = [...gamesSrc.matchAll(/function\s+(\w+)\s*\(/g)].map(m => m[1]);
const dupes = simFuncs.filter(f => gamesFuncs.includes(f));
if (dupes.length > 0) {
  logWarn('Functions defined in BOTH qho_sim.js and qho_apps_games.js: ' + dupes.join(', ') + '. The later-loaded file will override the earlier one.');
}

// ── 4. Check HTML onclick handlers have matching JS functions ─
const onclickHandlers = [...html.matchAll(/onclick="(\w+)\(/g)].map(m => m[1]);
const allJs = simSrc + '\n' + gamesSrc + '\n' + appsSrc;
onclickHandlers.forEach(fn => {
  const regex = new RegExp('(function|window\\.)' + fn + '\\s*[=\\(]');
  if (!regex.test(allJs) && !allJs.includes('function ' + fn)) {
    // Special case: setGameMode is in shared_games.js
    if (fn === 'setGameMode') return;
    logError('HTML onclick calls ' + fn + '() but no such function found in loaded JS files');
  }
});

// ── 5. Check for referenced element IDs that don't exist in HTML ─
const idMatches = [...allJs.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)];
const idsInHtml = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const uniqueJsIds = [...new Set(idMatches.map(m => m[1]))];
uniqueJsIds.forEach(id => {
  if (!idsInHtml.includes(id)) {
    // Check if it's in shared JS (shared_games defines nav-xp etc)
    const sharedIds = ['nav-xp', 'nav-badges', 'module-nav', 'badge-list', 'stat-challenges', 'stat-puzzles', 'stat-xp', 'stat-badges'];
    if (sharedIds.includes(id)) return;
    logWarn('JS references element ID "' + id + '" but it does not exist in index.html');
  }
});

// ── 6. Check for HTML element IDs referenced in HTML that have no JS ─
const slidersInHtml = idsInHtml.filter(id => id.startsWith('slider-'));
slidersInHtml.forEach(id => {
  if (!allJs.includes("'" + id + "'") && !allJs.includes('"' + id + '"')) {
    logWarn('HTML slider "' + id + '" has no event listener in JS — it will be inert');
  }
});

// ── Summary ───────────────────────────────────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Validation complete: ' + errors + ' error(s), ' + warnings + ' warning(s)');
if (errors > 0) process.exit(1);

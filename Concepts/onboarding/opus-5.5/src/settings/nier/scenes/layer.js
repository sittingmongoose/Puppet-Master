/* O55 · NieR Mode scenes: an ink panorama behind the app.
   While NieR Mode is on and its Background (general.visual.nier-background) is not Parchment, one of six original
   line-art scenes (City Ruins, The Bunker, Desert, Forest Castle, Amusement Park, Flooded City) lies in a fixed layer
   behind the shell, in the ink colour at low opacity; "Follow the page" picks the scene from the page shown.
   - The layer is placed like the Glass wallpaper (#glass-bg): a fixed, contained, inert div first among the shell's
     siblings, with the shell lifted above it (styles.d/16-nier-scenes.css).
   - <html data-o55-nier-scene="city|bunker|desert|forest|park|flooded"> says which scene is showing; it is absent
     otherwise. CSS reads that attribute and the layer's own; nothing here restyles the document.
   - A scene is painted once: its SVG is parsed when it is chosen and then stands still. The only motion is the
     optional ambient touch of a scene, CSS transform/opacity loops that run only while the NieR part "particles" is
     installed and motion is not reduced.
   - The page is followed through the class attribute of the six page roots (attributes only, no subtree) and applied
     after the page transition has finished, so a scene is never parsed inside the page change's own frames.
   - It works against the NieR engine's PM_NIER when present (on(), has(), background(), onChange()) and falls back to
     the <html data-o55-nier> attribute and the stored setting before the engine exists.
   window.PM_NIER_SCENES = { keys, label(key), sceneFor(page), svg(key), current() } serves thumbnails.
   The SVG strings (O55_NIER_SCENE_SVG, above) are generated from src/settings/nier/scenes/*.svg by
   tools/nier_scenes.py; this file is the hand-written half. */
const O55_NIER_SCENE_LABEL = { city: 'City Ruins', bunker: 'The Bunker', desert: 'Desert', forest: 'Forest Castle', park: 'Amusement Park', flooded: 'Flooded City' };
const O55_NIER_SCENE_KEYS = Object.keys(O55_NIER_SCENE_LABEL).filter(k => O55_NIER_SCENE_SVG[k]);
/* Follow the page: the dashboard is the city you come home to; Projects are the kingdom in the forest; the Planning
   Wizard is the Bunker, where missions are briefed; the Orchestrator is the flooded city, where every current meets;
   Usage is the desert, where resources run dry; Settings is the amusement park, all rides and switches. */
const O55_NIER_PAGE_SCENE = { dashboard: 'city', projects: 'forest', wizard: 'bunker', orchestrator: 'flooded', usage: 'desert', settings: 'park', chat: 'park' };
const O55_NIER_BG_ID = 'general.visual.nier-background';
const O55_NIER_FOLLOW = 'follow';

function o55NierSceneKeyOf(label) {
  const v = String(label == null ? '' : label).trim().toLowerCase();
  if (!v) return 'city';
  if (v === 'parchment' || v === 'none' || v === 'off') return null;
  if (v === 'follow the page' || v === 'follow' || v === 'page') return O55_NIER_FOLLOW;
  if (O55_NIER_SCENE_LABEL[v]) return v;
  const hit = Object.keys(O55_NIER_SCENE_LABEL).find(k => O55_NIER_SCENE_LABEL[k].toLowerCase() === v);
  return hit || 'city';
}
function o55NierIsOn() {
  const N = window.PM_NIER;
  if (N && typeof N.on === 'function') { try { return !!N.on(); } catch (e) { /* fall through */ } }
  return document.documentElement.getAttribute('data-o55-nier') === 'on';
}
function o55NierBackgroundLabel() {
  const N = window.PM_NIER;
  if (N && typeof N.background === 'function') { try { const v = N.background(); if (v != null && v !== '') return String(v); } catch (e) { /* fall through */ } }
  try { const v = PM51.value(O55_NIER_BG_ID); return v == null ? 'City Ruins' : String(v); } catch (e) { return 'City Ruins'; }
}
function o55NierPageNow() {
  const P = window.PM_PAGES;
  if (P && P.current) return String(P.current);
  const el = document.querySelector('.primary-content > .page.active');
  const m = el && /(?:^|\s)page-([a-z0-9-]+)/.exec(el.className);
  return m ? m[1] : 'dashboard';
}
function o55NierSceneFor(page) {
  const k = O55_NIER_PAGE_SCENE[String(page || '').toLowerCase()] || 'city';
  return O55_NIER_SCENE_SVG[k] ? k : O55_NIER_SCENE_KEYS[0] || null;
}
/* The scene that should show now, or null. */
function o55NierSceneWanted() {
  if (!o55NierIsOn()) return null;
  const k = o55NierSceneKeyOf(o55NierBackgroundLabel());
  if (!k) return null;
  const key = k === O55_NIER_FOLLOW ? o55NierSceneFor(o55NierPageNow()) : k;
  return O55_NIER_SCENE_SVG[key] ? key : (O55_NIER_SCENE_KEYS[0] || null);
}

/* ---------- the layer ------------------------------------------------------------------------------------------------ */
let o55NierLayer = null, o55NierShown = null, o55NierTimer = 0, o55NierPageWatch = null;
function o55NierLayerEl() {
  if (o55NierLayer && o55NierLayer.isConnected) return o55NierLayer;
  const shell = document.querySelector('body > .app-shell');
  if (!document.body) return null;
  const el = document.createElement('div');
  el.id = 'o55-nier-scene'; el.className = 'o55-nier-scene'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="o55-nier-scene-fade"></div>';
  document.body.insertBefore(el, shell || document.body.firstChild);
  return (o55NierLayer = el);
}
function o55NierArt(key) {
  const art = document.createElement('div');
  art.className = 'o55-nier-scene-art'; art.dataset.scene = key;
  art.innerHTML = O55_NIER_SCENE_SVG[key];
  return art;
}
/* Put the wanted scene up (or take the layer down). A change between two scenes cross-fades by opacity. */
function o55NierSceneApply() {
  o55NierTimer = 0;
  const html = document.documentElement, key = o55NierSceneWanted();
  o55NierFollow(key != null && o55NierSceneKeyOf(o55NierBackgroundLabel()) === O55_NIER_FOLLOW);
  if (key === o55NierShown && (!key || (o55NierLayer && o55NierLayer.isConnected))) return;
  if (!key) {
    o55NierShown = null;
    if (html.hasAttribute('data-o55-nier-scene')) html.removeAttribute('data-o55-nier-scene');
    if (o55NierLayer) { o55NierLayer.remove(); o55NierLayer = null; }
    return;
  }
  const layer = o55NierLayerEl(); if (!layer) return;
  const fade = layer.querySelector('.o55-nier-scene-fade');
  const olds = [...layer.querySelectorAll(':scope > .o55-nier-scene-art')];
  const art = o55NierArt(key);
  layer.insertBefore(art, fade);
  layer.dataset.scene = key;
  o55NierShown = key;
  if (html.getAttribute('data-o55-nier-scene') !== key) html.setAttribute('data-o55-nier-scene', key);
  const still = typeof o55Still === 'function' ? o55Still() : html.getAttribute('data-motion') === 'reduced';
  if (!olds.length || still || typeof art.animate !== 'function') { olds.forEach(o => o.remove()); return; }
  olds.forEach(o => { o.classList.add('is-leaving'); });
  const a = art.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.22,.8,.24,1)' });
  const done = () => olds.forEach(o => o.remove());
  a.onfinish = done; a.oncancel = done;
}
/* Coalesce every trigger into one apply; while a page change is animating, wait for it to finish. */
function o55NierSceneSoon(delay) {
  if (o55NierTimer) window.clearTimeout(o55NierTimer);
  o55NierTimer = window.setTimeout(function tick() {
    if (document.documentElement.hasAttribute('data-pm-page-transition')) { o55NierTimer = window.setTimeout(tick, 120); return; }
    o55NierSceneApply();
  }, delay == null ? 0 : delay);
}
/* Follow the page: watch the page roots' class attribute, only while following. */
function o55NierFollow(on) {
  if (!on) { if (o55NierPageWatch) { o55NierPageWatch.disconnect(); o55NierPageWatch = null; } return; }
  if (o55NierPageWatch) return;
  const pages = document.querySelectorAll('.primary-content > .page'); if (!pages.length) return;
  let last = o55NierPageNow();
  o55NierPageWatch = new MutationObserver(() => {
    const now = o55NierPageNow(); if (now === last) return; last = now;
    if (o55NierSceneFor(now) !== o55NierShown) o55NierSceneSoon(60);
  });
  pages.forEach(p => o55NierPageWatch.observe(p, { attributes: true, attributeFilter: ['class'] }));
}

/* ---------- triggers ------------------------------------------------------------------------------------------------- */
/* NieR switched on or off, or its parts changed: the <html> attributes (the engine writes them). */
new MutationObserver(() => o55NierSceneSoon(0)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-o55-nier'] });
/* The Background row, and NieR Mode itself, changed in Settings. */
const o55NierSceneCommit = commitSettingValue;
commitSettingValue = function (id, value) {
  const ok = o55NierSceneCommit.apply(this, arguments);
  if (id === O55_NIER_BG_ID || id === 'general.visual.nier-mode') o55NierSceneSoon(0);
  return ok;
};
const o55NierSceneRestore = restoreSettingDefault;
restoreSettingDefault = function (id) {
  const ok = o55NierSceneRestore.apply(this, arguments);
  if (id === O55_NIER_BG_ID || id === 'general.visual.nier-mode') o55NierSceneSoon(0);
  return ok;
};
/* Settings Home is ground the scene may show through (the other Settings pages keep their ground: rows and help text
   sit on it). The panel carries data-o55-home while Home is shown, so CSS needs no :has(). */
function o55NierHomeMark() {
  const ps = document.getElementById('panel-settings'); if (!ps || !state) return;
  const on = !!state.home;
  if (on !== ps.hasAttribute('data-o55-home')) { if (on) ps.setAttribute('data-o55-home', ''); else ps.removeAttribute('data-o55-home'); }
}
const o55NierSceneRender = renderApp;
renderApp = function () { const r = o55NierSceneRender.apply(this, arguments); o55NierHomeMark(); return r; };
window.setTimeout(o55NierHomeMark, 0);
/* The engine's own change feed, once it exists (it may arrive after this file). */
let o55NierSubscribed = false;
function o55NierSubscribe() {
  const N = window.PM_NIER;
  if (o55NierSubscribed || !N || typeof N.onChange !== 'function') return !!o55NierSubscribed;
  try { N.onChange(() => o55NierSceneSoon(0)); o55NierSubscribed = true; } catch (e) { /* keep the fallbacks */ }
  return o55NierSubscribed;
}
if (!o55NierSubscribe()) {
  let tries = 0;
  const again = () => { if (!o55NierSubscribe() && ++tries < 20) window.setTimeout(again, 500); else o55NierSceneSoon(0); };
  window.setTimeout(again, 0);
}
window.setTimeout(() => o55NierSceneSoon(0), 0);

window.PM_NIER_SCENES = {
  keys: O55_NIER_SCENE_KEYS.slice(),
  label: key => O55_NIER_SCENE_LABEL[key] || '',
  sceneFor: page => o55NierSceneFor(page),
  svg: key => O55_NIER_SCENE_SVG[key] || '',
  current: () => o55NierShown,
  refresh: () => o55NierSceneApply()
};

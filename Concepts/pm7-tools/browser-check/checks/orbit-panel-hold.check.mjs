// FO-104: a reader holds the chat Working card's subject panel. The panel (div.orbit-panel-in, keyed opin:<uid> in
// 5.6 Pro/orbit.js) follows the live subject, and the classic run hands over to the next subject every 2 s; a reader
// scrolling it was sent back to its top at each handover and a key focus on its X was dropped. A reader's own scroll
// (or a Tab into it) now pins it through the node pin. On Home's chat column (both surfaces) and, with --set chat=<a
// 5.6 Pro build>, on the chat's own page, each test restarts the run (PM56_DEMO.startWorking) and waits for a subject
// whose panel overflows with at least a second before the handover, then:
//   wheel     a real wheel over the panel scrolls it and pins it: across three handovers the panel keeps its node, its
//             scrollTop and a focus put in it, while the core label and the live node move on to each new subject; the
//             pin shows (the node's aria-pressed and .open, the core's aria-pressed false and "Follow the live step
//             again"). A wheel back to the top keeps the pin over the next handover. A real click on the core resumes
//             live: the panel shows the live subject and the next handover changes it again.
//   keys      a real Tab from the core moves the focus onto the panel's X and pins it; ArrowDown scrolls the panel; two
//             handovers keep the node, the focus on the X and the scroll.
//   no input  scrollTop set by script, then a clamp (the panel scrolled to its end by script and its last rows taken
//             out, so the browser clamps scrollTop and fires scroll, as a patch that shortens it would) pin nothing,
//             and the next handover changes the subject.
// Fails group 7 c4ba49b137: the first handover replaces the panel (node, scroll and focus lost), and nothing pins.
//   --set chat=<path or URL of a 5.6 Pro build (build.py --out)>   --set only=wheel,keys,none

// In the app's frame: helpers the steps below read through window.__fo104.
function install() {
  const ids = { map: new WeakMap(), n: 0 };
  const id = (e) => { if (!e) return 0; if (!ids.map.has(e)) ids.map.set(e, ++ids.n); return ids.map.get(e); };
  const stage = () => document.querySelector('.working-card:not(.is-done) .orbit-stage.is-open');
  const panel = () => { const s = stage(); return s && s.querySelector('.orbit-panel-in'); };
  const snap = () => {
    const st = stage(); if (!st) return null;
    const p = st.querySelector('.orbit-panel-in'), core = st.querySelector('.orbit-core');
    const open = st.querySelector('.orbit-node[aria-pressed="true"]'), live = st.querySelector('.orbit-node.live');
    /* the hosted chat exposes its live state; the chat's own page has the demo's snapshot */
    const w = window.PM56_APP && window.PM56_APP.state ? window.PM56_APP.state.work : window.PM56_DEMO && window.PM56_DEMO.snapshot ? window.PM56_DEMO.snapshot().work : null, a = document.activeElement;
    return {
      uid: st.getAttribute('data-orbit-focus'), k: p && p.getAttribute('data-k'), node: id(p),
      top: p ? Math.round(p.scrollTop) : 0, over: p ? p.scrollHeight - p.clientHeight : 0,
      pinned: open ? open.getAttribute('data-k') : null, openCls: !!(open && open.classList.contains('open')),
      core: core && core.getAttribute('aria-pressed'), coreTip: core ? (core.getAttribute('data-hover-tip') || '').split('\n')[0] : null,
      coreLabel: ((st.querySelector('[data-k="corelabel"]') || {}).textContent || '').trim(), live: live && live.getAttribute('data-k'),
      clock: w ? (w.clock != null ? w.clock : w.step * 2) : null, running: !!(w && w.running),
      focus: a && p && p.contains(a) ? id(a) : 0, focusKey: a ? (a.getAttribute('data-k') || a.tagName.toLowerCase()) : 'none',
    };
  };
  // a point inside the panel's content (not its scrollbar), the panel in view, and what a press there lands on
  const aim = (sel) => {
    const st = stage(), e = st && (sel ? st.querySelector(sel) : st.querySelector('.orbit-panel-in'));
    if (!e) return null;
    e.scrollIntoView({ block: 'nearest' });
    const r = e.getBoundingClientRect(), x = r.left + Math.min(r.width / 2, (e.clientWidth || r.width) / 2), y = r.top + Math.min(r.height / 2, 90);
    const hit = document.elementFromPoint(x, y);
    return { x, y, ok: !!(hit && (hit === e || e.contains(hit))), hit: hit ? hit.className || hit.tagName : null };
  };
  window.__fo104 = { snap, aim, panel, stage, id };
  return true;
}

let OFF = { x: 0, y: 0 };   // the app frame's content box in the window (T3's sandbox); 0 on a normal page
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);

async function frameOffset(t, f) {
  if (!f.parentFrame()) return { x: 0, y: 0 };
  const fe = await f.frameElement(), b = await fe.boundingBox();
  const inset = await fe.evaluate((el) => { const cs = getComputedStyle(el); return { x: el.clientLeft + parseFloat(cs.paddingLeft), y: el.clientTop + parseFloat(cs.paddingTop) }; });
  return { x: b.x + inset.x, y: b.y + inset.y };
}

// Restart the classic run and wait for a subject whose panel overflows, unpinned, with a second or more before the
// handover (the clock moves in 0.5 s ticks; a handover is every 2 s, so a phase of 0 or 0.5 leaves 1 s or more).
async function freshWindow(t, f, tag) {
  await f.evaluate(() => window.PM56_DEMO.startWorking());
  for (let n = 0; n < 2; n++) {
    const s = await f.evaluate(() => window.__fo104.snap());
    if (!s || !s.pinned) break;
    const core = await f.evaluate(() => window.__fo104.aim('.orbit-core'));
    if (core) await t.page.mouse.click(OFF.x + core.x, OFF.y + core.y);
    await f.waitForTimeout(300);
  }
  await f.waitForFunction(() => { const s = window.__fo104.snap(); return !!s && s.running && !s.pinned && s.over >= 16 && s.clock % 2 <= 0.5; }, null, { timeout: 40000, polling: 50 })
    .catch(() => { throw new Error(`${tag}: no overflowing subject with time left before its handover within 40 s`); });
  return f.evaluate(() => window.__fo104.snap());
}

// A smooth scroll (keys, a wheel) runs over several frames: the baseline is read once scrollTop has held for 200 ms.
async function settled(f) {
  return f.evaluate(async () => {
    const p = window.__fo104.panel(); let last = -1, since = performance.now();
    while (performance.now() - since < 200) { await new Promise((r) => requestAnimationFrame(r)); const now = p && p.isConnected ? p.scrollTop : -2; if (now !== last) { last = now; since = performance.now(); } }
    return window.__fo104.snap();
  });
}

async function nextHandover(f, prev, tag) {
  await f.waitForFunction((p) => { const s = window.__fo104.snap(); return !!s && s.live !== p; }, prev.live, { timeout: 6000, polling: 25 })
    .catch(() => { throw new Error(`${tag}: no handover within 6 s`); });
  await f.waitForTimeout(120);   // the tick's patch has run
  return f.evaluate(() => window.__fo104.snap());
}

// The panel kept across a handover: same node, scroll, subject and pin; the core and the live node moved on.
async function held(t, tag, before, after, { focus } = {}) {
  await t.check(`${tag}: same panel node`, after.node === before.node, `node ${before.node} -> ${after.node}, ${before.k} -> ${after.k}`);
  await t.check(`${tag}: scroll kept`, Math.abs(after.top - before.top) <= 1, `${before.top} -> ${after.top}`);
  await t.check(`${tag}: panel still on its subject`, after.uid === before.uid, `${before.uid} -> ${after.uid}`);
  await t.check(`${tag}: pin shows`, after.pinned === 'node:' + after.uid && after.openCls && after.core === 'false' && after.coreTip === 'Follow the live step again',
    JSON.stringify({ pinned: after.pinned, open: after.openCls, core: after.core, tip: after.coreTip }));
  await t.check(`${tag}: core and live node follow live`, after.live !== before.live && after.coreLabel !== before.coreLabel, `${before.live} "${before.coreLabel}" -> ${after.live} "${after.coreLabel}"`);
  if (focus) await t.check(`${tag}: focus kept`, after.focus === before.focus && after.focus > 0, `${before.focus} (${before.focusKey}) -> ${after.focus} (${after.focusKey})`);
}

async function wheelCase(t, f, where) {
  const tag = `${where} wheel`;
  let s0 = await freshWindow(t, f, tag);
  const a = await f.evaluate(() => window.__fo104.aim());
  await t.check(`${tag}: the pointer lands in the panel`, !!(a && a.ok), JSON.stringify(a), { hard: true });
  await t.page.mouse.move(OFF.x + a.x, OFF.y + a.y);
  await t.page.mouse.wheel(0, 48);
  await f.waitForFunction(() => { const s = window.__fo104.snap(); return !!s && s.top > 0; }, null, { timeout: 1000, polling: 25 }).catch(() => {});
  let s = await settled(f);
  await t.check(`${tag}: a real wheel scrolls the panel and pins it, before any handover`, s.top > 0 && s.pinned === 'node:' + s0.uid && s.node === s0.node && s.uid === s0.uid,
    JSON.stringify({ top: s.top, pinned: s.pinned, uid: s.uid, was: s0.uid, node: [s0.node, s.node] }));   // soft: a build without the pin goes on to show what the handover does
  await f.evaluate(() => { const x = window.__fo104.panel().querySelector('.orbit-close'); if (x) x.focus({ preventScroll: true }); });
  s = await settled(f);
  for (let h = 1; h <= 3; h++) { const n = await nextHandover(f, s, tag); await held(t, `${tag} handover ${h}`, s, n, { focus: true }); s = n; }
  // back to the top: the pin stays
  await t.page.mouse.move(OFF.x + a.x, OFF.y + a.y);
  await t.page.mouse.wheel(0, -400);
  await f.waitForFunction(() => { const s = window.__fo104.snap(); return !!s && s.top === 0; }, null, { timeout: 1500, polling: 25 }).catch(() => {});
  s = await settled(f);
  await t.check(`${tag}: a wheel back to the top`, s.top === 0, String(s.top));
  const n = await nextHandover(f, s, tag);
  await held(t, `${tag} at the top, handover`, s, n);
  // the core resumes live
  const core = await f.evaluate(() => window.__fo104.aim('.orbit-core'));
  await t.page.mouse.click(OFF.x + core.x, OFF.y + core.y);
  await f.waitForFunction(() => { const s = window.__fo104.snap(); return !!s && !s.pinned && s.core === 'true'; }, null, { timeout: 2000, polling: 25 }).catch(() => {});
  s = await f.evaluate(() => window.__fo104.snap());
  await t.check(`${tag}: the core click follows live again`, !s.pinned && s.core === 'true' && s.live === 'node:' + s.uid && s.coreTip === 'Following the live step',
    JSON.stringify({ pinned: s.pinned, core: s.core, uid: s.uid, live: s.live, tip: s.coreTip }));
  const m = await nextHandover(f, s, tag);
  await t.check(`${tag}: after the core click the next handover changes the subject`, m.uid !== s.uid && m.live === 'node:' + m.uid && !m.pinned, `${s.uid} -> ${m.uid}`);
}

async function keysCase(t, f, where) {
  const tag = `${where} keys`;
  const s0 = await freshWindow(t, f, tag);
  await f.evaluate(() => window.__fo104.stage().querySelector('.orbit-core').focus({ preventScroll: true }));
  await t.page.keyboard.press('Tab');
  await f.waitForFunction(() => { const s = window.__fo104.snap(); return !!s && !!s.pinned; }, null, { timeout: 400, polling: 25 }).catch(() => {});
  let s = await f.evaluate(() => window.__fo104.snap());
  await t.check(`${tag}: a real Tab from the core puts the focus in the panel and pins it`, s.focus > 0 && s.pinned === 'node:' + s0.uid && s.node === s0.node,
    JSON.stringify({ focus: s.focusKey, pinned: s.pinned, uid: s.uid, was: s0.uid }));
  for (let i = 0; i < 3; i++) await t.page.keyboard.press('ArrowDown');
  await f.waitForFunction(() => { const s = window.__fo104.snap(); return !!s && s.top > 0; }, null, { timeout: 1500, polling: 25 }).catch(() => {});
  s = await settled(f);
  await t.check(`${tag}: ArrowDown scrolls the panel`, s.top > 0, String(s.top));
  for (let h = 1; h <= 2; h++) { const n = await nextHandover(f, s, tag); await held(t, `${tag} handover ${h}`, s, n, { focus: true }); s = n; }
  const core = await f.evaluate(() => window.__fo104.aim('.orbit-core'));
  await t.page.mouse.click(OFF.x + core.x, OFF.y + core.y);
  await f.waitForTimeout(300);
}

async function noInputCase(t, f, where) {
  const tag = `${where} no input`;
  const s0 = await freshWindow(t, f, tag);
  await f.waitForTimeout(800);   // 700 ms past any earlier real input
  const r = await f.evaluate(async () => {
    const p = window.__fo104.panel(), fr = () => new Promise((res) => requestAnimationFrame(() => res()));
    let scrolls = 0; const on = () => { scrolls++; }; p.addEventListener('scroll', on);
    p.scrollTop = 12; await fr(); await fr();
    const set = { top: p.scrollTop, pinned: !!window.__fo104.snap().pinned };
    p.scrollTop = p.scrollHeight; await fr();
    const end = p.scrollTop;
    [...p.querySelectorAll('.wa-row')].slice(-2).forEach((row) => { row.style.display = 'none'; });
    void p.scrollHeight; await fr(); await fr(); await fr();
    const clamp = { from: end, to: p.scrollTop, pinned: !!window.__fo104.snap().pinned };
    p.removeEventListener('scroll', on);
    return { set, clamp, scrolls };
  });
  await t.check(`${tag}: scrollTop set by script scrolls but does not pin`, r.set.top > 0 && !r.set.pinned, JSON.stringify(r.set));
  await t.check(`${tag}: a clamp (rows taken out under a scrolled panel) does not pin`, r.clamp.to < r.clamp.from && !r.clamp.pinned && r.scrolls >= 2, JSON.stringify(r));
  const s = await f.evaluate(() => window.__fo104.snap());
  await t.check(`${tag}: still following live`, !s.pinned && s.core === 'true' && s.uid === s0.uid, JSON.stringify({ pinned: s.pinned, core: s.core, uid: s.uid }));
  const n = await nextHandover(f, s, tag);
  await t.check(`${tag}: the next handover changes the subject`, n.uid !== s.uid && !n.pinned, `${s.uid} -> ${n.uid}`);
}

async function run(t, f, where) {
  await f.evaluate(install);
  OFF = await frameOffset(t, f);
  const s = await f.evaluate(() => window.__fo104.snap());
  await t.check(`${where}: a live Working card with the Orbit panel`, !!s, JSON.stringify(s), { hard: true });
  const only = list(t.args.only, ['wheel', 'keys', 'none']);
  if (only.includes('wheel')) await wheelCase(t, f, where);
  if (only.includes('keys')) await keysCase(t, f, where);
  if (only.includes('none')) await noInputCase(t, f, where);
}

async function home(t, surface) {
  if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
  await t.viewport(1920, 1080);
  const f = await t.app.open({ sandbox: surface === 'sandbox' });
  await f.waitForFunction(() => !!(window.PM56_DEMO && window.PM56_APP && document.querySelector('.working-card .orbit-stage')), null, { timeout: 40000 });
  await run(t, f, `Home ${surface}`);
}

async function chatPage(t, surface) {
  if (!t.args.chat) { t.log('skipped: --set chat=<a 5.6 Pro build> runs the chat\'s own page'); return; }
  if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
  const src = String(t.args.chat), u = (/^[a-z][a-z0-9+.-]+:/i.test(src) ? src : 'file://' + src) + (src.includes('?') ? '&' : '?') + 'cb=' + Date.now();
  await t.viewport(1920, 1080);
  if (surface === 'sandbox') await t.openInSandbox(u, { settleMs: 300 }); else await t.goto(u, { settleMs: 300 });
  const f = t.root === t.page ? t.page.mainFrame() : t.root;
  await f.waitForFunction(() => !!(window.__PM56_BOOT_OK && window.PM56_DEMO && document.querySelector('.working-card .orbit-stage')), null, { timeout: 40000 });
  await run(t, f, `chat page ${surface}`);
}

export const tests = {
	async 'Home chat column, normal page'(t) { await home(t, 'normal'); },
	async 'Home chat column, sandbox'(t) { await home(t, 'sandbox'); },
	async 'chat page, normal page'(t) { await chatPage(t, 'normal'); },
	async 'chat page, sandbox'(t) { await chatPage(t, 'sandbox'); },
};

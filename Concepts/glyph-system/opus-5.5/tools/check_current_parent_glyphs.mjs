// Test-only N1–N4 adapter. Product sources, frozen driver, and artifact bytes are never written.
// Recording uses only the installed agent-browser helper and its normal global admission.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const arg = (name, fallback = null) => { const i = argv.indexOf(name); return i < 0 ? fallback : argv[i + 1]; };
const mode = arg('--mode', 'admission');
const pagePath = resolve(arg('--page'));
const driverPath = resolve(arg('--driver'));
const out = resolve(arg('--out'));
const candidateHead = arg('--candidate-head');
const worktreeHead = arg('--worktree-head', candidateHead);
const sha = (data) => createHash('sha256').update(data).digest('hex');
const pageSha = sha(readFileSync(pagePath));
if (pageSha !== arg('--page-sha256')) throw new Error('HOLD: current page hash does not match the bound artifact');
const driver = readFileSync(driverPath, 'utf8');
if (sha(driver) !== '2d2ed65deadf51b2d4ff1e53551cc37b9b77c85100319f14c9b0a56100180041') {
  throw new Error('HOLD: frozen pill_check.mjs bytes changed');
}
const scanStart = driver.indexOf('function scanScopes(R) {');
const scanEnd = driver.indexOf('\n}\n', scanStart) + 2;
if (scanStart < 0 || scanEnd < scanStart) throw new Error('HOLD: cannot locate the original self-contained collector');
const collectorSource = driver.slice(scanStart, scanEnd);
const collector = Function('return (' + collectorSource + ')')();
if (collector.toString() !== collectorSource) throw new Error('HOLD: collector serialization changed');
const oldScope = "el.closest('#o55-resume,.o55-demo')";
const newScope = "el.closest('#o55-resume,.o55-demo,#o55-tourchip')";
const oldRoots = "['#o55-resume', '.o55-demo']";
const newRoots = "['#o55-resume', '.o55-demo', '#o55-tourchip']";
for (const site of [oldScope, oldRoots]) {
  if (collectorSource.split(site).length !== 2) throw new Error('HOLD: supplementary collector site is not unique');
}
const companionSource = collectorSource.replace(oldScope, newScope).replace(oldRoots, newRoots);
const inverseSource = companionSource.replace(newScope, oldScope).replace(newRoots, oldRoots);
if (inverseSource !== collectorSource) throw new Error('HOLD: supplementary collector changes more than its two authorized selector sites');
const companion = Function('return (' + companionSource + ')')();
if (companion.toString() !== companionSource) throw new Error('HOLD: supplementary collector serialization changed');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'helper-source.mjs'), readFileSync(new URL(import.meta.url)));
writeFileSync(join(out, 'collector-original.js'), collectorSource);
writeFileSync(join(out, 'collector-tourchip.js'), companionSource);
const result = {
  schema_version: 1, mode, started_utc: new Date().toISOString(), status: 'RUNNING',
  candidate_source_head: candidateHead, worktree_head_at_run: worktreeHead,
  page_sha256: pageSha, page_bytes: readFileSync(pagePath).length,
  helper_sha256: sha(readFileSync(new URL(import.meta.url))),
  frozen_driver_sha256: sha(driver), collector_sha256: sha(collectorSource),
  collector_bytes: Buffer.byteLength(collectorSource), collector_verbatim: true,
  collector_scope_gap: '#o55-tourchip is absent from the frozen scopeOf and rootsFor selectors; eligibility is unchanged.',
  supplementary_collector: { label: 'supplementary floaters/tourchip', sha256: sha(companionSource),
    inverse_projection_sha256: sha(inverseSource), inverse_byte_equal_original: true,
    exact_two_sites: [{ original: oldScope, supplementary: newScope }, { original: oldRoots, supplementary: newRoots }] },
  errors: [], actions: [], cases: [],
  sampling_limitations: 'Functional sampling only. Hardware video is not frame-perfect and this is not exclusive FPS/performance certification.',
};
const save = () => writeFileSync(join(out, 'result.json'), JSON.stringify(result, null, 2) + '\n');
function command(args) {
  const r = spawnSync('agent-browser', args, { encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
  const record = { argv: ['agent-browser', ...args], exit_code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error?.message || null };
  result.helper_commands ||= []; result.helper_commands.push(record); save();
  if (r.status !== 0 || r.error) throw new Error('HOLD: normal helper failed: ' + JSON.stringify(record));
  return JSON.parse(r.stdout);
}
let session = null, browser = null;
function stopOwned() {
  if (!session) return;
  const id = session.id;
  result.stop_receipt = command(['stop', id]);
  session = null;
  save();
}
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(signal, () => {
  result.status = 'HOLD'; result.errors.push('Interrupted: ' + signal); save();
  try { stopOwned(); } catch (e) { result.errors.push(String(e)); save(); }
  process.exit(130);
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function setLook(page, look, reduced = false) {
  const [family, themeMode] = look.split('-');
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await page.evaluate(([f, m]) => {
    const cap = (s) => s[0].toUpperCase() + s.slice(1);
    window.PM12_KIMI.setSettingFromHost('general.visual.theme', cap(f === 'nier' ? 'basic' : f) + ' ' + cap(m));
    window.PM_NIER.set(f === 'nier');
  }, [family, themeMode]);
  await page.waitForFunction(([f, m]) => document.documentElement.dataset.theme === (f === 'nier' ? 'basic' : f) + '-' + m &&
    (document.documentElement.getAttribute('data-o55-nier') === 'on') === (f === 'nier'), [family, themeMode], { timeout: 10000 });
  await sleep(family === 'nier' ? 2000 : 800);
  return page.evaluate(() => ({ theme: document.documentElement.dataset.theme, nier: document.documentElement.getAttribute('data-o55-nier'),
    reduced_media: matchMedia('(prefers-reduced-motion: reduce)').matches, motion: document.documentElement.getAttribute('data-motion') }));
}
async function admission(page) {
  result.environment = await page.evaluate(() => {
    const g = document.createElement('canvas').getContext('webgl');
    const x = g?.getExtension('WEBGL_debug_renderer_info');
    const renderer = x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'none';
    g?.getExtension('WEBGL_lose_context')?.loseContext();
    return { renderer, viewport: { width: innerWidth, height: innerHeight }, DPR: devicePixelRatio, user_agent: navigator.userAgent };
  });
  if (!/Quadro P1000/.test(result.environment.renderer) || /SwiftShader|llvmpipe/i.test(result.environment.renderer)) {
    throw new Error('HOLD: hardware renderer unavailable: ' + result.environment.renderer);
  }
  if (result.environment.viewport.width !== 1920 || result.environment.viewport.height !== 1080 || result.environment.DPR !== 1) {
    throw new Error('HOLD: unexpected normal recording viewport/DPR: ' + JSON.stringify(result.environment));
  }
  await page.goto(pathToFileURL(pagePath).href + '?o55=off', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.PM12_KIMI && window.PM7_SETTINGS_TOME && window.PM7_USAGE && window.O55 && window.PMH && window.toast,
    null, { timeout: 120000 });
  await setLook(page, 'glass-dark');
  await page.screenshot({ path: join(out, 'admission-glass-dark.png') });
  result.visible_state = await page.evaluate(() => ({
    pages: [...document.querySelectorAll('[data-page]')].slice(0, 20).map((e) => ({ tag: e.tagName, page: e.dataset.page, text: e.textContent.trim().slice(0, 70), role: e.getAttribute('role'), tabIndex: e.tabIndex })),
    toast_methods: Object.keys(window.toast),
    floater_glyphs: [...document.querySelectorAll('#o55-resume svg.nx,#o55-tourchip svg.nx,.o55-demopill svg.nx')].map((e) => ({ host: e.closest('[id]')?.id, glyph: e.dataset.nx })),
  }));
  await page.evaluate(() => window.PM_PAGES.go('usage'));
  await sleep(3000);
  result.bridge_targets = await page.evaluate(() => [...document.querySelectorAll('[data-pmh-kind]')].flatMap((e) => {
    const gs = [...e.querySelectorAll(':scope > svg.nx:not(.nx-self), :scope > :not(button,summary,[role="button"],[data-action]) > svg.nx:not(.nx-self)')];
    const r = e.getBoundingClientRect();
    if (!gs.length || r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight) return [];
    return [{ tag: e.tagName, cls: e.className, widget: e.dataset.widget, pmh_kind: e.dataset.pmhKind,
      rect: { x: r.x, y: r.y, w: r.width, h: r.height }, glyphs: gs.map((g) => ({ name: g.dataset.nx, classes: g.getAttribute('class') })),
      menu_buttons: [...e.querySelectorAll('button')].map((b) => ({ text: b.textContent.trim().slice(0, 40), label: b.getAttribute('aria-label'), action: b.dataset.action })) }];
  }));
  await page.screenshot({ path: join(out, 'admission-usage-targets.png') });
  await sleep(1500);
}
async function n1(page) {
  const pointer = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.pmu-card')];
    const card = cards.find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 100 && r.height > 100 && r.top > 100 && r.bottom < innerHeight && e.querySelector('svg.nx');
    });
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, widget: card.dataset.widget };
  });
  if (!pointer) throw new Error('HOLD: no visible glyph-bearing Usage card for exact N1 target discovery');
  await page.evaluate(() => {
    window.__pmgTrustedInput = [];
    for (const type of ['pointermove', 'pointerdown', 'pointerup', 'click', 'keydown']) {
      document.addEventListener(type, (e) => window.__pmgTrustedInput.push({ type, trusted: e.isTrusted,
        at: performance.now(), utc_ms: Date.now(), x: e.clientX ?? null, y: e.clientY ?? null, key: e.key ?? null }), { capture: true, passive: true });
    }
  });
  await page.mouse.move(5, 5);
  await page.mouse.move(pointer.x, pointer.y);
  await sleep(1300);
  const discovery = await page.evaluate(() => {
    const visible = (e) => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && cs.display !== 'none' && cs.visibility !== 'hidden';
    };
    const hosts = [...document.querySelectorAll('[data-pmh-kind]')].filter(visible);
    const gs = (e) => [...e.querySelectorAll(':scope > svg.nx:not(.nx-self), :scope > :not(button,summary,[role="button"],[data-action]) > svg.nx:not(.nx-self)')];
    return {
      eligible_hosts: hosts.filter((e) => gs(e).length).map((e) => ({ id: e.id, cls: e.className, widget: e.dataset.widget, glyphs: gs(e).map((g) => g.dataset.nx) })),
      visible_enrolled_host_count: hosts.length,
      enrolled_hosts_with_deeper_glyphs: hosts.filter((e) => e.querySelector('svg.nx')).map((e) => ({ id: e.id, cls: e.className, widget: e.dataset.widget,
        glyphs: [...e.querySelectorAll('svg.nx')].map((g) => {
          let depth = 0, n = g; while (n && n !== e) { depth++; n = n.parentElement; }
          const cs = getComputedStyle(g);
          return { glyph: g.dataset.nx, depth, classes: g.getAttribute('class'), parent: g.parentElement.tagName,
            own_button_host: !!g.closest('button,summary,[role="button"],[data-action]'), halo_alpha: cs.getPropertyValue('--nx-hi-a'), ink: cs.stroke };
        }) })),
      PMH_state: window.PMH.state(), input: window.__pmgTrustedInput,
      root_transition: document.documentElement.getAttribute('data-pm-page-transition'),
      moments: [...document.querySelectorAll('[data-pmu-moment]')].map((e) => ({ id: e.id, value: e.getAttribute('data-pmu-moment') })),
    };
  });
  result.N1_discovery = { look: 'glass-dark', reduced: false, pointer, ...discovery };
  await page.screenshot({ path: join(out, 'n1-trusted-pointer-exact-bridge-targets.png') });
  if (!discovery.eligible_hosts.length) {
    result.cases.push({ id: 'N1-target-discovery', status: 'UNVERIFIED', reason: 'No visible enrolled PMH target has an svg.nx at the exact bridge child/grandchild selector depth. Deeper glyphs are recorded without expanding the bridge or changing geometry.',
      remaining: 'All N1 a–c look/motion cases require an eligible source-specified target; no card glyph ignite acceptance claimed.' });
    result.status = 'UNVERIFIED';
    return;
  }
  throw new Error('HOLD: eligible N1 targets discovered; full interaction adapter not yet implemented');
}
const TEN_LOOKS = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light'];
const TOAST_KINDS = ['info', 'warn', 'error', 'success'];
function contrastMethod() {
  // Reuse the source owner's accepted field measurement, not the old campaign or its state setup.
  const text = readFileSync(resolve(arg('--contrast-source')), 'utf8');
  const marker = 'const MEASURE = ';
  const start = text.indexOf(marker);
  const end = text.indexOf('\n};\n', start) + 2;
  if (start < 0 || end < start) throw new Error('HOLD: cannot locate source-owner contrast function');
  const original = text.slice(start + marker.length, end);
  const measure = Function('return (' + original + ')')();
  if (measure.toString() !== original) throw new Error('HOLD: source contrast function serialization changed');
  result.contrast_method = { source_sha256: sha(text), function_sha256: sha(original), verbatim: true,
    method: 'Effective computed glyph ink/opacity over median and 10th/90th-percentile actual behind-field pixels from a screenshot with glyphs hidden; rendered foreground screenshot and hardware frames support this measurement.' };
  writeFileSync(join(out, 'contrast-method.js'), original);
  return measure;
}
async function glyphMetadata(page, selector) {
  return page.evaluate((sel) => [...document.querySelectorAll(sel)].flatMap((svg, i) => {
    const r = svg.getBoundingClientRect();
    let op = 1;
    for (let n = svg; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n); op *= Number(cs.opacity);
      if (cs.visibility === 'hidden' || cs.display === 'none') op = 0;
    }
    if (op < 0.05 || !r.width || r.bottom <= 0 || r.top >= innerHeight) return [];
    const cs = getComputedStyle(svg), button = svg.closest('button'), card = svg.closest('.n-card,#o55-resume,#o55-tourchip,.o55-demopill');
    const br = button?.getBoundingClientRect(), cr = card?.getBoundingClientRect(), cc = card && getComputedStyle(card);
    const clips = [];
    for (let p = svg.parentElement; p && p !== document.body; p = p.parentElement) {
      const pc = getComputedStyle(p);
      if (/(hidden|clip|auto|scroll)/.test(pc.overflowX + pc.overflowY)) {
        const pr = p.getBoundingClientRect();
        clips.push({ tag: p.tagName, id: p.id, cls: p.className, overflow: [pc.overflowX, pc.overflowY], radius: pc.borderRadius,
          rect: { x: pr.x, y: pr.y, w: pr.width, h: pr.height } });
      }
    }
    return [{ index: i, x: r.x, y: r.y, w: r.width, h: r.height, ink: cs.stroke, op,
      glyph: svg.dataset.nx, key: svg.closest('.nx-st')?.dataset.k || svg.dataset.nx,
      where: svg.closest('#rsStage,#rsStack,#o55-resume,#o55-tourchip,.o55-demo')?.id,
      halo_alpha: cs.getPropertyValue('--nx-hi-a'), halo_width: cs.getPropertyValue('--nx-hi-w'),
      button: br && { x: br.x, y: br.y, w: br.width, h: br.height },
      card: cr && { x: cr.x, y: cr.y, w: cr.width, h: cr.height, radius: cc.borderRadius }, clips }];
  }), selector);
}
async function measureGlyphs(page, measure, id, selector, fields = {}) {
  const began = await page.evaluate(() => ({ utc_ms: Date.now(), at: performance.now() }));
  const rects = await glyphMetadata(page, selector);
  if (!rects.length) throw new Error('UNVERIFIED: required visible glyph state missing: ' + id);
  const foreground = await page.screenshot({ path: join(out, id + '--foreground.png') });
  await page.evaluate((sel) => {
    window.__pmgHidden = [...new Set([...document.querySelectorAll(sel)].map((e) => e.closest('.nx-st') || e))]
      .map((e) => ({ e, value: e.style.getPropertyValue('opacity'), priority: e.style.getPropertyPriority('opacity') }));
    for (const r of window.__pmgHidden) r.e.style.setProperty('opacity', '0', 'important');
  }, selector);
  let behind;
  try { behind = await page.screenshot({ path: join(out, id + '--behind.png') }); }
  finally {
    await page.evaluate(() => {
      for (const r of window.__pmgHidden || []) {
        if (r.value) r.e.style.setProperty('opacity', r.value, r.priority); else r.e.style.removeProperty('opacity');
      }
      delete window.__pmgHidden;
    });
  }
  const after = await glyphMetadata(page, selector);
  const measured = await page.evaluate(measure, [behind.toString('base64'), rects]);
  const peak = await page.evaluate(async ([fg, bg, rows]) => {
    const load = async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode();
      const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(i, 0, 0); return { g, w: c.width, h: c.height }; };
    const a = await load(fg), b = await load(bg), scale = a.w / innerWidth;
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lum = (r, g, bb) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(bb);
    return rows.map((r) => {
      const x = Math.max(0, Math.floor(r.x * scale)), y = Math.max(0, Math.floor(r.y * scale));
      const w = Math.min(a.w - x, Math.ceil(r.w * scale)), h = Math.min(a.h - y, Math.ceil(r.h * scale));
      const p = a.g.getImageData(x, y, w, h).data, q = b.g.getImageData(x, y, w, h).data;
      const ratios = [], samples = [];
      for (let i = 0; i < p.length; i += 4) {
        const d = Math.max(...[0, 1, 2].map((j) => Math.abs(p[i + j] - q[i + j])));
        if (d < 4) continue;
        const l1 = lum(p[i], p[i + 1], p[i + 2]), l2 = lum(q[i], q[i + 1], q[i + 2]);
        const ratio = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
        ratios.push(ratio); samples.push({ delta: d, ratio, fg: [p[i], p[i + 1], p[i + 2]], behind: [q[i], q[i + 1], q[i + 2]] });
      }
      ratios.sort((x2, y2) => x2 - y2); samples.sort((x2, y2) => y2.delta - x2.delta);
      return { glyph: r.glyph, changed_pixels: ratios.length, observed_pixel_max_contrast: ratios.at(-1) ?? null,
        observed_pixel_p90_contrast: ratios[Math.floor(ratios.length * .9)] ?? null,
        five_largest_delta_samples: samples.slice(0, 5), note: 'Foreground pairs include antialiasing and halos; observed peak supports, and does not replace, the source-owner effective-core contrast gate.' };
    });
  }, [foreground.toString('base64'), behind.toString('base64'), rects]);
  const sameRects = rects.length === after.length && rects.every((r, i) => ['x', 'y', 'w', 'h'].every((k) => Math.abs(r[k] - after[i][k]) < 0.1));
  const gate = measured.every((r) => r.ratio >= 3 && r.worst >= 3);
  const support = peak.every((r) => r.observed_pixel_max_contrast >= 3);
  const row = { id, ...fields, began, ended: await page.evaluate(() => ({ utc_ms: Date.now(), at: performance.now() })),
    actual_glyphs: rects, hidden_without_layout_shift: sameRects, measured, foreground_pixel_support: peak,
    contrast_status: !sameRects ? 'UNVERIFIED' : !gate ? 'HOLD' : !support ? 'UNVERIFIED' : 'MEASURED',
    visual_status: 'PENDING_FRAME_REVIEW' };
  result.cases.push(row); save();
  console.log(JSON.stringify({ id, contrast_status: row.contrast_status, glyphs: measured.map((r) => ({ key: r.key, ratio: r.ratio, worst: r.worst })) }));
  return row;
}
async function collectPills(page, id, fields) {
  const original = await page.evaluate(collector, { scopes: ['shell', 'floaters'] });
  const supplementary = await page.evaluate(companion, { scopes: ['floaters'] });
  const row = { id, ...fields, original_gate: { label: 'original shell,floaters', ...original },
    supplementary_gate: { label: 'supplementary floaters/tourchip', ...supplementary },
    original_coverage_limitation_retained: true,
    status: original.findings.length || supplementary.findings.length ? 'HOLD' : 'PASS' };
  result.cases.push(row); save(); return row;
}
async function n2(page) {
  const measure = contrastMethod();
  await page.evaluate(() => window.PM_PAGES.go('dashboard'));
  await sleep(700);
  let hold = false;
  for (const look of ['friendly-light', 'friendly-dark', 'glass-light', 'glass-dark']) {
    const state = await setLook(page, look);
    await page.mouse.move(5, 1050);
    await page.evaluate(() => { window.toast.clear(); window.toast.collapse(); });
    await sleep(1000);
    const bell = await measureGlyphs(page, measure, 'N2-' + look + '-empty-bell', '#rsStack .rs-empty-bell', { requirement: 'N2', look, state, phase: 'empty-bell' });
    if (bell.contrast_status !== 'MEASURED') { hold = true; break; }
    for (const severity of TOAST_KINDS) {
      for (const pose of ['rest', 'hover']) {
        await page.evaluate((sev) => window.toast.push({ title: 'Current-base ' + sev, body: 'Glyph contrast and corner check.', severity: sev, important: false }), severity);
        await sleep(300);
        if (pose === 'hover') { await page.locator('#rsStage .n-x').last().hover(); await sleep(200); }
        const row = await measureGlyphs(page, measure, 'N2-' + look + '-stage-' + severity + '-' + pose,
          '#rsStage .n-card:last-child svg.nx', { requirement: 'N2', look, state, phase: 'stage', severity, pose });
        await sleep(2300);
        await page.mouse.move(5, 1050);
        if (row.contrast_status !== 'MEASURED') { hold = true; break; }
      }
      if (hold) break;
      await page.evaluate((sev) => window.toast.important({ title: 'Current-base ' + sev, body: 'Glyph contrast and corner check.', severity: sev }, { skipStage: true }), severity);
      await sleep(600);
      for (const pose of ['rest', 'hover']) {
        if (pose === 'hover') { await page.locator('#rsClip .n-card').first().locator('.n-x').hover(); await sleep(250); }
        const row = await measureGlyphs(page, measure, 'N2-' + look + '-stack-' + severity + '-' + pose,
          '#rsClip .n-card:first-child svg.nx', { requirement: 'N2', look, state, phase: 'stack-front', severity, pose });
        if (row.contrast_status !== 'MEASURED') { hold = true; break; }
      }
      await page.mouse.move(5, 1050);
      if (hold) break;
    }
    if (hold) break;
  }
  result.N2_contrast = hold ? 'HOLD_OR_UNVERIFIED; remaining contrast cases stopped for owner' : 'MEASURED_PENDING_FRAME_REVIEW';
  result.status = hold ? 'HOLD' : 'MEASURED_PENDING_FRAME_REVIEW';
}
try {
  result.global_helper_sessions_before = command(['list']);
  session = command(['start', '--record', join(out, mode + '.mp4'), '--codec', 'h264']);
  result.admitted_session = session; save();
  const spec = arg('--playwright-module', 'playwright-core');
  const { chromium } = await import(spec.startsWith('/') ? pathToFileURL(spec).href : spec);
  browser = await chromium.connectOverCDP(session.cdp_endpoint);
  const pages = browser.contexts()[0].pages().filter((p) => !session.recorder_url || !p.url().startsWith(session.recorder_url));
  if (pages.length !== 1) throw new Error('HOLD: expected exactly one admitted page');
  const page = pages[0];
  page.on('pageerror', (error) => { result.errors.push({ kind: 'pageerror', message: error.message }); save(); });
  page.on('console', (message) => { if (message.type() === 'error') { result.errors.push({ kind: 'console', message: message.text() }); save(); } });
  await admission(page);
  if (mode === 'admission') result.status = 'ADMISSION_VERIFIED';
  else if (mode === 'n1') await n1(page);
  else if (mode === 'n2') await n2(page);
  else throw new Error('HOLD: case mode not implemented: ' + mode);
} catch (error) {
  result.status = 'HOLD'; result.errors.push({ kind: 'harness', message: String(error), stack: error.stack }); process.exitCode = 2;
} finally {
  if (browser) { try { await browser.close(); } catch (error) { result.errors.push({ kind: 'disconnect', message: String(error) }); } }
  try { stopOwned(); } catch (error) { result.status = 'HOLD'; result.errors.push({ kind: 'stop', message: String(error) }); process.exitCode = 2; }
  result.finished_utc = new Date().toISOString(); save();
  console.log(JSON.stringify({ mode, status: result.status, errors: result.errors, environment: result.environment, cases: result.cases.length }));
}

/* Installed before any page code. No DOM nodes/properties are excluded from style capture. */
export function normalizeBlobValue(value, identities) {
  if (typeof value !== 'string' || !value.includes('blob:')) return value;
  let quote = null, escaped = false, end = 0;
  const scan = text => { for (const char of text) {
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (quote) { if (char === quote) quote = null; }
    else if (char === '"' || char === "'") quote = char;
  } };
  return value.replace(/url\(\s*(?:"(blob:[^"]+)"|'(blob:[^']+)'|(blob:[^)\s]+))\s*\)/g, (match, double, single, bare, offset) => {
    scan(value.slice(end, offset)); end = offset + match.length;
    if (quote) { scan(match); return match; }
    const url = double || single || bare, cut = url.indexOf('#'), base = cut < 0 ? url : url.slice(0, cut), fragment = cut < 0 ? '' : url.slice(cut);
    if (!identities[base]) throw Error('Untracked Blob URL in computed style: ' + base);
    return match.replace(url, identities[base] + fragment);
  });
}
export function installParityRuntime(config, normalizeBlobValue) {
  const nativeFrame = requestAnimationFrame.bind(window);
  const realDate = Date, epoch = config.epoch;
  let now = 0, nextId = 0, seed = config.seed >>> 0;
  const tasks = new Map(), frames = new Map();
  const nativeCreateObjectURL = URL.createObjectURL.bind(URL), blobs = new Map(), blobHashes = {};
  URL.createObjectURL = blob => { const url = nativeCreateObjectURL(blob); blobs.set(url, blob); return url; };
  function FixedDate(...args) {
    if (!new.target) return new realDate(epoch + now).toString();
    return args.length ? new realDate(...args) : new realDate(epoch + now);
  }
  FixedDate.prototype = realDate.prototype; Object.setPrototypeOf(FixedDate, realDate);
  FixedDate.now = () => epoch + now; window.Date = FixedDate;
  Object.defineProperty(performance, 'now', { value: () => now });
  Object.defineProperty(performance, 'timeOrigin', { value: epoch });
  // Product frame/hover helpers read these clocks as well as performance.now().
  Object.defineProperty(document.timeline, 'currentTime', { get: () => now });
  Object.defineProperty(Event.prototype, 'timeStamp', { get: () => now });
  Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const enqueue = (fn, delay, args, interval = 0, frame = false) => {
    const id = ++nextId;
    tasks.set(id, { fn, args, interval, frame, at: now + Math.max(1, Number(delay) || 0) }); return id;
  };
  window.setTimeout = (fn, delay, ...args) => enqueue(fn, delay, args);
  window.setInterval = (fn, delay, ...args) => enqueue(fn, delay, args, Math.max(1, Number(delay) || 0));
  window.clearTimeout = window.clearInterval = id => tasks.delete(id);
  window.requestAnimationFrame = fn => { const id = ++nextId; frames.set(id, fn); return id; };
  window.cancelAnimationFrame = id => frames.delete(id);
  window.requestIdleCallback = (fn, opts) => enqueue(() => fn({ didTimeout: false, timeRemaining: () => 0 }), opts?.timeout || 50, []);
  window.cancelIdleCallback = id => tasks.delete(id);
  let demo;
  Object.defineProperty(window, 'PM_DEMO', {
    configurable: true, get: () => demo,
    set(v) { demo = v; if (v && !v._shim && v.clock?.pause) v.clock.pause(); }
  });
  localStorage.clear(); sessionStorage.clear();
  for (const [key, value] of Object.entries(config.storage)) localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  const sha = async value => {
    const bytes = await crypto.subtle.digest('SHA-256', typeof value === 'string' ? new TextEncoder().encode(value) : value);
    return Array.from(new Uint8Array(bytes), v => v.toString(16).padStart(2, '0')).join('');
  };
  async function blobIdentities() {
    for (const [url, blob] of blobs) if (!blobHashes[url]) {
      if (typeof blob.arrayBuffer !== 'function') throw Error('Cannot identify non-Blob object URL: ' + url);
      blobHashes[url] = `blob:pm7-sha256:${await sha(await blob.arrayBuffer())};type=${encodeURIComponent(blob.type || '')}`;
    }
    return { ...blobHashes };
  }
  const barrier = () => new Promise(resolve => nativeFrame(() => nativeFrame(resolve)));
  async function tick(delta) {
    const end = now + delta;
    let count = 0;
    for (;;) {
      let first = null, id = null;
      for (const [k, t] of tasks) if (t.at <= end && (!first || t.at < first.at || (t.at === first.at && k < id))) { id = k; first = t; }
      if (!first) break;
      if (++count > 100_000) throw Error('Deterministic timer budget exhausted');
      now = first.at;
      if (first.interval) first.at += first.interval; else tasks.delete(id);
      if (typeof first.fn === 'function') first.fn.apply(window, first.frame ? [now] : first.args);
      else (0, eval)(String(first.fn));
      await Promise.resolve();
    }
    now = end;
    // A frozen visual clock paints one rAF generation per explicit advance. Catching up hundreds of
    // decorative frames would both defeat reduced motion and make a large-page warmup unbounded.
    const pendingFrames = [...frames.values()]; frames.clear();
    for (const fn of pendingFrames) { fn.call(window, now); await Promise.resolve(); }
    await barrier();
  }
  async function settle(delta = 400) {
    await tick(delta);
    for (let n = 0; n < 3; n++) {
      for (const a of document.getAnimations()) {
        const t = a.effect?.getComputedTiming();
        if (t && Number.isFinite(t.endTime)) { try { a.finish(); } catch {} }
        else { try { a.pause(); a.currentTime = 0; } catch {} }
      }
      for (const svg of document.querySelectorAll('svg')) { svg.pauseAnimations?.(); svg.setCurrentTime?.(0); }
      await tick(32);
    }
  }
  function elements() {
    const list = [], paths = new Map();
    const visit = (root, prefix) => {
      const counts = new Map();
      for (const el of root.children || []) {
        const tag = el.localName, n = (counts.get(tag) || 0) + 1; counts.set(tag, n);
        const path = prefix + '/' + tag + '[' + n + ']';
        list.push(el); paths.set(el, path);
        visit(el, path);
        if (el.shadowRoot) visit(el.shadowRoot, path + '/#shadow-root');
      }
    };
    visit(document, ''); return { list, paths };
  }
  function pseudos(el) {
    const out = ['', '::before', '::after'];
    if (el.matches('input,textarea')) out.push('::placeholder');
    if (getComputedStyle(el).display === 'list-item') out.push('::marker');
    return out;
  }
  /* Huge data: URLs otherwise serialize ~14 GB per 1,000 nodes. During style capture only, replace
     image URL tokens with content-addressed file: URLs, then reconstruct the ORIGINAL computed value
     before hashing. Only background/mask/border-image and custom properties are eligible (no layout
     image/content/font URLs). Screenshots precede this transaction; all CSS text is restored in finally.
     This is lossless URL interning, not an ignored-property list or visual tolerance. */
  async function internImageUrls() {
    const aliases = new Map(), tokens = new Map(), undo = [], customNames = new Set(), registered = new Set();
    const urlPattern = /url\(\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^)]*)\s*\)/g;
    const styles = [];
    const walk = rules => { for (const rule of rules) {
      if (rule.constructor.name === 'CSSPropertyRule') { registered.add(rule.name); customNames.add(rule.name); }
      if (rule.style) styles.push(rule.style); if (rule.cssRules) walk(rule.cssRules);
    } };
    for (const sheet of document.styleSheets) walk(sheet.cssRules);
    for (const el of document.querySelectorAll('[style]')) styles.push(el.style);
    const normalizer = document.createElement('div').style;
    try {
      for (const style of styles) {
        const changes = [];
        for (const name of style) {
          if (name.startsWith('--')) customNames.add(name);
          if (!(name.startsWith('--') || /^(?:background|(?:-webkit-)?mask|border-image)/.test(name))) continue;
          const value = style.getPropertyValue(name);
          if (value.length < 2048 || !value.includes('data:')) continue;
          let replaced = '', last = 0;
          for (const match of value.matchAll(urlPattern)) {
            if (match[0].length < 1024 || !/^url\(\s*["']?data:/i.test(match[0])) continue;
            let alias = tokens.get(match[0]);
            if (!alias) {
              normalizer.backgroundImage = match[0];
              const original = normalizer.backgroundImage;
              if (!original.startsWith('url(')) throw Error('Cannot canonicalize data URL');
              const uri = `file:///__pm7_parity_asset__/${await sha(match[0])}`;
              alias = `url(${uri})`;
              aliases.set(alias, match[0]); aliases.set(`url("${uri}")`, original); tokens.set(match[0], alias);
            }
            replaced += value.slice(last, match.index) + alias; last = match.index + match[0].length;
          }
          if (last) changes.push([name, replaced + value.slice(last), style.getPropertyPriority(name)]);
        }
        if (changes.length) {
          undo.push([style, style.cssText]);
          for (const [name, value, priority] of changes) style.setProperty(name, value, priority);
        }
      }
    } catch (error) { for (const [style, text] of undo.reverse()) style.cssText = text; throw error; }
    const expand = value => {
      if (!value.includes('file:///__pm7_parity_asset__/')) return value;
      return value.replace(/url\("?file:\/\/\/__pm7_parity_asset__\/[a-f0-9]{64}"?\)/g, alias => {
        if (!aliases.has(alias)) throw Error('Unknown image URL alias'); return aliases.get(alias);
      });
    };
    return { expand, customNames, registered, count: aliases.size / 2, restore() { for (const [style, text] of undo.reverse()) style.cssText = text; } };
  }
  async function snapshot(audit = false) {
    console.debug('PM7_PARITY_SNAPSHOT', 'start');
    const { list, paths } = elements(), auditRows = [];
    if (audit) for (const el of list.slice(0, 12)) for (const pseudo of pseudos(el)) {
      const cs = getComputedStyle(el, pseudo || null);
      auditRows.push({ el, pseudo, values: Object.fromEntries(Array.from(cs, p => [p, cs.getPropertyValue(p)])) });
    }
    const intern = await internImageUrls();
    console.debug('PM7_PARITY_SNAPSHOT', 'interned', intern.count);
    try {
      for (const row of auditRows) {
        const cs = getComputedStyle(row.el, row.pseudo || null);
        const names = new Set([...Object.keys(row.values), ...cs]);
        for (const name of names) if (row.values[name] !== intern.expand(cs.getPropertyValue(name))) throw Error(`URL interning changed ${paths.get(row.el)}${row.pseudo} ${name}`);
      }
      console.debug('PM7_PARITY_SNAPSHOT', 'audit-done');
      const values = [], valueIds = new Map(), nameLists = [], nameIds = new Map();
      const styles = [], styleIds = new Map(), rows = [];
      // Blink's indexed computed-style getter repeatedly enumerates inherited custom properties.
      // Read the known union by name; verify its exact cardinality against CSSStyleDeclaration.length.
      // Empty custom values, a dynamically registered unknown name, or an unusual property set take
      // the fully enumerated fallback. No property is omitted based on CSS reachability.
      const rootNames = Array.from(getComputedStyle(document.documentElement));
      const standardNames = rootNames.filter(name => !name.startsWith('--')).sort();
      for (const name of rootNames) if (name.startsWith('--')) intern.customNames.add(name);
      const activeRegistered = new Set(rootNames.filter(name => intern.registered.has(name)));
      const candidates = [...standardNames, ...intern.customNames].sort();
      let fallbackCount = 0;
      for (const el of list) for (const pseudo of pseudos(el)) {
        const cs = getComputedStyle(el, pseudo || null), names = [], readValues = [];
        for (const name of candidates) {
          const value = cs.getPropertyValue(name);
          if (!name.startsWith('--') || value !== '' || (!pseudo && activeRegistered.has(name))) { names.push(name); readValues.push(value); }
        }
        if (names.length !== cs.length) {
          if (!fallbackCount) console.debug('PM7_PARITY_SNAPSHOT', 'first-fallback', paths.get(el) + pseudo, names.length, cs.length,
            Array.from(cs).filter(name => !names.includes(name)).join(','));
          fallbackCount++; names.length = 0; readValues.length = 0;
          for (const name of Array.from(cs).sort()) { names.push(name); readValues.push(cs.getPropertyValue(name)); }
        }
        const namesKey = names.join('\0'); let ni = nameIds.get(namesKey);
        if (ni === undefined) { ni = nameLists.length; nameLists.push(names); nameIds.set(namesKey, ni); }
        const ids = readValues.map(value => {
          let id = valueIds.get(value);
          if (id === undefined) { id = values.length; values.push(value); valueIds.set(value, id); } return id;
        });
        const key = ni + ':' + ids.join(','); let si = styleIds.get(key);
        if (si === undefined) { si = styles.length; styles.push({ ni, ids }); styleIds.set(key, si); }
        const path = paths.get(el) + pseudo;
        rows.push([path, si]);
        if (rows.length % 3000 === 0) console.debug('PM7_PARITY_SNAPSHOT', 'rows', rows.length, 'fallbacks', fallbackCount);
      }
      const valueHashes = [];
      console.debug('PM7_PARITY_SNAPSHOT', 'collected', rows.length, values.length, styles.length, values.reduce((max, v) => Math.max(max, v.length), 0));
      const identities = await blobIdentities();
      for (const value of values) valueHashes.push(await sha(normalizeBlobValue(intern.expand(value), identities)));
      const styleHashes = [];
      for (const { ni, ids } of styles) styleHashes.push(await sha(JSON.stringify(nameLists[ni]) + '\n' + ids.map(id => valueHashes[id]).join('')));
      const entries = rows.map(([path, si]) => [path, styleHashes[si]]);
      return { hash: await sha(JSON.stringify(entries)), elements: list.length, entries,
        uniqueValues: values.length, uniqueStyles: styles.length, internedImageUrls: intern.count, interningAudit: auditRows.length, fallbackCount };
    } finally { intern.restore(); }
  }
  function details(paths) {
    const current = elements(), refs = new Map();
    for (const el of current.list) for (const pseudo of pseudos(el)) refs.set(current.paths.get(el) + pseudo, { el, pseudo });
    return paths.map(path => {
      const ref = refs.get(path);
      if (!ref || !ref.el.isConnected) return { path, absent: true };
      const cs = getComputedStyle(ref.el, ref.pseudo || null);
      const rawProperties = Object.fromEntries(Array.from(cs).sort().map(name => [name, cs.getPropertyValue(name)]));
      return { path, label: (ref.el.id ? '#' + ref.el.id : ref.el.localName) + (ref.pseudo || ''),
        rawProperties, properties: Object.fromEntries(Object.entries(rawProperties).map(([name, value]) => [name, normalizeBlobValue(value, blobHashes)])) };
    });
  }
  window.__pm7Parity = { tick, settle, snapshot, details, barrier, blobIdentities, get now() { return now; } };
  const hideCaret = () => {
    const sheet = document.createElement('style'); sheet.id = 'pm7-parity-caret';
    sheet.textContent = '* { caret-color: transparent !important; }'; document.head.appendChild(sheet);
  };
  document.addEventListener('DOMContentLoaded', hideCaret, { once: true });
}

/* pm2-copy.js — PM2.copy
   One-time "Copy Settings From Another Project" transaction engine for
   fable Settings concepts 05-11 (CONTRACT2, packet section 04).
   A copy is a transaction, never a link: select source -> choose broad
   categories -> deterministic preview (add / replace / unchanged /
   unavailable / conflict, item-level inspection) -> restore point ->
   atomic apply -> verify -> receipt + rollback. Source and destination
   stay fully independent afterward; no sync state exists anywhere.
   Credential/account references are preserved by reference only; raw
   secret material is never rendered, copied, or exported.
   Plain ES5 IIFE on window.PM2; no DOM. */
(function () {
  'use strict';

  if (typeof window === 'undefined') { return; }
  window.PM2 = window.PM2 || {};

  /* ---------------- utilities ---------------- */

  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object') ? x : {}; }
  function str(x) { return (typeof x === 'string') ? x : ''; }
  function deepClone(x) {
    try { return JSON.parse(JSON.stringify(x)); } catch (e) { return null; }
  }
  function deepEqual(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return a === b; }
  }

  var FIXED_BASE_MS = Date.parse('2026-08-05T14:30:00-07:00');
  function nowIso() {
    try {
      if (typeof window.PM2.now === 'function') {
        var n = window.PM2.now();
        if (n instanceof Date) return n.toISOString();
        if (typeof n === 'number') return new Date(n).toISOString();
        var s = str(n);
        if (s) return s;
      }
    } catch (e) { /* fixed fallback below */ }
    return new Date(FIXED_BASE_MS).toISOString();
  }

  function states() { return obj(window.PM2.states); }

  function resolveStore() {
    try {
      var st = states();
      if (typeof st.store === 'function') {
        var got = st.store();
        if (got) return got;
      }
    } catch (e) { /* fall through */ }
    try {
      var s2 = window.PM2.store;
      if (s2 && typeof s2.current === 'function') return s2.current() || null;
    } catch (e2) { /* not ready */ }
    return null;
  }

  function emitStore(evt, payload) {
    var store = resolveStore();
    if (store && typeof store.emit === 'function') {
      try { store.emit(evt, payload); } catch (e) { /* listeners stay local */ }
    }
  }

  function receipt(label, detail) {
    var st = states();
    if (typeof st.receipt === 'function') return st.receipt(label, detail);
    return { simulated: true, message: 'Simulated: ' + label + (detail ? ' — ' + detail : '') };
  }

  function delay(ms) {
    var st = states();
    if (typeof st.delay === 'function') return st.delay(ms);
    return Promise.resolve();
  }

  /* Op handle from pm2-states, or an inert stand-in so the engine keeps
     working in headless smoke runs. */
  function opHandle(name, ref) {
    var st = states();
    if (typeof st.op === 'function') return st.op(name, ref);
    var noop = function () { return h; };
    var h = { queued: noop, running: noop, done: noop, failed: noop,
      degraded: noop, retryable: noop, canceled: noop, recoveryRequired: noop,
      isTerminal: function () { return false; } };
    return h;
  }

  /* ---------------- inventory access ---------------- */

  var invById = null;
  var invByCat = null;
  var catTitles = null;

  function ensureInventory() {
    if (invById) return;
    invById = {};
    invByCat = {};
    catTitles = {};
    var inv = obj(window.PM2_INVENTORY);
    arr(inv.categories).forEach(function (c) {
      if (c && c.id) catTitles[c.id] = str(c.title) || c.id;
    });
    arr(inv.settings).forEach(function (s) {
      if (!s || !s.id) return;
      invById[s.id] = s;
      (invByCat[s.cat] || (invByCat[s.cat] = [])).push(s);
    });
  }

  function optionValue(o) {
    if (o && typeof o === 'object') return o.value !== undefined ? o.value : o.id;
    return o;
  }

  /* ---------------- values map helpers (shape-detected) ---------------- */

  function isRecord(entry) {
    return entry && typeof entry === 'object' && !Array.isArray(entry) &&
      Object.prototype.hasOwnProperty.call(entry, 'value');
  }
  function readValue(values, id) {
    var e = obj(values)[id];
    return isRecord(e) ? e.value : e;
  }
  function isChangedFromDefault(values, id) {
    var e = obj(values)[id];
    if (isRecord(e)) return e.changedFromDefault === true;
    ensureInventory();
    var inv = invById[id];
    return !!inv && e !== undefined && !deepEqual(e, inv['default']);
  }
  function writeIncoming(values, id, value, byLabel) {
    ensureInventory();
    var inv = invById[id];
    /* Honest divergence flag: compare against the inventory default. */
    var diverged = !inv || !deepEqual(value, inv['default']);
    var e = values[id];
    if (isRecord(e)) {
      e.value = value;
      e.changedFromDefault = diverged;
      e.changedAt = nowIso();
      e.by = byLabel;
    } else {
      values[id] = value;
    }
  }
  function restoreEntry(values, id, snapshot) {
    if (snapshot === undefined) { delete values[id]; return; }
    values[id] = snapshot;
  }

  /* ---------------- deterministic value synthesis ----------------
     A tiny LCG keyed per source keeps every overlay reproducible. */

  function lcg(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function synthesize(setting, rand) {
    var d = setting['default'];
    var t = str(setting.type);
    if (t === 'toggle') {
      if (d === true) return false;
      if (d === false) return true;
      if (d === 'on') return 'off';
      if (d === 'off') return 'on';
      return true;
    }
    if (t === 'select' || t === 'radio') {
      var opts = arr(setting.options).map(optionValue).filter(function (v) {
        return v !== undefined && v !== null;
      });
      if (!opts.length) return d;
      var di = opts.indexOf(d);
      var pick = opts[(Math.max(di, 0) + 1 + Math.floor(rand() * (opts.length - 1))) % opts.length];
      return deepEqual(pick, d) ? opts[(opts.indexOf(pick) + 1) % opts.length] : pick;
    }
    if (t === 'number' || t === 'slider') {
      if (typeof d === 'number') {
        if (d === 0) return 1;
        var bumped = Math.max(1, Math.round(d * (rand() < 0.5 ? 1.5 : 2)));
        return bumped === d ? d + 1 : bumped;
      }
      var m = /^(\d+)(\D*)$/.exec(str(d));
      if (m) return String(Math.round(Number(m[1]) * 1.25)) + m[2];
      return d;
    }
    return d; /* other types only appear via curated entries */
  }

  /* ---------------- demo source projects (5) ----------------
     One legacy project produces unavailable values and conflicts.
     Overlays are per-category divergence sets over real inventory ids;
     curated marquee rows first, deterministic synthesized rows after. */

  var SOURCE_DEFS = [
    {
      id: 'proj.tastebook', name: 'Tastebook', lastUpdated: '2026-08-03T16:42:00-07:00',
      seed: 11, perCat: { general: 6, ai: 5, code: 5, web: 4, planning: 3, memory: 3, safety: 2, extensions: 3 },
      curated: [
        { settingId: 'general.visual.theme', incoming: 'Retro Dark' },
        { settingId: 'code.terminal.font-family', incoming: 'JetBrains Mono' },
        { settingId: 'ai.models.default-variant', incoming: 'fast' },
        { settingId: 'web.fetch.crawl-max-pages', incoming: 60 },
        { settingId: 'ai.accounts.anthropic-api-key', incoming: '(reference) Anthropic key "tastebook-dev"',
          note: 'Copied as an account reference. The key itself stays in the system keychain and is never exported.' }
      ]
    },
    {
      id: 'proj.peon-ping', name: 'Peon Ping', lastUpdated: '2026-07-31T09:15:00-07:00',
      seed: 23, perCat: { general: 5, ai: 3, code: 4, system: 4, media: 2, branching: 3 },
      curated: [
        { settingId: 'general.interaction.notification-method', incoming: 'System Tray' },
        { settingId: 'general.interaction.sound-effects', incoming: true },
        { settingId: 'code.terminal.scrollback-limit', incoming: 50000 }
      ]
    },
    {
      id: 'proj.cozy-shelves', name: 'Cozy Shelves', lastUpdated: '2026-07-19T20:03:00-07:00',
      seed: 37, perCat: { general: 4, planning: 5, memory: 4, personas: 3, branching: 2, extensions: 2 },
      curated: [
        { settingId: 'planning.verification.goal-checkpoint-cadence', incoming: 'frequent' },
        { settingId: 'memory.retention.gist-review-filter', incoming: 'All' },
        { settingId: 'general.startup.restore-panel', incoming: 'Chat' }
      ]
    },
    {
      id: 'proj.home-lab', name: 'Home Lab Runbooks', lastUpdated: '2026-06-27T11:48:00-07:00',
      seed: 53, perCat: { system: 5, code: 4, safety: 4, web: 3, ai: 2, branching: 2 },
      curated: [
        { settingId: 'code.terminal.shell', incoming: 'zsh' },
        { settingId: 'safety.approvals.autonomy-mode', incoming: 'ask-me-first' },
        { settingId: 'web.fetch.pdf-mode', incoming: 'ocr' }
      ]
    },
    {
      /* Legacy project: exported by a 2024 build with the retired global/
         project scope split and old resource layouts. It is the required
         source of unavailable values and conflicts. */
      id: 'proj.vault-2024', name: 'Vault Migration (2024)', legacy: true,
      lastUpdated: '2024-11-02T14:20:00-08:00',
      seed: 71, perCat: { general: 4, ai: 4, system: 4, safety: 3, code: 3, web: 3 },
      curated: [
        { settingId: 'general.visual.theme', incoming: 'Basic Dark' },
        { settingId: 'ai.accounts.requested-account-id', flag: 'unavailable',
          incoming: 'vault-svc',
          note: 'References the account "vault-svc", which is not connected in this project. Connect the account first, then copy again, or set the row up fresh here.' },
        { settingId: 'system.mcp.remote-url', flag: 'unavailable',
          incoming: 'https://vault.internal:8443/mcp',
          note: 'Points at the retired vault.internal server, which this project cannot reach. The 2024 topology was decommissioned during the migration.' },
        { settingId: 'system.mcp.launch-config', flag: 'unavailable',
          incoming: { command: 'C:\\vault-tools\\mcp-launcher.exe' },
          note: 'Uses a launcher path from the old Windows host. No installation with this identity exists on any host this project uses.' },
        { settingId: 'web.fetch.cost-hard-cap', flag: 'conflict', incoming: 2000,
          note: 'Both projects changed this value since they diverged (here: raised for the crawl experiments; there: raised for the 2024 audit). Pick which limit to keep.' },
        { settingId: 'safety.approvals.doom-loop-threshold', flag: 'conflict', incoming: 8,
          note: 'The legacy export loosens a safety guard that this project tightened on purpose. A looser value never applies without an explicit decision.' },
        { settingId: 'general.visual.ui-scale', flag: 'conflict', incoming: '125%',
          note: 'Both projects changed this value since they diverged. Pick which to keep; the losing value is recorded in the receipt either way.' }
      ]
    }
  ];

  var GENERATED_TYPES = { toggle: 1, select: 1, radio: 1, number: 1, slider: 1 };

  var overlayCache = {};

  function buildOverlay(def) {
    if (overlayCache[def.id]) return overlayCache[def.id];
    ensureInventory();
    var rand = lcg(def.seed * 2654435761);
    var used = {};
    var out = [];

    arr(def.curated).forEach(function (c) {
      if (!c || used[c.settingId]) return;
      used[c.settingId] = true;
      out.push({
        settingId: c.settingId,
        cat: c.settingId.split('.')[0],
        incoming: c.incoming,
        flag: c.flag || null,
        note: c.note || null
      });
    });

    Object.keys(obj(def.perCat)).forEach(function (cat) {
      var want = def.perCat[cat];
      var pool = arr(invByCat[cat]).filter(function (s) {
        return s && GENERATED_TYPES[s.type] && s['default'] !== undefined && !used[s.id];
      });
      if (!pool.length) return;
      var have = out.filter(function (it) { return it.cat === cat; }).length;
      var idx = Math.floor(rand() * pool.length);
      var step = 7; /* co-prime with nearly every pool size; collisions skip */
      var guard = 0;
      while (have < want && guard < pool.length * 3) {
        guard++;
        idx = (idx + step) % pool.length;
        var s = pool[idx];
        if (!s || used[s.id]) continue;
        used[s.id] = true;
        out.push({
          settingId: s.id, cat: cat,
          incoming: synthesize(s, rand),
          flag: null, note: null
        });
        have++;
      }
    });

    /* Legacy exports flag a few generated rows as conflicts too: the same
       row changed on both sides since the projects diverged. */
    if (def.legacy) {
      var flagged = 0;
      for (var i = 0; i < out.length && flagged < 2; i++) {
        if (!out[i].flag && out[i].cat === 'ai') {
          out[i].flag = 'conflict';
          out[i].note = 'Both projects changed this value since they diverged. Pick which to keep.';
          flagged++;
        }
      }
    }

    out.sort(function (a, b) {
      if (a.cat !== b.cat) return a.cat < b.cat ? -1 : 1;
      return a.settingId < b.settingId ? -1 : (a.settingId > b.settingId ? 1 : 0);
    });
    overlayCache[def.id] = out;
    return out;
  }

  function sourceById(id) {
    for (var i = 0; i < SOURCE_DEFS.length; i++) {
      if (SOURCE_DEFS[i].id === id) return SOURCE_DEFS[i];
    }
    return null;
  }

  /* ---------------- public: sources ---------------- */

  function sources() {
    return SOURCE_DEFS.map(function (def) {
      var overlay = buildOverlay(def);
      var perCat = {};
      overlay.forEach(function (it) {
        perCat[it.cat] = (perCat[it.cat] || 0) + 1;
      });
      ensureInventory();
      return {
        id: def.id,
        name: def.name,
        legacy: !!def.legacy,
        lastUpdated: def.lastUpdated,
        categorySummaries: Object.keys(perCat).sort().map(function (cat) {
          return { cat: cat, title: catTitles[cat] || cat, count: perCat[cat] };
        })
      };
    });
  }

  /* ---------------- preview ---------------- */

  var CREDENTIAL_NOTE = 'Provider accounts and credentials are copied by reference only: ' +
    'the destination remembers which account a row points at, never the key or session ' +
    'itself. Secret material stays where it lives today and is never shown, copied, or ' +
    'exported. A referenced account that is not connected in this project appears as ' +
    'unavailable until you connect it here.';

  var stagedPreviews = {}; /* token -> staged preview (bounded) */
  var stagedOrder = [];
  var STAGED_MAX = 8;
  var lastTokenValue = null;

  function checksum(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return (h % 46656).toString(36); /* three base36 digits */
  }

  function classify(entry, values) {
    if (entry.flag === 'unavailable') return 'unavailable';
    if (entry.flag === 'conflict') return 'conflict';
    var current = readValue(values, entry.settingId);
    if (deepEqual(current, entry.incoming)) return 'unchanged';
    if (isChangedFromDefault(values, entry.settingId)) return 'replace';
    return 'add';
  }

  function preview(sourceId, catIds) {
    ensureInventory();
    var def = sourceById(str(sourceId));
    if (!def) {
      return { token: null, error: 'Unknown source project.', counts: null, perCategory: [], items: [], credentialNote: CREDENTIAL_NOTE };
    }
    var overlay = buildOverlay(def);
    var wanted = arr(catIds).filter(function (c) { return typeof c === 'string' && c; });
    if (!wanted.length) {
      var seen = {};
      overlay.forEach(function (it) { seen[it.cat] = true; });
      wanted = Object.keys(seen).sort();
    }
    var wantedMap = {};
    wanted.forEach(function (c) { wantedMap[c] = true; });

    var store = resolveStore();
    var values = store ? obj(store.values) : {};

    var counts = { add: 0, replace: 0, unchanged: 0, unavailable: 0, conflict: 0 };
    var perCat = {};
    var items = [];

    overlay.forEach(function (entry) {
      if (!wantedMap[entry.cat]) return;
      var inv = invById[entry.settingId] || null;
      var kind = classify(entry, values);
      counts[kind] += 1;
      if (!perCat[entry.cat]) {
        perCat[entry.cat] = { cat: entry.cat, title: catTitles[entry.cat] || entry.cat,
          counts: { add: 0, replace: 0, unchanged: 0, unavailable: 0, conflict: 0 } };
      }
      perCat[entry.cat].counts[kind] += 1;
      var item = {
        settingId: entry.settingId,
        label: inv ? str(inv.label) : entry.settingId,
        cat: entry.cat,
        kind: kind
      };
      if (kind !== 'add') item.current = deepClone(readValue(values, entry.settingId));
      /* incoming is always shown for item-level inspection; unavailable
         and conflict rows are never applied by the transaction. */
      item.incoming = deepClone(entry.incoming);
      if (entry.note) item.note = entry.note;
      else if (kind === 'unchanged') item.note = 'Already set to the same value here. Copying changes nothing.';
      items.push(item);
    });

    var token = 'cpv.' + def.id + '.' + checksum(wanted.slice().sort().join(',')) + '.' + items.length;

    var staged = {
      token: token,
      sourceId: def.id,
      sourceName: def.name,
      catIds: wanted.slice(),
      stagedAt: nowIso(),
      counts: counts,
      perCategory: Object.keys(perCat).sort().map(function (c) { return perCat[c]; }),
      items: items,
      credentialNote: CREDENTIAL_NOTE
    };

    if (!stagedPreviews[token]) stagedOrder.push(token);
    stagedPreviews[token] = staged;
    while (stagedOrder.length > STAGED_MAX) {
      delete stagedPreviews[stagedOrder.shift()];
    }
    lastTokenValue = token;

    return deepClone(staged);
  }

  /* ---------------- apply (staged atomic transaction) ---------------- */

  var rpSeq = 0;
  var receiptSeq = 0;
  var receipts = {}; /* receiptId -> {restorePoint, writtenIds, sourceName, token, rolledBack} */
  var lastReceiptIdValue = null;

  function apply(token) {
    var staged = stagedPreviews[str(token)];
    if (!staged) {
      receipt('Copy not applied', 'The preview token is unknown or expired. Stage a fresh preview and confirm again.');
      return Promise.resolve({ ok: false, error: 'Unknown or expired preview token. Run preview again.' });
    }
    var store = resolveStore();
    if (!store || !store.values) {
      receipt('Copy not applied', 'No settings store is attached.');
      return Promise.resolve({ ok: false, error: 'No store attached.' });
    }

    var toWrite = staged.items.filter(function (it) {
      return it.kind === 'add' || it.kind === 'replace';
    });
    var skipped = {
      unchanged: staged.counts.unchanged,
      unavailable: staged.counts.unavailable,
      conflict: staged.counts.conflict
    };
    var total = toWrite.length;
    var h = opHandle('copy-apply', staged.token);
    h.queued();

    rpSeq += 1;
    var restorePointId = 'rp.copy.' + rpSeq;
    receiptSeq += 1;
    var receiptId = 'rcpt.copy.' + receiptSeq;

    return Promise.resolve().then(function () {
      /* 1. Restore point: exact snapshots of every entry the transaction
         will touch, taken before anything changes. */
      h.running('creating-restore-point');
      return delay(500);
    }).then(function () {
      var entries = {};
      toWrite.forEach(function (it) {
        entries[it.settingId] = deepClone(store.values[it.settingId]);
      });
      var restorePoint = { id: restorePointId, when: nowIso(), entries: entries };

      /* 2. Apply: one synchronous pass, so the value map is never
         observable in a half-written state. */
      h.running('applying', { completed: 0, total: total });
      var byLabel = 'Copy from ' + staged.sourceName;
      toWrite.forEach(function (it) {
        writeIncoming(store.values, it.settingId, deepClone(it.incoming), byLabel);
      });

      /* 3. Verify the destination. */
      h.running('verifying', { completed: total, total: total });
      return delay(500).then(function () {
        var mismatched = [];
        toWrite.forEach(function (it) {
          if (!deepEqual(readValue(store.values, it.settingId), it.incoming)) {
            mismatched.push(it.settingId);
          }
        });
        if (mismatched.length) {
          /* Verification failed: restore immediately and say so. */
          toWrite.forEach(function (it) {
            restoreEntry(store.values, it.settingId, restorePoint.entries[it.settingId]);
          });
          h.recoveryRequired({ reason: 'verification-failed', mismatched: mismatched.length });
          emitStore('copy', { phase: 'verify-failed', token: staged.token });
          receipt('Copy rolled back', 'Verification found ' + mismatched.length +
            ' value(s) that did not read back correctly, so the restore point was applied and nothing changed.');
          return { ok: false, error: 'Verification failed; restored automatically.', verified: false };
        }

        receipts[receiptId] = {
          receiptId: receiptId,
          restorePoint: restorePoint,
          writtenIds: toWrite.map(function (it) { return it.settingId; }),
          sourceId: staged.sourceId,
          sourceName: staged.sourceName,
          token: staged.token,
          when: nowIso(),
          rolledBack: false
        };
        lastReceiptIdValue = receiptId;

        h.done({ completed: total, total: total });
        emitStore('value', { batch: true, ids: receipts[receiptId].writtenIds.slice(), source: 'copy' });
        emitStore('copy', {
          phase: 'applied', token: staged.token, receiptId: receiptId,
          restorePointId: restorePointId, applied: total, skipped: skipped
        });
        receipt('Settings copied from ' + staged.sourceName,
          total + ' value(s) applied atomically and verified. ' +
          skipped.unchanged + ' already matched, ' + skipped.unavailable + ' unavailable and ' +
          skipped.conflict + ' conflicted value(s) were not applied. Restore point ' +
          restorePointId + ' can undo the whole transaction. The two projects stay independent.');

        return {
          ok: true,
          receiptId: receiptId,
          restorePointId: restorePointId,
          applied: total,
          skipped: skipped,
          verified: true
        };
      });
    });
  }

  /* ---------------- rollback ---------------- */

  function rollback(receiptId) {
    var rec = receipts[str(receiptId)];
    if (!rec) {
      receipt('Nothing to roll back', 'No copy transaction with that receipt exists in this session.');
      return Promise.resolve({ ok: false, error: 'Unknown receipt.' });
    }
    if (rec.rolledBack) {
      receipt('Already rolled back', 'That copy transaction was already reverted. Settings are unchanged.');
      return Promise.resolve({ ok: false, error: 'Already rolled back.' });
    }
    var store = resolveStore();
    if (!store || !store.values) {
      return Promise.resolve({ ok: false, error: 'No store attached.' });
    }
    var h = opHandle('copy-rollback', rec.receiptId);
    h.queued();
    var total = rec.writtenIds.length;
    return Promise.resolve().then(function () {
      h.running('restoring', { completed: 0, total: total });
      return delay(500);
    }).then(function () {
      rec.writtenIds.forEach(function (id) {
        restoreEntry(store.values, id, deepClone(rec.restorePoint.entries[id]));
      });
      h.running('verifying', { completed: total, total: total });
      return delay(400);
    }).then(function () {
      rec.rolledBack = true;
      if (lastReceiptIdValue === rec.receiptId) lastReceiptIdValue = null;
      h.done({ completed: total, total: total });
      emitStore('value', { batch: true, ids: rec.writtenIds.slice(), source: 'copy-rollback' });
      emitStore('copy', { phase: 'rolled-back', receiptId: rec.receiptId, restored: total });
      receipt('Copy rolled back', 'All ' + total + ' copied value(s) were restored exactly from ' +
        rec.restorePoint.id + '. The receipt records both directions.');
      return { ok: true, receiptId: rec.receiptId, restored: total };
    });
  }

  /* ---------------- public API ---------------- */

  window.PM2.copy = {
    sources: sources,
    preview: preview,
    apply: apply,
    rollback: rollback,
    lastToken: function () { return lastTokenValue; },
    lastReceiptId: function () { return lastReceiptIdValue; },
    receipts: function () {
      return Object.keys(receipts).map(function (k) {
        var r = receipts[k];
        return { receiptId: r.receiptId, sourceName: r.sourceName, when: r.when,
          applied: r.writtenIds.length, restorePointId: r.restorePoint.id,
          rolledBack: r.rolledBack };
      });
    },
    credentialNote: CREDENTIAL_NOTE
  };

})();

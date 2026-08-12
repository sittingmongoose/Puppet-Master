/* PMXAttach — Opus 5
 *
 * The attachment resolver named by 05_ATTACHMENTS_PROVIDER_SETUP_SYNC_AND_NOTIFICATIONS.md:3-36.
 *
 * Every attempted attachment lands on exactly one of four honest outcomes — native, PM
 * transformed, alternate model, unsupported — and says WHY. This module replaces the composer's
 * old fabricated `screenshots/attachment-N.png` path, which claimed an attachment existed without
 * ever looking at the file: a resolver that cannot be wrong is a resolver that cannot be trusted.
 *
 * Two invariants carry the weight here.
 *
 * 1. Derived material always keeps `lineage.originalId`. A transcript, a page image or a tiled
 *    crop is evidence about something; a transformed representation that loses its origin is
 *    unciteable, so the assistant could quote it with nothing to point back at. `originalId` is
 *    therefore written on EVERY record, native ones included, and re-resolution after a model
 *    change never mints a new origin.
 * 2. Routing an attachment to another provider is a decision, not a convenience. It changes
 *    privacy, account, cost, terms and hosting location, so it is gated by a real
 *    `PMXApprovals` record of `cls:'privacy_hosting_change'` (05_...:27) instead of being applied
 *    behind the user's back. `route()` hands back the warning id; the class only becomes
 *    `alternate` once that record is decided in favour of the alternate.
 *
 * Phase B service: no DOM, no document, one global. Peers are reached through guarded lookups so
 * load order cannot break a render.
 */
(function (global) {
  'use strict';

  var store = null, data = null;
  var seq = 0;

  /* Byte-exact representation strings from 05_...:16-23. These are visible product copy; they are
   * quoted in the packet and asserted by the Phase G probes, so they are constants, not templates. */
  var REPRESENTATION = {
    zip: 'Safe manifest and 3 extracted files',
    pdf: 'Text plus 4 page images',
    audio: 'Transcript',
    video: 'Transcript plus 6 frames',
    spreadsheet: 'Sheet and range summaries',
    large_image: 'Resized and tiled'
  };

  var NATIVE_REPRESENTATION = 'Sent as-is';
  var NATIVE_TEXT_REPRESENTATION = 'Sent as text';
  /* An unsupported attachment is not attached at all until the user decides. Saying "Not attached"
   * is the truthful representation; leaving it blank would read as "unknown". */
  var UNSUPPORTED_REPRESENTATION = 'Not attached';

  /* Internal transform tokens. `representation` is the visible prose; this names WHICH transform
   * produced the derived material, so lineage stays machine-checkable without parsing copy. */
  var TRANSFORM = {
    zip: 'zip_manifest',
    pdf: 'pdf_pages',
    audio: 'audio_transcript',
    video: 'video_frames',
    spreadsheet: 'sheet_summaries',
    large_image: 'image_tile',
    alternate: 'alternate_route'
  };

  /* Verbatim alternate-route copy, 05_...:31-34. The question doubles as the resolution's `reason`
   * so the card and the approval say the same sentence rather than two paraphrases. */
  var VIDEO_UNSUPPORTED = 'This model cannot read video.';
  var ACTION_CANCEL = 'Cancel';
  var ACTION_EXTRACT = 'Extract in PM';
  /* The packet's example reads "[Use Gemini]"; the plan fixes the concept's copy at the full model
   * name so the action names the exact route it commits to. */
  var DEFAULT_ALTERNATE_MODEL = 'Gemini 3 Ultra';

  /* Extension is the most trusted signal because the user named the file, so it survives a picker
   * or a transport that guesses the mime wrongly (the common `application/octet-stream` case). */
  var EXT_KIND = {
    zip: 'zip',
    pdf: 'pdf',
    m4a: 'audio', m4b: 'audio', mp3: 'audio', wav: 'audio', aac: 'audio', flac: 'audio', ogg: 'audio', oga: 'audio',
    mov: 'video', mp4: 'video', m4v: 'video', webm: 'video', avi: 'video', mkv: 'video',
    xlsx: 'spreadsheet', xlsm: 'spreadsheet', xls: 'spreadsheet', csv: 'spreadsheet', tsv: 'spreadsheet', ods: 'spreadsheet', numbers: 'spreadsheet',
    png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', bmp: 'image', tif: 'image', tiff: 'image', heic: 'image', svg: 'image',
    txt: 'text', md: 'text', markdown: 'text', json: 'text', jsonl: 'text', yml: 'text', yaml: 'text', toml: 'text',
    js: 'text', mjs: 'text', ts: 'text', tsx: 'text', jsx: 'text', css: 'text', html: 'text', htm: 'text', xml: 'text',
    rs: 'text', py: 'text', go: 'text', rb: 'text', sh: 'text', log: 'text', diff: 'text', patch: 'text', slint: 'text'
  };

  var MIME_KIND = {
    'application/zip': 'zip',
    'application/x-zip-compressed': 'zip',
    'multipart/x-zip': 'zip',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
    'application/vnd.ms-excel': 'spreadsheet',
    'application/vnd.oasis.opendocument.spreadsheet': 'spreadsheet',
    'application/json': 'text',
    'application/xml': 'text'
  };

  /* 05_...:22 sets the large-image rule at four megapixels. A picker hands over a name, a mime and
   * a byte count — never dimensions — so size is the third and weakest signal: it can only refine
   * a kind the first two already established, never establish one. An explicit `spec.pixels`, or
   * `spec.width` * `spec.height`, always wins over this proxy when a caller can supply it. */
  var LARGE_IMAGE_PIXELS = 4000000;
  var LARGE_IMAGE_BYTES = 4 * 1024 * 1024;

  /* The six files the composer's fixture picker offers, one per resolver outcome, so every class
   * in the union is reachable by product interaction. It lives here rather than in the composer
   * because the picker supplies a NAME and the classification depends on mime and size too: two
   * copies of these numbers would eventually disagree and silently reclassify a demo file.
   * `resolve` backfills only the fields a caller omits, so a real spec always wins. */
  var FIXTURE_FILES = [
    { name: 'provider-audit.zip', mime: 'application/zip', bytes: 2412544 },
    { name: 'settings-spec.pdf', mime: 'application/pdf', bytes: 1884160 },
    { name: 'standup.m4a', mime: 'audio/mp4', bytes: 7340032 },
    { name: 'walkthrough.mov', mime: 'video/quicktime', bytes: 48210944 },
    { name: 'allowance.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', bytes: 262144 },
    { name: 'capture-1.png', mime: 'image/png', bytes: 1048576 }
  ];

  function bind(s, d) {
    store = s || null;
    data = d || null;
    return api;
  }

  /* ---- classification -------------------------------------------------------------------- */

  function extensionOf(name) {
    var n = String(name || '');
    var dot = n.lastIndexOf('.');
    if (dot < 0 || dot === n.length - 1) return '';
    return n.slice(dot + 1).toLowerCase();
  }

  function kindFromMime(mime) {
    var m = String(mime || '').toLowerCase();
    if (!m) return '';
    if (MIME_KIND[m]) return MIME_KIND[m];
    if (m.indexOf('audio/') === 0) return 'audio';
    if (m.indexOf('video/') === 0) return 'video';
    if (m.indexOf('image/') === 0) return 'image';
    if (m.indexOf('text/') === 0) return 'text';
    if (m.indexOf('spreadsheet') >= 0) return 'spreadsheet';
    return '';
  }

  /* Extension, then mime, then size — in that order of trust. Size never names a kind on its own;
   * it only tells an image apart from a LARGE image, which is the one size-driven rule in 05_. */
  function kindOf(spec) {
    var kind = EXT_KIND[extensionOf(spec.name)] || kindFromMime(spec.mime) || '';
    if (kind !== 'image') return kind;
    return isLargeImage(spec) ? 'large_image' : 'image';
  }

  function isLargeImage(spec) {
    var pixels = 0;
    if (typeof spec.pixels === 'number' && spec.pixels > 0) pixels = spec.pixels;
    else if (spec.width > 0 && spec.height > 0) pixels = spec.width * spec.height;
    if (pixels > 0) return pixels > LARGE_IMAGE_PIXELS;
    return (spec.bytes || 0) >= LARGE_IMAGE_BYTES;
  }

  /* ---- route capability ------------------------------------------------------------------ */

  /* Whether the thread's current route can read video is an ADAPTER fact, never a fact about the
   * model's name: inferring it from "Gemini" or "Ultra" is exactly the bug the plan forbids for
   * `supportsFast`. So this reads the capability bag off PMXRoute's model record and understands
   * both shapes an adapter bag legitimately takes — a list of capability names, or a flag map.
   * With PMXRoute absent (a partially booted page) the answer is "no", which degrades to the
   * unsupported card with its alternate route rather than to a silent, wrong "yes". */
  function capabilityBagHas(capabilities, want) {
    if (!capabilities) return false;
    var i;
    if (Object.prototype.toString.call(capabilities) === '[object Array]') {
      for (i = 0; i < capabilities.length; i++) {
        if (String(capabilities[i]).toLowerCase().indexOf(want) >= 0) return true;
      }
      return false;
    }
    for (var k in capabilities) {
      if (!Object.prototype.hasOwnProperty.call(capabilities, k)) continue;
      if (String(k).toLowerCase().indexOf(want) >= 0 && capabilities[k]) return true;
    }
    return false;
  }

  function modelRecords() {
    var R = global.PMXRoute;
    if (!R || !R.models) return [];
    var out = [];
    try {
      var accounts = R.accounts ? R.accounts() : [];
      if (!accounts || !accounts.length) return R.models() || [];
      for (var i = 0; i < accounts.length; i++) {
        var rows = R.models(accounts[i].id) || [];
        for (var j = 0; j < rows.length; j++) out.push(rows[j]);
      }
    } catch (e) { return []; }
    return out;
  }

  function modelRecordFor(threadId) {
    var R = global.PMXRoute;
    if (!R || !R.routeOf) return null;
    var route;
    try { route = R.routeOf(threadId) || {}; } catch (e) { return null; }
    var wanted = String(route.model || '');
    if (!wanted) return null;
    var rows = modelRecords();
    for (var i = 0; i < rows.length; i++) {
      var m = rows[i];
      /* A route names a model by its display name; `id` is matched too so a caller that stores
       * the id instead still resolves. Account is checked because the same model under two
       * accounts is two distinct routes (01_...:18) and their capability bags may differ. */
      if (m.name !== wanted && m.id !== wanted) continue;
      if (route.account && m.accountId && m.accountId !== route.account && m.account !== route.account) continue;
      return m;
    }
    return null;
  }

  function routeReadsVideo(threadId) {
    var m = modelRecordFor(threadId);
    return !!(m && capabilityBagHas(m.capabilities, 'video'));
  }

  /* The alternate is whichever catalogued model CAN read video; the fixture makes that
   * `Gemini 3 Ultra`, which is why the packet's copy names it. Discovering it keeps the action
   * label truthful if the catalog ever changes, instead of promising a route that is not there. */
  function alternateModelName() {
    var rows = modelRecords();
    for (var i = 0; i < rows.length; i++) {
      if (capabilityBagHas(rows[i].capabilities, 'video')) return rows[i].name || rows[i].id;
    }
    return DEFAULT_ALTERNATE_MODEL;
  }

  function useAlternateLabel() { return 'Use ' + alternateModelName(); }

  /* ---- records --------------------------------------------------------------------------- */

  function action(id, primary) {
    var a = { id: id, label: id };
    if (primary) a.primary = true;
    return a;
  }

  /* Lineage is written on every record, not only derived ones: `originalId` is the citable
   * identity of the uploaded file, and it stays fixed while `class` and `representation` change
   * under it as the route changes. `derivedFrom` is null exactly when nothing was derived. */
  function lineageFor(originalId, transform) {
    return {
      originalId: originalId,
      derivedFrom: transform ? originalId : null,
      transform: transform || null
    };
  }

  function shape(threadId, originalId, spec, kind) {
    var rec = {
      id: originalId,
      name: spec.name,
      mime: spec.mime || '',
      bytes: spec.bytes || 0,
      class: 'native',
      representation: NATIVE_REPRESENTATION,
      lineage: lineageFor(originalId, null),
      actions: [],
      reason: 'This route reads this file directly.'
    };
    applyKind(rec, kind, threadId);
    return rec;
  }

  /* The single place a kind becomes a class, so `resolve` and `reevaluate` can never disagree
   * about what a file is. Only the video branch depends on the route; everything else is a
   * property of the file itself and is therefore stable across model changes. */
  function applyKind(rec, kind, threadId) {
    switch (kind) {
      case 'zip':
      case 'pdf':
      case 'audio':
      case 'spreadsheet':
      case 'large_image':
        rec['class'] = 'transformed';
        rec.representation = REPRESENTATION[kind];
        rec.lineage = lineageFor(rec.lineage.originalId, TRANSFORM[kind]);
        rec.actions = [];
        rec.reason = transformReason(kind);
        return;
      case 'image':
      case 'text':
        rec['class'] = 'native';
        rec.representation = kind === 'text' ? NATIVE_TEXT_REPRESENTATION : NATIVE_REPRESENTATION;
        rec.lineage = lineageFor(rec.lineage.originalId, null);
        rec.actions = [];
        rec.reason = 'This route reads this file directly.';
        return;
      case 'video':
        if (routeReadsVideo(threadId)) {
          rec['class'] = 'native';
          rec.representation = NATIVE_REPRESENTATION;
          rec.lineage = lineageFor(rec.lineage.originalId, null);
          rec.actions = [];
          rec.reason = 'This route reads video directly.';
          return;
        }
        rec['class'] = 'unsupported';
        rec.representation = UNSUPPORTED_REPRESENTATION;
        rec.lineage = lineageFor(rec.lineage.originalId, null);
        /* Staying inside PM changes nothing about privacy, account or cost, so it is the primary
         * action; the alternate route is the one that needs a decision. */
        rec.actions = [action(ACTION_CANCEL), action(ACTION_EXTRACT, true), action(useAlternateLabel())];
        rec.reason = VIDEO_UNSUPPORTED;
        return;
      default:
        rec['class'] = 'unsupported';
        rec.representation = UNSUPPORTED_REPRESENTATION;
        rec.lineage = lineageFor(rec.lineage.originalId, null);
        rec.actions = [action(ACTION_CANCEL)];
        rec.reason = 'PM has no reader for this file type.';
    }
  }

  function transformReason(kind) {
    switch (kind) {
      case 'zip': return 'An archive cannot be read as a prompt, so PM attaches a safe manifest and the extracted files.';
      case 'pdf': return 'PDF pages are not text, so PM attaches the extracted text with page images.';
      case 'audio': return 'This route cannot listen, so PM attaches a transcript.';
      case 'video': return 'PM extracted the video locally, so nothing left this machine.';
      case 'spreadsheet': return 'A workbook is too large to send whole, so PM attaches sheet and range summaries.';
      case 'large_image': return 'The image is larger than this route accepts, so PM resizes and tiles it.';
    }
    return '';
  }

  /* ---- state ----------------------------------------------------------------------------- */

  function slice(threadId) {
    if (!store) return [];
    var v = store.view(threadId);
    if (!v.attachments) v.attachments = [];
    return v.attachments;
  }

  function nextId() { seq += 1; return 'att-' + seq; }

  /* The fixture authors attachments as bare `{name, mime, bytes}` specs and the store seeds them
   * straight into the view (store.js:255). Normalising them on first read keeps the fixture
   * authoring plain while `of()` still only ever returns whole resolution records. This repair is
   * deliberately silent: it is triggered BY a read, and announcing it would re-enter every
   * subscriber that is mid-render. */
  function normalize(threadId) {
    var list = slice(threadId);
    for (var i = 0; i < list.length; i++) {
      var entry = list[i];
      if (entry && entry['class'] && entry.lineage && entry.lineage.originalId) continue;
      var id = (entry && entry.id) || nextId();
      list[i] = shape(threadId, id, entry || {}, kindOf(entry || {}));
    }
    return list;
  }

  function find(threadId, id) {
    var list = normalize(threadId);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function announce() { if (store) store.touchView('attachments'); }

  /* ---- api ------------------------------------------------------------------------------- */

  function fixtureFor(name) {
    for (var i = 0; i < FIXTURE_FILES.length; i++) {
      if (FIXTURE_FILES[i].name === name) return FIXTURE_FILES[i];
    }
    return null;
  }

  function resolve(threadId, spec) {
    if (!spec || !spec.name) return null;
    var known = fixtureFor(spec.name);
    var full = {
      name: spec.name,
      mime: spec.mime || (known ? known.mime : ''),
      bytes: typeof spec.bytes === 'number' ? spec.bytes : (known ? known.bytes : 0),
      pixels: spec.pixels,
      width: spec.width,
      height: spec.height
    };
    var rec = shape(threadId, nextId(), full, kindOf(full));
    if (!store) return rec;
    normalize(threadId).push(rec);
    announce();
    return rec;
  }

  function of(threadId) {
    if (!store) return [];
    return normalize(threadId).slice();
  }

  function remove(threadId, id) {
    if (!store) return false;
    var list = normalize(threadId);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== id) continue;
      list.splice(i, 1);
      announce();
      return true;
    }
    return false;
  }

  /* Sending an attachment to a different provider changes privacy, account, cost, terms and
   * location at once (05_...:27), so it is raised as a material warning and NOT applied here.
   * `route` returns the warning id; `reevaluate` promotes the record to `alternate` only after
   * that record is decided in favour of the alternate, so the class always reflects a decision
   * the user actually made. */
  function raiseAlternateWarning(threadId, rec) {
    var A = global.PMXApprovals;
    if (!A || !A.raise) return null;
    var label = useAlternateLabel();
    var name = alternateModelName();
    return A.raise(threadId, {
      kind: 'warning',
      severity: 'material',
      cls: 'privacy_hosting_change',
      question: VIDEO_UNSUPPORTED,
      scopeLine: name + ' · a different provider, account, and hosting location',
      actions: [action(ACTION_CANCEL), action(ACTION_EXTRACT, true), action(label)],
      details: {
        commands: [],
        files: [rec.name],
        servers: [],
        domains: [],
        persistence: 'This attachment only · the thread route does not change',
        saferAlternative: ACTION_EXTRACT + ' · the extraction runs locally and nothing leaves this machine',
        receipts: []
      }
    });
  }

  function route(threadId, resolutionId, actionId) {
    var rec = find(threadId, resolutionId);
    if (!rec) return { ok: false, warningId: null };

    var allowed = false;
    for (var i = 0; i < rec.actions.length; i++) {
      if (rec.actions[i].id === actionId) { allowed = true; break; }
    }
    if (!allowed) return { ok: false, warningId: null };

    if (actionId === ACTION_CANCEL) {
      /* Cancel declines the offer; it does not remove the attachment, because the user may still
       * pick the other action. The card stays exactly as it is. */
      return { ok: true, warningId: null };
    }

    if (actionId === ACTION_EXTRACT) {
      var kind = kindOf(rec);
      applyKind(rec, kind === 'video' ? 'video_extracted' : kind, threadId);
      /* `applyKind` has no route-independent branch for an extracted video, so the transformed
       * shape is written here from the same table the automatic transforms use. */
      rec['class'] = 'transformed';
      rec.representation = REPRESENTATION.video;
      rec.lineage = lineageFor(rec.lineage.originalId, TRANSFORM.video);
      rec.actions = [];
      rec.reason = transformReason('video');
      announce();
      return { ok: true, warningId: null };
    }

    var warningId = raiseAlternateWarning(threadId, rec);
    if (!warningId) {
      /* No approvals service means the confirmation cannot be obtained, and an unconfirmed
       * provider hop is exactly what 05_...:27 forbids. Refuse rather than proceed. */
      return { ok: false, warningId: null };
    }
    announce();
    return { ok: true, warningId: warningId };
  }

  /* A decided alternate-route warning is the ONLY thing that promotes a record to `alternate`, so
   * the class is read back out of the decision record rather than remembered separately — one
   * source of truth, and a denied warning leaves the attachment unsupported where it belongs. */
  function alternateApproved(threadId, rec) {
    if (!store) return false;
    var v = store.view(threadId);
    var decisions = (v && v.decisions) || [];
    var label = useAlternateLabel();
    for (var i = 0; i < decisions.length; i++) {
      var d = decisions[i];
      if (!d || d.cls !== 'privacy_hosting_change' || d.status !== 'decided') continue;
      if (d.decidedAction !== label) continue;
      if (d.details && d.details.files && d.details.files.length && d.details.files[0] !== rec.name) continue;
      return true;
    }
    return false;
  }

  function applyAlternate(rec) {
    rec['class'] = 'alternate';
    rec.representation = 'Read by ' + alternateModelName();
    rec.lineage = lineageFor(rec.lineage.originalId, TRANSFORM.alternate);
    rec.actions = [];
    rec.reason = 'You approved sending this attachment to ' + alternateModelName() + '.';
  }

  /* Called on ANY model change (05_...:36). Only route-dependent outcomes move: a route that can
   * read video turns the unsupported video native, and a route that cannot turns it back.
   *
   * A derivation the USER chose is sticky. Re-deriving over an explicit `Extract in PM`, or
   * silently dropping an approved alternate route because the new model happens to be different,
   * would discard a decision the user made and, worse, break the lineage the derived material is
   * cited through. Automatic transforms (zip, pdf, audio, spreadsheet, large image) are properties
   * of the file, so they never move at all. */
  function reevaluate(threadId) {
    if (!store) return [];
    var list = normalize(threadId);
    var changed = [];
    for (var i = 0; i < list.length; i++) {
      var rec = list[i];
      var before = rec['class'] + '|' + rec.representation;

      if (alternateApproved(threadId, rec)) {
        if (rec['class'] !== 'alternate') applyAlternate(rec);
      } else if (rec.lineage.transform === TRANSFORM.alternate) {
        /* The approval was revoked or replaced; fall back to the automatic outcome. */
        applyKind(rec, kindOf(rec), threadId);
      } else if (rec.lineage.transform === TRANSFORM.video && rec['class'] === 'transformed') {
        continue; /* user-chosen local extraction, kept */
      } else if (rec['class'] === 'native' || rec['class'] === 'unsupported') {
        applyKind(rec, kindOf(rec), threadId);
      }

      if (before !== rec['class'] + '|' + rec.representation) changed.push(rec.id);
    }
    if (changed.length) announce();
    return changed;
  }

  var api = {
    bind: bind,
    resolve: resolve,
    route: route,
    reevaluate: reevaluate,
    of: of,
    remove: remove,
    FIXTURE_FILES: FIXTURE_FILES
  };

  global.PMXAttach = api;
})(window);

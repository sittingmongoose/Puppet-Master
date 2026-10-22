/* pm7-port/js/65-surfaces-attachments.js: an attachment's Open goes to a tab, not a modal (chat56-audit section 3
   row 20: "Open goes to an Artifact/Image/Code viewer tab; More Info can stay a popover").
   att-open (the attachment chip's body, in the tray or on a sent message), in order:
   - not openable yet (processing, failed): the chat's own toast, unchanged;
   - a generated artifact or a retained snapshot: the chat's own route (its exact artifact-revision tab, kind artifact);
   - a project file reference the demo project has: the file, by the D7 rules (single click previews, double click keeps,
     Alt+click a new panel, Ctrl/Cmd+click behind) in the Home code editor;
   - anything else (an image, a PDF, uploaded data, a folder, clipboard text): one viewer tab per attachment,
     attachment:<thread>|<message>|<attachment>, kind artifact, drawn by the chat: the picture for an image (was the
     att-preview modal), else what the attachment is, where it came from and its state, with More Info and Download.
   att-details (More Info) stays the chat's own surface. */
(function () {
  'use strict';
  var W = window;
  var PRE = 'attachment:';

  function E() { return W.PM56_EXT || null; }
  function AT() { return W.PM56_ATTACHMENTS || null; }
  function SF() { return W.PM56_SURFACES || {}; }
  function enc(s) { return encodeURIComponent(String(s == null ? '' : s)); }
  function dec(s) { try { return decodeURIComponent(s); } catch (_) { return s; } }
  function idFor(tid, mid, aid) { return PRE + enc(tid) + '|' + enc(mid || '') + '|' + enc(aid); }
  function parse(id) {
    var p = String(id).slice(PRE.length).split('|');
    return { tid: dec(p[0] || ''), mid: dec(p[1] || '') || null, aid: dec(p[2] || '') };
  }
  function find(c, ref) {
    var A = AT();
    try { return A && A.findAttachment ? A.findAttachment(c, ref.tid, ref.mid, ref.aid) : null; } catch (_) { return null; }
  }
  function previewUrl(rec) {
    if (!rec || rec.kind !== 'image') return null;
    if (rec._previewUrl) return rec._previewUrl;
    if (rec._file && W.URL && URL.createObjectURL) {
      try { var u = URL.createObjectURL(rec._file); Object.defineProperty(rec, '_previewUrl', { value: u, enumerable: false, writable: true, configurable: true }); return u; } catch (_) {}
    }
    return null;
  }
  function bytes(n) {
    if (n == null || !isFinite(n)) return null;
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1).replace(/\.0$/, '') + ' KB';
    return (n / 1048576).toFixed(1).replace(/\.0$/, '') + ' MB';
  }
  var KIND_WORD = { image: 'Image', pdf: 'PDF', code: 'Code', text: 'Text', data: 'Data', folder: 'Folder', archive: 'Archive', binary: 'File' };
  function isProjectRef(rec) { return rec && (rec.origin === 'project_live_reference' || rec.origin === 'project_frozen_snapshot'); }
  function hasFile(path) { try { return !!(W.PM_HOME && PM_HOME.fileExists && PM_HOME.fileExists(path)); } catch (_) { return false; } }

  /* ---- the viewer tab's body ---- */
  function body(c, id) {
    var ref = parse(id), rec = find(c, ref), esc = c.esc;
    if (!rec) return '<article class="editor-doc pm56-att-doc"><h1>Attachment</h1><p>This attachment is not here any more. It may have been removed from the message or the tray.</p></article>';
    var A = AT(), origin = A && A.originMeta ? A.originMeta(rec.origin) : { label: rec.origin || 'Attachment' };
    var meta = [KIND_WORD[rec.kind] || 'File', origin.label, bytes(rec.size), rec.process_state === 'ready' ? 'Ready' : rec.process_state].filter(Boolean);
    var data = ' data-thread="' + esc(ref.tid) + '"' + (ref.mid ? ' data-message="' + esc(ref.mid) + '"' : '') + ' data-att="' + esc(ref.aid) + '"';
    var acts = '<div class="pm56-att-acts"><button class="soft-button" data-action="att-details"' + data + '>More Info</button>' +
      '<button class="soft-button" data-action="att-download"' + data + '>Download</button></div>';
    var url = previewUrl(rec), main;
    if (url) main = '<figure class="pm56-att-figure"><img class="pm56-att-img" src="' + esc(url) + '" alt="' + esc(rec.name) + '"></figure>' +
      (rec.origin === 'browser_capture' || rec.demo ? '<p class="pm56-att-note">A fixture drawing in this concept, not a real screenshot.</p>' : '');
    else main = '<p class="pm56-att-note">' + esc(rec.source_label || origin.label) + '. There is no preview for this kind of attachment in the concept; More Info lists what it holds and what each turn materialized.</p>';
    return '<article class="editor-doc pm56-att-doc" data-k="pm56-att:' + esc(ref.aid) + '"><h1>' + esc(rec.name || 'Attachment') + '</h1>' +
      '<p class="pm56-meta">' + meta.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</p>' +
      main + acts + '</article>';
  }

  var e0 = E();
  if (!e0 || typeof e0.slot !== 'function') return;
  e0.slot('editorTabLabel', function (c) {
    var id = String(c.editorId || '');
    if (id.indexOf(PRE) !== 0) return '';
    var rec = find(c, parse(id));
    if (!rec || !rec.name) return 'Attachment';
    // a file's own name; a folder keeps its last folder name and slash (src/analytics/ -> analytics/)
    var name = String(rec.name), folder = /\/$/.test(name), parts = name.replace(/\/+$/, '').split('/');
    return (parts.pop() || name) + (folder ? '/' : '');
  });
  e0.slot('editorDocument', function (c) {
    var id = String(c.editorId || '');
    return id.indexOf(PRE) === 0 ? body(c, id) : '';
  });
  e0.chainAction('att-open', function (c, btn, ev) {
    if (!W.PM_HOME || !c || !btn) return false;
    var ref = { tid: btn.dataset.thread, mid: btn.dataset.message || null, aid: btn.dataset.att };
    var rec = find(c, ref);
    if (!rec || rec.process_state === 'failed' || /^(selected|resolving|uploading|scanning|extracting)$/.test(rec.process_state || '')) return false;
    if (rec.artifact_ref || rec.snapshot_ref) return false;                       // the chat opens its exact artifact version
    if (isProjectRef(rec) && rec.name && hasFile(rec.name)) {
      var g = SF().gesture ? SF().gesture({ event: ev }) : null;
      var keep = !!(g && (g.detail >= 2 || (g.type === 'keydown' && g.key === 'Enter')));
      SF().openHome({ kind: 'editor', path: rec.name, mode: keep ? 'keep' : 'preview' }, ev);
      return true;
    }
    c.closeDialog && c.state.dialog && c.closeDialog();
    c.openEditor(idFor(ref.tid, ref.mid, ref.aid));
    return true;
  });
})();

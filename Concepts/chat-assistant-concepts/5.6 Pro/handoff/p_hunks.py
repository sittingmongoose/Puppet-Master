from pathlib import Path
app=Path("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/app.js")
t=app.read_text()

OLD = """  function renderFileEditor(path){
    const c=D.changes.find(x=>x.path===path);
    const line=c?.line||1;
    return `<article class="editor-doc"><h1>${esc(path)}</h1><div class="editor-meta"><span class="meta-pill">Modified</span><span class="meta-pill">Focused at line ${line}</span><span class="meta-pill">${c?`+${c.add} \u2212${c.del}`:'Working tree'}</span></div><p>${esc(c?.summary||'File opened from the Chat Activity Detail panel.')}</p><div class="code-block">${Array.from({length:18},(_,i)=>{const n=line-4+i;const cls=n===line?'focus':n>line&&n<line+4?'add':'';const txt=n===line?'CREATE INDEX CONCURRENTLY idx_events_tenant_created':n===line+1?'ON analytics_events (tenant_id, created_at DESC);':n===line+2?'-- rollback: DROP INDEX CONCURRENTLY idx_events_tenant_created;':'-- surrounding source and migration context';return `<span class="diff-line ${cls}">${String(n).padStart(4)}  ${esc(txt)}</span>`}).join('\\n')}</div></article>`;
  }"""

NEW = r'''  /* One diff row. Line numbers come from l.old / l.new and are NEVER computed
     here -- doing the arithmetic locally is exactly what produced the fake this
     replaces. `kind` maps straight onto the classes styles.css already carries
     (.diff-line.add / .del / .focus); `meta` has no rule there and Wave 1B has
     closed that file, so its muted tone is inline. */
  function renderDiffLine(l, focusLine, deletedFile){
    const cls = l.kind==='add' ? 'add' : l.kind==='del' ? 'del' : '';
    if(l.kind==='meta') return `<span class="diff-line" style="color:var(--subtle)">      ${esc(l.text)}</span>`;
    /* Focus the row the Activity panel said it was opening at: the NEW line
       number, except in a deleted file where only old numbers exist. */
    const num = l.kind==='del' ? l.old : (l.new!=null ? l.new : l.old);
    const focusNum = deletedFile ? l.old : l.new;
    const focus = focusLine!=null && focusNum===focusLine;
    const sign = l.kind==='add' ? '+' : l.kind==='del' ? '-' : ' ';
    return `<span class="diff-line ${cls}${focus?' focus':''}">${String(num==null?'':num).padStart(4)} ${sign} ${esc(l.text)}</span>`;
  }

  /* Reads changes[].hunks (FIXTURE_SCHEMA.md section 1). Until the Wave 2 Demo
     Data agent shipped that field this renderer FABRICATED its own diff: 18
     generated lines printing the same CREATE INDEX migration for every path,
     so opening three different changed files showed three copies of the same
     SQL. When a record has no hunks the honest empty state is shown -- source
     is not invented here.
     white-space:pre is set inline because the hardening layer (styles.css:419)
     relaxes .code-block to pre-wrap, which is right for prose blocks and wrong
     for a diff: wrapping breaks the gutter alignment. Inline keeps that
     override local to the file editor. */
  function renderFileEditor(path){
    const c=D.changes.find(x=>x.path===path);
    const line=c?.line||null;
    const deleted=c?.status==='deleted';
    const statusLabel=(D.labels&&D.labels.changeStatus&&D.labels.changeStatus[c?.status])
      || (c?.status ? String(c.status).replace(/^./,ch=>ch.toUpperCase()) : 'Working tree');
    const hunks=Array.isArray(c?.hunks)?c.hunks:[];
    const meta=`<div class="editor-meta"><span class="meta-pill">${esc(statusLabel)}</span>${c?.oldPath?`<span class="meta-pill">Renamed from ${esc(c.oldPath)}</span>`:''}${line?`<span class="meta-pill">Focused at line ${line}</span>`:''}${c?.language?`<span class="meta-pill">${esc(c.language)}</span>`:''}<span class="meta-pill">${c?`+${c.add} \u2212${c.del}`:'Working tree'}</span>${hunks.length>1?`<span class="meta-pill">${hunks.length} hunks</span>`:''}</div>`;
    const body = hunks.length
      ? hunks.map(h=>`<div class="code-block" style="white-space:pre" data-k="hunk:${esc(path)}:${esc(h.header||'')}"><span class="diff-line" style="color:var(--subtle)">${esc(h.header||'')}</span>\n${h.lines.map(l=>renderDiffLine(l,line,deleted)).join('\n')}</div>`).join('')
      : `<div class="event-card"><span class="event-icon">${icon('info',14)}</span><div class="event-copy"><strong>No diff recorded for this file</strong><p>This change record carries no hunks, so there is nothing to show. Source is not invented here.</p></div></div>`;
    return `<article class="editor-doc" data-k="file:${esc(path)}"><h1>${esc(path)}</h1>${meta}<p>${esc(c?.summary||'File opened from the Chat Activity Detail panel.')}</p>${body}</article>`;
  }'''

if t.count(OLD)!=1:
    raise SystemExit(f"ANCHOR FAIL: renderFileEditor found {t.count(OLD)} times (concurrent edit?)")
app.write_text(t.replace(OLD,NEW,1))
print("renderFileEditor now reads changes[].hunks")

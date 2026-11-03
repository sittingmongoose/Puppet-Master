/* Settings that apply everywhere (Opus 5.5): the panel (BUILD-SPEC section 8; SETTINGS-PROPOSAL 3.1).

   The panel stays the engine's aside.detail-inspector (its spring, scrim, Esc and 350px width), rendered by
   renderDetailInspectorBody. The layer decorates what it drew, in place and after the engine's own patch:
     Head      the close button reads "Close"
     Now       the context line, the value in use, where it comes from, the one action named for what it does here
     Where it applies (NEW CANON, SSYS-063)   the sentence, the groups (Everywhere; Computers or Devices; Projects),
               only what differs, Change and Same as everywhere on each line, "+ Set for…" menus, the rule sentence
     Choosing here changes (NEW CANON)        where a click in Your choices goes, before it goes
     Recent changes (NEW CANON)               the last three, each with Undo
     For experts                              "Can differ by" and "Kept on"
   PM51.syncInspector replaces the whole body when the number of blocks differs, so the wrap below takes the layer's
   blocks out before the engine patches and puts them back after, and focus is put back by data-psx-key. A
   MutationObserver catches the first open, which goes through the private populateDetailInspector. Per-thing rows
   ("Each account has its own", .o55-insp-now.is-per) are the engine's alone. */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.panel) return;
  const { D, DEF, DEFAULTS, COMPUTERS, HOSTS, DEVICES, PROJECTS, esc, mark, icon, label, vt, placeName, projectName, list, same, clone } = PSX;
  const S = PSX.S;
  const CHEV = '<svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const MAX_LINES = 6;
  let editing = null;      // { id, level, key, isNew }
  let lastOpen = null;     // the setting whose panel is open, for focus on close

  /* ------------------------------------------------------------------ writing one level, with its note */
  function blockedWrite(tg) {
    const c = PSX.ctxFull(S.ctx), dev = DEVICES[c.device];
    if (dev && dev.limited && tg.level !== 'device') return PSX.REASONS.limited_device[0];
    const wr = PSX.writer(tg.level, tg.key);
    if (wr && !PSX.answering(wr)) {
      if (tg.level === 'everywhere') return 'Change it when Home NAS is back';
      if (tg.level === 'project') return `${tg.key}’s settings can be changed when ${placeName('computer', wr)} answers`;
      return `${placeName('computer', wr)} isn’t answering`;
    }
    if (tg.level === 'computer' && tg.key === 'studio' && !PSX.W.studioJoined) return null;
    return null;
  }
  PSX.setOwn = function (id, tg, value, o) {
    o = o || {};
    const why = blockedWrite(tg);
    if (why) { PSX.note({ title: 'Not saved', body: why + '.', mark: /answer|back/.test(why) ? 'offline' : 'info', kind: 'refused' }); return null; }
    if (tg.level === 'everywhere' && value !== undefined && PSX.check) {
      const blocked = PSX.check.everywhere(id, value);
      if (blocked) { PSX.check.refuse(id, value, PSX.getAt(PSX.W, 'everywhere', null, id), blocked); return null; }
    }
    const before = PSX.getAt(PSX.W, tg.level, tg.key, id);
    const tx = PSX.apply([{ level: tg.level, key: tg.key, id, value }], { by: o.by || 'you' });
    PSX.feed.push();
    if (o.quiet) return tx;
    const where = tg.level === 'device' && tg.key === PSX.ctxFull(S.ctx).device ? 'this screen' : placeName(tg.level, tg.key);
    const title = value === undefined
      ? (tg.level === 'everywhere' ? `${label(id)} is back to the default everywhere.` : `${where} follows everywhere again.`)
      : `Saved for ${tg.level === 'everywhere' ? 'everywhere' : where}.`;
    const body = value === undefined ? (before !== undefined ? `It had its own: ${vt(id, before)}.` : '') : `${label(id)}: ${vt(id, value)}.`;
    PSX.note({ title, body, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, id) }], kind: 'saved' });
    return tx;
  };

  /* ------------------------------------------------------------------ 1.7: an Everywhere change is checked against
     every context that follows it; safety rows are previewed first. [Demo only]: harbor's Codex account has 12% left. */
  const HARBOR_CODEX_LEFT = 12;
  function followers(id, value) {
    // the projects whose value in use would change, each in its own work context
    const w0 = PSX.W, w1 = clone(w0);
    if (value === undefined) delete w1.everywhere[id]; else w1.everywhere[id] = value;
    const changes = [], keeps = [];
    PROJECTS.forEach((p) => {
      const a = PSX.resolve(id, { project: p.id, device: S.ctx.device, on: null }, w0), b = PSX.resolve(id, { project: p.id, device: S.ctx.device, on: null }, w1);
      if (!same(a.value, b.value)) changes.push(p.id); else if (a.from.level !== 'everywhere' && a.from.level !== 'default') keeps.push(p.id);
    });
    return { changes, keeps };
  }
  PSX.followers = followers;
  PSX.check = {
    everywhere(id, value) {
      if (id === 'ai.accounts.hard-switch-level' && Number(value) >= HARBOR_CODEX_LEFT && !PSX.has(PSX.W.project.harbor, id)) return { project: 'harbor', why: 'its Codex account would switch at once', left: HARBOR_CODEX_LEFT };
      return null;
    },
    refuse(id, value, old, b) {
      PSX.sheet({
        title: `${label(id)} wasn’t changed everywhere`, kicker: 'Checked before it was saved',
        body: `<p class="psx-p">${mark('blocked')} <b>${esc(b.project)} can’t use this:</b> ${esc(b.why)}. Every project that follows your everywhere value was checked first, and ${esc(b.project)} is the first one it would stop.</p><p class="psx-p">You can change it everywhere except ${esc(b.project)}: ${esc(b.project)} keeps ${esc(vt(id, PSX.resolve(id, { project: b.project }).value))} as its own, in the same change.</p>`,
        actions: [
          { label: 'Cancel', run: (s) => s.close('cancel') },
          { spacer: true },
          { label: `Change it everywhere except ${b.project}`, primary: true, run: (s) => {
            s.close('ok');
            const keep = PSX.resolve(id, { project: b.project }).value;
            const tx = PSX.apply([{ level: 'everywhere', key: null, id, value }, { level: 'project', key: b.project, id, value: keep }], { batch: 'except', text: `${label(id)}: ${vt(id, value)} everywhere, except ${b.project}` });
            PSX.feed.push();
            PSX.note({ title: 'Saved for everywhere.', body: `${b.project} keeps ${vt(id, keep)} as its own.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, id) }], kind: 'saved' });
          } }
        ]
      });
    },
    preview(id, value, old, ok) {
      const f = followers(id, value), c = PSX.ctxFull(S.ctx);
      const body = `<p class="psx-p">${mark('info')} <b>This changes ${f.changes.length} project${f.changes.length === 1 ? '' : 's'}.</b> ${f.keeps.length ? esc(list(f.keeps)) + (f.keeps.length === 1 ? ' keeps its own value.' : ' keep their own values.') : ''}</p>`
        + `<p class="psx-p">${esc(label(id))} becomes ${esc(vt(id, value))} for ${esc(list(f.changes, 6) || 'no project')}. Safety settings are shown before they change.</p>`;
      PSX.sheet({
        title: `Change ${label(id)} everywhere?`, kicker: 'A safety setting', body,
        actions: [
          { label: 'Cancel', run: (s) => s.close('cancel') },
          { spacer: true },
          c.project ? { label: `Only for ${c.project}`, run: (s) => { s.close('ok'); PSX.commit(id, value, old, { level: 'project', key: c.project }); } } : null,
          { label: 'Change everywhere', primary: true, run: (s) => { s.close('ok'); ok(); } }
        ].filter(Boolean)
      });
    }
  };
  PSX.has = (bag, id) => !!bag && Object.prototype.hasOwnProperty.call(bag, id);

  /* ------------------------------------------------------------------ the open panel */
  function current() {
    const insp = D.querySelector('#pm-settings-root .detail-inspector');
    if (!insp || insp.getAttribute('aria-hidden') === 'true' || insp.style.display === 'none') return null;
    const page = insp.querySelector(':scope > .o55-insp-page:not(.o55-leaving)') || insp;
    const body = page.querySelector(':scope > .detail-body'); if (!body) return null;
    const code = page.querySelector('.o55-insp-tech code');
    const id = code ? code.textContent.trim() : null;
    return { insp, page, body, head: page.querySelector(':scope > .detail-head'), id };
  }
  function strip(scope) {
    const cur = scope ? null : current();
    const host = scope || (cur && cur.page);
    if (!host) return {};
    const act = D.activeElement;
    const key = act && host.contains(act) ? (act.closest('[data-psx-key]') || {}).dataset : null;
    host.querySelectorAll('[data-psx-block]').forEach((n) => n.remove());
    host.querySelectorAll('[data-psx-hidden]').forEach((n) => { n.hidden = false; n.removeAttribute('data-psx-hidden'); });
    if (host.dataset) delete host.dataset.psxDone;
    return { focusKey: key && key.psxKey };
  }

  function decorate(o) {
    o = o || {};
    const cur = current(); if (!cur || !cur.id) return;
    const { page, body, head, id } = cur;
    lastOpen = id;
    PSX.adopt && PSX.adopt(id);
    const sig = JSON.stringify([id, PSX.W.rev, S.ctx, S.opt.end, S.targets[id] || null, editing, S.firstStart]);
    if (!o.force && page.dataset.psxDone === sig && (body.querySelector('[data-psx-block="where"]') || !DEF[id])) return;
    const act = D.activeElement;
    const keep = o.focusKey || (act && page.contains(act) && act.closest('[data-psx-key]') ? act.closest('[data-psx-key]').dataset.psxKey : null);
    page.dataset.psxDone = sig;
    closeWord(head);
    if (!DEF[id]) return;
    const now = body.querySelector(':scope > .o55-insp-now');
    if (now && now.classList.contains('is-per')) return;
    body.querySelectorAll('[data-psx-block]').forEach((n) => n.remove());
    const r = PSX.resolve(id, S.ctx);
    rewriteNow(now, id, r);
    hideEngineWhere(body);
    const where = whereBlock(id, r, { context: 'panel' });
    if (now) now.after(where); else body.insertBefore(where, body.firstChild);
    insertTarget(body, id, r);
    insertRecent(body, id);
    experts(body, id);
    if (keep) { const f = page.querySelector(`[data-psx-key="${CSS.escape(keep)}"]`); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* gone */ } }
    if (editing && editing.id === id) { const ctl = where.querySelector('[data-psx-edit-control]'); if (ctl && !page.contains(D.activeElement && D.activeElement.closest('[data-psx-edit-control]'))) try { ctl.focus({ preventScroll: true }); } catch (e) { /* gone */ } }
  }
  function closeWord(head) {
    const b = head && head.querySelector('.pm51-panel-close');
    if (!b || b.classList.contains('psx-close')) return;
    b.classList.add('psx-close'); b.innerHTML = 'Close'; b.setAttribute('data-psx-key', 'close');
    b.setAttribute('aria-label', 'Close');
  }
  function hideEngineWhere(body) {
    body.querySelectorAll(':scope > section.o55-insp-block').forEach((s) => {
      const h4 = s.querySelector('h4');
      if (h4 && /^Where it applies$/i.test(h4.textContent.trim()) && !s.hasAttribute('data-psx-block')) { s.hidden = true; s.setAttribute('data-psx-hidden', ''); }
    });
  }

  /* ------------------------------------------------------------------ Now */
  function ctxLine(id, r) {
    const c = PSX.ctxFull(S.ctx), def = DEF[id];
    if (def.screen && !(def.may || []).includes('project')) return 'On this screen';
    if (def.home === 'computer') return `On ${placeName('computer', c.host || c.on)}`;
    if (!c.project) return `With no project, on ${placeName('computer', c.on)}`;
    if (def.screen) return `In ${c.project} · on this screen`;
    return `In ${c.project} · works on ${placeName('computer', c.on)}`;
  }
  function fromLine(id, r) {
    const c = PSX.ctxFull(S.ctx);
    if (r.notOffered) return 'Each project has its own. Choose one below to see or change its value.';
    if (r.ceiling) return `${c.project} asks for ${vt(id, r.asked)}. ${placeName('computer', r.ceiling.key)} allows at most ${vt(id, r.ceiling.value)}.`;
    if (r.careful) return `${c.project} asks for ${vt(id, r.careful.asked)}. For safety, ${placeName(r.careful.by.level, r.careful.by.key)}’s own is used.`;
    if (r.from.level === 'project') return 'Set for this project';
    if (r.from.level === 'computer') return DEF[id].home === 'computer' ? 'Set by you on this computer' : `From ${placeName('computer', r.from.key)}`;
    if (r.from.level === 'device') return r.from.key === c.device ? 'Set for this screen' : `From ${placeName('device', r.from.key)}`;
    if (r.from.level === 'everywhere') return 'From Everywhere';
    if (DEF[id].home === 'computer') return r.missing ? `${DEF[id].program || 'It'} isn’t installed here` : `Found automatically${r.found ? ': ' + r.found : ''}`;
    return 'Puppet Master’s default';
  }
  function rewriteNow(now, id, r) {
    if (!now) return;
    const def = DEF[id];
    now.classList.toggle('is-changed', !!r.changed);
    const labEl = now.querySelector('.o55-insp-now-label'); if (labEl) labEl.textContent = ctxLine(id, r);
    const valEl = now.querySelector('.o55-insp-now-value');
    if (valEl) valEl.textContent = r.notOffered ? 'Not here' : r.ceiling ? `${vt(id, r.value)} in use` : vt(id, r.value);
    const from = D.createElement('div'); from.className = 'psx-now-from'; from.setAttribute('data-psx-block', 'now-from');
    from.innerHTML = `<span>${esc(fromLine(id, r))}</span>${r.changed ? `<span class="o55-changed">${mark('change-modified')}<span>Changed</span></span>` : ''}`;
    if (valEl) valEl.after(from);
    const foot = now.querySelector('.o55-insp-now-foot'); if (!foot) return;
    foot.innerHTML = '';
    const dflt = DEFAULTS[id];
    const defTxt = def.home === 'computer' ? (r.found ? `Found here: <strong>${esc(r.found)}</strong>` : r.missing ? `<strong>Not installed here</strong>` : `Puppet Master’s default: <strong>${esc(vt(id, dflt))}</strong>`) : `Puppet Master’s default: <strong>${esc(vt(id, dflt))}</strong>`;
    foot.insertAdjacentHTML('beforeend', `<span>${defTxt}</span>`);
    let act = null;
    if (r.notOffered) act = null;
    else if (r.here && (r.from.level !== 'computer' || def.home !== 'computer') && def.home !== 'project') act = { label: 'Same as everywhere', run: () => PSX.setOwn(id, r.from, undefined) };
    else if (def.home === 'computer' && r.from.level === 'computer') act = { label: 'Use what’s found here', run: () => PSX.setOwn(id, r.from, undefined) };
    else if (def.home === 'project' && r.from.level === 'project') act = { label: `Clear it for ${r.from.key}`, run: () => PSX.setOwn(id, r.from, undefined) };
    else if (r.from.level === 'everywhere' && r.changed) act = { label: 'Go back to the default everywhere', run: () => backToDefault(id) };
    if (act) {
      const b = D.createElement('button'); b.type = 'button'; b.className = 'o55-textbtn psx-tb'; b.setAttribute('data-psx-key', 'now-act');
      b.innerHTML = `${icon('restore')}<span>${esc(act.label)}</span>`;
      const why = act.label === 'Go back to the default everywhere' ? blockedWrite({ level: 'everywhere' }) : blockedWrite(r.from);
      if (why) { b.setAttribute('aria-disabled', 'true'); PSX.tip(b, act.label, why); }
      b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') === 'true') { PSX.note({ title: 'Not now', body: why + '.', mark: 'offline' }); return; } act.run(); });
      foot.appendChild(b);
    } else if (!r.notOffered) foot.insertAdjacentHTML('beforeend', `<span class="o55-insp-isdef">${icon('check')}<span>This is the default</span></span>`);
  }
  function backToDefault(id) {
    const f = followers(id, undefined);
    PSX.sheet({
      title: `Go back to the default everywhere?`, kicker: label(id),
      body: `<p class="psx-p">${mark('info')} <b>${esc(label(id))} becomes ${esc(vt(id, DEFAULTS[id]))}</b> in ${f.changes.length} project${f.changes.length === 1 ? '' : 's'}: ${esc(list(f.changes, 6) || 'none')}.</p>${f.keeps.length ? `<p class="psx-p">${esc(list(f.keeps))} ${f.keeps.length === 1 ? 'keeps its' : 'keep their'} own.</p>` : ''}`,
      actions: [{ label: 'Cancel', run: (s) => s.close() }, { spacer: true }, { label: 'Go back to the default', primary: true, run: (s) => { s.close(); PSX.setOwn(id, { level: 'everywhere', key: null }, undefined); } }]
    });
  }

  /* ------------------------------------------------------------------ Where it applies */
  function sentence(id, r) {
    const def = DEF[id];
    if (def.home === 'computer') return PSX.REASONS[def.reason][0];
    if (def.home === 'project') return PSX.REASONS.about_this_project[0];
    if (def.home === 'everywhere') return PSX.REASONS.same_for_you[0];
    const own = r.varies.filter((v) => v.level !== 'provider');
    if (!own.length) return 'Used everywhere.';
    const projs = own.filter((v) => v.level === 'project').map((v) => v.key);
    const places = own.filter((v) => v.level !== 'project');
    const parts = [], few = projs.length + places.length <= 2;
    if (projs.length) parts.push(few ? list(projs) : projs.length === 1 ? projs[0] : `${projs.length} projects`);
    if (places.length) {
      const kind = places[0].level === 'device' ? 'devices' : 'computers';
      parts.push(few || places.length === 1 ? 'on ' + list(places.map((p) => placeName(p.level, p.key))) : `on ${places.length} ${kind}`);
    }
    return `Used everywhere, except ${parts.join(' and ')}.`;
  }
  function editable(id, level, key) { return !blockedWrite({ level, key }); }
  /* one line: a role=group with its name, value, state (mark plus word) and buttons */
  function line(id, r, o) {
    const def = DEF[id], c = PSX.ctxFull(S.ctx);
    const k = `${o.level}:${o.key || ''}`;
    const isEdit = editing && editing.id === id && editing.level === o.level && (editing.key || '') === (o.key || '');
    const el = D.createElement('div');
    el.className = 'psx-wline' + (o.sub ? ' is-sub' : '') + (o.inUse ? ' is-inuse' : '') + (o.muted ? ' is-muted' : '');
    el.setAttribute('role', 'group');
    const vtext = o.valueText != null ? o.valueText : vt(id, o.value);
    el.setAttribute('aria-label', `${o.name}: ${vtext}${def.combine === 'computer_ceiling' && o.level === 'computer' ? ', at most' : ''}`);
    el.setAttribute('data-psx-line', k);
    const states = (o.states || []).map((s) => `<div class="psx-wstate${s.muted ? ' is-muted' : ''}">${s.key ? mark(s.key) : ''}<span>${esc(s.text)}</span></div>`).join('');
    el.innerHTML = `<div class="psx-wtop"><span class="psx-wname">${esc(o.name)}</span><span class="psx-wval">${isEdit ? '' : esc(vtext)}${!isEdit && def.combine === 'computer_ceiling' && o.level === 'computer' ? '<span class="psx-muted"> · at most</span>' : ''}</span></div>${states}`;
    if (isEdit) el.appendChild(editor(id, o));
    else if (o.actions !== false) {
      const acts = D.createElement('div'); acts.className = 'psx-wacts';
      const why = blockedWrite({ level: o.level, key: o.key });
      if (o.change !== false) acts.appendChild(btn(`Change`, `Change ${o.name}’s value`, `${k}:change`, why, () => { editing = { id, level: o.level, key: o.key, value: o.value }; rerender(); }));
      if (o.removable) acts.appendChild(btn(def.home === 'computer' ? 'Use what’s found' : 'Same as everywhere', def.home === 'computer' ? `Make ${o.name} use what Puppet Master finds` : `Make ${o.name} the same as everywhere`, `${k}:same`, why, () => PSX.setOwn(id, { level: o.level, key: o.key }, undefined)));
      if (acts.children.length) el.appendChild(acts);
    }
    return el;
  }
  function btn(text, aria, key, why, run) {
    const b = D.createElement('button');
    b.type = 'button'; b.className = 'psx-tb'; b.textContent = text; b.setAttribute('aria-label', aria); b.setAttribute('data-psx-key', key);
    if (why) { b.setAttribute('aria-disabled', 'true'); PSX.tip(b, aria, why); b.setAttribute('aria-description', why); }
    b.addEventListener('click', (e) => { e.preventDefault(); if (b.getAttribute('aria-disabled') === 'true') { PSX.note({ title: 'Not now', body: why + '.', mark: /answer|back/.test(why) ? 'offline' : 'info' }); return; } run(); });
    return b;
  }
  /* the row's own control type, inline: a list, a number, a switch, or words. Enter saves, Esc cancels. */
  function editor(id, o) {
    const wrap = D.createElement('div'); wrap.className = 'psx-wedit';
    const s = PSX.engineSetting(id), cur = o.value === undefined ? PSX.resolve(id, S.ctx).value : o.value;
    let ctl, read;
    const opts = PSX.optionsFor(id);
    if (opts && opts.length) {
      ctl = D.createElement('select'); ctl.className = 'psx-input psx-select';
      opts.forEach((v) => { const op = D.createElement('option'); op.value = JSON.stringify(v); op.textContent = vt(id, v); if (same(v, cur)) op.selected = true; ctl.appendChild(op); });
      read = () => JSON.parse(ctl.value);
    } else if (typeof DEFAULTS[id] === 'boolean') {
      ctl = D.createElement('button'); ctl.type = 'button'; ctl.className = 'toggle pm51-toggle' + (cur ? ' on' : ''); ctl.setAttribute('role', 'switch'); ctl.setAttribute('aria-checked', cur ? 'true' : 'false');
      ctl.addEventListener('click', () => { const on = ctl.getAttribute('aria-checked') !== 'true'; ctl.setAttribute('aria-checked', String(on)); ctl.classList.toggle('on', on); });
      read = () => ctl.getAttribute('aria-checked') === 'true';
    } else if (typeof DEFAULTS[id] === 'number') {
      ctl = D.createElement('input'); ctl.type = 'number'; ctl.className = 'psx-input psx-num'; ctl.value = String(cur == null ? '' : cur);
      read = () => (ctl.value === '' ? undefined : Number(ctl.value));
    } else if (id === 'memory.assembly.project-rules') {
      ctl = D.createElement('textarea'); ctl.className = 'psx-input psx-area'; ctl.value = String(cur || ''); ctl.rows = 3;
      read = () => ctl.value;
    } else {
      ctl = D.createElement('input'); ctl.type = 'text'; ctl.className = 'psx-input psx-text'; ctl.value = String(cur == null ? '' : cur); ctl.spellcheck = false;
      read = () => ctl.value.trim();
    }
    ctl.setAttribute('data-psx-edit-control', '1');
    ctl.__psxCancel = () => cancel();
    ctl.setAttribute('aria-label', `${label(id)} for ${o.name}`);
    const save = () => { const v = read(); const key = `${o.level}:${o.key || ''}:change`; editing = null; PSX.panel.focusAfter = key; PSX.setOwn(id, { level: o.level, key: o.key }, v); rerender(); };
    const cancel = () => { const key = `${o.level}:${o.key || ''}:change`; editing = null; rerender({ focusKey: o.isNew ? 'add:' + o.level : key }); };
    ctl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !(ctl.tagName === 'TEXTAREA' && e.shiftKey)) { e.preventDefault(); e.stopPropagation(); save(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancel(); }
    });
    wrap.appendChild(ctl);
    const acts = D.createElement('div'); acts.className = 'psx-wacts';
    acts.appendChild(btn('Save', `Save ${o.name}’s value`, `${o.level}:${o.key || ''}:save`, null, save));
    acts.appendChild(btn('Cancel', 'Cancel the change', `${o.level}:${o.key || ''}:cancel`, null, cancel));
    wrap.appendChild(acts);
    return wrap;
  }
  function rerender(o) {
    o = o || {};
    const cur = current();
    if (cur && cur.id && DEF[cur.id]) decorate({ force: true, focusKey: o.focusKey || PSX.panel.focusAfter });
    if (PSX.panel.own && PSX.panel.own.isConnected) renderOwn(o.focusKey || PSX.panel.focusAfter);
    PSX.panel.focusAfter = null;
  }

  /* the whole block, for the engine's panel and for the layer's own (the Projects folder row) */
  function whereBlock(id, r, o) {
    const def = DEF[id], c = PSX.ctxFull(S.ctx);
    const sec = D.createElement('section');
    sec.className = 'o55-insp-block psx-where'; sec.setAttribute('data-psx-block', 'where'); sec.setAttribute('data-psx-key', 'where');
    sec.innerHTML = `<h4>Where it applies</h4><p class="psx-where-sentence">${esc(sentence(id, r))}</p>`;
    if (r.stale.length) sec.insertAdjacentHTML('beforeend', `<div class="psx-wstate psx-where-note">${mark('offline')}<span>Home NAS isn’t answering. What it keeps is shown as of ${esc(PSX.W.asOf)}.</span></div>`);
    if (DEVICES[c.device] && DEVICES[c.device].limited) sec.insertAdjacentHTML('beforeend', `<div class="psx-wstate psx-where-note">${mark('info')}<span>${esc(PSX.REASONS.limited_device[0])} The other lines are read only here.</span></div>`);
    const off = r.offered;
    const own = (lvl) => r.varies.filter((v) => v.level === lvl);
    const decides = (lvl, key) => r.from.level === lvl && (r.from.key || '') === (key || '');
    const mkGroup = (title, bare) => { const g = D.createElement('div'); g.className = 'psx-group'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', title); g.innerHTML = bare ? '' : `<div class="psx-ghead">${esc(title)}</div>`; sec.appendChild(g); return g; };

    // Everywhere
    if (off.everywhere && def.home !== 'computer') {
      const g = mkGroup('Everywhere', true);
      const has = r.everywhere !== undefined;
      const why = blockedWrite({ level: 'everywhere' });
      const states = [];
      if (decides('everywhere') || (!has && r.from.level === 'default')) states.push({ key: 'complete', text: 'In use here' });
      if (why && /back/.test(why) && !PSX.answering('homenas')) states.push({ key: 'offline', text: `Kept on Home NAS, which isn’t answering · as of ${PSX.W.asOf}` });
      const ln = line(id, r, { level: 'everywhere', key: null, name: 'Everywhere', value: has ? r.everywhere : DEFAULTS[id], valueText: has ? vt(id, r.everywhere) : `${vt(id, DEFAULTS[id])} · the default`, inUse: decides('everywhere'), states });
      if (why && /back/.test(why)) { const ch = ln.querySelector('[data-psx-key$=":change"]'); if (ch) ch.textContent = 'Change it when Home NAS is back'; }
      g.appendChild(ln);
    }
    // Computers (or Devices)
    const placeLevel = off.device ? 'device' : off.computer ? 'computer' : null;
    if (placeLevel === 'computer' && def.home === 'computer') {
      const g = mkGroup('Computers');
      Object.keys(COMPUTERS).forEach((k) => {
        g.appendChild(hostLine(id, r, k, false));
        Object.keys(HOSTS).filter((h) => HOSTS[h].parent === k).forEach((h) => g.appendChild(hostLine(id, r, h, true)));
      });
    } else if (placeLevel) {
      const g = mkGroup(placeLevel === 'device' ? 'Devices' : 'Computers');
      const list0 = own(placeLevel).filter((v) => placeLevel === 'device' ? DEVICES[v.key] : COMPUTERS[v.key]);
      const shown = list0.slice(0, MAX_LINES);
      const pending = editing && editing.id === id && editing.level === placeLevel && !list0.find((v) => v.key === editing.key) ? editing : null;
      shown.forEach((v) => {
        const states = [];
        const here = placeLevel === 'device' ? v.key === c.device : v.key === c.on;
        if (decides(placeLevel, v.key)) states.push({ key: 'complete', text: r.careful ? 'In use here, for safety' : 'In use here' });
        else if (here && r.ceiling && r.ceiling.key === v.key) states.push({ key: 'info', text: `The most ${c.project} can use here` });
        else if (here && r.from.level === 'project') states.push({ text: `Not used in ${c.project}: ${c.project} has its own.`, muted: true });
        const wr = PSX.writer(placeLevel, v.key);
        if (wr && !PSX.answering(wr)) states.push({ key: 'offline', text: `${placeName('computer', wr)} isn’t answering · last seen ${vt(id, v.value)}` });
        if (placeLevel === 'computer' && v.key === 'studio' && !PSX.W.studioJoined) states.push({ key: 'info', text: 'Not joined yet · set up on its own' });
        g.appendChild(line(id, r, { level: placeLevel, key: v.key, name: placeName(placeLevel, v.key), value: v.value, inUse: decides(placeLevel, v.key), states, removable: true }));
      });
      if (list0.length > MAX_LINES) g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">and ${list0.length - MAX_LINES} more</div>`);
      if (pending) g.appendChild(line(id, r, { level: placeLevel, key: pending.key, name: placeName(placeLevel, pending.key), value: pending.value, isNew: true }));
      const all = placeLevel === 'device' ? Object.keys(DEVICES) : Object.keys(COMPUTERS);
      const rest = all.filter((k) => !list0.find((v) => v.key === k) && !(pending && pending.key === k)).map((k) => placeName(placeLevel, k));
      if (rest.length) g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">${esc(list(rest, rest.length <= 3 ? 0 : 2))}: same as everywhere</div>`);
      g.appendChild(addButton(id, placeLevel, r));
    }
    // Projects
    if (off.project) {
      const g = mkGroup('Projects');
      const list0 = own('project');
      const pending = editing && editing.id === id && editing.level === 'project' && !list0.find((v) => v.key === editing.key) ? editing : null;
      list0.slice(0, MAX_LINES).forEach((v) => {
        const states = [];
        if (decides('project', v.key) && r.ceiling) states.push({ key: 'complete', text: `In use here, held to ${vt(id, r.ceiling.value)}` });
        else if (decides('project', v.key)) states.push({ key: 'complete', text: 'In use here' });
        else if (v.key === c.project && r.careful) states.push({ text: `Not used here: for safety ${placeName(r.careful.by.level, r.careful.by.key)}’s own is used.`, muted: true });
        const wr = PSX.writer('project', v.key);
        if (wr && !PSX.answering(wr)) states.push({ key: 'offline', text: `${placeName('computer', wr)} isn’t answering · last seen ${vt(id, v.value)}` });
        if (DEF[id].risk && v.value === false) states.push({ key: 'warning', text: DEF[id].risk.replace('this project', v.key) });
        g.appendChild(line(id, r, { level: 'project', key: v.key, name: v.key, value: v.value, inUse: decides('project', v.key), states, removable: def.home !== 'project' }));
      });
      if (list0.length > MAX_LINES) g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">and ${list0.length - MAX_LINES} more</div>`);
      if (pending) g.appendChild(line(id, r, { level: 'project', key: pending.key, name: pending.key, value: pending.value, isNew: true }));
      if (def.home === 'project') {
        if (!list0.length) g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">No project has its own yet.</div>`);
        if (!c.project) g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">Belongs to a project. Choose one below to see or change its value.</div>`);
        if (id === 'memory.assembly.project-rules') g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">For every project, see Rules for every project.</div>`);
      } else {
        const rest = PROJECTS.map((p) => p.id).filter((p) => !list0.find((v) => v.key === p) && !(pending && pending.key === p));
        if (rest.length) g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">${esc(list(rest, rest.length <= 3 ? 0 : 2))}: same as everywhere</div>`);
      }
      g.appendChild(addButton(id, 'project', r));
    }
    // owner rungs (MA-073): AI services, then accounts
    if (def.owner) {
      const g = mkGroup('AI services and accounts');
      const pv = r.varies.filter((v) => v.level === 'provider');
      g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">AI services: ${pv.length ? esc(pv.map((v) => `Claude ${v.value}`).join(', ')) : '(none)'}</div><div class="psx-wrest">Accounts: (none)</div>`);
    }
    // the reason sentence where a group isn't offered (never a muted line per level)
    const why = [];
    if (!off.project && def.home !== 'computer' && def.screen) why.push(PSX.REASONS.about_the_screen[0]);
    if (def.home === 'everywhere') why.push('');
    why.filter(Boolean).forEach((t) => sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule">${esc(t)}</p>`));
    if (def.safety) sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule">For safety, the more careful of a computer’s and a project’s own choice is used.</p>`);
    if (def.combine === 'computer_ceiling') sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule">For limits, a computer’s own value is the most any project there can use.</p>`);
    if (id === 'general.visual.theme') sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule">The look and light or dark always come from the same place; a project’s own look beats a device’s.</p>`);
    if (id === 'general.visual.reduce-animations') sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule">If your computer, this device or the project asks for less motion, motion is reduced.</p>`);
    if (def.chats || (!c.project && off.everywhere && def.home !== 'computer')) {
      const n = PSX.resolve(id, { project: 'none', device: c.device, on: c.on });
      sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule">Chats with no project use: ${esc(placeName(n.from.level, n.from.key))} (${esc(vt(id, n.value))}).</p>`);
    }
    // power actions, only when a difference exists
    const diffs = r.varies.filter((v) => v.level !== 'provider');
    if (diffs.length && off.everywhere && def.home !== 'project' && def.home !== 'everywhere' && def.home !== 'computer') {
      const p = D.createElement('div'); p.className = 'psx-power';
      const why2 = blockedWrite({ level: 'everywhere' });
      p.appendChild(btn('Make one the everywhere value…', 'Make one of these the everywhere value', 'power:make', why2, () => makeMenu(id, r, p.firstChild)));
      p.appendChild(btn('Use this everywhere', `Use ${vt(id, r.value)} everywhere`, 'power:use', why2, () => useEverywhere(id, r)));
      sec.appendChild(p);
    }
    return sec;
  }
  function hostLine(id, r, key, sub) {
    const w = PSX.W, def = DEF[id], c = PSX.ctxFull(S.ctx);
    const ownV = PSX.getAt(w, 'computer', key, id);
    const found = w.found[id] ? w.found[id][key] : undefined;
    const name = sub ? HOSTS[key].name : (HOSTS[key] ? HOSTS[key].full : placeName('computer', key));
    const states = [];
    let valueText;
    if (ownV !== undefined) { valueText = vt(id, ownV); states.push({ text: 'Set by you' }); }
    else if (found === null) { valueText = `${def.program || 'It'} isn’t installed`; states.push({ key: 'off', text: 'Not installed' }); }
    else if (found !== undefined) { valueText = found; states.push({ text: id === 'code.terminal.shell' ? 'My computer’s default' : 'Found automatically' }); }
    else valueText = vt(id, DEFAULTS[id]);
    if (r.from.level === 'computer' && r.from.key === key || (ownV === undefined && key === (c.host || c.on))) states.unshift({ key: 'complete', text: 'In use here' });
    if (HOSTS[key] && HOSTS[key].own) states.push({ text: 'an SSH computer Home NAS uses', muted: true });
    const wr = PSX.writer('computer', key);
    if (wr && !PSX.answering(wr)) states.push({ key: 'offline', text: `${placeName('computer', wr)} isn’t answering · last seen ${valueText}` });
    const el = line(id, r, { level: 'computer', key, name, value: ownV !== undefined ? ownV : (found || DEFAULTS[id]), valueText, states, removable: ownV !== undefined, sub: sub && !HOSTS[key].own, change: found !== null || ownV !== undefined });
    if (found === null && ownV === undefined) {
      const acts = el.querySelector('.psx-wacts') || el.appendChild(Object.assign(D.createElement('div'), { className: 'psx-wacts' }));
      acts.appendChild(btn(`Install on ${placeName('computer', key)}`, `Install ${def.program || 'it'} on ${placeName('computer', key)}`, `computer:${key}:install`, null, () => PSX.run('cmd.provider.install', [700, 600], () => { w.found[id][key] = '/opt/homebrew/bin/claude'; PSX.W.rev++; PSX.emit('world', {}); PSX.note({ title: `${def.program || 'It'} is installed on ${placeName('computer', key)}`, body: 'Found automatically there.', mark: 'complete' }); rerender(); })));
    }
    return el;
  }
  function addButton(id, level, r) {
    const b = btn(level === 'project' ? '+ Set for a project…' : level === 'device' ? '+ Set for a device…' : '+ Set for a computer…', level === 'project' ? 'Set it for a project' : level === 'device' ? 'Set it for a device' : 'Set it for a computer', 'add:' + level, null, () => addMenu(id, level, r, b));
    b.classList.add('psx-add'); b.setAttribute('aria-haspopup', 'menu');
    return b;
  }
  function addMenu(id, level, r, anchor) {
    const def = DEF[id];
    const have = new Set(r.varies.filter((v) => v.level === level).map((v) => v.key));
    let items;
    if (level === 'project') items = PROJECTS.map((p) => ({ label: p.id, meta: have.has(p.id) ? 'has its own already' : `works on ${placeName('computer', p.home)}`, disabled: have.has(p.id) ? 'Has its own already' : blockedWrite({ level: 'project', key: p.id }), run: () => startNew(id, 'project', p.id) }));
    else if (level === 'device') items = Object.keys(DEVICES).map((k) => ({ label: DEVICES[k].name, meta: have.has(k) ? 'has its own already' : 'its screen', disabled: have.has(k) ? 'Has its own already' : null, run: () => startNew(id, 'device', k) }));
    else items = Object.keys(COMPUTERS).map((k) => ({ label: COMPUTERS[k].name, meta: have.has(k) ? 'has its own already' : (k === 'studio' && !PSX.W.studioJoined ? 'not joined yet' : COMPUTERS[k].detail.split(' · ')[0]), disabled: have.has(k) ? 'Has its own already' : blockedWrite({ level: 'computer', key: k }), run: () => startNew(id, 'computer', k) }));
    // levels the row doesn't offer stay in the menu, focusable and greyed, with their short reason
    if (level === 'project' && def.screen === true && !(def.may || []).includes('project')) items = items.map((x) => Object.assign(x, { disabled: PSX.REASONS.about_the_screen[1] }));
    if (level !== 'device' && def.screen) items.push({ label: 'A computer', disabled: PSX.REASONS.about_the_screen[1] });
    PSX.menu(anchor, items, { label: level === 'project' ? 'Set for a project' : level === 'device' ? 'Set for a device' : 'Set for a computer', width: 280, search: items.length > 8 });
  }
  function startNew(id, level, key) {
    editing = { id, level, key, value: PSX.resolve(id, S.ctx).asked !== undefined ? PSX.resolve(id, S.ctx).asked : PSX.resolve(id, S.ctx).value, isNew: true };
    rerender();
    setTimeout(() => { const root = (PSX.panel.own && PSX.panel.own.isConnected ? PSX.panel.own : D.querySelector('#pm-settings-root .detail-inspector')); const f = root && root.querySelector('[data-psx-edit-control]'); if (f) f.focus(); }, 30);
  }
  function makeMenu(id, r, anchor) {
    const items = r.varies.filter((v) => v.level !== 'provider').map((v) => ({ label: `${placeName(v.level, v.key)}’s ${vt(id, v.value)}`, run: () => promote(id, v) }));
    PSX.menu(anchor, items, { label: 'Make one the everywhere value', width: 300 });
  }
  function promote(id, v) {
    const f = followers(id, v.value);
    PSX.sheet({
      title: `Make ${vt(id, v.value)} the everywhere value?`, kicker: label(id),
      body: `<p class="psx-p">${mark('info')} <b>${esc(list(f.changes, 5) || 'No project')}</b> ${f.changes.length === 1 ? 'will use' : f.changes.length ? 'will use' : 'changes'} ${esc(vt(id, v.value))}. ${f.keeps.length ? esc(list(f.keeps)) + (f.keeps.length === 1 ? ' keeps its own.' : ' keep their own.') : ''}</p><p class="psx-p">${esc(placeName(v.level, v.key))}’s own value is no longer needed and is taken away in the same change.</p>`,
      actions: [{ label: 'Cancel', run: (s) => s.close() }, { spacer: true }, { label: 'Make it everywhere', primary: true, run: (s) => {
        s.close();
        const tx = PSX.apply([{ level: 'everywhere', key: null, id, value: v.value }, { level: v.level, key: v.key, id, value: undefined }], { batch: 'promote', text: `${label(id)}: ${placeName(v.level, v.key)}’s ${vt(id, v.value)} made the everywhere value` });
        PSX.feed.push();
        PSX.note({ title: 'Saved for everywhere.', body: `${f.changes.length} project${f.changes.length === 1 ? '' : 's'} now use ${vt(id, v.value)}.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, id) }] });
      } }]
    });
  }
  function useEverywhere(id, r) {
    const own = r.varies.filter((v) => v.level !== 'provider');
    const value = r.asked !== undefined ? r.asked : r.value;
    PSX.sheet({
      title: `Use ${vt(id, value)} everywhere?`, kicker: label(id),
      body: `<p class="psx-p">${mark('info')} Everywhere takes ${esc(vt(id, value))}, and every own value of this setting is taken away:</p><ul class="psx-list">${own.map((v) => `<li class="psx-li"><span class="psx-li-name">${esc(placeName(v.level, v.key))}</span><span class="psx-li-end psx-muted">${esc(vt(id, v.value))} → ${esc(vt(id, value))}</span></li>`).join('')}</ul>`,
      actions: [{ label: 'Cancel', run: (s) => s.close() }, { spacer: true }, { label: 'Use it everywhere', primary: true, run: (s) => {
        s.close();
        const writes = [{ level: 'everywhere', key: null, id, value }].concat(own.map((v) => ({ level: v.level, key: v.key, id, value: undefined })));
        const tx = PSX.apply(writes, { batch: 'use-everywhere', text: `${label(id)}: ${vt(id, value)} everywhere, ${own.length} own value${own.length === 1 ? '' : 's'} taken away` });
        PSX.feed.push();
        PSX.note({ title: 'Saved for everywhere.', body: `${own.length} own value${own.length === 1 ? ' was' : 's were'} taken away.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, id) }] });
      } }]
    });
  }

  /* ------------------------------------------------------------------ Choosing here changes */
  function insertTarget(body, id, r) {
    if (r.notOffered) return;
    const blocks = [...body.querySelectorAll(':scope > section.o55-insp-block')];
    const choices = blocks.find((b) => b.querySelector('.o55-insp-choice')) || blocks.find((b) => /^(Your choices|Choose any)$/i.test((b.querySelector('h4') || {}).textContent || ''));
    if (!choices) return;
    const tg = S.targets[id] || PSX.targetFor(id, r, S.ctx);
    if (!tg) return;
    const name = tg.level === 'everywhere' ? 'Everywhere' : tg.level === 'device' && tg.key === PSX.ctxFull(S.ctx).device ? 'this screen' : placeName(tg.level, tg.key);
    const div = D.createElement('div'); div.className = 'psx-target'; div.setAttribute('data-psx-block', 'target');
    div.innerHTML = `<span>Choosing here changes:</span>`;
    const b = D.createElement('button'); b.type = 'button'; b.className = 'psx-tb psx-target-btn'; b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('data-psx-key', 'target');
    b.setAttribute('aria-label', `Choosing here changes ${name}. Change where a choice goes`);
    b.innerHTML = `<span>${esc(name)}</span>${CHEV}`;
    b.addEventListener('click', () => targetMenu(id, r, b));
    div.appendChild(b);
    const h4 = choices.querySelector('h4');
    if (h4) h4.after(div); else choices.insertBefore(div, choices.firstChild);
  }
  function targetMenu(id, r, anchor) {
    const def = DEF[id], c = PSX.ctxFull(S.ctx), off = r.offered;
    const pick = (tg) => () => { S.targets[id] = tg; rerender({ focusKey: 'target' }); };
    const here = [];
    here.push({ label: 'Everywhere', disabled: off.everywhere && def.home !== 'computer' ? blockedWrite({ level: 'everywhere' }) : PSX.REASONS[def.reason || 'about_this_project'][1], run: pick({ level: 'everywhere', key: null }) });
    if (c.project) here.push({ label: `This project (${c.project})`, disabled: off.project ? blockedWrite({ level: 'project', key: c.project }) : PSX.REASONS[(PSX.reasons(def).project) || 'about_the_screen'][1], run: pick({ level: 'project', key: c.project }) });
    if (off.device) here.push({ label: 'This screen', run: pick({ level: 'device', key: c.device }) });
    else here.push({ label: `This computer (${placeName('computer', c.on)})`, disabled: off.computer ? blockedWrite({ level: 'computer', key: c.on }) : PSX.REASONS.same_for_you[1], run: pick({ level: 'computer', key: c.on }) });
    const groups = [{ label: 'Here', items: here }];
    if (off.project) groups.push({ label: 'Another project', items: PROJECTS.filter((p) => p.id !== c.project).map((p) => ({ label: p.id, disabled: blockedWrite({ level: 'project', key: p.id }), run: pick({ level: 'project', key: p.id }) })) });
    if (off.computer && !off.device) groups.push({ label: 'Another computer', items: Object.keys(COMPUTERS).filter((k) => k !== c.on).map((k) => ({ label: COMPUTERS[k].name, disabled: blockedWrite({ level: 'computer', key: k }), run: pick({ level: 'computer', key: k }) })) });
    if (off.device) groups.push({ label: 'Another device', items: Object.keys(DEVICES).filter((k) => k !== c.device).map((k) => ({ label: DEVICES[k].name, run: pick({ level: 'device', key: k }) })) });
    PSX.menu(anchor, groups, { label: 'Choosing here changes', width: 280, search: true });
  }

  /* ------------------------------------------------------------------ Recent changes */
  function historyLine(e, id) {
    const who = e.by === 'assistant' ? 'The assistant' : (DEVICES[e.from] || COMPUTERS[e.from] || { name: e.from }).name;
    const lvl = e.level === 'everywhere' ? 'Everywhere' : placeName(e.level, e.key);
    return `${e.when} · ${who} · ${lvl}: ${e.before === undefined ? 'set to ' + vt(id, e.after) : e.after === undefined ? vt(id, e.before) + ' taken away' : vt(id, e.before) + ' to ' + vt(id, e.after)}`;
  }
  function insertRecent(body, id) {
    const items = PSX.W.history.filter((e) => e.sid === id).slice(0, 3);
    if (!items.length) return;
    const sec = D.createElement('section'); sec.className = 'o55-insp-block psx-recent'; sec.setAttribute('data-psx-block', 'recent');
    sec.innerHTML = '<h4>Recent changes</h4>';
    items.forEach((e, i) => {
      const row = D.createElement('div'); row.className = 'psx-rline';
      row.innerHTML = `<span>${esc(historyLine(e, id))}</span>`;
      const holds = same(PSX.getAt(PSX.W, e.level, e.key, id), e.after);
      const lbl = holds ? 'Undo' : `Set it back to ${vt(id, e.before === undefined ? DEFAULTS[id] : e.before)}`;
      const b = btn(lbl, `${lbl}: ${historyLine(e, id)}`, `recent:${i}`, blockedWrite({ level: e.level, key: e.key }), () => {
        if (e.tx && holds) PSX.undoTx(e.tx, id);
        else PSX.setOwn(id, { level: e.level, key: e.key }, e.before);
      });
      row.appendChild(b);
      sec.appendChild(row);
    });
    const all = btn('See all changes', 'See all setting changes', 'recent:all', null, () => PSX.history.open());
    all.classList.add('psx-seeall');
    sec.appendChild(all);
    const tech = body.querySelector(':scope > details.o55-insp-tech');
    if (tech) body.insertBefore(sec, tech); else body.appendChild(sec);
  }

  /* ------------------------------------------------------------------ For experts */
  function experts(body, id) {
    const tb = body.querySelector('.o55-insp-techbody'); if (!tb) return;
    const def = DEF[id];
    const may = def.home === 'computer' ? `each Execution Host only (${def.reason})` : def.home === 'project' ? 'each project only (about_this_project)' : def.home === 'everywhere' ? 'nothing (same_for_you)' : (def.may || []).map((m) => m === 'computer' && def.combine === 'computer_ceiling' ? 'computer (at most)' : m === 'computer' && def.combine === 'more_careful' ? 'computer (more careful)' : m).join(', ');
    const kept = def.home === 'computer' ? 'each Server (its own Execution Hosts)' : def.home === 'project' ? 'each project’s Home Server' : def.screen ? 'Home NAS, the settings home (everywhere) · each device (its own)' + ((def.may || []).includes('project') ? ' · each project’s Home Server (its own)' : '') : 'Home NAS, the settings home (everywhere) · each Server (its own) · each project’s Home Server (its own)';
    const rows = D.createElement('div'); rows.setAttribute('data-psx-block', 'tech'); rows.className = 'psx-tech';
    rows.innerHTML = `<div><span>Can differ by</span><code>${esc(may)}</code></div><div><span>Kept on</span><code>${esc(kept)}</code></div><div><span>Command</span><code>cmd.settings.transaction.apply</code></div>`;
    const copy = tb.querySelector('.o55-textbtn');
    if (copy) tb.insertBefore(rows, copy); else tb.appendChild(rows);
  }

  /* ------------------------------------------------------------------ the layer's own panel (the Projects folder row):
     the Settings side sheet (PM51.panel) holding the same Where it applies block */
  function openOwn(id, opener) {
    if (!(W.PM51 && W.PM51.panel)) return;
    const wrap = W.PM51.panel({ title: label(id), eyebrow: 'Servers › Home & Location', subtitle: 'Where a new project’s folder is made', icon: 'folder', body: `<div class="psx-own" data-psx-own="${esc(id)}"></div>` });
    PSX.panel.own = wrap && wrap.querySelector('[data-psx-own]');
    PSX.panel.ownId = id;
    renderOwn();
  }
  function renderOwn(focusKey) {
    const host = PSX.panel.own; if (!host || !host.isConnected) return;
    const id = PSX.panel.ownId, r = PSX.resolve(id, S.ctx);
    const act = D.activeElement, keep = focusKey || (act && host.contains(act) && act.closest('[data-psx-key]') ? act.closest('[data-psx-key]').dataset.psxKey : null);
    host.innerHTML = `<div class="o55-insp-now${r.changed ? ' is-changed' : ''}"><div class="o55-insp-now-label">${esc(ctxLine(id, r))}</div><div class="o55-insp-now-value">${esc(r.from.level === 'computer' ? r.value : r.found || r.value)}</div><div class="psx-now-from"><span>${esc(fromLine(id, r))}</span>${r.changed ? `<span class="o55-changed">${mark('change-modified')}<span>Changed</span></span>` : ''}</div></div>`;
    host.appendChild(whereBlock(id, r, { context: 'own' }));
    host.insertAdjacentHTML('beforeend', `<p class="psx-wrule">A new project made to work on Home NAS goes to /volume1/projects/&lt;name&gt;, and New Project shows the whole path. Copy settings never moves it.</p>`);
    if (keep) { const f = host.querySelector(`[data-psx-key="${CSS.escape(keep)}"]`); if (f) f.focus({ preventScroll: true }); }
  }

  /* ------------------------------------------------------------------ wiring */
  let raf = 0;
  const soon = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; try { decorate(); } catch (e) { console.error('[psx panel]', e); } }); };
  function install() {
    const P = W.PM51;
    if (P && P.syncInspector && !P.syncInspector.__psx) {
      const base = P.syncInspector;
      const wrapped = function () {
        const keep = strip();
        const r = base.apply(this, arguments);
        try { decorate({ force: true, focusKey: keep.focusKey }); } catch (e) { console.error('[psx panel]', e); }
        return r;
      };
      wrapped.__psx = true;
      P.syncInspector = wrapped;
    }
    const insp = D.querySelector('#pm-settings-root .detail-inspector');
    if (insp && !insp.__psxObs) {
      let wasOpen = insp.getAttribute('aria-hidden') === 'false';
      insp.__psxObs = new MutationObserver(() => {
        const open = insp.getAttribute('aria-hidden') === 'false' && insp.style.display !== 'none';
        if (open) soon();
        if (wasOpen && !open) {
          editing = null; S.targets = {};
          // Esc closes the panel; focus returns to the row's end word
          const id = lastOpen;
          setTimeout(() => {
            const a = D.activeElement;
            if (!a || a === D.body || insp.contains(a) || !a.isConnected) {
              const b = [...D.querySelectorAll(`#pm-settings-root .o55-about[data-setting="${CSS.escape(id || '')}"]`)].find((x) => x.offsetParent !== null);
              if (b) try { b.focus({ preventScroll: true }); } catch (e) { /* gone */ }
            }
          }, 40);
        }
        wasOpen = open;
      });
      insp.__psxObs.observe(insp, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-hidden', 'class'] });
    }
  }
  /* Esc order: an inline edit, then a layer sheet, then the engine's panel (the engine's own listener is on document,
     so this one is on window, in the capture phase) */
  W.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (W.PMR && W.PMR.menu && W.PMR.menu.isOpen()) return;   // the menu closes first, by itself
    const a = D.activeElement;
    if (a && typeof a.__psxCancel === 'function') { e.preventDefault(); e.stopImmediatePropagation(); a.__psxCancel(); return; }
    const top = PSX.topSheet();
    if (top) { e.preventDefault(); e.stopImmediatePropagation(); top.close('esc'); return; }
  }, true);
  PSX.on('redraw', () => rerender());
  PSX.on('fed', () => rerender());
  PSX.on('ctx', () => { editing = null; rerender(); });
  PSX.panel = { decorate, strip, install, soon, openOwn, current, whereBlock, sentence, own: null, ownId: null, focusAfter: null, rerender };
})(window);

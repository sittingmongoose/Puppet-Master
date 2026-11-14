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
   ("Each account has its own", .o55-insp-now.is-per) keep the engine's Now; their Where it applies is the layer's same
   three parts (perWhere). */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.panel) return;
  const { D, DEF, DEFAULTS, COMPUTERS, HOSTS, DEVICES, PROJECTS, esc, mark, icon, label, vt, placeName, projectName, list, same, clone } = PSX;
  const S = PSX.S;
  const CHEV = '<svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const MAX_LINES = 6;
  let editing = null;      // { id, level, key, isNew }
  let lastOpen = null;     // the setting whose panel is open, for focus on close

  /* ------------------------------------------------------------------ writing one level, with its note
     Every write here goes through the one write path (guard.js): first start, the device in use, the level, the value,
     the writer and pairing are checked there, the same as for a row, a copy, a batch or an Undo. */
  function blockedWrite(tg, id, value) {
    const y = PSX.guard.why({ level: tg.level, key: tg.key, id: id || '', value: id ? value : undefined });
    if (!y) return null;
    if (y.kind === 'offline' && tg.level === 'everywhere') return `Change it when ${PSX.homeName()} is back`;
    if (y.kind === 'offline' && tg.level === 'project') return `${tg.key}’s settings can be changed when ${placeName('computer', y.wr)} answers`;
    return y.text;
  }
  /* where the value comes from after a level's own is taken away, in words */
  function fromWords(id, r) {
    if (r.ceiling) return `held by ${placeName('computer', r.ceiling.key)}’s limit`;
    if (r.careful) return `for safety, ${placeName(r.careful.by.level, r.careful.by.key)}’s own`;
    if (r.from.level === 'computer') return `from ${placeName('computer', r.from.key)}`;
    if (r.from.level === 'device') return `from ${placeName('device', r.from.key)}`;
    if (r.from.level === 'project') return `${r.from.key}’s own`;
    if (r.from.level === 'provider') return `${placeName('provider', r.from.key)}’s own`;
    return r.from.level === 'everywhere' ? 'from everywhere' : 'Puppet Master’s default';
  }
  /* the context a line of Where it applies speaks for */
  function lineCtx(level, key) {
    const c = PSX.ctxFull(S.ctx);
    if (level === 'project') return { project: key, device: c.device, on: null };
    if (level === 'computer') return { project: 'none', device: c.device, on: key };
    if (level === 'device') return { project: 'none', device: key, on: c.on };
    return S.ctx;
  }
  /* "Same as everywhere" only when that is what taking the own value away gives; otherwise say what it does */
  function removeAction(id, level, key, name) {
    const w1 = clone(PSX.W); PSX.putAt(w1, level, key, id, undefined);
    const r = PSX.resolve(id, lineCtx(level, key), w1);
    const follows = !r || r.from.level === 'everywhere' || r.from.level === 'default';
    return follows ? { label: 'Same as everywhere', aria: `Make ${name} the same as everywhere` } : { label: `Take away ${name}’s own`, aria: `Take away ${name}’s own value; it then uses ${vt(id, r.value)}, ${fromWords(id, r)}` };
  }
  PSX.setOwn = function (id, tg, value, o) {
    o = o || {};
    const writes = [{ level: tg.level, key: tg.key, id, value }];
    const a = PSX.guard.admit(writes);
    if (!a.clear) { const m = a.missed[0]; PSX.note({ title: 'Not saved', body: `${blockedWrite(tg, id, value) || m.text}. Nothing was saved or queued.`, mark: m.kind === 'offline' ? 'offline' : 'info', kind: 'refused' }); return null; }
    if (tg.level === 'everywhere' && value !== undefined && PSX.check) {
      const blocked = PSX.check.everywhere(id, value);
      if (blocked) { PSX.check.refuse(id, value, PSX.getAt(PSX.W, 'everywhere', null, id), blocked); return null; }
    }
    const c = PSX.ctxFull(S.ctx);
    const go = (y) => doSet(id, tg, value, Object.assign({}, o, { yolo: !!(y && y.yolo), yoloBody: y && y.body }));
    if (!o.confirmed && PSX.check.needs(id, writes)) return PSX.check.preview(id, writes, go, { narrow: tg.level === 'everywhere' && c.project && DEF[id].may && DEF[id].may.includes('project') ? { level: 'project', key: c.project } : null });
    return go();
  };
  function doSet(id, tg, value, o) {
    const c = PSX.ctxFull(S.ctx);
    const before = PSX.getAt(PSX.W, tg.level, tg.key, id);
    const tx = PSX.write([{ level: tg.level, key: tg.key, id, value }], { by: o.by || 'you', yolo: !!o.yolo });
    if (!tx || o.quiet) return tx;
    const where = tg.level === 'device' && tg.key === c.device ? 'this screen' : placeName(tg.level, tg.key);
    let title, body;
    if (value === undefined) {
      if (tg.level === 'everywhere') { title = `${label(id)} is back to the default everywhere.`; body = before !== undefined ? `Everywhere had ${vt(id, before)}.` : ''; }
      else {
        const after = PSX.resolve(id, lineCtx(tg.level, tg.key));
        const follows = after.from.level === 'everywhere' || after.from.level === 'default';
        title = follows ? `${where} follows everywhere again.` : `${where}’s own is taken away.`;
        body = `It had its own: ${vt(id, before)}.${follows ? '' : ` It now uses ${vt(id, after.value)}, ${fromWords(id, after)}.`}`;
      }
    } else { title = `Saved for ${tg.level === 'everywhere' ? 'everywhere' : where}.`; body = `${label(id)}: ${vt(id, value)}.`; }
    if (o.yolo) body += ` ${o.yoloBody ? o.yoloBody + ' ' : ''}YOLO didn’t ask for a yes.`;
    PSX.note({ title, body, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, id) }], kind: 'saved' });
    return tx;
  }

  /* ------------------------------------------------------------------ 1.7: an Everywhere change is checked against
     every context that follows it; safety rows are previewed first. [Demo only]: harbor's Codex account has 12% left.
     The check runs over every project whose value in use would change (PSX.simulate), against what each can take. */
  const HARBOR_CODEX_LEFT = 12;
  const FOLLOWER_LIMITS = [{ id: 'ai.accounts.hard-switch-level', project: 'harbor', test: (v) => Number(v) >= HARBOR_CODEX_LEFT, why: 'its Codex account would switch at once' }];
  function followers(id, value) {
    const sim = PSX.simulate([{ level: 'everywhere', key: null, id, value }], id);
    return { changes: sim.changes.map((r) => r.project), keeps: sim.keeps.map((r) => r.project), sim };
  }
  PSX.followers = followers;
  PSX.check = {
    everywhere(id, value) {
      const lim = FOLLOWER_LIMITS.filter((x) => x.id === id); if (!lim.length) return null;
      const f = followers(id, value);
      const hit = lim.find((x) => f.changes.includes(x.project) && x.test(value));
      return hit ? { project: hit.project, why: hit.why, left: HARBOR_CODEX_LEFT } : null;
    },
    /* a project that can't take the change refuses it, in both run modes; YOLO never picks "except harbor" itself */
    refuse(id, value, old, b) {
      const keep = PSX.resolve(id, { project: b.project }).value;
      PSX.confirm({
        title: `${label(id)} wasn’t changed everywhere`, kicker: 'Checked before it was saved',
        body: `<p class="psx-p">${mark('blocked')} <b>${esc(b.project)} can’t use this:</b> ${esc(b.why)}. Every project that follows your everywhere value was checked first, and ${esc(b.project)} is the first one it would stop.</p><p class="psx-p">You can change it everywhere except ${esc(b.project)}: ${esc(b.project)} keeps ${esc(vt(id, keep))} as its own, in the same change.</p>`,
        guard: `A project that can’t take a change refuses it, in YOLO too, and YOLO never chooses “except ${b.project}” by itself.`,
        okLabel: `Change it everywhere except ${b.project}`,
        ok: () => {
          const tx = PSX.write([{ level: 'everywhere', key: null, id, value }, { level: 'project', key: b.project, id, value: keep }], { batch: 'except', text: `${label(id)}: ${vt(id, value)} everywhere, except ${b.project}` });
          if (tx) PSX.note({ title: 'Saved for everywhere.', body: `${b.project} keeps ${vt(id, keep)} as its own.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, id) }], kind: 'saved' });
          return tx;
        }
      });
    },
    /* which writes need a look first: a safety row changed everywhere, FileSafe turned off anywhere (one confirmation and
       the risk word, 4.4), or a removal that would leave a project less careful */
    needs(id, writes) {
      const def = DEF[id]; if (!def || !def.safety) return false;
      if (writes.some((x) => x.level === 'everywhere')) return true;
      if (def.risk && writes.some((x) => x.value === false)) return true;
      return PSX.simulate(writes, id).looser.length > 0;
    },
    preview(id, writes, ok, o) {
      o = o || {};
      const def = DEF[id], sim = PSX.simulate(writes, id);
      const ev = writes.find((x) => x.level === 'everywhere'), w0 = ev || writes[0];
      const fsOff = !!def.risk && writes.some((x) => x.value === false);
      const where = ev ? 'everywhere' : `for ${placeName(w0.level, w0.key)}`;
      const n = sim.changes.length;
      const keeps = sim.keeps.map((r) => r.project);
      const body = `<p class="psx-p">${mark(sim.looser.length || fsOff ? 'warning' : 'info')} <b>This changes ${n} project${n === 1 ? '' : 's'}.</b> ${keeps.length ? esc(list(keeps, 4)) + (keeps.length === 1 ? ' keeps its own value.' : ' keep their own values.') : ''}</p>`
        + PSX.guard.changeList(id, sim)
        + (sim.looser.length ? `<p class="psx-p">${mark('warning')} ${esc(list(sim.looser.map((r) => PSX.projectName(r.project))))} would be less careful.</p>` : '')
        + (fsOff ? `<p class="psx-p">${PSX.st('warning', 'Off ' + (ev ? 'everywhere' : 'for ' + placeName(w0.level, w0.key)))} FileSafe stops checking file and command changes there. The row keeps this word while it is off.</p>` : '')
        + `<p class="psx-p psx-muted">Safety settings are shown before they change.</p>`;
      const reportBody = n ? `It changed ${n} project${n === 1 ? '' : 's'}: ${list(sim.changes.map((r) => PSX.projectName(r.project)), 4)}.` : 'No project’s value in use changed.';
      return PSX.confirm({
        title: fsOff ? `Turn FileSafe off ${where}?` : w0.value === undefined ? `Take away ${label(id)}’s own value ${where}?` : `Change ${label(id)} ${where}?`,
        kicker: 'A safety setting', body,
        guard: fsOff ? 'Turning FileSafe off is never done without you: YOLO doesn’t skip this one.' : null,
        okLabel: fsOff ? 'Turn it off' : ev ? 'Change everywhere' : 'Change it',
        alt: o.narrow && w0.value !== undefined ? [{ label: `Only for ${o.narrow.key}`, run: () => PSX.setOwn(id, o.narrow, w0.value, { confirmed: true }) }] : [],
        ok: (y) => ok(Object.assign({}, y, { body: y && y.yolo ? reportBody : '' })),
        selfReport: true
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
    // a draft being typed is not a reason to redraw (it would lose the caret and the reason shown under it)
    const sig = JSON.stringify([id, PSX.W.rev, S.ctx, S.actor, S.runMode, S.opt.end, S.targets[id] || null, editing && [editing.id, editing.level, editing.key, editing.isNew, editing.error], S.firstStart]);
    if (!o.force && page.dataset.psxDone === sig && (body.querySelector('[data-psx-block="where"]') || !DEF[id])) return;
    const act = D.activeElement;
    const keep = o.focusKey || (act && page.contains(act) && act.closest('[data-psx-key]') ? act.closest('[data-psx-key]').dataset.psxKey : null);
    page.dataset.psxDone = sig;
    closeWord(head);
    const now = body.querySelector(':scope > .o55-insp-now');
    /* the page's per-thing view ("Each account has its own"): kept for a row that belongs to its thing. A row Plans'
       inventory puts on the ladder (Sign-in method, Cooldown, Use this service: Everywhere, a computer, a project) keeps
       the page's list of each one's value and gets Where it applies with its places, so each can be set (Jared
       2026-11-13 #3) */
    const laddered = !!(DEF[id] && DEF[id].inventory && (() => { const off = PSX.offered(DEF[id]); return off.computer || off.device || off.project; })());
    if (now && now.classList.contains('is-per') && !laddered) { perWhere(body, now, id); return; }
    if (!DEF[id]) { offWhere(body, now, id); return; }
    body.querySelectorAll('[data-psx-block]').forEach((n) => n.remove());
    const r = PSX.resolve(id, S.ctx);
    if (!(now && now.classList.contains('is-per'))) rewriteNow(now, id, r);
    hideEngineWhere(body);
    const where = whereBlock(id, r, { context: 'panel' });
    if (now) now.after(where); else body.insertBefore(where, body.firstChild);
    insertTarget(body, id, r);
    insertRecent(body, id);
    experts(body, id);
    if (keep) { const f = page.querySelector(`[data-psx-key="${CSS.escape(keep)}"]`); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* gone */ } }
    // a row's Change in place of a control that can't hold its value (rows.js): the editor opens where the value comes from
    if (pendingEdit && pendingEdit.id === id) { const pe = pendingEdit; pendingEdit = null; setTimeout(() => startAt(id, pe.level, pe.key), 0); }
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

  /* a row that belongs to one thing (an account's nickname, a service's sign-in way): the base page lists each thing's
     value in Now; Where it applies takes the same three parts as every other panel (Jared #8) */
  function perWhere(body, now, id) {
    body.querySelectorAll(':scope > [data-psx-block="where"]').forEach((n) => n.remove());
    const eng = [...body.querySelectorAll(':scope > section.o55-insp-block')].find((x) => /^Where it applies$/i.test(((x.querySelector('h4') || {}).textContent || '').trim()));
    const m = /Each ([\w ]+?) can have its own/i.exec(eng ? eng.textContent : '') || /Each ([\w ]+?) has its own/i.exec(now.textContent || '');
    const thing = m ? m[1].toLowerCase().replace(/^ai service$/, 'AI service') : 'one';
    hideEngineWhere(body);
    const sec = D.createElement('section');
    sec.className = 'o55-insp-block psx-where'; sec.setAttribute('data-psx-block', 'where'); sec.setAttribute('data-psx-key', 'where');
    sec.setAttribute('data-psx-owner', 'per'); sec.setAttribute('data-psx-owner-name', `each ${thing}`);
    sec.innerHTML = `<h4>Where it applies</h4><p class="psx-where-sentence">Each ${esc(thing)} has its own.</p>`;
    const slot = (title, slotKey, text, bare) => sec.insertAdjacentHTML('beforeend', `<div class="psx-group is-not" role="group" aria-label="${esc(title)}" data-psx-slot="${slotKey}">${bare ? '' : `<div class="psx-ghead">${esc(title)}</div>`}<div class="psx-wnot">${bare ? `<span class="psx-wname">${esc(title)}</span>` : ''}<span class="psx-wnot-why">${esc(text)}</span></div></div>`);
    slot('Everywhere', 'everywhere', `Not one value for everywhere, because each ${thing} has its own. Each one’s value is listed above.`, true);
    // inventory alignment: a key or a sign-in kept by its account or service says where it stays
    const secret = !!(id && (PSX.offLadder || {}).credential && PSX.offLadder.credential.test(id));
    slot('Computers', 'computer', `Not per computer: it belongs to the ${thing}.${secret ? ' A key or sign-in stays on the computer where you entered it, and is never copied.' : ''}`);
    slot('Projects', 'project', `Not per project: it belongs to the ${thing}.${thing === 'account' ? ' A project chooses which accounts it uses, in its AI accounts.' : ''}`);
    now.after(sec);
  }

  /* rows the layer keeps off the ladder still get the same three parts (Jared #8): the look's details (Light or dark,
     the wallpaper, glass, the colour scheme, the chat layout) go with the look, so they follow where Theme comes from;
     a key or a sign-in stays on the computer where it was entered. Any other row keeps the base page's sentence. */
  function offWhere(body, now, id) {
    const off = PSX.offLadder || {};
    const look = off.look && off.look.test(id), cred = !look && off.credential && off.credential.test(id);
    const lib = (off.library || []).includes(id);
    if (lib) { libraryWhere(body, now, id); return; }
    const own = OWNER_VIEWS[(off.owned || {})[id]];
    if (own) { ownerWhere(body, now, own); return; }
    /* inventory alignment: every owner-held row (Plans' inventory home: thing) names its owner, in the same three parts
       and with no Change. A field of one account or one service keeps the base page's list of each one's value */
    if (!look && PSX.ownerHeld && PSX.ownerHeld(id)) {
      const eng = [...body.querySelectorAll(':scope > section.o55-insp-block')].find((x) => /^Where it applies$/i.test(((x.querySelector('h4') || {}).textContent || '').trim()));
      if (eng && now && /Each [\w ]+? can have its own/i.test(eng.textContent)) { perWhere(body, now, id); return; }
      ownerWhere(body, now, ownerFacts(id)); return;
    }
    if (!look && !cred) {
      // a row that belongs to one thing but is drawn as a plain row: the same three parts as an account's own rows
      const eng = [...body.querySelectorAll(':scope > section.o55-insp-block')].find((x) => /^Where it applies$/i.test(((x.querySelector('h4') || {}).textContent || '').trim()));
      if (eng && now && /Each [\w ]+? can have its own/i.test(eng.textContent)) perWhere(body, now, id);
      return;
    }
    body.querySelectorAll(':scope > [data-psx-block="where"]').forEach((n) => n.remove());
    hideEngineWhere(body);
    const sec = D.createElement('section');
    sec.className = 'o55-insp-block psx-where'; sec.setAttribute('data-psx-block', 'where'); sec.setAttribute('data-psx-key', 'where');
    const slot = (title, slotKey, html, bare) => sec.insertAdjacentHTML('beforeend', `<div class="psx-group is-not" role="group" aria-label="${esc(title)}" data-psx-slot="${slotKey}">${bare ? '' : `<div class="psx-ghead">${esc(title)}</div>`}<div class="psx-wnot">${bare ? `<span class="psx-wname">${esc(title)}</span>` : ''}${html}</div></div>`);
    const why = (t) => `<span class="psx-wnot-why">${esc(t)}</span>`;
    if (look) {
      const r = PSX.resolve('general.visual.theme', S.ctx);
      const fromTxt = r.from.level === 'project' ? `${r.from.key}’s own look` : r.from.level === 'device' ? `${placeName('device', r.from.key)}’s own look` : 'the same everywhere';
      sec.innerHTML = `<h4>Where it applies</h4><p class="psx-where-sentence">It goes with the look and follows Theme, which is ${esc(fromTxt)} here.</p>`;
      slot('Everywhere', 'everywhere', why('It follows Theme’s everywhere look.'), true);
      slot('Devices', 'device', `<p class="psx-wwhy">${esc(PSX.REASONS.about_the_screen[0])}</p>` + why('It follows Theme on each device.'));
      // inventory alignment: a look detail the inventory keeps off a project says so, with its own reason
      const Lk = PSX.layerOf(id), projOk = !Lk || (Lk.may_differ_by || []).includes('project');
      slot('Projects', 'project', projOk ? why('It follows Theme in a project with its own look.') : why(`Not per project: ${(PSX.REASONS[(Lk.not_offered || {}).project] || PSX.REASONS.about_the_screen)[0].replace(/^This/, 'this')}`));
      const b = D.createElement('div'); b.className = 'psx-power';
      b.appendChild(btn('Open Theme', 'Open Theme’s Where it applies', 'open-theme', null, () => { try { W.PM51.revealSetting('general.visual.theme', { detail: true }); } catch (e) { /* not drawn */ } }));
      sec.appendChild(b);
    } else {
      sec.innerHTML = `<h4>Where it applies</h4><p class="psx-where-sentence">Kept on the computer that uses it.</p>`;
      slot('Everywhere', 'everywhere', why('Not one value for everywhere: a key or a sign-in stays on the computer where you entered it.'), true);
      slot('Computers', 'computer', why('Each computer keeps its own, and it is never copied to another computer.'));
      slot('Projects', 'project', why('Not per project: a project chooses which account it uses, never the key itself.'));
    }
    if (now) now.after(sec); else body.insertBefore(sec, body.firstChild);
  }

  /* a library (your own themes, your sounds): a button that opens it, not a value. Now says what it is and Where it
     applies has the three parts with their reasons only: no value line and no Change (review A-r1 finding 5) */
  function libraryWhere(body, now, id) {
    body.querySelectorAll(':scope > [data-psx-block="where"]').forEach((n) => n.remove());
    hideEngineWhere(body);
    if (now) {
      const l = now.querySelector('.o55-insp-now-label'), v = now.querySelector('.o55-insp-now-value'), f = now.querySelector('.o55-insp-now-foot');
      if (l) l.textContent = 'Your library';
      if (v) v.textContent = 'Kept with your settings';
      if (f && !f.hasAttribute('data-psx-hidden')) { f.hidden = true; f.setAttribute('data-psx-hidden', ''); }
      now.classList.remove('is-changed');
    }
    const sec = D.createElement('section');
    sec.className = 'o55-insp-block psx-where'; sec.setAttribute('data-psx-block', 'where'); sec.setAttribute('data-psx-key', 'where');
    sec.setAttribute('data-psx-owner', 'library'); sec.setAttribute('data-psx-owner-name', 'your library');
    sec.innerHTML = `<h4>Where it applies</h4><p class="psx-where-sentence">Same everywhere.</p>`;
    const slot = (title, slotKey, text, bare) => sec.insertAdjacentHTML('beforeend', `<div class="psx-group is-not" role="group" aria-label="${esc(title)}" data-psx-slot="${slotKey}">${bare ? '' : `<div class="psx-ghead">${esc(title)}</div>`}<div class="psx-wnot">${bare ? `<span class="psx-wname">${esc(title)}</span>` : ''}<span class="psx-wnot-why">${esc(text)}</span></div></div>`);
    slot('Everywhere', 'everywhere', 'One library for every project and computer: it’s kept with your settings.', true);
    slot('Computers', 'computer', 'Not per computer: every computer uses the same library.');
    slot('Projects', 'project', 'Not per project, for the same reason.');
    if (now) now.after(sec); else body.insertBefore(sec, body.firstChild);
  }

  /* review S1: a row kept inside its owner keeps its owner's own words: where the owner keeps what it is about, with the
     same three parts as every panel (Jared #8) and no Change anywhere, since no ordinary level takes it (Plans'
     inventory home: thing, every level set_inside_a_thing; SSYS-059). The Rules file: Permissions keeps your rules in
     their owner homes, and ~/.config/puppet-master/permissions.toml is a read-only projection of the Everywhere rules,
     never a second writer; a Computer's rules stay with that Computer's own rules, and a Project's are in the
     project's own .puppet-master/permissions.toml (Permissions_System §9 and PS-144) */
  const OWNER_VIEWS = {
    permissions_projection: {
      kind: 'projection', owner: 'Permissions',
      now: 'Kept by Permissions · a read-only copy',
      sentence: 'Your rules are kept by Permissions. This file is a read-only copy of your everywhere rules: change a rule in Permissions, never in the file.',
      everywhere: 'Your everywhere rules are kept with your settings, and only there. Puppet Master keeps this file in step with them so tools that read TOML can see them; it is never a second place to change them.',
      computer: 'Not per computer: a computer’s own rules stay with that computer’s rules in Permissions, not in this file.',
      project: 'Not per project: a project’s own rules are in that project’s own .puppet-master/permissions.toml.'
    }
  };
  /* inventory alignment: who keeps each owner-held row, in plain words, from what the row is (its description in Plans'
     inventory). The most specific entry first; a prefix ends in "." or "-". A row none of these name says its owner's
     page, from the inventory's group title */
  const OWNERS = [
    ['general.interaction.chat-eli5', 'each chat'], ['general.interaction.assistant-mode', 'each chat'], ['general.interaction.thread-archive-days', 'your chat history'],
    ['ai.accounts.', 'each AI account'],
    ['ai.models.goal-', 'Goals'], ['ai.models.lane-bindings', 'the work lanes'], ['ai.models.per-lane-', 'the work lanes'], ['ai.models.execution-role', 'each run'],
    ['ai.models.custom-variants', 'your own presets'], ['ai.models.model-alias', 'your model nicknames'],
    ['safety.rules.chat-mode', 'each chat'], ['safety.rules.scope-selector', 'the rules editor'],
    ['code.editing.formatter-', 'the formatter list'], ['code.editing.lsp-', 'the language server list'],
    ['code.execution.run-mode', 'each agent run'], ['code.execution.execution-strategy', 'each agent run'], ['code.execution.strategy-override', 'each agent run'], ['code.execution.mode-overlay', 'each agent run'],
    ['code.execution.dockerhub-', 'your Docker Hub sign-in'], ['code.execution.enterprise-registries', 'your company registry list'], ['code.execution.registry-credentials', 'your company registry list'],
    ['code.execution.ssh-remotes', 'your list of SSH computers'], ['code.execution.ssh-keys', 'your SSH key list'], ['code.execution.server-sign-in', 'each server’s pairing'],
    ['code.execution.debug-configurations', 'your debug profiles'], ['code.execution.maintainer-', 'your publisher profile'],
    ['memory.assembly.app-rules', 'your rules for every project'],
    ['planning.interview.', 'this wizard session'],
    ['planning.verification.goal-template', 'each Goal template'], ['planning.verification.receipt-type', 'each finished Goal'], ['planning.verification.goal-write-mode', 'each Goal'],
    ['branching.worktrees.git-push-', 'each code service’s sign-in'], ['branching.worktrees.commit-signing-key', 'your signing setup'], ['branching.worktrees.', 'the project you contribute to'],
    ['web.providers.', 'each web service'], ['web.fetch.browser-', 'the protected browser profile'], ['web.fetch.proxy-credentials', 'your proxy sign-in'],
    ['personas.library.active-persona', 'each chat'], ['personas.library.core-personas', 'the persona library'], ['personas.library.disabled-bundled', 'the persona library'],
    ['personas.library.custom-scope', 'the persona library'], ['personas.library.ask-by-name', 'the persona library'], ['personas.', 'each persona'],
    ['extensions.skills.sort', 'the skill list'], ['extensions.skills.search', 'the skill list'], ['extensions.skills.your-skills', 'the skill list'], ['extensions.skills.', 'each skill'],
    ['extensions.plugins.packages', 'the plugin list'], ['extensions.plugins.', 'each plugin'],
    ['extensions.commands.search-shortcuts', 'the shortcut list'], ['extensions.commands.custom-commands', 'your command list'], ['extensions.commands.', 'each command'],
    ['system.health.', 'the Doctor'], ['system.mcp.server-list', 'your MCP server list'], ['system.mcp.', 'each MCP server'],
    ['system.advanced.config-format', 'your settings file']
  ];
  const ownerOf = (id) => {
    const m = OWNERS.find(([k]) => (/[.-]$/.test(k) ? String(id).startsWith(k) : id === k));
    if (m) return m[1];
    const g = PSX.groupOf && PSX.groupOf(id);
    return g ? `its owner in ${g}` : 'its owner';
  };
  /* an action: it runs when you choose it, and keeps nothing, so it has no place. Astra max N1: it still has an owner,
     the list, page or thing it acts on, and its panel names it ("It belongs to your company registry list"). Where that
     owner is a place of its own, the panel opens it: a row to reveal, or the Settings search box. Every action Plans'
     inventory lists is here by id; a new one falls back to ownerOf (its owner's page). The libraries keep their own view */
  const ACTION_OWNERS = {
    // the three libraries are actions too; their panel is libraryWhere's, "your library"
    'general.visual.manage-custom-themes': ['your library'], 'general.interaction.sound-catalog': ['your library'], 'general.interaction.sound-management': ['your library'],
    'general.interaction.settings-search': ['the search box at the top of Settings', { search: true, label: 'Go to the search box' }],
    'general.interaction.history-compare': ['each item in the History timeline'],
    'general.interaction.history-export': ['your History'],
    'general.interaction.history-rebuild': ['History’s search'],
    'general.startup.reset-home-layout': ['the window’s layout'],
    'ai.accounts.provider-connections': ['your list of AI services'],
    'ai.accounts.github-connect': ['your GitHub account'],
    'ai.accounts.set-preferred-account': ['the next run'],
    'ai.accounts.opencode-add-server': ['your OpenCode servers'],
    'ai.accounts.switch-history': ['the log of account switches'],
    'ai.accounts.opencode-server-actions': ['each OpenCode server'],
    'ai.models.requested-effective-inspector': ['each run'],
    'ai.usage.provider-health': ['each AI service’s status'],
    'ai.usage.refresh-models': ['each AI service’s model list'],
    'ai.usage.quota-management': ['your quota and budget limits'],
    'ai.usage.pressure-history': ['the log of rate-limit pressure'],
    'safety.approvals.recovery-actions': ['each blocked action'],
    'safety.approvals.debug-profile-disclosure': ['the debug automation profile'],
    'code.terminal.import-scheme': ['your terminal colour schemes'],
    'code.editing.formatter-custom': ['the formatter list'],
    'code.editing.lsp-custom-servers': ['the language server list'],
    'code.editing.lsp-restart': ['the running language servers'],
    'code.execution.dockerhub-signin': ['your Docker Hub sign-in'],
    'code.execution.create-repository': ['your Docker Hub account'],
    'code.execution.registry-credentials': ['your company registry list', { row: 'code.execution.enterprise-registries', label: 'Open your company registry list' }],
    'code.execution.unraid-repo-setup': ['your Unraid template repository'],
    'code.execution.unraid-review-state': ['your Unraid template repository'],
    'code.execution.edit-publisher-xml': ['your publisher profile'],
    'memory.limits.manual-compact': ['each chat'],
    'planning.interview.requirements-upload-order': ['this wizard session'],
    'planning.testing.session-actions': ['each running test session'],
    'branching.worktrees.clean-workspace-now': ['this project’s workspace'],
    'branching.worktrees.thread-worktree-binding': ['each chat'],
    'branching.worktrees.recovery-tools': ['this project’s branches and workspaces'],
    'branching.worktrees.clean-all-worktrees': ['this project’s workspaces'],
    'branching.subagents.agent-control-envelope': ['each helper agent'],
    'branching.subagents.child-agent-lease': ['each running Goal'],
    'web.providers.web-api-keys': ['each web service'],
    'web.index.rebuild': ['the project search index'],
    'web.index.disk-usage': ['the project search index'],
    'web.index.evict-cache': ['the project search index'],
    'personas.library.persona-manager': ['the persona list'],
    'personas.tools.skipped-controls-audit': ['each persona’s recent runs'],
    'extensions.skills.rescan': ['the skill list'],
    'extensions.skills.preview': ['each skill'],
    'extensions.skills.pattern-permissions': ['the skill list'],
    'extensions.skills.validate': ['the skill list'],
    'extensions.plugins.add-from-catalog': ['the plugin list'],
    'extensions.plugins.add-local': ['the plugin list'],
    'extensions.plugins.remove': ['the plugin list'],
    'extensions.commands.reset-shortcuts': ['your shortcuts'],
    'extensions.commands.backup-shortcuts': ['your shortcuts'],
    'system.health.run-doctor': ['the Doctor'],
    'system.health.platform-diagnostics': ['the Doctor'],
    'system.mcp.health-status': ['each MCP server'],
    'system.mcp.sign-out': ['each MCP server'],
    'system.mcp.oauth-refresh': ['each MCP server'],
    'system.mcp.debug-surface': ['each MCP server'],
    'system.advanced.reset-defaults': ['your settings'],
    'system.advanced.export-settings': ['your settings'],
    'system.advanced.import-settings': ['your settings'],
    'system.advanced.binary-rescan': ['the apps found on each computer'],
    'system.advanced.chat-history-retention': ['each chat'],
    'system.advanced.preserved-terminal-runs': ['your History'],
    'system.advanced.request-storage-compaction': ['the storage service'],
    'system.advanced.inspect-holds-quarantine': ['the storage service']
  };
  function actionFacts(id) {
    const a = ACTION_OWNERS[id], owner = a ? a[0] : ownerOf(id), open = a && a[1] ? a[1] : null;
    return {
      kind: 'action', owner, open, now: 'An action, not a setting',
      sentence: `An action, not a setting: it runs when you choose it, so it has no place to set. It belongs to ${owner}.`,
      everywhere: 'Not a value for everywhere: nothing is kept.',
      computer: 'Not per computer: it runs when you choose it.',
      project: 'Not per project: it runs when you choose it.'
    };
  }
  // the owner's own place, from the panel's link
  function openOwner(open) {
    if (!open) return;
    if (open.search) { const box = [...D.querySelectorAll('#pm-settings-root input[data-global-search]')].find((x) => x.getClientRects().length) || D.querySelector('#pm-settings-root input[data-global-search]'); if (box) { try { box.focus(); box.select(); } catch (e) { /* gone */ } } return; }
    if (open.row && W.PM51 && W.PM51.revealSetting) W.PM51.revealSetting(open.row, { detail: true });
  }
  /* what an owner-held row's panel says, without drawing it (the check reads it for every owner-held row) */
  function ownerFacts(id) {
    const special = OWNER_VIEWS[(((PSX.offLadder || {}).owned) || {})[id]]; if (special) return special;
    const type = PSX.layering && PSX.layering.types[id], s = W.PM51 && W.PM51.setting ? W.PM51.setting(id) : null;
    if (type === 'action' || (!type && s && /^(action|resource)$/.test(String(s.control || '')))) return actionFacts(id);
    const L = PSX.layerOf(id), owner = ownerOf(id);
    const perProject = !!(L && (L.may_differ_by || []).includes('project'));
    const secret = !!((PSX.offLadder || {}).credential && PSX.offLadder.credential.test(id));
    return {
      kind: 'owned', owner, now: `Kept by ${owner}`,
      sentence: `Kept by ${owner}, and set there: it isn’t a setting with a place of its own.`,
      everywhere: `Not one value for everywhere: ${owner} keeps it.`,
      computer: secret ? `Not per computer: ${owner} keeps it, and a key or sign-in stays on the computer where you entered it.` : `Not per computer: ${owner} keeps it.`,
      project: perProject ? `A project can choose its own, inside ${owner}.` : `Not per project: ${owner} keeps it.`
    };
  }
  function ownerWhere(body, now, v) {
    body.querySelectorAll(':scope > [data-psx-block="where"]').forEach((n) => n.remove());
    hideEngineWhere(body);
    /* inventory alignment: an owner-held row takes no value in Settings (its owner changes it, as "When you might change
       it" says), so the base page's own choices are hidden here too: no Change, in any form */
    body.querySelectorAll(':scope > section.o55-insp-block').forEach((x) => { if (!x.hasAttribute('data-psx-block') && x.querySelector('.o55-insp-choice, .o55-pick-trigger, .o55-pick-inline')) { x.hidden = true; x.setAttribute('data-psx-hidden', ''); } });
    if (now) {
      const l = now.querySelector('.o55-insp-now-label'), f = now.querySelector('.o55-insp-now-foot');
      if (l) l.textContent = v.now;
      if (f && !f.hasAttribute('data-psx-hidden')) { f.hidden = true; f.setAttribute('data-psx-hidden', ''); }
      now.classList.remove('is-changed');
    }
    const sec = D.createElement('section');
    sec.className = 'o55-insp-block psx-where'; sec.setAttribute('data-psx-block', 'where'); sec.setAttribute('data-psx-key', 'where');
    sec.setAttribute('data-psx-owner', v.kind || 'owned'); if (v.owner) sec.setAttribute('data-psx-owner-name', v.owner);
    sec.innerHTML = `<h4>Where it applies</h4><p class="psx-where-sentence">${esc(v.sentence)}</p>`;
    // Astra max N1: an owner with a place of its own is one click away
    if (v.open) {
      const b = D.createElement('button'); b.type = 'button'; b.className = 'o55-textbtn psx-tb psx-owner-open'; b.setAttribute('data-psx-key', 'owner-open');
      b.textContent = v.open.label; b.setAttribute('aria-label', `${v.open.label}: ${v.owner}`);
      b.addEventListener('click', () => openOwner(v.open));
      sec.appendChild(b);
    }
    const slot = (title, slotKey, text, bare) => sec.insertAdjacentHTML('beforeend', `<div class="psx-group is-not" role="group" aria-label="${esc(title)}" data-psx-slot="${slotKey}">${bare ? '' : `<div class="psx-ghead">${esc(title)}</div>`}<div class="psx-wnot">${bare ? `<span class="psx-wname">${esc(title)}</span>` : ''}<span class="psx-wnot-why">${esc(text)}</span></div></div>`);
    slot('Everywhere', 'everywhere', v.everywhere, true);
    slot('Computers', 'computer', v.computer);
    slot('Projects', 'project', v.project);
    if (now) now.after(sec); else body.insertBefore(sec, body.firstChild);
  }

  /* ------------------------------------------------------------------ Now */
  function ctxLine(id, r) {
    const c = PSX.ctxFull(S.ctx), def = DEF[id];
    if (def.screen && !(def.may || []).includes('project')) return 'On this screen';
    if (def.home === 'computer') return `On ${placeName('computer', c.host || c.on)}`;
    if (!c.project) return `With no project, on ${placeName('computer', c.on)}`;
    if (def.screen) return `In ${c.project} · on this screen`;
    // the where-work-runs wording (SIR-056, Auto by default): your own view shows the setting, Auto with its default
    // computer, never an arrow (that names where a piece of work actually ran); looking at another computer names it
    const p0 = PSX.projectById(c.project), viewingComp = !!S.ctx.on && p0 && S.ctx.on !== p0.home;
    return viewingComp ? `In ${c.project} · on ${placeName('computer', c.on)}` : `In ${c.project} · Auto (default: ${placeName('computer', c.on)})`;
  }
  function fromLine(id, r) {
    const c = PSX.ctxFull(S.ctx);
    if (r.notOffered) return 'Each project has its own. Choose one below to see or change its value.';
    if (r.ceiling) return `${c.project} asks for ${vt(id, r.asked)}. ${placeName('computer', r.ceiling.key)} allows at most ${vt(id, r.ceiling.value)}.`;
    if (r.careful && r.careful.items) return `${c.project} asks for ${vt(id, r.careful.asked)}. For safety, ${placeName(r.careful.by.level, r.careful.by.key)}’s own is used: ${vt(id, r.careful.used)}.`;
    if (r.careful) return `${c.project} asks for ${vt(id, r.careful.asked)}. For safety, ${placeName(r.careful.by.level, r.careful.by.key)}’s own is used.`;
    // Astra max A4: Reduce motion is an OR of your requests here, then the operating system's
    if (r.motion) {
      const asker = PSX.askerName, os = r.motion.os && !r.value ? ' Your operating system asks for less motion, so motion is reduced anyway.' : '';
      if (r.motion.overruled.length) return `${list(r.motion.overruled.map(asker))} ${r.motion.overruled.length === 1 ? 'asks' : 'ask'} for full motion. ${asker(r.from)} asks for less, and less motion wins.${os}`;
      if (os) return `${r.from.level === 'default' ? 'Puppet Master’s default' : asker(r.from) + ' asks for full motion'}.${os}`;
    }
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
    else if (r.from.level === 'provider') act = null;
    else if (r.here && (r.from.level !== 'computer' || def.home !== 'computer') && def.home !== 'project') { const ra = removeAction(id, r.from.level, r.from.key, placeName(r.from.level, r.from.key)); act = { label: ra.label, run: () => PSX.setOwn(id, r.from, undefined) }; }
    else if (def.home === 'computer' && r.from.level === 'computer') act = { label: 'Use what’s found here', run: () => PSX.setOwn(id, r.from, undefined) };
    else if (def.home === 'project' && r.from.level === 'project') act = { label: `Clear it for ${r.from.key}`, run: () => PSX.setOwn(id, r.from, undefined) };
    else if (r.from.level === 'everywhere' && r.changed) act = { label: 'Go back to the default everywhere', run: () => backToDefault(id) };
    if (act) {
      const b = D.createElement('button'); b.type = 'button'; b.className = 'o55-textbtn psx-tb'; b.setAttribute('data-psx-key', 'now-act');
      b.innerHTML = `${icon('restore')}<span>${esc(act.label)}</span>`;
      const why = act.label === 'Go back to the default everywhere' ? blockedWrite({ level: 'everywhere' }) : blockedWrite(r.from, id, undefined);
      if (why) { b.setAttribute('aria-disabled', 'true'); PSX.tip(b, act.label, why); }
      b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') === 'true') { PSX.note({ title: 'Not now', body: why + '.', mark: 'offline' }); return; } act.run(); });
      foot.appendChild(b);
    } else if (!r.notOffered) foot.insertAdjacentHTML('beforeend', `<span class="o55-insp-isdef">${icon('check')}<span>This is the default</span></span>`);
  }
  function backToDefault(id) {
    const f = followers(id, undefined);
    PSX.confirm({
      title: `Go back to the default everywhere?`, kicker: label(id),
      body: `<p class="psx-p">${mark('info')} <b>${esc(label(id))} becomes ${esc(vt(id, DEFAULTS[id]))}</b> in ${f.changes.length} project${f.changes.length === 1 ? '' : 's'}: ${esc(list(f.changes, 6) || 'none')}.</p>${f.keeps.length ? `<p class="psx-p">${esc(list(f.keeps))} ${f.keeps.length === 1 ? 'keeps its' : 'keep their'} own.</p>` : ''}`,
      okLabel: 'Go back to the default', selfReport: true,
      ok: (y) => PSX.setOwn(id, { level: 'everywhere', key: null }, undefined, { confirmed: !DEF[id].safety || !!y, yolo: y && y.yolo })
    });
  }

  /* ------------------------------------------------------------------ Where it applies */
  function sentence(id, r) {
    const def = DEF[id];
    if (def.home === 'computer') return 'Each computer has its own.';
    if (def.home === 'project') return 'Each project has its own.';
    if (def.home === 'everywhere') return 'Same everywhere.';
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
  /* Jared #8 (2026-11-09, "Keep per device"): every panel has the same three parts in the same order, Everywhere, then
     Computers (or Devices on a screen row), then Projects. A part the row doesn't offer stays in its place with one plain
     line saying why, so no panel looks different from the next. Screen rows (text size, theme, sounds, reduce motion and
     the rest about the device in front of you) list Devices where every other row lists Computers, with one line saying
     why. */
  function deviceWhy(id) {
    if (/sound|bell/.test(id)) return 'This is about the sound of the device in front of you, so it can differ per device.';
    if (/key|shortcut|submit-key|text-editing/.test(id)) return 'This is about the keyboard in front of you, so it can differ per device.';
    if (/tray|minimize|window-state|notification-method|copy-on-select|right-click/.test(id)) return 'This is about the device in front of you, so it can differ per device.';
    return PSX.REASONS.about_the_screen[0];
  }
  PSX.deviceWhy = deviceWhy;
  function notLine(slot, id) {
    const def = DEF[id], code = def.reason;
    if (slot === 'everywhere') {
      const because = (t) => 'Not one value for everywhere, because ' + String(t).replace(/^.*?because /, '').replace(/that project’s/, 'each project’s');
      if (def.home === 'computer') return because((PSX.REASONS[code] || PSX.REASONS.names_a_program)[0]);
      if (def.home === 'project') return because(PSX.REASONS.about_this_project[0]);
      return 'Not one value for everywhere.';
    }
    if (slot === 'computer') {
      if (def.home === 'project') return 'Not per computer: it’s about each project’s own files.';
      if (def.home === 'everywhere') return 'Not per computer: ' + (PSX.REASONS[code] || PSX.REASONS.same_for_you)[0].replace(/^Same everywhere\. /, '').replace(/^It/, 'it');
      return 'Not per computer.';
    }
    if (def.screen) return 'Not per project: it’s about the device in front of you, not the work.';
    if (def.home === 'computer') return 'Not per project: it belongs to each computer.';
    if (def.home === 'everywhere') return 'Not per project, for the same reason.';
    if ((def.may || []).length === 1 && def.may[0] === 'computer') return 'Not per project: it’s about the whole computer.';
    return 'Not per project.';
  }
  function notSlot(sec, title, slot, id, bare) {
    const g = D.createElement('div'); g.className = 'psx-group is-not'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', title); g.setAttribute('data-psx-slot', slot);
    g.innerHTML = `${bare ? '' : `<div class="psx-ghead">${esc(title)}</div>`}<div class="psx-wnot">${bare ? `<span class="psx-wname">${esc(title)}</span>` : ''}<span class="psx-wnot-why">${esc(notLine(slot, id))}</span></div>`;
    sec.appendChild(g);
    return g;
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
    let vtext = o.valueText != null ? o.valueText : vt(id, o.value);
    /* Jared 2026-11-13: a model row's inherit says which model it is here ("Same as Everyday model (Claude Opus 4)") */
    if (PSX.isModel(id) && o.value === 'inherit' && PSX.places) { const iw = PSX.places.inheritWords(id, o.level, o.key); if (iw && iw.model && vtext.indexOf(iw.label) >= 0) vtext = vtext.replace(iw.label, `${iw.label} (${iw.model})`); }
    el.setAttribute('aria-label', `${o.name}: ${vtext}${def.combine === 'computer_ceiling' && o.level === 'computer' ? ', at most' : ''}`);
    el.setAttribute('data-psx-line', k);
    const states = (o.states || []).map((s) => `<div class="psx-wstate${s.muted ? ' is-muted' : ''}">${s.key ? mark(s.key) : ''}<span>${esc(s.text)}</span></div>`).join('');
    el.innerHTML = `<div class="psx-wtop"><span class="psx-wname">${esc(o.name)}</span><span class="psx-wval">${isEdit ? '' : esc(vtext)}${!isEdit && def.combine === 'computer_ceiling' && o.level === 'computer' ? '<span class="psx-muted"> · at most</span>' : ''}</span></div>${states}`;
    if (isEdit) el.appendChild(editor(id, o));
    else if (o.actions !== false) {
      const acts = D.createElement('div'); acts.className = 'psx-wacts';
      const why = blockedWrite({ level: o.level, key: o.key });
      /* Jared 2026-11-13 (item 3): every line can be set. A map or a list of records opens the row's own editor for this
         place (places.js openRow); a model row opens the shared model picker over the panel */
      const kind = editorKind(id);
      if (o.change !== false) acts.appendChild(btn(`Change`, kind === 'row' ? `Change ${o.name}’s value in ${label(id)}’s own editor` : `Change ${o.name}’s value`, `${k}:change`, why, () => {
        if (kind === 'row') { PSX.places.openRow(id, o.level, o.key); return; }
        editing = { id, level: o.level, key: o.key, value: o.value }; rerender();
        if (kind === 'model') openPickerSoon();
      }));
      if (o.removable) { const ra = def.home === 'computer' ? { label: 'Use what’s found', aria: `Make ${o.name} use what Puppet Master finds` } : removeAction(id, o.level, o.key, o.name); acts.appendChild(btn(ra.label, ra.aria, `${k}:same`, why, () => PSX.setOwn(id, { level: o.level, key: o.key }, undefined))); }
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
  /* the row's own control type, inline: the shared model picker (a model row), a number with the row's own limits (and
     its automatic value, Model default and the like), a list of choices as the main control lists them, several
     choices, a switch, words, or a list of words one per line. A value the inline editor can't hold (a key-value map,
     a list of records) is changed in the row's own editor for that place ('row'). Jared 2026-11-13: the limits are the
     main control's (places.js PSX.places.limits), and Save asks the same check the guard does, so a value outside them
     is never kept on any path. A draft survives the engine redrawing the panel. Enter saves, Esc cancels. */
  function editorKind(id) {
    if (PSX.isModel(id)) return 'model';
    if (PSX.places && PSX.places.isNicknames(id)) return 'nicknames';
    const d = DEFAULTS[id];
    const lim = PSX.places ? PSX.places.limits(id) : null;
    if (lim && lim.kind === 'number') return 'number';
    if (lim && lim.kind === 'multi') return 'multi';
    if (lim && lim.kind === 'choices') return 'select';
    const opts = PSX.optionsFor(id);
    if (opts && opts.length) return 'select';
    if (typeof d === 'boolean') return 'bool';
    if (typeof d === 'number') return 'number';
    if (id === 'memory.assembly.project-rules') return 'area';
    if (Array.isArray(d)) return d.every((x) => typeof x === 'string') ? 'lines' : 'row';
    if (d && typeof d === 'object') return 'row';
    return 'text';
  }
  PSX.editorKind = editorKind;
  // the picker opens as soon as its line's editor is drawn (Change, or a new line from + Set for…)
  function openPickerSoon() {
    setTimeout(() => {
      const root = (PSX.panel.own && PSX.panel.own.isConnected ? PSX.panel.own : D.querySelector('#pm-settings-root .detail-inspector'));
      const t = root && root.querySelector('[data-psx-mpick][data-psx-edit-control]');
      if (t && !(PSX.places && PSX.places.isOpen())) t.click();
    }, 40);
  }
  function editor(id, o) {
    const wrap = D.createElement('div'); wrap.className = 'psx-wedit';
    const s = PSX.engineSetting(id), cur = o.value === undefined ? PSX.resolve(id, S.ctx).value : o.value;
    const draft = editing && editing.draft !== undefined ? editing.draft : undefined;
    const placeCtx = PSX.places ? PSX.places.ctxAt(o.level, o.key) : S.ctx;
    let ctl, read, focusEl;
    const kind = editorKind(id);
    if (kind === 'row') { setTimeout(() => { editing = null; PSX.places.openRow(id, o.level, o.key); rerender(); }, 0); return wrap; }
    if (kind === 'model') {
      // the shared model picker, over the panel: the trigger shows the choice, the overlay holds the models and the depth
      ctl = PSX.places.trigger(id, Object.assign({}, o, { value: draft !== undefined ? draft : cur }));
      ctl.addEventListener('click', (e) => { e.preventDefault(); PSX.places.picker(ctl, id, Object.assign({}, o, { value: ctl.__psxValue }), (v) => { if (editing) editing.draft = v; }); });
      read = () => ctl.__psxValue;
    } else if (kind === 'nicknames') {
      /* the one Model nicknames list (Plans batch 4, DL-479): a nickname, and the model it means chosen with the shared
         picker (no depth: presets hold a model with depth). The page's own row is still the old text box until stream F
         redraws it, so the map is edited here, line by line */
      const start = draft !== undefined ? JSON.parse(draft) : (cur && typeof cur === 'object' && !Array.isArray(cur) ? cur : {});
      const pairs = Object.entries(start).map(([k, v]) => ({ nick: k, model: v }));
      ctl = D.createElement('div'); ctl.className = 'psx-nicks'; ctl.setAttribute('role', 'group'); ctl.setAttribute('aria-label', `${label(id)} for ${o.name}`);
      const keep = () => { if (editing) editing.draft = JSON.stringify(Object.fromEntries(pairs.filter((x) => x.nick.trim() || x.model).map((x) => [x.nick, x.model]))); };
      const paint = (focusLast) => {
        ctl.innerHTML = '';
        if (!pairs.length) ctl.insertAdjacentHTML('beforeend', '<p class="psx-nick-empty">No nicknames here yet.</p>');
        pairs.forEach((x, i) => {
          const rowEl = D.createElement('div'); rowEl.className = 'psx-nick';
          const inp = D.createElement('input'); inp.type = 'text'; inp.className = 'psx-input psx-nick-name'; inp.value = x.nick; inp.placeholder = 'Nickname'; inp.spellcheck = false; inp.setAttribute('aria-label', `Nickname ${i + 1}`);
          inp.addEventListener('input', () => { x.nick = inp.value; keep(); });
          inp.__psxCancel = () => cancel();
          const tr = PSX.places.trigger(id, Object.assign({}, o, { value: x.model, noDepth: 'A nickname means a model; presets keep a model with its depth' }));
          tr.removeAttribute('data-psx-edit-control'); tr.setAttribute('data-psx-nick', String(i));
          tr.addEventListener('click', (e) => { e.preventDefault(); PSX.places.picker(tr, id, Object.assign({}, o, { value: x.model, noDepth: 'A nickname means a model; presets keep a model with its depth' }), (v) => { x.model = PSX.modelOf(v); keep(); }); });
          const rm = D.createElement('button'); rm.type = 'button'; rm.className = 'psx-tb is-quiet psx-nick-rm'; rm.textContent = 'Remove'; rm.setAttribute('aria-label', `Remove ${x.nick || 'this nickname'}`);
          rm.addEventListener('click', () => { pairs.splice(i, 1); keep(); paint(); });
          rowEl.appendChild(inp); rowEl.appendChild(tr); rowEl.appendChild(rm); ctl.appendChild(rowEl);
        });
        const add = D.createElement('button'); add.type = 'button'; add.className = 'psx-tb psx-nick-add'; add.textContent = '+ Add a nickname'; add.setAttribute('data-psx-nick-add', '1');
        add.addEventListener('click', () => { pairs.push({ nick: '', model: '' }); keep(); paint(true); });
        ctl.appendChild(add);
        if (focusLast) { const f = ctl.querySelectorAll('.psx-nick-name'); if (f.length) f[f.length - 1].focus(); }
        const first = ctl.querySelector('.psx-nick-name') || add;
        first.setAttribute('data-psx-edit-control', '1'); first.__psxCancel = () => cancel();
      };
      paint();
      read = () => Object.fromEntries(pairs.filter((x) => x.nick.trim() || x.model).map((x) => [x.nick.trim(), x.model]));
      focusEl = ctl.querySelector('[data-psx-edit-control]');
    } else if (kind === 'select') {
      const ch = PSX.places ? PSX.places.choices(id) : [];
      const opts = id === 'general.visual.theme' || ch.length < 2 ? PSX.optionsFor(id) : ch.map((x) => PSX.places.typed(id, x));
      ctl = D.createElement('select'); ctl.className = 'psx-input psx-select';
      opts.forEach((v) => { const op = D.createElement('option'); op.value = JSON.stringify(v); op.textContent = vt(id, v); if (same(v, draft !== undefined ? JSON.parse(draft) : cur)) op.selected = true; ctl.appendChild(op); });
      read = () => JSON.parse(ctl.value);
    } else if (kind === 'multi') {
      const ch = PSX.places.choices(id).map((x) => PSX.places.typed(id, x));
      const on0 = draft !== undefined ? JSON.parse(draft) : (Array.isArray(cur) ? cur : []);
      ctl = D.createElement('div'); ctl.className = 'psx-multi'; ctl.setAttribute('role', 'group'); ctl.setAttribute('aria-label', `${label(id)} for ${o.name}`);
      ch.forEach((v) => { const lb = D.createElement('label'); lb.className = 'psx-multi-opt'; const cb = D.createElement('input'); cb.type = 'checkbox'; cb.value = JSON.stringify(v); cb.checked = on0.some((x) => same(x, v)); const sp = D.createElement('span'); sp.textContent = W.PM51 && W.PM51.valueLabel ? W.PM51.valueLabel(id, v) : String(v); lb.appendChild(cb); lb.appendChild(sp); ctl.appendChild(lb); });
      read = () => [...ctl.querySelectorAll('input:checked')].map((x) => JSON.parse(x.value));
      ctl.addEventListener('change', () => { if (editing) editing.draft = JSON.stringify(read()); });
      focusEl = ctl.querySelector('input') || null;
    } else if (kind === 'bool') {
      const on0 = draft !== undefined ? draft === 'true' : !!cur;
      ctl = D.createElement('button'); ctl.type = 'button'; ctl.className = 'toggle pm51-toggle' + (on0 ? ' on' : ''); ctl.setAttribute('role', 'switch'); ctl.setAttribute('aria-checked', on0 ? 'true' : 'false');
      ctl.addEventListener('click', () => { const on = ctl.getAttribute('aria-checked') !== 'true'; ctl.setAttribute('aria-checked', String(on)); ctl.classList.toggle('on', on); if (editing) editing.draft = String(on); });
      read = () => ctl.getAttribute('aria-checked') === 'true';
    } else if (kind === 'number') {
      /* the main control's limits, in the units it shows (places.js): min, max and step on the box itself, the unit beside
         it, and the row's automatic value (Model default, Provider default, the theme's own) as its own choice */
      const lim = (PSX.places && PSX.places.limits(id, placeCtx)) || { lo: NaN, hi: NaN, step: null, scale: 1, unit: '', auto: [] };
      const isAuto = (v) => lim.auto.some((x) => same(x, v)) || (lim.auto.length && (v === null || v === ''));
      const autoNow = editing && editing.auto !== undefined ? editing.auto : isAuto(cur);
      const box = D.createElement('div'); box.className = 'psx-numrow';
      ctl = D.createElement('input'); ctl.type = 'number'; ctl.className = 'psx-input psx-num'; ctl.setAttribute('inputmode', 'decimal');
      const n0 = isAuto(cur) ? '' : PSX.places ? PSX.places.shown(id, cur, lim) : cur;
      ctl.value = draft !== undefined ? draft : (Number.isFinite(n0) ? String(n0) : String(n0 == null || Number.isNaN(n0) ? '' : n0));
      if (Number.isFinite(lim.lo)) ctl.min = String(lim.lo);
      if (Number.isFinite(lim.hi)) ctl.max = String(lim.hi);
      ctl.step = lim.step ? String(lim.step) : (lim.whole ? '1' : 'any');
      box.appendChild(ctl);
      if (lim.unit) box.insertAdjacentHTML('beforeend', `<span class="psx-unit">${esc(lim.unit)}</span>`);
      const range = Number.isFinite(lim.lo) && Number.isFinite(lim.hi) ? `From ${+lim.lo.toFixed(6)} to ${+lim.hi.toFixed(6)}` : Number.isFinite(lim.lo) ? `At least ${+lim.lo.toFixed(6)}` : Number.isFinite(lim.hi) ? `At most ${+lim.hi.toFixed(6)}` : '';
      if (range) { box.insertAdjacentHTML('beforeend', `<span class="psx-range">${esc(range)}</span>`); ctl.setAttribute('aria-description', range); }
      let autoBox = null;
      if (lim.auto.length) {
        const al = D.createElement('label'); al.className = 'psx-auto';
        autoBox = D.createElement('input'); autoBox.type = 'checkbox'; autoBox.checked = !!autoNow; autoBox.setAttribute('data-psx-auto', '1');
        const words = vt(id, lim.auto[0]); const sp = D.createElement('span'); sp.textContent = `Use ${/^(not set|)$/i.test(words) ? 'the automatic value' : words.charAt(0).toLowerCase() + words.slice(1)}`;
        al.appendChild(autoBox); al.appendChild(sp);
        // the number box shows only while a number is chosen (a disabled box is turned into a hover-only one by the page)
        const sync = () => { box.hidden = autoBox.checked; if (editing) editing.auto = autoBox.checked; };
        autoBox.addEventListener('change', sync); sync();
        wrap.appendChild(al);
      }
      wrap.appendChild(box);
      read = () => (autoBox && autoBox.checked ? lim.auto[0] : ctl.value === '' ? NaN : (PSX.places ? PSX.places.stored(id, Number(ctl.value), lim) : Number(ctl.value)));
      ctl.__psxWrapped = true;
    } else if (kind === 'area' || kind === 'lines') {
      ctl = D.createElement('textarea'); ctl.className = 'psx-input psx-area'; ctl.rows = 3;
      ctl.value = draft !== undefined ? draft : kind === 'lines' ? (Array.isArray(cur) ? cur.join('\n') : '') : String(cur || '');
      read = () => (kind === 'lines' ? ctl.value.split('\n').map((x) => x.trim()).filter(Boolean) : ctl.value);
      if (kind === 'lines') ctl.setAttribute('aria-description', 'One per line');
    } else {
      ctl = D.createElement('input'); ctl.type = 'text'; ctl.className = 'psx-input psx-text'; ctl.value = draft !== undefined ? draft : String(cur == null ? '' : cur); ctl.spellcheck = false;
      read = () => ctl.value.trim();
    }
    focusEl = (kind === 'nicknames' ? ctl.querySelector('[data-psx-edit-control]') : focusEl) || ctl;
    if (ctl.tagName === 'INPUT' || ctl.tagName === 'TEXTAREA') ctl.addEventListener('input', () => { if (editing) editing.draft = ctl.value; });
    if (ctl.tagName === 'SELECT') ctl.addEventListener('change', () => { if (editing) editing.draft = ctl.value; });
    focusEl.setAttribute('data-psx-edit-control', '1');
    focusEl.__psxCancel = () => cancel();
    (kind === 'multi' ? ctl.querySelectorAll('input') : [ctl]).forEach((x) => { x.__psxCancel = () => cancel(); });
    if (kind !== 'model' && kind !== 'nicknames') ctl.setAttribute('aria-label', `${label(id)} for ${o.name}`);
    const errId = PSX.uid('psx-err');
    const err = D.createElement('div'); err.className = 'psx-err'; err.id = errId; err.hidden = !(editing && editing.error);
    if (editing && editing.error) { err.innerHTML = `${mark('warning')}<span>${esc(editing.error)}. Nothing was saved.</span>`; ctl.setAttribute('aria-invalid', 'true'); ctl.setAttribute('aria-describedby', errId); }
    const save = () => {
      const v = read();
      // the same check the one write path makes, at this place (guard.js invalid, places.js check)
      const bad = PSX.guard.invalid({ level: o.level, key: o.key, id, value: v }) || (Number.isNaN(v) ? 'It has to be a number' : null);
      if (bad) { if (editing) editing.error = bad; err.hidden = false; err.innerHTML = `${mark('warning')}<span>${esc(bad)}. Nothing was saved.</span>`; ctl.setAttribute('aria-invalid', 'true'); ctl.setAttribute('aria-describedby', errId); try { focusEl.focus(); } catch (e) { /* gone */ } return; }
      if (PSX.places) PSX.places.close();
      const key = `${o.level}:${o.key || ''}:change`; editing = null; PSX.panel.focusAfter = key; PSX.setOwn(id, { level: o.level, key: o.key }, v); rerender();
    };
    const cancel = () => { if (PSX.places) PSX.places.close(); const key = `${o.level}:${o.key || ''}:change`; editing = null; rerender({ focusKey: o.isNew ? 'add:' + o.level : key }); };
    const onKey = (e) => {
      if (e.key === 'Enter' && !(e.target.tagName === 'TEXTAREA' && e.shiftKey) && !(kind === 'lines' && !e.metaKey && !e.ctrlKey) && kind !== 'model' && e.target.type !== 'checkbox' && e.target.tagName !== 'BUTTON') { e.preventDefault(); e.stopPropagation(); save(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancel(); }
    };
    ctl.addEventListener('keydown', onKey);
    wrap.appendChild(ctl.__psxWrapped ? wrap.querySelector('.psx-numrow') || ctl : ctl);
    wrap.appendChild(err);
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
    if (r.stale.length) { const wr = [...new Set(r.stale.map((x) => PSX.writer(x.level, x.key)).filter(Boolean))]; sec.insertAdjacentHTML('beforeend', `<div class="psx-wstate psx-where-note">${mark('offline')}<span>${esc(list(wr.map((k) => placeName('computer', k))))} ${wr.length === 1 ? 'isn’t' : 'aren’t'} answering. What ${wr.length === 1 ? 'it keeps is' : 'they keep is'} shown as of ${esc(PSX.W.asOf)}.</span></div>`); }
    if (DEVICES[S.actor] && DEVICES[S.actor].limited) sec.insertAdjacentHTML('beforeend', `<div class="psx-wstate psx-where-note">${mark('info')}<span>${esc(PSX.REASONS.limited_device[0])} The other lines are read only here.</span></div>`);
    const off = r.offered;
    const own = (lvl) => r.varies.filter((v) => v.level === lvl);
    const decides = (lvl, key) => r.from.level === lvl && (r.from.key || '') === (key || '');
    /* Astra max A1: a per_item row is decided item by item, so each own line says which items it decides here, and which
       of its items a more careful place overrules. Astra max A4: Reduce motion's own requests are ORed, so a request for
       full motion that less motion overrules says so */
    const itemName = (k, v) => (r.perItem === 'rules' || r.perItem === 'nicknames' ? String(k) : String(vt(id, { [k]: v })).replace(/:.*$/, ''));
    // the Everywhere line shows the default when Everywhere has no value of its own, so what the default decides is its
    const showsDefault = (lvl) => lvl === 'everywhere' && r.everywhere === undefined;
    const perStates = (lvl, key, inCtx) => {
      const out = [];
      if (r.items) {
        const mine = r.items.filter((i) => (i.from.level === lvl && (i.from.key || '') === (key || '')) || (showsDefault(lvl) && i.from.level === 'default'));
        const lost = (r.items || []).filter((i) => i.careful && i.careful.askedBy && i.careful.askedBy.level === lvl && (i.careful.askedBy.key || '') === (key || ''));
        if (mine.length && mine.length === r.items.length) out.push({ key: 'complete', text: mine.some((i) => i.careful) ? 'In use here, for safety' : 'In use here' });
        else if (mine.length) out.push({ key: 'complete', text: `In use here for ${list(mine.map((i) => itemName(i.key, i.value)), 3)}${mine.some((i) => i.careful) ? ', for safety' : ''}` });
        if (lost.length) out.push({ text: `Not used here for ${list(lost.map((i) => itemName(i.key, i.value)), 3)}: for safety ${placeName(lost[0].careful.by.level, lost[0].careful.by.key)}’s own is used.`, muted: true });
        else if (!mine.length && inCtx) out.push({ text: r.perItem === 'rules' ? 'Not used here: a more specific place has the same rules.' : 'Not used here: a more specific place answers for each of these.', muted: true });
        return out;
      }
      if (r.motion) {
        if (decides(lvl, key) || (showsDefault(lvl) && r.from.level === 'default')) out.push({ key: 'complete', text: 'In use here' });
        else if (r.motion.overruled.some((q) => q.level === lvl && (q.key || '') === (key || ''))) out.push({ text: `Not used here: less motion wins, and ${PSX.askerName(r.from)} asks for it.`, muted: true });
        return out;
      }
      return null;
    };
    const mkGroup = (title, bare) => { const g = D.createElement('div'); g.className = 'psx-group'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', title); g.innerHTML = bare ? '' : `<div class="psx-ghead">${esc(title)}</div>`; sec.appendChild(g); return g; };

    // Everywhere
    if (off.everywhere && def.home !== 'computer') {
      const g = mkGroup('Everywhere', true); g.setAttribute('data-psx-slot', 'everywhere');
      const has = r.everywhere !== undefined;
      const why = blockedWrite({ level: 'everywhere' });
      const states = [];
      const ps = perStates('everywhere', null, true);
      if (ps) states.push(...ps);
      else if (decides('everywhere') || (!has && r.from.level === 'default')) states.push({ key: 'complete', text: 'In use here' });
      if (why && /back/.test(why) && !PSX.answering(PSX.home())) states.push({ key: 'offline', text: `Kept on ${PSX.homeName()}, which isn’t answering · as of ${PSX.W.asOf}` });
      const ln = line(id, r, { level: 'everywhere', key: null, name: 'Everywhere', value: has ? r.everywhere : DEFAULTS[id], valueText: has ? vt(id, r.everywhere) : `${vt(id, DEFAULTS[id])} · the default`, inUse: decides('everywhere'), states });
      if (why && /back/.test(why)) { const ch = ln.querySelector('[data-psx-key$=":change"]'); if (ch) ch.textContent = `Change it when ${PSX.homeName()} is back`; }
      g.appendChild(ln);
    } else notSlot(sec, 'Everywhere', 'everywhere', id, true);
    // Computers (or Devices on a screen row): always the second part
    const placeLevel = off.device ? 'device' : off.computer ? 'computer' : null;
    if (placeLevel === 'computer' && def.home === 'computer') {
      const g = mkGroup('Computers'); g.setAttribute('data-psx-slot', 'computer');
      PSX.computerIds().forEach((k) => {
        g.appendChild(hostLine(id, r, k, false));
        Object.keys(HOSTS).filter((h) => HOSTS[h].parent === k).forEach((h) => g.appendChild(hostLine(id, r, h, true)));
      });
    } else if (placeLevel) {
      const g = mkGroup(placeLevel === 'device' ? 'Devices' : 'Computers'); g.setAttribute('data-psx-slot', placeLevel);
      if (placeLevel === 'device') g.insertAdjacentHTML('beforeend', `<p class="psx-wwhy">${esc(deviceWhy(id))}</p>`);
      const list0 = own(placeLevel).filter((v) => placeLevel === 'device' ? DEVICES[v.key] : COMPUTERS[v.key] && PSX.computerIds().includes(v.key));
      const shown = list0.slice(0, MAX_LINES);
      const pending = editing && editing.id === id && editing.level === placeLevel && !list0.find((v) => v.key === editing.key) ? editing : null;
      shown.forEach((v) => {
        const states = [];
        const here = placeLevel === 'device' ? v.key === c.device : v.key === c.on;
        const ps = perStates(placeLevel, v.key, here);
        if (ps) states.push(...ps);
        else if (decides(placeLevel, v.key)) states.push({ key: 'complete', text: r.careful ? 'In use here, for safety' : 'In use here' });
        else if (here && r.ceiling && r.ceiling.key === v.key) states.push({ key: 'info', text: `The most ${c.project} can use here` });
        else if (here && r.from.level === 'project') states.push({ text: `Not used in ${c.project}: ${c.project} has its own.`, muted: true });
        const wr = PSX.writer(placeLevel, v.key);
        if (wr && !PSX.answering(wr)) states.push({ key: 'offline', text: `${placeName('computer', wr)} isn’t answering · last seen ${vt(id, v.value)}` });
        if (placeLevel === 'computer' && v.key === 'studio' && !PSX.W.studioJoined) states.push({ key: 'info', text: 'Not joined yet · set up on its own' });
        g.appendChild(line(id, r, { level: placeLevel, key: v.key, name: placeName(placeLevel, v.key), value: v.value, inUse: decides(placeLevel, v.key), states, removable: true }));
      });
      if (list0.length > MAX_LINES) g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">and ${list0.length - MAX_LINES} more</div>`);
      if (pending) g.appendChild(line(id, r, { level: placeLevel, key: pending.key, name: placeName(placeLevel, pending.key), value: pending.value, isNew: true }));
      const all = placeLevel === 'device' ? Object.keys(DEVICES) : PSX.computerIds();
      const rest = all.filter((k) => !list0.find((v) => v.key === k) && !(pending && pending.key === k)).map((k) => placeName(placeLevel, k));
      if (rest.length) g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">${esc(list(rest, rest.length <= 3 ? 0 : 2))}: same as everywhere</div>`);
      g.appendChild(addButton(id, placeLevel, r));
    } else notSlot(sec, 'Computers', 'computer', id);
    // Projects: always the third part
    if (off.project) {
      const g = mkGroup('Projects'); g.setAttribute('data-psx-slot', 'project');
      const list0 = own('project');
      const pending = editing && editing.id === id && editing.level === 'project' && !list0.find((v) => v.key === editing.key) ? editing : null;
      list0.slice(0, MAX_LINES).forEach((v) => {
        const states = [];
        const ps = perStates('project', v.key, v.key === c.project);
        if (ps) states.push(...ps);
        else if (decides('project', v.key) && r.ceiling) states.push({ key: 'complete', text: `In use here, held to ${vt(id, r.ceiling.value)}` });
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
    } else notSlot(sec, 'Projects', 'project', id);
    // owner rungs (MA-073): AI services, then accounts
    if (def.owner) {
      const g = mkGroup('AI services and accounts');
      (r.owners || r.varies.filter((v) => v.level === 'provider')).forEach((v) => {
        const inUse = r.from.level === 'provider' && r.from.key === v.key;
        g.appendChild(line(id, r, { level: 'provider', key: v.key, name: placeName('provider', v.key), value: v.value, inUse, states: [{ key: inUse ? 'complete' : 'info', text: inUse ? 'In use here' : `Used for ${placeName('provider', v.key)}’s work, wherever it runs` }], actions: false }));
      });
      g.insertAdjacentHTML('beforeend', `<div class="psx-wrest">Accounts: none has its own. A service’s own value beats the project and everywhere for that service’s work.</div>`);
    }
    // how the parts combine (only rows where that matters), always after the three parts
    if (def.run) sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule">This is the value each run starts with. A run can also choose its own, for that run only.</p>`);
    if (def.safety) sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule">For safety, the more careful of a computer’s and a project’s own choice is used.</p>`);
    if (def.combine === 'computer_ceiling') sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule">For limits, a computer’s own value is the most any project there can use.</p>`);
    if (id === 'general.visual.theme') sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule">The look and light or dark always come from the same place; a project’s own look beats a device’s.</p>`);
    // Astra max A4: the OR, with the operating system's preference as its own input
    if (id === 'general.visual.reduce-animations') sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule" data-psx-rule="motion">Less motion wins: if you ask for it everywhere, on a device or in a project that applies here, or your operating system does, motion is reduced.${r.motion && r.motion.os ? ' Your operating system asks for it now.' : ''}</p>`);
    // Astra max A1: how a per_item row's items combine, in its owner's words
    if (r.perItem === 'answers') sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule" data-psx-rule="per-item">Each answer is decided on its own. A project’s or a computer’s own answer beats everywhere’s; when both have one for the same tool, the more careful is used: Block, then Ask me first, then Allow.</p>`);
    if (r.perItem === 'nicknames') sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule" data-psx-rule="per-item">Each nickname is decided on its own: a project’s line wins for that nickname, and nicknames set only everywhere still apply in the project.</p>`);
    if (r.perItem === 'rules') sec.insertAdjacentHTML('beforeend', `<p class="psx-wrule" data-psx-rule="per-item">The rules from every place apply together, checked top to bottom: everywhere’s first, then the computer’s, then the project’s. The last matching rule wins, so a project’s own rule beats the same rule from a computer or everywhere.</p>`);
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
      const INSTALLED = { studio: '/opt/homebrew/bin/claude', homenas: '/usr/local/bin/claude', office: 'C:\\Program Files\\Claude\\claude.exe' };
      acts.appendChild(btn(`Install on ${placeName('computer', key)}`, `Install ${def.program || 'it'} on ${placeName('computer', key)}`, `computer:${key}:install`, PSX.guard.act(key), () => PSX.run('cmd.provider.install', [700, 600], () => { w.found[id][key] = INSTALLED[key] || '/usr/local/bin/claude'; PSX.W.rev++; PSX.emit('world', {}); PSX.note({ title: `${def.program || 'It'} is installed on ${placeName('computer', key)}`, body: `Found automatically there: ${w.found[id][key]}.`, mark: 'complete' }); rerender(); })));
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
    if (level === 'project') items = PROJECTS.map((p) => ({ label: p.id, meta: have.has(p.id) ? 'has its own already' : `Auto (default: ${placeName('computer', p.home)})`, disabled: have.has(p.id) ? 'Has its own already' : blockedWrite({ level: 'project', key: p.id }), run: () => startNew(id, 'project', p.id) }));
    else if (level === 'device') items = Object.keys(DEVICES).map((k) => ({ label: DEVICES[k].name, meta: have.has(k) ? 'has its own already' : 'its screen', disabled: have.has(k) ? 'Has its own already' : null, run: () => startNew(id, 'device', k) }));
    else items = PSX.computerIds().map((k) => ({ label: COMPUTERS[k].name, meta: have.has(k) ? 'has its own already' : (k === 'studio' && !PSX.W.studioJoined ? 'not joined yet' : COMPUTERS[k].detail.split(' · ')[0]), disabled: have.has(k) ? 'Has its own already' : blockedWrite({ level: 'computer', key: k }), run: () => startNew(id, 'computer', k) }));
    // levels the row doesn't offer stay in the menu, focusable and greyed, with their short reason
    if (level === 'project' && def.screen === true && !(def.may || []).includes('project')) items = items.map((x) => Object.assign(x, { disabled: PSX.REASONS.about_the_screen[1] }));
    if (level === 'computer' && def.screen) items.push({ label: 'A computer', disabled: PSX.REASONS.about_the_screen[1] });
    PSX.menu(anchor, items, { label: level === 'project' ? 'Set for a project' : level === 'device' ? 'Set for a device' : 'Set for a computer', width: 280, search: items.length > 8 });
  }
  let pendingEdit = null;
  function startAt(id, level, key) {
    const r = PSX.resolve(id, S.ctx), own = PSX.getAt(PSX.W, level, key, id);
    if (level !== 'everywhere' && own === undefined) { startNew(id, level, key); return; }
    if (editorKind(id) === 'row') { PSX.places.openRow(id, level, key); return; }
    editing = { id, level, key, value: own !== undefined ? own : (r.everywhere !== undefined ? r.everywhere : DEFAULTS[id]) };
    rerender();
    if (editorKind(id) === 'model') { openPickerSoon(); return; }
    setTimeout(() => { const root = D.querySelector('#pm-settings-root .detail-inspector'); const f = root && root.querySelector('[data-psx-edit-control]'); if (f) f.focus(); }, 30);
  }
  function startNew(id, level, key) {
    // Jared 2026-11-13 (item 3): a map or a list of records goes to the row's own editor for that place
    if (editorKind(id) === 'row') { PSX.places.openRow(id, level, key); return; }
    // the nickname list is per item: a new place starts with no lines of its own (everywhere's still apply there)
    const start = editorKind(id) === 'nicknames' ? {} : PSX.resolve(id, S.ctx).asked !== undefined ? PSX.resolve(id, S.ctx).asked : PSX.resolve(id, S.ctx).value;
    editing = { id, level, key, value: start, isNew: true };
    rerender();
    if (editorKind(id) === 'model') { openPickerSoon(); return; }
    setTimeout(() => { const root = (PSX.panel.own && PSX.panel.own.isConnected ? PSX.panel.own : D.querySelector('#pm-settings-root .detail-inspector')); const f = root && root.querySelector('[data-psx-edit-control]'); if (f) f.focus(); }, 30);
  }
  function makeMenu(id, r, anchor) {
    const items = r.varies.filter((v) => v.level !== 'provider').map((v) => ({ label: `${placeName(v.level, v.key)}’s ${vt(id, v.value)}`, run: () => promote(id, v) }));
    PSX.menu(anchor, items, { label: 'Make one the everywhere value', width: 300 });
  }
  /* Make one the everywhere value: the whole transaction is simulated (the everywhere write and the source's own value
     taken away), so the preview lists every project whose value in use changes. On a safety row the source's own is
     kept when taking it away would leave a project less careful (Home NAS's Plan only stays, or garden-notes would
     use Full) */
  function promote(id, v) {
    const def = DEF[id];
    let writes = [{ level: 'everywhere', key: null, id, value: v.value }, { level: v.level, key: v.key, id, value: undefined }];
    let sim = PSX.simulate(writes, id), kept = false;
    if (def.safety && sim.looser.length) { writes = writes.slice(0, 1); sim = PSX.simulate(writes, id); kept = true; }
    const n = sim.changes.length, keeps = sim.keeps.map((r) => r.project);
    const blocked = PSX.check.everywhere(id, v.value);
    if (blocked) { PSX.check.refuse(id, v.value, r0(id), blocked); return; }
    const body = `<p class="psx-p">${mark('info')} <b>This changes ${n} project${n === 1 ? '' : 's'}.</b> ${keeps.length ? esc(list(keeps, 4)) + (keeps.length === 1 ? ' keeps its own.' : ' keep their own.') : ''}</p>${PSX.guard.changeList(id, sim)}`
      + (kept ? `<p class="psx-p">${mark('warning')} ${esc(placeName(v.level, v.key))} keeps its own ${esc(vt(id, v.value))}: without it, a project there would be less careful.</p>` : `<p class="psx-p">${esc(placeName(v.level, v.key))}’s own value is no longer needed and is taken away in the same change.</p>`)
      + (sim.looser.length ? `<p class="psx-p">${mark('warning')} ${esc(list(sim.looser.map((r) => r.project)))} would be less careful.</p>` : '');
    PSX.confirm({
      title: `Make ${vt(id, v.value)} the everywhere value?`, kicker: label(id), body, okLabel: 'Make it everywhere',
      report: { title: 'Saved for everywhere.', body: `${placeName(v.level, v.key)}’s ${vt(id, v.value)} is the everywhere value. It changed ${n} project${n === 1 ? '' : 's'}${kept ? `; ${placeName(v.level, v.key)} keeps its own` : ''}.` },
      undoId: id,
      ok: (y) => {
        const tx = PSX.write(writes, { batch: 'promote', yolo: !!(y && y.yolo), text: `${label(id)}: ${placeName(v.level, v.key)}’s ${vt(id, v.value)} made the everywhere value` });
        if (tx && !(y && y.yolo)) PSX.note({ title: 'Saved for everywhere.', body: `${n} project${n === 1 ? '' : 's'} now use ${vt(id, v.value)}.${kept ? ` ${placeName(v.level, v.key)} keeps its own.` : ''}`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, id) }] });
        return tx;
      }
    });
  }
  const r0 = (id) => PSX.getAt(PSX.W, 'everywhere', null, id);
  /* Use this everywhere: a batch. Each own value is taken away only where its computer answers; the rest are left as
     they are, not queued, and the note names them */
  function useEverywhere(id, r) {
    const def = DEF[id];
    const own = r.varies.filter((v) => v.level !== 'provider');
    const value = r.asked !== undefined ? r.asked : r.value;
    const writes = [{ level: 'everywhere', key: null, id, value }].concat(own.map((v) => ({ level: v.level, key: v.key, id, value: undefined })));
    const a = PSX.guard.admit(writes);
    const missedTxt = (m) => `${placeName(m.write.level, m.write.key)}: ${m.text}`;
    const blocked = PSX.check.everywhere(id, value);
    if (blocked) { PSX.check.refuse(id, value, r0(id), blocked); return; }
    const sim = PSX.simulate(a.ok, id);
    const looser = def.safety ? sim.looser : [];
    PSX.confirm({
      title: `Use ${vt(id, value)} everywhere?`, kicker: label(id),
      body: `<p class="psx-p">${mark('info')} Everywhere takes ${esc(vt(id, value))}, and every own value of this setting is taken away:</p><ul class="psx-list">${own.map((v) => { const m = a.missed.find((x) => x.write.level === v.level && x.write.key === v.key); return `<li class="psx-li"><span class="psx-li-name">${esc(placeName(v.level, v.key))}</span><span class="psx-li-end psx-muted">${m ? PSX.st('offline', m.text + ' · left as it is') : `${esc(vt(id, v.value))} → ${esc(vt(id, value))}`}</span></li>`; }).join('')}</ul>`
        + (looser.length ? `<p class="psx-p">${mark('warning')} ${esc(list(looser.map((x) => x.project)))} would be less careful.</p>` : ''),
      guard: looser.length ? 'A project would be less careful: a safety relaxation is never made without you.' : null,
      okLabel: 'Use it everywhere', undoId: id,
      report: { title: 'Saved for everywhere.', body: `${own.length - a.missed.length} own value${own.length - a.missed.length === 1 ? ' was' : 's were'} taken away.${a.missed.length ? ' Not changed: ' + a.missed.map(missedTxt).join('; ') + '. Nothing was queued.' : ''}` },
      ok: (y) => {
        const tx = PSX.write(writes, { batch: 'use-everywhere', yolo: !!(y && y.yolo), text: `${label(id)}: ${vt(id, value)} everywhere, ${own.length - a.missed.length} own value${own.length - a.missed.length === 1 ? '' : 's'} taken away` }, { atomic: false });
        if (tx && !(y && y.yolo)) PSX.note({ title: 'Saved for everywhere.', body: `${own.length - tx.missed.length} own value${own.length - tx.missed.length === 1 ? ' was' : 's were'} taken away.${tx.missed.length ? ' Not changed: ' + tx.missed.map(missedTxt).join('; ') + '. Nothing was queued.' : ''}`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, id) }] });
        return tx;
      }
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
    if (off.computer && !off.device) groups.push({ label: 'Another computer', items: PSX.computerIds().filter((k) => k !== c.on).map((k) => ({ label: COMPUTERS[k].name, disabled: blockedWrite({ level: 'computer', key: k }), run: pick({ level: 'computer', key: k }) })) });
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
    const hn = PSX.homeName();
    const kept = def.home === 'computer' ? 'each Server (its own Execution Hosts)' : def.home === 'project' ? 'each project’s Home Server' : def.screen ? `${hn}, the settings home (everywhere) · each device (its own)` + ((def.may || []).includes('project') ? ' · each project’s Home Server (its own)' : '') : `${hn}, the settings home (everywhere) · each Server (its own) · each project’s Home Server (its own)`;
    const rows = D.createElement('div'); rows.setAttribute('data-psx-block', 'tech'); rows.className = 'psx-tech';
    const rule = def.adopted ? (def.reviewed ? 'reviewed in this concept (fix pass)' : 'concept heuristic; the reviewed rule is a Plans task') : 'demo row';
    rows.innerHTML = `<div><span>Can differ by</span><code>${esc(may)}</code></div><div><span>Kept on</span><code>${esc(kept)}</code></div><div><span>Rule</span><code>${esc(rule)}</code></div><div><span>Command</span><code>cmd.settings.transaction.preview, then .apply (${esc(PSX.COMMANDS['cmd.settings.transaction.apply'])}); Undo is .rollback</code></div>`;
    const copy = tb.querySelector('.o55-textbtn');
    if (copy) tb.insertBefore(rows, copy); else tb.appendChild(rows);
  }

  /* ------------------------------------------------------------------ the layer's own panel (the Projects folder row):
     the Settings side sheet (PM51.panel) holding the same Where it applies block */
  function openOwn(id, opener) {
    if (!(W.PM51 && W.PM51.panel)) return;
    const wrap = W.PM51.panel({ title: label(id), eyebrow: 'Computers › Home & Location', subtitle: 'Where a new project’s folder is made', icon: 'folder', body: `<div class="psx-own" data-psx-own="${esc(id)}"></div>` });
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
    host.insertAdjacentHTML('beforeend', `<p class="psx-wrule">A new project made to work on Home NAS goes to ${esc(PSX.resolve(id, { on: 'homenas', project: 'none' }).value)}/&lt;name&gt;, and New Project shows the whole path. Copy settings never moves it.</p>`);
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
    if (PSX.places && PSX.places.isOpen()) return;              // the model picker closes first, by itself (places.js)
    const a = D.activeElement;
    if (a && typeof a.__psxCancel === 'function') { e.preventDefault(); e.stopImmediatePropagation(); a.__psxCancel(); return; }
    const top = PSX.topSheet();
    if (top) { e.preventDefault(); e.stopImmediatePropagation(); top.close('esc'); return; }
  }, true);
  PSX.on('redraw', () => rerender());
  PSX.on('fed', () => rerender());
  PSX.on('ctx', () => { editing = null; rerender(); });
  PSX.panel = { decorate, strip, install, soon, openOwn, current, whereBlock, sentence, promote, removeAction, ownerFacts, ownerOf, ACTION_OWNERS, own: null, ownId: null, focusAfter: null, rerender, refresh: () => rerender(), editorKind, editAt: (id, tg) => { pendingEdit = { id, level: tg.level, key: tg.key }; } };
})(window);

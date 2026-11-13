// Round B-press: a press on the no-project layer's own controls must survive a redraw. The no-project chat redraws
// itself on every change anywhere in the app; a redraw between pointer-down and pointer-up used to swap the control out
// from under the pointer, and the click never fired (History, a first-message Enter, Send were lost under load).
//
// Each control is pressed N times with the real mouse (move, down, a 45 ms hold, up: a person's press, not the kit's
// helper, so a swapped node can't hide behind a "not clicked" tool miss). While it runs, a stressor makes the two kinds of
// change that redraw the chat: an app change (PJX 'change', which redraws the no-project chat) and a PMConcept7 render
// (PM56_APP.render, which reconciles PMConcept7's chat). It sends one every 40 ms, alternating, plus an app change inside
// pointer-down itself, a PMConcept7 render 12 ms into the hold and another app change at 28 ms, so every press has redraws
// between its down and its up. Each press is judged by its effect, and every loss is counted. A last case samples, between
// tasks, whether the chat has its header while the same redraws run (B-press addition: a redraw must never leave the chat
// without its header, even for one task).
const N = 30;

/* the stressor: real app changes (PJX 'change'), the same event every owner operation sends */
async function stress(f, on) {
	await f.evaluate((on) => {
		if (!window.__pjxStress) {
			const S = window.__pjxStress = { on: false, emits: 0, inPress: 0, pressing: false, tick: 0 };
			const bump = (pm7) => { if (!S.on) return; S.emits++; if (S.pressing) S.inPress++; if (pm7 && window.PM56_APP && window.PM56_APP.render) window.PM56_APP.render(); else window.PJX.emit('change', { why: 'stress' }); };
			document.addEventListener('pointerdown', (e) => {
				const k = e.target && e.target.closest ? e.target.closest('[data-c-key], [role="menuitem"]') : null;
				S.landed = k ? (k.getAttribute('data-c-key') || (k.textContent || '').trim().slice(0, 30)) : String((e.target && e.target.className) || (e.target && e.target.tagName) || '?').slice(0, 40);
				if (!S.on) return; S.pressing = true; bump(false); setTimeout(() => bump(true), 12); setTimeout(() => bump(false), 28);
			}, true);
			document.addEventListener('pointerup', () => { setTimeout(() => { S.pressing = false; }, 0); }, true);
			setInterval(() => bump(++S.tick % 2 === 0), 40);
		}
		window.__pjxStress.on = on;
	}, on);
}
const stressCounts = (f) => f.evaluate(() => ({ emits: window.__pjxStress.emits, inPress: window.__pjxStress.inPress })).then((c) => Object.assign(c, { toastRetries }));
/* where the frame's (0,0) is in main-frame pixels, and its scale (the review strip may draw the page scaled), as
   t.quickClick works it out */
async function originOf(f) {
	const holder = await f.frameElement();
	const b = await holder.boundingBox();
	const inset = await holder.evaluate((el) => { const s = getComputedStyle(el); return [el.clientLeft + parseFloat(s.paddingLeft), el.clientTop + parseFloat(s.paddingTop), el.offsetWidth]; });
	const k = b.width / (inset[2] || b.width);
	return { x: b.x + inset[0] * k, y: b.y + inset[1] * k, k };
}
/* a person's press: to the control's centre, down, hold, up. The control is found, brought into view inside its own
   scroller and measured in one step in the page (under the stress its node is replaced every few frames, so a node
   handle from outside would go stale). Returns false when there is no control to press, and 'missed (...)' when the
   pointer-down landed on something else: a press not made, never counted as a lost click. sel is a selector, or
   [selector, words] for the first match whose text starts with those words */
async function pressOnce(t, f, sel, want, hold) {
	// a person waits for what covers a control before pressing (up to 4 s), and closes a notification toast lying over it
	let r = null;
	for (let k = 0; k < 20; k++) {
		r = await f.evaluate((sel) => {
			const [css, words] = Array.isArray(sel) ? sel : [sel, null];
			const el = Array.from(document.querySelectorAll(css)).find((e) => !words || (e.textContent || '').trim().indexOf(words) === 0);
			if (!el) return null;
			let b = el.getBoundingClientRect();
			if (b.top < 0 || b.bottom > innerHeight) { el.scrollIntoView({ block: 'center', inline: 'nearest' }); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; b = el.getBoundingClientRect(); }
			if (b.width < 1 || b.height < 1) return null;
			const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
			// a PMConcept7 notification toast over the control is closed with its own dismiss button, as a person would
			const toast = hit && !el.contains(hit) && hit.closest && hit.closest('.pmn-toast'), x = toast && toast.querySelector('.pmn-x');
			if (x) x.click();
			return { box: [b.left, b.top, b.width, b.height], covered: hit && !el.contains(hit) ? (toast ? 'toast (dismissed) ' : '') + String(hit.className || hit.tagName).slice(0, 40) : null };
		}, sel).catch(() => null);
		if (!r || !r.covered) break;
		await t.page.waitForTimeout(200);
	}
	if (!r) return false;
	if (r.covered) return 'covered by ' + r.covered;
	r = r.box;
	const o = await originOf(f);
	await t.page.mouse.move(o.x + (r[0] + r[2] / 2) * o.k, o.y + (r[1] + r[3] / 2) * o.k);
	await f.evaluate(() => { if (window.__pjxStress) window.__pjxStress.landed = null; });
	await t.page.mouse.down();
	await t.page.waitForTimeout(hold);
	await t.page.mouse.up();
	if (want) { const landed = await f.evaluate(() => window.__pjxStress && window.__pjxStress.landed); if (!(want instanceof RegExp ? want.test(landed || '') : landed === want)) return 'missed (landed on ' + landed + ')'; }
	return true;
}
/* a press whose pointer-down landed on a PMConcept7 notification toast (one that slid in between the look for covers
   and the press) was a press on the toast, not on the control: the toasts are closed with their own dismiss buttons and
   the press is made again (up to 3 times). It is never counted as lost or as kept; each retry is counted */
let toastRetries = 0;
async function press(t, f, sel, want, hold = 45) {
	let a;
	for (let k = 0; k < 4; k++) {
		a = await pressOnce(t, f, sel, want, hold);
		if (!(typeof a === 'string' && /landed on [^)]*pmn-/.test(a))) return a;
		toastRetries++;
		await f.evaluate(() => document.querySelectorAll('.pmn-toast .pmn-x').forEach((x) => x.click()));
		await t.page.waitForTimeout(350);
	}
	return a;
}
const waitFor = (f, fn, arg, ms = 2500) => f.waitForFunction(fn, arg, { timeout: ms }).then(() => true).catch(() => false);
const settle = async (t) => { await t.page.keyboard.press('Escape').catch(() => {}); await t.page.waitForTimeout(120); };
/* one line per control: presses, losses and the redraw requests that fell inside presses (the proof the stress hit) */
async function report(t, f, name, lost, notes, before) {
	const s = await stressCounts(f);
	const inPress = s.inPress - before.inPress, missed = notes.filter((x) => /missed|covered|no control|setup/.test(x)).length;
	// a valid round: every press landed on its control, and the stress put redraw requests inside the presses
	const tr = toastRetries - (before.toastRetries || 0);
	await t.check(`${name}: ${lost - missed} of ${N} presses lost, ${missed} not made (${inPress} redraw requests inside presses, ${s.emits - before.emits} in all${tr ? `; ${tr} press${tr === 1 ? '' : 'es'} made again after closing a toast` : ''})`, lost === 0 && inPress >= N, notes.slice(0, 12).join(' | '));
}
/* what a press result says when it isn't a made press */
const made = (a) => a === true;
const why = (a) => (a === false ? 'no control' : String(a));
async function openApp(t) {
	const f = await t.app.open(t);
	await stress(f, false);
	return f;
}
const histOpen = () => { const g = document.querySelector('.history-flyout .pjx-npg'); return !!(g && g.getBoundingClientRect().width > 0); };
async function openHistory(f) {
	// setup, not measured: PMConcept7's own History toggle in its chat header
	await f.evaluate(() => { const t = document.querySelector('#pmw-chat56 .chat-header [data-action="toggle-history"]'); if (t) t.click(); });
	return waitFor(f, histOpen, null, 3000);
}
async function closeHistory(f) {
	// setup, not measured: the flyout's own Close, or PMConcept7's toggle
	await f.evaluate(() => {
		const g = document.querySelector('.history-flyout .pjx-npg'); if (!(g && g.getBoundingClientRect().width > 0)) return;
		const fl = document.querySelector('.history-flyout');
		const x = Array.from(fl.querySelectorAll('button')).find((b) => /close/i.test((b.getAttribute('aria-label') || '') + (b.getAttribute('data-pm-hover-label') || '') + (b.title || '')));
		if (x) x.click(); else { const t = document.querySelector('#pmw-chat56 .chat-header [data-action="toggle-history"]'); if (t) t.click(); }
	});
	await waitFor(f, () => { const g = document.querySelector('.history-flyout .pjx-npg'); return !(g && g.getBoundingClientRect().width > 0); }, null, 2000);
}

export const tests = {
	async 'entry points under redraws: Home'(t) {
		const f = await openApp(t);
		await t.app.page(t, f, 'dashboard');
		// Home's New chat › With no project
		let before = await stressCounts(f); let lost = 0; const notes = [];
		await stress(f, true);
		for (let i = 1; i <= N; i++) {
			await f.evaluate(() => window.PJX.chat.close()); await settle(t);
			const a = await press(t, f, '#panel-dashboard .pjx-home-newmain', 'home:newchat');
			const m = made(a) && await waitFor(f, () => !!document.querySelector('.pmr-menu.is-open [role="menuitem"]'));
			const b = m && await press(t, f, ['.pmr-menu.is-open [role="menuitem"]', 'With no project'], /^With no project/);
			const ok = made(b) && await waitFor(f, () => { const v = window.PJX.chat.view(); return !!(v && v.draft); });
			if (!ok) { lost++; notes.push(i + ':' + (!made(a) ? 'New chat ' + why(a) : !m ? 'menu did not open' : !made(b) ? 'menu item ' + why(b) : 'no draft opened')); }
		}
		await stress(f, false);
		await report(t, f, 'Home › New chat › With no project', lost, notes, before);
	},
	async 'entry points under redraws: the History sidebar'(t) {
		const f = await openApp(t);
		await t.app.page(t, f, 'dashboard');
		let before, lost;
		// the History sidebar: New chat with no project, and a No project row
		for (const [name, key, want] of [['History › New chat with no project', 'npg:new', 'draft'], ['History › a No project row', 'npg:row:chat-trip', 'chat-trip']]) {
			const sel = '.history-flyout .pjx-npg [data-c-key="' + key + '"]';
			before = await stressCounts(f); lost = 0; const n2 = [];
			for (let i = 1; i <= N; i++) {
				await stress(f, false);
				await f.evaluate(() => window.PJX.chat.close()); await settle(t);
				if (!(await openHistory(f))) { lost++; n2.push(i + ':history did not open (setup)'); continue; }
				await stress(f, true);
				const a = await press(t, f, sel, key);
				const ok = made(a) && await waitFor(f, (want) => { const v = window.PJX.chat.view(); return !!(v && (want === 'draft' ? v.draft : v.id === want)); }, want);
				if (!ok) { lost++; n2.push(i + ':' + (made(a) ? 'not opened' : why(a))); }
				await stress(f, false);
				await closeHistory(f);
			}
			await report(t, f, name, lost, n2, before);
		}
	},
	async 'entry points under redraws: the chat header’s New thread split'(t) {
		const f = await openApp(t);
		await t.app.page(t, f, 'dashboard');
		const before = await stressCounts(f); let lost = 0; const notes = [];
		for (let i = 1; i <= N; i++) {
			await stress(f, false);
			await f.evaluate(() => window.PJX.chat.close()); await settle(t);
			await stress(f, true);
			const a = await press(t, f, '#pmw-chat56 .chat-header .pjx-newsplit', 'chat:newsplit');
			const m = made(a) && await waitFor(f, () => !!document.querySelector('.pmr-menu.is-open [role="menuitem"]'));
			const b = m && await press(t, f, ['.pmr-menu.is-open [role="menuitem"]', 'With no project'], /^With no project/);
			const ok = made(b) && await waitFor(f, () => { const v = window.PJX.chat.view(); return !!(v && v.draft); });
			if (!ok) { lost++; notes.push(i + ':' + (!made(a) ? 'chevron ' + why(a) : !m ? 'menu did not open' : !made(b) ? 'menu item ' + why(b) : 'no draft opened')); }
		}
		await stress(f, false);
		await report(t, f, 'Chat header › New thread split › With no project', lost, notes, before);
	},
	async 'entry points under redraws: the title bar'(t) {
		const f = await openApp(t);
		await t.app.page(t, f, 'dashboard');
		// the title bar's No project row
		const before = await stressCounts(f); let lost = 0; const n3 = [];
		for (let i = 1; i <= N; i++) {
			await stress(f, false);
			await f.evaluate(() => window.PJX.chat.close()); await settle(t);
			await f.evaluate(() => { const b = document.getElementById('projectMenuBtn'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
			if (!(await waitFor(f, () => { const r = document.querySelector('#projectMenu .pjx-tb-noproj'); return !!(r && r.getBoundingClientRect().width > 0); }))) { lost++; n3.push(i + ':menu (setup)'); continue; }
			await stress(f, true);
			const a = await press(t, f, '#projectMenu .pjx-tb-noproj', 'tb:noproj');
			const ok = made(a) && await waitFor(f, () => !!window.PJX.chat.view());
			if (!ok) { lost++; n3.push(i + ':' + (made(a) ? 'not opened' : why(a))); }
		}
		await stress(f, false);
		await report(t, f, 'Title bar › No project', lost, n3, before);
	},
	async 'Send under redraws'(t) {
		const f = await openApp(t);
		await t.app.page(t, f, 'dashboard');
		// Send in an open chat: each press adds its message exactly once
		await f.evaluate(() => window.PJX.chat.openChat('chat-trip'));
		await waitFor(f, () => !!document.querySelector('.pjx-npc .pjx-npc-input'));
		let before = await stressCounts(f); let lost = 0, typed = 0; const notes = [];
		await stress(f, true);
		for (let i = 1; i <= N; i++) {
			const msg = 'Stress send ' + i;
			await press(t, f, '.pjx-npc .pjx-npc-input');
			await t.page.keyboard.type(msg, { delay: 4 });
			const v = await f.evaluate(() => ({ field: (document.querySelector('.pjx-npc .pjx-npc-input') || {}).value, text: (window.PJX.chat.view() || {}).text }));
			if (v.field !== msg && v.text !== msg) { typed++; notes.push(i + ':typing lost (' + JSON.stringify(v) + ')'); }
			const a = await press(t, f, '.pjx-npc .pjx-npc-send', 'npc:send');
			const ok = made(a) && await waitFor(f, (m) => { const c = window.PJX.chat.chatOf('chat-trip'); return !!c && c.transcript.filter((x) => x[0] === 'user' && x[1] === m).length === 1; }, msg);
			if (!ok) { lost++; notes.push(i + ':' + (made(a) ? 'not sent' : why(a))); }
			await f.evaluate(() => { const v = window.PJX.chat.view(); if (v) { v.text = ''; v.sending = false; } const i = document.querySelector('.pjx-npc .pjx-npc-input'); if (i) i.value = ''; });
		}
		await stress(f, false);
		const dup = await f.evaluate(() => { const c = window.PJX.chat.chatOf('chat-trip'); const u = c.transcript.filter((x) => x[0] === 'user' && /^Stress send /.test(x[1])).map((x) => x[1]); return u.length - new Set(u).size; });
		await report(t, f, 'Send', lost, notes, before);
		await t.check(`Send: typing kept every word in ${N - typed} of ${N} rounds, and no message was sent twice`, typed === 0 && dup === 0, notes.join(' | '));
	},
	async 'the first message’s Enter under redraws'(t) {
		const f = await openApp(t);
		await t.app.page(t, f, 'dashboard');
		// each round mints its chat exactly once and leaves the composer empty
		const before = await stressCounts(f); let lost = 0; const n2 = [];
		for (let i = 1; i <= N; i++) {
			await stress(f, false);
			await f.evaluate(() => window.PJX.chat.newDraft());
			await waitFor(f, () => !!document.querySelector('.pjx-npc .pjx-npc-input'));
			await t.page.waitForTimeout(60);
			await stress(f, true);
			const msg = 'Stress first message ' + i;
			await press(t, f, '.pjx-npc .pjx-npc-input');
			await t.page.keyboard.type(msg, { delay: 4 });
			await t.page.keyboard.press('Enter');
			const ok = await waitFor(f, (m) => { const cs = (window.PJX.S.world.facts.chats || []).filter((c) => c.first === m); const v = window.PJX.chat.view(); const inp = document.querySelector('.pjx-npc .pjx-npc-input'); return cs.length === 1 && !!v && v.id === cs[0].id && !!inp && inp.value === ''; }, msg);
			if (!ok) n2.push(i + ':' + JSON.stringify(await f.evaluate((m) => { const cs = (window.PJX.S.world.facts.chats || []).filter((c) => c.first === m); const v = window.PJX.chat.view() || {}; const inp = document.querySelector('.pjx-npc .pjx-npc-input'); return { minted: cs.length, partial: (window.PJX.S.world.facts.chats || []).slice(-1).map((c) => c.first)[0], draft: !!v.draft, field: inp && inp.value, focus: (document.activeElement || {}).className }; }, msg)));
			if (!ok) lost++;
		}
		await stress(f, false);
		await report(t, f, 'Enter on the first message', lost, n2, before);
	},
	async 'History and Make this a project… under redraws'(t) {
		const f = await openApp(t);
		await t.app.page(t, f, 'dashboard');
		await f.evaluate(() => window.PJX.chat.openChat('chat-trip'));
		await waitFor(f, () => !!document.querySelector('.pjx-npc [data-c-key="npc:history"]'));
		// History, from inside the no-project chat
		let before = await stressCounts(f); let lost = 0; const notes = [];
		for (let i = 1; i <= N; i++) {
			await stress(f, true);
			const a = await press(t, f, '.pjx-npc [data-c-key="npc:history"]', 'npc:history');
			const ok = made(a) && await waitFor(f, histOpen);
			if (!ok) { lost++; notes.push(i + ':' + (made(a) ? 'History did not open' : why(a))); }
			await stress(f, false);
			await closeHistory(f);
		}
		await report(t, f, 'History (in the no-project chat)', lost, notes, before);
		// Make this a project…: the chooser opens
		before = await stressCounts(f); lost = 0; const n2 = [];
		for (let i = 1; i <= N; i++) {
			await stress(f, true);
			const a = await press(t, f, '.pjx-npc [data-c-key="npc:make"]', 'npc:make');
			const ok = made(a) && await waitFor(f, () => document.querySelectorAll('.pjx-dlg .pjx-choice').length === 2);
			if (!ok) { lost++; n2.push(i + ':' + (made(a) ? 'chooser did not open' : why(a))); }
			await stress(f, false);
			await settle(t);
			await waitFor(f, () => !document.querySelector('.pjx-dlg'), null, 2000);
		}
		await report(t, f, 'Make this a project…', lost, n2, before);
	},
	async 'Make a project from this chat under redraws'(t) { await conversion(t, 'Make a project from this chat', 'npc:need:go:0', '.pjx-np-chat'); },
	async 'Move this chat into a project under redraws'(t) { await conversion(t, 'Move this chat into a project', 'npc:need:go:1', '.pjxc-move'); },
	async 'the chat keeps its header between tasks while PMConcept7 and the app redraw'(t) {
		const f = await openApp(t);
		await t.app.page(t, f, 'dashboard');
		await f.evaluate(() => window.PJX.chat.openChat('chat-trip'));
		await waitFor(f, () => !!document.querySelector('.pjx-npc .pjx-npc-head'));
		// redraws every 50 ms for 12 s, alternating an app change and a PMConcept7 render; right after each one a sample is
		// queued as its own task (a MessageChannel message), and a second sampler runs task after task the whole time
		await f.evaluate(() => {
			const G = window.__pjxHead = { on: true, samples: 0, missing: 0, after: 0, afterMissing: 0, removed: 0, redraws: 0, i: 0 };
			const look = () => !!document.querySelector('.pjx-npc .pjx-npc-head');
			const mc = new MessageChannel();
			mc.port1.onmessage = () => { if (!G.on) return; G.samples++; if (!look()) G.missing++; mc.port2.postMessage(0); };
			mc.port2.postMessage(0);
			const after = new MessageChannel();
			after.port1.onmessage = () => { G.after++; if (!look()) G.afterMissing++; };
			new MutationObserver((rs) => rs.forEach((r) => r.removedNodes.forEach((n) => { if (n.nodeType === 1 && n.classList && n.classList.contains('pjx-npc')) G.removed++; }))).observe(document.body, { childList: true, subtree: true });
			G.timer = setInterval(() => {
				if (!G.on) return;
				G.redraws++;
				if (G.i++ % 2) window.PM56_APP.render(); else window.PJX.emit('change', { why: 'header-check' });
				after.port2.postMessage(0);
			}, 50);
		});
		await t.page.waitForTimeout(12000);
		const g = await f.evaluate(() => { const G = window.__pjxHead; G.on = false; clearInterval(G.timer); return { samples: G.samples, missing: G.missing, after: G.after, afterMissing: G.afterMissing, removed: G.removed, redraws: G.redraws }; });
		await t.check(`the chat had its header in ${g.after - g.afterMissing} of ${g.after} samples taken right after a redraw and ${g.samples - g.missing} of ${g.samples} continuous ones (${g.afterMissing + g.missing} without; the chat was removed ${g.removed} times; ${g.redraws} redraws, half of them PMConcept7 renders)`,
			g.after >= 100 && g.redraws >= 100 && g.afterMissing === 0 && g.missing === 0 && g.removed === 0, JSON.stringify(g));
	}
};
/* both conversion paths, from the Needs a project notice: its chip, then the named choice */
async function conversion(t, name, key, sel) {
		const f = await openApp(t);
		await t.app.page(t, f, 'dashboard');
		await f.evaluate(() => window.PJX.chat.openChat('chat-trip'));
		await waitFor(f, () => !!document.querySelector('.pjx-npc [data-c-key="npc:need:plan"]'));
		{
			const before = await stressCounts(f); let lost = 0; const n3 = [];
			for (let i = 1; i <= N; i++) {
				await stress(f, false);
				await f.evaluate(() => { window.PJX.split && window.PJX.split.select('tastebook'); const v = window.PJX.chat.view(); if (v) v.notice = null; window.PJX.emit('change', { why: 'press-check reset' }); });
				await waitFor(f, (s) => !document.querySelector(s) && !document.querySelector('.pjx-npc-notice') && !!document.querySelector('.pjx-npc [data-c-key="npc:need:plan"]'), sel, 3000);
				await stress(f, true);
				const a = await press(t, f, '.pjx-npc [data-c-key="npc:need:plan"]', 'npc:need:plan');
				const n = made(a) && await waitFor(f, () => !!document.querySelector('.pjx-npc-notice [data-c-key="npc:need:go:0"]'));
				const b = n && await press(t, f, '.pjx-npc [data-c-key="' + key + '"]', key);
				const ok = made(b) && await waitFor(f, (s) => !!document.querySelector(s), sel, 4000);
				if (!ok) { lost++; n3.push(i + ':' + (!made(a) ? 'chip ' + why(a) : !n ? 'chip press lost' : !made(b) ? 'choice ' + why(b) : 'choice press lost')); }
			}
			await stress(f, false);
			await report(t, f, name, lost, n3, before);
		}
}

// Jared's review, 2026-11-13, item 8: "when you are setting up a new project, and you choose your option and click done
// for each section, it should open the next section after you hit done on the previous section. Not just close them all."
// Real presses through every New Project section (a new Project, and adding a folder), in order and out of order: Done
// (or Continue) on a section opens the next section that isn't finished, brings it into view and puts the focus on its
// first control; Done on the last one leaves them all closed with the focus on Create; a section reopened and closed
// again does the same. Under Reduced Motion the scroll is immediate; without it, it still ends in view.
//   browser-check run Concepts/projects-redesign/opus-5.5/tools/checks/np-next.check.mjs --set page=<dir>/projects-concepts.html
const sess = (f, fn, arg) => f.evaluate(fn, arg);
// the sections, what is open, where the focus is, and whether the open section is in its scroller's view
const STATE = () => {
	const s = window.PJX.split.session(), NP = window.PJX.np, list = NP.sections(s);
	const open = Array.from(document.querySelectorAll('.pjx-np-sec[data-state="open"]')).map((x) => x.getAttribute('data-step'));
	const a = document.activeElement, sec = a && a.closest && a.closest('.pjx-np-sec');
	const el = open[0] ? document.querySelector('.pjx-np-sec[data-step="' + open[0] + '"]') : null;
	let inView = null;
	if (el) {
		let sc = el.parentElement; while (sc && sc !== document.body && !(sc.scrollHeight > sc.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement;
		const r = el.getBoundingClientRect(), sr = sc && sc !== document.body ? sc.getBoundingClientRect() : { top: 0, bottom: innerHeight };
		inView = r.top >= sr.top - 1 && r.top < sr.bottom - 40;
	}
	return {
		list, open, inView,
		focusSec: sec ? sec.getAttribute('data-step') : null,
		focusInBody: !!(a && a.closest && a.closest('.pjx-np-body')),
		focusIsHead: !!(a && a.classList && a.classList.contains('pjx-np-head')),
		focusCreate: !!(a && a.getAttribute && a.getAttribute('data-c-key') === 'rv:go'),
		problems: Object.fromEntries(list.map((id) => [id, !!NP.problem(s, id)])),
		go: open[0] ? ((document.querySelector('[data-c-key="sec:' + open[0] + ':go"]') || {}).textContent || '').trim() : null
	};
};
async function startNew(t, way, o) {
	const f = await t.app.open(t, o);
	await t.app.click(t, f, '[data-c-key="lib:new"]', { wait: 300 });
	await t.app.click(t, f, '[data-c-key="way:' + way + '"]', { wait: 400 });
	await f.waitForFunction(() => document.querySelectorAll('.pjx-np-sec').length > 2, null, { timeout: 15000 });
	return f;
}
// open a section by its head (a real press), unless it is already open
async function openSec(t, f, id) {
	const st = await sess(f, (id) => (document.querySelector('.pjx-np-sec[data-step="' + id + '"]') || {}).getAttribute?.('data-state'), id);
	if (st !== 'open') await t.app.click(t, f, '[data-c-key="sec:' + id + '"]', { wait: 300 });
}
// Done (or Continue) on the open section, a real press; then the state once it settles
async function done(t, f, id, ms) {
	await t.app.click(t, f, '[data-c-key="sec:' + id + ':go"]', { wait: ms == null ? 450 : ms });
	return sess(f, STATE);
}
// the expected next: the next section after this one, then any before it, that isn't finished (pressed with no problem)
const nextOf = (list, fin, problems, after) => {
	const i = list.indexOf(after), order = list.slice(i + 1).concat(list.slice(0, i + 1));
	return order.find((x) => x !== after && !(fin.has(x) && !problems[x])) || null;
};
async function judge(t, label, st, want) {
	if (want) {
		await t.check(`${label}: ${want} opens next`, st.open.length === 1 && st.open[0] === want, JSON.stringify({ open: st.open }));
		await t.check(`${label}: ${want} is in view and its first control has the focus`, st.inView === true && st.focusSec === want && st.focusInBody && !st.focusIsHead, JSON.stringify({ inView: st.inView, focusSec: st.focusSec, inBody: st.focusInBody, head: st.focusIsHead }));
	} else {
		await t.check(`${label}: every section is closed`, st.open.length === 0, JSON.stringify({ open: st.open }));
		await t.check(`${label}: the focus is on Create`, st.focusCreate, JSON.stringify({ focusSec: st.focusSec }));
	}
}
// walk: Done on each section in `order`, checking what opens; returns the finished set
// a section that needs an answer first (where needs the Project's name): give it the way a person does, by typing
async function answer(t, f, id) {
	const p = await sess(f, (id) => { const x = window.PJX.np.problem(window.PJX.split.session(), id); return x ? { field: x.field || null, text: x.text } : null; }, id);
	if (!p || !p.field) return;
	const box = f.locator('.pjx-np-sec[data-step="' + id + '"] [data-pjx-key="' + p.field + '"]').first();
	if (await box.count()) { await box.fill('plant-journal-next'); await t.page.waitForTimeout(500); }
}
async function walk(t, f, name, order, fin) {
	for (const id of order) {
		await openSec(t, f, id);
		await answer(t, f, id);
		const before = await sess(f, STATE);
		if (before.problems[id]) { await t.check(`${name} · ${id} has an answer to give first`, false, 'the section has a problem; the walk expects every section to be answerable as it starts'); return fin; }
		const st = await done(t, f, id);
		fin.add(id);
		await judge(t, `${name} · Done on ${id} (${before.go})`, st, nextOf(before.list, fin, before.problems, id));
	}
	return fin;
}

export const tests = {
	async 'a new Project: Done opens each next section in order, and after the last the focus is on Create (Reduced Motion)'(t) {
		const f = await startNew(t, 'new');
		const s0 = await sess(f, STATE);
		await t.check('the sections of a new Project', s0.list.join() === 'start,where,like,versions,online,backup', s0.list.join());
		// the walk begins from the first section, opened by its head
		await walk(t, f, 'new, in order', s0.list, new Set());
		// the button's words: Continue while another is left, Done on the last one left
		const f2 = await startNew(t, 'new');
		await openSec(t, f2, 'start');
		await t.check('Continue while other sections are left', (await sess(f2, STATE)).go === 'Continue', (await sess(f2, STATE)).go);
	},
	async 'a new Project out of order, and a section reopened and closed again (Reduced Motion)'(t) {
		const f = await startNew(t, 'new');
		const list = (await sess(f, STATE)).list;
		// begin in the middle: versions, then what follows it, then the ones before it
		const fin = new Set();
		await openSec(t, f, 'versions');
		let before = await sess(f, STATE), st = await done(t, f, 'versions'); fin.add('versions');
		await judge(t, 'out of order · Done on versions', st, nextOf(list, fin, before.problems, 'versions'));
		await t.check('out of order · after versions comes online', st.open[0] === 'online', st.open.join());
		before = st; st = await done(t, f, 'online'); fin.add('online');
		await judge(t, 'out of order · Done on online', st, nextOf(list, fin, before.problems, 'online'));
		before = st; st = await done(t, f, 'backup'); fin.add('backup');
		await judge(t, 'out of order · Done on backup, the last in the list: the first unfinished one before it', st, nextOf(list, fin, before.problems, 'backup'));
		await t.check('out of order · after backup comes start, the first section not yet finished', st.open[0] === 'start', st.open.join());
		// reopen a finished section and close it again with its Done: the next unfinished one opens (start is still open-able)
		await openSec(t, f, 'online');
		before = await sess(f, STATE); st = await done(t, f, 'online');
		await judge(t, 'reopened online · Done again', st, nextOf(list, fin, before.problems, 'online'));
		await t.check('reopened online · the next unfinished is start', st.open[0] === 'start', st.open.join());
		await walk(t, f, 'out of order, the rest', ['start', 'where', 'like'], fin);
		// every one finished: reopening one and pressing Done closes them all, with the focus on Create
		await openSec(t, f, 'like');
		st = await done(t, f, 'like');
		await judge(t, 'all finished · like reopened, Done', st, null);
	},
	async 'adding a folder: Done opens each next section, without Reduced Motion too'(t) {
		const f = await startNew(t, 'folder', { reduced: false });
		const list = (await sess(f, STATE)).list;
		await t.check('the sections of adding a folder', list[0] === 'folder' && list.length >= 5, list.join());
		// the folder section needs a folder first: answer it the way a person does, then walk the rest
		await openSec(t, f, 'folder');
		const pick = f.locator('.pjx-np-sec[data-step="folder"] .pjx-np-body .pjx-choice:not(.is-off)').first();
		if (await pick.count()) await t.app.click(t, f, pick, { wait: 1500 });
		const p = await sess(f, () => !!window.PJX.np.problem(window.PJX.split.session(), 'folder'));
		if (p) { await t.check('the folder section is answered by its first choice', true); return; }
		const fin = new Set();
		// without Reduced Motion the scroll is smooth: give it time to end before judging the view
		for (const id of list) {
			await openSec(t, f, id);
			await answer(t, f, id);
			const before = await sess(f, STATE);
			if (before.problems[id]) break;
			const st = await done(t, f, id, 1100); fin.add(id);
			await judge(t, `folder (full motion) · Done on ${id}`, st, nextOf(list, fin, before.problems, id));
		}
	}
};

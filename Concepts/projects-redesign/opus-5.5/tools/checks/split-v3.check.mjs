// Split v3 (Jared 2026-11-10, "easier to read"; 2026-11-11, "We are replacing v2 with v3") is the Split concept drawn
// with concepts/c-v3.css: that Split opens as v3 from the strip and by key, how each plate's facts are set, the layout
// audit in every look, scenario and width, and v3 measured against Split's base layout for what the audit cannot see.
const state = (f) => f.evaluate(() => {
	const c = window.PJX.split.state();
	const fact = document.querySelector('#pjxc .pjxc-facts > .pmu-fact'), val = document.querySelector('#pjxc .pjxc-facts .pmu-factv');
	return {
		read: document.documentElement.getAttribute('data-pjx-read'), api: window.PJX.read.get(), mounted: window.PJX.S.mounted, sel: c && c.sel,
		marks: document.querySelectorAll('#pjxc [data-v3-long], #pjxc [data-v3-stack]').length,
		factDisplay: fact ? getComputedStyle(fact).display : null, valAlign: val ? getComputedStyle(val).textAlign : null,
		// a plain value is regular weight exactly (the looks' static faces turn anything from 401 to 500 into medium); a status value keeps its weight
		plain: Array.from(new Set(Array.from(document.querySelectorAll('#pjxc .pjxc-facts > .pmu-fact:not([data-tone]) > .pmu-factv')).map((v) => getComputedStyle(v).fontWeight))).join(','),
		toned: Math.min(999, ...Array.from(document.querySelectorAll('#pjxc .pjxc-facts > .pmu-fact[data-tone] > .pmu-factv')).map((v) => Number(getComputedStyle(v).fontWeight)))
	};
});
const pressed = (t) => t.page.evaluate(() => Array.from(document.querySelectorAll('#opt button[aria-pressed="true"]')).map((b) => b.dataset.opt).join(','));
const plates = (f) => f.evaluate(() => Object.fromEntries(Array.from(document.querySelectorAll('#pjxc .pjxc-facts')).map((g) => {
	const p = g.closest('[data-plate]');
	return [p ? p.getAttribute('data-plate') : '?', (g.hasAttribute('data-v3-stack') ? 'stack' : 'beside') + ':' + g.querySelectorAll('.pmu-fact[data-v3-long]').length];
})));
/* PMConcept7's editor minimap canvas sits behind the Projects page, and the audit's "canvas painted" judges the page's
   pixels over it, with no way to leave a canvas out by selector (browser-check gaps 2ff3d9 and 2d5855). It is taken out
   of the audit here by a rule, since PMConcept7 makes the canvas again as it redraws; nothing else is changed. */
const hideMinimap = (f) => f.addStyleTag({ content: '.pmw-ed-canvas { visibility: hidden !important; }' });
/* PMConcept7's own notification toasts hang under the bell and may lie over the page head's buttons for a few seconds
   (its ruling: covering a control is fine). They are not Split's, and the audit's "controls can be clicked" would count
   them against the page. Closing each with its own button was not enough: a new one can pop in while the audit is still
   measuring (2026-11-12, friendly-light). So for this file's audits the toasts are taken out of the picture by a rule,
   as the minimap canvas is; nothing of Split's is hidden, and PMConcept7's own kit covers its toasts. */
async function audit(t, f, name) {
	await f.evaluate(() => {
		if (document.getElementById('split-v3-check-no-toasts')) return;
		const s = document.createElement('style');
		s.id = 'split-v3-check-no-toasts';
		s.textContent = '.pmn-toast { visibility: hidden !important; pointer-events: none !important; }';
		document.head.appendChild(s);
	});
	await t.audit(name);
}
/* how many lines the tallest value that sits beside its label takes (a stacked or long one has the plate's width) */
const tallestBeside = (f) => f.evaluate(() => Math.max(0, ...Array.from(document.querySelectorAll('#pjxc .pjxc-facts:not([data-v3-stack]) > .pmu-fact:not([data-v3-long]) > .pmu-factv')).map((v) => Math.round(v.getBoundingClientRect().height / (parseFloat(getComputedStyle(v).lineHeight) || 19)))));

const LOOKS = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light'];
/* v3 keeps Split's base layout (review r2, N4 and N5): what c.css alone lays out, which was Split v2 and is still
   what v3 restyles. PJX.read.set('v2') shows it for a moment; no control does. Things the audit cannot see, each
   measured in v3 and in the base layout on the same state:
   - text cut off with an ellipsis: a by-design clamp, which the audit leaves alone. v3 must cut nothing v2 shows whole;
   - a plate's glyph beside its title: in a narrow pane c.css sizes the titles for v2's gap, so a different gap puts
     the glyph on a line of its own;
   - an open question's answers starting on the question's own left edge;
   - the widths Split's own layout steps are measured on (the questions' card, pjxcsteps; an open question's answers,
     pjxcsec): the same in both, so every step falls at the same window width and flipping never re-flows the page. */
const layout = (f) => f.evaluate(() => {
	const cut = Array.from(document.querySelectorAll('#pjxc *')).filter((e) => {
		if (e.scrollWidth <= e.clientWidth || !e.getClientRects().length) return false;
		const cs = getComputedStyle(e);
		return cs.textOverflow === 'ellipsis' && cs.overflowX !== 'visible';
	}).map((e) => String(e.getAttribute('class') || e.tagName).split(' ')[0] + ': ' + e.textContent.trim().slice(0, 70));
	const apart = Array.from(document.querySelectorAll('#pjxc .pjxc-plate[data-head="plate"] > .pmu-cardhead')).filter((h) => {
		const i = h.querySelector(':scope > .pjxc-plico'), x = h.querySelector('.pmu-cardtitle');
		if (!i || !x || !h.getClientRects().length) return false;
		const a = i.getBoundingClientRect(), b = x.getBoundingClientRect();
		return a.bottom <= b.top || a.top >= b.bottom || a.left >= b.left;
	}).map((h) => h.parentElement.getAttribute('data-plate'));
	const sec = document.querySelector('#pjxc .pjx-np-sec[data-state="open"]'), q = sec && sec.querySelector('.pjx-np-q'), ans = sec && sec.querySelector('.pjx-np-body > *');
	const steps = document.querySelector('#pjxc .pjxc-steps'), body = sec && sec.querySelector('.pjx-np-body'), bs = body && getComputedStyle(body);
	const half = (n) => Math.round(n * 2) / 2;
	return { cut, apart, heads: document.querySelectorAll('#pjxc .pjxc-plate[data-head="plate"] > .pmu-cardhead').length, edge: q && ans && ans.getClientRects().length ? Math.round(ans.getBoundingClientRect().left - q.getBoundingClientRect().left) : null,
		steps: steps && steps.getClientRects().length ? half(steps.getBoundingClientRect().width) : null, answers: body && body.getClientRects().length ? half(body.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight)) : null };
});
const show = async (t, f, v) => { await f.evaluate((x) => window.PJX.read.set(x), v); await f.waitForFunction((x) => window.PJX.read.get() === x, v, { timeout: 6000 }); await t.page.waitForTimeout(220); };
/* measured in v3 (which is showing), then in the base layout, and v3 is left showing */
async function sameLayout(t, f, name) {
	const a = await layout(f);
	await show(t, f, 'v2');
	const b = await layout(f);
	await show(t, f, 'v3');
	const more = a.cut.filter((x) => !b.cut.includes(x)), apart = a.apart.filter((x) => !b.apart.includes(x));
	await t.check(`${name}: v3 cuts off no text the base layout shows whole`, !more.length, more.join(' | '));
	await t.check(`${name}: every plate’s glyph is beside its title, as in the base layout`, !apart.length && a.heads === b.heads, apart.join(', ') + ' (' + a.heads + ' heads, base ' + b.heads + ')');
	if (b.edge === 0) await t.equal(`${name}: the open question’s answers start on its own edge, as in the base layout`, a.edge, 0);
	if (b.steps != null) await t.equal(`${name}: the questions’ card is as wide as in the base layout`, a.steps, b.steps);
	if (b.answers != null) await t.equal(`${name}: an open question’s answers have the base layout’s width`, a.answers, b.answers);
}

const open = (t) => t.app.open(t);

export const tests = {
	async 'Split opens as v3: the strip, the keys, Today and A and back'(t) {
		const f = await open(t);
		await f.evaluate(() => window.PJX.split.select('tastebook'));
		await t.page.waitForTimeout(300);
		let s = await state(f);
		await t.equal('Split opens as v3 (attribute)', s.read, 'v3');
		await t.equal('the strip shows one Split, pressed', await pressed(t), 'c');
		await t.equal('the strip has no second Split button', await t.page.evaluate(() => document.querySelectorAll('#opt button[data-opt="c"]').length), 1);
		await t.equal('it is concept C', s.mounted, 'c');
		await t.equal('a fact gives its cells to the plate’s grid', s.factDisplay, 'contents');
		await t.check('values are left-aligned', s.valAlign === 'left' || s.valAlign === 'start', s.valAlign);
		await t.equal('plain values are regular weight, every one', s.plain, '400');
		await t.check('a value with a status keeps its weight', s.toned >= 600, String(s.toned));
		await t.shot('v3-project', 'Split v3, the Project page (LOOK)');
		// Today by its key, and back to Split by key 3 on the strip: still v3, the same Project chosen
		await t.page.locator('.pc-note').click();
		await t.page.keyboard.press('0');
		await t.app.until(t, f, 'key 0: Today, no concept mounted', () => !document.querySelector('#pjxc'), null, 8000);
		await t.page.keyboard.press('3');
		await t.app.until(t, f, 'key 3 on the strip: Split is back', () => !!document.querySelector('#pjxc .pjxc-facts'), null, 8000);
		s = await state(f);
		await t.equal('key 3: v3', s.read, 'v3');
		await t.equal('key 3: the strip follows', await pressed(t), 'c');
		// key 3 inside PMConcept7 from A
		await t.page.click('#moreAB');
		await t.page.click('#opt button[data-opt="a"]');
		await t.app.until(t, f, 'A mounts', () => window.PJX.S.mounted === 'a', null, 8000);
		await t.equal('A is pressed alone', await pressed(t), 'a');
		await t.page.click('#opt button[data-opt="c"]');
		await t.app.until(t, f, 'Split from the strip after A', () => window.PJX.S.mounted === 'c' && !!document.querySelector('#pjxc .pjxc-facts'), null, 8000);
		s = await state(f);
		await t.equal('after A: v3, facts set its way', s.read + ' ' + s.factDisplay, 'v3 contents');
		// New Project beside its Review
		await t.app.moment(t, 'foundonline');
		await t.page.waitForTimeout(1500);
		await t.text(f.locator('#pjxc .pjxc-title').first(), 'budget-tracker');
		await t.shot('v3-new-project', 'Split v3, New Project beside its Review (LOOK)');
	},
	async 'plates: values beside their labels, a dense plate stacked, a sentence under its label'(t) {
		const f = await open(t);
		await f.evaluate(() => window.PJX.split.select('tastebook'));
		await t.page.waitForTimeout(400);
		// full width with the chat open: two columns of plates, each about 340 px
		let p = await plates(f);
		await t.equal('Now (page wide): beside, nothing under its label', p.now, 'beside:0');
		await t.equal('History: beside', p.history, 'beside:0');
		await t.equal('Online copy: beside', p.online, 'beside:0');
		await t.equal('Backup (half width, sentences): every label above its value', p.backup, 'stack:0');
		await t.equal('Where work runs (half width): every label above its value', p.work, 'stack:0');
		const cut = await f.evaluate(() => Array.from(document.querySelectorAll('#pjxc .pjxc-facts :is(.pmu-factl, .pmu-factv)')).filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent).join(' | '));
		await t.check('no label or value is cut off', !cut, cut);
		await t.check('no value beside its label runs past three lines', (await tallestBeside(f)) <= 3, String(await tallestBeside(f)));
		await f.evaluate(() => document.querySelector('[data-plate="backup"]').scrollIntoView({ block: 'start' }));
		await t.page.waitForTimeout(250);
		await t.shot('v3-backup', 'Split v3, Backup and Where it lives (LOOK)');
		// one column of wide plates: values fit beside their labels again, and only a sentence goes under its label
		await t.page.selectOption('#width', '1024');
		await t.app.until(t, f, '1024: Backup is beside its labels again', () => { const g = document.querySelector('#pjxc [data-plate="backup"] .pjxc-facts'); return !!g && !g.hasAttribute('data-v3-stack') && getComputedStyle(g).gridTemplateColumns.split(' ').length === 2; }, null, 10000);
		p = await plates(f);
		await t.check('1024: Where work runs is beside', /^beside:/.test(p.work), p.work);
		await t.check('1024: no value beside its label runs past three lines', (await tallestBeside(f)) <= 3, String(await tallestBeside(f)));
		// the narrowest pane stacks by its container rule, with or without marks
		await t.page.selectOption('#width', '640');
		await t.app.until(t, f, '640: one column of facts', () => { const g = document.querySelector('#pjxc .pjxc-facts'); return !!g && getComputedStyle(g).gridTemplateColumns.split(' ').length === 1; }, null, 10000);
	},
	async 'audit: every Project and New Project in v3'(t) {
		const f = await open(t);
		await hideMinimap(f);
		for (const id of ['tastebook', 'experiment', 'harbor', 'docs-site', 'recipe-app', 'garden-notes', 'photo-sorter', 'legacy-app']) {
			await f.evaluate((i) => window.PJX.split.select(i), id);
			await t.page.waitForTimeout(350);
			await audit(t, f, `v3 ${id}`);
			await sameLayout(t, f, `v3 ${id}`);
		}
		await t.app.act(t, 'new');
		await t.page.waitForTimeout(600);
		await audit(t, f, 'v3 New Project');
		for (const m of ['foundonline', 'contribute', 'gamejam', 'newdevice', 'backupsetup']) {
			await t.app.moment(t, m);
			await t.page.waitForTimeout(1400);
			await audit(t, f, `v3 ${m}`);
			await sameLayout(t, f, `v3 ${m}`);
		}
	},
	async 'audit: narrower windows and the dialogs in v3'(t) {
		const f = await open(t);
		await hideMinimap(f);
		for (const m of ['fromchat', 'chatmove', 'agent', 'work']) {
			await t.app.moment(t, m);
			await t.page.waitForTimeout(1400);
			await audit(t, f, `v3 ${m}`);
		}
		await t.page.keyboard.press('Escape');
		for (const w of ['1280', '1024', '860', '640']) {
			await t.app.moment(t, 'photosorter');
			await t.page.selectOption('#width', w);
			await t.page.waitForTimeout(900);
			await audit(t, f, `v3 at ${w}`);
			await sameLayout(t, f, `v3 at ${w}`);
		}
		// every plate of the busiest Project at each width (review r2, N4: at 860 every head had its glyph on its own line)
		for (const w of ['1280', '1024', '860', '640', '']) {
			await t.page.selectOption('#width', w);
			await f.evaluate(() => window.PJX.split.select('tastebook'));
			await t.app.until(t, f, `tastebook at ${w || 'full width'}: its plates are drawn`, () => document.querySelectorAll('#pjxc .pjxc-plate[data-head="plate"] > .pmu-cardhead').length >= 5, null, 10000);
			await t.page.waitForTimeout(500);
			await sameLayout(t, f, `tastebook at ${w || 'full width'}`);
		}
	},
	/* R7: all ten looks, with the demo set, on first run and with 40 projects. The audit (overflow, clipped text, covered
	   controls, console) and v2's layout kept, the chosen library row's second line included (review r2, N5). */
	async 'every look: the demo set, first run and 40 projects in v3'(t) {
		const f = await open(t);
		await hideMinimap(f);
		for (const look of LOOKS) {
			await t.step(look, async () => {
				if (look !== 'basic-dark') await t.app.look(t, look);
				for (const sc of ['demo', 'first', 'many']) {
					await t.page.selectOption('#scenario', sc);
					await t.app.page(t, f, 'projects');
					await t.app.until(t, f, `${look}, ${sc}: the page is drawn`, (x) => { const r = document.querySelector('.pjx-root'); return !!document.querySelector('#pjxc') && !!r && r.getAttribute('data-scenario') === x && document.documentElement.getAttribute('data-pjx-read') === 'v3'; }, sc, 12000);
					if (sc === 'demo') {
						await f.evaluate(() => window.PJX.split.select('tastebook'));
						await t.app.until(t, f, `${look}: tastebook is the chosen row`, () => /tastebook/.test((document.querySelector('#pjxc .pjxc-row[aria-current="true"]') || {}).textContent || ''), null, 8000);
					}
					await t.page.waitForTimeout(350);
					await audit(t, f, `v3 ${look}, ${sc}`);
					await sameLayout(t, f, `${look}, ${sc}`);
				}
			});
		}
		await t.page.selectOption('#scenario', 'demo');
		await t.app.look(t, 'basic-dark');
	},
	/* the 2026-11-10 fix pass's parts (SPEC-split-v3 R9): Where work runs' rows, the sync paused on a clash, and the
	   dialogs Split opens follow the page. */
	async 'fix-pass parts: work rows, the paused sync and Split’s dialogs in v3'(t) {
		const f = await open(t);
		await hideMinimap(f);
		const rows = () => f.evaluate(() => {
			const cs = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null; };
			const to = cs('#pjxc .pjx-wk-row:not([data-mode="chosen"]) .pjx-wk-to'), ch = cs('#pjxc .pjx-wk-row[data-mode="chosen"] .pjx-wk-to'), why = cs('#pjxc .pjx-wk-why');
			// Run this on…: a live one (work that hasn't started) and an off one (started work keeps its Computer)
			const live = cs('#pjxc .pjx-wk-pin:not([aria-disabled="true"])'), off = cs('#pjxc .pjx-wk-pin[aria-disabled="true"]');
			return { to: to && Number(to.fontWeight), chosen: ch && Number(ch.fontWeight), underline: !!why && why.textDecorationColor === why.color,
				pinUnderline: !!live && live.textDecorationColor === live.color, pinIsLink: !!live && !!why && live.color === why.color && live.textDecorationLine !== 'none',
				offIsOff: !!off && !!live && off.textDecorationLine === 'none' && off.color !== live.color };
		});
		const dialog = () => f.evaluate(() => {
			const d = document.querySelector('.pjx-dlg-back[data-concept="c"]'); if (!d) return null;
			const list = d.querySelector('.pjx-choices-list'), mid = list && list.children[1], fact = d.querySelector('.pjx-fact, .pjx-np-line'), cap = d.querySelector('.pjx-np-cap');
			const on = list && list.querySelector('.pjx-choice.is-on'), off = list && list.querySelector('.pjx-choice:not(.is-on)');
			return {
				gap: list ? getComputedStyle(list).rowGap : null, midRadius: mid ? getComputedStyle(mid).borderTopLeftRadius : null, midRule: mid ? getComputedStyle(mid).borderTopWidth : null,
				fact: fact ? getComputedStyle(fact).fontSize + '/' + getComputedStyle(fact).lineHeight : null, cap: cap ? getComputedStyle(cap).textTransform : null,
				chosenShows: !!on && !!off && (getComputedStyle(on).backgroundColor !== getComputedStyle(off).backgroundColor || getComputedStyle(on).boxShadow !== getComputedStyle(off).boxShadow)
			};
		});
		const closeDialog = async () => { await t.page.keyboard.press('Escape'); await t.app.until(t, f, 'the dialog closed', () => !document.querySelector('.pjx-dlg-back'), null, 6000); };
		const workPlate = async () => {
			await f.evaluate(() => window.PJX.split.select('tastebook'));
			await t.app.until(t, f, 'tastebook: the work plate is drawn', () => !!document.querySelector('#pjxc [data-plate="work"] .pjx-wk-rows'), null, 10000);
			await f.evaluate(() => { const el = document.querySelector('[data-plate="work"]'), sc = el.closest('.pjxc-scroll'); sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 40; });
			await t.page.waitForTimeout(200);
		};
		// Where work runs: where a piece of work went is a value, a chosen Computer keeps its weight, Why is quiet
		await workPlate();
		let r = await rows();
		await t.equal('v3: where work went is regular weight', r.to, 400);
		await t.check('v3: a chosen Computer keeps its weight', r.chosen >= 600, String(r.chosen));
		await t.check('v3: Why this computer has no underline at rest', !r.underline);
		await t.check('v3: a live Run this on… is a link like it, with no underline at rest', r.pinIsLink && !r.pinUnderline, JSON.stringify(r));
		await t.check('v3: an off Run this on… still reads as off', r.offIsOff, JSON.stringify(r));
		// the keyboard reaches it and it shows its underline with the focus
		await f.locator('#pjxc .pjx-wk-why').first().focus();
		await t.page.keyboard.press('Shift+Tab');
		await t.page.keyboard.press('Tab');
		await t.check('v3: Why this computer takes its underline with the keyboard focus', await f.evaluate(() => { const a = document.activeElement; return !!a && a.classList.contains('pjx-wk-why') && getComputedStyle(a).textDecorationColor === getComputedStyle(a).color; }));
		await t.crop('v3-work-rows', f.locator('[data-plate="work"]'), 'Split v3, Where work runs with its rows (LOOK)');
		await audit(t, f, 'v3 work plate');
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="wk:why:1"]', { wait: 400 });
		let d = await dialog();
		await t.equal('v3: Why this computer reads at the page’s size', d && d.fact, '13px/19px');
		await audit(t, f, 'v3 Why this computer');
		await t.shot('v3-why', 'Split v3, Why this computer (LOOK)');
		await closeDialog();
		// Start a run…: its list of choices is ruled, and its fields' labels are in the text face
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="p:startrun"]', { wait: 400 });
		d = await dialog();
		await t.equal('v3: Start a run’s choices are one ruled list', d && d.gap + ' ' + d.midRule + ' ' + d.midRadius, '0px 1px 0px');
		await t.equal('v3: its fields’ labels are in sentence case', d && d.cap, 'none');
		await audit(t, f, 'v3 Start a run');
		await t.shot('v3-start-run', 'Split v3, Start a run (LOOK)');
		await closeDialog();
		// getting the latest pauses on a clash: the plate says so as a status, and the dialog's choices are one ruled list
		await f.evaluate(() => window.PJX.split.select('photo-sorter'));
		await t.app.until(t, f, 'photo-sorter: its Online copy can get the original’s changes', () => !!document.querySelector('[data-c-key="p:getorig"]'), null, 10000);
		await t.app.tick(t, f, 'pg:clashdemo');
		await t.app.click(t, f, '[data-c-key="p:getorig"]');
		await t.app.until(t, f, 'it paused on the clash', () => !!document.querySelector('[data-c-key="p:settle"]'), null, 15000);
		const paused = await f.evaluate(() => { const v = document.querySelector('#pjxc [data-plate="online"] .pmu-fact[data-tone] .pmu-factv'); return v ? { text: v.textContent, weight: Number(getComputedStyle(v).fontWeight), cut: v.scrollWidth > v.clientWidth + 1 } : null; });
		await t.check('v3: the pause is a status on the plate (weight kept, nothing cut)', !!paused && /Paused/.test(paused.text) && paused.weight >= 600 && !paused.cut, JSON.stringify(paused));
		await f.evaluate(() => { const el = document.querySelector('[data-plate="online"]'), sc = el.closest('.pjxc-scroll'); sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 40; });
		await t.page.waitForTimeout(200);
		await t.crop('v3-paused', f.locator('[data-plate="online"]'), 'Split v3, Online copy paused on a clash (LOOK)');
		await audit(t, f, 'v3 paused on a clash');
		for (const look of LOOKS) {
			await t.step(look, async () => {
				if (look !== 'basic-dark') { await t.app.look(t, look); await t.app.page(t, f, 'projects'); await f.evaluate(() => window.PJX.split.select('photo-sorter')); }
				await t.app.until(t, f, `${look}: still paused`, () => !!document.querySelector('[data-c-key="p:settle"]'), null, 10000);
				await t.app.click(t, f, '[data-c-key="p:settle"]', { wait: 400 });
				await t.app.click(t, f, '.pjx-dlg-back [data-c-key="cf:how:theirs"]', { wait: 250 });
				d = await dialog();
				await t.equal(`${look}: the dialog’s choices are one list (no gap)`, d && d.gap, '0px');
				await t.equal(`${look}: ruled apart, square inside the list`, d && d.midRule + ' ' + d.midRadius, '1px 0px');
				await t.check(`${look}: the chosen one is plainly the chosen one`, !!d && d.chosenShows);
				await audit(t, f, `v3 Settle the clash, ${look}`);
				if (look === 'basic-dark' || look === 'retro-light') await t.shot(`v3-settle-${look}`, `Split v3, Settle the clash, ${look} (LOOK)`);
				await closeDialog();
			});
		}
		await t.app.look(t, 'basic-dark');
		await t.app.page(t, f, 'projects');
	}
};

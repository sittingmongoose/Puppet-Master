// Split v3 (Jared 2026-11-10, "easier to read") is Split v2 drawn with concepts/c-v3.css: the switch on the strip and by
// key, what switching keeps, v2 left exactly as it was, how each plate's facts are set, and the layout audit in v3.
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const state = (f) => f.evaluate(() => {
	const c = window.PJX.split.state();
	const fact = document.querySelector('#pjxc .pjxc-facts > .pmu-fact'), val = document.querySelector('#pjxc .pjxc-facts .pmu-factv');
	return {
		read: document.documentElement.getAttribute('data-pjx-read'), api: window.PJX.read.get(), mounted: window.PJX.S.mounted, sel: c && c.sel,
		marks: document.querySelectorAll('#pjxc [data-v3-long], #pjxc [data-v3-stack]').length,
		factDisplay: fact ? getComputedStyle(fact).display : null, valAlign: val ? getComputedStyle(val).textAlign : null
	};
});
const pressed = (t) => t.page.evaluate(() => Array.from(document.querySelectorAll('#opt button[aria-pressed="true"]')).map((b) => b.dataset.read || b.dataset.opt).join(','));
const plates = (f) => f.evaluate(() => Object.fromEntries(Array.from(document.querySelectorAll('#pjxc .pjxc-facts')).map((g) => {
	const p = g.closest('[data-plate]');
	return [p ? p.getAttribute('data-plate') : '?', (g.hasAttribute('data-v3-stack') ? 'stack' : 'beside') + ':' + g.querySelectorAll('.pmu-fact[data-v3-long]').length];
})));
/* PMConcept7's editor minimap canvas sits behind the Projects page, and the audit's "canvas painted" judges the page's
   pixels over it, with no way to leave a canvas out by selector (browser-check gaps 2ff3d9 and 2d5855). It is taken out
   of the audit here by a rule, since PMConcept7 makes the canvas again as it redraws; nothing else is changed. */
const hideMinimap = (f) => f.addStyleTag({ content: '.pmw-ed-canvas { visibility: hidden !important; }' });
/* how many lines the tallest value that sits beside its label takes (a stacked or long one has the plate's width) */
const tallestBeside = (f) => f.evaluate(() => Math.max(0, ...Array.from(document.querySelectorAll('#pjxc .pjxc-facts:not([data-v3-stack]) > .pmu-fact:not([data-v3-long]) > .pmu-factv')).map((v) => Math.round(v.getBoundingClientRect().height / (parseFloat(getComputedStyle(v).lineHeight) || 19)))));

export const tests = {
	async 'opens on v3, switches both ways, keeps what was open'(t) {
		const f = await t.app.open(t);
		await f.evaluate(() => window.PJX.split.select('tastebook'));
		await t.page.waitForTimeout(300);
		let s = await state(f);
		await t.equal('opens on v3 (attribute)', s.read, 'v3');
		await t.equal('opens on v3 (strip)', await pressed(t), 'v3');
		await t.equal('it is still concept C', s.mounted, 'c');
		await t.equal('v3: a fact gives its cells to the plate’s grid', s.factDisplay, 'contents');
		await t.check('v3: values are left-aligned', s.valAlign === 'left' || s.valAlign === 'start', s.valAlign);
		await t.shot('v3-project', 'Split v3, the Project page (LOOK)');
		// v2 by the strip: nothing of v3 is left behind
		await t.page.click('#opt button[data-read="v2"]');
		await t.page.waitForTimeout(400);
		s = await state(f);
		await t.equal('v2: attribute gone', s.read, null);
		await t.equal('v2: no marks left', s.marks, 0);
		await t.equal('v2: facts are rows again', s.factDisplay, 'flex');
		await t.equal('v2: values right-aligned as before', s.valAlign, 'right');
		await t.equal('v2: the same Project is chosen', s.sel, 'tastebook');
		await t.equal('v2 pressed on the strip', await pressed(t), 'v2');
		// keys 4 and 3 on the strip
		await t.page.locator('.pc-note').click();
		await t.page.keyboard.press('4');
		await t.page.waitForTimeout(400);
		await t.equal('key 4 on the strip: v3', (await state(f)).read, 'v3');
		await t.equal('key 4 on the strip: pressed', await pressed(t), 'v3');
		await t.page.keyboard.press('3');
		await t.page.waitForTimeout(400);
		await t.equal('key 3 on the strip: v2', (await state(f)).read, null);
		// keys 4 and 3 inside PMConcept7: the strip follows
		await t.quickClick(f.locator('#pjxc .pjxc-title'));
		await t.page.waitForTimeout(150);
		await t.page.keyboard.press('4');
		await t.page.waitForTimeout(500);
		await t.equal('key 4 inside: v3', (await state(f)).read, 'v3');
		await t.equal('key 4 inside: the strip follows', await pressed(t), 'v3');
		await t.page.keyboard.press('3');
		await t.page.waitForTimeout(500);
		await t.equal('key 3 inside: v2', (await state(f)).read, null);
		await t.equal('key 3 inside: the strip follows', await pressed(t), 'v2');
		// an open New Project and its answers survive the switch
		await t.app.moment(t, 'foundonline');
		await t.page.waitForTimeout(1500);
		const draft = () => f.evaluate(() => { const x = window.PJX.split.session(); return x ? JSON.stringify(window.PJX.np.toPlan ? window.PJX.np.toPlan(x) : Object.keys(x)) : null; });
		const before = await draft();
		await t.page.click('#opt button[data-read="v3"]');
		await t.page.waitForTimeout(500);
		await t.check('New Project is still open with the same answers', !!before && before === (await draft()));
		await t.text(f.locator('#pjxc .pjxc-title').first(), 'budget-tracker');
		await t.shot('v3-new-project', 'Split v3, New Project beside its Review (LOOK)');
		// Today and A still work, and coming back to C keeps v3
		await t.page.click('#opt button[data-opt="before"]');
		await t.page.waitForTimeout(500);
		await t.check('Today: no concept mounted', await f.evaluate(() => !document.querySelector('#pjxc')));
		await t.page.click('#opt button[data-read="v3"]');
		await t.page.waitForTimeout(600);
		await t.equal('back on v3', (await state(f)).read, 'v3');
		await t.page.click('#moreAB');
		await t.page.click('#opt button[data-opt="a"]');
		await t.page.waitForTimeout(600);
		await t.equal('A mounts', await f.evaluate(() => window.PJX.S.mounted), 'a');
		await t.equal('A is pressed alone', await pressed(t), 'a');
	},
	async '?split=v2 opens on v2'(t) {
		const page = t.args.page;
		const url = /^[a-z][a-z0-9+.-]+:/i.test(page) ? page : pathToFileURL(path.resolve(page)).href;
		await t.emulate({ reducedMotion: 'reduce' });
		await t.goto(`${url}${url.includes('?') ? '&' : '?'}split=v2&cb=${Date.now()}`, { settleMs: 200 });
		await t.until('layer ready', () => !!(window.PJX_HOST && window.PJX_HOST.isLive()), null, { timeout: 90000, hard: true });
		const f = t.app.frame(t);
		await f.waitForFunction(() => !!(window.PJX && window.PJX.split && document.querySelector('#pjxc')), null, { timeout: 60000 });
		await t.page.waitForTimeout(500);
		await t.equal('no v3 attribute', await f.evaluate(() => document.documentElement.getAttribute('data-pjx-read')), null);
		await t.equal('the strip shows v2', await pressed(t), 'v2');
	},
	async 'plates: values beside their labels, a dense plate stacked, a sentence under its label'(t) {
		const f = await t.app.open(t);
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
		const f = await t.app.open(t);
		await hideMinimap(f);
		for (const id of ['tastebook', 'experiment', 'harbor', 'docs-site', 'recipe-app', 'garden-notes', 'photo-sorter', 'legacy-app']) {
			await f.evaluate((i) => window.PJX.split.select(i), id);
			await t.page.waitForTimeout(350);
			await t.audit(`v3 ${id}`);
		}
		await t.app.act(t, 'new');
		await t.page.waitForTimeout(600);
		await t.audit('v3 New Project');
		for (const m of ['foundonline', 'contribute', 'gamejam', 'newdevice', 'backupsetup']) {
			await t.app.moment(t, m);
			await t.page.waitForTimeout(1400);
			await t.audit(`v3 ${m}`);
		}
	},
	async 'audit: narrower windows and the dialogs in v3'(t) {
		const f = await t.app.open(t);
		await hideMinimap(f);
		for (const m of ['fromchat', 'chatmove', 'agent', 'work']) {
			await t.app.moment(t, m);
			await t.page.waitForTimeout(1400);
			await t.audit(`v3 ${m}`);
		}
		await t.page.keyboard.press('Escape');
		for (const w of ['1280', '1024', '860', '640']) {
			await t.app.moment(t, 'photosorter');
			await t.page.selectOption('#width', w);
			await t.page.waitForTimeout(900);
			await t.audit(`v3 at ${w}`);
		}
	},
	/* the 2026-11-10 fix pass's parts (SPEC-split-v3 R9): Where work runs' rows, the sync paused on a clash, and the
	   dialogs Split opens. In v3 they follow the page; in v2 they are as the fix pass made them. */
	async 'fix-pass parts: work rows, the paused sync and Split’s dialogs in v3, and unchanged in v2'(t) {
		const f = await t.app.open(t);
		await hideMinimap(f);
		const rows = () => f.evaluate(() => {
			const cs = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null; };
			const to = cs('#pjxc .pjx-wk-row:not([data-mode="chosen"]) .pjx-wk-to'), ch = cs('#pjxc .pjx-wk-row[data-mode="chosen"] .pjx-wk-to'), why = cs('#pjxc .pjx-wk-why');
			return { to: to && Number(to.fontWeight), chosen: ch && Number(ch.fontWeight), underline: !!why && why.textDecorationColor === why.color };
		});
		const dialog = () => f.evaluate(() => {
			const d = document.querySelector('.pjx-dlg-back[data-concept="c"]'); if (!d) return null;
			const list = d.querySelector('.pjx-choices-list'), mid = list && list.children[1], fact = d.querySelector('.pjx-fact, .pjx-np-line');
			const on = list && list.querySelector('.pjx-choice.is-on'), off = list && list.querySelector('.pjx-choice:not(.is-on)');
			return {
				gap: list ? getComputedStyle(list).rowGap : null, midRadius: mid ? getComputedStyle(mid).borderTopLeftRadius : null, midRule: mid ? getComputedStyle(mid).borderTopWidth : null,
				fact: fact ? getComputedStyle(fact).fontSize + '/' + getComputedStyle(fact).lineHeight : null,
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
		await t.check('v3: where work went is regular weight', r.to > 0 && r.to < 500, String(r.to));
		await t.check('v3: a chosen Computer keeps its weight', r.chosen >= 600, String(r.chosen));
		await t.check('v3: Why this computer has no underline at rest', !r.underline);
		// the keyboard reaches it and it shows its underline with the focus
		await f.locator('#pjxc .pjx-wk-why').first().focus();
		await t.page.keyboard.press('Shift+Tab');
		await t.page.keyboard.press('Tab');
		await t.check('v3: Why this computer takes its underline with the keyboard focus', await f.evaluate(() => { const a = document.activeElement; return !!a && a.classList.contains('pjx-wk-why') && getComputedStyle(a).textDecorationColor === getComputedStyle(a).color; }));
		await t.crop('v3-work-rows', f.locator('[data-plate="work"]'), 'Split v3, Where work runs with its rows (LOOK)');
		await t.audit('v3 work plate');
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="wk:why:1"]', { wait: 400 });
		let d = await dialog();
		await t.equal('v3: Why this computer reads at the page’s size', d && d.fact, '13px/19px');
		await t.audit('v3 Why this computer');
		await t.shot('v3-why', 'Split v3, Why this computer (LOOK)');
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
		await t.audit('v3 paused on a clash');
		for (const look of ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light']) {
			await t.step(look, async () => {
				if (look !== 'basic-dark') { await t.app.look(t, look); await t.app.page(t, f, 'projects'); await f.evaluate(() => window.PJX.split.select('photo-sorter')); }
				await t.app.until(t, f, `${look}: still paused`, () => !!document.querySelector('[data-c-key="p:settle"]'), null, 10000);
				await t.app.click(t, f, '[data-c-key="p:settle"]', { wait: 400 });
				await t.app.click(t, f, '.pjx-dlg-back [data-c-key="cf:how:theirs"]', { wait: 250 });
				d = await dialog();
				await t.equal(`${look}: the dialog’s choices are one list (no gap)`, d && d.gap, '0px');
				await t.equal(`${look}: ruled apart, square inside the list`, d && d.midRule + ' ' + d.midRadius, '1px 0px');
				await t.check(`${look}: the chosen one is plainly the chosen one`, !!d && d.chosenShows);
				await t.audit(`v3 Settle the clash, ${look}`);
				if (look === 'basic-dark' || look === 'retro-light') await t.shot(`v3-settle-${look}`, `Split v3, Settle the clash, ${look} (LOOK)`);
				await closeDialog();
			});
		}
		await t.app.look(t, 'basic-dark');
		await t.app.page(t, f, 'projects');
		// v2: the same parts exactly as the fix pass made them
		await t.page.click('#opt button[data-read="v2"]');
		await t.app.until(t, f, 'v2 shows', () => !document.documentElement.hasAttribute('data-pjx-read'), null, 6000);
		await f.evaluate(() => window.PJX.split.select('photo-sorter'));
		await t.app.until(t, f, 'v2: still paused on the clash', () => !!document.querySelector('[data-c-key="p:settle"]'), null, 10000);
		await t.app.click(t, f, '[data-c-key="p:settle"]', { wait: 400 });
		d = await dialog();
		await t.equal('v2: the dialog’s choices keep their gap', d && d.gap, '4px');
		await t.check('v2: and their own boxes', !!d && d.midRadius !== '0px', d && d.midRadius);
		await closeDialog();
		await workPlate();
		r = await rows();
		await t.check('v2: where work went is bold as before', r.to >= 600, String(r.to));
		await t.check('v2: Why this computer is underlined as before', r.underline);
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="wk:why:1"]', { wait: 400 });
		d = await dialog();
		await t.equal('v2: Why this computer keeps its size', d && d.fact, '12.5px/17px');
		await closeDialog();
	}
};

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
   of the audit here; nothing else on the page is changed. */
const hideMinimap = (f) => f.evaluate(() => document.querySelectorAll('.pmw-ed-canvas').forEach((c) => { c.style.visibility = 'hidden'; }));

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
		await f.evaluate(() => document.querySelector('[data-plate="backup"]').scrollIntoView({ block: 'start' }));
		await t.page.waitForTimeout(250);
		await t.shot('v3-backup', 'Split v3, Backup and Where it lives (LOOK)');
		// one column of wide plates: values fit beside their labels again, and only a sentence goes under its label
		await t.page.selectOption('#width', '1024');
		await t.page.waitForTimeout(900);
		p = await plates(f);
		await t.check('1024: Backup is beside again, with its long sentence under its label', /^beside:[1-3]$/.test(p.backup), p.backup);
		await t.equal('1024: Where work runs is beside', p.work, 'beside:0');
		// the narrowest pane stacks by its container rule, with or without marks
		await t.page.selectOption('#width', '640');
		await t.page.waitForTimeout(900);
		const cols = await f.evaluate(() => getComputedStyle(document.querySelector('#pjxc .pjxc-facts')).gridTemplateColumns.split(' ').length);
		await t.equal('640: one column of facts', cols, 1);
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
	}
};

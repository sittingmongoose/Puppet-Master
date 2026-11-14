// FO-186 (Jared's Settings review, 2026-11-13, item 4: "There is a field that says model nicknames...It makes no sense,
// it doesnt let you set any values that make sense, this is pointless."). Canon: Plans/settings_inventory.json
// ai.models.model-alias (its presentation_contract, read here) and Models_System 6.7-6.8 (DL-479): one Model nicknames
// list for chat and media models on Models › Presets and nicknames; media.image.model-aliases is retired into it.
// At 1920x1080 (--set size=), by real presses and typing:
//   list      the row is the list, not a text box: every 6.8 built-in (read from Plans/Models_System.md's table) is a
//             line marked Built in
//   add       typing a nickname, choosing its model in the shared model picker (the popup over the page, .o55-pick-pop)
//             and pressing Add saves one line {nickname: model id}; the picker shows no depth even for a model that has
//             depths on the model rows (a nickname holds a model only)
//   refusals  a second nickname that normalizes the same ("FAST" and "  Fast  " after "fast") and a nickname equal to a
//             model's exact id are not saved, and say why beside the list
//   built-in  a line of your own named like a built-in ("Nano-Banana") replaces it (the built-in line goes, yours says
//             it replaces one); removing yours brings the built-in back
//   retired   the Media box media.image.model-aliases is drawn nowhere (Media & Output, both tabs) and is no setting
// Fails main 564ed6a467 (a plain text box; the Media box drawn) and passes the head, both surfaces.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-model-nicknames.check.mjs --set page=<build> --set sandbox=0
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setLookBySetting } from '../helpers/settings-look.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..', '..');
const ID = 'ai.models.model-alias', OLD = 'media.image.model-aliases';
const ROW = JSON.parse(fs.readFileSync(path.join(ROOT, 'Plans', 'settings_inventory.json'), 'utf8')).settings.find((r) => r.id === ID);
/* the 6.8 table: | `nano banana` | `gemini-2.5-flash-image` | image | */
const MS = fs.readFileSync(path.join(ROOT, 'Plans', 'Models_System.md'), 'utf8');
const SEC = MS.slice(MS.indexOf('### 6.8'), MS.indexOf('###', MS.indexOf('### 6.8') + 8));
const BUILTIN = [...SEC.matchAll(/^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/gm)].map((m) => ({ nick: m[1], model: m[2] }));

const LIST = (id) => {
	const row = document.querySelector(`#pm-settings-root [id="setting-${CSS.escape(id)}"]`);
	if (!row) return { row: false };
	const box = row.querySelector('.o55-nick');
	const lines = box ? [...box.querySelectorAll('.o55-nick-line')].map((l) => ({ nick: l.dataset.nick, builtin: l.classList.contains('is-builtin'), tags: [...l.querySelectorAll('.o55-nick-tag')].map((x) => x.textContent.trim()), text: l.textContent.replace(/\s+/g, ' ').trim() })) : [];
	const input = row.querySelector('input.text-control, textarea');
	return { row: true, list: !!box, lines, plain: !box && input ? `a text box (value "${input.value}")` : '', msg: ((box && box.querySelector('.o55-nick-msg')) || {}).textContent || '', value: JSON.stringify(window.PM51 && PM51.value ? PM51.value(id) : null) };
};
const norm = (s) => String(s).trim().toLowerCase().replace(/[\s_-]+/g, ' ');

async function toModels(t, f) {
	await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="ai"]').first().click();
	await t.settle();
	await f.locator('#pm-settings-root .workspace-tabs [data-action="jump-workspace"][data-workspace="providers"]').first().click().catch(() => {});
	await t.settle();
	await f.locator('#pm-settings-root .pm51-mgr .pm51-tabs [data-tab="models"]').first().click().catch(() => {});
	await t.settle();
	await f.locator(`#pm-settings-root [id="setting-${ID}"]`).first().scrollIntoViewIfNeeded().catch(() => {});
	await t.page.waitForTimeout(300);
}
/* add one line by presses: type the nickname, open the add line's picker, press the model, press Add */
async function addLine(t, f, nick, modelName) {
	const row = f.locator(`#pm-settings-root [id="setting-${ID}"]`);
	await row.locator('.o55-nick-input').click();
	await row.locator('.o55-nick-input').fill('');
	await t.page.keyboard.type(nick);
	await row.locator('.o55-nick-add [role="combobox"]').click();
	await t.page.waitForTimeout(450);
	const pop = await f.evaluate(() => {
		const p = document.querySelector('.o55-pick-pop.is-open');
		return p ? { layer: p.parentElement === document.body && getComputedStyle(p).position === 'fixed', names: [...p.querySelectorAll('[role="option"]')].map((o) => (((o.querySelector('strong') || o).firstChild || {}).textContent || '').trim()) } : null;
	});
	const opt = f.locator('.o55-pick-pop.is-open [role="option"]').filter({ hasText: modelName }).first();
	if (await opt.count()) { await opt.click(); await t.page.waitForTimeout(350); }
	const depth = await f.evaluate(() => !!document.querySelector('[role="listbox"][aria-label^="Thinking depth"]'));
	if (await f.evaluate(() => !!document.querySelector('.o55-pick-pop.is-open'))) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(200); }
	await row.locator('[data-action="pm51-nick-add"]').click();
	await t.page.waitForTimeout(500);
	return { pop, depth };
}

export const tests = {
	'FO-186 one Model nicknames list with the built-ins, the shared picker and its refusals': async (t) => {
		const [w, h] = String(t.args.size || '1920x1080').split('x').map(Number);
		const f = await t.app.open();
		await t.viewport(w, h);
		await f.locator('#tab-settings').click();
		await t.settle();
		await t.check(`the inventory row is the one list (${ROW && ROW.type}, default ${JSON.stringify(ROW && ROW.default)}) and Models 6.8 lists built-ins (${BUILTIN.length})`, !!ROW && ROW.type === 'keyvalue' && BUILTIN.length >= 5);
		await toModels(t, f);
		const l0 = await f.evaluate(LIST, ID);
		await t.check('FO-186 Model nicknames is drawn on Models', l0.row);
		await t.check(`FO-186 it is a list of nicknames, not a text box${l0.plain ? ` (${l0.plain})` : ''}`, l0.list, l0.plain || 'no list');
		if (!l0.list) return;
		const missing = BUILTIN.filter((b) => !l0.lines.some((x) => x.builtin && norm(x.nick) === norm(b.nick) && x.tags.includes('Built in')));
		await t.check(`FO-186 every built-in is a line marked Built in (${BUILTIN.map((b) => b.nick).join(', ')})`, !missing.length, `missing ${missing.map((b) => b.nick).join(', ')}`);
		/* add: fast means Claude Haiku (a model with depths on the model rows) */
		const a = await addLine(t, f, 'fast', 'Claude Haiku');
		await t.check('FO-186 the model is chosen in the shared picker over the page', !!(a.pop && a.pop.layer), JSON.stringify(a.pop));
		await t.check('FO-186 the nickname picker shows no depth (a nickname holds a model only)', !a.depth);
		const l1 = await f.evaluate(LIST, ID);
		const v1 = JSON.parse(l1.value || 'null') || {};
		await t.check(`FO-186 Add saves the line ("fast" → ${v1.fast || 'nothing'})`, typeof v1.fast === 'string' && /haiku/i.test(v1.fast) && l1.lines.some((x) => x.nick === 'fast' && !x.builtin), l1.value);
		/* refusals: the same nickname after normalizing, and a model's exact id */
		for (const [nick, why] of [['FAST', /already a nickname/i], ['  Fast  ', /already a nickname/i], ['claude-code/claude-opus', /exact name/i]]) {
			await addLine(t, f, nick, 'Claude Opus');
			const l = await f.evaluate(LIST, ID);
			await t.check(`FO-186 "${nick.trim()}" is refused and says why ("${l.msg.trim()}")`, l.value === l1.value && why.test(l.msg), `value ${l.value}; message "${l.msg.trim()}"`);
		}
		/* a built-in replaced by a line of your own, and back when it is removed */
		await addLine(t, f, 'Nano-Banana', 'Claude Sonnet');
		const l2 = await f.evaluate(LIST, ID);
		const mine = l2.lines.find((x) => !x.builtin && norm(x.nick) === 'nano banana'), built = l2.lines.find((x) => x.builtin && norm(x.nick) === 'nano banana');
		await t.check('FO-186 a line named like a built-in replaces it (the built-in line goes, yours says so)', !!mine && !built && mine.tags.includes('Replaces a built-in'), JSON.stringify(l2.lines.filter((x) => norm(x.nick) === 'nano banana')));
		await f.locator(`#pm-settings-root [id="setting-${ID}"] .o55-nick-line[data-nick="Nano-Banana"] [data-action="pm51-nick-remove"]`).click().catch(() => {});
		await t.page.waitForTimeout(500);
		const l3 = await f.evaluate(LIST, ID);
		await t.check('FO-186 removing it brings the built-in back', l3.lines.some((x) => x.builtin && norm(x.nick) === 'nano banana') && !/nano/i.test(l3.value), JSON.stringify({ value: l3.value }));
	},
	/* --set crops=1 (--set cropDir=, --set tag=head|main): the list, its picker open on a new line and a refusal, in
	   Basic Dark, Glass Light and NieR Dark at 1920x1080 (--set looks= picks others) */
	'FO-186 crops': async (t) => {
		if (String(t.args.crops || '') !== '1') { await t.check('crops are written only with --set crops=1', true); return; }
		const dir = String(t.args.cropDir || path.join(t.run.dir, 'crops')), tag = String(t.args.tag || 'page');
		fs.mkdirSync(dir, { recursive: true });
		const f = await t.app.open();
		await t.viewport(1920, 1080);
		await f.locator('#tab-settings').click();
		await t.settle();
		const off = async () => { if (f === t.page.mainFrame()) return { x: 0, y: 0 }; const el = await f.frameElement().catch(() => null); const b = el && (await el.boundingBox()); return b ? { x: b.x, y: b.y } : { x: 0, y: 0 }; };
		const shoot = async (name, sel, pad = 10) => {
			const r = await f.evaluate((sel) => { const els = [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length); if (!els.length) return null; const rs = els.map((e) => e.getBoundingClientRect()); return { left: Math.min(...rs.map((r) => r.left)), top: Math.min(...rs.map((r) => r.top)), right: Math.max(...rs.map((r) => r.right)), bottom: Math.max(...rs.map((r) => r.bottom)) }; }, sel);
			if (!r) return;
			const o = await off(), vp = t.page.viewportSize(), x = Math.max(0, Math.floor(r.left + o.x - pad)), y = Math.max(0, Math.floor(r.top + o.y - pad));
			const clip = { x, y, width: Math.min(vp.width - x, Math.ceil(r.right - r.left + pad * 2)), height: Math.min(vp.height - y, Math.ceil(r.bottom - r.top + pad * 2)) };
			if (clip.width > 4 && clip.height > 4) fs.writeFileSync(path.join(dir, `${tag}-${name}.png`), await t.page.screenshot({ clip }));
		};
		const row = `#pm-settings-root [id="setting-${ID}"]`;
		for (const look of String(t.args.looks || 'basic-dark,glass-light,nier-dark').split(',')) {
			await setLookBySetting(t, f, look);
			await toModels(t, f);
			await f.evaluate((sel) => { const r = document.querySelector(sel); if (r) r.scrollIntoView({ block: 'center' }); }, row);
			await t.page.waitForTimeout(400);
			await shoot(`${look}-nicknames`, row, 6);
			if (!(await f.locator(`${row} .o55-nick-input`).count())) continue;
			await f.locator(`${row} .o55-nick-input`).fill('fast');
			await f.locator(`${row} .o55-nick-add [role="combobox"]`).click();
			await t.page.waitForTimeout(500);
			await shoot(`${look}-nickname-picker`, `${row}, .o55-pick-pop.is-open`, 10);
			const opt = f.locator('.o55-pick-pop.is-open [role="option"]').filter({ hasText: 'Claude Haiku' }).first();
			if (await opt.count()) { await opt.click(); await t.page.waitForTimeout(300); }
			await f.locator(`${row} [data-action="pm51-nick-add"]`).click(); await t.page.waitForTimeout(500);
			await f.locator(`${row} .o55-nick-input`).fill('FAST');
			await f.locator(`${row} .o55-nick-add [role="combobox"]`).click(); await t.page.waitForTimeout(400);
			const o2 = f.locator('.o55-pick-pop.is-open [role="option"]').filter({ hasText: 'Claude Opus' }).first();
			if (await o2.count()) { await o2.click(); await t.page.waitForTimeout(300); }
			await f.locator(`${row} [data-action="pm51-nick-add"]`).click(); await t.page.waitForTimeout(500);
			await shoot(`${look}-nickname-refused`, row, 6);
			/* the line added for the crop goes again */
			await f.locator(`${row} .o55-nick-line[data-nick="fast"] [data-action="pm51-nick-remove"]`).click().catch(() => {});
			await t.page.waitForTimeout(400);
		}
		await t.check(`crops written to ${dir}`, fs.readdirSync(dir).some((n) => n.startsWith(tag + '-') && n.includes('nickname')));
	},
	'FO-186 the Media nickname box is retired': async (t) => {
		const f = await t.app.open();
		await t.viewport(1920, 1080);
		await f.locator('#tab-settings').click();
		await t.settle();
		await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="ai"]').first().click();
		await t.settle();
		await f.locator('#pm-settings-root .workspace-tabs [data-action="jump-workspace"][data-workspace="media"]').first().click().catch(() => {});
		await t.settle();
		const seen = [];
		for (const tab of ['abilities', 'files']) {
			await f.locator(`#pm-settings-root .pm51-mgr .pm51-tabs [data-tab="${tab}"]`).first().click().catch(() => {});
			await t.settle();
			/* every More options on the page open, so a box folded away is found too */
			await f.evaluate(() => document.querySelectorAll('#pm-settings-root [data-workspace-block="media"] details:not([open])').forEach((d) => { d.open = true; }));
			await t.page.waitForTimeout(300);
			if (await f.evaluate((id) => !!document.querySelector(`#pm-settings-root [id="setting-${CSS.escape(id)}"], #pm-settings-root [data-setting-id="${CSS.escape(id)}"], #pm-settings-root [data-setting="${CSS.escape(id)}"]`), OLD)) seen.push(tab);
		}
		await t.check(`FO-186 the Media nickname box (${OLD}) is drawn nowhere on Media & Output`, !seen.length, `drawn on ${seen.join(', ')}`);
		const known = await f.evaluate((id) => !!(window.PM51 && PM51.setting && PM51.setting(id)), OLD);
		await t.check(`FO-186 ${OLD} is no setting of the page (retired into Model nicknames)`, !known);
	}
};

// Stream F batch 11, lane C: the look editors in Settings (audit A4, review/VERIFIED-A1-A4.md).
// B-7: Accent colour reaches the selections it names ("The color of selections, focus outlines and progress"): in
//   Basic, Friendly and Retro, picking Violet repaints the chosen chapter's block in Settings' rail (25 % or more of its
//   pixels change; it changed 0.05 % of the page), and the block's words read at 4.5:1 or more on it. Segmented toggles
//   keep each look's neutral fill (DR-069), and Glass and NieR keep their own.
// B7-R1 (opus-recheck-b11c): in every look, with the theme's own and each accent chosen, the selected segment of a
//   segmented toggle (Settings' Animation speed, the theme menu's Light / Dark / Auto, Usage's range) reads at 4.5:1 or
//   more on the chip painted under it (the words' computed colour against the commonest painted colour of the
//   segment). Friendly Light's segments read white on white with any accent.
// B-9: Editor & Terminal › "Terminal" ("Which shell runs, where it starts, and how panes come back.") holds the five
//   behaviour rows only; every terminal look row (each field the terminal's Customize screen sets: colors, scheme
//   pairing, contrast, import, font, cursor, background, effects, CRT, bezel, dimming, smooth scrolling, bell) is under
//   "Terminal look". About 43 of them sat under "Terminal".
// B-13: Adjust NieR's preview tile draws the World's layers: installing or removing Particles, Sweep line or Ground
//   changes the tile's painted pixels (Ground did; Particles and Sweep line drew nothing). Every capture is a still one
//   (two in a row agree), so the app's own Scan sweep crossing the tile is never read as a change.
// B-16: Customize Pip keeps its picture in view: scrolled to the end of the sheet, a Preview dock with the team shows
//   inside the sheet's box; under the pointer it steps aside and lets the pointer reach what it floats over; back at the
//   top it is gone (the stage scrolled away with nothing in its place).
// B-12: Customize Pip's sound can be heard: "Hear Pip's chirp" sounds one chirp (judged by the sound engine's own log,
//   O55.sound.log: browser-check mutes the output) while sound is on, even with "Pip chirps in the app" off; Play
//   chirps as the team works while that part is on; with the part off, a line under Play says Play is silent.
// Each test runs on the surfaces asked for (normal and T3's sandbox unless --set sandbox= picks one).
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const BEHAVIOUR = ['code.terminal.shell', 'code.terminal.cwd', 'code.terminal.startup-command', 'code.terminal.layout-restore', 'code.terminal.kill-confirm'];
const LOOK = ['theme', 'scheme-pair', 'min-contrast', 'import-scheme', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'ligatures', 'bold-bright', 'rendering-mode',
	'cursor-shape', 'cursor-blink', 'cursor-trail', 'background', 'background-color', 'background-gradient', 'background-image', 'background-image-file', 'background-fit', 'background-desaturate',
	'background-dim', 'background-blur', 'background-strength', 'background-scale', 'background-motion', 'opacity', 'padding', 'effects', 'scanlines', 'scan-strength', 'glow', 'glow-strength',
	'crt', 'curvature', 'burn-in', 'noise', 'flicker', 'phosphor-mask', 'sixtyfour-scan', 'sixtyfour-bleed', 'bezel', 'bezel-width', 'bezel-material', 'bezel-reflection', 'inactive-dim', 'smooth-scroll', 'bell'].map((x) => 'code.terminal.' + x);

async function settings(t, surface, [w, h] = [1600, 1000]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
async function go(t, f, domain, ws) {
	await f.evaluate(([d, w]) => PM51.go(d, w), [domain, ws]);
	await f.waitForSelector(`[data-continuous-workspace-body="${ws}"][data-workspace-mounted="true"]`, { timeout: 15000 });
	await t.settle();
}
async function settingsLook(t, f, look) {
	const [family, mode] = look.split('-');
	await f.evaluate(([fam, m]) => { PM12_KIMI.setSettingFromHost('general.visual.theme', fam === 'nier' ? 'NieR' : fam[0].toUpperCase() + fam.slice(1)); PM12_KIMI.setSettingFromHost('general.visual.theme-mode', m === 'light' ? 'Light' : 'Dark'); }, [family, mode]);
	const ok = await f.waitForFunction((want) => (document.documentElement.getAttribute('data-theme') || '').endsWith(want.split('-')[1]) && (want.startsWith('nier') ? document.documentElement.getAttribute('data-o55-nier') === 'on' || (document.documentElement.getAttribute('data-theme') || '').startsWith('nier') : document.documentElement.getAttribute('data-theme') === want), look, { timeout: 20000 }).then(() => true).catch(() => false);
	await t.page.waitForTimeout(800);
	return t.check(`look ${look} set through Settings`, ok, await f.evaluate(() => `${document.documentElement.getAttribute('data-theme')} nier=${document.documentElement.getAttribute('data-o55-nier')}`));
}
/* the painted pixels of one element that differ by more than 24 levels between two captures */
const shot = async (loc) => decodePng(await loc.screenshot());
/* a still capture of an element: captures until two in a row agree (8 px or fewer differ), so something crossing it for a
   moment is waited out, not measured: NieR's Scan sweep (kit.d/19-nier-parts.js, #o55np-sweep) is a band above the whole
   window that crosses it for 2.6 s every 12 s, and caught over B-13's tile it read as 1,372 to 2,173 px of "noise" on the
   batch 11 landing's Mac and Nas1 runs. Returns { png, still, tries } */
const stillShot = async (loc, { gap = 150, tries = 40 } = {}) => {
	let prev = await shot(loc);
	for (let i = 0; i < tries; i++) {
		await new Promise((r) => setTimeout(r, gap));
		const next = await shot(loc);
		if (differ(prev, next) <= 8) return { png: next, still: true, tries: i + 1 };
		prev = next;
	}
	return { png: prev, still: false, tries };
};
const differ = (a, b) => { if (a.width !== b.width || a.height !== b.height) return Infinity; let n = 0; for (let i = 0; i < a.data.length; i += 4) if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 24) n++; return n; };
const pipSheet = async (t, f) => {
	await go(t, f, 'general', 'app-input');
	const b = f.locator('#setting-general\\.visual\\.pip-parts button').first();
	await b.scrollIntoViewIfNeeded();
	await b.click();
	await f.waitForSelector('.pipe .pipe-top .pipe-stage', { timeout: 8000 });
	await t.page.waitForTimeout(800);
};

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const skip = async (t) => { if (t.app.surfaces().includes(surface)) return false; await t.check(`${surface} surface not asked for`, true); return true; };

	tests[`B-7 a chosen accent repaints the selections (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'general', 'app-input');
		const looks = t.args.looks ? String(t.args.looks).split(',') : ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'retro-dark', 'retro-light'];
		for (const look of looks) {
			if (!(await settingsLook(t, f, look))) continue;
			await go(t, f, 'general', 'app-input');
			const sw = (name) => f.locator(`#setting-general\\.visual\\.accent-color button[aria-label="${name}"]`).first();
			const chip = f.locator('#pm-settings-root .domain-link.active').first();
			await chip.scrollIntoViewIfNeeded();
			await t.page.waitForTimeout(500);
			const before = await shot(chip);
			await sw('Violet').click();
			await t.page.waitForTimeout(900);
			const after = await shot(chip);
			const n = differ(before, after), all = before.width * before.height;
			await t.check(`${look}: Violet repaints the chosen chapter's block in the rail`, n >= all * 0.25, `${n} of ${all} pixels changed`);
			const ink = await f.evaluate(() => {
				const cs = getComputedStyle(document.documentElement), hex = (v) => { const m = /#([0-9a-f]{6})/i.exec(v || ''); return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : null; };
				const L = (c) => c.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
				const a = hex(cs.getPropertyValue('--accent-primary')), w = hex(cs.getPropertyValue('--o55-on-switch'));
				return a && w ? { fill: cs.getPropertyValue('--pm-switch-fill').trim(), on: cs.getPropertyValue('--pm-switch-ink-on').trim(), ratio: Math.round(((Math.max(L(a), L(w)) + 0.05) / (Math.min(L(a), L(w)) + 0.05)) * 100) / 100 } : { fill: cs.getPropertyValue('--pm-switch-fill').trim(), on: cs.getPropertyValue('--pm-switch-ink-on').trim(), ratio: 0 };
			});
			await t.check(`${look}: the block's words read at 4.5:1 or more on Violet`, ink.ratio >= 4.5, JSON.stringify(ink));
			if (look === looks[0]) await t.crop(`b7-${look}-violet-${surface}`, f.locator('#pm-settings-root aside.domain-rail, #pm-settings-root .domain-rail').first(), `${look}: Settings' chapter rail with Violet chosen as the accent`);
			await f.locator('#setting-general\\.visual\\.accent-color button').first().click();   // the theme's own
			await t.page.waitForTimeout(500);
		}
	};

	tests[`B7-R1 a selected segment reads on its chip in every look, with every accent (${surface})`] = async (t) => {
		if (await skip(t)) return;
		// 1920 wide: Usage draws its range only while its stage is 1000 px or wider
		const f = await settings(t, surface, [1920, 1080]);
		await go(t, f, 'general', 'app-input');
		const LOOKS = t.args.looks ? String(t.args.looks).split(',') : ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'retro-dark', 'retro-light', 'glass-dark', 'glass-light', 'nier-dark', 'nier-light'];
		const ACCENTS = ['own', 'Violet', 'Cyan', 'Rose', 'Amber', 'Emerald'];
		const L = (c) => c.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
		const ratio = (a, b) => (Math.max(L(a), L(b)) + 0.05) / (Math.min(L(a), L(b)) + 0.05);
		/* the selected segment in a strip: its words' colour, and the commonest painted colour of its box */
		const read = async (strip, name) => {
			const sel = f.locator(`${strip} > :is([aria-checked="true"], [aria-pressed="true"], [aria-selected="true"], .active, .is-active) >> visible=true`).first();
			if (!(await sel.count()) || !(await sel.isVisible())) return { name, missing: true };
			const ink = await sel.evaluate((el) => {
				const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n, host = el;
				while ((n = walk.nextNode())) if (n.textContent.trim()) { host = n.parentElement; break; }
				return getComputedStyle(host).color.match(/[\d.]+/g).slice(0, 3).map(Number);
			});
			const png = decodePng(await sel.screenshot());
			const buckets = new Map();
			for (let i = 0; i < png.data.length; i += 4) { const k = (png.data[i] >> 3) << 10 | (png.data[i + 1] >> 3) << 5 | (png.data[i + 2] >> 3); const b = buckets.get(k) || [0, 0, 0, 0]; b[0]++; b[1] += png.data[i]; b[2] += png.data[i + 1]; b[3] += png.data[i + 2]; buckets.set(k, b); }
			const top = [...buckets.values()].sort((x, y) => y[0] - x[0])[0];
			const chip = [top[1] / top[0], top[2] / top[0], top[3] / top[0]].map(Math.round);
			return { name, ink, chip, ratio: Math.round(ratio(ink, chip) * 100) / 100 };
		};
		for (const look of LOOKS) {
			if (!(await settingsLook(t, f, look))) continue;
			await go(t, f, 'general', 'app-input');
			for (const acc of ACCENTS) {
				const btn = acc === 'own' ? f.locator('#setting-general\\.visual\\.accent-color button').first() : f.locator(`#setting-general\\.visual\\.accent-color button[aria-label="${acc}"]`).first();
				if (!(await btn.count()) || !(await btn.isVisible())) { await t.check(`${look} ${acc}: the accent can be chosen here`, true, 'no accent row in this look'); continue; }
				await btn.scrollIntoViewIfNeeded();
				await btn.click();
				await t.page.waitForTimeout(700);
				const got = [];
				const seg = '#setting-general\\.visual\\.animation-speed .segmented';
				await f.locator(seg).first().scrollIntoViewIfNeeded().catch(() => {});
				await t.page.mouse.move(2, 998);
				await t.page.waitForTimeout(250);
				got.push(await read(seg, 'Animation speed'));
				const menu = f.locator('#themeSelect').first();
				if (await menu.isVisible().catch(() => false)) {
					await menu.click();
					await f.waitForSelector('#themeMenu .pm6-tt-modes', { state: 'visible', timeout: 4000 }).catch(() => null);
					await t.page.mouse.move(2, 998);
					await t.page.waitForTimeout(450);
					got.push(await read('#themeMenu .pm6-tt-modes', 'theme menu Light / Dark / Auto'));
					await t.page.keyboard.press('Escape');
					await t.page.waitForTimeout(350);
				}
				const low = got.filter((g) => !g.missing && g.ratio < 4.5);
				await t.check(`${look} ${acc}: the selected segment reads at 4.5:1 or more on its chip`, got.some((g) => !g.missing) && low.length === 0, got.map((g) => g.missing ? `${g.name}: not shown` : `${g.name} ${g.ratio}:1 (ink ${g.ink} on ${g.chip})`).join('; '));
			}
			// Usage's range, with the last accent still chosen, then back to the theme's own
			await f.locator('.page-tabs .page-tab', { hasText: /^\s*Usage\s*$/ }).first().click();
			await f.waitForSelector('#pmuRange', { state: 'visible', timeout: 15000 }).catch(() => null);
			await t.page.mouse.move(2, 998);
			await t.page.waitForTimeout(900);
			const u = await read('#pmuRange', 'Usage range');
			await t.check(`${look} ${ACCENTS[ACCENTS.length - 1]}: Usage's selected range reads at 4.5:1 or more on its chip`, !u.missing && u.ratio >= 4.5, u.missing ? 'the range was not shown' : `${u.ratio}:1 (ink ${u.ink} on ${u.chip})`);
			await f.locator('#tab-settings').click();
			await t.settle();
			await go(t, f, 'general', 'app-input');
			await f.locator('#setting-general\\.visual\\.accent-color button').first().click().catch(() => {});
			await t.page.waitForTimeout(400);
		}
	};

	tests[`B-9 the Terminal section holds behaviour, Terminal look the look rows (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'code', 'editor-runtime');
		const where = await f.evaluate((ids) => Object.fromEntries(ids.map((id) => {
			const row = document.getElementById('setting-' + id);
			const sec = row && row.closest('section.settings-section, section');
			const head = sec && sec.querySelector('h2, h3, h4, .section-title, .settings-section-title');
			return [id, row ? (head ? head.textContent.replace(/\s+/g, ' ').trim() : '?') : null];
		})), BEHAVIOUR.concat(LOOK));
		const title = (s) => (s || '').replace(/\s*(Which shell|Colors, font).*$/, '');
		const behaviourOff = BEHAVIOUR.filter((id) => where[id] !== null && !/^Terminal$/.test(title(where[id])));
		await t.check('the five behaviour rows are under "Terminal"', BEHAVIOUR.every((id) => where[id] !== null) && behaviourOff.length === 0, behaviourOff.map((id) => `${id}: ${where[id]}`).join('; '));
		const drawn = LOOK.filter((id) => where[id] !== null);
		const lookOff = drawn.filter((id) => !/^Terminal look$/.test(title(where[id])));
		await t.check(`every terminal look row drawn (${drawn.length}) is under "Terminal look"`, drawn.length >= 40 && lookOff.length === 0, `${lookOff.length} elsewhere: ${lookOff.slice(0, 6).map((id) => `${id.slice(14)} (${title(where[id])})`).join(', ')}`);
	};

	tests[`B-13 Adjust NieR's preview draws Particles, Sweep line and Ground (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'general', 'app-input');
		if (!(await settingsLook(t, f, 'nier-dark'))) return;
		await go(t, f, 'general', 'app-input');
		const b = f.locator('#setting-general\\.visual\\.nier-parts button').first();
		await b.scrollIntoViewIfNeeded();
		await b.click();
		const pv = f.locator('.o55nc-pv').first();
		await pv.waitFor({ state: 'visible', timeout: 8000 });
		await pv.scrollIntoViewIfNeeded();
		await t.page.waitForTimeout(800);
		const s0 = await stillShot(pv), s1 = await stillShot(pv), noise = differ(s0.png, s1.png);
		await t.check('the tile comes to rest (two captures in a row agree)', s0.still && s1.still, `${s0.tries} and ${s1.tries} tries`);
		for (const [key, name] of [['particles', 'Particles'], ['sweep', 'Sweep line'], ['ground', 'Ground']]) {
			const chip = f.locator(`.o55nc-chip[data-o55nc-key="${key}"]`).first();
			if (!(await t.check(`${name}: its chip is in the editor`, (await chip.count()) > 0))) continue;
			const before = (await stillShot(pv)).png;
			await chip.click();
			await t.page.waitForTimeout(500);
			const after = (await stillShot(pv)).png;
			const n = differ(before, after);
			await t.check(`${name}: installing or removing it changes the preview`, n >= 40 + noise, `${n} pixels changed (noise ${noise})`);
			// the tile draws it itself (the app's own World layer can show through a NieR sheet, which is not the preview)
			if (key !== 'ground') {
				const own = await f.evaluate((k) => {
					const box = document.querySelector('.o55nc'), pv = document.querySelector('.o55nc-pv');
					const on = (box.getAttribute('data-parts') || '').split(/\s+/).includes(k);
					const layer = pv && [...pv.children].find((c) => c.classList.contains(`o55nc-pv-${k === 'sweep' ? 'sweep' : 'particles'}`));
					return { on, layer: !!layer, shown: !!layer && getComputedStyle(layer).display !== 'none' };
				}, key);
				await t.check(`${name}: the tile has its own layer for it, shown while it is installed`, own.layer && own.shown === own.on, JSON.stringify(own));
			}
			await chip.click();
			await t.page.waitForTimeout(400);
		}
		await t.crop(`b13-nier-preview-${surface}`, pv, 'Adjust NieR preview with the default parts: the faint grid, a few ink squares and the sweep band behind the panels');
	};

	tests[`B-16 Customize Pip keeps a preview in view (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await pipSheet(t, f);
		const sc = await f.evaluate(() => { const st = document.querySelector('.pipe .pipe-top .pipe-stage'); let s = st.parentElement; while (s && !(s.scrollHeight > s.clientHeight + 20 && /(auto|scroll)/.test(getComputedStyle(s).overflowY))) s = s.parentElement; if (!s) return null; s.setAttribute('data-b16', '1'); s.scrollTop = s.scrollHeight; return { sh: s.scrollHeight, ch: s.clientHeight }; });
		if (!(await t.check('the sheet scrolls', !!sc, JSON.stringify(sc)))) return;
		await t.page.waitForTimeout(700);
		const r = await f.evaluate(() => {
			const s = document.querySelector('[data-b16]'), st = document.querySelector('.pipe .pipe-top .pipe-stage'), box = document.querySelector('.pipe-dock:not([hidden]) .pipe-dock-box');
			const sr = s.getBoundingClientRect(), tr = st.getBoundingClientRect();
			const out = { stageShows: Math.max(0, Math.min(tr.bottom, sr.bottom) - Math.max(tr.top, sr.top)) / tr.height, dock: null };
			if (box) { const b = box.getBoundingClientRect(); out.dock = { inside: b.top >= sr.top - 1 && b.bottom <= sr.bottom + 1 && b.left >= sr.left - 1 && b.right <= sr.right + 1, seats: box.querySelectorAll('.pipe-seat').length, opacity: Number(getComputedStyle(box).opacity), h: Math.round(b.height) }; }
			return out;
		});
		await t.check('scrolled to the end, the stage itself is out of view', r.stageShows < 0.4, JSON.stringify(r));
		await t.check('a Preview dock with the five-seat team shows inside the sheet', !!r.dock && r.dock.inside && r.dock.seats === 5 && r.dock.opacity > 0.9, JSON.stringify(r.dock));
		// under the pointer it steps aside, and what it floats over is reached
		const bb = await f.locator('.pipe-dock:not([hidden]) .pipe-dock-box').first().boundingBox().catch(() => null);
		if (bb) {
			await t.page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 4 });
			await t.page.waitForTimeout(450);
			const under = await f.evaluate(() => { const box = document.querySelector('.pipe-dock-box'), b = box.getBoundingClientRect(), hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { opacity: Number(getComputedStyle(box).opacity), reached: hit ? `${hit.tagName.toLowerCase()}.${String(hit.className).split(' ')[0]}` : '', inDock: !!hit && box.contains(hit) }; });
			await t.check('under the pointer the dock steps aside and the pointer reaches what is beneath it', under.opacity < 0.5 && !under.inDock, JSON.stringify(under));
			await t.page.mouse.move(5, 5);
		}
		await t.shot(`b16-pip-dock-${surface}`, 'Customize Pip scrolled to the end: the Preview dock with the team at the top right of the sheet');
		await f.evaluate(() => { document.querySelector('[data-b16]').scrollTop = 0; });
		await t.page.waitForTimeout(700);
		const back = await f.evaluate(() => { const d = document.querySelector('.pipe-dock'); return d ? d.hidden : 'none'; });
		await t.check('back at the top, the dock is gone', back === true || back === 'none', String(back));
		await f.evaluate(() => { const s = document.querySelector('[data-b16]'); if (s) s.removeAttribute('data-b16'); });
	};

	tests[`B-12 Customize Pip can be heard (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await pipSheet(t, f);
		// sound on for this Project (the chat's speaker's switch); the sample's and Play's chirps are read from the engine log
		const ready = await f.evaluate(async () => {
			const S = window.O55 && O55.sound; if (!S || !S.pip) return 'no player';
			if (S.muted && window.PM56_HOST && PM56_HOST.settings && typeof PM56_HOST.settings.set === 'function') { try { PM56_HOST.settings.set('sound', true); } catch (e) { /* below */ } }
			if (S.muted) { try { PM12_KIMI.setSettingFromHost('general.interaction.sound-effects', true); } catch (e) { /* below */ } }
			if (typeof S.refresh === 'function') S.refresh('test');
			return S.muted ? 'muted' : 'on';
		});
		if (!(await t.check('the Project\'s sound is on', ready === 'on', ready))) return;
		const chirps = (from) => f.evaluate((n) => O55.sound.log.slice(n).filter((e) => /^pip:(cheer|alert|think|wake|happy|wink)/.test(e.event) && e.played).map((e) => e.event), from);
		const mark = () => f.evaluate(() => O55.sound.log.length);
		const part = (on) => f.evaluate(async (want) => { const R = PM_PIP_PARTS; if (!!R.get('app-voice') !== want) { const c = document.querySelector('.pipe-chip[data-pipe-part="app-voice"]'); if (c) c.click(); } await new Promise((r) => setTimeout(r, 300)); return !!R.get('app-voice'); }, on);
		// the sample, with "Pip chirps in the app" off
		await part(false);
		const hear = f.locator('[data-pipe-hear]').first();
		if (await t.check('the Sound group has "Hear Pip’s chirp"', (await hear.count()) > 0)) {
			await hear.scrollIntoViewIfNeeded();
			const m0 = await mark();
			await hear.click();
			await t.page.waitForTimeout(600);
			const got = await chirps(m0);
			await t.check('Hear Pip’s chirp sounds a chirp (engine log), with the part off', got.length >= 1, JSON.stringify(got));
		}
		// Play with the part off: silent, and says so
		const playLine = await f.evaluate(() => (document.querySelector('.pipe-play-sound') || {}).textContent || '');
		await t.check('with "Pip chirps in the app" off, a line says Play is silent', /silent/i.test(playLine), playLine);
		// Play with the part on (State faces on too): chirps as the team works
		await part(true);
		await f.evaluate(async () => { if (!PM_PIP_PARTS.get('state-faces')) { const c = document.querySelector('.pipe-chip[data-pipe-part="state-faces"]'); if (c) c.click(); } await new Promise((r) => setTimeout(r, 300)); });
		const play = f.locator('[data-pipe-replay]').first();
		await play.scrollIntoViewIfNeeded();
		const m1 = await mark();
		await play.click();
		await t.page.waitForTimeout(5600);
		const got = await chirps(m1);
		await t.check('Play chirps as the team works (engine log)', got.length >= 3, JSON.stringify(got));
	};
}

// FO-162 (Jared, card Q5, answer B: "Follow the Plans' five areas"). Settings > Readiness & Doctor groups its checkup in
// the five areas "What is checked" names (system.health.check-scope: AI providers, Storage, Sign-ins, Performance,
// Dependencies), in that order, and the chips of "What is checked" read the same five names.
//  areas     The checkup's groups (the sections with a Check Again button) are exactly the five, in order, each with a
//            one-line help; "What is checked" lists the same five; each of the 14 checks of the seven old groups
//            (permanent ids, the row keys) is in exactly one area, the one REPORT.md maps it to, and no other row is
//            there; a save made before FO-162 (the seven old groups) opens in the five areas with each check's own
//            result kept.
//  measured  Performance is real or says so: either every row in it is measured on this computer (data-measured,
//            state equal to this check's own reading of the graphics driver, its name in the details, and Check Again
//            reading the driver again), or it has no row and says "Nothing checked yet".
//  fit       Nothing overflows or is clipped in the checkup (the "What is checked" row and the five areas) and no
//            area's title runs under its Check Again button, at 1920x1080, 1390x900, 1024x768 and 740x900, in all ten
//            looks (chosen through the Theme rows and guarded on painted pixels before each measurement).
// Both surfaces (--set sandbox=0 / =1). --set looks=glass-light,... --set size=1390x900 narrow the fit matrix.
// --set shots=1 adds frames of the checkup for Glass Light, Friendly Dark and NieR Dark at 1390x900 (LOOK lines).
import { LOOKS } from '../browser-check.config.mjs';
import { setLookBySetting, guardPaintedLook } from '../helpers/settings-look.mjs';

const AREAS = ['AI providers', 'Storage', 'Sign-ins', 'Performance', 'Dependencies'];
// every check of the seven groups on main before FO-162, by its permanent id (the row key), and its area
const MAP = {
	'ai:antigravity': 'AI providers', 'ai:claude': 'AI providers',
	'server:reach': 'Storage', 'backups:last': 'Storage', 'backups:kit': 'Storage',
	'server:identity': 'Sign-ins', 'devices:pairing': 'Sign-ins', 'code:push': 'Sign-ins',
	'optional:gpu': 'Performance',
	'code:vcs': 'Dependencies', 'updates:app': 'Dependencies', 'devices:tailscale': 'Dependencies', 'optional:wsl': 'Dependencies', 'optional:containers': 'Dependencies'
};
const SIZES = [[1920, 1080], [1390, 900], [1024, 768], [740, 900]];
const SHOT_LOOKS = ['glass-light', 'friendly-dark', 'nier-dark'];
const B = '[data-continuous-workspace-body="doctor"]';
const SOFT_GPU = 'swiftshader|llvmpipe|softpipe|lavapipe|software|basic render|microsoft basic';

async function settings(t, surface, [w, h] = [1920, 1080]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
async function doctor(t, f) {
	await f.evaluate(() => PM51.go('system', 'doctor'));
	await f.waitForSelector(`${B}[data-workspace-mounted="true"]`, { timeout: 15000 });
	await t.settle();
}
// the checkup's groups as drawn: every section of the page that has a group's Check Again button
const READ = (B) => {
	const txt = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
	const body = document.querySelector(B);
	const sections = body ? [...body.querySelectorAll('section.pm51-section')].filter((s) => s.querySelector(':scope > .pm51-section-head [data-action="pm51-doctor-check"]')) : [];
	const scope = body ? [...body.querySelectorAll('[data-setting="system.health.check-scope"][data-value]')] : [];
	return {
		scope: scope.map(txt),
		areas: sections.map((s) => ({
			title: txt(s.querySelector('.pm51-section-title')),
			help: txt(s.querySelector('.pm51-section-help')),
			rows: [...s.querySelectorAll('[data-row]')].map((r) => ({ key: r.dataset.row, measured: r.dataset.measured || '', label: txt(r.querySelector('.pm51-row-label')), state: txt(r.querySelector('.pm51-row-label .pm51-status')) })),
			nothing: /Nothing checked yet/.test(txt(s.querySelector('.pm51-section-body')))
		})),
		elsewhere: body ? [...body.querySelectorAll('[data-row]')].filter((r) => !sections.some((s) => s.contains(r))).map((r) => r.dataset.row).filter((k) => k in (window.__fo162Map || {})) : []
	};
};
// this check's own reading of the graphics driver, made the same way a page can make it
const GPU = (soft) => {
	let raw = '';
	try {
		const c = document.createElement('canvas'); const gl = c.getContext('webgl2') || c.getContext('webgl');
		if (gl) { const ext = gl.getExtension('WEBGL_debug_renderer_info'); raw = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || ''); const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); }
	} catch (e) { raw = ''; }
	return { raw, ok: !!raw && !new RegExp(soft, 'i').test(raw) };
};

// scroll only the Settings scroller that holds the checkup (scrollIntoView would also move the app's own document)
const SCROLL_TO = ([B, pick]) => {
	const body = document.querySelector(B); if (!body) return false;
	const areas = [...body.querySelectorAll('section.pm51-section')].filter((x) => x.querySelector('[data-action="pm51-doctor-check"]'));
	const scope = body.querySelector('[data-setting="system.health.check-scope"]');
	const el = pick === 'scope' ? (scope && (scope.closest('.setting-row') || scope)) : pick === 'first' ? areas[0] : pick === 'last' ? areas[areas.length - 1] : body;
	let sc = body.parentElement;
	while (sc && !(/(auto|scroll)/.test(getComputedStyle(sc).overflowY) && sc.scrollHeight > sc.clientHeight)) sc = sc.parentElement;
	if (!el || !sc) return false;
	const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top;
	sc.scrollTop = pick === 'top' ? 0 : pick === 'last' ? sc.scrollTop + el.getBoundingClientRect().bottom - sc.getBoundingClientRect().bottom + 12 : sc.scrollTop + top - (pick === 'scope' ? 160 : 12);
	return true;
};

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const skip = async (t) => { if (t.app.surfaces().includes(surface)) return false; await t.check(`${surface} surface not asked for`, true); return true; };

	tests[`areas: the checkup is the five areas of What is checked, every check in one (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await doctor(t, f);
		await f.evaluate((m) => { window.__fo162Map = m; }, MAP);
		const r = await f.evaluate(READ, B);
		await t.check('the checkup\'s groups are the five areas, in order', JSON.stringify(r.areas.map((a) => a.title)) === JSON.stringify(AREAS), r.areas.map((a) => a.title).join(' | '));
		await t.check('What is checked lists the same five, in order', JSON.stringify(r.scope) === JSON.stringify(AREAS), r.scope.join(' | '));
		for (const a of r.areas) await t.check(`${a.title}: says what it checks in one short line`, a.help.length >= 12 && a.help.length <= 64 && /\.$/.test(a.help) && (a.help.match(/\. /g) || []).length === 0, `"${a.help}" (${a.help.length} chars)`);
		const where = {};
		for (const a of r.areas) for (const row of a.rows) (where[row.key] = where[row.key] || []).push(a.title);
		for (const [key, area] of Object.entries(MAP)) {
			const got = where[key] || [];
			await t.check(`${key}: in exactly one area`, got.length === 1 && !r.elsewhere.includes(key), got.join(', ') || (r.elsewhere.includes(key) ? 'outside the areas' : 'missing'));
			await t.check(`${key}: in ${area}`, got.length === 1 && got[0] === area, got.join(', ') || 'missing');
		}
		const extra = Object.keys(where).filter((k) => !(k in MAP));
		await t.check('no check in the areas that the seven groups did not have', !extra.length, extra.join(', ') || 'none');

		// a save from before FO-162: the seven old groups, with two results changed, open in the five areas with them kept
		const m = await f.evaluate((B) => {
			const D = PM51.s().doctor;
			const cur = Object.fromEntries(D.groups.flatMap((g) => g.findings.map((x) => [x.check || `${g.id}:${x.id}`, x])));
			const old = { server: ['reach', 'identity'], devices: ['pairing', 'tailscale'], ai: ['antigravity', 'claude'], code: ['push', 'vcs'], backups: ['kit', 'last'], updates: ['app'], optional: ['wsl', 'containers', 'gpu'] };
			D.groups = Object.entries(old).map(([id, fids]) => ({ id, title: id, help: '', findings: fids.map((fid) => Object.assign({}, cur[`${id}:${fid}`] || { title: fid, state: 'Ready', checked: 'Today' }, { id: fid, check: undefined })) }));
			D.groups.find((g) => g.id === 'backups').findings.find((x) => x.id === 'last').state = 'Needs attention';
			D.groups.find((g) => g.id === 'backups').findings.find((x) => x.id === 'last').checked = 'Yesterday';
			D.groups.find((g) => g.id === 'devices').findings.find((x) => x.id === 'tailscale').checked = '3 h ago';
			PM51.refresh('doctor', { swap: false });
			return new Promise((res) => setTimeout(() => {
				const row = (k) => { const e = document.querySelector(`${B} [data-row="${k}"]`); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; };
				res({ ids: PM51.s().doctor.groups.map((g) => g.id), last: row('backups:last'), tailscale: row('devices:tailscale') });
			}, 400));
		}, B);
		const after = await f.evaluate(READ, B);
		await t.check('an old save opens in the five areas', JSON.stringify(after.areas.map((a) => a.title)) === JSON.stringify(AREAS), `${m.ids.join(',')} → ${after.areas.map((a) => a.title).join(' | ')}`);
		await t.check('an old save keeps each check\'s own result (Last backup: Needs attention, Yesterday)', /Needs attention/.test(m.last) && /Yesterday/.test(m.last), m.last);
		await t.check('an old save keeps each check\'s own time (Tailscale: 3 h ago)', /3 h ago/.test(m.tailscale), m.tailscale);
	};

	tests[`measured: Performance holds only checks run on this computer, or says Nothing checked yet (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await doctor(t, f);
		const r = await f.evaluate(READ, B);
		const perf = r.areas.find((a) => a.title === 'Performance');
		if (!(await t.check('there is a Performance area', !!perf, r.areas.map((a) => a.title).join(' | ')))) return;
		if (!perf.rows.length) { await t.check('Performance with no check says "Nothing checked yet"', perf.nothing); return; }
		await t.check('Performance does not also say "Nothing checked yet" beside its checks', !perf.nothing);
		const own = await f.evaluate(GPU, SOFT_GPU);
		for (const row of perf.rows) {
			await t.check(`${row.key}: measured here (data-measured)`, row.measured === 'here', row.measured || 'not marked as measured');
			if (row.key !== 'optional:gpu') { await t.check(`${row.key}: a Performance check this kit knows how to verify`, false, 'add its own reading to this check'); continue; }
			await t.check('GPU: its state is this computer\'s graphics driver\'s answer', own.ok ? /^GPU ready\b/.test(row.label) && /Ready/.test(row.state) : /No GPU in use/.test(row.label) && /Unavailable/.test(row.state), `${row.label} [${row.state}] / driver "${own.raw}"`);
		}
		// its details name the card the driver named
		await f.locator(`${B} [data-row="optional:gpu"] [data-action="pm51-doctor-open"]`).first().click();
		const panel = f.locator('.drawer-wrap aside.drawer').last();
		await panel.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
		await panel.locator('[data-action="pm51-doctor-evidence"][data-kind="details"]').first().click().catch(() => {});
		await t.page.waitForTimeout(300);
		const measured = await panel.evaluate((el) => { const rows = [...el.querySelectorAll('.pm51-kv-row')].map((r) => [...r.children].map((c) => c.textContent.trim())); return { kv: Object.fromEntries(rows), text: el.textContent.replace(/\s+/g, ' ') }; }).catch(() => ({ kv: {}, text: '' }));
		const name = measured.kv['Measured'] || '';
		await t.check('GPU details: Measured names what the driver said', own.ok ? !!name && own.raw.includes(name) : /software drawing|No graphics driver/.test(name), `Measured "${name}" / driver "${own.raw}"`);
		await t.check('GPU details: how it is checked says this computer', /this computer/i.test(measured.kv['How it is checked'] || ''), measured.kv['How it is checked'] || '');
		for (let i = 0; i < 3 && (await f.locator('.drawer-wrap').count()); i++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(300); }
		// Check Again on Performance reads the driver again (the page asks for a WebGL context) and comes back measured
		await f.evaluate(() => { window.__fo162gl = 0; const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (kind, ...rest) { if (/webgl/.test(String(kind))) window.__fo162gl++; return get.call(this, kind, ...rest); }; });
		const again = f.locator(`${B} section.pm51-section:has([data-row="optional:gpu"]) > .pm51-section-head [data-action="pm51-doctor-check"]`).first();
		await again.scrollIntoViewIfNeeded();
		await again.click();
		const back = await f.waitForFunction((B) => { const r = document.querySelector(`${B} [data-row="optional:gpu"]`); return !!r && !/Checking/.test(r.textContent) && /checked just now/.test(r.textContent); }, B, { timeout: 8000 }).then(() => true).catch(() => false);
		const n = await f.evaluate(() => window.__fo162gl);
		await t.check('Performance Check Again comes back checked just now', back);
		await t.check('Performance Check Again asked the graphics driver again', n >= 1, `${n} WebGL context request(s)`);
	};

	tests[`fit: the checkup fits at four sizes in all ten looks (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
		const sizes = t.args.size ? String(t.args.size).split(',').map((s) => s.split('x').map(Number)) : SIZES;
		for (const look of looks) {
			await t.step(look, async () => {
				const f = await settings(t, surface, sizes[0]);
				// the Theme rows live on General: open it and wait until they are drawn (a slow first draw timed out). On a
				// remote host a dropdown click can miss its list while the page redraws: one more try, with the list closed
				// first; the painted-look guard below still judges every cell.
				for (let attempt = 1; attempt <= 2; attempt++) {
					try {
						await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click({ timeout: 15000 });
						await f.waitForSelector('select[data-setting="general.visual.theme"]', { state: 'attached', timeout: 20000 });
						await t.page.waitForTimeout(500);
						await setLookBySetting(t, f, look, { toGeneral: false });
						break;
					} catch (e) {
						if (attempt === 2) throw e;
						t.log(`${look}: look pick missed (${String(e.message || e).split('\n')[0]}); trying once more`);
						await t.page.keyboard.press('Escape');
						await t.page.waitForTimeout(800);
					}
				}
				await doctor(t, f);
				for (const [w, h] of sizes) {
					await t.viewport(w, h);
					await t.page.waitForTimeout(450);
					await doctor(t, f);
					const cell = `${look} ${w}x${h}`;
					if (!(await guardPaintedLook(t, f, look, cell))) continue;
					const r = await f.evaluate(READ, B);
					await t.check(`${cell}: the five areas are drawn`, r.areas.length === 5, r.areas.map((a) => a.title).join(' | '));
					await t.noOverflow(`${cell}: the checkup has no overflow or clipped text`, { scope: B });
					const heads = await f.evaluate((B) => [...document.querySelectorAll(`${B} section.pm51-section > .pm51-section-head`)].filter((hd) => hd.querySelector('[data-action="pm51-doctor-check"]')).map((hd) => {
						const tt = hd.querySelector('.pm51-section-copy').getBoundingClientRect(), bt = hd.querySelector('[data-action="pm51-doctor-check"]').getBoundingClientRect();
						return { title: hd.querySelector('.pm51-section-title').textContent.trim(), overlap: !(tt.right <= bt.left + 0.5 || bt.right <= tt.left + 0.5 || tt.bottom <= bt.top + 0.5 || bt.bottom <= tt.top + 0.5) };
					}), B);
					const bad = heads.filter((x) => x.overlap).map((x) => x.title);
					await t.check(`${cell}: no area's title runs under its Check Again`, !bad.length, bad.join(', ') || 'none');
					if (t.args.shots && surface === 'normal' && w === 1390 && SHOT_LOOKS.includes(look)) {
						for (const [name, why, pick] of [
							['what-is-checked', '"What is checked" lists the five areas', 'scope'],
							['areas-top', 'the checkup\'s first areas', 'first'],
							['areas-end', 'the checkup\'s last areas', 'last']
						]) {
							// frames for Jared: the demo's timed notices closed first (cosmetic only; nothing is judged from the frames)
							await f.evaluate(() => { document.querySelectorAll('.n-card .n-x, .rs-card .n-x').forEach((x) => x.click()); try { window.PM_TITLEBAR_NOTIFY && PM_TITLEBAR_NOTIFY.clearAll(); } catch (e) { /* no notices */ } });
							await f.evaluate(SCROLL_TO, [B, pick]);
							await t.page.waitForTimeout(700);
							await t.shot(`${look}-${name}`, `${look} 1390x900: ${why}`);
						}
						await f.evaluate(SCROLL_TO, [B, 'top']);
					}
				}
			});
		}
	};
}

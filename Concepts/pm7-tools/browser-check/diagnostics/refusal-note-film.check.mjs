// FO87-N1 film: the refusal note during a screen's entry, for a 60 fps GPU recording read frame by frame
// (tools/refusal-note-film-reader.py). At 1280x500, press the disabled Continue during entry to AI or Name,
// or double-click Continue on the previous screen (Creating once done, or Begin with New). The film's marks
// and FO87N1-FILM rows map note geometry, show time and entry end to the recording. Misses stay in the log,
// and a single retry uses a separate mark so its timing and pixels stay with that attempt.
//   browser-check run diagnostics/refusal-note-film.check.mjs --record /abs/film.mp4 --set page=<build> [--set cycles=2]
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';

async function pressPoint(f, settle, screen, route) {
	if (route === 'press') {
		await f.evaluate((s) => {
			if (s === 'name') O55.S.draft().project_name = '';
			O55.ui.go(s, { noHistory: true });
		}, screen);
		return f.waitForFunction((layer) => {
			const b = document.querySelector(layer + '.o55-entering .o55-foot .o55-primary[aria-disabled="true"]');
			if (!b) return null;
			const r = b.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2;
			return b.contains(document.elementFromPoint(x, y)) ? { x, y } : null;
		}, LAYER, { timeout: 4000, polling: 'raf' }).then((h) => h.jsonValue(), () => null);
	}

	const previous = screen === 'name' ? 'begin' : 'creating';
	if (screen === 'name') {
		await f.evaluate(() => {
			O55.S.draft().project_name = '';
			O55.ui.go('begin', { noHistory: true });
		});
		await settle();
		await f.waitForTimeout(300);
		await f.locator(LAYER + ' .o55-card[data-arg="new"]').first().click();
		await f.waitForTimeout(400);
	} else {
		await f.evaluate(() => {
			O55.S.sess.commit = Object.assign(O55.S.sess.commit || {}, { state: 'done' });
			O55.S.sess.backup = Object.assign(O55.S.sess.backup || {}, { dest: null });
			O55.ui.go('creating', { noHistory: true });
		});
		await f.waitForFunction((layer) => {
			const b = document.querySelector(layer + ' .o55-foot .o55-primary');
			return O55.S.sess.screen === 'creating' && b && b.getAttribute('aria-disabled') !== 'true';
		}, LAYER, { timeout: 15000 }).catch(() => {});
		await settle();
	}
	return f.evaluate(([layer, previous]) => {
		const b = document.querySelector(layer + ' .o55-foot .o55-primary');
		if (O55.S.sess.screen !== previous || !b || b.getAttribute('aria-disabled') === 'true') return null;
		const r = b.getBoundingClientRect();
		return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
	}, [LAYER, previous]);
}

async function filmAttempt(t, f, off, at, tag, screen, route) {
	await f.evaluate(([layer, screen]) => {
		const shown = '.o55-reason.o55-reason-show';
		const previous = document.querySelector(layer + ' ' + shown);
		const previousAt = previous?.dataset.at;
		const state = window.__n1 = { noteWall: null, endWall: null };
		const pane = document.querySelector('#pm-o55-onboarding .o55-pane');
		const observer = new MutationObserver(() => {
			if (O55.S.sess.screen !== screen) return;
			const l = pane.querySelector(layer);
			if (!l) return;
			const note = l.querySelector(shown);
			if (state.noteWall == null && note && (note !== previous || note.dataset.at !== previousAt)) {
				state.noteWall = Date.now();
			}
			if (state.noteWall != null && state.endWall == null &&
			    !l.classList.contains('o55-entering') && !pane.querySelector('.o55-layer.o55-out')) {
				state.endWall = Date.now();
			}
		});
		observer.observe(pane, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
		state.observer = observer;
	}, [LAYER, screen]);
	await t.mark(`press ${tag}`);
	await t.page.mouse.click(off.x + at.x, off.y + at.y);
	if (route === 'double') {
		await t.page.waitForTimeout(150);
		await t.page.mouse.click(off.x + at.x, off.y + at.y, { clickCount: 2 });
	}
	await f.waitForTimeout(2200);
	return f.evaluate((layer) => {
		const { noteWall, endWall, observer } = window.__n1;
		observer.disconnect();
		const info = { screen: O55.S.sess.screen, noteWall, endWall };
		const note = document.querySelector(layer + ' .o55-reason.o55-reason-show');
		if (!note || noteWall == null) return info;
		const s = getComputedStyle(note), m = new DOMMatrix(s.transform === 'none' ? undefined : s.transform);
		const q = note.getBoundingClientRect(), rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
		return {
			...info,
			rect: [q.x - m.m41, q.y - m.m42, q.width, q.height].map((v) => Math.round(v * 100) / 100),
			ground: rgb(s.backgroundColor), ink: rgb(s.color),
		};
	}, LAYER);
}

export default async function (t) {
	await t.viewport(1280, 500);
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh' });
	await f.waitForFunction(() => window.O55?.S?.open, null, { timeout: 30000 });
	await t.emulate({ reducedMotion: 'no-preference' });
	const fe = f === t.page.mainFrame() ? null : await f.frameElement();
	const off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
	const settle = () => f.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-layer.o55-entering, #pm-o55-onboarding .o55-layer.o55-out') && !O55.nierLook.busy() && !document.getElementById('o55np-reboot'), null, { timeout: 15000 }).catch(() => {});
	const rows = [];
	for (const look of (t.args.look ? String(t.args.look).split(',') : ['basic-light', 'glass-dark', 'friendly-light'])) {
		await t.page.mouse.move(2, 2);
		await f.evaluate(([fam, mode]) => { document.documentElement.setAttribute('data-motion', 'full'); O55.ui.applyLook(fam, mode); }, look.split('-'));
		await f.waitForTimeout(1600);
		await settle();
		for (let i = 0; i < (Number(t.args.cycles) || 2); i++) {
			for (const screen of ['ai', 'name']) for (const route of ['press', 'double']) {
				const fixture = `${screen} ${route} ${look} ${i}`;
				const misses = [];
				let valid = false;
				for (const suffix of ['', ' retry']) {
					const tag = fixture + suffix;
					const at = await pressPoint(f, settle, screen, route);
					const info = at ? await filmAttempt(t, f, off, at, tag, screen, route) : {};
					let invalid;
					if (!at) invalid = 'no Continue press target';
					else if (info.screen !== screen) invalid = `reached ${info.screen} instead of ${screen}`;
					else if (info.noteWall == null || !info.rect) invalid = 'no new refusal note shown';
					rows.push({ tag, ...info, ...(invalid ? { invalid } : {}) });
					await settle();
					await f.waitForTimeout(600);
					if (!invalid) {
						valid = true;
						break;
					}
					misses.push(`${tag}: ${invalid}`);
				}
				await t.check(`film fixture reaches ${screen} and shows a refusal note ${fixture}`, valid, misses.join('; '));
			}
		}
	}
	t.log('FO87N1-FILM ' + JSON.stringify({ off, rows }));
}

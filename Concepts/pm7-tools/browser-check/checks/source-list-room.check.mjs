// FO-86: Source Control's list keeps room beside the open Publish and review card, in Git and in Jujutsu, in all ten looks.
// Per engine and look, with the card open (aria-expanded true on its fold) and the panel's entrance finished, read from the
// live layout and hit-tests:
// - the panel holds the card's footer: its foot ends at or above the panel's foot (nothing cut off);
// - clearance: at rest (scrolled to the top) the list's first row sits below the tab strip (the Git scroller's top runs
//   under the strip by design; content scrolls under it);
// - room: the list's band below the strip (to the footer) is at least 120 px, about three rows;
// - reach: in every tab of the engine, every row (row heads, shelf heads, the branch trigger, flat rows; rows inside folded
//   expanders do not count) can be scrolled to a press point clear of the strip and the footer, where a hit-test lands on
//   it; and once per engine and look, a real mouse wheel over the list brings its last row to such a point;
// - the footer's actions: each focusable in the footer, reached in turn by a real Tab from the first, is focused, wholly
//   inside the footer's visible box (as the panel clips it; the card scrolls inside the footer) and on top at its centre, and the panel itself has not
//   scrolled (it clips with overflow hidden, which a focus can still scroll, carrying the banner and strip off); and a
//   real wheel over the footer brings its last action into view;
// - a tall panel (1920x1080, 1024x768, 740x768) is unchanged: the footer shows its whole card with nothing to scroll (in
//   the footer or the card).
// Sizes 1280x500 (FO-86's), 1024x768, 740x768 and 1920x1080, both surfaces, one test each.
//   --set size=1280x500   --set looks=glass-dark   --set engines=git,jj
const SIZES = [[1280, 500], [1024, 768], [740, 768], [1920, 1080]];
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-dark`, `${f}-light`]);
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const BAND = 120;
// the engine's parts: its tab strip, its list scroller, its card footer, its tabs and the pane a tab shows
const PARTS = {
	git: { strip: '#panel-source > .pm-segtab', scroll: '#panel-source > .sh-scroll', foot: '#panel-source > .pm7-scm-git-footer', tabs: '#panel-source > .pm-segtab [role="tab"][data-tab]', tabKey: 'data-tab', pane: '#panel-source > .sh-scroll > [data-pane="%"]' },
	jj: { strip: '#panel-source .d-jj-strip', scroll: '#panel-source .d-jj-scroll', foot: '#panel-source .d-jj-foot', tabs: '#panel-source .d-jj-strip [role="tab"][data-jj-tab]', tabKey: 'data-jj-tab', pane: '#panel-source [data-jj-pane="%"]' },
};
const ROWS = '[data-collapse], .pm6-tb-menu-trigger, .sh-row, .sh-head';
const paneOf = (P, k) => P.pane.replace('%', k);

async function cell(t, surface, w, h, fixture = null) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	const looks = fixture ? ['friendly-dark'] : list(t.args.looks, LOOKS), engines = fixture ? ['git', 'jj'] : list(t.args.engines, ['git', 'jj']), tall = h >= 700, tag = `${surface} ${w}x${h}`;
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	const icon = f.locator('#activityBar .icon[data-target="panel-source"]');
	const shown = () => f.evaluate(() => { const s = document.getElementById('sidePanelSlot'); return !!s && s.checkVisibility() && document.querySelector('#sidePanelSlot > .side-panel-view.active')?.id === 'panel-source'; });
	// every finite animation in the panel finished (its entrance deals the rows and the card in; a running job's pulse
	// never ends, so it is not waited for), then the panel's parts hold still for 6 frames running (a look's font load
	// refits the rail and can start an entrance after the first wait), at most 4 s
	const settle = () => f.evaluate(async () => {
		const pn = document.getElementById('panel-source'), t0 = performance.now();
		const parts = () => [...pn.querySelectorAll(':scope > *, .pm7-scm-jj-view > *')].map((e) => { const b = e.getBoundingClientRect(); return [b.top, b.height, b.left].map((v) => v.toFixed(1)).join(); }).join('|');
		let last = '', still = 0;
		while (performance.now() - t0 < 4000) {
			await Promise.all(pn.getAnimations({ subtree: true }).filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime)).map((a) => a.finished.catch(() => {})));
			await new Promise((res) => requestAnimationFrame(res));
			const k = parts(); still = k === last ? still + 1 : 0; last = k;
			if (still >= 6) return true;
		}
		return false;
	});
	let pressDetail = null;
	const ensureSource = async () => {
		for (let n = 0; n < 3 && !await shown(); n++) { await press(icon); await f.waitForFunction(() => document.querySelector('#sidePanelSlot > .side-panel-view.active')?.id === 'panel-source', null, { timeout: 2000 }).catch(() => {}); }
		return shown();
	};
	const open = async (engine) => {
		await ensureSource();
		const sw = f.locator(`#panel-source [data-pm7-scm-engine="${engine}"]`);
		if (await sw.getAttribute('aria-pressed') !== 'true') {
			if ((fixture || t.args.seedUsageAlert) && engine === 'jj') {
				// A real Usage owner event, with matching quota state. No clock, TTL or animation override.
				// seedUsageAlert reproduces the original natural79.99-to80 clock route; whole regression cases
				// deliver that same production event directly, independently of unrelated background ticking.
				await f.evaluate((natural) => { const s = PM_DEMO.state, q = s.usage.quotas[0]; q.pct = natural ? 79.99 : 80; s.usage.alert80Fired = !natural; if (!natural) PM_DEMO.emit('usage.alert', { kind: 'threshold', quota: q.id, pct: q.pct }); }, !!t.args.seedUsageAlert);
				await f.waitForFunction(() => { const e = document.querySelector('#panel-source [data-pm7-scm-engine="jj"]'), r = e.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h?.closest('#rsStage > .pmn-toast[data-src="usage"]'); }, null, { timeout: 5000 });
				await t.check('the real Usage attention notice covers JJ before the regression press', true);
			}
			await t.page.mouse.move(2, 2);
			await t.check(`the ${engine} switch is on top where it is pressed`, await press(sw), JSON.stringify(pressDetail), { hard: true });
			if ((fixture || t.args.seedUsageAlert) && engine === 'jj') await t.check('the covering Usage notice was filed through its own dismiss control', pressDetail.dismissed.some((n) => n.source === 'usage'), JSON.stringify(pressDetail), { hard: true });
			await f.waitForFunction((e) => document.getElementById('panel-source').getAttribute('data-scm-engine') === e, engine, { timeout: 5000 });
		}
		await settle();
	};
	const off = async () => { const fe = f === t.page.mainFrame() ? null : await f.frameElement(); return fe ? await fe.boundingBox() : { x: 0, y: 0 }; };
	// F3-447 permits a settled staged notice to cover controls. File it through its real dismiss button; never
	// click through a failed ownership test. Unknown covers still fail. A narrow Source panel may fold on the
	// outside dismiss press, so restore it and finish its existing entrance before measuring the intended control.
	const press = async (loc) => {
		const inspect = () => loc.evaluate((e) => {
			const b = e.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2, h = document.elementFromPoint(x, y);
			const describe = (n) => n ? { tag: n.tagName, id: n.id, cls: String(n.className?.baseVal ?? n.className), label: (n.getAttribute('aria-label') || n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80) } : null;
			const card = h?.closest('#rsStage > .pmn-toast:not(.pmn-entering):not(.pmn-leaving)');
			return { ok: !!h && (h === e || e.contains(h)), hasBox: b.width > 0 && b.height > 0, x, y, box: { left: b.left, top: b.top, width: b.width, height: b.height }, want: describe(e), hit: describe(h), source: !!e.closest('#panel-source'), notice: card && card.querySelector('button.pmn-x') ? { id: card.getAttribute('data-pmn-id'), source: card.getAttribute('data-src'), level: card.getAttribute('data-level') } : null };
		});
		await loc.scrollIntoViewIfNeeded();
		let state = await inspect();
		const dismissed = [];
		// The notification owner stages at most five cards (F3-447); each recovery makes one real dismissal.
		for (let n = 0; !state.ok && state.notice && n < 5; n++) {
			const notice = state.notice, sourceTarget = state.source;
			t.log('Source press: dismiss covering staged notice ' + JSON.stringify(state));
			await f.locator(`#rsStage > .pmn-toast[data-pmn-id="${notice.id}"] button.pmn-x`).click();
			await f.waitForFunction((id) => { const c = document.querySelector(`#rsStage > .pmn-toast[data-pmn-id="${id}"]`); return !c || c.classList.contains('pmn-leaving'); }, notice.id, { timeout: 3000 });
			dismissed.push(notice);
			if (sourceTarget && !await shown() && !await ensureSource()) { pressDetail = { ...state, dismissed, reason: 'Source did not reopen after notice dismissal' }; return false; }
			await settle(); await loc.scrollIntoViewIfNeeded(); state = await inspect();
		}
		pressDetail = { ...state, dismissed };
		if (!state.ok || !state.hasBox) return false;
		// The hit-test and click share one frame-local point; the old separate bounding-box read could drift.
		const o = await off(); await t.page.mouse.click(o.x + state.x, o.y + state.y);
		return true;
	};
	for (const look of looks) {
		await t.app.look(look);
		for (const engine of engines) {
			const P = PARTS[engine], T = `FO-86 ${tag} ${look} ${engine}`;
			await open(engine);
			// the card is open, as FO-86 has it
			const card = await f.evaluate((foot) => { const ft = document.querySelector(foot), b = ft && ft.querySelector('.d-fold'); return { foot: !!ft && ft.checkVisibility(), open: b ? b.getAttribute('aria-expanded') : null }; }, P.foot);
			if (!await t.check(`${T}: the Publish and review card is shown and open`, card.foot && card.open === 'true', JSON.stringify(card), { hard: true })) continue;
			const tabs = await f.evaluate(([sel, key]) => [...document.querySelectorAll(sel)].filter((e) => e.checkVisibility()).map((e) => e.getAttribute(key)), [P.tabs, P.tabKey]);
			await t.check(`${T}: the engine shows its tabs`, tabs.length >= 4, JSON.stringify(tabs), { hard: true });
			// the layout: the panel holds the footer; the band below the strip; the footer's whole card on a tall panel
			const lay = await f.evaluate((P) => {
				const r = (s) => document.querySelector(s).getBoundingClientRect(), ft = document.querySelector(P.foot), pn = r('#panel-source');
				// what is left to scroll in the footer: the footer itself or the card that scrolls in it
				const footScroll = Math.max(...[ft, ...ft.querySelectorAll('*')].filter((e) => e === ft || /auto|scroll/.test(getComputedStyle(e).overflowY)).map((e) => e.scrollHeight - e.clientHeight));
				return { panelBottom: pn.bottom, stripBottom: r(P.strip).bottom, scrollBottom: r(P.scroll).bottom, footTop: r(P.foot).top, footBottom: r(P.foot).bottom, footScroll };
			}, P);
			const band = Math.min(lay.scrollBottom, lay.footTop) - lay.stripBottom;
			await t.check(`${T}: the panel holds the card's footer (nothing cut off at its foot)`, lay.footBottom <= lay.panelBottom + 0.5, JSON.stringify(lay));
			await t.check(`${T}: the list keeps at least ${BAND} px (about three rows) below the strip`, band >= BAND, JSON.stringify({ band: Math.round(band), ...lay }));
			if (tall) await t.check(`${T}: a tall panel shows the footer's whole card (nothing to scroll in the footer or the card)`, lay.footScroll <= 0, JSON.stringify(lay));
			// clearance and reach, in every tab
			for (const tab of tabs) {
				await press(f.locator(`${P.tabs}[${P.tabKey}="${tab}"]`));
				await f.waitForFunction((s) => { const p = document.querySelector(s); return !!p && p.checkVisibility(); }, paneOf(P, tab), { timeout: 3000 });
				await settle();
				const res = await f.evaluate(([P, pane, ROWS]) => {
					const sc = document.querySelector(P.scroll), stripB = document.querySelector(P.strip).getBoundingClientRect().bottom;
					const footT = document.querySelector(P.foot).getBoundingClientRect().top, scB = sc.getBoundingClientRect().bottom, bot = Math.min(footT, scB);
					const folded = (e) => { for (let a = e.parentElement; a && a !== sc; a = a.parentElement) if (a.matches(':is(.sh-accb, .sh-wt-b, .cr-acc-b)') && a.parentElement?.matches('[data-acc]:not(.open)')) return true; return false; };
					const rows = [...document.querySelector(pane).querySelectorAll(ROWS)].filter((e) => e.checkVisibility() && e.getBoundingClientRect().height > 4 && !folded(e) && !e.closest('[role="menu"]'));
					const name = (e) => (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);
					sc.scrollTop = 0;
					const first = rows[0] ? rows[0].getBoundingClientRect().top : null;
					const out = { rows: rows.length, firstTop: first, stripB, bot, miss: [] };
					for (const e of rows) {
						const b0 = e.getBoundingClientRect(), mid = (stripB + bot) / 2;
						sc.scrollTop += (b0.top + Math.min(b0.height, 40) / 2) - mid;
						const b = e.getBoundingClientRect(), y = b.top + Math.min(b.height, 40) / 2, x = b.left + Math.min(b.width / 2, 60);
						const hit = document.elementFromPoint(x, y);
						if (!(y > stripB + 1 && y < bot - 1 && hit && (hit === e || e.contains(hit)))) out.miss.push({ row: name(e), y: Math.round(y), hit: hit ? hit.tagName + '.' + String(hit.className).slice(0, 30) : null });
					}
					sc.scrollTop = 0;
					return out;
				}, [P, paneOf(P, tab), ROWS]);
				await t.check(`${T} ${tab}: at rest the list's first row sits below the tab strip`, res.firstTop != null && res.firstTop >= res.stripB - 0.5, JSON.stringify({ firstTop: res.firstTop, stripBottom: res.stripB }));
				await t.check(`${T} ${tab}: every row (${res.rows}) can be scrolled to a press point clear of the strip and the footer`, res.rows > 0 && !res.miss.length, JSON.stringify(res.miss.slice(0, 6)));
			}
			// a real wheel over the list brings its last row to a press point (the engine's first tab)
			await press(f.locator(`${P.tabs}[${P.tabKey}="${tabs[0]}"]`));
			await settle();
			const o = await off();
			const sb = await f.evaluate((P) => { const r = document.querySelector(P.scroll).getBoundingClientRect(), s = document.querySelector(P.strip).getBoundingClientRect(); return { x: r.left + r.width / 2, y: (s.bottom + Math.min(r.bottom, document.querySelector(P.foot).getBoundingClientRect().top)) / 2 }; }, P);
			await t.page.mouse.move(o.x + sb.x, o.y + sb.y);
			let last = null;
			for (let n = 0; n < 40; n++) {
				last = await f.evaluate(([P, pane, ROWS]) => {
					const sc = document.querySelector(P.scroll), rows = [...document.querySelector(pane).querySelectorAll(ROWS)].filter((e) => e.checkVisibility() && e.getBoundingClientRect().height > 4);
					const e = rows[rows.length - 1], b = e.getBoundingClientRect(), y = b.top + Math.min(b.height, 40) / 2;
					const bot = Math.min(sc.getBoundingClientRect().bottom, document.querySelector(P.foot).getBoundingClientRect().top), top = document.querySelector(P.strip).getBoundingClientRect().bottom;
					const hit = document.elementFromPoint(b.left + Math.min(b.width / 2, 60), y);
					return { ok: y > top + 1 && y < bot - 1 && !!hit && (hit === e || e.contains(hit)), y: Math.round(y), atEnd: sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 1 };
				}, [P, paneOf(P, tabs[0]), ROWS]);
				if (last.ok || last.atEnd) break;
				await t.page.mouse.wheel(0, 80); await f.waitForTimeout(60);
			}
			await t.check(`${T}: a real wheel over the list brings its last row to a press point`, !!last && last.ok, JSON.stringify(last));
			await f.evaluate((P) => { document.querySelector(P.scroll).scrollTop = 0; }, P);
			// the footer's actions: by real Tab from the first, and by a real wheel over the footer
			const acts = await f.evaluate((P) => {
				const ft = document.querySelector(P.foot); [ft, ...ft.querySelectorAll('*')].forEach((e) => { if (e.scrollTop) e.scrollTop = 0; });
				document.querySelectorAll('[data-slr-act]').forEach((e) => e.removeAttribute('data-slr-act'));
				const els = [...ft.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((e) => e.checkVisibility() && !e.disabled && e.tabIndex >= 0);
				els.forEach((e, i) => e.setAttribute('data-slr-act', String(i)));
				return els.map((e) => (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 32));
			}, P);
			await t.check(`${T}: the footer has actions to reach`, acts.length >= 2, JSON.stringify(acts), { hard: true });
			const inView = (i) => f.evaluate(([P, i]) => {
				const ft = document.querySelector(P.foot), e = document.querySelector(`[data-slr-act="${i}"]`), fb = ft.getBoundingClientRect(), b = e.getBoundingClientRect();
				const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
				const pn = document.getElementById('panel-source'), pb = pn.getBoundingClientRect(), view = document.querySelector(P.scroll).closest('.pm7-scm-jj-view') || pn;
				const lo = Math.max(fb.top + ft.clientTop, pb.top), hi = Math.min(fb.top + ft.clientTop + ft.clientHeight, pb.bottom);
				// in view: inside the footer's visible box as the panel clips it, within 1 px (a focus scrolls to a whole pixel
				// while the footer sits at a fraction); the panel itself never scrolls (it clips with overflow hidden, which a
				// focus can still scroll, carrying the banner and the strip off)
				return { focused: document.activeElement === e, inside: b.top >= lo - 1 && b.bottom <= hi + 1, onTop: !!hit && (hit === e || e.contains(hit)), panelScroll: pn.scrollTop + (view === pn ? 0 : view.scrollTop), top: Math.round(b.top), bottom: Math.round(b.bottom), footTop: Math.round(fb.top), footBottom: Math.round(fb.bottom), panelBottom: Math.round(pb.bottom) };
			}, [P, i]);
			const keyMiss = [];
			await f.locator('[data-slr-act="0"]').focus();
			for (let i = 0; i < acts.length; i++) {
				if (i) await t.page.keyboard.press('Tab');
				const v = await inView(i);
				if (!(v.focused && v.inside && v.onTop && !v.panelScroll)) keyMiss.push({ action: acts[i], ...v });
			}
			await t.check(`${T}: each footer action (${acts.length}), reached by Tab, is focused, in view and on top, the panel unscrolled`, !keyMiss.length, JSON.stringify(keyMiss.slice(0, 4)));
			await f.evaluate(([P]) => { document.activeElement?.blur?.(); const ft = document.querySelector(P.foot); [ft, ...ft.querySelectorAll('*')].forEach((e) => { if (e.scrollTop) e.scrollTop = 0; }); const pn = document.getElementById('panel-source'); pn.scrollTop = 0; const v = pn.querySelector('.pm7-scm-jj-view'); if (v) v.scrollTop = 0; }, [P]);
			const fb = await f.evaluate((P) => { const r = document.querySelector(P.foot).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 30) }; }, P);
			await t.page.mouse.move(o.x + fb.x, o.y + fb.y);
			let v = null;
			for (let n = 0; n < 30; n++) {
				v = await inView(acts.length - 1);
				if (v.inside && v.onTop && !v.panelScroll) break;
				await t.page.mouse.wheel(0, 60); await f.waitForTimeout(60);
			}
			await t.check(`${T}: a real wheel over the footer brings its last action (${acts[acts.length - 1]}) into view, on top`, !!v && v.inside && v.onTop && !v.panelScroll, JSON.stringify(v));
			await f.evaluate((P) => { const ft = document.querySelector(P.foot); [ft, ...ft.querySelectorAll('*')].forEach((e) => { if (e.scrollTop) e.scrollTop = 0; }); }, P);
			await t.page.mouse.move(2, 2);
		}
	}
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) for (const [w, h] of SIZES) {
	tests[`Source list room ${surface} ${w}x${h}`] = async (t) => {
		if (t.args.size && !list(t.args.size, []).includes(`${w}x${h}`)) { t.log(`skipped: --set size leaves out ${w}x${h}`); return; }
		return cell(t, surface, w, h);
	};
}

// Keep the real, naturally observed cover state in whole runs, independently of ambient demo timing.
for (const surface of ['normal', 'sandbox']) tests[`Source list room ${surface} 740x768 with Usage notice`] = async (t) => {
	if (t.args.size && !list(t.args.size, []).includes('740x768')) { t.log('skipped: --set size leaves out the Usage regression size'); return; }
	if (t.args.looks && !list(t.args.looks, []).includes('friendly-dark')) { t.log('skipped: --set looks leaves out the Usage regression look'); return; }
	return cell(t, surface, 740, 768, 'usage');
};

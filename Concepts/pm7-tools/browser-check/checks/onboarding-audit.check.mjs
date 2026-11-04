import { onboardingApp } from '../helpers/onboarding-fields.mjs';
import { LOOKS } from '../browser-check.config.mjs';
// The onboarding audit (brought into the kit from final-onb's scratch audit at d45dfcdba5, without its pinned head and page
// hash): browser-check's audit (covered controls, overflow, clipped text, a box inside the wizard's scroller that scrolls
// sideways, broken images, unexpected dialogs, console errors) of the onboarding window, in any of the ten looks, on the
// page under test, on each screen that audit covered:
// - online-details: a new online copy on an own Gitea server, reached by clicks (Safe › online › Other services › Gitea ›
//   its address › a token › Continue);
// - safe: Keep your work safe with an online copy whose service must be chosen again (a retired hosted Gitea pick the
//   page normalizes to "Choose a service"). No public route makes that record, so it is constructed in the page's store,
//   labelled so, and its effective state asserted before the audit.
// Only the window is audited; the app under its scrim is not. One exemption, by the page's own marks: NieR's decorative
// data column, the stream of hex and binary at the stage's right edge (54-art-nier.js: the g.st-data group inside a
// clip-path, inside the stage's svg.pst-svg, which the page marks aria-hidden). It scrolls through that clip on purpose,
// so the clipped-text rule judged whichever line the clip happened to cut at that moment (final-onb's NieR Light Safe
// and online-details audits: 'E377 01010000' cut by #pst1wdc). Any other text, in the stage or the window, still counts,
// and each case asserts the exemption is that one group (one, of 80 lines, in its clip, in NieR; none in another look).
// --set looks=nier-light,basic-dark some looks (default all ten), --set screens=safe one screen, --set crops=1 a native
// crop of the window per case. Selftests, NieR looks only, each must fail: --set selftest=column freezes the data column
// where its clip cuts a line through and drops the exemption (the column is flagged); --set selftest=clip keeps the
// exemption and adds a label beside the column in the same clip and a clipped label in the window (both are flagged, and
// nothing of the column). About 45 s a case.
const DECOR = 'svg.pst-svg[aria-hidden="true"] g.st-data';
const GITEA = 'https://gitea.platyr.test';
const SCREENS = ['online-details', 'safe'];

async function reach(t, A, screen) {
	await A.toSafe('Audit current page');
	if (screen === 'online-details') {
		await A.click('online', undefined, 'online-service'); await A.service('gitea', null, GITEA); await A.signIn(); await A.click('next', undefined, 'online-details');
		return;
	}
	/* constructed: a retired hosted Gitea pick (gitea_cloud with no address), which the page normalizes to a service still to choose */
	await A.frame().evaluate(() => {
		const S = O55.S;
		O55.draft.set(S.sess.drafts.main, { online_mode: 'new', forge: 'gitea', forge_provider_variant: 'gitea_cloud', forge_instance_url: '', forge_account_ref: '' });
		S.sess.online = Object.assign({}, S.sess.online, { purpose: 'copy', forge: null, variant: null, chosen: null, mustPick: true, unchosen: true });
		S.sess.signin = {}; S.save(); O55.ui.refresh();
	});
	await A.screen('safe');
	const e = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return { forge: d.forge, mode: d.online_mode, retired: !!d.forge_retired, summary: (document.querySelector('[data-key="r-online"] .o55-rowmeta') || {}).textContent, expected: O55.t('review.serviceToChoose') }; });
	await t.check('constructed Safe: the online copy is wanted with no service (forge none, mode new, the retired pick marked, "' + e.expected + '")', e.forge === 'none' && e.mode === 'new' && e.retired && (e.summary || '').trim() === e.expected, JSON.stringify(e), { hard: true });
}

/* selftest=column: the data column paused where its clip's top edge cuts a line through (45-60 % of the line outside) */
const FREEZE = () => {
	const g = document.querySelector('#pm-o55-onboarding svg.pst-svg g.st-data'); if (!g) return { ok: false, why: 'no data column' };
	const clip = g.parentElement, id = (/url\(\s*["']?#([^"')]+)/.exec(clip.getAttribute('clip-path') || '') || [])[1], rect = id && document.getElementById(id) && document.getElementById(id).querySelector('rect');
	const an = g.getAnimations()[0]; if (!rect || !an) return { ok: false, why: 'no clip rect or animation' };
	const top = +rect.getAttribute('y'), dur = an.effect.getComputedTiming().duration, texts = [...g.querySelectorAll('text')];
	an.pause();
	for (let k = 0; k < 2000; k++) {
		an.currentTime = (k / 2000) * dur;
		const ty = new DOMMatrixReadOnly(getComputedStyle(g).transform).f;
		for (const x of texts) { const b = x.getBBox(), y0 = b.y + ty, y1 = y0 + b.height, out = (top - y0) / b.height;
			if (y0 < top && y1 > top && out >= 0.45 && out <= 0.6) return { ok: true, clip: id, line: x.textContent, out: Math.round(out * 100) + '%', at: Math.round(an.currentTime) }; }
	}
	return { ok: false, why: 'no phase cuts a line through' };
};
/* selftest=clip: a label beside the column in its own clip (cut through at the clip's top edge), and a clipped label in the window */
const PLANT = () => {
	const g = document.querySelector('#pm-o55-onboarding svg.pst-svg g.st-data'); if (!g) return { ok: false, why: 'no data column' };
	const clip = g.parentElement, id = (/url\(\s*["']?#([^"')]+)/.exec(clip.getAttribute('clip-path') || '') || [])[1], rect = document.getElementById(id).querySelector('rect');
	const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	t.setAttribute('x', String(+rect.getAttribute('x') + +rect.getAttribute('width') - 4)); t.setAttribute('y', String(+rect.getAttribute('y') + 3)); t.setAttribute('text-anchor', 'end'); t.setAttribute('font-size', '12');
	t.textContent = 'SELFTEST STAGE LABEL'; clip.appendChild(t);
	const title = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-title');
	if (title) { title.textContent = 'SELFTEST WINDOW LABEL'; Object.assign(title.style, { display: 'block', height: '9px', overflow: 'hidden', lineHeight: '24px' }); }
	return { ok: true, clip: id, window: !!title };
};

const only = (v, all) => (v ? String(v).split(',').filter((x) => all.includes(x)) : all);
export const tests = Object.fromEntries(LOOKS.flatMap((look) => SCREENS.map((screen) => [`${look} · ${screen}`, async (t) => {
	if (!only(t.args.looks, LOOKS).includes(look) || !only(t.args.screens, SCREENS).includes(screen)) return;
	const selftest = t.args.selftest || '', nier = look.startsWith('nier');
	if (selftest && !nier) { t.log(`selftest ${selftest} runs in the NieR looks only`); return; }
	const A = onboardingApp(t);
	await A.boot({ look: look.split('-') });
	await reach(t, A, screen);
	/* the screen settled: no layer leaving or held, Pip done typing */
	await A.frame().waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer.o55-out, #pm-o55-onboarding .o55-pane > .o55-layer.o55-hold, #pm-o55-onboarding .o55-stage .typing'), null, { timeout: 15000 }).catch(() => {});
	await A.sleep(1200);
	const st = await A.frame().evaluate(() => ({ screen: O55.S.sess.screen, theme: O55.theme() }));
	await t.check(`on ${screen} in ${look}`, st.screen === screen && st.theme.chosen === look.split('-')[0] && st.theme.mode === look.split('-')[1], JSON.stringify(st), { hard: true });
	/* the exemption is the data column alone: one group of 80 lines in its clip, in the aria-hidden stage svg; none elsewhere */
	const cover = await A.frame().evaluate((sel) => { const g = [...document.querySelectorAll(sel)];
		return { groups: g.length, lines: g.reduce((n, x) => n + x.querySelectorAll('text').length, 0), inClip: g.every((x) => /url\(/.test((x.parentElement && x.parentElement.getAttribute('clip-path')) || '')), other: g.reduce((n, x) => n + x.querySelectorAll(':scope > :not(text)').length, 0) }; }, DECOR);
	if (nier) await t.check('the exemption is NieR\'s data column alone (one g.st-data of 80 lines and nothing else, in its clip, in the aria-hidden stage svg)', cover.groups === 1 && cover.lines === 80 && cover.other === 0 && cover.inClip, JSON.stringify(cover));
	else await t.check('no exemption applies in this look', cover.groups === 0, JSON.stringify(cover));
	let ignore = ['body > :not(#pm-o55-onboarding)', DECOR];
	if (selftest === 'column') {
		const fz = await A.frame().evaluate(FREEZE);
		t.log('selftest column: ' + JSON.stringify(fz)); await t.check('selftest column: the data column is paused with a line cut through', fz.ok, JSON.stringify(fz), { hard: true });
		ignore = ['body > :not(#pm-o55-onboarding)'];
	} else if (selftest === 'clip') {
		const pl = await A.frame().evaluate(PLANT);
		t.log('selftest clip: ' + JSON.stringify(pl)); await t.check('selftest clip: labels planted', pl.ok && pl.window, JSON.stringify(pl), { hard: true });
	}
	await t.audit(`${look} ${screen}`, { ignore, frames: false, noSideways: '#pm-o55-onboarding .o55-scroll' });
	if (t.args.crops === '1') await t.crop(`${look}-${screen}`, '#pm-o55-onboarding .o55-win', `${look} ${screen}: the settled window as audited`);
}])));

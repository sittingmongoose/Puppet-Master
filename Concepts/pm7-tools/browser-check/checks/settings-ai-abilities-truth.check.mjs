// Stream F batch 11, lane B: Settings › AI & Providers › Web & Research, Media & Output and Back Seat Driver say what
// is true (settings-managers-20261110/review/OPEN-AND-FOUND.md section F, lane-aimore "Defects of PMConcept7").
// web (rows 1, 2, 5, 8, 9, 16): "Check every web ability" counts every search service card by the state it shows; an
//   ability that is off still names its model and says its last check is from before; a service in an order that
//   cannot run says it is skipped; the Browser ability gets no second card of other abilities' rows; a removed key is
//   gone; each manager's footer link is named as its check panel is.
// media (rows 3, 4, 13, 14, 15, 16, 17): the picture panel opens on what is chosen; an ability using a service is not
//   "Not set up"; each size is offered once; Text to Speech offers no coding or picture model; a blocked ability whose
//   own switch is on says so; Documents gets no second card; no "workspace".
// advisor (rows 6, 7, 10, 11, 12): a finding shows no internal ids; the backup model list is the model list, with no
//   picture model; "Open in chat" and "Check the advisor" use no command names; the advisor is spelled one way and
//   "How readily it speaks up" is not explained by itself.
// Each test runs on the surfaces asked for (normal and T3's sandbox unless --set sandbox= picks one).

async function settings(t, surface, [w, h] = [1920, 1080]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
async function go(t, f, ws) {
	await f.evaluate((w) => PM51.go('ai', w), ws);
	await f.waitForSelector(`[data-continuous-workspace-body="${ws}"][data-workspace-mounted="true"]`, { timeout: 15000 });
	await t.settle();
}
const body = (ws) => `[data-continuous-workspace-body="${ws}"]`;
/* pick an item of a manager's list and wait until its page is the one shown */
async function pick(t, f, ws, id, name) {
	for (let i = 0; i < 2; i++) {
		await f.evaluate(([ws, id]) => { const b = document.querySelector(`[data-continuous-workspace-body="${ws}"] .resource-row[data-id="${id}"]`); b.scrollIntoView({ block: 'center' }); b.click(); }, [ws, id]);
		const ok = await f.waitForFunction(([ws, name]) => { const t = document.querySelector(`[data-continuous-workspace-body="${ws}"] .pm51-detail-title`); return !!t && t.textContent.trim().startsWith(name); }, [ws, name], { timeout: 3000 }).then(() => true).catch(() => false);
		if (ok) break;
	}
	await t.page.waitForTimeout(400);
}
const detail = (f, ws) => f.evaluate((ws) => document.querySelector(`[data-continuous-workspace-body="${ws}"] .pm51-detail`).innerText, ws);
/* a detail row's value and help, by its label */
const row = (f, ws, label) => f.evaluate(([ws, label]) => {
	const r = [...document.querySelectorAll(`[data-continuous-workspace-body="${ws}"] .pm51-detail .setting-row`)].find((x) => (x.querySelector('.setting-label') || {}).textContent?.trim() === label);
	return r ? { help: (r.querySelector('.setting-description') || {}).textContent?.trim() || '', value: (r.querySelector('.pm51-row-value') || {}).textContent?.trim() || '', text: r.innerText } : null;
}, [ws, label]);
/* the innermost open panel whose text has `has` (never the editor's prepared, unseen Customize sheet) */
const panel = (f, has) => f.waitForFunction((has) => {
	const ps = [...document.querySelectorAll('aside.drawer, .drawer-wrap, [role="dialog"], [role="alertdialog"]')].filter((x) => x.getClientRects().length && !x.closest('.pmt-cz') && x.innerText.includes(has));
	return ps.length ? ps[ps.length - 1].innerText : false;
}, has, { timeout: 6000 }).then((h) => h.jsonValue()).catch(() => '');
const closeAll = async (t) => { for (let i = 0; i < 3; i++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(250); } };
const quiet = (f, ws, action) => f.evaluate(([ws, action]) => { const b = document.querySelector(`[data-continuous-workspace-body="${ws}"] [data-action="${action}"]`); if (!b) return ''; b.scrollIntoView({ block: 'center' }); const t = b.textContent.trim(); b.click(); return t; }, [ws, action]);

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`lane-aimore web rows 1 2 5 8 9 16 (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		await go(t, f, 'web');
		// row 5: Search's order and Crawl's say which services they skip
		await pick(t, f, 'web', 'search', 'Search');
		const steps = (f2) => f2.evaluate(() => [...document.querySelectorAll('[data-continuous-workspace-body="web"] .pm51-detail .o55-chain-step')].map((s) => ({ ready: s.classList.contains('tone-ready'), text: s.textContent.trim() })));
		let st = await steps(f);
		await pick(t, f, 'web', 'crawl', 'Crawl');
		st = st.concat(await steps(f));
		const silent = st.filter((s) => !s.ready && !/skipped/.test(s.text));
		await t.check(`an order says which services it skips (${st.filter((s) => !s.ready).map((s) => s.text).join(' | ')})`, st.some((s) => !s.ready) && silent.length === 0, silent.map((s) => s.text).join(', '));
		// row 8: the Browser ability gets no card of the other abilities' rows
		const WEB_ROWS = ['web.providers.web-search-enable', 'web.providers.capability-matrix', 'web.fetch.search-max-results', 'web.fetch.research-max-sources', 'web.fetch.research-auto-read-pages', 'web.fetch.pdf-mode', 'web.fetch.request-timeout', 'web.fetch.crawl-max-pages', 'web.fetch.crawl-max-depth', 'web.fetch.map-max-pages', 'web.fetch.map-max-depth'];
		const shownRows = (ws, ids) => f.evaluate(([ws, ids]) => ids.filter((id) => [...document.querySelectorAll(`[data-continuous-workspace-body="${ws}"] #setting-${CSS.escape(id)}, [data-continuous-workspace-body="${ws}"] .setting-row[data-setting-id="${id}"]`)].some((r) => r.getClientRects().length && !r.closest('details:not([open])'))), [ws, ids]);
		// the card came after a link landed elsewhere with Browser shown: Browser › "Open Browser & SCM", then back
		await pick(t, f, 'web', 'browser', 'Browser');
		await f.evaluate(() => { const b = [...document.querySelectorAll('[data-continuous-workspace-body="web"] .pm51-detail button')].find((x) => /Open Browser & SCM/.test(x.textContent)); b.click(); });
		await t.page.waitForTimeout(1800);
		await go(t, f, 'web');
		const OWN = { browser: [], crawl: ['web.providers.capability-matrix', 'web.fetch.crawl-max-pages', 'web.fetch.crawl-max-depth'], search: ['web.providers.web-search-enable', 'web.providers.capability-matrix', 'web.fetch.search-max-results', 'web.fetch.research-max-sources', 'web.fetch.research-auto-read-pages'] };
		for (const [id, name] of [['browser', 'Browser'], ['crawl', 'Crawl'], ['search', 'Search']]) {
			await pick(t, f, 'web', id, name);
			const extra = (await shownRows('web', WEB_ROWS)).filter((x) => !OWN[id].includes(x));
			await t.check(`after a link and back, ${name} shows no other ability's rows`, extra.length === 0, extra.join(', '));
		}
		// row 2: Search switched off still names its model, and its last check says it is from before
		await pick(t, f, 'web', 'search', 'Search');
		const onModel = (await row(f, 'web', 'AI model'))?.value || '';
		await f.evaluate(() => document.querySelector('[data-continuous-workspace-body="web"] [data-setting="web.providers.web-search-enable"][role="switch"]').click());
		await t.page.waitForTimeout(900);
		const model = await row(f, 'web', 'AI model'), check = await row(f, 'web', 'Last check');
		await t.check(`switched off, Search still names its model ("${model && model.value}")`, !!model && !!onModel && model.value === onModel, `on: "${onModel}"`);
		await t.check(`switched off, its last check says it is from before ("${check && check.value}" — "${check && check.help}")`, !!check && (!/^Passed/.test(check.value) || /before it was turned off/.test(check.help)), check ? check.help : 'no row');
		await f.evaluate(() => document.querySelector('[data-continuous-workspace-body="web"] [data-setting="web.providers.web-search-enable"][role="switch"]').click());
		await t.page.waitForTimeout(700);
		// row 1 + 16: the footer link is named as its panel, and the panel counts every service card
		await f.evaluate(() => PM51.switchTab('web', 'services'));
		await t.page.waitForTimeout(800);
		const cards = await f.evaluate(() => [...document.querySelectorAll('[data-continuous-workspace-body="web"] .o55-web-services .pm51-acc-item, [data-continuous-workspace-body="web"] .o55-web-services > *')].map((c) => (c.querySelector('.pm51-status') || {}).textContent?.trim()).filter(Boolean));
		await f.evaluate(() => PM51.switchTab('web', 'abilities'));
		await t.page.waitForTimeout(600);
		const link = await quiet(f, 'web', 'pm51-web-diagnostics');
		const diag = await panel(f, 'Search services');
		const line = ((diag.split('\n').map((x) => x.trim()).filter(Boolean)).find((x, i, all) => all[i - 1] === 'Search services') || '');
		const title = diag.split('\n').map((x) => x.trim()).filter(Boolean)[0] || '';
		await t.check(`the web footer link is named as its panel ("${link}" / "${title}")`, !!link && link === title && /web/i.test(link), `${link} / ${title}`);
		const nums = [...line.matchAll(/(\d+)\s+(ready|off|need|failed)/g)].reduce((n, m) => n + Number(m[1]), 0);
		const off = cards.filter((c) => c === 'Off').length;
		await t.check(`its service count covers every card ("${line}"; cards: ${cards.join(', ')})`, cards.length > 0 && nums === cards.length && (!off || new RegExp(`${off} off`).test(line)), `${nums} counted of ${cards.length}`);
		await closeAll(t);
		// row 9: a removed key is gone
		await f.evaluate(() => PM51.switchTab('web', 'services'));
		await t.page.waitForTimeout(800);
		await f.evaluate(() => { const b = document.querySelector('[data-continuous-workspace-body="web"] [data-setting-id="web.web.providers.web-api-keys"], [data-continuous-workspace-body="web"] button[data-setting="web.providers.web-api-keys"]') || [...document.querySelectorAll('[data-continuous-workspace-body="web"] button')].find((x) => x.textContent.trim() === 'Service keys'); b.scrollIntoView({ block: 'center' }); b.click(); });
		const keys = await panel(f, 'Add, replace or remove');
		const removed = keys ? await f.evaluate(() => {
			const ps = [...document.querySelectorAll('aside.drawer, .drawer-wrap, [role="dialog"]')].filter((x) => x.getClientRects().length && x.innerText.includes('Add, replace or remove'));
			const p = ps[ps.length - 1]; const r = [...p.querySelectorAll('.pm51-row, .setting-row, [class*="row"]')].find((x) => /^Exa\b/.test(x.innerText.trim()) && /Remove/.test(x.innerText));
			const b = r && [...r.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Remove'); if (!b) return false; b.click(); return true;
		}) : false;
		if (await t.check('Service keys offers Remove for Exa', removed)) {
			await panel(f, 'Remove the Exa key?');
			await f.evaluate(() => { const ps = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], aside.drawer, .drawer-wrap')].filter((x) => x.getClientRects().length && x.innerText.includes('Remove the Exa key?')); const p = ps[ps.length - 1]; [...p.querySelectorAll('button')].filter((x) => x.textContent.trim() === 'Remove').pop().click(); });
			await t.page.waitForTimeout(900);
			const exa = await f.evaluate(() => { const c = [...document.querySelectorAll('[data-continuous-workspace-body="web"] .o55-web-services > *')].find((x) => /^Exa\b/.test(x.innerText.trim())); return c ? c.innerText.replace(/\n+/g, ' ¶ ') : ''; });
			await t.check(`after Remove, Exa's card no longer says its key is saved (${exa.slice(0, 90)})`, !!exa && !/Saved/.test(exa) && /(Needs a key|Add key)/.test(exa), exa.slice(0, 200));
		}
		await closeAll(t);
	};

	tests[`lane-aimore media rows 3 4 8 13 14 15 16 17 (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		await go(t, f, 'media');
		// row 15: a blocked ability whose own switch is on says so
		await pick(t, f, 'media', 'image-generation', 'Image Generation');
		const ig = await f.evaluate(() => {
			const d = document.querySelector('[data-continuous-workspace-body="media"] .pm51-detail');
			const sw = [...d.querySelectorAll('.setting-row')].find((r) => (r.querySelector('.setting-label') || {}).textContent?.trim() === 'Make pictures');
			return { pill: (d.querySelector('.pm51-detail-title .pm51-status, .pm51-detail-title [class*="pill"]') || {}).textContent?.trim() || '', on: sw ? sw.querySelector('[role="switch"]').getAttribute('aria-checked') === 'true' : null, note: (d.querySelector('.o55-media-block') || {}).textContent?.trim() || '', uses: [...d.querySelectorAll('.setting-row')].find((r) => (r.querySelector('.setting-label') || {}).textContent?.trim() === 'Uses')?.querySelector('.pm51-row-value')?.textContent.trim() || '' };
		});
		await t.check(`Image Generation: Off with its own switch on says why ("${ig.note}")`, !(ig.on && /Off/.test(ig.pill)) || /own switch/.test(ig.note), JSON.stringify(ig));
		// row 3: the picture panel opens on what is chosen
		await f.evaluate(() => { const b = [...document.querySelectorAll('[data-continuous-workspace-body="media"] .pm51-detail button')].find((x) => /^(Choose|Change)( service)?$/.test(x.textContent.trim())); b.scrollIntoView({ block: 'center' }); b.click(); });
		await panel(f, 'Service that makes pictures');
		const picked = await f.evaluate(() => { const s = [...document.querySelectorAll('select.pm51-media-svc')].filter((x) => x.closest('aside, .drawer-wrap, [role="dialog"]'))[0]; return s ? s.options[s.selectedIndex].textContent.trim() : ''; });
		await t.check(`the picture panel opens on what is chosen (Uses "${ig.uses}", panel "${picked}")`, ig.uses !== 'Nothing yet' || picked === 'No service', picked);
		await closeAll(t);
		// row 13: each size once
		const sizes = await f.evaluate(() => ['media.capabilities.image-size', 'media.capabilities.video-resolution'].map((id) => { const s = document.querySelector(`[data-continuous-workspace-body="media"] select[data-setting="${id}"]`); return s ? [...s.options].map((o) => o.textContent.trim()) : null; }));
		const twins = sizes.filter(Boolean).flat().filter((x) => /same as/i.test(x));
		await t.check(`each picture and video size is offered once (${sizes.map((x) => (x || []).join(', ')).join(' / ')})`, !!sizes[0] && twins.length === 0, twins.join(', '));
		// row 4: an ability that names its service is not "Not set up", and the check says the same
		await pick(t, f, 'media', 'transcription', 'Speech & Transcription');
		const tr = await f.evaluate(() => { const d = document.querySelector('[data-continuous-workspace-body="media"] .pm51-detail'); return { pill: (d.querySelector('.pm51-detail-title .pm51-status') || {}).textContent?.trim() || '', uses: [...d.querySelectorAll('.setting-row')].find((r) => (r.querySelector('.setting-label') || {}).textContent?.trim() === 'Uses')?.querySelector('.pm51-row-value')?.textContent.trim() || '' }; });
		await t.check(`Speech & Transcription naming "${tr.uses}" is not "${tr.pill}"`, tr.uses === 'Nothing yet' || tr.pill !== 'Not set up', JSON.stringify(tr));
		// row 14: Text to Speech offers no coding or picture model
		await pick(t, f, 'media', 'text-to-speech', 'Text to Speech');
		const tts = await f.evaluate(() => { const d = document.querySelector('[data-continuous-workspace-body="media"] .pm51-detail'); const help = [...d.querySelectorAll('.setting-row')].map((r) => (r.querySelector('.setting-description') || {}).textContent || '').join(' | '); return help; });
		await t.check('Text to Speech says nothing about a "workspace"', !/workspace/i.test(tts), tts.slice(0, 200));
		await f.evaluate(() => { const b = [...document.querySelectorAll('[data-continuous-workspace-body="media"] .pm51-detail button')].find((x) => /^(Change|Choose)( service)?$/.test(x.textContent.trim())); b.scrollIntoView({ block: 'center' }); b.click(); });
		await panel(f, 'Read text aloud');
		const models = await f.evaluate(() => [...document.querySelectorAll('select.pm51-media-model')].filter((x) => x.closest('aside, .drawer-wrap, [role="dialog"]')).flatMap((s) => [...s.options].map((o) => o.textContent.trim())));
		const wrong = models.filter((m) => /Codex coding model|GPT Image|Qwen Coder|Kimi K3|Claude Opus|Claude Sonnet|Claude Haiku/.test(m));
		await t.check(`Text to Speech offers no coding or picture model (${models.join(', ')})`, models.length > 0 && wrong.length === 0, wrong.join(', '));
		await closeAll(t);
		// row 8 (media): Documents gets no card of the other abilities' rows
		const MEDIA_ROWS = ['media.image.provider', 'media.capabilities.aspect-ratio', 'media.capabilities.image-size', 'media.capabilities.tts', 'media.capabilities.tts-voice', 'media.capabilities.video-duration', 'media.io.voice-input', 'media.capabilities.music-bpm'];
		// the card comes when the chapter is drawn again with this ability shown: to another chapter and back
		await pick(t, f, 'media', 'artifact-output', 'Document & Artifact Output');
		await f.evaluate(() => PM51.go('code', 'toolchain'));
		await f.waitForSelector('[data-continuous-workspace-body="toolchain"][data-workspace-mounted="true"]', { timeout: 15000 });
		await t.settle();
		await go(t, f, 'media');
		await pick(t, f, 'media', 'artifact-output', 'Document & Artifact Output');
		const extra = await f.evaluate((ids) => ids.filter((id) => [...document.querySelectorAll(`[data-continuous-workspace-body="media"] #setting-${CSS.escape(id)}, [data-continuous-workspace-body="media"] .setting-row[data-setting-id="${id}"]`)].some((r) => r.getClientRects().length && !r.closest('details:not([open])'))), MEDIA_ROWS);
		await t.check('after another chapter and back, Document & Artifact Output shows no other ability\'s rows', extra.length === 0, extra.join(', '));
		// row 16 + row 4: the footer link is named as its panel, and the panel agrees with Speech & Transcription
		const link = await quiet(f, 'media', 'pm51-media-diagnostics');
		const diag = await panel(f, 'Speech & Transcription');
		const lines = diag.split('\n').map((x) => x.trim()).filter(Boolean);
		await t.check(`the media footer link is named as its panel ("${link}" / "${lines[0]}")`, !!link && link === lines[0], `${link} / ${lines[0]}`);
		const after = lines[lines.indexOf('Speech & Transcription') + 1] || '';
		await t.check(`its line for Speech & Transcription agrees with its page ("${after}")`, tr.uses === 'Nothing yet' || !/Choose a service first/.test(after), after);
		await closeAll(t);
	};

	tests[`lane-aimore advisor rows 6 7 10 11 12 (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		await go(t, f, 'bsd');
		// row 12
		const page = await f.evaluate(() => document.querySelector('[data-continuous-workspace-body="bsd"]').innerText);
		const trig = await f.evaluate(() => { const r = document.querySelector('[data-continuous-workspace-body="bsd"] #setting-safety\\.approvals\\.bsd-trigger-sensitivity'); return r ? (r.querySelector('.setting-description') || {}).textContent?.trim() || '' : null; });
		await t.check(`"How readily it speaks up" is explained, not restated ("${trig}")`, trig !== null && !/^How readily/i.test(trig), trig);
		await t.check('the advisor is spelled one way on its page', !/adviser/i.test(page), (page.match(/.{0,30}adviser.{0,30}/i) || [''])[0]);
		// row 7: the backup list is the model list, and neither offers a picture model
		const lists = await f.evaluate(() => {
			const b = document.querySelector('[data-continuous-workspace-body="bsd"]');
			const main = b.querySelector('select[data-setting="safety.approvals.bsd-model"]');
			const back = [...b.querySelectorAll('select')].find((s) => s.getAttribute('aria-label') === 'If its model is not available' || s.dataset.action === 'pm51-bsd-fallback-model');
			return { main: main ? [...main.options].map((o) => o.textContent.trim()) : null, back: back ? [...back.options].map((o) => `${o.textContent.trim()} · ${o.closest('optgroup')?.label || o.dataset.group || ''}`) : null, backRaw: back ? [...back.options].map((o) => o.textContent.trim()) : null };
		});
		if (await t.check('the advisor has both model lists', !!lists.main && !!lists.back)) {
			const mainModels = lists.main.filter((x) => x !== 'Automatic' && x !== 'Default model');
			const pic = lists.main.concat(lists.backRaw).filter((x) => /GPT Image/.test(x));
			await t.check(`its backup model offers the models its model offers (${mainModels.length} and ${lists.backRaw.length})`, mainModels.length === lists.backRaw.length, `model: ${mainModels.join(', ')} | backup: ${lists.backRaw.join(', ')}`);
			await t.check('neither offers a picture model', pic.length === 0, pic.join(', '));
		}
		// row 11
		await quiet(f, 'bsd', 'pm51-bsd-diagnostics');
		const diag = await panel(f, 'Held findings');
		await t.check('"Check the advisor" names no command or internal word', !!diag && !/cmd\.|epoch|stored as/i.test(diag), (diag.match(/.{0,30}(cmd\.|epoch|stored as).{0,40}/i) || [diag ? '' : 'did not open'])[0]);
		await closeAll(t);
		// rows 6 and 10: a held finding and a delivered one
		await f.evaluate(() => PM51.switchTab('bsd', 'findings'));
		await t.page.waitForTimeout(800);
		const openF = (id) => f.evaluate((id) => { const b = document.querySelector(`[data-continuous-workspace-body="bsd"] [data-action="pm51-bsd-finding"][data-id="${id}"]`); if (!b) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true; }, id);
		if (await t.check('Findings lists the held finding', await openF('bsdf-0412'))) {
			const fin = await panel(f, 'Back Seat Driver finding');
			await t.check('a finding shows no internal ids', !!fin && !/Generation \d|generation \d|Finding id|bsdf-/.test(fin), (fin.match(/.{0,20}(Generation \d+|generation \d+|Finding id|bsdf-\d+).{0,20}/) || [fin ? '' : 'did not open'])[0]);
			await closeAll(t);
		}
		if (await t.check('Findings lists a delivered finding', await openF('bsdf-0409'))) {
			await panel(f, 'Back Seat Driver finding');
			const pressed = await f.evaluate(() => { const b = [...document.querySelectorAll('aside.drawer button, .drawer-wrap button, [role="dialog"] button')].filter((x) => x.getClientRects().length && x.textContent.trim() === 'Open in chat').pop(); if (!b) return false; b.click(); return true; });
			// its answer is a toast
			const un = pressed ? await f.waitForFunction(() => { const n = [...document.querySelectorAll('body *')].filter((x) => x.children.length < 6 && x.getClientRects().length && /Open in chat is not available/.test(x.textContent) && /toast/i.test(x.className + ' ' + (x.parentElement || {}).className)); return n.length ? n[n.length - 1].closest('[class*="toast"]').textContent.trim() : false; }, null, { timeout: 4000 }).then((h) => h.jsonValue()).catch(() => '') : '';
			await t.check(`"Open in chat" names no command ("${un.slice(0, 120)}")`, !!un && !/cmd\./.test(un), (un.match(/.{0,30}cmd\.\S+.{0,30}/) || [un ? '' : 'no answer seen'])[0]);
			await closeAll(t);
		}
	};
}

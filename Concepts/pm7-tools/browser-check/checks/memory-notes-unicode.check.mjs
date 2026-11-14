// FO-198 (stream F, 2026-11-14): a note written in a non-ASCII script keeps its own identity. On main 87793bb7fd
// the Memory page's duplicate key stripped every non-ASCII character (astra-max-12b A12B-1), so two distinct
// Japanese notes shared one empty key and the second Add silently kept only the first. By real Add clicks, on
// each surface (--set sandbox=0 / 1), through the Settings > Memory page AND the chat's Memory sheet:
// - two distinct Japanese notes are both kept, and search finds the second;
// - two distinct accented Latin notes are both kept;
// - the same Japanese note added twice is deduplicated, with the existing "Memory added" notice;
// - an ASCII pair that differs only in case and punctuation is still deduplicated;
// - an emoji-only note is kept, and a second emoji-only note is not merged into it.
// FO-204 (pm7-build, 2026-11-14): the FO-198 key kept only \p{L}\p{N}, so combining vowel and tone marks (\p{M})
// were stripped and two notes that differ only in marks collapsed into one. The key now keeps \p{M} too. By real Add
// clicks, on each surface, through the page AND the sheet: a Hindi pair that differs only in its vowel mark (सिर / सुर)
// and a Thai pair that differs only in its tone mark (ก่า / ก้า) are each both kept; and one explicit Latin-accent case,
// 'café' then 'cafe', are both kept as distinct notes — the deliberate choice being that NFKC does not strip accents, so
// an accented word and its unaccented spelling are different notes ( accents are identity, not noise ).
// Fails main 87793bb7fd (the Japanese pair and the emoji pair); the FO-204 mark pairs fail 936910536c; passes the fix.
// FO-205 (wonder-max-12h F-1/F-2/F-3, 2026-11-14): the duplicate key keeps symbols (\p{S}: currency, math, emoji)
// beside \p{L}\p{M}\p{N}, and a dash (\p{Pd}) directly before a digit is read as a minus sign (U+2212) and kept.
// By real Add clicks, on each surface, through the page AND the sheet:
// (i) 'Budget is $500' then 'Budget is €500' are both kept; (ii) 'Offset is +5' then 'Offset is -5' are both kept,
// and 'Offset is −5' (U+2212) afterwards keeps one copy of the minus note; (iii) 'Deploy on Friday 🚀' then
// 'Deploy on Friday 🐢' are both kept; (iv) 'Port is 5433' then 'Port is 5434' are both kept (the digit guard,
// which passes on main too); (v) '!!!' added twice and '🚀🚀' added twice each stay one row — an empty key is a
// duplicate only of the very same trimmed NFKC text; (vi) with 'Café résumé' saved, a decomposed query ('cafe' plus
// U+0301) and a full-width query ('ＣＡＦ'), typed with keyboard insertText, each find the note — search compares
// NFKC + lowercase on both sides. Cases (i), (ii), (iii), (v), (vi) fail main 9bfa159274 and 9d225891b9; (iv) passes all.
const WS = 'context-memory';
const BODY = `[data-continuous-workspace-body="${WS}"]`;
const JP1 = '回答は日本語でお願いします。';
const JP2 = 'タイムゾーンは東京です。';
const ACC1 = 'Café au lait';
const ACC2 = 'Crème brûlée';
const ASCII1 = 'Hello, World!';
const ASCII2 = 'hello world';
const EMO1 = '🎉🎊';
const EMO2 = '🚀✨';
const HI1 = 'सिर';
const HI2 = 'सुर';
const TH1 = 'ก่า';
const TH2 = 'ก้า';
const LAT1 = 'café';
const LAT2 = 'cafe';
const CUR1 = 'Budget is $500';
const CUR2 = 'Budget is €500';
const PLUS1 = 'Offset is +5';
const MINUS1 = 'Offset is -5';
const MINUS2 = 'Offset is \u22125';
const SYM1 = 'Deploy on Friday 🚀';
const SYM2 = 'Deploy on Friday 🐢';
const ZWJ1 = 'Role is \u{1F469}\u200D\u{1F4BB}';
const ZWJ2 = 'Role is \u{1F469} \u{1F4BB}';
const FLAG1 = 'Region is \u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}';
const FLAG2 = 'Region is \u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}';
const PORT1 = 'Port is 5433';
const PORT2 = 'Port is 5434';
const PUNCT1 = '!!!';
const EMO3 = '🚀🚀';
const SEARCH1 = 'Café résumé';
const Q_DECOMPOSED = 'cafe\u0301';
const Q_FULLWIDTH = 'ＣＡＦ';

async function settings(t, surface, [w, h] = [1390, 900]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-settings').click()));
	await t.settle();
	await f.evaluate((ws) => PM51.go('memory', ws), WS);
	await f.waitForSelector(`${BODY}[data-workspace-mounted="true"]`, { timeout: 15000 });
	await t.settle();
	await t.page.waitForTimeout(400);
	return f;
}
// Home with the chat on screen, then its Memory button opens the sheet
async function sheet(t, surface, [w, h] = [1390, 900]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-dashboard').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-dashboard').click()));
	await f.waitForFunction(() => !!document.querySelector('#pmRoot .chat-header') && !!document.querySelector('#pmRoot .composer-box[data-k="composer-box"]'), null, { timeout: 30000 });
	await t.settle();
	await t.page.waitForTimeout(600);
	await f.locator('#pmRoot .chat-header .pm7-mem-btn').first().click();
	await f.waitForFunction(() => { const l = document.querySelector('.pm7-mem-layer'); return l && !l.hidden && l.classList.contains('is-open'); }, null, { timeout: 8000 });
	await t.page.waitForTimeout(400);
	return f;
}
const scope = (place) => (place === 'sheet' ? '.pm7-mem-layer:not([hidden]) .pm7-mem-sheet' : BODY);
const dialog = (place) => (place === 'sheet' ? '.pm7-mem-layer:not([hidden]) .pm7-mem-portal .overlay .dialog' : '#pm-settings-portals .overlay .dialog');
// the visible current notes' words, and the page's quiet count
const READ = (place) => {
	const root = document.querySelector(place === 'sheet' ? '.pm7-mem-layer:not([hidden]) .pm7-mem-sheet' : '[data-continuous-workspace-body="context-memory"]');
	if (!root) return null;
	const vis = (x) => !!x && x.getClientRects().length > 0 && getComputedStyle(x).visibility !== 'hidden';
	const rows = [...root.querySelectorAll('.mm-row')].filter(vis).filter((r) => !r.classList.contains('is-archived'));
	return { texts: rows.map((r) => (r.querySelector('.mm-row-text') || {}).textContent || ''), count: ((root.querySelector('.mm-count') || {}).textContent || '').trim() };
};
const read = (f, place) => f.evaluate(READ, place);
// the notice center's titles (and the plain toast stack, when the page draws that instead)
const TOASTS = () => [...document.querySelectorAll('.pmn-toast .pmn-title, #toast-stack .toast-title')].map((x) => x.textContent.trim()).filter(Boolean);
// one real Add: the toolbar button, the dialog's textarea, the dialog's own Add memory button
async function add(t, f, place, text) {
	await f.locator(`${scope(place)} .mm-add`).first().click();
	await f.waitForSelector(dialog(place), { timeout: 8000 });
	await t.page.waitForTimeout(250);
	await f.locator(`${dialog(place)} textarea[name="text"]`).first().fill(text);
	await f.locator(`${dialog(place)} .dialog-footer button[type="submit"]`).first().click();
	await f.waitForSelector(dialog(place), { state: 'detached', timeout: 8000 }).catch(() => {});
	await t.page.waitForTimeout(450);
}
const has = (r, text) => !!r && r.texts.some((x) => x === text);
const times = (r, text) => (r ? r.texts.filter((x) => x === text).length : 0);

// the five cases, in one place (page or sheet)
async function workUnicode(t, f, place, tag) {
	let r = await read(f, place);
	await t.check(`${tag}: the saved notes start from the six seeded ones`, r && r.texts.length === 6, JSON.stringify(r));

	// two distinct Japanese notes: both are kept
	await add(t, f, place, JP1);
	r = await read(f, place);
	await t.check(`${tag}: the first Japanese note is saved`, has(r, JP1) && r.texts.length === 7, JSON.stringify(r));
	await add(t, f, place, JP2);
	r = await read(f, place);
	await t.check(`${tag}: a second, distinct Japanese note is kept beside the first (both exist, eight notes)`, has(r, JP1) && has(r, JP2) && r.texts.length === 8 && (place === 'sheet' || r.count === '8 notes'), JSON.stringify(r));
	// search reaches the second note
	const box = f.locator(`${scope(place)} .mm-search input[type="search"]`).first();
	await box.click();
	await box.fill('タイムゾーン');
	await t.page.waitForTimeout(350);
	r = await read(f, place);
	await t.check(`${tag}: searching the second note’s words finds it`, has(r, JP2) && !has(r, JP1) && r.texts.length === 1, JSON.stringify(r));
	await box.fill('');
	await t.page.waitForTimeout(300);

	// the same Japanese note twice: deduplicated, with the existing notice
	await add(t, f, place, JP1);
	let toasts = await f.evaluate(TOASTS);
	await t.page.waitForTimeout(700);
	toasts = [...new Set([...toasts, ...(await f.evaluate(TOASTS))])];
	r = await read(f, place);
	await t.check(`${tag}: adding the same Japanese note again keeps one copy (still eight notes)`, times(r, JP1) === 1 && has(r, JP2) && r.texts.length === 8 && (place === 'sheet' || r.count === '8 notes'), JSON.stringify(r));
	await t.check(`${tag}: the duplicate add answers with the existing “Memory added” notice`, toasts.includes('Memory added'), JSON.stringify(toasts));

	// two distinct accented Latin notes: both are kept
	await add(t, f, place, ACC1);
	await add(t, f, place, ACC2);
	r = await read(f, place);
	await t.check(`${tag}: two distinct accented notes are both kept (ten notes)`, has(r, ACC1) && has(r, ACC2) && r.texts.length === 10, JSON.stringify(r));

	// an ASCII pair differing only in case and punctuation: still deduplicated
	await add(t, f, place, ASCII1);
	r = await read(f, place);
	await t.check(`${tag}: the ASCII note is saved (eleven notes)`, has(r, ASCII1) && r.texts.length === 11, JSON.stringify(r));
	await add(t, f, place, ASCII2);
	toasts = await f.evaluate(TOASTS);
	await t.page.waitForTimeout(700);
	toasts = [...new Set([...toasts, ...(await f.evaluate(TOASTS))])];
	r = await read(f, place);
	await t.check(`${tag}: the same ASCII words in other case and punctuation stay one note (still eleven)`, times(r, ASCII1) === 1 && !has(r, ASCII2) && r.texts.length === 11 && (place === 'sheet' || r.count === '11 notes'), JSON.stringify(r));
	await t.check(`${tag}: the ASCII duplicate answers with the existing “Memory added” notice`, toasts.includes('Memory added'), JSON.stringify(toasts));

	// emoji-only notes: kept, and never merged with one another
	await add(t, f, place, EMO1);
	r = await read(f, place);
	await t.check(`${tag}: an emoji-only note is kept (twelve notes)`, has(r, EMO1) && r.texts.length === 12, JSON.stringify(r));
	await add(t, f, place, EMO2);
	r = await read(f, place);
	await t.check(`${tag}: a second emoji-only note is kept beside the first, not merged into it (thirteen notes)`, has(r, EMO1) && has(r, EMO2) && r.texts.length === 13 && (place === 'sheet' || r.count === '13 notes'), JSON.stringify(r));
}

// FO-204: notes that differ only in combining marks keep their own identity, in one place (page or sheet).
// The Latin-accent case names the choice: NFKC does not strip accents, so 'café' and 'cafe' are deliberately
// distinct notes — accents are identity, not noise.
async function workMarks(t, f, place, tag) {
	let r = await read(f, place);
	await t.check(`${tag}: the saved notes start from the six seeded ones`, r && r.texts.length === 6, JSON.stringify(r));

	// the Hindi pair differs only in its vowel mark (ि vs ु): both are kept
	await add(t, f, place, HI1);
	r = await read(f, place);
	await t.check(`${tag}: the first Hindi note is saved (seven notes)`, has(r, HI1) && r.texts.length === 7, JSON.stringify(r));
	await add(t, f, place, HI2);
	r = await read(f, place);
	await t.check(`${tag}: the Hindi note with the other vowel mark is kept beside the first, not merged (eight notes)`, has(r, HI1) && has(r, HI2) && r.texts.length === 8 && (place === 'sheet' || r.count === '8 notes'), JSON.stringify(r));
	// the very same note again still deduplicates (keeping marks must not break identity)
	await add(t, f, place, HI1);
	const toasts = await f.evaluate(TOASTS);
	await t.page.waitForTimeout(700);
	r = await read(f, place);
	await t.check(`${tag}: the same Hindi note again keeps one copy (still eight notes)`, times(r, HI1) === 1 && has(r, HI2) && r.texts.length === 8, JSON.stringify(r));
	await t.check(`${tag}: the duplicate Hindi add answers with the existing “Memory added” notice`, [...new Set([...toasts, ...(await f.evaluate(TOASTS))])].includes('Memory added'), JSON.stringify(toasts));

	// the Thai pair differs only in its tone mark (่ vs ้): both are kept
	await add(t, f, place, TH1);
	r = await read(f, place);
	await t.check(`${tag}: the first Thai note is saved (nine notes)`, has(r, TH1) && r.texts.length === 9, JSON.stringify(r));
	await add(t, f, place, TH2);
	r = await read(f, place);
	await t.check(`${tag}: the Thai note with the other tone mark is kept beside the first, not merged (ten notes)`, has(r, TH1) && has(r, TH2) && r.texts.length === 10 && (place === 'sheet' || r.count === '10 notes'), JSON.stringify(r));

	// the Latin-accent case: NFKC keeps accents, so 'café' and 'cafe' are distinct notes by choice
	await add(t, f, place, LAT1);
	r = await read(f, place);
	await t.check(`${tag}: the accented Latin note is saved (eleven notes)`, has(r, LAT1) && r.texts.length === 11, JSON.stringify(r));
	await add(t, f, place, LAT2);
	r = await read(f, place);
	await t.check(`${tag}: the unaccented spelling is kept as its own note — NFKC does not strip accents (twelve notes)`, has(r, LAT1) && has(r, LAT2) && r.texts.length === 12 && (place === 'sheet' || r.count === '12 notes'), JSON.stringify(r));
}

// FO-205 (i)-(iii): notes that differ only in a symbol keep their own identity, in one place (page or sheet).
// A dash directly before a digit is a minus sign, so the ASCII-hyphen and U+2212 spellings of the same minus
// note are one note, while the plus and minus notes are two.
async function workSymbols(t, f, place, tag) {
	let r = await read(f, place);
	await t.check(`${tag}: the saved notes start from the six seeded ones`, r && r.texts.length === 6, JSON.stringify(r));

	// (i) two notes that differ only in their currency symbol: both are kept
	await add(t, f, place, CUR1);
	r = await read(f, place);
	await t.check(`${tag}: (i) the first currency note is saved (seven notes)`, has(r, CUR1) && r.texts.length === 7, JSON.stringify(r));
	await add(t, f, place, CUR2);
	r = await read(f, place);
	await t.check(`${tag}: (i) the note with the other currency symbol is kept beside the first (eight notes)`, has(r, CUR1) && has(r, CUR2) && r.texts.length === 8 && (place === 'sheet' || r.count === '8 notes'), JSON.stringify(r));

	// (ii) the plus and minus notes are distinct; the same minus written with U+2212 keeps one copy
	await add(t, f, place, PLUS1);
	r = await read(f, place);
	await t.check(`${tag}: (ii) the plus note is saved (nine notes)`, has(r, PLUS1) && r.texts.length === 9, JSON.stringify(r));
	await add(t, f, place, MINUS1);
	r = await read(f, place);
	await t.check(`${tag}: (ii) the minus note is kept beside the plus note (ten notes)`, has(r, PLUS1) && has(r, MINUS1) && r.texts.length === 10, JSON.stringify(r));
	await add(t, f, place, MINUS2);
	r = await read(f, place);
	await t.check(`${tag}: (ii) the minus note written with U+2212 keeps one copy of the minus note (still ten notes)`, has(r, PLUS1) && times(r, MINUS1) === 1 && !has(r, MINUS2) && r.texts.length === 10 && (place === 'sheet' || r.count === '10 notes'), JSON.stringify(r));

	// (iii) two notes that differ only in their emoji: both are kept
	await add(t, f, place, SYM1);
	r = await read(f, place);
	await t.check(`${tag}: (iii) the first emoji note is saved (eleven notes)`, has(r, SYM1) && r.texts.length === 11, JSON.stringify(r));
	await add(t, f, place, SYM2);
	r = await read(f, place);
	await t.check(`${tag}: (iii) the note with the other emoji is kept beside the first (twelve notes)`, has(r, SYM1) && has(r, SYM2) && r.texts.length === 12 && (place === 'sheet' || r.count === '12 notes'), JSON.stringify(r));
}

// FO-205 (iv): the digit guard — the key keeps numbers, so two notes that differ only in a digit are both kept.
// FO-205 round 2 (vii) and round 3 (viii), in the same test: a zero-width joiner and the invisible flag tag characters
// are kept in the key, so a joined emoji and each tag-sequence flag are their own notes.
async function workDigits(t, f, place, tag) {
	let r = await read(f, place);
	await t.check(`${tag}: the saved notes start from the six seeded ones`, r && r.texts.length === 6, JSON.stringify(r));
	await add(t, f, place, PORT1);
	r = await read(f, place);
	await t.check(`${tag}: (iv) the first port note is saved (seven notes)`, has(r, PORT1) && r.texts.length === 7, JSON.stringify(r));
	await add(t, f, place, PORT2);
	r = await read(f, place);
	await t.check(`${tag}: (iv) the note with the other port number is kept beside the first (eight notes)`, has(r, PORT1) && has(r, PORT2) && r.texts.length === 8 && (place === 'sheet' || r.count === '8 notes'), JSON.stringify(r));

	// (vii) FO-205 round 2: a zero-width joiner is part of the note. 'woman + joiner + laptop' is one emoji, so the
	// same words with the two emoji apart are a different note, and both are kept.
	await add(t, f, place, ZWJ1);
	r = await read(f, place);
	await t.check(`${tag}: (vii) the note with a joined emoji is saved (nine notes)`, has(r, ZWJ1) && r.texts.length === 9, JSON.stringify(r));
	await add(t, f, place, ZWJ2);
	r = await read(f, place);
	await t.check(`${tag}: (vii) the same words with the two emoji apart are kept beside it (ten notes)`, has(r, ZWJ1) && has(r, ZWJ2) && r.texts.length === 10 && (place === 'sheet' || r.count === '10 notes'), JSON.stringify(r));

	// (viii) FO-205 round 3: two flags that differ only in their invisible tag characters (England, Scotland) are
	// two notes, and both are kept.
	await add(t, f, place, FLAG1);
	r = await read(f, place);
	await t.check(`${tag}: (viii) the note with the first tag-sequence flag is saved (eleven notes)`, has(r, FLAG1) && r.texts.length === 11, JSON.stringify(r));
	await add(t, f, place, FLAG2);
	r = await read(f, place);
	await t.check(`${tag}: (viii) the note with the other tag-sequence flag is kept beside it (twelve notes)`, has(r, FLAG1) && has(r, FLAG2) && r.texts.length === 12 && (place === 'sheet' || r.count === '12 notes'), JSON.stringify(r));
}

// FO-205 (v): an empty key is a duplicate only of the very same trimmed NFKC text, so identical punctuation-only
// or emoji-only notes stay one row instead of multiplying.
async function workEmptyKey(t, f, place, tag) {
	let r = await read(f, place);
	await t.check(`${tag}: the saved notes start from the six seeded ones`, r && r.texts.length === 6, JSON.stringify(r));

	await add(t, f, place, PUNCT1);
	r = await read(f, place);
	await t.check(`${tag}: (v) a punctuation-only note is saved (seven notes)`, has(r, PUNCT1) && times(r, PUNCT1) === 1 && r.texts.length === 7, JSON.stringify(r));
	await add(t, f, place, PUNCT1);
	let toasts = await f.evaluate(TOASTS);
	await t.page.waitForTimeout(700);
	toasts = [...new Set([...toasts, ...(await f.evaluate(TOASTS))])];
	r = await read(f, place);
	await t.check(`${tag}: (v) the same punctuation-only note again keeps one copy (still seven notes)`, times(r, PUNCT1) === 1 && r.texts.length === 7 && (place === 'sheet' || r.count === '7 notes'), JSON.stringify(r));
	await t.check(`${tag}: (v) the duplicate punctuation-only add answers with the existing “Memory added” notice`, toasts.includes('Memory added'), JSON.stringify(toasts));

	await add(t, f, place, EMO3);
	r = await read(f, place);
	await t.check(`${tag}: (v) an emoji-only note is saved beside it (eight notes)`, has(r, PUNCT1) && has(r, EMO3) && r.texts.length === 8, JSON.stringify(r));
	await add(t, f, place, EMO3);
	r = await read(f, place);
	await t.check(`${tag}: (v) the same emoji-only note again keeps one copy (still eight notes)`, times(r, EMO3) === 1 && has(r, PUNCT1) && r.texts.length === 8 && (place === 'sheet' || r.count === '8 notes'), JSON.stringify(r));
}

// FO-205 (vi): search compares NFKC + lowercase on both sides, so a decomposed or a full-width query finds a
// composed note. The queries go in through the keyboard (insertText), as typed.
async function workSearch(t, f, place, tag) {
	let r = await read(f, place);
	await t.check(`${tag}: the saved notes start from the six seeded ones`, r && r.texts.length === 6, JSON.stringify(r));
	await add(t, f, place, SEARCH1);
	r = await read(f, place);
	await t.check(`${tag}: (vi) the accented note is saved (seven notes)`, has(r, SEARCH1) && r.texts.length === 7, JSON.stringify(r));

	const box = f.locator(`${scope(place)} .mm-search input[type="search"]`).first();
	await box.click();
	await box.fill('');
	await t.page.keyboard.insertText(Q_DECOMPOSED);
	await t.page.waitForTimeout(350);
	r = await read(f, place);
	await t.check(`${tag}: (vi) a decomposed query (cafe + U+0301) finds the composed note (one row)`, has(r, SEARCH1) && r.texts.length === 1, JSON.stringify(r));
	await box.fill('');
	await t.page.waitForTimeout(300);
	await box.click();
	await t.page.keyboard.insertText(Q_FULLWIDTH);
	await t.page.waitForTimeout(350);
	r = await read(f, place);
	await t.check(`${tag}: (vi) a full-width query (ＣＡＦ) finds the note (one row)`, has(r, SEARCH1) && r.texts.length === 1, JSON.stringify(r));
	await box.fill('');
	await t.page.waitForTimeout(300);
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };

	T('FO-198 the Memory page keeps distinct non-ASCII notes', async (t) => {
		const f = await settings(t, surface);
		await workUnicode(t, f, 'page', 'Settings › Memory');
	});

	T('FO-198 the chat’s Memory sheet keeps distinct non-ASCII notes', async (t) => {
		const f = await sheet(t, surface);
		await workUnicode(t, f, 'sheet', 'the chat’s Memory sheet');
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(400);
	});

	T('FO-204 the Memory page keeps notes that differ only in combining marks', async (t) => {
		const f = await settings(t, surface);
		await workMarks(t, f, 'page', 'Settings › Memory');
	});

	T('FO-204 the chat’s Memory sheet keeps notes that differ only in combining marks', async (t) => {
		const f = await sheet(t, surface);
		await workMarks(t, f, 'sheet', 'the chat’s Memory sheet');
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(400);
	});

	T('FO-205 the Memory page keeps notes that differ only in a symbol', async (t) => {
		const f = await settings(t, surface);
		await workSymbols(t, f, 'page', 'Settings › Memory');
	});

	T('FO-205 the chat’s Memory sheet keeps notes that differ only in a symbol', async (t) => {
		const f = await sheet(t, surface);
		await workSymbols(t, f, 'sheet', 'the chat’s Memory sheet');
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(400);
	});

	T('FO-205 the Memory page keeps notes that differ only in a digit', async (t) => {
		const f = await settings(t, surface);
		await workDigits(t, f, 'page', 'Settings › Memory');
	});

	T('FO-205 the chat’s Memory sheet keeps notes that differ only in a digit', async (t) => {
		const f = await sheet(t, surface);
		await workDigits(t, f, 'sheet', 'the chat’s Memory sheet');
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(400);
	});

	T('FO-205 the Memory page keeps one row for identical empty-key notes', async (t) => {
		const f = await settings(t, surface);
		await workEmptyKey(t, f, 'page', 'Settings › Memory');
	});

	T('FO-205 the chat’s Memory sheet keeps one row for identical empty-key notes', async (t) => {
		const f = await sheet(t, surface);
		await workEmptyKey(t, f, 'sheet', 'the chat’s Memory sheet');
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(400);
	});

	T('FO-205 the Memory page search normalises the query', async (t) => {
		const f = await settings(t, surface);
		await workSearch(t, f, 'page', 'Settings › Memory');
	});

	T('FO-205 the chat’s Memory sheet search normalises the query', async (t) => {
		const f = await sheet(t, surface);
		await workSearch(t, f, 'sheet', 'the chat’s Memory sheet');
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(400);
	});
}

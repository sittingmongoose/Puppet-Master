// Tools T-191 (Jared, 2026-11-24: "is code mode an option in settings that can be turned off? If not, it needs to
// be."): the inventory row code.execution.code-mode is an ordinary Settings row. By real typing and real clicks:
// Settings Search for "Code Mode" lists a result named Code Mode; the result opens a page whose row holds the
// inventory's label and sentence as text that passes the computed visibility and box checks (not a reading of the
// words' ink) and one switch; the switch starts On (the inventory default), a click turns it Off,
// and a second click turns it On again. In each of the three states the switch itself has to be shown (opacity-aware
// computed visibility, box inside the window and inside the outer box of every ancestor that clips by overflow, to within a pixel), really paint (its pixels differ from the
// same spot with the switch hidden, and again with only its knob hidden, so a switch or knob that paints nothing fails),
// carry the row's label as its computed accessible name (found by role and name, not by reading aria-label), and be
// drawn in the state aria-checked reports (the .on class, the knob's centre on the far or near half of the track by
// its styles, and the knob's ink at that end of the track in the picture, so a mirrored switch fails); Off also has to survive leaving the row and finding it again by Search, and the On and Off pictures differ.
// Judged from the row's own markup (data-setting-id / data-setting), never from a position on the page.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-code-mode-row.check.mjs --set page=<build>
// --set size=1440x900 changes the window. --set shots=basic-light,basic-dark also takes one picture of the row among
// its neighbours in each named look (picked through Settings' own Theme rows, after the switch is back On), for the
// by-eye comparison of switch and spacing; it asserts only that the look named is the one painted.
import { readFileSync } from 'node:fs';
import { setLookBySetting, guardPaintedLook } from '../helpers/settings-look.mjs';

const ID = 'code.execution.code-mode';
/* the inventory row itself: the label and the complete sentence the page has to draw */
const INV = JSON.parse(readFileSync(new URL('../../../../Plans/settings_inventory.json', import.meta.url), 'utf8')).settings.find((s) => s.id === ID);
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
/* Tools T-191 fixes the spelling: "a toggle labelled Code Mode". The inventory is checked against that first, so the
   page comparisons below cannot pass on an inventory that itself says "Code mode" (max review). */
const CANON_LABEL = 'Code Mode';
/* Code Mode is a fixed phrase (Settings_System §4 keeps those through sentence case), so the page draws the
   inventory label exactly, case-sensitive, after whitespace is normalized; "Code mode" fails (review 5) */
const sameLabel = (drawn) => norm(drawn) === norm(INV.label);
const ROW = ([id, label, desc]) => {
	const sw = [...document.querySelectorAll(`.toggle[role="switch"][data-setting="${id}"], [data-setting-id="${id}"] .toggle[role="switch"]`)]
		.find((el) => el.getClientRects().length && el.checkVisibility());
	if (!sw) return { drawn: false, known: [...document.querySelectorAll(`[data-setting-id="${id}"], [data-setting="${id}"]`)].length };
	const row = sw.closest(`[data-setting-id="${id}"]`) || sw.closest('.setting-row, .pm51-row, .o55-scoped, li, tr') || sw.parentElement;
	const r = sw.getBoundingClientRect();
	const lines = (row.innerText || '').split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
	/* shown, not only present: the innermost element that holds exactly these words passes the computed visibility
	   checks, has a box, and lies inside the window and inside every ancestor that clips or scrolls (review 3: innerText
	   also returns clipped text). This is geometry and computed style, not a pixel reading of the words' ink. */
	const holder = (words) => [...row.querySelectorAll('*')].filter((el) => (el.innerText || '').replace(/\s+/g, ' ').trim() === words).pop();
	const shown = (el) => {
		if (!el || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) return false;
		const b = el.getBoundingClientRect();
		if (b.width < 1 || b.height < 1 || b.top < 0 || b.left < 0 || b.bottom > innerHeight || b.right > innerWidth) return false;
		/* the element may cut off its own words (ellipsis, line clamp): innerText still returns them all (review 8) */
		const own = getComputedStyle(el);
		if (/hidden|clip|auto|scroll/.test(own.overflowX + ' ' + own.overflowY) && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) return false;
		for (let a = el.parentElement; a; a = a.parentElement) {
			const cs = getComputedStyle(a);
			if (!/hidden|clip|auto|scroll/.test(cs.overflowX + ' ' + cs.overflowY)) continue;
			const c = a.getBoundingClientRect();
			if (b.top < c.top - 1 || b.bottom > c.bottom + 1 || b.left < c.left - 1 || b.right > c.right + 1) return false;
		}
		return true;
	};
	/* the switch as drawn: shown like the words are, named, and painted in the state it reports. The knob (::after) sits
	   at its start when Off and is moved along the track when On; the .on class is what the styles key on. */
	const kcs = getComputedStyle(sw, '::after');
	const knob = kcs.transform;
	const knobX = knob && knob !== 'none' ? Math.round(new DOMMatrixReadOnly(knob).m41) : 0;
	/* where the knob's centre sits along the track, from its own box (left, width) and its shift; the track's middle
	   is the line between "at the start" and "moved across" */
	const knobCentre = (parseFloat(kcs.left) || 0) + (parseFloat(kcs.width) || 0) / 2 + knobX;
	const knobStyled = kcs.content !== 'none' && kcs.display !== 'none' && kcs.visibility === 'visible' && Number(kcs.opacity) > 0.5 && parseFloat(kcs.width) >= 6 && parseFloat(kcs.height) >= 6;
	return { drawn: true, checked: sw.getAttribute('aria-checked'), lines: lines.slice(0, 12), text: lines.join(' ').slice(0, 600),
		labelShown: shown(holder(label)), descShown: shown(holder(desc)),
		switchShown: shown(sw) && Number(getComputedStyle(sw).opacity) > 0.5 && r.width >= 16 && r.height >= 10,
		onClass: sw.classList.contains('on'), knobX, knobCentre: Math.round(knobCentre * 10) / 10, trackMid: Math.round(r.width / 2 * 10) / 10, knobStyled,
		/* the setting's own value, read back from Settings, not from the switch's markup */
		stored: (typeof PM51 !== 'undefined' && PM51 && typeof PM51.value === 'function') ? PM51.value(id) : 'unreadable',
		switches: row.querySelectorAll('[role="switch"]').length, inView: r.top >= 0 && r.bottom <= innerHeight, at: [Math.round(r.left), Math.round(r.top)] };
};

export default async function (t) {
	const [w, h] = String(t.args.size || '1440x900').split('x').map(Number);
	const f = await t.app.open();
	await t.emulate({ reducedMotion: 'no-preference' });
	await t.viewport(w, h);
	await f.locator('#tab-settings').click();
	await t.settle();

	const SW = `.toggle[role="switch"][data-setting="${ID}"]:visible, [data-setting-id="${ID}"] .toggle[role="switch"]:visible`;
	/* find the row the way a person does: type its name into Settings Search and open the result named for it */
	const findBySearch = async () => {
		const input = f.locator('#pm-settings-root [data-global-search]:visible').first();
		await input.click();
		await input.fill('');
		await input.type('Code Mode', { delay: 15 });
		const results = f.locator('.search-results[data-mode="rail"] .search-result');
		await results.first().waitFor({ state: 'visible', timeout: 5000 });
		/* a result's name is its first drawn line; the lines under it are where it lives and its help */
		const titles = await results.evaluateAll((els) => els.map((el) => ((el.innerText || '').split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)[0] || '')));
		const at = titles.findIndex(sameLabel);
		if (at < 0) return { at, titles };
		await results.nth(at).click();
		await t.settle();
		await t.page.waitForTimeout(900);
		await f.locator(SW).first().evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })).catch(() => {});
		await t.page.waitForTimeout(400);
		return { at, titles };
	};
	const read = () => f.evaluate(ROW, [ID, norm(INV.label), norm(INV.desc)]);
	/* three pictures of the switch's own box, pointer parked away and motion settled: as drawn, with the switch hidden,
	   and with only its knob (::after) hidden. Byte-equal pictures mean the hidden part painted nothing. */
	const paint = async () => {
		/* a handle to the element itself: the locator asks for a visible switch and would lose it once hidden */
		const el = await f.locator(SW).first().elementHandle();
		await t.page.mouse.move(4, 4);
		await t.page.waitForTimeout(700);
		const b = await el.boundingBox();
		const clip = { x: Math.floor(b.x), y: Math.floor(b.y), width: Math.ceil(b.width), height: Math.ceil(b.height) };
		const drawn = await t.page.screenshot({ clip });
		/* the two ends of the track, a third each: where the knob's ink is, read from the picture, not from styles */
		const third = Math.floor(clip.width / 3);
		const startClip = { x: clip.x, y: clip.y, width: third, height: clip.height };
		const endClip = { x: clip.x + clip.width - third, y: clip.y, width: third, height: clip.height };
		const drawnStart = await t.page.screenshot({ clip: startClip });
		const drawnEnd = await t.page.screenshot({ clip: endClip });
		let noSwitch, noKnob, noKnobStart, noKnobEnd;
		/* let each style change reach the screen before it is photographed: two frames, then a short rest (a picture
		   taken in the same frame as the change once showed the switch still hidden, a false stop) */
		const painted = async () => { await el.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); await t.page.waitForTimeout(120); };
		/* remember the switch's own inline visibility exactly, and keep a handle to the one style node added */
		const before = await el.evaluate((node) => [node.style.getPropertyValue('visibility'), node.style.getPropertyPriority('visibility')]);
		let knobOff = null;
		try {
			await el.evaluate((node) => node.style.setProperty('visibility', 'hidden', 'important'));
			await painted();
			noSwitch = await t.page.screenshot({ clip });
			await el.evaluate((node, [v, pr]) => { if (v) node.style.setProperty('visibility', v, pr); else node.style.removeProperty('visibility'); }, before);
			/* mark the very switch being read, whichever attribute found it, and hide the knob of the marked one */
			knobOff = await el.evaluateHandle((node) => {
				node.setAttribute('data-cm-row-check-knob-off', '');
				const st = document.createElement('style');
				st.textContent = '[data-cm-row-check-knob-off]::after { visibility: hidden !important; }';
				document.head.appendChild(st);
				return st;
			});
			await painted();
			noKnob = await t.page.screenshot({ clip });
			noKnobStart = await t.page.screenshot({ clip: startClip });
			noKnobEnd = await t.page.screenshot({ clip: endClip });
		} finally {
			/* always put the page back exactly as it was */
			await el.evaluate((node, [v, pr]) => { if (v) node.style.setProperty('visibility', v, pr); else node.style.removeProperty('visibility'); }, before).catch(() => {});
			if (knobOff) await knobOff.evaluate((st) => st.remove()).catch(() => {});
			await el.evaluate((node) => node.removeAttribute('data-cm-row-check-knob-off')).catch(() => {});
		}
		/* the knob is painted at the end of the track where hiding it changes the picture */
		const atStart = !drawnStart.equals(noKnobStart), atEnd = !drawnEnd.equals(noKnobEnd);
		return { drawn, noSwitch, noKnob, knobPainted: atStart && !atEnd ? 'start' : atEnd && !atStart ? 'end' : atStart && atEnd ? 'both ends' : 'neither end' };
	};
	/* one state, judged whole: reported, shown, named and drawn alike */
	const judge = async (when, row, on) => {
		await t.check(`${when}: aria-checked says ${on ? 'On' : 'Off'}`, row.drawn === true && row.checked === String(on), JSON.stringify(row));
		if (!row.drawn) return;
		await t.check(`${when}: the row still has exactly one switch`, row.switches === 1, String(row.switches));
		await t.check(`${when}: the setting's own value, read back from Settings, is ${on}`, row.stored === on, `PM51.value: ${JSON.stringify(row.stored)}`);
		/* the computed accessible name: the switch for this setting is among the switches Chrome names "Code Mode"
		   (aria-labelledby would win over aria-label, so the attribute alone is not read) */
		/* the same node, not a namesake: exactly one visible switch for this setting in the frame, and that one is
		   also the switch found by role and name */
		const all = await f.locator(SW).count();
		const named = await f.getByRole('switch', { name: CANON_LABEL, exact: true }).and(f.locator(SW)).count();
		await t.check(`${when}: the switch's computed accessible name is the inventory label`, INV.label === CANON_LABEL && all === 1 && named === 1, `visible switches for ${ID}: ${all}; of them with the role switch and the name "${CANON_LABEL}": ${named}`);
		await t.check(`${when}: the switch itself is shown (opacity-aware visibility, box inside the window and inside the outer box of every ancestor that clips by overflow, to within a pixel)`, row.switchShown === true, JSON.stringify(row));
		const pic = await paint();
		await t.check(`${when}: the switch paints: its pixels differ from the same spot with the switch hidden`, !pic.drawn.equals(pic.noSwitch), `${pic.drawn.length} and ${pic.noSwitch.length} bytes`);
		await t.check(`${when}: with the knob hidden the switch still paints something: the pixels differ from the same spot with the whole switch hidden`, !pic.noKnob.equals(pic.noSwitch), `${pic.noKnob.length} and ${pic.noSwitch.length} bytes`);
		await t.check(`${when}: the knob paints: the pixels differ from the same spot with only the knob hidden`, row.knobStyled === true && !pic.drawn.equals(pic.noKnob), `knob styled ${row.knobStyled}`);
		await t.check(`${when}: the switch is drawn ${on ? 'On' : 'Off'}, as aria-checked says (the .on class, and the knob's centre ${on ? 'past' : 'short of'} the middle of the track)`, row.onClass === on && (on ? row.knobCentre > row.trackMid + 2 : row.knobCentre < row.trackMid - 2), `class on ${row.onClass}, knob centre ${row.knobCentre} of a track whose middle is ${row.trackMid}`);
		await t.check(`${when}: the knob's ink is at the ${on ? 'far' : 'near'} end of the track in the picture (a mirrored switch, or a knob at the wrong end, fails here; it does not measure where the switch sits in its row)`, pic.knobPainted === (on ? 'end' : 'start'), `hiding the knob changed the picture at: ${pic.knobPainted}`);
		return pic.drawn;
	};

	await t.check('the inventory row\'s label is spelled as Tools T-191 fixes it, "Code Mode"', INV && INV.label === CANON_LABEL, String(INV && INV.label));
	const found = await findBySearch();
	t.log(`Settings Search "Code Mode" lists results named: ${found.titles.slice(0, 8).join(' | ')}`);
	await t.check('Settings Search for "Code Mode" lists a result whose name is the inventory label', found.at >= 0, found.titles.slice(0, 8).join(' | '));
	if (found.at < 0) return;

	let row = await read();
	t.log(`after the search: ${JSON.stringify(row)}`);
	await t.check('the result opens a page that draws the Code Mode row with a switch', row.drawn === true, JSON.stringify(row));
	if (!row.drawn) return;
	await t.check('the row\'s first line is the inventory label', sameLabel(row.lines[0]), JSON.stringify(row.lines));
	await t.check('the row holds the inventory\'s complete sentence, as one of its lines', row.lines.includes(norm(INV.desc)), JSON.stringify(row.lines));
	await t.check('the label and the complete sentence pass the computed visibility checks, and their boxes fit inside the window and inside the outer box of every ancestor that clips or scrolls by overflow, to within a pixel', row.labelShown === true && row.descShown === true, `label ${row.labelShown}, sentence ${row.descShown}`);
	await t.check('the row has exactly one switch', row.switches === 1, String(row.switches));
	await t.check('the inventory row\'s default is On', INV.default === true, JSON.stringify(INV.default));
	const onPic = await judge('at first, the inventory default', row, INV.default === true);

	await f.locator(SW).first().click();
	await t.settle();
	await t.page.waitForTimeout(900);
	const offPic = await judge('after one click', await read(), false);
	await t.check('the Off picture of the switch differs from the On picture', !!onPic && !!offPic && !onPic.equals(offPic), 'compared the two pictures of the switch\'s box');

	/* Off is kept, not only painted: leave the row for Settings Home, find it again by Search, and it is still Off */
	await f.locator('#pm-settings-root [data-action="home"]:visible').first().click();
	await t.settle();
	await t.page.waitForTimeout(600);
	await t.check('after the click on Settings Home the row is no longer drawn', (await read()).drawn === false, JSON.stringify(await read()));
	const again = await findBySearch();
	await t.check('Search finds the row again after leaving it', again.at >= 0, again.titles.slice(0, 8).join(' | '));
	await judge('found again after leaving the row', await read(), false);

	await f.locator(SW).first().click();
	await t.settle();
	await t.page.waitForTimeout(900);
	const onAgain = await judge('after a second click', await read(), true);
	await t.check('the second On picture of the switch differs from the Off picture', !!onAgain && !!offPic && !onAgain.equals(offPic), 'compared the two pictures of the switch\'s box');

	for (const look of (t.args.shots ? String(t.args.shots).split(',').filter(Boolean) : [])) {
		await setLookBySetting(t, f, look);
		const again = await findBySearch();
		await t.page.waitForTimeout(800);
		/* the picture is of the row: Search found it in this look and it is drawn, or there is nothing to look at */
		const there = again.at >= 0 ? await read() : { drawn: false };
		await t.check(`${look}: Search finds the row in this look and it is drawn, before its picture is taken`, again.at >= 0 && there.drawn === true, again.titles.slice(0, 8).join(' | '));
		if (!(again.at >= 0 && there.drawn === true)) continue;
		await guardPaintedLook(t, f, look, `${look}: before the picture`);
		await t.shot(`code-mode-row-${look}`, `${look}: the Code Mode row among its neighbours: the same switch, the same row height and spacing, label and sentence readable`);
	}
}

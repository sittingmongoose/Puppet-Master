// Required behaviour: when an Activity bar item's side panel is not showing, one real mouse click on that item shows
// that item's own panel in the side panel area (right of the strip, ~240 px wide), the item reports
// aria-expanded="true" and the other eight items report aria-expanded="false". Checked for each of the nine items,
// from two starting states: another item's panel showing, and the side panel area collapsed.

// Activity bar control id -> the side panel that item owns.
const ITEMS = [
	{ name: 'Files', id: 'activity.files', panel: 'panel-files' },
	{ name: 'Search', id: 'activity.search', panel: 'panel-search' },
	{ name: 'Source', id: 'activity.source', panel: 'panel-source' },
	{ name: 'Pipelines', id: 'activity.repository_automation', panel: 'panel-git' },
	{ name: 'Docker', id: 'activity.docker', panel: 'panel-docker' },
	{ name: 'Tests', id: 'activity.testing', panel: 'panel-testing' },
	{ name: 'Debug', id: 'activity.run', panel: 'panel-run' },
	{ name: 'Agents', id: 'activity.agents', panel: 'panel-agents' },
	{ name: 'Artifacts', id: 'activity.artifacts', panel: 'panel-artifacts' },
];

// What occupies the side panel area right now: hit tests on a 3x3 grid inside the area right of the strip.
async function sideArea(t) {
	return t.page.evaluate((panelIds) => {
		const bar = document.querySelector('.activity-bar');
		const barRight = bar ? bar.getBoundingClientRect().right : 36;
		const top = bar ? bar.getBoundingClientRect().top : 40;
		const h = window.innerHeight;
		const owner = (el) => { for (let p = el; p; p = p.parentElement) if (p.id && panelIds.includes(p.id)) return p.id; return null; };
		const hits = [];
		for (const fy of [0.2, 0.5, 0.8]) for (const dx of [30, 120, 210]) {
			const x = barRight + dx, y = top + (h - top) * fy;
			const el = document.elementFromPoint(x, y);
			hits.push({ x: Math.round(x), y: Math.round(y), panel: el ? owner(el) : null,
				el: el ? el.tagName + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : '') : 'none' });
		}
		const rects = {};
		for (const id of panelIds) {
			const el = document.getElementById(id);
			if (!el) { rects[id] = null; continue; }
			const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
			rects[id] = { left: r.left, width: r.width, height: r.height, display: cs.display, visibility: cs.visibility, opacity: cs.opacity };
		}
		return { barRight, hits, rects };
	}, ITEMS.map((i) => i.panel));
}

async function expandedStates(t) {
	const out = {};
	for (const it of ITEMS) out[it.name] = await (await t.app.byId(it.id)).getAttribute('aria-expanded');
	return out;
}

// Is `item`'s own panel what shows in the side panel area?
function panelShows(area, item) {
	const r = area.rects[item.panel];
	const allHits = area.hits.every((h) => h.panel === item.panel);
	const sized = !!r && r.width >= 180 && r.width <= 320 && r.height > 200 && r.display !== 'none'
		&& r.visibility !== 'hidden' && Number(r.opacity) > 0.5 && Math.abs(r.left - area.barRight) <= 16;
	return { ok: allHits && sized, allHits, sized, r };
}

async function verifyAfterClick(t, item, label) {
	const btn = await t.app.byId(item.id);
	// Wait for the state the click should produce, then let animations finish and judge the resting state.
	await t.page.waitForFunction((id) => {
		const el = document.querySelector(`[data-ui-element-id="${id}"]`);
		return el && el.getAttribute('aria-expanded') === 'true';
	}, item.id, { timeout: 5000 }).catch(() => {});
	await t.settle();

	await t.equal(`${label}: ${item.name} reports aria-expanded="true"`, await btn.getAttribute('aria-expanded'), 'true');
	await t.equal(`${label}: ${item.name} aria-controls names its own panel`, await btn.getAttribute('aria-controls'), item.panel);

	const states = await expandedStates(t);
	const wrong = ITEMS.filter((o) => o !== item && states[o.name] !== 'false').map((o) => `${o.name}=${states[o.name]}`);
	await t.check(`${label}: the other eight items report aria-expanded="false"`, wrong.length === 0, `not "false": ${wrong.join(', ')}`);

	const area = await sideArea(t);
	const res = panelShows(area, item);
	const others = area.hits.filter((h) => h.panel !== item.panel).map((h) => `${h.x},${h.y}→${h.panel || h.el}`);
	await t.check(`${label}: #${item.panel} shows in the side panel area`, res.ok,
		`hits not in #${item.panel}: [${others.join('; ')}]; panel box ${JSON.stringify(res.r)}; strip right edge ${area.barRight}`);
}

// Make sure `item`'s panel is not showing, by state `mode`: 'other' = another item's panel shows; 'collapsed' = none shows.
async function arrange(t, item, mode) {
	const other = item.name === 'Files' ? ITEMS[1] : ITEMS[0];
	const area0 = await sideArea(t);
	// The page opens with Files showing.
	if (mode === 'other') {
		if (!panelShows(area0, other).ok) {
			await (await t.app.byId(other.id)).click();
			await t.settle();
		}
	} else {
		// Collapse: click the item whose panel is showing (Files at open).
		const showing = ITEMS.find((i) => panelShows(area0, i).ok);
		if (showing) { await (await t.app.byId(showing.id)).click(); await t.settle(); }
	}
	const area = await sideArea(t);
	const pre = panelShows(area, item);
	await t.check(`setup (${mode}): ${item.name}'s panel is not showing before the click`, !pre.ok && !pre.allHits,
		`#${item.panel} already showing`, { hard: true });
	if (mode === 'other') {
		await t.check(`setup (other): ${other.name}'s panel shows before the click`, panelShows(area, other).ok,
			`could not show ${other.name} first`, { hard: true });
	} else {
		const any = ITEMS.find((i) => panelShows(area, i).ok);
		await t.check(`setup (collapsed): no panel shows before the click`, !any, `${any && any.name} still shows`, { hard: true });
	}
}

export const tests = {};
for (const item of ITEMS) {
	for (const mode of ['other', 'collapsed']) {
		tests[`${item.name}: one click shows its own panel (from ${mode === 'other' ? 'another panel showing' : 'side area collapsed'})`] = async (t) => {
			await t.app.open();
			await arrange(t, item, mode);
			await (await t.app.byId(item.id)).click({ clickCount: 1 });
			await verifyAfterClick(t, item, `${item.name} (${mode})`);
		};
	}
}

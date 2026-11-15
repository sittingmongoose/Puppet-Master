// The expanded census's forcing (PM7PERF-CENSUS-FORCING, R27 F4) on a constructed page: one rule's forcing must not hide
// another rule's dropped descendant. Rule 'a' reaches its carrier only in its own state (.cur) and only while the carrier
// is not .active; rule 'b''s forcing adds .active to the same element. Forced all at once (main's census), rule a's carrier
// is gone in the forced pass and its dropped descendant is never seen; compared under its own forcings, it is.
// browser-check run active_descendant_forcing.selftest.check.mjs --config <the PM7 kit's browser-check.config.mjs>
import { CENSUS_ROWS } from './active_descendant_expanded.check.mjs';

const FIXTURE = `<!doctype html><title>forcing</title>
<div class="car"><span class="lab">label</span><span class="dropped">no arm</span></div>`;
const RULES = [
	{ rule: 'a', original: '.car.cur:not(.active) *', replacement: '.car.cur:not(.active) :where(.lab)' },
	{ rule: 'b', original: '.car.active *', replacement: '.car.active :where(.lab, .dropped)' }
];
const FORCE = [{ cls: 'cur', sel: '.car' }, { cls: 'active', sel: '.car' }];
const DECLS = { a: 'color:inherit', b: 'color:inherit' };

export default async function (t) {
	await t.page.setContent(FIXTURE);
	const rows = await t.page.evaluate(CENSUS_ROWS, [RULES, FORCE, DECLS]);
	const missing = (rule, forced) => rows.filter((r) => r.rule === rule && r.forced === forced).flatMap((r) => Object.keys(r.groups));
	t.log(`rows ${JSON.stringify(rows.map(({ rule, forced, original, replacement, groups }) => ({ rule, forced, original, replacement, groups: Object.keys(groups) })))}`);
	await t.check('as the page is, neither rule matches (no state forced)', rows.filter((r) => r.forced === false).every((r) => r.original === 0));
	await t.check('forced all at once, rule a\'s carrier is knocked out by rule b\'s .active: its dropped descendant is not seen there', missing('a', true).length === 0 && rows.find((r) => r.rule === 'a' && r.forced === true).original === 0);
	await t.check('under its own forcings (.cur only), rule a\'s dropped descendant is found', missing('a', 'own').includes('dropped'), JSON.stringify(missing('a', 'own')));
	await t.check('rule b, which keeps every arm, has no dropped descendant in any pass', missing('b', true).length === 0 && missing('b', 'own').length === 0);
}

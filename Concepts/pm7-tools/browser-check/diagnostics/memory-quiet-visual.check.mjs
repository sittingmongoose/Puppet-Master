// FO-167 visual sheet: the quiet Memory page and the chat's sheet in the states the approved mock shows
// (share/puppet-master/2026-11-11-memory-review/mock, screens 01 to 10), for a side-by-side review against the mock.
// Each look (--set looks=, default Basic Dark, Basic Light, Glass Dark, NieR Dark) at 1390x900 and 390x844, normal page:
//   01 Settings > Memory · 03 Add memory · 04 its "Where it's available" picker · 05 Delete with its confirm (the
//   recipe photos note, as the mock) · 06 the level filter · 07 search "docs" reaching Archived · 08 a reply that saved
//   something · 09 "Remember that I always use pnpm" · 10 the chat's Memory button opens the sheet.
// Shots only (LOOK lines); memory-quiet.check.mjs asserts the behaviour. --set states=01,10 limits the states.
import { setLookBySetting } from '../helpers/settings-look.mjs';

const WS = 'context-memory';
const BODY = `[data-continuous-workspace-body="${WS}"]`;
const esc = async (t, n = 1) => { for (let i = 0; i < n; i++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(300); } };

async function toMemory(t, f, w) {
	if (w <= 600) await f.evaluate(() => document.getElementById('tab-settings').click());
	else await f.locator('#tab-settings').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-settings').click()));
	await t.settle();
	await f.evaluate((ws) => PM51.go('memory', ws), WS);
	await f.waitForSelector(`${BODY}[data-workspace-mounted="true"]`, { timeout: 15000 });
	await t.settle();
	await t.page.waitForTimeout(900);
}
async function toHome(t, f, w) {
	if (w <= 600) await f.evaluate(() => document.getElementById('tab-dashboard').click());
	else await f.locator('#tab-dashboard').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-dashboard').click()));
	await f.waitForFunction(() => !!document.querySelector('#pmRoot .chat-header .pm7-mem-btn'), null, { timeout: 30000 });
	if (w <= 860) { await t.page.waitForTimeout(500); await f.evaluate(() => { const c = window.PMW && PMW.chatCol; if (c && !c.isOpen()) c.show(); }); }
	await t.settle();
	await t.page.waitForTimeout(700);
}
async function demo(t, f, id) {
	await f.evaluate((g) => window.PM56_PORT.demo.runGuided(g), id);
	await t.page.waitForTimeout(1500);
}

export const tests = {
	async 'FO-167 visual sheet'(t) {
		const looks = t.args.looks ? String(t.args.looks).split(',') : ['basic-dark', 'basic-light', 'glass-dark', 'nier-dark'];
		const want = t.args.states ? new Set(String(t.args.states).split(',')) : null;
		const on = (s) => !want || want.has(s);
		for (const look of looks) {
			await t.viewport(1390, 900);
			const f = await t.app.open({ sandbox: false });
			await t.app.resetLayout();
			await f.locator('#tab-settings').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-settings').click()));
			await t.settle();
			await setLookBySetting(t, f, look);
			for (const [w, h, size] of [[1390, 900, 'desktop'], [390, 844, 'phone']]) {
				await t.viewport(w, h);
				await t.page.waitForTimeout(600);
				await toMemory(t, f, w);
				if (on('01')) await t.shot(`${look}-01-memory-page-${size}`, `${look} ${size}: Settings > Memory, compare mock 01 (${size})`);
				if (on('06') && size === 'desktop') {
					await f.locator(`${BODY} .mm-level .pm51-dd-trigger`).first().click();
					await t.page.waitForTimeout(500);
					await t.shot(`${look}-06-level-filter-${size}`, `${look} ${size}: the level filter popover, compare mock 06`);
					await esc(t);
				}
				if (on('07') && size === 'desktop') {
					const box = f.locator(`${BODY} .mm-search input`).first();
					await box.click(); await box.fill('docs'); await t.page.waitForTimeout(500);
					await t.shot(`${look}-07-search-finds-archived-${size}`, `${look} ${size}: search reaching Archived, compare mock 07`);
					await box.fill(''); await t.page.waitForTimeout(300);
				}
				if (on('03') || on('04')) {
					await f.locator(`${BODY} .mm-add`).first().click();
					await f.waitForSelector('#pm-settings-portals .overlay .dialog', { timeout: 8000 });
					await f.locator('#pm-settings-portals .overlay textarea[name="text"]').first().fill('Demo accounts always use the staging database.');
					await t.page.waitForTimeout(500);
					if (on('03')) await t.shot(`${look}-03-add-dialog-${size}`, `${look} ${size}: Add memory, compare mock 03`);
					if (on('04') && size === 'desktop') {
						await f.locator('#pm-settings-portals .overlay .dialog .pm51-dd-trigger').first().click();
						await t.page.waitForTimeout(500);
						await t.shot(`${look}-04-add-dialog-level-picker-${size}`, `${look} ${size}: Where it's available picker, compare mock 04`);
						await esc(t);
					}
					await esc(t, 2);
				}
				if (on('05')) {
					const row = f.locator(`${BODY} .mm-row`, { hasText: 'Recipe photos' }).first();
					await row.locator('[data-action="pm51-memory-delete"]').click();
					await f.waitForSelector('#pm-settings-portals .overlay .dialog', { timeout: 8000 });
					await t.page.waitForTimeout(500);
					await t.shot(`${look}-05-delete-confirm-${size}`, `${look} ${size}: Delete with its confirm, compare mock 05`);
					await esc(t, 2);
				}
				await toHome(t, f, w);
				if (on('08')) {
					await demo(t, f, 'memory-saved');
					await t.shot(`${look}-08-chat-saved-to-memory-${size}`, `${look} ${size}: a reply that saved something, compare mock 08`);
				}
				if (on('09')) {
					await demo(t, f, 'memory-remember');
					await t.shot(`${look}-09-chat-remember-this-${size}`, `${look} ${size}: Remember that I always use pnpm, compare mock 09`);
				}
				if (on('10')) {
					await f.locator('#pmRoot .chat-header .pm7-mem-btn').first().click();
					await t.page.waitForTimeout(800);
					await t.shot(`${look}-10-memory-sheet-over-chat-${size}`, `${look} ${size}: the chat's Memory button opens the sheet, compare mock 10`);
					await esc(t);
				}
			}
			await t.viewport(1390, 900);
			await t.app.resetLayout();
		}
		await t.check('visual sheet captured', true);
	}
};

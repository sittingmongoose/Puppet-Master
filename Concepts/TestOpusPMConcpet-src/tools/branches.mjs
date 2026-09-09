import { launch } from './drive.mjs';
const { browser, page, errs } = await launch({ theme: 'friendly-dark', width: 1500, height: 940 });
const shot = n => page.screenshot({ path: `evidence/br_${n}.png` });
const click = async (sel, ms=700) => { const ok = await page.evaluate(s => { const e=document.querySelector(s); if(!e||e.disabled) return false; e.click(); return true; }, sel); if(!ok) console.log('  ! click failed', sel); await page.waitForTimeout(ms); return ok; };
const primary = () => click('#pmo .pmo-foot-actions .pmo-btn--primary');
const screen = () => page.evaluate(() => window.PMO_ONBOARDING.screen);
const reset = async () => { await page.evaluate(() => { window.PMO_FLOW.reset(); window.PMO_ONBOARDING.go('welcome', {replace:true}); window.PMO_ONBOARDING.open('br'); }); await page.waitForTimeout(900); };

/* ---- BRANCH A: connect a device, then create a project from the ready page ---- */
await reset();
await primary();                                                   // welcome -> where
await click('#pmo [data-pmo-act="where"][data-arg="existing-device"]');
await primary();                                                   // -> pair
console.log('A1 pair:', await screen()); await shot('A1_pair');
await click('#pmo [data-pmo-act="pick-device"][data-arg="studio"]');
await primary();                                                   // -> device-ready
console.log('A2 device-ready:', await screen()); await shot('A2_device_ready');
await click('#pmo [data-pmo-act="from-ready"][data-arg="new"]');    // the required fork
console.log('A3 from-ready->', await screen()); await shot('A3_from_ready_new');

/* ---- BRANCH B: existing work on a network device, SSH automated ---- */
await reset();
await primary(); await primary();                                   // -> begin
await click('#pmo [data-pmo-act="begin"][data-arg="existing"]');
await primary();                                                   // -> source
console.log('B1 source:', await screen()); await shot('B1_source');
await click('#pmo [data-pmo-act="source"][data-arg="network"]');
await primary();                                                   // -> source-network
console.log('B2 network:', await screen()); await shot('B2_network_ssh_default');
await click('#pmo [data-pmo-act="net-device"][data-arg="nas"]');
await shot('B3_network_creds');
await click('#pmo [data-pmo-act="net-connect"]', 400); await shot('B4_key_step1');
await page.waitForTimeout(900); await shot('B5_key_step2');
await page.waitForTimeout(1400); await shot('B6_connected');
console.log('B  keyInstalled:', await page.evaluate(() => window.PMO_FLOW.draft.network.keyInstalled),
            'tested:', await page.evaluate(() => window.PMO_FLOW.draft.network.tested));

/* ---- BRANCH C: online source with just-in-time sign-in / create account ---- */
await reset();
await primary(); await primary();
await click('#pmo [data-pmo-act="begin"][data-arg="existing"]');
await primary();
await click('#pmo [data-pmo-act="source"][data-arg="online"]');
await primary();
console.log('C1 online:', await screen()); await shot('C1_online_hosts');
await click('#pmo [data-pmo-act="online-host"][data-arg="github"]');
await shot('C2_signin_or_create');
await click('#pmo [data-pmo-act="online-create"]', 1800);
await shot('C3_signed_in');
console.log('C  signedIn:', await page.evaluate(() => window.PMO_FLOW.draft.online.signedIn),
            'creating:', await page.evaluate(() => window.PMO_FLOW.draft.online.creating));

/* ---- BRANCH D: restore ---- */
await reset();
await primary(); await primary();
await click('#pmo [data-pmo-act="begin"][data-arg="restore"]');
await primary();
console.log('D1 restore:', await screen()); await shot('D1_restore');

/* ---- BRANCH E: back preserves every precommit choice, nothing created ---- */
await reset();
await primary(); await primary(); await primary();                  // -> project
await page.fill('#pmo-name', 'Neighbourhood book club'); await page.waitForTimeout(400);
await primary();                                                    // -> inherit
await click('#pmo .pmo-back'); await click('#pmo .pmo-back');
console.log('E  after 2 back:', await screen(),
  '| name kept:', await page.evaluate(() => window.PMO_FLOW.draft.name),
  '| committed:', await page.evaluate(() => window.PMO_FLOW.draft.committed));
await shot('E1_back_preserved');

/* ---- BRANCH F: close then resume with the draft intact ---- */
await click('#pmo [data-pmo-act="close"]', 900);
console.log('F  resume visible:', await page.evaluate(() => { const r=document.getElementById('pm7-onboarding-resume'); return r && !r.hidden; }));
await shot('F1_closed_resume_chip');
await page.evaluate(() => document.getElementById('pm7-onboarding-resume').click());
await page.waitForTimeout(1000);
console.log('F  resumed at:', await screen(), '| name:', await page.evaluate(() => window.PMO_FLOW.draft.name));
await shot('F2_resumed');

console.log('ERRS:', JSON.stringify(errs.slice(0,6)));
await browser.close();

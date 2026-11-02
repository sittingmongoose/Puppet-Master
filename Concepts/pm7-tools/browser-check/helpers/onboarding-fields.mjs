// Layout adapter for the original fields-lane R6 checks. The helper API and assertions stay the same; page/sandbox
// opening uses the shared kit, including T3's actual flags. No app source or product fixture is introduced.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const pagePath = (t) => path.resolve(t.args.page || fileURLToPath(new URL('../../../PMConcept7.html', import.meta.url)));
export function onboardingApp(t) {
  const sandbox = t.app.sandboxed(true);
  let f = null;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const LAYER = '.o55-layer:not(.o55-out)';
  const settled = async () => { await f.locator(LAYER + ':not(.o55-hold)').first().waitFor({ timeout: 15000 }); };
  const snap = () => f.evaluate(() => { const s = O55.S, l = document.querySelector('.o55-layer:not(.o55-out)'); return {
    screen: s.sess.screen, theme: O55.theme(), origin: String(self.origin), text: l ? l.innerText : '', draft: O55.draft.exportPlan(s.sess.drafts.main), helper: { auth: s.sess.drafts.main.forge_auth_method || null },
    missing: O55.draft.missing(s.sess.drafts.main).map((m) => m.key), backup: JSON.parse(JSON.stringify(s.sess.backup || {})), restore: JSON.parse(JSON.stringify(s.sess.restore || {})), signin: JSON.parse(JSON.stringify(s.sess.signin || {})),
    fields: [...(l ? l.querySelectorAll('input') : [])].map((x) => ({ id: x.id, type: x.type, value: x.type === 'password' ? '' : x.value, invalid: x.getAttribute('aria-invalid') === 'true' })),
    errors: [...(l ? l.querySelectorAll('.o55-err') : [])].map((x) => x.textContent.trim()),
    buttons: [...(l ? l.querySelectorAll('[data-o55-do]') : [])].map((x) => ({ action: x.getAttribute('data-o55-do'), arg: x.getAttribute('data-arg'), disabled: x.disabled || x.getAttribute('aria-disabled') === 'true', text: x.innerText.trim(), checked: x.getAttribute('aria-checked') })),
    primary: (() => { const b = document.querySelector('.o55-foot [data-o55-do].o55-primary, .o55-foot .o55-primary'); return b ? { action: b.getAttribute('data-o55-do'), disabled: b.disabled || b.getAttribute('aria-disabled') === 'true', reason: b.getAttribute('data-disabled-reason') || b.title || '' } : null; })() }; });
  /* the screen is current and its entrance has finished (the foot and fields belong to it) */
  const screen = async (id, timeout = 20000) => { await f.waitForFunction((x) => window.O55 && O55.S && O55.S.sess && O55.S.sess.screen === x, id, { timeout }); await settled(); await f.waitForFunction(() => document.querySelectorAll('.o55-pane > .o55-layer').length === 1, null, { timeout: 8000 }).catch(() => {}); await sleep(250); };
  async function click(t, action, arg, expected) {
    await settled();
    let sel = action === 'back' ? '[data-o55-do="back"]' : `${LAYER} [data-o55-do="${action}"]`;
    if (arg !== undefined && arg !== null) sel += `[data-arg=${JSON.stringify(String(arg))}]`;
    await f.locator(sel).filter({ visible: true }).first().click({ timeout: 12000 });
    if (expected) await screen(expected); else await sleep(220);
    return snap();
  }
  async function fill(t, id, value) { await settled(); await f.locator('#' + id).fill(value); await sleep(150); return snap(); }
  async function type(t, id, value) { await settled(); const l = f.locator('#' + id); await l.click(); await l.fill(''); await l.pressSequentially(value, { delay: 15 }); await sleep(150); return snap(); }
  const helpers = {
      // fresh wizard in Basic Light, at "Where should Puppet Master do the work?"
      async boot(t, { look = ['basic', 'light'], scenario = '' } = {}) {
        f = await t.app.open({ onboarding: true, query: 'o55=fresh' + (scenario ? '&o55scenario=' + encodeURIComponent(scenario) : ''), sandbox, settleMs: 1500 });
        await screen('welcome', 40000);
        const env = await f.evaluate(() => ({ origin: String(self.origin), storage: (() => { try { return 'ok:' + localStorage.length; } catch (e) { return e.name; } })() }));
        t.check(sandbox ? 'opaque origin, no storage' : 'normal page (file://) with storage', sandbox ? env.origin === 'null' && env.storage === 'SecurityError' : /^ok/.test(env.storage), JSON.stringify(env));
        await click(t, 'start', undefined, 'look'); await click(t, 'pickFamily', look[0]); await click(t, 'pickMode', look[1]);
        const th = (await snap()).theme;
        t.check(`look ${look.join(' ')} applied`, th.chosen === look[0] && th.mode === look[1], JSON.stringify(th));
        await click(t, 'next', undefined, 'where');
      },
      click, fill, type, snap: () => snap(), screen: (t, id) => screen(id), sleep: (t, ms) => sleep(ms),
      frame: () => f,
      async has(t, action, arg) { let sel = `${LAYER} [data-o55-do="${action}"]`; if (arg !== undefined) sel += `[data-arg=${JSON.stringify(String(arg))}]`; return (await f.locator(sel).filter({ visible: true }).count()) > 0; },
      async waitEnabled(t, action = 'next') { const sel = `.o55-foot [data-o55-do="${action}"]`; await f.waitForFunction((s) => { const e = document.querySelector(s); return e && !e.disabled && e.getAttribute('aria-disabled') !== 'true'; }, sel, { timeout: 20000 }); },
      async waitFor(t, fn, arg, timeout = 15000) { await f.waitForFunction(fn, arg, { timeout }); },
      // a new local Project named `name`, at Keep your work safe
      async toSafe(t, name = 'Book club site') {
        await click(t, 'pick', 'this'); await click(t, 'next', undefined, 'begin'); await click(t, 'pick', 'new'); await click(t, 'next', undefined, 'name');
        await fill(t, 'o55f-name', name); await click(t, 'next'); if ((await snap()).screen === 'like') await click(t, 'next', undefined, 'safe'); await screen('safe');
      },
      // from Keep your work safe (copy) or begin (source): choose a service and variant, sign in, reach details/repos
      async service(t, svc, variant, address) {
        if (svc !== 'github' && !(await f.locator(`${LAYER} [data-o55-do="pick"][data-arg="${svc}"]`).filter({ visible: true }).count())) await click(t, 'others');
        await click(t, 'pick', svc);
        if (variant && await f.locator(`${LAYER} [data-o55-do="variant"][data-arg="${variant}"]`).filter({ visible: true }).count()) await click(t, 'variant', variant);
        if (await f.locator('#o55f-address').count()) await fill(t, 'o55f-address', address || 'https://git.platyr.test');
        await click(t, 'next', undefined, 'online-signin');
      },
      async signIn(t, { token } = {}) {
        const s = await snap();
        if (await f.locator(`${LAYER} [data-o55-do="signIn"]`).filter({ visible: true }).count() && !token) {
          await click(t, 'signIn'); await f.waitForFunction(() => O55.S.sess.signin.state === 'done', null, { timeout: 15000 });
        } else {
          if (await f.locator(`${LAYER} [data-o55-do="tokenOn"]`).filter({ visible: true }).count()) await click(t, 'tokenOn');
          await fill(t, 'o55f-token', token || 'pm7-fields-fixture-token'); await click(t, 'tokenCheck');
          await f.waitForFunction(() => O55.S.sess.signin.state === 'done', null, { timeout: 15000 });
        }
        return s;
      }
  };
  return Object.fromEntries(Object.entries(helpers).map(([name, fn]) => [name, (...args) => fn(t, ...args)]));
}

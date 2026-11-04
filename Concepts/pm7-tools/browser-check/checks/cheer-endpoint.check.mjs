// SW-42 / RV-16: an invalid own-server address is corrected on the same screen.
import { onboardingApp } from '../helpers/onboarding-fields.mjs';

export default async function (t) {
  const A = onboardingApp(t); await A.boot(); await A.toSafe();
  await A.click('online', undefined, 'online-service'); await A.click('others'); await A.click('pick', 'gitlab');
  await A.click('variant', 'self_managed');
  const f = A.frame();
  await A.fill('o55f-address', 'http://git.platyr.test');
  const fault = await f.waitForFunction(() => {
    const l = document.querySelector('.o55-layer:not(.o55-out)');
    return O55.pipOops.read(l)?.key || null;
  }, null, { timeout: 10000 }).then(h => h.jsonValue());
  await t.check('invalid server address has a Pip fault', !!fault, String(fault), { hard: true });
  const before = await f.evaluate(() => O55.ui.cheerLog().length);
  await A.fill('o55f-address', 'https://git.platyr.test');
  const cheered = await f.waitForFunction(({before, fault}) => O55.ui.cheerLog().slice(before).some(x => x.key === fault), {before, fault}, { timeout: 10000 }).then(() => true, () => false);
  await t.check('corrected server address receives its own cheer', cheered, JSON.stringify(await f.evaluate(() => O55.ui.cheerLog())));
}

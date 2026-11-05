// SW-42 / RV-15: saying the browser did not open exposes the fallback without a false cheer.
import { onboardingApp } from '../helpers/onboarding-fields.mjs';

export default async function (t) {
  const A = onboardingApp(t); await A.boot({ look: String(t.args.look || 'basic-light').split('-') }); await A.toSafe();
  await A.click('online', undefined, 'online-service');
  await A.service('bitbucket_cloud', 'cloud');
  await A.click('signIn');
  await A.waitFor(() => O55.S.sess.signin.state === 'waiting', null, 10000);
  const f = A.frame(), before = await f.evaluate(() => O55.ui.cheerLog().length);
  await A.click('showLink');
  await f.waitForTimeout(1500); // watch the pending attempt, before the fixture's seven-second answer
  const view = await f.evaluate((before) => {
    const l = document.querySelector('.o55-layer:not(.o55-out)');
    return { state: O55.S.sess.signin.state, remote: O55.S.sess.signin.remote,
      open: !!l.querySelector('[data-o55-do="openPage"]'), copy: !!l.querySelector('[data-o55-do="copyPage"]'),
      browserOpenedLine: !!l.querySelector('[data-key="wait"] .o55-rowmeta'), toast: !!document.querySelector('#pm-o55-onboarding .o55-toast'),
      cheers: O55.ui.cheerLog().slice(before) };
  }, before);
  await t.check('fallback offers the page and copy address without the old browser-opened message', view.state === 'waiting' && view.remote === 'link' && view.open && view.copy && !view.browserOpenedLine && !view.toast, JSON.stringify(view));
  await t.check('choosing fallback is not a completed sign-in cheer', view.cheers.length === 0, JSON.stringify(view.cheers));

  // A real failed sign-in followed by a successful retry must cheer the failed operation.
  const B = onboardingApp(t); await B.boot({ look: String(t.args.look || 'basic-light').split('-'), scenario: 'fresh+githubSigninOnce' }); await B.toSafe();
  await B.click('online', undefined, 'online-service'); await B.click('next', undefined, 'online-signin');
  await B.click('signIn'); await B.waitFor(() => O55.S.sess.signin.state === 'failed', null, 15000);
  const bf = B.frame();
  const fault = await bf.waitForFunction(() => O55.pipOops.read(document.querySelector('.o55-layer:not(.o55-out)'))?.key || null, null, { timeout: 10000 }).then(h => h.jsonValue());
  const mark = await bf.evaluate(() => O55.ui.cheerLog().length);
  await B.click('signIn'); await B.waitFor(() => O55.S.sess.signin.state === 'done', null, 15000);
  const cheered = await bf.waitForFunction(({mark, fault}) => O55.ui.cheerLog().slice(mark).some(x => x.key === fault), {mark, fault}, { timeout: 10000 }).then(() => true, () => false);
  await t.check('successful sign-in retry cheers its prior failure', cheered, JSON.stringify(await bf.evaluate(() => O55.ui.cheerLog())));
}

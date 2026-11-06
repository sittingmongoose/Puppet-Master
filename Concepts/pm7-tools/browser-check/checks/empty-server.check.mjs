// SW-42 / p15: reach the fixture Server with no Projects by the ordinary Connect route.
import { onboardingApp } from '../helpers/onboarding-fields.mjs';

export default async function (t) {
  const A = onboardingApp(t);
  await A.boot({ look: String(t.args.look || 'basic-light').split('-') });
  await A.click('pick', 'connect');
  await A.click('next', undefined, 'c-route');
  await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="pm:garage"]'), null, 10000);
  await A.click('pickServer', 'pm:garage');
  await A.click('next', undefined, 'c-review');
  await A.click('connect', undefined, 'c-pair');
  await A.waitFor(() => O55.S.sess.connect.paired, null, 15000);
  await A.click('next', undefined, 'c-ready');
  const s = await A.snap();
  await t.check('empty Server says no Projects yet', /No Projects on Garage Pi yet/.test(s.text), s.text);
  const tour = await A.frame().locator('#pm-o55-onboarding [data-o55-do="tour"]').count();
  await t.check('empty Server offers Create a new Project and no tour', s.primary?.action === 'createNew' && tour === 0, JSON.stringify({ primary: s.primary, tour }));
  await A.click('createNew', undefined, 'begin');
  await t.check('Create begins a new Project', (await A.snap()).screen === 'begin');
}

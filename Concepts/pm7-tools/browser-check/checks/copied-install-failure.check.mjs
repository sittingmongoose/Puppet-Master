export default async function(t){
 const f=await t.app.open();
 await f.evaluate(()=>O55.studio.onboarding.screen('name','returning+cliMissing'));
 const screen=async id=>{await f.waitForFunction(id=>O55.S.sess&&O55.S.sess.screen===id,id);await t.settle();};
 const next=async()=>f.locator('#pm-o55-onboarding [data-o55-do="next"]:visible').last().click();
 await screen('name');await f.locator('[data-o55-bind="name"]').fill('Copied installer failure check');await next();
 await screen('like');await f.locator('[data-o55-do="pick"][data-arg="tastebook"]').click();await next();
 await screen('safe');await next();await screen('review');await f.locator('[data-o55-do="commit"]').click();await screen('creating');
 await f.waitForSelector('[data-o55-do="next"]:not([disabled]):not([aria-disabled="true"])',{timeout:30000});await next();await screen('ai');
 await t.check('real route copies Tastebook settings',await f.evaluate(()=>{const d=O55.S.sess.drafts.main;return d.settings_transfer.mode==='copy_from_project'&&d.settings_transfer.source_project_id==='tastebook';}));
 for(const code of ['permission','offline','unsupported','verify']){
  await f.locator('[data-o55-do="install"][data-arg="claude"]').click();
  const hints=f.locator('[data-key="dh-install:claude"] button'),count=await hints.count();
  await t.check(`${code} copied installer offers failure hints`,count===5);
  if(count!==5)return;
  await t.check(`${code} retry requires fresh consent`,await f.evaluate(()=>O55.S.sess.ai.accounts.claude.confirmInstall===true));
  await hints.nth(['works','offline','unsupported','permission','verify'].indexOf(code)).click();
  await f.locator('[data-o55-do="installGo"][data-arg="claude"]').click();
  await f.waitForFunction(()=>O55.S.sess.ai.accounts.claude.state==='installFailed');
  const row=f.locator('[data-key="pv-claude"]');await row.scrollIntoViewIfNeeded();
  const text=(await row.innerText()).replace(/\s+/g,' '),reason=await f.evaluate(code=>O55.t('ai.installFailure.'+code),code);
  await t.check(`${code} copied row retains reason and recovery`,text.includes(reason.replace(/\s+/g,' ')),text);
  await t.check(`${code} failed installation never commits install or auth`,await f.evaluate(code=>{const r=O55.S.sess.ai.accounts.claude;return r.installFailCode===code&&!r.installed&&!Object.keys(O55.S.sess.ops).some(k=>k.startsWith('signin:claude:'));},code));
  if(code==='permission')await t.crop('copied-permission-failure',row,'Specific failure reason and recovery remain visible after copying settings');
 }
 await f.locator('[data-o55-do="install"][data-arg="claude"]').click();
 await t.check('successful retry also asks for fresh consent',await f.evaluate(()=>O55.S.sess.ai.accounts.claude.confirmInstall===true));
 await f.locator('[data-o55-do="installGo"][data-arg="claude"]').click();
 await f.waitForFunction(()=>O55.S.sess.ai.accounts.claude.state==='signin');
 await t.check('verified retry offers separate sign-in',await f.evaluate(()=>O55.S.sess.ai.accounts.claude.installed&&!Object.keys(O55.S.sess.ops).some(k=>k.startsWith('signin:claude:'))));
}

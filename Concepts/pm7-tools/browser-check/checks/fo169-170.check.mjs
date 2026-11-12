// Real input; visible text only. No live DNS or proxy deployment is claimed.
const W = '.o55g-win .o55g-layer:not(.o55g-out)';
const pause = f => f.waitForTimeout(450);
async function settings(t) { await t.viewport(1440,900); const f=await t.app.open({settleMs:1500}); await f.locator('#tab-settings').click(); await f.waitForTimeout(1500); return f; }
async function next(f) { await f.locator(`.o55g-win .o55g-primary`).click(); await pause(f); }
export const tests = {
 async 'FO-169 services no-match and clear'(t) {
  const f=await settings(t); await f.evaluate(()=>PM51.go('ai','providers')); await pause(f);
  const input=f.locator('input[placeholder="Filter services"]'); await input.waitFor();
  const roster=f.locator('#provider-roster'), before=await roster.locator('.resource-row:visible').count();
  await input.fill('zzzz-no-provider');
  await t.equal('all service rows hidden',await roster.locator('.resource-row:visible').count(),0);
  await t.equal('exactly one visible empty line',await roster.getByText('No services match. Clear the filter to see everything.',{exact:true}).locator('visible=true').count(),1);
  await t.equal('no heading claims hidden rows',await roster.locator('.roster-title:visible,.o55-roster-group:visible').count(),0);
  for (const look of ['basic-dark','glass-light','nier-dark']) { await t.app.look(look); await t.shot(`fo169-${look}`,'Filter no-match line: spacing, contrast and placement under filter'); }
  await input.fill(''); await t.equal('clearing restores every row',await roster.locator('.resource-row:visible').count(),before);
  await t.equal('empty line removed',await roster.locator('.pm51-filter-empty:visible').count(),0);
  await t.equal('heading restored',await roster.locator('.roster-title:visible').count(),1);
 },
 ...Object.fromEntries(['Caddy','NGINX','Traefik'].map(proxy=>[`FO-170 ${proxy} wizard save Details regenerate`,async t=>{
  const f=await settings(t); await f.evaluate(()=>PM51.go('system','servers')); await pause(f);
  await f.locator('.workspace-block[data-workspace-block="servers"] [data-action="pm51-tab"][data-manager="servers"][data-tab="away"]').first().click(); await pause(f);
  await f.locator('.pm51-servers-route[data-route="domain"] [data-action="pm51-servers-remote"]').first().click(); await pause(f);
  await f.locator(`${W} .o55-aw-dom`).fill('pm.example.com'); await f.locator(`${W} .o55-aw-proxy`).locator('..').locator('.pm51-dd-trigger').click(); await f.locator('.pm51-dd-list .pm51-popout-item').filter({hasText:new RegExp('^'+proxy+'$')}).click(); await pause(f);
  await f.locator(`${W} [data-key="forwarded"]`).click(); await next(f);
  const correct=s=>s.includes('pm.example.com') && (proxy==='Caddy' ? s.includes('reverse_proxy')&&!s.includes('server_name') : proxy==='NGINX' ? s.includes('server_name')&&!s.includes('reverse_proxy') : s.includes('certResolver')&&!s.includes('server_name')&&!s.includes('reverse_proxy'));
  await t.check(`${proxy} wizard output`,correct(await f.locator(`${W} .o55g-main`).innerText()));
  await f.locator(`${W} [data-key="added"]`).click(); await next(f);
  await f.locator(`${W} [data-action="pm51-servers-key-check"]`).click(); await f.waitForTimeout(1200); await next(f); await next(f);
  await f.locator('.workspace-block[data-workspace-block="servers"] .pm51-servers-route[data-route="domain"] button').filter({has:f.locator('svg')}).last().click(); await pause(f);
  await f.locator('.pm51-menu-item').filter({hasText:'Details'}).click(); await pause(f);
  await t.check(`${proxy} saved Details output`,correct(await f.locator('[data-domain-config]').innerText()));
  await f.locator('[data-action="pm51-servers-domain-generate"]').click();
  await t.check(`${proxy} regenerated output`,correct(await f.locator('[data-domain-config]').innerText()));
 }]))
};

"""Astra browser acceptance. Runs actual UI handlers in the full copied shell.
Managed Chromium blocks local navigation; set_content + test-only Storage is used.
Results do not certify native disk persistence, auth, network, installation, or backend.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time,traceback,hashlib,os,tempfile
ROOT=Path(__file__).resolve().parents[4];OUT=Path(tempfile.mkdtemp(prefix='astra-acceptance-'))
source=(ROOT/'Concepts/TestAstraPmConcept.html').read_text();results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 p=b.new_page(viewport={'width':1440,'height':960},reduced_motion='reduce');p.set_default_timeout(12000);errors=[];requests=[]
 p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url))
 p.evaluate(Path(__file__).with_name('storage_shim.js').read_text());p.set_content(source);p.wait_for_timeout(800)
 def js(x):return p.evaluate(x)
 def act(a,v=None):p.evaluate('([a,v])=>ASTRA.act(a,v)',[a,v]);p.wait_for_timeout(60)
 def fill(sel,value):p.locator(sel).fill(value);p.locator(sel).dispatch_event('input')
 def state():return js('ASTRA.state')
 def stage(v):assert state()['stage']==v,(state()['stage'],v)
 def reset():
  js('PM7_GUIDED_TOUR.skip();ASTRA.demo.reset()');p.wait_for_timeout(180)
 def new(name='Test project'):
  act('start');act('local');act('kind','new');fill('#name',name);act('project-next')
 def to_review(name='Test project'):
  new(name);act('storage-next');act('source-next');stage('review')
 def run(name,fn):
  t=time.time();start_err=len(errors)
  try:reset();fn();results.append({'name':name,'status':'pass','seconds':round(time.time()-t,2),'new_js_errors':errors[start_err:]});print('PASS',name,flush=True)
  except Exception as e:
   results.append({'name':name,'status':'fail','error':str(e),'trace':traceback.format_exc(),'seconds':round(time.time()-t,2)});print('FAIL',name,str(e),flush=True)
   p.screenshot(path=str(OUT/(name+'.png')))
  (OUT/'results.json').write_text(json.dumps({'results':results,'errors':errors,'network_requests':requests,'method':'full HTML via set_content; test-only in-memory Storage shim; UI handlers'},indent=2))
 def fresh():
  new('Fresh idea');stage('storage');assert state()['draft']['host']=='local';assert not state()['projects'];act('storage-next');assert not state()['draft']['online'];act('source-next');stage('review');assert not state()['projects']
 run('01_fresh_local',fresh)
 def validation():
  act('start');act('local');act('kind','new');act('project-next');stage('project');assert p.locator('#as-error').is_visible();assert not state()['projects']
 run('02_required_name',validation)
 def backtrack():
  to_review('A reversible idea');frozen=state()['draft'];act('back');stage('source');act('back');stage('storage');act('back');stage('project');assert state()['draft']==frozen;assert not state()['projects'];act('close');assert not state()['open'];js('ASTRA.open()');stage('project');assert state()['draft']['name']=='A reversible idea'
 run('03_back_close_resume',backtrack)
 def source_auth():
  new('Online idea');act('storage-next');act('online','yes');act('source-next');stage('source');act('forge-auth');links=p.locator('.as-sheet a').evaluate_all('(xs)=>xs.map(x=>[x.textContent,x.href])');assert any(x[0]=='Create an account' for x in links);act('forge-sample');assert not state()['projects'];act('source-next');stage('review');assert state()['draft']['account'];assert not state()['projects']
 run('04_account_before_commit',source_auth)
 def forge_change():
  new('Forge choices');act('storage-next');act('online','yes');act('forge-auth');act('forge-sample');p.locator('#forge').select_option('Gitea');assert state()['draft']['account'] is None;fill('#instance','http://unsafe.example');act('forge-auth');assert p.locator('#as-error').is_visible();fill('#instance','https://code.example.com');act('forge-auth');assert p.locator('.as-sheet a[href="https://code.example.com/user/sign_up"]').count()==1
 run('05_forge_identity_and_https',forge_change)
 def network():
  new('NAS idea');act('location','network');act('storage-next');stage('ssh');assert state()['draft']['protocol']=='ssh';fill('#address','nas.local');fill('#username','jared');fill('#path','/projects/new-idea');act('ssh-next');stage('ssh');act('ssh-help');act('ssh-new');act('ssh-trust');assert not state()['draft']['sshReady'];p.locator('#as-trust').check();act('ssh-trust');act('ssh-ready');assert state()['draft']['sshReady'];fill('#username','other');assert not state()['draft']['sshReady'];assert not state()['projects']
 run('06_ssh_default_trust_and_revalidation',network)
 def alternatives():
  new('Mounted share');act('location','network');act('storage-next');p.locator('#protocol').select_option('SMB');fill('#path','/Volumes/Projects');act('ssh-next');stage('source');assert not state()['projects']
 run('07_mounted_share_alternative',alternatives)
 def connected():
  act('start');act('connect');act('discover');act('join','Studio computer');act('pair-approve');stage('connected');assert p.locator('[data-as="kind"][data-value="new"]').count()==1;act('kind','new');stage('project');assert state()['draft']['host']=='connected';assert not state()['projects']
 run('08_connected_device_new_project',connected)
 def pair_expired():
  act('start');act('connect');act('discover');act('join','Studio computer');js("ASTRA.demo.failNext('pair')");act('pair-approve');stage('connect');assert p.locator('#as-error').is_visible();assert state()['joined'] is None
 run('09_pairing_expiry',pair_expired)
 def existing():
  act('start');act('local');act('kind','existing');fill('#name','Existing project');act('project-next');fill('#path','/Users/me/old-project');act('check-source');assert state()['draft']['sourceVerified'];act('import-next');stage('review');assert not state()['projects']
 run('10_existing_folder_read_only_preflight',existing)
 def online_existing():
  act('start');act('local');act('kind','existing');fill('#name','Existing online');act('project-next');p.locator('#importType').select_option('An online service');act('forge-auth');act('forge-sample');act('browse-repos');act('repo-select','book-club');act('import-next');stage('review');assert not state()['projects']
 run('11_existing_online_source',online_existing)
 def restore():
  act('start');act('local');act('kind','restore');fill('#name','Restored idea');act('project-next');act('browse-backups');act('backup-select','book-club.pmbackup');fill('#recovery','wrong');act('backup-unlock');assert not state()['draft']['backupVerified'];fill('#recovery','demo-recovery-key');act('backup-unlock');act('import-next');stage('review');assert not state()['projects'];assert 'demo-recovery-key' not in json.dumps(state())
 run('12_restore_key_not_persisted',restore)
 def commit_retry():
  to_review('Retry-safe project');identity=state()['draft']['id'];js("ASTRA.demo.failNext('commit')");act('commit');p.wait_for_timeout(900);stage('review');assert not state()['projects'];act('commit');p.wait_for_timeout(1100);stage('providers');assert len(state()['projects'])==1;assert state()['committed']['draftId']==identity;act('commit');assert len(state()['projects'])==1;act('close');js('ASTRA.open()');stage('providers');assert p.locator('#projectMenuLabel').inner_text()=='Retry-safe project';assert js("document.querySelector('.pm6-proj-card[data-proj=\"retry-safe-project\"]')!==null")
 run('13_commit_failure_retry_idempotency_owner_projection',commit_retry)
 def installed_missing():
  to_review('Provider project');act('commit');p.wait_for_timeout(1000);act('provider','claude');assert p.locator('#as-install-consent').count()==1;act('provider-install');assert not js("ASTRA.demo.snapshot().discovery['local:claude'].installed");p.locator('#as-install-consent').check();act('provider-install');assert js("ASTRA.demo.snapshot().discovery['local:claude'].installed");assert p.locator('[data-as="provider-verify"]').count()==1;act('provider-verify');act('provider-done');act('provider','claude');assert not p.locator('[data-as="provider-verify"]').count();assert p.locator('[data-as="provider-another"]').count()==1
 run('14_explicit_install_then_auth_then_ready',installed_missing)
 def direct_key():
  to_review('Key project');act('commit');p.wait_for_timeout(1000);act('provider','cursor');assert not p.locator('#as-install-consent').count();fill('#sample-key','demo-key');act('provider-verify');act('provider-done');act('provider','cursor');act('provider-another','cursor');fill('#sample-key','demo-key');act('provider-verify');assert len([a for a in state()['accounts'] if a['provider']=='cursor'])==2;assert 'demo-key' not in json.dumps(state())
 run('15_direct_key_multiaccount',direct_key)
 def free():
  to_review('Free model project');act('commit');p.wait_for_timeout(1000);act('providers-next');stage('free');act('free-setup');act('provider','gemini');fill('#sample-key','demo-key');act('provider-verify');act('provider-done');act('free-save');assert state()['fixtures']['free'];assert len(state()['freeAccounts'])==1;act('free-next');stage('finish')
 run('16_free_models_after_skipping_primary',free)
 def returning():
  act('preview');act('profile-returning');new('Returning fresh');stage('inherit');assert state()['draft']['inherit']=='fresh';act('inherit-next');act('storage-next');act('source-next');act('commit');p.wait_for_timeout(1000);assert any(a['provider']=='cursor' and a['ready'] for a in state()['accounts']);act('provider','cursor');assert not p.locator('[data-as="provider-verify"]').count()
 run('17_returning_fresh_and_automatic_ready',returning)
 def inherited():
  act('preview');act('profile-returning');new('Inherited idea');stage('inherit');act('inherit','copy');assert state()['draft']['inherit']!='unavailable';act('copy-settings');act('copy-done');act('inherit-next');act('storage-next');act('source-next');assert not state()['projects'];act('commit');p.wait_for_timeout(1000);stage('providers');print('TRANSFER',state()['committed'].get('transfer'),flush=True);assert state()['committed'].get('transfer') is not None
 run('18_inheritance_uses_existing_settings_transfer',inherited)
 def no_probe_storm():
  new('No probe');assert not any(e['action']=='cmd.provider.discover' for e in js('ASTRA.events'));act('storage-next');act('source-next');act('commit');p.wait_for_timeout(1000);act('provider','qwen');act('all-providers');act('provider','qwen');assert len([e for e in js('ASTRA.events') if e['action']=='cmd.provider.discover' and e.get('provider')=='qwen'])==1
 run('19_bounded_cached_discovery',no_probe_storm)
 def tour():
  to_review('Tour project');act('commit');p.wait_for_timeout(1000);act('providers-next');act('free-next');before=js('JSON.stringify(PM_DEMO.state.usage)');act('tour');p.wait_for_timeout(300)
  for i in range(12):
   js('PM7_GUIDED_TOUR.showMe()');assert js("document.querySelector('.as-coach').dataset.done==='true'"),(i,js('ASTRA.events.slice(-4)'))
   if i==8:js("window.__decisionIdentity=document.querySelector('#as-plan-consequence')")
   if i==9:assert js("window.__decisionIdentity===document.querySelector('#as-plan-consequence')")
   js('PM7_GUIDED_TOUR.next()');p.wait_for_timeout(100)
  js('PM7_GUIDED_TOUR.finish()');assert js('PM_PAGES.current')=='wizard';assert js('JSON.stringify(PM_DEMO.state.usage)')==before;assert not js('PM7_GUIDED_TOUR.snapshot().active');assert not js('PM7_GUIDED_TOUR.snapshot().restoreErrors.length');assert p.locator('#projectMenuLabel').inner_text()=='Tour project'
  p.screenshot(path=str(OUT/'tour-final.png'))
 run('20_full_tour_owner_actions_zero_usage_continuity',tour)
 def pause():
  js('PM7_GUIDED_TOUR.start({replay:true})');p.wait_for_timeout(200);js('PM7_GUIDED_TOUR.showMe()');p.keyboard.press('Escape');assert p.locator('#pm7-guided-tour').is_hidden();assert p.locator('#as-launcher').is_visible();js('PM7_GUIDED_TOUR.resume()');assert js('PM7_GUIDED_TOUR.snapshot().flags.asked');js('PM7_GUIDED_TOUR.skip()');assert p.locator('#pm7-guided-tour').is_hidden()
 run('21_tour_pause_resume_skip',pause)
 def themes():
  for theme in ['friendly-light','friendly-dark','glass-light','glass-dark','retro-light','retro-dark','basic-light','basic-dark']:
   p.evaluate('(v)=>ASTRA.theme(v,false)',theme);assert js("document.documentElement.dataset.theme")==theme
   p.screenshot(path=str(OUT/(theme+'.png')))
  p.set_viewport_size({'width':640,'height':860});js("ASTRA.theme('friendly-light',false)");p.screenshot(path=str(OUT/'narrow.png'));assert p.locator('[data-as="start"]').is_visible();p.set_viewport_size({'width':1440,'height':960})
 run('22_all_themes_and_constrained_width',themes)
 def reduced():
  assert js('ASTRA.reduced()');assert not js("[...document.querySelector('.as-world').getAnimations({subtree:true})].some(a=>a.playState==='running')")
 run('23_reduced_motion',reduced)
 print('ERRORS',errors,flush=True)
 (OUT/'results.json').write_text(json.dumps({'results':results,'errors':errors,'network_requests':requests,'source_sha256':hashlib.sha256(source.encode()).hexdigest(),'method':'full HTML via set_content; test-only in-memory Storage shim; UI handlers. No native persistent-storage certification.'},indent=2))
 b.close()

print('Evidence directory:', OUT)
if any(r['status']!='pass' for r in results): raise SystemExit(1)

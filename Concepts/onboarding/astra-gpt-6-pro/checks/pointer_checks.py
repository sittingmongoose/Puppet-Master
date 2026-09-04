from pathlib import Path
from playwright.sync_api import sync_playwright
import json, traceback, os, tempfile
ROOT=Path(__file__).resolve().parents[4];O=Path(tempfile.mkdtemp(prefix='astra-pointer-'));results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1440,'height':960},reduced_motion='reduce');p.evaluate(Path(__file__).with_name('storage_shim.js').read_text());p.set_content((ROOT/'Concepts/TestAstraPmConcept.html').read_text());p.wait_for_timeout(600)
 def test(name,fn):
  try:fn();results.append({'name':name,'status':'pass'});print('PASS',name,flush=True)
  except Exception as e:results.append({'name':name,'status':'fail','trace':traceback.format_exc()});print('FAIL',name,str(e),flush=True)
 def theme():
  p.locator('[data-as="theme"][data-value="glass-light"]').click();assert p.evaluate('ASTRA.state.theme')=='glass-light';assert p.evaluate("document.querySelector('#pm7-onboarding').dataset.astraTheme")=='glass-light'
 test('24_actual_theme_button_and_preview_state',theme)
 def mouse_flow():
  p.locator('[data-as="start"]').click();p.locator('[data-as="local"]').click();p.locator('[data-as="kind"][data-value="new"]').click();p.locator('#name').fill('Pointer project');p.keyboard.press('Enter');assert p.evaluate('ASTRA.state.stage')=='storage';p.locator('[data-as="storage-next"]').click();p.locator('[data-as="source-next"]').click();p.locator('[data-as="commit"]').click();p.wait_for_timeout(1100);p.locator('[data-as="providers-next"]').click();p.locator('[data-as="free-next"]').click();p.locator('[data-as="tour"]').click();p.wait_for_timeout(500)
  p.locator('[data-tour="fill-question"]').click();p.locator('#chatPanel .pm6-chat-send').click();p.wait_for_timeout(300);assert p.evaluate('PM7_GUIDED_TOUR.snapshot().flags.asked');p.locator('[data-tour="next"]').click();p.locator('#chatPanel .toggle-eli5').click();p.wait_for_timeout(200);assert p.evaluate('PM7_GUIDED_TOUR.snapshot().flags.eli5');p.locator('[data-tour="next"]').click();p.wait_for_timeout(200)
  h=p.locator('#chatPanel .pm-home-surface-grip').bounding_box();d=p.locator('[data-pm-home-host="home_main"]').bounding_box();x=h['x']+h['width']/2;y=h['y']+h['height']/2;tx=d['x']+d['width']*.54;ty=d['y']+min(170,d['height']*.4)
  p.mouse.move(x,y);p.mouse.down();p.mouse.move(tx,ty,steps=40);p.wait_for_timeout(250);p.mouse.move(tx+.5,ty);p.wait_for_timeout(100);p.mouse.up();p.wait_for_timeout(500);assert p.evaluate("PM_HOME_WORKSPACE.layout.surfaces.find(s=>s.surface_instance_id==='chat').host")=='home_main'
 test('25_real_pointer_flow_teacher_eli5_drag',mouse_flow)
 def restore():
  original=p.evaluate('PM7_GUIDED_TOUR.snapshot().original.layout.surfaces');p.evaluate('PM7_GUIDED_TOUR.skip()');current=p.evaluate('PM_HOME_WORKSPACE.layout.surfaces');assert original==current,{'original':original,'current':current};assert not p.evaluate('PM7_GUIDED_TOUR.snapshot().restoreErrors.length')
 test('26_exact_whole_workspace_surface_restore',restore)
 def keep():
  p.evaluate('PM7_GUIDED_TOUR.start({replay:true})');p.evaluate('PM7_GUIDED_TOUR.showMe()');p.evaluate('PM7_GUIDED_TOUR.next()');p.evaluate('PM7_GUIDED_TOUR.showMe()');p.evaluate('PM7_GUIDED_TOUR.next()');p.evaluate('PM7_GUIDED_TOUR.showMe()');changed=p.evaluate('PM_HOME_WORKSPACE.layout.surfaces');p.evaluate("const el=document.createElement('input');el.type='checkbox';el.id='as-keep-layout';el.checked=true;document.body.append(el);PM7_GUIDED_TOUR.skip();el.remove()");assert p.evaluate('PM_HOME_WORKSPACE.layout.surfaces')==changed
 test('27_explicit_layout_retention',keep)
 def restore_storage():
  p.evaluate('ASTRA.demo.reset();ASTRA.act("start");ASTRA.act("local");ASTRA.act("kind","new")');p.locator('#name').fill('Survives remount');p.locator('[data-as="project-next"]').click();stored=p.evaluate('localStorage._dump()');q=b.new_page(viewport={'width':1440,'height':960});q.evaluate(Path(__file__).with_name('storage_shim.js').read_text());q.evaluate('(pairs)=>Object.entries(pairs).forEach(([k,v])=>localStorage.setItem(k,v))',stored);q.set_content((ROOT/'Concepts/TestAstraPmConcept.html').read_text());q.wait_for_timeout(400);assert q.evaluate('ASTRA.state.stage')=='storage';assert q.evaluate('ASTRA.state.draft.name')=='Survives remount';q.close()
 test('28_serialized_draft_rehydration_not_disk_certification',restore_storage)
 (O/'extra-acceptance.json').write_text(json.dumps(results,indent=2));b.close()

print('Evidence directory:', O)
if any(r['status']!='pass' for r in results): raise SystemExit(1)

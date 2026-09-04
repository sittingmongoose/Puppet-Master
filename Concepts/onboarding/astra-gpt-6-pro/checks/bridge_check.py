from pathlib import Path
import html,json,os,tempfile
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[4]/'Concepts';H=R/'onboarding/astra-gpt-6-pro';shim=Path(__file__).with_name('storage_shim.js').read_text();child=(R/'TestAstraPmConcept.html').read_text().replace('<head>','<head><script>'+shim+'</script>',1)
wrapper=(H/'index.html').read_text().replace('src="../../TestAstraPmConcept.html"','srcdoc="'+html.escape(child,quote=True)+'"')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':986});p.set_content(wrapper);p.wait_for_timeout(600)
 f=p.frames[1]
 assert f.evaluate('typeof ASTRA')=='object'
 p.evaluate("window.postMessage({source:'pm-concept-hub',type:'pm-concept-state',state:{theme:'basic-dark',reducedMotion:true}},'*')");p.wait_for_timeout(400)
 out=f.evaluate('({theme:ASTRA.state.theme,motion:ASTRA.state.motion,fullTop:!!document.querySelector("#tab-wizard")})');assert out['theme']=='basic-dark';assert not out['motion']
 (Path(tempfile.mkdtemp(prefix='astra-bridge-'))/'hub-embed-check.json').write_text(json.dumps({'status':'pass','method':'real wrapper plus child srcdoc; test-only Storage; not native URL navigation','state':out},indent=2));b.close();print(out)

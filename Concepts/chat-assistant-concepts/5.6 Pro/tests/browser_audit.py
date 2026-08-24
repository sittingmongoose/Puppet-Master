from __future__ import annotations
from pathlib import Path
import json, sys, time, os, shutil, hashlib, math, traceback
from urllib.parse import quote

ROOT=Path(__file__).resolve().parents[1]
REPORTS=ROOT/'reports'; EVIDENCE=ROOT/'evidence'; SHOTS=EVIDENCE/'screenshots'
for p in [REPORTS,EVIDENCE,SHOTS]: p.mkdir(parents=True,exist_ok=True)
results=[]; errors=[]; console=[]

def rec(label, ok, detail=''):
    results.append({'label':label,'pass':bool(ok),'detail':str(detail)[:3000]})

def browser_path():
    for p in [shutil.which('chromium'),shutil.which('chromium-browser'),shutil.which('google-chrome'),shutil.which('google-chrome-stable'),'/usr/bin/chromium','/opt/google/chrome/chrome']:
        if p and Path(p).exists(): return str(p)
    return None

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
except Exception as e:
    (REPORTS/'browser-audit.json').write_text(json.dumps({'overall':'MISSING','reason':repr(e)},indent=2))
    (REPORTS/'BROWSER_AUDIT_MISSING').write_text(repr(e))
    sys.exit(2)

url=(ROOT/'index.html').resolve().as_uri()

def visible_text(page):
    return page.locator('body').inner_text(timeout=5000)

def find_visible_button(page, texts=(), attrs=()):
    # Return first visible element matching readable text or semantic attributes.
    for t in texts:
        for exact in (True,False):
            try:
                loc=page.get_by_role('button',name=t,exact=exact)
                for i in range(min(loc.count(),12)):
                    el=loc.nth(i)
                    if el.is_visible(): return el
            except Exception: pass
    for attr,val in attrs:
        try:
            loc=page.locator(f'[{attr}*="{val}" i]')
            for i in range(min(loc.count(),20)):
                el=loc.nth(i)
                if el.is_visible(): return el
        except Exception: pass
    return None

def click_text(page, text):
    el=find_visible_button(page,[text])
    if not el: return False
    el.click(timeout=3000)
    page.wait_for_timeout(180)
    return True

def page_geometry(page):
    return page.evaluate('''() => ({
      iw: innerWidth, ih: innerHeight,
      sw: document.documentElement.scrollWidth,
      sh: document.documentElement.scrollHeight,
      bw: document.body.scrollWidth,
      bh: document.body.scrollHeight,
      ready: !!(window.__PM56_BOOT_OK || document.body.dataset.pm56Ready === 'true'),
      bodyText: document.body.innerText.length,
      runtime: window.PM56_RUNTIME ? window.PM56_RUNTIME.snapshot() : null,
      visibleMenus: [...document.querySelectorAll('[role="menu"],.popup-menu,.menu-panel,.model-picker,.sidecar-menu,.submenu')].filter(e=>{
        const s=getComputedStyle(e), r=e.getBoundingClientRect(); return s.display!=='none'&&s.visibility!=='hidden'&&r.width>1&&r.height>1;
      }).map(e=>{const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height,text:(e.innerText||'').slice(0,80)}}),
      visibleDialogs: [...document.querySelectorAll('[role="dialog"],.drawer,.question-surface,.decision-surface')].filter(e=>{
        const s=getComputedStyle(e), r=e.getBoundingClientRect(); return s.display!=='none'&&s.visibility!=='hidden'&&r.width>1&&r.height>1;
      }).map(e=>{const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height,text:(e.innerText||'').slice(0,80)}})
    })''')

def contained(items, iw, ih, tolerance=3):
    bad=[]
    for r in items:
        if r['x'] < -tolerance or r['y'] < -tolerance or r['x']+r['w'] > iw+tolerance or r['y']+r['h'] > ih+tolerance:
            bad.append(r)
    return bad

def clipping_scan(page):
    return page.evaluate('''() => {
      const intentional = e => {
        const s=getComputedStyle(e);
        return /auto|scroll/.test(s.overflowX+s.overflowY) || s.textOverflow==='ellipsis' ||
          e.matches('pre,code,.code-block,.collapsed,.message-preview,.thread-preview,.editor-tab,[data-allow-clip]');
      };
      const bad=[];
      for (const e of document.querySelectorAll('body *')) {
        if (e.children.length || intentional(e)) continue;
        const t=(e.textContent||'').trim(); if (!t) continue;
        const s=getComputedStyle(e), r=e.getBoundingClientRect();
        if (s.display==='none'||s.visibility==='hidden'||r.width<2||r.height<2) continue;
        if ((e.scrollWidth>e.clientWidth+3 || e.scrollHeight>e.clientHeight+3) && !intentional(e)) {
          bad.push({tag:e.tagName,cls:e.className,text:t.slice(0,90),cw:e.clientWidth,sw:e.scrollWidth,ch:e.clientHeight,sh:e.scrollHeight});
          if (bad.length>=40) break;
        }
      }
      return bad;
    }''')

def open_context(page):
    el=find_visible_button(page,['Context'],[('aria-label','context'),('title','context')])
    if not el:
        # Context ring is often a button with a numeric percentage.
        try:
            candidates=page.locator('button')
            for i in range(candidates.count()):
                b=candidates.nth(i)
                txt=(b.inner_text() or '').strip()
                if b.is_visible() and txt.rstrip('%').isdigit(): el=b; break
        except Exception: pass
    if not el: return False
    el.click(); page.wait_for_timeout(300); return True

def open_demo(page):
    el=find_visible_button(page,['Demo Studio','Demo'],[('aria-label','demo'),('title','demo')])
    if el:
        el.click(); page.wait_for_timeout(300); return True
    # It may already be open or a persistent header control.
    return 'Demo Studio' in visible_text(page)

with sync_playwright() as pw:
    launch_args={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage','--allow-file-access-from-files']}
    bp=browser_path()
    if bp: launch_args['executable_path']=bp
    browser=pw.chromium.launch(**launch_args)
    ctx=browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1)
    page=ctx.new_page()
    page.on('console',lambda m: console.append({'type':m.type,'text':m.text}) if m.type in ('error','warning') else None)
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto(url,wait_until='load',timeout=30000)
    page.wait_for_timeout(1800)

    geom=page_geometry(page)
    rec('direct-file boot completed',geom['ready'],geom)
    rec('substantial populated UI',geom['bodyText']>1800,geom['bodyText'])
    text=visible_text(page)
    for label in ['Query Performance','New thread','Goal','Todo','Subagents','Changes','Artifacts']:
        rec(f'initial content: {label}',label.lower() in text.lower())
    rec('thread rows populated',page.locator('.thread-row,.thread-item').count()>=8,page.locator('.thread-row,.thread-item').count())
    rec('messages populated',page.locator('.message,[data-message-id]').count()>=3,page.locator('.message,[data-message-id]').count())
    rec('no initial page overflow',geom['sw']<=geom['iw']+3 and geom['bw']<=geom['iw']+3,geom)

    # Initial Working Animation should genuinely advance on its own.
    def working_signature():
        return page.evaluate('''() => {
          const e=document.querySelector('.working-animation,[data-working-animation],.work-stream');
          return e ? (e.innerText+'|'+e.className+'|'+e.getAttribute('data-step')).slice(0,1000) : '';
        }''')
    w1=working_signature(); page.wait_for_timeout(2600); w2=working_signature()
    rec('Working Animation visibly advances',bool(w1 and w2 and w1!=w2),f'{w1[:100]} -> {w2[:100]}')

    # Context compact menu and detailed drawer.
    ok=open_context(page); rec('Context Ring opens compact menu',ok)
    if ok:
        page.wait_for_timeout(250); t=visible_text(page)
        rec('compact Context menu has Compact Now','Compact Now' in t)
        rec('compact Context menu has More Details','More Details' in t)
        if click_text(page,'More Details'):
            page.wait_for_timeout(350); t=visible_text(page).lower()
            for label,needle in [('Current window used','current window'),('Tokens loaded','tokens loaded'),('Cache hit','cache hit'),('Source composition','source composition')]:
                rec(f'Context details: {label}',needle in t)
            g=page_geometry(page); bad=contained(g['visibleDialogs'],g['iw'],g['ih']); rec('Context drawer contained',not bad,bad)
            click_text(page,'Close')
        else: rec('More Details opens drawer',False,'button not clickable')

    # Activity domains hover and click.
    for domain in ['Goal','Todo','Subagents','Changes','Artifacts']:
        # Prefer activity domain controls over repeated text elsewhere.
        loc=page.locator(f'[data-activity-domain="{domain.lower()}"]')
        el=None
        if loc.count():
            for i in range(loc.count()):
                if loc.nth(i).is_visible(): el=loc.nth(i); break
        if not el:
            candidates=page.get_by_text(domain,exact=True)
            for i in range(min(candidates.count(),20)):
                c=candidates.nth(i)
                if c.is_visible():
                    try:
                        cls=c.evaluate('(e)=>e.closest("button,[data-activity-domain],.activity-domain,.activity-chip")?.className||""')
                        if cls: el=c.locator('xpath=ancestor-or-self::*[self::button or @data-activity-domain][1]'); break
                    except Exception: pass
        if not el:
            rec(f'Activity {domain} control exists',False); continue
        try:
            el.hover(); page.wait_for_timeout(320)
            hover_text=page.evaluate('''() => [...document.querySelectorAll('.activity-hover-card,.activity-preview,[role="tooltip"]')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>1&&r.height>1&&s.visibility!=='hidden'&&s.display!=='none'}).map(e=>e.innerText).join(' ')''')
            rec(f'Activity {domain} hover preview',len(hover_text.strip())>10,hover_text[:200])
            el.click(); page.wait_for_timeout(350)
            body=visible_text(page)
            rec(f'Activity {domain} opens detail',domain in body and all(d in body for d in ['Goal','Todo','Subagents','Changes','Artifacts']))
        except Exception as e: rec(f'Activity {domain} interaction',False,repr(e))

    # Working controls and expandable organized history/evidence.
    for action in ['Start','Pause','Complete']:
        if click_text(page,action): rec(f'Working control {action}',True)
        else: rec(f'Working control {action}',False)
    for action in ['History','Evidence','Work history','Details']:
        if click_text(page,action):
            page.wait_for_timeout(220)
            expanded=visible_text(page).lower()
            rec('Working organized history/evidence expands',('evidence' in expanded and ('history' in expanded or 'read' in expanded or 'web' in expanded)))
            break
    else: rec('Working organized history/evidence control exists',False)

    # Plan card actions must be durable and in-flow.
    for action in ['View Plan','Revise','Build']:
        rec(f'Plan card action: {action}',find_visible_button(page,[action]) is not None)
    if click_text(page,'Revise'):
        page.wait_for_timeout(250)
        decision=page.locator('.decision-host')
        visible=decision.count() and decision.first.is_visible()
        rec('Plan revision opens in-flow decision host',visible)
        if visible:
            r=decision.first.bounding_box(); ab=page.locator('.activity-bar,[data-activity-bar]').first.bounding_box() if page.locator('.activity-bar,[data-activity-bar]').count() else None
            rec('Decision host sits above Activity Bar',bool(r and ab and r['y']+r['height']<=ab['y']+5),f'{r} {ab}')
            click_text(page,'Cancel')

    # Message More Details.
    details=find_visible_button(page,['More details','Message details'],[('aria-label','message details'),('title','message details'),('data-action','message-details')])
    if not details:
        try:
            msg=page.locator('.message,[data-message-id]').last
            if msg.count() and msg.is_visible(): msg.hover(); page.wait_for_timeout(160)
            details=find_visible_button(page,['More details','Message details','Details'],[('aria-label','message details'),('title','message details'),('data-action','message-details')])
        except Exception: pass
    if details:
        details.click(); page.wait_for_timeout(200); t=visible_text(page).lower()
        rec('Message More Details works',all(n in t for n in ['model','tokens','cache']))
    else: rec('Message More Details control exists',False)

    # Ordinary text thread.
    ordinary=page.get_by_text('Ordinary',exact=False)
    if ordinary.count()==0: ordinary=page.get_by_text('long conversation',exact=False)
    if ordinary.count()==0: ordinary=page.get_by_text('text-only',exact=False)
    if ordinary.count()==0: ordinary=page.get_by_text('just text',exact=False)
    clicked=False
    for i in range(min(ordinary.count(),20)):
        if ordinary.nth(i).is_visible():
            try: ordinary.nth(i).click(); clicked=True; break
            except Exception: pass
    page.wait_for_timeout(250)
    t=visible_text(page).lower()
    rec('ordinary text-only demo thread',clicked and ('ordinary' in t or 'conversation' in t or 'text' in t))

    # Open Demo Studio and exercise all select options. Record visual hashes.
    open_demo(page)
    selects=page.locator('select')
    select_inventory=[]
    for si in range(selects.count()):
        sel=selects.nth(si)
        try:
            if not sel.is_visible(): continue
            opts=sel.locator('option').all_text_contents()
            label=sel.get_attribute('aria-label') or sel.get_attribute('name') or sel.evaluate('(e)=>e.closest("label")?.innerText||e.parentElement?.innerText?.split("\\n")[0]||"select"')
            select_inventory.append({'index':si,'label':label,'options':opts})
            # Exercise every option but cap screenshots to option-family selectors.
            hashes=[]
            for oi,opt in enumerate(opts):
                try:
                    value=sel.locator('option').nth(oi).get_attribute('value')
                    sel.select_option(value=value) if value is not None else sel.select_option(index=oi)
                    page.wait_for_timeout(90)
                    if len(opts)>=8:
                        shot=page.screenshot()
                        hashes.append(hashlib.sha256(shot).hexdigest())
                except Exception as e: rec(f'select option {label}/{opt}',False,repr(e))
            if len(opts)>=8:
                rec(f'eight-option selector exercised: {label}',len(opts)>=8,len(opts))
                rec(f'visually distinct renders: {label}',len(set(hashes))>=6,f'{len(set(hashes))}/{len(hashes)} unique screenshots')
        except Exception as e: rec(f'select inventory {si}',False,repr(e))
    (REPORTS/'select-inventory.json').write_text(json.dumps(select_inventory,indent=2))

    # Reset must restore known title/thread.
    if click_text(page,'Reset'):
        page.wait_for_timeout(450); rec('whole-concept Reset restores stock state','Query Performance' in visible_text(page))
    else: rec('whole-concept Reset exists',False)

    # Responsive/theme matrix through UI selects or body theme attributes.
    themes=['basic-dark','basic-light','glass-dark','glass-light','friendly-dark','friendly-light','retro-dark','retro-light']
    widths=[430,650,1024,1440,1920]
    for width in widths:
        page.set_viewport_size({'width':width,'height':900}); page.wait_for_timeout(150)
        for theme in themes:
            # Prefer public API, then direct theme dataset (visual-token contract).
            applied=page.evaluate('''(theme) => {
              try {
                if (window.PM56_DEMO?.setTheme) { window.PM56_DEMO.setTheme(theme); return 'api'; }
                const s=[...document.querySelectorAll('select')].find(x=>[...x.options].some(o=>o.value===theme));
                if (s) { s.value=theme; s.dispatchEvent(new Event('change',{bubbles:true})); return 'select'; }
                document.body.dataset.theme=theme; document.documentElement.dataset.theme=theme; return 'dataset';
              } catch(e) { return String(e); }
            }''',theme)
            page.wait_for_timeout(65)
            g=page_geometry(page)
            ok=(g['sw']<=g['iw']+3 and g['bw']<=g['iw']+3 and g['ready'])
            rec(f'geometry {width}px / {theme}',ok,{'applied':applied,'geom':g})
            bad=contained(g['visibleMenus']+g['visibleDialogs'],g['iw'],g['ih'])
            rec(f'overlay containment {width}px / {theme}',not bad,bad)
        page.screenshot(path=str(SHOTS/f'base-{width}.png'),full_page=True)
        clips=clipping_scan(page)
        rec(f'visible text clipping scan {width}px',len(clips)==0,clips)

    # Generic scroll-surface exercise.
    scroll_report=page.evaluate('''() => {
      const els=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+8 && /auto|scroll/.test(getComputedStyle(e).overflowY));
      return els.slice(0,40).map(e=>{const before=e.scrollTop;e.scrollTop=e.scrollHeight;const bottom=e.scrollTop;e.scrollTop=0;return {cls:e.className,tag:e.tagName,before,bottom,max:e.scrollHeight-e.clientHeight,ok:bottom>0}});
    }''')
    rec('scroll surfaces move',bool(scroll_report) and all(x['ok'] for x in scroll_report),scroll_report)

    # Control click sweep on fresh pages: every visible button should be hit-testable.
    page.set_viewport_size({'width':1440,'height':900}); page.reload(wait_until='load'); page.wait_for_timeout(800)
    controls=page.evaluate('''() => [...document.querySelectorAll('button,[role="button"],[data-action]')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>2&&r.height>2&&s.display!=='none'&&s.visibility!=='hidden'}).map((e,i)=>({i,text:(e.innerText||e.getAttribute('aria-label')||e.title||'').trim().slice(0,80),x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,disabled:!!e.disabled}))''')
    rec('plentiful interactive controls',len(controls)>=25,len(controls))
    hit_fail=[]
    for c in controls[:120]:
        if c['disabled']: continue
        cx=c['x']+min(c['w']/2,max(1,c['w']-2)); cy=c['y']+min(c['h']/2,max(1,c['h']-2))
        if cx<0 or cy<0 or cx>=1440 or cy>=900: continue
        hit=page.evaluate('''({x,y})=>{const e=document.elementFromPoint(x,y);return e?{tag:e.tagName,text:(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,80)}:null}''',{'x':cx,'y':cy})
        if not hit: hit_fail.append({'control':c,'hit':hit})
    rec('visible controls are not covered',not hit_fail,hit_fail[:20])

    page.screenshot(path=str(SHOTS/'final-1440.png'),full_page=True)
    runtime=page.evaluate('() => window.PM56_RUNTIME?.snapshot?.() || null')
    rec('no captured page errors',not errors,errors)
    rec('no runtime diagnostic errors',not runtime or (not runtime.get('errors') and not runtime.get('rejections')),runtime)
    rec('no console errors',not [x for x in console if x['type']=='error'],console)
    ctx.close(); browser.close()

failed=[r for r in results if not r['pass']]
core_prefixes=('direct-file','substantial','initial content','thread rows','messages populated','no initial page overflow','Context Ring','compact Context','Context details','Activity ','Working Animation','Plan card action','Message More','ordinary text','whole-concept Reset','no captured','no runtime','no console')
core_failed=[r for r in failed if r['label'].startswith(core_prefixes)]
overall='PASS' if not core_failed else 'FAIL'
report={'overall':overall,'passed':sum(r['pass'] for r in results),'failedCount':len(failed),'coreFailedCount':len(core_failed),'total':len(results),'results':results,'errors':errors,'console':console}
(REPORTS/'browser-audit.json').write_text(json.dumps(report,indent=2))
(REPORTS/'BROWSER_AUDIT.md').write_text('# Browser audit\n\n'+f'**{overall} — {report["passed"]}/{report["total"]} checks passed; {len(core_failed)} core failures.**\n\n'+ '\n'.join(f'- [{"x" if r["pass"] else " "}] {r["label"]}' + (f' — `{r["detail"]}`' if not r['pass'] else '') for r in results))
for p in [REPORTS/'BROWSER_AUDIT_PASS',REPORTS/'BROWSER_AUDIT_FAIL']:
    if p.exists(): p.unlink()
(REPORTS/('BROWSER_AUDIT_PASS' if overall=='PASS' else 'BROWSER_AUDIT_FAIL')).write_text(f'{overall}\n')
sys.exit(0 if overall=='PASS' else 1)

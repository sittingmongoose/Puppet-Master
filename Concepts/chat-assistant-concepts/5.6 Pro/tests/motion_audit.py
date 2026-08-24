from __future__ import annotations
from pathlib import Path
import json, sys, shutil, hashlib, time, math

ROOT=Path(__file__).resolve().parents[1]
REPORTS=ROOT/'reports'; MOTION=ROOT/'evidence'/'motion'; FRAMES=MOTION/'frames'; CONTACT=MOTION/'contact_sheets'
for p in [REPORTS,MOTION,FRAMES,CONTACT]: p.mkdir(parents=True,exist_ok=True)
try:
    from playwright.sync_api import sync_playwright
    from PIL import Image, ImageOps, ImageDraw
except Exception as e:
    (REPORTS/'motion-audit.json').write_text(json.dumps({'overall':'MISSING','reason':repr(e)},indent=2)); sys.exit(2)

def browser_path():
    for p in [shutil.which('chromium'),shutil.which('chromium-browser'),shutil.which('google-chrome'),'/usr/bin/chromium','/opt/google/chrome/chrome']:
        if p and Path(p).exists(): return str(p)
    return None

def click_named(page,names):
    for n in names:
        try:
            loc=page.get_by_role('button',name=n,exact=False)
            for i in range(min(loc.count(),15)):
                if loc.nth(i).is_visible(): loc.nth(i).click(); page.wait_for_timeout(120); return True
        except Exception: pass
    return False

def make_contact(paths,out,title):
    imgs=[Image.open(p).convert('RGB') for p in paths if Path(p).exists()]
    if not imgs: return
    target_w=320
    thumbs=[]
    for im in imgs:
        ratio=target_w/im.width; h=max(1,int(im.height*ratio)); thumbs.append(im.resize((target_w,h)))
    cols=4; rows=math.ceil(len(thumbs)/cols); pad=18; label_h=38
    cell_h=max(i.height for i in thumbs)+label_h
    canvas=Image.new('RGB',(cols*target_w+(cols+1)*pad,rows*cell_h+(rows+1)*pad),(18,19,26))
    d=ImageDraw.Draw(canvas)
    d.text((pad,4),title,fill=(240,240,246))
    for i,im in enumerate(thumbs):
        x=pad+(i%cols)*(target_w+pad); y=pad+(i//cols)*cell_h+label_h
        canvas.paste(im,(x,y)); d.text((x,y-18),f'{i:02d}',fill=(190,190,202))
    canvas.save(out,quality=90)

def sequence_hashes(paths):
    vals=[]
    for p in paths:
        try:
            im=Image.open(p).convert('L').resize((32,18))
            vals.append(hashlib.sha256(im.tobytes()).hexdigest())
        except Exception: pass
    return vals

url=(ROOT/'index.html').resolve().as_uri(); sequences=[]; failures=[]
with sync_playwright() as pw:
    args={'headless':True,'args':['--no-sandbox','--allow-file-access-from-files','--disable-dev-shm-usage']}
    bp=browser_path()
    if bp: args['executable_path']=bp
    browser=pw.chromium.launch(**args)
    context=browser.new_context(viewport={'width':1440,'height':900},record_video_dir=str(MOTION/'videos'),record_video_size={'width':1440,'height':900})
    page=context.new_page(); page.goto(url,wait_until='load'); page.wait_for_timeout(900)

    # Locate the Working Animation option selector by its options.
    working_sel=None; working_options=[]
    sels=page.locator('select')
    for i in range(sels.count()):
        s=sels.nth(i)
        try:
            opts=s.locator('option').all_text_contents()
            if any('Reference Morph' in o for o in opts) or any('Progressive Receipt' in o for o in opts):
                working_sel=s; working_options=opts; break
        except Exception: pass
    if not working_sel:
        click_named(page,['Demo Studio','Demo'])
        page.wait_for_timeout(200)
        sels=page.locator('select')
        for i in range(sels.count()):
            s=sels.nth(i); opts=s.locator('option').all_text_contents()
            if any('Reference Morph' in o for o in opts): working_sel=s; working_options=opts; break

    if working_sel:
        for oi,opt in enumerate(working_options[:8]):
            try:
                val=working_sel.locator('option').nth(oi).get_attribute('value')
                working_sel.select_option(value=val) if val is not None else working_sel.select_option(index=oi)
                page.wait_for_timeout(180)
                click_named(page,['Reset work','Reset Working','Restart work'])
                click_named(page,['Start work','Start'])
                paths=[]
                for fi in range(12):
                    p=FRAMES/f'working-{oi+1:02d}-{fi:02d}.png'; page.screenshot(path=str(p)); paths.append(p); page.wait_for_timeout(430)
                hs=sequence_hashes(paths); distinct=len(set(hs))
                make_contact(paths,CONTACT/f'working-{oi+1:02d}.jpg',f'Working take {oi+1}: {opt}')
                sequences.append({'name':f'working-{oi+1}','label':opt,'frames':len(paths),'distinctFrames':distinct,'pass':distinct>=5})
                if distinct<5: failures.append(f'{opt}: only {distinct} distinct frames')
            except Exception as e:
                failures.append(f'working {oi+1}: {e!r}')
    else:
        failures.append('Working Animation selector not found')

    # Questionnaire prepare -> body -> submit sequence.
    page.reload(wait_until='load'); page.wait_for_timeout(600); click_named(page,['Demo Studio','Demo'])
    clicked=bool(page.evaluate('''() => { try { if (window.PM56_DEMO?.trigger) { window.PM56_DEMO.trigger('questionnaire'); return true; } if (window.PM56_DEMO?.showQuestionnaire) { window.PM56_DEMO.showQuestionnaire(); return true; } } catch(e) {} return false; }'''))
    trigger=page.get_by_text('Questionnaire',exact=False)
    for i in range(min(trigger.count(),20)):
        if clicked: break
        if trigger.nth(i).is_visible():
            try: trigger.nth(i).click(); clicked=True; break
            except Exception: pass
    qpaths=[]
    for fi in range(10):
        p=FRAMES/f'questionnaire-{fi:02d}.png'; page.screenshot(path=str(p)); qpaths.append(p); page.wait_for_timeout(330)
    if click_named(page,['Submit','Continue']):
        for fi in range(10,15):
            p=FRAMES/f'questionnaire-{fi:02d}.png'; page.screenshot(path=str(p)); qpaths.append(p); page.wait_for_timeout(250)
    qdistinct=len(set(sequence_hashes(qpaths))); make_contact(qpaths,CONTACT/'questionnaire.jpg','Questionnaire prepare, page, and submit')
    sequences.append({'name':'questionnaire','frames':len(qpaths),'distinctFrames':qdistinct,'pass':clicked and qdistinct>=3})
    if not clicked or qdistinct<3: failures.append('questionnaire motion sequence insufficient')

    # Model root and hover sidecar motion.
    page.reload(wait_until='load'); page.wait_for_timeout(500)
    mpaths=[]
    # Try current model names and semantic label.
    click_named(page,['Sonnet','Model'])
    for fi in range(4):
        p=FRAMES/f'model-menu-{fi:02d}.png'; page.screenshot(path=str(p)); mpaths.append(p); page.wait_for_timeout(160)
    # Hover first likely model row.
    rows=page.locator('.model-row,[data-model-id],[role="option"]')
    for i in range(min(rows.count(),10)):
        if rows.nth(i).is_visible():
            try: rows.nth(i).hover(); break
            except Exception: pass
    for fi in range(4,10):
        p=FRAMES/f'model-menu-{fi:02d}.png'; page.screenshot(path=str(p)); mpaths.append(p); page.wait_for_timeout(150)
    mdistinct=len(set(sequence_hashes(mpaths))); make_contact(mpaths,CONTACT/'model-sidecar.jpg','Model picker and effort sidecar')
    sequences.append({'name':'model-sidecar','frames':len(mpaths),'distinctFrames':mdistinct,'pass':mdistinct>=2})
    if mdistinct<2: failures.append('model sidecar motion not visible')

    # Activity hover -> click -> pin.
    page.reload(wait_until='load'); page.wait_for_timeout(500); apaths=[]
    goal=page.locator('[data-activity-domain="goal"],.activity-domain,.activity-chip').first
    if goal.count() and goal.is_visible():
        for fi in range(2):
            p=FRAMES/f'activity-{fi:02d}.png'; page.screenshot(path=str(p)); apaths.append(p); page.wait_for_timeout(120)
        goal.hover();
        for fi in range(2,5):
            p=FRAMES/f'activity-{fi:02d}.png'; page.screenshot(path=str(p)); apaths.append(p); page.wait_for_timeout(160)
        goal.click();
        for fi in range(5,9):
            p=FRAMES/f'activity-{fi:02d}.png'; page.screenshot(path=str(p)); apaths.append(p); page.wait_for_timeout(160)
        click_named(page,['Pin'])
        for fi in range(9,13):
            p=FRAMES/f'activity-{fi:02d}.png'; page.screenshot(path=str(p)); apaths.append(p); page.wait_for_timeout(160)
    adistinct=len(set(sequence_hashes(apaths))); make_contact(apaths,CONTACT/'activity-panel.jpg','Activity hover, open, and pin')
    sequences.append({'name':'activity','frames':len(apaths),'distinctFrames':adistinct,'pass':len(apaths)>=9 and adistinct>=3})
    if len(apaths)<9 or adistinct<3: failures.append('activity motion sequence insufficient')

    # Message arrival spatial continuity.
    page.reload(wait_until='load'); page.wait_for_timeout(500); msgpaths=[]
    for fi in range(3):
        p=FRAMES/f'message-arrival-{fi:02d}.png'; page.screenshot(path=str(p)); msgpaths.append(p); page.wait_for_timeout(120)
    box=page.locator('textarea').last
    if box.count() and box.is_visible():
        box.fill('Show a compact status update with no tools.')
        click_named(page,['Send'])
    for fi in range(3,11):
        p=FRAMES/f'message-arrival-{fi:02d}.png'; page.screenshot(path=str(p)); msgpaths.append(p); page.wait_for_timeout(180)
    xdistinct=len(set(sequence_hashes(msgpaths))); make_contact(msgpaths,CONTACT/'message-arrival.jpg','Message arrival spatial continuity')
    sequences.append({'name':'message-arrival','frames':len(msgpaths),'distinctFrames':xdistinct,'pass':xdistinct>=2})
    if xdistinct<2: failures.append('message arrival did not visibly change')

    page.close(); context.close(); browser.close()

report={'overall':'PASS' if not failures else 'FAIL','sequences':sequences,'failures':failures,'videos':len(list((MOTION/'videos').glob('*'))),'contactSheets':len(list(CONTACT.glob('*.jpg'))),'frames':len(list(FRAMES.glob('*.png')))}
(REPORTS/'motion-audit.json').write_text(json.dumps(report,indent=2))
(REPORTS/'MOTION_AUDIT.md').write_text('# Motion audit\n\n'+f'**{report["overall"]}**\n\n'+ '\n'.join(f'- [{"x" if s["pass"] else " "}] {s["name"]}: {s["distinctFrames"]} distinct frames across {s["frames"]} captures' for s in sequences) + ('\n\nFailures:\n'+ '\n'.join(f'- {x}' for x in failures) if failures else ''))
for p in [REPORTS/'MOTION_AUDIT_PASS',REPORTS/'MOTION_AUDIT_FAIL']:
    if p.exists(): p.unlink()
(REPORTS/('MOTION_AUDIT_PASS' if not failures else 'MOTION_AUDIT_FAIL')).write_text(report['overall'])
sys.exit(0 if not failures else 1)

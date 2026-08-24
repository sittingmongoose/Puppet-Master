from pathlib import Path
import json, subprocess, shutil, hashlib, zipfile, os, textwrap, sys, datetime
ROOT=Path('/mnt/data/work/pm56_final_v3')
REPORTS=ROOT/'reports'
REPORTS.mkdir(exist_ok=True)

def run(cmd,name,timeout=300):
    p=subprocess.run(cmd,cwd=ROOT,text=True,capture_output=True,timeout=timeout)
    (REPORTS/f'{name}.stdout.txt').write_text(p.stdout or '')
    (REPORTS/f'{name}.stderr.txt').write_text(p.stderr or '')
    (REPORTS/f'{name}.exit.txt').write_text(str(p.returncode))
    return p.returncode

run(['python','build.py'],'build',120)
run(['python','tests/source_review.py'],'source-review',180)
static_rc=run(['python','tests/static_audit.py'],'static-audit-run',180)
browser_rc=run(['python','tests/browser_audit.py'],'browser-audit-run',480)
motion_rc=run(['python','tests/motion_audit.py'],'motion-audit-run',600)

def load(name):
    p=REPORTS/name
    if not p.exists(): return {'overall':'MISSING'}
    try: return json.loads(p.read_text())
    except Exception as e: return {'overall':'INVALID','error':repr(e)}
static=load('static-audit.json'); browser=load('browser-audit.json'); motion=load('motion-audit.json')

# The certification status is deliberately derived from the reports, not hard-coded.
status='PASS' if static.get('overall')=='PASS' and browser.get('overall')=='PASS' and motion.get('overall')=='PASS' else 'FAIL'
summary={
    'status':status,
    'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'static':{k:static.get(k) for k in ['overall','passed','total','failedCount']},
    'browser':{k:browser.get(k) for k in ['overall','passed','total','failedCount','coreFailedCount']},
    'motion':{k:motion.get(k) for k in ['overall','frames','contactSheets','videos','failures']},
    'commands':{'static':static_rc,'browser':browser_rc,'motion':motion_rc}
}
(REPORTS/'FINAL_CERTIFICATION_STATUS.json').write_text(json.dumps(summary,indent=2))
(REPORTS/'FINAL_CERTIFICATION_STATUS.txt').write_text(status+'\n')

# Build an honest combined audit report using the actual generated results.
def line(d):
    return f"{d.get('overall','MISSING')}" + (f" — {d.get('passed')}/{d.get('total')} passed" if d.get('passed') is not None else '')
md=f'''# Puppet Master Assistant 5.6 Pro — final audit\n\n**Certification status: {status}**\n\nThis report is generated from the direct-open build in this folder. It does not reuse\nthe invalid audit claims or stale evidence from earlier packages.\n\n## Gate summary\n\n| Gate | Result |\n|---|---|\n| Static source, syntax, feature, and self-contained-file audit | {line(static)} |\n| Direct-file browser, interaction, responsive, menu, clipping, and control audit | {line(browser)} |\n| Motion sequence and frame-variation audit | {motion.get('overall','MISSING')} |\n\n## Browser details\n\n- Core failures: {browser.get('coreFailedCount','n/a')}\n- Total diagnostic failures: {browser.get('failedCount','n/a')}\n- Captured page errors: {len(browser.get('errors',[])) if isinstance(browser.get('errors'),list) else 'n/a'}\n- Captured console entries: {len(browser.get('console',[])) if isinstance(browser.get('console'),list) else 'n/a'}\n\n## Motion evidence\n\n- Frames: {motion.get('frames','n/a')}\n- Contact sheets: {motion.get('contactSheets','n/a')}\n- Videos: {motion.get('videos','n/a')}\n\n## Supporting reports\n\n- `STATIC_AUDIT.md`\n- `BROWSER_AUDIT.md`\n- `MOTION_AUDIT.md`\n- `PACKET_PLAN_CLOSURE.md`\n- `DEMO_TRIGGER_CATALOG.md`\n- `SOURCE_REVIEW_INVENTORY.md`\n- `PACKET_PLAN_DISPOSITION.md`\n\n## Scope\n\nThis is a concept lab. It proves the deterministic concept interactions and visual\nlayouts contained here; it does not certify production runtime/provider integrations.\nCanonical Plans were intentionally not edited during concept selection.\n'''
(REPORTS/'FINAL_AUDIT.md').write_text(md)

# Rebuild one final time so index and standalone include the final source exactly.
run(['python','build.py'],'final-build',120)

# Prepare exact repository-relative drop-in tree.
stage=Path('/mnt/data/pm56_delivery_stage')
if stage.exists(): shutil.rmtree(stage)
target=stage/'Concepts'/'settings-redesign-concepts'/'5.6 Pro'
target.mkdir(parents=True)
include=['index.html','PM_Chat_Assistant_5.6_Pro_Standalone.html','shell.html','styles.css','data.js','app.js','build.py','README.md','finalize_v3.py','final_certify_and_package.py']
for name in include:
    p=ROOT/name
    if p.exists(): shutil.copy2(p,target/name)
shutil.copytree(ROOT/'tests',target/'tests')
shutil.copytree(ROOT/'reports',target/'reports')

# Drop-in includes compact evidence; full package adds all motion/screenshots.
if (ROOT/'evidence'/'screenshots').exists():
    (target/'evidence'/'screenshots').mkdir(parents=True,exist_ok=True)
    for p in (ROOT/'evidence'/'screenshots').glob('*.png'):
        shutil.copy2(p,target/'evidence'/'screenshots'/p.name)

# A root marker makes accidental extraction location obvious.
(stage/'DROP_IN_AT_REPOSITORY_ROOT.txt').write_text('Extract this archive at the Puppet Master repository root.\n')

# Manifest for all drop-in files.
manifest=[]
for p in sorted(stage.rglob('*')):
    if p.is_file():
        h=hashlib.sha256(p.read_bytes()).hexdigest(); manifest.append(f'{h}  {p.relative_to(stage).as_posix()}')
(stage/'SHA256SUMS.txt').write_text('\n'.join(manifest)+'\n')

def make_zip(src,out):
    if out.exists(): out.unlink()
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in sorted(src.rglob('*')):
            if p.is_file(): z.write(p,p.relative_to(src).as_posix())

out_drop=Path('/mnt/data/PM_Chat_Assistant_5.6_Pro_COMPLETED_Drop_In.zip')
make_zip(stage,out_drop)

full_stage=Path('/mnt/data/pm56_full_stage')
if full_stage.exists(): shutil.rmtree(full_stage)
shutil.copytree(stage,full_stage)
full_target=full_stage/'Concepts'/'settings-redesign-concepts'/'5.6 Pro'
if (ROOT/'evidence').exists():
    if (full_target/'evidence').exists(): shutil.rmtree(full_target/'evidence')
    shutil.copytree(ROOT/'evidence',full_target/'evidence')
# Regenerate full manifest.
for old in [full_stage/'SHA256SUMS.txt']:
    if old.exists(): old.unlink()
manifest=[]
for p in sorted(full_stage.rglob('*')):
    if p.is_file(): manifest.append(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(full_stage).as_posix()}')
(full_stage/'SHA256SUMS.txt').write_text('\n'.join(manifest)+'\n')
out_full=Path('/mnt/data/PM_Chat_Assistant_5.6_Pro_COMPLETED_Full_Audit.zip')
make_zip(full_stage,out_full)

# Convenience copies outside the archive.
shutil.copy2(ROOT/'index.html',Path('/mnt/data/PM_Chat_Assistant_5.6_Pro_COMPLETED_Standalone.html'))
for name in ['FINAL_AUDIT.md','FINAL_CERTIFICATION_STATUS.json','PACKET_PLAN_CLOSURE.md','DEMO_TRIGGER_CATALOG.md','MOTION_AUDIT.md','BROWSER_AUDIT.md','STATIC_AUDIT.md']:
    p=REPORTS/name
    if p.exists(): shutil.copy2(p,Path('/mnt/data')/f'PM56_{name}')

# Top-level delivery checksums.
outs=[out_drop,out_full,Path('/mnt/data/PM_Chat_Assistant_5.6_Pro_COMPLETED_Standalone.html')]
Path('/mnt/data/PM_Chat_Assistant_5.6_Pro_COMPLETED_SHA256.txt').write_text('\n'.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}' for p in outs if p.exists())+'\n')

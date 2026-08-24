#!/usr/bin/env python3
from pathlib import Path
import json,re,subprocess,sys
ROOT=Path('/mnt/data/work/pm56_pro_reaudit');R=ROOT/'reports';R.mkdir(exist_ok=True)
files={n:(ROOT/n).read_text(errors='ignore') for n in ['index.html','styles.css','data.js','app.js']}
checks=[]
def add(label,cond,detail=''):checks.append({'label':label,'status':'PASS' if cond else 'FAIL','detail':detail})
for n,s in files.items():add(f'file:{n}:nonempty',len(s)>500,f'{len(s)} bytes')
for js in ['data.js','app.js']:
    p=subprocess.run(['node','--check',str(ROOT/js)],capture_output=True,text=True)
    add(f'javascript:{js}:syntax',p.returncode==0,p.stderr[-1000:])
# CSS brace/comment sanity.
css=re.sub(r'/\*.*?\*/','',files['styles.css'],flags=re.S)
add('css:balanced-braces',css.count('{')==css.count('}'),f"{css.count('{')} opens / {css.count('}')} closes")
add('html:single-overlay-root',files['index.html'].count('id="overlay-root"')==1,str(files['index.html'].count('id="overlay-root"')))
required={
 'history pinned default':r'historyPinned\s*:\s*true',
 'archive support':r'archiv', 'thread search':r'thread.{0,20}search|search.{0,20}thread',
 'overlay manager':r'class\s+OverlayManager|OverlayManager\s*=',
 'overlay positioning':r'getBoundingClientRect', 'portal root':r'overlay-root',
 'eight themes':r'glass-light', 'worktree selector':r'worktree',
 'permissions selector':r'Ask for approval|Full Access', 'wand':r'Context Lens|context-lens',
 'goal mode':r'Goal Mode|goal-mode', 'thought stream':r'Thought Stream|thought-stream',
 'subcompact apply':r'Apply Subcompact|apply-subcompact',
 'model favorites':r'Favorites', 'configured providers':r'configured',
 'fast mode':r'Fast mode|fast-mode|Fast', 'effort sidecar':r'effort',
 'working animation':r'Working Animation|working-animation', 'web search state':r'web-search|Web Search',
 'web fetch state':r'web-fetch|Web Fetch', 'browser control state':r'browser-control|Browser Control',
 'bash state':r'Bash|bash', 'program testing':r'program-test|Program Test',
 'subagents':r'subagent', 'activity bar':r'activity-bar',
 'activity detail':r'activity-detail', 'goal domain':r'goal', 'todo domain':r'todo',
 'changes domain':r'change', 'artifacts domain':r'artifact',
 'read-only child thread':r'read.only|read-only', 'exact change range':r'changeRange|lineRange|range',
 'plan card':r'plan-card', 'approve and build':r'Approve And Build', 'revise':r'Revise',
 'questionnaire':r'questionnaire', 'question queue':r'questionQueue|queued question|question-queue',
 'mermaid':r'mermaid', 'interactive visualizer':r'visualizer', 'generated image':r'generated-image|Generated Image',
 'slash goal':r'/goal', 'slash plan':r'/plan', 'slash deep plan':r'/deep-plan|/deepplan', 'slash debug':r'/debug',
 'long collapse':r'collapse|expanded', 'no generic resend':r'',
 'eight recipes':r'recipes', 'component families':r'families', 'demo triggers':r'triggerDemo|demoTriggers|PM56_DEMO',
 'context details':r'Context More Details|context-details',
}
combined='\n'.join(files.values())
for label,pat in required.items():
    if label=='no generic resend': add(label,not re.search(r'\bResend\b',combined,re.I),'generic Resend absent')
    else:add(f'feature:{label}',bool(re.search(pat,combined,re.I|re.S)),pat)
# UI emoji range excluding source comments is a warning/failure for interface source.
emoji=re.findall(r'[\U0001F300-\U0001FAFF]',combined)
add('icons:no-emoji-interface-glyphs',not emoji,f'{len(emoji)} emoji codepoints')
# History content may not be opacity-hidden except explicit history-hidden state.
csslines=files['styles.css'].splitlines(); bad=[]
for i,l in enumerate(csslines):
    if re.search(r'thread-history|history-panel|thread-title|thread-group',l,re.I):
        block='\n'.join(csslines[i:i+14])
        if re.search(r'opacity\s*:\s*0(?:\D|$)',block) and 'history-hidden' not in block and 'thread-more' not in block:bad.append((i+1,l.strip()))
add('history:not-hover-hidden',not bad,str(bad[:8]))
# Overlay z-order/portal safety.
add('css:overlay-fixed',bool(re.search(r'#overlay-root[\s\S]{0,500}position\s*:\s*fixed',files['styles.css'],re.I)),'')
add('css:overlay-overflow-visible',bool(re.search(r'#overlay-root[\s\S]{0,500}overflow\s*:\s*visible',files['styles.css'],re.I)),'')
add('css:sidecar-animation',bool(re.search(r'pm-sidecar-enter|sidecar[^\{]*\{[^\}]*animation',files['styles.css'],re.I|re.S)),'')
status='PASS' if all(c['status']=='PASS' for c in checks) else 'FAIL'
out={'overall':status,'passed':sum(c['status']=='PASS' for c in checks),'failed':sum(c['status']=='FAIL' for c in checks),'checks':checks}
(R/'static-audit.json').write_text(json.dumps(out,indent=2));(R/'STATIC_AUDIT_STATUS.txt').write_text(status+'\n')
(R/'STATIC_AUDIT.md').write_text('# Static Audit\n\n**Overall:** '+status+'\n\n| Check | Status | Detail |\n|---|---|---|\n'+'\n'.join(f"| {c['label']} | {c['status']} | {str(c['detail']).replace('|','\\|')} |" for c in checks)+'\n')
marker=R/'STATIC_AUDIT_PASS'
if status=='PASS':marker.write_text('PASS\n')
elif marker.exists():marker.unlink()
sys.exit(0 if status=='PASS' else 1)

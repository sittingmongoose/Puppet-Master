#!/usr/bin/env python3
"""Source-built presentation rollback on the exact published current checkpoint.
The old full Settings builder does not reproduce current main. Do not use its
older base to discard newer inventory/tour changes. This lane changes CSS only.
"""
from pathlib import Path
import argparse,hashlib,json,re,subprocess,tempfile
HERE=Path(__file__).resolve().parent
def sha(x):return hashlib.sha256(x).hexdigest()
def build():
    ap=argparse.ArgumentParser();ap.add_argument('--out',type=Path,default=HERE.parent/'TestPMConcept.html');ap.add_argument('--check',action='store_true');ap.add_argument('--report',type=Path);a=ap.parse_args()
    pin=json.loads((HERE/'layout_b06_checkpoint.json').read_text());data=(HERE/'base/TestPMConcept-layout-b06-base.html').read_bytes()
    if sha(data)!=pin['sha256']:raise SystemExit('Published checkpoint mismatch; no silent repin.')
    src=data.decode('utf-8');css=(HERE/'assistant_narrow_source.css').read_text(encoding='utf-8')
    pat=r'(<style\b[^>]*id="pm50-manager-layout"[^>]*>)(.*?)(</style>)';matches=list(re.finditer(pat,src,re.S))
    if len(matches)!=1:raise SystemExit('Expected exactly one video-layout style owner.')
    m=matches[0];result=src[:m.start(2)]+'\n'+css+'\n'+src[m.end(2):]
    scripts=r'<script\b[^>]*>.*?</script>'
    if re.findall(scripts,src,re.S)!=re.findall(scripts,result,re.S):raise SystemExit('Script mutation forbidden in layout rollback.')
    out=result.encode('utf-8');report={'status':'pass','lane':'published_current_checkpoint_css_only','base_sha256':sha(data),'output_sha256':sha(out),'all_scripts_byte_identical':True,'only_style_id_changed':'pm50-manager-layout','full_upstream_build':'not_run; old dedicated Settings builder fails on the current published baseline'}
    if a.check:
        if not a.out.is_file() or a.out.read_bytes()!=out:raise SystemExit('Output differs from source rollback build.')
    else:a.out.parent.mkdir(parents=True,exist_ok=True);a.out.write_bytes(out)
    if a.report:a.report.parent.mkdir(parents=True,exist_ok=True);a.report.write_text(json.dumps(report,indent=2)+'\n')
    print(('Checked' if a.check else 'Built')+' '+str(a.out)+' '+sha(out))
if __name__=='__main__':build()

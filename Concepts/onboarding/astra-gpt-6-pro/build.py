#!/usr/bin/env python3
"""Build only the Astra copy, removing both old systems before inlining the new ones.
Usage: python3 Concepts/onboarding/astra-gpt-6-pro/build.py
The original TestPMConcept.html and all shared source modules remain read-only.
"""
from pathlib import Path
import re, hashlib, json
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
SOURCE=ROOT/'Concepts/TestPMConcept.html'
TARGET=ROOT/'Concepts/TestAstraPmConcept.html'
# __file__ is Concepts/onboarding/astra-gpt-6-pro/build.py; parents[2] = repository root.
def remove_element(text: str, element_id: str) -> str:
    m=re.search(r'<(?P<tag>[\w-]+)\b[^>]*\bid=["\']'+re.escape(element_id)+r'["\'][^>]*>',text)
    if not m:
        raise RuntimeError(f'Missing source boundary: {element_id}')
    tag=m.group('tag'); depth=1
    for item in re.finditer(r'</?'+re.escape(tag)+r'\b[^>]*>',text[m.end():],re.I):
        depth += -1 if item.group().startswith('</') else 1
        if depth==0:return text[:m.start()]+text[m.end()+item.end():]
    raise RuntimeError(f'Unclosed source boundary: {element_id}')
def build():
    original=SOURCE.read_bytes();text=original.decode('utf-8')
    if hashlib.sha256(original).hexdigest() != 'ea9c502a1c4a456f3e092c45d3524105153f9bba52d36f26fbfad922e885a4ef':
        raise RuntimeError('Baseline changed; review new source boundaries before rebuilding Astra.')
    for tag, ids in [('style',['pm7-onboarding-css','pm7-guided-tour-css']),('script',['pm7-onboarding-js','pm7-guided-tour-js'])]:
        for ident in ids:
            rx=r'<'+tag+r'\b[^>]*id=["\']'+ident+r'["\'][^>]*>[\s\S]*?</'+tag+r'>'
            text,n=re.subn(rx,'',text,count=1)
            if n!=1:raise RuntimeError(f'Expected exactly one {ident}')
    for ident in ['pm7-onboarding','pm7-onboarding-resume','pm7-guided-tour','pm7-guided-tour-resume','pm7-guided-tour-replay']:
        text=remove_element(text,ident)
    css=(HERE/'astra.css').read_text()
    scripts='\n'.join((HERE/n).read_text() for n in ['art.js','onboarding.js','tour.js'] if (HERE/n).exists())
    # Expose the EXISTING Settings Transfer implementation to the copied concept.
    # This adds no alternate copy producer and changes no shared source file.
    anchor='      closeTransientUi:()=>{hideTooltip();closeSearch();closeOverlay(false);'
    assert text.count(anchor)==1, 'Settings owner export anchor drifted'
    text=text.replace(anchor, '      astraSettingsTransfer:{sources:settingsCopySources,preview:prepareDetachedSettingsCopy,apply:applyDetachedSettingsCopy},\n'+anchor,1)
    # Restore the entire tour snapshot through the SAME validated, transactional
    # layout owner. No localStorage write bypass or alternate layout store.
    layout_anchor='    failNextPersistenceWrite: function () { faults.failNextWrite = true; },'
    assert text.count(layout_anchor)==1, 'Workspace owner export anchor drifted'
    text=text.replace(layout_anchor, '    astraRestoreSnapshot: function (snapshot) { var problem = validateLayout(snapshot); if (problem) return { ok: false, reason: problem }; var result = commitLayout(clone(snapshot), "recovery", "cmd.workspace_layout.reset", { skip_render: true, command_payload: { restore_source: "astra_guided_tour" } }); syncHostGeometry(committed); renderLayout(clone(committed)); return result; },\n'+layout_anchor,1)
    text=re.sub(r'<title>.*?</title>','<title>Astra · Puppet Master onboarding</title>',text,count=1,flags=re.S)
    text=text.replace('</head>',f'<style id="astra-style">\n{css}\n</style>\n</head>',1)
    text=text.replace('</body>',f'<script id="astra-runtime">\n{scripts}\n</script>\n</body>',1)
    text='<!-- ASTRA: isolated interactive concept. Original TestPMConcept is read-only. Rebuild from Concepts/onboarding/astra-gpt-6-pro/build.py. -->\n'+text
    TARGET.write_text(text,encoding='utf-8')
    assert SOURCE.read_bytes()==original,'Source was modified'
    print(json.dumps({'source_sha256':hashlib.sha256(original).hexdigest(),'output_sha256':hashlib.sha256(TARGET.read_bytes()).hexdigest(),'output_bytes':TARGET.stat().st_size,'output':str(TARGET)},indent=2))
if __name__=='__main__':build()

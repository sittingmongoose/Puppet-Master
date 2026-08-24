import hashlib, sys
from pathlib import Path
root=Path(__file__).resolve().parent
shell=(root/'shell.html').read_text()
css=(root/'styles.css').read_text()+'\n'+(root/'motion.css').read_text()+'\n'+(root/'variants-a.css').read_text()+'\n'+(root/'variants-b.css').read_text()+'\n'+(root/'variants-c.css').read_text()+'\n'+(root/'transcripts.css').read_text()
data=(root/'data.js').read_text()+'\n'+(root/'motion.js').read_text()+'\n'+(root/'variants-a.js').read_text()+'\n'+(root/'variants-b.js').read_text()+'\n'+(root/'variants-c.js').read_text()
app=(root/'app.js').read_text()
boot='''<script>
window.__PM56_BOOT_OK=false;
window.addEventListener('error',function(e){setTimeout(function(){if(window.__PM56_BOOT_OK)return;var r=document.getElementById('pmRoot');if(r)r.innerHTML='<div style="font:14px system-ui;padding:24px;color:#fff;background:#24131a;height:100vh"><h1>Assistant Concept Lab failed to start</h1><p>'+String(e.message||'Unknown startup error')+'</p></div>';},0);});
setTimeout(function(){if(!window.__PM56_BOOT_OK){var r=document.getElementById('pmRoot');if(r&&!r.textContent.trim())r.innerHTML='<div style="font:14px system-ui;padding:24px;color:#fff;background:#24131a;height:100vh"><h1>Assistant Concept Lab did not initialize</h1></div>'; }},2500);
</script>'''
shell=shell.replace('<script>/*__PM_DATA__*/</script>',boot+'\n  <script>/*__PM_DATA__*/</script>')
app=app.replace('  renderApp(false);','  renderApp(false);\n  window.__PM56_BOOT_OK=true;',1)
out=shell.replace('/*__PM_STYLES__*/',css).replace('/*__PM_DATA__*/',data).replace('/*__PM_APP__*/',app)
targets=[root/'index.html', root/'PM_Chat_Assistant_5.6_Pro_Standalone.html']
digest=hashlib.sha256(out.encode()).hexdigest()

if '--check' in sys.argv:
    # Both deliverables must be byte-identical to a fresh build. index.html
    # was once hand-patched with <link>/<script> tags, which silently gave
    # it a second copy of app.js -- two state closures, two work timers --
    # and broke the "byte-identical" claim in the README. This gate makes
    # that class of drift a build failure instead of a discovery.
    bad=[]
    for t in targets:
        if not t.exists(): bad.append(f'{t.name}: missing')
        elif hashlib.sha256(t.read_text().encode()).hexdigest()!=digest:
            bad.append(f'{t.name}: differs from a fresh build')
    if bad:
        print('BUILD CHECK FAILED'); [print('  -',b) for b in bad]; raise SystemExit(1)
    print(f'Build check passed. Both deliverables match sha256 {digest[:16]}.')
    raise SystemExit(0)

for t in targets: t.write_text(out)
print(f'Built index.html and the standalone (sha256 {digest[:16]}).')

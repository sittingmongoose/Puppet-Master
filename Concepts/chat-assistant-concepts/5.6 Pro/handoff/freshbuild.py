import sys
from pathlib import Path
root=Path("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro")
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
Path(sys.argv[1]).write_text(out)
print('fresh build written to', sys.argv[1], len(out.splitlines()), 'lines')

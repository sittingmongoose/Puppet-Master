# Builds a copy of the deliverable with questions.js / questions.css emptied,
# WITHOUT touching the shared deliverable (other agents build concurrently).
# Mirrors build.py exactly apart from the two blanked modules.
#   python3 qs-negative-control.py /tmp/noq.html
import sys, pathlib
root = pathlib.Path('/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro')
out  = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/noq.html')
ENC = 'utf-8'
BLANK = {'questions.css', 'questions.js'}
def read(n): return '' if n in BLANK else (root/n).read_text(encoding=ENC)
def join(ns): return '\n'.join(read(n) for n in ns)
MODULES = ['activity-panel','activity-bar','goals','context','history','menus',
           'transcript','lens','orbit','threadops','questions']
shell = (root/'shell.html').read_text(encoding=ENC)
css = join(['styles.css','motion.css','variants-a.css','variants-b.css','variants-c.css',
            'transcripts.css'] + [f'{m}.css' for m in MODULES])
EXT_SHIM = """
window.PM56_EXT = window.PM56_EXT || {
  _slots:Object.create(null), _actions:Object.create(null),
  _after:Object.create(null),
  slot(name,fn){ (this._slots[name]=this._slots[name]||[]).push(fn); return this; },
  action(name,fn){ this._actions[name]=fn; return this; },
  actionAfter(name,fn){ this._after[name]=fn; return this; }
};
"""
data = (join(['data.js','motion.js','variants-a.js','variants-b.js','variants-c.js'])
        + '\n' + EXT_SHIM + '\n' + join([f'{m}.js' for m in MODULES]))
app = read('app.js')
boot = '''<script>
window.__PM56_BOOT_OK=false;
window.addEventListener('error',function(e){setTimeout(function(){if(window.__PM56_BOOT_OK)return;var r=document.getElementById('pmRoot');if(r)r.innerHTML='<div style="font:14px system-ui;padding:24px;color:#fff;background:#24131a;height:100vh"><h1>Assistant Concept Lab failed to start</h1><p>'+String(e.message||'Unknown startup error')+'</p></div>';},0);});
setTimeout(function(){if(!window.__PM56_BOOT_OK){var r=document.getElementById('pmRoot');if(r&&!r.textContent.trim())r.innerHTML='<div style="font:14px system-ui;padding:24px;color:#fff;background:#24131a;height:100vh"><h1>Assistant Concept Lab did not initialize</h1></div>'; }},2500);
</script>'''
shell = shell.replace('<script>/*__PM_DATA__*/</script>', boot + '\n  <script>/*__PM_DATA__*/</script>')
app = app.replace('  renderApp(false);', '  renderApp(false);\n  window.__PM56_BOOT_OK=true;', 1)
out.write_text(shell.replace('/*__PM_STYLES__*/', css).replace('/*__PM_DATA__*/', data).replace('/*__PM_APP__*/', app), encoding=ENC)
print('wrote', out)

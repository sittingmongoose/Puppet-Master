import hashlib, sys
from pathlib import Path
root=Path(__file__).resolve().parent
# Every read and write pins UTF-8 rather than inheriting the locale's
# preferred encoding. The sources carry 292 multi-byte characters (data.js
# alone has 189 -- middots, em/minus dashes, curly quotes), the shell declares
# <meta charset="utf-8">, and the digest below calls .encode(), which is UTF-8
# regardless of locale. Leaving the reads unpinned made the two halves disagree
# with each other and with the file: under a C/POSIX locale read_text() decodes
# as ASCII and the build dies with UnicodeDecodeError on the first middot.
# Python 3.7+ normally coerces C to UTF-8 (PEP 538/540) and hides this, but
# containers and pinned-env subprocesses set PYTHONCOERCECLOCALE=0 /
# PYTHONUTF8=0 and do not get that safety net. Verified: with coercion
# disabled the unpinned version raised UnicodeDecodeError; this one builds.
ENC='utf-8'
shell=(root/'shell.html').read_text(encoding=ENC)
# ---------------------------------------------------------------------------
# Per-feature modules.  One owner per file (see each file's header comment), so
# the eight post-Wave-1 agents never have to reopen app.js or styles.css.
#   CSS  is concatenated LAST  -> module rules win over styles.css and variants.
#   JS   is concatenated after data.js/motion.js/variants-*.js but BEFORE app.js
#        -> a module's window.PM56_EXT registrations exist before the app boots,
#           so they are live on the very first render.
# Adding a module here is the only build.py edit a feature wave should ever need.
MODULES=['activity-panel','activity-bar','goals','context','history','menus',
         'transcript','lens','orbit','threadops','questions']

def read(name):
    f=root/name
    if not f.exists():
        raise SystemExit(f'build.py: missing source file {name!r}. Create it (an empty '
                         f'file with a header comment is fine) or drop it from MODULES.')
    return f.read_text(encoding=ENC)

def join(names): return '\n'.join(read(n) for n in names)

css=join(['styles.css','motion.css','variants-a.css','variants-b.css','variants-c.css',
          'transcripts.css']+[f'{m}.css' for m in MODULES])

# Minimal collector shim.  The full registry (render slots, action dispatch, the
# context object) is implemented in app.js, which upgrades this object in place;
# this three-line stand-in only has to exist early enough for a module loading
# before app.js to call .slot()/.action() without crashing.  Keep it in sync with
# ensureExt() in app.js.
EXT_SHIM = """
window.PM56_EXT = window.PM56_EXT || {
  _slots:Object.create(null), _actions:Object.create(null),
  _after:Object.create(null),
  slot(name,fn){ (this._slots[name]=this._slots[name]||[]).push(fn); return this; },
  collisions:[],
  _reg(name,fn,intentional){ var prev=this._actions[name]; if(prev){ if(!intentional){ (this.collisions=this.collisions||[]).push(name); console.info('PM56_EXT: UNDECLARED duplicate action "'+name+'" - chaining; declare it with chainAction() if deliberate'); } this._actions[name]=function(c,b,e){ var r=fn(c,b,e); return r===false?prev(c,b,e):r; }; } else { this._actions[name]=fn; } return this; },
  action(name,fn){ return this._reg(name,fn,false); },
  chainAction(name,fn){ return this._reg(name,fn,true); },
  actionAfter(name,fn){ var prev=this._after[name]; if(prev){ (this.collisions=this.collisions||[]).push('after:'+name); console.info('PM56_EXT: duplicate actionAfter "'+name+'" - chaining both'); this._after[name]=function(c,b,e){ prev(c,b,e); return fn(c,b,e); }; } else { this._after[name]=fn; } return this; }
};
"""

data=(join(['data.js','motion.js','variants-a.js','variants-b.js','variants-c.js'])
      + '\n' + EXT_SHIM + '\n'
      + join([f'{m}.js' for m in MODULES]))
app=read('app.js')
boot='''<script>
window.__PM56_BOOT_OK=false;
window.addEventListener('error',function(e){setTimeout(function(){if(window.__PM56_BOOT_OK)return;var r=document.getElementById('pmRoot');if(r)r.innerHTML='<div style="font:14px system-ui;padding:24px;color:#fff;background:#24131a;height:100vh"><h1>Assistant Concept Lab failed to start</h1><p>'+String(e.message||'Unknown startup error')+'</p></div>';},0);});
setTimeout(function(){if(!window.__PM56_BOOT_OK){var r=document.getElementById('pmRoot');if(r&&!r.textContent.trim())r.innerHTML='<div style="font:14px system-ui;padding:24px;color:#fff;background:#24131a;height:100vh"><h1>Assistant Concept Lab did not initialize</h1></div>'; }},2500);
</script>'''
shell=shell.replace('<script>/*__PM_DATA__*/</script>',boot+'\n  <script>/*__PM_DATA__*/</script>')
app=app.replace('  renderApp(false);','  renderApp(false);\n  window.__PM56_BOOT_OK=true;',1)
out=shell.replace('/*__PM_STYLES__*/',css).replace('/*__PM_DATA__*/',data).replace('/*__PM_APP__*/',app)
targets=[root/'index.html', root/'PM_Chat_Assistant_5.6_Pro_Standalone.html']
digest=hashlib.sha256(out.encode(ENC)).hexdigest()

if '--check' in sys.argv:
    # Both deliverables must be byte-identical to a fresh build. index.html
    # was once hand-patched with <link>/<script> tags, which silently gave
    # it a second copy of app.js -- two state closures, two work timers --
    # and broke the "byte-identical" claim in the README. This gate makes
    # that class of drift a build failure instead of a discovery.
    bad=[]
    for t in targets:
        if not t.exists(): bad.append(f'{t.name}: missing')
        elif hashlib.sha256(t.read_text(encoding=ENC).encode(ENC)).hexdigest()!=digest:
            bad.append(f'{t.name}: differs from a fresh build')
    if bad:
        print('BUILD CHECK FAILED'); [print('  -',b) for b in bad]; raise SystemExit(1)
    print(f'Build check passed. Both deliverables match sha256 {digest[:16]}.')
    raise SystemExit(0)

def target_newline(t):
    # Both deliverables are CRLF on disk and in HEAD (this repo lives on an NFS
    # share with 1,508 CRLF files already committed). Python's default text
    # write would emit LF on Linux and turn every rebuild into a ~5,000-line
    # phantom diff, so preserve whatever the target already uses and default to
    # CRLF for a target that does not exist yet.
    if t.exists():
        head=t.open('rb').read(65536)
        if b'\r\n' in head: return '\r\n'
        if b'\n' in head: return '\n'
    return '\r\n'

for t in targets: t.write_text(out, newline=target_newline(t), encoding=ENC)
print(f'Built index.html and the standalone (sha256 {digest[:16]}).')

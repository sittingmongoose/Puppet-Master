"""Source-only v3 manager layout refinement, consumed by the T49 Settings lane."""
from pathlib import Path
import re,hashlib
HERE=Path(__file__).resolve().parent
MARKER='PM_ASSISTANT_NARROW_V3'
def apply(doc,notes,need):
    need(MARKER not in doc,'Narrow v3 transform already applied')
    match=re.search(r'(<script\b[^>]*\bid="pm4-settings-js"[^>]*>)(.*?)(</script>)',doc,re.S)
    need(bool(match),'Settings engine missing')
    js=match[2]
    anchor='  boot();\n})();'
    need(js.count(anchor)==1,'Settings boot anchor drift')
    extra=(HERE/'assistant_narrow_source.js').read_text(encoding='utf-8')
    css=(HERE/'assistant_narrow_source.css').read_text(encoding='utf-8')
    js=js.replace(anchor,'\n/* '+MARKER+' */\n'+extra+'\n'+anchor)
    doc=doc[:match.start()]+match[1]+js+match[3]+doc[match.end():]
    need(doc.count('</head>')==1,'Head anchor drift')
    doc=doc.replace('</head>','<style id="pm50-manager-layout">\n'+css+'\n</style>\n</head>')
    notes.update({'source':'assistant_narrow_source.py','javascript_sha256':hashlib.sha256(extra.encode()).hexdigest(),'css_sha256':hashlib.sha256(css.encode()).hexdigest(),'scope':'shared manager HTML presentation; no settings IDs or non-Settings script changed'})
    return doc

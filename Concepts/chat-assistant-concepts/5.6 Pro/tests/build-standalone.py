#!/usr/bin/env python3
from pathlib import Path
import re
ROOT=Path('/mnt/data/work/pm56_pro_reaudit')
html=(ROOT/'index.html').read_text()
css=(ROOT/'styles.css').read_text()
data=(ROOT/'data.js').read_text()
audit=(ROOT/'audit-inventory.js').read_text() if (ROOT/'audit-inventory.js').exists() else ''
app=(ROOT/'app.js').read_text()
# Escape literal closing script tags so inlined JavaScript cannot terminate early.
def safe_script(s): return re.sub(r'</script',r'<\\/script',s,flags=re.I)
html=re.sub(r'<link[^>]+href=["\'][^"\']*styles\.css[^"\']*["\'][^>]*>',lambda m:'<style id="pm56-inline-styles">\n'+css+'\n</style>',html,flags=re.I)
for name,content in [('data.js',data),('audit-inventory.js',audit),('app.js',app)]:
    pattern=rf'<script[^>]+src=["\'][^"\']*{re.escape(name)}[^"\']*["\'][^>]*>\s*</script>'
    html,n=re.subn(pattern,lambda m:f'<script id="pm56-inline-{name.replace(".","-")}">\n{safe_script(content)}\n</script>',html,flags=re.I)
    if n==0 and content:
        html=html.replace('</body>',f'<script id="pm56-inline-{name.replace(".","-")}">\n{safe_script(content)}\n</script>\n</body>')
# Remove any residual module hints/service-worker assumptions that direct-file mode cannot use.
html=html.replace('<base href="/">','')
out=ROOT/'PM_Chat_Assistant_5.6_Pro_Standalone.html'
out.write_text(html)
print(out)

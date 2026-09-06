#!/usr/bin/env python3
"""Splice the PMF onboarding + tour sources into TestFablePMConcpet.html.

First run (no markers present): strips the legacy pm7 onboarding/tour blocks and
plants four marker pairs. Every run: replaces marker contents with the current
sources from ./src. Idempotent.
"""
import re, sys, pathlib, hashlib
ROOT = pathlib.Path('/mnt/Cursor/PuppetMaster/Concepts/TestFablePMConcpet.html')
SRC = pathlib.Path(__file__).resolve().parent.parent
doc = ROOT.read_text(encoding='utf-8')

def strip_block(doc, start_pat, end_tag):
    m = re.search(start_pat, doc)
    if not m: return doc, False
    e = doc.index(end_tag, m.start()) + len(end_tag)
    # eat one trailing newline
    if doc[e:e+1] == '\n': e += 1
    return doc[:m.start()] + doc[e:], True

if 'PMF:ONBOARDING:CSS:START' not in doc:
    removed = []
    for pat, end in [
        (r'<style id="pm7-onboarding-css">', '</style>'),
        (r'<style id="pm7-guided-tour-css">', '</style>'),
        (r'<script id="pm7-guided-tour-js">', '</script>'),
        (r'<div id="pm7-onboarding" class="pm7ob"', '</div>\n<button type="button" id="pm7-onboarding-resume"'),
        (r'<script id="pm7-onboarding-js">', '</script>'),
        (r'<div id="pm7-guided-tour" class="pm7gt"', '</div>\n<button type="button" id="pm7-guided-tour-resume"'),
    ]:
        doc, ok = strip_block(doc, pat, end)
        removed.append((pat, ok))
    # the two stray resume/replay <button> lines left after the div removals
    doc = re.sub(r'\n?<button type="button" id="pm7-onboarding-resume"[^\n]*\n', '\n', doc)
    doc = re.sub(r'\n?<button type="button" id="pm7-guided-tour-(resume|replay)"[^\n]*\n', '\n', doc)
    for pat, ok in removed: print('strip', 'ok ' if ok else 'MISSING', pat)
    # plant markers: CSS before T46 systems css, markup+js before T46 systems js
    css_anchor = '<style id="pm7-t46-systems-css">'
    js_anchor = '<script id="pm7-t46-systems-js">'
    assert css_anchor in doc and js_anchor in doc
    doc = doc.replace(css_anchor, '<!-- PMF:ONBOARDING:CSS:START -->\n<!-- PMF:ONBOARDING:CSS:END -->\n<!-- PMF:TOUR:CSS:START -->\n<!-- PMF:TOUR:CSS:END -->\n' + css_anchor, 1)
    doc = doc.replace(js_anchor, '<!-- PMF:ONBOARDING:BODY:START -->\n<!-- PMF:ONBOARDING:BODY:END -->\n<!-- PMF:TOUR:BODY:START -->\n<!-- PMF:TOUR:BODY:END -->\n' + js_anchor, 1)
    # header note
    doc = doc.replace('PM7-README (PMConcept7.html)', 'PM7-README (PMConcept7.html)\n\n  TestFablePMConcpet.html: fork of TestPMConcept.html (2026-09-04) whose\n  Product Onboarding + Guided Tour were replaced by the PMF modules between\n  the PMF:* marker comments. Sources: Concepts/TestFablePMConcpet-src/.', 1)

def fill(doc, name, content):
    s, e = f'<!-- PMF:{name}:START -->', f'<!-- PMF:{name}:END -->'
    a = doc.index(s) + len(s); b = doc.index(e)
    return doc[:a] + '\n' + content.rstrip('\n') + '\n' + doc[b:]

def rd(n):
    p = SRC / n
    if p.is_dir():
        return '\n'.join(f.read_text(encoding='utf-8') for f in sorted(p.glob('*.js')))
    return p.read_text(encoding='utf-8') if p.exists() else ''

doc = fill(doc, 'ONBOARDING:CSS', f'<style id="pmf-onboarding-css">\n{rd("onboarding.css")}\n</style>')
doc = fill(doc, 'TOUR:CSS', f'<style id="pmf-tour-css">\n{rd("tour.css")}\n</style>')
doc = fill(doc, 'ONBOARDING:BODY', f'{rd("onboarding.html")}\n<script id="pmf-onboarding-js">\n{rd("onboarding")}\n</script>')
doc = fill(doc, 'TOUR:BODY', f'{rd("tour.html")}\n<script id="pmf-tour-js">\n{rd("tour")}\n</script>')

# emoji gate (project rule: no emoji glyphs)
bad = re.findall(r'[\U0001F000-\U0001FAFF☀-➿⬀-⯿️]', rd('onboarding')+rd('tour')+rd('onboarding.css')+rd('tour.css')+rd('onboarding.html')+rd('tour.html'))
if bad: print('EMOJI FOUND in sources:', bad[:5]); sys.exit(2)
ROOT.write_text(doc, encoding='utf-8')
print('wrote', ROOT, len(doc.encode()), 'bytes', hashlib.sha256(doc.encode()).hexdigest()[:12])

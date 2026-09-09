#!/usr/bin/env python3
"""merge.py — GLM onboarding/tour block replacer for TestGLMPMConcept.html.
Replaces the four legacy blocks + both host markup spans with the obx/gtx system.
Sources live beside this script (priority) with /tmp/glm-pm-work/src fallback.
"""
import sys, time, hashlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
ALT = Path('/tmp/glm-pm-work/src')

def read(name):
    for base in (HERE, ALT):
        p = base / name
        if p.exists():
            return p.read_text(encoding='utf-8')
    raise SystemExit('missing source: ' + name)

TARGET = Path('/mnt/Cursor/PuppetMaster/Concepts/TestGLMPMConcept.html')

doc = TARGET.read_text(encoding='utf-8')
t0 = time.time()

def replace_block(doc, open_tag, style, source):
    i = doc.find(open_tag)
    if i < 0: raise SystemExit('block not found: ' + open_tag)
    close = '</style>' if style else '</script>'
    j = doc.find(close, i)
    if j < 0: raise SystemExit('close not found for ' + open_tag)
    return doc[:i] + open_tag + '\n' + source + '\n' + doc[j:]

def replace_span(doc, start_marker, end_marker, replacement, label):
    i = doc.find(start_marker)
    if i < 0: raise SystemExit('start marker missing: ' + label)
    j = doc.find(end_marker, i)
    if j < 0: raise SystemExit('end marker missing: ' + label)
    j += len(end_marker)
    return doc[:i] + replacement + doc[j:]

CSS_OB = read('obx_base.css') + '\n' + read('obx_scenes.css') + '\n' + read('obx_themes_friendly.css') + '\n' + read('obx_themes_glass.css') + '\n' + read('obx_themes_retro.css') + '\n' + read('obx_themes_basic.css')
CSS_GT = read('gtx.css')
JS_GT  = read('gtx.js')
JS_OB  = read('obx_state.js') + '\n' + read('obx_screens.js') + '\n' + read('obx_runtime.js')
HOST_OB = read('hosts_onboarding.html').rstrip()
HOST_GT = read('hosts_tour.html').rstrip()

doc = replace_block(doc, '<style id="pm7-onboarding-css">', True, CSS_OB)
doc = replace_block(doc, '<style id="pm7-guided-tour-css">', True, CSS_GT)
doc = replace_block(doc, '<script id="pm7-guided-tour-js">', False, JS_GT)
doc = replace_block(doc, '<script id="pm7-onboarding-js">', False, JS_OB)

# Host markup spans — accept either the legacy hosts (first merge) or our own (re-merge).
if '<div id="pm7-onboarding"' in doc:
    doc = replace_span(doc, '<div id="pm7-onboarding"', 'Resume setup</button>', HOST_OB, 'onboarding host')
else:
    doc = replace_span(doc, '<div id="pmx-onboarding"', 'Resume setup</button>', HOST_OB, 'onboarding host (re-merge)')
if '<div id="pm7-guided-tour"' in doc:
    doc = replace_span(doc, '<div id="pm7-guided-tour"', 'Replay Guided Tour</button>', HOST_GT, 'tour host')
else:
    doc = replace_span(doc, '<div id="pmx-tour"', 'Replay Guided Tour</button>', HOST_GT, 'tour host (re-merge)')

TARGET.write_text(doc, encoding='utf-8')
h = hashlib.sha256(doc.encode('utf-8')).hexdigest()[:16]
print('merged in %.2fs  bytes=%d  sha=%s' % (time.time()-t0, len(doc), h))

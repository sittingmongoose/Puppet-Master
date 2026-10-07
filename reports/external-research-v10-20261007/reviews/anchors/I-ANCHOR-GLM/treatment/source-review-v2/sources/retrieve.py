"""Reviewer-owned, read-only HTTP evidence collector; never executes response code."""
import concurrent.futures
import base64
import datetime
import hashlib
import html.parser
import json
import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent

class Text(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.skip += 1
        if tag in ('p','div','li','h1','h2','h3','h4','tr','br','pre','dt','dd','section'): self.parts.append('\n')
    def handle_endtag(self, tag):
        if tag in ('script','style'): self.skip = max(0,self.skip-1)
        if tag in ('p','div','li','h1','h2','h3','h4','tr','pre','dt','dd','section'): self.parts.append('\n')
    def handle_data(self, data):
        if not self.skip: self.parts.append(data)

def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat()

def fetch(entry):
    ident, url, version, terms = entry
    began = utc()
    try:
        req = urllib.request.Request(url, headers={'User-Agent':'Independent-source-review/1.0'})
        with urllib.request.urlopen(req, timeout=25) as response:
            raw = response.read(3_000_001)
            if len(raw)>3_000_000: raise ValueError('response exceeds 3 MB bounded limit')
            meta = {'id':ident,'requested_url':url,'resolved_url':response.url,'http_status':response.status,
                    'retrieved_started_at_utc':began,'retrieved_completed_at_utc':utc(),
                    'response_bytes':len(raw),'response_sha256':hashlib.sha256(raw).hexdigest(),
                    'http_headers':{k:response.headers.get(k) for k in ('Content-Type','ETag','Last-Modified','Date')},
                    'version_or_ref':version,'method':'GET; response never executed; bounded excerpts only'}
        body=raw.decode('utf-8','replace')
        content_type=meta['http_headers']['Content-Type'] or ''
        if '?format=TEXT' in url:
            body=base64.b64decode(raw).decode('utf-8','replace')
            lines=body.splitlines()
            coordinate='1-based UTF-8 source lines after Gitiles base64 transport decoding'
        elif 'html' in content_type:
            parser=Text(); parser.feed(body)
            body=''.join(parser.parts)
            lines=[re.sub(r'\s+',' ',line).strip() for line in body.splitlines()]
            lines=[line for line in lines if line]
            coordinate='1-based normalized HTML visible-text lines; see collector identity'
        else:
            lines=body.splitlines(); coordinate='1-based original UTF-8 response lines'
        meta['line_coordinates']=coordinate
        meta['response_text_line_count']=len(lines)
        picks=set(); matches={}
        for term in terms:
            found=[i for i,l in enumerate(lines) if re.search(term,l,re.I)]
            matches[term]=[i+1 for i in found]
            for i in found[:4]:
                picks.update(range(max(0,i-3),min(len(lines),i+7)))
        extra_ranges={'P12':[(1884,1928)],'P13':[(379,432),(1255,1305),(1318,1433)],
                      'P14':[(1,77)],'P04':[(277,314),(570,622),(1310,1378),(1520,1543)],
                      'P18':[(2133,2165),(1800,1835),(2460,2488)], 'P20':[(1,180)],
                      'P21':[(1907,1942)]}
        for lo,hi in extra_ranges.get(ident,[]): picks.update(range(lo-1,min(len(lines),hi)))
        selected=sorted(picks)[:420]
        meta['matched_lines']=matches
        meta['retained_line_numbers']=[i+1 for i in selected]
        meta['excerpt_selection_truncated']=len(picks)>420
        excerpts='\n'.join(f'{i+1}: {lines[i]}' for i in selected)+'\n'
        file=ROOT/(ident+'.txt'); file.write_text(excerpts)
        meta['excerpt_file']=file.name
        meta['excerpt_sha256']=hashlib.sha256(file.read_bytes()).hexdigest()
        (ROOT/(ident+'.json')).write_text(json.dumps(meta,indent=2)+'\n')
        return {'id':ident,'status':meta['http_status'],'lines':len(lines),'retained':len(selected),'file':file.name}
    except Exception as e:
        meta={'id':ident,'requested_url':url,'version_or_ref':version,'retrieved_started_at_utc':began,
              'retrieved_completed_at_utc':utc(),'error':repr(e)}
        (ROOT/(ident+'.json')).write_text(json.dumps(meta,indent=2)+'\n')
        return meta

SOURCES = [
 ('P01','https://raw.githubusercontent.com/snyk/zip-slip-vulnerability/master/README.md','master at retrieval; 2018 disclosure',[r'June',r'vulnerable',r'canonical',r'java.util.zip',r'extract']),
 ('P02','https://www.sqlite.org/fts5.html','current docs; sections 4.3.1,4.3.4,4.2',[r'1ED9',r'remove_diacritics',r'less than 3',r'fewer than 3',r'LIKE.*GLOB',r'prefix index',r'ICU']),
 ('P03','https://sqlite.org/releaselog/3_34_0.html','SQLite 3.34.0 2020-12-01',[r'trigram',r'SQLITE_SOURCE_ID']),
 ('P04','https://raw.githubusercontent.com/theupdateframework/specification/master/tuf-spec.md','TUF spec 1.0.36 dated 2026-08-05, verify',[r'^Date:',r'VERSION',r'fixed update start time',r'update start time',r'root metadata.*version',r'root.*threshold',r'Fast-forward',r'Expiration',r'canonical',r'length']),
 ('P05','https://uptane.org/','homepage, limited philosophy',[r'hacked',r'compromise',r'rapid recovery']),
 ('P06','https://chromium.googlesource.com/aosp/platform/system/update_engine/+/HEAD/README.md?format=TEXT','HEAD, base64 response read only',[r'inactive',r'checkpoint',r'rollback',r'old version',r'hash',r'delta']),
 ('P07','https://source.android.com/docs/core/ota/ab','current A/B documentation',[r'Android 10',r'fault resistant',r'rollback',r'resum',r'Virtual A/B']),
 ('P08','https://ostreedev.github.io/ostree/','current overview; bounded analogy',[r'content.addressed',r'immutable',r'checksum',r'Transactional',r'parallel',r'bootloader']),
 ('P09','https://raw.githubusercontent.com/cure53/DOMPurify/3.4.16/README.md','tag 3.4.16',[r'current version',r'void the effects',r'jsdom',r'happy.dom',r'secure default',r'CONFIG']),
 ('P10','https://www.w3.org/TR/WCAG22/','WCAG 2.2 recommendation date verify',[r'12 December 2024',r'Success Criterion 1.3.4',r'Success Criterion 2.5.8',r'Success Criterion 2.4.11',r'Success Criterion 2.1.1',r'Success Criterion 1.1.1',r'Success Criterion 3.1.1',r'Success Criterion 2.5.5',r'24 by 24',r'44 by 44',r'Level AA conformance',r'Full pages',r'complete processes']),
 ('P11','https://webkitgtk.org/releases/','directory observation only',[r'LATEST.STABLE',r'2.54.1']),
 ('P12','https://raw.githubusercontent.com/python/cpython/v3.14.4/Lib/zipfile/__init__.py','CPython v3.14.4',[r'def _extract_member',r'arcname =',r'targetpath =',r'illegal =']),
 ('P13','https://raw.githubusercontent.com/sqlite/sqlite/version-3.46.1/ext/fts5/fts5_tokenize.c','SQLite tag version-3.46.1',[r'remove_diacritics',r'Fts5Trigram',r'nChar',r'diacritic',r'fts5UnicodeCreate']),
 ('P14','https://raw.githubusercontent.com/sqlite/sqlite/version-3.46.1/ext/fts5/test/fts5unicode3.test','SQLite tag version-3.46.1 regression tests',[r'remove_diacritics',r'1ED9',r'1ed9',r'1e',r'do_execsql_test']),
 ('P15','https://sqlite.org/releaselog/3_27_0.html','SQLite 3.27.0 2019-02-07',[r'remove_diacritics',r'SQLITE_SOURCE_ID']),
 ('P16','https://man7.org/linux/man-pages/man2/fsync.2.html','Linux fsync(2), current manual',[r'directory',r'durable',r'power',r'flush']),
 ('P17','https://man7.org/linux/man-pages/man2/rename.2.html','Linux rename(2), current manual',[r'atomic',r'EXDEV',r'symbolic link']),
 ('P18','https://www.w3.org/TR/CSP3/','CSP3 current specification',[r'script.src',r'connect.src',r'default.src',r'navigate.to']),
 ('P19','https://webkitgtk.org/2026/10/02/webkitgtk2.54.1-released.html','WebKitGTK 2.54.1 release page',[r'2.54.1',r'Fix',r'Security']),
 ('P20','https://raw.githubusercontent.com/sqlite/sqlite/version-3.46.1/ext/fts5/test/fts5unicode4.test','SQLite tag version-3.46.1 regression tests',[r'remove_diacritics',r'1ED9',r'1ed9']),
 ('P21','https://url.spec.whatwg.org/','WHATWG URL standard, current origin definition',[r'origin',r'tuple origin',r'scheme.*host.*port']),
 ('P22','https://webkitgtk.org/reference/webkitgtk/stable/class.Settings.html','WebKitGTK stable settings API',[r'enable.javascript',r'allow.file',r'allow.universal',r'2.54.1']),
 ('P23','https://raw.githubusercontent.com/python/cpython/v3.14.4/Lib/test/test_zipfile/test_core.py','CPython v3.14.4 tests read only',[r'traversal',r'\.\./\.\.',r'absolute']),
 ('P24','https://raw.githubusercontent.com/sqlite/sqlite/version-3.46.1/ext/fts5/test/fts5unicode2.test','SQLite version-3.46.1 tests read only',[r'remove_diacritics',r'1ED9',r'1ed9',r'1998']),
 ('P25','https://sqlite.org/releaselog/3_46_1.html','SQLite 3.46.1 2024-08-13',[r'SQLITE_SOURCE_ID',r'2024',r'FTS5']),
 ('P26','https://docs.python.org/3.14/library/zipfile.html','CPython 3.14 zipfile docs',[r'Decompression pitfalls',r'Resources limitations',r'zip bomb',r'disk volume',r'extraction.*fail']),
]

if __name__=='__main__':
    wanted=set(sys.argv[1:])
    entries=[e for e in SOURCES if not wanted or e[0] in wanted]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        for result in pool.map(fetch,entries): print(json.dumps(result),flush=True)

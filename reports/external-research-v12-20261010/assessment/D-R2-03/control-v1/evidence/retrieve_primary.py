"""Independent read-only primary-source retrieval for this one bounded review."""
from pathlib import Path
import concurrent.futures, datetime, hashlib, json, subprocess
import requests
from html.parser import HTMLParser

class TextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript'):
            self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript') and self.skip:
            self.skip -= 1
    def handle_data(self, data):
        if not self.skip and data.strip():
            self.parts.append(data.strip())

OUT = Path(__file__).resolve().parent
ORIGINAL = Path('ER12_RUNTIME/runs/D-R2-03/control/stages/investigator/source-map.json')
sources = json.loads(ORIGINAL.read_text())['sources']
def fetch(source):
    sid, url = source['id'], source['url']
    if sid == 'LIGHTKURVE-2.5.0':
        url = 'https://github.com/lightkurve/lightkurve/releases/tag/v2.5.0'
    if 'arxiv.org/abs/' in url:
        url = url.replace('/abs/', '/pdf/')
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    record = {'id': sid, 'requested_url': url, 'access_started_utc': started}
    try:
        response = requests.get(url, timeout=40)
        record.update(status=response.status_code, final_url=response.url, headers=dict(response.headers))
        data = response.content
        suffix = '.pdf' if data.startswith(b'%PDF') else '.html'
        raw = OUT / (sid + suffix)
        raw.write_bytes(data)
        record.update(raw_path=str(raw), bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
        txt = OUT / (sid + '.txt')
        if suffix == '.pdf':
            proc = subprocess.run(['pdftotext', '-layout', str(raw), str(txt)], capture_output=True, text=True)
            record['extraction_exit'] = proc.returncode
            record['extraction_error'] = proc.stderr
        else:
            parser = TextParser()
            parser.feed(response.text)
            txt.write_text('\n'.join(parser.parts))
        if txt.exists():
            t = txt.read_bytes()
            record.update(text_path=str(txt), text_sha256=hashlib.sha256(t).hexdigest())
    except Exception as exc:
        record['error'] = repr(exc)
    record['access_finished_utc'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return record
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    records = list(pool.map(fetch, sources))
(OUT / 'retrieval-manifest.json').write_text(json.dumps(records, indent=2) + '\n')
for r in records:
    print(r['id'], r.get('status', 'ERROR'), r.get('bytes', 0), r.get('error', ''))

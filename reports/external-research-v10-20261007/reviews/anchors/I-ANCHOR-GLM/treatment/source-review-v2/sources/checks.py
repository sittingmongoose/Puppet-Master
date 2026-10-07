"""Independent reviewer checks of preinstalled runtimes, not candidate work."""
import datetime
import hashlib
import json
import pathlib
import platform
import sqlite3
import sys
import tempfile
import time
import zipfile

ROOT=pathlib.Path(__file__).resolve().parent
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
clock=time.monotonic()
db=sqlite3.connect(':memory:')
results={'reviewer_only':True,'began_at_utc':started,'python_version':platform.python_version(),
         'python_executable':sys.executable,'sqlite_version':sqlite3.sqlite_version,
         'sqlite_source_id':db.execute('select sqlite_source_id()').fetchone()[0],
         'compile_options':[r[0] for r in db.execute('pragma compile_options')],
         'scope':'Preinstalled Python/sqlite only; memory DB and temporary ZIP within authorized review directory; no downloaded source execution; no browser/network/product implementation.'}
with tempfile.TemporaryDirectory(prefix='review-check-',dir=ROOT) as tmp:
    tmp=pathlib.Path(tmp); archive=tmp/'test.zip'; dest=tmp/'bundle'; dest.mkdir()
    with zipfile.ZipFile(archive,'w') as z:
        z.writestr('../../evil.txt','one')
        z.writestr('ok_inside.txt','two')
    with zipfile.ZipFile(archive) as z: z.extractall(dest)
    results['RCHK1']={'archive_names':['../../evil.txt','ok_inside.txt'],
                     'extracted_names':sorted(str(p.relative_to(dest)) for p in dest.rglob('*')),
                     'parent_entries':sorted(p.name for p in tmp.iterdir()),
                     'scope_limit':'Clean destination only; does not prove symlink safety, collision rejection, or atomic updates.'}
db.execute('create virtual table tri using fts5(body, tokenize="trigram")')
db.execute('insert into tri values(?)',('Musée Rodin 美术馆 Cézanne',))
results['RCHK2']={q:db.execute('select body from tri where tri match ?', (q,)).fetchall() for q in ['美术','美术馆','anne','zanne']}
results['RCHK2']['short_like']=db.execute('select body from tri where body like ?',('%美术%',)).fetchall()
results['RCHK2']['prefix_trigram_2chars']=db.execute('select body from tri where tri match ?',('美术*',)).fetchall()
results['RCHK3']={}
for mode in (1,2):
    name='u'+str(mode)
    db.execute(f"create virtual table {name} using fts5(body, tokenize='unicode61 remove_diacritics {mode}')")
    db.execute(f'insert into {name} values(?)',('Cézanne ộ',))
    results['RCHK3'][str(mode)]={q:db.execute(f'select body from {name} where {name} match ?', (q,)).fetchall() for q in ['cezanne','o']}
try:
    db.execute('create virtual table icutest using fts5(body, tokenize="icu")')
    results['RCHK4']={'icu_fts5_registered':True}
except sqlite3.OperationalError as e:
    results['RCHK4']={'icu_fts5_registered':False,'error':str(e),
                      'scope_limit':'No registered FTS5 icu tokenizer here; this is not a test of SQLITE_ENABLE_ICU or FTS3/4 ICU.'}
results['finished_at_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
results['elapsed_seconds']=time.monotonic()-clock
path=ROOT/'reviewer-executed-checks.json'
path.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
print(path.read_text())

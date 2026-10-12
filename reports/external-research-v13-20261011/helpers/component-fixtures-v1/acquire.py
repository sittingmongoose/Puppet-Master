import pathlib,urllib.request,json,hashlib,datetime,concurrent.futures
ROOT=pathlib.Path(__file__).resolve().parent
pin=json.loads((ROOT/'SOURCE_PIN.json').read_text())['commit']
paths=['Doc/library/sqlite3.rst','Modules/_sqlite/connection.c','Lib/test/test_sqlite3/test_backup.py','Doc/library/zipfile.rst','Lib/zipfile/__init__.py','Lib/test/test_zipfile/test_core.py','Doc/library/asyncio-queue.rst','Lib/asyncio/queues.py','Lib/test/test_asyncio/test_queues.py','Doc/library/stdtypes.rst','Doc/library/unicodedata.rst','Lib/test/test_str.py','Lib/test/test_unicodedata.py','Objects/unicodeobject.c','Doc/library/shutil.rst','Lib/shutil.py','Lib/test/test_shutil.py','Doc/library/os.rst','Doc/library/asyncio-subprocess.rst','Lib/asyncio/subprocess.py','Lib/test/test_asyncio/test_subprocess.py','Doc/library/csv.rst','Lib/test/test_csv.py','Modules/_csv.c','Lib/csv.py','LICENSE','Doc/library/asyncio-task.rst','Lib/asyncio/tasks.py']
items=[('cpython/'+p,'https://raw.githubusercontent.com/python/cpython/'+pin+'/'+p,'PSF-2.0 and bundled notices') for p in paths]+[('rfc/rfc9111.txt','https://www.rfc-editor.org/rfc/rfc9111.txt','IETF Trust legal provisions; retained primary text for evidence'),('rfc/rfc9110.txt','https://www.rfc-editor.org/rfc/rfc9110.txt','IETF Trust legal provisions; retained primary text for evidence'),('sqlite/backup.html','https://www.sqlite.org/backup.html','SQLite public-domain documentation'),('sqlite/wal.html','https://www.sqlite.org/wal.html','SQLite public-domain documentation')]
def get(item):
    name,url,license=item
    try: data=urllib.request.urlopen(url,timeout=30).read()
    except Exception as exc:
        print('ACQUISITION_FAILURE',url,str(exc)); raise
    out=ROOT/'sources'/name;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(data)
    return {'path':str(out.relative_to(ROOT)),'url':url,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'retrieved_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'license':license,'pin':pin if name.startswith('cpython/') else 'exact retrieved body hash; live SQLite docs / stable numbered RFC'}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    rows=list(ex.map(get,items))
(ROOT/'ACQUISITION.json').write_text(json.dumps(rows,indent=2)+'\n')
print(json.dumps({'sources':len(rows),'bytes':sum(r['bytes'] for r in rows),'end':datetime.datetime.now(datetime.timezone.utc).isoformat()}))

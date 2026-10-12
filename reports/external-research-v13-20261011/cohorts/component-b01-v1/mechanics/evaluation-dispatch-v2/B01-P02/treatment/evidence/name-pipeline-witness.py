import io, json, struct, types, hashlib, platform
from pathlib import Path
source=Path(__file__).parent/'commit-__init__.py'
body=source.read_bytes()
expected='6c4dc603a4e63d262a3ddb8671dd68eeacfe26ab868bd8898ca52e85885fca44'
assert hashlib.sha256(body).hexdigest()==expected
# Execute the public, hash-verified ZIP implementation only. The final relative
# import exports the unrelated navigation Path API; it is omitted, not replaced.
core=body.decode().split('from ._path import (  # noqa: E402')[0]
z=types.ModuleType('er13_public_zipfile_core'); z.__file__=str(source)
exec(compile(core,str(source),'exec'),z.__dict__)
def archive(raw,unicode_name):
    payload=b'ordinary text\n'
    crc=z.crc32(payload)
    data=struct.pack('<BL',1,z.crc32(raw))+unicode_name.encode('utf-8')
    extra=struct.pack('<HH',0x7075,len(data))+data
    local=struct.pack(z.structFileHeader,z.stringFileHeader,20,0,0,0,0,33,crc,len(payload),len(payload),len(raw),len(extra))+raw+extra+payload
    central=struct.pack(z.structCentralDir,z.stringCentralDir,20,3,20,0,0,0,0,33,crc,len(payload),len(payload),len(raw),len(extra),0,0,0,0o100600<<16,0)+raw+extra
    end=struct.pack(z.structEndArchive,z.stringEndArchive,0,0,1,1,len(central),len(local),0)
    return local+central+end
rows=[]
for label,raw,unicode_name in [
    ('valid legacy plus Unicode override',b'caf\xe9.txt','café.txt'),
    ('NUL in Unicode override with matching truncated output',b'safe.txt','safe.txt\x00hidden'),
]:
    b=archive(raw,unicode_name)
    with z.ZipFile(io.BytesIO(b)) as f:
        i=f.infolist()[0]; content=f.open(i).read()
        rows.append({'case':label,'header_name_bytes_hex':raw.hex(),'unicode_extra_name':unicode_name,'orig_filename':i.orig_filename,'filename':i.filename,'fields_differ':i.orig_filename!=i.filename,'fields_contain_NUL':any('\x00' in x for x in [i.orig_filename,i.filename]),'read_payload_matches':content==b'ordinary text\n','archive_sha256':hashlib.sha256(b).hexdigest()})
print(json.dumps({'domain':'Independent evaluator in-memory source-mechanism witness; no candidate/importer/platform test','source_sha256':expected,'runtime':platform.python_version(),'adaptation':'CPython 3.13.9 ZIP core executed on host Python; final Path export import omitted','results':rows,'limits':['Not an execution of a full CPython 3.13.9 interpreter','No Windows filesystem, staging, application importer, deployment, or race test','Constructed input is evaluator evidence, not a fresh scientific candidate']},ensure_ascii=False,indent=2))

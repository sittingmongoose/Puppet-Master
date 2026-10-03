import hashlib,json,pathlib
p=pathlib.Path(__file__).resolve().parent
x=json.loads((p/'PUBLIC_EXPORT.json').read_text())
for a in x['artifacts']:
 f=p/a['public_path']
 assert f.is_file() and hashlib.sha256(f.read_bytes()).hexdigest()==a['public_sha256'],a['public_path']
print('PASS',len(x['artifacts']),'public artifact hashes; no semantic/native certification')

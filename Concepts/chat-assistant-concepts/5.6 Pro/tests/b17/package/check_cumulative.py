#!/usr/bin/env python3
"""Read, extract and clean-rebuild the actual cumulative source ZIP.
Outputs never touch the original source or repository. Hashes are raw, unnormalized.
"""
from pathlib import Path,PurePosixPath
import argparse,hashlib,json,subprocess,sys,zipfile
PREFIX='Concepts/chat-assistant-concepts/5.6 Pro'
def sha(b):return hashlib.sha256(b).hexdigest()
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--zip',type=Path,required=True);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve()
 if o.exists():ap.error('Use a fresh output directory')
 o.mkdir(parents=True);r={'status':'running','zip_sha256':sha(a.zip.read_bytes()),'checks':[],'commands':[]};dest=o/'extracted'
 def save():(o/'RESULT.json').write_text(json.dumps(r,indent=2)+'\n')
 def ck(n,v):r['checks'].append({'name':n,'pass':bool(v)});save();assert v,n
 with zipfile.ZipFile(a.zip) as z:
  ck('ZIP CRC valid',z.testzip() is None);ck('Unique archive paths',len(z.namelist())==len(set(z.namelist())))
  ck('Safe relative paths',all(not PurePosixPath(n).is_absolute() and '..' not in PurePosixPath(n).parts and '\\' not in n for n in z.namelist()))
  manifest=json.loads(z.read('SOURCE_MANIFEST.json'));rows=manifest['source_files'];ck('Nonempty source and actual B17 tests present',bool(rows) and any(x['path'].endswith('tests/b17/handler-cases.js') for x in rows))
  ck('All source path sizes/hashes verified on ZIP readback',all(len(z.read(x['path']))==x['bytes'] and sha(z.read(x['path']))==x['sha256'] for x in rows));z.extractall(dest)
 root=dest/PREFIX;before=(root/'index.html').read_bytes();ck('Both archived generated outputs are identical',before==(root/'PM_Chat_Assistant_5.6_Pro_Standalone.html').read_bytes());r['html_sha256']=sha(before)
 (root/'index.html').unlink();(root/'PM_Chat_Assistant_5.6_Pro_Standalone.html').unlink();ck('Both generated outputs actually removed',not (root/'index.html').exists() and not (root/'PM_Chat_Assistant_5.6_Pro_Standalone.html').exists())
 commands=[[sys.executable,'build.py'],['node','tests/b16/graph.js'],['node','tests/b16/controller.js'],[sys.executable,'tests/b17/boundaries.py','--outdir',str(o/'extracted-handler-checks')]]
 for cmd in commands:
  p=subprocess.run(cmd,cwd=root,capture_output=True,text=True);r['commands'].append({'argv':cmd,'exit_code':p.returncode,'stdout':p.stdout,'stderr':p.stderr});save();ck('Extracted command succeeds: '+' '.join(cmd),p.returncode==0)
 ck('Clean rebuilt index is byte-exact, not normalized',before==(root/'index.html').read_bytes());ck('Clean rebuilt standalone is byte-exact',before==(root/'PM_Chat_Assistant_5.6_Pro_Standalone.html').read_bytes());ck('Every listed source hash still matches after rebuild',all(sha((dest/x['path']).read_bytes())==x['sha256'] for x in rows));r['source_file_count']=len(rows);r['status']='pass';save();print(json.dumps({'status':r['status'],'report':str(o/'RESULT.json')}))
if __name__=='__main__':main()

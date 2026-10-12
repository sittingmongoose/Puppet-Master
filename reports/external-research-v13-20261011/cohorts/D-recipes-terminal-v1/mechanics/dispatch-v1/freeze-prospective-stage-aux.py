"""Freeze actual future capture auxiliaries separately; never alter stage science."""
import pathlib,json,hashlib,subprocess,sys
B=pathlib.Path('ER13_RUNTIME');arm,stage=sys.argv[1:3];state=B/'state/dispatcher-v1/arms'/arm;sd=B/'mechanics/dispatch-v1/admitted'/arm/'run'/arm/'stages'/stage
raw=json.loads((state/(stage+'-terminal-task.raw.json')).read_text());status=raw['structuredContent'];assert status['status'] in ['completed','failed','interrupted','cancelled'] and status['hasPendingChildRuns'] is False
expected=['native-capture.js','prospective-capture-v1.json','native-goal-attempt.json']
if arm.startswith('D-'):
    expected += ['prospective-terminal-capture-v1.json','native-terminal-capture.js','native-terminal-check.py','native-completion-attempt.json','native-completion-output-snapshot.json','native-terminal-capture-checked.json']
names=[n for n in expected if (sd/n).is_file()]
if arm.startswith('D-') and (sd/'native-terminal-capture-failed.json').is_file():names.append('native-terminal-capture-failed.json')
assert names
lst=state/(stage+'-capture-aux-selected.json');lst.write_text(json.dumps(names,indent=2)+'\n');dest=B/'mechanics/dispatch-v1/frozen'/(arm+'-'+stage+'-capture-aux');args=['python3','-B',str(B/'helpers/mechanics-v1/freeze.py'),'--root',str(sd),'--list',str(lst),'--destination',str(dest)]
if dest.exists():args.append('--verify')
result=subprocess.run(args,capture_output=True,text=True);assert result.returncode==0,result.stderr
manifest=dest/'authored-manifest.json';receipt={'arm_id':arm,'stage':stage,'manifest':str(manifest),'sha256':hashlib.sha256(manifest.read_bytes()).hexdigest(),'missing_auxiliary_files':[n for n in expected if n not in names],'attempt_marker_is_native_receipt':False,'science_edited':False};p=state/(stage+'-capture-aux-freeze.json')
if not p.exists():p.open('x').write(json.dumps(receipt,indent=2)+'\n');p.chmod(0o444)
print(json.dumps(receipt))

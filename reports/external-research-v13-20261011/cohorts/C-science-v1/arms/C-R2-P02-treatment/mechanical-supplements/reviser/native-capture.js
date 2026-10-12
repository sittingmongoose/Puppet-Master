// Loaded in the candidate's actual functions.exec, never by the preparation helper.
const stageDir = "ER13_RUNTIME/mechanics/dispatch-v1/admitted/C-R2-P02-treatment/run/C-R2-P02-treatment/stages/reviser";
const guard = "ER13_RUNTIME/mechanics/dispatch-v1/admitted/C-R2-P02-treatment/mechanics/exact-goal-binding-guard-v1/assert-active-goal.py";
const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
if (typeof tools.exec_command !== "function" || typeof tools.create_goal !== "function") throw Error("STOP: native tools unsupported; no activation");
const readObjective = `import datetime as dt,hashlib,json,os,sys
from pathlib import Path
d=Path(sys.argv[1]); g=Path(sys.argv[2])
assert d.is_absolute() and not any(p.is_symlink() for p in (d,*d.parents))
assert g.is_absolute() and not any(p.is_symlink() for p in (g,*g.parents))
assert hashlib.sha256(g.read_bytes()).hexdigest()==sys.argv[3], 'guard pin mismatch'
p=d/'freeze.json'; assert not p.is_symlink()
b=p.read_bytes(); assert hashlib.sha256(json.dumps({k:v for k,v in json.loads(b).items() if k in ('native_goal_objective','deadline_utc','stage_deadline_utc','whole_deadline_utc')},ensure_ascii=False,sort_keys=True).encode()).hexdigest()==sys.argv[4], 'freeze pin mismatch'
f=json.loads(b); o=f['native_goal_objective']; assert isinstance(o,str) and 0<len(o)<4000
deadlines=[f[k] for k in ('deadline_utc','stage_deadline_utc','whole_deadline_utc') if k in f]
now=dt.datetime.now(dt.timezone.utc)
assert deadlines and all(dt.datetime.fromisoformat(x.replace('Z','+00:00'))>now for x in deadlines), 'expired original clock'
assert not any((d/n).exists() or (d/n).is_symlink() for n in ('native-goal-create.json','native-goal-active.json','native-goal-terminal.json')), 'receipt already exists'
fd=os.open(str(d/'native-goal-attempt.json'),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
with os.fdopen(fd,'w',encoding='utf-8') as a:
    json.dump({'schema':'er13.native_activation_attempt.v1','native_creation_outcome':'UNKNOWN','not_a_receipt':True},a)
print(json.dumps(o,ensure_ascii=False))`;
const read = await tools.exec_command({cmd: "python3 -B -c " + q(readObjective) + " " + q(stageDir) + " " + q(guard) + " " + q("4a61deec5eb0ca5eca149f0e1f30c55c3e90b5a6ad0557fc98946d340cae99ed") + " " + q("f7d78982e775d85b8ad235c7450a216c40f18b7db59206e487b63cc9fcaa533e"), max_output_tokens: 6000});
if (read.exit_code !== 0 || read.session_id) throw Error("STOP: activation preflight/attempt claim failed; no Goal retry: " + read.output);
const objective = JSON.parse(read.output);
if (typeof objective !== "string" || !objective.length) throw Error("STOP: objective is not a string; preserve attempt claim");
// Exactly one actual native call. A thrown/unknown outcome leaves the attempt claim.
const response = await tools.create_goal({objective});
if (!response || typeof response !== "object" || Array.isArray(response)) throw Error("STOP: unsupported native response; preserve attempt claim; no replacement Goal");
const receipt = JSON.stringify(response);
text(receipt); // Complete direct returned JSON also survives a subsequent save failure.
const save = `import os,sys
from pathlib import Path
d=Path(sys.argv[1]); assert d.is_absolute() and not any(p.is_symlink() for p in (d,*d.parents))
data=sys.argv[2].encode('utf-8')
for name in ('native-goal-create.json','native-goal-active.json'):
    fd=os.open(str(d/name),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
    with os.fdopen(fd,'wb') as f:
        f.write(data)`;
const checked = await tools.exec_command({cmd: "python3 -B -c " + q(save) + " " + q(stageDir) + " " + q(receipt) + " && python3 -B " + q(guard) + " --stage-dir " + q(stageDir) + " --json " + q(receipt), max_output_tokens: 1500});
if (checked.exit_code !== 0 || checked.session_id) throw Error("STOP: save/binding failed; preserve direct response/attempt/diagnostic; no second Goal: " + checked.output);
text({activation_binding_checked: true, receipt_path: stageDir + "/native-goal-create.json", active_receipt_path: stageDir + "/native-goal-active.json", provenance_and_freshness: "UNKNOWN beyond checker"});

"""Parameterized successor of the A1 operator. Requires a separate actual user Go.
No launch is authorized by importing this file or by the offline repair.
"""
import argparse,hashlib,json,os,shutil,signal,subprocess,sys,time,traceback
from pathlib import Path
LAB=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
RESULT_READER=LAB/'muse-result-v2/tools'
ROOT=None
ACK=LAB/'ack-boundary-v1'
COMMIT=None
sys.path[:0]=[str(RESULT_READER),str(ACK/'tools'),str(LAB/'tools')]
import host_receiver,completion_store,run_arm
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def put(p,value):
    p=Path(p);p.write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
def main(args):
    global ROOT,COMMIT
    ROOT=args.run_root.resolve();COMMIT=args.authorized_commit
    if ROOT.parent != LAB.resolve():raise RuntimeError('fresh run root must be a direct child of the experiment lab')
    if ROOT.exists():raise RuntimeError('existing root: no redispatch or resume')
    if not args.authorization_reference.strip():raise RuntimeError('actual user authorization reference required')
    # One prospective clock: retain the host-observed Go epoch through publication.
    # Earlier development is reported separately, never reset into native time.
    start=args.orchestration_started_epoch;deadline=start+390
    if not 0<=time.time()-start<10:raise RuntimeError('launch preparation exceeded ten seconds of the ninety-second host reserve; refuse inference')
    new_pins=HERE.parent/'SOURCE_PINS.json'
    if sha(new_pins)!=args.source_pins_sha256:raise RuntimeError('successor manifest differs from authorized pin')
    successor_pins=json.loads(new_pins.read_text())
    for rel,v in successor_pins['files'].items():
        if sha(HERE.parent/rel)!=v['sha256']:raise RuntimeError('successor source drift: '+rel)
    for rel,h in successor_pins['unchanged_lab_dependencies'].items():
        if sha(LAB/rel)!=h:raise RuntimeError('successor dependency drift: '+rel)
    pins=json.loads((ACK/'SOURCE_PINS.json').read_text())
    for rel,v in pins['files'].items():assert sha(ACK/rel)==v['sha256'],rel
    for rel,h in pins['unchanged_lab_dependencies'].items():assert sha(LAB/rel)==h,rel
    binary=Path('/home/sittingmongoose/.local/bin/muse-bin-1.4.0-R4161.1')
    assert sha(ACK/'SOURCE_PINS.json')=='f5844a44719f14db1dcb696eede03696e4b57456dabc56703f709ac18e1b0f2e','approved manifest differs'
    assert sha(binary)=='1b68bd4518d53a2aaff063915df4d141b0a205e6d79038299d04e3a14e85a5b9','runtime changed'
    assert (LAB/'tools/r1b/muse-serve-noshell.sh').read_text().endswith('exec /home/sittingmongoose/.local/bin/muse-bin-1.4.0-R4161.1 "$@" --disable-shell\n')
    ROOT.mkdir(exist_ok=False) # Durable single-use claim; existing root refuses dispatch.
    put(ROOT/'phase-clock.json',{'started_epoch':start,'deadline_epoch':deadline,'whole_seconds':390,'reserved_native_seconds':300,'reserved_host_seconds':90,'slots':1,'state':'claimed','source_commit':COMMIT})
    ws=ROOT/'ws';(ws/'inputs').mkdir(parents=True)
    # Stage only the four frozen successor inputs, checked byte for byte.
    packet=HERE.parent/'inputs'
    input_manifest=HERE.parent/'input-manifest.json'
    expected_inputs={'task.txt','inputs/01.md','inputs/07.md','inputs/revision-1.md','inputs/revision-2.md'}
    manifest=json.loads(input_manifest.read_text())
    if set(manifest)!=expected_inputs:raise RuntimeError('successor input inventory differs')
    for rel,entry in manifest.items():
        source=packet/('task.txt' if rel=='task.txt' else 'templates/'+Path(rel).name)
        if sha(source)!=entry['sha256']:raise RuntimeError('unchanged packet pin differs: '+rel)
        destination=ws/rel;destination.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(source,destination)
    (ROOT/'launch-objective.txt').write_text((ws/'task.txt').read_text().strip())
    for p in [ws/'task.txt',*(ws/'inputs').iterdir()]:
        assert p.stat().st_size<=4096 if p.parent.name=='inputs' else True
        p.chmod(0o444)
    put(ROOT/'input-manifest.json',run_arm.manifest(ws))
    sources={str(p):sha(p) for p in [Path(__file__),Path(__file__).with_name('audit_check.py'),Path(__file__).with_name('report_check.py'),ACK/'SOURCE_PINS.json',new_pins,RESULT_READER/'native_completion.py',binary,LAB/'tools/r1b/muse-serve-noshell.sh',LAB/'tools/run_arm.py']}
    put(ROOT/'launch-identities.json',{'authorized_commit':COMMIT,'published_source_pins_sha256':sha(ACK/'SOURCE_PINS.json'),'published_pins':pins,'additional_sources':sources,'requested_app':'Muse Code','requested_model':'muse-spark-1.3-contributor','requested_effort':'max','limits':{'native_seconds':300,'parent_responses':48,'whole_seconds':390,'payload_attempts':4,'marker_attempts':4,'payload_bytes':4096},'authorization_reference':args.authorization_reference,'successor_source_pins_sha256':args.source_pins_sha256,'whole_check_clock':'host-observed Go through confirmed publication,390 seconds; no reset at native dispatch'})
    store=host_receiver.create_receiver(ws,ROOT/'store',ROOT/'native')
    original_write=completion_store.write_json
    def observed_write(path,value):
        is_receipt=Path(path).parent==store.feedback and Path(path).name!='status.json'
        before=None
        if is_receipt:
            a=next(a for a in store.state['attempts'] if a['request']==value['request'])
            state=json.loads(store.state_path.read_text())
            before={'kind':'receipt_published','request':a['request'],'sequence':a['sequence'],'finding_id':a['finding_id'],'revision':a['revision'],'status':a['status'],'snapshot_sha256':sha(store.archive/a['snapshot']) if a['snapshot'] else None,'marker_snapshot_sha256':sha(store.archive/a['marker_snapshot']) if a['marker_snapshot'] else None,'snapshots_and_state_precede_receipt':a in state['attempts'] and bool(a['snapshot']) and bool(a['marker_snapshot'])}
        original_write(path,value)
        if before is not None:
            before.update(receipt_published_epoch_ns=time.time_ns(),receipt_sha256=sha(path))
            with (ROOT/'receipt-order.jsonl').open('a') as f:f.write(json.dumps(before)+'\n')
    completion_store.write_json=observed_write
    argv=[sys.executable,str(LAB/'tools/r1b/run_goal_r1b.py'),'--app','muse','--workspace',str(ws),'--prompt-file',str(ws/'task.txt'),'--out',str(ROOT/'native'),'--label',args.label,'--max-seconds','300','--max-responses','48']
    # The sole slot/reserve was reserved before staging; setup spends host reserve.
    assert time.time()-start<10,'concrete setup gate: insufficient retained host reserve'
    put(ROOT/'dispatch.json',{'argv':argv,'launch_epoch':time.time(),'prelaunch_seconds':time.time()-start,'task_sha256':sha(ws/'task.txt'),'objective_sha256':sha(ROOT/'launch-objective.txt'),'input_manifest_sha256':sha(ROOT/'input-manifest.json'),'identities_sha256':sha(ROOT/'launch-identities.json'),'receiver_instrumentation':'transparent write_json observation; frozen receiver/driver files unchanged','no_host_redispatch':True,'native_internal_retries':'unchanged; count from Task-ID journal events after closure'})
    polls=0;poll_seconds=0.;idle={'polls':0,'publication_delta':0,'projection_bytes_unchanged':True};error=None;proc=None
    raw_poll=store.poll
    def observed_poll():
        nonlocal polls,poll_seconds
        before_fingerprint=store._published_fingerprint;before_publications=store.publication_count
        t=time.monotonic();value=raw_poll();poll_seconds+=time.monotonic()-t;polls+=1
        if store.state['attempts'] and before_fingerprint==store._published_fingerprint:
            idle['polls']+=1;idle['publication_delta']+=store.publication_count-before_publications
            idle['projection_bytes_unchanged'] &= all(p.read_bytes()==b for p,b in store._published_bytes.items())
        if value['protocol_errors'] or any(a['status']!='VALID_UNVERIFIED' for a in store.state['attempts']):raise RuntimeError('structural/protocol failure; no correction slot')
        ops=store.state['native_operations']
        payload_ops=[o for o in ops if o.get('tool_name')=='write_file' and o.get('path','').startswith(str(store.payloads)+'/')]
        marker_ops=[o for o in ops if o.get('tool_name')=='write_file' and o.get('path','').startswith(str(store.requests)+'/')]
        if len(payload_ops)>4 or len(marker_ops)>4 or any(o.get('content_bytes',0)>4096 for o in payload_ops):raise RuntimeError('task submission/payload capacity exceeded')
        if any(o.get('tool_name')=='write_file' and o not in payload_ops+marker_ops for o in ops):raise RuntimeError('write outside permitted submissions/requests')
        if any(p.get('status') in ('fault','failed','unqualified','unrecognized','over_limit') for p in store.state['pending_submissions'].values()):raise RuntimeError('failed native submission; no replacement')
        if any(o['tool_name'] not in ('read_file','write_file') for o in ops):raise RuntimeError('unpermitted native tool; stop')
        return value
    store.poll=observed_poll
    def cleanup():
        for sig in (signal.SIGTERM,signal.SIGKILL):
            try:os.killpg(proc.pid,sig)
            except ProcessLookupError:pass
            try:proc.wait(timeout=10);return
            except subprocess.TimeoutExpired:pass
        raise RuntimeError('bounded process cleanup exhausted')
    native_start=time.time()
    print(json.dumps({'state':'dispatching','run_root':str(ROOT),'whole_deadline_epoch':deadline}),flush=True)
    try:
        with (ROOT/'driver-output.log').open('w') as log:
            proc=subprocess.Popen(argv,cwd=LAB,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
            summary=host_receiver.watch_process(proc,store,deadline_epoch=deadline-25,stop_and_reap=cleanup)
    except BaseException as exc:
        error=f'{type(exc).__name__}: {exc}';(ROOT/'host-exception.txt').write_text(traceback.format_exc())
        summary=store.summary()
    native_end=time.time()
    # Drain/freeze happen in the pinned attachment after process quiescence.
    receipt=json.loads((ROOT/'native/receipt.json').read_text()) if (ROOT/'native/receipt.json').exists() else {}
    if receipt:run_arm.copy_native_logs('muse',receipt,ROOT/'native')
    elif store.state.get('native_finalization',{}).get('binding'):
        shutil.copyfile(store.state['native_finalization']['binding']['journal_path'],ROOT/'native/muse-session.jsonl')
    put(ROOT/'store-summary.json',summary)
    put(ROOT/'host-receipt.json',{'error':error,'process_exit':proc.returncode if proc else None,'native_stop':receipt.get('stop_reason'),'driver_and_receiver_seconds':native_end-native_start,'host_poll_calls':polls,'receiver_core_poll_seconds':poll_seconds,'projection_publications':store.publication_count,'idle_publication':idle,'complete_check_seconds_before_audit':time.time()-start,'inputs_unchanged':all(sha(ws/k)==v['sha256'] for k,v in json.loads((ROOT/'input-manifest.json').read_text()).items()),'structurally_complete':summary['complete'],'closed':store.state['closed']})
    audit=Path(__file__).with_name('audit_check.py')
    if audit.is_file() and time.time()<deadline-2:
        p=subprocess.run([sys.executable,str(audit),str(ROOT)],capture_output=True,text=True,timeout=max(1,deadline-time.time()-1))
        (ROOT/'audit.stdout').write_text(p.stdout);(ROOT/'audit.stderr').write_text(p.stderr)
    put(ROOT/'frozen-manifest.json',run_arm.manifest(ROOT))
    end=time.time()
    put(ROOT/'phase-terminal.json',{'start_epoch':start,'end_epoch':end,'execution_terminal_seconds_from_go':end-start,'execution_terminal_within_whole_ceiling':end<=deadline,'whole_check_including_publication':'pending; host must record publication confirmation against same deadline','state':'closed','dispatched':1,'replacement_authorized':False,'native_stop':receipt.get('stop_reason'),'host_error':error})
    report=Path(__file__).with_name('report_check.py')
    if report.is_file():
        p=subprocess.run([sys.executable,str(report),'prepare','--run-root',str(ROOT),'--result-dir',str(args.result_dir.resolve())],capture_output=True,text=True,timeout=max(1,deadline-time.time()-1) if time.time()<deadline-2 else 5)
        (ROOT/'report.stdout').write_text(p.stdout);(ROOT/'report.stderr').write_text(p.stderr)
    print((ROOT/'phase-terminal.json').read_text(),flush=True)
if __name__=='__main__':
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--run-root',type=Path,required=True)
    cli.add_argument('--label',required=True)
    cli.add_argument('--authorized-commit',required=True)
    cli.add_argument('--source-pins-sha256',required=True)
    cli.add_argument('--authorization-reference',required=True)
    cli.add_argument('--orchestration-started-epoch',type=float,required=True)
    cli.add_argument('--result-dir',type=Path,required=True)
    main(cli.parse_args())

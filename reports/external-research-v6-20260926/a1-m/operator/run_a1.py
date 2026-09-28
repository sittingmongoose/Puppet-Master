"""One authorized A1-M slot; uses pinned receiver/driver, no retry path."""
import hashlib,json,os,shutil,signal,subprocess,sys,time,traceback
from pathlib import Path
LAB=Path(__file__).resolve().parents[1]
ROOT=LAB/'a1-m-20260928'
ACK=LAB/'ack-boundary-v1'
COMMIT='655fa669c71fa9832df479a16efd3b54f425dd08'
sys.path[:0]=[str(ACK/'tools'),str(LAB/'tools')]
import host_receiver,completion_store,run_arm
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def put(p,value):
    p=Path(p);p.write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
def main():
    pins=json.loads((ACK/'SOURCE_PINS.json').read_text())
    for rel,v in pins['files'].items():assert sha(ACK/rel)==v['sha256'],rel
    for rel,h in pins['unchanged_lab_dependencies'].items():assert sha(LAB/rel)==h,rel
    binary=Path('/home/sittingmongoose/.local/bin/muse-bin-1.4.0-R4161.1')
    assert sha(ACK/'SOURCE_PINS.json')=='f5844a44719f14db1dcb696eede03696e4b57456dabc56703f709ac18e1b0f2e','approved manifest differs'
    assert sha(binary)=='1b68bd4518d53a2aaff063915df4d141b0a205e6d79038299d04e3a14e85a5b9','runtime changed'
    assert (LAB/'tools/r1b/muse-serve-noshell.sh').read_text().endswith('exec /home/sittingmongoose/.local/bin/muse-bin-1.4.0-R4161.1 "$@" --disable-shell\n')
    ROOT.mkdir(exist_ok=False) # Durable single-use claim; existing root refuses dispatch.
    start=time.time();deadline=start+390
    put(ROOT/'phase-clock.json',{'started_epoch':start,'deadline_epoch':deadline,'whole_seconds':390,'reserved_native_seconds':300,'reserved_host_seconds':90,'slots':1,'state':'claimed','source_commit':COMMIT})
    ws=ROOT/'ws';(ws/'inputs').mkdir(parents=True)
    original=(LAB/'delivery-v2/fixtures/valid.md').read_text()
    revision=(LAB/'delivery-v2/fixtures/revision.md').read_text()
    for i in range(1,8):
        label=f'batch-{i:02d}' if i<7 else 'independent'
        (ws/f'inputs/{i:02d}.md').write_text(original.replace('# Synthetic widget capacity',f'# Synthetic widget capacity {label}',1))
    (ws/'inputs/revision-1.md').write_text(revision.replace('# Synthetic widget capacity','# Synthetic widget capacity batch-01',1))
    (ws/'inputs/revision-2.md').write_text((ws/'inputs/01.md').read_text()+'\n## change_reason\nThis explicit new synthetic revision restores OLD_WIDGET_UNITS_2 after NEW_WIDGET_UNITS_3. Keep both prior versions as history; do not infer a fallback.\n')
    task='''You are authorized now to perform ONE synthetic delivery integration assignment in this fresh native Goal. This is copying artificial templates, not research. Complete this Goal after the prescribed work, or report the exact blocker without extra attempts.

Limits: 300 seconds, 48 parent responses; at most NINE submission attempts (seven initial records, then two specified revisions). Every payload must be at most 4096 UTF-8 bytes. Invalid/failed attempts count. No correction, retry, replacement or additional record is authorized. Use only native read_file and write_file within this workspace and the existing Goal lifecycle. No shell, web/network, external paths, subagents or evaluator.

Read inputs/01.md through inputs/07.md, inputs/revision-1.md and inputs/revision-2.md. Copy their complete bytes exactly (including the final newline, quoted text, backslashes, code indentation, headings, conditions and UNEXECUTED proposal); do not summarize, repair or add fields.

1. In ONE native tool-call batch, make SIX independent write_file calls: copy inputs/01.md..06.md respectively to out/submissions/new--batch-01.md..new--batch-06.md. Wait for all six payload tool results.
2. In ONE native tool-call batch, make SIX independent write_file calls to out/requests/new--batch-01..new--batch-06, each with content exactly "submit" followed by one newline (seven UTF-8 bytes). Wait for these tool results. Do not serialize these six independent marker Writes into separate turns.
3. Copy inputs/07.md to out/submissions/new--independent.md; after that Write succeeds, write the seven-byte submit-plus-newline marker to out/requests/new--independent.
4. Read feedback/new--batch-01.json..new--batch-06.json and feedback/new--independent.json. The host publishes these structural receipts only after native Write completion; if one is not present yet, use a bounded later read within this same Goal, never rewrite the original input. Stop on any INVALID receipt or protocol error; no correction is authorized. Keep reading/rechecking within the existing response/time cap, with no infinite polling.
5. Take the finding_id from feedback/new--batch-01.json (do not assume receipt order). Copy inputs/revision-1.md to out/submissions/<finding_id>--revision-1.md. After its successful Write, create out/requests/<finding_id>--revision-1 with the same seven-byte marker. Read feedback/<finding_id>--revision-1.json. This revision changes the synthetic value from two to three.
6. Only after that VALID_UNVERIFIED receipt, copy inputs/revision-2.md to out/submissions/<finding_id>--revision-2.md, then after payload success create its seven-byte marker at out/requests/<finding_id>--revision-2. Read its feedback receipt. This is a deliberate new revision restoring two, with a supplied change reason; preserve its original prior versions as history.
7. Read feedback/status.json. Finish the native Goal with a short truthful delivery status. Do not create any extra report or files.

The host assigns finding identities, keeps snapshots/history, and supplies structural-only feedback. VALID_UNVERIFIED is not a semantic research grade. Never mutate an acknowledged payload or marker. Do not edit inputs, task.txt, feedback or host artifacts. No extra submission is permitted by the receiver's larger underlying capacity.
'''
    (ws/'task.txt').write_text(task)
    (ROOT/'launch-objective.txt').write_text(task.strip())
    for p in [ws/'task.txt',*(ws/'inputs').iterdir()]:
        assert p.stat().st_size<=4096 if p.parent.name=='inputs' else True
        p.chmod(0o444)
    put(ROOT/'input-manifest.json',run_arm.manifest(ws))
    shutil.copyfile('/home/sittingmongoose/.codex/attachments/395e1d26-6162-453a-b1a7-5b6dafe15625/Pasted text.txt',ROOT/'technical-review.txt')
    sources={str(p):sha(p) for p in [Path(__file__),Path(__file__).with_name('audit_a1.py'),ACK/'SOURCE_PINS.json',binary,LAB/'tools/r1b/muse-serve-noshell.sh',LAB/'tools/run_arm.py']}
    put(ROOT/'launch-identities.json',{'authorized_commit':COMMIT,'published_source_pins_sha256':sha(ACK/'SOURCE_PINS.json'),'published_pins':pins,'additional_sources':sources,'requested_app':'Muse Code','requested_model':'muse-spark-1.3-contributor','requested_effort':'max','limits':{'native_seconds':300,'parent_responses':48,'whole_seconds':390,'submission_attempts':9,'payload_bytes':4096},'authorization':'User explicit Go for A1-M only in current Codex thread; no other slots or calls authorized.'})
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
    argv=[sys.executable,str(LAB/'tools/r1b/run_goal_r1b.py'),'--app','muse','--workspace',str(ws),'--prompt-file',str(ws/'task.txt'),'--out',str(ROOT/'native'),'--label','A1-M','--max-seconds','300','--max-responses','48']
    # The sole slot/reserve was reserved before staging; setup spends host reserve.
    assert time.time()-start<10,'concrete setup gate: insufficient retained host reserve'
    put(ROOT/'dispatch.json',{'argv':argv,'launch_epoch':time.time(),'prelaunch_seconds':time.time()-start,'task_sha256':sha(ws/'task.txt'),'objective_sha256':sha(ROOT/'launch-objective.txt'),'input_manifest_sha256':sha(ROOT/'input-manifest.json'),'identities_sha256':sha(ROOT/'launch-identities.json'),'receiver_instrumentation':'transparent write_json observation; frozen receiver/driver files unchanged','no_retries':True})
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
        if len(payload_ops)>9 or len(marker_ops)>9 or any(o.get('content_bytes',0)>4096 for o in payload_ops):raise RuntimeError('task submission/payload capacity exceeded')
        if any(o.get('tool_name')=='write_file' and o not in payload_ops+marker_ops for o in ops):raise RuntimeError('write outside permitted submissions/requests')
        if any(p.get('status') in ('fault','failed','unqualified','over_limit') for p in store.state['pending_submissions'].values()):raise RuntimeError('failed native submission; no replacement')
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
    audit=Path(__file__).with_name('audit_a1.py')
    if audit.is_file() and time.time()<deadline-2:
        p=subprocess.run([sys.executable,str(audit),str(ROOT)],capture_output=True,text=True,timeout=max(1,deadline-time.time()-1))
        (ROOT/'audit.stdout').write_text(p.stdout);(ROOT/'audit.stderr').write_text(p.stderr)
    put(ROOT/'frozen-manifest.json',run_arm.manifest(ROOT))
    end=time.time()
    put(ROOT/'phase-terminal.json',{'start_epoch':start,'end_epoch':end,'complete_check_seconds':end-start,'within_whole_ceiling':end<=deadline,'state':'closed','dispatched':1,'replacement_authorized':False,'native_stop':receipt.get('stop_reason'),'host_error':error})
    print((ROOT/'phase-terminal.json').read_text(),flush=True)
if __name__=='__main__':main()

# Launch gate v1 — HOLD

2026-09-30T14:34:40.794721+00:00

Independent offline review; no native candidate Goal launched. Sources were live during the initial reads and repair started before a coherent snapshot could be frozen. This records initial defects; it approves no hashes.

## LG01 — M/Z launch has no filesystem namespace boundary

Owner: development2 / dispatch_mz. Status: blocking.

Initial run_attempt.py launches subprocess.Popen(cmd) where cmd is native/run_goal.py, with no namespace_command; native Host/Protocol launch installed binaries directly. Task text and read-only input modes do not hide evaluator/history files.

## LG02 — M/Z fixed whole clock excludes setup and RPC calls can overrun remaining wall cap

Owner: dispatch_mz. Status: blocking.

Initial run_goal.py assigns t0 only after initialize/model/session/effort calls; Z sleeps and session/read(timeout45) occur before cap evaluation. Admission does not pass an absolute deadline.

## LG03 — Output freezing and slot release do not require sufficient quiescence evidence

Owner: development2 / dispatch_mz / dispatch_l. Status: blocking.

Initial freeze() records operator must independently establish but copies anyway. Initial slot_ledger.release() admits any truthy object. M/Z Host.close and Protocol.close stop their process without joined log writers or native inactive+idle evidence.

## LG04 — Source index omits numbered normative headings

Owner: development2. Status: blocking.

Initial source_index.py handles Markdown/HTML headings and code symbols only; numbered text such as 2. Scope and 2.1. Conditions has no locator.

## LG05 — Input admission lacks a source hash allowlist and rejects only leaf symlinks

Owner: development2. Status: blocking.

Initial copy_inputs() checks raw.is_symlink() only and does not consume an admitted_inputs path/hash allowlist; a symlinked parent bypasses this check.

## LG06 — L RPC.call timeout can be defeated by a continuous event stream

Owner: dispatch_l. Status: blocking.

Initial call() loops frames.get(timeout=max(.01,end-monotonic())) without checking end expiry; events continue indefinitely after deadline.

## LG07 — Aggregate occupied-slot admission does not reserve charged bounded cleanup

Owner: dispatch_mz. Status: blocking.

Initial acquire commits research seconds only, although native cap shutdown performs additional waits. Cleanup counts in occupied-slot campaign ceiling.

## LG08 — L constructor failure after process start could be mistaken for server_not_started

Owner: dispatch_l. Status: review-required.

run() assigns rpc only after RPC constructor returns; finally uses server_not_started when rpc is None. Constructor owns opened files, Popen, reader startup without internal rollback.

Review is limited to fresh Goal/model/effort identity, hidden evaluator/history access, useful locator indexing, prospective caps, native termination/slot release, source pins and quiescent output freeze. It does not demand a universal platform overhaul or assess research answers.

Follow-up must preserve this record and use a coherent frozen repair version (maximum two successive repair versions).

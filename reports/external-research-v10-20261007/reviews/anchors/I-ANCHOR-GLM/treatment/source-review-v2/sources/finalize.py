"""Assemble this diagnostic review from the independent assessments below."""
from pathlib import Path
import datetime
import hashlib
import json

ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'sources'
FINAL='/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-ANCHOR-GLM/treatment/critic-finalizer-v2/final.md'
CRITIQUE='/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-ANCHOR-GLM/treatment/critic-finalizer-v2/critique.md'

def obligation(ident, requirement, status, locations, evidence, assessment):
    return dict(id=ident,requirement=requirement,status=status,assessment_complete=True,
                artifact_locations=locations,primary_evidence=evidence,assessment=assessment)

OBLIGATIONS=[
 obligation('I01','Real primary public-source selection from the brief','SATISFIED',
 ['final.md:7-24','sources/SOURCES.md: SRC-01 through SRC-11'],
 ['P01','P02','P03','P04','P05','P06','P07','P08','P09','P10','P11'],
 'The selected maintainers, original security researchers, and W3C directly address archive imports, trust, transactional update analogies, multilingual search, untrusted HTML, accessibility, and reader releases. Selection is genuinely driven by the museum brief. This positive rests on inspected content and relevance, not the count or existence of citations. Uptane is a bounded philosophical analogy, not an inspected implementation.'),
 obligation('I02','Compare materially different mechanisms and useful alternatives','PARTIALLY_SATISFIED',
 ['final.md:12-24','critique.md:23-25'],['P04','P06','P07','P08','P09','P02','P13'],
 'Three comparisons are materially developed: content trees versus partition A/B; reduced signed metadata versus TUF roles; confinement plus sanitization versus sanitization alone. Operational weight and fidelity are product judgments, not measurements. The search comparison names external engines but inspects no external search engine, and the ICU probe is of tokenizer registration. Delegated targets concern distribution authority, not a complete alternative editor preview/approval mechanism. These weaker rows do not erase the genuine alternatives elsewhere.'),
 obligation('I03','Inspect actual component/code behavior at a pinned version','SATISFIED_WITH_LIMITS',
 ['final.md:7,17,29','critique.md:7-10,29','research-v2/sources/executed-checks.json: CHK-1/CHK-2'],
 ['P12','P13','P14','P23','P25','reviewer-executed-checks.json'],
 'Reported runtime probes are pinned to CPython 3.14.4 and SQLite 3.46.1 and their principal observations independently reproduce. Tagged upstream code confirms zipfile path-component stripping and FTS5 mode-2/trigram implementation; upstream tests were read, not run. The local SQLite source ID ends in alt1 rather than the stock release suffix, so version-string equality is not a byte-identical build pin. The candidate did not supply a shipping binary/dependency pin; calling the research runtime the shipping build is premature. This is enough actual component behavior for the obligation, not a production validation or proof of every extraction/security condition.'),
 obligation('I04','Investigate pertinent issue/fix/regression test and release applicability, or justify equivalent implementation history','PARTIALLY_SATISFIED',
 ['final.md:7,17,37','critique.md:14,29-33'],['P01','P02','P03','P14','P15','P23'],
 'The original traversal disclosure and the documented mode-1 multi-diacritic compatibility bug are pertinent. Trigram introduction is correctly tied to 3.34.0. However, the declared source set does not inspect an upstream fixing change or upstream regression test for either issue, the mode-2 landing release is explicitly unpinned, and the actual candidate Cezanne probe does not distinguish mode 1 from mode 2. A proposed U+1ED9 regression is not an executed one. A/B-to-Virtual-A/B overview is not an argued equivalent issue/fix/test history. Reviewer-only P15 identifies 3.27.0 and P14/P23 supply test context; that evidence establishes the gap and cannot retroactively complete the frozen research.'),
 obligation('I05','Compare every relevant discovery against frozen sandbox plan choices','PARTIALLY_SATISFIED',
 ['final.md:7,11-24','critique.md:35-43'],['P01','P02','P04','P06','P08','P09','P10'],
 'All six thin-plan choices receive a keep/correct/reject disposition, and all six explicitly unspecified areas receive proposed treatment. Most dispositions are useful. But the blanket claim that page scanning fails multilingual search is not established by FTS5-only probes, and the final drops named optional discoveries and uncertainty boundaries carried by the critique. Update durability, offline freshness, trust recovery, and hostile import limits are incompletely compared with governing source conditions. This is broad comparison, not every relevant discovery preserved.'),
 obligation('I06','Preserve supported corrections, product choices, covered dispositions, optional discoveries, justified uncertainties and useful validation proposals','PARTIALLY_SATISFIED',
 ['final.md:3,11-24,37','critique.md:19-21,29,41-45'],['P02','P04','P05','P08','P09','P10','P11'],
 'The final preserves CPython sanitization versus rejection, short-CJK LIKE fallback, explicit mode 2, optional threshold signing, orientation justification, a deferred WebKit release pin, and hardware/manual validation. It loses the critique-named delta-sync and fleet-manifest leads, Uptane philosophy-only boundary, DOMPurify date/runtime caveats, and the explicit OSTree Deployments-not-inspected limitation. It also omits the exact U+1ED9 regression from its own validation list. Retaining the separate critique file is not the required preservation in the final proposal. No unseen draft content was used to enlarge this finding.'),
 obligation('I07','Complete same-family criticism and final proposal','PARTIALLY_SATISFIED',
 ['critique.md:1-47','final.md:1-37'],['P02','P04','P09','P10'],
 'An actual supplied critique exists and its content is assessed: it finds the meaningful two-character CJK problem, weak WebKit pinning, and mode-2 provenance framing. The final adopts several of those changes. This is substantive criticism, not inferred from a filename. Yet the critique overstates closure of key-compromise recovery and labels all unspecified areas covered while missing governing conditions; the final does not preserve its entire supported scope. Model-family/dispatch authenticity and terminal eligibility are coordinator matters and were not re-audited.'),
 obligation('I08','Distinguish executed checks from proposals','SATISFIED_WITH_LIMITS',
 ['final.md:3,26-29,35-37','critique.md:5-10,44-47','research-v2/sources/executed-checks.json'],
 ['reviewer-executed-checks.json','P12','P13'],
 'The overarching text marks mechanisms and the hardware, metadata, renderer, search-performance, and accessibility suite as proposals. The executed list is limited to retrieval and small runtime probes; invalid substring probes and corrections remain visible in the frozen CHK-2 record. CF execution is described in authored prose rather than independent raw stdout in the authorized source directory. Current reproduction corroborates behaviors, not historical execution identity. The word shipped at final line 19 is ambiguous, but the explicit proposal-wide scope governs; it is not graded as an executed implementation.'),
 obligation('R01','Operate offline and import periodic content bundles','PARTIALLY_SATISFIED',
 ['final.md:11-16'],['P04','P08','P26'],
 'Local immutable editions and per-edition search make offline serving plausible, and release/polling supplies an import path when connectivity exists. The optional polling choice need not imply an always-online reader. The plan nevertheless lacks a trusted time policy for freshness during long offline periods and an explicit import/recovery policy when metadata is expired or no reliable clock exists. Neither an offline transport requirement nor an assumption of network exposure was added by this review.'),
 obligation('R02','Survive power loss during updates while serving a coherent previous edition','PARTIALLY_SATISFIED',
 ['final.md:13-14,17,37'],['P06','P07','P08','P16','P17'],
 'Staging, immutable trees, signed hashes, retained previous content, symlink rename, and a hardware power-cut harness are sound improvements over overwriting live files. Rename supplies live namespace atomicity, not by itself post-crash durability. The written ordering flushes before the pointer flip and leaves durable pointer/previous/high-water sequencing unspecified. Search index readiness before the flip and nested directory flushing are also not explicit. No hardware failure or success was inferred from the proposed harness.'),
 obligation('R03','Multi-language text/search/images','PARTIALLY_SATISFIED',
 ['final.md:11,17,37'],['P02','P03','P13','P15','reviewer-executed-checks.json'],
 'HTML/assets provide text and images. Latin mode 2 and trigram search with a short-CJK LIKE fallback have direct support; the new two-character class is useful. Prefix-expansion is underspecified and must not be mistaken for simply adding FTS5 prefix indexes. The relevance matrix covers Latin diacritics and CJK lengths, but not all unspecified museum languages, script normalization, language fallback, or bidirectional navigation. No throughput or less-than-50-ms result is reported, and none was awarded.'),
 obligation('R04','Accessible navigation','PARTIALLY_SATISFIED',
 ['final.md:19,37','critique.md:18'],['P10'],
 'The selected contrast, focus, gesture, drag, orientation, and target-size criteria are pertinent, correctly attributed, and retained with manual auditing proposed. Twenty-four CSS pixels is AA with exceptions; 44 is an enhanced AAA criterion and may validly be a stricter editorial choice. WCAG AA also covers all A/AA criteria and full pages/processes. The named gate on chrome and fixtures does not spell out contributed-page coverage, image text alternatives, keyboard navigation, language exposure, or unobscured focus. Section 6 can reasonably be read as a broader future AA audit, so this is an incomplete planning scope, not a false claim of achieved certification.'),
 obligation('R05','Handle some untrusted contributed content','PARTIALLY_SATISFIED',
 ['final.md:11-13,18,24,37'],['P01','P04','P09','P12','P18','P21','P22','P26'],
 'Path-safety validation, authentic manifests, no privileged bridges/file URLs/remote fetch, CSP, and optional sanitizer defense are useful proposals. They do not fully specify the boundary when same-origin contributed scripts are allowed, particularly between content and trusted UI/preview/approval state. Loopback and edition paths are not distinct origins. Neither safe extractor nor per-file hashes specifies decompression/memory/file-count/image limits. Source correctness is conditional; this review demonstrates missing conditions, not an exploit in nonexistent product code.'),
 obligation('R06','Let editors remotely preview and approve new bundles','PARTIALLY_SATISFIED',
 ['final.md:12,16,18,24'],['P04','P09','P18','P21'],
 'Staging, sandboxed preview, approval, signing and release are a clear product flow absent from the thin plan. However, sandboxed is not specified enough to establish remote preview isolation from approval authority, and offline-key rotation/revocation remains an operational requirement without a client trust transition. Delegated targets is a useful scaling lead, not a tested implementation. No accounts, credentials, server or editor tool were created or tested.'),
]

def defect(ident, severity, kind, location, claim, sources, counterevidence, impact, obligations):
    return dict(id=ident,severity=severity,type=kind,exact_location=location,exact_claim=claim,
                primary_counterevidence=sources,counterevidence_assessment=counterevidence,
                impact=impact,affected_obligations=obligations)

DEFECTS=[
 defect('D01','high','missing governing durability condition',FINAL+':13',
 'fsync files **and the directory**; atomically replace the `current` symlink via symlink+rename',
 [{'source':'P16','range':'normalized lines 27-39','url':'https://man7.org/linux/man-pages/man2/fsync.2.html'},
  {'source':'P17','range':'normalized lines 37-50,190-193','url':'https://man7.org/linux/man-pages/man2/rename.2.html'}],
 'fsync must cover directory entries as well as file contents. Inference from these syscall guarantees: a flush before a later rename does not flush that new namespace change. The final gives no post-flip parent-directory flush or durable ordering for previous/current/high-water state, nor explicit same-filesystem constraint. This is a gap in the proposed crash protocol, not proof that a tested filesystem lost a pointer.',
 'The central power-loss/coherent-previous-edition promise is not fully supported by the written protocol. The proposed hardware test remains useful but cannot count as its result.', ['I05','R02']),
 defect('D02','high','incomplete trust-recovery correction',FINAL+':12',
 'offline museum signing key with key-escrow + scheduled rotation procedure recorded as an explicit operational requirement now',
 [{'source':'P04','range':'original lines 277-313,1312-1359,1368-1375','url':'https://raw.githubusercontent.com/theupdateframework/specification/master/tuf-spec.md'}],
 'TUF distinguishes an uncompromised trust anchor from compromised signing authority, requires authenticated old/new-root continuity and durable root updates, and recognizes out-of-band recovery when a root threshold is compromised. Escrow is a copy of key material; a rotation schedule is not a client mechanism to authenticate revocation/replacement after sole-key compromise. The final also persists a monotonic edition without a recovered-trust/fast-forward-reset policy. The categorical re-flash statement is too narrow: the source calls for out-of-band anchor recovery, not necessarily a full firmware re-flash.',
 'The critique identifies a real missing requirement, but adopting these words does not close compromise recovery. A compromised sole signer can still authorize hostile bundles or poison the edition high-water mark under the proposed subset.', ['I06','I07','R05','R06']),
 defect('D03','medium','offline freshness condition omitted',FINAL+':15',
 'signed manifest `expires` (anti-freeze), refusal below highest installed `edition` (anti-rollback), persisted `last_seen_edition`',
 [{'source':'P04','range':'original lines 1294-1300,1363-1366,1417-1424,1521-1528','url':'https://raw.githubusercontent.com/theupdateframework/specification/master/tuf-spec.md'}],
 'Expiry comparisons use a recorded update-start time and expired metadata aborts update acceptance. Inference for this offline/power-loss brief: an expiry field cannot detect indefinite freezing against an untrusted/reset clock, and update acceptance must be distinguished from continued serving of installed content. Neither the clock assumption nor the expired/offline serving and operator policy is stated.',
 'The anti-freeze label omits its governing assumption and leaves an important offline availability/security choice unresolved. This does not show that the candidate implemented an expiry-triggered outage.', ['I05','R01']),
 defect('D04','high','untrusted-renderer boundary overstatement',FINAL+':18',
 'same-origin scripting remains possible, so the audit boundary is the absence of privileged bindings',
 [{'source':'P21','range':'normalized lines 1931-1937','url':'https://url.spec.whatwg.org/#origin'},
  {'source':'P18','range':'normalized lines 1634-1640,2133-2159,2460-2487','url':'https://www.w3.org/TR/CSP3/'},
  {'source':'P09','range':'original lines 80-100','url':'https://raw.githubusercontent.com/cure53/DOMPurify/3.4.16/README.md'}],
 'HTTP origins are determined by scheme/host/port, not edition paths. Removing native bridges does not remove same-origin DOM/storage/HTTP authority. CSP restrictions depend on concrete directives and host permissions; sanitizer output depends on subsequent DOM handling and server DOM choice. The final names strict CSP and sandboxed preview but supplies no concrete script/origin/control-API boundary. Its listed cross-origin/bridge checks do not test malicious same-origin content against trusted navigation or remote approval state.',
 'Hostile content and preview remain conditionally confined. The missing boundary is material to the proposed security posture; no actual exploitable server or renderer was available or alleged.', ['I05','I06','R05','R06']),
 defect('D05','medium','required final critique preservation incomplete',FINAL+':3 and entire final.md:1-37',
 "preserving the draft's supported breadth and conditions",
 [{'source':'P05','range':'normalized lines 20-28','url':'https://uptane.org/'},
  {'source':'P06','range':'original lines 127-138','url':'https://chromium.googlesource.com/aosp/platform/system/update_engine/+/HEAD/README.md'},
  {'source':'P08','range':'normalized lines 52-70','url':'https://ostreedev.github.io/ostree/'},
  {'source':'P09','range':'original lines 80-100','url':'https://raw.githubusercontent.com/cure53/DOMPurify/3.4.16/README.md'}],
 'Internal comparison establishes the omission: critique lines 20-21 preserve Uptane philosophy-only and sanitizer uncertainties; lines 41-43 require source limitations and identify delta-sync/fleet-manifest optional leads; line 29 requests an exact U+1ED9 regression. These do not survive as such in the final. Primary sources confirm that compromise resilience, delta fallback, immutable-tree scope, and sanitizer runtime caveats are meaningful rather than disposable prose. The unseen draft was not read; only the supplied critique establishes these named carry-forward obligations.',
 'The declared complete final narrows discovery/uncertainty breadth and loses required critique content. Independently documenting those losses here does not repair or replace the candidate final.', ['I05','I06','I07']),
 defect('D06','medium','issue/fix/test/release research incomplete',FINAL+':17,37; '+CRITIQUE+':29-33',
 'even though the landing version was not pinned',
 [{'source':'P02','range':'normalized lines 504-513','url':'https://www.sqlite.org/fts5.html#unicode61_tokenizer'},
  {'source':'P15','range':'normalized lines 28,92-94','url':'https://sqlite.org/releaselog/3_27_0.html'},
  {'source':'P14','range':'original lines 49-60,90-108','url':'https://raw.githubusercontent.com/sqlite/sqlite/version-3.46.1/ext/fts5/test/fts5unicode3.test'},
  {'source':'P23','range':'original lines 1732-1743','url':'https://raw.githubusercontent.com/python/cpython/v3.14.4/Lib/test/test_zipfile/test_core.py'}],
 'The documentation explains a backward-compatibility-preserving option, and 3.27.0 explicitly records its addition. The relevant upstream folding/traversal tests can be inspected at the pinned tags, but the frozen candidate source maps inspected neither test nor a fixing change. Cezanne folds in both modes, as reviewer RCHK3 confirms, so that candidate probe is not the multi-diacritic regression. A future regression test and admitted uncertain landing release are honest but incomplete against the explicit integrated obligation. Reviewer release/test inspection is not awarded as candidate discovery.',
 'The history obligation lacks a completed pertinent fix/test/release chain or a justified equivalent implementation history. This preserves the original uncertainty rather than treating it as a discovered release pin.', ['I04','I06']),
 defect('D07','medium','hostile archive resource conditions unspecified',FINAL+':11-13,16,37',
 'extract into `editions/<edition-hash>/` with a vetted safe extractor; verify every file hash + manifest signature',
 [{'source':'P26','range':'normalized lines 647-657','url':'https://docs.python.org/3.14/library/zipfile.html#decompression-pitfalls'},
  {'source':'P04','range':'original lines 882-887,1321-1328','url':'https://raw.githubusercontent.com/theupdateframework/specification/master/tuf-spec.md'}],
 'ZIP path confinement does not bound decompressed bytes, file count, memory, disk usage, or decode work. CPython specifically identifies archive bombs and resource exhaustion; TUF uses size/download bounds as well as hashes/signatures. The final specifies no resource budget or failure/reserve-space policy for extraction and preview, and lists no oversized-import validation. Vetted safe extractor might eventually include these controls, but the proposal never declares them.',
 'A malformed import can deny service during preview or consume the storage needed to retain coherent editions. This is an unaddressed planning condition, not a demonstration of an implemented bomb vulnerability.', ['I05','R02','R05']),
]

CLAIMS=[
 ('C01','SRC-01 disclosure and archive traversal shape','SUPPORTED_WITH_CONDITION','P01,P12,P23','final.md:7; critique.md:14','Snyk documents the unsafe unvalidated extraction pattern. It does not say every ZIP API or all unzip-over-active tools escape; CPython explicitly strips components. In-place overwrite is independently unsafe for edition coherence.'),
 ('C02','CPython sanitization, not rejection','SUPPORTED','P12; RCHK1','final.md:7; critique.md:7','Tagged _extract_member and the clean-destination probe agree. Parent-symlink attacks, name collisions, and hostile-size limits were not covered by the reported probe.'),
 ('C03','FTS5 mode-1 U+1ED9 issue and mode-2 option','SUPPORTED_WITH_LIMIT','P02,P13,P14,P15; RCHK3','final.md:17; critique.md:29','The option is real and appropriate. Candidate Cezanne is not the distinguishing regression; reviewer checks do not improve the frozen candidate history grade.'),
 ('C04','Trigram support since SQLite 3.34.0; three-character limit','SUPPORTED','P02,P03,P13; RCHK2','final.md:17','Release log, tagged tokenizer loop, and reproduction agree. LIKE handles the shown short CJK sample by scanning.'),
 ('C05','Short-query prefix-expansion alternative','UNDERSPECIFIED','P02,P13; RCHK2','final.md:17','A separate expansion scheme might work, but ordinary trigram MATCH with a prefix still has no two-character token. No concrete expansion algorithm is provided; the supported LIKE fallback prevents this from invalidating the entire search proposal.'),
 ('C06','LIKE/GLOB acceleration is a free latency win','SUPPORTED_WITH_CONDITION','P02,P13','final.md:24','Index eligibility depends on tokenizer case/diacritic options and pattern shape; short patterns scan, and ESCAPE can disable LIKE index use. No measured latency win was produced.'),
 ('C07','ICU absent in pinned build justifies FTS5 over external engines','OVERGENERALIZED','P02,P13; RCHK4','final.md:24; critique.md:17,25','The evidence shows no registered FTS5 icu tokenizer, not a general ICU build audit or an external-engine comparison. FTS5 has no built-in ICU tokenizer; FTS3/4 ICU is a different facility.'),
 ('C08','TUF taxonomy, roles, hashes and signed canonical metadata','SUPPORTED_WITH_CONDITIONS','P04','final.md:7,11-15','Versions and specification date check. A reduced custom manifest is a product choice; it does not inherit full TUF compromise/freshness guarantees. See D02/D03.'),
 ('C09','A/B inactive updates, checkpoint resume, rollback; Virtual A/B history','SUPPORTED_AS_ANALOGY','P06,P07','final.md:13-14; critique.md:16,33','The primary descriptions support isolation and fallback. They are OS/partition analogies, not implementation proof for this content updater.'),
 ('C10','OSTree immutable content-addressed transaction model','SUPPORTED_AS_ANALOGY','P08','final.md:13; critique.md:16,41','Overview supports immutable trees and rollback. Exact deployment-pointer internals were not a frozen inspected source; custom rename details require syscall evidence and validation.'),
 ('C11','Uptane scope limited to compromise-resilience philosophy','SUPPORTED_BUT_NOT_PRESERVED_IN_FINAL','P05','critique.md:20,41','Homepage supports the bounded philosophy. No Director/Image mechanism implementation was inspected; final omits this boundary and lead.'),
 ('C12','DOMPurify version and server/post-mutation caveats','SUPPORTED_IN_CRITIQUE; FINAL_CONDITIONS_INCOMPLETE','P09','critique.md:21; final.md:18','Tag 3.4.16 exists and README supports caveats. Optional use is a product choice; the final omits the runtime/postprocessing conditions when preserving the critique.'),
 ('C13','WCAG 2.2 date, criteria, orientation, 24/44 sizes','SUPPORTED_WITH_SCOPE_LIMIT','P10','final.md:19,37; critique.md:18','Recommendation date and listed criteria check. Larger editorial buttons are a defensible choice. A/AA conformance scope is wider than the listed fixtures and sample criteria; future manual audit is appropriately proposed.'),
 ('C14','WebKitGTK 2.54.1/2.54.x release observation and pin deferral','SUPPORTED_AND_HONESTLY_BOUNDED','P11,P19,P22','final.md:20; critique.md:19','Directory and release page confirm the stable-series observation. No downloaded tarball/signature was verified; packaging pinning remains a future task, as the final says.'),
 ('C15','Loopback/CSP/bridge absence constitutes untrusted-content boundary','INCOMPLETE_GOVERNING_CONDITIONS','P18,P21,P22,P09','final.md:18,37','Concrete origin/script/control permissions and malicious same-origin tests are absent. See D04; no product exploit or passed confinement test is asserted.'),
 ('C16','Per-edition index keeps activation atomic','PLAUSIBLE_PROPOSAL; ORDERING_UNSPECIFIED','P06,P08,P16,P17','final.md:13,17','Index construction must complete before activation and be included in recovery/durability rules. At activation is not a specified transaction order; no activation implementation exists to inspect.'),
 ('C17','Page scanning necessarily fails multilingual search','NOT_ESTABLISHED','P02; RCHK2','final.md:7','The component probes do not implement or compare the thin plan scanner. A normalized bounded scan can handle some multilingual cases; the final itself uses LIKE for short CJK. FTS5 remains a useful choice without the universal rejection rationale.'),
 ('C18','Preview/approve/sign/release and scaling alternatives','USEFUL_PRODUCT_CHOICE; CONDITIONAL_SECURITY','P04,P09,P18,P21','final.md:16,24','Workflow answers the brief. The primary sources do not supply a complete remote editor implementation or permission model. Delegated targets is distribution scope; see R06/D04.'),
 ('C19','Key rotation requirement closes curator compromise','INCOMPLETE_CORRECTION','P04','final.md:12; critique.md:15','Requirement recognized, recovery mechanics absent; escrow alone cannot authenticate a new trust anchor. D02 distinguishes this from false claims of an executed recovery drill.'),
 ('C20','Executed retrieval/probes and proposed validation distinction','SUPPORTED_WITH_PROVENANCE_LIMITS','input-identities.json; reviewer-executed-checks.json','final.md:3,28-29,37; critique.md:7-10','HEAD 200 is URL reachability, not a source content/version identity. CHK structured observations and CF authored descriptions agree with present behavior. Historical execution authentication and all larger product checks remain outside verified evidence.'),
]

SOURCE_NOTES={
 'P01':'Original Snyk disclosure README; supports traversal pattern, not a blanket claim against CPython.',
 'P02':'FTS5 tokenizer/query documentation including short-query limits, prefix indices, and unavailable built-in ICU.',
 'P03':'3.34.0 release evidence for trigram addition.',
 'P04':'TUF 1.0.36 date/roles, clock-relative expiry, trust-continuity and recovery/size conditions.',
 'P05':'Uptane homepage only; philosophy claims bounded accordingly.',
 'P06':'update_engine README; base64 transport decoded as text, never executed; checkpoint and delta fallback analogy.',
 'P07':'AOSP A/B overview; fallback and Android-10 Virtual-A/B wording.',
 'P08':'OSTree overview; content-addressing/immutability/rollback, not inspected Deployments internals.',
 'P09':'Tagged DOMPurify README, 3.4.16; mutation and DOM-runtime conditions.',
 'P10':'WCAG 2.2 including relevant criteria and full A/AA/page/process conformance conditions.',
 'P11':'WebKitGTK directory listing; observation, not tarball/signature verification.',
 'P12':'CPython v3.14.4 zipfile _extract_member source inspection.',
 'P13':'SQLite version-3.46.1 tokenizer implementation, mode options, three-codepoint loop and pattern eligibility.',
 'P14':'SQLite upstream folding comparison tests, including mode 2; read, not executed.',
 'P15':'3.27.0 release explicitly adds mode 2; reviewer-only historical counterevidence, not candidate discovery credit.',
 'P16':'Linux fsync(2) manual; directory-entry persistence condition.',
 'P17':'Linux rename(2) manual; namespace atomicity and same-filesystem condition.',
 'P18':'CSP normative source; actual directives control permissions. No product policy was tested.',
 'P19':'WebKitGTK 2.54.1 release page, independently confirming stable bugfix series.',
 'P20':'SQLite fts5unicode4.test inspected; it is a short Japanese insertion/prefix smoke test, not the mode-2 regression; no such credit awarded.',
 'P21':'WHATWG URL origin definition; paths do not distinguish HTTP origins.',
 'P22':'WebKitGTK 2.54.1 settings reference; explicit JavaScript/file permissions exist. No setting was applied.',
 'P23':'CPython v3.14.4 upstream malicious-archive-name tests; read, not executed.',
 'P24':'SQLite fts5unicode2.test inspected; ordinary token/diacritic cases, supplementary context rather than a completed candidate fix history.',
 'P25':'Stock SQLite 3.46.1 release/source identity compared with preinstalled alt1 runtime; not assumed byte-identical.',
 'P26':'CPython archive-resource/decompression pitfalls; supports quota/space/failure planning gap.',
}

sources=[]
for path in sorted(SRC.glob('P[0-9][0-9].json')):
    item=json.loads(path.read_text())
    item['review_use']=SOURCE_NOTES[item['id']]
    item['checked_by_reviewer']=True
    sources.append(item)
(SRC/'index.json').write_text(json.dumps({'primary_sources_checked':sources,
    'collector_sha256':hashlib.sha256((SRC/'retrieve.py').read_bytes()).hexdigest(),
    'scope':'Independent retrievals at review time; frozen source maps are not rewritten. Bounded excerpts have line coordinates and hashes; full response hashes identify retrieval bytes without retaining full pages.'},indent=2)+'\n')

blinding={
 'prohibited_material_read':False,
 'not_read':['counterpart answer or source review','other grader/review/partial','parent/root/historical analyses','candidate costs/timing files','candidate native counters or lifecycle/route receipts','expected winner','unlisted research draft'],
 'visible_authored_method_clues':['Arm/stage labels and same-family critique/finalizer framing appear in allowed final/critique filenames and text.','Allowed final lines 3 and 33 expose GoalLoopDriver/native-Goal terminology, a session identifier, deadline/late-write statements, running-status observations and round information. These clues were visible without opening receipts and were excluded from all scientific scores.','Allowed final line 33 states candidate billing unknown. No candidate usage/cost/timing input was read or compared.'],
 'limits':['This is author-output and arm-labelled blinding, not perfect method blinding.','Source maps carry authored retrieval/check provenance; current independent checks corroborate behavior, not the identity of historical executions.','Current moving-source retrieval is not a byte-level reconstruction of earlier content. Tagged component files and response hashes bound what was inspected.'],
 'lifecycle_eligibility':'Excluded independent coordinator axis; frozen/quiet/terminal disposition taken as dispatch premise, not scientifically graded or re-audited.',
 'review_carrier':'Ordinary fresh T3 review task; no reviewer native Goal, handwritten Goal receipt, delegated critic or candidate followup.'
}

judgment={
 'schema_version':'independent-source-review-v2-diagnostic-1',
 'case_id':'I-ANCHOR-GLM','arm':'treatment','review_status':'FULL_DECLARED_SCOPE_ASSESSED_WITH_MATERIAL_DEFECTS',
 'scientific_full_positive':False,'failed_screen':False,
 'grade_scope':{'kind':'full declared source/science diagnostic assessment of the frozen authorized final, supplied critique, brief, thin plan and own-arm source evidence',
     'entire_declared_scope_assessed':True,'candidate_artifacts_modified':False,'candidate_discovery_credit_from_reviewer_new_work':False,
     'implementation_certification':False,'lifecycle_method_eligibility_included':False,'pairwise_winner_included':False,
     'explanation':'Every original integrated obligation and museum product requirement was assessed; none was skipped after finding defects. Full scope of assessment does not mean candidate full satisfaction. No prior grader input was read; these are independent grades, not amended historical grades.'},
 'grade_scale':{'0':'absent/unsupported','1':'weak','2':'partial with material gaps','3':'strong but qualified','4':'full supported declared satisfaction'},
 'source_correctness':{'score':2,'label':'PARTIAL_WITH_MATERIAL_CONDITION_GAPS','rationale':'Core primary claims and pinned runtime observations are largely correct. Consequential durability, freshness, trust-recovery and rendering conditions are not closed; ICU/scan rationales overgeneralize evidence. This grade measures correctness and warranted inference, not source count.'},
 'completeness':{'score':2,'label':'PARTIAL','rationale':'All thin-plan areas are addressed, but the fix/test/release-history requirement and required final preservation are incomplete, and important offline/untrusted/power-loss governing conditions remain unspecified.'},
 'planning_usefulness':{'score':3,'label':'STRONG_BUT_QUALIFIED','rationale':'Versioned staging, coherent rollback, signed manifests, tokenizer choices, remote editorial gates and useful proposed validation materially improve the thin plan. They are actionable research directions, but the final is not a complete safe operating design.'},
 'breadth':{'score':3,'label':'BROAD_SUPPORTED_YIELD_WITH_RETENTION_GAPS','rationale':'Useful discoveries span packaging, authenticity, updates/recovery, multilingual search, untrusted rendering, accessibility and reader maintenance. Three mechanism comparisons are materially developed; search-engine and editorial alternatives are thinner. Named optional leads and uncertainty boundaries are lost from the final.'},
 'bounded_discovery_yield':{'supported_source_based_disposition_areas':['archive path semantics and traversal tests','immutable versioned content trees','A/B checkpoint/fallback analogies','signed hashes/edition metadata','key rotation and optional thresholds as requirements','Latin diacritic mode-2 choice','trigram short-CJK boundary and LIKE fallback','conditional LIKE/GLOB acceleration','sanitizer/confinement caveats','WCAG criteria and orientation choice','reader release tracking'],
   'additional_product_choice':'remote staging/preview/approval/sign/release workflow',
   'material_mechanism_comparisons':['content trees versus partition slots','reduced signed metadata versus TUF roles','confinement plus sanitizer versus sanitizer-only'],
   'weaker_comparisons':['FTS5 versus unspecified external engines/ICU tokenizer','central editor flow versus delegated distribution targets'],
   'interpretation':'Area list is a bounded qualitative yield inventory, not a citation-count metric or complete independent implementation proof.'},
 'covered_obligations':[{'id':o['id'],'status':o['status']} for o in OBLIGATIONS],
 'per_obligation_evidence_assessment':OBLIGATIONS,
 'material_defects':DEFECTS,
 'consequential_claim_assessment':[dict(id=i,claim=c,status=s,primary_evidence=e,location=l,assessment=a) for i,c,s,e,l,a in CLAIMS],
 'unassessed_remainder':[],
 'verification_limits':['No museum hardware/filesystem power-cut harness, updater implementation, CSP policy, server, WebKit kiosk, remote preview, accessibility audit or language relevance/latency benchmark existed in authorized frozen evidence to execute. These were assessed as proposals and remain unvalidated, not omitted review obligations.',
   'Historical CF execution identity cannot be independently authenticated from authorized prose-only CF evidence; no excluded receipt was opened.',
   'No unseen research draft was read; critique-preservation findings are limited to explicitly named supplied critique content.',
   'No downloaded library, installer or host code was executed. Upstream implementation and test files were inspected as data only.'],
 'primary_sources_checked':sources,
 'blinding_limits':blinding,
 'preservation':{'previous_grades_supplied':False,'previous_grades':None,'previous_grade_replacement':False,
   'frozen_artifact_identity_record':'sources/input-identities.json',
   'authored_probe_failures_preserved':['CHK-2 invalid eez/sanne substring probes remain in original executed-checks.json alongside corrections. No check ID was rebound.'],
   'authored_completeness_claim':'The original complete/breadth-preservation claim remains unchanged in final.md; this review disputes it, without rewriting it.',
   'authored_lifecycle_failure':'Visible in authorized final; preserved in that unchanged artifact and excluded from scientific grade.'},
 'reviewer_execution_evidence':'sources/reviewer-executed-checks.json',
 'input_identity_evidence':'sources/input-identities.json',
 'written_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
}
(ROOT/'judgment.json').write_text(json.dumps(judgment,ensure_ascii=False,indent=2)+'\n')

lines=['# Independent declared-scope source/science diagnostic review',
 '', '**Result: full declared scope assessed, with material defects. No full scientific positive.** This is not a failed-screen early stop: every declared integrated obligation and every museum product requirement was assessed. The proposal is useful and broad, but conditional source reasoning, history coverage, and preservation prevent full satisfaction.',
 '', 'Source correctness: **2/4, partial**. Completeness: **2/4, partial**. Planning usefulness: **3/4, strong but qualified**. Breadth: **3/4, broad but qualified**. Scale: 0 absent, 1 weak, 2 partial with material gaps, 3 strong but qualified, 4 full supported satisfaction. These independent diagnostic grades do not include lifecycle eligibility, timing, cost, method qualification, or a pairwise winner.',
 '', 'The strongest parts are real primary selection, immutable staging/rollback analogies, signed metadata, Latin mode 2, the corrected short-CJK boundary, remote approval flow, and useful hardware/manual validation proposals. The principal defects are the missing post-flip durability condition, unresolved trust recovery and offline time policy, an incomplete hostile-rendering/import boundary, lost critique content, and incomplete issue/fix/test/release research.',
 '', '## Authority and scope',
 '', 'Read the exact INPUTS map, both brief and frozen thin plan, the authorized own-arm final and supplied critique, and all four supplied own-arm source-map/check files. Actual global `/home/sittingmongoose/.codex/AGENTS.md` and workspace `AGENTS.md` were read; applicable ancestor AGENTS paths were checked. The explicit restricted-input request governs over the repository default Plans-index read. No canon, main, WorkNodes, ledger, branch, account or provider changes were made. No delegation was used.',
 '', 'The unlisted draft was not read. Nor were counterpart output, other reviews, parent/root/historical analysis, candidate timing/cost files, native counters, or lifecycle receipts. The coordinator’s frozen/quiet/terminal premise was not re-audited. Source response identity, exact range coordinates and retrieval UTC are recorded per `sources/Pxx.json`; bounded extracts are in matching `.txt` files, with consolidated metadata in [sources/index.json](sources/index.json). Frozen input hashes are in [sources/input-identities.json](sources/input-identities.json).',
 '', '## Per-obligation assessment', '']
for o in OBLIGATIONS:
    lines += [f"### {o['id']} — {o['requirement']}",'',f"**{o['status']}**. {o['assessment']}",'',
      'Artifact locations: '+ '; '.join(o['artifact_locations'])+'. Primary evidence: '+', '.join(o['primary_evidence'])+'.','']
lines += ['## Material defects','', 'Exact locations refer to the frozen candidate files; source ranges refer to the collector’s stated original/normalized coordinate system. Missing conditions are distinguished from demonstrated implementation failures.','']
for d in DEFECTS:
    lines += [f"### {d['id']} — {d['type']} ({d['severity']})",'',
      f"Location: `{d['exact_location']}`. Authored claim: {d['exact_claim']}",'',d['counterevidence_assessment'],'',
      '**Impact:** '+d['impact'],'',
      'Primary counterevidence: '+ '; '.join(f"[{p['source']}]({p['url']}) ({p['range']}; local evidence `sources/{p['source']}.txt` and `.json`)" for p in d['primary_counterevidence'])+'.','']
lines += ['## Consequential source claims and governing conditions','']
for i,c,s,e,l,a in CLAIMS:
    lines += [f'**{i} — {c}: {s}.** {a} Location: {l}. Evidence: {e}.','']
lines += ['## Discovery yield and frozen-plan comparison','',
 'The eleven source-based disposition areas recorded in judgment.json span seven product areas: archive import, authenticity/trust, atomic update/recovery, multilingual search, hostile rendering, accessibility, and reader maintenance. The editorial release workflow is an additional useful product choice. This is a bounded breadth assessment, not a source-count score. Three materially developed comparisons deserve credit; the search-engine and editorial-alternative rows deserve less.',
 '', 'The six original plan choices were all compared: ZIP/manifest kept with verification; live overwrite rejected for staged immutable editions; web view retained with proposed confinement; text scanning replaced by FTS5 with a bounded scan fallback; manifest-only version trust replaced by signature/hash/version/freshness controls; central upload retained with preview/approve/sign/release. None was silently omitted. However, broad topical coverage does not establish every governing condition, and not every discovery in the supplied critique survives in the final.',
 '', '## Executed versus proposed evidence','',
 'Candidate CHK-1/CHK-2 have structured observations. CF-01/CF-02 are described in allowed critique/SOURCES prose; no separate authorized raw CF stdout is present. The original erroneous substring probes and their honest corrections were preserved. Historical execution authentication was not inferred from source file existence or HEAD 200.',
 '', 'Reviewer-only checks, in [sources/reviewer-executed-checks.json](sources/reviewer-executed-checks.json), used preinstalled CPython 3.14.4 and SQLite 3.46.1, an in-memory database, and a temporary ZIP strictly inside this review directory, then cleaned it up. They reproduced traversal stripping, CJK three-character match/two-character miss, anne/zanne substrings and Cezanne folding. They additionally distinguished U+1ED9 mode 1 versus mode 2 and confirmed short LIKE matching; ordinary two-character trigram prefix MATCH still missed. The local SQLite source ID differs from the stock upstream suffix (alt1), so no binary-equivalence claim is made. These checks corroborate the evidence and diagnose limits; they do not become new candidate discoveries or rescue its history requirement.',
 '', 'All product power-cut, signature/expiry/replay, renderer, accessibility, recovery and relevance/performance checks remain proposed. The validation set is useful; it is not a passed test suite. The reviewed proposal would benefit from explicit durability checkpoints, clock-reset/offline acceptance cases, recovered-trust/fast-forward state cases, same-origin hostile-content cases, oversized import failures, and all-page/all-A-AA auditing. These are diagnostic validation gaps, not a rewritten candidate final or a new candidate critic.',
 '', '## Primary source inspection record','',
 'Each record below has precise URL/ref/version, retrieval start/end, raw response SHA-256, retained excerpt SHA-256, and line ranges in the linked JSON. Tags were read as data. No downloaded package, library test, installer, or host code was executed. Current mutable pages are not claimed to reconstruct the earlier candidate retrieval byte for byte.','']
for item in sources:
    lines += [f"- **{item['id']}** — [{item['version_or_ref']}]({item['requested_url']}). {item['review_use']} [Identity/ranges]({item['id'] if False else 'sources/'+item['id']+'.json'}); [bounded evidence](sources/{item['id']}.txt)."]
lines += ['', '## Blinding limits, preservation and remainder','',
 'Method blinding is limited: allowed authored text exposes the treatment/critic-finalizer labels and GoalLoopDriver/native-Goal terminology, a session identity, deadline/late-write statements, running status and round observations. Those unavoidable authored clues were not used to grade science. The allowed final also says usage/billing is unknown; no candidate cost or timing input was consulted. Lifecycle eligibility remains an independent coordinator axis.',
 '', 'No previous reviewer grades were supplied or read; none is replaced. Candidate files and check IDs remain unchanged. The review preserves the original probe failures and the visible authored lifecycle-failure statement without using the latter as scientific counterevidence. All new source/check evidence is reviewer-owned and no scientific rescue, followup candidate or rewritten final was produced.',
 '', '**Unassessed declared remainder: none.** Limits remain in verification rather than review scope: no implemented kiosk/updater/server/hardware or performed full accessibility/security/performance suite was available in authorized evidence; historical CF execution identity is not independently authenticated; and unseen draft content is excluded. These facts restrict the warranted grades but are not hidden omitted obligations.',
 '', 'Machine-readable findings and grades: [judgment.json](judgment.json). Independent review timing and unknown usage/billing: [timings.json](timings.json).']
(ROOT/'REVIEW.md').write_text('\n'.join(lines)+'\n')

print(json.dumps({'review':str(ROOT/'REVIEW.md'),'judgment':str(ROOT/'judgment.json'),
 'obligations_assessed':len(OBLIGATIONS),'material_defects':len(DEFECTS),'claim_assessments':len(CLAIMS),
 'primary_sources_checked':len(sources)},indent=2))

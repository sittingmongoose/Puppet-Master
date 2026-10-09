# Ingest notes — A-M09-B control/critic (stage: critic)

Read_utc: 2026-10-09T18:49–18:53Z (deadline 2026-10-09T18:59:55.426080+00:00).
Scope: own assignment + exact input-map.json declared inputs only. No campaign/history/evaluator/counterpart read.

## Inputs read (path → what was taken from it)

1. `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M09-B/control/critic/assignment.md`
   → Task definition: challenge the research-stage draft against brief, revealed plan and governing primary evidence; produce `critique.md` (material vs minor findings) + `source-map.json`; no candidate repair outside assigned recipe; native-route (glm) lifecycle.
2. `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M09-B/control/critic/input-map.json`
   → Exact declared inputs: brief at `cases/S03/brief.md`; 4 predecessors under `jobs/A-M09-B/control/research/` (draft.md, discovery.md, source-map.json, revealed-plan.md); source root `research/sources`; allowed write root = this critic dir; deadlines (stage 18:59:55Z, arm 19:28:00Z).
3. `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S03/brief.md`
   → Product brief "lab-notebooks" (lightweight computational notebook review service, academic ecology group): mixed Python/R + data references; differing laptops; reproduction of a selected result without unrestricted access to uploaded notebooks; preserve authorship/annotations; offline export; predictable resources; investigate existing tools + environment/history evidence. Obligations O1–O6 (discovery, primary-source behavior, evolution chain, per-P dispositions with exact vocabulary, self-contained final, discriminating validations vs executed checks honestly separated).
4. `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M09-B/control/research/revealed-plan.md`
   → Exact thin plan P1–P6: git storage; Docker containers with **latest dependencies**; stdout+HTML as proof; **execution-time** data-URL resolution; green badge on **exit code zero**; collaborative annotations **later**. These are the four risk-loaded clauses ("latest", proof standard, timing, badge signal) the draft already disputes; verification targets for critique.
5. `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M09-B/control/research/discovery.md`
   → Pre-reveal frozen discovery. Tool set S01–S13: repo2docker, renv, jupyter-resource-usage, nbdime, JupyterLite, webR, papermill, nbval, KubeSpawner, ReviewNB, jupytext, repo2docker releases, noWorkflow. Key claimed mechanisms: display-vs-enforcement resource split (S03/S09); lockfile pinning + renv caveats (S02); structure-aware diffing (S04); WASM bracket with coverage/memory limits (S05/S06); nbval strict/lax verification (S08); MRAN retirement and builder-drift chain (S12). Honest gaps recorded: rOpenSci devguide 404, no BinderHub/gVisor/commercial-platform captures, noWorkflow fitness unestablished.
6. `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M09-B/control/research/draft.md`
   → Post-reveal plan comparison: per-P dispositions P1 already-covered+refinement, P2 correction (reject "latest"), P3 correction (artifacts not proof), P4 correction+embedded user decision, P5 rejected-as-specified+correction, P6 correction (sequencing); retained findings 1–6; alternatives A/B/C; user decisions 1–4; executed checks = none (honest); validations V1–V6. These dispositions and their cited evidence are the critique's primary objects.
7. `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M09-B/control/research/source-map.json`
   → Source registry: 13 sources (S01–S13), immutable IDs, silent_rebind=false; each with exact URL, version note, access timestamp (18:31–18:42Z), observed operations, locator, evidence path; 3 failed fetches (2× jupytext readthedocs, 1× rOpenSci devguide); usage/billing null except S10 public pricing.

## Evidence-set cross-check

`find research/sources -type f | wc -l` → **14** = 13 evidence files `S01-repo2docker.md` … `S13-noworkflow.md` (all present, each named in source-map.json's 13 `evidence` fields) + `sources/index.md` navigable index. Index matches; no orphan or missing evidence file at ingest time.

## Notes for the critique stage

- Every draft S-citation so far is traceable to a bounded evidence file; critique re-checks claims against those files, not against memory.
- Failed fetches constrain what "absence of evidence" claims are fair: rOpenSci must stay an uncited lead (draft §6 already does; verify consistency).
- S10 is the only source with observed usage/billing; any draft claim about cost must match that one line.

# Doctor application-update companion: held review residuals

Status: incomplete; candidate not integrated. This report records the remaining technical questions after two independent review cycles, rather than starting another automatic repair loop. It does not amend the accepted owner prose or count these cases as closed.

The v2 candidate repairs the four reproduced v1 joins and passes fifty focused tests. Independent review and root's rerun nevertheless reproduce two owner-backed blocker classes:

1. The installed-version record's `authority_generation` can differ from the generation of its own independently supplied installation-authority record while the read passes. The matching authority reference is checked, but its epoch is not. Installation, source and authority generations remain separate domains; this is not a requirement that all their numbers match.
2. Embedded installed-version, source-result, lifecycle and Server-protocol observations/completions can occur after the claimed read finishes while the read passes. These facts must causally exist by read completion. They need not occur after read start: historical admitted source success and installed facts remain legitimate under existing scope/currentness rules. No new freshness interval is authorized.

Two further probes remain questions, not automatic new constraints: the authentic selected lifecycle-operation anchor, and treatment of an authentic result arriving after the Doctor deadline at the controller/projection boundary. A source-check operation and install/restart operation must not be equated simply because fixture strings match. Late facts must not be erased or assigned a new outcome without the existing controller's rule.

The accepted RSC-014/N2-152 owner prose remains on the branch. Exactly two application-update source occurrences and one shared read are the intended companion scope; the other fifty occurrences remain unbound. Native owner resolvers, issuer authentication, permissions, custody and runtime execution are separate unproved obligations. This technical hold does not authorize changes to those policies or to command/event/storage ownership.

## Frozen evidence

Evidence directory: `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/doctor-app-update-typed-01/`.

| File | SHA-256 |
| --- | --- |
| `companion-v2.patch` | `3c78e5ec91715823d451187334fd490b5a400c93ef72bed51b76ccaed61d8d4e` |
| `REPORT-V2.md` | `e9112490e6b42e60822ba7f90965377e3f342a13183d579efba01f3790b71dc0` |
| `REVIEW-SOL-V2.md` | `3d74027159cc4d1810a3d27564c3a04a58f61d1cda11e14fd6d790e855620420` |
| `REVIEW-SOL-V2-PROBE.py` | `76f9decf17803f0ef03abe5d5cd3d1d37e515651db86c53b910a763c4a02f56a` |
| `REVIEW-SOL-V2-ADDENDUM.md` | `0c5375f6f9984f42f7f068443d749364cdef1f11d6f64da0a57b88f456d95128` |
| `ROOT-V2-CURRENTNESS-SCREEN-20260926.md` | `e401ba177bf272c7b1bf6ea4edcc20bcf5979f08e39f53db75c1bad9f9097150` |

Root reran the frozen probe: all seven mutations returned empty schema and join failure lists, confirming the accepts rather than treating a green test suite as sufficient. The independent review distinguishes the five mutations supporting the two blocker classes from the two unresolved controller/operation questions. No main landing, governance clearance or whole-packet completion follows.

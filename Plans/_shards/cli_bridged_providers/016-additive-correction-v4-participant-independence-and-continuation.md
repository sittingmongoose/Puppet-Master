# Shard 016: Additive Correction v4 — Participant Independence And Continuation Authority (2026-09-03)

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L1963-L1981

Source SHA256: `fd152e499c916023ef442a6aee30f924f7bcdf0d00b063a7bc567f86b6b081ff`

---

## Additive Correction v4 — Participant Independence And Continuation Authority (2026-09-03)

This section extends `PROVIDER-001..012` above with the correction's provider clauses
(`PART-003`, `PART-022`, `PART-024`, `GREPLAY-012`, `PSCHED-007`, `SMSG-011`).

- **One continuation authority.** Provider-native Goal, plan, or task-loop state stays
  noncanonical and can never drive continuation alongside the Puppet Master Goal loop. Where an
  adapter cannot suppress its native loop, it discloses that constrained state; two continuation
  authorities never run at once.
- **Independence is claimed only with evidence.** An adapter that cannot guarantee fresh
  sessions, real parallelism, or participant isolation discloses constrained execution **before**
  Start and again in the final artifact, showing requested versus effective control tier.
  Repeated same-model Review slots that an adapter cannot truly isolate are disclosed as
  constrained rather than certified as blind independent passes.
- **No substitution without disclosure.** A participant, a scheduled build, or a scheduled
  message never silently changes provider, account, or model. Absent an explicit stored fallback
  policy the work is `Held` or `Failed` with the requested and effective identity visible.
- **Adapter conformance stays a native obligation.** These clauses are contract text. Proving
  them requires a live direct, SDK, CLI, or server adapter; no concept fixture closes them.

# Known gaps — Grok 4.5 Assistant Chat (correction 2026-08-14)

Honest residual gaps after Dependency/Media/Work Correction. **No winner recommendation.**

| ID | Gap | Severity | Notes |
|----|-----|----------|-------|
| KG-CORR-001 | Settings deep-link is concept stub | low | Chat shows official-source Install/Setup copy and `settings://providers/...` continuation; Settings UI not implemented here (out of scope / Settings-owned). |
| KG-CORR-002 | Raw MOV timeline playback unavailable in agent tooling | info | All four videos byte-opened (ftyp); full contact sheets + keyframe sets reviewed per REFERENCE_MEDIA_INDEX.md. Recorded in `reference-review-report.json`. |
| KG-CORR-003 | Some harness events remain programmatic | low | Button coverage expanded (99 buttons incl. provider_install/update, prepare, peek, reset); not every system.* needs a dedicated drawer control. Reset restores known baseline via `rehydrateFromDemo`. |
| KG-CORR-004 | Compact work distinctness is presentation-forked | info | Shared semantic store intentional; t1–t8 compositions materially differ (packet forbids cloned chrome, not shared state). |
| KG-CORR-005 | Goal pause/resume/stop/replan catalog IDs | low | Demo-complete locally; catalog tokens remain GAP-020 / provisional in candidate-command-delta.json. |
| KG-CORR-006 | Provider/crew full managers | low | Chat ships route chrome + honest Settings-owned stubs only; managers remain Settings redesign / Plans ownership. |

Cross-ref: `SPEC_GAPS.md` GAP-020..022 + correction section. Supersedes older FINDINGS claims that disclaimed four-video causal continuity without media review.

Probe evidence: `%TEMP%\pm-grok45-probes\correction-2026-08-14` (live 20/20, ConceptHub pass, syntax 36/36) · matrix 64/64 · goal 8/8 · cache `?v=42`.

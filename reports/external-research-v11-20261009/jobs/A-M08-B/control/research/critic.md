# Critic pass — research draft

**Review mode:** separate read-through after draft creation. The assignment forbids nested agents, so this pass is a self-critique, not an independent reviewer. The revision is recorded separately in the resulting draft changes; discovery remains frozen.

## Findings

1. **The six clauses are disposed of one by one.** P1–P6 are each quoted and given a disposition. The draft distinguishes correction, optional features, retained intent and user/community decisions. P5 would be clearer if it explicitly marked the original/master versus access-copy separation as already covered by the plan and isolated the unsupported fixed WAV assumption.
2. **A source attribution needed correction.** The frozen discovery attributed development status to the pinned Mukurtu README. A direct read of that pinned README shows requirements and private-file setup but no development-status statement. The official v4 manual home says the manual itself is still in development. The draft now distinguishes manual status from code-release status and does not infer production maturity.
3. **OHMS runtime guidance is too old to use as a current compatibility promise.** The pinned Viewer README lists PHP 5.3+ and identifies Apache/Linux testing. That is historical documentation at the v3.10.16 source; deployment must verify a currently supported runtime and security posture. The draft currently mentions separate PHP deployment but should state this caveat.
4. **The hosted-portal version observation is properly cautious.** The software feature page says 1.4.1 while the public repository release list reports v2.11.0. Those numbers may label separate components or a stale page. The draft should preserve that uncertainty and ask which build is deployed.
5. **No implementation or product test ran.** The draft says so and labels the proposals unexecuted. Keep this distinction visible in the final status.
6. **The user’s core constraints remain present.** The draft retains 2,000 hour-long records, multilingual and volunteer work, source preservation, timed excerpts, segment restrictions, whole-record withdrawal, alternatives, cost unknowns, and later user decisions.
7. **Acceptance evidence is not broader than the sources.** Mukurtu protocol and media access is product documentation, not an end-to-end leak test. OHD access states do not demonstrate timed-segment restriction. OHMS cache blocking is configuration-dependent and covers XML HTTP access only. Whisper’s issue/fix/release sequence does not prove the current model is correct. These caveats are already present; keep them.

## Revision requests

- Add the historical-PHP-version caveat to OHMS conditions.
- Label P5’s preservation/access-copy separation as already covered, and retain the format correction.
- Preserve the correction to Mukurtu maturity attribution and leave the source discovery file untouched.
- Keep source and implementation uncertainty explicit; make no stronger product recommendation without the proposed validations.

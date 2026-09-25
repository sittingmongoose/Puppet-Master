# Product question: the record cap for application-wide platform capability checks, 2026-09-25

Status: **QUEUED_UNANSWERED**. Revised after the blind check of 2026-09-25 (`FIXES.md`). One card, presented to Jared in his card form. Nothing is answered or changed here. It asks only the part your 24 September answer on the operational record cap left open. It does not ask again when the platform capability catalog is filled, which you deferred to build time on the same day.

---

## Card: the record cap for application-wide platform capability checks

Card ID: `EA-S09-PLATFORM-CARDINALITY-001`. Owner: Storage retention, with the Platform Capability Manager. Family: `platform.capability_evaluated`.

**Name:** How the seven-year record cap counts platform capability checks that belong to no project.

**Question:** How should the seven-year record cap count platform capability checks that belong to the whole application rather than to a project?

**Why:**
- A platform capability check records whether a provider feature is available. It can run for the whole application or for one project's run.
- These checks use the seven-year operational retention rule, which caps records at 2,000,000 per project and refuses new ones past the cap. It counts only per project, so checks that belong to no project have nothing to be counted in. Storage calls this an unproved gap and says no invented project, new bucket or new number may fill it.
- On 24 September you answered the same question for three application-wide Storage events: count them in one application-wide bucket, with the same cap, the same refusal past the cap and the same seven years. That card named only those three, so the platform checks were left open for you.
- You also deferred filling the platform capability catalog to build time, because provider capabilities will change before then. Until then the catalog is empty and no platform check is recorded, so nothing is counted today. This question is about the counting rule, which does not depend on which capabilities end up in the catalog.

**What you get:**
- **Their own application-wide bucket:** the rule and numbers you approved for the Storage events, settled now, so the build-time work only has to fill the catalog. Platform checks can never use up the room kept for recovery records.
- **The same bucket as the Storage events:** one count for every application-wide record under the seven-year rule.
- **Decide at build time:** you decide together with the catalog.
- **No count cap:** the simplest rule for these checks.

**What it costs:**
- **Their own application-wide bucket:** one more count for Storage to keep. If more than 2,000,000 application-wide checks pile up within seven years, new checks are refused, exactly as for a project. This is very unlikely.
- **The same bucket as the Storage events:** a flood of platform checks could use up the shared cap, and then Boot recovery and the other recovery records would be refused.
- **Decide at build time:** the gap stays open, the family's retention stays incomplete, and the build-time catalog work has to carry this question as well.
- **No count cap:** no count guard on these records. The seven-year limit still applies.

**Options:**
1. **Count them in an application-wide bucket of their own, with the same numbers (recommended).** The same 2,000,000 cap, the same refusal past the cap and the same seven years as the Storage events, counted apart from them. Checks for a project keep their per-project count.
2. **Count them in the same application-wide bucket as the three Storage events.**
3. **Decide at build time,** when the catalog is filled.
4. **No count cap for application-wide checks.** The seven-year limit still applies.

**Recommendation:** Option 1. It closes the last open part of that gap with the rule and numbers you already approved, keeps platform checks from crowding out recovery records, changes nothing for projects, and leaves only the catalog itself for build time.

**Owner edits if approved:** options 1 and 2: the Storage retention owner extends the DL-083 application-wide bucket text in SP-291 (the aggregate custody text) to the application-scoped evaluations of this family, as a second application-wide bucket (option 1) or in the DL-083 bucket (option 2), with no new policy object and no `RP-OPERATIONAL-2555D` value changed; the Step 8 depth assessment's retention cell for this family can then leave PARTIAL. Option 3: the DL-082 build-time follow-up carries this question. Option 4: an amended policy row in the storage value registry and the family's registry row.

**Answer:** ____________________

---

This card admits, retires and changes nothing until it is answered and applied. Evidence: DL-082 and DL-083, the `platform.capability_evaluated` row of `reports/event-authority-20260911/step-08-depth42-assessment-20260924.json` (retention cell PARTIAL and its last remaining gap), and the Storage and registry lines listed in `cards-technical-companion-v2.md`, all read at `9986aeabe5`.

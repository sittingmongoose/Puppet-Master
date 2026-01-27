1. I want you to review what we have in this project already.  You can look at the whole code base and all the files in this project.  I want you to understand the point of the project and how the ralph wiggum model works.  I wrote down some critical points about how the ralph wiggum model works below.

Some potential helpful information files:
/mnt/user/Cursor/RWM Puppet Master/REQUIREMENTS.md
/mnt/user/Cursor/RWM Puppet Master/ROADMAP.md
/mnt/user/Cursor/RWM Puppet Master/AGENTS.md
/mnt/user/Cursor/RWM Puppet Master/ARCHITECTURE.md

I also want you to review this website as it has critical tips for making it work.  https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum

Here is an overview of how the Ralph Wiggum Model works and why it works well.

RALPH WIGGUM (RALPH LOOP) — IMPLEMENTATION SPEC
==============================================

Goal
----
Turn “AI coding” into an iterative engineering loop that runs until objective completion criteria are met, using files as the persistent source of truth. [page:1][page:2]

Non-negotiables (critical to make it work)
------------------------------------------
1) A written PRD with explicit acceptance criteria per task.
   - Completion must be verifiable (tests/build/lint/checklist), not “looks good”. [page:2]
2) A deterministic completion signal (promise marker) AND an iteration safety cap.
   - Example promise text: <promise>COMPLETE</promise> and --max-iterations N. [page:2]
3) Fresh-context runs.
   - Each iteration starts a new agent session to avoid context accumulation noise. [page:1]
4) Persisted state files.
   - The agent must read/write state to files so new sessions can continue without chat history. [page:1]
5) (Recommended) Separate “worker” and “reviewer” agents/models.
   - One agent does the coding, a different agent reviews and decides SHIP vs REVISE. [page:1]

Repo / state layout
-------------------
project-root/
  prd.md                         # Human-readable PRD (source of truth). [page:1]
  .ralph/
    guardrails.md                # Optional: “never do X / always do Y” constraints (team rules).
  .goose/ralph/                  # Example state dir used by one reference implementation. [page:1]
    task.md                      # The task input (can be a PRD path or pasted task). [page:1]
    iteration.txt                # Current iteration number. [page:1]
    work-summary.txt             # What worker did this iteration. [page:1]
    work-complete.txt            # Exists when worker claims “done”. [page:1]
    review-result.txt            # SHIP or REVISE. [page:1]
    review-feedback.txt          # Reviewer feedback for next iteration. [page:1]
    .ralph-complete              # Created on successful completion. [page:1]
    RALPH-BLOCKED.md             # Escape hatch when stuck. [page:1]

PRD format (use this to drive tasks + acceptance)
-------------------------------------------------
Use a PRD that is BOTH:
- A decomposition of work into small tasks, AND
- A list of acceptance criteria that can be checked. [page:2]

Recommended PRD sections (minimal but sufficient):
1) Overview
   - One paragraph: what is being built and why.
2) Scope / Non-goals
3) Assumptions & constraints (languages/frameworks, perf constraints, “no external SaaS”, etc.)
4) Acceptance criteria (global)
   - Examples (edit to fit your project): [page:2]
     - All required endpoints/features implemented.
     - Automated tests passing (optionally: coverage > 80%). [page:2]
     - No linter/typecheck errors. [page:2]
     - Docs/README updated. [page:2]
     - Output: <promise>COMPLETE</promise> only when ALL above are true. [page:2]
5) Task backlog (atomic items)
   - Each task MUST have:
     - Description (what outcome changes)
     - “Definition of done” (DoD)
     - Verification steps (how to prove it works)
     - Artifacts (files expected to change)
     - Priority ordering

PRD backlog item template (copy/paste)
--------------------------------------
Task: <short name>
Purpose:
  - <why this exists>
Requirements:
  - <req 1>
  - <req 2>
Acceptance criteria (objective):
  - [ ] <criterion 1 that can be tested or directly checked>  [page:2]
  - [ ] <criterion 2>
Verification steps (runbook):
  - Command(s): <tests/build/lint commands>
  - Expected output: <what “pass” looks like>
Notes / constraints:
  - <edge cases, non-goals, constraints>
Completion promise:
  - Print EXACTLY: <promise>COMPLETE</promise> when (and only when) all criteria are met. [page:2]

How tasks should be written (important nuances)
-----------------------------------------------
- Write tasks so the reviewer can say “SHIP” based on evidence (tests passing, behavior present), not narrative. [page:1][page:2]
- Prefer small, sequential phases over “build the whole product”; Ralph is “iteration > perfection”. [page:2]
- Make acceptance criteria fail-fast (e.g., “tests must pass”) so the loop self-corrects. [page:2]

Agent roles (new agents / fresh context)
----------------------------------------
Worker agent (does the coding) [page:1]
- Reads: PRD/task + iteration + review feedback + repo files. [page:1]
- Produces: code changes + runs verification + writes work-summary.txt. [page:1]
- If done: creates work-complete.txt (or prints completion promise if using promise-based runner). [page:1][page:2]

Reviewer agent (independent quality gate) [page:1]
- Reads: PRD/task + repo diff/files + work-summary.txt (+ may run tests). [page:1]
- Outputs:
  - SHIP -> write "SHIP" to review-result.txt (loop exits). [page:1]
  - REVISE -> write "REVISE" + concrete feedback (loop continues). [page:1]
- Strong recommendation: reviewer model != worker model for fresher perspective. [page:1]

Loop orchestration (pseudo)
--------------------------
for iteration in 1..MAX_ITERATIONS: [page:1][page:2]
  start NEW worker session with fresh context  [page:1]
  worker reads PRD/task + feedback files and makes incremental progress  [page:1]
  worker runs verification (tests/lint/build) and writes summary  [page:1][page:2]
  if worker claims done (promise or work-complete.txt):
    start NEW reviewer session with fresh context  [page:1]
    reviewer verifies against PRD acceptance criteria and repo reality  [page:1][page:2]
    if reviewer says SHIP: exit success  [page:1]
    else: write actionable feedback and continue  [page:1]

Completion signaling (pick one, be strict)
------------------------------------------
A) Promise-marker completion (common in chat-based loops):
   - The ONLY allowed completion output is an exact phrase like:
     <promise>COMPLETE</promise> [page:2]

B) File-based completion (common in CLI loop runners):
   - Worker creates: .goose/ralph/work-complete.txt when it believes work is done. [page:1]
   - Reviewer still decides final SHIP vs REVISE. [page:1]

Failure / escape hatches (prevent infinite money pits)
------------------------------------------------------
- Hard cap: --max-iterations N (10 is a common default in one implementation). [page:1][page:2]
- “Blocked” file: if the worker can’t proceed, write a RALPH-BLOCKED.md describing what’s blocking and what was tried. [page:1]
- Reset option: delete the state directory to restart clean when necessary. [page:1]

“Good PRD” checklist (use before starting the loop)
---------------------------------------------------
- Does every task have acceptance criteria that can be checked without guesswork? [page:2]
- Can the reviewer run commands to verify each item (tests/lint/build)? [page:2]
- Is there a single global “definition of done” + per-task DoD? [page:2]
- Is the completion promise unambiguous and exact-match? [page:2]
- Is MAX_ITERATIONS set to prevent runaway loops? [page:1][page:2]
- Are worker/reviewer separated (recommended) for SHIP/REVISE gating? [page:1]



2. I now want you to compare this project to other similar projects and see what they are doing.  Compare their features, their implimentation, everything.  Espcially around PRDs and creating tasks.
Here is a list of the projects.  You can find them in /mnt/user/Cursor/RWM Puppet Master/RalphInfo

1. Ralph, this is the original.  https://github.com/snarktank/ralph  Assume this one works the best.  The files are in /mnt/user/Cursor/RWM Puppet Master/RalphInfo/ralph-main/ralph-main
2. Ralphy, https://github.com/michaelshimeles/ralphy The files are in /mnt/user/Cursor/RWM Puppet Master/RalphInfo/ralphy-main
3. Ralph-Claude-Code, https://github.com/frankbria/ralph-claude-code The files are in /mnt/user/Cursor/RWM Puppet Master/RalphInfo/ralph-claude-code-main
4. Kustomark-ralph-plugin, https://github.com/dexhorthy/kustomark-ralph-plugin The files are in /mnt/user/Cursor/RWM Puppet Master/RalphInfo/kustomark-ralph-plugin-main
5. Ralph-Playbook, https://github.com/ClaytonFarr/ralph-playbook The files are in /mnt/user/Cursor/RWM Puppet Master/RalphInfo/ralph-playbook-main
6. Ralph-Wiggum-Cursor, https://github.com/agrimsingh/ralph-wiggum-cursor The files are in /mnt/user/Cursor/RWM Puppet Master/RalphInfo/ralph-wiggum-cursor-main
7. Multi-Agent-Ralph-loop, https://github.com/alfredolopez80/multi-agent-ralph-loop The files are in /mnt/user/Cursor/RWM Puppet Master/RalphInfo/multi-agent-ralph-loop-main
8. Codex-Weave-Weave, https://github.com/rosem/codex-weave/tree/weave The files are in /mnt/user/Cursor/RWM Puppet Master/RalphInfo/codex-weave-weave
9. Zeroshot, https://github.com/covibes/zeroshot The files are in /mnt/user/Cursor/RWM Puppet Master/RalphInfo/zeroshot-main
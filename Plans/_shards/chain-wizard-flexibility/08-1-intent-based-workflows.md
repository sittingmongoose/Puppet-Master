## 1. Intent-Based Workflows

The wizard and Interview must support **four distinct intents**. Each intent changes what we ask for, how deep the Interview goes, and how we frame PRD/plan (full product vs. delta vs. feature scope).

### 1.1 New Project (greenfield)

- **User goal:** Start a new product or codebase from scratch.
- **Entry:** User selects "New project" (or equivalent). Project path may be empty or a new directory we will initialize.
- **Requirements:** User provides one or more requirements documents (upload and/or Requirements Doc Builder). No "existing codebase" context beyond optional reference docs.
- **Interview:** Full product interview (all phases available); AI may still shorten or deepen phases based on scope signals.
- **Outcome:** New repo (we may create it on GitHub), full PRD and plan, then execution.

### 1.2 Fork & Evolve

- **User goal:** Fork an existing repo and evolve it (add features, change direction, maintain a derivative). Not "start new" and not "continue the same project"--it's a **derivative**.
- **Entry:** User selects "Fork & evolve." We need **upstream repo** (URL or `owner/repo`). We **offer to create the fork** for the user (via GitHub HTTPS API; see `Plans/GitHub_API_Auth_and_Flows.md`), or the user can create the fork themselves and point us at the fork path or URL.
- **Requirements:** User provides requirements that describe **what to add or change** in the fork (delta). Can be upload(s) and/or Requirements Doc Builder framed as "what are we changing/adding?"
- **Interview:** Interview is framed as **delta/evolution**: "What are you adding or changing in this fork?" Phase set can be reduced (e.g. skip or shorten Deployment if no infra change) or deepened (e.g. Architecture if major refactor). AI decides.
- **Outcome:** Fork (created by us or user), PRD/plan as **delta** over upstream, then execution on the fork.

### 1.3 Enhance / Rewrite / Add (existing project, new to Puppet Master)

- **User goal:** The project already exists; Puppet Master has never seen it. User wants to **enhance** it, **rewrite** parts, or **add** to it.
- **Entry:** User selects "Enhance/rewrite/add" and supplies **project path** (existing clone or directory). No fork required unless they later choose to contribute upstream.
- **Requirements:** User provides requirements describing the **scope of change** (what to enhance, rewrite, or add). Can be upload(s) and/or Requirements Doc Builder.
- **Interview:** Same delta framing as Fork & evolve: "What are we changing/adding?" Interview phases adapt (e.g. double down on Architecture for rewrite, skip Deployment if unchanged). Existing codebase is scanned (current codebase_scanner) to seed context.
- **Outcome:** PRD/plan as delta; execution in the existing project directory.

### 1.4 Contribute (PR)

- **User goal:** Add a feature (or fix) to someone else's project and open a **Pull Request**. First-time PR contributors may not know the steps; we guide them.
- **Entry:** User selects "Contribute (PR)." We need **upstream repo** (URL or `owner/repo`). We **offer to create the fork** for the user, or they can create it themselves and point us at their fork.
- **Requirements:** Lightweight: feature/fix scope and acceptance criteria. Can be a short doc upload or a quick Requirements Doc Builder session ("I want to add X; acceptance: Y").
- **Interview:** **Lighter** than full product or delta: focus on feature scope, acceptance criteria, and compatibility with upstream (e.g. style, tests). Many phases skipped or collapsed; AI decides.
- **Outcome:** Fork (if we created it or user did), **feature branch** created by us or user, work done on that branch, then we **offer to commit, push, and open the PR** (or user does it themselves). Optional in-app or linked help: "What's a PR?" (fork → branch → push → open PR).

### 1.5 Summary Table

| Intent              | Upstream/fork?     | Requirements framing     | Interview depth   | Outcome              |
|---------------------|--------------------|--------------------------|-------------------|----------------------|
| New project         | N/A (or create)   | Full product             | Full (adaptive)   | New repo, full PRD   |
| Fork & evolve       | Fork (offer/create)| Delta (add/change)       | Delta (adaptive)  | Fork, delta PRD      |
| Enhance/rewrite/add | N/A (existing dir)| Delta (scope of change)  | Delta (adaptive)  | Same dir, delta PRD  |
| Contribute (PR)     | Fork (offer/create)| Feature/fix scope       | Light (adaptive)  | Fork, branch, PR     |

---


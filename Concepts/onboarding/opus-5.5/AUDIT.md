# Onboarding logic audit — working notes (next milestone, after M2 lands)

Jared, 2026-09-24: the onboarding gets at least the tour's depth, plus a logic audit —
does the flow actually work; is each thing in the right order; are items shown based on prior selections;
are options available based on selections. "The logic is extremely important. The details matter a lot."

## Method
1. Transition map: every screen (43), its entry conditions, what it shows conditionally, every outgoing action.
2. Explorer: automated BFS over real clicks (fresh page per path prefix), state = screen + relevant draft fields;
   finds dead ends, unreachable screens, controls that do nothing, Back/resume breakage.
3. Rule table: each rule -> where enforced -> verified by (scenario / explorer / schema conditional).
4. Ordering review with rationale (packet > canon; research), change where wrong.
5. Copy/details per screen given prior choices (names, places, services, plural/singular, labels "on Home NAS").
6. Visual/motion/sound pass per screen x 8 themes x (1600, short) with harness invariants (raw copy keys,
   clipping/overflow, overlaps, disabled reasons), films of every transition. Jared, 2026-09-25: no phone widths and
   no accessibility-only work ("This will not be phone accessible").

## Candidate issues found while mapping (verify before changing)
- C1 `begin` -> later jumps straight to review. On a new-Server path this skips "Use it away from home?"
  (remote_access_setup) although the Server is being set up now and O55.stages.DEFERRED keeps
  remote_access_setup (and source_control_setup, server_storage_client). Check PWIZ-021's deferred graph.
- C2 `safe` -> next goes to `away` only for server_mode === 'new_server'. Check existing_server (connect ->
  create new Project, "Home NAS is back" -> create) and whether remote access is already settled there.
- C3 review `edit(target)` return paths: every target returns to review with the change reflected?
- C4 `ai-none` next: back() unless Free Models chosen - is the finished state right after Skip?
- C5 the where-screen's "This computer" sets remote_mode none; does choosing a Server later reset it?

## Canon/packet facts for the audit
- PWIZ-021: explicit Project deferral skips ONLY provider_setup and free_models_setup (not source control, storage,
  remote access). => C1 confirmed as a real gap on Server paths (later on new_server must still offer away).
- Packet 01 rules to test per path:
  - fresh local user never sees remote pairing, proxy, source-host, settings-copy or multi-account PAGES;
  - six concepts stay distinct (source files, history, online host, sync, backup, remote access), not all asked of all;
  - "Keep your work safe" rows must follow the chosen begin path: existing online project already HAS an online copy
    (show it, don't offer to create one); an existing folder with history keeps its engine (show, don't ask);
    restore paths bring history/backup from the snapshot;
  - Back may revise every earlier choice until Create; after commit, returning is an explicit edit, never "uncreate";
  - returning user sees detected Projects and accounts immediately;
  - Review answers: name, files location, work computer, fresh vs inherited, source/history/online/sync/backup, effects.
- Remote access optional unless the selected route requires it.

## More candidates from reading 66/69 (verify by running)
- C6 where -> This computer sets server/storage/remote modes but leaves server_ref, storage_location, remote_* and
  S.sess.server from an abandoned Server path; the committed draft may carry stale fields. Same for Server after
  This computer (remote mode), and begin sub-choices after switching.
- C7 begin -> existing -> "A folder on this computer" on a Server path: the plan says every step runs on the work
  computer and labels name it ("a folder on Home NAS"); ex-folder browses S.env.here.recentFolders (this device).
- C8 name on a Server path shows the three "where its files live" cards even for existing_local (a folder already
  has a place) - should show the kept line instead; for existing_online the cards mean "where the copy goes" (ok,
  but the wording must say copy).
- C9 begin: "Restore a Project" on a Server path - restore onto the Server? check r-source labels/targets.
- C10 name for existing_online: the name defaults to the online name (plan) - check it is prefilled and the
  location line says "Where to keep the copy".

## From reading 71 (safe / online / away)
- C12 safe "Online copy" row for existing_local whose folder check found an online copy (folderInfo.online):
  shows "Not now · Add" - it should show the copy it already has (service · repo) and not offer a second one.
- C13 restore paths reach safe with Backup "Later": a restored Project came from a backup - offer that destination?
- C14 safe shows the sync note on every Server path; plan: only when the user has more than one PM device - check
  copy and condition.
- C15 ex-repos "copy to" line uses this computer's Documents path even on Server paths ("on Home NAS").
- ok: existing_online online row shows the existing repo (no add); privacy options per service; owner only if orgs;
  name defaults to the online name.

## From reading 72 (review / creating)
- C16 review for project later shows only the Computer group; on a new Server with later, the Access row (and the
  away step, C1) is missing although the Server is being set up.
- C12b review for an existing folder that already has an online copy says "Not set up now: online copy" because the
  draft never records the folder's existing online copy (check the schema: which fields/conditionals allow an
  existing online copy on existing_local?).
- C18 history row wording for existing history ("keeps its Git history" vs "every version saved").
- ok: button label per mode; begins/files rows per mode; like row when eligible; Edit returns to Review via FLOW
  order; creating phases per mode (no history phase when the folder has one; install when Git missing; online only
  when new; settings only when copying; remote only for new Server beyond local/VPN).
- C19 nas-find manual address that matches no device: Continue disabled with the generic 'missing.storage' reason; should say nothing answered at that address (and offer Check again).

## From reading 67 (connect)
- C20 c-ready always offers Take the Guided Tour; a Server with no Projects gives the tour no Project to end on
  (the tour's rule: it ends on a real Project). Then Create a new Project should lead, and the tour wait.
- C24 c-route: a server resolved through a web address or Remote Link stays chosen after switching back to
  "On this network" although it was never picked from the list (check what Review then says).
- ok: discovery is read-only and cached per scope; VPN is opt-in; pairing only after Connect on the review; a wrong
  code shows one fix; Create a new Project starts the second draft on the same Server with the connect route copied.

## From reading 68 (server)
- C25 s-kind offers "Setting up a replacement? Bring back an old Server" before any Server is chosen or claimed;
  check what the restore then targets (a replacement needs the new Server first, or the restore must claim it).
- C26 the Server name defaults to "Home NAS" with suggestions Home NAS / Home server / Studio whatever the kind: a
  rented cloud computer or another PC should not be called Home NAS.
- C27 s-wait for "A cloud computer" scans the local network and offers the NAS found there; a cloud computer is
  never on the local network: it should lead with its address (or the setup link it prints) instead.
- ok: nothing is claimed until Set up Server; the setup code comes from the Server's own page; a wrong code keeps
  the draft; the pairing card has QR, code, link, expiry, New code, Copy link.

## Decisions taken while reading (to implement after the crawl)
- C1/C16: canon (PWIZ-021) skips only the provider phases for a deferred Project, so "Set up a Project later" on a
  new Server still asks "Use it away from home?", Review shows the Access group, and the remote-access phases run
  in Creating without a Project (folder, history, online copy and settings phases do not).
- C12: an existing folder's online copy is shown as it is ("GitHub · jared-p/recipe-app, already linked") on Keep
  your work safe and in Review, and no second copy is offered; the draft keeps online_mode none (nothing new is
  created), because recording it as existing would require a sign-in the person has not asked for.
- Order: welcome -> look -> where -> (connect | server preflow) -> begin -> [folder | online | device] -> name ->
  like? -> safe -> away? -> review -> creating -> protect? -> ai -> free? -> ready matches packet 01's fixed
  dependency order (1 Welcome, 2 where, 3 how it begins, 4 draft, 5 start like, 6 source/history/sync/backup/remote,
  7 review, 8 commit, 9 AI, 10 Free Models, 11 finish) and F3-520 (look at welcome, before infrastructure).

## Resolutions (source changed; verified after the crawl)
- C1/C16 fixed: later on a new Server -> away -> Review with the Access group -> Creating runs only the access and
  check phases (no Project record, folder, history, copy or settings) -> Ready ("Home NAS is ready").
- C6 fixed: choosing This computer clears the Server reference, trust and access-route fields an abandoned Server
  path set.
- C7 fixed: on a Server path the folder choice is "A folder on Home NAS" and browses the Server's own folders.
- C8 fixed: an existing folder keeps its place on the name screen, also on a Server ("Stays in … on Home NAS").
- C12 fixed: a folder's existing online copy shows as "already linked" on Keep your work safe and in Review; no
  second copy offered; nothing listed as not set up. C18 fixed: "Keeps its Git history".
- C15 fixed: the online Project's copy line names the Server on Server paths.
- C19 fixed: an address nothing answers says so; no device chosen says "Choose a device".
- C20 fixed: a Server with no Projects shows "No Projects on … yet" and leads with Create a new Project, no tour.
- C25 fixed: the first Server screen no longer offers restoring before any Server exists; it says the old one's
  data can come back once this one is set up (the link stays on the Server-ready page).
- C26 fixed: names follow the kind (Home NAS / Cloud server / Studio PC and their suggestions).
- C27 fixed: a cloud computer is reached by its address (no home-network scan); a separate cloud fixture.
- C14 not an issue: on a Server path the sync line states a fact (every device on that Server sees the Project).
  C14b left as a gap: the setup plan has no Project sync field (63 properties, only client_mode), so the onboarding
  cannot record a sync choice without inventing canon; REPORT lists it.

## Second pass (2026-09-25): the crawl, Jared's reports, resolutions
Crawl of the fixed build (fresh world): 873 states, 5,667 clicks, 34 of 43 screens reached; 0 dead ends, 0 controls
without a reason, 0 raw copy keys, 0 page errors. The rule table (R1-R13, tools/audit_rules.py) holds on every state;
R1, R2 and R6 hold vacuously there, because away, like and protect sit behind deep chains the crawl did not reach
(scenarios cover them: a1, v1, s02, b1, b2). The crawl's 11 "no-op" controls were official pages that open outside the
window (7), a repeated wrong recovery phrase (1) and an already-selected SSH method (1); its one text spill was real.

Found and fixed (each with the scenario that now guards it):
- C29 NAS "I'll add the key myself": the check added the key itself, so it always passed; a new key's line was shown
  before the key existed; every key showed the same line. Now the chosen key's public half, a new key made first, and
  a real check that says "isn't on Home NAS yet" (n8, n9).
- C30 After a reload a password or recovery phrase "typed" earlier still enabled the button over an empty field, and
  the NAS key could be added with no password at all. Protected fields count only what is typed after the screen is
  drawn; adding a key needs the password (n10).
- C31 A failed submit that leaves the screen unchanged (the same wrong phrase, an empty passphrase, a wrong kit word)
  gave no visible answer. The field now shakes (a flash under Reduced Motion).
- C32 Official pages: the notice said "sign-in page" for install guides and sign-up pages; addresses were made from
  names (azure_devops.com, huggingface.com, googleaistudio.com); "Browser didn't open?" gave a made-up device address
  for services without a device sign-in. One table of known addresses, the typed address for self-managed services,
  and a copied sign-in link where there is no device code.
- C33 One unbreakable line (a public key) or the footer's buttons widened the content column past the window: the
  key's Copy button was off-screen at every width. Both grids clamp their column; code lines wrap (state_shots).
- C34 (Jared) Run Onboarding Again did not reset the tour: a tour left part-way resumed at Choose Teacher on the next
  run's Take the Guided Tour. A rerun now ends a running tour and clears its record and chip; a tour taken at the end
  of onboarding always starts at its first step (t7, x1).
- C35 A replay counted the last run's question as sent: the chat's sent list was never cleared (t7).
- C36 A rerun kept the fixture world and the operation registry: finished checks completed instantly on the rerun,
  and one still running could report into the new run. A rerun now builds a clean world, cancels the old run's
  operations at their next phase and drops their late reports; a Project being created is waited for, never
  abandoned half-made (x1, x2).
- C37 Closing during Creating and reopening in the same page left the window on Creating forever: the creation
  finished into a stale copy of the session. Reopening the same run keeps the live session (x2).
- C38 (Jared) Back in the tour could not show Show Me again: Back left the step done and the app as the learner had
  left it. Back now rewinds to how the app looked when that step began (Chat's place, the dashboard, the page, the
  guided conversation, persona and ELI5, the practice plan), and that step and every later one are undone; a Back
  pressed while a step is arriving waits for it (t6).
- C39 Backups: every destination was a browser sign-in (Home NAS opened a web page; S3/B2 and SFTP/WebDAV need access
  details), and Home NAS was offered even when the Project's files live on it. Home NAS now connects over SSH (the
  same key steps, then back), S3/B2 and SFTP/WebDAV take access details with the secret never stored, Home NAS is not
  offered when the files are on it (with the reason), and Review drops such a choice with a note. An S3 restore source
  takes access details too (b1-b4).
- C40 No scenario covered Finish protecting your work; b1 and b2 walk it end to end.
- C41 A key given twice in one screen definition silently replaced the first (the protect screen's field handlers);
  build.py --check now fails on a duplicate key.

Still open:
- C24 a Connect route switch keeps a Server resolved through a web address or Remote Link.
- Crawl the other worlds (returning, keyWorks, homeNasPm) so away, like and protect are reached by the crawler too.
- "Keep this layout" keeps the Guided example thread in Chat; the plan removes the practice surface at the end, so the
  practice conversation should probably leave with the tour either way (a decision for Jared).


# R016 current assessment

**Verdict: quality failure. Complete review coverage: true.**

Fully graded with substantial useful supported implementation novelty, but material identity/collection coverage omissions remain, universal no-Azure-rollup claim is unsupported and browser-app desktop classification contradicts its primary README. Unsupported native capture/provenance is separately unresolved, never converted into false candidate facts.

Current-report-only review. Independent public primary verification is explicit, evaluator-only, and does not establish native candidate acquisition.

## Material claims

- **R016-C001 — unresolved** (report L3-L6): Research date/currentness; independently selected sources, public fetch log completeness and plan-blindness
  Carrier is complete; native acquisition sequence and no-private-input claim await stage2. Current source facts are independently verifiable without native capture proof. Evidence: No admitted stage1 evidence for native provenance.

- **R016-C002 — supported** (report L4-L17): Read-only selected context plus CQ1-CQ6 identity/version/check/honesty/auth/simplicity questions
  Faithful component decomposition; per-user role lists are optional potential surfaces rather than brief mandates. Evidence: brief L3 sha256 b6190d58238b5a0471d1870d0de60b300a6c481c8d1719a7f229cdd840278607

- **R016-C003 — supported** (report L24-L27): 7.1 Learn moniker/commit cb0d0b30ca71a83e03cc7a7bbd9361e1a432b377/update 2025-03-18; Git7.1 and policy7.1-preview.1
  Version strings and document source identity match the current independently frozen originals. Evidence: iterations_list L1-32,L59-82 sha256 28d00fc54547afac615e4658cc8845efc2aba3b6efded7090db3dcf95014f5b1; iteration_changes L1-32,L59-83 sha256 7bd3fcd0e67783f75d9bbc4557136b89e36148e992b8a61d08c914cf8e420745; A003 L27-35 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce

- **R016-C004 — qualified** (report L25-L29): Hosted docs4.1-to7.2 and Server5.0-to7.1 version lists; do not assume Server7.2; unprobed
  Menus list supported documentation editions. They justify compatibility caution, not proof Server2022 accepts every7.1 API or rejects7.2. Evidence: iterations_list L389-402 sha256 28d00fc54547afac615e4658cc8845efc2aba3b6efded7090db3dcf95014f5b1; iteration_changes L280-293 sha256 7bd3fcd0e67783f75d9bbc4557136b89e36148e992b8a61d08c914cf8e420745

- **R016-C005 — qualified** (report L28-L28): Pin7.1 matching implementation; one global version string will break policy call
  Git7.1 choice and different documented policy requirement supported. QVL already overrides connectionData to7.1-preview; actual break is not live-tested and should be a documented compatibility risk, not execution evidence. Evidence: qvl_adapter L7,L187-194,L246-247 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4; A003 L27-56 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce

- **R016-C006 — supported** (report L31-L32): connectionData with7.1-preview yields authenticatedUser.id; creator/reviewer active PR filters
  These are concrete inspected implementation/read-path facts; architecture calls user ID a GUID, code types it as a string. Evidence: qvl_adapter L80-82,L246-251,L370-374,L393-418 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4; azure_viewer_architecture L8-16 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C007 — supported** (report L32-L34): Required-reviewer split and approval tally already available from same list response
  Maintainer architecture documents this request-saving computation; the official field caveat is explicit. Not a live-run observation. Evidence: azure_viewer_architecture L10-16 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897; azure_viewer_readme L7-14 sha256 5f7b31c0c417dcd7872808911cdd38c906fec6b2581f57456bb2f9f572a90d6f

- **R016-C008 — qualified** (report L33-L34): Selected context plus your/requiring-you views maps to role queries with no extra required-reviewer call
  Useful optional product choice; the brief does not require user-role aggregation across projects/repos. Scope filtering to explicitly selected repository still needs design. Evidence: azure_viewer_architecture L10-16 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897; brief L3 sha256 b6190d58238b5a0471d1870d0de60b300a6c481c8d1719a7f229cdd840278607

- **R016-C009 — supported** (report L38-L39): Iteration repositoryId ID-or-name/project ID-or-name versus statuses target-repository-ID wording
  Exact wording differs; report appropriately disclaims a proven runtime rejection of repository names. Evidence: A001 L50-63 sha256 32fcc785fe70012836f3db8aaaea0a907ade445304b7f17b1f949522139b85ef; pr_statuses L70-76 sha256 3699494b0b0fab58565709b91e66910d4f477e99943ef25ba53df275c37e7a38; iterations_get L70-77 sha256 6583421f74e813f4740cefce53b56d072f0be78e8a82e24ed59d5003f6e5a80f

- **R016-C010 — qualified** (report L40-L43): CodeReview artifact projectId is project GUID, not display name; resolve once from payload
  A003 alone does not type projectId as GUID. Evaluator-only GetPR verification (report-cited as proposed U6, not candidate acquisition) types repository.project as TeamProjectReference and its id as uuid, supporting the intended ID-versus-name interpretation. Hard rejection of names in artifactId is not a live-probed contract; do not mistake the path project parameter for artifact identity. Evidence: A003 L29-61 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce; qvl_adapter L52-60,L270-273 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4; get_pr L304-318,L575-592 sha256 410c2fcae80e0876bf8f8831efc75a7231ad463d84acd4751b71e09947cb0095

- **R016-C011 — qualified** (report L41-L43): QVL buildWebUrl reads repository.project.name and repository.id; resolving data already in payload
  buildWebUrl actually uses repository.name, while thread route uses repository.id. Fields exist in model/docs, but project reference is optional in adapter and presence is not guaranteed. The locator overstates ID use at that function. Evidence: qvl_adapter L52-60,L270-273,L310-315 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4; get_pr L304-318,L575-592 sha256 410c2fcae80e0876bf8f8831efc75a7231ad463d84acd4751b71e09947cb0095

- **R016-C012 — supported** (report L46-L46): Iteration1 source head at creation, subsequent pushes; compareTo0 common commit; top100/max2000, continuation zero at end
  All exact defaults/limits/identifiers supported. Evidence: iteration_changes L78-86,L215-225 sha256 7bd3fcd0e67783f75d9bbc4557136b89e36148e992b8a61d08c914cf8e420745

- **R016-C013 — supported** (report L46-L46): includeCommits, seven IterationReason values, retarget old/new refs and commit truncation flags
  Enum and incomplete-commit signals match. Evidence: A001 L64-67,L175-183,L269-293,L468-479 sha256 32fcc785fe70012836f3db8aaaea0a907ade445304b7f17b1f949522139b85ef

- **R016-C014 — supported** (report L48-L49): Selected iteration compareTo earlier, sample iteration2 vs1 originalObjectId, continuation paging necessary
  Correct reference semantics and page completeness, with max2000 interpreted as per-page cap. Evidence: iteration_changes L153-183,L203-225 sha256 7bd3fcd0e67783f75d9bbc4557136b89e36148e992b8a61d08c914cf8e420745

- **R016-C015 — qualified** (report L50-L51): Retarget/rebase/forcePush need not mean new commits; reason labels improve context; full hunks need additional content source
  Reason distinction supports avoiding a new-commits assertion. Force-push can also change code, so not-new-code is a possibility, not universal. Content-rendering call and exact request count remain unresolved. Evidence: A001 L276-293,L468-479 sha256 32fcc785fe70012836f3db8aaaea0a907ade445304b7f17b1f949522139b85ef; iteration_changes L203-225 sha256 7bd3fcd0e67783f75d9bbc4557136b89e36148e992b8a61d08c914cf8e420745

- **R016-C016 — supported** (report L55-L55): Statuses route, full six native states, context identity, creator/detailURL/iteration association min1
  Exact enum/fields and association supported; dedicated per-iteration route itself is not surfaced. Evidence: pr_statuses L62-76,L178-218 sha256 3699494b0b0fab58565709b91e66910d4f477e99943ef25ba53df275c37e7a38

- **R016-C017 — supported** (report L56-L56): Policy route/artifact exact template, full six states, flags/settings/includeNotApplicable and top/skip
  All named policy contract facts supported; collection pagination method is mentioned but not turned into a completeness guarantee. Evidence: A003 L29-75,L169-210,L247-263 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce

- **R016-C018 — qualified** (report L57-L58): Compose status and policy surfaces, do not collapse broken/nonapplicable to red/green; settings vary by type
  Useful source-grounded presentation implication. notApplicable means not applying, not meaningless data; broken is unexpected error. Per-type settings shapes remain explicitly unstudied. Cross-reference U5 actually points to rate limits rather than U4 settings. Evidence: A002 L159-230 sha256 8a9864d3cb9718a4c7d140feeb1700a258de9cb6b85233bc90699df026ada0bb; A003 L169-210,L247-263 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce

- **R016-C019 — supported** (report L62-L62): azure-pr-viewer reads blocking Build/Status policy checks only; reviewer/comment governance separate; failure degrades active
  Concrete maintainer implementation description preserved with correct application boundary. Evidence: azure_viewer_architecture L27-33 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C020 — qualified** (report L62-L64): Negative vote rejected/waiting, -10/-5 labels and unknown fallback voted
  Specific known vote values source-supported. Unknown-to-voted is a reasonable proposed presentation choice; inspected QVL activity code classifies every negative vote as rejected and does not implement that literal fallback. Evidence: qvl_adapter L302-308,L337-339 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4; get_pr L453 sha256 410c2fcae80e0876bf8f8831efc75a7231ad463d84acd4751b71e09947cb0095

- **R016-C021 — supported** (report L63-L63): gh dismissed=>Commented, pending omitted, empty actor=>ghost, truncated label/assignee/project lists=>ellipsis
  Exact mapping rationale, filtering, fallback and truncation behavior all present in the reproduced code. Evidence: gh_view_code L314-329,L351-388,L407-443,L446-479 sha256 2a4422232ca522ee5c5284fa83387fe22e6251d8597489f5af28b19727a6e4c7

- **R016-C022 — unsupported** (report L65-L65): GitHub statusCheckRollup server aggregate has no Azure DevOps equivalent, so client must compose
  The cited code requests rollup and prints a summary; admitted Azure endpoints do not establish corpus-wide absence of an equivalent. Composition is a valid design, but universal no-equivalent/must claim lacks exhaustive primary support. Missing internal §2-analogies target also weakens standalone navigation. Evidence: gh_view_code L88-95,L210-215 sha256 2a4422232ca522ee5c5284fa83387fe22e6251d8597489f5af28b19727a6e4c7; A002 L148-230 sha256 8a9864d3cb9718a4c7d140feeb1700a258de9cb6b85233bc90699df026ada0bb; A003 L214-263 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce

- **R016-C023 — supported** (report L69-L69): QVL checks2xx+JSON; handles auth401/203/nonJSON2xx, transient429/502/503/504, capped Retry-After5s
  Actual code and comments support adapter behavior. Retry-After parsing is numeric-seconds only; code does not prove general provider contracts or all date-form header support. Evidence: qvl_adapter L9-16,L132-184,L213-238 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4

- **R016-C024 — qualified** (report L69-L74): Auth token-refresh HTML/login203 behavior provider can show; exact Entra-versus-PAT codes unprobed
  Maintainer comment is evidence for this adapter experience, not an official normative guarantee; explicit U2/live boundary retained. Evidence: qvl_adapter L9-10,L136-172 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4

- **R016-C025 — qualified** (report L69-L69): Failed per-PR thread read falls back new with explicit warning rather than silently asserting no activity
  Fallback and console.warn are real. This warning goes to the console and is not returned as a user-visible FetchResult warning; presentation-facing interpretation needs qualification. Evidence: qvl_adapter L344-349 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4

- **R016-C026 — supported** (report L70-L71): Per-project partial warnings/rest renders; viewer policy failure active and thread failure ?
  Project aggregation is user-returned warning; per-thread console warning remains a different carrier. Correct ? precedent verified. Evidence: qvl_adapter L393-418,L468-474 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4; qvl_readme L46-47 sha256 d0f16ae6b3ddf9c29bd8225d13c746483aa9c2afff04878c4066cfe8f8710abd; azure_viewer_architecture L27-33 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897; azure_viewer_readme L120-127 sha256 5f7b31c0c417dcd7872808911cdd38c906fec6b2581f57456bb2f9f572a90d6f

- **R016-C027 — supported** (report L72-L73): Truncation/continuation/filtering/older iteration statuses need honest display; queued/broken not success/failure
  Proposed mechanics follow brief and API distinctions; iteration association alone does not prove a particular stale live status was returned. Evidence: A001 L269-271 sha256 32fcc785fe70012836f3db8aaaea0a907ade445304b7f17b1f949522139b85ef; iteration_changes L224-225 sha256 7bd3fcd0e67783f75d9bbc4557136b89e36148e992b8a61d08c914cf8e420745; A003 L72-75,L252-263 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce; pr_statuses L178-188 sha256 3699494b0b0fab58565709b91e66910d4f477e99943ef25ba53df275c37e7a38

- **R016-C028 — supported** (report L78-L78): Azure CLI Entra resource499b84ac-1321-427f-aa17-267ca6975798, cached token refreshed~5min early, no PAT
  Exact command/resource/refresh policy documented by the implementation owner; not independently established as a generic provider contract. Evidence: azure_viewer_architecture L5-7 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897; azure_viewer_readme L3-4,L44,L82-87 sha256 5f7b31c0c417dcd7872808911cdd38c906fec6b2581f57456bb2f9f572a90d6f

- **R016-C029 — supported** (report L78-L79): QVL no-PAT server token injection/proxy due browser CORS; PAT Basic base64(:pat) CodeRead guidance
  Concrete code and README agree; CORS statement is implementation architecture context rather than independently probed policy across all origins. Evidence: qvl_readme L63-71,L173-194,L374-376 sha256 d0f16ae6b3ddf9c29bd8225d13c746483aa9c2afff04878c4066cfe8f8710abd; qvl_adapter L132-134,L187-196,L423-444 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4

- **R016-C030 — qualified** (report L79-L79): Official read scope code for Git/policy; code OR code_status for status
  Scope listings supported; the OR sufficiency guarantee is not established by a list and remains untested. code_status is write-bearing. Evidence: A001 L75-89 sha256 32fcc785fe70012836f3db8aaaea0a907ade445304b7f17b1f949522139b85ef; A002 L75-91 sha256 8a9864d3cb9718a4c7d140feeb1700a258de9cb6b85233bc90699df026ada0bb; A003 L83-97 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce

- **R016-C031 — supported** (report L80-L80): DevCenter multiple provider tokens held in OS keychain
  Maintainer statement, not security/storage exercise. Evidence: devcenter_readme L15-16 sha256 90e1aef73f21d5054fcd9337683f40b2f3295330d38b73e5dc10139b22870277

- **R016-C032 — qualified** (report L76-L81): Two proven zero-OAuth paths; reuse az login no OAuth dance/no stored secret; native desktop does not need browser CORS proxy
  No new app OAuth flow or PAT management is a supported implementation possibility. Azure CLI still obtains/caches an Entra token; no-stored-secret is limited to avoiding a new app-managed persistent PAT, not absence of credentials anywhere. CORS does not constrain a native HTTP client, but a desktop webview can still have web-origin limits. Evidence: azure_viewer_readme L3-4,L44,L82-87 sha256 5f7b31c0c417dcd7872808911cdd38c906fec6b2581f57456bb2f9f572a90d6f; azure_viewer_architecture L5-7 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897; qvl_readme L63-71,L374-376 sha256 d0f16ae6b3ddf9c29bd8225d13c746483aa9c2afff04878c4066cfe8f8710abd

- **R016-C033 — qualified** (report L82-L82): Refresh timing one-product policy and resource ID configurable not folklore; well-known ADO resource
  Good transfer boundary. This independent capture supports the ID as used by that product, not the report broader well-known classification; no official Entra resource page supplied. Evidence: azure_viewer_architecture L5-7 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C034 — supported** (report L86-L86): Approval/required-reviewer tally no extra request
  Useful request-saving implementation precedent. Evidence: azure_viewer_architecture L10-16 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C035 — supported** (report L87-L87): Threads N+1, concurrency8 in both products, viewer cancellation on newer refresh
  Exact concurrency constants and cancellation maintainer statement verified. Ceiling8 is product policy, not documented provider safe limit. Evidence: qvl_adapter L15-16,L310-315,L370-376 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4; azure_viewer_architecture L17-22 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C036 — supported** (report L88-L88): Policy evaluations lazy only own PRs where Status column shown
  Concrete optional request-reduction choice; cannot suppress policy data required by Review Desk selected review. Evidence: azure_viewer_architecture L27-33 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C037 — qualified** (report L89-L89): Thread-granularity counting correct/cheaper than comment count because ADO resolves threads
  Documented implementation semantics; normative official thread API intentionally remains U1. Cost saving is an inference, not measured performance. Evidence: azure_viewer_architecture L17-26 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C038 — supported** (report L90-L91): QVL ports/adapters provider seam isolates auth/retry/thread analysis and normalizes modern/legacy org/project URLs
  Exact code and architecture support an optional cheap/testable seam; any future provider breadth is a product choice. Evidence: qvl_adapter L1-5,L100-128,L448-476 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4; qvl_readme L88-118 sha256 d0f16ae6b3ddf9c29bd8225d13c746483aa9c2afff04878c4066cfe8f8710abd

- **R016-C039 — qualified** (report L92-L94): Both inspected desktop clients raw REST7.1 Go/TS, no SDK needed; viewer httptest seam
  Raw HTTP implementation and documented httptest seam support avoiding a mandatory SDK. QVL is a browser web app, not a desktop client; Go architecture does not establish every call uses7.1. Test existence is not candidate execution. Evidence: qvl_adapter L187-218,L370-374 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4; qvl_readme L3,L63-71 sha256 d0f16ae6b3ddf9c29bd8225d13c746483aa9c2afff04878c4066cfe8f8710abd; azure_viewer_architecture L43-50,L62-67 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C040 — qualified** (report L94-L94): Org-wide versus per-project PR query shapes working, org-wide exact contract unverified
  Two owner-described implementations, no live working-shape test; the explicit contract verification limit prevents a normative route mandate. Evidence: azure_viewer_architecture L10-16 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897; qvl_adapter L370-374 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4

- **R016-C041 — supported** (report L100-L100): azure-pr-viewer Go TUI MIT role/vote/thread/policy dashboard, not repo version inspector
  Relevant whole-product overlap and transfer boundary supported at README/architecture level, not binary parity. Evidence: azure_viewer_architecture L5-36,L43-64 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897; azure_viewer_readme L3-14,L138-140 sha256 5f7b31c0c417dcd7872808911cdd38c906fec6b2581f57456bb2f9f572a90d6f; azure_viewer_repo_metadata JSON $.language,$.license sha256 7b2dc75308767be1c02647a21a48ec395d9c695883a90e55cb16b2e20457c432

- **R016-C042 — supported** (report L101-L101): PullRequest-Manager Electron React FluentUI cross-project filters/notifications, WIP integration, noncommercial license
  All qualifiers preserved, especially WIP and commercial-license condition. Evidence: pullrequest_manager_readme L23-32,L42-49,L67-75,L153-155 sha256 490718bb7be675348fa402b77430bd8a95e86600cc52307065a6a41cfc9b1831

- **R016-C043 — supported** (report L102-L102): QVL React web app via proxy, PR activity since visit/warnings, different presentation scope
  Explicit web-app identity counters report F9 desktop misclassification. Evidence: qvl_readme L3-9,L38-48,L63-71 sha256 d0f16ae6b3ddf9c29bd8225d13c746483aa9c2afff04878c4066cfe8f8710abd

- **R016-C044 — supported** (report L103-L103): DevCenter Tauri multi-provider desktop, list/in-app diff plus reply/approve writes beyond scope
  Useful product overlap and read-only divergence are accurately separated. Evidence: devcenter_readme L3-16 sha256 90e1aef73f21d5054fcd9337683f40b2f3295330d38b73e5dc10139b22870277; brief L3 sha256 b6190d58238b5a0471d1870d0de60b300a6c481c8d1719a7f229cdd840278607

- **R016-C045 — supported** (report L105-L105): gh view analogous read-only renderer; mapping/truncation/empty-body transfers, not REST API shape
  Source-backed component analogy within presentation scope; no candidate binary test claimed. Evidence: gh_view_code L97-144,L269-282,L314-388,L407-479 sha256 2a4422232ca522ee5c5284fa83387fe22e6251d8597489f5af28b19727a6e4c7

- **R016-C046 — qualified** (report L106-L106): Reject AdoMcpServer as whole human review UI because Claude MCP bridge
  Valid whole-product rejection, but source explicitly has read-only operations and PR/code-review metadata. Dismissing every provider-adapter analogy would be too broad; current report does not inspect its code. Evidence: ado_mcp_readme L1-3,L38-58 sha256 606ee0ffa724537cf75079d750d25939147e40ab19d1a33273ddc9dbcb68e25b; ado_mcp_repo_metadata JSON $.description sha256 686fd5f2ab8895c30a0d46ddb3f9b97496523045dc68da0ea8183d2922d4f76b

- **R016-C047 — qualified** (report L106-L119): Reject stale PRex notifier-only; existence retained despite2021 date
  Limited notifier product supported; useful account/read-only scope precedent remains possible even without review UI. Date does not establish nonexistence. Evidence: prex_readme L1-8 sha256 b42e629db799fe94b388f2281a2d677423d2d6f54214be3b416911aec02d00fc; prex_repo_metadata JSON $.description,$.pushed_at sha256 571c3fda9331dccc8653bb1048fdb9ac1500e5b4bc8620817db02684eafc0398

- **R016-C048 — qualified** (report L106-L106): Reject PdfDiff single-format diff viewer as irrelevant analogy
  Not a whole desktop competitor, but directly comparable ADO PR-diff presentation with side-by-side/inline/pixel modes. Relevance can be declined for this pass only, not categorically eliminated. Evidence: pdfdiff_readme L1-11 sha256 26a53df45817dddacb8b52474daef75bf7553fbffc864b1b3a7008302d64006f; pdfdiff_repo_metadata JSON $.description sha256 5ceef2f18084ee4013410a03976bf777dc0c528a27cacdf69c7ba3b9230ab822

- **R016-C049 — supported** (report L106-L131): Reject DevOps Gate implementation reuse: private source/release-only; existence retained unresolved
  Primary README explicitly distinguishes desktop product from private implementation; no source-code fact inferred. Evidence: devops_gate_readme L1-9 sha256 d60e33287241c5311acb7a803ec5f62d7d287d720429ba20aaca35a89766e8fc

- **R016-C050 — qualified** (report L109-L109): Read paths termed provider-supported obligations: PR roles/iterations/changes/status/policy/current identity
  Documented/owner-used capabilities exist, but connectionData/role views are not brief-required obligations and owner code is not an official normative contract. Evidence: A001 L29-67 sha256 32fcc785fe70012836f3db8aaaea0a907ade445304b7f17b1f949522139b85ef; A002 L29-30 sha256 8a9864d3cb9718a4c7d140feeb1700a258de9cb6b85233bc90699df026ada0bb; A003 L29-75 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce; qvl_adapter L246-251,L370-374 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4

- **R016-C051 — qualified** (report L110-L110): Optional flags includeCommits/includeNotApplicable/compareTo/page sizes/detaillinks/iteration binding/isRequired split
  Contract options and UI choices correctly separated. If the app purports to show all non-applying policies or complete compare results, relevant option/paging obligations become conditional rather than wholly dispensable. Evidence: A001 L64-67 sha256 32fcc785fe70012836f3db8aaaea0a907ade445304b7f17b1f949522139b85ef; A002 L185-197 sha256 8a9864d3cb9718a4c7d140feeb1700a258de9cb6b85233bc90699df026ada0bb; A003 L72-75 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce; iteration_changes L84-86 sha256 7bd3fcd0e67783f75d9bbc4557136b89e36148e992b8a61d08c914cf8e420745

- **R016-C052 — qualified** (report L111-L111): Policy/vote/reviewer/degradation/last-visit mappings are product choices; Meral noncommercial and QVL no license means idea-only transfer
  Choice-versus-contract discipline is useful. GitHub null license/README add-license admonition supports caution, not repository-wide absence proof or legal opinion; code licensing limits are constraints, not arbitrary product choices. Evidence: pullrequest_manager_readme L153-155 sha256 490718bb7be675348fa402b77430bd8a95e86600cc52307065a6a41cfc9b1831; qvl_repo_metadata JSON $.license sha256 113abb166eae19a7b96b7e789bc202d666a03b0223a716ba73eb6a9810752fab; qvl_readme L430-431 sha256 d0f16ae6b3ddf9c29bd8225d13c746483aa9c2afff04878c4066cfe8f8710abd

- **R016-C053 — unresolved** (report L117-L117): Three wrong Learn slugs404 then corrected200/fullcontent
  Current official sources are reachable, but native retry sequence/three404 evidence is locked; independent verification cannot reconstruct execution. Evidence: No admitted stage1 evidence for native provenance.

- **R016-C054 — qualified** (report L118-L118): DDG202 challenge; two GitHub query recovery; no further competitor absence established
  One independently reproduced search and bounded absence rule supported; native second-query/challenge/acquisition chronology unresolved. Evidence: github_search JSON entire body sha256 0309674a19d6f6a89fa017aca29c2db525026de095e276b4d68e9aa5b5a9c830

- **R016-C055 — qualified** (report L120-L120): ? mockup counts intentional degradation cross-checked owner troubleshooting/architecture
  Current owner documents support intentional placeholder; native cross-check sequence remains unverified. Evidence: azure_viewer_readme L32,L120-127 sha256 5f7b31c0c417dcd7872808911cdd38c906fec6b2581f57456bb2f9f572a90d6f; azure_viewer_architecture L17-33 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C056 — qualified** (report L124-L124): U1: Threads API and exact active/pending/fixed/wontFix/closed/byDesign enum only owner architecture; official verification proposed
  Valid explicit unresolved/test proposal; UNEXECUTED is not false merely because no fixture exists. Native acquisition count/no-live-execution claims are provenance-locked. GetPR evaluator verification does not imply the candidate performed U6. Evidence: azure_viewer_architecture L17-26 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C057 — qualified** (report L125-L125): U2: Live degraded auth/status-name tolerance/Entra ID unprobed; read-only test proposed
  Valid explicit unresolved/test proposal; UNEXECUTED is not false merely because no fixture exists. Native acquisition count/no-live-execution claims are provenance-locked. GetPR evaluator verification does not imply the candidate performed U6. Evidence: qvl_adapter L136-172 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4; azure_viewer_architecture L5-7 sha256 7ad9af78cfad7550b7d075a87b261a665d5cdeb0abe23d7d5b4caf7f8dbf1897

- **R016-C058 — qualified** (report L126-L126): U3: Server7.2 rejection/7.1 acceptance live probe proposed from doc version menus
  Valid explicit unresolved/test proposal; UNEXECUTED is not false merely because no fixture exists. Native acquisition count/no-live-execution claims are provenance-locked. GetPR evaluator verification does not imply the candidate performed U6. Evidence: iterations_list L389-402 sha256 28d00fc54547afac615e4658cc8845efc2aba3b6efded7090db3dcf95014f5b1

- **R016-C059 — qualified** (report L127-L127): U4: Per-type policy settings unexamined; policy-type enumeration proposed
  Valid explicit unresolved/test proposal; UNEXECUTED is not false merely because no fixture exists. Native acquisition count/no-live-execution claims are provenance-locked. GetPR evaluator verification does not imply the candidate performed U6. Evidence: A003 L205-210 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce

- **R016-C060 — qualified** (report L128-L128): U5: Actual rate ceilings/safe concurrency unknown; bounded8-vs16 load proposal
  Valid explicit unresolved/test proposal; UNEXECUTED is not false merely because no fixture exists. Native acquisition count/no-live-execution claims are provenance-locked. GetPR evaluator verification does not imply the candidate performed U6. Evidence: qvl_adapter L13-16,L175-184 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4

- **R016-C061 — qualified** (report L129-L129): U6: Official isRequired/mergeStatus/item content verification not done; GetPR/items docs proposed
  Valid explicit unresolved/test proposal; UNEXECUTED is not false merely because no fixture exists. Native acquisition count/no-live-execution claims are provenance-locked. GetPR evaluator verification does not imply the candidate performed U6. Evidence: get_pr L236,L448 sha256 410c2fcae80e0876bf8f8831efc75a7231ad463d84acd4751b71e09947cb0095

- **R016-C062 — qualified** (report L130-L130): U7: Two GitHub queries/blocked web scope, future alternate-engine/Marketplace sweep
  Valid explicit unresolved/test proposal; UNEXECUTED is not false merely because no fixture exists. Native acquisition count/no-live-execution claims are provenance-locked. GetPR evaluator verification does not imply the candidate performed U6. Evidence: No admitted stage1 evidence for native provenance.

- **R016-C063 — qualified** (report L131-L131): U8: Closed-source DevOpsGate no implementation inference
  Valid explicit unresolved/test proposal; UNEXECUTED is not false merely because no fixture exists. Native acquisition count/no-live-execution claims are provenance-locked. GetPR evaluator verification does not imply the candidate performed U6. Evidence: devops_gate_readme L3-9 sha256 d60e33287241c5311acb7a803ec5f62d7d287d720429ba20aaca35a89766e8fc

- **R016-C064 — qualified** (report L135-L137): Source register docs API versions/commit/update and all fetching bytes hash claim
  Version/source metadata verified. Native retrieval date/actual final URL/log completeness remain unresolved; independently captured bytes cannot certify candidate acquisition. Evidence: iterations_list L1-32 sha256 28d00fc54547afac615e4658cc8845efc2aba3b6efded7090db3dcf95014f5b1; A003 L27-35 sha256 98070bba044326e23f6ea75dbcdc9f59cadeb6c6f3aa7f6923f91efc577fdbce; get_pr L1-32 sha256 410c2fcae80e0876bf8f8831efc75a7231ad463d84acd4751b71e09947cb0095

- **R016-C065 — supported** (report L138-L138): qvl report branch/source-prefix/push/license metadata
  Current primary repository metadata matches stated push date/default branch; independently returned code/README prefixes match the report. No native acquisition inference. Evidence: qvl_repo_metadata JSON $.default_branch,$.pushed_at,$.license sha256 113abb166eae19a7b96b7e789bc202d666a03b0223a716ba73eb6a9810752fab; qvl_adapter L7 sha256 6b57b42baa4407116b1cec6d0d2875e998189d558e602caf0060765a9fa675e4

- **R016-C066 — supported** (report L139-L139): azure_viewer report branch/source-prefix/push/license metadata
  Current primary repository metadata matches stated push date/default branch; independently returned code/README prefixes match the report. No native acquisition inference. Evidence: azure_viewer_repo_metadata JSON $.default_branch,$.pushed_at,$.license sha256 7b2dc75308767be1c02647a21a48ec395d9c695883a90e55cb16b2e20457c432; azure_viewer_readme L138-140 sha256 5f7b31c0c417dcd7872808911cdd38c906fec6b2581f57456bb2f9f572a90d6f

- **R016-C067 — supported** (report L140-L140): pullrequest_manager report branch/source-prefix/push/license metadata
  Current primary repository metadata matches stated push date/default branch; independently returned code/README prefixes match the report. No native acquisition inference. Evidence: pullrequest_manager_repo_metadata JSON $.default_branch,$.pushed_at,$.license sha256 969aab6495aa2d4d34dad8177d1a50305822d68cc30dfaa2c18722648395b26a; pullrequest_manager_readme L153-155 sha256 490718bb7be675348fa402b77430bd8a95e86600cc52307065a6a41cfc9b1831

- **R016-C068 — supported** (report L141-L141): devcenter report branch/source-prefix/push/license metadata
  Current primary repository metadata matches stated push date/default branch; independently returned code/README prefixes match the report. No native acquisition inference. Evidence: devcenter_repo_metadata JSON $.default_branch,$.pushed_at,$.license sha256 44e6b1e0d7447a398784b204a7c23de3f5352a5407f896f0366c423051a23c21; devcenter_readme L3-16 sha256 90e1aef73f21d5054fcd9337683f40b2f3295330d38b73e5dc10139b22870277

- **R016-C069 — supported** (report L142-L142): cli/cli trunk view.go source prefix2a442223
  Exact source prefix reproduced independently. Evidence: gh_view_code entire body, sha256 matches report prefix sha256 2a4422232ca522ee5c5284fa83387fe22e6251d8597489f5af28b19727a6e4c7

- **R016-C070 — unresolved** (report L144-L144): All proposed validation UNEXECUTED; no invented access/probe evidence
  Current report clearly makes no test-success claim. Execution absence and no-invention provenance cannot be certified without stage2 native history. Evidence: No admitted stage1 evidence for native provenance.

## Facet coverage

- **AZR-01: partial**. Iteration/context and status iteration association retained. Dedicated iterations/{iterationId}/statuses route and sourceRefCommit/targetRefCommit meanings omitted.

- **AZR-02: partial**. Separate complete enums and pending/error policy distinctions. Status notApplicable target-object scope and explicit notSet/error/nonpassing status mapping not developed.

- **AZR-03: partial**. Exact artifact template retained, but GUID-only force is stronger than cited A003. Independent evaluator verification of proposed GetPR source gives typed project UUID support; live name rejection remains unresolved and cannot be credited as candidate acquisition.

- **AZR-04: partial**. Blocking-policy/check presentation precedent developed; isEnabled merely listed, disabled-policy enforcement/result presentation incomplete.

- **AZR-05: full**. Endpoint-specific7.1 versus7.1-preview.1 explicit; global API constant not assumed universal.

- **AZR-06: partial**. top/skip and includeNotApplicable named; truthfulness of policy collection completeness after one partial response is not developed.

- **BRIEF-CONTEXT: partial**. Identity fields/version reasons useful; per-user multi-project precedents need selected-repository/account boundaries.

- **BRIEF-VERSIONS: full**. Server comparison/paging/reasons and content-diff boundary covered.

- **BRIEF-CHECKS: partial**. Status/policy/governance composition useful; enforcement/completeness details incomplete.

- **BRIEF-HONESTY: partial**. Real degradation/warnings/truncation mechanics; console warning differs from UI warning.

- **BRIEF-ACCOUNT: partial**. Existing CLI account/PAT/keychain precedents supplied; zero-OAuth/no-secret and scope sufficiency need qualification.

- **BRIEF-IMMUTABILITY: full**. Read-only companion maintained; no proposed provider writes beyond read probes/load reads.

- **BRIEF-REAL-IMPLEMENTATIONS: full**. Actual adapter/renderer code plus owner architecture/README provide grounded precedents and useful limits.

- **BRIEF-COMPATIBILITY: partial**. Pinned versions and ID wording provided; doc editions/live behavior separated, some hard claims overreach.

- **BRIEF-PRESENTATION: partial**. Useful mapping/degradation analogies; no-equivalent absence and overly broad rejection boundaries unsupported.

- **BRIEF-SIMPLICITY: partial**. Request-saving/concurrency/seam/lazy-read precedents; SDK optional, but browser app mislabeled desktop and no measured performance.

## Identity, novelty and limits

Report SHA256: 020548a659eadfc4e8dd17674c2cba21f3deb77b737a02f6cb737ba0db744630. Stage SHA256: 8015b5b245510286f36d656df2027013d463a55abbaf9a52df8a501afdb73836. All manifest hashes match. Full source paths, URLs, original-byte hashes and retrieval dates are bound in the JSON and source-addendum manifests.

Supported useful novelty: Role/reviewer tally from same list response; Real adapter JSON/auth/throttle/partial-project mechanics; Real policy failure and ? thread-placeholder degradation; CLI existing-account token refresh precedent; Eight-way thread fan-out/cancel/lazy-policy and thread-granularity precedent; Provider seam and modern/legacy URL normalization; gh reviewer-state/deleted-account/truncation mappings; Four primary-documented product competitors and licensed/private-source boundaries.

Unreviewed scope: none. Partial/omitted product coverage is retained in all facet decisions. Native acquisition/history/economics remain locked; treatment wording was visible only in the report header.

Standalone defects: F5 settings see U5 points to rate ceilings rather than settings U4; F6 references absent section2-analogies; F9 calls QVL a desktop client while F10 correctly calls it a web app.

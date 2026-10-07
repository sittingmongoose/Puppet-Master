# ER10 native Goal route findings

Inspected 2026-10-07 18:25–18:34 UTC. Engineering only; no scored research answer, candidate launch, child launch, account change, server change, or publication-worktree write.

**Supported now:** Luna and Muse provider-native model-tool activation, both demonstrated by root's first real assignments. **GLM:** native backend API exists, but activation through this delegated T3 session is not demonstrated; the current prompt route has a local access/routing blocker. **Supervisor v1:** a directly observed native rejection names the 4000-character objective limit.

## Exact delegated targets

Live `orchestrator_capabilities` and actual first-assignment `t3_thread_configuration` agree:

```json
[
  {
    "providerInstanceId": "codex_gmail",
    "model": "gpt-6-luna",
    "options": {"reasoningEffort": "max", "serviceTier": "priority"}
  },
  {
    "providerInstanceId": "muse",
    "model": "muse-spark-1.3-contributor",
    "options": {
      "reasoning_effort": "max",
      "mode": "default",
      "approval_mode": "allowAll",
      "auto_review": "off"
    }
  },
  {
    "providerInstanceId": "zcode",
    "model": "builtin:zai-coding-plan\\GLM-5.3-Flash",
    "options": {"thought": "max", "mode": "yolo"}
  }
]
```

Supply one of these objects as `delegate_task.target`, with `mode:"async"`, a retained stable `clientRequestId`, and the assignment in `task`. Tool schema allows options as a map or `[{id,value}]`. This helper remains `codex_gmail` / `CODEX_HOME=/home/sittingmongoose/.codex-t3/gmail`; no other Codex account was used.

A normal assignment may explicitly require the child to call its native `create_goal({"objective":"<concise objective>"})`, then `get_goal({})`, preserve the real responses, and only continue after matching identity and `active`. This route is observed for Luna and Muse. It is not established for GLM.

For a literal slash route, the deployed T3 binary's `taskPrompt` passes `task` verbatim only when `role` is omitted or `"general"`. Other roles prepend prose. The deployed ACP prompt wrapper expressly leaves a prompt beginning with `/` unchanged. Therefore a command route uses `role:"general", task:"/goal <short objective>"`; quoting `/goal` inside an ordinary assignment does not invoke a slash command. This engineering helper did not execute such a candidate launch.

## Luna: activation and identity are established

The first treatment receipt is at:

`runtime/jobs/I-ANCHOR-LUNA/treatment/research-v1/native_goal_receipt.json`.

Its native `create_goal` and `get_goal` both returned `status:"active"` and native Goal thread ID `01a1179d-d516-7553-9f79-2e7a4c68f476`. The live T3 provider-thread projection binds this exact ID as `nativeThreadRef.nativeId` for the treatment child on `codex_gmail`. This directly resolves the activity/session-ID mismatch: the shared provider-session container has a separate ID and is not the native Goal thread identity. The control child likewise binds native ID `01a1179e-4cc0-70f2-87c0-0b2dbd5fa24c`. See `receipts/candidate-native-binding.json`.

Installed Codex 0.160.1 protocol statuses are exactly `active`, `paused`, `blocked`, `usageLimited`, `budgetLimited`, `complete`. Only `complete` is success completion; other non-active statuses preserve their actual meanings. `update_goal({"status":"complete"})` is the exposed completion call; confirm with fresh `get_goal({})` on that same child. The update tool also accepts `blocked` and `paused` subject to its explicit policy. Resume and budget changes are user-controlled.

A draft file or completed T3 turn is not a terminal Goal receipt. The root reported draft files present with native terminal still pending. Native response timestamps are Unix seconds. `tokensUsed`, `timeUsedSeconds`, `tokenBudget`, `remainingTokens`, and `completionBudgetReport` must retain their native meanings; a null budget is not a zero budget.

The deployed Codex slash adapter uses `thread/goal/get`, `thread/goal/set`, and `thread/goal/clear`; setting is initially paused while T3 starts the first configured native turn, then activated. Later native Goal turns are managed by Codex. The model-tool route avoids needing an external Goal controller.

## Muse: activation is established; observe native receipts

The first treatment receipt is at:

`runtime/jobs/I-ANCHOR-MUSE/treatment/research-v1/native_goal_receipt.json`.

Observed tools are `muse.create_goal`, `muse.get_goal`, `muse.update_goal`, and `muse.report_progress`. The observed invocation uses `create_goal({"objective":"..."})` and `get_goal({})`. Both returned `status:"active"`, Goal ID `goal-01a1179f-615b-7c20-8a33-9a4971576486`, and session ID `01a1179f-2feb-7570-996c-3c180d5f902b`. This session ID matches the treatment child's T3 `nativeThreadRef.nativeId`.

Independent read-only corroboration found the native `goals.db` row and original durable session records for both calls and their results. The receipt preserves record IDs, sequences, line SHA-256, call IDs, parsed native responses, and objective hashes. No draft or source content was exported.

Installed Muse adapter 0.10.0 and host 1.4.3-R5018.1 also support slash `/goal <objective>`, `/goal edit <objective>`, `/goal pause`, `/goal resume`, and `/goal clear`, mapped to native host `goal/*`. Native host acknowledgements return `accepted` and possibly a turn ID: admission alone does not prove active Goal state or completion. `session/goalChanged` or metadata-only `session/read` provides the native Goal block and session identity.

The stable MSP schema deliberately makes `Goal.status` a free string; it does not supply a closed terminal enum for model tools. Require the child's actual accepted completion call and fresh native state on the same Goal/session. No Muse terminal transition was tested by this helper. Preserve raw native completion status rather than guessing an enum from task status.

T3's current Muse provider-thread `goal` projection is null while the native Goal is active. Null here is an observation limitation, not proof that Muse has no Goal. The adapter describes Goal state as display metadata; do not rely on T3 task status as a substitute. Native model-tool responses use millisecond timestamps and snake_case fields. Muse usage/cost may have partial or client-estimated semantics; retain those qualifications.

## GLM: native backend exists, delegated native activation remains blocked/unproven

Installed ZCode adapter 0.65.1 has a genuine backend extension:

```json
{"method":"session/goal","params":{"sessionId":"<backend session>","action":"set","objective":"<objective>"}}
```

Native protocol actions are `show|set|replace|pause|resume|clear`. The native result contains `response`, `snapshot`, and optional `startedTurn`. Authoritative native target statuses are `active|paused|budget_limited|complete`; the separate presentation schema includes older verification states, so those are not interchangeable.

The current T3 catalog exposes only GLM `mode` and `thought` options, and the exposed MCP tools have no direct native `session/goal` RPC passthrough. Existing installed slash handling defaults `/goal` to the adapter's bridge-owned `GoalLoopDriver`. Native backend routing requires `goal.mode="backend"` or `ZCODE_ACP_GOAL_MODE=backend`. The user config file is absent; inspected live adapter environments and T3 provider settings contain neither override. No configuration was changed. Default slash behavior is therefore not evidence of native backend Goal activation.

The treatment T3 ACP alias `96b17a0b-60a0-46da-af70-ec838d066b8c` maps in the installed alias store to backend session `sess_d5586132-b1db-4b5c-938c-0cd63bb1b59e`. Its inspected native task metadata had `target:null`; T3 also had `goal:null`, and no Goal receipt file was present. These are point-in-time absence observations only. The child separately reported that `create_goal/get_goal/update_goal` were absent from its tool catalog; that statement is not itself activation evidence.

Within the authorized unmodified T3 route, only a prompt requesting discovery/use of an actually available native mechanism remains. Proof would require an original successful native backend response/read with `target.status="active"`, exact objective/target/session identity, and the alias-to-backend binding above; later native `complete` on that same target is required for terminal success. A prose `/goal`, a running task, `startedTurn:true` alone, or a bridge-loop announcement is insufficient. No global GLM capability failure is claimed. No new Goal engine or external runner is supplied.

## Supervisor v1: specific native start error was observed

The first Sol6.1 Medium supervisor request began with `/goal` and had a 6081-character objective. Its T3 UI reported only a generic provider-start failure. A narrow current trace read returned:

```json
{
  "_tag":"CodexAppServerRequestError",
  "code":-32600,
  "errorMessage":"goal objective must be at most 4000 characters",
  "method":"thread/goal/set",
  "requestId":"16",
  "operation":"receive-response"
}
```

This is directly observed native error text, not an inference from the failed task. The raw trace rotated before follow-up extraction; its immutable source-record hash is unavailable. The original tool observation is retained as a selected receipt with that limitation. Root reported v1 preserved/settled and v2 running after removing the supervisor's own Goal requirement. No v1 restart or candidate Goal-policy change was made here.

## Access, freshness, and receipts

Evidence identifies live T3 0.0.46-nightly.20261007.2774, current catalog/configuration, installed adapter code/docs, offline exact schema exports, and focused live metadata. Offline schemas establish supported shapes, not current activation. A SQLite observation is immediately stale if another process writes; original parsed record excerpts and their hashes are the retained evidence. This helper's own `get_goal({})` returned no Goal, and is not a Luna test.

Applicable actual global/project instructions and the Plans index were read; no canon or governance artifact was changed. All helper-created files stay under `runtime/helpers/native-route`. Schema-generation scratch was removed. The publication worktree remains root-owned. Each saved receipt is listed in `receipt-manifest.json`; scripts recreate selected document/native metadata receipts without launching sessions.

Official Codex documentation confirms the general Goal lifecycle, but does not establish this installed T3 route: [Using Goals in Codex](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex).


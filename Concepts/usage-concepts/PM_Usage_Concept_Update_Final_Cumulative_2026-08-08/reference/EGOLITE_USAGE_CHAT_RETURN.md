# Return Handoff — Usage and Assistant Chat v3

**From:** Egolite & Git Updates  
**Status:** compact cross-thread delta

## 1. Usage attribution

Source-control/tool installation, update, repair, authentication maintenance, WSL startup, checkout reconciliation, and local browser recording are not model-token usage.

Actual model work remains attributed by:

```text
Project
thread/Goal/run/subagent
provider/account/profile
requested/effective model
Execution Host/Environment
Source Location and checkout/workspace
BrowserSession/test/capture identity where useful
```

Resource wait, elapsed time, bytes, tool version, recording duration, and failure class may appear in diagnostics or operation receipts without being mixed into token/cost totals.

## 2. Browser Program efficiency telemetry

To verify Ego-style gains, retain model turns, tool calls, input/output tokens, snapshot count/bytes/token estimate, Browser Program action count, wall time, success/retry, and recording on/off. Keep this separate from provider price/plan settlement.

## 3. Chat progress

Chat should show compact durable progress for:

- clone/fetch/worktree/workspace creation;
- tool install/update/repair;
- browser testing/recording;
- waiting for a secure sign-in action;
- source handoff/reconciliation;
- CI/test results and artifacts.

Use expandable evidence and Open/Watch actions rather than dumping raw Git output, package logs, page representations, or videos into the transcript/model context.

## 4. Multi-agent browser/source sessions

Chat may list several simultaneous agent browser/test/source sessions with Project/Goal/agent labels. Watching or closing one viewer must not transfer control or stop unrelated sessions.

## 5. Authentication privacy

Do not place authorization codes, secrets, CLI profile paths, helper responses, Auth Browser screenshots, page content, DOM, console, or network data in Chat or Usage.

Chat may show only redacted lifecycle state:

```text
Secure sign-in waiting for you
Sign-in completed
Sign-in expired
Could not complete sign-in
```

## 6. WSL/container labels

Use human environment names such as `WSL Ubuntu`, `Home TrueNAS`, or `This Windows computer`. WSL off is not an alert. Container Server operations should not imply they were proxied through a desktop when they ran locally.

## 7. Notifications

Source-control/browser events may request central notifications for approval, conflict, CI/test failure, recording failure, update/repair, source handoff, and completion. Every important state also has a visible non-audio representation.

## 8. Return requested

Return Usage event fields, Browser Program comparison metrics, Chat operation cards, multi-session Watch/Open behavior, redaction rules, and human environment labels.

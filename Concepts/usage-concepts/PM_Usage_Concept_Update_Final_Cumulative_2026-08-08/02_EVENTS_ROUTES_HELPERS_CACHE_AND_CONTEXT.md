# Events, Routes, Helpers, Cache, and Context

## One provider attempt per event

A visible user turn may create:

```text
Primary attempt
Failed attempt
Fallback replay
Subagent calls
Vision helper
Compression helper
Web extraction
Approval reviewer
MCP router
Skill search
BSD
Probe/validation
Attachment transform
Title generation
MoA references/aggregator
```

Each real attempt is independently attributable and grouped under one logical turn.

## Required route fields

```text
logical_turn_id
attempt_id
parent_event_id
thread/session/Goal/Plan/agent/Crew lineage

provider family
requested/effective account
connection
product/plan
requested/effective model
effort
Normal/Fast
conversation mode
requested/effective access profile
purpose
fallback/switch reason
```

## Auxiliary purpose taxonomy

At minimum:

```text
user_work
subagent
crew_member
moa_reference
moa_aggregator
vision
compression
web_extract
approval_review
mcp_router
skill_search
title_generation
probe
catalog_validation
attachment_transform
fallback_attempt
conversation_replay
bsd
```

Default UI may aggregate helpers into understandable groups. Expanded detail preserves individual calls.

## Cache

Record:

```text
Predicted impact
ContextEpoch
Stable-prefix identity
Actual cache-read tokens
Actual cache-write tokens
Hit/reuse rate
Invalidation/reduced-reuse reason
Provider-reported/derived/estimated source
```

Material causes include provider, account, connection, model, effort, Normal/Fast, system/Persona/rules, tools, MCP, skills, memory/context assembly, compression, branch, replay, and failover.

## Context operations

Separate operations:

```text
Compact Now
Automatic compaction
Tool-result pruning
Micro-compaction
Discarded stale compaction
No-gain compaction
Branch context build
Conversation replay
Prior-thread retrieval
```

A helper may consume Usage even when its result is discarded. Context mutation and provider settlement are separate facts.

## Back Seat Driver

Record:

```text
Off/Auto/On requested state
Trigger reason
Route/model
Input/output/cache
Latency
Silent result
Advice emitted
Duplicate suppressed
Timeout/failure
Override scope
```

A silent provider call still counts.

## Tools and schemas

Where evidence exists, record selected tool/MCP/skill schema overhead and tool-result compaction/recovery. Clearly label provider-reported versus PM-derived estimates.

## Attachments

Record:

```text
Original attachment
Native/PM transformed/alternate/unsupported
Transformation
Derived artifact IDs
Alternate route
Consent/policy
Local compute
Tokens/cost/settlement
Privacy boundary
Parent turn
```

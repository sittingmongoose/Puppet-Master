# Context, History, Threads, and Branching

## Context Ring and Context Lens

Preserve:

```text
Current pressure
Source composition
Cache state
Compact Now
More Details
Context Lens
```

Context Lens renders the admission receipt rather than a generic token dump.

Example:

```text
Included
  Current objective
  Recent messages
  Scoped project instructions
  Persona capsule
  Selected tools
  2 prior-thread excerpts
  1 attachment representation

Left out
  Older messages represented by summary
  17 unused tool schemas
  Unrelated logs
  Memories below relevance threshold
```

Users can inspect provenance and remove an admitted historical excerpt.

Do not expose raw secrets, full FileSafe policy, full system prompts, or giant internal registries.

## Compact Now

Compact Now preserves canonical history and branch ancestry. It produces a visible operation state and receipt; it does not delete history or rewrite historical Usage.

## Prior chats

Provide human and agent-facing search across project threads.

Result actions:

```text
Open conversation
Add passage to context
Branch from this point
Copy link
```

Only selected passages enter context.

## Thread operations

Authorized Assistant agents can:

```text
List related threads
Search/read bounded ranges
Send a typed request
Await a response
Resume an inactive target
Spawn a child/sibling research thread
Branch from a message/restore point
```

A request has source/target thread, sender, bounded task, selected evidence refs, scope, budget, timestamps, status, and result refs.

No hidden shared context. No full-transcript copying. Add cycle and fan-out protection.

## Branch and rewind

User-facing operations may include:

```text
Copy
Branch from here
Branch with another model
Branch with another Persona
Create restore point
Rewind to here
More
```

A branch preserves the source conversation, lineage, attachments, citations, selected compacted state, and provenance. It does not mutate workspace files or clone every raw message into the new provider prompt.

Questionnaire history may be reopened and answered differently as a sibling branch.

## Active-turn redirect

A user correction during generation can:

- steer the active turn;
- preserve the original attempt and partial output;
- show interrupted/redirected/resumed state;
- create a new provider attempt when required.

It is not presented as an unrelated ordinary message.

## Thread-local state

These default to the current thread:

```text
Provider
Account/connection
Model
Persona
Effort
Normal/Fast
Conversation mode
Access profile
BSD
Crew
Context overrides
Worktree binding
```

Changing a project/global default affects future threads unless the user explicitly bulk-applies it. Existing or running threads/Goals remain frozen.

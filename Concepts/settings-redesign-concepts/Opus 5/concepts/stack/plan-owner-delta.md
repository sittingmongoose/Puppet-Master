# Plan-owner delta — Opus 5 — Stack

*Model folder: `Opus 5`. Thesis: **Settings is a route**. Generated 2026-08-12.*

Concept agents do not edit canon. This file records what building **Opus 5 — Stack** pressed on,
which plan owner would have to absorb it, and what could not be settled from the packet alone.
Structured counterparts: `impact-register.json`, `manager-coverage.json`,
`candidate-command-delta.json`, `candidate-wiring-delta.json`, `candidate-dry-delta.json`.

## What this concept's shape pressed on

Stack treats Settings as a **route**: home, category, manager and detail are pushed columns, depth is
kinetic, and the column behind recedes rather than disappearing. Developer-tooling managers were assigned
here, which is where the interesting pressure came from.

### 1. Skills, Plugins and Tools are three lifecycles, not one list

Skills are *installed*. Plugins are *loaded*. Tools are *exposed*. The recurring idea in the tool
inventory is a funnel: installed → enabled → available → selected for a turn → actually invoked. Five
different numbers that a single "extensions" list cannot express, and the funnel is the only honest way
to answer "why did the model not use this tool".

*Owner action:* Skills, Plugins and Tools should keep separate managers and agree on the funnel's five
counts as shared vocabulary.

### 2. MCP — requested versus negotiated protocol is the whole story

An MCP server carries transport, requested protocol version, negotiated protocol version, approval mode,
scope and exposure counts. When requested and negotiated differ, everything downstream — which tools
appear, which resources are readable — follows from that one line. Stack renders it as a row, not a
tooltip.

*Owner action:* the MCP owner should make negotiated protocol a stored field, not a log line.

### 3. Commands & Shortcuts — a dry run is part of the command, not a debug feature

A custom command without a dry run is a loaded gun with a friendly label. Binding conflicts are the same
shape: the recorder must report the conflict at record time, not at press time.

*Owner action:* the Commands owner should require `dry_run` on every custom command definition, and the
UI Command Catalog should treat `cmd.commands.custom.dry_run` as mandatory rather than optional.

### 4. Terminal — a profile is a resolved environment, not a shell name

The terminal manager renders inherited-versus-explicit values for shell, font, cursor, copy/paste and
working directory, with a live preview. "Inherited from the system" and "defined by the project" are
different sources with different override rules, and a settings inventory that stores only the final
string cannot show either.

## Owners this concept could not satisfy from the packet

- **Automated Testing owner.** Stack surfaces the last test run as a diagnostic log; the run model
  itself belongs to Testing.
- **Formatters owner.** Per-language overrides are rendered, but precedence between project config,
  workspace config and PM defaults is not specified in the packet.

## Unresolved, in priority order

1. Precedence order for formatter configuration between project, workspace and PM defaults.
2. Whether a plugin may register a manager module, and if so under whose insertion contract.
3. Whether tool exposure counts are per-thread or per-project.

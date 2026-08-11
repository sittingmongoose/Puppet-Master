# Opus 5 — Puppet Master Settings redesign concepts

Four interactive concepts for the Settings redesign, built for the settings bakeoff.
Nothing here is ranked and no concept is recommended.

## The four concepts

Each concept answers a different question — *what is a setting addressed by?* — and that
answer drives the home, the navigation, the disclosure model and the motion. They are not
one design in four skins.

| Concept | Thesis | Addressed by | Navigation | Managers built in full |
|---|---|---|---|---|
| **Opus 5 — Atlas** | Settings is a **place** | its location | Sticky outline tree over a continuous document | Provider · Context & Instructions · Terminal |
| **Opus 5 — Console** | Settings is a **question** | its name or intent | Right-margin index with a travelling marker | Provider · Personas · Skills, plugins & tools |
| **Opus 5 — Stack** | Settings is a **route** | its route | Miller columns; column two is the index for column three | Provider · Assistant memory · MCP |
| **Opus 5 — Ledger** | Settings is a **record** | its effective value | Contents with counts plus an edge mini-map | Provider · Crew · Media |

The provider/agent/model manager is built in all four. The other two differ per concept, so
the set covers eight dedicated managers instead of repeating the same two. A manager row that
belongs to another concept opens an honest card naming which concept builds it, with a link.

## Files

```text
concept-hub.json          Hub manifest (topic settings-redesign, model "Opus 5")
index.html                Comparison surface — four live previews plus shared controls
opus-5-atlas.html         The four concepts. They live at the folder root because the Hub
opus-5-console.html       validator resolves <script src> relative to the page's own
opus-5-stack.html         directory and refuses paths that escape it.
opus-5-ledger.html
concepts/                 Per-concept CSS and JS (layout, navigation, motion — not shared)
shared/                   Demo data, state, search, section maths, simulation, themes, shell
README.md FINDINGS.md IMPACT_REGISTER.json TEST_REPORT.md
```

### What is shared and what is not

Shared, so the four are comparable: the demo dataset, the semantic status vocabulary, the
search index and ranking, the section/scrollspy maths, the simulation layer, the eight theme
token sets, the fake Puppet Master shell, and the Concept Hub bridge.

Not shared, because this is a bakeoff: layout, navigation mechanism, disclosure model, how a
manager relates to an ordinary setting, and motion.

## Running

Through the shared Hub (preferred):

```bash
python3 Concepts/ConceptHub/server.py
```

Each page also opens standalone from the filesystem and carries its own review strip: theme,
app width, rail, Assistant panel, reduced motion, and a demo-state switcher.

Validate:

```bash
python3 "Concepts/ConceptHub/validate.py" "Concepts/settings-redesign-concepts/Opus 5"
```

> On a Windows host `python3` may resolve to the Microsoft Store stub. Use `python` there.

## Demo states

Every concept has a demo-state switcher in its review strip, so the required states are
inspectable rather than described:

- **Normal** — mixed provider health, eight open notices
- **Calm** — nothing needs attention, proving the home is not built around alarms
- **Several things need attention** — adds a failed catalogue refresh and an expired grant
- **Catalogues refreshing** — last-known-good rows stay in place while a refresh runs
- **Provider degraded** — authenticated but generation failing, with the diagnosis
- **Included usage exhausted** — provider-specific continuation becomes the decision

## Honest simulation

A standalone concept cannot sign in to a provider, install a CLI, buy usage or fetch
`models.dev`. Every such action returns a dated receipt marked **Simulated**, naming the call a
production build would make. Irreversible actions (reset everything, erase memory, discard a
memory note) return **Not available here** rather than pretending. Nothing claims to have
contacted a provider, spent money, or changed real state. The full list is in `FINDINGS.md` §4.

## Notes on portability

The active subcategory is a pure function of a section table and a scroll offset; the DOM is
measured only at explicit layout checkpoints, never per frame and never as the source of
semantic state. The jump tween is owned in JavaScript rather than delegated to CSS
`scroll-behavior`, so it always lands and reduced motion is a real branch. Long lists are
data-backed. Glass themes are meant to keep to a single `backdrop-filter` level; Console's docked
search-results panel was briefly nested inside the dock's own blur and has since been fixed to use
an opaque background in the two glass themes instead. See `FINDINGS.md` for the Slint translation
risks.

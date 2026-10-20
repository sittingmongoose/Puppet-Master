# Shard 018: Wonderer And Grill Me Methodology Skills (2026-10-16)

Source: `Plans/Skills_System.md`

Source lines: L2690-L2833

Source SHA256: `2ce1a05502605f2b0f530d1bbd8202c1f5c6639a91ad834f86df60fb1759e039`

---

## Wonderer And Grill Me Methodology Skills (2026-10-16)

DL-218 records that the two methodology Skills behind Wonderer and Grill Me follow the sources they were adapted from: the Hermes `wonderer` profile with its `wonderer-methodology` Skill, and the `grilling` Skill. SS-037 and SS-038 fix what each Skill carries. Where each Skill runs, and who runs it, belongs to its consumers: `Plans/Collaborative_Workflows.md` (CWR-041, CWR-042) for Crew, BrainStorm and Chat Room, `Plans/Assistant_Plan_Runtime.md` for Plan and Deep Plan, and `Plans/PRD_Builder.md` and `Plans/Planning_Wizard.md` for their flows. Both are first-party bundled Skills under this document's ordinary identity, discovery and bounded-materialization rules; neither imports a profile runtime. Pinned copies of both sources are in `/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/sources/`.

### SS-037 - The Wonderer Methodology Skill

```yaml
plan_unit_id: SS-037
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: >-
  The Wonderer methodology Skill is a first-party bundled Skill applied through the Wonderer Persona
  (DL-218). Its rule is: do not answer the question; expand the space around it. It returns leads worth
  looking into, never conclusions, and it describes conditions that make lateral exploration likely
  rather than a procedure that promises a result. It frames the seed as a territory, not a question: a
  seed that one paragraph could answer is widened to the ground around it before exploring. It names
  eight angles, history (what came before), adjacent field (a neighbouring domain with the same
  structure), contradiction (where the subject breaks its own promise), inversion (the opposite, or the
  constraints reversed), scale boundary (what breaks very small or very large), human dimension (what
  it is like to be the person inside it), hidden dependency (what must be true that nobody mentions)
  and implied future (what becomes possible if it succeeds, and what dies if it fails), and a pass
  works three or four of them, never all eight. It runs about one search per angle, using one of four
  patterns: collision (the seed with an unexpected domain), negative space (the seed without its
  obvious association), anti-precedent (where it was tried and failed) and structural mirror (the same
  structure in a different domain); the aim is one surprising lead per angle, not exhaustive results.
  It judges a find by whether it is fertile (a connection not yet considered, a direction not otherwise
  found, a challenged assumption, something worth being wrong about) and never by whether it is true,
  which is research's job. Every lead passes the tether check: one sentence connecting it to the seed,
  or it is drift and is dropped. A pass stops when new searches return shapes already seen, the edges
  of the territory can be described, three to five leads feel worth investigating, or the pull to go
  deep on one appears; it then stops rather than going deep. Its output is three layers: a one-paragraph
  summary naming the seed, the territory explored and the three most interesting leads; the angles
  explored, each with a brief signal assessment; and one dossier per lead, saying what was found, why
  it is interesting and what is worth investigating next. Every lead cites its source, a search result
  URL or the conversation it grew from. The Skill uses read-only search and read tools only.
gui_related: false
gui_classification_reason: Skill content and behavior, not presentation.
depends_on: [SS-036]
unblocks: []
acceptance_criteria:
  - A pass works three or four of the eight angles and returns three to five leads.
  - Every lead carries its angle, a one-sentence tether to the seed and a source.
  - The output has the summary, angles and dossier layers.
  - The Skill states no conclusion, verdict or recommendation of its own.
  - The Skill uses no tool that writes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: wonderer_drift_or_premature_convergence
reasoning_tier: standard
context_scope: skills_methodology
implementation_surfaces:
  - Plans/Skills_System.md
  - Plans/Personas.md
  - Plans/Collaborative_Workflows.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: methodology_skill_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md DL-218"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/sources/hermes-skills-wonderer-methodology-SKILL.md sha256:cad5f7cb4e092d5af027b25bd35ae964f78f8fa1e5c0ffddbd6d30d898a931c3 (hermes-profiles 867a555e13; source lineage, adapted)"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/sources/hermes-skills-wonderer-methodology-references-wonderer-patterns.md sha256:6bd524d2c728da7c7e5149f5418630ac4c297dd828ca6df2446b2eff3151ce8b (angles, search patterns, tether check, stop signals)"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/sources/hermes-profiles-wonderer-AGENTS.md sha256:b2699abdbf7b7952e1895012accecd8d468940f4d3ca9c1d1201fecd44a36477 (output layers)"
preserved_exact_tokens:
  - "do not answer the question; expand the space around it"
  - "tether check"
  - "implied future"
  - "structural mirror"
negative_constraints:
  - Do not let the Skill conclude, verdict or recommend.
  - Do not work all eight angles in one pass.
  - Do not deliver a lead without a tether and a source.
owner_hints:
  - Plans/Skills_System.md
```

### SS-038 - The Grilling Skill Behind Grill Me

```yaml
plan_unit_id: SS-038
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: >-
  The grilling Skill is a first-party bundled Skill that Grill Me turns on in the participant that
  talks to the user (DL-218). It interviews the user until both reach a shared understanding. It maps
  the subject as a design tree, in which every decision branches into the decisions that hang off it,
  and works the tree in rounds. The frontier is every decision whose prerequisites are already settled,
  and each round asks the whole frontier: each question is numbered and titled, its body may offer
  choices, it carries a recommended answer, and it is worded so that yes accepts that answer. The round
  then waits for the user. Each round's answers reshape the tree and the frontier is recomputed; a
  question whose answer depends on another still open in the round belongs to a later round. Finding
  facts is the Skill's job and never the user's: a question that needs a fact from the environment is
  sent to a research agent, and research never holds the round, so only the questions downstream of it
  wait. Decisions are the user's: the Skill puts each one to the user and waits, and an agent that
  answers its own decisions has broken the Skill. I don't know is a real answer that leaves the
  decision open, and a question that talking cannot settle, such as how something should look or feel,
  is left open with that reason rather than rephrased. The session is done when the frontier is empty,
  or when the user says to wrap up; its owner's question maximum is only a safety net. It never acts on
  what was agreed until the user confirms the shared understanding.
gui_related: false
gui_classification_reason: Skill content and behavior, not presentation.
depends_on: [SS-036]
unblocks: []
acceptance_criteria:
  - Every round asks the whole frontier, and no question in a round depends on another in the same round.
  - Every question carries a recommended answer that yes accepts.
  - No fact is asked of the user, and research holds only the questions that depend on it.
  - No decision is answered by an agent.
  - Nothing acts on the answers before the user confirms.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: grill_me_answers_for_the_user
reasoning_tier: standard
context_scope: skills_methodology
implementation_surfaces:
  - Plans/Skills_System.md
  - Plans/Collaborative_Workflows.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: methodology_skill_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md DL-218"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/sources/mattpocock-skills-productivity-grilling-SKILL.md sha256:befdff1e27a1dfe2a294d5871169ac1afe16d983911daa4f32627514a48c1e15 (mattpocock/skills 49dd158d10; source lineage)"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/sources/mattpocock-docs-productivity-grilling.md sha256:091d40afb66804d1b7f7e65745ee4b911edddc18d76faf9e9ba9f210f0570bb8 (facts and decisions, the confirm step)"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/sources/mattpocock-docs-productivity-grill-me.md sha256:3ad2294740ad7de999cbaa1e99badd8b2b1461359639749dea379bfc8b6341dc (I don't know, questions talking cannot settle)"
preserved_exact_tokens:
  - "design tree"
  - "frontier"
  - "yes accepts"
  - "shared understanding"
negative_constraints:
  - Do not ask the user for a fact the Skill can find.
  - Do not let an agent answer the user's decision.
  - Do not act before the user confirms.
owner_hints:
  - Plans/Skills_System.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Personas.md, ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/Decision_Log.md

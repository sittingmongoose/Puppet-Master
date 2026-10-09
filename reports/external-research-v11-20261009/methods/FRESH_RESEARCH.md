# Fresh research: four runnable workflow candidates for ER11

**Scope.** I read only sections 1, 5, 6, 7 and 8 of the named BRIEF. I did not inspect candidate jobs, evaluator outputs, or ER10 run history. The novelty comparisons below are against the supplied M01–M16 menu; root owns the final ER10 novelty mapping and recipe freeze. These are proposals, not scored results.

## Common matched-block wrapper

Keep the case, brief, model/provider, effort, tools, final obligations, investigator count, and total budget fixed within each pair. Use a capable control with the same parallelism and a realistic 60–75 minute topic budget. Freeze the recipe, source/date rules, output contract, and any query/call ceiling before starting. Keep every arm’s full external-discovery scope and final deliverable intact. Score the full brief, not source count or citation count alone.

## 1. Analogical-outline interviews

**Research/code basis.** STORM first inspects related-topic article structures, derives distinct research perspectives, then conducts grounded multi-turn question/answer conversations in which each answer informs later questions. Its FreshWiki evaluation reported higher outline coverage and organization than an outline-driven RAG baseline, and warned about source-bias transfer and invented connections. The official implementation exposes modular search retrievers and a research/outline pipeline. See the source register for the exact paper and package versions.

**M01–M16 distinction.** Closest to M15 (parallel scouts) and M16 (shared discovery). The intervention is not just concurrent roles: related-topic structures seed non-overlapping inquiry lenses, and each next question is selected after reading the prior grounded answer. This changes the query-generation state transition.

**Runnable matched pair.**

- **Control:** Give the same brief to four investigators. Let them search in parallel, follow leads, and return cited findings plus unresolved questions; one synthesizer assembles the same complete deliverable.
- **Treatment:** First retrieve two well-established analogous topics/workflows and extract their section headings or feature taxonomies. From those, define three non-overlapping inquiry lenses plus one “basic facts and user obligations” lens. For each lens, run at most three turns: ask one concrete question, retrieve and cite primary evidence, answer it, then ask one follow-up that depends on that answer. Keep a shared source log, but do not let one lens silently replace another. Finish with a coverage map from every brief obligation to lens, cited finding, or unresolved state; synthesize the required deliverable from that map.
- Match four people/agent slots, total search budget, and finalizer between arms. In the control, investigators may follow leads freely; treatment’s only added rules are the analogue-derived lenses and answer-conditioned follow-ups.

**Risks:** Analogies can import irrelevant categories; lens assignments can miss user-specific obligations; repeated perspectives can create an illusion of breadth; search-result bias or a false relation between unrelated facts can contaminate the outline. Retain the obligation map and flag any analogy-derived category without direct evidence.

## 2. Relevance-gated question retrieval

**Research/code basis.** PaperQA2’s reported tasks include full-text retrieval, cited synthesis, and contradiction detection. Its documented workflow generates paper-search queries, ranks passages for each evidence question, creates scored/contextual summaries, and answers from selected summaries; an agent can choose narrower or broader follow-up queries. The current maintained package supports PDFs, text, office files and code, so applying its retrieval loop to web sources is a workflow adaptation, not a claim that its package directly solves general web research.

**M01–M16 distinction.** Closest to M03 (progressive navigation) and M10 (evidence-before-proposal). This method’s intervention is a question-indexed retrieval queue with passage scoring and selective reformulation; it is not source/code navigation and it does not merely delay proposing an answer until after gathering evidence.

**Runnable matched pair.**

- **Control:** In parallel, prepare a fixed set of eight broad, brief-derived searches. Collect and read results under the same total time/source ceiling; investigators may use ordinary follow-up search. Synthesize the full required output.
- **Treatment:** Convert the brief’s obligations into 6–10 atomic research questions before drafting proposals. For each, search externally, collect up to ten candidate passages, score each 1–5 for whether it answers that exact question and scope, then write a short evidence card containing the claim, exact source locator/date, applicability qualifier, and counterevidence. Keep only the best three cards per question in the working context. Re-query only questions with no usable card or a missing condition; derive that query from the missing condition. Draft from the selected cards, marking unresolved questions explicitly.
- Hold question count ceiling, search budget, investigator capacity and finalizer equal. The measured treatment effect is the question-specific rank/summarize/reformulate loop.

**Risks:** A relevance score can reward keyword overlap rather than applicability; short summaries can drop exceptions; fixed question atoms can exclude useful alternatives; a high-ranking source can be wrong or stale. PaperQA2’s scientific-document focus means web adaptation needs explicit source-authority and version checks.

## 3. Entity-community roll-up

**Research/code basis.** Microsoft’s GraphRAG paper builds an entity/relationship graph, summarizes groups of related entities, answers global questions by generating partial answers from community summaries and reducing them, and supports local entity-neighborhood queries. The official repository is actively releasing; the indexed release at research time is v3.3.0.

**M01–M16 distinction.** Closest to M14 (semantic-set rendering) and M16 (shared discovery). It changes the corpus representation and synthesis path: source-backed relations are clustered into emergent communities, then summarized bottom-up and reduced. It does not merely render the same result set semantically or share a flat research log.

**Runnable component pair.** Use this as a declared synthesis-topology comparison: both arms first conduct the same frozen external search phase and receive the same source packet. Do not call this an independent full-discovery comparison.

- **Control:** Give the frozen sources and source list to a competent parallel summarizer; have it synthesize directly from the flat packet and reconcile overlaps.
- **Treatment:** Extract entity–relation–entity records from every source, each carrying source ID, date/version, and any condition. Merge aliases only with evidence. Group the graph into 3–5 topical communities. For each community, write a cited report with its main mechanisms, alternatives, disagreements and limits. Answer the task’s global question by combining those community reports; then run a local-neighborhood check for each named product/mechanism in the final deliverable and attach the supporting source IDs. Preserve full source records outside the summaries.
- Give both arms the identical source packet, model, investigator/finalizer count, time and output contract. Graph extraction and the two-level synthesis are the treatment.

**Risks:** Entity extraction or alias merging can invent edges; clustering can combine superficially similar but inapplicable findings; community summaries can erase exceptions; graph indexing can cost more than it saves on small source sets. GraphRAG’s strongest reported use is corpus-wide sensemaking, not product ranking, so keep the local checks and treat the comparison as a component result.

## 4. Parent–child evidence-state search

**Research/code basis.** IGRPO (arXiv v2, October 2026) allocates a fixed search-rollout budget by assigning larger expansion probability to intermediate nodes with greater answer-likelihood information gain. Its official code is a research implementation for training search agents, has no tagged release, and is not itself a ready-made production research workflow. The recipe below adapts its branch-allocation topology to brief-relevant evidence-state changes; it does not reproduce its learned reward or report its benchmark gains as product evidence.

**M01–M16 distinction.** Closest to M07 (critical-first) and M15 (parallel scouts). M07 prioritizes critical work up front; this method revises which branch gets the next search slot after observing evidence. It is not a static priority list or a wider parallel swarm.

**Runnable matched pair.**

- **Control:** Before searching, write six brief-derived queries and distribute them across the same number of investigators. Run them in parallel under the same total search/read budget; ordinary follow-up is allowed, but do not transfer unused slots based on intermediate findings.
- **Treatment:** Start with 4–6 unresolved propositions that could change the recommendation, plan comparison, or applicability. Mark each as supported, refuted, conditional, or unknown. Create three initial search branches, each tied to one proposition or a distinct countercase. After each retrieval, update the status vector and record new conditions, options and duplicate evidence. Score the branch’s latest expansion: +4 if a core proposition changes status, +2 per new sourced applicability condition (cap two), +2 for a new viable alternative, −2 for a duplicate, all divided by minutes spent. Give the next search slot to the highest positive score; preserve one slot for the best unresolved countercase. Stop after two consecutive zero-change expansions or when the shared budget is exhausted; then complete the full deliverable with the frozen status vector and citations.
- Match the six-query ceiling, team size and total budget. The only treatment difference is that later query slots move to branches whose observed evidence has changed consequential states.

**Risks:** The hand-scored value can favor dramatic findings and underweight quiet but mandatory obligations; estimates can be self-confirming; correlated sources can look like independent progress; a zero-change stop can miss an unsearched countercase. Require a source/applicability check for every status transition and retain one countercase slot.

## Novelty and evidence limits

All four mechanisms are algorithmically specified beyond a label change. Methods 1, 2 and 4 alter how search questions or search slots evolve; method 3 alters how a frozen corpus is represented and synthesized. Methods 1, 3 and 4 each have a distinct topology; methods 1–4 are candidates against the supplied M01–M16 menu, not claims about unseen ER10 history. PaperQA2 and GraphRAG have recent tagged releases. STORM’s package is pinned to v1.1.1 (last release observed September 2025), and IGRPO has no tagged release; pin and disclose those lower-confidence maintenance states if selecting them. None of the papers proves these adaptations improve Puppet Master’s full brief task.

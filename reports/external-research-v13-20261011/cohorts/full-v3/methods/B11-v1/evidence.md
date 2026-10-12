# Primary evidence: B11-v1

Method-development material for root/researchers. No candidate case answers or source pack. Exact bodies are accessible locally; public export defaults to these zero-quote authored capsules.

- **Governing source:** [co-storm-paper.pdf](https://aclanthology.org/2024.emnlp-main.554.pdf). PDF page 5 (printed p.9921), §3.5, topic-relevance/query-dissimilarity reranking and uncited-source question generation; §5.4 for contextual ablations.
  The moderator draws questions from uncited retrieval material, favoring relevance to the topic and distance from the preceding query. The complete paper studies a multi-agent learning system. B11 transfers only the evidence-seeded question pivot; its manual two-pivot software-planning effect has not been tested.
  Capture: `ER13_RUNTIME/methods/B11-v1/primary-evidence/co-storm-paper.pdf`; SHA-256 `4017172954b1b5cb04745cc35b34eafdc9e739c4e456acfd60b9175e0f150d3d`.
  ACL 2024 materials: CC-BY-4.0 per https://aclanthology.org/faq/copyright/; attribute authors/title/DOI; third-party exceptions retained.

- **Governing source:** [storm-co_storm_agents.py](https://github.com/stanford-oval/storm/blob/fb951af7744dab086e34962e9bc6fe878e145f83/knowledge_storm/collaborative_storm/modules/co_storm_agents.py). Moderator, lines 159-313; _get_conv_turn_unused_information lines 190-246, _get_sorted_unused_snippets lines 248-283.
  The pinned code excludes already cited information, gates candidate snippets by claim similarity, scores novelty against queries and cited snippets, merges recent-turn lists, and passes them to question generation. Its ranking differs from the simpler paper formula. B11 uses an explicit qualitative eligibility test, not those embeddings, thresholds or exact numerical ranking.
  Capture: `ER13_RUNTIME/methods/B11-v1/primary-evidence/storm-co_storm_agents.py`; SHA-256 `bc8d1e50370912c6cc7359142fb6e3a439d963aed5f4dcb0054165458c9fe6b9`.
  MIT; original notice retained in storm-LICENSE.

- **Governing source:** [storm-grounded_question_generation.py](https://github.com/stanford-oval/storm/blob/fb951af7744dab086e34962e9bc6fe878e145f83/knowledge_storm/collaborative_storm/modules/grounded_question_generation.py). GroundedQuestionGeneration lines 55-72; GroundedQuestionGenerationModule.forward lines 81-113.
  Question generation consumes unused information plus topic and existing knowledge context, asks for a grounded new question, and keeps evidence association. B11 implements that information flow inside its existing investigator; no moderator context, DSPy integration or style-polishing call is added.
  Capture: `ER13_RUNTIME/methods/B11-v1/primary-evidence/storm-grounded_question_generation.py`; SHA-256 `f5613bc6c3dd16202337f4a52615e4008369399d5102babf352d0b6cb529ecd0`.
  MIT; original notice retained in storm-LICENSE.

Source mechanism exists and was inspected; ER13 intervention efficacy/compliance/quality is wholly unexecuted.

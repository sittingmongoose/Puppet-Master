# Sources, provenance and applicability

Access UTC for the research below: 2026-10-10, approximately 03:52-03:54 UTC; exact per-source second is not retained. No performance figure is transferred to A8.

1. **Primary current methodological anchor:** Dasha Metropolitansky and Jonathan Larson, *Towards Effective Extraction and Evaluation of Factual Claims*, ACL 2025, July 2025, pp. 6996-7045, DOI 10.18653/v1/2025.acl-long.348. [Official paper](https://aclanthology.org/2025.acl-long.348.pdf), sections 2.3 and 3.1-3.4 and Appendix I; [metadata](https://aclanthology.org/2025.acl-long.348/). Claimify addresses ambiguity and preservation of context during claim extraction. Appendix I reports entailment-review mistakes including loss of multi-part context. This supports treating extraction/referent resolution as a potential failure source; it does not validate SCW or establish topic-report efficiency. A8's pair and correction rule are an original adaptation.
2. **Primary contrastive antecedent:** Tal Schuster, Adam Fisch and Regina Barzilay, *Get Your Vitamin C! Robust Fact Verification with Contrastive Evidence*, NAACL 2021, June 2021, pp. 624-643, DOI 10.18653/v1/2021.naacl-main.52. [Official abstract and metadata](https://aclanthology.org/2021.naacl-main.52/). The benchmark uses closely matched evidence pairs whose claim-support relationship differs. A8 instead keeps authentic evidence fixed and varies a claim's scope. This is inspiration, not replication, training or an inference that A8 will reproduce published results.
3. **Historical methodological context:** Marco Tulio Ribeiro et al., *Beyond Accuracy: Behavioral Testing of NLP Models with CheckList*, ACL 2020, July 2020, pp. 4902-4912, DOI 10.18653/v1/2020.acl-main.442. [Official abstract and metadata](https://aclanthology.org/2020.acl-main.442/). Behavioral tests can isolate specific capabilities instead of relying only on aggregate accuracy. This motivates observable semantic contrasts; A8 installs no CheckList software.

Search also surfaced FActScore/SAFE and a Microsoft author blog; those are discovery leads, not implementation dependencies or evidence of A8 effectiveness. No repository or library was installed, run or represented as inspected. This is clearly labeled an original prompt protocol, informed by the primary sources above, rather than a claim of a validated current implementation.

## Pinned local inputs

- Canonical allowed reference read: ER12_RUNTIME
- ER12 helper copy: ER12_RUNTIME/helpers/er11/REFERENCE_WORKFLOW.md. Its SHA-256 was inspected and matches the reusable file: a405068df1385307372f7b04613b5e441fa22a0f513bcf5db52560d75fd09c7a. No linked files were opened.
- A8 section of ER12_RUNTIME/packet/ER12_T3_EXECUTE_HANDOFF.md, saved as handoff_A8_excerpt.md. Its excerpt hash is in freeze.json. No case material was read. Initial first-240-lines request was overbroad; see method.md and freeze.json.
- Current workspace AGENTS.md was read. No product Plans were needed or edited for this isolated external assignment. The user prohibits contacting other arms and limits writes to A8, so no mailbox registration/contact or repository edits occurred.

## Conditions

Useful when a complete research draft contains consequential near-neighbor scopes and navigable primary documentation can discriminate them. Requires context-preserving extraction and actual source applicability checks. Not a proof system: a language model supplies the relation and may err. Cross-document reasoning is permitted only with explicit identity/condition joins. Software source may govern only when version, component and operation match. Genuine temporal conflicts or inaccessible docs remain unresolved; cached or currently navigable bytes must retain version/access identity. Broad exploratory novelty, missing whole alternatives and nonsemantic reasoning mistakes still require ordinary R0 review. Zero valid contrasts is a recorded nonopportunity, not evidence of efficacy.

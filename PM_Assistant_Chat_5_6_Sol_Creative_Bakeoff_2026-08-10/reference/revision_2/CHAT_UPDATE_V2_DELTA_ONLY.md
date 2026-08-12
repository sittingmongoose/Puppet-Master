# Revision 2 Delta — Use with the Original Assistant Chat Update Packet

Apply this delta on top of the first Assistant Chat update packet.

1. **Repair functionality first.** Pinning, popovers, resizers, selectors, questions, and demo actions must work in every relevant concept, not only one showcase. No dead controls, pointer-blocking overlays, console errors, stuck resizers, clipped text, or focus traps.
2. **Pinned history must not overlay or crush Chat.** Implement closed, transient peek, pinned compact, and pinned full states. A pinned surface is a sibling workspace region. When full history will violate the Chat readability floor, collapse it to a compact pinned form.
3. **Artifacts open to the left outside Chat.** Demonstrate file, diff, image/test, and report artifacts with loading/switch/error/close states. Preserve transcript scroll and composer draft. Define history/artifact coexistence.
4. **Do not reuse one question renderer everywhere.** Share semantic state, but give each concept its own question composition and motion language. Add deterministic question triggers for prepare/open/select/next/error/skip/cancel/submit.
5. **Compact Goal/Todo/subagent/diff/tool activity.** Collapsed state must remain small; details expand on demand. Explore materially different combinations across concepts. Counts update in place and completed activity remains inspectable.
6. **Use the supplied videos as real inspiration.** One demonstrates a status pill morphing into a stepwise questionnaire and back into a submitting pill. The other demonstrates one evolving activity region that compresses thinking/search/import/edit/generate phases into a final `tools used` index with group-specific expansion.
7. **Substantially improve demo content.** Include a realistic 14+ turn thread, 18+ history rows, a Goal, 8+ Todos, 3+ subagents, tool/search/read/browser/test activity, approvals, a collision, a multi-file diff, four artifacts, verification, and elapsed time.
8. **Add a deterministic demo/test controller.** It may live in the harness, not the production toolbar. It must trigger history, questions, Goals, Todos, agents, tools, diffs, artifacts, warnings, cross-thread events, and reset.
9. **Motion is required.** Author concept-specific motion for pinning, questions, activity compression, compact work, Goal state, artifacts, and diffs. Keep it Slint-portable and provide reduced motion.
10. **Extend automated tests.** Assert geometry, no overlap, readability floor, artifact-left placement, state persistence, question semantics, compact work expansion, keyboard/Escape/outside click, deterministic reset, all themes/widths, reduced motion, and zero console errors.

Use the complete Revision 2 packet for exact details.

# ConceptHub validation gate — independent run, 2026-08-17

CONCEPT_RULES.md:12 requires this command before finishing concept work.

## Working-tree validator: python3 Concepts/ConceptHub/validate.py Concepts/usage-concepts/QwenUsageConcept
```
Concept validation failed (24 issues):
- temporary test/verification artifacts must be deleted before finishing: verification/
- u1-signal: page must visibly label the model with data-concept-model="Qwen"
- u1-signal: standard pages must support pm-concept-ready and pm-concept-state
- u2-stream: page must visibly label the model with data-concept-model="Qwen"
- u2-stream: standard pages must support pm-concept-ready and pm-concept-state
- u3-cockpit: page must visibly label the model with data-concept-model="Qwen"
- u3-cockpit: standard pages must support pm-concept-ready and pm-concept-state
- u4-focus: page must visibly label the model with data-concept-model="Qwen"
- u4-focus: standard pages must support pm-concept-ready and pm-concept-state
- u5-cozy-console: page must visibly label the model with data-concept-model="Qwen"
- u5-cozy-console: standard pages must support pm-concept-ready and pm-concept-state
- u6-workspace: page must visibly label the model with data-concept-model="Qwen"
- u6-workspace: standard pages must support pm-concept-ready and pm-concept-state
- u7-board: page must visibly label the model with data-concept-model="Qwen"
- u7-board: standard pages must support pm-concept-ready and pm-concept-state
- u8-canvas: page must visibly label the model with data-concept-model="Qwen"
- u8-canvas: standard pages must support pm-concept-ready and pm-concept-state
- u9-deck: page must visibly label the model with data-concept-model="Qwen"
- u9-deck: standard pages must support pm-concept-ready and pm-concept-state
- u10-prism: page must visibly label the model with data-concept-model="Qwen"
- u10-prism: standard pages must support pm-concept-ready and pm-concept-state
- u11-prism: page must visibly label the model with data-concept-model="Qwen"
- u11-prism: standard pages must support pm-concept-ready and pm-concept-state
- workspace: page must visibly label the model with data-concept-model="Qwen"
exit=1
```

## Committed (HEAD) validator — same result, so not a working-tree artifact
```
Concept validation failed (24 issues):
- temporary test/verification artifacts must be deleted before finishing: verification/
- u1-signal: page must visibly label the model with data-concept-model="Qwen"
...
```

## Marker census in the selected concept
```
data-concept-model occurrences in u11-prism.html: 0
pm-concept-ready/state occurrences in u11-prism.html: 0
folder-wide data-concept-model occurrences: Concepts/usage-concepts/QwenUsageConcept/index.html:0 Concepts/usage-concepts/QwenUsageConcept/u10-prism.html:0 Concepts/usage-concepts/QwenUsageConcept/u9-deck.html:0 Concepts/usage-concepts/QwenUsageConcept/u8-canvas.html:0 Concepts/usage-concepts/QwenUsageConcept/u7-board.html:0 Concepts/usage-concepts/QwenUsageConcept/u2-stream.html:0 Concepts/usage-concepts/QwenUsageConcept/u5-cozy-console.html:0 Concepts/usage-concepts/QwenUsageConcept/u1-signal.html:0 Concepts/usage-concepts/QwenUsageConcept/u4-focus.html:0 Concepts/usage-concepts/QwenUsageConcept/u6-workspace.html:0 Concepts/usage-concepts/QwenUsageConcept/u3-cockpit.html:0 Concepts/usage-concepts/QwenUsageConcept/u11-prism.html:0
```

## Control — two other Qwen concept folders under the same gate
```
Concepts/rail-concepts/QwenRailConcepts       PASS
Concepts/Icon-Concepts/Qwenicon               PASS
```

Conclusion: the gate fails 24 issues on both validators; the selected concept u11-prism.html
carries neither required marker; two sibling Qwen concept folders pass the identical gate.

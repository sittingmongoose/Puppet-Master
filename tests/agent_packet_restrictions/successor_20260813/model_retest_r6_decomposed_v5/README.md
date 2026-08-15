# R6-v5 evidence-directed semantic/direct split

Disposable frozen-snapshot experiment only. R6-v5 preserves R6-v4's 14 passing decision units and four failures. It reruns only the three failed semantic decisions, routes the exact ledger phase through a deterministic direct-fact extractor, and invalidates downstream artifacts whose B-side bytes change.

No same-revision retry or replacement is permitted. This lane makes no current-Plans, production, release, safety, or compile-authority claim.

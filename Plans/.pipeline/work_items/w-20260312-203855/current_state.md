Reconciliation Planner blocked
run_id: r-20260312-203855-run-024
exact blockers:
- `batch-3-models-provider-precedence` is not repairable within reconciliation planning alone: the live doc duplicates both the owner heading `## Provider/model precedence and settings resolution` and the first `### Three-axis settings model` block, while part of the cov-167 obligation lives in the untitled owner-section preamble before any unique subheading.
- Because of that layout, no bounded reconciliation split can preserve the full fidelity-recovery obligations for cov-152 and cov-167 and also become safely packetizable with the current mutation shapes (`heading:replace_section`, `heading:insert_after`, `json_object_path:replace_section`).
next required stage: Reconciliation Planner

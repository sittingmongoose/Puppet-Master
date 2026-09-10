"""Cross-field Browser owner constraints; static validation only."""


def browser_program_semantic_failures(definition, value):
    if not isinstance(value, dict):
        return []
    definition = value.get("record_kind", definition)
    failures = []
    if definition == "representation_query_result":
        coverage = value.get("coverage", {})
        total, covered = coverage.get("frames_total"), coverage.get("frames_covered")
        if isinstance(total, int) and isinstance(covered, int) and covered > total:
            failures.append("representation_coverage_bounds")
        if coverage.get("status") == "complete" and (
            total != covered or coverage.get("omission_codes") or coverage.get("budget_exhausted")
            or coverage.get("synthetic_id_collisions")
        ):
            failures.append("representation_false_complete")
        if value.get("invalidated") != (coverage.get("status") == "stale_rejected"):
            failures.append("representation_invalidation_coverage_mismatch")
        generation = value.get("subject", {}).get("page_generation")
        if value.get("base_index_generation") != generation:
            failures.append("representation_base_generation_mismatch")
    return failures

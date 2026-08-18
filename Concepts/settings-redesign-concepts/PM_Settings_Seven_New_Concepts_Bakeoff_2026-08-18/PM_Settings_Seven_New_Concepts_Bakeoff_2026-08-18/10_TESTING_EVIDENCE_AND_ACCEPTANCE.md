# Testing, Evidence, and Acceptance

## Required test layers

Use deterministic automated probes plus direct visual inspection.

1. Static/code checks, including `tools/validate_seven_new_concepts.py`.
2. ConceptHub validation.
3. Interaction smoke tests.
4. Search-route exactness tests.
5. Manager-route isolation tests.
6. State/persistence tests.
7. Responsive/theme matrix.
8. Performance/hydration checks.
9. Independent visual audit.

Run through ConceptHub using an OS-assigned port, isolated browser profile/output folder, and only processes started by this run. Delete temporary screenshots, profiles, traces, recordings, coverage, and results before completion; preserve only requested reports/evidence summaries.

## Matrix

Every new concept × all eight themes × widths 760, 900, 1280, 1700, 2200, 2500:

- zero console/page errors;
- no true horizontal overflow;
- no clipped text, controls, menus, popovers, drawers, or tooltips;
- no squashed titles or unreadable line lengths;
- no Activity Bar/side-panel overlap;
- custom scrollbar usable;
- popup collision handling correct;
- keyboard, pointer, Back, Close, and Escape coherent;
- reduced motion retains meaning;
- Home destinations visible without a CTA wall.

## Search exactness

For every rendered search result, click/open by immutable result ID and verify the exact expected domain, page, manager, object, section, row, focus target, and locator highlight. Include grouped results, duplicate labels, multiple providers, unavailable items, typo results, and query restoration after Back.

## Manager isolation

Crawl every manager route in every new concept. Fail if a route:

- opens another concept page;
- uses another concept's visible shell/renderer;
- loses Project/search/Back/Close context;
- has no exit path;
- is decorative or dead;
- is missing from concept-hub navigation or coverage evidence.

## Inventory and scale

Prove all current inventory IDs are indexed and routable. Separately stress at least 2,000 records and large provider/tool/server catalogs without replacing actual product data. Verify search does not instantiate all managers and list rendering is bounded/virtualized.

## Completion gate

Do not claim completion unless:

- concepts 01–04 remain unmodified in visible behavior;
- concepts 05–11 are present and differentiated;
- every new concept has complete manager coverage;
- no `shared_grammar` coverage substitution remains;
- all routes stay within the concept;
- universal search exactness passes;
- project-only behavior is visible;
- all required reports exist and validate;
- known defects and limitations are explicitly reported.

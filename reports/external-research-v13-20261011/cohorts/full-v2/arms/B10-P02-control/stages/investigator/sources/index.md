# Source index

Evidence records with stable IDs are in [../source-map.json](../source-map.json). Each record holds exact URL, version/commit where applicable, access UTC, locator, observed operation, governing condition/default/exception and applicability. Sources are official documentation, standards, repository artifacts or issue history. No full web page dumps were retained.

## Authoring, outputs and import

- [S01 Quarto book](https://quarto.org/docs/books/) — multi-format book outputs and HTML search.
- [S02 Quarto website search](https://quarto.org/docs/websites/website-search.html) — local index default, hosted option.
- [S03 MkDocs offline deployment](https://www.mkdocs.org/user-guide/deploying-your-docs/) — file:// search caveat and bundled assets; [S18 MkDocs 1.6.1 search-index code](https://github.com/mkdocs/mkdocs/blob/1.6.1/mkdocs/contrib/search/search_index.py).
- [S04 Pandoc manual](https://pandoc.org/MANUAL.html) — conversion loss and DOCX styles.
- [S13 Pandoc 3.12.1 DOCX source](https://github.com/jgm/pandoc/blob/3.12.1/src/Text/Pandoc/Readers/Docx.hs), [S14 tests](https://github.com/jgm/pandoc/blob/3.12.1/test/Tests/Readers/Docx.hs), [S15 release notes](https://github.com/jgm/pandoc/releases/tag/3.12.1), and [S16 caller/registry](https://github.com/jgm/pandoc/blob/3.12.1/src/Text/Pandoc/Readers.hs).

## Offline data and updates

- [S09 MDN service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) — secure context, selected caches, update waits.
- [S10 MDN IndexedDB use](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB), [S17 IndexedDB limits](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology), and [S11 browser storage eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).
- [S12 Quarto dashboard search issue #14756](https://github.com/quarto-dev/quarto-cli/issues/14756), observed open; dashboard-specific.

## Accessibility and handout output

- [S05 Quarto PDF accessibility](https://quarto.org/docs/output-formats/pdf-basics.html).
- [S06 WCAG 2.2](https://www.w3.org/TR/wcag/) (normative), [S07 WAI images tutorial](https://www.w3.org/WAI/tutorials/images/), [S08 keyboard APG](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) (informative).

Access observations were recorded at approximately 2026-10-12 00:39:58–00:42:48 UTC. Repository artifacts use immutable release tags; tests were inspected, not executed.

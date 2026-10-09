# Source index — ER11 A-M07-A research

This index navigates bounded primary-source notes captured for pre-plan discovery. Exact bounded excerpts with per-excerpt SHA-256 digests are in [exact-excerpts.json](exact-excerpts.json). Source IDs are immutable within this record. ../source-map.json records exact URLs, observed versions, exposed commits, locators, access times, and browser operations. Notes are paraphrase-first and retain evidence needed to reconstruct findings. A moving documentation URL must be recaptured under a new ID if its version/content changes; IDs are not silently rebound.

| ID | Primary source | Main evidence |
|---|---|---|
| [S01](S01-docusaurus-versioning.md) | [Docusaurus 3.10.2 versioning](https://docusaurus.io/docs/versioning) | Version-copy model, current/latest distinction, options, retention/archive guidance |
| [S02](S02-docusaurus-i18n-introduction.md) | [Docusaurus 3.10.2 i18n introduction](https://docusaurus.io/docs/i18n/introduction) | Translation workflow, Markdown files, source locations and non-goals |
| [S03](S03-docusaurus-i18n-tutorial.md) | [Docusaurus 3.10.2 i18n tutorial](https://docusaurus.io/docs/i18n/tutorial) | Locale routing/builds, translated docs and explicit heading IDs |
| [S04](S04-antora-descriptor.md) | [Antora 3.1 component version descriptor](https://docs.antora.org/antora/3.1/component-version-descriptor/) | Required name/version, repository/ref mapping and metadata semantics |
| [S05](S05-antora-distributed-versions.md) | [Antora 3.1 distributed component versions](https://docs.antora.org/antora/3.1/distributed-component-version/) | Aggregating repositories and duplicate/configuration hazards |
| [S06](S06-antora-origin-metadata.md) | [Antora 3.1 intrinsic page attributes](https://docs.antora.org/antora/3.1/page/intrinsic-attributes/) | Component/release and origin/ref/hash/source-path/edit metadata |
| [S07](S07-docsearch-records-and-facets.md) | [DocSearch required configuration](https://docsearch.algolia.com/docs/required-configuration/) | Passage anchors, record selectors, language/version fields and filters |
| [S08](S08-typesense-search-30.1.md) | [Typesense 30.1 Search API](https://typesense.org/docs/30.1/api/search.html) | Search/filter types, exact-match syntax, pagination and facets |
| [S09](S09-backstage-techdocs-source.md) | [Backstage TechDocs: creating and publishing](https://backstage.io/docs/features/techdocs/creating-and-publishing/) | Catalog association, docs-in-repo, MkDocs inputs and build constraints |
| [S10](S10-backstage-techdocs-cicd.md) | [Backstage TechDocs: CI/CD](https://backstage.io/docs/features/techdocs/configuring-ci-cd/) | Static output, storage publisher, etag and skip-if-unchanged |
| [S11](S11-docusaurus-i18n-version-fix.md) | [Docusaurus PR 10875 diff](https://github.com/facebook/docusaurus/pull/10875/files) | Regression symptom, CLI code change, unit test and merge commit |
| [S12](S12-docusaurus-380-release.md) | [Docusaurus v3.8.0 release](https://github.com/facebook/docusaurus/releases/tag/v3.8.0) | Release date and inclusion of PR 10875 |

## Use and limits

- Evidence supports mechanism behavior and design constraints; it is not a benchmark on the three target codebases.
- No local application, private service, cloud account, pricing page, or implementation runtime was inspected. Usage/billing were not observed.
- Public product documentation establishes that versioning, locale metadata and origin metadata can be represented; it does not establish that a product automatically detects semantic contradictions or proves an AI answer. The draft treats contradiction surfacing and exact quotation as application behavior to design and validate.
- Timestamps in source-map.json are UTC observations. If a vendor page did not expose an immutable source commit, that absence is recorded instead of guessed. A later check must allocate a new source ID.

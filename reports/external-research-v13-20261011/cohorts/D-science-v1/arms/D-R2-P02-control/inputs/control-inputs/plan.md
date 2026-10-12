# D-P06 — Provisional design for review

The provisional host provides an extension with an attachment handle, block configuration, and a temporary work directory. The extension returns preview markup and extracted text over a message channel. The host would display the markup in an embedded view and index the text under the note ID. Research whether this boundary adequately limits capability and preserves the requested provenance, including active content and indirect file references.

A separate process would run each renderer with a timeout. On timeout, the host would kill it, display an error card, and remove its temporary directory. A shared cache would use input digest and extension identifier as its key. The draft assumes process termination establishes cleanup ownership and that matching identifiers preserve preview meaning across upgrades; both assumptions need governing evidence and alternatives.

Disabling an extension would hide new previews but retain old cache entries for quick restoration. Unavailable renderers would show their last preview with a badge. The plan needs to examine whether old extracted text should remain searchable and how users learn about potentially changed semantics or permissions.

Give retain/revise/reject/unresolved dispositions for capability transfer, output display, indexing, isolation, cache identity, and cleanup. Compare declarative output with richer executable rendering and identify conditional guarantees. Propose checks for a hung nested worker, active markup, stale cache reuse, uninstall, failed extraction, and cleanup during concurrent use. Report any executed checks with their exact sandbox scope; no future host or real notebook is assumed tested.

Complete all substantive research and planning obligations within a maximum of 60 elapsed minutes. Finish earlier when the complete output is ready. There is no minimum research duration, no requirement to consume the allowance, and no credit for waiting. The deadline includes arm-specific setup, provider queueing after admission, tools, native retries, handoffs, revision and delivery. Output quality is assessed independently of elapsed time.

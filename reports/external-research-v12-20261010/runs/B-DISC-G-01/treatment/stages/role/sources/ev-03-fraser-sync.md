# Evidence S3: Fraser differential synchronization

- URL: https://neil.fraser.name/writing/sync/
- Publisher: Neil Fraser (author paper page). Status: 200 OK. Retrieved: 2026-10-10 (UTC; exact time UNKNOWN).
- Locator: paper page, "by Neil Fraser, January 2009".

Verbatim excerpts (bounded):

- "Keeping two or more copies of the same document synchronized with each other in real-time is a complex challenge. This paper describes the differential synchronization algorithm. Differential synchronization offers scalability, fault-tolerance, and responsive collaborative editing across an unreliable network."
- Shadow cycle: "Client Text is diffed against the Common Shadow." ... "Client Text is copied over to Common Shadow." ... "The process now repeats symmetrically in the other direction."
- "Event passing is not naturally convergent."
- "Since each edit changes the location of subsequent edits, one lost edit may cause subsequent edits to be applied incorrectly, thus increasing the gap between the two versions."
- Three-way-merge critique: "This is a half-duplex system: as long as one is typing, no changes are arriving."

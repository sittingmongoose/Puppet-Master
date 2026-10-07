# S1 evidence — RFC 8493, The BagIt File Packaging Format (V1.0)

Provenance: https://www.rfc-editor.org/rfc/rfc8493.html — Informational RFC, Oct 2018, authors Kunze/Littman/Madden/Scancella/Adams. Retrieved 2026-10-07T18:29:47Z (HTTP 200, 63600 bytes fetched).

Bounded excerpts (section : quote/paraphrase):

- Abstract: "a set of hierarchical file layout conventions for storage and transfer of arbitrary digital content. A 'bag' has just enough structure to enclose descriptive metadata 'tags' and a file 'payload' but does not require knowledge of the payload's internal semantics."
- S1.3 terminology: complete = required elements + every payload file listed in a manifest + listed optional files present; valid = complete + fixity matches (see S3).
- S2.1 required elements: bagit.txt declaration, data/ payload directory, manifest-<algorithm>.txt payload manifest.
- S2.2 optional: tagmanifest-<algorithm>.txt (checksums over tag files incl. bag-info.txt), bag-info.txt metadata, fetch.txt, other tag files.
- S2.4 checksum algorithms: manifest names the algorithm; S4.2 example notes SHA-512 recommended over MD5.
- S3 complete bag: every required element present; every file in every tag manifest present; for 1.0, every payload file listed in EVERY payload manifest (older versions allowed listing in just one). Valid bag additionally requires checksum verification success.
- S2.2.3/S5.2–S5.3 fetch.txt: bag MAY ship with "holes" filled by fetching listed URLs; every fetch-listed file MUST be in every payload manifest; fetch MUST NOT list tag files; receivers must treat URLs as untrusted and must not trust reported sizes (monitor/abort on overrun; never use for allocation).
- S6.1.2 Windows/Unix naming: path separator SHOULD be translated as needed; receivers on physical media SHOULD expect either filesystem.
- S5.4: older checksum algorithms may detect transit corruption but not resist deliberate attack — algorithm choice matters for the threat model.

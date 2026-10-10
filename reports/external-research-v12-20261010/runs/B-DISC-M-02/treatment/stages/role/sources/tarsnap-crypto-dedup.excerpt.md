# Source evidence excerpt 3/4 — Tarsnap cryptography + deduplication explanation
URLs: https://www.tarsnap.com/crypto.html and https://www.tarsnap.com/deduplication-explanation.html
(Index pages design.html/technical.html/deduplication.html also fetched; substantive content is on the two pages above.)
Retrieved: 2026-10-10T04:38Z via web_fetch (Status 200; ~6KB and ~17KB, latter truncated; full text in harness tool-output store, not copied here).

Observed statements (crypto.html):
- "A 2048-bit RSA key used for encrypting session keys. All the data which the Tarsnap client sends to the server to store is encrypted with per-archive random AES-256 keys; those keys are encrypted with this RSA key and attached to the stored data." (RSAES-OAEP/MGF1/SHA256; AES-256 CTR with sequential nonces; fresh key per session so no key-nonce reuse.)
- "Two 256-bit HMAC-SHA256 keys used to generate names for blocks of data stored. Tarsnap uses the same reference-by-hash trick... using HMACs instead of raw SHA256 hashes prevents any information from leaking via the hashes." (One key for data blocks, one for archive names.)
- 256-bit HMAC-SHA256 key per data block against tampering (defense in depth past zlib decoding); 2048-bit RSA signing key + SHA256 Merkle tree for archive authenticity; three HMAC request-signing keys (write/read/delete) — "the only keys sent to the Tarsnap server".

Observed statements (deduplication-explanation.html):
- "Tarsnap deduplicates your data by: 1. Splitting it into chunks ('chunkification'). 2. Only uploading chunks that haven't been uploaded before. Each archive is expressed as a list of chunks."
- Wordification table shows: new archive reusing a word uploads only new words + archive list; deleting archive A prunes words 1,3; later archive D re-uploads "kittens" as word 6 — delete-then-re-add costs a re-upload ("We could have avoided that transfer by creating archive D before deleting archive A").
- Production notes: keep the chunk-hash list cached locally ("should be kept on the local system"); encrypt data client-side; encrypt chunk labels and archive lists too ("If an attacker saw that pets.txt had archive B: 4 2 5 and archive D: 2 4 6, they could still figure out...").
- Binary chunking: "Variable-sized chunks" + "Context-dependent splitting... the location of each split depends on the context (data). Retaining those benefits when dealing with binary data requires some complicated processing. Tarsnap's method... is outlined in section 2.1 of the presentation From bsdtar to tarsnap... The exact method is in the client source code, tar/multitape/chunkify.c (github link)." (Slides and source NOT retrieved — page budget.)
Applicability: directly evidences per-archive random data keys, HMAC-based opaque block naming, archive-as-chunk-list with client-side encrypted metadata, content-dependent variable chunking, and retention/GC interplay. No key-rotation procedure observed on these pages (loss-of-keys = loss-of-data is stated: "Without them, it is infeasible for anyone to either decrypt or create archives" — "Anyone includes you").

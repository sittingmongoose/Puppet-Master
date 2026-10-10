# Independent source evidence index

Exact version: rsync3.2.7 official tarball. All paths are relative to this assessment; no code was run.

- [P1 raw retrieval](evidence/independent/rsync-3.2.7.tar.gz) — [HTTP metadata and UTC/hash](evidence/independent/P1-retrieval.json); URL https://download.samba.org/pub/rsync/src/rsync-3.2.7.tar.gz; SHA256 `4e7d9d3f6ed10878c58c5fb724a67dacf4b6aac7340b13e488fb2dc41346f2bb`.
- [P2 raw retrieval](evidence/independent/live-rsync-man.html) — [HTTP metadata and UTC/hash](evidence/independent/P2-retrieval.json); URL https://download.samba.org/pub/rsync/rsync.1; SHA256 `9160de49f8f56f4905fbc4b9ee4e0ac347570865092abde0784f8713fad9e771`.
- [P3 raw retrieval](evidence/independent/rsync-FAQ.html) — [HTTP metadata and UTC/hash](evidence/independent/P3-retrieval.json); URL https://rsync.samba.org/FAQ.html; SHA256 `e4d420bee0f08edeba7eb49d9b90141721778b04827bcea494a1334a8d247e7a`.

## Governing source navigation

- [P1-rsync.1](evidence/independent/rsync.1.txt) — 3.2.7,20 Oct2022; SHA256 `f2d70e3b57214cb26519a88e2b6118dd2c05386838009f9888f48876a087690c`; read scope [[1, 5051]].
- [P1-receiver.c](evidence/independent/receiver.c.txt) — 3.2.7,20 Oct2022; SHA256 `1f0747cbcc0e9475e89d324bd15873a1431172cd39801dc041291c620e70c373`; read scope [[406, 475], [531, 590], [731, 980]].
- [P1-cleanup.c](evidence/independent/cleanup.c.txt) — 3.2.7,20 Oct2022; SHA256 `07b982f666c9c78dfe1eacc88a666adf65410ec5402378f3a6860f11c0b43c2d`; read scope [[96, 275]].
- [P1-generator.c](evidence/independent/generator.c.txt) — 3.2.7,20 Oct2022; SHA256 `ffcb0b5473de8b1630a4866e074f8929428df6c9049b816a89a557e27b0f3c79`; read scope [[128, 250], [272, 345], [1506, 1530], [2286, 2310]].
- [P1-options.c](evidence/independent/options.c.txt) — 3.2.7,20 Oct2022; SHA256 `465892bdaefdeaafe1cfd2889aa1943fb5d34c9019ba3f5411af4004ffeb9029`; read scope [[2111, 2210], [2371, 2440]].
- [P1-NEWS.md](evidence/independent/NEWS.md.txt) — 3.2.7,20 Oct2022; SHA256 `b69afcd7778c58096d638dce98880587a0de398029fd740c832043ed84510529`; read scope [[1, 100]].
- [P2](evidence/independent/live-rsync-man.html) — live3.5.1; SHA256 `9160de49f8f56f4905fbc4b9ee4e0ac347570865092abde0784f8713fad9e771`; read scope Web tool navigation and relevant passages only; supplemental, not version authority.
- [P3](evidence/independent/rsync-FAQ.html) — live unpinned FAQ; SHA256 `e4d420bee0f08edeba7eb49d9b90141721778b04827bcea494a1334a8d247e7a`; read scope Web tool navigation and relevant passages only; supplemental, not version authority.

## F1 exact locators

- [rsync-3.2.7/rsync.1:1992](evidence/independent/rsync.1.txt) — lines1992–2023, --delete default timing and --delete-during.
- [rsync-3.2.7/rsync.1:3506](evidence/independent/rsync.1.txt) — lines3506–3539, --delay-updates storage and rename conditions.
- [rsync-3.2.7/receiver.c:421](evidence/independent/receiver.c.txt) — lines421–448, handle_delayed_updates.
- [rsync-3.2.7/receiver.c:559](evidence/independent/receiver.c.txt) — lines559–584, recv_files phase 2.
- [rsync-3.2.7/receiver.c:789](evidence/independent/receiver.c.txt) — lines789–797, fstat transfer error continues.
- [rsync-3.2.7/receiver.c:901](evidence/independent/receiver.c.txt) — lines901–918, failed partial-directory creation discards file.
- [rsync-3.2.7/cleanup.c:210](evidence/independent/cleanup.c.txt) — lines210–219, final exit RERR_PARTIAL after transfer errors.
- [rsync-3.2.7/generator.c:1520](evidence/independent/generator.c.txt) — lines1520–1525, non-incremental delete-during.

[Assessment](assessment.md) · [Structured judgment](assessment.json) · [Source/claim navigation](source-map.json) · [Inspected science hashes](inspected-artifacts.json) · [Original host-freeze copy](evidence/inspected-science/015-terminal-science-freeze.json)

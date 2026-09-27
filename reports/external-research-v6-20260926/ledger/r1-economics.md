| slot | stage | span s | parent resp | Muse child calls | input tok | cache-read | uncached in | output | reasoning | tool calls | source reads | unique | repeats |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| M-control | s1 | 440 | 33 | 24 | 5,133,521 | 4,849,312 | 284,209 | 34,143 | 6,354 | 97 | 63 | 56 | 7 |
| M-control | s2 | 500 | 38 | 27 | 3,680,682 | 3,528,021 | 152,661 | 30,827 | 13,076 | 83 | 59 | 34 | 25 |
| M-candidate | s1 | 306 | 33 | 26 | 3,974,467 | 3,772,960 | 201,507 | 25,283 | 3,844 | 92 | 59 | 51 | 8 |
| M-candidate | s2 | 788 | 29 | 26 | 3,457,455 | 3,279,452 | 178,003 | 41,617 | 20,887 | 58 | 32 | 21 | 11 |
| Z-candidate | s1 | 1780 | 56 | n/a | 8,660,958 | 8,416,384 | 244,574 | 65,878 | 0 | 55 | 21 | 20 | 1 |
| Z-candidate | s2 | 1334 | 39 | n/a | 5,288,429 | 5,066,112 | 222,317 | 51,585 | 0 | 66 | 11 | 8 | 3 |
| Z-control | s1 | 1452 | 50 | n/a | 8,119,794 | 7,864,640 | 255,154 | 72,179 | 0 | 117 | 57 | 57 | 0 |
| Z-control | s2 | 1393 | 53 | n/a | 8,721,169 | 8,456,512 | 264,657 | 68,731 | 0 | 109 | 82 | 63 | 19 |

| slot | arm active span s | fault wait s (excluded) | parent resp | total input | total uncached | total output |
|---|---:|---:|---:|---:|---:|---:|
| M-control | 943 | 0 | 71 | 8,814,203 | 436,870 | 64,970 |
| M-candidate | 1097 | 1786 | 62 | 7,431,922 | 379,510 | 66,900 |
| Z-candidate | 3122 | 790 | 95 | 13,949,387 | 466,891 | 117,463 |
| Z-control | 2853 | 0 | 103 | 16,840,963 | 519,811 | 140,910 |

| pair | metric | control | candidate | candidate/control |
|---|---|---:|---:|---:|
| Muse | stage-2 span s | 500 | 788 | 1.58 |
| Muse | stage-2 parent responses | 38 | 29 | 0.76 |
| Muse | stage-2 source reads | 59 | 32 | 0.54 |
| Muse | stage-2 uncached input | 152,661 | 178,003 | 1.17 |
| Muse | stage-2 output tokens | 30,827 | 41,617 | 1.35 |
| Muse | arm active span s | 943 | 1,097 | 1.16 |
| Muse | arm parent responses | 71 | 62 | 0.87 |
| Muse | arm uncached input | 436,870 | 379,510 | 0.87 |
| Muse | arm output tokens | 64,970 | 66,900 | 1.03 |
| zcode | stage-2 span s | 1,393 | 1,334 | 0.96 |
| zcode | stage-2 parent responses | 53 | 39 | 0.74 |
| zcode | stage-2 source reads | 82 | 11 | 0.13 |
| zcode | stage-2 uncached input | 264,657 | 222,317 | 0.84 |
| zcode | stage-2 output tokens | 68,731 | 51,585 | 0.75 |
| zcode | arm active span s | 2,853 | 3,122 | 1.09 |
| zcode | arm parent responses | 103 | 95 | 0.92 |
| zcode | arm uncached input | 519,811 | 466,891 | 0.90 |
| zcode | arm output tokens | 140,910 | 117,463 | 0.83 |

Stage-1 quote fidelity (post-hoc corrected diagnostic): M-control: {'exact_at_cited_lines': 38, 'all_segments_at_cited_lines': 0, 'found_elsewhere_in_cited_source': 0, 'not_found': 30, 'no_quote': 0}; M-candidate: {'exact_at_cited_lines': 36, 'all_segments_at_cited_lines': 0, 'found_elsewhere_in_cited_source': 0, 'not_found': 4, 'no_quote': 0}; Z-candidate: {'exact_at_cited_lines': 11, 'all_segments_at_cited_lines': 20, 'found_elsewhere_in_cited_source': 21, 'not_found': 27, 'no_quote': 1}; Z-control: {'exact_at_cited_lines': 13, 'all_segments_at_cited_lines': 3, 'found_elsewhere_in_cited_source': 0, 'not_found': 59, 'no_quote': 0}

# Status glyph conflicts

_Generated from census.csv. A conflict is either one shape carrying two or more status meanings/states, or one state drawn by two or more shapes._

## One shape, two or more status meanings or states (3)

### `b900e45ee1`

- meanings: done
- states: done | failed

| id | surface | context | kind | meaning | state | label |
|---|---|---|---|---|---|---|
| g0101 | rail-panel:source | source panel | svg | done | done | REMOTE PROJECTION · healthy · 0 in / 2 o |
| g0137 | rail-panel:git | git panel | svg | done | failed | Recent runs7 runs · 5 refs7 Readiness4 p |
| g0163 | rail-panel:testing | testing panel | svg | done | done |  |
| g0217 | rail-panel:run | run panel · breakpoints | svg | done | done | Toggle all activations |
| g0230 | rail-panel:agents | agents panel | svg | done | done |  |
| g0255 | rail-panel:artifacts | artifacts panel | svg | done | done | Receipt |

### `U+2713`

- meanings: done
- states: done | ok

| id | surface | context | kind | meaning | state | label |
|---|---|---|---|---|---|---|
| g0327 | home | surface | text-symbol | done | done |  |
| g0977 | wizard | surface | text-symbol | done | ok |  |
| g1060 | chat | surface | text-symbol | done | done |  |

### `3d3604985f`

- meanings: live 10 | temporary build
- states: live | working

| id | surface | context | kind | meaning | state | label |
|---|---|---|---|---|---|---|
| g0607 | usage | ledger room | svg | live 10 | live | live-10 |
| g0862 | settings:memory | memory | svg | temporary build | working | Temporary build pathOne chat · Working c |


## One state, two or more shapes (7)

### state `done` — 11 shapes

| id | geometry | surface | context | kind | meaning |
|---|---|---|---|---|---|
| g0101 | `b900e45ee1` | rail-panel:source | source panel | svg | done |
| g0163 | `b900e45ee1` | rail-panel:testing | testing panel | svg | done |
| g0217 | `b900e45ee1` | rail-panel:run | run panel · breakpoints | svg | done |
| g0230 | `b900e45ee1` | rail-panel:agents | agents panel | svg | done |
| g0255 | `b900e45ee1` | rail-panel:artifacts | artifacts panel | svg | done |
| g0246 | `0db65ca092` | rail-panel:artifacts | artifacts panel | svg | done |
| g0249 | `7224c2e25d` | rail-panel:artifacts | artifacts panel | svg | done |
| g0252 | `8e1a88aaaf` | rail-panel:artifacts | artifacts panel | svg | done |
| g0253 | `48e5c7a4b6` | rail-panel:artifacts | artifacts panel | svg | done |
| g0258 | `80fea21b50` | rail-panel:artifacts | artifacts panel | svg | done |
| g0262 | `175fc5e9c7` | rail-panel:artifacts | artifacts panel | svg | done |
| g0265 | `75e31d3ecf` | rail-panel:artifacts | artifacts panel | svg | done |
| g0294 | `0736f7f4ab` | home | surface | svg | done |
| g0325 | `U+25CF` | home | surface | text-symbol | status on |

_…and 2 more rows._

### state `failed` — 5 shapes

| id | geometry | surface | context | kind | meaning |
|---|---|---|---|---|---|
| g0112 | `f01237ea78` | rail-panel:git | git panel | svg | git branch |
| g0122 | `07f2273d59` | rail-panel:git | git panel | svg | failed |
| g0134 | `2c552f39e2` | rail-panel:git | git panel | svg | failed |
| g0137 | `b900e45ee1` | rail-panel:git | git panel | svg | done |
| g0266 | `5b9cf9a0c8` | rail-panel:artifacts | artifacts panel | svg | failed |

### state `running` — 2 shapes

| id | geometry | surface | context | kind | meaning |
|---|---|---|---|---|---|
| g0147 | `ffc075298c` | rail-panel:docker | docker panel | svg | layers |
| g0227 | `c89bbffc5d` | rail-panel:agents | agents panel | svg | lane b |

### state `warning` — 3 shapes

| id | geometry | surface | context | kind | meaning |
|---|---|---|---|---|---|
| g0157 | `c2bf694a4b` | rail-panel:docker | docker panel | svg | warning |
| g0215 | `c2bf694a4b` | rail-panel:run | run panel | svg | warning |
| g0288 | `e703ed8901` | home | surface | svg | warning |
| g0333 | `U+00D7` | menu:notifications | surface | text-symbol | close |
| g0990 | `U+00D7` | toast | toast dismiss | text-symbol | close |

### state `passed` — 4 shapes

| id | geometry | surface | context | kind | meaning |
|---|---|---|---|---|---|
| g0164 | `f8ec8c7349` | rail-panel:testing | testing panel | svg | passed |
| g0254 | `11bc6b2074` | rail-panel:artifacts | artifacts panel | svg | passed |
| g0257 | `ad38985b38` | rail-panel:artifacts | artifacts panel | svg | passed |
| g0921 | `fd61a0c758` | settings:projects | projects | svg | fast feedback |

### state `live` — 11 shapes

| id | geometry | surface | context | kind | meaning |
|---|---|---|---|---|---|
| g0244 | `cd724a2657` | rail-panel:artifacts | artifacts panel | svg | run |
| g0607 | `3d3604985f` | usage | ledger room | svg | live 10 |
| g0608 | `b9ff54a601` | usage | ledger room | svg | live 09 |
| g0615 | `d3e24a8161` | usage | ledger room | img | live 10 |
| g0616 | `c074f5112d` | usage | ledger room | img | live 09 |
| g0617 | `421bd23726` | usage | ledger room | img | live 08 |
| g0618 | `0b661da5a5` | usage | ledger room | img | live 07 |
| g0619 | `8f4ffa87c8` | usage | ledger room | img | live 06 |
| g0620 | `292512da76` | usage | ledger room | img | live 05 |
| g0621 | `fdd5404756` | usage | ledger room | img | live 04 |
| g0980 | `0138da2257` | orchestrator | surface | svg | pcr 47 |

### state `attention` — 3 shapes

| id | geometry | surface | context | kind | meaning |
|---|---|---|---|---|---|
| g0361 | `892b362b16` | usage | overview room | svg | security |
| g0400 | `892b362b16` | usage | plans room | svg | security |
| g0440 | `892b362b16` | usage | costs room | svg | security |
| g0470 | `892b362b16` | usage | accounts room | svg | security |
| g0512 | `892b362b16` | usage | free room | svg | security |
| g0539 | `892b362b16` | usage | context room | svg | security |
| g0563 | `892b362b16` | usage | analytics room | svg | security |
| g0593 | `892b362b16` | usage | ledger room | svg | security |
| g0632 | `892b362b16` | usage | attention room | svg | security |
| g0660 | `892b362b16` | usage | cache room | svg | security |
| g0689 | `892b362b16` | usage | tools room | svg | security |
| g0714 | `892b362b16` | usage | signals room | svg | security |
| g0740 | `892b362b16` | usage | authority room | svg | security |
| g0771 | `8e38a84b91` | settings:home | settings home | svg | ai providers12 |

_…and 10 more rows._


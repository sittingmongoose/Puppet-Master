# W4 cross-check: runtime census vs glyph map

## Counts

- runtime shapes (rows in shapes.csv): 344
- matched shapes (normalized markup equal to a map item): 165
- unmatched shapes (kind svg, no map match): 122
- text symbols (census rows of kind text-symbol): 50
- matched.csv rows (shape x matching map item): 202
- map items loaded: 464 (normalized: 464)

## 20 most-seen unmatched shapes

| count | geometry_hash | surfaces | meanings | best guess |
|---|---|---|---|---|
| 219 | fb203a79ee | settings:ai;settings:code;settings:general;settings:memory;settings:planning;settings:safety;settings:source;settings:system | about accent;about access;about account;about after;about also;about animation;about app;about ask;about attach;about border;about bring;about browser;about change;about check;about choosing;about claude;about clear;about closing;about color;about command;about copy;about corner;about dashboard;about deep;about default;about dragging;about draw;about easier;about edit;about expert;about explain;about export;about extra;about fewest;about first;about follow;about github;about hand;about hide;about high;about how;about if;about interactive;about jobs;about keep;about key;about keyboard;about languages;about largest;about leave;about let;about light;about line;about lines;about look;about mark;about messages;about most;about never;about new;about nickname;about nier;about offer;about open;about opening;about order;about other;about plan;about prefer;about preferred;about preview;about problems;about project;about protect;about purpose;about quick;about quota;about rebuild;about record;about reduce;about remember;about requirements;about reset;about rest;about retries;about right;about save;about screenshot;about scroll;about scrollbar;about search;about settings;about sharing;about shell;about shells;about show;about side;about sign;about size;about skip;about smart;about space;about spacing;about speed;about standard;about start;about switch;about tabs;about terminal;about terminals;about text;about theme;about thorough;about topics;about use;about warn;about what;about when;about where;about who;about words;about wrap;about your | brain |
| 78 | 56ad57d37d | usage | panel options | cog |
| 78 | 5a12f72e65 | usage | move panel | cog |
| 77 | 7871af28c2 | usage | panel size | brain |
| 77 | 9a8e1a6e28 | usage | configure panel | gear |
| 16 | 290c19fc43 | onboarding;tour | change the | brain |
| 16 | 95a561f0fc | onboarding;tour | sound on | soundOn |
| 9 | baedfd6048 | onboarding | quick check;unknown | check |
| 7 | 06a3f1ae40 | tour | unknown | brain |
| 7 | 4e0a183fd9 | rail-panel:files | rust source | pin |
| 7 | 8028d2d5b3 | tour | unknown | scales |
| 6 | b50d6411d9 | onboarding | back | map |
| 4 | 507d38fcdf | rail-panel:files | svelte component | pin |
| 4 | fd31780a85 | chat;home | edit is;edit supersedes | pin |
| 3 | f6749eb4fe | settings:general | unknown | sliders |
| 2 | 0a9a234119 | onboarding | unknown | folder |
| 2 | 1bc0a9cce0 | menu:theme;onboarding | adjust nier | debug |
| 2 | 4d580b5c0f | chat;home | context usage |  |
| 2 | 7e18108ea7 | onboarding | dark;unknown | history |
| 2 | 7e56d39921 | menu:home-more | open browser;open panel | telescope |

## Parse notes

- none; all inputs parsed

# DCW named phase guard results (sweep part 2B)

Gated tool `004bdedd632d9463f3535190a6ed5772338cdce1`, rerun in full after the shared date_time adoption. All credit below is synthetic assertion/phase scope, exactly as the tool reported it. Individual schema keywords, loop occurrences, compound predicate members and complete Python boundaries retain no automatic proof credit. No duplicate set is credited.

## Counts

| Checker | Guards | Proved | Unproved |
|---|---:|---:|---:|
| `pm_dcw_event_oracles` | 250 | 240 | 10 |
| `pm_dcw_blockage_events` | 108 | 106 | 2 |
| `pm_bundle_revision_events` | 22 | 20 | 2 |
| `pm_dcw_registered_schemas` | 13 | 13 | 0 |

Collection: 6985 executions, 0 mismatches, 0 untracked exceptions, 393 controls, 1099 distinct negatives. Tables: FAIL 14, PASS 153.

## Every cut row

For a proved row, own negatives all flip under its single-row cut, peer negatives retain their own refusal and restoration matches the baseline. Full case IDs, every evaluation and trace are in the cited `guard-tool-reports.tar.gz`; every row and supplementary full-path cut is also in `guard-results.json.gz`.

| Guard | Source | Tool | Own / flipped | Peers retained | Restoration |
|---|---|---|---:|---:|---|
| `O001` | `scripts/pm_dcw_event_oracles.py:139` | PROVED | 1 / 1 | 19 | matches |
| `O002` | `scripts/pm_dcw_event_oracles.py:140` | PROVED | 3 / 3 | 17 | matches |
| `O003` | `scripts/pm_dcw_event_oracles.py:144` | PROVED | 1 / 1 | 19 | matches |
| `O004` | `scripts/pm_dcw_event_oracles.py:224` | PROVED | 6 / 6 | 14 | matches |
| `O005` | `scripts/pm_dcw_event_oracles.py:235` | PROVED | 8 / 8 | 12 | matches |
| `O006` | `scripts/pm_dcw_event_oracles.py:240` | PROVED | 1 / 1 | 19 | matches |
| `O007` | `scripts/pm_dcw_event_oracles.py:241` | PROVED | 8 / 8 | 36 | matches |
| `O008` | `scripts/pm_dcw_event_oracles.py:242` | PROVED | 8 / 8 | 36 | matches |
| `O009` | `scripts/pm_dcw_event_oracles.py:243` | PROVED | 8 / 8 | 36 | matches |
| `O010` | `scripts/pm_dcw_event_oracles.py:250` | PROVED | 6 / 6 | 38 | matches |
| `O011` | `scripts/pm_dcw_event_oracles.py:251` | PROVED | 8 / 8 | 36 | matches |
| `O012` | `scripts/pm_dcw_event_oracles.py:253` | PROVED | 6 / 6 | 38 | matches |
| `O013` | `scripts/pm_dcw_event_oracles.py:262` | PROVED | 1 / 1 | 0 | matches |
| `O014` | `scripts/pm_dcw_event_oracles.py:263` | UNPROVED | 0 / 0 | 0 | unproved |
| `O015` | `scripts/pm_dcw_event_oracles.py:264` | PROVED | 6 / 6 | 15 | matches |
| `O016` | `scripts/pm_dcw_event_oracles.py:265` | PROVED | 6 / 6 | 15 | matches |
| `O017` | `scripts/pm_dcw_event_oracles.py:266` | PROVED | 1 / 1 | 0 | matches |
| `O018` | `scripts/pm_dcw_event_oracles.py:268` | PROVED | 2 / 2 | 19 | matches |
| `O019` | `scripts/pm_dcw_event_oracles.py:270` | PROVED | 1 / 1 | 20 | matches |
| `O020` | `scripts/pm_dcw_event_oracles.py:271` | PROVED | 4 / 4 | 17 | matches |
| `O021` | `scripts/pm_dcw_event_oracles.py:272` | PROVED | 1 / 1 | 0 | matches |
| `O022` | `scripts/pm_dcw_event_oracles.py:273` | PROVED | 2 / 2 | 19 | matches |
| `O023` | `scripts/pm_dcw_event_oracles.py:274` | PROVED | 2 / 2 | 8 | matches |
| `O024` | `scripts/pm_dcw_event_oracles.py:275` | PROVED | 4 / 4 | 6 | matches |
| `O025` | `scripts/pm_dcw_event_oracles.py:276` | PROVED | 1 / 1 | 9 | matches |
| `O026` | `scripts/pm_dcw_event_oracles.py:278` | PROVED | 1 / 1 | 9 | matches |
| `O027` | `scripts/pm_dcw_event_oracles.py:284` | PROVED | 1 / 1 | 9 | matches |
| `O028` | `scripts/pm_dcw_event_oracles.py:288` | PROVED | 1 / 1 | 9 | matches |
| `O029` | `scripts/pm_dcw_event_oracles.py:299` | PROVED | 1 / 1 | 17 | matches |
| `O030` | `scripts/pm_dcw_event_oracles.py:301` | PROVED | 1 / 1 | 17 | matches |
| `O031` | `scripts/pm_dcw_event_oracles.py:303` | PROVED | 1 / 1 | 17 | matches |
| `O032` | `scripts/pm_dcw_event_oracles.py:304` | PROVED | 1 / 1 | 0 | matches |
| `O033` | `scripts/pm_dcw_event_oracles.py:305` | PROVED | 6 / 6 | 12 | matches |
| `O034` | `scripts/pm_dcw_event_oracles.py:306` | PROVED | 1 / 1 | 0 | matches |
| `O035` | `scripts/pm_dcw_event_oracles.py:307` | PROVED | 2 / 2 | 16 | matches |
| `O036` | `scripts/pm_dcw_event_oracles.py:315` | PROVED | 7 / 7 | 11 | matches |
| `O037` | `scripts/pm_dcw_event_oracles.py:316` | PROVED | 106 / 106 | 27 | matches |
| `O038` | `scripts/pm_dcw_event_oracles.py:317` | PROVED | 9 / 9 | 124 | matches |
| `O039` | `scripts/pm_dcw_event_oracles.py:319` | PROVED | 1 / 1 | 0 | matches |
| `O040` | `scripts/pm_dcw_event_oracles.py:320` | PROVED | 6 / 6 | 127 | matches |
| `O041` | `scripts/pm_dcw_event_oracles.py:321` | UNPROVED | 0 / 0 | 0 | unproved |
| `O042` | `scripts/pm_dcw_event_oracles.py:322` | PROVED | 5 / 5 | 128 | matches |
| `O043` | `scripts/pm_dcw_event_oracles.py:324` | PROVED | 6 / 6 | 127 | matches |
| `O044` | `scripts/pm_dcw_event_oracles.py:326` | PROVED | 1 / 1 | 132 | matches |
| `O045` | `scripts/pm_dcw_event_oracles.py:328` | PROVED | 1 / 1 | 0 | matches |
| `O046` | `scripts/pm_dcw_event_oracles.py:329` | PROVED | 1 / 1 | 6 | matches |
| `O047` | `scripts/pm_dcw_event_oracles.py:330` | PROVED | 1 / 1 | 6 | matches |
| `O048` | `scripts/pm_dcw_event_oracles.py:331` | PROVED | 1 / 1 | 0 | matches |
| `O049` | `scripts/pm_dcw_event_oracles.py:332` | PROVED | 1 / 1 | 0 | matches |
| `O050` | `scripts/pm_dcw_event_oracles.py:333` | PROVED | 2 / 2 | 5 | matches |
| `O051` | `scripts/pm_dcw_event_oracles.py:347` | PROVED | 1 / 1 | 6 | matches |
| `O052` | `scripts/pm_dcw_event_oracles.py:348` | PROVED | 1 / 1 | 6 | matches |
| `O053` | `scripts/pm_dcw_event_oracles.py:351` | PROVED | 1 / 1 | 6 | matches |
| `O054` | `scripts/pm_dcw_event_oracles.py:352` | PROVED | 1 / 1 | 10 | matches |
| `O055` | `scripts/pm_dcw_event_oracles.py:353` | PROVED | 2 / 2 | 9 | matches |
| `O056` | `scripts/pm_dcw_event_oracles.py:354` | PROVED | 1 / 1 | 10 | matches |
| `O057` | `scripts/pm_dcw_event_oracles.py:364` | PROVED | 1 / 1 | 10 | matches |
| `O058` | `scripts/pm_dcw_event_oracles.py:375` | PROVED | 1 / 1 | 0 | matches |
| `O059` | `scripts/pm_dcw_event_oracles.py:376` | PROVED | 3 / 3 | 8 | matches |
| `O060` | `scripts/pm_dcw_event_oracles.py:377` | PROVED | 1 / 1 | 0 | matches |
| `O061` | `scripts/pm_dcw_event_oracles.py:378` | PROVED | 1 / 1 | 0 | matches |
| `O062` | `scripts/pm_dcw_event_oracles.py:379` | PROVED | 1 / 1 | 0 | matches |
| `O063` | `scripts/pm_dcw_event_oracles.py:380` | PROVED | 3 / 3 | 8 | matches |
| `O064` | `scripts/pm_dcw_event_oracles.py:383` | PROVED | 4 / 4 | 5 | matches |
| `O065` | `scripts/pm_dcw_event_oracles.py:384` | PROVED | 1 / 1 | 0 | matches |
| `O066` | `scripts/pm_dcw_event_oracles.py:385` | PROVED | 1 / 1 | 8 | matches |
| `O067` | `scripts/pm_dcw_event_oracles.py:386` | PROVED | 1 / 1 | 8 | matches |
| `O068` | `scripts/pm_dcw_event_oracles.py:388` | PROVED | 1 / 1 | 8 | matches |
| `O069` | `scripts/pm_dcw_event_oracles.py:389` | PROVED | 1 / 1 | 8 | matches |
| `O070` | `scripts/pm_dcw_event_oracles.py:390` | PROVED | 1 / 1 | 0 | matches |
| `O071` | `scripts/pm_dcw_event_oracles.py:391` | PROVED | 1 / 1 | 8 | matches |
| `O072` | `scripts/pm_dcw_event_oracles.py:392` | PROVED | 1 / 1 | 8 | matches |
| `O073` | `scripts/pm_dcw_event_oracles.py:394` | PROVED | 1 / 1 | 8 | matches |
| `O074` | `scripts/pm_dcw_event_oracles.py:396` | PROVED | 1 / 1 | 0 | matches |
| `O075` | `scripts/pm_dcw_event_oracles.py:398` | PROVED | 1 / 1 | 8 | matches |
| `O076` | `scripts/pm_dcw_event_oracles.py:399` | PROVED | 1 / 1 | 0 | matches |
| `O077` | `scripts/pm_dcw_event_oracles.py:401` | UNPROVED | 0 / 0 | 0 | unproved |
| `O078` | `scripts/pm_dcw_event_oracles.py:407` | PROVED | 1 / 1 | 8 | matches |
| `O079` | `scripts/pm_dcw_event_oracles.py:410` | PROVED | 1 / 1 | 8 | matches |
| `O080` | `scripts/pm_dcw_event_oracles.py:411` | PROVED | 4 / 4 | 5 | matches |
| `O081` | `scripts/pm_dcw_event_oracles.py:412` | PROVED | 1 / 1 | 8 | matches |
| `O082` | `scripts/pm_dcw_event_oracles.py:424` | PROVED | 3 / 3 | 6 | matches |
| `O083` | `scripts/pm_dcw_event_oracles.py:425` | PROVED | 1 / 1 | 8 | matches |
| `O084` | `scripts/pm_dcw_event_oracles.py:426` | PROVED | 2 / 2 | 7 | matches |
| `O085` | `scripts/pm_dcw_event_oracles.py:428` | PROVED | 1 / 1 | 8 | matches |
| `O086` | `scripts/pm_dcw_event_oracles.py:429` | PROVED | 1 / 1 | 8 | matches |
| `O087` | `scripts/pm_dcw_event_oracles.py:430` | PROVED | 1 / 1 | 12 | matches |
| `O088` | `scripts/pm_dcw_event_oracles.py:431` | PROVED | 1 / 1 | 12 | matches |
| `O089` | `scripts/pm_dcw_event_oracles.py:432` | PROVED | 8 / 8 | 5 | matches |
| `O090` | `scripts/pm_dcw_event_oracles.py:433` | PROVED | 1 / 1 | 12 | matches |
| `O091` | `scripts/pm_dcw_event_oracles.py:434` | PROVED | 1 / 1 | 0 | matches |
| `O092` | `scripts/pm_dcw_event_oracles.py:435` | PROVED | 1 / 1 | 12 | matches |
| `O093` | `scripts/pm_dcw_event_oracles.py:436` | PROVED | 1 / 1 | 0 | matches |
| `O094` | `scripts/pm_dcw_event_oracles.py:437` | PROVED | 1 / 1 | 0 | matches |
| `O095` | `scripts/pm_dcw_event_oracles.py:438` | PROVED | 1 / 1 | 12 | matches |
| `O096` | `scripts/pm_dcw_event_oracles.py:439` | PROVED | 1 / 1 | 0 | matches |
| `O097` | `scripts/pm_dcw_event_oracles.py:440` | PROVED | 1 / 1 | 6 | matches |
| `O098` | `scripts/pm_dcw_event_oracles.py:441` | PROVED | 1 / 1 | 0 | matches |
| `O099` | `scripts/pm_dcw_event_oracles.py:442` | PROVED | 1 / 1 | 0 | matches |
| `O100` | `scripts/pm_dcw_event_oracles.py:443` | PROVED | 2 / 2 | 5 | matches |
| `O101` | `scripts/pm_dcw_event_oracles.py:445` | PROVED | 1 / 1 | 6 | matches |
| `O102` | `scripts/pm_dcw_event_oracles.py:446` | PROVED | 1 / 1 | 0 | matches |
| `O103` | `scripts/pm_dcw_event_oracles.py:447` | PROVED | 1 / 1 | 6 | matches |
| `O104` | `scripts/pm_dcw_event_oracles.py:448` | PROVED | 1 / 1 | 0 | matches |
| `O105` | `scripts/pm_dcw_event_oracles.py:449` | PROVED | 1 / 1 | 0 | matches |
| `O106` | `scripts/pm_dcw_event_oracles.py:450` | PROVED | 1 / 1 | 6 | matches |
| `O107` | `scripts/pm_dcw_event_oracles.py:451` | PROVED | 1 / 1 | 6 | matches |
| `O108` | `scripts/pm_dcw_event_oracles.py:453` | UNPROVED | 0 / 0 | 0 | unproved |
| `O109` | `scripts/pm_dcw_event_oracles.py:454` | UNPROVED | 0 / 0 | 0 | unproved |
| `O110` | `scripts/pm_dcw_event_oracles.py:456` | UNPROVED | 0 / 0 | 0 | unproved |
| `O111` | `scripts/pm_dcw_event_oracles.py:458` | PROVED | 1 / 1 | 23 | matches |
| `O112` | `scripts/pm_dcw_event_oracles.py:459` | PROVED | 1 / 1 | 0 | matches |
| `O113` | `scripts/pm_dcw_event_oracles.py:463` | PROVED | 1 / 1 | 23 | matches |
| `O114` | `scripts/pm_dcw_event_oracles.py:465` | PROVED | 4 / 4 | 20 | matches |
| `O115` | `scripts/pm_dcw_event_oracles.py:474` | PROVED | 1 / 1 | 0 | matches |
| `O116` | `scripts/pm_dcw_event_oracles.py:475` | PROVED | 6 / 6 | 18 | matches |
| `O117` | `scripts/pm_dcw_event_oracles.py:476` | UNPROVED | 0 / 0 | 0 | unproved |
| `O118` | `scripts/pm_dcw_event_oracles.py:478` | PROVED | 11 / 11 | 13 | matches |
| `O119` | `scripts/pm_dcw_event_oracles.py:479` | PROVED | 1 / 1 | 0 | matches |
| `O120` | `scripts/pm_dcw_event_oracles.py:480` | PROVED | 1 / 1 | 23 | matches |
| `O121` | `scripts/pm_dcw_event_oracles.py:481` | PROVED | 12 / 12 | 28 | matches |
| `O122` | `scripts/pm_dcw_event_oracles.py:482` | PROVED | 8 / 8 | 32 | matches |
| `O123` | `scripts/pm_dcw_event_oracles.py:483` | PROVED | 12 / 12 | 28 | matches |
| `O124` | `scripts/pm_dcw_event_oracles.py:484` | UNPROVED | 0 / 0 | 0 | unproved |
| `O125` | `scripts/pm_dcw_event_oracles.py:485` | UNPROVED | 0 / 0 | 0 | unproved |
| `O126` | `scripts/pm_dcw_event_oracles.py:487` | PROVED | 6 / 6 | 34 | matches |
| `O127` | `scripts/pm_dcw_event_oracles.py:488` | PROVED | 1 / 1 | 0 | matches |
| `O128` | `scripts/pm_dcw_event_oracles.py:489` | PROVED | 1 / 1 | 0 | matches |
| `O129` | `scripts/pm_dcw_event_oracles.py:490` | PROVED | 1 / 1 | 0 | matches |
| `O130` | `scripts/pm_dcw_event_oracles.py:491` | PROVED | 1 / 1 | 0 | matches |
| `O131` | `scripts/pm_dcw_event_oracles.py:492` | PROVED | 1 / 1 | 0 | matches |
| `O132` | `scripts/pm_dcw_event_oracles.py:493` | PROVED | 1 / 1 | 39 | matches |
| `O133` | `scripts/pm_dcw_event_oracles.py:494` | PROVED | 1 / 1 | 0 | matches |
| `O134` | `scripts/pm_dcw_event_oracles.py:495` | PROVED | 1 / 1 | 0 | matches |
| `O135` | `scripts/pm_dcw_event_oracles.py:496` | PROVED | 1 / 1 | 39 | matches |
| `O136` | `scripts/pm_dcw_event_oracles.py:497` | PROVED | 6 / 6 | 21 | matches |
| `O137` | `scripts/pm_dcw_event_oracles.py:509` | PROVED | 1 / 1 | 0 | matches |
| `O138` | `scripts/pm_dcw_event_oracles.py:510` | PROVED | 1 / 1 | 0 | matches |
| `O139` | `scripts/pm_dcw_event_oracles.py:511` | PROVED | 1 / 1 | 0 | matches |
| `O140` | `scripts/pm_dcw_event_oracles.py:512` | PROVED | 8 / 8 | 19 | matches |
| `O141` | `scripts/pm_dcw_event_oracles.py:515` | PROVED | 6 / 6 | 21 | matches |
| `O142` | `scripts/pm_dcw_event_oracles.py:517` | PROVED | 3 / 3 | 24 | matches |
| `O143` | `scripts/pm_dcw_event_oracles.py:519` | PROVED | 3 / 3 | 24 | matches |
| `O144` | `scripts/pm_dcw_event_oracles.py:522` | PROVED | 1 / 1 | 26 | matches |
| `O145` | `scripts/pm_dcw_event_oracles.py:523` | PROVED | 8 / 8 | 36 | matches |
| `O146` | `scripts/pm_dcw_event_oracles.py:524` | PROVED | 8 / 8 | 36 | matches |
| `O147` | `scripts/pm_dcw_event_oracles.py:525` | PROVED | 8 / 8 | 36 | matches |
| `O148` | `scripts/pm_dcw_event_oracles.py:527` | PROVED | 6 / 6 | 38 | matches |
| `O149` | `scripts/pm_dcw_event_oracles.py:528` | PROVED | 8 / 8 | 36 | matches |
| `O150` | `scripts/pm_dcw_event_oracles.py:530` | PROVED | 6 / 6 | 38 | matches |
| `O151` | `scripts/pm_dcw_event_oracles.py:540` | PROVED | 1 / 1 | 17 | matches |
| `O152` | `scripts/pm_dcw_event_oracles.py:541` | PROVED | 6 / 6 | 12 | matches |
| `O153` | `scripts/pm_dcw_event_oracles.py:542` | PROVED | 1 / 1 | 0 | matches |
| `O154` | `scripts/pm_dcw_event_oracles.py:543` | PROVED | 2 / 2 | 16 | matches |
| `O155` | `scripts/pm_dcw_event_oracles.py:544` | PROVED | 1 / 1 | 0 | matches |
| `O156` | `scripts/pm_dcw_event_oracles.py:545` | PROVED | 7 / 7 | 11 | matches |
| `O157` | `scripts/pm_dcw_event_oracles.py:548` | PROVED | 1 / 1 | 0 | matches |
| `O158` | `scripts/pm_dcw_event_oracles.py:549` | PROVED | 1 / 1 | 17 | matches |
| `O159` | `scripts/pm_dcw_event_oracles.py:551` | PROVED | 1 / 1 | 0 | matches |
| `O160` | `scripts/pm_dcw_event_oracles.py:552` | PROVED | 1 / 1 | 0 | matches |
| `O161` | `scripts/pm_dcw_event_oracles.py:553` | PROVED | 1 / 1 | 17 | matches |
| `O162` | `scripts/pm_dcw_event_oracles.py:555` | PROVED | 12 / 12 | 22 | matches |
| `O163` | `scripts/pm_dcw_event_oracles.py:559` | PROVED | 7 / 7 | 27 | matches |
| `O164` | `scripts/pm_dcw_event_oracles.py:568` | PROVED | 6 / 6 | 28 | matches |
| `O165` | `scripts/pm_dcw_event_oracles.py:569` | PROVED | 6 / 6 | 28 | matches |
| `O166` | `scripts/pm_dcw_event_oracles.py:572` | PROVED | 1 / 1 | 0 | matches |
| `O167` | `scripts/pm_dcw_event_oracles.py:574` | PROVED | 2 / 2 | 32 | matches |
| `O168` | `scripts/pm_dcw_event_oracles.py:575` | PROVED | 1 / 1 | 33 | matches |
| `O169` | `scripts/pm_dcw_event_oracles.py:577` | PROVED | 21 / 21 | 13 | matches |
| `O170` | `scripts/pm_dcw_event_oracles.py:578` | PROVED | 8 / 8 | 26 | matches |
| `O171` | `scripts/pm_dcw_event_oracles.py:579` | PROVED | 1 / 1 | 33 | matches |
| `O172` | `scripts/pm_dcw_event_oracles.py:580` | PROVED | 1 / 1 | 33 | matches |
| `O173` | `scripts/pm_dcw_event_oracles.py:581` | PROVED | 1 / 1 | 33 | matches |
| `O174` | `scripts/pm_dcw_event_oracles.py:582` | PROVED | 2 / 2 | 32 | matches |
| `O175` | `scripts/pm_dcw_event_oracles.py:584` | PROVED | 1 / 1 | 32 | matches |
| `O176` | `scripts/pm_dcw_event_oracles.py:585` | PROVED | 1 / 1 | 32 | matches |
| `O177` | `scripts/pm_dcw_event_oracles.py:586` | PROVED | 9 / 9 | 24 | matches |
| `O178` | `scripts/pm_dcw_event_oracles.py:593` | PROVED | 12 / 12 | 21 | matches |
| `O179` | `scripts/pm_dcw_event_oracles.py:596` | PROVED | 9 / 9 | 24 | matches |
| `O180` | `scripts/pm_dcw_event_oracles.py:597` | PROVED | 1 / 1 | 32 | matches |
| `O181` | `scripts/pm_dcw_event_oracles.py:599` | PROVED | 8 / 8 | 48 | matches |
| `O182` | `scripts/pm_dcw_event_oracles.py:600` | PROVED | 8 / 8 | 48 | matches |
| `O183` | `scripts/pm_dcw_event_oracles.py:604` | PROVED | 1 / 1 | 55 | matches |
| `O184` | `scripts/pm_dcw_event_oracles.py:607` | PROVED | 1 / 1 | 55 | matches |
| `O185` | `scripts/pm_dcw_event_oracles.py:609` | PROVED | 36 / 36 | 20 | matches |
| `O186` | `scripts/pm_dcw_event_oracles.py:621` | PROVED | 2 / 2 | 54 | matches |
| `O187` | `scripts/pm_dcw_event_oracles.py:686` | PROVED | 1 / 1 | 6 | matches |
| `O188` | `scripts/pm_dcw_event_oracles.py:687` | PROVED | 1 / 1 | 6 | matches |
| `O189` | `scripts/pm_dcw_event_oracles.py:688` | PROVED | 1 / 1 | 6 | matches |
| `O190` | `scripts/pm_dcw_event_oracles.py:696` | PROVED | 1 / 1 | 6 | matches |
| `O191` | `scripts/pm_dcw_event_oracles.py:697` | PROVED | 1 / 1 | 6 | matches |
| `O192` | `scripts/pm_dcw_event_oracles.py:698` | PROVED | 2 / 2 | 5 | matches |
| `O193` | `scripts/pm_dcw_event_oracles.py:699` | PROVED | 1 / 1 | 17 | matches |
| `O194` | `scripts/pm_dcw_event_oracles.py:700` | PROVED | 1 / 1 | 17 | matches |
| `O195` | `scripts/pm_dcw_event_oracles.py:701` | PROVED | 1 / 1 | 17 | matches |
| `O196` | `scripts/pm_dcw_event_oracles.py:783` | PROVED | 1 / 1 | 0 | matches |
| `O197` | `scripts/pm_dcw_event_oracles.py:832` | PROVED | 3 / 3 | 15 | matches |
| `O198` | `scripts/pm_dcw_event_oracles.py:927` | PROVED | 6 / 6 | 12 | matches |
| `O199` | `scripts/pm_dcw_event_oracles.py:928` | PROVED | 1 / 1 | 0 | matches |
| `O200` | `scripts/pm_dcw_event_oracles.py:929` | PROVED | 1 / 1 | 0 | matches |
| `O202` | `scripts/pm_dcw_event_oracles.py:946` | PROVED | 1 / 1 | 0 | matches |
| `O203` | `scripts/pm_dcw_event_oracles.py:947` | PROVED | 6 / 6 | 12 | matches |
| `O204` | `scripts/pm_dcw_event_oracles.py:948` | PROVED | 1 / 1 | 0 | matches |
| `O205` | `scripts/pm_dcw_event_oracles.py:949` | PROVED | 1 / 1 | 0 | matches |
| `O206` | `scripts/pm_dcw_event_oracles.py:950` | PROVED | 1 / 1 | 0 | matches |
| `O207` | `scripts/pm_dcw_event_oracles.py:951` | PROVED | 1 / 1 | 0 | matches |
| `O208` | `scripts/pm_dcw_event_oracles.py:952` | PROVED | 1 / 1 | 0 | matches |
| `O209` | `scripts/pm_dcw_event_oracles.py:955` | PROVED | 1 / 1 | 84 | matches |
| `O210` | `scripts/pm_dcw_event_oracles.py:956` | PROVED | 1 / 1 | 0 | matches |
| `O211` | `scripts/pm_dcw_event_oracles.py:958` | PROVED | 1 / 1 | 0 | matches |
| `O212` | `scripts/pm_dcw_event_oracles.py:959` | PROVED | 1 / 1 | 0 | matches |
| `O213` | `scripts/pm_dcw_event_oracles.py:960` | PROVED | 6 / 6 | 79 | matches |
| `O214` | `scripts/pm_dcw_event_oracles.py:961` | PROVED | 1 / 1 | 0 | matches |
| `O215` | `scripts/pm_dcw_event_oracles.py:962` | PROVED | 6 / 6 | 79 | matches |
| `O216` | `scripts/pm_dcw_event_oracles.py:964` | PROVED | 1 / 1 | 0 | matches |
| `O217` | `scripts/pm_dcw_event_oracles.py:965` | PROVED | 1 / 1 | 0 | matches |
| `O218` | `scripts/pm_dcw_event_oracles.py:966` | PROVED | 1 / 1 | 0 | matches |
| `O219` | `scripts/pm_dcw_event_oracles.py:967` | PROVED | 1 / 1 | 0 | matches |
| `O220` | `scripts/pm_dcw_event_oracles.py:968` | PROVED | 1 / 1 | 0 | matches |
| `O221` | `scripts/pm_dcw_event_oracles.py:971` | PROVED | 1 / 1 | 0 | matches |
| `O222` | `scripts/pm_dcw_event_oracles.py:972` | PROVED | 6 / 6 | 79 | matches |
| `O223` | `scripts/pm_dcw_event_oracles.py:973` | PROVED | 1 / 1 | 0 | matches |
| `O224` | `scripts/pm_dcw_event_oracles.py:974` | PROVED | 1 / 1 | 0 | matches |
| `O225` | `scripts/pm_dcw_event_oracles.py:975` | PROVED | 1 / 1 | 0 | matches |
| `O226` | `scripts/pm_dcw_event_oracles.py:977` | PROVED | 1 / 1 | 0 | matches |
| `O227` | `scripts/pm_dcw_event_oracles.py:979` | PROVED | 6 / 6 | 79 | matches |
| `O228` | `scripts/pm_dcw_event_oracles.py:981` | PROVED | 60 / 60 | 25 | matches |
| `O229` | `scripts/pm_dcw_event_oracles.py:982` | PROVED | 6 / 6 | 14 | matches |
| `O230` | `scripts/pm_dcw_event_oracles.py:983` | PROVED | 6 / 6 | 14 | matches |
| `O231` | `scripts/pm_dcw_event_oracles.py:989` | PROVED | 1 / 1 | 19 | matches |
| `O232` | `scripts/pm_dcw_event_oracles.py:990` | PROVED | 1 / 1 | 19 | matches |
| `O233` | `scripts/pm_dcw_event_oracles.py:991` | PROVED | 1 / 1 | 0 | matches |
| `B001` | `scripts/pm_dcw_blockage_events.py:29` | UNPROVED | 0 / 0 | 0 | unproved |
| `B002` | `scripts/pm_dcw_blockage_events.py:30` | PROVED | 2 / 2 | 18 | matches |
| `B003` | `scripts/pm_dcw_blockage_events.py:31` | PROVED | 4 / 4 | 16 | matches |
| `B004` | `scripts/pm_dcw_blockage_events.py:32` | PROVED | 1 / 1 | 0 | matches |
| `B005` | `scripts/pm_dcw_blockage_events.py:34` | PROVED | 2 / 2 | 8 | matches |
| `B006` | `scripts/pm_dcw_blockage_events.py:35` | PROVED | 1 / 1 | 9 | matches |
| `B007` | `scripts/pm_dcw_blockage_events.py:37` | PROVED | 2 / 2 | 8 | matches |
| `B008` | `scripts/pm_dcw_blockage_events.py:39` | PROVED | 2 / 2 | 8 | matches |
| `B009` | `scripts/pm_dcw_blockage_events.py:40` | PROVED | 1 / 1 | 9 | matches |
| `B010` | `scripts/pm_dcw_blockage_events.py:41` | PROVED | 2 / 2 | 8 | matches |
| `B011` | `scripts/pm_dcw_blockage_events.py:42` | PROVED | 1 / 1 | 10 | matches |
| `B012` | `scripts/pm_dcw_blockage_events.py:44` | PROVED | 1 / 1 | 10 | matches |
| `B013` | `scripts/pm_dcw_blockage_events.py:46` | PROVED | 1 / 1 | 10 | matches |
| `B014` | `scripts/pm_dcw_blockage_events.py:50` | PROVED | 1 / 1 | 10 | matches |
| `B015` | `scripts/pm_dcw_blockage_events.py:57` | PROVED | 6 / 6 | 5 | matches |
| `B016` | `scripts/pm_dcw_blockage_events.py:59` | PROVED | 1 / 1 | 0 | matches |
| `B017` | `scripts/pm_dcw_blockage_events.py:71` | PROVED | 1 / 1 | 10 | matches |
| `B018` | `scripts/pm_dcw_blockage_events.py:73` | PROVED | 1 / 1 | 9 | matches |
| `B019` | `scripts/pm_dcw_blockage_events.py:74` | PROVED | 1 / 1 | 0 | matches |
| `B020` | `scripts/pm_dcw_blockage_events.py:76` | PROVED | 1 / 1 | 9 | matches |
| `B021` | `scripts/pm_dcw_blockage_events.py:98` | PROVED | 2 / 2 | 8 | matches |
| `B022` | `scripts/pm_dcw_blockage_events.py:99` | PROVED | 2 / 2 | 8 | matches |
| `B023` | `scripts/pm_dcw_blockage_events.py:100` | PROVED | 1 / 1 | 0 | matches |
| `B024` | `scripts/pm_dcw_blockage_events.py:101` | PROVED | 2 / 2 | 8 | matches |
| `B025` | `scripts/pm_dcw_blockage_events.py:102` | PROVED | 2 / 2 | 8 | matches |
| `B026` | `scripts/pm_dcw_blockage_events.py:104` | PROVED | 7 / 7 | 6 | matches |
| `B027` | `scripts/pm_dcw_blockage_events.py:105` | PROVED | 1 / 1 | 12 | matches |
| `B028` | `scripts/pm_dcw_blockage_events.py:106` | PROVED | 1 / 1 | 12 | matches |
| `B029` | `scripts/pm_dcw_blockage_events.py:107` | PROVED | 1 / 1 | 12 | matches |
| `B030` | `scripts/pm_dcw_blockage_events.py:108` | PROVED | 1 / 1 | 12 | matches |
| `B031` | `scripts/pm_dcw_blockage_events.py:109` | PROVED | 1 / 1 | 0 | matches |
| `B032` | `scripts/pm_dcw_blockage_events.py:110` | PROVED | 2 / 2 | 11 | matches |
| `B033` | `scripts/pm_dcw_blockage_events.py:111` | PROVED | 1 / 1 | 7 | matches |
| `B034` | `scripts/pm_dcw_blockage_events.py:112` | PROVED | 1 / 1 | 7 | matches |
| `B035` | `scripts/pm_dcw_blockage_events.py:115` | PROVED | 1 / 1 | 7 | matches |
| `B036` | `scripts/pm_dcw_blockage_events.py:117` | PROVED | 2 / 2 | 6 | matches |
| `B037` | `scripts/pm_dcw_blockage_events.py:118` | PROVED | 2 / 2 | 6 | matches |
| `B038` | `scripts/pm_dcw_blockage_events.py:122` | PROVED | 1 / 1 | 7 | matches |
| `B039` | `scripts/pm_dcw_blockage_events.py:124` | PROVED | 3 / 3 | 9 | matches |
| `B040` | `scripts/pm_dcw_blockage_events.py:125` | PROVED | 1 / 1 | 11 | matches |
| `B041` | `scripts/pm_dcw_blockage_events.py:130` | PROVED | 3 / 3 | 9 | matches |
| `B042` | `scripts/pm_dcw_blockage_events.py:131` | PROVED | 1 / 1 | 11 | matches |
| `B043` | `scripts/pm_dcw_blockage_events.py:133` | PROVED | 1 / 1 | 11 | matches |
| `B044` | `scripts/pm_dcw_blockage_events.py:136` | PROVED | 3 / 3 | 9 | matches |
| `B045` | `scripts/pm_dcw_blockage_events.py:137` | PROVED | 3 / 3 | 8 | matches |
| `B046` | `scripts/pm_dcw_blockage_events.py:139` | PROVED | 1 / 1 | 10 | matches |
| `B047` | `scripts/pm_dcw_blockage_events.py:141` | PROVED | 2 / 2 | 9 | matches |
| `B048` | `scripts/pm_dcw_blockage_events.py:142` | PROVED | 1 / 1 | 10 | matches |
| `B049` | `scripts/pm_dcw_blockage_events.py:143` | PROVED | 1 / 1 | 10 | matches |
| `B050` | `scripts/pm_dcw_blockage_events.py:145` | PROVED | 3 / 3 | 8 | matches |
| `B051` | `scripts/pm_dcw_blockage_events.py:146` | PROVED | 1 / 1 | 7 | matches |
| `B052` | `scripts/pm_dcw_blockage_events.py:148` | PROVED | 1 / 1 | 7 | matches |
| `B053` | `scripts/pm_dcw_blockage_events.py:150` | PROVED | 1 / 1 | 7 | matches |
| `B054` | `scripts/pm_dcw_blockage_events.py:152` | UNPROVED | 0 / 0 | 0 | unproved |
| `B055` | `scripts/pm_dcw_blockage_events.py:153` | PROVED | 2 / 2 | 6 | matches |
| `B056` | `scripts/pm_dcw_blockage_events.py:158` | PROVED | 2 / 2 | 6 | matches |
| `B057` | `scripts/pm_dcw_blockage_events.py:159` | PROVED | 1 / 1 | 7 | matches |
| `B058` | `scripts/pm_dcw_blockage_events.py:161` | PROVED | 1 / 1 | 20 | matches |
| `B059` | `scripts/pm_dcw_blockage_events.py:163` | PROVED | 3 / 3 | 18 | matches |
| `B060` | `scripts/pm_dcw_blockage_events.py:164` | PROVED | 8 / 8 | 13 | matches |
| `B061` | `scripts/pm_dcw_blockage_events.py:165` | PROVED | 4 / 4 | 17 | matches |
| `B062` | `scripts/pm_dcw_blockage_events.py:167` | PROVED | 4 / 4 | 17 | matches |
| `B063` | `scripts/pm_dcw_blockage_events.py:169` | PROVED | 1 / 1 | 0 | matches |
| `B064` | `scripts/pm_dcw_blockage_events.py:170` | PROVED | 1 / 1 | 20 | matches |
| `B065` | `scripts/pm_dcw_blockage_events.py:171` | PROVED | 1 / 1 | 10 | matches |
| `B066` | `scripts/pm_dcw_blockage_events.py:172` | PROVED | 1 / 1 | 10 | matches |
| `B067` | `scripts/pm_dcw_blockage_events.py:173` | PROVED | 1 / 1 | 10 | matches |
| `B068` | `scripts/pm_dcw_blockage_events.py:174` | PROVED | 5 / 5 | 6 | matches |
| `B069` | `scripts/pm_dcw_blockage_events.py:193` | PROVED | 1 / 1 | 0 | matches |
| `B070` | `scripts/pm_dcw_blockage_events.py:195` | PROVED | 1 / 1 | 10 | matches |
| `B071` | `scripts/pm_dcw_blockage_events.py:196` | PROVED | 2 / 2 | 9 | matches |
| `B072` | `scripts/pm_dcw_blockage_events.py:197` | PROVED | 1 / 1 | 26 | matches |
| `B073` | `scripts/pm_dcw_blockage_events.py:198` | PROVED | 1 / 1 | 26 | matches |
| `B074` | `scripts/pm_dcw_blockage_events.py:200` | PROVED | 8 / 8 | 19 | matches |
| `B075` | `scripts/pm_dcw_blockage_events.py:201` | PROVED | 1 / 1 | 26 | matches |
| `B076` | `scripts/pm_dcw_blockage_events.py:203` | PROVED | 8 / 8 | 19 | matches |
| `B077` | `scripts/pm_dcw_blockage_events.py:204` | PROVED | 8 / 8 | 19 | matches |
| `B078` | `scripts/pm_dcw_blockage_events.py:206` | PROVED | 8 / 8 | 13 | matches |
| `B079` | `scripts/pm_dcw_blockage_events.py:208` | PROVED | 1 / 1 | 20 | matches |
| `B080` | `scripts/pm_dcw_blockage_events.py:209` | PROVED | 1 / 1 | 20 | matches |
| `B081` | `scripts/pm_dcw_blockage_events.py:210` | PROVED | 2 / 2 | 19 | matches |
| `B082` | `scripts/pm_dcw_blockage_events.py:211` | PROVED | 8 / 8 | 13 | matches |
| `B083` | `scripts/pm_dcw_blockage_events.py:212` | PROVED | 1 / 1 | 20 | matches |
| `B084` | `scripts/pm_dcw_blockage_events.py:213` | PROVED | 1 / 1 | 9 | matches |
| `B085` | `scripts/pm_dcw_blockage_events.py:216` | PROVED | 1 / 1 | 0 | matches |
| `B086` | `scripts/pm_dcw_blockage_events.py:217` | PROVED | 2 / 2 | 8 | matches |
| `B087` | `scripts/pm_dcw_blockage_events.py:227` | PROVED | 4 / 4 | 6 | matches |
| `B088` | `scripts/pm_dcw_blockage_events.py:230` | PROVED | 1 / 1 | 9 | matches |
| `B089` | `scripts/pm_dcw_blockage_events.py:234` | PROVED | 1 / 1 | 9 | matches |
| `B090` | `scripts/pm_dcw_blockage_events.py:236` | PROVED | 1 / 1 | 9 | matches |
| `B091` | `scripts/pm_dcw_blockage_events.py:237` | PROVED | 1 / 1 | 13 | matches |
| `B092` | `scripts/pm_dcw_blockage_events.py:238` | PROVED | 1 / 1 | 13 | matches |
| `B093` | `scripts/pm_dcw_blockage_events.py:239` | PROVED | 1 / 1 | 0 | matches |
| `B094` | `scripts/pm_dcw_blockage_events.py:242` | PROVED | 6 / 6 | 8 | matches |
| `B095` | `scripts/pm_dcw_blockage_events.py:245` | PROVED | 1 / 1 | 0 | matches |
| `B096` | `scripts/pm_dcw_blockage_events.py:246` | PROVED | 1 / 1 | 0 | matches |
| `B097` | `scripts/pm_dcw_blockage_events.py:249` | PROVED | 2 / 2 | 12 | matches |
| `B098` | `scripts/pm_dcw_blockage_events.py:251` | PROVED | 2 / 2 | 12 | matches |
| `B099` | `scripts/pm_dcw_blockage_events.py:252` | PROVED | 2 / 2 | 12 | matches |
| `B100` | `scripts/pm_dcw_blockage_events.py:253` | PROVED | 2 / 2 | 10 | matches |
| `B101` | `scripts/pm_dcw_blockage_events.py:257` | PROVED | 2 / 2 | 10 | matches |
| `B102` | `scripts/pm_dcw_blockage_events.py:261` | PROVED | 2 / 2 | 10 | matches |
| `B103` | `scripts/pm_dcw_blockage_events.py:263` | PROVED | 1 / 1 | 11 | matches |
| `B104` | `scripts/pm_dcw_blockage_events.py:266` | PROVED | 1 / 1 | 11 | matches |
| `B105` | `scripts/pm_dcw_blockage_events.py:286` | PROVED | 1 / 1 | 0 | matches |
| `B106` | `scripts/pm_dcw_blockage_events.py:287` | PROVED | 1 / 1 | 0 | matches |
| `B107` | `scripts/pm_dcw_blockage_events.py:288` | PROVED | 1 / 1 | 0 | matches |
| `B108` | `scripts/pm_dcw_blockage_events.py:289` | PROVED | 1 / 1 | 0 | matches |
| `L001` | `scripts/pm_bundle_revision_events.py:18` | UNPROVED | 0 / 0 | 0 | unproved |
| `L002` | `scripts/pm_bundle_revision_events.py:28` | PROVED | 4 / 4 | 8 | matches |
| `L003` | `scripts/pm_bundle_revision_events.py:29` | PROVED | 4 / 4 | 7 | matches |
| `L004` | `scripts/pm_bundle_revision_events.py:30` | PROVED | 1 / 1 | 10 | matches |
| `L005` | `scripts/pm_bundle_revision_events.py:32` | PROVED | 2 / 2 | 9 | matches |
| `L006` | `scripts/pm_bundle_revision_events.py:33` | PROVED | 1 / 1 | 10 | matches |
| `L007` | `scripts/pm_bundle_revision_events.py:34` | PROVED | 2 / 2 | 9 | matches |
| `L008` | `scripts/pm_bundle_revision_events.py:35` | PROVED | 1 / 1 | 10 | matches |
| `L009` | `scripts/pm_bundle_revision_events.py:36` | PROVED | 1 / 1 | 7 | matches |
| `L010` | `scripts/pm_bundle_revision_events.py:37` | PROVED | 1 / 1 | 7 | matches |
| `L011` | `scripts/pm_bundle_revision_events.py:41` | PROVED | 1 / 1 | 7 | matches |
| `L012` | `scripts/pm_bundle_revision_events.py:44` | PROVED | 1 / 1 | 7 | matches |
| `L013` | `scripts/pm_bundle_revision_events.py:45` | PROVED | 1 / 1 | 0 | matches |
| `L014` | `scripts/pm_bundle_revision_events.py:46` | PROVED | 1 / 1 | 0 | matches |
| `L015` | `scripts/pm_bundle_revision_events.py:48` | PROVED | 1 / 1 | 7 | matches |
| `L016` | `scripts/pm_bundle_revision_events.py:50` | PROVED | 3 / 3 | 5 | matches |
| `L017` | `scripts/pm_bundle_revision_events.py:51` | PROVED | 1 / 1 | 14 | matches |
| `L018` | `scripts/pm_bundle_revision_events.py:52` | PROVED | 2 / 2 | 13 | matches |
| `L019` | `scripts/pm_bundle_revision_events.py:53` | PROVED | 1 / 1 | 14 | matches |
| `L020` | `scripts/pm_bundle_revision_events.py:55` | PROVED | 8 / 8 | 7 | matches |
| `R001` | `scripts/pm_dcw_registered_schemas.py:20` | PROVED | 1 / 1 | 0 | matches |
| `R002` | `scripts/pm_dcw_registered_schemas.py:21` | PROVED | 1 / 1 | 0 | matches |
| `R003` | `scripts/pm_dcw_registered_schemas.py:25` | PROVED | 1 / 1 | 0 | matches |
| `R004` | `scripts/pm_dcw_registered_schemas.py:93` | PROVED | 1 / 1 | 14 | matches |
| `R005` | `scripts/pm_dcw_registered_schemas.py:97` | PROVED | 1 / 1 | 0 | matches |
| `R006` | `scripts/pm_dcw_registered_schemas.py:106` | PROVED | 2 / 2 | 13 | matches |
| `R007` | `scripts/pm_dcw_registered_schemas.py:111` | PROVED | 1 / 1 | 0 | matches |
| `R008` | `scripts/pm_dcw_registered_schemas.py:115` | PROVED | 1 / 1 | 0 | matches |
| `OE001` | `scripts/pm_dcw_event_oracles.py:115` | PROVED | 1 / 1 | 5 | matches |
| `OE002` | `scripts/pm_dcw_event_oracles.py:129` | PROVED | 1 / 1 | 5 | matches |
| `OE003` | `scripts/pm_dcw_event_oracles.py:163` | PROVED | 1 / 1 | 0 | matches |
| `OE004` | `scripts/pm_dcw_event_oracles.py:180` | PROVED | 1 / 1 | 0 | matches |
| `OE005` | `scripts/pm_dcw_event_oracles.py:220` | PROVED | 1 / 1 | 0 | matches |
| `OE006` | `scripts/pm_dcw_event_oracles.py:247` | PROVED | 1 / 1 | 0 | matches |
| `OE007` | `scripts/pm_dcw_event_oracles.py:371` | UNPROVED | 0 / 0 | 0 | unproved |
| `RE001` | `scripts/pm_dcw_registered_schemas.py:34` | PROVED | 1 / 1 | 0 | matches |
| `RE002` | `scripts/pm_dcw_registered_schemas.py:43` | PROVED | 1 / 1 | 0 | matches |
| `RE003` | `scripts/pm_dcw_registered_schemas.py:82` | PROVED | 1 / 1 | 0 | matches |
| `RE004` | `scripts/pm_dcw_registered_schemas.py:123` | PROVED | 1 / 1 | 5 | matches |
| `RE005` | `scripts/pm_dcw_registered_schemas.py:125` | PROVED | 1 / 1 | 0 | matches |
| `LE001` | `scripts/pm_bundle_revision_events.py:22` | UNPROVED | 0 / 0 | 0 | unproved |
| `N001` | `scripts/pm_dcw_event_oracles.py:335` | PROVED | 1 / 1 | 5 | matches |
| `N002` | `scripts/pm_dcw_event_oracles.py:1030` | PROVED | 1 / 1 | 5 | matches |
| `H001` | `scripts/pm_dcw_event_oracles.py:280` | PROVED | 1 / 1 | 5 | matches |
| `H002` | `scripts/pm_bundle_revision_events.py:39` | PROVED | 1 / 1 | 1 | matches |
| `N003` | `scripts/pm_dcw_event_oracles.py:1055` | PROVED | 1 / 1 | 1 | matches |
| `N004` | `scripts/pm_dcw_event_oracles.py:863` | PROVED | 1 / 1 | 0 | matches |
| `F001` | `scripts/pm_dcw_event_oracles.py:937` | PROVED | 1 / 1 | 0 | matches |
| `F002` | `scripts/pm_dcw_event_oracles.py:938` | PROVED | 1 / 1 | 0 | matches |
| `F003` | `scripts/pm_dcw_event_oracles.py:939` | PROVED | 1 / 1 | 0 | matches |
| `F004` | `scripts/pm_dcw_event_oracles.py:940` | PROVED | 1 / 1 | 0 | matches |
| `F005` | `scripts/pm_dcw_event_oracles.py:941` | PROVED | 1 / 1 | 0 | matches |
| `F006` | `scripts/pm_dcw_event_oracles.py:1085` | PROVED | 1 / 1 | 0 | matches |

## Every unproved guard: reason and path:line proof

Each unproved row is by construction and sits alone in its own table, so no proved row loses table credit.

| Guard | Table | Predicate | Proof (`path:line`) | Why no single-defect witness exists |
|---|---:|---|---|---|
| `O014` | 47 | payload['event_type'] == row['event_type'] | Payload schema fixes `event_type` const (`Plans/event_payloads/bundle_revision/revision_requested.schema.json:61`), enforced in `event_body` (`scripts/pm_dcw_event_oracles.py:241`) before O014 (`:270`) | Schema refuses first (`OE001`) |
| `O041` | 53 | receipt['durability_state'] == 'synced' | `durability_state` const `synced` (`Plans/event_append_receipt_contracts.schema.json:61`), custody schema (`scripts/pm_dcw_event_oracles.py:309`) before O041 (`:328`) | Schema refuses first |
| `O077` | 65 | p['predecessor_event_id'] not in settled | Same predecessor/`settled` as O057 (`scripts/pm_dcw_event_oracles.py:371`); `settled` changes only after O077 (`:408`, `settled.add` at `:409`) | Entailed second site; no duplicate-set credit |
| `O108` | 75 | result['status'] == 'opened' | Result `status` const `opened` (`Plans/dcw/wizard_open_evidence.schema.json:337`), inline source schema (`scripts/pm_dcw_event_oracles.py:424`) before O108 (`:460`) | Schema refuses first |
| `O109` | 76 | p['predecessor_event_id'] is None | Opened payload predecessor is `type: null` (`Plans/event_payloads/planning_wizard/wizard_opened.schema.json:117`) | Schema refuses first |
| `O110` | 77 | result['status'] == 'seed_loaded' | Result `status` const `seed_loaded` (`Plans/dcw/wizard_seed_load_evidence.schema.json:337`), inline source schema (`scripts/pm_dcw_event_oracles.py:424`) before O110 (`:463`) | Schema refuses first |
| `O117` | 80 | frontier['coverage']['complete_to_captured_boundary'] is True | Coverage flag is `const: true` (`Plans/event_record_index_checkpoint.schema.json:343`), checkpoint schema (`scripts/pm_dcw_event_oracles.py:479`) before O117 (`:483`) | Schema refuses first |
| `O124` | 82 | len(reader['durable_token']) == 9 | O123 exact durable/live equality (`scripts/pm_dcw_event_oracles.py:490`) plus the closed ten-field live read token (`:480`, `Plans/event_record_index_checkpoint.schema.json:2570`) fixes the nine-field durable length before O124 (`:491`) | Entailed by O123 + schema |
| `O125` | 83 | len(reader['live_token']) == 10 | Read token is closed with exactly 10 required fields (`Plans/event_record_index_checkpoint.schema.json:2570`), live token schema (`scripts/pm_dcw_event_oracles.py:480`) before O125 (`:492`) | Schema refuses first |
| `B001` | 125 | event['event_type'] == p['event_type'] | Row is derived from the envelope type (`scripts/pm_dcw_blockage_events.py:27`) and the payload fixes the same const (`Plans/event_payloads/planning_wizard/wizard_blocked.schema.json:32`) before B001 (`:29`) | Schema refuses first |
| `B054` | 131 | previous is not None | Unblocked payload predecessor is a required string (`Plans/event_payloads/planning_wizard/wizard_unblocked.schema.json:68`); `previous` is null only when it is null (`scripts/pm_dcw_blockage_events.py:126`, B054 at `:152`) | Schema refuses first |
| `L001` | 142 | payload['ts'].endswith('Z') | Payload `ts` requires `Z$` and the shared date_time EventRecord format check (`Plans/event_payloads/bundle_revision/revision_requested.schema.json:81-85`, `scripts/pm_dcw_event_oracles.py:854-864`) before `scripts/pm_bundle_revision_events.py:18` | Schema refuses first |
| `OE007` | 155 | bundle_source: intrinsic parser/schema status | `check_schema` converts `ValidationError` and date_time refusals to the OE001 refusal (`scripts/pm_dcw_event_oracles.py:96-123`); that Refusal is re-raised at `:374` before the legacy `AssertionError`/`ValidationError` fallback at `:377-378`; canonical `validate` raises neither otherwise | Dead fallback with the canonical callback |
| `LE001` | 160 | date_time(payload['ts'], profile=EVENT_RECORD) is the payload timestamp parser | The payload schema format check is the same `pm_event_datetime.date_time` EventRecord predicate (`scripts/pm_dcw_event_oracles.py:854-864`) as `scripts/pm_bundle_revision_events.py:20`; no value passes the first and fails the second | No parser-only value survives |

## Full-path diagnostic cuts

{"AttributeError": 3, "IndexError": 3, "KeyError": 1, "RecursionError": 1, "TypeError": 15, "UnboundLocalError": 7, "accept": 936, "causation": 4, "clearing_action_before": 1, "completion_outputs": 1, "current_child_join": 1, "durable_token": 8, "family": 1, "idempotency_conflict": 2, "identifier_whitespace": 6, "index_coverage": 6, "index_currentness": 3, "index_generation_identity": 9, "index_row_membership": 5, "index_row_source": 2, "index_source_binding": 12, "index_source_bytes": 1, "index_source_coverage": 1, "index_source_gaps": 3, "latest_source_event": 3, "materialized_source": 1, "original_authority": 18, "original_binding": 5, "original_document": 1, "original_observation": 1, "original_receipt_equality": 2, "phase_order": 11, "phase_sequence": 1, "registered_schema_pointer": 1, "registered_schema_ref": 1, "restore_member": 1, "restore_source_inventory": 1, "schema": 9, "scope": 1, "scope_project_id": 1, "secret_or_path": 1, "source_phase_identity": 1, "token_shape": 6, "writer_policy": 1}

These are ordinary complete-checker diagnostics using one disabled named row, outside the gated phase boundary. A later refusal or a derivation exception earns no complete-boundary credit. Accepting diagnostics do not certify the whole boundary. Full lists are preserved in `guard-results.json.gz`.

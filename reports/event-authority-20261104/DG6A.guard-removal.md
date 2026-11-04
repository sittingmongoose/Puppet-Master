# DG6A round 5 guard-removal table

Source: scripts/pm-dg6a-guard-check.py. All mutants run in memory and restore the exact original function in finally. No guard in the shipped checker is weakened. The complete evidence JSON records every rejected name and every changed diagnostic.

**229/229 guard rows pass:** 130 current-operation/payload/protocol/checkpoint/profile/schema/pager source rejection sites plus 99 historical rows (11 guards across nine reader versions). **660 current negatives** are swept across all applicable source sites. **54 duplicate witnesses** require **11 named pair matrices**. Every other current negative has a singleton removal that permits it. Eighteen retained-history positives cover current/v1 payloads, current/replay-only retained policy, and absent live state.

A source row tests all negatives in its kind (alert/panel/concern); a history row tests the listed family/version. “All others” means the exact complement of the flipping names within that row, including each remaining negative’s original reason, except the explicitly named duplicate diagnostics recorded in JSON. All 55 changed-but-still-rejected diagnostics are covered by named duplicate proofs. A source loop is one guard site and its field-specific witnesses are listed separately. Conditional guards for snooze/protection, Home/application context and detached windows apply only when their branch is reachable.

| Row | Scope and source guard | Negatives that flip | Negatives that stay rejected | Named duplicate removed with it |
|---|---|---|---|---|
| G001 | alert: `errors:24 schema validation` | N039, N041, N046, N132, N134, N139, N224, N226, N232, N321, N323, N331 | All other 365 in this scope | — |
| G002 | alert: `errors:28 'non-successor'` | N042, N044, N135, N137, N227, N230, N324, N329 | All other 369 in this scope | — |
| G003 | alert: `errors:30 'uncommitted/stale/refused'` | N045, N043, N040, N086, N084, N085, N138, N136, N133, N179, N177, N178, N231, N229, N225, N271, N269, N270, N330, N328, N322, N370, N368, N369 | All other 353 in this scope | — |
| G004 | alert: `errors:32 'invalid protection proof'` | N087, N180, N272, N371 | All other 373 in this scope | — |
| G005 | alert: `errors:34 'expired snooze'` | N320, N325, N326 | All other 374 in this scope | — |
| G006 | alert: `errors:36 'protected interruption'` | N228, N327 | All other 375 in this scope | — |
| G007 | alert: `operation_errors:77 schema validation` | N026, N119, N211, N307 | All other 373 in this scope | — |
| G008 | alert: `operation_errors:79 'operation exceeds 16384 encoded bytes'` | N025, N118, N210, N304 | All other 373 in this scope | — |
| G009 | alert: `operation_errors:87 'operation identity digest mismatch'` | N001, N094, N187, N279 | All other 373 in this scope | — |
| G010 | alert: `operation_errors:89 'event identity mismatch'` | N023, N116, N208, N302 | All other 373 in this scope | — |
| G011 | alert: `operation_errors:91 'frozen command digest mismatch'` | N002, N077, N076, N074, N095, N170, N169, N167, N188, N262, N261, N259, N280, N361, N360, N358 | All other 361 in this scope | — |
| G012 | alert: `operation_errors:94 'original command/payload field presence'` | N028, N121, N213, N309 | All other 373 in this scope | — |
| G013 | alert: `operation_errors:102 'non-successor'` | N024, N117, N209, N303 | All other 373 in this scope | — |
| G014 | alert: `operation_errors:128 'expired snooze'` | N301, N305, N306 | All other 374 in this scope | — |
| G015 | alert: `operation_errors:97 'original command/payload ' + key` | N022, N017, N018, N016, N020, N019, N021, N027, N115, N110, N111, N109, N113, N112, N114, N120, N207, N202, N203, N201, N205, N204, N206, N212, N300, N295, N296, N294, N298, N297, N299, N308 | All other 345 in this scope | — |
| G016 | alert: `operation_errors:100 'operation/payload ' + key` | N083, N082, N176, N175, N268, N267, N367, N366 | All other 369 in this scope | — |
| G017 | alert: `operation_errors:117 'candidate owner root_cause_ref'` | N239, N194 | All other 375 in this scope | — |
| G018 | alert: `operation_errors:119 'candidate owner mute_expires_at'` | N190 | All other 376 in this scope | — |
| G019 | alert: `operation_errors:114 name + ' owner ' + field` | N052, N050, N053, N055, N049, N006, N004, N007, N009, N003, N144, N143, N145, N147, N142, N099, N097, N100, N102, N096, N237, N235, N238, N240, N236, N192, N189, N193, N195, N191, N336, N335, N337, N338, N334, N284, N282, N285, N287, N281 | All other 337 in this scope | — |
| G020 | alert: `operation_errors:126 'candidate owner ' + field` | N051, N054, N010, N005, N008, N148, N146, N103, N098, N101, N339, N288, N283, N286 | All other 363 in this scope | — |
| G021 | alert: `protocol_errors:150 'wrong original receipt'` | N064, N157, N249, N348 | All other 373 in this scope | — |
| G022 | alert: `protocol_errors:152 'idempotency_conflict'` | N079, N078, N172, N171, N264, N263, N363, N362 | All other 369 in this scope | — |
| G023 | alert: `protocol_errors:148 field` | N061, N062, N063, N066, N088, N089, N090, N091, N154, N155, N156, N159, N181, N182, N183, N184, N246, N247, N248, N251, N273, N274, N275, N276, N345, N346, N347, N350, N372, N373, N374, N375 | All other 345 in this scope | — |
| G024 | alert: `checkpoint_errors:180 schema validation` | N013, N014, N106, N107, N198, N199, N291, N292 | All other 369 in this scope | — |
| G025 | alert: `checkpoint_errors:182 'checkpoint exceeds 16384 encoded bytes'` | N011, N104, N196, N289 | All other 373 in this scope | — |
| G026 | alert: `checkpoint_errors:186 'foreign Storage token'` | N015, N108, N200, N293 | All other 373 in this scope | — |
| G027 | alert: `checkpoint_errors:189 'foreign original-event context: ' + field` | N012, N105, N197, N290 | All other 373 in this scope | — |
| G028 | alert: `profile_errors:208 ['missing profile']` | N058, N151, N243, N342 | All other 373 in this scope | — |
| G029 | alert: `profile_errors:211 ['wrong physical binding']` | N059, N060, N152, N153, N244, N245, N343, N344 | All other 369 in this scope | — |
| G030 | alert: `profile_errors:214 ['non-integer maximum']` | N092, N093, N185, N186, N277, N278, N376, N377 | All other 369 in this scope | — |
| G031 | alert: `profile_errors:216 ['missing/oversized maximum']` | N056, N057, N149, N150, N241, N242, N340, N341 | All other 369 in this scope | — |
| G032 | alert: `writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection)` | N065, N047, N048, N158, N140, N141, N250, N233, N234, N349, N332, N333 | All other 365 in this scope | writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| G033 | alert: `writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy']` | N048, N141, N234, N333 | All other 373 in this scope | — |
| G034 | alert: `schema_ref_errors:61 ValueError('target is not a schema')` | N069, N162, N254, N353 | All other 373 in this scope | — |
| G035 | alert: `schema_ref_errors:63 'unresolved schema reference: ' + str(ref)` | N067, N069, N068, N081, N160, N162, N161, N174, N252, N254, N253, N266, N351, N353, N352, N365 | All other 361 in this scope | — |
| G036 | alert: `schema_ref_errors:56 ValueError('unsupported non-local reference')` | N068, N161, N253, N352 | All other 373 in this scope | — |
| G037 | alert: `history_page:256 after > frontier or len(packed(response([], after))) > 16384` | N029, N034, N122, N127, N214, N219, N310, N315 | All other 369 in this scope | — |
| G038 | alert: `history_page:261 not after < seq <= frontier` | N035, N032, N128, N125, N220, N217, N316, N313 | All other 369 in this scope | — |
| G039 | alert: `history_page:263 exact event family and Project filter` | N030, N031, N123, N124, N215, N216, N311, N312 | All other 369 in this scope | — |
| G040 | alert: `history_page:265 scanned == 256 or len(candidate) > 64` | N037, N033, N130, N126, N222, N218, N318, N314 | All other 369 in this scope | — |
| G041 | alert: `history_page:267 len(packed(response(candidate, seq))) > 16384` | N038, N036, N131, N129, N223, N221, N319, N317 | All other 369 in this scope | — |
| G042 | alert: `history_page:268 not result` | N038, N131, N223, N319 | All other 373 in this scope | — |
| G043 | alert: `check_schema:73 schema metaschema validity` | N080, N173, N265, N364 | All other 373 in this scope | — |
| G044 | alert: `check_schema:74 eager resolution of every schema reference` | N081, N174, N266, N365 | All other 373 in this scope | — |
| G045 | panel: `operation_errors:57 schema validation` | N524, N613 | All other 176 in this scope | — |
| G046 | panel: `operation_errors:59 'operation too large'` | N523, N612 | All other 176 in this scope | — |
| G047 | panel: `operation_errors:66 'frozen command digest mismatch'` | N508, N597 | All other 176 in this scope | — |
| G048 | panel: `operation_errors:71 'frozen command window mismatch'` | N609 | All other 177 in this scope | — |
| G049 | panel: `operation_errors:77 'original identity mismatch'` | N521, N507, N575, N574, N572, N610, N596, N664, N663, N661 | All other 168 in this scope | — |
| G050 | panel: `operation_errors:69 'frozen command/payload ' + key` | N518, N519, N607, N608 | All other 174 in this scope | — |
| G051 | panel: `operation_errors:74 'operation/payload ' + key` | N589, N588, N586, N587, N584, N585, N678, N677, N675, N676, N673, N674 | All other 166 in this scope | — |
| G052 | panel: `operation_errors:83 'original host snapshot mismatch'` | N550, N552, N551, N509, N511, N510, N639, N641, N640, N598, N600, N599 | All other 166 in this scope | — |
| G053 | panel: `operation_errors:85 'original window mismatch'` | N553, N512, N642, N601 | All other 174 in this scope | — |
| G054 | panel: `operation_errors:90 'original result/receipt mismatch'` | N526, N527, N525, N615, N616, N614 | All other 172 in this scope | — |
| G055 | panel: `protocol_errors:104 'family absent'` | N559, N591, N648, N680 | All other 174 in this scope | — |
| G056 | panel: `protocol_errors:106 'unsupported web'` | N562, N592, N651, N681 | All other 174 in this scope | — |
| G057 | panel: `protocol_errors:108 'unverified source'` | N567, N593, N656, N682 | All other 174 in this scope | — |
| G058 | panel: `protocol_errors:110 'wrong original receipt'` | N564, N653 | All other 176 in this scope | — |
| G059 | panel: `protocol_errors:112 'forged original event identity'` | N560, N649 | All other 176 in this scope | — |
| G060 | panel: `protocol_errors:114 'prior session cannot act'` | N566, N655 | All other 176 in this scope | — |
| G061 | panel: `protocol_errors:116 'wrong window'` | N568, N657 | All other 176 in this scope | — |
| G062 | panel: `protocol_errors:118 'retry changed'` | N581, N580, N670, N669 | All other 174 in this scope | — |
| G063 | panel: `protocol_errors:120 'unavailable publication/cursor'` | N563, N561, N652, N650 | All other 174 in this scope | — |
| G064 | panel: `checkpoint_errors:52 'checkpoint scope mismatch'` | N515, N604 | All other 176 in this scope | — |
| G065 | panel: `payload_errors:24 schema validation` | N542, N539, N544, N546, N543, N547, N540, N631, N628, N633, N635, N632, N636, N629 | All other 164 in this scope | — |
| G066 | panel: `payload_errors:29 'scope mismatch'` | N545, N634 | All other 176 in this scope | — |
| G067 | panel: `payload_errors:35 'missing original Home context'` | N522, N611 | All other 176 in this scope | — |
| G068 | panel: `payload_errors:37 'not host revision successor'` | N541, N590, N630, N679 | All other 174 in this scope | — |
| G069 | panel: `payload_errors:33 'CV-366 application idempotency key mismatch'` | N538, N627 | All other 176 in this scope | — |
| G070 | panel: `checkpoint_errors:180 schema validation` | N516, N605 | All other 176 in this scope | — |
| G071 | panel: `checkpoint_errors:182 'checkpoint exceeds 16384 encoded bytes'` | N513, N602 | All other 176 in this scope | — |
| G072 | panel: `checkpoint_errors:186 'foreign Storage token'` | N517, N606 | All other 176 in this scope | — |
| G073 | panel: `checkpoint_errors:189 'foreign original-event context: ' + field` | N514, N603 | All other 176 in this scope | — |
| G074 | panel: `profile_errors:208 ['missing profile']` | N556, N645 | All other 176 in this scope | — |
| G075 | panel: `profile_errors:211 ['wrong physical binding']` | N557, N558, N646, N647 | All other 174 in this scope | — |
| G076 | panel: `profile_errors:214 ['non-integer maximum']` | N594, N595, N683, N684 | All other 174 in this scope | — |
| G077 | panel: `profile_errors:216 ['missing/oversized maximum']` | N554, N555, N643, N644 | All other 174 in this scope | — |
| G078 | panel: `writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection)` | N565, N548, N549, N654, N637, N638 | All other 172 in this scope | writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| G079 | panel: `writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy']` | N549, N638 | All other 176 in this scope | — |
| G080 | panel: `schema_ref_errors:61 ValueError('target is not a schema')` | N571, N660 | All other 176 in this scope | — |
| G081 | panel: `schema_ref_errors:63 'unresolved schema reference: ' + str(ref)` | N569, N571, N570, N583, N658, N660, N659, N672 | All other 170 in this scope | — |
| G082 | panel: `schema_ref_errors:56 ValueError('unsupported non-local reference')` | N570, N659 | All other 176 in this scope | — |
| G083 | panel: `history_page:256 after > frontier or len(packed(response([], after))) > 16384` | N528, N533, N617, N622 | All other 174 in this scope | — |
| G084 | panel: `history_page:261 not after < seq <= frontier` | N534, N531, N623, N620 | All other 174 in this scope | — |
| G085 | panel: `history_page:263 exact event family and Project filter` | N529, N530, N618, N619 | All other 174 in this scope | — |
| G086 | panel: `history_page:265 scanned == 256 or len(candidate) > 64` | N536, N532, N625, N621 | All other 174 in this scope | — |
| G087 | panel: `history_page:267 len(packed(response(candidate, seq))) > 16384` | N537, N535, N626, N624 | All other 174 in this scope | — |
| G088 | panel: `history_page:268 not result` | N537, N626 | All other 176 in this scope | — |
| G089 | panel: `check_schema:73 schema metaschema validity` | N582, N671 | All other 176 in this scope | — |
| G090 | panel: `check_schema:74 eager resolution of every schema reference` | N583, N672 | All other 176 in this scope | — |
| G091 | concern: `operation_errors:30 schema validation` | N430 | All other 104 in this scope | — |
| G092 | concern: `operation_errors:36 nested payload schema validation` | N430, N428 | All other 103 in this scope | operation_errors:30 schema validation |
| G093 | concern: `operation_errors:32 'operation exceeds 16384 bytes'` | N429 | All other 104 in this scope | — |
| G094 | concern: `operation_errors:40 'original identity mismatch'` | N427, N378 | All other 103 in this scope | — |
| G095 | concern: `operation_errors:42 'frozen command/payload/record digest mismatch'` | N379 | All other 104 in this scope | — |
| G096 | concern: `operation_errors:44 'Project partition mismatch'` | N441 | All other 104 in this scope | — |
| G097 | concern: `operation_errors:50 'original scope/key mismatch'` | N474, N473 | All other 103 in this scope | — |
| G098 | concern: `operation_errors:52 'creator/actor mismatch'` | N422 | All other 104 in this scope | — |
| G099 | concern: `operation_errors:54 'original revision-one record ref mismatch'` | N470 | All other 104 in this scope | — |
| G100 | concern: `operation_errors:47 'original command/payload ' + key` | N421, N419, N420 | All other 102 in this scope | — |
| G101 | concern: `operation_errors:68 'original candidate record ' + key` | N400, N391, N404, N390, N407, N409, N398, N399, N395, N393, N394, N410, N408, N396, N386, N397, N411, N392, N412, N413, N387, N389, N388, N401, N403, N402, N406, N405 | All other 77 in this scope | — |
| G102 | concern: `protocol_errors:79 'existing concern cannot be recreated'` | N458, N451, N480, N477 | All other 101 in this scope | — |
| G103 | concern: `protocol_errors:85 'nomination or owner label grants no creation'` | N426, N425, N423, N424 | All other 101 in this scope | — |
| G104 | concern: `protocol_errors:87 'wrong original receipt'` | N454 | All other 104 in this scope | — |
| G105 | concern: `protocol_errors:89 'idempotency_conflict'` | N456 | All other 104 in this scope | — |
| G106 | concern: `protocol_errors:91 'withdrawn History'` | N453 | All other 104 in this scope | — |
| G107 | concern: `protocol_errors:77 key` | N449, N450, N457, N452, N475, N476, N479, N478 | All other 97 in this scope | — |
| G108 | concern: `protocol_errors:83 'independent authority ' + key` | N380, N384, N381, N382, N383, N385 | All other 99 in this scope | — |
| G109 | concern: `checkpoint_errors:100 'Project checkpoint partition mismatch'` | N416 | All other 104 in this scope | — |
| G110 | concern: `checkpoint_errors:180 schema validation` | N417 | All other 104 in this scope | — |
| G111 | concern: `checkpoint_errors:182 'checkpoint exceeds 16384 encoded bytes'` | N414 | All other 104 in this scope | — |
| G112 | concern: `checkpoint_errors:186 'foreign Storage token'` | N418 | All other 104 in this scope | — |
| G113 | concern: `checkpoint_errors:189 'foreign original-event context: ' + field` | N415 | All other 104 in this scope | — |
| G114 | concern: `profile_errors:208 ['missing profile']` | N446 | All other 104 in this scope | — |
| G115 | concern: `profile_errors:211 ['wrong physical binding']` | N447, N448 | All other 103 in this scope | — |
| G116 | concern: `profile_errors:214 ['non-integer maximum']` | N481, N482 | All other 103 in this scope | — |
| G117 | concern: `profile_errors:216 ['missing/oversized maximum']` | N444, N445 | All other 103 in this scope | — |
| G118 | concern: `writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection)` | N455, N442, N443 | All other 102 in this scope | writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| G119 | concern: `writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy']` | N443 | All other 104 in this scope | — |
| G120 | concern: `schema_ref_errors:61 ValueError('target is not a schema')` | N461 | All other 104 in this scope | — |
| G121 | concern: `schema_ref_errors:63 'unresolved schema reference: ' + str(ref)` | N459, N461, N460, N472 | All other 101 in this scope | — |
| G122 | concern: `schema_ref_errors:56 ValueError('unsupported non-local reference')` | N460 | All other 104 in this scope | — |
| G123 | concern: `history_page:256 after > frontier or len(packed(response([], after))) > 16384` | N431, N436 | All other 103 in this scope | — |
| G124 | concern: `history_page:261 not after < seq <= frontier` | N437, N434 | All other 103 in this scope | — |
| G125 | concern: `history_page:263 exact event family and Project filter` | N432, N433 | All other 103 in this scope | — |
| G126 | concern: `history_page:265 scanned == 256 or len(candidate) > 64` | N439, N435 | All other 103 in this scope | — |
| G127 | concern: `history_page:267 len(packed(response(candidate, seq))) > 16384` | N440, N438 | All other 103 in this scope | — |
| G128 | concern: `history_page:268 not result` | N440 | All other 104 in this scope | — |
| G129 | concern: `check_schema:73 schema metaschema validity` | N471 | All other 104 in this scope | — |
| G130 | concern: `check_schema:74 eager resolution of every schema reference` | N472 | All other 104 in this scope | — |
| G131 | alert.acknowledged/current: `historical_guards checkpoint_publication` | N715, N686 | All other 54 in this scope | — |
| G132 | alert.acknowledged/current: `historical_guards checkpoint_original` | N493, N488, N494, N487 | All other 52 in this scope | — |
| G133 | alert.acknowledged/current: `historical_guards event_publication` | N716, N687 | All other 54 in this scope | — |
| G134 | alert.acknowledged/current: `historical_guards event_original` | N496, N495, N490, N489, N506, N503, N504, N505, N707 | All other 47 in this scope | — |
| G135 | alert.acknowledged/current: `historical_guards historical_payload` | N500, N499, N714, N710 | All other 52 in this scope | — |
| G136 | alert.acknowledged/current: `historical_guards original_receipt` | N498, N491, N497, N706, N688, N705, N702, N695, N699, N697, N698, N690, N691, N692, N694, N693, N696, N689, N701, N704, N703, N700, N712, N709, N708, N711 | All other 30 in this scope | — |
| G137 | alert.acknowledged/current: `historical_guards original_source` | N501, N492, N713 | All other 53 in this scope | — |
| G138 | alert.acknowledged/current: `historical_guards original_admission` | N502 | All other 55 in this scope | — |
| G139 | alert.acknowledged/current: `historical_guards current_permission` | N484, N483, N485 | All other 53 in this scope | — |
| G140 | alert.acknowledged/current: `historical_guards source_retained` | N685 | All other 55 in this scope | — |
| G141 | alert.acknowledged/current: `historical_guards current_withdrawal` | N486 | All other 55 in this scope | — |
| G142 | alert.dismissed/current: `historical_guards checkpoint_publication` | N715, N686 | All other 54 in this scope | — |
| G143 | alert.dismissed/current: `historical_guards checkpoint_original` | N493, N488, N494, N487 | All other 52 in this scope | — |
| G144 | alert.dismissed/current: `historical_guards event_publication` | N716, N687 | All other 54 in this scope | — |
| G145 | alert.dismissed/current: `historical_guards event_original` | N496, N495, N490, N489, N506, N503, N504, N505, N707 | All other 47 in this scope | — |
| G146 | alert.dismissed/current: `historical_guards historical_payload` | N500, N499, N714, N710 | All other 52 in this scope | — |
| G147 | alert.dismissed/current: `historical_guards original_receipt` | N498, N491, N497, N706, N688, N705, N702, N695, N699, N697, N698, N690, N691, N692, N694, N693, N696, N689, N701, N704, N703, N700, N712, N709, N708, N711 | All other 30 in this scope | — |
| G148 | alert.dismissed/current: `historical_guards original_source` | N501, N492, N713 | All other 53 in this scope | — |
| G149 | alert.dismissed/current: `historical_guards original_admission` | N502 | All other 55 in this scope | — |
| G150 | alert.dismissed/current: `historical_guards current_permission` | N484, N483, N485 | All other 53 in this scope | — |
| G151 | alert.dismissed/current: `historical_guards source_retained` | N685 | All other 55 in this scope | — |
| G152 | alert.dismissed/current: `historical_guards current_withdrawal` | N486 | All other 55 in this scope | — |
| G153 | alert.rule_muted/current: `historical_guards checkpoint_publication` | N715, N686 | All other 54 in this scope | — |
| G154 | alert.rule_muted/current: `historical_guards checkpoint_original` | N493, N488, N494, N487 | All other 52 in this scope | — |
| G155 | alert.rule_muted/current: `historical_guards event_publication` | N716, N687 | All other 54 in this scope | — |
| G156 | alert.rule_muted/current: `historical_guards event_original` | N496, N495, N490, N489, N506, N503, N504, N505, N707 | All other 47 in this scope | — |
| G157 | alert.rule_muted/current: `historical_guards historical_payload` | N500, N499, N714, N710 | All other 52 in this scope | — |
| G158 | alert.rule_muted/current: `historical_guards original_receipt` | N498, N491, N497, N706, N688, N705, N702, N695, N699, N697, N698, N690, N691, N692, N694, N693, N696, N689, N701, N704, N703, N700, N712, N709, N708, N711 | All other 30 in this scope | — |
| G159 | alert.rule_muted/current: `historical_guards original_source` | N501, N492, N713 | All other 53 in this scope | — |
| G160 | alert.rule_muted/current: `historical_guards original_admission` | N502 | All other 55 in this scope | — |
| G161 | alert.rule_muted/current: `historical_guards current_permission` | N484, N483, N485 | All other 53 in this scope | — |
| G162 | alert.rule_muted/current: `historical_guards source_retained` | N685 | All other 55 in this scope | — |
| G163 | alert.rule_muted/current: `historical_guards current_withdrawal` | N486 | All other 55 in this scope | — |
| G164 | alert.snoozed/current: `historical_guards checkpoint_publication` | N715, N686 | All other 54 in this scope | — |
| G165 | alert.snoozed/current: `historical_guards checkpoint_original` | N493, N488, N494, N487 | All other 52 in this scope | — |
| G166 | alert.snoozed/current: `historical_guards event_publication` | N716, N687 | All other 54 in this scope | — |
| G167 | alert.snoozed/current: `historical_guards event_original` | N496, N495, N490, N489, N506, N503, N504, N505, N707 | All other 47 in this scope | — |
| G168 | alert.snoozed/current: `historical_guards historical_payload` | N500, N499, N714, N710 | All other 52 in this scope | — |
| G169 | alert.snoozed/current: `historical_guards original_receipt` | N498, N491, N497, N706, N688, N705, N702, N695, N699, N697, N698, N690, N691, N692, N694, N693, N696, N689, N701, N704, N703, N700, N712, N709, N708, N711 | All other 30 in this scope | — |
| G170 | alert.snoozed/current: `historical_guards original_source` | N501, N492, N713 | All other 53 in this scope | — |
| G171 | alert.snoozed/current: `historical_guards original_admission` | N502 | All other 55 in this scope | — |
| G172 | alert.snoozed/current: `historical_guards current_permission` | N484, N483, N485 | All other 53 in this scope | — |
| G173 | alert.snoozed/current: `historical_guards source_retained` | N685 | All other 55 in this scope | — |
| G174 | alert.snoozed/current: `historical_guards current_withdrawal` | N486 | All other 55 in this scope | — |
| G175 | panel.redocked/current: `historical_guards checkpoint_publication` | N715, N686 | All other 54 in this scope | — |
| G176 | panel.redocked/current: `historical_guards checkpoint_original` | N493, N488, N494, N487 | All other 52 in this scope | — |
| G177 | panel.redocked/current: `historical_guards event_publication` | N716, N687 | All other 54 in this scope | — |
| G178 | panel.redocked/current: `historical_guards event_original` | N496, N495, N490, N489, N506, N503, N504, N505, N707 | All other 47 in this scope | — |
| G179 | panel.redocked/current: `historical_guards historical_payload` | N500, N499, N714, N710 | All other 52 in this scope | — |
| G180 | panel.redocked/current: `historical_guards original_receipt` | N498, N491, N497, N706, N688, N705, N702, N695, N699, N697, N698, N690, N691, N692, N694, N693, N696, N689, N701, N704, N703, N700, N712, N709, N708, N711 | All other 30 in this scope | — |
| G181 | panel.redocked/current: `historical_guards original_source` | N501, N492, N713 | All other 53 in this scope | — |
| G182 | panel.redocked/current: `historical_guards original_admission` | N502 | All other 55 in this scope | — |
| G183 | panel.redocked/current: `historical_guards current_permission` | N484, N483, N485 | All other 53 in this scope | — |
| G184 | panel.redocked/current: `historical_guards source_retained` | N685 | All other 55 in this scope | — |
| G185 | panel.redocked/current: `historical_guards current_withdrawal` | N486 | All other 55 in this scope | — |
| G186 | panel.redocked/v1: `historical_guards checkpoint_publication` | N715, N686 | All other 54 in this scope | — |
| G187 | panel.redocked/v1: `historical_guards checkpoint_original` | N493, N488, N494, N487 | All other 52 in this scope | — |
| G188 | panel.redocked/v1: `historical_guards event_publication` | N716, N687 | All other 54 in this scope | — |
| G189 | panel.redocked/v1: `historical_guards event_original` | N496, N495, N490, N489, N506, N503, N504, N505, N707 | All other 47 in this scope | — |
| G190 | panel.redocked/v1: `historical_guards historical_payload` | N500, N499, N714, N710 | All other 52 in this scope | — |
| G191 | panel.redocked/v1: `historical_guards original_receipt` | N498, N491, N497, N706, N688, N705, N702, N695, N699, N697, N698, N690, N691, N692, N694, N693, N696, N689, N701, N704, N703, N700, N712, N709, N708, N711 | All other 30 in this scope | — |
| G192 | panel.redocked/v1: `historical_guards original_source` | N501, N492, N713 | All other 53 in this scope | — |
| G193 | panel.redocked/v1: `historical_guards original_admission` | N502 | All other 55 in this scope | — |
| G194 | panel.redocked/v1: `historical_guards current_permission` | N484, N483, N485 | All other 53 in this scope | — |
| G195 | panel.redocked/v1: `historical_guards source_retained` | N685 | All other 55 in this scope | — |
| G196 | panel.redocked/v1: `historical_guards current_withdrawal` | N486 | All other 55 in this scope | — |
| G197 | panel.undocked/current: `historical_guards checkpoint_publication` | N715, N686 | All other 54 in this scope | — |
| G198 | panel.undocked/current: `historical_guards checkpoint_original` | N493, N488, N494, N487 | All other 52 in this scope | — |
| G199 | panel.undocked/current: `historical_guards event_publication` | N716, N687 | All other 54 in this scope | — |
| G200 | panel.undocked/current: `historical_guards event_original` | N496, N495, N490, N489, N506, N503, N504, N505, N707 | All other 47 in this scope | — |
| G201 | panel.undocked/current: `historical_guards historical_payload` | N500, N499, N714, N710 | All other 52 in this scope | — |
| G202 | panel.undocked/current: `historical_guards original_receipt` | N498, N491, N497, N706, N688, N705, N702, N695, N699, N697, N698, N690, N691, N692, N694, N693, N696, N689, N701, N704, N703, N700, N712, N709, N708, N711 | All other 30 in this scope | — |
| G203 | panel.undocked/current: `historical_guards original_source` | N501, N492, N713 | All other 53 in this scope | — |
| G204 | panel.undocked/current: `historical_guards original_admission` | N502 | All other 55 in this scope | — |
| G205 | panel.undocked/current: `historical_guards current_permission` | N484, N483, N485 | All other 53 in this scope | — |
| G206 | panel.undocked/current: `historical_guards source_retained` | N685 | All other 55 in this scope | — |
| G207 | panel.undocked/current: `historical_guards current_withdrawal` | N486 | All other 55 in this scope | — |
| G208 | panel.undocked/v1: `historical_guards checkpoint_publication` | N715, N686 | All other 54 in this scope | — |
| G209 | panel.undocked/v1: `historical_guards checkpoint_original` | N493, N488, N494, N487 | All other 52 in this scope | — |
| G210 | panel.undocked/v1: `historical_guards event_publication` | N716, N687 | All other 54 in this scope | — |
| G211 | panel.undocked/v1: `historical_guards event_original` | N496, N495, N490, N489, N506, N503, N504, N505, N707 | All other 47 in this scope | — |
| G212 | panel.undocked/v1: `historical_guards historical_payload` | N500, N499, N714, N710 | All other 52 in this scope | — |
| G213 | panel.undocked/v1: `historical_guards original_receipt` | N498, N491, N497, N706, N688, N705, N702, N695, N699, N697, N698, N690, N691, N692, N694, N693, N696, N689, N701, N704, N703, N700, N712, N709, N708, N711 | All other 30 in this scope | — |
| G214 | panel.undocked/v1: `historical_guards original_source` | N501, N492, N713 | All other 53 in this scope | — |
| G215 | panel.undocked/v1: `historical_guards original_admission` | N502 | All other 55 in this scope | — |
| G216 | panel.undocked/v1: `historical_guards current_permission` | N484, N483, N485 | All other 53 in this scope | — |
| G217 | panel.undocked/v1: `historical_guards source_retained` | N685 | All other 55 in this scope | — |
| G218 | panel.undocked/v1: `historical_guards current_withdrawal` | N486 | All other 55 in this scope | — |
| G219 | concern.created/current: `historical_guards checkpoint_publication` | N715, N686 | All other 54 in this scope | — |
| G220 | concern.created/current: `historical_guards checkpoint_original` | N493, N488, N494, N487 | All other 52 in this scope | — |
| G221 | concern.created/current: `historical_guards event_publication` | N716, N687 | All other 54 in this scope | — |
| G222 | concern.created/current: `historical_guards event_original` | N496, N495, N490, N489, N506, N503, N504, N505, N707 | All other 47 in this scope | — |
| G223 | concern.created/current: `historical_guards historical_payload` | N500, N499, N714, N710 | All other 52 in this scope | — |
| G224 | concern.created/current: `historical_guards original_receipt` | N498, N491, N497, N706, N688, N705, N702, N695, N699, N697, N698, N690, N691, N692, N694, N693, N696, N689, N701, N704, N703, N700, N712, N709, N708, N711 | All other 30 in this scope | — |
| G225 | concern.created/current: `historical_guards original_source` | N501, N492, N713 | All other 53 in this scope | — |
| G226 | concern.created/current: `historical_guards original_admission` | N502 | All other 55 in this scope | — |
| G227 | concern.created/current: `historical_guards current_permission` | N484, N483, N485 | All other 53 in this scope | — |
| G228 | concern.created/current: `historical_guards source_retained` | N685 | All other 55 in this scope | — |
| G229 | concern.created/current: `historical_guards current_withdrawal` | N486 | All other 55 in this scope | — |

The policy guard deliberately repeats generic unsupported-policy rejection. The concern standalone payload schema deliberately repeats the embedded operation payload schema. The redock command.window_id comparison deliberately repeats the generic command/payload window_id join. Exact derived-digest equality also repeats schema type/representation restrictions; these are named pairs, not unrelated defects.

| Pair | Repeated fact / source sites | Negatives that flip together | Negatives that stay rejected |
|---|---|---|---|
| alert:220+222 | writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | N065, N047, N048, N158, N140, N141, N250, N233, N234, N349, N332, N333 | All other 365 in this kind |
| alert:77+87 | operation_errors:77 schema validation + operation_errors:87 'operation identity digest mismatch' | N001, N026, N071, N073, N072, N070, N094, N119, N164, N166, N165, N163, N187, N211, N256, N258, N257, N255, N279, N307, N355, N357, N356, N354 | All other 353 in this kind |
| alert:77+91 | operation_errors:77 schema validation + operation_errors:91 'frozen command digest mismatch' | N002, N026, N075, N077, N076, N074, N095, N119, N168, N170, N169, N167, N188, N211, N260, N262, N261, N259, N280, N307, N359, N361, N360, N358 | All other 353 in this kind |
| panel:71+69 | operation_errors:71 'frozen command window mismatch' + operation_errors:69 'frozen command/payload ' + key | N518, N519, N520, N607, N608, N609 | All other 172 in this kind |
| panel:220+222 | writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | N565, N548, N549, N654, N637, N638 | All other 172 in this kind |
| panel:57+77 | operation_errors:57 schema validation + operation_errors:77 'original identity mismatch' | N521, N507, N524, N573, N575, N574, N572, N610, N596, N613, N662, N664, N663, N661 | All other 164 in this kind |
| panel:57+66 | operation_errors:57 schema validation + operation_errors:66 'frozen command digest mismatch' | N508, N524, N577, N579, N578, N576, N597, N613, N666, N668, N667, N665 | All other 166 in this kind |
| concern:220+222 | writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | N455, N442, N443 | All other 102 in this kind |
| concern:30+40 | operation_errors:30 schema validation + operation_errors:40 'original identity mismatch' | N427, N378, N430, N463, N465, N464, N462 | All other 98 in this kind |
| concern:30+42 | operation_errors:30 schema validation + operation_errors:42 'frozen command/payload/record digest mismatch' | N379, N430, N467, N469, N468, N466 | All other 99 in this kind |
| concern:30+36 | operation_errors:30 schema validation + operation_errors:36 nested payload schema validation | N430, N428 | All other 103 in this kind |

The same current-disclosure guards run before paging and again after the returning helper. Their repetition is intentional: baseline denials exercise the pair; the five returning-helper revocations per reader independently exercise the second call. The historical matrix removes each named predicate at both call sites and shows only its own negatives disclose. The pager has separate invalid-cursor, metadata, individual-ref, accumulated-response, scan, match and exact-family/Project witnesses.

| Witness | Exact negative name |
|---|---|
| N001 | `alert.acknowledged:arbitrary_operation_digest` |
| N002 | `alert.acknowledged:arbitrary_request_digest` |
| N003 | `alert.acknowledged:candidate_owner_state_acknowledgement_state` |
| N004 | `alert.acknowledged:candidate_owner_state_alert_id` |
| N005 | `alert.acknowledged:candidate_owner_state_inbox_visible` |
| N006 | `alert.acknowledged:candidate_owner_state_project_id` |
| N007 | `alert.acknowledged:candidate_owner_state_revision` |
| N008 | `alert.acknowledged:candidate_owner_state_snooze_until` |
| N009 | `alert.acknowledged:candidate_owner_state_source_record_ref` |
| N010 | `alert.acknowledged:candidate_owner_state_unread` |
| N011 | `alert.acknowledged:checkpoint_bytes_only` |
| N012 | `alert.acknowledged:checkpoint_original_storage` |
| N013 | `alert.acknowledged:checkpoint_partition_only` |
| N014 | `alert.acknowledged:checkpoint_schema_only` |
| N015 | `alert.acknowledged:checkpoint_token_storage` |
| N016 | `alert.acknowledged:command_join_actor_ref` |
| N017 | `alert.acknowledged:command_join_alert_id` |
| N018 | `alert.acknowledged:command_join_alert_record_ref` |
| N019 | `alert.acknowledged:command_join_correlation_id` |
| N020 | `alert.acknowledged:command_join_currentness_basis_ref` |
| N021 | `alert.acknowledged:command_join_idempotency_key` |
| N022 | `alert.acknowledged:command_join_project_id` |
| N023 | `alert.acknowledged:forged_event_id` |
| N024 | `alert.acknowledged:non_successor` |
| N025 | `alert.acknowledged:operation_bytes_only` |
| N026 | `alert.acknowledged:operation_schema_only` |
| N027 | `alert.acknowledged:optional_command_without_payload` |
| N028 | `alert.acknowledged:optional_payload_without_command` |
| N029 | `alert.acknowledged:pager_cursor` |
| N030 | `alert.acknowledged:pager_foreign_family` |
| N031 | `alert.acknowledged:pager_foreign_project` |
| N032 | `alert.acknowledged:pager_future` |
| N033 | `alert.acknowledged:pager_matches` |
| N034 | `alert.acknowledged:pager_metadata` |
| N035 | `alert.acknowledged:pager_past` |
| N036 | `alert.acknowledged:pager_response_bytes` |
| N037 | `alert.acknowledged:pager_scan` |
| N038 | `alert.acknowledged:pager_single_ref` |
| N039 | `alert.acknowledged:payload_extra_secret_field` |
| N040 | `alert.acknowledged:payload_failed_commit` |
| N041 | `alert.acknowledged:payload_missing_identity` |
| N042 | `alert.acknowledged:payload_no_change_revision` |
| N043 | `alert.acknowledged:payload_refused` |
| N044 | `alert.acknowledged:payload_skipped_revision` |
| N045 | `alert.acknowledged:payload_stale_currentness` |
| N046 | `alert.acknowledged:payload_wrong_handler` |
| N047 | `alert.acknowledged:policy_projector_replay_only` |
| N048 | `alert.acknowledged:policy_unknown` |
| N049 | `alert.acknowledged:prior_owner_state_acknowledgement_state` |
| N050 | `alert.acknowledged:prior_owner_state_alert_id` |
| N051 | `alert.acknowledged:prior_owner_state_inbox_visible` |
| N052 | `alert.acknowledged:prior_owner_state_project_id` |
| N053 | `alert.acknowledged:prior_owner_state_revision` |
| N054 | `alert.acknowledged:prior_owner_state_snooze_until` |
| N055 | `alert.acknowledged:prior_owner_state_source_record_ref` |
| N056 | `alert.acknowledged:profile_max_value_bytes_0` |
| N057 | `alert.acknowledged:profile_max_value_bytes_16385` |
| N058 | `alert.acknowledged:profile_missing` |
| N059 | `alert.acknowledged:profile_redb_file_derived` |
| N060 | `alert.acknowledged:profile_storage_group_wrong` |
| N061 | `alert.acknowledged:protocol_admitted` |
| N062 | `alert.acknowledged:protocol_allowed` |
| N063 | `alert.acknowledged:protocol_current` |
| N064 | `alert.acknowledged:protocol_receipt_event_id` |
| N065 | `alert.acknowledged:protocol_replay_policy` |
| N066 | `alert.acknowledged:protocol_source_verified` |
| N067 | `alert.acknowledged:ref_dangling` |
| N068 | `alert.acknowledged:ref_external` |
| N069 | `alert.acknowledged:ref_non_schema` |
| N070 | `alert.acknowledged:representation_operation_digest_LF` |
| N071 | `alert.acknowledged:representation_operation_digest_integer` |
| N072 | `alert.acknowledged:representation_operation_digest_spaced` |
| N073 | `alert.acknowledged:representation_operation_digest_uppercase` |
| N074 | `alert.acknowledged:representation_request_digest_LF` |
| N075 | `alert.acknowledged:representation_request_digest_integer` |
| N076 | `alert.acknowledged:representation_request_digest_spaced` |
| N077 | `alert.acknowledged:representation_request_digest_uppercase` |
| N078 | `alert.acknowledged:retry_retry_command` |
| N079 | `alert.acknowledged:retry_retry_payload` |
| N080 | `alert.acknowledged:schema_metaschema` |
| N081 | `alert.acknowledged:schema_unused_ref` |
| N082 | `alert.acknowledged:scope_join_idempotency_key` |
| N083 | `alert.acknowledged:scope_join_project_id` |
| N084 | `alert.acknowledged:typed_payload_guard_allowed` |
| N085 | `alert.acknowledged:typed_payload_guard_committed` |
| N086 | `alert.acknowledged:typed_payload_guard_current` |
| N087 | `alert.acknowledged:typed_payload_guard_protected` |
| N088 | `alert.acknowledged:typed_protocol_admitted` |
| N089 | `alert.acknowledged:typed_protocol_allowed` |
| N090 | `alert.acknowledged:typed_protocol_current` |
| N091 | `alert.acknowledged:typed_protocol_source_verified` |
| N092 | `alert.acknowledged:typed_storage_maximum_boolean` |
| N093 | `alert.acknowledged:typed_storage_maximum_float` |
| N094 | `alert.dismissed:arbitrary_operation_digest` |
| N095 | `alert.dismissed:arbitrary_request_digest` |
| N096 | `alert.dismissed:candidate_owner_state_acknowledgement_state` |
| N097 | `alert.dismissed:candidate_owner_state_alert_id` |
| N098 | `alert.dismissed:candidate_owner_state_inbox_visible` |
| N099 | `alert.dismissed:candidate_owner_state_project_id` |
| N100 | `alert.dismissed:candidate_owner_state_revision` |
| N101 | `alert.dismissed:candidate_owner_state_snooze_until` |
| N102 | `alert.dismissed:candidate_owner_state_source_record_ref` |
| N103 | `alert.dismissed:candidate_owner_state_unread` |
| N104 | `alert.dismissed:checkpoint_bytes_only` |
| N105 | `alert.dismissed:checkpoint_original_storage` |
| N106 | `alert.dismissed:checkpoint_partition_only` |
| N107 | `alert.dismissed:checkpoint_schema_only` |
| N108 | `alert.dismissed:checkpoint_token_storage` |
| N109 | `alert.dismissed:command_join_actor_ref` |
| N110 | `alert.dismissed:command_join_alert_id` |
| N111 | `alert.dismissed:command_join_alert_record_ref` |
| N112 | `alert.dismissed:command_join_correlation_id` |
| N113 | `alert.dismissed:command_join_currentness_basis_ref` |
| N114 | `alert.dismissed:command_join_idempotency_key` |
| N115 | `alert.dismissed:command_join_project_id` |
| N116 | `alert.dismissed:forged_event_id` |
| N117 | `alert.dismissed:non_successor` |
| N118 | `alert.dismissed:operation_bytes_only` |
| N119 | `alert.dismissed:operation_schema_only` |
| N120 | `alert.dismissed:optional_command_without_payload` |
| N121 | `alert.dismissed:optional_payload_without_command` |
| N122 | `alert.dismissed:pager_cursor` |
| N123 | `alert.dismissed:pager_foreign_family` |
| N124 | `alert.dismissed:pager_foreign_project` |
| N125 | `alert.dismissed:pager_future` |
| N126 | `alert.dismissed:pager_matches` |
| N127 | `alert.dismissed:pager_metadata` |
| N128 | `alert.dismissed:pager_past` |
| N129 | `alert.dismissed:pager_response_bytes` |
| N130 | `alert.dismissed:pager_scan` |
| N131 | `alert.dismissed:pager_single_ref` |
| N132 | `alert.dismissed:payload_extra_secret_field` |
| N133 | `alert.dismissed:payload_failed_commit` |
| N134 | `alert.dismissed:payload_missing_identity` |
| N135 | `alert.dismissed:payload_no_change_revision` |
| N136 | `alert.dismissed:payload_refused` |
| N137 | `alert.dismissed:payload_skipped_revision` |
| N138 | `alert.dismissed:payload_stale_currentness` |
| N139 | `alert.dismissed:payload_wrong_handler` |
| N140 | `alert.dismissed:policy_projector_replay_only` |
| N141 | `alert.dismissed:policy_unknown` |
| N142 | `alert.dismissed:prior_owner_state_acknowledgement_state` |
| N143 | `alert.dismissed:prior_owner_state_alert_id` |
| N144 | `alert.dismissed:prior_owner_state_project_id` |
| N145 | `alert.dismissed:prior_owner_state_revision` |
| N146 | `alert.dismissed:prior_owner_state_snooze_until` |
| N147 | `alert.dismissed:prior_owner_state_source_record_ref` |
| N148 | `alert.dismissed:prior_owner_state_unread` |
| N149 | `alert.dismissed:profile_max_value_bytes_0` |
| N150 | `alert.dismissed:profile_max_value_bytes_16385` |
| N151 | `alert.dismissed:profile_missing` |
| N152 | `alert.dismissed:profile_redb_file_derived` |
| N153 | `alert.dismissed:profile_storage_group_wrong` |
| N154 | `alert.dismissed:protocol_admitted` |
| N155 | `alert.dismissed:protocol_allowed` |
| N156 | `alert.dismissed:protocol_current` |
| N157 | `alert.dismissed:protocol_receipt_event_id` |
| N158 | `alert.dismissed:protocol_replay_policy` |
| N159 | `alert.dismissed:protocol_source_verified` |
| N160 | `alert.dismissed:ref_dangling` |
| N161 | `alert.dismissed:ref_external` |
| N162 | `alert.dismissed:ref_non_schema` |
| N163 | `alert.dismissed:representation_operation_digest_LF` |
| N164 | `alert.dismissed:representation_operation_digest_integer` |
| N165 | `alert.dismissed:representation_operation_digest_spaced` |
| N166 | `alert.dismissed:representation_operation_digest_uppercase` |
| N167 | `alert.dismissed:representation_request_digest_LF` |
| N168 | `alert.dismissed:representation_request_digest_integer` |
| N169 | `alert.dismissed:representation_request_digest_spaced` |
| N170 | `alert.dismissed:representation_request_digest_uppercase` |
| N171 | `alert.dismissed:retry_retry_command` |
| N172 | `alert.dismissed:retry_retry_payload` |
| N173 | `alert.dismissed:schema_metaschema` |
| N174 | `alert.dismissed:schema_unused_ref` |
| N175 | `alert.dismissed:scope_join_idempotency_key` |
| N176 | `alert.dismissed:scope_join_project_id` |
| N177 | `alert.dismissed:typed_payload_guard_allowed` |
| N178 | `alert.dismissed:typed_payload_guard_committed` |
| N179 | `alert.dismissed:typed_payload_guard_current` |
| N180 | `alert.dismissed:typed_payload_guard_protected` |
| N181 | `alert.dismissed:typed_protocol_admitted` |
| N182 | `alert.dismissed:typed_protocol_allowed` |
| N183 | `alert.dismissed:typed_protocol_current` |
| N184 | `alert.dismissed:typed_protocol_source_verified` |
| N185 | `alert.dismissed:typed_storage_maximum_boolean` |
| N186 | `alert.dismissed:typed_storage_maximum_float` |
| N187 | `alert.rule_muted:arbitrary_operation_digest` |
| N188 | `alert.rule_muted:arbitrary_request_digest` |
| N189 | `alert.rule_muted:candidate_owner_state_alert_rule_id` |
| N190 | `alert.rule_muted:candidate_owner_state_mute_expires_at` |
| N191 | `alert.rule_muted:candidate_owner_state_mute_state` |
| N192 | `alert.rule_muted:candidate_owner_state_project_id` |
| N193 | `alert.rule_muted:candidate_owner_state_revision` |
| N194 | `alert.rule_muted:candidate_owner_state_root_cause_ref` |
| N195 | `alert.rule_muted:candidate_owner_state_source_record_ref` |
| N196 | `alert.rule_muted:checkpoint_bytes_only` |
| N197 | `alert.rule_muted:checkpoint_original_storage` |
| N198 | `alert.rule_muted:checkpoint_partition_only` |
| N199 | `alert.rule_muted:checkpoint_schema_only` |
| N200 | `alert.rule_muted:checkpoint_token_storage` |
| N201 | `alert.rule_muted:command_join_actor_ref` |
| N202 | `alert.rule_muted:command_join_alert_rule_id` |
| N203 | `alert.rule_muted:command_join_alert_rule_ref` |
| N204 | `alert.rule_muted:command_join_correlation_id` |
| N205 | `alert.rule_muted:command_join_currentness_basis_ref` |
| N206 | `alert.rule_muted:command_join_idempotency_key` |
| N207 | `alert.rule_muted:command_join_project_id` |
| N208 | `alert.rule_muted:forged_event_id` |
| N209 | `alert.rule_muted:non_successor` |
| N210 | `alert.rule_muted:operation_bytes_only` |
| N211 | `alert.rule_muted:operation_schema_only` |
| N212 | `alert.rule_muted:optional_command_without_payload` |
| N213 | `alert.rule_muted:optional_payload_without_command` |
| N214 | `alert.rule_muted:pager_cursor` |
| N215 | `alert.rule_muted:pager_foreign_family` |
| N216 | `alert.rule_muted:pager_foreign_project` |
| N217 | `alert.rule_muted:pager_future` |
| N218 | `alert.rule_muted:pager_matches` |
| N219 | `alert.rule_muted:pager_metadata` |
| N220 | `alert.rule_muted:pager_past` |
| N221 | `alert.rule_muted:pager_response_bytes` |
| N222 | `alert.rule_muted:pager_scan` |
| N223 | `alert.rule_muted:pager_single_ref` |
| N224 | `alert.rule_muted:payload_extra_secret_field` |
| N225 | `alert.rule_muted:payload_failed_commit` |
| N226 | `alert.rule_muted:payload_missing_identity` |
| N227 | `alert.rule_muted:payload_no_change_revision` |
| N228 | `alert.rule_muted:payload_protected_interruption` |
| N229 | `alert.rule_muted:payload_refused` |
| N230 | `alert.rule_muted:payload_skipped_revision` |
| N231 | `alert.rule_muted:payload_stale_currentness` |
| N232 | `alert.rule_muted:payload_wrong_handler` |
| N233 | `alert.rule_muted:policy_projector_replay_only` |
| N234 | `alert.rule_muted:policy_unknown` |
| N235 | `alert.rule_muted:prior_owner_state_alert_rule_id` |
| N236 | `alert.rule_muted:prior_owner_state_mute_state` |
| N237 | `alert.rule_muted:prior_owner_state_project_id` |
| N238 | `alert.rule_muted:prior_owner_state_revision` |
| N239 | `alert.rule_muted:prior_owner_state_root_cause_ref` |
| N240 | `alert.rule_muted:prior_owner_state_source_record_ref` |
| N241 | `alert.rule_muted:profile_max_value_bytes_0` |
| N242 | `alert.rule_muted:profile_max_value_bytes_16385` |
| N243 | `alert.rule_muted:profile_missing` |
| N244 | `alert.rule_muted:profile_redb_file_derived` |
| N245 | `alert.rule_muted:profile_storage_group_wrong` |
| N246 | `alert.rule_muted:protocol_admitted` |
| N247 | `alert.rule_muted:protocol_allowed` |
| N248 | `alert.rule_muted:protocol_current` |
| N249 | `alert.rule_muted:protocol_receipt_event_id` |
| N250 | `alert.rule_muted:protocol_replay_policy` |
| N251 | `alert.rule_muted:protocol_source_verified` |
| N252 | `alert.rule_muted:ref_dangling` |
| N253 | `alert.rule_muted:ref_external` |
| N254 | `alert.rule_muted:ref_non_schema` |
| N255 | `alert.rule_muted:representation_operation_digest_LF` |
| N256 | `alert.rule_muted:representation_operation_digest_integer` |
| N257 | `alert.rule_muted:representation_operation_digest_spaced` |
| N258 | `alert.rule_muted:representation_operation_digest_uppercase` |
| N259 | `alert.rule_muted:representation_request_digest_LF` |
| N260 | `alert.rule_muted:representation_request_digest_integer` |
| N261 | `alert.rule_muted:representation_request_digest_spaced` |
| N262 | `alert.rule_muted:representation_request_digest_uppercase` |
| N263 | `alert.rule_muted:retry_retry_command` |
| N264 | `alert.rule_muted:retry_retry_payload` |
| N265 | `alert.rule_muted:schema_metaschema` |
| N266 | `alert.rule_muted:schema_unused_ref` |
| N267 | `alert.rule_muted:scope_join_idempotency_key` |
| N268 | `alert.rule_muted:scope_join_project_id` |
| N269 | `alert.rule_muted:typed_payload_guard_allowed` |
| N270 | `alert.rule_muted:typed_payload_guard_committed` |
| N271 | `alert.rule_muted:typed_payload_guard_current` |
| N272 | `alert.rule_muted:typed_payload_guard_protected` |
| N273 | `alert.rule_muted:typed_protocol_admitted` |
| N274 | `alert.rule_muted:typed_protocol_allowed` |
| N275 | `alert.rule_muted:typed_protocol_current` |
| N276 | `alert.rule_muted:typed_protocol_source_verified` |
| N277 | `alert.rule_muted:typed_storage_maximum_boolean` |
| N278 | `alert.rule_muted:typed_storage_maximum_float` |
| N279 | `alert.snoozed:arbitrary_operation_digest` |
| N280 | `alert.snoozed:arbitrary_request_digest` |
| N281 | `alert.snoozed:candidate_owner_state_acknowledgement_state` |
| N282 | `alert.snoozed:candidate_owner_state_alert_id` |
| N283 | `alert.snoozed:candidate_owner_state_inbox_visible` |
| N284 | `alert.snoozed:candidate_owner_state_project_id` |
| N285 | `alert.snoozed:candidate_owner_state_revision` |
| N286 | `alert.snoozed:candidate_owner_state_snooze_until` |
| N287 | `alert.snoozed:candidate_owner_state_source_record_ref` |
| N288 | `alert.snoozed:candidate_owner_state_unread` |
| N289 | `alert.snoozed:checkpoint_bytes_only` |
| N290 | `alert.snoozed:checkpoint_original_storage` |
| N291 | `alert.snoozed:checkpoint_partition_only` |
| N292 | `alert.snoozed:checkpoint_schema_only` |
| N293 | `alert.snoozed:checkpoint_token_storage` |
| N294 | `alert.snoozed:command_join_actor_ref` |
| N295 | `alert.snoozed:command_join_alert_id` |
| N296 | `alert.snoozed:command_join_alert_record_ref` |
| N297 | `alert.snoozed:command_join_correlation_id` |
| N298 | `alert.snoozed:command_join_currentness_basis_ref` |
| N299 | `alert.snoozed:command_join_idempotency_key` |
| N300 | `alert.snoozed:command_join_project_id` |
| N301 | `alert.snoozed:expired_original_deadline` |
| N302 | `alert.snoozed:forged_event_id` |
| N303 | `alert.snoozed:non_successor` |
| N304 | `alert.snoozed:operation_bytes_only` |
| N305 | `alert.snoozed:operation_offset_past` |
| N306 | `alert.snoozed:operation_offset_same_instant` |
| N307 | `alert.snoozed:operation_schema_only` |
| N308 | `alert.snoozed:optional_command_without_payload` |
| N309 | `alert.snoozed:optional_payload_without_command` |
| N310 | `alert.snoozed:pager_cursor` |
| N311 | `alert.snoozed:pager_foreign_family` |
| N312 | `alert.snoozed:pager_foreign_project` |
| N313 | `alert.snoozed:pager_future` |
| N314 | `alert.snoozed:pager_matches` |
| N315 | `alert.snoozed:pager_metadata` |
| N316 | `alert.snoozed:pager_past` |
| N317 | `alert.snoozed:pager_response_bytes` |
| N318 | `alert.snoozed:pager_scan` |
| N319 | `alert.snoozed:pager_single_ref` |
| N320 | `alert.snoozed:payload_expired_snooze` |
| N321 | `alert.snoozed:payload_extra_secret_field` |
| N322 | `alert.snoozed:payload_failed_commit` |
| N323 | `alert.snoozed:payload_missing_identity` |
| N324 | `alert.snoozed:payload_no_change_revision` |
| N325 | `alert.snoozed:payload_offset_past` |
| N326 | `alert.snoozed:payload_offset_same_instant` |
| N327 | `alert.snoozed:payload_protected_interruption` |
| N328 | `alert.snoozed:payload_refused` |
| N329 | `alert.snoozed:payload_skipped_revision` |
| N330 | `alert.snoozed:payload_stale_currentness` |
| N331 | `alert.snoozed:payload_wrong_handler` |
| N332 | `alert.snoozed:policy_projector_replay_only` |
| N333 | `alert.snoozed:policy_unknown` |
| N334 | `alert.snoozed:prior_owner_state_acknowledgement_state` |
| N335 | `alert.snoozed:prior_owner_state_alert_id` |
| N336 | `alert.snoozed:prior_owner_state_project_id` |
| N337 | `alert.snoozed:prior_owner_state_revision` |
| N338 | `alert.snoozed:prior_owner_state_source_record_ref` |
| N339 | `alert.snoozed:prior_owner_state_unread` |
| N340 | `alert.snoozed:profile_max_value_bytes_0` |
| N341 | `alert.snoozed:profile_max_value_bytes_16385` |
| N342 | `alert.snoozed:profile_missing` |
| N343 | `alert.snoozed:profile_redb_file_derived` |
| N344 | `alert.snoozed:profile_storage_group_wrong` |
| N345 | `alert.snoozed:protocol_admitted` |
| N346 | `alert.snoozed:protocol_allowed` |
| N347 | `alert.snoozed:protocol_current` |
| N348 | `alert.snoozed:protocol_receipt_event_id` |
| N349 | `alert.snoozed:protocol_replay_policy` |
| N350 | `alert.snoozed:protocol_source_verified` |
| N351 | `alert.snoozed:ref_dangling` |
| N352 | `alert.snoozed:ref_external` |
| N353 | `alert.snoozed:ref_non_schema` |
| N354 | `alert.snoozed:representation_operation_digest_LF` |
| N355 | `alert.snoozed:representation_operation_digest_integer` |
| N356 | `alert.snoozed:representation_operation_digest_spaced` |
| N357 | `alert.snoozed:representation_operation_digest_uppercase` |
| N358 | `alert.snoozed:representation_request_digest_LF` |
| N359 | `alert.snoozed:representation_request_digest_integer` |
| N360 | `alert.snoozed:representation_request_digest_spaced` |
| N361 | `alert.snoozed:representation_request_digest_uppercase` |
| N362 | `alert.snoozed:retry_retry_command` |
| N363 | `alert.snoozed:retry_retry_payload` |
| N364 | `alert.snoozed:schema_metaschema` |
| N365 | `alert.snoozed:schema_unused_ref` |
| N366 | `alert.snoozed:scope_join_idempotency_key` |
| N367 | `alert.snoozed:scope_join_project_id` |
| N368 | `alert.snoozed:typed_payload_guard_allowed` |
| N369 | `alert.snoozed:typed_payload_guard_committed` |
| N370 | `alert.snoozed:typed_payload_guard_current` |
| N371 | `alert.snoozed:typed_payload_guard_protected` |
| N372 | `alert.snoozed:typed_protocol_admitted` |
| N373 | `alert.snoozed:typed_protocol_allowed` |
| N374 | `alert.snoozed:typed_protocol_current` |
| N375 | `alert.snoozed:typed_protocol_source_verified` |
| N376 | `alert.snoozed:typed_storage_maximum_boolean` |
| N377 | `alert.snoozed:typed_storage_maximum_float` |
| N378 | `concern.created:arbitrary_operation_digest` |
| N379 | `concern.created:arbitrary_request_digest` |
| N380 | `concern.created:authority_join_actor_ref` |
| N381 | `concern.created:authority_join_authority_basis_ref` |
| N382 | `concern.created:authority_join_currentness_basis_ref` |
| N383 | `concern.created:authority_join_permission_snapshot_ref` |
| N384 | `concern.created:authority_join_project_id` |
| N385 | `concern.created:authority_join_source_refs` |
| N386 | `concern.created:candidate_record_artifact_refs` |
| N387 | `concern.created:candidate_record_attention_level` |
| N388 | `concern.created:candidate_record_blocking_effect_ref` |
| N389 | `concern.created:candidate_record_chatworthy` |
| N390 | `concern.created:candidate_record_concern_category` |
| N391 | `concern.created:candidate_record_concern_id` |
| N392 | `concern.created:candidate_record_created_at` |
| N393 | `concern.created:candidate_record_created_by_kind` |
| N394 | `concern.created:candidate_record_created_by_ref` |
| N395 | `concern.created:candidate_record_creator_ref` |
| N396 | `concern.created:candidate_record_evidence_refs` |
| N397 | `concern.created:candidate_record_lineage_refs` |
| N398 | `concern.created:candidate_record_owner_kind` |
| N399 | `concern.created:candidate_record_owner_ref` |
| N400 | `concern.created:candidate_record_record_id` |
| N401 | `concern.created:candidate_record_resolution_kind` |
| N402 | `concern.created:candidate_record_resolved_at` |
| N403 | `concern.created:candidate_record_resolver_ref` |
| N404 | `concern.created:candidate_record_revision` |
| N405 | `concern.created:candidate_record_run_ref` |
| N406 | `concern.created:candidate_record_scope_ref` |
| N407 | `concern.created:candidate_record_severity` |
| N408 | `concern.created:candidate_record_source_event_refs` |
| N409 | `concern.created:candidate_record_status` |
| N410 | `concern.created:candidate_record_subject_ref` |
| N411 | `concern.created:candidate_record_summary` |
| N412 | `concern.created:candidate_record_updated_at` |
| N413 | `concern.created:candidate_record_visibility_level` |
| N414 | `concern.created:checkpoint_bytes_only` |
| N415 | `concern.created:checkpoint_original_storage` |
| N416 | `concern.created:checkpoint_partition_only` |
| N417 | `concern.created:checkpoint_schema_only` |
| N418 | `concern.created:checkpoint_token_storage` |
| N419 | `concern.created:command_join_correlation_id` |
| N420 | `concern.created:command_join_currentness_basis_ref` |
| N421 | `concern.created:command_join_origin` |
| N422 | `concern.created:creator_actor_join` |
| N423 | `concern.created:forbidden_creator_External Resource` |
| N424 | `concern.created:forbidden_creator_Recovery` |
| N425 | `concern.created:forbidden_creator_User` |
| N426 | `concern.created:forbidden_creator_Worker` |
| N427 | `concern.created:forged_event_id` |
| N428 | `concern.created:nested_payload_schema_only` |
| N429 | `concern.created:operation_bytes_only` |
| N430 | `concern.created:operation_schema_only` |
| N431 | `concern.created:pager_cursor` |
| N432 | `concern.created:pager_foreign_family` |
| N433 | `concern.created:pager_foreign_project` |
| N434 | `concern.created:pager_future` |
| N435 | `concern.created:pager_matches` |
| N436 | `concern.created:pager_metadata` |
| N437 | `concern.created:pager_past` |
| N438 | `concern.created:pager_response_bytes` |
| N439 | `concern.created:pager_scan` |
| N440 | `concern.created:pager_single_ref` |
| N441 | `concern.created:partition_only` |
| N442 | `concern.created:policy_projector_replay_only` |
| N443 | `concern.created:policy_unknown` |
| N444 | `concern.created:profile_max_value_bytes_0` |
| N445 | `concern.created:profile_max_value_bytes_16385` |
| N446 | `concern.created:profile_missing` |
| N447 | `concern.created:profile_redb_file_derived` |
| N448 | `concern.created:profile_storage_group_wrong` |
| N449 | `concern.created:protocol_admitted` |
| N450 | `concern.created:protocol_authority_verified` |
| N451 | `concern.created:protocol_concern_key_exists` |
| N452 | `concern.created:protocol_permission_allowed` |
| N453 | `concern.created:protocol_publication_state` |
| N454 | `concern.created:protocol_receipt_event_id` |
| N455 | `concern.created:protocol_replay_policy` |
| N456 | `concern.created:protocol_retry_digest` |
| N457 | `concern.created:protocol_source_current` |
| N458 | `concern.created:protocol_subject_already_active` |
| N459 | `concern.created:ref_dangling` |
| N460 | `concern.created:ref_external` |
| N461 | `concern.created:ref_non_schema` |
| N462 | `concern.created:representation_operation_digest_LF` |
| N463 | `concern.created:representation_operation_digest_integer` |
| N464 | `concern.created:representation_operation_digest_spaced` |
| N465 | `concern.created:representation_operation_digest_uppercase` |
| N466 | `concern.created:representation_request_digest_LF` |
| N467 | `concern.created:representation_request_digest_integer` |
| N468 | `concern.created:representation_request_digest_spaced` |
| N469 | `concern.created:representation_request_digest_uppercase` |
| N470 | `concern.created:revision_one_ref_join` |
| N471 | `concern.created:schema_metaschema` |
| N472 | `concern.created:schema_unused_ref` |
| N473 | `concern.created:scope_payload_key` |
| N474 | `concern.created:scope_record_project` |
| N475 | `concern.created:typed_protocol_admitted` |
| N476 | `concern.created:typed_protocol_authority_verified` |
| N477 | `concern.created:typed_protocol_concern_key_exists` |
| N478 | `concern.created:typed_protocol_permission_allowed` |
| N479 | `concern.created:typed_protocol_source_current` |
| N480 | `concern.created:typed_protocol_subject_already_active` |
| N481 | `concern.created:typed_storage_maximum_boolean` |
| N482 | `concern.created:typed_storage_maximum_float` |
| N483 | `current_membership_denied` |
| N484 | `current_permission_denied` |
| N485 | `current_source_access_denied` |
| N486 | `current_withdrawal` |
| N487 | `foreign_checkpoint_consumer` |
| N488 | `foreign_checkpoint_storage` |
| N489 | `foreign_event_project` |
| N490 | `foreign_event_storage` |
| N491 | `foreign_receipt_storage` |
| N492 | `foreign_source_storage` |
| N493 | `forged_checkpoint_publication` |
| N494 | `forged_checkpoint_token` |
| N495 | `forged_event_id` |
| N496 | `forged_event_ref` |
| N497 | `forged_original_result` |
| N498 | `forged_receipt_event` |
| N499 | `forged_schema_invalid_payload` |
| N500 | `forged_schema_valid_payload` |
| N501 | `forged_source_selection` |
| N502 | `not_valid_when_written` |
| N503 | `original_storage_event_type` |
| N504 | `original_storage_observed_at_utc` |
| N505 | `original_storage_persisted_at_utc` |
| N506 | `original_storage_sequence_id` |
| N507 | `panel.redocked:arbitrary_operation_digest` |
| N508 | `panel.redocked:arbitrary_request_digest` |
| N509 | `panel.redocked:candidate_host_snapshot_app_session_id` |
| N510 | `panel.redocked:candidate_host_snapshot_host` |
| N511 | `panel.redocked:candidate_host_snapshot_host_revision` |
| N512 | `panel.redocked:candidate_host_snapshot_window_id` |
| N513 | `panel.redocked:checkpoint_bytes_only` |
| N514 | `panel.redocked:checkpoint_original_storage` |
| N515 | `panel.redocked:checkpoint_partition_only` |
| N516 | `panel.redocked:checkpoint_schema_only` |
| N517 | `panel.redocked:checkpoint_token_storage` |
| N518 | `panel.redocked:command_join_actor_ref` |
| N519 | `panel.redocked:command_join_correlation_id` |
| N520 | `panel.redocked:command_window_join` |
| N521 | `panel.redocked:forged_event_id` |
| N522 | `panel.redocked:home_context_only` |
| N523 | `panel.redocked:operation_bytes_only` |
| N524 | `panel.redocked:operation_schema_only` |
| N525 | `panel.redocked:original_result_dispatch_receipt_ref` |
| N526 | `panel.redocked:original_result_owner_commit_ref` |
| N527 | `panel.redocked:original_result_result_ref` |
| N528 | `panel.redocked:pager_cursor` |
| N529 | `panel.redocked:pager_foreign_family` |
| N530 | `panel.redocked:pager_foreign_project` |
| N531 | `panel.redocked:pager_future` |
| N532 | `panel.redocked:pager_matches` |
| N533 | `panel.redocked:pager_metadata` |
| N534 | `panel.redocked:pager_past` |
| N535 | `panel.redocked:pager_response_bytes` |
| N536 | `panel.redocked:pager_scan` |
| N537 | `panel.redocked:pager_single_ref` |
| N538 | `panel.redocked:payload_application_key_missing_server_and_operation` |
| N539 | `panel.redocked:payload_coemission` |
| N540 | `panel.redocked:payload_missing_session` |
| N541 | `panel.redocked:payload_no_successor` |
| N542 | `panel.redocked:payload_non_chat` |
| N543 | `panel.redocked:payload_old_layout_field` |
| N544 | `panel.redocked:payload_saved_host` |
| N545 | `panel.redocked:payload_scope_join_mismatch` |
| N546 | `panel.redocked:payload_wrong_command` |
| N547 | `panel.redocked:payload_wrong_source_host` |
| N548 | `panel.redocked:policy_projector_replay_only` |
| N549 | `panel.redocked:policy_unknown` |
| N550 | `panel.redocked:prior_host_snapshot_app_session_id` |
| N551 | `panel.redocked:prior_host_snapshot_host` |
| N552 | `panel.redocked:prior_host_snapshot_host_revision` |
| N553 | `panel.redocked:prior_host_snapshot_window_id` |
| N554 | `panel.redocked:profile_max_value_bytes_0` |
| N555 | `panel.redocked:profile_max_value_bytes_16385` |
| N556 | `panel.redocked:profile_missing` |
| N557 | `panel.redocked:profile_redb_file_derived` |
| N558 | `panel.redocked:profile_storage_group_wrong` |
| N559 | `panel.redocked:protocol_admitted` |
| N560 | `panel.redocked:protocol_coherently_forged_identity` |
| N561 | `panel.redocked:protocol_cursor` |
| N562 | `panel.redocked:protocol_desktop` |
| N563 | `panel.redocked:protocol_publication_state` |
| N564 | `panel.redocked:protocol_receipt_event_id` |
| N565 | `panel.redocked:protocol_replay_policy` |
| N566 | `panel.redocked:protocol_session` |
| N567 | `panel.redocked:protocol_source_verified` |
| N568 | `panel.redocked:protocol_window` |
| N569 | `panel.redocked:ref_dangling` |
| N570 | `panel.redocked:ref_external` |
| N571 | `panel.redocked:ref_non_schema` |
| N572 | `panel.redocked:representation_operation_digest_LF` |
| N573 | `panel.redocked:representation_operation_digest_integer` |
| N574 | `panel.redocked:representation_operation_digest_spaced` |
| N575 | `panel.redocked:representation_operation_digest_uppercase` |
| N576 | `panel.redocked:representation_request_digest_LF` |
| N577 | `panel.redocked:representation_request_digest_integer` |
| N578 | `panel.redocked:representation_request_digest_spaced` |
| N579 | `panel.redocked:representation_request_digest_uppercase` |
| N580 | `panel.redocked:retry_retry_command` |
| N581 | `panel.redocked:retry_retry_payload` |
| N582 | `panel.redocked:schema_metaschema` |
| N583 | `panel.redocked:schema_unused_ref` |
| N584 | `panel.redocked:scope_join_app_session_id` |
| N585 | `panel.redocked:scope_join_idempotency_key` |
| N586 | `panel.redocked:scope_join_project_id` |
| N587 | `panel.redocked:scope_join_scope_partition` |
| N588 | `panel.redocked:scope_join_server_id` |
| N589 | `panel.redocked:scope_join_storage_instance_id` |
| N590 | `panel.redocked:successor_only` |
| N591 | `panel.redocked:typed_protocol_admitted` |
| N592 | `panel.redocked:typed_protocol_desktop` |
| N593 | `panel.redocked:typed_protocol_source_verified` |
| N594 | `panel.redocked:typed_storage_maximum_boolean` |
| N595 | `panel.redocked:typed_storage_maximum_float` |
| N596 | `panel.undocked:arbitrary_operation_digest` |
| N597 | `panel.undocked:arbitrary_request_digest` |
| N598 | `panel.undocked:candidate_host_snapshot_app_session_id` |
| N599 | `panel.undocked:candidate_host_snapshot_host` |
| N600 | `panel.undocked:candidate_host_snapshot_host_revision` |
| N601 | `panel.undocked:candidate_host_snapshot_window_id` |
| N602 | `panel.undocked:checkpoint_bytes_only` |
| N603 | `panel.undocked:checkpoint_original_storage` |
| N604 | `panel.undocked:checkpoint_partition_only` |
| N605 | `panel.undocked:checkpoint_schema_only` |
| N606 | `panel.undocked:checkpoint_token_storage` |
| N607 | `panel.undocked:command_join_actor_ref` |
| N608 | `panel.undocked:command_join_correlation_id` |
| N609 | `panel.undocked:command_window_join` |
| N610 | `panel.undocked:forged_event_id` |
| N611 | `panel.undocked:home_context_only` |
| N612 | `panel.undocked:operation_bytes_only` |
| N613 | `panel.undocked:operation_schema_only` |
| N614 | `panel.undocked:original_result_dispatch_receipt_ref` |
| N615 | `panel.undocked:original_result_owner_commit_ref` |
| N616 | `panel.undocked:original_result_result_ref` |
| N617 | `panel.undocked:pager_cursor` |
| N618 | `panel.undocked:pager_foreign_family` |
| N619 | `panel.undocked:pager_foreign_project` |
| N620 | `panel.undocked:pager_future` |
| N621 | `panel.undocked:pager_matches` |
| N622 | `panel.undocked:pager_metadata` |
| N623 | `panel.undocked:pager_past` |
| N624 | `panel.undocked:pager_response_bytes` |
| N625 | `panel.undocked:pager_scan` |
| N626 | `panel.undocked:pager_single_ref` |
| N627 | `panel.undocked:payload_application_key_missing_server_and_operation` |
| N628 | `panel.undocked:payload_coemission` |
| N629 | `panel.undocked:payload_missing_session` |
| N630 | `panel.undocked:payload_no_successor` |
| N631 | `panel.undocked:payload_non_chat` |
| N632 | `panel.undocked:payload_old_layout_field` |
| N633 | `panel.undocked:payload_saved_host` |
| N634 | `panel.undocked:payload_scope_join_mismatch` |
| N635 | `panel.undocked:payload_wrong_command` |
| N636 | `panel.undocked:payload_wrong_source_host` |
| N637 | `panel.undocked:policy_projector_replay_only` |
| N638 | `panel.undocked:policy_unknown` |
| N639 | `panel.undocked:prior_host_snapshot_app_session_id` |
| N640 | `panel.undocked:prior_host_snapshot_host` |
| N641 | `panel.undocked:prior_host_snapshot_host_revision` |
| N642 | `panel.undocked:prior_host_snapshot_window_id` |
| N643 | `panel.undocked:profile_max_value_bytes_0` |
| N644 | `panel.undocked:profile_max_value_bytes_16385` |
| N645 | `panel.undocked:profile_missing` |
| N646 | `panel.undocked:profile_redb_file_derived` |
| N647 | `panel.undocked:profile_storage_group_wrong` |
| N648 | `panel.undocked:protocol_admitted` |
| N649 | `panel.undocked:protocol_coherently_forged_identity` |
| N650 | `panel.undocked:protocol_cursor` |
| N651 | `panel.undocked:protocol_desktop` |
| N652 | `panel.undocked:protocol_publication_state` |
| N653 | `panel.undocked:protocol_receipt_event_id` |
| N654 | `panel.undocked:protocol_replay_policy` |
| N655 | `panel.undocked:protocol_session` |
| N656 | `panel.undocked:protocol_source_verified` |
| N657 | `panel.undocked:protocol_window` |
| N658 | `panel.undocked:ref_dangling` |
| N659 | `panel.undocked:ref_external` |
| N660 | `panel.undocked:ref_non_schema` |
| N661 | `panel.undocked:representation_operation_digest_LF` |
| N662 | `panel.undocked:representation_operation_digest_integer` |
| N663 | `panel.undocked:representation_operation_digest_spaced` |
| N664 | `panel.undocked:representation_operation_digest_uppercase` |
| N665 | `panel.undocked:representation_request_digest_LF` |
| N666 | `panel.undocked:representation_request_digest_integer` |
| N667 | `panel.undocked:representation_request_digest_spaced` |
| N668 | `panel.undocked:representation_request_digest_uppercase` |
| N669 | `panel.undocked:retry_retry_command` |
| N670 | `panel.undocked:retry_retry_payload` |
| N671 | `panel.undocked:schema_metaschema` |
| N672 | `panel.undocked:schema_unused_ref` |
| N673 | `panel.undocked:scope_join_app_session_id` |
| N674 | `panel.undocked:scope_join_idempotency_key` |
| N675 | `panel.undocked:scope_join_project_id` |
| N676 | `panel.undocked:scope_join_scope_partition` |
| N677 | `panel.undocked:scope_join_server_id` |
| N678 | `panel.undocked:scope_join_storage_instance_id` |
| N679 | `panel.undocked:successor_only` |
| N680 | `panel.undocked:typed_protocol_admitted` |
| N681 | `panel.undocked:typed_protocol_desktop` |
| N682 | `panel.undocked:typed_protocol_source_verified` |
| N683 | `panel.undocked:typed_storage_maximum_boolean` |
| N684 | `panel.undocked:typed_storage_maximum_float` |
| N685 | `source_deleted` |
| N686 | `staged_checkpoint` |
| N687 | `staged_event` |
| N688 | `storage_event_id` |
| N689 | `storage_first_append_receipt_acknowledged_at_utc` |
| N690 | `storage_first_append_receipt_byte_offset` |
| N691 | `storage_first_append_receipt_commit_group_id` |
| N692 | `storage_first_append_receipt_durability_class` |
| N693 | `storage_first_append_receipt_durability_state` |
| N694 | `storage_first_append_receipt_durable_end_offset` |
| N695 | `storage_first_append_receipt_event_id` |
| N696 | `storage_first_append_receipt_manifest_generation` |
| N697 | `storage_first_append_receipt_segment_generation` |
| N698 | `storage_first_append_receipt_segment_name` |
| N699 | `storage_first_append_receipt_sequence_id` |
| N700 | `storage_original_append_result_byte_offset` |
| N701 | `storage_original_append_result_event_id` |
| N702 | `storage_original_append_result_ref` |
| N703 | `storage_original_append_result_segment_ref` |
| N704 | `storage_original_append_result_sequence_id` |
| N705 | `storage_sequence_id` |
| N706 | `storage_storage_instance_id` |
| N707 | `typed_event_sequence` |
| N708 | `typed_first_receipt_generation` |
| N709 | `typed_first_receipt_sequence` |
| N710 | `typed_original_payload_integer` |
| N711 | `typed_original_result_offset` |
| N712 | `typed_receipt_sequence` |
| N713 | `typed_source_generation` |
| N714 | `unknown_historical_version` |
| N715 | `withdrawn_checkpoint` |
| N716 | `withdrawn_event` |

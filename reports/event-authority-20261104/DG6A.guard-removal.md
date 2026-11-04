# DG6A round 5 guard-removal table

Source: scripts/pm-dg6a-guard-check.py. All mutants run in memory and restore the exact original function in finally. No guard in the shipped checker is weakened. The complete evidence JSON records every rejected name and every changed diagnostic.

**247/247 guard rows pass:** 148 current-operation/payload/protocol/checkpoint/profile/schema/pager/source-comparison rejection sites plus 99 historical rows (11 guards across nine reader versions). **702 nonhistorical negatives** are swept across all applicable source sites. **54 duplicate witnesses** require **11 named pair matrices**. Every other current negative has a singleton removal that permits it. Eighteen retained-history positives cover current/v1 payloads, current/replay-only retained policy, and absent live state.

A source row tests all negatives in its kind (alert/panel/concern); a history row tests the listed family/version. “All others” means the exact complement of the flipping names within that row, including each remaining negative’s original reason, except the explicitly named duplicate diagnostics recorded in JSON. All 55 changed-but-still-rejected diagnostics are covered by named duplicate proofs. A source loop is one guard site and its field-specific witnesses are listed separately. Conditional guards for snooze/protection, Home/application context and detached windows apply only when their branch is reachable.

| Row | Scope and source guard | Negatives that flip | Negatives that stay rejected | Named duplicate removed with it |
|---|---|---|---|---|
| G001 | alert: `errors:24 schema validation` | N039, N041, N046, N138, N140, N145, N236, N238, N244, N339, N341, N349 | All other 389 in this scope | — |
| G002 | alert: `errors:28 'non-successor'` | N042, N044, N141, N143, N239, N242, N342, N347 | All other 393 in this scope | — |
| G003 | alert: `errors:30 'uncommitted/stale/refused'` | N045, N043, N040, N092, N090, N091, N144, N142, N139, N191, N189, N190, N243, N241, N237, N289, N287, N288, N348, N346, N340, N394, N392, N393 | All other 377 in this scope | — |
| G004 | alert: `errors:32 'invalid protection proof'` | N093, N192, N290, N395 | All other 397 in this scope | — |
| G005 | alert: `errors:34 'expired snooze'` | N338, N343, N344 | All other 398 in this scope | — |
| G006 | alert: `errors:36 'protected interruption'` | N240, N345 | All other 399 in this scope | — |
| G007 | alert: `operation_errors:77 schema validation` | N026, N125, N223, N325 | All other 397 in this scope | — |
| G008 | alert: `operation_errors:79 'operation exceeds 16384 encoded bytes'` | N025, N124, N222, N322 | All other 397 in this scope | — |
| G009 | alert: `operation_errors:87 'operation identity digest mismatch'` | N001, N100, N199, N297 | All other 397 in this scope | — |
| G010 | alert: `operation_errors:89 'event identity mismatch'` | N023, N122, N220, N320 | All other 397 in this scope | — |
| G011 | alert: `operation_errors:91 'frozen command digest mismatch'` | N002, N077, N076, N074, N101, N176, N175, N173, N200, N274, N273, N271, N298, N379, N378, N376 | All other 385 in this scope | — |
| G012 | alert: `operation_errors:94 'original command/payload field presence'` | N028, N127, N225, N327 | All other 397 in this scope | — |
| G013 | alert: `operation_errors:102 'non-successor'` | N024, N123, N221, N321 | All other 397 in this scope | — |
| G014 | alert: `operation_errors:128 'expired snooze'` | N319, N323, N324 | All other 398 in this scope | — |
| G015 | alert: `operation_errors:97 'original command/payload ' + key` | N022, N017, N018, N016, N020, N019, N021, N027, N121, N116, N117, N115, N119, N118, N120, N126, N219, N214, N215, N213, N217, N216, N218, N224, N318, N313, N314, N312, N316, N315, N317, N326 | All other 369 in this scope | — |
| G016 | alert: `operation_errors:100 'operation/payload ' + key` | N083, N082, N182, N181, N280, N279, N385, N384 | All other 393 in this scope | — |
| G017 | alert: `operation_errors:117 'candidate owner root_cause_ref'` | N251, N206 | All other 399 in this scope | — |
| G018 | alert: `operation_errors:119 'candidate owner mute_expires_at'` | N202 | All other 400 in this scope | — |
| G019 | alert: `operation_errors:114 name + ' owner ' + field` | N052, N050, N053, N055, N049, N006, N004, N007, N009, N003, N150, N149, N151, N153, N148, N105, N103, N106, N108, N102, N249, N247, N250, N252, N248, N204, N201, N205, N207, N203, N354, N353, N355, N356, N352, N302, N300, N303, N305, N299 | All other 361 in this scope | — |
| G020 | alert: `operation_errors:126 'candidate owner ' + field` | N051, N054, N010, N005, N008, N154, N152, N109, N104, N107, N357, N306, N301, N304 | All other 387 in this scope | — |
| G021 | alert: `protocol_errors:150 'wrong original receipt'` | N064, N163, N261, N366 | All other 397 in this scope | — |
| G022 | alert: `protocol_errors:152 'idempotency_conflict'` | N079, N078, N178, N177, N276, N275, N381, N380 | All other 393 in this scope | — |
| G023 | alert: `protocol_errors:148 field` | N061, N062, N063, N066, N094, N095, N096, N097, N160, N161, N162, N165, N193, N194, N195, N196, N258, N259, N260, N263, N291, N292, N293, N294, N363, N364, N365, N368, N396, N397, N398, N399 | All other 369 in this scope | — |
| G024 | alert: `checkpoint_errors:180 schema validation` | N013, N014, N112, N113, N210, N211, N309, N310 | All other 393 in this scope | — |
| G025 | alert: `checkpoint_errors:182 'checkpoint exceeds 16384 encoded bytes'` | N011, N110, N208, N307 | All other 397 in this scope | — |
| G026 | alert: `checkpoint_errors:186 'foreign Storage token'` | N015, N114, N212, N311 | All other 397 in this scope | — |
| G027 | alert: `checkpoint_errors:189 'foreign original-event context: ' + field` | N012, N111, N209, N308 | All other 397 in this scope | — |
| G028 | alert: `profile_errors:208 ['missing profile']` | N058, N157, N255, N360 | All other 397 in this scope | — |
| G029 | alert: `profile_errors:211 ['wrong physical binding']` | N059, N060, N158, N159, N256, N257, N361, N362 | All other 393 in this scope | — |
| G030 | alert: `profile_errors:214 ['non-integer maximum']` | N098, N099, N197, N198, N295, N296, N400, N401 | All other 393 in this scope | — |
| G031 | alert: `profile_errors:216 ['missing/oversized maximum']` | N056, N057, N155, N156, N253, N254, N358, N359 | All other 393 in this scope | — |
| G032 | alert: `writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection)` | N065, N047, N048, N164, N146, N147, N262, N245, N246, N367, N350, N351 | All other 389 in this scope | writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| G033 | alert: `writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy']` | N048, N147, N246, N351 | All other 397 in this scope | — |
| G034 | alert: `schema_ref_errors:61 ValueError('target is not a schema')` | N069, N168, N266, N371 | All other 397 in this scope | — |
| G035 | alert: `schema_ref_errors:63 'unresolved schema reference: ' + str(ref)` | N067, N069, N068, N081, N166, N168, N167, N180, N264, N266, N265, N278, N369, N371, N370, N383 | All other 385 in this scope | — |
| G036 | alert: `schema_ref_errors:56 ValueError('unsupported non-local reference')` | N068, N167, N265, N370 | All other 397 in this scope | — |
| G037 | alert: `history_page:256 after > frontier or len(packed(response([], after))) > 16384` | N029, N034, N128, N133, N226, N231, N328, N333 | All other 393 in this scope | — |
| G038 | alert: `history_page:261 not after < seq <= frontier` | N035, N032, N134, N131, N232, N229, N334, N331 | All other 393 in this scope | — |
| G039 | alert: `history_page:263 exact event family and Project filter` | N030, N031, N129, N130, N227, N228, N329, N330 | All other 393 in this scope | — |
| G040 | alert: `history_page:265 scanned == 256 or len(candidate) > 64` | N037, N033, N136, N132, N234, N230, N336, N332 | All other 393 in this scope | — |
| G041 | alert: `history_page:267 len(packed(response(candidate, seq))) > 16384` | N038, N036, N137, N135, N235, N233, N337, N335 | All other 393 in this scope | — |
| G042 | alert: `history_page:268 not result` | N038, N137, N235, N337 | All other 397 in this scope | — |
| G043 | alert: `check_schema:73 schema metaschema validity` | N080, N179, N277, N382 | All other 397 in this scope | — |
| G044 | alert: `check_schema:74 eager resolution of every schema reference` | N081, N180, N278, N383 | All other 397 in this scope | — |
| G045 | alert: `exact_value:348 exact JSON value type` | N089, N188, N286, N391 | All other 397 in this scope | — |
| G046 | alert: `exact_value:354 scalar value` | N087, N085, N088, N186, N184, N187, N284, N282, N285, N389, N387, N390 | All other 389 in this scope | — |
| G047 | alert: `exact_value:351 object keys` | N086, N185, N283, N388 | All other 397 in this scope | — |
| G048 | alert: `exact_value:351 object child values` | N087, N186, N284, N389 | All other 397 in this scope | — |
| G049 | alert: `exact_value:353 array length` | N084, N183, N281, N386 | All other 397 in this scope | — |
| G050 | alert: `exact_value:353 array child values` | N085, N184, N282, N387 | All other 397 in this scope | — |
| G051 | panel: `operation_errors:57 schema validation` | N555, N650 | All other 188 in this scope | — |
| G052 | panel: `operation_errors:59 'operation too large'` | N554, N649 | All other 188 in this scope | — |
| G053 | panel: `operation_errors:66 'frozen command digest mismatch'` | N539, N634 | All other 188 in this scope | — |
| G054 | panel: `operation_errors:71 'frozen command window mismatch'` | N646 | All other 189 in this scope | — |
| G055 | panel: `operation_errors:77 'original identity mismatch'` | N552, N538, N606, N605, N603, N647, N633, N701, N700, N698 | All other 180 in this scope | — |
| G056 | panel: `operation_errors:69 'frozen command/payload ' + key` | N549, N550, N644, N645 | All other 186 in this scope | — |
| G057 | panel: `operation_errors:74 'operation/payload ' + key` | N620, N619, N617, N618, N615, N616, N715, N714, N712, N713, N710, N711 | All other 178 in this scope | — |
| G058 | panel: `operation_errors:83 'original host snapshot mismatch'` | N581, N583, N582, N540, N542, N541, N676, N678, N677, N635, N637, N636 | All other 178 in this scope | — |
| G059 | panel: `operation_errors:85 'original window mismatch'` | N584, N543, N679, N638 | All other 186 in this scope | — |
| G060 | panel: `operation_errors:90 'original result/receipt mismatch'` | N557, N558, N556, N652, N653, N651 | All other 184 in this scope | — |
| G061 | panel: `protocol_errors:104 'family absent'` | N590, N628, N685, N723 | All other 186 in this scope | — |
| G062 | panel: `protocol_errors:106 'unsupported web'` | N593, N629, N688, N724 | All other 186 in this scope | — |
| G063 | panel: `protocol_errors:108 'unverified source'` | N598, N630, N693, N725 | All other 186 in this scope | — |
| G064 | panel: `protocol_errors:110 'wrong original receipt'` | N595, N690 | All other 188 in this scope | — |
| G065 | panel: `protocol_errors:112 'forged original event identity'` | N591, N686 | All other 188 in this scope | — |
| G066 | panel: `protocol_errors:114 'prior session cannot act'` | N597, N692 | All other 188 in this scope | — |
| G067 | panel: `protocol_errors:116 'wrong window'` | N599, N694 | All other 188 in this scope | — |
| G068 | panel: `protocol_errors:118 'retry changed'` | N612, N611, N707, N706 | All other 186 in this scope | — |
| G069 | panel: `protocol_errors:120 'unavailable publication/cursor'` | N594, N592, N689, N687 | All other 186 in this scope | — |
| G070 | panel: `checkpoint_errors:52 'checkpoint scope mismatch'` | N546, N641 | All other 188 in this scope | — |
| G071 | panel: `payload_errors:24 schema validation` | N573, N570, N575, N577, N574, N578, N571, N668, N665, N670, N672, N669, N673, N666 | All other 176 in this scope | — |
| G072 | panel: `payload_errors:29 'scope mismatch'` | N576, N671 | All other 188 in this scope | — |
| G073 | panel: `payload_errors:35 'missing original Home context'` | N553, N648 | All other 188 in this scope | — |
| G074 | panel: `payload_errors:37 'not host revision successor'` | N572, N627, N667, N722 | All other 186 in this scope | — |
| G075 | panel: `payload_errors:33 'CV-366 application idempotency key mismatch'` | N569, N664 | All other 188 in this scope | — |
| G076 | panel: `checkpoint_errors:180 schema validation` | N547, N642 | All other 188 in this scope | — |
| G077 | panel: `checkpoint_errors:182 'checkpoint exceeds 16384 encoded bytes'` | N544, N639 | All other 188 in this scope | — |
| G078 | panel: `checkpoint_errors:186 'foreign Storage token'` | N548, N643 | All other 188 in this scope | — |
| G079 | panel: `checkpoint_errors:189 'foreign original-event context: ' + field` | N545, N640 | All other 188 in this scope | — |
| G080 | panel: `profile_errors:208 ['missing profile']` | N587, N682 | All other 188 in this scope | — |
| G081 | panel: `profile_errors:211 ['wrong physical binding']` | N588, N589, N683, N684 | All other 186 in this scope | — |
| G082 | panel: `profile_errors:214 ['non-integer maximum']` | N631, N632, N726, N727 | All other 186 in this scope | — |
| G083 | panel: `profile_errors:216 ['missing/oversized maximum']` | N585, N586, N680, N681 | All other 186 in this scope | — |
| G084 | panel: `writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection)` | N596, N579, N580, N691, N674, N675 | All other 184 in this scope | writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| G085 | panel: `writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy']` | N580, N675 | All other 188 in this scope | — |
| G086 | panel: `schema_ref_errors:61 ValueError('target is not a schema')` | N602, N697 | All other 188 in this scope | — |
| G087 | panel: `schema_ref_errors:63 'unresolved schema reference: ' + str(ref)` | N600, N602, N601, N614, N695, N697, N696, N709 | All other 182 in this scope | — |
| G088 | panel: `schema_ref_errors:56 ValueError('unsupported non-local reference')` | N601, N696 | All other 188 in this scope | — |
| G089 | panel: `history_page:256 after > frontier or len(packed(response([], after))) > 16384` | N559, N564, N654, N659 | All other 186 in this scope | — |
| G090 | panel: `history_page:261 not after < seq <= frontier` | N565, N562, N660, N657 | All other 186 in this scope | — |
| G091 | panel: `history_page:263 exact event family and Project filter` | N560, N561, N655, N656 | All other 186 in this scope | — |
| G092 | panel: `history_page:265 scanned == 256 or len(candidate) > 64` | N567, N563, N662, N658 | All other 186 in this scope | — |
| G093 | panel: `history_page:267 len(packed(response(candidate, seq))) > 16384` | N568, N566, N663, N661 | All other 186 in this scope | — |
| G094 | panel: `history_page:268 not result` | N568, N663 | All other 188 in this scope | — |
| G095 | panel: `check_schema:73 schema metaschema validity` | N613, N708 | All other 188 in this scope | — |
| G096 | panel: `check_schema:74 eager resolution of every schema reference` | N614, N709 | All other 188 in this scope | — |
| G097 | panel: `exact_value:348 exact JSON value type` | N626, N721 | All other 188 in this scope | — |
| G098 | panel: `exact_value:354 scalar value` | N624, N622, N625, N719, N717, N720 | All other 184 in this scope | — |
| G099 | panel: `exact_value:351 object keys` | N623, N718 | All other 188 in this scope | — |
| G100 | panel: `exact_value:351 object child values` | N624, N719 | All other 188 in this scope | — |
| G101 | panel: `exact_value:353 array length` | N621, N716 | All other 188 in this scope | — |
| G102 | panel: `exact_value:353 array child values` | N622, N717 | All other 188 in this scope | — |
| G103 | concern: `operation_errors:30 schema validation` | N454 | All other 110 in this scope | — |
| G104 | concern: `operation_errors:36 nested payload schema validation` | N454, N452 | All other 109 in this scope | operation_errors:30 schema validation |
| G105 | concern: `operation_errors:32 'operation exceeds 16384 bytes'` | N453 | All other 110 in this scope | — |
| G106 | concern: `operation_errors:40 'original identity mismatch'` | N451, N402 | All other 109 in this scope | — |
| G107 | concern: `operation_errors:42 'frozen command/payload/record digest mismatch'` | N403 | All other 110 in this scope | — |
| G108 | concern: `operation_errors:44 'Project partition mismatch'` | N465 | All other 110 in this scope | — |
| G109 | concern: `operation_errors:50 'original scope/key mismatch'` | N498, N497 | All other 109 in this scope | — |
| G110 | concern: `operation_errors:52 'creator/actor mismatch'` | N446 | All other 110 in this scope | — |
| G111 | concern: `operation_errors:54 'original revision-one record ref mismatch'` | N494 | All other 110 in this scope | — |
| G112 | concern: `operation_errors:47 'original command/payload ' + key` | N445, N443, N444 | All other 108 in this scope | — |
| G113 | concern: `operation_errors:68 'original candidate record ' + key` | N424, N415, N428, N414, N431, N433, N422, N423, N419, N417, N418, N434, N432, N420, N410, N421, N435, N416, N436, N437, N411, N413, N412, N425, N427, N426, N430, N429 | All other 83 in this scope | — |
| G114 | concern: `protocol_errors:79 'existing concern cannot be recreated'` | N482, N475, N510, N507 | All other 107 in this scope | — |
| G115 | concern: `protocol_errors:85 'nomination or owner label grants no creation'` | N450, N449, N447, N448 | All other 107 in this scope | — |
| G116 | concern: `protocol_errors:87 'wrong original receipt'` | N478 | All other 110 in this scope | — |
| G117 | concern: `protocol_errors:89 'idempotency_conflict'` | N480 | All other 110 in this scope | — |
| G118 | concern: `protocol_errors:91 'withdrawn History'` | N477 | All other 110 in this scope | — |
| G119 | concern: `protocol_errors:77 key` | N473, N474, N481, N476, N505, N506, N509, N508 | All other 103 in this scope | — |
| G120 | concern: `protocol_errors:83 'independent authority ' + key` | N404, N408, N405, N406, N407, N409 | All other 105 in this scope | — |
| G121 | concern: `checkpoint_errors:100 'Project checkpoint partition mismatch'` | N440 | All other 110 in this scope | — |
| G122 | concern: `checkpoint_errors:180 schema validation` | N441 | All other 110 in this scope | — |
| G123 | concern: `checkpoint_errors:182 'checkpoint exceeds 16384 encoded bytes'` | N438 | All other 110 in this scope | — |
| G124 | concern: `checkpoint_errors:186 'foreign Storage token'` | N442 | All other 110 in this scope | — |
| G125 | concern: `checkpoint_errors:189 'foreign original-event context: ' + field` | N439 | All other 110 in this scope | — |
| G126 | concern: `profile_errors:208 ['missing profile']` | N470 | All other 110 in this scope | — |
| G127 | concern: `profile_errors:211 ['wrong physical binding']` | N471, N472 | All other 109 in this scope | — |
| G128 | concern: `profile_errors:214 ['non-integer maximum']` | N511, N512 | All other 109 in this scope | — |
| G129 | concern: `profile_errors:216 ['missing/oversized maximum']` | N468, N469 | All other 109 in this scope | — |
| G130 | concern: `writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection)` | N479, N466, N467 | All other 108 in this scope | writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| G131 | concern: `writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy']` | N467 | All other 110 in this scope | — |
| G132 | concern: `schema_ref_errors:61 ValueError('target is not a schema')` | N485 | All other 110 in this scope | — |
| G133 | concern: `schema_ref_errors:63 'unresolved schema reference: ' + str(ref)` | N483, N485, N484, N496 | All other 107 in this scope | — |
| G134 | concern: `schema_ref_errors:56 ValueError('unsupported non-local reference')` | N484 | All other 110 in this scope | — |
| G135 | concern: `history_page:256 after > frontier or len(packed(response([], after))) > 16384` | N455, N460 | All other 109 in this scope | — |
| G136 | concern: `history_page:261 not after < seq <= frontier` | N461, N458 | All other 109 in this scope | — |
| G137 | concern: `history_page:263 exact event family and Project filter` | N456, N457 | All other 109 in this scope | — |
| G138 | concern: `history_page:265 scanned == 256 or len(candidate) > 64` | N463, N459 | All other 109 in this scope | — |
| G139 | concern: `history_page:267 len(packed(response(candidate, seq))) > 16384` | N464, N462 | All other 109 in this scope | — |
| G140 | concern: `history_page:268 not result` | N464 | All other 110 in this scope | — |
| G141 | concern: `check_schema:73 schema metaschema validity` | N495 | All other 110 in this scope | — |
| G142 | concern: `check_schema:74 eager resolution of every schema reference` | N496 | All other 110 in this scope | — |
| G143 | concern: `exact_value:348 exact JSON value type` | N504 | All other 110 in this scope | — |
| G144 | concern: `exact_value:354 scalar value` | N502, N500, N503 | All other 108 in this scope | — |
| G145 | concern: `exact_value:351 object keys` | N501 | All other 110 in this scope | — |
| G146 | concern: `exact_value:351 object child values` | N502 | All other 110 in this scope | — |
| G147 | concern: `exact_value:353 array length` | N499 | All other 110 in this scope | — |
| G148 | concern: `exact_value:353 array child values` | N500 | All other 110 in this scope | — |
| G149 | alert.acknowledged/current: `historical_guards checkpoint_publication` | N758, N729 | All other 55 in this scope | — |
| G150 | alert.acknowledged/current: `historical_guards checkpoint_original` | N523, N518, N524, N517 | All other 53 in this scope | — |
| G151 | alert.acknowledged/current: `historical_guards event_publication` | N759, N730 | All other 55 in this scope | — |
| G152 | alert.acknowledged/current: `historical_guards event_original` | N526, N525, N520, N519, N537, N534, N535, N536, N750 | All other 48 in this scope | — |
| G153 | alert.acknowledged/current: `historical_guards historical_payload` | N530, N529, N757, N753 | All other 53 in this scope | — |
| G154 | alert.acknowledged/current: `historical_guards original_receipt` | N528, N521, N527, N749, N731, N748, N745, N738, N742, N740, N741, N733, N734, N735, N737, N736, N739, N732, N744, N747, N746, N743, N755, N752, N751, N754, N532 | All other 30 in this scope | — |
| G155 | alert.acknowledged/current: `historical_guards original_source` | N531, N522, N756 | All other 54 in this scope | — |
| G156 | alert.acknowledged/current: `historical_guards original_admission` | N533 | All other 56 in this scope | — |
| G157 | alert.acknowledged/current: `historical_guards current_permission` | N514, N513, N515 | All other 54 in this scope | — |
| G158 | alert.acknowledged/current: `historical_guards source_retained` | N728 | All other 56 in this scope | — |
| G159 | alert.acknowledged/current: `historical_guards current_withdrawal` | N516 | All other 56 in this scope | — |
| G160 | alert.dismissed/current: `historical_guards checkpoint_publication` | N758, N729 | All other 55 in this scope | — |
| G161 | alert.dismissed/current: `historical_guards checkpoint_original` | N523, N518, N524, N517 | All other 53 in this scope | — |
| G162 | alert.dismissed/current: `historical_guards event_publication` | N759, N730 | All other 55 in this scope | — |
| G163 | alert.dismissed/current: `historical_guards event_original` | N526, N525, N520, N519, N537, N534, N535, N536, N750 | All other 48 in this scope | — |
| G164 | alert.dismissed/current: `historical_guards historical_payload` | N530, N529, N757, N753 | All other 53 in this scope | — |
| G165 | alert.dismissed/current: `historical_guards original_receipt` | N528, N521, N527, N749, N731, N748, N745, N738, N742, N740, N741, N733, N734, N735, N737, N736, N739, N732, N744, N747, N746, N743, N755, N752, N751, N754, N532 | All other 30 in this scope | — |
| G166 | alert.dismissed/current: `historical_guards original_source` | N531, N522, N756 | All other 54 in this scope | — |
| G167 | alert.dismissed/current: `historical_guards original_admission` | N533 | All other 56 in this scope | — |
| G168 | alert.dismissed/current: `historical_guards current_permission` | N514, N513, N515 | All other 54 in this scope | — |
| G169 | alert.dismissed/current: `historical_guards source_retained` | N728 | All other 56 in this scope | — |
| G170 | alert.dismissed/current: `historical_guards current_withdrawal` | N516 | All other 56 in this scope | — |
| G171 | alert.rule_muted/current: `historical_guards checkpoint_publication` | N758, N729 | All other 55 in this scope | — |
| G172 | alert.rule_muted/current: `historical_guards checkpoint_original` | N523, N518, N524, N517 | All other 53 in this scope | — |
| G173 | alert.rule_muted/current: `historical_guards event_publication` | N759, N730 | All other 55 in this scope | — |
| G174 | alert.rule_muted/current: `historical_guards event_original` | N526, N525, N520, N519, N537, N534, N535, N536, N750 | All other 48 in this scope | — |
| G175 | alert.rule_muted/current: `historical_guards historical_payload` | N530, N529, N757, N753 | All other 53 in this scope | — |
| G176 | alert.rule_muted/current: `historical_guards original_receipt` | N528, N521, N527, N749, N731, N748, N745, N738, N742, N740, N741, N733, N734, N735, N737, N736, N739, N732, N744, N747, N746, N743, N755, N752, N751, N754, N532 | All other 30 in this scope | — |
| G177 | alert.rule_muted/current: `historical_guards original_source` | N531, N522, N756 | All other 54 in this scope | — |
| G178 | alert.rule_muted/current: `historical_guards original_admission` | N533 | All other 56 in this scope | — |
| G179 | alert.rule_muted/current: `historical_guards current_permission` | N514, N513, N515 | All other 54 in this scope | — |
| G180 | alert.rule_muted/current: `historical_guards source_retained` | N728 | All other 56 in this scope | — |
| G181 | alert.rule_muted/current: `historical_guards current_withdrawal` | N516 | All other 56 in this scope | — |
| G182 | alert.snoozed/current: `historical_guards checkpoint_publication` | N758, N729 | All other 55 in this scope | — |
| G183 | alert.snoozed/current: `historical_guards checkpoint_original` | N523, N518, N524, N517 | All other 53 in this scope | — |
| G184 | alert.snoozed/current: `historical_guards event_publication` | N759, N730 | All other 55 in this scope | — |
| G185 | alert.snoozed/current: `historical_guards event_original` | N526, N525, N520, N519, N537, N534, N535, N536, N750 | All other 48 in this scope | — |
| G186 | alert.snoozed/current: `historical_guards historical_payload` | N530, N529, N757, N753 | All other 53 in this scope | — |
| G187 | alert.snoozed/current: `historical_guards original_receipt` | N528, N521, N527, N749, N731, N748, N745, N738, N742, N740, N741, N733, N734, N735, N737, N736, N739, N732, N744, N747, N746, N743, N755, N752, N751, N754, N532 | All other 30 in this scope | — |
| G188 | alert.snoozed/current: `historical_guards original_source` | N531, N522, N756 | All other 54 in this scope | — |
| G189 | alert.snoozed/current: `historical_guards original_admission` | N533 | All other 56 in this scope | — |
| G190 | alert.snoozed/current: `historical_guards current_permission` | N514, N513, N515 | All other 54 in this scope | — |
| G191 | alert.snoozed/current: `historical_guards source_retained` | N728 | All other 56 in this scope | — |
| G192 | alert.snoozed/current: `historical_guards current_withdrawal` | N516 | All other 56 in this scope | — |
| G193 | panel.redocked/current: `historical_guards checkpoint_publication` | N758, N729 | All other 55 in this scope | — |
| G194 | panel.redocked/current: `historical_guards checkpoint_original` | N523, N518, N524, N517 | All other 53 in this scope | — |
| G195 | panel.redocked/current: `historical_guards event_publication` | N759, N730 | All other 55 in this scope | — |
| G196 | panel.redocked/current: `historical_guards event_original` | N526, N525, N520, N519, N537, N534, N535, N536, N750 | All other 48 in this scope | — |
| G197 | panel.redocked/current: `historical_guards historical_payload` | N530, N529, N757, N753 | All other 53 in this scope | — |
| G198 | panel.redocked/current: `historical_guards original_receipt` | N528, N521, N527, N749, N731, N748, N745, N738, N742, N740, N741, N733, N734, N735, N737, N736, N739, N732, N744, N747, N746, N743, N755, N752, N751, N754, N532 | All other 30 in this scope | — |
| G199 | panel.redocked/current: `historical_guards original_source` | N531, N522, N756 | All other 54 in this scope | — |
| G200 | panel.redocked/current: `historical_guards original_admission` | N533 | All other 56 in this scope | — |
| G201 | panel.redocked/current: `historical_guards current_permission` | N514, N513, N515 | All other 54 in this scope | — |
| G202 | panel.redocked/current: `historical_guards source_retained` | N728 | All other 56 in this scope | — |
| G203 | panel.redocked/current: `historical_guards current_withdrawal` | N516 | All other 56 in this scope | — |
| G204 | panel.redocked/v1: `historical_guards checkpoint_publication` | N758, N729 | All other 55 in this scope | — |
| G205 | panel.redocked/v1: `historical_guards checkpoint_original` | N523, N518, N524, N517 | All other 53 in this scope | — |
| G206 | panel.redocked/v1: `historical_guards event_publication` | N759, N730 | All other 55 in this scope | — |
| G207 | panel.redocked/v1: `historical_guards event_original` | N526, N525, N520, N519, N537, N534, N535, N536, N750 | All other 48 in this scope | — |
| G208 | panel.redocked/v1: `historical_guards historical_payload` | N530, N529, N757, N753 | All other 53 in this scope | — |
| G209 | panel.redocked/v1: `historical_guards original_receipt` | N528, N521, N527, N749, N731, N748, N745, N738, N742, N740, N741, N733, N734, N735, N737, N736, N739, N732, N744, N747, N746, N743, N755, N752, N751, N754, N532 | All other 30 in this scope | — |
| G210 | panel.redocked/v1: `historical_guards original_source` | N531, N522, N756 | All other 54 in this scope | — |
| G211 | panel.redocked/v1: `historical_guards original_admission` | N533 | All other 56 in this scope | — |
| G212 | panel.redocked/v1: `historical_guards current_permission` | N514, N513, N515 | All other 54 in this scope | — |
| G213 | panel.redocked/v1: `historical_guards source_retained` | N728 | All other 56 in this scope | — |
| G214 | panel.redocked/v1: `historical_guards current_withdrawal` | N516 | All other 56 in this scope | — |
| G215 | panel.undocked/current: `historical_guards checkpoint_publication` | N758, N729 | All other 55 in this scope | — |
| G216 | panel.undocked/current: `historical_guards checkpoint_original` | N523, N518, N524, N517 | All other 53 in this scope | — |
| G217 | panel.undocked/current: `historical_guards event_publication` | N759, N730 | All other 55 in this scope | — |
| G218 | panel.undocked/current: `historical_guards event_original` | N526, N525, N520, N519, N537, N534, N535, N536, N750 | All other 48 in this scope | — |
| G219 | panel.undocked/current: `historical_guards historical_payload` | N530, N529, N757, N753 | All other 53 in this scope | — |
| G220 | panel.undocked/current: `historical_guards original_receipt` | N528, N521, N527, N749, N731, N748, N745, N738, N742, N740, N741, N733, N734, N735, N737, N736, N739, N732, N744, N747, N746, N743, N755, N752, N751, N754, N532 | All other 30 in this scope | — |
| G221 | panel.undocked/current: `historical_guards original_source` | N531, N522, N756 | All other 54 in this scope | — |
| G222 | panel.undocked/current: `historical_guards original_admission` | N533 | All other 56 in this scope | — |
| G223 | panel.undocked/current: `historical_guards current_permission` | N514, N513, N515 | All other 54 in this scope | — |
| G224 | panel.undocked/current: `historical_guards source_retained` | N728 | All other 56 in this scope | — |
| G225 | panel.undocked/current: `historical_guards current_withdrawal` | N516 | All other 56 in this scope | — |
| G226 | panel.undocked/v1: `historical_guards checkpoint_publication` | N758, N729 | All other 55 in this scope | — |
| G227 | panel.undocked/v1: `historical_guards checkpoint_original` | N523, N518, N524, N517 | All other 53 in this scope | — |
| G228 | panel.undocked/v1: `historical_guards event_publication` | N759, N730 | All other 55 in this scope | — |
| G229 | panel.undocked/v1: `historical_guards event_original` | N526, N525, N520, N519, N537, N534, N535, N536, N750 | All other 48 in this scope | — |
| G230 | panel.undocked/v1: `historical_guards historical_payload` | N530, N529, N757, N753 | All other 53 in this scope | — |
| G231 | panel.undocked/v1: `historical_guards original_receipt` | N528, N521, N527, N749, N731, N748, N745, N738, N742, N740, N741, N733, N734, N735, N737, N736, N739, N732, N744, N747, N746, N743, N755, N752, N751, N754, N532 | All other 30 in this scope | — |
| G232 | panel.undocked/v1: `historical_guards original_source` | N531, N522, N756 | All other 54 in this scope | — |
| G233 | panel.undocked/v1: `historical_guards original_admission` | N533 | All other 56 in this scope | — |
| G234 | panel.undocked/v1: `historical_guards current_permission` | N514, N513, N515 | All other 54 in this scope | — |
| G235 | panel.undocked/v1: `historical_guards source_retained` | N728 | All other 56 in this scope | — |
| G236 | panel.undocked/v1: `historical_guards current_withdrawal` | N516 | All other 56 in this scope | — |
| G237 | concern.created/current: `historical_guards checkpoint_publication` | N758, N729 | All other 55 in this scope | — |
| G238 | concern.created/current: `historical_guards checkpoint_original` | N523, N518, N524, N517 | All other 53 in this scope | — |
| G239 | concern.created/current: `historical_guards event_publication` | N759, N730 | All other 55 in this scope | — |
| G240 | concern.created/current: `historical_guards event_original` | N526, N525, N520, N519, N537, N534, N535, N536, N750 | All other 48 in this scope | — |
| G241 | concern.created/current: `historical_guards historical_payload` | N530, N529, N757, N753 | All other 53 in this scope | — |
| G242 | concern.created/current: `historical_guards original_receipt` | N528, N521, N527, N749, N731, N748, N745, N738, N742, N740, N741, N733, N734, N735, N737, N736, N739, N732, N744, N747, N746, N743, N755, N752, N751, N754, N532 | All other 30 in this scope | — |
| G243 | concern.created/current: `historical_guards original_source` | N531, N522, N756 | All other 54 in this scope | — |
| G244 | concern.created/current: `historical_guards original_admission` | N533 | All other 56 in this scope | — |
| G245 | concern.created/current: `historical_guards current_permission` | N514, N513, N515 | All other 54 in this scope | — |
| G246 | concern.created/current: `historical_guards source_retained` | N728 | All other 56 in this scope | — |
| G247 | concern.created/current: `historical_guards current_withdrawal` | N516 | All other 56 in this scope | — |

The policy guard deliberately repeats generic unsupported-policy rejection. The concern standalone payload schema deliberately repeats the embedded operation payload schema. The redock command.window_id comparison deliberately repeats the generic command/payload window_id join. Exact derived-digest equality also repeats schema type/representation restrictions; these are named pairs, not unrelated defects.

| Pair | Repeated fact / source sites | Negatives that flip together | Negatives that stay rejected |
|---|---|---|---|
| alert:220+222 | writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | N065, N047, N048, N164, N146, N147, N262, N245, N246, N367, N350, N351 | All other 389 in this kind |
| alert:77+87 | operation_errors:77 schema validation + operation_errors:87 'operation identity digest mismatch' | N001, N026, N071, N073, N072, N070, N100, N125, N170, N172, N171, N169, N199, N223, N268, N270, N269, N267, N297, N325, N373, N375, N374, N372 | All other 377 in this kind |
| alert:77+91 | operation_errors:77 schema validation + operation_errors:91 'frozen command digest mismatch' | N002, N026, N075, N077, N076, N074, N101, N125, N174, N176, N175, N173, N200, N223, N272, N274, N273, N271, N298, N325, N377, N379, N378, N376 | All other 377 in this kind |
| panel:71+69 | operation_errors:71 'frozen command window mismatch' + operation_errors:69 'frozen command/payload ' + key | N549, N550, N551, N644, N645, N646 | All other 184 in this kind |
| panel:220+222 | writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | N596, N579, N580, N691, N674, N675 | All other 184 in this kind |
| panel:57+77 | operation_errors:57 schema validation + operation_errors:77 'original identity mismatch' | N552, N538, N555, N604, N606, N605, N603, N647, N633, N650, N699, N701, N700, N698 | All other 176 in this kind |
| panel:57+66 | operation_errors:57 schema validation + operation_errors:66 'frozen command digest mismatch' | N539, N555, N608, N610, N609, N607, N634, N650, N703, N705, N704, N702 | All other 178 in this kind |
| concern:220+222 | writer_policy_errors:220 replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:222 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | N479, N466, N467 | All other 108 in this kind |
| concern:30+40 | operation_errors:30 schema validation + operation_errors:40 'original identity mismatch' | N451, N402, N454, N487, N489, N488, N486 | All other 104 in this kind |
| concern:30+42 | operation_errors:30 schema validation + operation_errors:42 'frozen command/payload/record digest mismatch' | N403, N454, N491, N493, N492, N490 | All other 105 in this kind |
| concern:30+36 | operation_errors:30 schema validation + operation_errors:36 nested payload schema validation | N454, N452 | All other 109 in this kind |

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
| N084 | `alert.acknowledged:source_comparison_array_length` |
| N085 | `alert.acknowledged:source_comparison_array_value` |
| N086 | `alert.acknowledged:source_comparison_object_keys` |
| N087 | `alert.acknowledged:source_comparison_object_value` |
| N088 | `alert.acknowledged:source_comparison_scalar_value` |
| N089 | `alert.acknowledged:source_comparison_type` |
| N090 | `alert.acknowledged:typed_payload_guard_allowed` |
| N091 | `alert.acknowledged:typed_payload_guard_committed` |
| N092 | `alert.acknowledged:typed_payload_guard_current` |
| N093 | `alert.acknowledged:typed_payload_guard_protected` |
| N094 | `alert.acknowledged:typed_protocol_admitted` |
| N095 | `alert.acknowledged:typed_protocol_allowed` |
| N096 | `alert.acknowledged:typed_protocol_current` |
| N097 | `alert.acknowledged:typed_protocol_source_verified` |
| N098 | `alert.acknowledged:typed_storage_maximum_boolean` |
| N099 | `alert.acknowledged:typed_storage_maximum_float` |
| N100 | `alert.dismissed:arbitrary_operation_digest` |
| N101 | `alert.dismissed:arbitrary_request_digest` |
| N102 | `alert.dismissed:candidate_owner_state_acknowledgement_state` |
| N103 | `alert.dismissed:candidate_owner_state_alert_id` |
| N104 | `alert.dismissed:candidate_owner_state_inbox_visible` |
| N105 | `alert.dismissed:candidate_owner_state_project_id` |
| N106 | `alert.dismissed:candidate_owner_state_revision` |
| N107 | `alert.dismissed:candidate_owner_state_snooze_until` |
| N108 | `alert.dismissed:candidate_owner_state_source_record_ref` |
| N109 | `alert.dismissed:candidate_owner_state_unread` |
| N110 | `alert.dismissed:checkpoint_bytes_only` |
| N111 | `alert.dismissed:checkpoint_original_storage` |
| N112 | `alert.dismissed:checkpoint_partition_only` |
| N113 | `alert.dismissed:checkpoint_schema_only` |
| N114 | `alert.dismissed:checkpoint_token_storage` |
| N115 | `alert.dismissed:command_join_actor_ref` |
| N116 | `alert.dismissed:command_join_alert_id` |
| N117 | `alert.dismissed:command_join_alert_record_ref` |
| N118 | `alert.dismissed:command_join_correlation_id` |
| N119 | `alert.dismissed:command_join_currentness_basis_ref` |
| N120 | `alert.dismissed:command_join_idempotency_key` |
| N121 | `alert.dismissed:command_join_project_id` |
| N122 | `alert.dismissed:forged_event_id` |
| N123 | `alert.dismissed:non_successor` |
| N124 | `alert.dismissed:operation_bytes_only` |
| N125 | `alert.dismissed:operation_schema_only` |
| N126 | `alert.dismissed:optional_command_without_payload` |
| N127 | `alert.dismissed:optional_payload_without_command` |
| N128 | `alert.dismissed:pager_cursor` |
| N129 | `alert.dismissed:pager_foreign_family` |
| N130 | `alert.dismissed:pager_foreign_project` |
| N131 | `alert.dismissed:pager_future` |
| N132 | `alert.dismissed:pager_matches` |
| N133 | `alert.dismissed:pager_metadata` |
| N134 | `alert.dismissed:pager_past` |
| N135 | `alert.dismissed:pager_response_bytes` |
| N136 | `alert.dismissed:pager_scan` |
| N137 | `alert.dismissed:pager_single_ref` |
| N138 | `alert.dismissed:payload_extra_secret_field` |
| N139 | `alert.dismissed:payload_failed_commit` |
| N140 | `alert.dismissed:payload_missing_identity` |
| N141 | `alert.dismissed:payload_no_change_revision` |
| N142 | `alert.dismissed:payload_refused` |
| N143 | `alert.dismissed:payload_skipped_revision` |
| N144 | `alert.dismissed:payload_stale_currentness` |
| N145 | `alert.dismissed:payload_wrong_handler` |
| N146 | `alert.dismissed:policy_projector_replay_only` |
| N147 | `alert.dismissed:policy_unknown` |
| N148 | `alert.dismissed:prior_owner_state_acknowledgement_state` |
| N149 | `alert.dismissed:prior_owner_state_alert_id` |
| N150 | `alert.dismissed:prior_owner_state_project_id` |
| N151 | `alert.dismissed:prior_owner_state_revision` |
| N152 | `alert.dismissed:prior_owner_state_snooze_until` |
| N153 | `alert.dismissed:prior_owner_state_source_record_ref` |
| N154 | `alert.dismissed:prior_owner_state_unread` |
| N155 | `alert.dismissed:profile_max_value_bytes_0` |
| N156 | `alert.dismissed:profile_max_value_bytes_16385` |
| N157 | `alert.dismissed:profile_missing` |
| N158 | `alert.dismissed:profile_redb_file_derived` |
| N159 | `alert.dismissed:profile_storage_group_wrong` |
| N160 | `alert.dismissed:protocol_admitted` |
| N161 | `alert.dismissed:protocol_allowed` |
| N162 | `alert.dismissed:protocol_current` |
| N163 | `alert.dismissed:protocol_receipt_event_id` |
| N164 | `alert.dismissed:protocol_replay_policy` |
| N165 | `alert.dismissed:protocol_source_verified` |
| N166 | `alert.dismissed:ref_dangling` |
| N167 | `alert.dismissed:ref_external` |
| N168 | `alert.dismissed:ref_non_schema` |
| N169 | `alert.dismissed:representation_operation_digest_LF` |
| N170 | `alert.dismissed:representation_operation_digest_integer` |
| N171 | `alert.dismissed:representation_operation_digest_spaced` |
| N172 | `alert.dismissed:representation_operation_digest_uppercase` |
| N173 | `alert.dismissed:representation_request_digest_LF` |
| N174 | `alert.dismissed:representation_request_digest_integer` |
| N175 | `alert.dismissed:representation_request_digest_spaced` |
| N176 | `alert.dismissed:representation_request_digest_uppercase` |
| N177 | `alert.dismissed:retry_retry_command` |
| N178 | `alert.dismissed:retry_retry_payload` |
| N179 | `alert.dismissed:schema_metaschema` |
| N180 | `alert.dismissed:schema_unused_ref` |
| N181 | `alert.dismissed:scope_join_idempotency_key` |
| N182 | `alert.dismissed:scope_join_project_id` |
| N183 | `alert.dismissed:source_comparison_array_length` |
| N184 | `alert.dismissed:source_comparison_array_value` |
| N185 | `alert.dismissed:source_comparison_object_keys` |
| N186 | `alert.dismissed:source_comparison_object_value` |
| N187 | `alert.dismissed:source_comparison_scalar_value` |
| N188 | `alert.dismissed:source_comparison_type` |
| N189 | `alert.dismissed:typed_payload_guard_allowed` |
| N190 | `alert.dismissed:typed_payload_guard_committed` |
| N191 | `alert.dismissed:typed_payload_guard_current` |
| N192 | `alert.dismissed:typed_payload_guard_protected` |
| N193 | `alert.dismissed:typed_protocol_admitted` |
| N194 | `alert.dismissed:typed_protocol_allowed` |
| N195 | `alert.dismissed:typed_protocol_current` |
| N196 | `alert.dismissed:typed_protocol_source_verified` |
| N197 | `alert.dismissed:typed_storage_maximum_boolean` |
| N198 | `alert.dismissed:typed_storage_maximum_float` |
| N199 | `alert.rule_muted:arbitrary_operation_digest` |
| N200 | `alert.rule_muted:arbitrary_request_digest` |
| N201 | `alert.rule_muted:candidate_owner_state_alert_rule_id` |
| N202 | `alert.rule_muted:candidate_owner_state_mute_expires_at` |
| N203 | `alert.rule_muted:candidate_owner_state_mute_state` |
| N204 | `alert.rule_muted:candidate_owner_state_project_id` |
| N205 | `alert.rule_muted:candidate_owner_state_revision` |
| N206 | `alert.rule_muted:candidate_owner_state_root_cause_ref` |
| N207 | `alert.rule_muted:candidate_owner_state_source_record_ref` |
| N208 | `alert.rule_muted:checkpoint_bytes_only` |
| N209 | `alert.rule_muted:checkpoint_original_storage` |
| N210 | `alert.rule_muted:checkpoint_partition_only` |
| N211 | `alert.rule_muted:checkpoint_schema_only` |
| N212 | `alert.rule_muted:checkpoint_token_storage` |
| N213 | `alert.rule_muted:command_join_actor_ref` |
| N214 | `alert.rule_muted:command_join_alert_rule_id` |
| N215 | `alert.rule_muted:command_join_alert_rule_ref` |
| N216 | `alert.rule_muted:command_join_correlation_id` |
| N217 | `alert.rule_muted:command_join_currentness_basis_ref` |
| N218 | `alert.rule_muted:command_join_idempotency_key` |
| N219 | `alert.rule_muted:command_join_project_id` |
| N220 | `alert.rule_muted:forged_event_id` |
| N221 | `alert.rule_muted:non_successor` |
| N222 | `alert.rule_muted:operation_bytes_only` |
| N223 | `alert.rule_muted:operation_schema_only` |
| N224 | `alert.rule_muted:optional_command_without_payload` |
| N225 | `alert.rule_muted:optional_payload_without_command` |
| N226 | `alert.rule_muted:pager_cursor` |
| N227 | `alert.rule_muted:pager_foreign_family` |
| N228 | `alert.rule_muted:pager_foreign_project` |
| N229 | `alert.rule_muted:pager_future` |
| N230 | `alert.rule_muted:pager_matches` |
| N231 | `alert.rule_muted:pager_metadata` |
| N232 | `alert.rule_muted:pager_past` |
| N233 | `alert.rule_muted:pager_response_bytes` |
| N234 | `alert.rule_muted:pager_scan` |
| N235 | `alert.rule_muted:pager_single_ref` |
| N236 | `alert.rule_muted:payload_extra_secret_field` |
| N237 | `alert.rule_muted:payload_failed_commit` |
| N238 | `alert.rule_muted:payload_missing_identity` |
| N239 | `alert.rule_muted:payload_no_change_revision` |
| N240 | `alert.rule_muted:payload_protected_interruption` |
| N241 | `alert.rule_muted:payload_refused` |
| N242 | `alert.rule_muted:payload_skipped_revision` |
| N243 | `alert.rule_muted:payload_stale_currentness` |
| N244 | `alert.rule_muted:payload_wrong_handler` |
| N245 | `alert.rule_muted:policy_projector_replay_only` |
| N246 | `alert.rule_muted:policy_unknown` |
| N247 | `alert.rule_muted:prior_owner_state_alert_rule_id` |
| N248 | `alert.rule_muted:prior_owner_state_mute_state` |
| N249 | `alert.rule_muted:prior_owner_state_project_id` |
| N250 | `alert.rule_muted:prior_owner_state_revision` |
| N251 | `alert.rule_muted:prior_owner_state_root_cause_ref` |
| N252 | `alert.rule_muted:prior_owner_state_source_record_ref` |
| N253 | `alert.rule_muted:profile_max_value_bytes_0` |
| N254 | `alert.rule_muted:profile_max_value_bytes_16385` |
| N255 | `alert.rule_muted:profile_missing` |
| N256 | `alert.rule_muted:profile_redb_file_derived` |
| N257 | `alert.rule_muted:profile_storage_group_wrong` |
| N258 | `alert.rule_muted:protocol_admitted` |
| N259 | `alert.rule_muted:protocol_allowed` |
| N260 | `alert.rule_muted:protocol_current` |
| N261 | `alert.rule_muted:protocol_receipt_event_id` |
| N262 | `alert.rule_muted:protocol_replay_policy` |
| N263 | `alert.rule_muted:protocol_source_verified` |
| N264 | `alert.rule_muted:ref_dangling` |
| N265 | `alert.rule_muted:ref_external` |
| N266 | `alert.rule_muted:ref_non_schema` |
| N267 | `alert.rule_muted:representation_operation_digest_LF` |
| N268 | `alert.rule_muted:representation_operation_digest_integer` |
| N269 | `alert.rule_muted:representation_operation_digest_spaced` |
| N270 | `alert.rule_muted:representation_operation_digest_uppercase` |
| N271 | `alert.rule_muted:representation_request_digest_LF` |
| N272 | `alert.rule_muted:representation_request_digest_integer` |
| N273 | `alert.rule_muted:representation_request_digest_spaced` |
| N274 | `alert.rule_muted:representation_request_digest_uppercase` |
| N275 | `alert.rule_muted:retry_retry_command` |
| N276 | `alert.rule_muted:retry_retry_payload` |
| N277 | `alert.rule_muted:schema_metaschema` |
| N278 | `alert.rule_muted:schema_unused_ref` |
| N279 | `alert.rule_muted:scope_join_idempotency_key` |
| N280 | `alert.rule_muted:scope_join_project_id` |
| N281 | `alert.rule_muted:source_comparison_array_length` |
| N282 | `alert.rule_muted:source_comparison_array_value` |
| N283 | `alert.rule_muted:source_comparison_object_keys` |
| N284 | `alert.rule_muted:source_comparison_object_value` |
| N285 | `alert.rule_muted:source_comparison_scalar_value` |
| N286 | `alert.rule_muted:source_comparison_type` |
| N287 | `alert.rule_muted:typed_payload_guard_allowed` |
| N288 | `alert.rule_muted:typed_payload_guard_committed` |
| N289 | `alert.rule_muted:typed_payload_guard_current` |
| N290 | `alert.rule_muted:typed_payload_guard_protected` |
| N291 | `alert.rule_muted:typed_protocol_admitted` |
| N292 | `alert.rule_muted:typed_protocol_allowed` |
| N293 | `alert.rule_muted:typed_protocol_current` |
| N294 | `alert.rule_muted:typed_protocol_source_verified` |
| N295 | `alert.rule_muted:typed_storage_maximum_boolean` |
| N296 | `alert.rule_muted:typed_storage_maximum_float` |
| N297 | `alert.snoozed:arbitrary_operation_digest` |
| N298 | `alert.snoozed:arbitrary_request_digest` |
| N299 | `alert.snoozed:candidate_owner_state_acknowledgement_state` |
| N300 | `alert.snoozed:candidate_owner_state_alert_id` |
| N301 | `alert.snoozed:candidate_owner_state_inbox_visible` |
| N302 | `alert.snoozed:candidate_owner_state_project_id` |
| N303 | `alert.snoozed:candidate_owner_state_revision` |
| N304 | `alert.snoozed:candidate_owner_state_snooze_until` |
| N305 | `alert.snoozed:candidate_owner_state_source_record_ref` |
| N306 | `alert.snoozed:candidate_owner_state_unread` |
| N307 | `alert.snoozed:checkpoint_bytes_only` |
| N308 | `alert.snoozed:checkpoint_original_storage` |
| N309 | `alert.snoozed:checkpoint_partition_only` |
| N310 | `alert.snoozed:checkpoint_schema_only` |
| N311 | `alert.snoozed:checkpoint_token_storage` |
| N312 | `alert.snoozed:command_join_actor_ref` |
| N313 | `alert.snoozed:command_join_alert_id` |
| N314 | `alert.snoozed:command_join_alert_record_ref` |
| N315 | `alert.snoozed:command_join_correlation_id` |
| N316 | `alert.snoozed:command_join_currentness_basis_ref` |
| N317 | `alert.snoozed:command_join_idempotency_key` |
| N318 | `alert.snoozed:command_join_project_id` |
| N319 | `alert.snoozed:expired_original_deadline` |
| N320 | `alert.snoozed:forged_event_id` |
| N321 | `alert.snoozed:non_successor` |
| N322 | `alert.snoozed:operation_bytes_only` |
| N323 | `alert.snoozed:operation_offset_past` |
| N324 | `alert.snoozed:operation_offset_same_instant` |
| N325 | `alert.snoozed:operation_schema_only` |
| N326 | `alert.snoozed:optional_command_without_payload` |
| N327 | `alert.snoozed:optional_payload_without_command` |
| N328 | `alert.snoozed:pager_cursor` |
| N329 | `alert.snoozed:pager_foreign_family` |
| N330 | `alert.snoozed:pager_foreign_project` |
| N331 | `alert.snoozed:pager_future` |
| N332 | `alert.snoozed:pager_matches` |
| N333 | `alert.snoozed:pager_metadata` |
| N334 | `alert.snoozed:pager_past` |
| N335 | `alert.snoozed:pager_response_bytes` |
| N336 | `alert.snoozed:pager_scan` |
| N337 | `alert.snoozed:pager_single_ref` |
| N338 | `alert.snoozed:payload_expired_snooze` |
| N339 | `alert.snoozed:payload_extra_secret_field` |
| N340 | `alert.snoozed:payload_failed_commit` |
| N341 | `alert.snoozed:payload_missing_identity` |
| N342 | `alert.snoozed:payload_no_change_revision` |
| N343 | `alert.snoozed:payload_offset_past` |
| N344 | `alert.snoozed:payload_offset_same_instant` |
| N345 | `alert.snoozed:payload_protected_interruption` |
| N346 | `alert.snoozed:payload_refused` |
| N347 | `alert.snoozed:payload_skipped_revision` |
| N348 | `alert.snoozed:payload_stale_currentness` |
| N349 | `alert.snoozed:payload_wrong_handler` |
| N350 | `alert.snoozed:policy_projector_replay_only` |
| N351 | `alert.snoozed:policy_unknown` |
| N352 | `alert.snoozed:prior_owner_state_acknowledgement_state` |
| N353 | `alert.snoozed:prior_owner_state_alert_id` |
| N354 | `alert.snoozed:prior_owner_state_project_id` |
| N355 | `alert.snoozed:prior_owner_state_revision` |
| N356 | `alert.snoozed:prior_owner_state_source_record_ref` |
| N357 | `alert.snoozed:prior_owner_state_unread` |
| N358 | `alert.snoozed:profile_max_value_bytes_0` |
| N359 | `alert.snoozed:profile_max_value_bytes_16385` |
| N360 | `alert.snoozed:profile_missing` |
| N361 | `alert.snoozed:profile_redb_file_derived` |
| N362 | `alert.snoozed:profile_storage_group_wrong` |
| N363 | `alert.snoozed:protocol_admitted` |
| N364 | `alert.snoozed:protocol_allowed` |
| N365 | `alert.snoozed:protocol_current` |
| N366 | `alert.snoozed:protocol_receipt_event_id` |
| N367 | `alert.snoozed:protocol_replay_policy` |
| N368 | `alert.snoozed:protocol_source_verified` |
| N369 | `alert.snoozed:ref_dangling` |
| N370 | `alert.snoozed:ref_external` |
| N371 | `alert.snoozed:ref_non_schema` |
| N372 | `alert.snoozed:representation_operation_digest_LF` |
| N373 | `alert.snoozed:representation_operation_digest_integer` |
| N374 | `alert.snoozed:representation_operation_digest_spaced` |
| N375 | `alert.snoozed:representation_operation_digest_uppercase` |
| N376 | `alert.snoozed:representation_request_digest_LF` |
| N377 | `alert.snoozed:representation_request_digest_integer` |
| N378 | `alert.snoozed:representation_request_digest_spaced` |
| N379 | `alert.snoozed:representation_request_digest_uppercase` |
| N380 | `alert.snoozed:retry_retry_command` |
| N381 | `alert.snoozed:retry_retry_payload` |
| N382 | `alert.snoozed:schema_metaschema` |
| N383 | `alert.snoozed:schema_unused_ref` |
| N384 | `alert.snoozed:scope_join_idempotency_key` |
| N385 | `alert.snoozed:scope_join_project_id` |
| N386 | `alert.snoozed:source_comparison_array_length` |
| N387 | `alert.snoozed:source_comparison_array_value` |
| N388 | `alert.snoozed:source_comparison_object_keys` |
| N389 | `alert.snoozed:source_comparison_object_value` |
| N390 | `alert.snoozed:source_comparison_scalar_value` |
| N391 | `alert.snoozed:source_comparison_type` |
| N392 | `alert.snoozed:typed_payload_guard_allowed` |
| N393 | `alert.snoozed:typed_payload_guard_committed` |
| N394 | `alert.snoozed:typed_payload_guard_current` |
| N395 | `alert.snoozed:typed_payload_guard_protected` |
| N396 | `alert.snoozed:typed_protocol_admitted` |
| N397 | `alert.snoozed:typed_protocol_allowed` |
| N398 | `alert.snoozed:typed_protocol_current` |
| N399 | `alert.snoozed:typed_protocol_source_verified` |
| N400 | `alert.snoozed:typed_storage_maximum_boolean` |
| N401 | `alert.snoozed:typed_storage_maximum_float` |
| N402 | `concern.created:arbitrary_operation_digest` |
| N403 | `concern.created:arbitrary_request_digest` |
| N404 | `concern.created:authority_join_actor_ref` |
| N405 | `concern.created:authority_join_authority_basis_ref` |
| N406 | `concern.created:authority_join_currentness_basis_ref` |
| N407 | `concern.created:authority_join_permission_snapshot_ref` |
| N408 | `concern.created:authority_join_project_id` |
| N409 | `concern.created:authority_join_source_refs` |
| N410 | `concern.created:candidate_record_artifact_refs` |
| N411 | `concern.created:candidate_record_attention_level` |
| N412 | `concern.created:candidate_record_blocking_effect_ref` |
| N413 | `concern.created:candidate_record_chatworthy` |
| N414 | `concern.created:candidate_record_concern_category` |
| N415 | `concern.created:candidate_record_concern_id` |
| N416 | `concern.created:candidate_record_created_at` |
| N417 | `concern.created:candidate_record_created_by_kind` |
| N418 | `concern.created:candidate_record_created_by_ref` |
| N419 | `concern.created:candidate_record_creator_ref` |
| N420 | `concern.created:candidate_record_evidence_refs` |
| N421 | `concern.created:candidate_record_lineage_refs` |
| N422 | `concern.created:candidate_record_owner_kind` |
| N423 | `concern.created:candidate_record_owner_ref` |
| N424 | `concern.created:candidate_record_record_id` |
| N425 | `concern.created:candidate_record_resolution_kind` |
| N426 | `concern.created:candidate_record_resolved_at` |
| N427 | `concern.created:candidate_record_resolver_ref` |
| N428 | `concern.created:candidate_record_revision` |
| N429 | `concern.created:candidate_record_run_ref` |
| N430 | `concern.created:candidate_record_scope_ref` |
| N431 | `concern.created:candidate_record_severity` |
| N432 | `concern.created:candidate_record_source_event_refs` |
| N433 | `concern.created:candidate_record_status` |
| N434 | `concern.created:candidate_record_subject_ref` |
| N435 | `concern.created:candidate_record_summary` |
| N436 | `concern.created:candidate_record_updated_at` |
| N437 | `concern.created:candidate_record_visibility_level` |
| N438 | `concern.created:checkpoint_bytes_only` |
| N439 | `concern.created:checkpoint_original_storage` |
| N440 | `concern.created:checkpoint_partition_only` |
| N441 | `concern.created:checkpoint_schema_only` |
| N442 | `concern.created:checkpoint_token_storage` |
| N443 | `concern.created:command_join_correlation_id` |
| N444 | `concern.created:command_join_currentness_basis_ref` |
| N445 | `concern.created:command_join_origin` |
| N446 | `concern.created:creator_actor_join` |
| N447 | `concern.created:forbidden_creator_External Resource` |
| N448 | `concern.created:forbidden_creator_Recovery` |
| N449 | `concern.created:forbidden_creator_User` |
| N450 | `concern.created:forbidden_creator_Worker` |
| N451 | `concern.created:forged_event_id` |
| N452 | `concern.created:nested_payload_schema_only` |
| N453 | `concern.created:operation_bytes_only` |
| N454 | `concern.created:operation_schema_only` |
| N455 | `concern.created:pager_cursor` |
| N456 | `concern.created:pager_foreign_family` |
| N457 | `concern.created:pager_foreign_project` |
| N458 | `concern.created:pager_future` |
| N459 | `concern.created:pager_matches` |
| N460 | `concern.created:pager_metadata` |
| N461 | `concern.created:pager_past` |
| N462 | `concern.created:pager_response_bytes` |
| N463 | `concern.created:pager_scan` |
| N464 | `concern.created:pager_single_ref` |
| N465 | `concern.created:partition_only` |
| N466 | `concern.created:policy_projector_replay_only` |
| N467 | `concern.created:policy_unknown` |
| N468 | `concern.created:profile_max_value_bytes_0` |
| N469 | `concern.created:profile_max_value_bytes_16385` |
| N470 | `concern.created:profile_missing` |
| N471 | `concern.created:profile_redb_file_derived` |
| N472 | `concern.created:profile_storage_group_wrong` |
| N473 | `concern.created:protocol_admitted` |
| N474 | `concern.created:protocol_authority_verified` |
| N475 | `concern.created:protocol_concern_key_exists` |
| N476 | `concern.created:protocol_permission_allowed` |
| N477 | `concern.created:protocol_publication_state` |
| N478 | `concern.created:protocol_receipt_event_id` |
| N479 | `concern.created:protocol_replay_policy` |
| N480 | `concern.created:protocol_retry_digest` |
| N481 | `concern.created:protocol_source_current` |
| N482 | `concern.created:protocol_subject_already_active` |
| N483 | `concern.created:ref_dangling` |
| N484 | `concern.created:ref_external` |
| N485 | `concern.created:ref_non_schema` |
| N486 | `concern.created:representation_operation_digest_LF` |
| N487 | `concern.created:representation_operation_digest_integer` |
| N488 | `concern.created:representation_operation_digest_spaced` |
| N489 | `concern.created:representation_operation_digest_uppercase` |
| N490 | `concern.created:representation_request_digest_LF` |
| N491 | `concern.created:representation_request_digest_integer` |
| N492 | `concern.created:representation_request_digest_spaced` |
| N493 | `concern.created:representation_request_digest_uppercase` |
| N494 | `concern.created:revision_one_ref_join` |
| N495 | `concern.created:schema_metaschema` |
| N496 | `concern.created:schema_unused_ref` |
| N497 | `concern.created:scope_payload_key` |
| N498 | `concern.created:scope_record_project` |
| N499 | `concern.created:source_comparison_array_length` |
| N500 | `concern.created:source_comparison_array_value` |
| N501 | `concern.created:source_comparison_object_keys` |
| N502 | `concern.created:source_comparison_object_value` |
| N503 | `concern.created:source_comparison_scalar_value` |
| N504 | `concern.created:source_comparison_type` |
| N505 | `concern.created:typed_protocol_admitted` |
| N506 | `concern.created:typed_protocol_authority_verified` |
| N507 | `concern.created:typed_protocol_concern_key_exists` |
| N508 | `concern.created:typed_protocol_permission_allowed` |
| N509 | `concern.created:typed_protocol_source_current` |
| N510 | `concern.created:typed_protocol_subject_already_active` |
| N511 | `concern.created:typed_storage_maximum_boolean` |
| N512 | `concern.created:typed_storage_maximum_float` |
| N513 | `current_membership_denied` |
| N514 | `current_permission_denied` |
| N515 | `current_source_access_denied` |
| N516 | `current_withdrawal` |
| N517 | `foreign_checkpoint_consumer` |
| N518 | `foreign_checkpoint_storage` |
| N519 | `foreign_event_project` |
| N520 | `foreign_event_storage` |
| N521 | `foreign_receipt_storage` |
| N522 | `foreign_source_storage` |
| N523 | `forged_checkpoint_publication` |
| N524 | `forged_checkpoint_token` |
| N525 | `forged_event_id` |
| N526 | `forged_event_ref` |
| N527 | `forged_original_result` |
| N528 | `forged_receipt_event` |
| N529 | `forged_schema_invalid_payload` |
| N530 | `forged_schema_valid_payload` |
| N531 | `forged_source_selection` |
| N532 | `missing_original_receipt_sequence` |
| N533 | `not_valid_when_written` |
| N534 | `original_storage_event_type` |
| N535 | `original_storage_observed_at_utc` |
| N536 | `original_storage_persisted_at_utc` |
| N537 | `original_storage_sequence_id` |
| N538 | `panel.redocked:arbitrary_operation_digest` |
| N539 | `panel.redocked:arbitrary_request_digest` |
| N540 | `panel.redocked:candidate_host_snapshot_app_session_id` |
| N541 | `panel.redocked:candidate_host_snapshot_host` |
| N542 | `panel.redocked:candidate_host_snapshot_host_revision` |
| N543 | `panel.redocked:candidate_host_snapshot_window_id` |
| N544 | `panel.redocked:checkpoint_bytes_only` |
| N545 | `panel.redocked:checkpoint_original_storage` |
| N546 | `panel.redocked:checkpoint_partition_only` |
| N547 | `panel.redocked:checkpoint_schema_only` |
| N548 | `panel.redocked:checkpoint_token_storage` |
| N549 | `panel.redocked:command_join_actor_ref` |
| N550 | `panel.redocked:command_join_correlation_id` |
| N551 | `panel.redocked:command_window_join` |
| N552 | `panel.redocked:forged_event_id` |
| N553 | `panel.redocked:home_context_only` |
| N554 | `panel.redocked:operation_bytes_only` |
| N555 | `panel.redocked:operation_schema_only` |
| N556 | `panel.redocked:original_result_dispatch_receipt_ref` |
| N557 | `panel.redocked:original_result_owner_commit_ref` |
| N558 | `panel.redocked:original_result_result_ref` |
| N559 | `panel.redocked:pager_cursor` |
| N560 | `panel.redocked:pager_foreign_family` |
| N561 | `panel.redocked:pager_foreign_project` |
| N562 | `panel.redocked:pager_future` |
| N563 | `panel.redocked:pager_matches` |
| N564 | `panel.redocked:pager_metadata` |
| N565 | `panel.redocked:pager_past` |
| N566 | `panel.redocked:pager_response_bytes` |
| N567 | `panel.redocked:pager_scan` |
| N568 | `panel.redocked:pager_single_ref` |
| N569 | `panel.redocked:payload_application_key_missing_server_and_operation` |
| N570 | `panel.redocked:payload_coemission` |
| N571 | `panel.redocked:payload_missing_session` |
| N572 | `panel.redocked:payload_no_successor` |
| N573 | `panel.redocked:payload_non_chat` |
| N574 | `panel.redocked:payload_old_layout_field` |
| N575 | `panel.redocked:payload_saved_host` |
| N576 | `panel.redocked:payload_scope_join_mismatch` |
| N577 | `panel.redocked:payload_wrong_command` |
| N578 | `panel.redocked:payload_wrong_source_host` |
| N579 | `panel.redocked:policy_projector_replay_only` |
| N580 | `panel.redocked:policy_unknown` |
| N581 | `panel.redocked:prior_host_snapshot_app_session_id` |
| N582 | `panel.redocked:prior_host_snapshot_host` |
| N583 | `panel.redocked:prior_host_snapshot_host_revision` |
| N584 | `panel.redocked:prior_host_snapshot_window_id` |
| N585 | `panel.redocked:profile_max_value_bytes_0` |
| N586 | `panel.redocked:profile_max_value_bytes_16385` |
| N587 | `panel.redocked:profile_missing` |
| N588 | `panel.redocked:profile_redb_file_derived` |
| N589 | `panel.redocked:profile_storage_group_wrong` |
| N590 | `panel.redocked:protocol_admitted` |
| N591 | `panel.redocked:protocol_coherently_forged_identity` |
| N592 | `panel.redocked:protocol_cursor` |
| N593 | `panel.redocked:protocol_desktop` |
| N594 | `panel.redocked:protocol_publication_state` |
| N595 | `panel.redocked:protocol_receipt_event_id` |
| N596 | `panel.redocked:protocol_replay_policy` |
| N597 | `panel.redocked:protocol_session` |
| N598 | `panel.redocked:protocol_source_verified` |
| N599 | `panel.redocked:protocol_window` |
| N600 | `panel.redocked:ref_dangling` |
| N601 | `panel.redocked:ref_external` |
| N602 | `panel.redocked:ref_non_schema` |
| N603 | `panel.redocked:representation_operation_digest_LF` |
| N604 | `panel.redocked:representation_operation_digest_integer` |
| N605 | `panel.redocked:representation_operation_digest_spaced` |
| N606 | `panel.redocked:representation_operation_digest_uppercase` |
| N607 | `panel.redocked:representation_request_digest_LF` |
| N608 | `panel.redocked:representation_request_digest_integer` |
| N609 | `panel.redocked:representation_request_digest_spaced` |
| N610 | `panel.redocked:representation_request_digest_uppercase` |
| N611 | `panel.redocked:retry_retry_command` |
| N612 | `panel.redocked:retry_retry_payload` |
| N613 | `panel.redocked:schema_metaschema` |
| N614 | `panel.redocked:schema_unused_ref` |
| N615 | `panel.redocked:scope_join_app_session_id` |
| N616 | `panel.redocked:scope_join_idempotency_key` |
| N617 | `panel.redocked:scope_join_project_id` |
| N618 | `panel.redocked:scope_join_scope_partition` |
| N619 | `panel.redocked:scope_join_server_id` |
| N620 | `panel.redocked:scope_join_storage_instance_id` |
| N621 | `panel.redocked:source_comparison_array_length` |
| N622 | `panel.redocked:source_comparison_array_value` |
| N623 | `panel.redocked:source_comparison_object_keys` |
| N624 | `panel.redocked:source_comparison_object_value` |
| N625 | `panel.redocked:source_comparison_scalar_value` |
| N626 | `panel.redocked:source_comparison_type` |
| N627 | `panel.redocked:successor_only` |
| N628 | `panel.redocked:typed_protocol_admitted` |
| N629 | `panel.redocked:typed_protocol_desktop` |
| N630 | `panel.redocked:typed_protocol_source_verified` |
| N631 | `panel.redocked:typed_storage_maximum_boolean` |
| N632 | `panel.redocked:typed_storage_maximum_float` |
| N633 | `panel.undocked:arbitrary_operation_digest` |
| N634 | `panel.undocked:arbitrary_request_digest` |
| N635 | `panel.undocked:candidate_host_snapshot_app_session_id` |
| N636 | `panel.undocked:candidate_host_snapshot_host` |
| N637 | `panel.undocked:candidate_host_snapshot_host_revision` |
| N638 | `panel.undocked:candidate_host_snapshot_window_id` |
| N639 | `panel.undocked:checkpoint_bytes_only` |
| N640 | `panel.undocked:checkpoint_original_storage` |
| N641 | `panel.undocked:checkpoint_partition_only` |
| N642 | `panel.undocked:checkpoint_schema_only` |
| N643 | `panel.undocked:checkpoint_token_storage` |
| N644 | `panel.undocked:command_join_actor_ref` |
| N645 | `panel.undocked:command_join_correlation_id` |
| N646 | `panel.undocked:command_window_join` |
| N647 | `panel.undocked:forged_event_id` |
| N648 | `panel.undocked:home_context_only` |
| N649 | `panel.undocked:operation_bytes_only` |
| N650 | `panel.undocked:operation_schema_only` |
| N651 | `panel.undocked:original_result_dispatch_receipt_ref` |
| N652 | `panel.undocked:original_result_owner_commit_ref` |
| N653 | `panel.undocked:original_result_result_ref` |
| N654 | `panel.undocked:pager_cursor` |
| N655 | `panel.undocked:pager_foreign_family` |
| N656 | `panel.undocked:pager_foreign_project` |
| N657 | `panel.undocked:pager_future` |
| N658 | `panel.undocked:pager_matches` |
| N659 | `panel.undocked:pager_metadata` |
| N660 | `panel.undocked:pager_past` |
| N661 | `panel.undocked:pager_response_bytes` |
| N662 | `panel.undocked:pager_scan` |
| N663 | `panel.undocked:pager_single_ref` |
| N664 | `panel.undocked:payload_application_key_missing_server_and_operation` |
| N665 | `panel.undocked:payload_coemission` |
| N666 | `panel.undocked:payload_missing_session` |
| N667 | `panel.undocked:payload_no_successor` |
| N668 | `panel.undocked:payload_non_chat` |
| N669 | `panel.undocked:payload_old_layout_field` |
| N670 | `panel.undocked:payload_saved_host` |
| N671 | `panel.undocked:payload_scope_join_mismatch` |
| N672 | `panel.undocked:payload_wrong_command` |
| N673 | `panel.undocked:payload_wrong_source_host` |
| N674 | `panel.undocked:policy_projector_replay_only` |
| N675 | `panel.undocked:policy_unknown` |
| N676 | `panel.undocked:prior_host_snapshot_app_session_id` |
| N677 | `panel.undocked:prior_host_snapshot_host` |
| N678 | `panel.undocked:prior_host_snapshot_host_revision` |
| N679 | `panel.undocked:prior_host_snapshot_window_id` |
| N680 | `panel.undocked:profile_max_value_bytes_0` |
| N681 | `panel.undocked:profile_max_value_bytes_16385` |
| N682 | `panel.undocked:profile_missing` |
| N683 | `panel.undocked:profile_redb_file_derived` |
| N684 | `panel.undocked:profile_storage_group_wrong` |
| N685 | `panel.undocked:protocol_admitted` |
| N686 | `panel.undocked:protocol_coherently_forged_identity` |
| N687 | `panel.undocked:protocol_cursor` |
| N688 | `panel.undocked:protocol_desktop` |
| N689 | `panel.undocked:protocol_publication_state` |
| N690 | `panel.undocked:protocol_receipt_event_id` |
| N691 | `panel.undocked:protocol_replay_policy` |
| N692 | `panel.undocked:protocol_session` |
| N693 | `panel.undocked:protocol_source_verified` |
| N694 | `panel.undocked:protocol_window` |
| N695 | `panel.undocked:ref_dangling` |
| N696 | `panel.undocked:ref_external` |
| N697 | `panel.undocked:ref_non_schema` |
| N698 | `panel.undocked:representation_operation_digest_LF` |
| N699 | `panel.undocked:representation_operation_digest_integer` |
| N700 | `panel.undocked:representation_operation_digest_spaced` |
| N701 | `panel.undocked:representation_operation_digest_uppercase` |
| N702 | `panel.undocked:representation_request_digest_LF` |
| N703 | `panel.undocked:representation_request_digest_integer` |
| N704 | `panel.undocked:representation_request_digest_spaced` |
| N705 | `panel.undocked:representation_request_digest_uppercase` |
| N706 | `panel.undocked:retry_retry_command` |
| N707 | `panel.undocked:retry_retry_payload` |
| N708 | `panel.undocked:schema_metaschema` |
| N709 | `panel.undocked:schema_unused_ref` |
| N710 | `panel.undocked:scope_join_app_session_id` |
| N711 | `panel.undocked:scope_join_idempotency_key` |
| N712 | `panel.undocked:scope_join_project_id` |
| N713 | `panel.undocked:scope_join_scope_partition` |
| N714 | `panel.undocked:scope_join_server_id` |
| N715 | `panel.undocked:scope_join_storage_instance_id` |
| N716 | `panel.undocked:source_comparison_array_length` |
| N717 | `panel.undocked:source_comparison_array_value` |
| N718 | `panel.undocked:source_comparison_object_keys` |
| N719 | `panel.undocked:source_comparison_object_value` |
| N720 | `panel.undocked:source_comparison_scalar_value` |
| N721 | `panel.undocked:source_comparison_type` |
| N722 | `panel.undocked:successor_only` |
| N723 | `panel.undocked:typed_protocol_admitted` |
| N724 | `panel.undocked:typed_protocol_desktop` |
| N725 | `panel.undocked:typed_protocol_source_verified` |
| N726 | `panel.undocked:typed_storage_maximum_boolean` |
| N727 | `panel.undocked:typed_storage_maximum_float` |
| N728 | `source_deleted` |
| N729 | `staged_checkpoint` |
| N730 | `staged_event` |
| N731 | `storage_event_id` |
| N732 | `storage_first_append_receipt_acknowledged_at_utc` |
| N733 | `storage_first_append_receipt_byte_offset` |
| N734 | `storage_first_append_receipt_commit_group_id` |
| N735 | `storage_first_append_receipt_durability_class` |
| N736 | `storage_first_append_receipt_durability_state` |
| N737 | `storage_first_append_receipt_durable_end_offset` |
| N738 | `storage_first_append_receipt_event_id` |
| N739 | `storage_first_append_receipt_manifest_generation` |
| N740 | `storage_first_append_receipt_segment_generation` |
| N741 | `storage_first_append_receipt_segment_name` |
| N742 | `storage_first_append_receipt_sequence_id` |
| N743 | `storage_original_append_result_byte_offset` |
| N744 | `storage_original_append_result_event_id` |
| N745 | `storage_original_append_result_ref` |
| N746 | `storage_original_append_result_segment_ref` |
| N747 | `storage_original_append_result_sequence_id` |
| N748 | `storage_sequence_id` |
| N749 | `storage_storage_instance_id` |
| N750 | `typed_event_sequence` |
| N751 | `typed_first_receipt_generation` |
| N752 | `typed_first_receipt_sequence` |
| N753 | `typed_original_payload_integer` |
| N754 | `typed_original_result_offset` |
| N755 | `typed_receipt_sequence` |
| N756 | `typed_source_generation` |
| N757 | `unknown_historical_version` |
| N758 | `withdrawn_checkpoint` |
| N759 | `withdrawn_event` |

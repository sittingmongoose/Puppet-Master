# Admission merge 2: application record

Status: APPLIED MERGE 2. 299 new families and eight registered-row changes are committed. DG5's five definition confirmations are deferred to merge 3 by DL-2443. Native execution: NOT_RUN.

Branch: plans/ea-merge2-apply-20261116. Requested integration base: 01e696a112d7429dfdf52b2147e912a7c8d7d825.
Source checkpoint before this reporting update: 826e6cb4d4a50e8c2635c4003576b4c0248bed6f.
Registry checkpoint: 2026-11-18.1, 518 families.

Original authority: Jared's EA-P1 A, EA-P2 B and EA-P3 A, signed 2026-11-14. DL-2443 records the Nov 17 batch-boundary answer verbatim: "Land without them". Source: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_MERGE2-SPLIT_20261117.md, SHA-256 d4723e065acc5804ba1cbc73d60d94c63aadb78e21d7ccea93bb597f9f35eb68. DL-400 per-family requirements stand. The review/landing reading is attributed to coordinator pm7-build, not quoted as additional words from Jared.

Immutable original preparation input: reports/event-authority-20261116/admission-merge-2/readiness-list.json, SHA-256 9662c60d40d2b247567d6007779c36ea6f450c77a2649f176ef42f62c028f792. Its 298 ready families are retained. Usage was applied separately as DL-2444 from reports/event-authority-20261116/admission-merge-2/usage-readiness-list.json, SHA-256 12d02f10f2c0ce60f70b96f939ae7fe576dab5e0e04a80ace55df50ddc66493e.

Final census: reports/event-authority-20261116/admission-merge-2/final-census.json, SHA-256 7c914bdaaa02d70f541f617d261196b5b3e3ed029833bdff4b2726895befcf2f.
Declared reporting input: reports/event-authority-20261116/admission-merge-2/final-application-inputs.json, SHA-256 cafef7a3a2bcb1a2876f7a62b0f773f80dd3f59ed854ee38311586a6cdb7e290. Original-branch commit maps below are reporting inputs; independent replay uses its own commits.

| Family | Lane | Decision | Applied commit |
|---|---|---|---|
| alert.acknowledged | DG6A | DL-2137 | 468314467bf3ded0b8bd5f3b1ea6915cf2304207 |
| alert.dismissed | DG6A | DL-2138 | 82c0d6a1d9d4ae57665b7e854babe29ea278bce1 |
| alert.rule_muted | DG6A | DL-2139 | e99bdfdcd6f4920e9b9e67dad2e563033cbc7cbd |
| alert.snoozed | DG6A | DL-2140 | 465eef6d0f59264aa35e6b03b93401a8017eccb5 |
| approval.denied | DT | DL-2141 | 21e6eea6d70aa902544cf55242418ade6c69218a |
| approval.granted | DT | DL-2142 | d72f93b08533501f8424cec00ef33b3e93c44934 |
| approval.requested | DT | DL-2143 | 8eddbc04ff368d398f69fdd85eb70cbc4e0edab3 |
| approval.timeout | DT | DL-2144 | 2b0f032ff00ebca53640cdc5ab358af490b7c3a9 |
| auth.github.authenticated | DG6B | DL-2145 | 3dfad2f1073639ea469e1d2da137bd6c1b3d3bfe |
| auth.github.device_code.issued | DG6B | DL-2146 | 93b5454fe0bc14857dc05261bda4f9ce607e6cf5 |
| auth.github.disconnected | DG6B | DL-2147 | 6b641dcc9e12bbf5ff818e6ed16e0a0bd2f41a0d |
| auth.github.failed | DG6B | DL-2148 | 8d0fc7231759c0c2e62c5a57e2f57c9bd3b310a6 |
| auth.github.token.polling | DG6B | DL-2149 | 6214a87b2b1f2e8921cd3c08ad21780821847285 |
| backup.destination_changed | W3E | DL-2150 | e99e8ba5e1e9b5afc0e8066b2edd79c350b149fa |
| backup.state_changed | W3E | DL-2151 | bbeb755a4c1b46851826d7f19344717c47cd584c |
| brainstorm.plan_synthesized | DC | DL-2152 | 9dcb70f0ce45a3cc5f9262d32cb361b71f65e11b |
| brainstorm.proposal_added | DC | DL-2153 | 3f48fa696bc1bd34b1b89fbe26d87bccb6e2a2f4 |
| brainstorm.vote_added | DC | DL-2154 | 1e9492ee67b11611cde720d606060298d11daea9 |
| browser.context_captured | DS15 | DL-2155 | 9a79269890231fc59283dab5d633855c8f079d6a |
| browser.context_share_revoked | DS15 | DL-2156 | 07bb37f1630897eedd874abb1e13b40847770a9e |
| browser.context_shared | DS15 | DL-2157 | c9ebe1bcdeecfc43717e8bd4d8c1b88ce2d374b1 |
| browser.controller_lease.granted | S4B | DL-2158 | ecf33f227d13a8741b507f034e4bf89e1c30d9cf |
| browser.controller_lease.lost | S4B | DL-2159 | 68148f554d841328c66dc315025e6f84c7c04c3d |
| browser.controller_lease.renewed | S4B | DL-2160 | a37ad5b729752328905bf877c34384f7476198b3 |
| browser.controller_lease.takeover_completed | S4B | DL-2161 | 952318f1603980f4aee7a2848c777e478f6e66bc |
| browser.controller_lease.takeover_requested | S4B | DL-2162 | 8e7c9b09a7613a2ec0bb124e8d932f2b73b0bacb |
| browser.document.generation_changed | S4B | DL-2163 | a400802a10b0837408c1b4cd01ebdb7ecda5d66e |
| browser.execution_strategy.fallback_selected | S4B | DL-2164 | 2a3bf3b08047637ee0fe22f8957b9e58c372fd2b |
| browser.execution_strategy.selected | S4B | DL-2165 | c14d06513a66a3df79f046a238135d10b8f84559 |
| browser.navigation.generation_changed | S4B | DL-2166 | 74e04945474ec6ad7c06d74c6d7284d5f4621cd7 |
| browser.page.activated | S4B | DL-2167 | 48164d780ca6b7ca83f66ffab3408522ec318c3f |
| browser.page.closed | S4B | DL-2168 | 79a7d62e5ca44d6ff5675eae4ee3a7b3ecf35661 |
| browser.page.created | S4B | DL-2169 | 0bbd961ccca532d0947a49d506ad8b44e9b74c7a |
| browser.program.cancelled | S4B | DL-2170 | feae1696e485f9d1964fde3808748648c8b3da23 |
| browser.program.checkpointed | S4B | DL-2171 | 919a422a1a2fcbe6c2c79a074945c53a52edad2f |
| browser.program.completed | S4B | DL-2172 | 0964ef25393c74c5090d8deca6b0ff79321a7e52 |
| browser.program.failed | S4B | DL-2173 | 506e569af3223e361948256a363e34f52db62106 |
| browser.program.paused | S4B | DL-2174 | 02d122ff9cea65f98ae85009002ba515b4e3ad62 |
| browser.program.resumed | S4B | DL-2175 | f289b410a5ed1d973414728d31000cf47930d9ef |
| browser.program.segment.checkpointed | S4B | DL-2176 | 12c295eff1519bdf39fb26fb5b80c4f2de75c4f8 |
| browser.program.segment.completed | S4B | DL-2177 | c37493e1a460c6f297686ef1c3510beb488ceabd |
| browser.program.segment.failed | S4B | DL-2178 | c8077fe9d7b233181d1d26639e8e703b42fe0180 |
| browser.program.segment.started | S4B | DL-2179 | 8be138f382f529cb135a19ed2a238f4efe850244 |
| browser.program.segment.timed_out | S4B | DL-2180 | c0ecbb4d4602a51480dd51f5827a9ee6210d8a2b |
| browser.program.started | S4B | DL-2181 | ad64da1c0e0a74a361670cef4ed9ee9ccceaf05b |
| browser.program.timeout.effect_state_unknown | S4B | DL-2182 | 825b1db928b6a4046c336a2403f895aa465772e5 |
| browser.program.timeout.effects_reconciled | S4B | DL-2183 | 070ef34948ff9756ce97647a85e87775f4e42770 |
| browser.program.timeout.stopped | S4B | DL-2184 | 9244429a73be9c874d2a87543982cbe05ccec9de |
| browser.program_workspace.checkpointed | S4B | DL-2185 | 4a585d6d1caa317830704a3c4c21c0a7b25f793d |
| browser.program_workspace.closed | S4B | DL-2186 | 034dd06b69c40dfef68d362e8b23d38dbe9e5711 |
| browser.program_workspace.created | S4B | DL-2187 | 00724ca94b4c239532de33a1fb170c6fdbb878c3 |
| browser.program_workspace.spilled | S4B | DL-2188 | 36d157a0bfd08b16a7b5a548f79ccf963c17b450 |
| browser.program_workspace.updated | S4B | DL-2189 | a67f61c629b14d4ba62cdfcb4c0b57603c49039e |
| browser.representation.captured | S4B | DL-2190 | 47800d83824f1109a898971e8051862ee34bd3e2 |
| browser.representation.delta_created | S4B | DL-2191 | 52cc1c368df906825fa6bd57f1c370ac02267f48 |
| browser.representation.invalidated | S4B | DL-2192 | 437ca47e32a7b80819d26d0b0e35c45e9c1806aa |
| browser.representation.queried | S4B | DL-2193 | 22a0ca9a7ed9a195c20c14b77f089e07af872cb4 |
| browser.route.browser_escalated | S4B | DL-2194 | d6dbb21516981a6642c026b0df9731f6a38b3319 |
| browser.route.fetch_selected | S4B | DL-2195 | bf06edebf5335e7e25ded67aae58dc2d031a07ca |
| browser.routine.disabled | S4B | DL-2196 | 93fc5aab70ce1fd0959a7a0bbd6c0348d3b9f880 |
| browser.routine.generated | S4B | DL-2197 | 1f75c63b8169a80d48ed2632aeb90de2e863d0b8 |
| browser.routine.invalidated | S4B | DL-2198 | df8cd30b3021a825852febf45c13ee5711fd658a |
| browser.routine.promoted | S4B | DL-2199 | bf37df132946322a9d8d6909b2db45b958727a50 |
| browser.routine.validated | S4B | DL-2200 | 5045c7e48232cced5cbad82084657eb8ef034cfa |
| browser.screenshot.model_attachment_selected | S4B | DL-2201 | 10b61439a05f49a0f658abb579cdd8fac9c20f10 |
| browser.screenshot.skipped | S4B | DL-2202 | ccca587ca1688bfba6aeef3533abbd4d010823ec |
| browser.script.compile_failed | S4B | DL-2203 | 027a3c8b1452461efc3d33cde484ec446e0a10ee |
| browser.script.compile_started | S4B | DL-2204 | cda77f496ef1caacd4a7dfda33e2fb7c1ad6ece5 |
| browser.script.compiled | S4B | DL-2205 | b8a7ac4ea0e3722d3365a256e6ba6b1930ca5fc2 |
| browser.session.interrupted | S4B | DL-2206 | f226f617b6d422175e0648abb7340972772352cb |
| browser.session.reconstructed_on_host | S4B | DL-2207 | 86ed982cdbda09a216d0becb0e346c364dafd8e8 |
| browser.workspace.closed | S4B | DL-2208 | dc2b6c0db518bc3401b1eb8e7f73d49292cd9a8d |
| bsd.advice_emitted | W3D | DL-2209 | 97f67534bcfa31c85ccf0db8ee94025889443421 |
| bsd.assignment_paused | W3D | DL-2210 | 1b0ca761ade74b51957428eae8389c0e6a1ca182 |
| bsd.assignment_resumed | W3D | DL-2211 | f9c61416d1f3a6c929127b2a31ef5d67c8dbcab4 |
| bsd.assignment_started | W3D | DL-2212 | 1cc83816d38f16e6c03ac6972358d5d6f04636b2 |
| bsd.assignment_stopped | W3D | DL-2213 | 533546ca4693a227b0ef0ca6af8f4bddeeb36d08 |
| bsd.finding_cleared | W3D | DL-2214 | 24c251b850c9ade81e0e428dd2473f7790860f2f |
| bsd.finding_held | W3D | DL-2215 | 68a48c6b8c86db4cb4c229a77d850f53260e3b36 |
| bsd.finding_reconfirmed | W3D | DL-2216 | 8742438a44368bdc1c5f344828ffba84df196842 |
| bsd.finding_suppressed | W3D | DL-2217 | b40e7793b8b5310f0bbe986f8c005b1dbcbd7776 |
| bsd.output_quarantined | W3D | DL-2218 | 255de8712103eda01a2e897d1f2ce6692eb657bf |
| bsd.policy_changed | W3D | DL-2219 | b3671be4781124586d37181bfd2d118952425c70 |
| bsd.review_failed | W3D | DL-2220 | fa4131b88eefa7dd8ca88859f50f226d3411efe3 |
| bsd.review_started | W3D | DL-2221 | 71294ca62f6c6ded1c133b5a24b9d101b25fa83a |
| bsd.review_timed_out | W3D | DL-2222 | ef010cd6e87e2efdcfba12018f562fe9465e4c6d |
| bsd.workflow_binding_created | W3D | DL-2223 | af0d795656f0a1c69d84cac6945a3e315ae88e1f |
| bundle.annotation_state_changed | DG6A | DL-2224 | 0cd82cd3d9d4f08a8559ea39387b57d360ff6fab |
| bundle.note_created | DG6A | DL-2225 | 6053fb0f635e28919dbbb800e964c8825a83d865 |
| bundle.note_status_changed | DG6A | DL-2226 | f87ab42a06e88432c5117f31085fb7e385546c0c |
| bundle.revision_completed | DCW | DL-2227 | 49efc2254f8f83d46de5ef6f6a4008b24b59d777 |
| bundle.revision_interrupted | DCW | DL-2228 | f94578e0f1361651a20e64c8266942aeffa0f04e |
| bundle.revision_requested | DCW | DL-2229 | 4bb743b9578d9c606f2f8ba3c929be999d1b6e56 |
| bundle.revision_started | DCW | DL-2230 | d7969043d07e4522cb3e8421dbb1c816b0dbaed6 |
| bundle.selection_forward_blocked | DCH | DL-2231 | 933d5d1f8ec0eab846ef6eac2e6ad5f5b7ccf76e |
| bundle.selection_sent_to_chat | DCH | DL-2232 | 10ce5709ed5ff48a7b759f9e1de790e1f1cf7463 |
| catalog.install.completed | DS15 | DL-2233 | ca06796dd1fa007ea1786dea00597126e867b9ba |
| catalog.install.started | DS15 | DL-2234 | 5ec6d48bd89eedc1a2abea47c2cb514cfd562418 |
| catalog.remove.completed | DS15 | DL-2235 | 444a80a5c7a88ceff786c55dec43472a544c7dce |
| catalog.remove.started | DS15 | DL-2236 | 35319319a7af39fefbac9052fd04f36e90f07bbc |
| catalog.update.completed | DS15 | DL-2237 | 23c6b118a704cde8f574e980a4526a90b49d21f2 |
| catalog.update.started | DS15 | DL-2238 | cbf52f6babc5806ab3db379eed5d977681c2b866 |
| chat.message | DCH | DL-2239 | 9b72a1dd0839384d2b9c1b74b2df95187923757e |
| chat.response_stop_requested | DCH | DL-2240 | d308e610bd4dc0bcfbc0cb6298233dd9200e6125 |
| chat.thread_archived | DCH | DL-2241 | b3959fdb4b98f00f1d61770bafdea1ef2b1e8fc1 |
| chat.thread_created | DCH | DL-2242 | a6aed4a8fcaa2f89a5e9074d4b9dec5225b46249 |
| chat.thread_deleted | DCH | DL-2243 | b234a7f7236b82949b777ed58db0ecee750ad91f |
| chat.thread_worktree_bound | DCH | DL-2244 | 01a9b11ba007ae4ecb9f374726b492729dcd5900 |
| chat.thread_worktree_create_failed | DCH | DL-2245 | 72011b41bbaa083887a031c16a2f5e581e97b062 |
| chat.thread_worktree_merge_failed | DCH | DL-2246 | d5cc61f81afa4f7f5ae4db9322d62b8b60169cd7 |
| chat.thread_worktree_merged | DCH | DL-2247 | edf2ad84d92da464df8cc3cebc7f34e9292dbb50 |
| chat.thread_worktree_pr_created | DCH | DL-2248 | 00f1da8a4c00e3e4432988bb755637e733875427 |
| chat.thread_worktree_pr_failed | DCH | DL-2249 | 75677f8c4f08b6e8e29c5e573911830f0c0b8263 |
| chat.thread_worktree_pre_merge_test_failed | DCH | DL-2250 | f5eb75bde1bcf1012d26fe4b06daa40a184dbc22 |
| chat.thread_worktree_pre_merge_test_passed | DCH | DL-2251 | 1e9acd66326ba123a9ebf94689766c036b4da565 |
| chat.thread_worktree_pre_merge_test_started | DCH | DL-2252 | 5cfe19749fd5deb59bc583312ec9b3597bf97fce |
| chat.thread_worktree_renamed | DCH | DL-2253 | 493f3ba6db91bbd5569e368520524dccb0b1ca06 |
| chat.thread_worktree_unbound | DCH | DL-2254 | 6e6ee9ddcf3fba64424495c92a95eb30b40fce25 |
| collaboration.artifact_added | DC | DL-2255 | 4c8f80e56ff094d9fe8eaf076dc5a8af2575f3f6 |
| collaboration.cancelled | DC | DL-2256 | 8229c6c14fa8c987e0483519235f6f2cb7aaa8c1 |
| collaboration.completed | DC | DL-2257 | ae9fbcd566f70ef22b932e09245fac5ac6bb08f5 |
| collaboration.configuration_changed | DC | DL-2258 | afab3426ea4039b42e7626efeab660bf311e4705 |
| collaboration.created | DC | DL-2259 | 0ab188e3c3be0652bec13f1cb0273d7f84d5a651 |
| collaboration.failed | DC | DL-2260 | f6c626eba0393d22b218d8e9473a45a620fa6808 |
| collaboration.message_added | DC | DL-2261 | 5643eb4eed1607d8b5a1d4e168ed8ad5fe2e603c |
| collaboration.participant_completed | DC | DL-2262 | 88584f6cc4e6c57f343bcb3dcf9d37c889b13114 |
| collaboration.participant_started | DC | DL-2263 | ee3d439214bae57bd47679cdadc9b910e229a85a |
| collaboration.paused | DC | DL-2264 | 054f163d6f7b96d8f0ce863be9f0b3e78a25df5d |
| collaboration.resumed | DC | DL-2265 | e08f34e35f2106f539fc8d393aedecbb69fb8b74 |
| collaboration.started | DC | DL-2266 | e422375407c3aa46509525bbfed907c46ca608e4 |
| concern.assigned | DG6A | DL-2267 | fef849534bb9a4fea96116474d79616e627cf340 |
| concern.created | DG6A | DL-2268 | c312ccb016a585aaabdfd5891a5f7d6d01edac9a |
| concern.evidence_linked | DG6A | DL-2269 | 8e7c6a91e4350c4adcd46cbd39bab4a16f4615fa |
| concern.promoted | DG6A | DL-2270 | 716593296f9caa0af31df3abc8e9a419c6dc0441 |
| concern.reopened | DG6A | DL-2271 | ab67e6834fa5ac3ddb0e01555a95ec6bee0941f9 |
| concern.resolved | DG6A | DL-2272 | 96ac76cc2b070b8191966a38dd67b9b0837f5b33 |
| concern.updated | DG6A | DL-2273 | 574aec523db9b82c7b0bed1bd1d122f2bbe1cb07 |
| config.migrated | DT | DL-2274 | a529b268a596e1d91071068dbfb99a1fa28aeeea |
| config.validation.failed | DO | DL-2275 | df65de8e0e983ac163b1d91ec525e02cf920730a |
| continuity.actor_identified | W3I | DL-2276 | 15272142d2242724d38db3948a547c80c0c38756 |
| continuity.provenance_recorded | W3I | DL-2277 | 223dbb409ea2fc710ee48e2c76155e8aa2a5fe91 |
| continuity.redaction_applied | W3I | DL-2278 | 2b76453d86806c39fb62ade66a23e6db3d5f1090 |
| continuity.replay_checkpointed | W3I | DL-2279 | 33413ebb50635f344f224bfce21eb74d43582ddc |
| crew.board_message_posted | DO | DL-2280 | 753cf71037a4b5ff2ab5c02a69cdc86c1e1b1486 |
| crew.board_message_read | DO | DL-2281 | 9210abbef6fb6edabc898dc8a9267af38737695d |
| crew.board_messages_archived | DO | DL-2282 | 9dd16c73fb3f0adc41f44437c550e2a9b5369ff3 |
| debug.investigation.context_item_added | DDBG | DL-2283 | c6c4e5dea7df87af55f72f578a8192946ae324e3 |
| debug.investigation.context_item_state_changed | DDBG | DL-2284 | 7bf5eb292d6880857546ac68d12e7cae088c41c8 |
| debug.investigation.exported | DDBG | DL-2285 | 32f960e2e19a1a6a32f589731aa7edc6b6ae81a8 |
| debug.investigation.imported | DDBG | DL-2286 | ff9332d96938096bac533a260f17292e2338122f |
| debug.investigation.started | DDBG | DL-2287 | 304ba08afde62935ed33c6f7a5a72d1c3edd9fb2 |
| debug.investigation.target_bound | DDBG | DL-2288 | 017432969192bf33718eeb1ccd7770926f91f871 |
| debug.investigation.verification_recorded | DDBG | DL-2289 | 980a31b72915af9bc828d550d1c5c6d7cc92c22f |
| dev.session.restarting | DS15 | DL-2290 | 946e8a20122d3ea5e226f70b3cfeee6f0d7c5ee7 |
| dev.session.started | DS15 | DL-2291 | 6db205ff9930be037723f19fcc173480043f7091 |
| dev.session.stopped | DS15 | DL-2292 | f2ebc8feb4353cad32454859baf7aa1efb4fe4ee |
| dev.session.stopping | DS15 | DL-2293 | 1ce5b06dda1fdfa33b70af86bb4b648907dfa5d3 |
| doctor.custom_headless.checked | DS15 | DL-2294 | 0bc9753b1952eed825fa31c13da8d859daf9de5b |
| file.copied | DFM | DL-2295 | 3df5ade5c5b6f300b6c9a964e3d1907212cbebbb |
| file.created | DFM | DL-2296 | 1d23f101e274cab576de951f4025d15f41253447 |
| file.deleted | DFM | DL-2297 | ed7cc3f02f397f0cbfb4bdd4c944f77cf29e77e9 |
| file.exported | DFM | DL-2298 | 6575776513913f80521e3e6d5f65a1b975d39d6f |
| file.moved | DFM | DL-2299 | 4459b8266aa1b897f1960fde717fefe0f94119b5 |
| file.renamed | DFM | DL-2300 | d231dabd64edaf3ce5ce9f52b6aa731f106ae18c |
| filesafe.command_denied | DF | DL-2301 | 8c6b8e3fd3fd553623bc138f942fa1c3a06a19d4 |
| filesafe.destructive_override_denied | DF | DL-2302 | 6520f5e6530990066846efc6cc10822297418667 |
| filesafe.destructive_override_granted | DF | DL-2303 | 5a6bc5a10fb0d58e9ef28d8d818d55ae34e75c3b |
| filesafe.destructive_override_requested | DF | DL-2304 | c3b2d3d108c415fc501eb9c13be22c67a07649b9 |
| filesafe.guard_init_failed | DF | DL-2305 | d5f6ea9c523ec9e8baedcdd408808ff16a196849 |
| filesafe.path_denied | DF | DL-2306 | a23f32193d32c59c5194b4fe8c5d03fc767b0ac8 |
| filesafe.policy_degraded | DF | DL-2307 | dc2da6da7cdc1fa078f4fcedea5bf89270b05c95 |
| folder.copied | DFM | DL-2308 | dfe03761e73703baa5b7ed5603bd6e04fc358b0d |
| folder.created | DFM | DL-2309 | 9c57aaed53f98871dedef31f9c617777b55ef47e |
| folder.deleted | DFM | DL-2310 | 81e012ffdc5352701f0bb30b04a1f324afff755d |
| folder.exported | DFM | DL-2311 | 245ad637975468b4f92a6759e3e54fbd0289d4d1 |
| folder.moved | DFM | DL-2312 | 835eb61658042fe4e07c194a40948c974c078de5 |
| folder.renamed | DFM | DL-2313 | d74b3aef36eb30b5a9a06b1c19ba626558fc14aa |
| format.applied | DM | DL-2314 | a97d9cdad204e429f506a2b729c5cea56fc1e251 |
| gate.evaluation_started | DT | DL-2315 | 5d8ca43569fb82368cdc974fca750c3cd4351dc3 |
| gate.failed | DT | DL-2316 | 8f8c39f75c548ee56176e289cdceb4e24c5575c5 |
| gate.passed | DT | DL-2317 | 34413287d7cea93299c81dde7f29807d15fefced |
| git.clone.completed | DM | DL-2318 | a03f3f9279c8d32b98e6cf2f105fef1cd77819e5 |
| live.artifact.created | DS15 | DL-2319 | a49a08ecf5701e1894c05532250c4eaaa2e68050 |
| live.session.completed | DS15 | DL-2320 | 1db556294834faaa5546cfc97c55150e6d3252b9 |
| live.session.degraded | DS15 | DL-2321 | 3406555cb0f5bdfb42242dc5158313541e1ad770 |
| live.session.started | DS15 | DL-2322 | 0afce32466b0f458366ff87aaa5144e1f268f91d |
| live.step.updated | DS15 | DL-2323 | 3866a08a76421b87d82e827404638cb5242e954c |
| lsp.server.lifecycle_changed | DM | DL-2324 | 63a127cc509d5b17afa11c4fcc511f3da9b1d8b9 |
| memory.dedup_sweep.completed | DMEM | DL-2325 | a5bc4e7fc2eeb8b23320db3b8e8bc091877cabeb |
| memory.dedup_sweep.started | DMEM | DL-2326 | 049ec9d7cf1b47bf1f84eadc996a332442611df6 |
| memory.index.lexical.rebuild.completed | DMEM | DL-2327 | 6d6035e1e944e42a9fdc88747bbde6b1c77b5ff6 |
| memory.index.lexical.rebuild.started | DMEM | DL-2328 | a9ab898e14fc55e38a8160922abd044947644e17 |
| memory.index.semantic.rebuild.completed | DMEM | DL-2329 | 15e47601baea9b4a007a46a464863b86ef23a978 |
| memory.index.semantic.rebuild.started | DMEM | DL-2330 | c938e8c56c2fafe7141266bb4cd3335605ae80ea |
| memory.monthly_summary.completed | DMEM | DL-2331 | 5fba83d71fb568444ac24c4b00342aeb2ac90977 |
| memory.monthly_summary.started | DMEM | DL-2332 | 83a732fbf95a734a0b9cbf5c2447c32a2d565e68 |
| memory.prune_archive.completed | DMEM | DL-2333 | cccd64a08f2f47ce06649cf7ccb77a533d57a229 |
| memory.prune_archive.started | DMEM | DL-2334 | 553959b35a0049f49bdde76d36bcba916db42add |
| memory.verification_sweep.completed | DMEM | DL-2335 | c87f98e8984f0d72a53f7ab56fa9a6a3dd5011c3 |
| memory.verification_sweep.started | DMEM | DL-2336 | 55ac0736a2d2d198cb05e841f522c5650e1012d4 |
| model.catalog_refreshed | DM | DL-2337 | e57c157ff119dfa0ac97228212ddce6af6d76209 |
| panel.redocked | DG6A | DL-2338 | be61993c498ce1777bd0dc25e626680471f82b96 |
| panel.undocked | DG6A | DL-2339 | 904ef13e7f83aaf562f7c98721629036fbb36795 |
| parser.error | DO | DL-2340 | 3d809e1ef42564e8f969b4beead46c126bca0f47 |
| persona.created | DG6B | DL-2341 | b15d4cd3dddcae14ab0c926cbfb0f6349579b559 |
| persona.deleted | DG6B | DL-2342 | 2847d9908fcb35678d00c902f8d24350b44440a2 |
| persona.exported | DG6B | DL-2343 | 23359279bf9ef36a7975e256628c259b6771fb61 |
| persona.imported | DG6B | DL-2344 | ce4771945fcaf9808bc72a111e2e91a6cb4599f8 |
| persona.selected | DG6B | DL-2345 | 818984c1834c36d191a9a3bf734df558f6ea7c69 |
| persona.updated | DG6B | DL-2346 | 7311571f54a5a1dba3583ed1e07db6a341b25dc7 |
| phase.force_completed | DO | DL-2347 | bd9ec28e65019785a41645f9ba5db8ba6ba50e53 |
| plugin.hook.blocked | DG6B | DL-2348 | 15ad48aaef7687131b7bd8469de350717bc56f68 |
| plugin.hook.error | DG6B | DL-2349 | 020c2786c324d5af10568dc8d759f20a1461ac09 |
| plugin.hook.invoked | DG6B | DL-2350 | 5648477302c8c6a2ee8d4992a408ec4b0421767c |
| plugin.load_failed | DG6B | DL-2351 | 57bf3283934554aa9c5c59a21496b69e97a424ca |
| plugin.loaded | DG6B | DL-2352 | be8d16d912ae1e76b28ad790fa8cbe10bef0c077 |
| plugin.permission.override | DG6B | DL-2353 | 1e6739694357a1631fe10eef38e0c32d0b2bce72 |
| plugin.tool.collision | DG6B | DL-2354 | 88100f9278adc22912ff9db741b6e7054a6a3567 |
| plugin.tool.registered | DG6B | DL-2355 | a79de1ba8a39a89394f45cf4d453e9f982213dbf |
| preview.session.refreshed | DS15 | DL-2356 | 1215abd58d233d6d804442203e8f80bcc4891b2a |
| preview.session.started | DS15 | DL-2357 | c752ab5daef510ac895cc82376be68b4fcdda609 |
| preview.session.stopped | DS15 | DL-2358 | 718c0b7e6dfea9514b134dfadb8230588960aa14 |
| project.added | DM | DL-2359 | c81c5a37213db710ce4945026579e062e7b18670 |
| project.created | DM | DL-2360 | e7f7977cf263a3a48840e70febeb284d3be2936f |
| remote_access.private_endpoint_state_changed | W3E | DL-2361 | 92841674968e102342b2dd6c4ea5609b9c364cf6 |
| remote_access.proxy_state_changed | W3E | DL-2362 | 6ea4e2d169a8e734d9d5fbb1c3ddc2c90cbd5795 |
| remote_access.public_security_violation_detected | W3E | DL-2363 | 0d591070396c93151ec77807b9a80dd7b4999275 |
| remote_access.remote_link_state_changed | W3E | DL-2364 | f55ca774bcdfcf01a5d39634a9ff5bb1f5a988a1 |
| remote_access.route_migration_state_changed | W3E | DL-2365 | 2f1a94b95e9f605d9dd198111bf69f040f918855 |
| remote_access.route_preference_changed | W3E | DL-2366 | ca5cda9c7230ae50e3638ad17d94a5391ca45fd7 |
| remote_access.route_state_changed | W3E | DL-2367 | 57e38c6329219df67144c7faac2349f4d3fa35b0 |
| remote_access.route_test_completed | W3E | DL-2368 | 93f7ebca4cee89af63a931eb66379175f72a28c3 |
| requirements.clarification_requested | DT | DL-2369 | 09bb28decef3ff6575228be5bfec46094bd5d0df |
| restore.state_changed | W3E | DL-2370 | d3c4a6ceb04623e75aa528a569f7a8ac95f6b1b4 |
| review.artifact_finalized | DC | DL-2371 | 2bbfd744201b4a6183460dda13d0de3533851878 |
| review.finding_added | DC | DL-2372 | b4752145c9e88d95c32df9911532c6d639359a52 |
| review.finding_dispositioned | DC | DL-2373 | 2e1735a6d78671a2f5e5be2b050f1a3bea983202 |
| run.background_enqueued | DT | DL-2374 | ab565a307b366894e056b248c26c1d22f4cef8a7 |
| runtime_artifact.api_web_call | DR | DL-2375 | 3a58c627bb15d41f1b892bd3ec71550b313d0a91 |
| runtime_artifact.artifact_version | DR | DL-2376 | c3d459f13e00d56c7198e4e9892d7ffffbbee527 |
| runtime_artifact.before_after_snapshot | DR | DL-2377 | e449d1badc9adee12d50005fdf2042b211e3c77d |
| runtime_artifact.browser_recording | DR | DL-2378 | ef8793e73d0889c8a152c16e92ec9be7430f75a0 |
| runtime_artifact.code_diff | DR | DL-2379 | f15822a495f4815e6194e71f583bb1872ed608ab |
| runtime_artifact.context_snapshot | DR | DL-2380 | d40a93eb4412228c15ffb0e11a84a530e75373fd |
| runtime_artifact.cost_usage | DR | DL-2381 | 97d496767c0939306804ab5a6bd354e4f3248bf6 |
| runtime_artifact.document | DR | DL-2382 | e390ed960592f9b0a0c045d59e311c71b0684dc9 |
| runtime_artifact.evidence | DR | DL-2383 | 46b0d9286b2364f8901386b0eb7a32a86c78c096 |
| runtime_artifact.failed_attempts | DR | DL-2384 | 3d3a7a493f354c5407362b4e7a703920525752df |
| runtime_artifact.hitl_approval | DR | DL-2385 | aafe576ae88eda6dca4e2dfaaef4fee2031a48a7 |
| runtime_artifact.implementation_plan | DR | DL-2386 | 90e85eb60b19e0cb468ae5713fba2042043279ea |
| runtime_artifact.reasoning_summary | DR | DL-2387 | 4b1163c619a15c8d38c5bc4103f41d29c6e8f3d6 |
| runtime_artifact.restore_point | DR | DL-2388 | c52309465ad216e9929ae93004ff3284cab162d5 |
| runtime_artifact.screenshot | DR | DL-2389 | 93266ffe773e06a52422138873416aa436b6f977 |
| runtime_artifact.subagent_lineage | DR | DL-2390 | d8bc25a8fdacb26a87a0a111b631b30d863f99aa |
| runtime_artifact.suggested_next_steps | DR | DL-2391 | d54965c60831dc718d12136341db512eba535116 |
| runtime_artifact.tool_llm_trace | DR | DL-2392 | 0b9061f6d55817706ccf9a0ae25bd1eed0e6d0df |
| runtime_artifact.validation_test | DR | DL-2393 | f603d451ab639292bbddf375913f4546965d7a10 |
| safe_point.created | DF | DL-2394 | fe15252054e0169eee5dfd7e4f6eac24f98c0207 |
| safe_point.restored | DF | DL-2395 | 94ccfa08c8deafa0ccf4fae11c8a45e8b56324eb |
| server.catalog_changed | W3E | DL-2396 | 4e1a0a64109cdb42c055334aaf196fbce619604c |
| server.client_pairing_state_changed | W3E | DL-2397 | 501f0f57ffa39b1e186552de6e9355d6682aa627 |
| server.client_revoked | W3E | DL-2398 | 5949ae19079970c8c58361b35def4f08c650ac29 |
| server.client_trust_changed | W3E | DL-2399 | d5de76362b87f035aa69133f76fa8ef98232d57b |
| server.connection_state_changed | W3E | DL-2400 | ae7882f729899341522470fd21f5c55af73547df |
| server.discovery_expired | W3E | DL-2401 | bbebb3537b0855826f41b8e8686c5b90200c0006 |
| server.discovery_observed | W3E | DL-2402 | 7767447f658d27487ed69ea0b3842af1abbb9f91 |
| server.endpoint_changed | W3E | DL-2403 | 57b9e496761c9ea1e831063a1a7cf3acf9a96400 |
| server.identity_mismatch_detected | W3E | DL-2404 | 2c7ebc49968de4407388c9d7cba95dd5b298f7b1 |
| subagent.budget_warning | DO | DL-2405 | 1ddb892007628492e8b950c6bf86aef151b2ecef |
| subagent.cancelled | DO | DL-2406 | e8f8582e24afb13956fd905f7c090a56e8763a29 |
| subagent.completed | DO | DL-2407 | 870a5496ebc19e538c927c87d275fcf6e6e6997a |
| subagent.context_warning | DO | DL-2408 | f2c4c17202add2173d1df91009310c144d23cb37 |
| subagent.escalated | DO | DL-2409 | d9e733ad1891b4d1f3303c415c79bb75a4449a29 |
| subagent.failed | DO | DL-2410 | 96ebd537a4f61ad09fef8b35fba7a8a81654711e |
| subagent.message_received | DO | DL-2411 | 5e9f85d46a1486620873b445c637763125ac9076 |
| subagent.message_sent | DO | DL-2412 | abfe247a1ee0fca68940bbce674a00a5d2770942 |
| subagent.model_switched | DO | DL-2413 | 4dc3db171ba95a873a13fad50bfe6209adb0a964 |
| subagent.output_truncated | DO | DL-2414 | 4a6cd1508b6545585474215b300cc54ed7eaded1 |
| subagent.paused | DO | DL-2415 | ad07e8fdd91d12b64303cb58f98049694e0244d1 |
| subagent.progress | DO | DL-2416 | 7dce3dae3ef0cbd794bb990beaa5763e3f7d0df6 |
| subagent.resumed | DO | DL-2417 | 3d9ca847f5628453146fc539d450502601c02591 |
| subagent.retried | DO | DL-2418 | d70f10df544ba8a4461780e4df0b706d52380eb8 |
| subagent.spawned | DO | DL-2419 | 8c67716d97f02fa2c2d9dae085f4e3c6634532bb |
| subagent.started | DO | DL-2420 | 1af7fdeae79bc7d69a521dfd1b96752c4c121a61 |
| subagent.timeout | DO | DL-2421 | 4431cf1636017df9646fff44f37b5a3369092804 |
| subagent.tool_called | DO | DL-2422 | d5731d43084be56a43dfe7cdec8307be9f9a3181 |
| subagent.tool_completed | DO | DL-2423 | 4dc25d9c387c8660f6b8d71bd175bf5839066853 |
| tool.custom_headless.skipped | DS15 | DL-2424 | c06085e0a6148165aa1c5aef1bb64fe02ddabf13 |
| tool.denied | DT | DL-2425 | 5eeaf4c6d3fe51466f1d53dc96e1cbae10b6fbcf |
| tool.execution_completed | DT | DL-2426 | 225c278d3e554ddd496e92f70b82c5ef0b3c430a |
| tool.execution_started | DT | DL-2427 | 15425f37f04bca365d91f42195f6150fd8a81b4e |
| tool.invoked | DT | DL-2428 | 168da701d17acd3f28ce1df4633418bb9cf2e08e |
| wizard.blocked | DCW | DL-2429 | 4f2a1b75accdce9f8882603cedc03f615cfbe25f |
| wizard.deferred_payload.loaded | DCW | DL-2430 | e1e8e1e60f40ad985e1e8c737bef673cefd8cd3b |
| wizard.opened | DCW | DL-2431 | d296b9249f9b573e5e02218beab361762b88335d |
| wizard.unblocked | DCW | DL-2432 | 9b53dc2e64fecfafe5dfe168595bcd11a1e7fe0b |
| worktree.created | DT | DL-2433 | 06e119188f739589426f08f2060f8344dd0a734c |
| worktree.deleted | DT | DL-2434 | 827b0e4a36501549c5c5231a4a69bd7431eace44 |
| usage.event | DT | DL-2444 | 4010894119165afc73d2f7ef273154fd572ee59a |

## Registered-row changes

Eight retained S5b actions. The final three withdraw only unused application editions under DL-409. The action commits and current assessment paths are listed separately from later evidence maintenance.

| Family | Decision | Applied commit | Current assessment |
|---|---|---|---|
| goal.blocked | DL-2435 | 7fda6b4b82e2acc18b0ed313e4f4c0dbca53d4e9 | reports/event-authority-20261116/admission-merge-2/revisions/goal.blocked.json |
| goal.completed | DL-2436 | 96e062046d1b54c62670bd61735effdc2fdb9369 | reports/event-authority-20261116/admission-merge-2/revisions/goal.completed.json |
| goal_run.stopped | DL-2437 | c712a5d22e6397677f75e67283572db5aa6891f0 | reports/event-authority-20261116/admission-merge-2/revisions/goal_run.stopped.json |
| goal_run.blocked | DL-2438 | 2fe8bd5426a9d98457cce2a454c63fe81fce1905 | reports/event-authority-20261116/admission-merge-2/revisions/goal_run.blocked.json |
| goal_run.replanned | DL-2439 | 14bcad1ce27fe714975b90e95e288173fadd52ec | reports/event-authority-20261116/admission-merge-2/revisions/goal_run.replanned.json |
| goal.evidence_captured | DL-2440 | 967822da0e913623bedade0518db4fed7ebf688f | reports/event-authority-20261116/admission-merge-2/revisions/goal.evidence_captured.json |
| goal.receipt_recorded | DL-2441 | 11b55f3319574b597b29830bcc7fd831cc9d092d | reports/event-authority-20261116/admission-merge-2/revisions/goal.receipt_recorded.json |
| goal.tool_check_recorded | DL-2442 | e8037279d73c75d7496f4572d1e72408916741d2 | reports/event-authority-20261116/admission-merge-2/revisions/goal.tool_check_recorded.json |

## Deferred to merge 3

`goal.cancelled`, `goal.updated`, `goal_run.cancelled`, `goal_run.certified`, `goal_run.started`. No merge-2 admission, definition confirmation or per-family decision is applied for them. Their pre-existing main registry rows and selected payload resources remain unchanged. The split census removes exactly these five planned confirmations and preserves every other applied family.

Split census: reports/event-authority-20261116/admission-merge-2/merge2-batch-split.json, SHA-256 a69185e51439394a2b25f7f9b24011221aac4866ac71b61a271b2fe521096ec5.

OUTCOMES is complete: exactly 249 unique sorted recount names, all registered, none open. The nine s4x CPU exclusions remain separately recorded.

## Follow-up gates

The lead runs NUMRULE-FINAL and the GATE-MERGE2 review pair on the published final head. Main landing and the later governance seal remain with their assigned lanes. This record grants no source installation, producer adoption, native authority, landing permission or governance seal.

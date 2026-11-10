# Evidence index

Raw evidence is outside the repository, as the repository rules require.

- **Raw outputs:** `/mnt/Cursor/PuppetMaster-Evidence/tests/exact-agent-tooling-20261110/` (paths below are relative to it; `SHA256SUMS` there holds the same hashes).
- **Code:** `../probe/` in this report folder; a copy is in `/mnt/Cursor/PM-Experiments/exact-agent-tooling-20261110/`.
- **Small raw outputs from the correction pass** are also in `raw/` beside this file, so they can be read on the branch.
- **Exact itself:** not copied. Clone `https://github.com/expo/exact` and check out `76cd50f9e863129b3fc75db1673d6ad4bbf79258`.

| File | SHA-256 | What it is |
|---|---|---|
| `exact/app.contract` | `08f5ab393c221fd9b061ddfd6742ec527b12d85cff23611f1f476604974ddc3f` | Exact compiler samples run locally |
| `exact/app.plan.map.json` | `8655d9163ec0d35142f36ef7489ceb624a21aa738cb9341852ff094c657bcb9f` | Exact compiler samples run locally |
| `exact/broken.contract` | `354c125a03f740707f8c36afbf7378cea03b956c7f9799a4fedbbf9803b32508` | Exact compiler samples run locally |
| `exact/broken.diagnostics.json` | `3a8b904b719bc12e7a27f7a145881208c415dd7b4d8b391d5837c1662326dde1` | Exact compiler samples run locally |
| `exact/broken.human.txt` | `1c3c5361d566fa626be38754f99fb4d553ae50e02918e4fb643cd08aab258b3f` | Exact compiler samples run locally |
| `exact-citation-check.txt` | `ba318e118b803887fdae509c54c10505169cfb66b25fbdc3507b753a610fae77` | Exact citation list and check output |
| `exact-citations.json` | `b937acaad3e42d4ee6c1c443f9c519d117f33b81914533b5ff97796709996895` | Exact citation list and check output |
| `exact/contract-build.log` | `c0894ee9f8f4061ae4ab1d287ee69ff31d6186fbd96bcb00147cf9d6e7298348` | Exact compiler samples run locally |
| `exact/good.diagnostics.json` | `a1de83c83a79b773f73636fac26d1ab035fee377839b7202f94f6f7b2312aa96` | Exact compiler samples run locally |
| `exact/symbols-add.json` | `25bba8558542bfc6123d54ada097eb0906c38c98d1156b43fdae26198b4b7ebc` | Exact compiler samples run locally |
| `plans-citation-check.txt` | `b5f9a27c086debb12a8cde49de30031c998814e7d02ac076fc1c3d7248c07112` | Plans citation list and check output |
| `plans-citations.json` | `7b675c0c71b9ba48f055484457d27cbe05f604535854c9df711050b8141ec1b4` | Plans citation list and check output |
| `pm7/aria-snapshot.yaml` | `26519654d6547ed41fe2143a920654dbbf33423d9fbb55bb1e82321891440c0e` | Concept page measurement (first pass) |
| `pm7/compact-controls.txt` | `2cca773cbc040b3726cfd56af221113c1123e3be51af3e7ea47efa69216a6d9f` | Concept page measurement (first pass) |
| `pm7/run-summary.json` | `bf46340f9db1bb733ea81bc4aab04bf23cf39d75dfe0988b6a34914efa9044d1` | Concept page measurement (first pass) |
| `pm7/tree-size.json` | `ad56c79d2ec214622bd3a19c7317169990d6ae265d14e9ffa8553373e3229b91` | Concept page measurement (first pass) |
| `r3/1-right-build.receipt.json` | `4f6766ec455b67f80e19ec0a9db307d166ea67603b650e05852e4b7b24ba15aa` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/2-wrong-build-at-start.receipt.json` | `8c78645d0526beaba3f264937b104b7d5dbfa4aa03b4b9ae5a2de3045d4b24fb` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/3-replaced-then-reload.receipt.json` | `577a1069c3259452211e997404bf87abab3b5420d220e845e061bd26906c4390` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/4-raw-navigation-to-another-build.receipt.json` | `8f7896768824bb8f5611bec9103036c15100ee57d44fb48f38f8300b2d6c544b` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/calibration.json` | `63ed84e9129170fbe9f1b69563ca390df776d65ab33ecd588c445dba94cffa94` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/freshness-case-4.receipt.json` | `8f7896768824bb8f5611bec9103036c15100ee57d44fb48f38f8300b2d6c544b` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/freshness-results.tsv` | `d09c116f3cb3d68586f0d41bf15ebffdef22c75b8751d2a371df0a2c605c7494` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/oracle-console.log` | `f981c982a873c082f9f6fe7145d1e850309b1918fc9ba6a0ec3d6c738fb6f7d1` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/pilot-listing-activity-bar.txt` | `3488cfc5e3a26b4978bd3b6f66be8c3f2798a1e034dbca42b2151cfa87f11aae` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/pm7-aria-snapshot.yaml` | `739997f4c641b287bd59346eb52b0cec6d2e04a19b7ad62f4c490f42363212a7` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/pm7-compact-controls.txt` | `89bfdbf5db6755d6b03d5d7867332bf0f78ef21cf69d6e8ec90d71212a4d5521` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/pm7-tree-size.json` | `a6df8b39e77071f47e2ea8e1915a939e884e6b7a69152899ecff3d5ab53cd451` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/sessions/measure-T1A.json` | `f86d2456723bc614c3080995c6e8066197ceb1b432c15a996302f54dda92b595` | Calibration session measurements |
| `r3/sessions/measure-T1B.json` | `4962aa227981981887e55449fa45245b8967657cfde78ef11fca224e39dd882e` | Calibration session measurements |
| `r3/sessions/measure-T2A.json` | `9dc196160439be636f4cff13c952061dae6d1cbed5b6dedc4305d6354612d1e6` | Calibration session measurements |
| `r3/sessions/measure-T2B.json` | `b6792bd27f2721006926a2405162d9d43a9777a37996119d7b43e32c5e826f95` | Calibration session measurements |
| `r3/sessions/measure-T3A.json` | `1dd802b35603a3606a9f7269d42bf954d0f145719efc09b1126e3fef70123492` | Calibration session measurements |
| `r3/sessions/measure-T3B.json` | `a83a166eaad8123a7f5caa7c73e0199f48d1903a4aac3cecf3655f6f336ad9d1` | Calibration session measurements |
| `r3/sessions/measure-T4A.json` | `7545b384a3fed7dffac26cbf90b6882a4810759d988bc86838f0f89ddc3e5434` | Calibration session measurements |
| `r3/sessions/measure-T4B.json` | `832468d938ca79015ac20678491449fa52d5361f4a3fdedaf2838aabc828b01e` | Calibration session measurements |
| `r3/sessions/oracle-T1A.json` | `c7e8c32bf8f37fc4fdf2bcb3d678b0ead13e809680f66574b903cad4b55bc7af` | Oracle result and final receipt for one session |
| `r3/sessions/oracle-T1B.json` | `e26c58eff172ef7b478a9bc70cdce456289a57d2f55119fdee3c1014f4984d34` | Oracle result and final receipt for one session |
| `r3/sessions/oracle-T2A.json` | `88c8897fdc3fe1d8ee51cda9b8921250b2593c8c89d4abfb4f6acadfed04875a` | Oracle result and final receipt for one session |
| `r3/sessions/oracle-T2B.json` | `c879d6b57e70f0b79729a63ef50990dc5666f5d139ab577dc4ded1a4e269ecdc` | Oracle result and final receipt for one session |
| `r3/sessions/oracle-T3A.json` | `3e52439d85fac0571c4af528514274defa22f18c804a7f17d298b44c3de2398a` | Oracle result and final receipt for one session |
| `r3/sessions/oracle-T3B.json` | `8d54036fda87de67c5aa2dc1aa5a500cbbcb4e2cdd380adc462914eaf2942adf` | Oracle result and final receipt for one session |
| `r3/sessions/oracle-T4A.json` | `fb0dee6ba0a617795b8e45c0066ba7dcd927a1d65c0d932d5283abbba3329b92` | Oracle result and final receipt for one session |
| `r3/sessions/oracle-T4B.json` | `af85d58f789227d259a88ec5bb23902d04ead1ff2137de23d1712a28f185c342` | Oracle result and final receipt for one session |
| `r3/sessions/receipt-T1A.json` | `1f246032b9713ddcbb67b1e3d6c7e5cf05fd7d80bfff8719012c28454884fa43` | Kit receipt written during the session |
| `r3/sessions/receipt-T1B.json` | `2ea69d1352a713ca7a1aaeafa7e51aa8149c668b208e6569b034d5c3b181005f` | Kit receipt written during the session |
| `r3/sessions/receipt-T2A.json` | `c6a63d91d8efbad0cd0412eb919a916f5d7b38e913166d2506d9509db5a0244a` | Kit receipt written during the session |
| `r3/sessions/receipt-T2B.json` | `dda556ea1df3b348d57eda8ade45203699adcfd74b8e1b0e99e808e2d5f63afc` | Kit receipt written during the session |
| `r3/sessions/receipt-T3A.json` | `fbbcf00079068ce765847c8c6fb31abe0b348dbf66367981391ef0b81cdfa60c` | Kit receipt written during the session |
| `r3/sessions/receipt-T3B.json` | `17f3c70fc590c68840540270a060a0d172f71d8fefc8d49e35cb01f31bce29da` | Kit receipt written during the session |
| `r3/sessions/receipt-T4A.json` | `9078c3c8926394ec17a2d99c337a35bf06299d19c4a6a4136ea9ac8ba5080473` | Kit receipt written during the session |
| `r3/sessions/receipt-T4B.json` | `7389efd0f50a04ccef3a1da0ea8f315e2c604c157495b0f0915da9637d5ace4d` | Kit receipt written during the session |
| `r3/sessions/transcript-T1A.jsonl` | `011ec2d70017f6592a61371ac8a59d96be5abeb490fec148f6334fd86fbeac89` | Calibration session transcript |
| `r3/sessions/transcript-T1B.jsonl` | `853b558a07ce4b3a27f95ebd08efe521e56d403590fd893d527c340e029e6822` | Calibration session transcript |
| `r3/sessions/transcript-T2A.jsonl` | `b75627820655085e3416ef73feb0f29fa437fdfc5e883704cc471a2b2769675a` | Calibration session transcript |
| `r3/sessions/transcript-T2B.jsonl` | `99e625847d0b5af8190fab8116ed1ab2318c578435ac95cadb2782232d610b81` | Calibration session transcript |
| `r3/sessions/transcript-T3A.jsonl` | `44a38c59de21d5837223ff43e6f34bfa69b6497ab56608171c7ea92831201ab7` | Calibration session transcript |
| `r3/sessions/transcript-T3B.jsonl` | `588624ee9f7413ad47f2a96ea4559482f8b16d60e73d2f85951606ff631f386a` | Calibration session transcript |
| `r3/sessions/transcript-T4A.jsonl` | `e27dc87bfc74513ad46d6ee6c082930c96942a6b3192be63782eb07ad1ac86b0` | Calibration session transcript |
| `r3/sessions/transcript-T4B.jsonl` | `289c28c4645b00b02a4def2941d03fc87ba7c8c2ac517a8213f563779a01fa1e` | Calibration session transcript |
| `r3/slint-compact-interactive-1.17.1.txt` | `d06362ba5d16f66fb27369474feb8e378c799cbc065164dbf745b7a19916553c` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/slint-compact-interactive-1.18.1.txt` | `d06362ba5d16f66fb27369474feb8e378c799cbc065164dbf745b7a19916553c` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/slint-dependency-tree.txt` | `5405a9574dcb4901423bd5a2f0f7609d930b81b5c52afc32d1ca576ca2730dc3` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `r3/slint-focused-checks-1.18.1.log` | `79ede73ff3c9b9cb51e7187fcb71f8403ce46a6d11cfbcce1f13ab88c8d82fe3` | Correction pass: focused checks, freshness cases, re-measurement, calibration |
| `reviews/REVIEW-r1-sol-high.md` | `7d4579c888d3f9346f8fb4551b57a9ab6ce36c8cded16328ebd9a34b98e4b87e` | Blind review report |
| `reviews/REVIEW-r2-sol-high.md` | `97c002cabe529a37dbb7adb8229dd4a9e843040e00c498e96f26819adbb28db6` | Blind review report |
| `reviews/REVIEW-r3-sol-high.md` | `0480e23c1bc19b6b9e15a13693d17b624c341dc0b22f7469469b5f0800394c1a` | Blind review report |
| `slint/build-1.17.1.log` | `5d14cb4eb5d6dc67f89b51e58f59a80dfa3c4bdc6bb3ae0aba2aa8d87a9cb14a` | Slint build and test logs |
| `slint/build-1.18.1.log` | `e27c139c3b9082f2e5a1d8acfe61862ab1e3b7da13e985e802c31b33d55f8a4c` | Slint build and test logs |
| `slint/mock-time-test-1.17.1.log` | `3c94d7488bc9a8a54edb93a353b8e76ca666a6553b07e9d2dcc3f21e8883e32a` | Slint build and test logs |
| `slint/mock-time-test-1.18.1.log` | `6a04c2b6e2d4e5f314ded0b50667215528a9d4cb448650850aec6825f2e264bf` | Slint build and test logs |
| `slint/r2/accessible-id-and-mock-time-test-1.18.1.log` | `b818200094e27fb0190fc91d7c5e4bdaa1a21afc53a00e0d295c0b7730674e7b` | Slint 1.18.1 re-run after the first review: accessible-id and the absence check |
| `slint/r2/accessible-id-over-mcp.json` | `2ef07919bfc2773d0a4a993e5bd134021599e027c526e139a908b7aa5b1a551f` | Slint 1.18.1 re-run after the first review: accessible-id and the absence check |
| `slint/r2/m4-absence-check.txt` | `e2d35b46f40a6fb3d86b2b68b05c2cfab756e034954f0e1c69ca1a968dc5fa2a` | Slint 1.18.1 re-run after the first review: accessible-id and the absence check |
| `slint/r2/probe-result.json` | `9c1baa9aee07772b69023da060afffbd8ec9cbbdb46de1493c744b5c5d44bddc` | Slint 1.18.1 re-run after the first review: accessible-id and the absence check |
| `slint/upstream/mcp-server-master-e134a08c.md` | `c153295af19eecebe6e0493d9d1e85d547eba24ccab92fede8a89b5aaf66f98b` | Copies of upstream Slint files at the named tag or commit |
| `slint/upstream/README-master-e134a08c.md` | `1ebd9943999fabbebd23b1300df7fd8edb4e538650facd29d58790c9ed1482e4` | Copies of upstream Slint files at the named tag or commit |
| `slint/upstream/README-v1.17.1.md` | `49c73f117cb38f0909add2136eb6bedcf85103d47178b4b91050a9ad2539db7f` | Copies of upstream Slint files at the named tag or commit |
| `slint/upstream/README-v1.18.1.md` | `49c73f117cb38f0909add2136eb6bedcf85103d47178b4b91050a9ad2539db7f` | Copies of upstream Slint files at the named tag or commit |
| `slint/upstream/slint_systest-v1.17.1.proto` | `c1fd692b2f6071819bc18e858bc02b3b6fd3f60cf249e6fdbe28ebfa1eb57996` | Copies of upstream Slint files at the named tag or commit |
| `slint/upstream/slint_systest-v1.18.1.proto` | `2845745e27e2d7c152f0a45f410445ad5ea2e339e3387b2d520ddd2489838146` | Copies of upstream Slint files at the named tag or commit |
| `slint/v1.17.1/app.log` | `e9e46659aa99ee683a6a654089b90eda005959b4c04ab775783db8e083f1cfa3` | Slint 1.17.1 MCP probe outputs (first pass) |
| `slint/v1.17.1/compact-interactive.txt` | `8055c101ea883f6d70eaed9c4a1f4d96ac90bbfef9f109d386878dedceb65577` | Slint 1.17.1 MCP probe outputs (first pass) |
| `slint/v1.17.1/compact-tree.txt` | `455958a89cc3d14505b60f3da4ff1b3a12bb5f26ae4078dca9497ce62f282257` | Slint 1.17.1 MCP probe outputs (first pass) |
| `slint/v1.17.1/element-tree.json` | `b0515e51a2171ba196eaf8f333a1379d9b9b7ccb15f1ccc7827dc0f361db3186` | Slint 1.17.1 MCP probe outputs (first pass) |
| `slint/v1.17.1/instructions.txt` | `d125e66fd41d805220d79274c8583a69ee2b2479f716f99fa28c5aa327e6f80a` | Slint 1.17.1 MCP probe outputs (first pass) |
| `slint/v1.17.1/probe-result.json` | `977c62620b49c34855fb8269c085820c3a22fa104785c40672b71e4932bcc7cf` | Slint 1.17.1 MCP probe outputs (first pass) |
| `slint/v1.17.1/screenshot.png` | `29655b8ff54c1de113e73548740c09a2f1c6635c23dbc848da5f11889528f76d` | Slint 1.17.1 MCP probe outputs (first pass) |
| `slint/v1.17.1/tools-list.json` | `98702cf50fc0ca801c30cb612ddc319dc490459b3eca33bff0b948aabbb356fd` | Slint 1.17.1 MCP probe outputs (first pass) |
| `slint/v1.18.1/app.log` | `273dc3b0e38de69920982bd44b7e2172327a181f252f3e764e07fc6def4b7fe8` | Slint 1.18.1 MCP probe outputs (first pass) |
| `slint/v1.18.1/compact-interactive.txt` | `8055c101ea883f6d70eaed9c4a1f4d96ac90bbfef9f109d386878dedceb65577` | Slint 1.18.1 MCP probe outputs (first pass) |
| `slint/v1.18.1/compact-tree.txt` | `c5a163d680f35f4d82bd17f7c77a774a8e668da7f2eca364ce571562ce7a364c` | Slint 1.18.1 MCP probe outputs (first pass) |
| `slint/v1.18.1/element-tree.json` | `5c4cd972e9f05901472136f18c7b9e4f53720435b8004c016507b2f88b8c82c1` | Slint 1.18.1 MCP probe outputs (first pass) |
| `slint/v1.18.1/instructions.txt` | `490e4ea1d5b1fafb1a9710cfcf20dd86ce9024c1989e6fd9ff4d5f65a479561b` | Slint 1.18.1 MCP probe outputs (first pass) |
| `slint/v1.18.1-plain-build.log` | `42f7fa0a6062e30d6ba4d2dee0b01e75fc251521b0696536be57e8bf391f87da` | Slint build and test logs |
| `slint/v1.18.1/probe-result.json` | `dc4999d13d29e8f43f12c57029fdf0e65ff4468e14a96419fb0d971d6eb5a309` | Slint 1.18.1 MCP probe outputs (first pass) |
| `slint/v1.18.1/screenshot.png` | `e2a07e4d5ffde302396f0d09511cef198acd634d3e83fadca0f178527c94abef` | Slint 1.18.1 MCP probe outputs (first pass) |
| `slint/v1.18.1/tools-list.json` | `332beacf075b4eeaca35b007a15f0c4d21aac0e88142bfe47b1b4b783e30ec63` | Slint 1.18.1 MCP probe outputs (first pass) |
| `swarm/A-testing-owners.md` | `3e76998cdbd4d3eddc09cf0239df422086f62869b282b70716c4292eebc8d072` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/B-finalguispec.md` | `c3d3978435802f40c3006691e6f16765ae5f473b6854146226dd17dcb5f6774b` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/BRIEF.md` | `ec77118ddf06c7e158d7aaaae65159691c1e776edbabda035b7e41d943e3e4dc` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/C-commands-wiring.md` | `730514b5bd8ebbd49e63adc8c4fc0f7eea2be18a924f2c06a373297d3445fa5b` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/D-build-diagnostics-permissions.md` | `d154541dff4715adac7e9c2fa80be98fb7a8f63d8ad6a723c51cb73c913a76da` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/E-decisions-mobile.md` | `69c88d283a3451c27eef6a1fd208f5de6a515bb8a9cb384d5d56ca7a115fea92` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/F-current-tooling.md` | `8ceeedff6ab2601ce678370c0adee332b2917d0b3b8cdeb7029f1139bbc873b9` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |

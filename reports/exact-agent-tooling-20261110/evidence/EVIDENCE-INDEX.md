# Evidence index

Raw evidence is outside the repository, as the repository rules require.

- **Raw outputs:** `/mnt/Cursor/PuppetMaster-Evidence/tests/exact-agent-tooling-20261110/` (paths below are relative to it; `SHA256SUMS` there holds the same hashes).
- **Probe code:** `/mnt/Cursor/PM-Experiments/exact-agent-tooling-20261110/` (the Slint probe app and tests, the MCP probe script, the browser-check measurement check, the two citation checkers).
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
| `plans-citation-check.txt` | `16ee4ec06f0a1434872a09b15e02face80af682f063e9d3ccf81b398c6ea3ac1` | Plans citation list and check output |
| `plans-citations.json` | `79da2fde2a9f938d19577246307883a4aaf844162a50bd278ab04544db089d3b` | Plans citation list and check output |
| `pm7/aria-snapshot.yaml` | `26519654d6547ed41fe2143a920654dbbf33423d9fbb55bb1e82321891440c0e` | Concept page measurement |
| `pm7/compact-controls.txt` | `2cca773cbc040b3726cfd56af221113c1123e3be51af3e7ea47efa69216a6d9f` | Concept page measurement |
| `pm7/run-summary.json` | `bf46340f9db1bb733ea81bc4aab04bf23cf39d75dfe0988b6a34914efa9044d1` | Concept page measurement |
| `pm7/tree-size.json` | `ad56c79d2ec214622bd3a19c7317169990d6ae265d14e9ffa8553373e3229b91` | Concept page measurement |
| `reviews/REVIEW-r1-sol-high.md` | `7d4579c888d3f9346f8fb4551b57a9ab6ce36c8cded16328ebd9a34b98e4b87e` | Blind review report |
| `slint/build-1.17.1.log` | `5d14cb4eb5d6dc67f89b51e58f59a80dfa3c4bdc6bb3ae0aba2aa8d87a9cb14a` | Slint build and test logs |
| `slint/build-1.18.1.log` | `e27c139c3b9082f2e5a1d8acfe61862ab1e3b7da13e985e802c31b33d55f8a4c` | Slint build and test logs |
| `slint/mock-time-test-1.17.1.log` | `3c94d7488bc9a8a54edb93a353b8e76ca666a6553b07e9d2dcc3f21e8883e32a` | Slint build and test logs |
| `slint/mock-time-test-1.18.1.log` | `6a04c2b6e2d4e5f314ded0b50667215528a9d4cb448650850aec6825f2e264bf` | Slint build and test logs |
| `slint/r2/accessible-id-and-mock-time-test-1.18.1.log` | `b818200094e27fb0190fc91d7c5e4bdaa1a21afc53a00e0d295c0b7730674e7b` | Slint 1.18.1 re-run after the review: accessible-id and the absence check |
| `slint/r2/accessible-id-over-mcp.json` | `2ef07919bfc2773d0a4a993e5bd134021599e027c526e139a908b7aa5b1a551f` | Slint 1.18.1 re-run after the review: accessible-id and the absence check |
| `slint/r2/m4-absence-check.txt` | `e2d35b46f40a6fb3d86b2b68b05c2cfab756e034954f0e1c69ca1a968dc5fa2a` | Slint 1.18.1 re-run after the review: accessible-id and the absence check |
| `slint/r2/probe-result.json` | `9c1baa9aee07772b69023da060afffbd8ec9cbbdb46de1493c744b5c5d44bddc` | Slint 1.18.1 re-run after the review: accessible-id and the absence check |
| `slint/upstream/mcp-server-master-e134a08c.md` | `c153295af19eecebe6e0493d9d1e85d547eba24ccab92fede8a89b5aaf66f98b` | Copies of upstream Slint files at the named tag or commit |
| `slint/upstream/README-master-e134a08c.md` | `1ebd9943999fabbebd23b1300df7fd8edb4e538650facd29d58790c9ed1482e4` | Copies of upstream Slint files at the named tag or commit |
| `slint/upstream/README-v1.17.1.md` | `49c73f117cb38f0909add2136eb6bedcf85103d47178b4b91050a9ad2539db7f` | Copies of upstream Slint files at the named tag or commit |
| `slint/upstream/README-v1.18.1.md` | `49c73f117cb38f0909add2136eb6bedcf85103d47178b4b91050a9ad2539db7f` | Copies of upstream Slint files at the named tag or commit |
| `slint/upstream/slint_systest-v1.17.1.proto` | `c1fd692b2f6071819bc18e858bc02b3b6fd3f60cf249e6fdbe28ebfa1eb57996` | Copies of upstream Slint files at the named tag or commit |
| `slint/upstream/slint_systest-v1.18.1.proto` | `2845745e27e2d7c152f0a45f410445ad5ea2e339e3387b2d520ddd2489838146` | Copies of upstream Slint files at the named tag or commit |
| `slint/v1.17.1/app.log` | `e9e46659aa99ee683a6a654089b90eda005959b4c04ab775783db8e083f1cfa3` | Slint 1.17.1 MCP probe outputs |
| `slint/v1.17.1/compact-interactive.txt` | `8055c101ea883f6d70eaed9c4a1f4d96ac90bbfef9f109d386878dedceb65577` | Slint 1.17.1 MCP probe outputs |
| `slint/v1.17.1/compact-tree.txt` | `455958a89cc3d14505b60f3da4ff1b3a12bb5f26ae4078dca9497ce62f282257` | Slint 1.17.1 MCP probe outputs |
| `slint/v1.17.1/element-tree.json` | `b0515e51a2171ba196eaf8f333a1379d9b9b7ccb15f1ccc7827dc0f361db3186` | Slint 1.17.1 MCP probe outputs |
| `slint/v1.17.1/instructions.txt` | `d125e66fd41d805220d79274c8583a69ee2b2479f716f99fa28c5aa327e6f80a` | Slint 1.17.1 MCP probe outputs |
| `slint/v1.17.1/probe-result.json` | `977c62620b49c34855fb8269c085820c3a22fa104785c40672b71e4932bcc7cf` | Slint 1.17.1 MCP probe outputs |
| `slint/v1.17.1/screenshot.png` | `29655b8ff54c1de113e73548740c09a2f1c6635c23dbc848da5f11889528f76d` | Slint 1.17.1 MCP probe outputs |
| `slint/v1.17.1/tools-list.json` | `98702cf50fc0ca801c30cb612ddc319dc490459b3eca33bff0b948aabbb356fd` | Slint 1.17.1 MCP probe outputs |
| `slint/v1.18.1/app.log` | `273dc3b0e38de69920982bd44b7e2172327a181f252f3e764e07fc6def4b7fe8` | Slint 1.18.1 MCP probe outputs |
| `slint/v1.18.1/compact-interactive.txt` | `8055c101ea883f6d70eaed9c4a1f4d96ac90bbfef9f109d386878dedceb65577` | Slint 1.18.1 MCP probe outputs |
| `slint/v1.18.1/compact-tree.txt` | `c5a163d680f35f4d82bd17f7c77a774a8e668da7f2eca364ce571562ce7a364c` | Slint 1.18.1 MCP probe outputs |
| `slint/v1.18.1/element-tree.json` | `5c4cd972e9f05901472136f18c7b9e4f53720435b8004c016507b2f88b8c82c1` | Slint 1.18.1 MCP probe outputs |
| `slint/v1.18.1/instructions.txt` | `490e4ea1d5b1fafb1a9710cfcf20dd86ce9024c1989e6fd9ff4d5f65a479561b` | Slint 1.18.1 MCP probe outputs |
| `slint/v1.18.1-plain-build.log` | `42f7fa0a6062e30d6ba4d2dee0b01e75fc251521b0696536be57e8bf391f87da` | Slint build and test logs |
| `slint/v1.18.1/probe-result.json` | `dc4999d13d29e8f43f12c57029fdf0e65ff4468e14a96419fb0d971d6eb5a309` | Slint 1.18.1 MCP probe outputs |
| `slint/v1.18.1/screenshot.png` | `e2a07e4d5ffde302396f0d09511cef198acd634d3e83fadca0f178527c94abef` | Slint 1.18.1 MCP probe outputs |
| `slint/v1.18.1/tools-list.json` | `332beacf075b4eeaca35b007a15f0c4d21aac0e88142bfe47b1b4b783e30ec63` | Slint 1.18.1 MCP probe outputs |
| `swarm/A-testing-owners.md` | `3e76998cdbd4d3eddc09cf0239df422086f62869b282b70716c4292eebc8d072` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/B-finalguispec.md` | `c3d3978435802f40c3006691e6f16765ae5f473b6854146226dd17dcb5f6774b` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/BRIEF.md` | `ec77118ddf06c7e158d7aaaae65159691c1e776edbabda035b7e41d943e3e4dc` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/C-commands-wiring.md` | `730514b5bd8ebbd49e63adc8c4fc0f7eea2be18a924f2c06a373297d3445fa5b` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/D-build-diagnostics-permissions.md` | `d154541dff4715adac7e9c2fa80be98fb7a8f63d8ad6a723c51cb73c913a76da` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/E-decisions-mobile.md` | `69c88d283a3451c27eef6a1fd208f5de6a515bb8a9cb384d5d56ca7a115fea92` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |
| `swarm/F-current-tooling.md` | `8ceeedff6ab2601ce678370c0adee332b2917d0b3b8cdeb7029f1139bbc873b9` | Worker reports (Muse Ember 1.0, maximum effort, read-only) |

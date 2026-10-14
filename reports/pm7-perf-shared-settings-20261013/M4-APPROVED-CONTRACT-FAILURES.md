M4 approved-design probe — not delivered

Coordinator authorization1014005302-af53 and Opus decisiondf7fa857254291a428bc6d9ef6411e1b586beee52aec8a11557ece98ee257df0 replaced the rejected pure-performance comparison with the explicit reading-anchor contract. The new implementation remains an external prototype. No M4 source is included in either review branch.

Private candidate `m4-authorized-proto12.html` SHA-256 `a24804ca08063d348751bfb24d9b90f70bd5684fdadf2a312c84cee885904911` received a short authorized P1000 probe at1920×1080,DPR1,ANGLE/QuadroP1000/OpenGL4.5.0. Thirty cases across BasicDark,GlassLight,NieRDark were sampled by rAF for1500ms and again after2000ms. Twenty-five had no asserted failure; five cases need work. This is not the complete A–F acceptance suite.

The material failure is A1 at the bottom: GlassLight’s anchor moved10px (offset53.9375→63.9375) and NieRDark’s moved10px (38.828125→48.828125). BasicDark also changed its anchor and active section. The nearest surviving-anchor and bottom-clamp path does not yet meet the approved contract. No fallback to the old drift is shipped.

Three retained-motion reports include `.will-reveal` sections that were already present before the action; the harness must distinguish newly gained/replayed motion before judging those as an implementation failure. The actual bottom drift and active-section changes remain independent failures.

Windows all-ten-look checks, Reduced Motion, focus/hover and the chapter-arrival film remain pending. Priority moved to the coordinator’s separate M1 landing packet. The P1000 session937ebf9000a3 stopped complete and was purged, then handed to pm7-editor-customizer.

Evidence:

- `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m4-authorized-p1000-probe-v1/rows.json`, SHA-256 `4d437db68ec2aeb0c84a048b190643698b453154c4187eff40d30d5002571db4`.
- `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m4-authorized-p1000-probe-v1/result.json`, SHA-256 `0f9c11a1cdbf9d1b5ad429c09939ec8703ece8490e3cbb883d3743f5905dfcd3`.

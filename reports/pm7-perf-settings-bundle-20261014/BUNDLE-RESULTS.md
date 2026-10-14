# PM7 shared Settings bundle: hold, do not land

M5, M6 and M10 together do not meet the requirement that no look become slower. There are repeated warm Auto savings, but cold family changes are slower in all three matched pairs for Basic Dark and Retro Light. No reduced bundle has qualified, and no individual fix is promoted by this run. The existing M5/M6/M10 standalone holds remain.

The inherited run completed without restart or duplication: 1,308 windows, 654 matched pairs, zero UI snapshot differences. Windows RTX 3090, Chrome 155, 1920×1080, DPR 1; three fresh documents and ten warm repetitions per look; alternating artifact order; normal system and app motion explicitly asserted. Each action includes a fixed three-second settlement. Task time is total measured main-thread work, not input latency; CPU categories overlap.

Tested source: `fa8fd4235f3b6bd13f7043b1821397f4341a444a` on `fix/pm7-perf-settings-bundle-20261014`, against `916059849e`. The source and generators were already pushed to GitHub and NAS by the predecessor. This verdict adds reports only. Main advanced to `cae30c7f2d` during the run; the coordinator explicitly retained the matched 916 baseline. Because the bundle is held, it has not been rebased or presented as ready on the newer main.

| Case | Task median before → after | Task p95 before → after | Faster candidate pairs |
|---|---:|---:|---:|
| Basic Dark cold family | 1280.7 → 1406.4 ms | 1358.1 → 1455.3 ms | 0/3 |
| Retro Light cold family | 1230.6 → 1356.5 ms | 1233.4 → 1400.8 ms | 0/3 |
| NieR Light cold General | 754.9 → 845.2 ms | 763.4 → 851.2 ms | 0/3 |
| Basic Dark warm Auto | 1300.9 → 1247.4 ms | 1399.4 → 1304.1 ms | 9/10 |
| Basic Light warm Auto | 934.8 → 886.7 ms | 1019.4 → 953.2 ms | 9/10 |
| Glass Light warm Auto | 1104.3 → 1038.0 ms | 1131.8 → 1074.3 ms | 8/10 |
| Retro Light warm Auto | 961.2 → 899.0 ms | 1028.7 → 940.7 ms | 8/10 |

The earlier M6 NieR Dark mode rise from 1065.7 to 1653.7 ms did **not** repeat at that scale in this composition. Warm Dark mode is 1434.8 → 1448.6 ms (p95 1533.4 → 1492.5; 5/10 faster; paired median +0.8 ms). Warm Light is 1485.6 → 1459.0 ms (p95 1529.7 → 1665.5; 7/10 faster; paired median -27.1 ms). Cold Dark is 1493.9 → 1483.9 ms and cold Light 1495.5 → 1494.6 ms. This does not erase the earlier result or establish exact equivalence. The conditional diagnostic trace and removal of an M6 piece were not triggered by a repeated mode regression. The other slower cases are sufficient to hold the full bundle.

Read-only examination of four existing M6 traces found high and low windows in both versions. High windows have roughly 320 layer updates and 450 ms of inclusive Layerize work, versus roughly 80 and 115 ms in low windows, with similar JavaScript call cost. That is attribution of the historical work, not proof that any particular M6 piece causes the distribution. No new diagnostic browser run was substituted for the required combined measurement.

No bundle feedback film was made and no new visual-film acceptance is claimed. The already completed individual correctness and film evidence remains available on `fix/pm7-perf-shared-settings-20261013`; it was not rerun. The bundle's zero-difference claim is limited to its recorded settled UI snapshots.

Raw evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/bundle-verdict-manifest.json`, SHA-256 `31122f09fe2d36ebf9e69b099692a3575722be9b393ed8da78b0d211048ccbf2`. It binds the complete summary, paired/phase summaries, UI check, frozen authored sources, artifacts and drivers. Individual trace files remain named in the summary; the compact manifest does not claim to hash every trace. Exact per-case values and p95 are in `measurements.json` and the table below.

Remaining: one focused M4 iteration after profiling the bottom anchor and Glass bounce. Any remaining M4 contract failure goes to the coordinator for an Opus design pass. No main landing is authorized for this worker.

Matched bundle measurement. CPU categories overlap; values cover the action and fixed three-second settlement. Cold and warm results are separate. Lower-pair counts are descriptive, not a significance test.

1308 windows; 654 matched pairs; 0 raw snapshot differences.

| Look | Action | Phase | Pairs | Task median before / after (ms) | Task p95 | Largest task median | Lower after |
|---|---|---|---:|---:|---:|---:|---:|
| basic-dark | home-general | cold | 3 | 946.8 / 962.8 | 1081.5 / 1136.5 | 115.3 / 114.8 | 1 / 3 |
| basic-dark | home-general | warm | 10 | 947.2 / 950.4 | 1041.3 / 1019.8 | 111.1 / 111.5 | 5 / 10 |
| basic-dark | settings-entry | cold | 3 | 692.6 / 672.5 | 724.2 / 731.5 | 59.5 / 56.0 | 2 / 3 |
| basic-dark | settings-return | cold | 3 | 1199.9 / 1140.8 | 1211.5 / 1142.7 | 92.9 / 91.1 | 3 / 3 |
| basic-dark | settings-return | warm | 10 | 1185.2 / 1168.7 | 1257.0 / 1297.8 | 93.2 / 92.5 | 9 / 10 |
| basic-dark | theme-auto | cold | 3 | 1335.2 / 1279.0 | 1378.2 / 1285.7 | 182.4 / 191.2 | 3 / 3 |
| basic-dark | theme-auto | warm | 10 | 1300.9 / 1247.4 | 1399.4 / 1304.1 | 182.4 / 180.8 | 9 / 10 |
| basic-dark | theme-family | cold | 3 | 1280.7 / 1406.4 | 1358.1 / 1455.3 | 220.7 / 298.7 | 0 / 3 |
| basic-dark | theme-family | warm | 10 | 1212.2 / 1213.6 | 1314.0 / 1305.7 | 213.9 / 214.4 | 6 / 10 |
| basic-dark | theme-mode | cold | 3 | 1198.0 / 1202.5 | 1228.3 / 1237.7 | 189.9 / 186.7 | 1 / 3 |
| basic-dark | theme-mode | warm | 10 | 1126.7 / 1091.3 | 1175.6 / 1204.2 | 188.3 / 186.0 | 5 / 10 |
| basic-light | home-general | cold | 3 | 993.5 / 966.2 | 1006.8 / 1007.3 | 118.6 / 112.6 | 2 / 3 |
| basic-light | home-general | warm | 10 | 967.5 / 955.5 | 1064.8 / 1047.8 | 114.3 / 113.3 | 6 / 10 |
| basic-light | settings-entry | cold | 3 | 700.8 / 702.5 | 727.1 / 797.0 | 52.2 / 51.1 | 1 / 3 |
| basic-light | settings-return | cold | 3 | 1208.5 / 1153.1 | 1277.1 / 1194.5 | 95.6 / 90.5 | 3 / 3 |
| basic-light | settings-return | warm | 10 | 1174.0 / 1163.0 | 1294.5 / 1221.3 | 91.9 / 90.6 | 6 / 10 |
| basic-light | theme-auto | cold | 3 | 986.9 / 1024.4 | 995.8 / 1043.7 | 45.3 / 37.0 | 0 / 3 |
| basic-light | theme-auto | warm | 10 | 934.8 / 886.7 | 1019.4 / 953.2 | 46.7 / 35.1 | 9 / 10 |
| basic-light | theme-family | cold | 3 | 1344.2 / 1339.2 | 1390.9 / 1396.6 | 216.9 / 211.7 | 2 / 3 |
| basic-light | theme-family | warm | 10 | 1231.7 / 1237.7 | 1280.5 / 1287.5 | 220.4 / 209.6 | 4 / 10 |
| basic-light | theme-mode | cold | 3 | 1207.4 / 1229.1 | 1232.4 / 1273.7 | 186.1 / 190.9 | 1 / 3 |
| basic-light | theme-mode | warm | 10 | 1138.8 / 1119.4 | 1191.9 / 1187.8 | 193.8 / 189.9 | 6 / 10 |
| friendly-dark | home-general | cold | 3 | 897.1 / 908.7 | 902.7 / 950.9 | 109.2 / 110.1 | 0 / 3 |
| friendly-dark | home-general | warm | 10 | 906.1 / 907.8 | 921.1 / 971.7 | 108.2 / 108.4 | 5 / 10 |
| friendly-dark | settings-entry | cold | 3 | 699.5 / 712.5 | 738.5 / 739.8 | 50.9 / 51.8 | 2 / 3 |
| friendly-dark | settings-return | cold | 3 | 1114.2 / 1122.1 | 1158.1 / 1160.5 | 93.2 / 89.4 | 1 / 3 |
| friendly-dark | settings-return | warm | 10 | 1136.9 / 1121.4 | 1181.6 / 1196.3 | 93.3 / 90.8 | 5 / 10 |
| friendly-dark | theme-auto | cold | 3 | 1251.7 / 1282.2 | 1297.2 / 1311.5 | 181.8 / 182.4 | 2 / 3 |
| friendly-dark | theme-auto | warm | 10 | 1282.8 / 1263.6 | 1342.2 / 1375.6 | 184.1 / 183.4 | 6 / 10 |
| friendly-dark | theme-family | cold | 3 | 1322.0 / 1318.2 | 1362.3 / 1321.5 | 222.0 / 209.2 | 2 / 3 |
| friendly-dark | theme-family | warm | 10 | 1231.1 / 1243.6 | 1359.1 / 1308.4 | 217.0 / 219.0 | 5 / 10 |
| friendly-dark | theme-mode | cold | 3 | 1185.6 / 1203.5 | 1219.2 / 1255.6 | 190.9 / 185.6 | 1 / 3 |
| friendly-dark | theme-mode | warm | 10 | 1120.6 / 1093.3 | 1173.1 / 1150.5 | 188.9 / 187.2 | 8 / 10 |
| friendly-light | home-general | cold | 3 | 959.6 / 941.4 | 1008.9 / 953.9 | 114.4 / 111.9 | 3 / 3 |
| friendly-light | home-general | warm | 10 | 923.8 / 932.3 | 1020.1 / 1016.5 | 110.8 / 111.0 | 5 / 10 |
| friendly-light | settings-entry | cold | 3 | 708.2 / 702.6 | 749.6 / 772.2 | 51.1 / 51.2 | 1 / 3 |
| friendly-light | settings-return | cold | 3 | 1201.7 / 1173.1 | 1237.0 / 1263.6 | 89.4 / 90.2 | 2 / 3 |
| friendly-light | settings-return | warm | 10 | 1186.7 / 1189.2 | 1228.5 / 1224.8 | 92.6 / 92.3 | 5 / 10 |
| friendly-light | theme-auto | cold | 3 | 1045.7 / 918.9 | 1106.0 / 1025.1 | 46.0 / 34.3 | 3 / 3 |
| friendly-light | theme-auto | warm | 10 | 908.5 / 865.5 | 998.3 / 958.6 | 45.6 / 34.4 | 9 / 10 |
| friendly-light | theme-family | cold | 3 | 1359.8 / 1322.7 | 1361.7 / 1358.2 | 222.2 / 214.1 | 3 / 3 |
| friendly-light | theme-family | warm | 10 | 1263.8 / 1262.9 | 1308.1 / 1337.1 | 220.8 / 213.4 | 5 / 10 |
| friendly-light | theme-mode | cold | 3 | 1230.2 / 1188.0 | 1254.6 / 1201.2 | 191.0 / 185.6 | 3 / 3 |
| friendly-light | theme-mode | warm | 10 | 1076.8 / 1084.8 | 1121.7 / 1202.7 | 185.0 / 190.0 | 4 / 10 |
| glass-dark | home-general | cold | 3 | 1871.5 / 1878.9 | 1948.4 / 1888.6 | 256.9 / 259.6 | 1 / 3 |
| glass-dark | home-general | warm | 10 | 1572.9 / 1595.4 | 1644.9 / 1651.2 | 273.7 / 268.0 | 4 / 10 |
| glass-dark | settings-entry | cold | 3 | 1241.6 / 1177.3 | 1337.7 / 1190.7 | 90.3 / 91.7 | 3 / 3 |
| glass-dark | settings-return | cold | 3 | 1600.5 / 1548.8 | 1631.5 / 1591.8 | 145.5 / 143.5 | 3 / 3 |
| glass-dark | settings-return | warm | 10 | 1441.3 / 1437.4 | 1503.8 / 1491.8 | 142.4 / 145.8 | 4 / 10 |
| glass-dark | theme-auto | cold | 3 | 1850.5 / 1848.0 | 1864.5 / 1934.2 | 242.6 / 232.1 | 1 / 3 |
| glass-dark | theme-auto | warm | 10 | 1809.0 / 1805.7 | 1892.2 / 1850.0 | 240.0 / 243.6 | 5 / 10 |
| glass-dark | theme-family | cold | 3 | 1508.0 / 1562.9 | 1543.3 / 1564.0 | 375.2 / 370.3 | 0 / 3 |
| glass-dark | theme-family | warm | 10 | 1436.1 / 1419.0 | 1513.1 / 1518.2 | 375.7 / 368.4 | 4 / 10 |
| glass-dark | theme-mode | cold | 3 | 2073.4 / 2019.8 | 2277.6 / 2075.1 | 257.7 / 246.2 | 3 / 3 |
| glass-dark | theme-mode | warm | 10 | 1654.5 / 1624.6 | 1738.1 / 1747.0 | 244.0 / 246.7 | 4 / 10 |
| glass-light | home-general | cold | 3 | 1878.8 / 1841.4 | 1928.7 / 1965.9 | 258.6 / 252.2 | 2 / 3 |
| glass-light | home-general | warm | 10 | 1594.6 / 1568.2 | 1687.4 / 1633.9 | 275.6 / 269.8 | 6 / 10 |
| glass-light | settings-entry | cold | 3 | 1164.8 / 1213.6 | 1282.5 / 1215.9 | 95.6 / 93.2 | 1 / 3 |
| glass-light | settings-return | cold | 3 | 1605.6 / 1561.3 | 1714.4 / 1609.2 | 136.9 / 145.6 | 2 / 3 |
| glass-light | settings-return | warm | 10 | 1402.5 / 1409.5 | 1453.8 / 1466.8 | 142.9 / 143.1 | 5 / 10 |
| glass-light | theme-auto | cold | 3 | 1109.4 / 1047.4 | 1137.7 / 1086.1 | 57.8 / 41.9 | 3 / 3 |
| glass-light | theme-auto | warm | 10 | 1104.3 / 1038.0 | 1131.8 / 1074.3 | 59.6 / 43.7 | 8 / 10 |
| glass-light | theme-family | cold | 3 | 1507.4 / 1512.6 | 1557.8 / 1522.2 | 373.7 / 360.5 | 2 / 3 |
| glass-light | theme-family | warm | 10 | 1469.8 / 1457.7 | 1526.9 / 1539.6 | 380.0 / 373.7 | 5 / 10 |
| glass-light | theme-mode | cold | 3 | 1895.2 / 1837.3 | 1933.6 / 1870.7 | 240.5 / 240.2 | 3 / 3 |
| glass-light | theme-mode | warm | 10 | 1661.7 / 1648.6 | 1790.2 / 1709.3 | 247.6 / 246.3 | 8 / 10 |
| nier-dark | home-general | cold | 3 | 795.7 / 778.2 | 835.6 / 802.0 | 171.7 / 166.4 | 2 / 3 |
| nier-dark | home-general | warm | 10 | 671.2 / 657.4 | 724.4 / 680.0 | 168.6 / 167.0 | 8 / 10 |
| nier-dark | settings-entry | cold | 3 | 652.2 / 654.7 | 686.1 / 683.4 | 98.8 / 95.8 | 2 / 3 |
| nier-dark | settings-return | cold | 3 | 968.8 / 984.4 | 1025.0 / 1059.9 | 153.0 / 151.5 | 0 / 3 |
| nier-dark | settings-return | warm | 10 | 878.5 / 884.4 | 920.4 / 938.2 | 152.3 / 150.1 | 5 / 10 |
| nier-dark | theme-auto | cold | 3 | 1664.7 / 1687.8 | 1690.9 / 1702.1 | 290.8 / 311.9 | 2 / 3 |
| nier-dark | theme-auto | warm | 10 | 1624.7 / 1599.0 | 1724.2 / 1682.1 | 301.2 / 295.4 | 7 / 10 |
| nier-dark | theme-mode | cold | 3 | 1493.9 / 1483.9 | 1573.1 / 1510.3 | 297.0 / 292.5 | 3 / 3 |
| nier-dark | theme-mode | warm | 10 | 1434.8 / 1448.6 | 1533.4 / 1492.5 | 295.6 / 289.7 | 5 / 10 |
| nier-light | home-general | cold | 3 | 754.9 / 845.2 | 763.4 / 851.2 | 168.4 / 170.4 | 0 / 3 |
| nier-light | home-general | warm | 10 | 683.3 / 667.6 | 702.5 / 721.2 | 171.6 / 164.0 | 7 / 10 |
| nier-light | settings-entry | cold | 3 | 608.5 / 606.6 | 674.2 / 651.2 | 99.9 / 99.1 | 2 / 3 |
| nier-light | settings-return | cold | 3 | 996.0 / 967.5 | 996.6 / 992.7 | 146.7 / 149.2 | 2 / 3 |
| nier-light | settings-return | warm | 10 | 886.6 / 904.6 | 970.8 / 936.9 | 150.7 / 150.2 | 4 / 10 |
| nier-light | theme-auto | cold | 3 | 1244.1 / 1220.6 | 1288.8 / 1225.7 | 64.6 / 48.2 | 2 / 3 |
| nier-light | theme-auto | warm | 10 | 1230.2 / 1177.5 | 1274.2 / 1278.9 | 62.4 / 48.3 | 7 / 10 |
| nier-light | theme-mode | cold | 3 | 1495.5 / 1494.6 | 1574.2 / 1518.2 | 308.1 / 291.8 | 2 / 3 |
| nier-light | theme-mode | warm | 10 | 1485.6 / 1459.0 | 1529.7 / 1665.5 | 297.3 / 291.7 | 7 / 10 |
| retro-dark | home-general | cold | 3 | 951.7 / 940.6 | 978.9 / 957.3 | 113.5 / 113.8 | 2 / 3 |
| retro-dark | home-general | warm | 10 | 947.1 / 972.3 | 1080.1 / 1082.4 | 111.8 / 113.6 | 4 / 10 |
| retro-dark | settings-entry | cold | 3 | 701.9 / 711.4 | 704.5 / 755.4 | 52.4 / 54.1 | 1 / 3 |
| retro-dark | settings-return | cold | 3 | 1166.7 / 1214.4 | 1171.0 / 1233.9 | 91.7 / 90.9 | 1 / 3 |
| retro-dark | settings-return | warm | 10 | 1154.6 / 1157.1 | 1227.1 / 1232.7 | 93.2 / 89.9 | 5 / 10 |
| retro-dark | theme-auto | cold | 3 | 1371.3 / 1296.6 | 1421.8 / 1342.9 | 196.1 / 189.7 | 2 / 3 |
| retro-dark | theme-auto | warm | 10 | 1241.0 / 1251.5 | 1315.8 / 1362.2 | 189.1 / 184.4 | 6 / 10 |
| retro-dark | theme-family | cold | 3 | 1232.9 / 1282.0 | 1365.6 / 1395.9 | 233.1 / 213.8 | 1 / 3 |
| retro-dark | theme-family | warm | 10 | 1124.5 / 1121.8 | 1143.7 / 1173.7 | 224.1 / 214.4 | 4 / 10 |
| retro-dark | theme-mode | cold | 3 | 1182.0 / 1185.9 | 1198.7 / 1193.8 | 191.8 / 195.6 | 1 / 3 |
| retro-dark | theme-mode | warm | 10 | 1119.9 / 1124.3 | 1194.8 / 1159.4 | 196.4 / 194.8 | 6 / 10 |
| retro-light | home-general | cold | 3 | 951.1 / 1022.2 | 976.4 / 1065.3 | 120.0 / 117.9 | 1 / 3 |
| retro-light | home-general | warm | 10 | 942.9 / 945.3 | 978.8 / 996.8 | 110.2 / 113.4 | 5 / 10 |
| retro-light | settings-entry | cold | 3 | 735.8 / 721.1 | 775.1 / 736.3 | 52.0 / 52.1 | 2 / 3 |
| retro-light | settings-return | cold | 3 | 1154.5 / 1120.0 | 1162.4 / 1141.4 | 91.4 / 88.9 | 3 / 3 |
| retro-light | settings-return | warm | 10 | 1152.7 / 1168.6 | 1218.6 / 1238.0 | 89.7 / 90.3 | 3 / 10 |
| retro-light | theme-auto | cold | 3 | 1001.4 / 911.6 | 1004.4 / 1023.8 | 46.4 / 34.7 | 2 / 3 |
| retro-light | theme-auto | warm | 10 | 961.2 / 899.0 | 1028.7 / 940.7 | 45.8 / 34.9 | 8 / 10 |
| retro-light | theme-family | cold | 3 | 1230.6 / 1356.5 | 1233.4 / 1400.8 | 226.5 / 209.0 | 0 / 3 |
| retro-light | theme-family | warm | 10 | 1135.7 / 1135.9 | 1258.0 / 1176.7 | 222.1 / 219.5 | 6 / 10 |
| retro-light | theme-mode | cold | 3 | 1156.5 / 1189.5 | 1258.0 / 1191.3 | 188.4 / 186.4 | 1 / 3 |
| retro-light | theme-mode | warm | 10 | 1112.4 / 1088.3 | 1155.9 / 1147.8 | 188.7 / 187.5 | 6 / 10 |

# Reviser source index

Run: D-R1-02-control, stage: reviser. Source IDs S01–S13 are preserved from the investigator source map. Full source identity, version, locator, access time, observed operation, governing condition/default/exception, applicability, and reviewer verification notes are in [source-map.json](../source-map.json). The proposal and dispositions are in [final.md](../final.md).

| ID | Primary source | Locator and use |
|---|---|---|
| S01 | [ISO 5348:2021 — Mechanical mounting of accelerometers](https://www.iso.org/standard/78160.html) | Abstract/lifecycle; mount effects and scope. |
| S02 | [TE Connectivity adhesive-mounting note](https://www.te.com/content/dam/te-com/documents/sensors/global/guidelines-adhesive-mounting-accelerometers-app-note.pdf) | Page 1; conditional adhesive/mount coupling guidance. |
| S03 | [Endevco Technical Paper 312](https://www.endevco.com/contentStore/mktgContent/endevco/dlm_uploads/2019/02/TP312.pdf) | Pages 1–5; tested accelerometers and method-specific limits. |
| S04 | [Railway Track Monitoring Using Train Measurements](https://www.mdpi.com/2076-3417/9/22/4859) | 2019 Irish train study; 60 passes, speed effects, reference comparison. |
| S05 | [Balouchi, Bevan & Formston, multi-train monitoring study](https://doi.org/10.1080/00423114.2020.1755045) | Network Rail trials, Run 25/36, time/GNSS/speed alignment, repeated known-fault capture, position offset and speed/lateral limits. Rechecked against Taylor & Francis full-text results at 2026-10-10 06:51:14–06:51:15 UTC; the exact full-text result is recorded in the source map. |
| S06 | [Development and Operation of Track Condition Monitoring System Using In-Service Train](https://doi.org/10.3390/app13063835) | Sections 2–3 and 7; deployment, vehicle/speed/position limits, and inconsistent data-gap dates. |
| S07 | [Wheel-to-rail acceleration study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10574946/) | Tank-wagon positions/load/speed; unreconciled DAQ and exported cadence. |
| S08 | [Method for predicting dynamic loads for a health monitoring system for subway tracks](https://doi.org/10.3389/fmech.2022.858424) | Experimental procedure and fixed-gauge locality; synchronized 1:10 rig, optical speed and rail-gap trigger. Publisher page rechecked at 2026-10-10 06:51:14–06:51:15 UTC. |
| S09 | [ST LSM6DSM datasheet](https://www.st.com/resource/en/datasheet/lsm6dsm.pdf) | Rev 7; device-specific FIFO timestamp configuration. |
| S10 | [ST AN4987](https://www.st.com/resource/en/application_note/dm00352102-lsm6dsm-alwayson-3d-accelerometer-and-3d-gyroscope-stmicroelectronics.pdf) | Rev 5; device-specific filter chain, anti-alias and ODR conditions. |
| S11 | [ST timestamp support thread](https://community.st.com/mems-sensors-48/lsm6dsm-timestamp-in-fifo-occasionally-incorrect-166217?fid=48&tid=166217) | 2026-07-06 moderator response; one configuration-specific report, not a confirmed silicon fault. |
| S12 | [Metro sensor-bracket vibration fatigue study](https://doi.org/10.1016/j.engfailanal.2022.107046) | Publisher abstract/failure and field-test sections; specific bracket mode and limited transfer. |
| S13 | [Siemens TBCM Network Rail trial release](https://news.siemens.co.uk/news/siemens-mobility-takes-part-in-network-rail-trials-to-predict-rough-rides) | Early vendor report of a six-month trial on 80 SWR trains; no independent metrics on the page. |

S04, S05, S06, and S12 had publisher-page access limitations recorded by the upstream source maps. The reviser directly rechecked the disputed S05 claim using Taylor & Francis publisher full-text results; direct page open returned an internal error. S08 was opened on the Frontiers publisher page. These sources are analogies for method and history, not cart-specific evidence.
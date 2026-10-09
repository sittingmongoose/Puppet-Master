# Source index

This index is the navigation layer for the fixed public-source set used in pre-plan discovery. Findings are summarized in [primary-source-notes.md](primary-source-notes.md); source version, commit, locator, capture checkpoint and access operations are in [source-map.json](../source-map.json).

The source IDs below are immutable within this assignment. Rolling pages can drift; if content changes, preserve the earlier ID and add a new ID instead of silently changing its target.

| ID | Source | Captured identity |
|---|---|---|
| S01 | [ODK Collect introduction](https://docs.getodk.org/collect-intro/) | Rolling ODK docs; Android/offline overview |
| S02 | [ODK Entities introduction](https://docs.getodk.org/entities-intro/) | Rolling docs; offline version gates and limitations |
| S03 | [ODK Central Entities](https://docs.getodk.org/central-entities/) | Rolling docs; conflict and offline update semantics |
| S04 | [ODK form languages](https://docs.getodk.org/form-language/) | Rolling docs; form labels/media and separate app UI language |
| S05 | [ODK question types](https://docs.getodk.org/form-question-types/) | Rolling docs; barcode question |
| S06 | [ODK Central submissions](https://docs.getodk.org/central-submissions/) | Rolling docs; Collect vs offline web form submission behavior |
| S07 | [ODK Central roles](https://docs.getodk.org/central-users/) | Rolling docs; App User/Data Collector visibility |
| S08 | [ODK security notes](https://docs.getodk.org/security/) | Rolling docs; mobile/shared-storage tradeoff |
| S09 | [Collect issue #4589](https://github.com/getodk/collect/issues/4589) | Historical issue; failed submission edit/retry integrity |
| S10 | [Collect merge commit #4655](https://github.com/getodk/collect/commit/12ef1a3f4f2257591cfe912754a44305dd686a2a) | Pinned merge commit `12ef1a3f4f2257591cfe912754a44305dd686a2a` |
| S11 | [Collect v2026.3.5 release](https://github.com/getodk/collect/releases/tag/v2026.3.5) | Commit `87bf04ec0a94e3dec1abc87db73c8326d8667162` |
| S12 | [Collect SaveFormToDisk.java](https://github.com/getodk/collect/blob/87bf04ec0a94e3dec1abc87db73c8326d8667162/collect_app/src/main/java/org/odk/collect/android/tasks/SaveFormToDisk.java) | Commit-pinned code at S11 |
| S13 | [ERPNext Batch](https://docs.frappe.io/erpnext/batch) | Rolling docs; batch/warehouse behavior |
| S14 | [ERPNext Stock Reservation](https://docs.frappe.io/erpnext/stock-reservation) | Rolling docs; v15 feature and prerequisites |
| S15 | [ERPNext Item](https://docs.frappe.io/erpnext/item) | Rolling docs; item batch/barcode settings |
| S16 | [ERPNext UoM](https://docs.frappe.io/erpnext/uom) | Rolling docs; fractional quantity setting |
| S17 | [ERPNext Stock Settings](https://docs.frappe.io/erpnext/stock-settings) | Rolling docs; default Stock UOM |
| S18 | [ERPNext Stock Reconciliation](https://docs.frappe.io/erpnext/stock-reconciliation) | Rolling docs; barcode scan mode |
| S19 | [ERPNext Role Based Permissions](https://docs.frappe.io/erpnext/permissions) | Rolling docs; role/field/user permission controls |
| S20 | [ERPNext Customer](https://docs.frappe.io/erpnext/customer) | Rolling docs; linked addresses and contacts |
| S21 | [ERPNext v15.121.3 release](https://github.com/frappe/erpnext/releases/tag/v15.121.3) | Commit `26f06878346fb6861229ccb1fe3a53dc1bf5bad3` |
| S22 | [ERPNext batch.py](https://github.com/frappe/erpnext/blob/26f06878346fb6861229ccb1fe3a53dc1bf5bad3/erpnext/stock/doctype/batch/batch.py) | Commit-pinned v15 code at S21 |
| S23 | [ERPNext stock_reservation_entry.py](https://github.com/frappe/erpnext/blob/26f06878346fb6861229ccb1fe3a53dc1bf5bad3/erpnext/stock/doctype/stock_reservation_entry/stock_reservation_entry.py) | Commit-pinned v15 code at S21 |
| S24 | [ERPNext serial_and_batch_bundle.py](https://github.com/frappe/erpnext/blob/26f06878346fb6861229ccb1fe3a53dc1bf5bad3/erpnext/stock/doctype/serial_and_batch_bundle/serial_and_batch_bundle.py) | Commit-pinned v15 code at S21 |
| S25 | [farmOS Managing Assets](https://farmos.org/guide/assets/) | Rolling docs; plant group/individual Asset model |
| S26 | [farmOS Movements and location](https://farmos.org/guide/location/) | Rolling docs; completed movement Log location logic |
| S27 | [farmOS Inventory logic](https://farmos.org/model/logic/inventory/) | Rolling docs; reset/increment/decrement Quantities |
| S28 | [farmOS Field Kit repository](https://github.com/farmOS/field-kit) | Mutable README; no app version pinned |
| S29 | [farmOS installation](https://farmos.org/hosting/install) | Rolling docs; hosting and SSL requirements |
| S30 | [farmOS.js Introduction](https://farmos.org/development/farmos-js/) | Mutable docs; 2.x compatibility and LWW warning |
| S31 | [W3C WCAG 2.2 SC 1.4.1](https://www.w3.org/TR/2024/REC-WCAG22-20241212/#use-of-color) | Dated W3C Recommendation (2024-12-12) |

No executable, repository checkout, or product instance was downloaded or run. The only runtime-facing operations were reading public web documentation/repository pages and querying public GitHub release metadata for pinned versions.


## Independent critic rechecks

These hash-verified follow-up captures refine, but do not replace, the original S01-S31 source identities. Bounded findings are in [primary-source-notes.md](primary-source-notes.md#critic-recheck-sources-and-adjudication-notes); exact source metadata is in [source-map.json](../source-map.json).

| ID | Source | Recheck scope |
|---|---|---|
| C01 | [ODK Central Entities](https://docs.getodk.org/central-entities/) | All devices download all Entities; Entity values are string-only; privacy/type constraints |
| C02 | [Collect issue #4589](https://github.com/getodk/collect/issues/4589) | Same-ID retry with changed XML |
| C03 | [Collect merge commit #4655](https://github.com/getodk/collect/commit/12ef1a3f4f2257591cfe912754a44305dd686a2a) | Failed-submission editing fix and added test file |
| C04 | [ERPNext Stock Reservation Entry at v15.121.3](https://github.com/frappe/erpnext/blob/26f06878346fb6861229ccb1fe3a53dc1bf5bad3/erpnext/stock/doctype/stock_reservation_entry/stock_reservation_entry.py) | Sales Order voucher restriction and reserved-quantity behavior |
| C05 | [ERPNext batch.py at v15.121.3](https://github.com/frappe/erpnext/blob/26f06878346fb6861229ccb1fe3a53dc1bf5bad3/erpnext/stock/doctype/batch/batch.py) | Batch stock query by item, warehouse, and actual quantity |
| C06 | [ERPNext serial_and_batch_bundle.py at v15.121.3](https://github.com/frappe/erpnext/blob/26f06878346fb6861229ccb1fe3a53dc1bf5bad3/erpnext/stock/doctype/serial_and_batch_bundle/serial_and_batch_bundle.py) | Conditional negative-batch guard and exception |
| C07 | [farmOS.js Introduction](https://farmos.org/development/farmos-js/) | Experimental warning, 2.x scope, last-write-wins |
| C08 | [W3C WCAG 2.2 Recommendation](https://www.w3.org/TR/2024/REC-WCAG22-20241212/) | Web-content scope and SC 1.4.1 Level A |

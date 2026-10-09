# Critic source index

This index adds critic primary-source checks C01–C08. The predecessor source set S01–S31 is preserved unchanged and remains navigable in [the research source index](../../research/sources/index.md); its identities, locators, timestamps, and operations remain in this stage’s [source-map.json](../source-map.json).

The critic IDs are immutable references to captures in the critic source map. C01, C02, and C07 are mutable captures and do not silently replace S03, S09, or S30. C03–C06 are pinned to the commit listed in the map. C08 is a dated W3C Recommendation.

| ID | Source | Locator / review focus |
|---|---|---|
| C01 | [ODK Central Entities](https://docs.getodk.org/central-entities/) | All-device Entity downloads, string-only properties, conflicts, and offline ordering |
| C02 | [Collect issue #4589](https://github.com/getodk/collect/issues/4589) | Same submission ID with different XML |
| C03 | [Collect merge commit #4655](https://github.com/getodk/collect/commit/12ef1a3f4f2257591cfe912754a44305dd686a2a) | Pinned fix and added saved-form test file |
| C04 | [ERPNext Stock Reservation Entry at v15.121.3](https://github.com/frappe/erpnext/blob/26f06878346fb6861229ccb1fe3a53dc1bf5bad3/erpnext/stock/doctype/stock_reservation_entry/stock_reservation_entry.py) | Sales Order-only reservation, available quantity, partial setting |
| C05 | [ERPNext batch.py at v15.121.3](https://github.com/frappe/erpnext/blob/26f06878346fb6861229ccb1fe3a53dc1bf5bad3/erpnext/stock/doctype/batch/batch.py) | Batch quantity query from Stock Ledger |
| C06 | [ERPNext serial_and_batch_bundle.py at v15.121.3](https://github.com/frappe/erpnext/blob/26f06878346fb6861229ccb1fe3a53dc1bf5bad3/erpnext/stock/doctype/serial_and_batch_bundle/serial_and_batch_bundle.py) | Conditional negative-batch check and exception |
| C07 | [farmOS.js Introduction](https://farmos.org/development/farmos-js/) | Experimental warning, farmOS 2.x scope, last-write-wins |
| C08 | [WCAG 2.2 Recommendation](https://www.w3.org/TR/2024/REC-WCAG22-20241212/) | Web-content scope and SC 1.4.1 Use of Color |

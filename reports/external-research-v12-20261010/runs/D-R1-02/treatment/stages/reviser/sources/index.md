# Reviser source index — D-R1-02-treatment

Sources opened or rechecked in the reviser stage on 2026-10-10; exact access records, version pins, locators, conditions, limitations, and applicability are in [source-map.json](../source-map.json). Source IDs S01–S08 retain the investigator bindings.

- [S01 — ADXL354/ADXL355 datasheet, Rev D](https://www.analog.com/media/en/technical-documentation/data-sheets/adxl354_adxl355.pdf): range/defaults, filter delay, I2C limit and synchronization semantics; example device only.
- [S02 — NI vibration measurement guide](https://www.ni.com/en/shop/data-acquisition/sensor-fundamentals/measuring-vibration-with-accelerometers.html): mount compliance/mass, typical 100 mV/g examples, axes and signal conditioning.
- [S03 — Analog Devices sample-rate support case](https://ez.analog.com/linux-software-drivers/f/q-a/569014/eval-adxl355z-linux-command-line-for-setting-the-sample-frequency/493909): bounded Linux/IIO missed-interrupt case and proposed FIFO handling; no shipped fix established by thread.
- [S04 — Auersch, vehicle/track/soil vibration measurements](https://onlinelibrary.wiley.com/doi/10.1155/2017/1959286): 2017 report of 1994 measurements; synchronized rail references and varied speed; transfer is method-level.
- [S05 — Lamas-Lopez et al., field accelerometer/geophone displacement study](https://jzus.zju.edu.cn/article.php?doi=10.1631/jzus.A1600212): official journal source; reviser retrieval attempt returned internal error, so this stage adds no direct extraction.
- [S06 — wheel-to-rail comfort study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10574946/): multiple wagon sensor positions/load conditions and 20 Hz acquisition for the stated comfort study.
- [S07 — Dewesoft X order-tracking manual](https://manual.dewesoft.com/x/setupmodule/modules/machinery/ordertracking): product-specific angle/RPM and sample-rate guidance.
- [S08 — Escalona, track geometry with vision/inertial sensors, arXiv v1](https://arxiv.org/abs/2008.03763v1): camera/IMU/encoder precedent under rail-visibility and calibration conditions.

See also the [complete final proposal](../final.md).

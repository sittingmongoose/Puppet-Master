# Source index — investigator

Sources inspected **2026-10-10 06:27:50 UTC**. Full source identities, versions, locators, observation conditions and transfer limits are recorded in [`../source-map.json`](../source-map.json). IDs are stable within this stage.

- [S01 — ADXL354/ADXL355 datasheet Rev D](https://www.analog.com/media/en/technical-documentation/data-sheets/adxl354_adxl355.pdf): sensor range, default filters/ODR, delays, interface and synchronization.
- [S02 — NI vibration measurement guide](https://www.ni.com/en/shop/data-acquisition/sensor-fundamentals/measuring-vibration-with-accelerometers.html): mounting, mass, range, calibration and IEPE alternatives.
- [S03 — ADI sample-rate support case](https://ez.analog.com/linux-software-drivers/f/q-a/569014/eval-adxl355z-linux-command-line-for-setting-the-sample-frequency/493909): platform-specific missed interrupts; FIFO fix proposed, not confirmed shipped.
- [S04 — vehicle/track/soil campaign](https://onlinelibrary.wiley.com/doi/10.1155/2017/1959286): 2017 report of 1994 speed-varying multi-sensor rail measurements.
- [S05 — field accelerometer/geophone/LVDT comparison](https://jzus.zju.edu.cn/article.php?doi=10.1631/jzus.A1600212): 2017 paper on filtering, load, speed and repeatability.
- [S06 — empty/loaded wagon study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10574946/): 2023 VOR, multiple mounts and 20 Hz logging.
- [S07 — Dewesoft order tracking manual](https://manual.dewesoft.com/x/setupmodule/modules/machinery/ordertracking): direct angular reference and speed-analysis constraints.
- [S08 — camera/IMU/odometry track geometry method](https://arxiv.org/abs/2008.03763): arXiv v1, encoder/GNSS positioning with rigid-body/calibration conditions.

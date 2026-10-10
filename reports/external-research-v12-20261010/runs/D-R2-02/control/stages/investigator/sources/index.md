# Source index — D-R2-02-control / investigator

This is the bounded source ledger for the independent discovery. IDs are stable and used throughout `discovery.md`, `draft.md`, and `source-map.json`. Source-map records include exact URLs, version information (or its absence), access UTC, operation, locator, operating conditions, applicability, and transfer limits.

| ID | Source | Main use | Limits |
|---|---|---|---|
| [S01](#s01) | [USDA ARS Agriculture Handbook 66, revised 2016](https://www.ars.usda.gov/is/np/CommercialStorage/CommercialStorage.pdf) | Initial cooling vs transport; airflow and packaging conditions | General reference; no commodity-specific target selected |
| [S02](#s02) | [UF/IFAS, Protecting Perishable Foods During Transport by Truck or Rail](https://ask.ifas.ufl.edu/publication/HS1328) | Air vs product, position logging, airflow/vehicle context | Web page does not display revision date; guidance, not this route |
| [S03](#s03) | [Verreydt et al., full-scale citrus shipment monitoring, 2024](https://research.wur.nl/en/publications/identifying-cooling-heterogeneity-during-precooling-and-refrigera/) | Spatial heterogeneity, initial cooling and pallet ventilation | Citrus, long haul and trailer conditions |
| [S04](#s04) | [Aguiar et al., short-range PCM crate field data, 2023](https://doi.org/10.3390/en16135191) | Passive PCM packaging and stop-linked temperature monitoring | One winter route/orange crate setup; sensor measured crate air, not pulp or quality |
| [S05](#s05) | [Defraeye et al., artificial fruit simulator, 2017](https://doi.org/10.1016/j.jfoodeng.2017.07.012) | Product-like sensor-placement alternative | Prototype validated for apple cooling only |
| [S06](#s06) | [Kornienko, multi-drop fresh herbs, 2020](https://revista.sangregorio.edu.ec/index.php/REVISTASANGREGORIO/article/view/1251) | Door/opening as route covariate | Specific herbs/truck; not a quality or safety prediction here |
| [S07](#s07) | [FAO reusable-crate management guide, 2009](https://www.fao.org/4/i0930e/i0930e00.htm) | Crate pooling, condition, handling and reuse history | Not a thermal test; cooperative crate type is unknown |
| [S08](#s08) | [Lualhati & Del Carmen, portable evaporative crate, 2018](https://www.ukdr.uplb.edu.ph/journal-articles/5138/) | Screened non-powered alternative | Abstract only; full methods unavailable in the repository |
| [S09](#s09) | [Chaomuang et al., wet-fabric evaporative transport study, 2024](https://doi.org/10.1016/j.jafr.2024.101339) | Context-specific non-powered transport option | Thai chamber conditions and thermal surrogate; cooperative fit unknown |
| [S10](#s10) | [Full-scale citrus forced-air packaging study, 2018](https://doi.org/10.1016/j.biosystemseng.2018.02.003) | Package venting/wrapping and cooling heterogeneity | Citrus precooling facility; only abstract was accessed |
| [S11](#s11) | [Tong et al., road–rail PCM container, 2021](https://doi.org/10.1016/j.applthermaleng.2021.117204) | Charging and runtime requirements for PCM storage | Vehicle-scale road–rail; abstract only; no transfer of cost/runtime claims |

## S01 — USDA Handbook 66

[Open source](https://www.ars.usda.gov/is/np/CommercialStorage/CommercialStorage.pdf) · Revised February 2016.

**Locator:** “Precooling and Storage Facilities,” PDF pp.20–24. Initial-cooling methods, forced-air cooling, hydrocooling, and marine transport cooling. **Observed conditions:** Crop- and package-dependent; the text explicitly discusses exceptions. **Use:** separate field-heat removal from transport maintenance and ask whether initial condition or airflow is responsible. **Do not use:** to assign a storage/safety limit to the unknown produce.

## S02 — UF/IFAS transport handbook

[Open source](https://ask.ifas.ufl.edu/publication/HS1328) · Current HTML page accessed 2026-10-10; revision date is not displayed.

**Locator:** Preface; “Air Temperature vs. Product Temperature”; “Temperature Recording and Tracking”; “Type of Air Delivery System.” The page documents prior handbook lineage, explains faster air response and recommends exact position/time labels plus multiple positions. Placement/airflow depends on vehicle and load. The page includes commodity tables, none of which were used as targets.

## S03 — full-scale citrus monitoring

[Open source](https://research.wur.nl/en/publications/identifying-cooling-heterogeneity-during-precooling-and-refrigera/) · Food Control 165 (2024), 110672; DOI [10.1016/j.foodcont.2024.110672](https://doi.org/10.1016/j.foodcont.2024.110672).

**Locator:** Abstract and metadata, especially method, shipment scope and reported ventilation/precooling findings. One commercial citrus load had 108 sensors; 30 additional trips had trailer-rear sensors. **Use:** spatial measurement and airflow/initial-condition hypotheses. **Do not transfer:** the citrus target, long-haul performance or trailer details.

## S04 — PCM crate field test

[Open article](https://doi.org/10.3390/en16135191) · Version of record, Energies 16 (2023), 5191, CC BY; repository [PDF](https://ubibliorum.ubi.pt/server/api/core/bitstreams/c3835e14-2d0e-4a27-9c1e-fd2bd93ff81b/content).

**Locator:** Methods pp.3–8; Results pp.9–11; conclusions pp.11–12. Short Portuguese delivery route with insulated van, winter/reefer off, orange crates, one PCM vs empty-alveoli comparison, sensors in/near produce, five-minute readings, and unload spikes. Methods list 08:00–14:05 while the abstract says 8 h. **Important limit:** sensor readings represent air around produce within crates; no pulp or delivered-quality endpoint. PCM conditioning, autonomy and reuse remain questions.

## S05 — artificial fruit

[Open article record](https://doi.org/10.1016/j.jfoodeng.2017.07.012) · Journal of Food Engineering 215 (2017), pp.51–60.

**Locator:** Abstract and introductory description of the apple prototype and comparison with ten real apples. **Use:** product-matched artificial fruit as a repeatable pulp-response sensor. **Limit:** validate for selected produce and route before use.

## S06 — multi-drop herbs

[Open publisher record](https://revista.sangregorio.edu.ec/index.php/REVISTASANGREGORIO/article/view/1251) · Published 2020-04-04, Vol. 1, No. 37.

**Locator:** Abstract, experimental phases and publication metadata. **Use:** capture door-open duration, stop event, ambient conditions and product measurements together. **Limit:** the paper’s herbs, truck, and empty-body calculation are not predictive of this route.

## S07 — reusable crates

[Open FAO guide](https://www.fao.org/4/i0930e/i0930e00.htm) · RAP Publication 2009/08.

**Locator:** Abstract and publication metadata. **Use:** reconstruct ownership/pooling/repair/cleaning/reuse history if the cooperative uses reusable plastic crates. **Limit:** not a heat-transfer test and does not establish the local crate type.

## S08 — evaporative single-crate study

[Open repository record](https://www.ukdr.uplb.edu.ph/journal-articles/5138/) · Philippine Journal of Crop Science 43(2), 47–55 (August 2018).

**Locator:** Abstract and issue metadata. **Use:** screen as a possible non-powered concept only if ambient evaporative potential, crop, water and handling conditions match. **Limit:** the repository reports the full document unavailable; abstract lacks enough transfer conditions for a proposal beyond screening.


## S09 — wet-fabric evaporative transport study

[Open article](https://doi.org/10.1016/j.jafr.2024.101339) · Journal of Agriculture and Food Research 18 (December 2024), 101339.

**Locator:** Publisher abstract and study method. A full-scale Thai cargo chamber used a wet fabric blanket, axial fans and a load of hollow plastic balls as thermal surrogates; conditions were 29–30 °C and 70–73% RH, with inlet airflow 0.8–3.6 m/s, readings each minute over three hours, and a separate lettuce mass-loss comparison. Reported air cooling was about 3–4 °C. **Use:** screen only as a non-powered option if crop, climate, water, airflow and handling match. **Limit:** a single chamber context and surrogate load do not forecast route product-core temperature, quality or safety here.

## S10 — full-scale forced-air packaging study

Wu, Häller, Cronjé and Defraeye. [Open article record](https://doi.org/10.1016/j.biosystemseng.2018.02.003) · Biosystems Engineering 169 (May 2018), pp.115–125. [Accepted-manuscript metadata](https://www.empa.ch/documents/33059/0/Wu-2018-Full-scale_experiments_in_forced-air_precoolers-%28accepted_version%29.pdf/d4064f9d-f84f-4158-a12d-55819ff6f6ef).

**Locator:** ScienceDirect search-result abstract/conclusion (direct opening returned 403 on 2026-10-10). The work compared carton/wrapping and fruit size in a commercial 40-pallet forced-air precooler with Navel oranges, Nova mandarins and Eureka lemons. Cooling heterogeneity was mainly along the airflow direction; wrapping slowed cooling and increased heterogeneity; some package comparisons differed up to 42%. **Use:** investigate crate venting, wrap/liners and airflow. **Limit:** citrus precooling in a commercial system is not the cooperative’s insulated route.


## S11 — road–rail PCM container

Tong et al. [Open article record](https://doi.org/10.1016/j.applthermaleng.2021.117204) · Applied Thermal Engineering 195 (August 2021), article 117204.

**Locator:** Publisher abstract/highlights. Describes PCM cold-storage plates charged by a separate facility, four fresh fruit/vegetable types on integrated road–rail transport, monitored charge/discharge, and discharge time up to 94.6 hours. **Use:** note that passive storage still needs conditioning infrastructure and sufficient autonomy. **Limit:** abstract-only and vehicle-scale/long-haul; do not transfer the claimed runtime, cost, or energy results to a crate route.

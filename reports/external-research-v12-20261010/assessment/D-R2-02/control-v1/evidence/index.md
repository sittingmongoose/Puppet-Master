# Independent governing evidence — D-R2-02/control-v1

Navigation: [complete assessment](../assessment.md), [source map](../source-map.json), [original inspected hashes](../original-inspected-hashes.json). Candidate S IDs are cross-referenced, never silently rebound. E IDs describe the reviewer’s own primary retrievals and semantic checks.

Web requests expose no per-request UTC; verified enclosing clock window is 2026-10-10T07:24:47Z–07:30:40Z. Direct HTTP retrievals have exact timestamp logs. Capture hashes identify evidence bytes and do not prove semantic correctness.

<a id="e01"></a>
## E01 / S01

**Primary:** [Initial produce cooling and package-dependent forced-air heat removal](https://www.ars.usda.gov/is/np/CommercialStorage/CommercialStorage.pdf). **Version:** USDA-ARS Agriculture Handbook 66, revised February 2016.

**Locator:** PDF page index 20 (printed p.11), Initial Cooling Methods, lines 1013–1053; page index 22 (printed p.13), Forced-Air Cooling, lines 1060–1136. **Operation:** web open/find and surrounding primary PDF context.

**Exact subject/type/unit/condition:** Cooling operation; airflow/product diameter/package resistance; no case temperatures. Commodity and package determine suitability. Highway trailers are distinguished from refrigerated ships/containers. Water contact and water-resistant packages constrain hydrocooling. Room-cooling exceptions include citrus and CA-stored apples.

**Independent assessment:** Supports separating initial field-heat removal from transport and checking starting state/airflow before purchase. The final uses these qualitative mechanisms without importing crop setpoints.

**Limits/exceptions:** General 2016 reference; not a test of the cooperative or a universal cooling prescription.

**Final locators:** [final.md:24](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:24), [final.md:50](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:50).

**Saved evidence:** [web05-governing.txt](web05-governing.txt).

<a id="e02"></a>
## E02 / S02

**Primary:** [Cargo air, in-carton environment and product pulp; transport recorder placement](https://ask.ifas.ufl.edu/publication/HS1328). **Version:** HS1328 current HTML retrieved 2026-10-10; DOI 10.32473/EDIS-HS1328-2019; HTML metadata datePublished 2026-03-27, LAST_UPDATE 2026-10-02. Metadata is not a demonstrated scientific revision history..

**Locator:** Air Temperature vs. Product Temperature, lines 483–496; Temperature Recording and Tracking, lines 802–823; Preface. **Operation:** web open/find; independent HTTP 200 HTML retrieval.

**Exact subject/type/unit/condition:** Different temperature measurands; date/time and mapped recorder locations, not interchangeable channels. Air outside cartons changes faster than pulp or carton environment. Sensor range/accuracy/resolution/location matter. Wall placement can elevate readings; three recorder positions concern pallets in trailers/containers/railcars.

**Independent assessment:** Supports paired, synchronized, mapped channels and logger metadata. Final does not turn the three-position layout into a universal requirement for a small route.

**Limits/exceptions:** Guidance rather than case data. Candidate accurately says a visible revision date is not established; embedded metadata gives a more precise retrieval identity, not proof of a changed recommendation.

**Final locators:** [final.md:16](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:16), [final.md:60](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:60), [final.md:75](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:75).

**Saved evidence:** [web05-governing.txt](web05-governing.txt), [S02-independent.html](S02-independent.html), [S02-independent.txt](S02-independent.txt).

<a id="e03"></a>
## E03 / S03

**Primary:** [Air and fruit measurements in a commercial Greece–Switzerland citrus supply chain](https://research.wur.nl/en/publications/identifying-cooling-heterogeneity-during-precooling-and-refrigera/). **Version:** Food Control 165 (November 2024), 110672; DOI 10.1016/j.foodcont.2024.110672.

**Locator:** Official WUR author record, Abstract lines 26–29 and publication metadata lines 30–52. **Operation:** web open of official university publication record; surrounding complete abstract read.

**Exact subject/type/unit/condition:** 108 sensors in one shipment; rear air/fruit in 30 further shipments; 24 h precooling. Large refrigerated trailer and citrus; spatial variability; incomplete room precooling and middle-trailer reheating associated with insufficient pallet ventilation.

**Independent assessment:** The candidate accurately preserves the shipment scope, initial-cooling and ventilation findings, with no numeric benefit or crop target transferred.

**Limits/exceptions:** Abstract-level reviewer access; no case-specific causal estimate or quality/safety oracle.

**Final locators:** [final.md:25](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:25), [final.md:35](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:35).

**Saved evidence:** [web07-governing.txt](web07-governing.txt).

<a id="e04"></a>
## E04 / S04

**Primary:** [RT5HC PCM alveoli versus empty alveoli in orange crates; crate-area air stability](https://www.mdpi.com/1996-1073/16/13/5191). **Version:** Energies 16(13) (2023), 5191; DOI 10.3390/en16135191. Publisher notes distinguish 5 July 2023 version of record and 6 July updated PDF; independently retrieved publisher-hosted PDF..

**Locator:** PDF pp.1,3–11: sections 2.1–2.4, Tables 1–3, Results/Discussion/Conclusions; publisher version notes. **Operation:** Independent publisher-hosted PDF HTTP 200, pdftotext; full main text read. Candidate repository endpoint later timed out; its earlier web retrieval exposed the same publication..

**Exact subject/type/unit/condition:** PP crate 600×400×90 mm; 48 oranges/set; PCM 5–6 °C; SHT30 air sensor ±0.3 °C; five-minute collection/transmission; times 08:00–14:05. Winter insulated IVECO van, reefer off; crates held about 5 °C overnight, on floor near rear door/right wall; sunny 1–10 °C, six stops. Sensors sample surrounding air, not pulp. Four-reading moving average smooths peaks.

**Independent assessment:** Supports a bounded PCM pilot candidate and event logging. Final correctly does not import a quality benefit or product-core result and retains abstract 8 h versus methods 08:00–14:05 discrepancy.

**Limits/exceptions:** No measured delivered-quality endpoint. Conditioning state, thermal capacity/autonomy, route/crop/weather and reuse must be checked; fewer fluctuations are not quality or safety proof.

**Final locators:** [final.md:26](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:26), [final.md:52](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:52), [final.md:87](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:87).

**Saved evidence:** [S04a-independent.pdf](S04a-independent.pdf), [S04a-independent.txt](S04a-independent.txt), [direct-retrievals-2.json](direct-retrievals-2.json), [web08-governing.txt](web08-governing.txt).

<a id="e05"></a>
## E05 / S05

**Primary:** [Biomimetic artificial apple with shell/filling and integrated loggers](https://www.sciencedirect.com/science/article/abs/pii/S0260877417303035). **Version:** Journal of Food Engineering 215 (December 2017), pp.51–60; DOI 10.1016/j.jfoodeng.2017.07.012.

**Locator:** Publisher indexed Abstract and Introduction. **Operation:** Primary publisher search-rendered abstract read; direct article open HTTP 403.

**Exact subject/type/unit/condition:** Cooling-time comparison: artificial apple within 5% of ten real apples; water simulators differ up to 16%. Validation concerns an apple-like prototype during cooling; uniform geometry/sensor location enables repeatability. Air/surface temperatures react faster than fruit core.

**Independent assessment:** A useful unfamiliar measurement alternative; final requires crop/transition-specific validation rather than treating an apple simulator as an oracle for unknown produce.

**Limits/exceptions:** Reviewer did not access full article. Cooling validation is not heating validation for another commodity, quality or safety proof.

**Final locators:** [final.md:27](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:27), [final.md:66](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:66).

**Saved evidence:** [web03-governing.txt](web03-governing.txt).

<a id="e06"></a>
## E06 / S06

**Primary:** [Air heat/moisture exchange during multi-drop dill/parsley transport](https://revista.sangregorio.edu.ec/index.php/REVISTASANGREGORIO/article/view/1251). **Version:** Revista San Gregorio 1(37) (2020); record date 2020-04-04, PDF publication line 2020-04-03.

**Locator:** Publisher abstract; downloaded PDF printed pp.61–64, Abstract and Methods. **Operation:** Publisher indexed abstract plus independent publisher PDF HTTP 200; Abstract/Methods read.

**Exact subject/type/unit/condition:** 11 m³ truck body; air temperature/velocity/RH; empty-body heat calculation. Specific Gazelle body and herb study; transported herbs plus later storage; air/empty-body calculations differ from loaded produce-core measurements.

**Independent assessment:** Supports recording openings, stops and humidity/temperature together. Final imports no heat-gain or microbiological numeric result.

**Limits/exceptions:** Not a general food-safety or quality oracle; date and author-list metadata need care, without changing the bounded recommendation.

**Final locators:** [final.md:28](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:28), [final.md:58](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:58).

**Saved evidence:** [S06-independent.pdf](S06-independent.pdf), [S06-independent.txt](S06-independent.txt), [direct-retrievals.json](direct-retrievals.json), [web04-governing.txt](web04-governing.txt).

<a id="e07"></a>
## E07 / S07

**Primary:** [Reusable plastic-crate handling, cleaning, sanitization and returnable management](https://www.fao.org/4/i0930e/i0930e00.htm). **Version:** FAO RAP Publication 2009/08; ISBN 978-92-5-106312-5.

**Locator:** Official publication title/metadata lines 2–24; Abstract lines 37–40. **Operation:** web open of official FAO record and full abstract.

**Exact subject/type/unit/condition:** Management/handling guidance, no thermal performance quantity. RPC service providers and fresh produce handling chains; local crate construction/ownership/reuse cycle absent.

**Independent assessment:** Appropriate history lead; final does not claim the cooperative uses RPCs or that the guide proves thermal performance.

**Limits/exceptions:** Official abstract only; no local crate history or measured thermal benefit.

**Final locators:** [final.md:29](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:29), [final.md:39](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:39).

**Saved evidence:** [web02-governing.txt](web02-governing.txt).

<a id="e08"></a>
## E08 / S08

**Primary:** [Duck-cloth-wrapped single-crate evaporative cooler](https://www.ukdr.uplb.edu.ph/journal-articles/5138/). **Version:** Philippine Journal of Crop Science 43(2) (August 2018), pp.47–55; university record 5138.

**Locator:** Repository Abstract lines 25–29; issue metadata 30–68; availability line 70. **Operation:** web open of official university repository and full abstract.

**Exact subject/type/unit/condition:** 54×36×30 cm crate in source; lettuce/rambutan/bitter gourd/eggplant; no result transferred. Specific produce and setup; accessible record lacks full methods and governing weather/route details.

**Independent assessment:** The final retains a screening lead requiring crop/climate/water/handling fit. It does not adopt the abstract’s shelf-life/weight-loss numbers for the cooperative.

**Limits/exceptions:** Full document explicitly unavailable there; not a proven local intervention or safety/shelf-life claim.

**Final locators:** [final.md:29](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:29), [final.md:54](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:54), [final.md:111](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:111).

**Saved evidence:** [web02-governing.txt](web02-governing.txt).

<a id="e09"></a>
## E09 / S09

**Primary:** [Wet-fabric evaporative cooling in a simulated Thai transport chamber](https://www.sciencedirect.com/science/article/pii/S2666154324003764). **Version:** Journal of Agriculture and Food Research 18 (December 2024), 101339; DOI 10.1016/j.jafr.2024.101339.

**Locator:** Publisher indexed Abstract/Highlights; KMITL repository record a471f939-3068-4037-9c50-bd2e567310ff. **Operation:** Primary publisher search-rendered abstract and official university metadata read; direct publisher open HTTP 403.

**Exact subject/type/unit/condition:** 29–30 °C, 70–73% RH; 0.8–3.6 m/s inlet air; three-hour test, every-minute readings; hollow plastic balls as main load; separate lettuce mass loss. Fixed climate and simulated airflow; approximately 3–4 °C air reduction in source, not a produce-core field effect.

**Independent assessment:** The map and final correctly distinguish surrogate thermal load and separate lettuce endpoint, and keep evaporation conditional on local crop/climate/water/airflow.

**Limits/exceptions:** Abstract-level access; surrogate/model agreement cannot validate this cooperative or prove product-core or quality improvement.

**Final locators:** [final.md:29](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:29), [final.md:54](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:54).

**Saved evidence:** [web04-governing.txt](web04-governing.txt).

<a id="e10"></a>
## E10 / S10

**Primary:** [Commercial forced-air citrus precooling and fruit/carton/wrapping comparisons](https://www.sciencedirect.com/science/article/abs/pii/S1537511017306797). **Version:** Biosystems Engineering 169 (May 2018), pp.115–125; DOI 10.1016/j.biosystemseng.2018.02.003.

**Locator:** Publisher indexed Abstract/Highlights/Introduction; facility and conclusion section snippets. **Operation:** Primary publisher search-rendered abstract/context read; direct publisher and Empa accepted manuscript HTTP 403.

**Exact subject/type/unit/condition:** 40 pallets; three citrus types; 42% faster outflow cooling contrasts Nova/Opentop with similarly sized Eureka/Supervent. Both fruit species and carton differ; inflow/outflow and wrapping change cooling; similarity in fruit size does not isolate package alone.

**Independent assessment:** C03 is supported. Final accurately qualifies the cross-fruit/carton contrast and preserves useful airflow/wrapping findings without a local effect forecast.

**Limits/exceptions:** Full article not accessed. Carried S10 base description still uses broad package/fruit-size shorthand, but explicit final correction and recheck prevent consequential misapplication.

**Final locators:** [final.md:25](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:25), [final.md:196](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:196).

**Saved evidence:** [web04-governing.txt](web04-governing.txt), [direct-retrievals.json](direct-retrievals.json).

<a id="e11"></a>
## E11 / S11

**Primary:** [PCM storage plates in integrated road–rail container, separately charged](https://www.sciencedirect.com/science/article/pii/S1359431121006438). **Version:** Applied Thermal Engineering 195 (August 2021), 117204; DOI 10.1016/j.applthermaleng.2021.117204.

**Locator:** Publisher indexed Abstract/Introduction/Charging facility/Charging process. **Operation:** Primary publisher search-rendered complete abstract and surrounding introduction/section snippets read; direct open HTTP 403.

**Exact subject/type/unit/condition:** Reported discharge up to 94.6 h; 40-ft ISO container and ten plates/1260 kg PCM in introduction; separate electrically powered charging plant. Vehicle-scale real long-distance transport with four fresh produce kinds; passive container depends on upstream refrigeration/HTF charging.

**Independent assessment:** Supports counting conditioning energy/infrastructure and autonomy; final does not transfer runtime, cost or energy percentages to crate inserts.

**Limits/exceptions:** Full methods not accessed; crop identities and detailed route conditions unresolved at the candidate’s abstract level, so no local prediction is justified.

**Final locators:** [final.md:26](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:26), [final.md:52](ER12_RUNTIME/runs/D-R2-02/control/stages/reviser/final.md:52).

**Saved evidence:** [web09-governing.txt](web09-governing.txt).

## Exact evidence-file identities

| Saved path | SHA-256 | Bytes |
|---|---|---:|
| [S02-independent.html](S02-independent.html) | `2a1af33103f5f28dda7e9fe17e9f757e81c3b6850cdaa40d160567d663cc4cf7` | 1737259 |
| [S02-independent.txt](S02-independent.txt) | `dfd4f330728bb5ca0986f10099ad9b40b674730f013c3a45ebe4d57726fed2f5` | 374371 |
| [S04a-independent.pdf](S04a-independent.pdf) | `91b1b963f7b3249e33947b593c60c6c41095c2b5caf835b647309c55fa2c2d9b` | 981828 |
| [S04a-independent.txt](S04a-independent.txt) | `20dd103db5de07c209278de5b199524778ab2d3b398693e59c55461f54fa14ff` | 53575 |
| [S06-independent.pdf](S06-independent.pdf) | `8f0b62506a7a0ad699b87bc3fc98cec5211712edfbafcf7fdb5dd80ebe9ea37a` | 1323651 |
| [S06-independent.txt](S06-independent.txt) | `9233b0beafe26cec9df1da216630a75b998586e65b2fce55071cb88135120ab9` | 48240 |
| [direct-retrievals-2.json](direct-retrievals-2.json) | `434073feee48c66aa1742b6ab4deb5fcf430559caf0b6db96624b55735d5fa0f` | 1173 |
| [direct-retrievals.json](direct-retrievals.json) | `2bbfedf380bfcb6a8da802ee2d9c25424ddfff6ba6b035a193afb5157fc020fe` | 2662 |
| [web01-governing.txt](web01-governing.txt) | `a0d76d749947263311846e79899563e927bfd4c1b59258a06b6ab3b6d8a25f75` | 31170 |
| [web01.txt](web01.txt) | `9dd2db501346814683d298024ae4592bfa06dc4263a5c0002df929157e336db6` | 31401 |
| [web02-governing.txt](web02-governing.txt) | `fb8e187b0b3e76e3d8fad95842081d6df05c1182345dde3bcc4702f94f61dcdc` | 28223 |
| [web02.txt](web02.txt) | `09c583a3baef0374f523aaa43fe7206e8a6a0a09f9f6a5bfdbb2de35b3ea0f2a` | 30107 |
| [web03-governing.txt](web03-governing.txt) | `03444bbccaf7bcebc42908f5fdbadeafa36737a9c69a6853ece7c925e1625092` | 25771 |
| [web03.txt](web03.txt) | `fdf16e6603d8e34f1a477ef397e0c10743e62178be5760f9ca9c8d1333532275` | 36399 |
| [web04-governing.txt](web04-governing.txt) | `623cf87e5a65abab730fc8e3318b397b51f2edf8672d3052724028bcf2dc278e` | 26030 |
| [web04.txt](web04.txt) | `329fbd185c0cfbc3a32e52738ca60266807445db00bb6f34d8d12b2fdd83fb65` | 36015 |
| [web05-governing.txt](web05-governing.txt) | `49aa0f540ec1696fdb11a05f192f67ffd31051d1136945ad51b367b9df870252` | 31416 |
| [web05.txt](web05.txt) | `82b880363d75e306c808ffff04132c5242dbc84d7df826c084b125db935f3a93` | 31404 |
| [web06-governing.txt](web06-governing.txt) | `c5ccd1a6054ebacfd02244a2fb1178395353c1059f201f801a192a0f1533ae38` | 2917 |
| [web06.txt](web06.txt) | `6c83b8b7bcb3ee4f24f582637c261aae308d1b51728bf76ef8dc09a56e65dd55` | 29066 |
| [web07-governing.txt](web07-governing.txt) | `122ea886e42c2924de79b60ddf52968ff5d2248ada7e9faaeb0ddde69a7f1315` | 15082 |
| [web07.txt](web07.txt) | `567e3ac7385cccafaeccbabf12adeb7fec3bab962e9517c60020d391490fea8b` | 16039 |
| [web08-governing.txt](web08-governing.txt) | `3a6ffff861f672b62663545aeb78352cea27b44b800056dde76f3ddd09cf5764` | 24121 |
| [web08.txt](web08.txt) | `76f1975f30dc5bea57ede9ea00b61b60bb1a745e82258a5c61d67f616fde1cfd` | 34403 |
| [web09-governing.txt](web09-governing.txt) | `221b61f88493ba76d2577ed79140848159839641626b4851fbad7aa56bdb2a06` | 22468 |
| [web09.txt](web09.txt) | `1a60fbe055d1034030a6953e04f824c13dd07889446196e155b5311dc6f32546` | 38670 |

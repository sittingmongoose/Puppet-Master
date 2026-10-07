{
  "schema": "pm.m14.semantic-findings.v1",
  "case_id": "D-M14-A",
  "stage": "treatment/semantic_findings-v2",
  "findings": [
    {
      "id": "decision_policy",
      "summary": "Use nearest by default when the output should retain one sampled class label; enable mode only when each target cell means its dominant valid class. Derive validity and area separately.",
      "disposition": "Accepted as a product-conditioned policy.",
      "evidence": "The Rasterio guide says there is no universally correct resampler; the 1.3.10 enum defines nearest-neighbor and mode as most-frequent-value resampling.",
      "conditions": "For categorical IDs on a declared target grid, do not use interpolating reducers. Mode requires invalid contributors excluded and explicit tie, coverage, and empty-cell rules. Under nearest, an invalid selected source sample yields invalid unless a fallback is specified. Keep validity and area logic identical across branches.",
      "options": [],
      "optional_leads": [],
      "validation": "Proposed only: hand-calculate a footprint for each branch and verify every emitted ID is an input class label.",
      "uncertainty": "Sources do not choose product semantics, ties, coverage, or fallback.",
      "sources": [
        {
          "source_id": "rasterresample",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst",
          "kind": "public primary raw bytes",
          "locator": "Up and downsampling; Resampling Methods"
        },
        {
          "source_id": "rasterio_enums",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py",
          "version_or_capture": "Rasterio v1.3.10 released source",
          "capture_date_utc": "2026-10-07",
          "sha256": "4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M14-A/treatment/semantic_findings-v2/sources/rasterio_enums.py",
          "kind": "public primary released source file",
          "locator": "Resampling class docstring (nearest, average, mode and availability); Resampling enum values"
        }
      ]
    },
    {
      "id": "bounded_alternatives",
      "summary": "Compare both reducers on the same target grid and validity set: nearest samples one label; mode chooses the most frequent valid label.",
      "disposition": "Nearest is the default branch; mode is an explicit product option.",
      "evidence": "The released enum defines nearest as nearest-neighbor and mode as selecting the value occurring most often among sampled points.",
      "conditions": "A — nearest: use when sampled-label identity matters; small or rare classes may be missed. Define what happens when the selected sample is invalid. B — mode: use only for dominant-class meaning; exclude invalid contributors and define ties, minimum valid coverage, and empty cells. Both branches use identical mask semantics and target geometry.",
      "options": [
        "A — nearest source label: preserves one sampled ID, not class composition.",
        "B — mode over valid contributors: summarizes a footprint but can remove minority IDs."
      ],
      "optional_leads": [],
      "validation": "Proposed only: hand-check a rare class, a tie, and an invalid nearest sample; assert invalid values never contribute to mode.",
      "uncertainty": "The enum does not specify ties, external-mask propagation, coverage thresholds, or invalid-sample fallback; verify the chosen Rasterio/GDAL read or warp path.",
      "sources": [
        {
          "source_id": "rasterresample",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst",
          "kind": "public primary raw bytes",
          "locator": "Up and downsampling; Resampling Methods"
        },
        {
          "source_id": "rasterio_enums",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py",
          "version_or_capture": "Rasterio v1.3.10 released source",
          "capture_date_utc": "2026-10-07",
          "sha256": "4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M14-A/treatment/semantic_findings-v2/sources/rasterio_enums.py",
          "kind": "public primary released source file",
          "locator": "Resampling class docstring (nearest, average, mode and availability); Resampling enum values"
        },
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "kind": "public primary raw bytes",
          "locator": "Reading dataset masks; Writing masks; Numpy masked arrays; Dataset masks; Nodata representations in raster files"
        }
      ]
    },
    {
      "id": "validity_semantics",
      "summary": "Treat masks as validity, not class values. Use the class band mask for per-band validity; use dataset_mask only for an intended dataset-wide rule. Do not rely on nodata equality alone.",
      "disposition": "Accepted with an explicit mask-scope choice.",
      "evidence": "read_masks uses GDAL sense (zero invalid, nonzero valid); a NumPy masked-array mask is inverse. An existing .msk, dataset alpha, or internal mask takes precedence for dataset_mask; its nodata fallback ORs band masks. A .msk may override nodata, and a nodata value may also occur in valid data.",
      "conditions": "For a band-specific class, use read_masks(class_band) != 0. Choose dataset_mask only when dataset-wide validity is intended; its fallback OR is not “all bands valid.” Align and explicitly combine separate ancillary masks. Preserve the inversion when using masked=True.",
      "options": [
        "Band mask for class-band validity; dataset mask for an intentionally shared dataset-wide rule."
      ],
      "optional_leads": [],
      "validation": "Proposed only: test a valid zero class, invalid non-nodata value, nodata collision, .msk precedence, and disagreeing band masks against both mask senses.",
      "uncertainty": "The docs do not choose alignment or combination rules for a separate ancillary mask.",
      "sources": [
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "kind": "public primary raw bytes",
          "locator": "Reading dataset masks; Writing masks; Numpy masked arrays; Dataset masks; Nodata representations in raster files"
        }
      ]
    },
    {
      "id": "valid_area",
      "summary": "Count or weight valid contributors for each footprint separately from its class label. Convert counts to physical area only with a declared CRS and cell-area model.",
      "disposition": "Accepted, conditional on grid geometry and area units.",
      "evidence": "GDAL maps pixels with six affine coefficients. From that mapping, planar pixel area is abs(GT(1)*GT(5) - GT(2)*GT(4)) in squared map units. Rasterio supports block windows, but window reads may fetch whole blocks and band block shapes need not match.",
      "conditions": "On equal-area projected cells, multiply valid count by affine pixel area and convert map units. In geographic coordinates or where physical cell area varies, use per-cell area weights or an equal-area grid; degrees-squared is not physical area. For target-footprint coverage, aggregate valid contributors/fraction, not the single nearest/mode class output.",
      "options": [
        "Native-grid count/area preserves source detail; target-grid valid fraction summarizes each footprint and needs a partial-cell rule."
      ],
      "optional_leads": [],
      "validation": "Proposed only: compare north-up and rotated/sheared determinants with hand calculations; check windowed totals against whole-grid totals, alignment, and unit conversion.",
      "uncertainty": "The determinant is derived from the affine equations; the tutorial does not prescribe physical-area handling for geographic CRS or choose a reporting CRS.",
      "sources": [
        {
          "source_id": "geotransform",
          "url": "https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst",
          "version_or_capture": "GDAL 3.9.0",
          "capture_date_utc": "2026-10-07",
          "sha256": "5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/geotransform.rst",
          "kind": "public primary raw bytes",
          "locator": "Geotransform coefficients; Transformation from image coordinate space to georeferenced coordinate space"
        },
        {
          "source_id": "rasterwindow",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterwindow.rst",
          "kind": "public primary raw bytes",
          "locator": "Windowed reading and writing; Blocks"
        }
      ]
    },
    {
      "id": "continuous_band_lead",
      "summary": "Keep average resampling as an optional lead for continuous bands with a meaningful footprint mean; never use it for class IDs.",
      "disposition": "Optional lead only; not the class-ID recommendation.",
      "evidence": "Rasterio 1.3.10 defines average as a weighted average of non-nodata contributors; its guide says average may retain some numerical properties and nearest may not suit continuous data.",
      "conditions": "Use only for a continuous measurement. Define the valid-contributor denominator and partial-coverage meaning, and test external-mask behavior for the chosen read/warp path.",
      "options": [],
      "optional_leads": [
        "A later shared module could expose average for aligned continuous bands and report valid coverage."
      ],
      "validation": "Proposed only: compare a continuous fixture with a hand-computed weighted mean, nodata, and partial coverage.",
      "uncertainty": "Sources do not establish external .msk propagation through every resampling entry point or whether a mean is the intended statistic.",
      "sources": [
        {
          "source_id": "rasterresample",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst",
          "kind": "public primary raw bytes",
          "locator": "Up and downsampling; Resampling Methods"
        },
        {
          "source_id": "rasterio_enums",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py",
          "version_or_capture": "Rasterio v1.3.10 released source",
          "capture_date_utc": "2026-10-07",
          "sha256": "4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M14-A/treatment/semantic_findings-v2/sources/rasterio_enums.py",
          "kind": "public primary released source file",
          "locator": "Resampling class docstring (nearest, average, mode and availability); Resampling enum values"
        },
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "kind": "public primary raw bytes",
          "locator": "Reading dataset masks; Writing masks; Numpy masked arrays; Dataset masks; Nodata representations in raster files"
        }
      ]
    },
    {
      "id": "validation_and_open_choices",
      "summary": "Validate mask interpretation, reducer semantics, area arithmetic, and chunk equivalence before adoption. Keep unresolved product choices explicit.",
      "disposition": "Validation is proposed; none of these checks ran in this research stage.",
      "evidence": "The captures establish mask polarity and precedence, available reducers, block-window behavior, and affine coordinates. They do not define product class meaning, target grid, area CRS, or edge-case policy.",
      "conditions": "Proposed fixtures: a rare class and tie; zero used as both possible class and nodata; .msk overriding nodata; disagreeing band masks; all-invalid and partial footprints; rotated affine; and whole-grid versus block-window reads. Assert documented mask polarity, label-only outputs, declared invalid-contributor handling, reconciled valid counts/fractions, and correct area units.",
      "options": [
        "Open: sampled-label or majority-class semantics; nearest-invalid fallback; tie rule; minimum valid coverage; no-valid encoding; per-band versus dataset mask; target grid/alignment; area CRS/units."
      ],
      "optional_leads": [],
      "validation": "All checks remain proposals. No Rasterio pipeline or fixture was executed. SHA-256 was computed for the four frozen inputs and the one captured released source file.",
      "uncertainty": "No runtime behavior, performance, production dataset, or geodesic-area result was measured. Chunk cost depends on storage block layout.",
      "sources": [
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "kind": "public primary raw bytes",
          "locator": "Reading dataset masks; Writing masks; Numpy masked arrays; Dataset masks; Nodata representations in raster files"
        },
        {
          "source_id": "rasterresample",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst",
          "kind": "public primary raw bytes",
          "locator": "Up and downsampling; Resampling Methods"
        },
        {
          "source_id": "rasterwindow",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterwindow.rst",
          "kind": "public primary raw bytes",
          "locator": "Windowed reading and writing; Blocks"
        },
        {
          "source_id": "geotransform",
          "url": "https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst",
          "version_or_capture": "GDAL 3.9.0",
          "capture_date_utc": "2026-10-07",
          "sha256": "5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/geotransform.rst",
          "kind": "public primary raw bytes",
          "locator": "Geotransform coefficients; Transformation from image coordinate space to georeferenced coordinate space"
        },
        {
          "source_id": "rasterio_enums",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py",
          "version_or_capture": "Rasterio v1.3.10 released source",
          "capture_date_utc": "2026-10-07",
          "sha256": "4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M14-A/treatment/semantic_findings-v2/sources/rasterio_enums.py",
          "kind": "public primary released source file",
          "locator": "Resampling class docstring (nearest, average, mode and availability); Resampling enum values"
        }
      ]
    }
  ]
}

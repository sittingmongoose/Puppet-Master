{
  "schema": "pm.er10.candidate-findings.v1",
  "case_id": "D-M14-A",
  "candidate": "bounded Rasterio 1.3.10 decision module recommendation",
  "findings": [
    {
      "id": "class_downsample_decision",
      "summary": "Use valid-sample majority when an output cell should represent the dominant class; use nearest when it should copy one representative source sample. Never interpolate class codes numerically.",
      "disposition": "Conditional recommendation: majority for area-oriented products; nearest for sample-preserving or compatibility products.",
      "evidence": [
        "Rasterio says no resampling method is universally correct. Its 1.3.10 enum defines mode as the most frequent sampled value. The categorical policy here is a product recommendation, not a source guarantee."
      ],
      "conditions": [
        "Assumes categorical labels and defined target footprints; specify contributors and weights for reprojection or unequal footprints.",
        "Count only valid labels. Define ties, minimum valid coverage, and empty output. If built-in mode does not meet the mask/tie policy, use explicit counts.",
        "Nearest copies one sample; grid alignment can omit small classes."
      ],
      "options": {
        "majority": "Dominant valid label per footprint; needs tie, coverage, and empty-cell rules.",
        "nearest": "One source label and its validity; simple, but not a footprint summary.",
        "selection": "Choose by intended output meaning; neither method is universal."
      },
      "optional_leads": [],
      "validation": [
        "Proposed: test unequal and tied counts, a small class, partial validity, and an empty footprint; outputs must be source labels or declared invalid."
      ],
      "uncertainty": [
        "Sources do not specify mode tie-breaking or its mask propagation for this policy; test the pinned runtime or use an explicit reducer."
      ],
      "sources": [
        {
          "source_id": "rasterresample",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst",
          "version": "Rasterio 1.3.10",
          "sha256": "2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727",
          "capture_path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst",
          "locator": "Resampling Methods, lines 38–59",
          "limitation": "No categorical policy, tie rule, or mask rule."
        },
        {
          "source_id": "rasterio-enums-1.3.10",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py",
          "version": "Rasterio 1.3.10 release source",
          "sha256": "4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b",
          "capture_path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M14-A/treatment/semantic_render_preserve_final-v3/sources/rasterio-1.3.10-enums.py",
          "locator": "Resampling docstring and enum, lines 48–107",
          "limitation": "No tie or module-specific validity semantics."
        }
      ]
    },
    {
      "id": "effective_validity_policy",
      "summary": "Keep validity separate from class values: per-band, dataset-wide, and separate external masks are not interchangeable.",
      "disposition": "Start with selected-band validity; document whether a separate mask restricts or replaces it.",
      "evidence": [
        "Rasterio uses nonzero GDAL mask bytes for valid and NumPy masked-array True for invalid. A .msk can supersede nodata. dataset_mask may use the OR of band masks when nodata is its fallback."
      ],
      "conditions": [
        "Use read_masks(class_band) != 0, or invert read(masked=True).mask. Do not assume dataset_mask means selected-band validity.",
        "Distinguish a Rasterio .msk sidecar from a separate AOI/quality mask. Align a separate mask and combine by AND only if it is a restriction; otherwise specify replacement semantics.",
        "If a valid class collides with nodata, including zero in an 8-bit raster, metadata alone cannot recover intent. Require an authoritative mask or resolve the input contract."
      ],
      "options": {
        "band": "Selected-band read_masks validity.",
        "dataset": "dataset_mask only when its dataset-wide precedence/OR meaning is intended.",
        "external": "Declare replace-versus-restrict behavior and check grid alignment."
      },
      "optional_leads": [],
      "validation": [
        "Proposed: fixture nodata, valid zero, .msk precedence, different band masks, and a separate inclusion mask; assert polarity and selected policy."
      ],
      "uncertainty": [
        "The brief does not define whether external masks are authoritative, AOI, or quality masks."
      ],
      "sources": [
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version": "Rasterio 1.3.10",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "capture_path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "locator": "Polarity/read_masks 7–9, 46–69; zero ambiguity 30–43; .msk 121–124; dataset_mask 219–235",
          "limitation": "Does not decide the meaning of a separate application mask."
        }
      ]
    },
    {
      "id": "valid_area_summary",
      "summary": "Count valid cells from the declared mask on the source grid; convert counts to area only under an explicit CRS and units policy.",
      "disposition": "Keep valid-pixel count as the auditable base; report physical area only with a suitable, agreed method.",
      "evidence": [
        "GDAL defines the affine transform coefficients. Their pixel and line basis vectors imply coordinate-plane cell area abs(GT1*GT5 - GT2*GT4); this determinant is a mathematical derivation, not an area formula stated by the source."
      ],
      "conditions": [
        "valid_count = count(mask != 0). For a constant affine grid, multiply by abs(GT1*GT5 - GT2*GT4); north-up simplifies to abs(GT1*GT5).",
        "The result is squared coordinate units. Do not label geographic degrees-squared as ground area; require an agreed equal-area/geodesic method or report counts.",
        "State whether the summary describes source coverage, valid output cells, or fractional coverage; they differ."
      ],
      "options": {
        "base": "Report count and declared mask policy.",
        "area": "Convert only with agreed coordinate-area semantics; otherwise omit or use an approved physical-area method."
      },
      "optional_leads": [],
      "validation": [
        "Proposed: check full/empty masks and hand-computed north-up and rotated/sheared determinants; verify CRS units separately."
      ],
      "uncertainty": [
        "The brief leaves source-versus-output coverage, physical area, CRS, and units open."
      ],
      "sources": [
        {
          "source_id": "geotransform",
          "url": "https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst",
          "version": "GDAL 3.9.0",
          "sha256": "5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc",
          "capture_path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/geotransform.rst",
          "locator": "Affine coefficients/equations, lines 10–37",
          "limitation": "Defines coordinate transforms, not physical-area semantics."
        },
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version": "Rasterio 1.3.10",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "capture_path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "locator": "Valid-mask convention, lines 7–9",
          "limitation": "Does not set area units or the authoritative mask."
        }
      ]
    },
    {
      "id": "bounded_window_processing",
      "summary": "Use windowed or block-window processing when needed, while accounting for storage-block reads and checking band layouts.",
      "disposition": "Conditional for large inputs: windows bound arrays, not necessarily I/O.",
      "evidence": [
        "Rasterio says windows enable work beyond RAM, but small reads can load whole blocks, unchunked files may be read in full, and bands may have different block shapes."
      ],
      "conditions": [
        "Keep class and mask windows aligned; check block_shapes rather than assuming bands match.",
        "Use whole-array processing only within a known memory budget; align large-input windows to storage blocks where practical."
      ],
      "options": {
        "windowed": "Bound arrays; inspect block layout and budget I/O.",
        "whole_array": "Simpler only when memory is adequate."
      },
      "optional_leads": [],
      "validation": [
        "Proposed: compare whole-array and windowed output across a block boundary and differing band block shapes."
      ],
      "uncertainty": [
        "Actual I/O depends on dataset tiling; the source gives no fixed per-window bound."
      ],
      "sources": [
        {
          "source_id": "rasterwindow",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst",
          "version": "Rasterio 1.3.10",
          "sha256": "4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1",
          "capture_path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterwindow.rst",
          "locator": "Windows/read caveat 9–16, 72–84; block behavior 190–251",
          "limitation": "Describes I/O tools, not reducer correctness."
        }
      ]
    },
    {
      "id": "validation_and_product_choices",
      "summary": "Resolve mask meaning, tie/coverage rules, target-grid semantics, and area units before release; validate each explicitly.",
      "disposition": "Proposed checks only; no raster processing or product tests were executed.",
      "evidence": [
        "The brief and sources leave mask roles, majority-versus-sample meaning, ties, partial coverage, and area interpretation to the product."
      ],
      "conditions": [
        "Select the mask source and combine rule; class-band or dataset validity; tie and minimum-coverage policy; empty-cell result; target grid/reprojection behavior; and count or area units.",
        "The following are release proposals, not passing results."
      ],
      "options": {
        "masks": "Check nodata, valid zero, .msk precedence, differing band masks, and separate AOI/quality masks.",
        "classes": "Check dominant/tied counts, minority class, partial validity, empty footprint, and both alternatives.",
        "area_and_io": "Check counts, affine determinants/CRS units, window boundaries, and differing band blocks."
      },
      "optional_leads": [],
      "validation": [
        "Acceptance proposals: masks follow declared polarity/precedence; outputs are original labels or declared invalid; rules are deterministic; fixture counts/area match; windowing preserves results."
      ],
      "uncertainty": [
        "No threshold, tie rule, mask meaning, grid, or area unit is selected by the brief; leave these as product choices."
      ],
      "sources": [
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version": "Rasterio 1.3.10",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "capture_path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "locator": "Polarity 7–9; nodata ambiguity 30–43; dataset_mask 219–235",
          "limitation": "Does not settle application input semantics."
        },
        {
          "source_id": "rasterresample",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst",
          "version": "Rasterio 1.3.10",
          "sha256": "2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727",
          "capture_path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst",
          "locator": "Resampling Methods, lines 38–59",
          "limitation": "Does not choose product semantics."
        }
      ]
    },
    {
      "id": "optional_continuous_band",
      "summary": "Optional separate lead: trial average for a continuous band's footprint mean; use bilinear or cubic only for an intended interpolated surface, never class IDs.",
      "disposition": "Optional, unselected, and separate from the class-ID default.",
      "evidence": [
        "Rasterio says nearest may not suit continuous data, bilinear/cubic may be better, and average may retain selected numerical properties; its enum defines average as a weighted average of non-nodata contributors."
      ],
      "conditions": [
        "Use only for a genuinely continuous band after its target statistic is chosen; preserve that band's own validity policy. Matching average to a footprint mean is an inference requiring validation."
      ],
      "options": {
        "mean": "Trial average for a footprint-mean objective.",
        "surface": "Trial bilinear or cubic for an interpolated-surface objective."
      },
      "optional_leads": [
        "A companion continuous band may warrant its own resampling path and fixture; no such band is specified here."
      ],
      "validation": [
        "Proposed, not executed: compare average and bilinear on a nodata-boundary surface against the chosen metric."
      ],
      "uncertainty": [
        "The brief names no continuous band or statistic; sources do not select a product method."
      ],
      "sources": [
        {
          "source_id": "rasterresample",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst",
          "version": "Rasterio 1.3.10",
          "sha256": "2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727",
          "capture_path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst",
          "locator": "Resampling Methods, lines 38–59",
          "limitation": "No product-specific measurement objective."
        },
        {
          "source_id": "rasterio-enums-1.3.10",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py",
          "version": "Rasterio 1.3.10 release source",
          "sha256": "4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b",
          "capture_path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M14-A/treatment/semantic_render_preserve_final-v3/sources/rasterio-1.3.10-enums.py",
          "locator": "Resampling enum, lines 48–66",
          "limitation": "Does not determine the desired companion-band statistic."
        }
      ]
    }
  ]
}

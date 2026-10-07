{
  "findings": [
    {
      "id": "class-downsampling-choice",
      "summary": "Keep class IDs categorical and coverage separate; select dominant-class aggregation or nearest sampling by product meaning.",
      "disposition": "Conditional recommendation: custom valid-only per-cell frequency/mode for dominant-area labels; nearest for a sampled source label.",
      "evidence": "Rasterio says downsampling changes values and no method is universally correct. Averaging nominal IDs can invent a class (semantic inference); the docs do not establish a versioned mode API or tie rule.",
      "conditions": [
        "Nearest preserves an input ID at the sampled location, but is alignment-sensitive and may omit rare classes.",
        "A custom frequency reducer selects among valid labels in each target footprint; declare tie handling, no-valid output, and minimum coverage.",
        "Do not interpolate class IDs or use either class method to estimate valid area."
      ],
      "options": [
        {
          "id": "nearest",
          "tradeoff": "Simpler sampled label; not class prevalence."
        },
        {
          "id": "valid-frequency",
          "tradeoff": "Dominant label; requires footprint counts/weights and tie policy."
        }
      ],
      "optional_leads": [],
      "validation": [
        "Proposed, not executed: use mixed-label and tied-cell fixtures; assert outputs are input IDs and ties follow policy.",
        "Proposed, not executed: shift target alignment and record nearest versus frequency behavior."
      ],
      "uncertainty": "Choose whether output means sampled location or dominant area; also choose legend, tie policy, grid, and coverage threshold.",
      "sources": [
        {
          "source_id": "rasterresample",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst",
          "locator": "Up and downsampling; Resampling Methods"
        },
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "locator": "Nodata Masks; Reading dataset masks; Writing masks; Dataset masks; Nodata representations"
        }
      ]
    },
    {
      "id": "validity-mask-policy",
      "summary": "Use resolved masks as validity input and preserve their polarity; define whether class validity is per-band or combined.",
      "disposition": "Adopt mask-first processing, conditional on the declared class band and multi-input policy.",
      "evidence": "read_masks uses 0 invalid/nonzero (typically 255) valid; NumPy masked arrays invert this sense. A .msk, dataset alpha, or internal mask can outrank nodata. With nodata alone, dataset_mask ORs band masks, which may not mean all inputs are valid.",
      "conditions": [
        "Use the selected class band's mask or an explicit combination of required-band masks; do not silently use dataset_mask OR for an all-input rule.",
        "Keep value and validity distinct: a mask may mark a nodata-valued pixel valid. Convert GDAL/NumPy polarity only explicitly.",
        "Without an overriding mask, honor nodata-derived validity; do not infer validity from raw sentinel comparisons alone."
      ],
      "options": [
        {
          "id": "class-band",
          "tradeoff": "Use when the class band alone controls eligibility."
        },
        {
          "id": "required-inputs",
          "tradeoff": "Use declared all/any rule when classes depend on other bands."
        }
      ],
      "optional_leads": [],
      "validation": [
        "Proposed, not executed: nodata=0 fixture with .msk-marked valid zero labels; verify precedence.",
        "Proposed, not executed: differing band masks; verify read_masks, dataset_mask, and chosen combination."
      ],
      "uncertainty": "Docs do not choose which bands define valid classes or guarantee sidecar packaging in deployment.",
      "sources": [
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "locator": "Nodata Masks; Reading dataset masks; Writing masks; Dataset masks; Nodata representations"
        }
      ]
    },
    {
      "id": "valid-area-definition",
      "summary": "Report valid fraction and valid physical area separately from the class label.",
      "disposition": "Use area-weighted coverage for partial overlaps or varying ground area; use counts only under explicit aligned-grid assumptions.",
      "evidence": "Masks distinguish validity from values; GDAL defines affine pixel-to-coordinate mapping. Affine map-plane area can be derived mathematically, but the supplied tutorial does not prescribe ground-area calculation.",
      "conditions": [
        "For aligned integer-factor grids in a suitable equal-area projected CRS with uniform cells, valid count/full footprint count gives a fraction; multiply by target-cell area only if that is the chosen denominator.",
        "For arbitrary overlap or varying ground area, weight valid source intersections. Declare whether the denominator is the full target footprint or only source-covered area.",
        "A determinant abs(GT1*GT5-GT2*GT4) is map-coordinate area, not automatically physical ground area; use a suitable equal-area or geodesic method."
      ],
      "options": [
        {
          "id": "uniform-count",
          "tradeoff": "Simple for aligned uniform cells; weak for partial/varying area."
        },
        {
          "id": "intersection-area",
          "tradeoff": "Handles overlap/area variation; requires CRS and area model."
        }
      ],
      "optional_leads": [],
      "validation": [
        "Proposed, not executed: all/none/half-valid and partial-edge fixtures; check fractions, denominator, units, and conservation tolerance."
      ],
      "uncertainty": "CRS, area model, edge denominator, threshold, and tolerance are unspecified.",
      "sources": [
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "locator": "Nodata Masks; Reading dataset masks; Writing masks; Dataset masks; Nodata representations"
        },
        {
          "source_id": "geotransform",
          "url": "https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst",
          "version_or_capture": "GDAL 3.9.0",
          "capture_date_utc": "2026-10-07",
          "sha256": "5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/geotransform.rst",
          "locator": "Introduction; Transformation from image coordinate space"
        }
      ]
    },
    {
      "id": "windowed-execution",
      "summary": "Allow windowed/block-wise execution for large rasters without changing grid or reducer semantics.",
      "disposition": "Conditional memory strategy, not a different validity or class policy.",
      "evidence": "Rasterio supports windowed reads and block iteration; reads may fetch whole chunks, block-aligned windows are efficient, and unchunked sources may require full reads. Resizing requires a corresponding transform.",
      "conditions": [
        "Define one global target grid; preserve weights and denominators across seams and partial windows.",
        "Use each window's transform and verify band block layouts before sharing windows; windowing does not guarantee bounded I/O."
      ],
      "options": [
        {
          "id": "whole-array",
          "tradeoff": "Simple for small inputs; memory scales with raster."
        },
        {
          "id": "windowed-blocks",
          "tradeoff": "Useful for large blocked inputs; more bookkeeping and layout-dependent I/O."
        }
      ],
      "optional_leads": [],
      "validation": [
        "Proposed, not executed: compare whole-array/windowed results across a class boundary and partial final window."
      ],
      "uncertainty": "No benchmark or runtime equivalence test is supplied.",
      "sources": [
        {
          "source_id": "rasterwindow",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterwindow.rst",
          "locator": "Windows; Reading; Window transforms; Blocks"
        },
        {
          "source_id": "geotransform",
          "url": "https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst",
          "version_or_capture": "GDAL 3.9.0",
          "capture_date_utc": "2026-10-07",
          "sha256": "5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/geotransform.rst",
          "locator": "Introduction; Transformation from image coordinate space"
        }
      ]
    },
    {
      "id": "continuous-band-opportunity",
      "summary": "Retain a separate optional continuous-band path; do not reuse class-ID resampling.",
      "disposition": "Optional lead only; no continuous band is specified by the brief.",
      "evidence": "Rasterio notes nearest may not suit continuous data; bilinear/cubic may be better and average can retain some numeric properties.",
      "conditions": [
        "Choose per continuous-band meaning and downstream use, with validity handled separately.",
        "Do not apply bilinear, cubic, or average to nominal class IDs."
      ],
      "options": [
        {
          "id": "separate-experiment",
          "tradeoff": "Test suitable numeric methods without changing categorical semantics."
        }
      ],
      "optional_leads": [
        "Compare average and bilinear on one representative continuous band; inspect bias, edges, and mask behavior."
      ],
      "validation": [
        "Proposed, not executed: evaluate a continuous fixture against its application-specific invariant."
      ],
      "uncertainty": "No band, units, measurement scale, or numeric invariant is specified.",
      "sources": [
        {
          "source_id": "rasterresample",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst",
          "locator": "Up and downsampling; Resampling Methods"
        },
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "locator": "Nodata Masks; Reading dataset masks; Writing masks; Dataset masks; Nodata representations"
        }
      ]
    },
    {
      "id": "open-choices-and-validation",
      "summary": "Resolve interface choices before release; this stage proposes checks but executed none.",
      "disposition": "Unresolved product decisions, not source-established defaults.",
      "evidence": "The frozen sources do not specify this product's legend, multi-band validity rule, tie handling, coverage threshold, area denominator, or tolerances. The mask guide's sieve example uses an empirically chosen size, not a universal cleanup rule.",
      "conditions": [
        "Choose sampled versus dominant class, ties/no-valid output, class-band validity, grid alignment, edge denominator, CRS/area model, and output mask representation.",
        "Keep sieve or other topology-changing cleanup out of default validity handling unless explicitly desired and validated."
      ],
      "options": [
        {
          "id": "freeze-contract",
          "tradeoff": "Set choices, then validate synthetic and representative files."
        },
        {
          "id": "defer-cleanup",
          "tradeoff": "Defer heuristic mask edits until product semantics exist."
        }
      ],
      "optional_leads": [],
      "validation": [
        "Proposed, not executed: combine mask polarity/precedence, tie, coverage, edge, seam, and class-ID preservation fixtures.",
        "Proposed, not executed: exercise deployed Rasterio 1.3.10/GDAL with sidecar, internal-mask, nodata-only, and multi-band inputs."
      ],
      "uncertainty": "Only listed frozen docs were read; no runtime files, benchmarks, other campaign material, or tests were inspected or run.",
      "sources": [
        {
          "source_id": "rastermask",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst",
          "locator": "Nodata Masks; Reading dataset masks; Writing masks; Dataset masks; Nodata representations"
        },
        {
          "source_id": "rasterresample",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst",
          "locator": "Up and downsampling; Resampling Methods"
        },
        {
          "source_id": "rasterwindow",
          "url": "https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst",
          "version_or_capture": "Rasterio 1.3.10",
          "capture_date_utc": "2026-10-07",
          "sha256": "4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterwindow.rst",
          "locator": "Windows; Reading; Window transforms; Blocks"
        },
        {
          "source_id": "geotransform",
          "url": "https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst",
          "version_or_capture": "GDAL 3.9.0",
          "capture_date_utc": "2026-10-07",
          "sha256": "5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc",
          "path": "/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/geotransform.rst",
          "locator": "Introduction; Transformation from image coordinate space"
        }
      ]
    }
  ]
}

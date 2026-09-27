# Observations — OME-Zarr 0.5 viewer research (fixed-source case)

Format: one `### O-NNN` block per material observation. Sources are `case/sources/SXXX.txt` cited by line.
Later blocks may qualify earlier ones by ID; nothing is deleted.

### O-001
- source: S003 lines 67-77
- quote: "OME-Zarr is implemented using the Zarr format as defined by the version 3 of the Zarr specification. All features of the Zarr format including codecs, chunk grids, chunk key encodings, data types and storage transformers may be used with OME-Zarr unless explicitly disallowed in this specification."
- claim: OME-Zarr 0.5 sits on Zarr v3, and the NGFF spec explicitly permits every Zarr v3 feature — codecs, chunk grids, chunk key encodings, data types, storage transformers — unless NGFF itself disallows it.
- conditions: version 0.5 (0.5.0 2024-11-21 per version history at S003 lines 832-833). 0.4 sat on Zarr v2 (`zarr.json` did not exist; `.zgroup`/`.zattrs` did).
- implication: A viewer cannot assume one codec (raw/zlib), one chunk grid (regular), or one dtype family. Sharding (`chunk_key_encoding: default` with `codecs: [sharding_indexed]`), variable chunk grids, and arbitrary registered codecs must at least fail gracefully or be supported where the ecosystem emits them.
- open question: does any admitted source show real 0.5 filesets using codecs beyond blosc/zstd or non-regular grids? (check S054/S055/S056 captures and ome2024-ngff-challenge S034)

### O-002
- source: S003 lines 152-165
- quote: "The OME-Zarr Metadata is stored in the various zarr.json files throughout the above array hierarchy. In this file, the metadata is stored under the namespaced key ome in attributes." + "The version of the OME-Zarr Metadata is denoted as a string in the version attribute within the ome namespace. The OME-Zarr Metadata version MUST be consistent within a hierarchy."
- claim: In 0.5 all OME metadata lives in `zarr.json` files under `attributes.ome`, with `"version": "0.5"` string; version MUST be consistent across the whole hierarchy.
- conditions: 0.5 only. 0.4 used `.zattrs` sidecar files (see O-022 when written).
- implication: Image discovery means walking the hierarchy reading `zarr.json` (not `.zattrs`). A viewer can rely on a consistent version within one fileset; mixed 0.4/0.5 nodes in one hierarchy are non-conformant but not impossible in the wild.
- open question: what do real reader implementations do when they meet a 0.4 fileset or mixed versions? (ome-zarr-py format/reader sources)

### O-003
- source: S003 lines 166-174
- quote: "The \"dimension_names\" attribute MUST be included in the zarr.json of the Zarr array of a multiscale level and MUST match the names in the \"axes\" metadata."
- claim: Every multiscale-level array's `zarr.json` MUST carry `dimension_names` matching the group's `axes` names.
- conditions: 0.5 (clarified in 0.5.2, S003 lines 825-827: "Clarify that the dimension_names field in axes MUST be included.").
- implication: The viewer can use `dimension_names` on arrays to map array axes to `axes` entries instead of relying on order alone; useful as a validation cross-check and for axis mapping when displaying.
- open question: none.

### O-004
- source: S003 lines 299-313
- quote: "The length of \"axes\" must be between 2 and 5 ... The order of the entries MUST correspond to the order of dimensions of the zarr arrays. In addition, the entries MUST be ordered by \"type\" where the \"time\" axis must come first (if present), followed by the \"channel\" or custom axis (if present) and the axes of type \"space\"." + "Each \"datasets\" dictionary MUST contain the field \"coordinateTransformations\" ... The transformation MUST only be of type translation or scale. They MUST contain exactly one scale transformation ... It MAY contain exactly one translation that specifies the offset from the origin in physical units. If translation is given it MUST be listed after scale"
- claim: Axes are 2–5, ordered time → channel/custom → space; each dataset requires exactly one scale (plus optional translation listed after scale); scale/translation vector length MUST equal axes length.
- conditions: 0.5 multiscales metadata; normative MUSTs.
- implication: Axis interpretation (which dimension is t/c/z/y/x) can be driven by type order, but custom/null axis types are allowed in the channel slot (MAY contain "one additional entry of type:time and MAY contain one additional entry of type:channel or a null / custom type"), so a viewer cannot hard-require a channel axis; TZYX ordering is a MUST, not a convention.
- open question: how do readers cope with a custom-type axis where they expected channel? (napari/ome-zarr-py reader sources)

### O-005
- source: S003 lines 304-316
- quote: "The \"path\"s MUST be ordered from largest (i.e. highest resolution) to smallest." + "Each \"multiscales\" dictionary MAY contain the field \"coordinateTransformations\", describing transformations that are applied to all resolution levels in the same manner." ... "and are applied after them."
- claim: Dataset paths are ordered high→low resolution; a group-level `coordinateTransformations` MAY exist and is applied after each dataset's own transformations.
- conditions: 0.5 multiscales.
- implication: "Pyramid level 0 = first entry" holds only if the writer conformed; the safe product rule is "first dataset = highest resolution" per spec. Coordinate display MUST compose dataset-level then group-level transforms to be correct; ignoring the group-level list silently mis-calibrates coordinates.
- open question: do real readers implement the group-level transformations? (reader sources, issues)

### O-006
- source: S003 lines 276-293
- quote: "translation vector, stored either as a list of floats (\"translation\") or as binary data at a location in this container (path)." (same for scale)
- claim: `coordinateTransformations` scale/translation entries may carry their vector either inline (`scale`/`translation` list) or by reference (`path` to binary data in the container).
- conditions: 0.5 §2.3; identity is the default transformation and is typically not explicitly defined.
- implication: A transform-by-`path` fileset would defeat a viewer that only reads inline lists. Rare in practice, but the spec-level obligation exists; at minimum the failure must be explained, not silently treated as 1.0/no-offset.
- open question: do any admitted samples actually use `path`? (grep corpus)

### O-007
- source: S003 lines 317-319, 388-397
- quote: "Each \"multiscales\" dictionary SHOULD contain the field \"name\"." ... "If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback:"
- claim: `multiscales` is a LIST; a group may carry multiple named multiscale pyramids; `name` is only SHOULD. Spec guidance: use the single one, else let the user pick by name, defaulting to the first.
- conditions: 0.5; the fallback code is spec prose, not a MUST.
- implication: A plan that treats "multiscales" as one pyramid under-represents the format; minimally the viewer should show the first pyramid and ideally surface others. Name absence must not crash selection-by-name.
- open question: do common writers ever emit multiple multiscales entries? (corpus check)

### O-008
- source: S003 lines 398-430
- quote: "The \"omero\" metadata is optional, but if present it MUST contain the field \"channels\", which is an array of dictionaries describing the channels of the image. Each dictionary in \"channels\" MUST contain the field \"color\", which is a string of 6 hexadecimal digits ... Each dictionary in \"channels\" MUST contain the field \"window\" ... The field \"window\" MUST contain the fields \"min\" and \"max\" ... It MUST also contain the fields \"start\" and \"end\""
- claim: `omero` is transitional (0.5) and optional; when present it must have `channels` (with 6-hex-digit `color` and `window{min,max,start,end}`); `rdefs` carries `defaultT`/`defaultZ`/`model` ("color" or "greyscale").
- conditions: transitional — "Implementations may be expected (MUST) or encouraged (SHOULD) to support the reading of the data" (S003 lines 60-64).
- implication: Channel visibility/color/window UI must not assume `omero` exists (files without it need a default rendering), and when it exists the window fields are the intended starting display range. `defaultT`/`defaultZ` give the initial time/plane the thin Plan's "time-point and plane selection" should honor.
- open question: do real 0.5 writers always emit omero? (S054/S055/S056 captures)

### O-009
- source: S003 lines 431-474
- quote: "The pixels of the label images MUST be integer data types, i.e. one of [uint8, int8, uint16, int16, uint32, int32, uint64, int64]." ... "Within the multiscales object, the JSON array associated with the datasets key MUST have the same number of entries (scale levels) as the original unlabeled image."
- claim: Label images must be integer-dtyped, must implement multiscales, and (spec) must have the same number of scale levels as the source image; `image-label.colors[].rgba` is 4×0–255 with alpha, `source.image` defaults to `../../`.
- conditions: 0.5 §2.6; labels group metadata MUST list label image paths under `labels`; intermediate groups MUST NOT contain metadata.
- implication: Overlay alignment can be asserted level-for-level when writers conform, but the viewer still needs a fallback for mismatched pyramid depths (validate, don't index blindly). RGBA includes alpha so overlays have built-in opacity.
- open question: do real label filesets always match pyramid depth? (S054/S055 IDR labels capture shows actual level counts)

### O-010
- source: S003 lines 175-275
- quote: "Conforming readers: SHOULD make users aware of the presence of more than one image (i.e. SHOULD NOT default to only opening the first image); MAY use the \"series\" attribute in the \"OME\" group to determine a list of valid groups to display; MAY choose to show all images within the collection or offer the user a choice of images"
- claim: bioformats2raw.layout (transitional) filesets wrap MANY images (`0/`, `1/`, … or `series` list in `OME/` group + `OME/METADATA.ome.xml`); conforming readers should not silently open only the first image.
- conditions: transitional; `bioformats2raw.layout: 3`; if `plate` also present, plate takes precedence.
- implication: This is exactly Slide Scout's "lists the images it finds" case: a single chosen fileset can contain an image series. Discovery must recurse into numbered groups / `series` paths, and the UI should make multi-image-ness visible.
- open question: how does ome-zarr-py's reader implement this traversal? (S018)

### O-011
- source: S003 lines 515-560, 740-752
- quote: "Three groups MUST be defined above the images: the group above the images defines the well ... the group above the well defines a row of wells ... the group above the well row defines an entire plate" (lines 120-127) and "The plate dictionary MUST contain a version key whose value MUST be a string specifying the version of the plate specification."
- claim: HCS plate/well metadata defines a row/well/plate group hierarchy with `plate{rows,columns,wells,acquisitions,field_count,version}` and `well{images[{path,acquisition}]}`; empty rows/wells SHOULD NOT be present.
- conditions: 0.5 §1.2/§2.7/§2.8; well `images` paths alphanumeric, unique, case-sensitive.
- implication: Plate filesets put images several levels deep; "lists the images it finds" for a plate fileset means navigating plate→well→field. This may be out of initial scope but is a compatibility cliff if a scientist hands Slide Scout a plate.
- open question: is plate support in scope per brief? (brief says "images within a fileset" — plate handling is a product decision)

### O-012
- source: S053 lines 22-30, 67-73, 126-150, 196-266
- quote: "\"required\": [ \"multiscales\", \"version\" ]" (inside ome), "required": [ "datasets", "axes" ] (multiscales item), axes "minItems": 2, "maxItems": 5 with "minContains": 2, "maxContains": 3 space axes, coordinateTransformations "maxContains": 1 scale with "minItems": 2 vectors.
- claim: The published 0.5 image.schema validates: `ome` requires `multiscales`+`version`; each multiscales item requires `datasets`+`axes`; 2–5 axes with 2–3 `space`; transformations allow exactly one `scale` (inline vectors ≥2 entries); `omero` requires `channels` and window requires all four fields.
- conditions: schema at https://ngff.openmicroscopy.org/0.5/schemas/image.schema (S053 lines 2-3); schema is per-node (image group), does not cover plate/well/labels nodes.
- implication: The schema is a concrete validation target for acceptance fixtures — malformed-input tests can be "violations of this schema" (e.g., axes with no space axis, two scales, one-entry scale vector, omero window missing `start`). Note the schema permits `name` to be absent in multiscales despite SHOULD.
- open question: is there a stricter published validator the corpus references? (S031 ome-ngff-validator README)

### O-013
- source: S003 lines 24-27
- quote: "The current released version of this specification is 0.5. Migration scripts will be provided between numbered versions. Data written with these latest changes (an \"editor's draft\") will not necessarily be supported."
- claim: 0.5 is the current released spec; editor's-draft data may not be supported by the ecosystem.
- conditions: capture dated 2026-09-08 (S003 lines 3-4).
- implication: "Interoperate with filesets from real OME-Zarr 0.5 tools" should target the released 0.5.x line, not draft extensions (e.g., proposals in ngff issues).
- open question: which draft extensions appear in the corpus' issues (e.g., RFC-5 topics)?

### O-014
- source: S019 lines 68-90, 115-127; S016 lines 35-46
- quote: "group = zarr.open_group(store=self.__store, path=\"/\", mode=\"r\", zarr_format=zarr_format)" ... "# For zarr v3, everything is under the \"ome\" namespace\n if \"ome\" in self.zgroup:\n  self.zgroup = self.zgroup[\"ome\"]" and "detected = detect_format(self.__metadata, loader)\n ... if detected != fmt:\n  LOGGER.warning(\"version mismatch: detected: %s, requested: %s\", detected, fmt)"
- claim: ome-zarr-py's IO layer unwraps the `ome` namespace once at load (so downstream specs see `multiscales`, `omero`, … directly), and auto-detects the OME-Zarr version from metadata, re-initializing the store for the detected format with only a logged warning on mismatch.
- conditions: ome-zarr-py at commit 94eaf20aa096b4a034fc0c636e31d5d64953d6ad (per S016/S018/S019 catalog aliases). Version detection reads `multiscales[0].version` else plate/well/image-label `version` (S016 lines 81-96); falls back to the requested (current) format if absent.
- implication: One reader codebase transparently serves 0.1–0.5 filesets including Zarr v2 (0.1–0.4, `.zattrs`/`.zgroup`) and Zarr v3 (0.5, `zarr.json`). A viewer that only parses `zarr.json` will silently miss every 0.4-and-older fileset, which are common in the wild; version tolerance (or at least clear "unsupported version" messaging) is a real compatibility requirement, not gold-plating.
- open question: do napari-ome-zarr / vizarr / agave show the same dual-format tolerance? (their reader sources/issues)

### O-015
- source: S018 lines 270-296
- quote: "multiscales = self.lookup(\"multiscales\", [])\n version = multiscales[0].get(\n  \"version\", \"0.1\"\n )  # should this be matched with Format.version?\n datasets = multiscales[0][\"datasets\"]\n axes = multiscales[0].get(\"axes\")"
- claim: ome-zarr-py reads ONLY `multiscales[0]` — multiple named multiscale pyramids in one group are not offered to the user; the version is taken from the first entry defaulting to "0.1", with an in-code comment questioning whether it should match the format version.
- conditions: ome-zarr-py reader.py; `Axes(axes, fmt=fmt)` "Raises ValueError if not valid" (line 287).
- implication: The ecosystem's reference reader itself does not implement the spec's "user can choose by name" guidance (O-007). Slide Scout matching this behavior is interoperable, not non-compliant; but a fileset that puts its "good" pyramid second would only ever show the first. Also: a group whose first multiscales entry is malformed fails axis validation even if later entries are fine.
- open question: do other readers (napari-ome-zarr, vizarr) handle multiple multiscales entries?

### O-016
- source: S018 lines 291-296
- quote: "transformations = [d.get(\"coordinateTransformations\") for d in datasets]\n if any(trans is not None for trans in transformations):\n  node.metadata[\"coordinateTransformations\"] = transformations"
- claim: ome-zarr-py collects only per-dataset `coordinateTransformations`; the group-level `multiscales[i].coordinateTransformations` (spec: applied after dataset-level, O-005) is not read anywhere in this reader.
- conditions: ome-zarr-py reader.py; confirmed by absence — the only transform handling in Multiscales/OMERO/Well/Plate specs is the per-dataset list.
- implication: The most-used reference reader can mis-calibrate coordinates for filesets that use group-level transforms (e.g., a time-unit scale at group level, as in the spec example S003 lines 368-374). Slide Scout can either match the ecosystem (risk shared mis-calibration) or do better — but should know this is a divergence decision, not a requirement to copy.
- open question: does any admitted sample fileset actually use group-level coordinateTransformations? (grep corpus)

### O-017
- source: S018 lines 325-391
- quote: "channels = self.image_data.get(\"channels\", None)\n if channels is None:\n  return  # EARLY EXIT" ... "if model == \"greyscale\":\n  rgb = [1, 1, 1]" ... "window = ch.get(\"window\", None)\n if window is not None:\n  start = window.get(\"start\", None)\n  end = window.get(\"end\", None)\n  if start is None or end is None:\n   # Disable contrast limits settings if one is missing\n   contrast_limits = None"
- claim: ome-zarr-py's OMERO handling degrades gracefully: default channel names `channel_{idx}`, all channels default visible, missing color → no colormap entry, `rdefs.model == "greyscale"` forces all colormaps white, a channel window missing `start`/`end` disables contrast limits entirely; all parsing is inside try/except that logs "Failed to parse metadata".
- conditions: ome-zarr-py reader.py; `active` missing → visible=True default; `visibles[idx] = visible and node.visible` (node visibility propagation, lines 371-373).
- implication: Real readers already tolerate every individual `omero` field being absent even though the spec makes color+window MUSTs when omero is present — evidence that writers under-fill omero in practice. Slide Scout's channel controls need the same defaults (name/visible/white/greyscale-model handling) rather than schema-strict parsing.
- open question: none material.

### O-018
- source: S018 lines 183-199, 202-267
- quote: "return bool(\"labels\" in zarr.root_attrs)" (Labels.matches) and "image = image_label.get(\"source\", {}).get(\"image\", None)\n parent_zarr = None\n if image:\n  # This is an ome mask, load the image\n  parent_zarr = self.zarr.create(image)\n  if parent_zarr.exists():\n   LOGGER.debug(\"delegating to parent image: %s\", parent_zarr)\n   node.add(parent_zarr, prepend=True, visibility=False)\n  else:\n   parent_zarr = None\n if parent_zarr is None:\n  LOGGER.warning(\"no parent found for %s: %s\", self, image)"
- claim: ome-zarr-py treats any group with a `labels` attribute as a labels container (with an admitted TODO that it should also check the entry list/version), follows label images' `image-label.source.image` path to load the parent image (default `../../` per spec), and only logs a warning if the parent is missing.
- conditions: ome-zarr-py reader.py; label colors normalized `/255`, invalid `label-value` types logged and skipped (lines 233-246).
- implication: The label→image linkage is via a relative path the viewer must resolve; a wrong/missing `source.image` should surface as "overlay unavailable", not a crash. Also note the reader loads the parent as hidden — overlays don't force-show the image.
- open question: do the IDR label samples in the corpus include `source.image`? (S054)

### O-019
- source: S018 lines 583-600
- quote: "if node.specs:  # Something has matched\n  LOGGER.debug(\"treating %s as ome-zarr\", self.zarr)\n  yield from self.descend(node)\n elif self.zarr.zarray:  # Nothing has matched\n  LOGGER.debug(\"treating %s as raw zarr\", self.zarr)\n  node.data.append(self.zarr.load())\n  yield node\n else:\n  LOGGER.debug(\"ignoring %s\", self.zarr)\n  # yield nothing"
- claim: ome-zarr-py's Reader silently yields NOTHING for a group with no recognized spec and no array — unknown/malformed groups produce no node and no user-facing error.
- conditions: ome-zarr-py reader.py; `Reader.__init__` asserts `zarr.exists()` (line 579).
- implication: "Understandable feedback rather than a crash" (Plan line 11) is not satisfied by the reference reader's own discovery behavior — a directory that isn't OME-Zarr at all just shows as empty/ignored. Slide Scout's plan to explain failures is a deliberate improvement over the ecosystem default; the acceptance fixtures should include an unrecognized-group case to pin that down.
- open question: none.

### O-020
- source: S016 lines 296-342
- quote: "if sum(t == \"scale\" for t in types) != 1:\n  raise ValueError(\n   \"Must supply 1 'scale' item in coordinate_transformations\"\n  )\n # first transformation must be scale\n if types[0] != \"scale\":\n  raise ValueError(\"First coordinate_transformations must be 'scale'\")"
- claim: ome-zarr-py's FormatV04 (inherited by V05) validation is STRICTER than the published spec on ordering: it demands scale be the FIRST transformation, while the 0.5 spec only says translation "MUST be listed after scale" (which permits [translation, scale]? no — after means scale first; but it also permits scale-only or scale-then-translation) and the schema does not constrain order at all.
- conditions: ome-zarr-py format.py validate_coordinate_transformations; also requires ct count == nlevels, scale length == ndim, numeric values, ≤1 translation.
- implication: Writer-side validation in the reference library enforces scale-first; a viewer can reasonably rely on scale-first ordering for files produced by the ecosystem even though the JSON schema accepts any order. Edge: hand-written or other-language files with translation-first would pass schema but be rejected by ome-zarr-py — worth one acceptance fixture to decide Slide Scout's tolerance.
- open question: does the corpus contain a translation-first sample? (grep)

### O-021
- source: S016 lines 368-387
- quote: "class FormatV05(FormatV04):\n \"\"\"\n Changelog: added FormatV05 (May 2025): writing not supported yet\n \"\"\"" ... "@property\n def chunk_key_encoding(self) -> dict[str, str]:\n  # this is default for Zarr v3. Could return None?\n  return {\"name\": \"default\", \"separator\": \"/\"}"
- claim: ome-zarr-py's 0.5 support (as of the pinned commit) is read-focused — "writing not supported yet" — and FormatV05 otherwise inherits ALL 0.4 behavior (validation, plate/well handling); chunk key encoding for v3 is `default` with `/` separator.
- conditions: commit 94eaf20; CurrentFormat = FormatV05 (S016 line 387).
- implication: For reading, 0.5 ≈ 0.4 metadata + Zarr v3 storage in this library; Slide Scout can reuse its 0.4 metadata logic for 0.5 and put its compatibility risk budget into the storage layer (codecs, sharding, chunk grids), which is where 0.5 actually differs.
- open question: which v3 storage features do the corpus' real 0.5 filesets actually use? (S054/S055/S056, S034)

### O-022
- source: S048 lines 215-244
- quote: "# For v0.6+ simply use first coordinateSystem axes...\n if \"coordinateSystems\" in attrs[\"multiscales\"][0]:\n  axes = attrs[\"multiscales\"][0][\"coordinateSystems\"][0][\"axes\"]\n else:\n  # No axes (v0.1, v0.2), assume 5D (t,c,z,y,x)\n  axes = attrs[\"multiscales\"][0].get(\"axes\", AXES_5D)"
- claim: napari-ome-zarr's reader already handles metadata beyond released 0.5: `coordinateSystems` (draft 0.6), string axes (v0.3), and a hardcoded 5D tczyx assumption when no axes exist (v0.1/v0.2).
- conditions: napari_ome_zarr/ome_zarr_reader.py (captured from main). AXES_TYPES maps only x/y/z/c/t names (S048 line 24).
- implication: The reader ecosystem is already absorbing draft-0.6 concepts (scene/coordinateSystems, rotation/affine/sequence transforms — S048 lines 62-100, 402-495). Slide Scout targets 0.5 and should treat those as out of scope but must not crash on them: unknown transform types get a warning + skip in napari (line 121-122: "Unsupported transform type"), a tolerable default. Also: absent-axes 5D assumption is a counterexample to assuming `axes` always exists.
- open question: is any 0.6-draft data present in the corpus' sample captures? (grep coordinateSystems)

### O-023
- source: S048 lines 204-258
- quote: "# napari treats a None entry as its default (pixel); keeping the spatial\n # units means label and split-image layers stay unit-consistent, so the\n # scale bar still renders (napari warns \"Inconsistent units across\n # layers\" and hides units when one layer lacks them)."
- claim: Per-axis units must be carried consistently across overlay layers or the display downgrades: napari hides units/warns "Inconsistent units across layers" when one layer lacks them, so napari-ome-zarr pads missing units with None rather than dropping the tuple; channels are split into per-channel layers with axis metadata sliced, while label layers keep all axes.
- conditions: napari-ome-zarr; Multiscales._splits_channels=True vs Label._splits_channels=False (S048 lines 204-213, 580-584).
- implication: Slide Scout's "read correctly calibrated coordinates" + label overlay features have a concrete cross-layer consistency requirement: image and label overlay must derive units/scale from the SAME axes metadata or the UI must explain the mismatch. Also the channel split means per-channel display state (visibility, LUTs) is natural; labels render as one integer layer with a colormap keyed by label value.
- open question: none.

### O-024
- source: S048 lines 652-659, 707-716
- quote: "rsp = {\n \"name\": f\"labels{self.group.name}\",\n \"visible\": False,  # labels not visible initially\n **ms_data,\n }\n # in case no colors, don't set colormap (no labels will be shown)" ... "layer_type = \"labels\"\n # napari \"labels\" layer MUST not have \"channel_axis\"\n if \"channel_axis\" in metadata:\n  ch_axis = metadata.pop(\"channel_axis\")"
- claim: In napari-ome-zarr, label overlays default to NOT visible and render as a single labels layer (no channel split); with no `image-label.colors`, no colormap is set and effectively nothing is shown for the labels.
- conditions: napari-ome-zarr reader; names label layers "labels{group path}".
- implication: "Optional overlays" in the Plan matches ecosystem default-off behavior. A label image with no colors metadata is displayable but uninformative — Slide Scout should decide: fall back to a default random-color map (more useful) or show "no colors metadata" hint (more faithful). Product choice.
- open question: what do vizarr/agave do for colorless labels? (S014, S081/S082 area)

### O-025
- source: S048 lines 341-365
- quote: "def children(self) -> list[Spec]:\n # lookup children from series of OME/METADATA.xml\n xml_data = SyncMixin()._sync(\n  self.group.store.get(\n   \"OME/METADATA.ome.xml\", prototype=default_buffer_prototype()\n  )\n )" ... "if child.tag.endswith(\"Image\") and node_id.startswith(\"Image:\"):\n  image_path = node_id.replace(\"Image:\", \"\")"
- claim: napari-ome-zarr's Bioformats2raw spec discovers series images by parsing `OME/METADATA.ome.xml` and mapping `Image ID="Image:PATH"` entries to group paths — it does NOT read the `OME` group's `series` attribute (the spec's other discovery mechanism, O-010), and it excludes plate layouts from the b2r handling.
- conditions: napari-ome-zarr reader.
- implication: Two reference readers discover multi-image collections differently (ome-zarr-py: numbered groups/series attr; napari: OME-XML Image IDs). Interop with "real tools" requires supporting BOTH `series` and numbered-group discovery, and tolerating absence of METADATA.ome.xml (the spec marks it SHOULD). Counterexample risk: a `series`-only fileset (no OME-XML) is invisible to napari's b2r path.
- open question: does bioformats2raw always write METADATA.ome.xml? (S033 README)

### O-026
- source: S048 lines 664-699
- quote: "if Labels.matches(root_group):\n # Try starting at parent Image\n parent_path = root_group.store.root.parent\n parent_group = zarr.open_group(parent_path)\n if Multiscales.matches(parent_group):\n  spec = Multiscales(parent_group)"
- claim: napari-ome-zarr supports opening AT a labels group or label image by walking UP the hierarchy to the parent image; unsupported roots print "No matching spec" and return no layers.
- conditions: napari-ome-zarr reader entry point `read_ome_zarr`.
- implication: Users select paths, not just roots — Slide Scout's fileset picker should handle "user picked the labels/ subfolder" gracefully (either navigate up like napari or explain). Silent no-op on unknown roots (like O-019) is again the ecosystem baseline.
- open question: none.

### O-027
- source: S009 lines 56-72, 21-31
- quote: "ome_zarr/writer.py" (file listing) and "docs/source/advanced/sharding.ipynb" "docs/source/advanced/transforms/create_scenes.ipynb"
- claim: The pinned ome-zarr-py tree contains a writer module, sharding docs, and scene/transform notebooks — sharding (a Zarr v3 feature) is documented as an advanced topic, and scene-writing is emerging.
- conditions: commit 94eaf20 file listing only (content not in corpus except via S020 tree dump).
- implication: Sharded 0.5 output is an expected real-tool artifact (the 2024 NGFF challenge pushes it, cf. S034), so read-path support for `sharding_indexed` codecs is a compatibility concern for Slide Scout's chosen Zarr library, not the NGFF layer.
- open question: which Zarr v3 reading library would Slide Scout bind to, and does the corpus record agave's choice? (S097/S102 tensorstore-in-agave searches)

### O-028
- source: S055 lines 1-74
- quote: "\"codecs\": [\n {\n  \"configuration\": {\n   \"chunk_shape\": [\n    1,\n    1,\n    256,\n    256\n   ],\n   \"codecs\": [\n    {\n     \"configuration\": {\n      \"endian\": \"little\"\n     },\n     \"name\": \"bytes\"\n    },\n    {\n     \"configuration\": {\n      \"blocksize\": 0,\n      \"clevel\": 5,\n      \"cname\": \"zstd\",\n      \"shuffle\": \"shuffle\",\n      \"typesize\": 2\n     },\n     \"name\": \"blosc\"\n    }\n   ],\n   \"index_codecs\": [\n    {\n     \"configuration\": {\n      \"endian\": \"little\"\n     },\n     \"name\": \"bytes\"\n    },\n    {\n     \"name\": \"crc32c\"\n    }\n   ]\n  },\n  \"name\": \"sharding_indexed\"\n }\n ]"
- claim: The IDR v0.5 sample `6001240_labels.zarr/0/zarr.json` is a SHARDED array: `sharding_indexed` outer codec, inner chunks 1×1×256×256 inside regular chunks 1×10×512×512, inner codecs bytes(little-endian)+blosc(zstd, shuffle), index codecs bytes+crc32c; `data_type: uint16`, `dimension_names: ["c","z","y","x"]`, `chunk_key_encoding: {name: "default"}` (no separator given), `fill_value: 0`, shape [2,236,275,271].
- conditions: real capture, https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr/0/zarr.json.
- implication: Sharding is not hypothetical for 0.5 — an flagship public sample uses it. Slide Scout's Zarr reading layer MUST handle `sharding_indexed` (+crc32c) to read the canonical IDR 0.5 samples; "pyramid level" reads are chunk reads at inner granularity. Also confirms axis names in `dimension_names` may start with `c` (channel-first 4D), so plane navigation must derive axis roles from `axes` types, never from position.
- open question: do all three pyramid levels shard identically? (only level 0 is captured here)

### O-029
- source: S054 lines 1-119
- quote: "\"multiscales\": [\n {\n  \"axes\": [\n   {\n    \"name\": \"c\",\n    \"type\": \"channel\"\n   },\n   {\n    \"name\": \"z\",\n    \"type\": \"space\",\n    \"unit\": \"micrometer\"\n   }, ..." and "\"omero\": {\n \"channels\": [\n  {\n   \"active\": true,\n   \"coefficient\": 1.0,\n   \"color\": \"0000FF\", ..."
- claim: A real 0.5 group capture: `multiscales` entry WITHOUT `name` or `type` (both only SHOULD), axes c/z/y/x with anisotropic scale (z 0.5002… vs y/x 0.3604…), three datasets "0","1","2" each with a single scale transform, NO group-level coordinateTransformations, plus a full `omero` block (2 channels, `model: "color"`, `defaultZ: 118`) and a custom `_creator` key.
- conditions: real capture of idr0062A/6001240_labels.zarr root zarr.json; version "0.5"; note this "labels" fileset carries `omero` and `multiscales` at its root like a normal image.
- implication: (a) name-less multiscales groups occur in the wild → display must fall back to fileset/path names (ome-zarr-py uses the basename, napari uses ""). (b) defaultZ=118 with only 236 z-slices shows rdefs defaults are real navigation hints. (c) anisotropic z vs y/x voxel sizes make "plane" calibration visibly non-square — a correct 3D/plane readout must use per-axis scale. (d) unknown extra keys (`_creator`) must be ignored, not rejected.
- open question: is `6001240_labels.zarr` itself a label image with `image-label` metadata deeper in the hierarchy, or an IDR-rendered image twin? Corpus only captures this root zarr.json.

### O-030
- source: S056 lines 1-320
- quote: "\"_creator\": {\n \"name\": \"ome2024-ngff-challenge\",\n \"version\": \"1.0.0\",\n \"notes\": null\n },\n \"plate\": {\n \"columns\": [...],\n \"field_count\": 32,\n \"name\": \"190129\",\n \"rows\": [...],\n \"wells\": [...]"
- claim: A real ome2024-ngff-challenge plate root zarr.json: sparse plate (49 wells scattered in 6×11 grid, `field_count: 32`) whose `plate` object has NO `version` key and NO `acquisitions` — although the 0.5 spec says plate "MUST contain a version key" (S003 lines 550-551).
- conditions: real capture, ome2024 challenge share; `zarr_format: 3`, `node_type: "group"`.
- implication: A widely-deployed writer emits plates that violate a spec MUST. A viewer that hard-validates `plate.version` would reject real challenge filesets. Validation should be advisory with clear messaging, and acceptance fixtures should include this exact capture as the "wild MUST violation" case.
- open question: do the corpus' validators (S031) flag this, and does ome-zarr-py read it anyway? (Plate spec in S018 only reads rows/columns/wells — it never touches `version`, so yes it reads it.)

### O-031
- source: S068 line 1
- quote: "Binary source retained; this CLI cannot extract application/octet-stream"
- claim: The captured v0.4 `.zattrs` sample (idr0062A/6001240.zarr/.zattrs) is NOT readable text in this corpus — its content is unavailable.
- conditions: corpus capture limitation (view is a placeholder line, 72 bytes original).
- implication: No claims can be made about this specific 0.4 metadata document from this corpus. 0.4-side metadata structure must rest on the 0.4 spec (S059) and reader code instead. Unread/unreadable ≠ evidence of absence.
- open question: none (structural gap, not fixable within the corpus).

### O-032
- source: S005 line 1; S007 line 1; S030 line 1; S042 line 1; S045 line 1; S046 line 1; S077 line 1; S095 line 1
- quote: "ValueError: Clone exceeded 256 MiB or 120 second cap; partial clone retained, not admitted" (S005) / "HTTPError: HTTP Error 403: Forbidden" (S007) / "FileNotFoundError: [Errno 2] No such file or directory: '/mnt/Cursor/.../sources/S00038/text.txt'" (S030) / "HTTPError: HTTP Error 404: Not Found" (S045) / "ValueError: Incomplete clone is not a source" (S046) / "HTTPError: HTTP Error 422: Unprocessable Entity" (S077) / "ValueError: Git metadata is not a document source" (S095)
- claim: Eight admitted sources are FAILED captures (clone size/time caps, HTTP 403/404/422, missing intermediate files, git-metadata rejection), not documents. S042's alias list (9 local-capture aliases) resolves to this error, and S057 shows three alias URIs (vizarr releases, agave issue 220 comments, tensorstore releases) all returning an empty JSON array — likely also capture failures.
- conditions: fixed corpus; these sources cannot support any substantive claim.
- implication: Claims must not rest on S005/S007/S030/S042/S045/S046/S077/S095 (and S057's emptiness is not evidence that vizarr has no releases). Catalog aliases show what was ATTEMPTED (e.g., S042 aliases suggest repeated captures of the same 36-byte object, likely a placeholder like `0.4`).
- open question: none within corpus.

### O-033
- source: S001 lines 1-23; S006 lines 1-24; S012 lines 1-24; S021 lines 1-25; S032 lines 1-23; S036 lines 1-24; S060 lines 1-29; S071 lines 1-23
- quote: "Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims." (repeated header)
- claim: Eight sources are web-search discovery outputs, not primary evidence. Their result titles still identify the corpus' other captures (ngff#206, ome-zarr-py PR404 "Zarr v3", PR413 "Ome zarr v0.5 reading and writing", napari-ome-zarr#139 "Zarr v3 compatibility and scale metadata reading in napari 0.6.6", vizarr#307 "Rendering issues for images in OME-ZARR v0.5 format", neuroglancer#651 "viewing Zarr v3 and OME-Zarr", qupath PR#1638, bioformats2raw v0.5.0 release, zarrcade/ome-zarr-portal/biofile-finder local browser projects, zarr-python performance issues #1343/#2710) and name additional tools NOT captured (MoBIE, zarrcade, ome-zarr-portal, image.sc forum threads).
- conditions: search-result snapshots; titles only, no content beyond titles.
- implication: The reader-implementation issue set to examine is well-identified by these handles; tools like MoBIE/zarrcade exist in the ecosystem but only as unverified titles here — a feature existing there is NOT established for this case beyond title level.
- open question: none.

### O-034
- source: S049 lines 5-22
- quote: "│ [2] Sharded array is very slow to load · Issue #1343 · zarr-developers/zarr-python               │" and "│ [4] Performance regression in V3                                                                 │\n│     https://github.com/zarr-developers/zarr-python/issues/2710                                   │"
- claim: Search-result titles indicate known zarr-python v3 performance problems — "Sharded array is very slow to load" (#1343) and "Performance regression in V3" (#2710). The underlying issues are NOT captured in this corpus.
- conditions: title-level evidence only; zarr-python version unknown.
- implication: The Plan's responsiveness requirement (Plan lines 7, 11: "Large image reads run in the background", "A large dataset must not freeze interaction") intersects a real ecosystem risk: if Slide Scout binds zarr-python v3, sharded IDR-style samples (O-028) may hit these exact paths. A performance validation on sharded local filesets is warranted; library choice (zarr-python vs tensorstore — agave uses tensorstore v0.1.78, O-036) is a load-bearing decision the thin Plan doesn't surface.
- open question: corpus contains no benchmark numbers; treat as risk, not established fact.

### O-035
- source: S048 lines 51-78, 81-100
- quote: "if transform[\"type\"] == \"rotation\":\n matrix = np.array(transform[\"rotation\"])\n matrix = np.delete(matrix, axis, 0)  # remove row\n matrix = np.delete(matrix, axis, 1)  # remove column" ... "elif transform[\"type\"] == \"affine\":\n matrix = np.array(transform[\"affine\"])\n # Spec says that \"affine\" matrix is (M)x(N+1). We want (M+1)x(N+1)"
- claim: napari-ome-zarr implements rotation/affine/sequence transform types that are NOT in the 0.5 spec (0.5 allows only scale+translation, O-004) — these belong to the draft 0.6 transformations work.
- conditions: napari-ome-zarr reader on main; guarded by warnings for unsupported types.
- implication: Confirms 0.5's transform vocabulary is closed (scale, translation, identity-default); Slide Scout does not need rotation/affine support for 0.5 conformance, and encountering one signals 0.6-draft data → warn-and-degrade is the ecosystem pattern.
- open question: none.

### O-036
- source: S096 lines 1-29; S121 lines 1-9
- quote: "renderlib/io/CMakeLists.txt:38:        URL \"https://github.com/google/tensorstore/archive/refs/tags/v0.1.78.tar.gz\"" (S096) and "renderlib/io/FileReaderZarr.cpp:161:FileReaderZarr::getOmero(nlohmann::json attrs) ... omero = ome[\"omero\"];\n ...\n omero = attrs[\"omero\"];" (S121)
- claim: AGAVE (allen-cell-animated, C++ desktop volume viewer) reads OME-Zarr through google/tensorstore pinned at v0.1.78, opens arrays via `zarr.json`, and its `getOmero` accepts `omero` from EITHER the `ome` namespace OR top-level attributes — and its dtype switch (S096 lines 25-28) enumerates only int32, uint16, uint8, float32.
- conditions: agave repo grep excerpts at commit 9e7b47f (catalog alias); exact file lines are grep views, not full files.
- implication: (a) A shipping desktop viewer in this exact product space binds tensorstore rather than zarr-python — a precedent for Slide Scout's storage-layer choice. (b) Dual-namespace omero tolerance is a cheap interop win (some tools write un-namespaced omero). (c) agave's 4-dtype whitelist is a counterexample to full spec freedom (O-001) — real viewers do restrict dtypes; Slide Scout must decide its dtype support matrix explicitly (uint8/uint16/float32 minimum for images; integer types for labels, O-009).
- open question: what happens in agave for int8/uint64/etc. — outside corpus (grep excerpt only).

### O-037
- source: S033 lines 213-226, 155-163, 322-326, 351-359
- quote: "By default, the output of `bioformats2raw` will be a [Zarr dataset] ... which follows the metadata conventions defined by the [version 0.4] of the OME-Zarr specification including the [bioformats2raw.layout specification]" and "#### --ngff-version\n\nSpecifies the version of the [OME-Zarr specification] ... Current supported values are 0.4 and 0.5." and compression table "| v3/0.5            | yes                 | yes   | yes  | no   | yes  |" and "Versions 0.12.0 and later switches the underlying library that reads and writes Zarr from jzarr to [zarr-java] ... A consequence of this change is that all data is now written as little-endian."
- claim: bioformats2raw's DEFAULT output is 0.4-convention Zarr (with bioformats2raw.layout); 0.5 (Zarr v3) requires opt-in `--ngff-version 0.5`. For 0.5 it supports null/blosc/gzip/zstd (not zlib). Since 0.12.0 it writes via zarr-java, all little-endian.
- conditions: bioformats2raw master README (capture); `--no-root-group` exists for suppressing the root group (line 322-326, 0.4-era); `--no-minmax` omits OMERO rendering metadata incl. computed min/max (lines 351-354).
- implication: (a) "Filesets from real OME-Zarr 0.5 tools" (Plan line 9) includes both opt-in b2r 0.5 output AND legacy 0.4 filesets from the same community — a local-folder browser will meet both. (b) Codec variety for 0.5 is real: null, blosc (lz4/zstd/zlib/blosclz/lz4hc cnames), gzip, zstd (with optional checksum) — Slide Scout's decompression matrix must exceed zlib. (c) `--no-minmax` filesets lack computed windows → the omero-tolerant defaults of O-017 are required. (d) `--no-root-group` output (0.4) has no root group at all — a discovery edge case.
- open question: does b2r 0.5 output include `dimension_names` and sharding? (README does not say; zarr-java defaults unknown here)

### O-038
- source: S033 lines 251-276, 311-320
- quote: "#### --scale-format-string\n\nA [Java format string] that defines how series and resolutions should be described in the output directory hierarchy. The default value is `%d/%d`" and "An example of removing the series index from the hierarchy altogether:" and "#### --no-ome-meta-export\n\nPrevents the input file's OME-XML metadata from being saved."
- claim: bioformats2raw lets users reshape the output hierarchy arbitrarily (`--scale-format-string`, `--pyramid-name`, `--additional-scale-format-string-args`) and omit the OME/METADATA.ome.xml group.
- conditions: b2r master README; customized hierarchies "are not compatible with raw2ometiff and do not strictly follow the OME-NGFF specification" (lines 219-221) but are valid Zarr.
- implication: "Numbered groups 0..n starting at root" (O-010's fallback) is only the default; single-image b2r output may have the series index removed entirely (then `0` is the first RESOLUTION, not a series). Discovery by pattern-matching directory names is fragile; the robust signal is `bioformats2raw.layout`/`series`/`multiscales` metadata, and the UI must cope with `OME/` being absent.
- open question: none.

### O-039
- source: S034 lines 41-47, 293-308
- quote: "- all v2 arrays converted to v3, optionally sharding the data\n- all .zattrs metadata migrated to `zarr.json[\"attributes\"][\"ome\"]`\n- a top-level `ro-crate-metadata.json` file with minimal metadata (specimen and imaging modality)" and "Zarr v3 supports shards, which are files that contain multiple chunks. The shape of a shard must be a multiple of the chunk size in every dimension. There is not yet a single heuristic ... **The default shard shape chosen by resave is the full shape of the image array.**"
- claim: The ome2024-ngff-challenge converter produces 0.5 filesets by migrating 0.4 data (v2→v3, .zattrs→zarr.json ome namespace, optional sharding, RO-Crate metadata sidecar); the DEFAULT shard is the whole image array, and shard shape must be a multiple of chunk shape per dimension.
- conditions: challenge README; sample listing shows v3 chunk paths like `0/c/0/0/0/0` (lines 55-62) — the default chunk-key encoding's `c` prefix; 1 PB goal (line 27).
- implication: (a) Expect extreme shard sizes in the wild (whole-image single-file shards) — partial reads MUST go through sharding-aware readers; naive whole-array reads would load gigabytes. (b) `ro-crate-metadata.json` sits beside `zarr.json` at fileset roots — discovery logic must not choke on non-Zarr files in the tree. (c) The ecosystem needed PRs in ome-zarr-py (#383), vizarr (#172), napari-ome-zarr (#112), neuroglancer (#606), zarr-python (#2029) to read challenge data (lines 352-366) — early 0.5/challenge data was NOT readable by then-current viewers; version recency of the reading stack is a compatibility requirement.
- open question: which of those PRs landed in the corpus captures? (S008 is PR404, not 383 — check S052 releases for 383 mentions)

### O-040
- source: S031 lines 1-15
- quote: "To specify a location to load schemas from, use the `schemas` query parameter. For example, this will load schemas from a specified branch of the ngff-spec repo:\n```\n&schemas=https://raw.githubusercontent.com/will-moore/ngff-spec/refs/heads/scene_coordinateTransformations_input_path_optional/schemas/\n```"
- claim: The official ome-ngff-validator is a web page over versioned JSON schemas, with a query parameter to swap in custom/branch schemas (example shown is a scene/coordinateTransformations branch — 0.6-draft material).
- conditions: ome-ngff-validator README; samples at https://idr.github.io/ome-ngff-samples/ (line 6; captured as S010).
- implication: "Malformed input" acceptance fixtures (Plan line 11) can be generated mechanically as schema violations of S053 and cross-checked with the same validator the community uses; the custom-schemas mechanism confirms 0.6-draft schemas circulate separately from released 0.5.
- open question: none.

### O-041
- source: S043 lines 277-316
- quote: "- name: multiple 'multiscales'\n  description: Does the viewer open any images beyond the first item in the 'multiscales' list?\n  sample_url: https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0050A/4995115.zarr" with every listed viewer "supported: no" (napari/vizarr/avivator/Vol-E open: yes; BigDataViewer/MoBIE "Fails with: java.lang.RuntimeException: java.lang.ArrayIndexOutOfBoundsException: 3")
- claim: The community feature matrix records that NO surveyed viewer opens anything beyond the first `multiscales` list entry; several crash on the multi-multiscales sample (4995115.zarr).
- conditions: ome-ngff-tools docs/_data/features.yml (viewer matrix, undated in capture); sample is 0.4.
- implication: Slide Scout reading only multiscales[0] (O-015) matches every peer. Surfacing additional named multiscales would be ecosystem-leading; the minimum bar is to not crash. The sample 4995115.zarr is a ready-made distinguishing validation fixture.
- open question: none.

### O-042
- source: S043 lines 2-36
- quote: "- name: Z downsample\n  description: Does the viewer handle image pyramids which have been down-sampled in the Z axis?" ... "vizarr:\n    opens: no\n    supported: no\n    notes: \"Vizarr expects the same number of Z-sections for each pyramid resolution\"" and "napari:\n    notes: \"Image appears to load and display OK, but very quickly crashes on zooming etc.\""
- claim: Pyramids whose non-XY dimensions shrink across levels (Z-downsampled) break multiple viewers: vizarr refuses to open, napari crashes on zoom; Microscopy Nodes mis-reads Z pixel size.
- conditions: features.yml; sample 9836832_z_dtype_fix.zarr (0.4).
- implication: "The viewer chooses an available pyramid level appropriate for the current view" (Plan line 5) requires reading EACH level's own array shape and computing its scale from that level's `coordinateTransformations` — never extrapolating level shapes from level 0. Acceptance must include a Z-downsampled pyramid; IDR's 9836832 is the canonical one.
- open question: none.

### O-043
- source: S043 lines 80-109
- quote: "- name: multiscales downsampling not=2" ... "neuroglancer:\n    notes: \"Fails with Error parsing zarr metadata: Error parsing 'dtype' property: Unsupported numpy data type: >u1\"" and "vizarr:\n    supported: no\n    opens: no\n    issue_url: https://github.com/hms-dbmi/vizarr/issues/101"
- claim: A pyramid with scale factor ≠2 between levels defeats vizarr entirely; and the same test matrix surfaces a big-endian dtype (`>u1`) failure in neuroglancer — i.e., legacy Zarr v2 dtype strings with non-native endianness exist in the wild.
- conditions: features.yml; sample 9846318.zarr/0.
- implication: Level selection must derive factors from metadata (paths+shapes), not assume 2×; endianness must be handled or clearly reported. b2r ≥0.12 writes little-endian (O-037) but older v2 filesets may not be.
- open question: none.

### O-044
- source: S043 lines 394-471
- quote: "- name: scale within coordinateTransformations on multiscales (v0.4)\n  description: Does the viewer read the 'scale' transformation for each item in `multiscales` list?" ... "napari:\n    supported: no\n    opens: yes\n    issue_url: https://github.com/ome/napari-ome-zarr/issues/73"
- claim: Per the matrix, napari does NOT honor group-level (`multiscales`) scale/translation; BigDataViewer, MoBIE, neuroglancer do; WEBKNOSSOS scale:no. Dataset-level scale is honored by napari, Vol-E, BigDataViewer, MoBIE, neuroglancer, WEBKNOSSOS; avivator and vizarr show NO scalebar at all.
- conditions: features.yml; samples 13457539.zarr (multiscales-level) and 6001240.zarr (dataset-level).
- implication: Group-level transforms (O-005, O-016) split the ecosystem — even napari misses them per this matrix. Slide Scout composing dataset-level THEN group-level transforms would be more correct than half the ecosystem; validation can reuse the idr0101 translation samples (13457537/13457539, listed in S010 lines 970-992 with keywords "coordinateTransformation (translation) on dataset"/"on multiscales").
- open question: current napari-ome-zarr main (S048 lines 276-283) appears to combine dataset-0 and group-level transforms when `input` names match — matrix may predate that code; the corpus cannot date the matrix.

### O-045
- source: S043 lines 240-275
- quote: "- name: bioformats2raw.layout\n  description: Does the viewer handled a Fileset of images contained within a bioformats2raw.layout wrapper?" ... "napari:\n    supported: no\n    opens: no\n    issue_url: https://github.com/ome/napari-ome-zarr/issues/71" ... "neuroglancer:\n    notes: \"Error: Neither .zarray metadata nor OME multiscale metadata found\"" and (vizarr) "notes: User is redirected to ome-ngff-validator which shows links to open each image in vizarr"
- claim: Multi-image bioformats2raw filesets are the ecosystem's weakest interoperability point: napari does not open them, neuroglancer errors, vizarr only links out; only OMERO (and BigDataViewer, non-multiscale) handle them.
- conditions: features.yml; sample sample_files.zarr.
- implication: Slide Scout's core promise "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan line 5) directly targets the ecosystem's biggest gap. Correct series/numbered-group discovery (O-010, O-025) plus a visible image list is the differentiating capability, and O-010's "SHOULD make users aware of more than one image" is the spec-level backing.
- open question: none.

### O-046
- source: S043 lines 38-78, 171-205, 473-507
- quote: "WEBKNOSSOS:\n    supported: yes\n    opens: yes\n    notes: \"rdefs are not supported\"" and "Vol-E:\n    supported: no\n    opens: yes\n    notes: \"The channel labels are read from 'omero' metadata, but the colors are ignored\"" and HCS plate: "vizarr:\n    supported: yes\n    notes: Only the lowest resolution of a Plate is shown. Clicking a Well loads it in a new window" and "napari:\n    supported: yes\n    notes: \"Plate appears to load and display OK, but crashes on zooming in.\""
- claim: Ecosystem handling of `omero` display hints and plates is partial: rdefs (defaultT/defaultZ) unsupported in WEBKNOSSOS; Vol-E ignores channel colors; plate viewers show lowest-res only (vizarr) or crash on zoom (napari).
- conditions: features.yml matrix rows "omero info", "labels", "HCS plate".
- implication: For Slide Scout: honoring `omero.channels[].color/window/label/active` and `rdefs.defaultT/defaultZ` (O-008) is achievable differentiating fidelity, not table stakes; plate navigation if attempted must avoid the stitched-giant-image approach that makes napari crash on zoom (lazy per-well reads at a chosen level instead).
- open question: none.

### O-047
- source: S010 lines 1027-1143
- quote: "0.5\n76-45.ome.zarr\n520\n1\n2\n1\nXYZCT\n384\n1" and "0.5\n190129.zarr\n2048\n2044\n31\n5\nXYZC\n49\n32" and "0.5\nBR00109990_C2.zarr\n2080\n1552\n5\nXYC\nbioformats2raw.layout (9 images)" and "0.4\n13457537.zarr ... coordinateTransformation (translation) on dataset" / "13457539.zarr ... coordinateTransformation (translation) on multiscales"
- claim: The IDR samples catalog enumerates representative filesets per version with sizes/axes/wells/fields/keywords: 0.5 entries include a 384-well plate (76-45.ome.zarr), a 49-well/32-field plate (190129.zarr), pure 2D (XY) and 1937-deep Z (XYZ) sets, a labels fileset (6001240_labels.zarr), b2r multi-image filesets (180712_H2B_22ss…, 3.66.9-6.141020…, BR00109990_C2.zarr "9 images"), and 0.4 dedicated translation-test images (13457537 dataset-level, 13457539 multiscales-level).
- conditions: catalog page capture; "Axes" column reflects axis presence (XYZCT etc.); entries dated up to 2025-09-22.
- implication: This catalog is the natural source of acceptance fixtures for every Plan acceptance item (discovery, navigation, channels/planes, calibration, labels, plates, b2r multi-image, translation correctness). It also documents real 0.5 files with NO channel and NO time axes (XY, XYZ, XYZC) — the UI must hide/disable channel and time controls when axes are absent rather than assuming tczyx.
- open question: none.

### O-048
- source: S010 lines 602-631, 1017-1026
- quote: "0.2\n9838562.zarr\nbioformats2raw.layout" and "0.4\nMMStack_Pos9.ome.zarr\n2048\n2048\n6\n4\nXYZC\nCC BY 4.0\nidr0138\n2026-05-12"
- claim: The catalog contains 0.1/0.2/0.3 filesets still served (including a 0.2 b2r-layout fileset) and a 0.4 sample added 2026-05-12 — old-version data remains in active use.
- conditions: IDR catalog.
- implication: Local "OME-Zarr filesets" in the wild will include pre-0.5 versions; Plan's 0.5 framing should explicitly state the behavior for older versions (read via v2 path, or a clear unsupported message) rather than being silent.
- open question: product decision — is 0.4 support in scope for Slide Scout v1?

### O-049
- source: S004 lines 149-157
- quote: "This PR proposes to adopt the version 3 of the Zarr format for OME-Zarr.\nMain changes:\nOnly Zarr v3 is allowed for upcoming versions of OME-Zarr.\nZarr v3 stores its metadata in zarr.json files. ... The chunk_key_encoding of the Zarr arrays are respected instead of mandating the / dimension separator. Basically all Zarr features are available in OME-Zarr as they get approved through the ZEP process.\nAdd a ome namespace within the zarr.json attributes.\nMove version fields from multiscale, plate, well etc. up into the ome object.\nMove the registration of labels from the labels group into the multiscale group."
- claim: The (closed) ngff#206 PR is the origin of 0.5's storage design; it also references open follow-ups: ngff#207 "Single-scale images" (still Open per S004 lines 370-372) and #210 "Clarify version field" (Closed).
- conditions: PR opened Jul 2023 by normanrz (scalableminds/webknossos), closed (superseded by RFC-2 which landed as 0.5).
- implication: (a) Single-scale (non-pyramid) images remain an UNSPECED gap (ngff#207 open): 0.5's image.schema requires `multiscales`, so a lone array group is out-of-spec but plausible on disk (ome-zarr-py's Reader still renders raw arrays, O-019). Slide Scout should decide: render single-scale arrays with default 1.0 scale, or message "no multiscales metadata". (b) chunk_key_encoding respected — v2-style "." separators should not be assumed dead in mixed stores.
- open question: none.

### O-050
- source: S008 lines 148-163, 207-209
- quote: "This updates ome-zarr-py to use zarr-python v3 but doesn't include support for writing Zarr v3 (OME-Zarr v0.5).\nHowever, it does add support for reading OME-Zarr v0.5 (e.g. for use by napari-ome-zarr)." and "NB: if the image is bioformats2raw layout, you'll need to add /0 to the zarr url." and "Zarr v3 is not supported on python 3.9 or 3.10."
- claim: ome-zarr-py PR#404 added 0.5 READING via zarr-python v3 (writing deferred to #413); with it, b2r filesets still needed a manual `/0` suffix to open in napari; zarr-python v3 requires Python ≥3.11.
- conditions: PR Nov 2024–May 2025; test snippet uses zarr 3.0.8.
- implication: (a) The Python storage stack floor for 0.5 reading is zarr-python v3 on Python 3.11+ — a packaging constraint for a desktop app. (b) Even the reference implementer's workflow needed "open in Validator first" for b2r filesets — reinforcing that root-level multi-image discovery is the pain point Slide Scout targets.
- open question: none.

### O-051
- source: S008 lines 378-391; S052 lines 503-516
- quote: "However, in Zarr v3 with this branch, when you do this:\nstore = parse_url(path, mode=\"w\")\nit completely replaces EVERYTHING at path with an empty zarr group!\nThis is pretty scary!" (S008) and v0.12.1 release note "read_only if mode is 'r' by @will-moore in #474" (S052)
- claim: zarr-python v3 write-mode group creation wipes existing content; ome-zarr-py had to ship an explicit read-only-store fix (0.12.1 #474) after merging 0.5 support.
- conditions: zarr-python ~3.0.x era, May 2025; fix in ome-zarr-py 0.12.1.
- implication: "Source files must remain unchanged" (brief line 5) is enforced by opening stores read-only and nothing else; the ecosystem's own near-miss shows this needs a deliberate test (open a fileset, assert byte-identical afterwards / no new files created).
- open question: none.

### O-052
- source: S013 lines 149-166, 188-194; S052 lines 546-558
- quote: "NB: this is on top of #404 (reading OME-Zarr v0.5), which needs to be reviewed & merged first\nThis PR adds support for writing OME-Zarr v0.5, which becomes the default CurrentFormat()." and v0.12.0 body: "Ome zarr v0.5 reading and writing by @will-moore in https://github.com/ome/ome-zarr-py/pull/413"
- claim: ome-zarr-py shipped 0.5 read+write in release v0.12.0 (PR#413 merged); the default write format detection reads the group's Zarr version (v2 store → 0.4).
- conditions: 0.12.0 after May 2025; 0.15.0 later deprecated writing v01–v03 and fixed "downloading ome-zarr 0.5" (#562, S052 lines 331-343); sharding WRITE support only in v0.16.0 ("Support sharding by @melonora in #534", S052 lines 288-300); v0.19.0 relaxed 0.5 strictness for spatialdata-style files (#594) and added scene/v0.6 classes (#582/#605/#612).
- implication: The reference library's 0.5 support is RECENT and still moving (permissiveness, scenes, v0.6 classes landing through 0.19.x). A viewer pinning ome-zarr-py should pin ≥0.16 for sharding and expect API churn; "be more permissive with version 0.5" (#594) is evidence that strict 0.5 validation broke real files (spatialdata) — more support for advisory rather than hard validation in Slide Scout.
- open question: none.

### O-053
- source: S016 lines 368-371; S013 lines 151-151; S052 lines 546-548
- quote: "Changelog: added FormatV05 (May 2025): writing not supported yet" (S016 docstring) vs "This PR adds support for writing OME-Zarr v0.5" (S013, merged) and v0.12.0 release (S052)
- claim: CONTRADICTION within the pinned tree: format.py's FormatV05 docstring still says "writing not supported yet" while the same tree's `CurrentFormat = FormatV05` and the merged PR/release history show 0.5 writing had landed by v0.12.0.
- conditions: pinned commit 94eaf20 (post-#413 merge, pre-0.12.0 release, CHANGELOG S017 stops at 0.11.1).
- implication: Source comments can lag behavior; the corpus itself contains a stale docstring. For research claims: prefer code + release history over comments; do not cite S016's docstring as evidence that ome-zarr-py cannot write 0.5.
- open question: none.

### O-054
- source: S011 lines 141-177
- quote: "napari: 0.6.6\nnapari-ome-zarr: 0.6.1\nbioio-ome-zarr: 3.2.0\nzarr: 3.1.5 (upgraded from 2.18.7)\nome-zarr: 0.10.3" and "napari-ome-zarr depends on ome-zarr, which is pinned to zarr<3. When loading OME-Zarr files in napari, I now get:\nRuntimeError: Failed to import command at 'napari_ome_zarr._reader:napari_get_reader':\ncannot import name 'FSStore' from 'zarr.storage'" and "The default napari reader (without napari-ome-zarr plugin) does not correctly read OME-Zarr coordinate transformations/scale metadata, resulting in incorrect anisotropic volume rendering."
- claim: As of Dec 2025 the released napari-ome-zarr (0.6.1) was still incompatible with zarr≥3 (via ome-zarr 0.10.3 pin), producing import crashes in mixed environments; and napari's built-in zarr reader ignores `coordinateTransformations` entirely, so anisotropic voxels render with wrong proportions without the plugin.
- conditions: issue #139 (closed by #141); environment Windows, zarr 3.1.5.
- implication: (a) 0.5-capable readers only converged in 2026 releases (napari-ome-zarr 0.7.0 requires ome-zarr≥0.13.0, S064; 0.8.0 dropped the ome-zarr dependency entirely, S065) — recency of the reading stack is a genuine compatibility factor. (b) Scale metadata application is exactly the kind of correctness detail (anisotropic voxel size) Slide Scout's calibrated display must own; defaulting to isotropic voxels is a known ecosystem failure mode.
- open question: none.

### O-055
- source: S014 lines 135-143
- quote: "Viewing a 3-channel image (unit16). No well definitions. Using group 0 in bioformats2raw Zarr layout.\nVizarr works as expected for the image in OME-ZARR v0.4 format (written by NGFF-Converter):\nVizarr renders chunks repetitively for image data converted into OME-ZARR v0.5 format, using the resave command of https://github.com/ome/ome2024-ngff-challenge"
- claim: vizarr (as of Oct 2025, issue still open) renders 0.5 challenge-converted data with REPETITIVE CHUNKS — a real rendering-correctness bug specific to 0.5 (likely shard/chunk-grid mishandling), while the 0.4 version of the same image renders fine.
- conditions: vizarr issue #307, open; Firefox 143 and Chromium; 3-channel uint16.
- implication: 0.5 read paths are still buggy in established viewers. Slide Scout's acceptance should include pixel-content assertions (not just "opens without error") on sharded challenge-style data — e.g., compare a rendered tile hash against a direct array read, the exact failure class vizarr hit.
- open question: none.

### O-056
- source: S027 lines 150-172, 909, 1011; S065 lines 41-45
- quote: "This includes the functionality from un-merged Plate Labels Fix (ome/ome-zarr-py#207 with #54).\nAlso includes the handling of bioformats2raw, similar to behaviour from un-merged ome/ome-zarr-py#174" ... "This PR fixes a bunch of issues and I'm adding all the RFC5 / v0.6 stuff on top of it" (S027) and v0.8.0 release: "drop ome-zarr dependency ... Fixes Plate labels ... Handles `bioformats2raw.layout` specification: All images in the series are opened." (S065)
- claim: napari-ome-zarr 0.8.0 (published 2026-05-20) is the first release handling b2r series ("All images in the series are opened") and plate labels, via PR#123 which dropped the ome-zarr dependency; RFC-5/v0.6 work is being layered on main (matching S048's Scene/coordinateSystems code).
- conditions: releases v0.7.0 (2026-03-16, "require ome-zarr>=0.13.0") and 0.8.0 (2026-05-20).
- implication: The b2r multi-image capability the Plan assumes is cutting-edge even in the OME's own napari plugin (arrived May 2026). Its reader (S048) discovers series via OME-XML Image IDs (O-025) — Slide Scout should implement both discovery mechanisms (series attr + numbered groups + OME-XML) and can expect this area to still be settling.
- open question: none.

### O-057
- source: S038 lines 11, 34-58
- quote: "\"title\": \"viewing Zarr v3 and OME-Zarr\"" ... "I get: \"Neithre array nor OME multiscale metadata found\"" ... "This image has a single shard, but I don't see any failed requests"
- claim: neuroglancer could not open the ome2024-challenge 6001240.zarr at all in Oct 2024 ("Neither array nor OME multiscale metadata found"), and even the raw v3 array rendered nothing despite having "a single shard"; the issue was closed as completed Nov 2024 (neuroglancer/tensorstore gained zarr v3 support; cf. S034 lines 362-366 listing neuroglancer#606 as required work).
- conditions: neuroglancer#651, 9 comments (comments not captured), closed 2024-11-13.
- implication: Whole-image single shards (O-039) broke early adopters; the fix history lives in tensorstore/neuroglancer. Slide Scout's storage layer must demonstrably read single-shard-whole-image arrays.
- open question: none.

### O-058
- source: S044 lines 126-146, 185-209, 272-276
- quote: "`ome-zarr-py` does not work with auto-sharding · Issue #640" ... "KeyError: 'a'" ... "ValueError: Could not interpret 'a' as a byte unit"
- claim: ome-zarr-py writing with zarr-python's `shards: "auto"` storage option crashes ("Could not interpret 'a' as a byte unit") — the library's sharding write path (added 0.16.0) mishandles the "auto" value as of this issue.
- conditions: issue #640; ome-zarr-py writer.py line 859 rechunks by shards_opt; zarr-python with `array.target_shard_size_bytes`.
- implication: Sharding parameters in the wild include zarr-python's `"auto"` inference; readers must not assume explicit shard shapes. (Read-side impact unproven in corpus, but parameter diversity is the point.)
- open question: none.

### O-059
- source: S023 lines 150-152, 282-291; S017 lines 6-12
- quote: "With $ ome_zarr view my_image.zarr we can view a single zarr image (or plate etc) in the ome-ngff-validator by serving the image from a local python server." and "Handle plates with no wells" and 0.11.0 changelog: "Browse collection of local OME-Zarr in BioFile Finder ([#436])"
- claim: ome-zarr-py added a `view` command (PR#436, released 0.11.0) that serves LOCAL OME-Zarr over HTTP for browsing in BioFile Finder / the validator, including a patched edge case for "plates with no wells".
- conditions: ome-zarr-py 0.11.0 (April 2025).
- implication: (a) The ecosystem's answer to "local browsing" today is: serve HTTP, then use a web viewer. Slide Scout's direct local-filesystem reading (no server) is a real simplification opportunity but must re-implement what `ome_zarr view` users get free (validator cross-checks). (b) "Plates with no wells" is a confirmed edge case in real tooling — include in malformed/edge fixtures.
- open question: none.

### O-061
- source: S059 lines 132, 147-148, 223, 347
- quote: "version 2 of the Zarr specification ." and "├── .zgroup               # Each image is a Zarr group, or a folder, of other groups and arrays.\n├── .zattrs               # Group level attributes are stored in the .zattrs file" and "The various .zattrs files throughout the above array hierarchy may contain metadata" and "Each \"multiscales\" dictionary SHOULD contain the field \"name\". It SHOULD contain the field \"version\", which indicates the version of the multiscale metadata of this image (current version is 0.4)."
- claim: 0.4 (the version most existing filesets use) stores metadata in `.zgroup`/`.zattrs` sidecars with keys at the attributes top level; version strings live INSIDE `multiscales[0]`, `plate`, `well`, `image-label` objects — not in an `ome` namespace. Metadata content (multiscales/omero/labels/plate/well/b2r layout, S059 lines 233-304) is otherwise essentially the same as 0.5.
- conditions: 0.4 spec (0.4.1, 2023-02-09).
- implication: The ONLY structural difference a 0.4+0.5 dual reader needs at the metadata layer is "where the attributes live and where the version string lives" (cf. ome-zarr-py's `ome`-namespace unwrap + detect_format, O-014). This makes 0.4 tolerance cheap — strengthening the case for making it an explicit scope decision rather than an accident.
- open question: none.

### O-062
- source: S051 lines 126-130, 102-103, 106-123
- quote: "RFC-5: Coordinate Systems and Transformations#\nAdd named coordinate systems and expand and clarify coordinate transformations. This document represents the updated proposal following the original RFC5 proposal and incorporates feedback from reviewers and implementers.\nThis RFC is currently in RFC state S3 (Update implementations)." and sidebar items "RFC-6: Flattening the multiscales array", "RFC-7: Channel provenance", "RFC-8: Collections and Extensibility", "RFC-9: Zipped OME-Zarr", "RFC-3: more dimensions for thee", "RFC-4: Axis Anatomical Orientation"
- claim: The 0.6-direction RFC pipeline is active: RFC-5 (named coordinateSystems + expanded transforms — matching S048's scene code) is at state S3 "Update implementations" with responses dated 2025-10-07/2025-11-18; further RFCs cover >5 dimensions, axis orientation, flattening multiscales, channel provenance, collections, and ZIPPED OME-Zarr.
- conditions: RFC page capture (ngff.openmicroscopy.org/rfc/5/); none of these are released spec.
- implication: (a) Slide Scout should treat scene/coordinateSystems data as forward-compat-only (warn+degrade). (b) RFC-9 "Zipped OME-Zarr" is directly relevant to a local desktop viewer (a `.ome.zarr` zip as a single-file unit) — worth tracking, but not an obligation today. (c) RFC-3 (>5D) would break any hard 5D axis assumption; the corpus shows the ecosystem already meets >5D data (napari Scene code strips axes; features matrix RFC list).
- open question: none.

### O-063
- source: S041 lines 2-22; S037 lines 3-21
- quote: "The following versions of each viewer were used in testing:\n- napari 0.5.6 with plugin napari-ome-zarr 0.6.1 and ome-zarr 0.10.3." and "vizarr using current viewer April 2025." and "webKnossos version 24.11.0." and "OMERO with BioFormats ZarrReader 0.2.0."
- claim: The ome-ngff-tools compatibility matrix (O-041..O-046) was tested against napari 0.5.6 + napari-ome-zarr 0.6.1 + ome-zarr 0.10.3, vizarr (April 2025), BigDataViewer bundles, MoBIE 6.3.1, webKnossos 24.11.0, ZarrReader 0.2.0, Blender Microscopy Nodes 2.2.0 — i.e., BEFORE the 2026 zarr-v3-capable releases (napari-ome-zarr 0.7.0/0.8.0, ome-zarr-py ≥0.12).
- conditions: matrix dated ≈April–May 2025 by the vizarr entry.
- implication: QUALIFIES O-041–O-046: those results describe the 2025 reader generation. All matrix entries are 0.4-sample results; none establish 0.5 behavior. Slide Scout comparisons should re-run equivalents on current versions, using the matrix's sample list as the fixture set.
- open question: none.

### O-064
- source: S082 lines 55-55; S094 lines 39, 46-47
- quote: "The big assumption I am making is that OME-NGFF 0.4 is always zarrv2 and if we find a zarrv3 zarr.json file, then I am assuming a OME-NGFF 0.5 json file. A further PR can add some extra logic and validation around this but for now things seem to be working. Anything outside this assumption will error out in some way." (PR body) — merged_at "2025-03-22T23:13:29Z" (S094)
- claim: AGAVE enabled OME-NGFF 0.5 (PR#220, merged 2025-03-22) with the heuristic "zarr.json present ⇒ 0.5", explicitly loading no extra metadata at first and erroring on anything outside the assumption.
- conditions: agave repo, PR#220 = issue#220 "Read zarrv3 with OME-NGFF 0.5 json" (closed).
- implication: Even the closest analog desktop viewer treats 0.5 detection as a storage-version sniff, not metadata validation, and shipped before honoring omero/labels metadata. Slide Scout can be more metadata-faithful; but the heuristic confirms zarr.json presence is the practical 0.5 signal in the wild.
- open question: none.

### O-065
- source: S125 lines 55-55
- quote: "Once a url (http(s)) is provided, then Agave will attempt to load ome-zarr metadata. If such metadata is found, a dialog will pop up showing the multiresolution levels discovered. Users will be provided a memory estimate of the selected level. Users may also select a sub-region of interest in x,y,z." and "tensorstore is a google library that provides the underlying zarr loading support. it's pretty heavy in that it adds a lot to the build time of agave" and "a VERY small number of pixel formats and dimension configurations are currently supported for zarr."
- claim: AGAVE's zarr open-flow (issue #73): discover pyramid levels → dialog with per-level MEMORY ESTIMATE → optional XYZ sub-region → load. Implementation bound to tensorstore ("pretty heavy" build), with a deliberately tiny dtype/dimension support matrix at first.
- conditions: agave issue #73 (closed; the original zarr feature).
- implication: A concrete, shipped UX pattern for the Plan's "chooses an available pyramid level": show the user the levels and their memory cost instead of choosing silently. The memory-estimate + ROI pattern is a product opportunity for Slide Scout's large-dataset story; the "heavy dependency" note is direct evidence for weighing zarr-python vs tensorstore build cost (O-034, O-036).
- open question: none.

### O-066
- source: S103 lines 58-58; S104 lines 58-58; S105 lines 58-58
- quote: "Data loading currently blocks the whole application and is not easy to cancel. This is most obvious during a time series render when in between times, loading is blocking everything." (agave#84, OPEN) and "It can be slow to play through time. AGAVE currently only loads one timestep at a time." (agave#323, OPEN) and "make sure we are not double caching on disk thru tensorstore" (agave#402, closed)
- claim: In the closest shipping analog, asynchronous+cancellable loading is STILL an open issue (agave#84), time-series playback is per-timestep slow (#323), and the tensorstore cache needed explicit de-duplication work (#402).
- conditions: agave issues; #84/#323 open as of capture.
- implication: The Plan's background-reads + cancellation commitment (Plan line 7) is the hardest part of this product category in practice — peer evidence says it doesn't happen by default. Validation should include mid-load navigation and time-series stepping, and a cache-coherence check (stale tiles after level/time switches).
- open question: none.

### O-067
- source: S117 lines 26-28, 47, 98-134, 299-316, 551-552; S115 line 14
- quote: "AGAVE can load multi-scene, multi-time, and multi-channel files. It can present up to 4 channels concurrently and offers a time slider when time channels are detected." and "The OME-Zarr format supports precomputed multiresolution data and will let you select the resolution level." ... "You may choose to exclude certain channels from being loaded. All channels will be selected by default. If you leave channels out, be aware you will have to reload the file to get them back." ... "For OME-Zarr data, you may select a sub-region in X, Y, and Z." and timestamps "HH:MM:SS ... Time Units: the current time is shown using the physical time units" and labels "If your data is discrete labels such as a segmentation, you may use the final entry in the list, \"Labels\""; S115: "your image will appear grainy at first, but will refine over time"
- claim: AGAVE's OME-Zarr UX: max 4 concurrent channels; load dialog with level choice, initial time, channel exclusion (irreversible without reload), XYZ sub-region; timestamp overlay rendered in physical time units from axis metadata; a "Labels" colormap mode for segmentation data; progressive-refinement rendering.
- conditions: AGAVE docs (agave.rst, current main).
- implication: Concrete prior art for Slide Scout's channel/plane/overlay UI decisions — including the anti-pattern to avoid (channel exclusion at load that requires reload). Physical-unit time display is a small differentiating feature directly enabled by axis `unit` metadata (O-004). The 4-channel cap is a product choice, not a format constraint.
- open question: none.

### O-068
- source: S058 lines 255-258, 360-365
- quote: "WEBKNOSSOS works great with OME-Zarr datasets" and "This example will create a sharded Zarr v3 dataset with a voxel size of (11.24, 11.24, 25) nm3 and a chunk size of (64,64,64) voxel.\nUsing the --data-format zarr argument will produce unsharded Zarr v2 datasets."
- claim: WEBKNOSSOS documents both 0.4 and 0.5 layouts and its converter's DEFAULT output is sharded Zarr v3 (unsharded v2 requires opting out); it also streams multi-group datasets by importing "the first Zarr group and then use the UI to add more URIs/groups".
- conditions: WEBKNOSSOS docs (data/zarr.html), version 24.11.0 in the matrix.
- implication: A second major writer (with bioformats2raw and the challenge converter) defaults to sharded v3 — sharded reading is unavoidable for "real tool" filesets. WEBKNOSSOS's multi-group import pattern (add groups as layers) is another answer to multi-image filesets Slide Scout could echo in its image list.
- open question: none.

### O-069
- source: S035 lines 5043, 5129, 5215, 5387, 2704, 3943, 5301, 4500, 1340
- quote: "\"title\": \"No way to distinguish image and labels-image groups in 0.5\"" ... "\"title\": \"Relax \\\"labels must have colors\\\" constraint\"" ... "\"title\": \"Should labels paths point to multiscale images?\"" ... "\"title\": \"Label multiscales' reference to the `source.image` is broken; should label a coordinate system instead\"" ... "\"title\": \"OMERO schema is inconsistent with description\"" ... "\"title\": \"0.6rc0 schemas not served from homepage\"" and "\"title\": \".ozx technology compatibility kit\""
- claim: Open spec-level issues directly touching Slide Scout's features: (a) in 0.5 there is NO in-band way to tell a label image group from a normal image group except the parent's `labels` list; (b) the "labels must have colors" constraint is under debate; (c) label `source.image` path semantics are considered broken (RFC-5 direction); (d) the published OMERO schema is inconsistent with its description; (e) 0.6rc0 schemas already exist; (f) `.ozx` (zipped OME-Zarr, RFC-9) has a "technology compatibility kit" proposal.
- conditions: ome/ngff open-issue dump (100 items, capture undated but includes 0.6rc0 references → 2025-2026 era).
- implication: (a) means Slide Scout's image list may show label pyramids interleaved with images unless it resolves the parent `labels` lists — a discovery-correctness requirement the thin Plan doesn't mention. (c)+(d) mean label source resolution and omero parsing need tolerant implementations, not schema-strict ones. (e) confirms draft-0.6 data will appear in the wild (also O-022).
- open question: none.

### O-070
- source: S028 lines 2776, 4942, 5322, 5246, 1610, 2396, 4068, 4824
- quote: "\"title\": \"Could be useful if `io.parse_url` raises an Exception instead of returning `None`\"" ... "\"title\": \"Plate loading for wells with varying zyx dimensions\"" ... "\"title\": \"Handling “acquisitions” in plate & well reading\"" ... "\"title\": \"What to do with consolidated metadata?\"" ... "\"title\": \"download failing for RFC-5 CoordinateSystems group\"" ... "\"title\": \"FOV names and array names are hard-coded for the HCS dataset reader\""
- claim: Open ome-zarr-py issues document known traps: silent `None` returns from parse_url (no error signal); plate stitching breaks for wells with varying zyx dimensions; acquisitions handling incomplete; consolidated-metadata (`.zmetadata`) unresolved; RFC-5 coordinateSystem groups break download/reading; HCS reader hard-codes FOV/array names.
- conditions: ome-zarr-py open-issues dump (100 items).
- implication: Slide Scout's "Opening failures explain which image or data could not be displayed" (Plan line 7) must cover the silent-None pattern (a missing/invalid root should produce a message naming the path and the reason). If plate support is attempted, per-well shapes must be independent (varying zyx is real); plain numbered traversal can't assume FOV naming.
- open question: none.

### O-071
- source: S122 lines 58-58; S123 lines 58-58
- quote: "are there plans to implement the rectilinear chunk grid in tensorstore, which has been proposed as an extension for Zarr3? https://github.com/zarr-developers/zarr-extensions/pull/25" (tensorstore#288, open) and "when my chunk size gets too large with compression on, I receive this error ... Mismatch in \"codecs\": Cannot merge zarr codec constraints" (tensorstore#280, open)
- claim: The storage layer under AGAVE has open zarr-v3 gaps: the proposed rectilinear chunk-grid extension is unimplemented, and codec-constraint merging errors bite mixed chunking+compression setups.
- conditions: tensorstore issues #288/#280, open as of capture.
- implication: Zarr v3's feature surface is still expanding (chunk-grid extensions); a storage library pinned today will meet future grids it can't read. Slide Scout's error path must say "unsupported chunk grid/codec X in <array path>" rather than crashing — the failure mode is expected, not exceptional.
- open question: none.

### O-072
- source: S119 lines 68-68; S097 lines 15-1405 (titles); S114 lines 15-507 (titles)
- quote: "gpu memory leak when loading new image ... gpu memory only grows when loading new images and doesn't seem to free previous" (agave#276, OPEN) and titles "Feature/volumecache", "[volumecache 01/12] Add in-memory volume cache manager", "[volumecache 05/12] Persist volume cache entries to disk", "Feature/local zarr", "add support for S3 and gc urls to load zarr", "downsample data at load time"
- claim: AGAVE's post-release hardening included a 12-PR volume-cache series (memory + disk), local-zarr and cloud-URL loading as separate features, load-time downsampling, and still has an open GPU memory leak when switching images.
- conditions: agave issue/PR titles via search dumps (bodies only for #276).
- implication: Resource lifecycle (free the previous image's memory, bound the cache) is a first-class requirement for a long-running desktop viewer that the thin Plan omits. A distinguishing validation: open N large filesets sequentially and assert stable memory; cancel a load and assert no leak.
- open question: none.

### O-073
- source: S025 lines 79-92
- quote: "**Vizarr** supports viewing 2D slices of n-Dimensional Zarr arrays, allowing users to choose a single channel or blended composites of multiple channels during analysis." ... "Currently, Viv supports `int8`, `int16`, `int32`, `uint8`, `uint16`, `uint32`, `float32`, `float64` arrays"
- claim: vizarr's model is 2D-slice viewing of n-D arrays with per-channel compositing, over an 8-dtype set (int8/16/32, uint8/16/32, float32/64); it also accepts kerchunk reference stores and OME-TIFF URLs via protocol prefixes.
- conditions: vizarr README (main).
- implication: The 2D-slice + channel-composite model is the dominant interaction pattern for zarr viewers and matches the Plan's canvas+channels+plane design; the dtype list is a practical reference for Slide Scout's supported-dtype matrix (note it includes int32/float64 which AGAVE's zarr path does not, O-036 — viewers differ).
- open question: none.

### O-074
- source: S066 lines 1-27; S067 lines 1-15; S088 lines 1-40
- quote: "Both `desktop` and `web` depend on `core` ... it allows the application to be distributed both as a desktop application (internal-facing, more richly featured) ... and as a web application (external-facing, feature-limited)" (S066) and "Run `file-explorer-service` ... accessible from `http://localhost:9081/file-explorer-service`" (S067); S088 is a GitHub API rate-limit snapshot.
- claim: BioFile Finder — the Allen Institute's desktop file browser that pairs with AGAVE — is an Electron+React app whose file listing comes from a separate local HTTP `file-explorer-service`; S088 is a capture-infra artifact (rate limit), not evidence.
- conditions: biofile-finder dev docs; S088 has no research content.
- implication: The existing "desktop browser for local bioimaging filesets" ecosystem actually routes local reads through a local service; Slide Scout's in-process local reading is a genuine simplification but owns all filesystem-edge handling itself. S088 should be ignored as evidence.
- open question: none.

### O-075
- source: S070 lines 43-207
- quote: "A list of tools and libraries with OME-Zarr support." ... "Zarr viewers#" ... "Zarr converters (with a UI)#" ... "Zarr readers & writers#" with entries including "A spatial proteomics OME-Zarr viewer built in Rust.", "ome-writers: A Python library for streaming acquisition data to OME-Zarr", "A native .NET library for reading and writing Zarr microscopy data."
- claim: The official NGFF tools directory spans viewers (incl. a Rust viewer), UI converters (NGFF-Converter), converters (bioformats2raw etc.), reader/writer libraries (ome-zarr-py, ngio, ome-writers, .NET, Java), the validator, and JS rendering libraries (Viv, deck.gl layers).
- conditions: ngff.openmicroscopy.org/resources/tools capture.
- implication: "Interoperate with filesets from real OME-Zarr 0.5 tools" spans a wide writer zoo (Java, Python, Rust, .NET, cloud pipelines). Fixture selection should sample across at least two independent writer stacks (e.g., bioformats2raw/zarr-java AND ome2024-challenge/zarr-python) rather than one tool's output.
- open question: none.

### O-076
- source: S061 lines 15-17, 39, 83-84
- quote: "\"title\": \"Support remote ome-zarr\"" ... "This currently 'works' for https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0073A/9798462.zarr but is too slow to be very usable." ... "merged_at": "2024-09-16T13:09:14Z" (milestone "v0.6.0")
- claim: QuPath's OME-Zarr support (merged into v0.6.0, Sept 2024) launched with a performance caveat from the author himself: working but "too slow to be very usable".
- conditions: QuPath PR#1638; remote (HTTP) reading focus.
- implication: Performance is the recurring failure mode when general-purpose viewers bolt on OME-Zarr (QuPath too slow; napari plate zoom crash, O-046; zarr-python sharding slowness, O-034). The Plan's "Large dataset must not freeze interaction" acceptance line is where peer products actually fail; level-selection + lazy chunk reads + cancellation (Plan line 7) are the right levers and deserve the most validation effort.
- open question: none.







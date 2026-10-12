# Source index

This is the bounded evidence index for the investigator stage. The source-map.json file holds the full identity, version, access timestamp, locator, observed behavior, conditions and applicability for each ID. The browser tool does not expose per-page request timestamps; access_utc records the exact completion time of the batch call where that page was opened or re-opened.

## Standards and governing format/color references

- [STD-CIPA-EXIF31](https://www.cipa.jp/e/std/std-sec.html) — current Exif 3.1 version authority.
- [STD-PNG3](https://www.w3.org/TR/png-3/) — PNG transparency and color metadata, including signal precedence.
- [STD-ICC-2022](https://www.color.org/icc-1_specification/) — ICC.1:2022 v4.4 profile specification.

## Maintained implementations and alternatives

- [LIBVIPS-THUMBNAIL-817](https://www.libvips.org/API/8.17/ctor.Image.thumbnail.html), [LIBVIPS-CHECKLIST](https://www.libvips.org/API/current/developer-checklist.html), [LIBVIPS-RELEASE-8187](https://github.com/libvips/libvips/releases/tag/v8.18.7) — demand-driven thumbnailing, scaling/loader behavior and current release.
- [PILLOW-IMAGEOPS-123](https://pillow.readthedocs.io/en/stable/reference/ImageOps.html), [PILLOW-IMAGECMS-123](https://pillow.readthedocs.io/en/stable/reference/ImageCms.html), [PILLOW-SECURITY-123](https://pillow.readthedocs.io/en/stable/handbook/security.html) — orientation, resize, ICC and resource/privacy guidance.
- [IMAGEMAGICK-OPTIONS](https://imagemagick.org/command-line-options/), [IMAGEMAGICK-SECURITY](https://imagemagick.org/security-policy/) — resize/profile semantics and policy/resource controls.
- [RUST-IMAGE-02510](https://docs.rs/image/latest/image/struct.Limits.html), [RUST-IMAGE-DECODER-02510](https://docs.rs/image/0.25.10/image/trait.ImageDecoder.html), [RUST-IMAGE-ORIENTATION-02510](https://docs.rs/image/0.25.10/image/metadata/enum.Orientation.html) — Rust decoder, metadata, orientation and limits alternative.

## Regression and issue history

- [LIBVIPS-ISSUE-1523](https://github.com/libvips/libvips/issues/1523) — orientation metadata interaction after 8.9.0.
- [LIBVIPS-ISSUE-5195](https://github.com/libvips/libvips/issues/5195) — truncated image accepted by buffer/source thumbnail variants at report time.
- [LIBVIPS-ISSUE-4343](https://github.com/libvips/libvips/issues/4343) and [LIBVIPS-ISSUE-3159](https://github.com/libvips/libvips/issues/3159) — wide-gamut linear-light and CMYK/LAB observations.
- [PILLOW-ORIENTATION-HISTORY](https://github.com/python-pillow/Pillow/issues/8554) — TIFF/CR2 orientation report; linked PR #8556 and release notes are recorded in source-map.json.
- [EXIFTOOL-FAQ](https://exiftool.org/faq.html) — metadata deletion conditions, duplicates and preservation of color-space information.

## Stable source IDs

Do not silently rebind an ID to a different URL or release. If a later review finds a new build or changed source, add a new source ID and record the supersession explicitly.

## Container formats and auxiliary payloads

- [FORMAT-WEBP-RIFF](https://developers.google.com/speed/webp/docs/riff_container) — RIFF chunks for ICCP, EXIF, XMP, alpha, animation and unknown payloads.
- [FORMAT-AVIF-1_2_0](https://aomediacodec.github.io/av1-avif/v1.2.0.html) — AVIF item graph, alpha/depth auxiliaries, hidden gain maps, color and transform properties.
- [STD-CIPA-MPF](https://www.cipa.jp/e/std/std-sec.html) — CIPA Multi-Picture Format index; the accessible page has a version/date mismatch, so the exact current standard copy remains unresolved.


# Critic source index

Full identities, versions/commits, locators, access timestamps, observations, conditions, and applicability are in [source-map.json](../source-map.json). IDs below are stable within this stage. The libvips #5195 recheck uses a new ID because the source state changed after the investigator's check; the predecessor ID remains preserved in the investigator package.

## Formats and color

- [STD-PNG3](#std-png3) — [W3C PNG 3](https://www.w3.org/TR/png-3/): color-signal precedence, untagged RGB, alpha, privacy-relevant chunks.
- [FORMAT-WEBP-RIFF](#format-webp-riff) — [WebP Container Specification](https://developers.google.com/speed/webp/docs/riff_container): ICCP/default, alpha, frames, metadata and unknown chunks.
- [FORMAT-AVIF-1_2_0](#format-avif-1_2_0) — [AVIF 1.2.0](https://aomediacodec.github.io/av1-avif/v1.2.0.html): auxiliary and derived images, properties and item relations.
- [STD-ICC-2022](#std-icc-2022) — [ICC.1 v4](https://www.color.org/icc-1_specification/): v4.4 profile specification/version information.
- [STD-CIPA-EXIF31](#std-cipa-exif31) — [CIPA standards index](https://www.cipa.jp/e/std/std-sec.html): current Exif 3.1 authority.
- [STD-CIPA-MPF](#std-cipa-mpf) — [CIPA standards index](https://www.cipa.jp/e/std/std-sec.html): 2026 MPF listing with unresolved card-date discrepancy.

## Implementations and limits

- [LIBVIPS-THUMBNAIL-817](#libvips-thumbnail-817) — [libvips 8.17 thumbnail API](https://www.libvips.org/API/8.17/ctor.Image.thumbnail.html): orientation-aware shrink, color/profile options, frame and fail_on defaults.
- [LIBVIPS-CHECKLIST](#libvips-checklist) — [libvips programmer checklist](https://www.libvips.org/API/current/developer-checklist.html): optimization, alpha premultiplication, progressive-JPEG memory behavior.
- [LIBVIPS-RELEASE-8187](#libvips-release-8187) — [libvips v8.18.7](https://github.com/libvips/libvips/releases/tag/v8.18.7): tagged version and release date.
- [PILLOW-IMAGEOPS-123](#pillow-imageops-123) — [Pillow ImageOps 12.3.0](https://pillow.readthedocs.io/en/stable/reference/ImageOps.html): EXIF transpose and geometry helpers.
- [PILLOW-IMAGECMS-123](#pillow-imagecms-123) — [Pillow ImageCms 12.3.0](https://pillow.readthedocs.io/en/stable/reference/ImageCms.html): ICC transforms, modes and intent defaults.
- [PILLOW-SECURITY-123](#pillow-security-123) — [Pillow security handbook 12.3.0](https://pillow.readthedocs.io/en/stable/handbook/security.html): pixel and CPU limits.
- [IMAGEMAGICK-OPTIONS](#imagemagick-options) — [ImageMagick command-line options](https://imagemagick.org/command-line-options/): pixel-cache controls, ordered profiles and resize filters.
- [IMAGEMAGICK-SECURITY](#imagemagick-security) — [ImageMagick security policy](https://imagemagick.org/security-policy/): coder/path/resource policy conditions.
- [RUST-IMAGE-02510](#rust-image-02510) — [Rust image 0.25.10 limits](https://docs.rs/image/0.25.10/image/struct.Limits.html): strict dimension versus non-strict allocation caps.
- [RUST-IMAGE-DECODER-02510](#rust-image-decoder-02510) — [Rust image 0.25.10 decoder API](https://docs.rs/image/0.25.10/image/trait.ImageDecoder.html): optional metadata methods and concrete-decoder coverage.
- [RUST-IMAGE-ORIENTATION-02510](#rust-image-orientation-02510) — [Rust image 0.25.10 orientation](https://docs.rs/image/0.25.10/image/metadata/enum.Orientation.html): eight transforms and EXIF reset behavior.

## Regression, release and privacy history

- [LIBVIPS-ISSUE-1523](#libvips-issue-1523) — [libvips issue #1523](https://github.com/libvips/libvips/issues/1523): historical autorot/thumbnail_image issue and later fix.
- [LIBVIPS-ISSUE-5195-RECHECK-20261012](#libvips-issue-5195-recheck-20261012) — [libvips issue #5195](https://github.com/libvips/libvips/issues/5195): truncated JPEG behavior, status rechecked as closed.
- [LIBVIPS-PR-5235](#libvips-pr-5235) — [libvips PR #5235](https://github.com/libvips/libvips/pull/5235): fail_on forwarding fix merged to master.
- [PILLOW-ORIENTATION-HISTORY](#pillow-orientation-history) — [Pillow issue #8554](https://github.com/python-pillow/Pillow/issues/8554): CR2/TIFF orientation history and fix.
- [EXIFTOOL-FAQ](#exiftool-faq) — [ExifTool FAQ](https://exiftool.org/faq.html): duplicate tags, GPS groups, metadata and color-space removal.

## Stable source records

### STD-PNG3

See [PNG 3](https://www.w3.org/TR/png-3/) and the complete [source-map record](../source-map.json).

### FORMAT-WEBP-RIFF

See [WebP Container Specification](https://developers.google.com/speed/webp/docs/riff_container) and the complete [source-map record](../source-map.json).

### FORMAT-AVIF-1_2_0

See [AVIF 1.2.0](https://aomediacodec.github.io/av1-avif/v1.2.0.html) and the complete [source-map record](../source-map.json).

### STD-ICC-2022

See [ICC.1 v4 specification index](https://www.color.org/icc-1_specification/) and the complete [source-map record](../source-map.json).

### STD-CIPA-EXIF31

See the [CIPA Exif 3.1 listing](https://www.cipa.jp/e/std/std-sec.html) and the complete [source-map record](../source-map.json).

### STD-CIPA-MPF

See the [CIPA MPF listing](https://www.cipa.jp/e/std/std-sec.html) and the complete [source-map record](../source-map.json).

### LIBVIPS-THUMBNAIL-817

See the [libvips 8.17 thumbnail API](https://www.libvips.org/API/8.17/ctor.Image.thumbnail.html) and the complete [source-map record](../source-map.json).

### LIBVIPS-CHECKLIST

See the [libvips programmer checklist](https://www.libvips.org/API/current/developer-checklist.html) and the complete [source-map record](../source-map.json).

### LIBVIPS-RELEASE-8187

See the [v8.18.7 release](https://github.com/libvips/libvips/releases/tag/v8.18.7) and the complete [source-map record](../source-map.json).

### LIBVIPS-ISSUE-1523

See [issue #1523](https://github.com/libvips/libvips/issues/1523) and the complete [source-map record](../source-map.json).

### LIBVIPS-ISSUE-5195-RECHECK-20261012

See [issue #5195](https://github.com/libvips/libvips/issues/5195) and the complete [source-map record](../source-map.json).

### LIBVIPS-PR-5235

See [PR #5235](https://github.com/libvips/libvips/pull/5235) and the complete [source-map record](../source-map.json).

### PILLOW-IMAGEOPS-123

See [Pillow ImageOps 12.3.0](https://pillow.readthedocs.io/en/stable/reference/ImageOps.html) and the complete [source-map record](../source-map.json).

### PILLOW-IMAGECMS-123

See [Pillow ImageCms 12.3.0](https://pillow.readthedocs.io/en/stable/reference/ImageCms.html) and the complete [source-map record](../source-map.json).

### PILLOW-SECURITY-123

See [Pillow security handbook 12.3.0](https://pillow.readthedocs.io/en/stable/handbook/security.html) and the complete [source-map record](../source-map.json).

### PILLOW-ORIENTATION-HISTORY

See [Pillow issue #8554](https://github.com/python-pillow/Pillow/issues/8554) and the complete [source-map record](../source-map.json).

### IMAGEMAGICK-OPTIONS

See [ImageMagick command-line options](https://imagemagick.org/command-line-options/) and the complete [source-map record](../source-map.json).

### IMAGEMAGICK-SECURITY

See [ImageMagick security policy](https://imagemagick.org/security-policy/) and the complete [source-map record](../source-map.json).

### RUST-IMAGE-02510

See [Rust image 0.25.10 Limits](https://docs.rs/image/0.25.10/image/struct.Limits.html) and the complete [source-map record](../source-map.json).

### RUST-IMAGE-ORIENTATION-02510

See [Rust image 0.25.10 Orientation](https://docs.rs/image/0.25.10/image/metadata/enum.Orientation.html) and the complete [source-map record](../source-map.json).

### RUST-IMAGE-DECODER-02510

See [Rust image 0.25.10 ImageDecoder](https://docs.rs/image/0.25.10/image/trait.ImageDecoder.html) and the complete [source-map record](../source-map.json).

### EXIFTOOL-FAQ

See the [ExifTool FAQ](https://exiftool.org/faq.html) and the complete [source-map record](../source-map.json).

# Terminal images: kitty graphics protocol, iTerm2 inline images, sixel (implementer's reference)

Written 2026-10-09 for `js/30-images.js`, `js/31-kitty-diacritics.js`, `js/32-sixel.js` and `js/34-iterm.js`. It is
precise enough to code from without opening the specs. Where kitty's code and its spec text differ, both are given and
the kitty behaviour is marked "kitty does", because clients (icat, chafa, yazi, neovim) are tested against kitty.

Sources, fetched 2026-10-09 (SHA-256 prefix of the fetched file in brackets):

- Spec, GitHub master (newest; the published site does not yet have the 2026-09-14 hardening paragraph):
  https://github.com/kovidgoyal/kitty/blob/master/docs/graphics-protocol.rst [3d5982b1adc57423]. Last commit touching
  it: 87ab3e98f4d3 (2026-09-14). kitty master head at fetch time: 851cb804ff37.
- Published spec: https://sw.kovidgoyal.net/kitty/graphics-protocol/
- Implementation: https://github.com/kovidgoyal/kitty/blob/master/kitty/graphics.c [74c38613f7000c70],
  `kitty/screen.c` [f8119c6ed47b1754] (placeholders, cursor), `kitty/utils.py` [dadc8777b3fd8a55] (path checks),
  `kitty/vt-parser.c`, `kitty/png-reader.c`, `gen/apc_parsers.py` (key table), `kitty/cursor.c` (SGR colour encoding).
- 2026-09-14 hardening commit: https://github.com/kovidgoyal/kitty/commit/87ab3e98f4d399337777e4329960d7cd09101e99
  [patch 05e09c1bd3e5c9ae], shipped in kitty 0.49.0 (2026-09-21).
- Usage hint `N=`: https://github.com/kovidgoyal/kitty/commit/89946ebc078a (2026-06-19, "make N a transient usage-hints
  bitmask") and https://github.com/kovidgoyal/kitty/commit/d994a47fc8c5 (docs section, PR #10092); shipped in kitty
  0.48.0 (2026-07-18). It replaced cc2d7a178970 (2026-05-30), where `N=1` meant "memory only".
- icat: https://github.com/kovidgoyal/kitty/tree/master/kittens/icat (`main.py` [7a58c71b023d61d6] options,
  `transmit.go` [2cd442252149dbdb], `detect.go`, `main.go`, `process_images.go`) and the shared serializer
  https://github.com/kovidgoyal/kitty/blob/master/tools/tui/graphics/command.go [b9d0cb3d2ae47588].
- Diacritics table: https://raw.githubusercontent.com/kovidgoyal/kitty/master/gen/rowcolumn-diacritics.txt
  (SHA-256 a80368b3272c41d8b50f3f640cf4305b6423e5a1aae6b72a405129bc29425f2c, 297 entries).

---------------------------------------------------------------------------------------------------------------------

## 1. Framing

```
ESC _ G <control data> ; <payload> ESC \          (APC, 0x1B 0x5F 'G' ... 0x1B 0x5C)
ESC _ G <control data> ESC \                      (no payload: the ';' may be omitted)
```

- Control data: comma-separated `key=value`. Keys are single ASCII letters (case-sensitive). Leading or trailing
  commas are undefined since 2026-08-20 (commit 9b29654e9017): "implementations may ignore them or reject the escape
  code entirely". Recommendation: reject (drop silently).
- Values are one of three types (from `gen/apc_parsers.py`): a single character flag (`a`, `t`, `o`, `d`), an
  unsigned 32-bit integer, or a signed 32-bit integer (`z`, `H`, `V`). "All integers are 32-bit."
- Payload: RFC 4648 base64 of binary data. The decoder must accept unpadded base64: kitty's own icat and every
  kitty kitten encode with Go `base64.RawStdEncoding` (no `=` padding).
- Malformed control data (unknown key, missing `=`, non-digit in an integer, unknown flag value, number above
  4294967295, invalid base64) is logged by kitty and the command is dropped with NO response
  (`REPORT_ERROR` in the generated parser only logs).
- kitty's longest accepted escape code when the terminator is not yet buffered: `MAX_ESCAPE_CODE_LENGTH` =
  1 MiB / 4 = 262,144 bytes (`kitty/vt-parser.c`); a complete APC already in the buffer is accepted whatever its size.
- A terminal that does not implement the protocol ignores APC. Most do, which is what makes the DA1 probe work.

### 1.1 Control keys (every key, type, default, meaning)

The same letter means different things per action. Columns: key, type, default, meaning by action.

| Key | Type | Default | Meaning |
|---|---|---|---|
| `a` | flag `t T q p d f a c` | `t` | Action: `t` transmit, `T` transmit and display, `q` query, `p` put (display), `d` delete, `f` transmit animation frame, `a` control animation, `c` compose frames |
| `q` | uint `0 1 2` | 0 | Quiet: 1 suppresses OK responses, 2 suppresses OK and error responses |
| `f` | uint `24 32 100` | 32 | Pixel format: 24 RGB, 32 RGBA, 100 PNG |
| `t` | flag `d f t s` | `d` | Transmission medium: direct, file, temp file, shared memory |
| `s` | uint | 0 | Width of the sent image in pixels (required for f=24/32). In `a=a`: animation state |
| `v` | uint | 0 | Height of the sent image in pixels (required for f=24/32). In `a=a`: loop count |
| `S` | uint | 0 | Number of bytes to read from a file/shm (0 = to end). Required with `f=100,o=z` |
| `O` | uint | 0 | Byte offset into the file/shm |
| `i` | uint 0..4294967295 | 0 | Image id (0 = none) |
| `I` | uint 0..4294967295 | 0 | Image number (terminal assigns the id) |
| `p` | uint 0..4294967295 | 0 | Placement id |
| `o` | flag `z` | none | Compression: `z` = RFC 1950 zlib deflate, applied before base64 |
| `m` | uint `0 1` | 0 | More chunks follow (1) or this is the last (0) |
| `N` | bitmask | 0 | Usage hints. Bit 1 = transient. Only on transmit/frame commands; "no effect on placement commands" |
| `x` | uint | 0 | p/T: left edge of source rect (px). f: left of frame data rect. c: left of destination rect. d: column (1-based) |
| `y` | uint | 0 | p/T: top of source rect (px). f: top of frame data rect. c: top of destination rect. d: row (1-based) |
| `w` | uint | 0 | p/T: source rect width (px, 0 = to image edge). c: rect width (0 = full image) |
| `h` | uint | 0 | p/T: source rect height (px, 0 = to image edge). c: rect height (0 = full image) |
| `X` | uint | 0 | p/T: x offset inside the first cell (px). f: composition mode (1 = overwrite, else alpha blend). c: source rect left |
| `Y` | uint | 0 | p/T: y offset inside the first cell (px). f: background colour, 32-bit RGBA (`0xRRGGBBAA`). c: source rect top |
| `c` | uint | 0 | p/T: columns to display over. f: 1-based base frame. a: 1-based frame to make current. c: 1-based destination frame |
| `r` | uint | 0 | p/T: rows to display over. f: 1-based frame being edited. a: 1-based frame whose gap is set. c: 1-based source frame. d=f: 1-based frame to delete |
| `C` | uint | 0 | p/T: cursor policy, 1 = do not move. c: composition mode (1 = overwrite) |
| `U` | uint | 0 | p/T: 1 = create a virtual placement for Unicode placeholders |
| `z` | int32 | 0 | p/T: z-index. f and a: frame gap in ms. d=q/z: z-index to match |
| `P` | uint | 0 | p/T: parent image id (relative placement) |
| `Q` | uint | 0 | p/T: parent placement id |
| `H` | int32 | 0 | p/T: horizontal offset in cells from the parent |
| `V` | int32 | 0 | p/T: vertical offset in cells from the parent |
| `d` | flag `a A c C f F i I n N p P q Q r R x X y Y z Z` | `a` | Delete selector (section 9) |

kitty stores these in unions (`kitty/graphics.h`): `C`/compose mode, `X`/blend mode, `Y`/bgcolor, `s`/animation state,
`v`/loop count, `r`/frame number, `c`/other frame number, `z`/gap share storage. Parse once into a flat struct and let
each action read the letters it needs.

`i` and `I` together in any command is an error: `EINVAL:Must not specify both image id and image number`, unless
silenced.

## 2. Actions

| `a` | What it does | Needs |
|---|---|---|
| `t` | Transmit (store) image data. No placement. | `s,v` for f=24/32 |
| `T` | Transmit, then place at the cursor with the display keys of the same command. | as `t` |
| `q` | Load the data as `t` would, report OK or an error, but never store it and never replace an image with the same id. Response uses `i` only. | `i` (without `i` kitty logs "Query graphics command without image id" and sends nothing) |
| `p` | Place a previously transmitted image at the cursor. | `i` or `I` (neither: logged, no response) |
| `d` | Delete placements and/or images (section 9). Also aborts any chunked upload in progress. | depends on `d` |
| `f` | Transmit data for an animation frame (section 12). | `i` or `I`, unless it continues a chunked frame upload |
| `a` | Control animation (section 12). | `i` or `I` |
| `c` | Compose a rectangle from one frame onto another (section 12). | `i` or `I` |

Re-transmitting data for an existing id deletes the old image and all of its placements; the new data is not shown
until a placement is created for it (note added in kitty 0.42.2).

kitty answers `a=T` from the transmit step: the response is built before the placement step runs, so a placement error
inside `a=T` (for example `ENOPARENT`) is never reported. Clients that need placement errors use `a=t` then `a=p`.

## 3. Pixel data

- `f=24`: 3 bytes per pixel, sRGB, row-major, no padding. Exactly `3*s*v` bytes after decompression.
- `f=32` (default): 4 bytes per pixel RGBA, sRGB, straight (not premultiplied) alpha. Exactly `4*s*v` bytes.
- `f=100`: a PNG file; width and height come from the PNG. With `o=z` the client must also send `S` (size of the
  compressed PNG data).
- `o=z`: zlib (RFC 1950) applied to the pixel or PNG bytes before base64. Any other `o` value:
  `EINVAL:Unknown image compression: <c>`.
- Zero `s` or `v` for f=24/32: `EINVAL:Zero width/height not allowed`. Unknown `f`: `EINVAL:Unknown image format: <n>`.
- Data size mismatch after decode: `EINVAL:Image dimensions: <w>x<h> do not match data size: <n>, expected size: <m>`.
  Too little data: `ENODATA:Insufficient image data: <got> < <want>` (direct), or the generic file error (section 4.2).
- kitty limits: width or height above 10,000 px is `EINVAL:Image too large, width or height greater than 10000`
  (`MAX_IMAGE_DIMENSION`; for PNG the decoder reports `ENOMEM:PNG image is too large`); total compressed or PNG data
  above 400,000,000 bytes is `EFBIG:Too much data` (`MAX_DATA_SZ = 4 * 100000000`); a PNG `S` above that is
  `EINVAL:PNG data size too large`. A broken PNG is `EBADPNG:<libpng message>`.
- Inflate failure: `EINVAL:Failed to inflate image data with error: <zlib message>`; wrong inflated size:
  `EINVAL:Image data size post inflation does not match expected size`.

## 4. Transmission media (`t=`)

| `t` | Payload is | Rule |
|---|---|---|
| `d` | the data itself (base64), possibly chunked with `m` | default |
| `f` | base64 of an absolute file path | "A simple file (regular files only, not named pipes, device files, etc.)" |
| `t` | base64 of a temp file path | read, then delete, but only under the temp-dir and name rules below |
| `s` | base64 of a POSIX shm name (Windows: a named shared memory object) | "On POSIX SHM names **must** start with a `/` and have no other `/` characters and must be no longer than the maximum SHM name size supported by the OS". Read, then `shm_unlink` + close (POSIX) or just close (Windows) |

`S` and `O` select a byte range for `f`, `t` and `s` (example: `t=s,S=80,O=10` reads 80 bytes from offset 10).
kitty: a path or name payload longer than 2048 bytes is `EINVAL:Filename too long`. Unknown `t`:
`EINVAL:Unknown transmission type: <c>`.

### 4.1 Hardening rules (quoted from the spec, master, 2026-09-14)

> When opening files, the terminal emulator must follow symlinks. In case of symlink loops or too many symlinks, it
> should fail and respond with an error, similar to reporting any other kind of I/O error. Since the file paths come
> from potentially untrusted sources, terminal emulators **must** refuse to read any device/socket/etc. special files.
> Only regular files are allowed. Additionally, terminal emulators may refuse to read files in *sensitive* parts of the
> filesystem, such as `/proc`, `/sys`, `/dev`, etc. These checks should be made on the path *before* the file is
> opened, since merely opening a file can have side-effects.

> Because the escape codes can be emitted by a program running on a remote machine over SSH or by a sandboxed process,
> the terminal emulator **must not** allow such a program to use the responses to these commands to learn anything
> about files it cannot read itself. In particular, all failures to read an image file, be it because the file does
> not exist, is not readable, is not a regular file, lies in a sensitive location or is smaller than the client
> claimed, must be reported with a single, identical, error response. kitty answers with
> `EBADF:Failed to read image file` for all of these and writes the actual reason to its log, which only the local
> user can see.

Temp files (`t=t`), from the medium table:

> A temporary file, the terminal emulator will delete the file after reading the pixel data. For security reasons the
> terminal emulator should only delete the file if it is in a known temporary directory, such as `/tmp`, `/dev/shm`,
> `TMPDIR env var if present` and any platform specific temporary directories and the file has the string
> `tty-graphics-protocol` in its full file path.

### 4.2 What kitty does, step by step (graphics.c `load_image_data_from_file`, utils.py)

The exact error response for every read failure of `t=f`, `t=t`, `t=s`, including a short read and a failed mmap of
shm, is the single string:

```
EBADF:Failed to read image file
```

(`IMAGE_FILE_ERROR_CODE "EBADF"`, `IMAGE_FILE_ERROR_MSG "Failed to read image file"`). Before 2026-09-14 kitty sent
`EBADF:Failed to open file for graphics transmission with error: [errno] ...`, `EPERM:Permission denied to read image
file`, `EIO:...`, `ENOMEM:...`, and `ENODATA:Insufficient image data: <n> < <m>` (which leaked the file size). All of
these are now the one string above for file media; `ENODATA` with sizes remains only for `t=d`.

1. `t=s`: the name must start with `/`, else the generic error. `shm_open(name, O_RDONLY)`. No path policy check
   (shm names are not paths), and the regular-file check is skipped for shm because macOS shm fds do not report as
   regular files.
2. `t=f` / `t=t`, before opening (`is_ok_to_read_image_path`): empty path refused; resolve with
   `realpath` + `abspath` (this follows symlinks); if the first component is `sys` or `proc`, refuse; if it is `dev`,
   refuse unless the path is under `/dev/shm/` (needs at least `/dev/shm/<name>`). Refusal is the generic error.
3. Open with `O_CLOEXEC | O_RDONLY | O_NONBLOCK` (non-blocking so a FIFO cannot hang the terminal). A symlink loop
   fails here with ELOOP, reported as the generic error. Open failure of any kind: the generic error.
4. After opening (`is_ok_to_read_image_file`): repeat the path check (the path may have been swapped between check and
   open), then `stat(path, follow_symlinks)` and `fstat(fd)` must be the same file (`os.path.samestat`), and the fd
   must be `S_ISREG`. Any failure: the generic error.
5. Read with `pread` from `O`, at most `S` bytes (or to EOF when `S=0`); for uncompressed RGB/RGBA kitty reads no more
   than the expected `w*h*bpp`. A short read: the generic error (never `ENODATA` for files).
6. The fd is closed on every path (the 2026-09-14 fd-leak fix: before it, a client could exhaust the process fd limit
   by asking for files it may not read).
7. Deletion: only if the open in step 3 succeeded ("Client created temporary files and shared memory objects that were
   successfully opened are removed even when loading fails"):
   - `t=t` and the full path contains `tty-graphics-protocol`: kitty's `safe_delete_temp_file` deletes only when
     `is_path_in_temp_dir(path)`: the realpath starts with the realpath of `/tmp`, `/dev/shm`, `$TMPDIR` or
     `tempfile.gettempdir()`. Otherwise the file is left alone.
   - `t=s`: always `shm_unlink(name)` after opening, success or failure.
   - `t=f`: never deleted.

Puppet Master rules (ARCHITECTURE.md `ctx.remote`; D14; BRIEF item 3): when the session is remote (inside the
simulated ssh), `t=f`, `t=t` and `t=s` are refused with the same `EBADF:Failed to read image file`; no error message
ever echoes client text (kitty echoes flag characters and numbers in some EINVAL messages; PM uses fixed strings).

## 5. Chunking (`m=`)

- Base64-encode the whole payload first, then split into chunks "no larger than `4096` bytes. All chunks, except the
  last, must have a size that is a multiple of 4." `m=1` on every chunk but the last, `m=0` (or no `m`) on the last.
- The first chunk carries all control keys. "Subsequent chunks **must** have only the `m` and optionally `q` keys.
  When sending animation frame data, subsequent chunks **must** also specify the `a=f` key."
- "The client **must** finish sending all chunks for a single image before sending any other graphics related escape
  codes." "The cursor position used to display the image **must** be the position when the final chunk is received."
  "Terminals must not display anything, until the entire sequence is received and validated."
- What a terminal must accept in practice: kitty's own icat and kittens send base64 chunks of 128 KiB (131,072 bytes;
  `chunk_size = 128 * 1024` in `tools/tui/graphics/command.go`), unpadded, and repeat `a=` and `q=` on every
  continuation chunk (so continuation chunks of an `a=T` upload carry `a=T`). Payloads up to 2048 bytes are sent
  uncompressed in one command; larger non-PNG payloads are zlib-compressed when that makes them smaller.
- kitty treats any `t=d` command arriving while an upload is in progress as a continuation, whatever its other keys
  (`if (tt == 'd' && currently_loading) init_img = false`). A continuation for an image that has since vanished is
  `EILSEQ:More payload loading refers to non-existent image`.
- What aborts an upload: "If an image is being loaded in chunks and the upload is not complete when any delete command
  is received, the partial upload must be aborted" (since kitty 0.38, commit 70d72b22d89e). In kitty the upload is
  also discarded by any error during it (each `ABRT` frees the load buffer), by a new transmit with `t` other than `d`,
  and when raw data overflows the expected size (`EFBIG:Too much data`, buffer = expected size + 10 bytes, or + 1024
  when compressed).
- Responses: none for intermediate chunks; one response after the final chunk, built from the first chunk's keys
  (`q` on a later chunk overrides).

## 6. Responses

Format (APC back to the program):

```
ESC _ G i=<id>[,I=<number>][,p=<placement id>][,r=<frame>] ; <message> ESC \
```

- `<message>` is `OK` or `<CODE>:<detail>`: printable ASCII and spaces only. kitty caps it at 512 bytes.
- `i=` is present when the command had an id (or the terminal assigned one for `I`), `I=` when the command had an
  image number, `p=` when the command had a placement id, `r=` for `a=f` and `a=a` responses when a frame number
  applies. Example from the spec: `ESC _ G i=99,I=13;OK ESC \` (image number 13 got id 99).
- A response is sent only when the command had `i` or `I`. Commands with neither never get a response, even on error.
- `q=0`: OK and errors are sent. `q=1`: errors only. `q=2`: nothing. kitty also skips the OK when no data finished
  loading (intermediate chunks).
- Commands that respond: `t`, `T`, `q`, `p`, `f`, `c`. `a=a` and `a=d` never respond in kitty.
- Support probe: `ESC _ G i=31,s=1,v=1,a=q,t=d,f=24;AAAA ESC \ ESC [ c`. A terminal that supports the protocol "must
  reply to *query actions* immediately without processing other input"; DA1 arriving without a graphics reply means
  no support.

### 6.1 Every error code kitty sends

| Code | When (kitty message, abbreviated) |
|---|---|
| `ENOENT` | `a=p` image id/number not found ("Put command refers to non-existent image with id: N and number: N"); image whose data failed to load; `a=f`/`a=a`/`a=c` image not found ("Animation command refers to non-existent image"); `a=c` source or destination frame missing; an ancestor of a relative placement vanished |
| `EINVAL` | `i` and `I` together; zero width/height; unknown format, compression or transmission; filename over 2048 bytes; image over 10,000 px; PNG `S` over 400,000,000; dimension/data mismatch; inflate failure; frame larger than the image; `a=f` base frame missing; `a=c` rectangle out of bounds or overlapping in the same frame; virtual placement (`U=1`) given a parent; a placement that is its own parent |
| `EBADF` | Any read failure of `t=f`, `t=t`, `t=s`: always exactly `EBADF:Failed to read image file` |
| `ENODATA` | Direct transmission ended with fewer bytes than `s*v*bpp` ("Insufficient image data: N < M"); short frame data |
| `ENOSPC` | Storing image or frame data in the cache failed; frame cache would exceed 5x the quota ("Cache size exceeded cannot add new frames"); compose made a frame too big to store |
| `EFBIG` | Direct data larger than expected, or PNG/compressed data above 400,000,000 bytes ("Too much data") |
| `ENOMEM` | Allocation failed; zlib init failed; PNG over 10,000 px ("PNG image is too large") |
| `EILSEQ` | A continuation chunk for an image that no longer exists |
| `EBADPNG` | libpng could not decode the PNG |
| `ETOODEEP` | Relative placement chain deeper than 8 ("Too many levels of parent references") |
| `ECYCLE` | Relative placement would form a cycle ("This parent reference creates a cycle") |
| `ENOPARENT` | `P` image does not exist, has no placements, or `Q` placement does not exist |

Removed on 2026-09-14 for file media: `EPERM` ("Permission denied to read image file") and `EIO`. Malformed control
data never gets a response (section 1).

## 7. Image ids, image numbers, placement ids

- Image id `i`: client-chosen, 1..4294967295, global per screen buffer. Reusing an id replaces the image (and deletes
  its placements).
- Image number `I`: for programs that share the screen and cannot know free ids. "These numbers are not unique. When
  creating a new image, even if an existing image has the same number a new one is created", and the terminal answers
  with a fresh id: `i=<new id>,I=<number>;OK`. Every later command by number acts on the newest image with that number.
  kitty picks the id with `get_free_client_id`.
- Placement id `p`: 1..4294967295. A placement is identified by the pair (image id, placement id). A second `a=p` with
  the same pair replaces the first (move or resize without flicker). `p` on an image without an id (id 0) is ignored.
  `p=0` or no `p` with repeated `a=p` creates additional placements.
- Images with id 0 (no `i`, no `I`): freed as soon as their last placement goes, even with a lowercase delete; kitty
  also trims, before every new transmit, images that never finished loading and id-0 images with no placements.

## 8. Placement (`a=p`, `a=T`)

- Origin: the top-left corner of the cursor cell, plus `X,Y` pixel offsets inside that cell ("the offsets must be
  smaller than the size of the cell"; kitty clamps them to `cell - 1`).
- Source rectangle: `x,y,w,h` in image pixels; the displayed area is the intersection with the image; `w`/`h` of 0 mean
  "to the image edge".
- Destination size: `c` columns by `r` rows, image scaled to fit. Neither given: natural size, cells =
  `ceil((src_w + X) / cellW)` by `ceil((src_h + Y) / cellH)`. Only one given: the other follows the source aspect
  ratio (kitty: `ceil`). Both given: spec text since 2026-08-23 says "the image is letterboxed/pillarboxed to prevent
  distortion". The `X,Y` offset is not added to `c,r`.
- Images wider than the screen are truncated on the right.
- z-index `z` (section 10).

### 8.1 Cursor after a placement

Spec: "After placing an image on the screen the cursor must be moved to the right by the number of cols in the image
placement rectangle and down by the number of rows in the image placement rectangle. If either of these cause the
cursor to leave either the screen or the scroll area, the exact positioning of the cursor is undefined". `C=1`: do not
move. Relative placements and virtual placements (`U=1`) never move the cursor, whatever `C` says.

kitty does (graphics.c `handle_put_command`, screen.c `screen_handle_graphics_command`):
`x += cols; y += rows - 1`, so the cursor ends on the LAST row of the image, in the column just after it; then if
`x >= columns`: `x = 0, y++`; if `y` is below the bottom margin the screen scrolls by the difference; then bounds are
enforced. icat therefore prints `\n` after the image. Implement kitty's rule.

## 9. Deleting (`a=d`)

`a=d` with no `d` deletes all placements visible on screen. Lowercase deletes placements only (data kept for re-use);
uppercase also frees the image data "provided that the image is not referenced elsewhere, such as in the scrollback
buffer". `x`/`y` in delete commands are 1-based cell coordinates.

| `d` | Deletes |
|---|---|
| `a` / `A` | All placements visible on screen (kitty: placements whose bottom row is on screen; not virtual, not placeholder images) |
| `i` / `I` | All placements of the image with id `i`; with `p`, only that placement. `I` with no placements left frees the image |
| `n` / `N` | Same, for the newest image with number `I`; with `p`, only that placement |
| `c` / `C` | Placements that intersect the cursor cell |
| `f` / `F` | Animation frames: deletes frame `r` (1-based, default 1, clamped to the last frame). If the image has no extra frames, `F` deletes the image and `f` does nothing |
| `p` / `P` | Placements that intersect cell (`x`,`y`) |
| `q` / `Q` | Placements that intersect cell (`x`,`y`) and have z-index `z` |
| `r` / `R` | Images whose id is in `x`..`y` inclusive (kitty 0.33) |
| `x` / `X` | Placements that intersect column `x` |
| `y` / `Y` | Placements that intersect row `y` |
| `z` / `Z` | Placements with z-index `z` |

- Virtual placements (`U=1`) are deleted only by `i I r R n N`; `a c p q x y z` and their capitals never touch them.
- Images drawn on Unicode placeholders are not placements; they change only through the placeholder text.
- "When all placements for an image have been deleted, the image is also deleted, if the capital letter form above is
  specified. Also, when the terminal is running out of quota space for new images, existing images without placements
  will be preferentially deleted."
- Every delete aborts an upload in progress (section 5). Unknown `d`: logged, no response.

## 10. z-index

- `z >= 0`: drawn over text. Negative: drawn under text. "Negative z-index values below INT32_MIN/2 (-1,073,741,824)
  will be drawn under cells with non-default background colors." Three tiers, matching ARCHITECTURE.md section 5:
  1. `z < -1,073,741,824`: under cell backgrounds (over the terminal's default background),
  2. `-1,073,741,824 <= z < 0`: over cell backgrounds, under text,
  3. `z >= 0`: over text.
- Same z overlapping: the image with the lower id is lower. Same z and same id: undefined (keep insertion order).
- Semi-transparent images at the same place blend in that order.
- icat: `--z-index -1` gives -1; a double minus (`--z-index --1`) adds the -1,073,741,824 origin, giving -1,073,741,825.

## 11. Relative placements (kitty 0.31)

- `a=p,i=<id>,p=<pid>,P=<parent image id>,Q=<parent placement id>`, offset `H` cells right and `V` cells down
  (negative = left/up) from the parent's top-left cell. No `Q`: kitty uses the parent image's first placement.
- The child moves with the parent. "The lifetime of a relative placement is tied to the lifetime of its parent. If its
  parent is deleted, it is deleted as well. If the image that the relative placement is a placement of, has no more
  placements, the image is deleted as well."
- Chains: at least 8 levels must be allowed; kitty's `PARENT_DEPTH_LIMIT` is 8. Exceeded: `ETOODEEP`. Cycle:
  `ECYCLE`. Missing parent image, parent with no placements, or missing parent placement: `ENOPARENT`. A virtual
  placement cannot be relative (`EINVAL`), but can be a parent: its position is the minimum x and minimum y over all
  placeholder images that use it.
- A relative placement never moves the cursor.

## 12. Unicode placeholders (kitty 0.28)

1. Transmit the image quietly (`q=2`), then create a virtual placement:
   `ESC _ G a=p,U=1,i=<id>,c=<cols>,r=<rows> ESC \` (or `a=T,U=1,...` in one command). No `c`/`r`: kitty uses the
   natural size, `ceil(imgW / cellW)` by `ceil(imgH / cellH)`.
2. The program prints `U+10EEEE` (a Private Use character, width 1) in each cell of the image, with:
   - Foreground colour = image id. `color_to_id(c) = (c >> 8) & 0xFFFFFF`: 24-bit colour `38;2;R;G;B` (or `38:2::R:G:B`)
     gives `R<<16 | G<<8 | B`; 256-colour `38;5;n` gives `n`; SGR 30-37 give 0-7 and 90-97 give 8-15 (kitty stores
     them as indexed colours). Default foreground gives 0, which matches no image.
   - Underline colour (`58;2;R;G;B` or `58;5;n`) = placement id, same encoding. Omitted or 0: "the terminal may choose
     any virtual placement of the given image" (kitty takes the image's first virtual placement).
   - Background colour is the background, visible through transparent pixels. "Other text attributes are reserved for
     future use."
   - Combining diacritics after U+10EEEE: first = row, second = column, third = most significant byte of the image id
     (bits 24-31). The value is the index in `T.KITTY_DIACRITICS` (0x0305 is 0, 0x030D is 1, 0x030E is 2 ...; 297
     entries, so rows and columns 0..296). Example from the spec, a 2x2 placeholder for id 42:
     `\e[38;5;42m\U10EEEE\U0305\U0305\U10EEEE\U0305\U030D\e[39m` then
     `\e[38;5;42m\U10EEEE\U030D\U0305\U10EEEE\U030D\U030D\e[39m`; id 33554474 = 42 + (2 << 24) adds `\U030E` as the
     third diacritic in every cell.
3. Inference when diacritics are missing (spec text):
   - No diacritics, and the previous placeholder cell has the same foreground and underline colours: row = left
     cell's row, column = left cell's column + 1, high byte = left cell's high byte.
   - Only the row diacritic, previous cell has the same row and colours: column = left + 1, high byte = left's.
   - Row and column only, previous cell has the same row and colours and column = this column - 1: high byte = left's.
   Applied left to right, so only the first cell of each row needs a row diacritic.
4. kitty's actual algorithm (`screen_render_line_graphics`), which is what to implement. Per line, values are 1-based
   with 0 = unknown: `row = diacritic(ch[1])`, `col = diacritic(ch[2])`, `hi = diacritic(ch[3])` where
   `diacritic()` returns index + 1, or 0 for a non-diacritic. A cell continues the current run when it is a
   placeholder with the same id low 24 bits and the same placement id as the previous cell, and
   `(!row || row == prevRow) && (!col || col == prevCol + 1) && (!hi || hi == prevHi)`; then
   `row = max(prevRow, 1)`, `col = prevCol + 1`, `hi = max(prevHi, 1)`. Otherwise the run ends and, if this cell is a
   placeholder, a new run starts with missing values defaulting to 1 (row 0, column 0, high byte 0). Each run becomes
   one strip: image id = `lo24 | (hi - 1) << 24`, image row `row - 1`, image columns `col - run .. col - 1`.
5. Fitting: the image is fitted into `cols*cellW` by `rows*cellH`, aspect ratio kept, centred on the short axis
   (`x_scale = y_scale = min(...)`). Placeholder images ignore the virtual placement's `x,y,w,h` and `z`; kitty draws
   them at z = -1 so the cursor and text stay on top.
6. Images on placeholders are not placements: they scroll, reflow, clip and are erased exactly like the text they sit
   on. Any change to a virtual placement must re-scan placeholder lines.
7. icat `--unicode-placeholder` writes, per cell, `U+10EEEE` + row diacritic + column diacritic + high-byte diacritic
   (all three, always), with `ESC[38:2:R:G:Bm` for the low 24 bits, rows separated by `\n\r`, and `ESC[39m` at the end.
   It picks a random id whose top byte and middle two bytes are non-zero, and refuses images of 297 cells or more in
   either direction ("Image too large to be displayed using Unicode placeholders").

## 13. Animation (kitty 0.20; composition 0.22)

Every animation command needs `i` or `I`. Frame 1 is the root frame (the base image); frames are 1-based.

### 13.1 Frame data (`a=f`)

Same keys as transmission (`f,t,s,v,S,O,o,m,N`), plus:

| Key | Meaning |
|---|---|
| `x`,`y` | Top-left of the rectangle the data covers, in image pixels |
| `s`,`v` | Size of that rectangle (data size as for a transmit). Larger than the image: `EINVAL` |
| `c` | 1-based frame whose pixels form the background canvas of the new frame. Default: a canvas of colour `Y` |
| `r` | 1-based frame to edit in place (the canvas is that frame itself). Default: create a new frame |
| `z` | Gap after this frame in ms: positive sets it, 0 is ignored, negative makes a gapless frame. Default 40 ms |
| `X` | 1 = overwrite pixels, otherwise alpha blend the data onto the canvas (kitty 0.49 fixed a 0.45 regression that read `C` here). Note: kitty's own Go serializer, used by icat, still writes `C=1` for an overwrite frame (`SetCompositionMode` in `tools/tui/graphics/command.go`), which kitty 0.49+ ignores for `a=f`. PM: treat `X=1` or `C=1` on `a=f` as overwrite |
| `Y` | Canvas colour, 32-bit RGBA, default 0 (transparent black). Example: `Y=4278190335` = 0xff0000ff opaque red |

kitty: `r` of 0 or beyond `frames + 1` means "new frame". Response carries `r=<frame number>`. A base frame missing:
`EINVAL:No frame with number: N found`. Chunked frames: continuation chunks carry `a=f` (kitty 0.50 fixed a missing
response for that case). When a frame's base chain gets long (5 or more frames, or drawn area at least twice the image
area) kitty stores the frame fully composed instead (`reference_chain_too_large`).

### 13.2 Control (`a=a`)

| Key | Meaning |
|---|---|
| `s` | 1 stop; 2 run in loading mode (at the last frame, wait for more frames instead of looping); 3 run normally (loop) |
| `v` | Loops: 0 ignored, 1 infinite (default), n > 1 plays n - 1 loops. Stopping resets the loop counter |
| `c` | 1-based frame to make current now (client-driven animation) |
| `r` | 1-based frame whose gap `z` is being set |
| `z` | Gap in ms for frame `r` (negative = gapless) |

- "The first frame or *root frame* is created with the base image data and has no gap, so its gap must be set using
  this control code." In kitty the root frame has gap 0 until set, so it is skipped like a gapless frame.
- Gaps: the time to wait before showing the next frame. Gapless frames (gap 0 in kitty) are never shown; they are base
  data for later frames. kitty advances `next = (current + 1) % frameCount` repeatedly while the next frame's gap is 0,
  and an animation only runs when it has extra frames, total duration > 0, is drawn, and is not out of loops.
- icat for an animated image: transmits frame 1 (`a=T`), then `a=a,r=1,z=<frame 1 delay>,v=<loops>` (`v=1` for its
  default infinite loop, `v=n+1` for `--loop n`), then frame 2 (`a=f`), then `a=a,s=2` (loading mode), the remaining
  frames, then `a=a,s=3`. Each `a=f` carries `z=<delay>`, `x,y` (frame offset), `c=<frame it composes onto>` when the
  decoder reports one, and `C=1` for replace frames. Animated images use an image number (`I`) unless an id was given or placeholders are used.

### 13.3 Compose (`a=c`)

`a=c,i=<id>,r=<source frame>,c=<destination frame>,w=,h=,X=,Y=,x=,y=,C=`: copy the `w`x`h` rectangle at (`X`,`Y`) in
frame `r` onto (`x`,`y`) in frame `c`; `w`,`h` default to the full image; `C=1` overwrite, default alpha blend.
Errors: frame or image not found `ENOENT`; a rectangle out of bounds `EINVAL`; same frame and overlapping rectangles
`EINVAL`; kitty `ENOSPC` when composing forces a frame to be stored fully and there is no room. (The key directions
were corrected in the docs on 2026-08-21, commit f5b4722c6833: `r` source, `c` destination, `X,Y` source,
`x,y` destination.)

## 14. Usage hints (`N=`, kitty 0.48)

Bitmask on transmit and frame commands. Bit value 1 = transient: "The terminal is free to assume that an image with
this hint will be used for only a short time, and so may, for example, evict its data before other images when the
image is soft deleted, has no visible placements and the terminal is under storage pressure, or skip writing its data
to disk. The terminal is also free to ignore the hint. If an animation frame with the *transient* hint is composited
onto another frame, and any of the involved frames have the hint, the resulting composited frame also has the hint.
This hint must be specified when the image or frame data is transmitted. It has no effect on placement commands."
kitty's eviction order under quota pressure: unreferenced images first, then transient before non-transient, then
oldest access time first.

## 15. Quotas and limits

| Limit | kitty value |
|---|---|
| Image storage quota | 320 MiB per screen buffer (`DEFAULT_STORAGE_LIMIT 320u * (1024u * 1024u)` = 335,544,320 bytes; main and alternate screen each have one). Spec: "should have a maximum storage quota... It should allow at least a few full screen images. For example the quota in kitty is 320MB per buffer" |
| Animation frames | stored on disk, "a separate, larger quota of five times the base quota" = 1,600 MiB (1,677,721,600 bytes) |
| Over quota | delete images without placements first, then transient, then least recently used, until under the limit |
| Image dimensions | 10,000 px per side |
| Compressed or PNG data | 400,000,000 bytes |
| File/shm path payload | 2048 bytes |
| Relative placement depth | 8 |
| Frame reference chain | stored fully composed at 5 frames or 2x the image area |
| Escape code length | 262,144 bytes while incomplete |
| Response message | 512 bytes |

Puppet Master budget recommendation for the concept (browser memory, not disk): 320 MiB per buffer of decoded RGBA
counted as `w * h * 4`, animation frames counted against a separate 5x pool, eviction in kitty's order.

## 16. Interaction with other terminal actions

- Reset (RIS): clear all images visible on screen. Switching to the alternate screen (1049): clear all images in the
  alternate screen, like its text. `ESC [ 2 J` clears all images too ("so that the clear command works").
- "The other commands to erase text must have no effect on graphics." Placeholder images are text, so they are erased.
- Scrolling (index, scrollback): images scroll with the text. With margins, only images entirely inside the margins
  scroll; parts pushed outside are clipped.
- Resize: kitty keeps placements anchored to their cells; it rescales placement rectangles when the cell size changes.

## 17. `kitten icat` (what it sends)

Options (`kittens/icat/main.py`): `--transfer-mode detect|file|stream|memory` (default `detect`; there is no `temp`
value, the temp file is what `file` uses for in-memory data), `--place WxH@LxT` (cells, origin 0,0), `--align
center|left|right` (default center), `--z-index` (default 0; `--1` style for the under-background tier), `--loop`
(default -1 = forever), `--unicode-placeholder`, `--passthrough detect|tmux|none` (tmux implies placeholders),
`--image-id`, `--scale-up`, `--fit width|height|both|none` (default width), `--background`, `--mirror`, `--clear`,
`--clear-all`, `--detect-support`, `--detection-timeout` (10 s), `--no-trailing-newline`, `--hold`.

1. Detection (`--transfer-mode detect`, not in tmux): three queries, then DA1, in one write:
   `ESC_G a=q,t=d,i=1,s=1,v=1,f=24,S=3;<base64 "123"> ESC\`,
   `ESC_G a=q,t=t,i=2,...;<base64 of a temp path containing "tty-graphics-protocol"> ESC\` (file holds 3 bytes),
   `ESC_G a=q,t=s,i=3,...;<base64 shm name> ESC\`, `ESC [ c`. An `OK` for i=1/2/3 marks direct/file/memory support;
   DA1 ends the wait. No OK for i=1: "This terminal does not support the graphics protocol".
2. Choice: `memory` when shm works and the image data is in memory (converted or decoded images, stdin, URLs);
   otherwise `file` when files work; otherwise `stream`. A PNG on disk that needs no conversion is sent as `t=f` with
   its absolute path (not deleted). In-memory data under `file` goes to a temp file named
   `kitty-tty-graphics-protocol-*` in `/dev/shm` when available, else `$TMPDIR`, sent as `t=t,S=<size>`. `memory`
   creates `/icat-*` shm and sends `t=s,S=<size>`; the terminal unlinks it.
3. Format: a single-frame PNG that needs no scaling or conversion goes as `f=100`; everything else is decoded and sent
   as `f=24` (opaque) or `f=32`, with `s,v`.
4. Default command (no options): `\r`, then `ESC[<n>C` to centre, then
   `ESC_G a=T,q=2,f=<fmt>,s=<w>,v=<h>,t=<medium>[,X=<x offset for alignment>][,S=..];<payload> ESC\`, then `\n`.
   `q=2` always. No `i` unless `--image-id` or placeholders or animation (`I` for animations).
   Stream mode: payload base64 unpadded, zlib when over 2048 bytes and smaller, chunks of 131,072 bytes with `m=1`.
5. `--place WxH@LxT`: cursor moved to (`T+1`, `L+1` plus alignment) with CUP, `C=1` on the command, and no trailing
   newline; the image is scaled to fit the rectangle.
6. `--z-index N`: adds `z=N` to the `a=T` command.
7. `--unicode-placeholder`: `a=T,U=1,c=<cols>,r=<rows>,i=<random id>,q=2` (no cursor move), then the placeholder
   text of section 12 item 7.
8. tmux passthrough: each command wrapped as `ESC P tmux; <command with every ESC doubled> ESC \`.

---------------------------------------------------------------------------------------------------------------------

## 18. iTerm2 inline images (OSC 1337)

Sources: https://iterm2.com/documentation-images.html,
https://iterm2.com/documentation-escape-codes.html, https://iterm2.com/feature-reporting/, iTerm2 source
https://github.com/gnachman/iTerm2/blob/master/sources/VT100/VT100Terminal.m [ae713c23ce133765]
(`executeFileCommandWithValue:`) and
https://github.com/gnachman/iTerm2/blob/master/sources/InlineImages/VT100InlineImageHelper.m [a34f0b881741a665]
(iTerm2 master f5147e4aa9e1), imgcat https://iterm2.com/utilities/imgcat.

### 18.1 Sequences

```
OSC 1337 ; File = [args] : <base64 file contents> BEL        (original; any version)
OSC 1337 ; MultipartFile = [args] BEL                        (iTerm2 3.5+)
OSC 1337 ; FilePart = <base64 chunk> BEL                     (one or more)
OSC 1337 ; FileEnd BEL
```

`ST` (`ESC \`) may replace BEL anywhere. Arguments are `key=value` separated by `;`; the args end at the first `:`
(single-sequence form). The payload is the whole file (PNG, JPEG, GIF including animation, PDF, anything macOS
decodes), base64.

| Arg | Value | Default |
|---|---|---|
| `name` | base64 of the file name | "Unnamed file" |
| `size` | file size in bytes; "only used by the progress indicator" | 0 |
| `width` | `N` cells, `Npx` pixels, `N%` of the session width, or `auto` | `auto` |
| `height` | `N` cells, `Npx` pixels, `N%` of the session height, or `auto` | `auto` |
| `preserveAspectRatio` | `0` stretches to fill width x height; otherwise fit without stretching | 1 |
| `inline` | `1` displays inline; otherwise the file is downloaded with no visual | 0 |
| `type` | (source, not on the images page) mime type or extension; non-images render as documents | auto |
| `mode` | (source) `regular` or `wide` for documents | regular |
| `insetTop/Left/Bottom/Right` | (source) insets in points | 0 |

### 18.2 Sizing (VT100InlineImageHelper.m)

- `Npx`: cells = `ceil(N / (cellW * scale))`; `N%`: cells = `ceil(gridCells * min(100, max(0, N)) / 100)`;
  `N` cells: exactly N; `auto` with the other axis `auto`: cells = `ceil(imageSize / cellSize)` (image size in points,
  i.e. pixels divided by the display scale on Retina since 3.2.0); `auto` with the other axis given: derived from the
  aspect ratio.
- Width capped to the columns left from the cursor (height scaled to match); height capped at 255 rows ("only 8 bits
  are used to represent the line number of a cell within the image"); both at least 1.
- `preserveAspectRatio` (default) fits the image inside the cell box with insets; `0` stretches.

### 18.3 Cursor and placement

The image is written into the grid as image cells starting at the cursor: for each of the `height` rows, a linefeed
before every row after the first (scrolling as text does), cells from the cursor column for `width` columns (clipped at
the right edge). Afterwards the cursor is on the image's last row, at column `start + width`. imgcat then prints
`\n`. The cells hold the image, so text written over them replaces those cells.

### 18.4 Limits and behaviour

- Multipart chunk size: "Older versions of tmux have a limit of 256 bytes for the entire sequence. In newer versions
  of tmux, the limit is 1,048,576 bytes. iTerm2 also imposes a limit of 1,048,576 bytes." imgcat sends 200-byte
  `FilePart` chunks.
- During a single-sequence `File=` transfer, any token other than file data aborts it ("file receipt ended
  unexpectedly"); during a `MultipartFile` transfer other sequences may interleave.
- iTerm2 refuses the transfer in an untrusted session and prints the symbol U+1F6AB in its place (PM: print nothing,
  and never write emoji in source).
- Detection: `OSC 1337 ; Capabilities ST` answers `OSC 1337 ; Capabilities=<features> ST`; feature `F` = the File
  protocol, `Sx` = sixel. Also `TERM_FEATURES` in the environment. `OSC 1337 ; ReportCellSize ST` answers
  `OSC 1337 ; ReportCellSize=<height>;<width>[;<scale>] ST` in points.

Puppet Master rules for `js/34-iterm.js`: decode into the same image store as kitty (one placement per image,
z = 0 tier, anchored to its cells, scrolls and clears with them); count bytes against the same 320 MiB quota; cap a
single file at 1,048,576 bytes per `FilePart` and a sane total (suggest 64 MiB of base64); `inline=0` is a download
and is refused in the concept with a one-line notice; never echo the file name unless it decodes to printable text.

---------------------------------------------------------------------------------------------------------------------

## 19. Sixel (DECSIXEL)

Sources: VT330/VT340 Programmer Reference Manual Vol. 2, chapter 14 https://vt100.net/docs/vt3xx-gp/chapter14.html;
xterm control sequences https://invisible-island.net/xterm/ctlseqs/ctlseqs.html (sections "Sixel Graphics",
DECSET 80/1070/8452, XTSMGRAPHICS); xterm source
https://github.com/ThomasDickey/xterm-snapshots/blob/master/graphics_sixel.c [3f6234e71ded3d81] and `graphics.c`
(`hls2rgb`); xterm resources (`xterm.man`: maxGraphicSize, numColorRegisters, sixelScrolling, privateColorRegisters);
foot https://codeberg.org/dnkl/foot/src/branch/master/sixel.c [756a6fcae368e839], `csi.c`, `sixel.h`.

### 19.1 Introducer

```
DCS P1 ; P2 ; P3 q <sixel data> ST          (DCS = ESC P, ST = ESC \)
```

| Param | Meaning |
|---|---|
| P1 (macro) | Pixel aspect ratio (vertical:horizontal): omitted, 0, 1 = 2:1; 2 = 5:1; 3, 4 = 3:1; 5, 6 = 2:1; 7, 8, 9 = 1:1. "New applications should set P1 to 0 and use the set raster attributes control" |
| P2 | Background: 0 or 2 (default) = pixels with bit 0 are set to the background colour (register 0 on VT340); 1 = they stay as they were (transparent) |
| P3 | Horizontal grid size; ignored by the VT300 and by xterm and foot |

### 19.2 Data

- Sixel characters `?` (0x3F) to `~` (0x7E): value = code - 0x3F, six vertical pixels, least significant bit at the
  top, painted in the current colour; 0 bits leave the pixel unchanged within this pass.
- `! Pn <char>` (DECGRI): repeat the next sixel character Pn times.
- `" Pan ; Pad ; Ph ; Pv` (DECGRA, raster attributes): aspect ratio Pan/Pad (vertical numerator, horizontal
  denominator; defaults 1;1 when `"` is used) and image size Ph x Pv in pixels. Must come before any sixel data; it
  overrides P1. Ph/Pv do not clip the image; with P2 = 0 or 2 the Ph x Pv area is filled with the background.
- `# Pc` (DECGCI): select colour register Pc. `# Pc ; Pu ; Px ; Py ; Pz`: define register Pc and select it.
  Pu = 1 HLS (Px hue 0-360, Py lightness 0-100, Pz saturation 0-100) or Pu = 2 RGB (each 0-100 percent). DEC HLS hue is
  rotated: 0 is blue, 120 red, 240 green (xterm `hls2rgb`: `h = h - 120` before the usual conversion). Out-of-range
  components: xterm stops parsing the image. Register numbers above the available count wrap (`Pc % registers`).
- `$` (DECGCR): graphics carriage return, back to the left of the current sixel line (overprint with another colour).
- `-` (DECGNL): graphics new line, to the left of the next sixel line (6 pixels down times the aspect).
- `;` separates numbers; an empty number is 0. Unknown characters are ignored.

### 19.3 Colour registers

- Count: VT330 4, VT340 16 (the default map is the VT340 table; js/32-sixel.js already carries it), xterm 1024 when
  emulating anything other than a DEC model (`MAX_COLOR_REGISTERS 0x400`), foot 1024 (`SIXEL_MAX_COLORS 1024u`).
- Private or shared: DECSET 1070 (xterm `privateColorRegisters`, default true in xterm): each image gets its own
  registers, so redefining a colour does not repaint older images. foot implements 1070 too. PM: always private.
- Query or set with XTSMGRAPHICS `CSI ? Pi ; Pa ; Pv S`: Pi 1 registers, 2 sixel geometry; Pa 1 read, 2 reset,
  3 set, 4 read maximum; reply `CSI ? Pi ; Ps ; Pv S` with Ps 0 success. foot reports 1024 registers maximum and
  10000x10000 geometry; xterm's default `maxGraphicSize` is 1000x1000.
- DA1 lists `4` when sixel is supported.

### 19.4 DECSDM (mode 80) and the cursor after an image

- DEC's manual text ("When sixel display mode is set, the Sixel Scrolling feature is enabled") is the opposite of what
  the VT382 manuals and the hardware do. xterm and foot follow the hardware: `CSI ? 80 h` (DECSDM set) = sixel
  scrolling OFF; `CSI ? 80 l` (reset, the default) = sixel scrolling ON. xterm's resource text: "Sixel scrolling is the
  opposite of DEC Sixel Display Mode (DECSDM): when one is on, the other is off." foot: `case 80:
  term->sixel.scrolling = !enable`.
- Scrolling ON (default): the image starts at the text cursor's cell (top-left); the screen scrolls when sixel lines
  pass the bottom margin; the text cursor moves when the image ends.
- Scrolling OFF (DECSDM set): the image starts at the top-left of the screen (0,0); data below the bottom margin is
  discarded; the text cursor does not move.
- Cursor after the image with scrolling ON:
  - xterm (`finished_parsing`): row = start row - 1 + `ceil(imageHeightPx / cellH)`, i.e. the LAST text row the image
    covers; column = the start column. "XTerm always requires only a single newline" before following text.
  - foot (`sixel_unhook`): the text row touched by the last sixel (trailing fully transparent pixel rows trimmed; if
    the data ended with `-`, the row of the next sixel line); column = the start column. Scrolls as needed.
  - DECSET 8452 (RLogin, xterm, foot): "Sixel scrolling leaves cursor to right of graphic": column = start column +
    `ceil(imageWidthPx / cellW)`; past the right margin it wraps to the next line (xterm) or clamps to the last
    column (foot).
- PM: implement modes 80, 1070 (always on, reported as set) and 8452; cursor as xterm.

### 19.5 How sixels map to cells

- xterm: the image covers `ceil(widthPx / cellW)` columns by `ceil(heightPx / cellH)` rows from its start cell. xterm
  forces the pixel aspect to 1:1 ("Aspect Ratio is buggy, so we'll just force it off": `pixw = pixh = 1`), so P1 and
  Pan/Pad have no visible effect in xterm.
- foot: the same cell footprint, `cols = ceil(width / cellW)`, `rows = ceil(height / cellH)`; it honours the aspect
  ratio by repeating each sixel row `pan` times (Pan and Pad clamped to 1..5; P1 maps to pan 2, 5, 3, 2 or 1 with pad
  1); limits 10,000 x 10,000 px. When the font size changes, foot rescales each sixel so it keeps its cell footprint
  (`sixel_cell_size_changed`, bilinear). Printing text over a sixel cuts the image out of those cells
  (`sixel_overwrite_at_cursor`).
- Both: sixels are pixel-exact at the cell size in force when they were drawn. PM stores sixel images in the same
  image store at z = 0 tier with the cell footprint above, keeps the footprint on font change (rescale like foot), and
  lets text overwrite the covered cells (like foot), so `clear`, scrolling and reflow treat them like text.
- Opaque by default (P2 0/2 fills the Ph x Pv area with register 0); P2 = 1 leaves unset pixels transparent.

---------------------------------------------------------------------------------------------------------------------

## 20. Numbers for the Plans thread

- Diacritics table: 297 entries, 0x0305 (index 0) to 0x1D244 (index 296); placeholder images can therefore address
  rows and columns 0..296; icat refuses 297 cells or more.
- Placeholder character U+10EEEE; image id = fg colour (24-bit `R<<16|G<<8|B`, or 256-colour index) plus a third
  diacritic for bits 24-31; placement id = underline colour.
- Chunk size: spec maximum 4096 bytes of base64 per chunk, multiples of 4 except the last; kitty's own clients send
  131,072-byte chunks, so accept at least 262,144 bytes per escape code.
- Generic file-read error, exact: `EBADF:Failed to read image file`.
- Error codes: ENOENT, EINVAL, EBADF, ENODATA, ENOSPC, EFBIG, ENOMEM, EILSEQ, EBADPNG, ETOODEEP, ECYCLE, ENOPARENT
  (EPERM and EIO retired for file media on 2026-09-14).
- Quotas: 320 MiB per buffer (335,544,320 bytes); animation frames 5x = 1,600 MiB; images at most 10,000 px a side;
  compressed/PNG data at most 400,000,000 bytes; path payload at most 2048 bytes; relative placement depth 8.
- z tiers: below -1,073,741,824 under cell backgrounds; -1,073,741,824..-1 under text; 0 and above over text.
- Default frame gap 40 ms; root frame gap 0 until set; loop `v=1` infinite.
- iTerm2: 1,048,576 bytes per sequence; image height capped at 255 rows.
- Sixel: 1024 colour registers (private per image), 10,000 x 10,000 px; DECSDM set (`CSI ? 80 h`) = scrolling off;
  cursor ends on the last image row at the start column (8452: to the right).

# Original control evidence boundary

C-M01 concerns a required governing research condition, not observed application execution. The frozen final at lines 25, 64, 97 and 154 presents default-width Result parsing, full validation and a future malformed-row test without stating the liberal syntax boundary. The exact csv 1.4.0 Reader error-handling documentation and matching core/wrapper code were independently read (P05/P07/P08). EOF from a quoted-field state can finalize a record; width checks are separate.

Code-derived synthetic witness, **not executed**: under a confirmed three-column id/value/note dialect, bytes `id,value,note\n1,7.0,ok\n2,6.8,"cut\n3,9.0,ok\n` have an unclosed quoted note. The core can absorb the third physical observation into the note of row 2 and still return three fields with a valid number. A returned-error-only/width/schema pass need not detect the missing event. RFC4180 closing-quote grammar supplies the lexical condition. The artifact's future test intentions and engine-neutrality were considered; they do not provide the omitted available governing research. This is not a claim about every dialect or a requirement to deploy software.

Other bounded findings: P18's 3.35.0 history contradicts carried S15/R15's unconditional conflict-target requirement. P32 includes a February 23 comment on line-counter/trailing-newline context, contrary to carried no-activity wording. Optional searchable history at draft line 90 is not retained explicitly in the final. These findings are nonmaterial under the reasons in defects.json.

Exact public authorities:
- https://docs.rs/csv/1.4.0/csv/struct.Reader.html#error-handling
- https://raw.githubusercontent.com/BurntSushi/rust-csv/4a3997e91d668ea1d8595bdef15625a77cf2308a/csv-core/src/reader.rs (read_record and final transitions; Unlicense/MIT)
- https://raw.githubusercontent.com/BurntSushi/rust-csv/4a3997e91d668ea1d8595bdef15625a77cf2308a/src/reader.rs (ReaderState::add_record; Unlicense/MIT)
- https://www.rfc-editor.org/rfc/rfc4180.html#section-2
- https://www.sqlite.org/lang_UPSERT.html
- https://github.com/BurntSushi/rust-csv/issues/422

No downloaded source code, parser/import witness or database test was executed. Response digests and locator/version details are preserved in the linked primary-source index/shared evidence.

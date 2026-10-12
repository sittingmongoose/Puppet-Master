Independent source witness for D-C01; read-only original evaluation evidence.

The control final source map carries S01's claim that the default drops tokens longer than 40 characters. The detailed 0.26.2 API specifies a UTF-8 byte limit. The pinned implementation keeps only lengths strictly below the configured limit:

`token.text.len() < self.token_length_limit`

The default caller installs `RemoveLongFilter::limit(40)`. SimpleTokenizer's character loop forms alphanumeric runs. The filter's small upstream unit test uses an ASCII limit of 6, retains five-byte tokens and discards longer tokens. It does not test equality at the limit or CJK relevance; the strict boundary comes from the predicate.

Independent constructed example: fourteen consecutive U+6C49 characters occupy 42 UTF-8 bytes. The bytes predicate rejects that run although it has fewer than forty characters. Only Python UTF-8 encoding/count arithmetic was executed. The predicted filter outcome is an inference from inspected Rust; no Tantivy, upstream test, application or relevance fixture was run.

Exact governing context:

- https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/struct.RemoveLongFilter.html — detailed byte-unit definition.
- https://github.com/quickwit-oss/tantivy/blob/0.26.2/src/tokenizer/remove_long.rs — lines 17–36 and 97–108; retrieved SHA256 d36c4183a9df3a512ec40c64b993b5ada656c018b588f18341ffec0aa2384d9c.
- https://github.com/quickwit-oss/tantivy/blob/0.26.2/src/tokenizer/tokenizer_manager.rs — lines 53–76; retrieved SHA256 ff6db7e786c141b5f62f31a6b9624cfd80b49fe74575a36520bab106e0eb6109.
- https://github.com/quickwit-oss/tantivy/blob/0.26.2/src/tokenizer/simple_tokenizer.rs — lines 30–51; retrieved SHA256 0c9d5fcf250ae4879c25a155133ec0baa947cf03e76db63523c004b6e28a0a34.

The module-level prose uses a character description that does not match the detailed definition/code. Following a citation to that prose alone does not establish the semantic condition. This finding concerns multilingual analyzer research, not a claim that the future application failed an executed test. The public project MIT notice is retained in tantivy-MIT-LICENSE.txt.

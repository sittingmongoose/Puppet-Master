# User draft — local note search

Fixture ID: ER12-A3-01-FRESH. Authoring status: FINALIZED.
Root releases this incomplete draft only after substantive discovery. These are user preferences and unverified working assumptions, not established technical facts or evaluation answers.

I would prefer to reuse SQLite. My sketch creates a search table containing note ID, title, body, and collection, then rewrites a note's search row whenever the editor saves it. I want to consider a mode that avoids duplicating full note bodies in the search index because laptop disk space is limited. I have not chosen a table configuration or checked the consequences.

My old working assumptions are that a contentless full-text index cannot support deletion or replacement, that excerpts require the text to live inside the index, and that changing tokenizer choices always forces replacing the database. If any assumption fails for an applicable released configuration, revise it with evidence. Conversely, do not infer that a feature exists in the deployed build just because some newer release describes it. There is no pinned deployment version yet.

Draft queries split input on spaces and join words with AND. Quoted input should become a phrase; collection is a separate filter. I have not handled literal punctuation, invalid query syntax, accent differences, or a user typing operators. I assumed sorting by relevance is sufficient, but have not chosen a deterministic tie-breaker or checked score interpretation.

A separate library could own an index directory, updated after each database commit. I have not decided how it catches up after a crash between the database commit and index update. For SQLite too, the draft needs a clear authority and reconciliation rule rather than relying on every writer remembering a callback. Rebuilds must preserve authoritative notes and avoid presenting partial results as complete.

Keep all S1–S6 clauses and negative constraints. Produce one preferred approach plus conditions that would justify the other. Disk savings are a goal, not permission to break deletion, excerpts, or recovery. No benchmark or installed-build capability is currently verified.

Proposed validation only: synthetic notes with equal scores, accents, punctuation, phrase boundaries, and two collections; repeated edits and deletions; a missing index row; simulated interruption between source write and derived update; malformed input; an excerpt containing markup. Specify observable outcomes before testing. Distinguish pure query checks from recovery integration checks. No checks have been executed.

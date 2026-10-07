# Frozen sandbox plan v1

Save all uploaded files in a directory tree, deduplicate by filename and size, write metadata in SQLite and store generated previews beside originals. A nightly job copies the tree to a second disk. Serve a web browse catalog with search over filenames and notes. Checksums, fixity scheduling, crash recovery, derivative provenance, rights changes and preservation formats remain unspecified.

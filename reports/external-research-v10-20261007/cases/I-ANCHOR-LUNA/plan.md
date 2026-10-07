# Frozen sandbox plan v1

Use a local SQLite database on each crew device. Represent an inspection as a mutable record with an updated_at timestamp, asset ID, coordinates, free text and photo paths. On reconnect, POST changed records to a central service; retry failed uploads. Server uses the greatest timestamp as the latest record. Supervisors browse the latest inspections and export CSV. Authentication, deletes, concurrent updates, attachment retry identity and audit details remain to be designed. No particular synchronization component has been selected.

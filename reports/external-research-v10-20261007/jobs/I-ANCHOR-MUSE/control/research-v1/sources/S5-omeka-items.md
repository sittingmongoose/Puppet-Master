# S5 evidence — Omeka S User Manual, "Items"

Provenance: https://omeka.org/s/docs/user-manual/content/items/ — versionless rolling doc. Retrieved 2026-10-07T18:31:03Z (HTTP 200, 64527 bytes fetched).

Bounded excerpts:

- Visibility: "Use the make public/private button (eye icon) to set whether the item is visible to the public or only to users of the Omeka S system." Item-public/item-private icons documented.
- Mixed visibility rule: "if an item is private, all the media attached is private, but an item which is public can have attached media which are set to be either public or private." (Direct precedent for public-browse vs internal-preservation split: public record with restricted originals.)
- Per-property visibility: "You can set individual properties as private or public using the eye icon for each property. Note that properties set to private are still visible to Global Admins, Supervisors, and Editors. Authors will be able to see all properties on items they own, but will not see private properties created by other users."
- Roles/permissions table: Global Admin/Supervisor/Editor/Reviewer/Author/Researcher; Authors edit only their own items; only higher levels delete others' items; "Private objects: View" granted to all but Author/Researcher.
- Site permissions: items must be added to a site (manually or by default) before public view; per-site Creator/Manager/Viewer roles; auto-add-new-items is a per-site setting (leak vector if left on for a restricted collection).
- Deletion hazard: "Deleting a user orphans their items - they will appear as having no owner. You cannot currently search and batch-edit items without an owner, so the best practice is to re-assign these items before deleting the user account." Volunteer-turnover risk, directly analogous to the brief's volunteer-managed catalog.
- Public views: each site auto-gets a "Browse items" page; item view shows title, media rendering, then property values. (Compare frozen plan's filename/notes search: Omeka searches structured linked-data properties, not filenames.)

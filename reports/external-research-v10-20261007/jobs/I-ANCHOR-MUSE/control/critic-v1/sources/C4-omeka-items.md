# C4 evidence — Omeka S User Manual "Items", independent re-read

Provenance: https://omeka.org/s/docs/user-manual/content/items/ (versionless rolling doc).
Retrieved: 2026-10-07T18:38:52Z (HTTP 200, 64527 bytes; matches predecessor S5 byte count).
Range: visibility, mixed-visibility rule, per-property eyes, roles table, site permissions, user deletion.

Independent observations (exact quotes):
- Mixed visibility: "Note that if an item is private, all the media attached is private, but an item which
  is public can have attached media which are set to be either public or private." — verbatim confirms S5.
- Per-property: "You can set individual properties as private or public using the eye icon for each
  property. Note that properties set to private are still visible to Global Admins, Supervisors, and
  Editors. Authors will be able to see all properties on items they own, but will not see private
  properties created by other users." — this is ROLE-SCOPED hiding, not redaction: staff roles still see
  "private" fields. Draft F7(c) "redaction" overstates; final must downgrade the term.
- Orphaning: "Deleting a user orphans their items - they will appear as having no owner. You cannot
  currently search and batch-edit items without an owner, so the best practice is to re-assign these items
  before deleting the user account." — verbatim confirms S5/F8.
- Site visibility is TWO-sided, not one: "Each site can be set to have all new items automatically added to
  it. Each user can have one or more sites to always add new items to by default" ("Default sites for
  items", requires site Creator/Manager role). Draft F7 names only the site-level auto-add; final must
  cover the per-user default-sites setting too.
- Public views: "Browse items" page auto-added to every site's navigation; item view shows title, media
  rendering, then property values. Structured-property display confirmed; "linked records"/linked-data
  resource-template behavior is NOT in this page's retrieved range — draft F10's "linked records" phrase
  needs softening or a new source.

Raw page excerpted here; raw file removed to keep evidence bounded.

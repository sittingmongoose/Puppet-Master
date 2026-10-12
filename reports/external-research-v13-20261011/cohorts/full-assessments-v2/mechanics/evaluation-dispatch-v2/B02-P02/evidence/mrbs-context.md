# Independent MRBS primary context

This is static source research at MRBS v1.12.2 (release commit 38d51e0), not a product execution or workshop fit result. The proposal's one-room-per-entry schema observation is true. It does not imply that the application only accepts one room/resource per submission.

[edit_entry.php](https://github.com/meeting-room-booking-system/mrbs-code/blob/v1.12.2/web/edit_entry.php#L432) supplies `rooms[]` with multi-select when policy permits. [edit_entry_handler.php](https://github.com/meeting-room-booking-system/mrbs-code/blob/v1.12.2/web/edit_entry_handler.php#L761) builds an array of bookings, filtering selected rooms without write permission. At lines 828–830 the same handler performs:

```php
db()->begin();
$transaction_ok = true;
$result = mrbsMakeBookings($bookings, $this_id, $just_check, $skip, $original_room_id, $send_mail, $edit_series);
```

It then commits or rolls back. [DB.php](https://github.com/meeting-room-booking-system/mrbs-code/blob/v1.12.2/web/lib/MRBS/DB/DB.php#L273) delegates these operations to PDO transactions. [mrbs_sql.inc](https://github.com/meeting-room-booking-system/mrbs-code/blob/v1.12.2/web/mrbs_sql.inc#L2666) checks the entries before the normal non-skip write path, returning on an invalid booking. Recurrence skipping can be per room, unauthorized requested rooms are omitted before this call, and the entries are not thereby shown to have a unified later edit/cancel/displacement lifecycle.

The existing path therefore contradicts a categorical single-resource-only/custom-extension inference. It does **not** establish qualified-supervisor matching, complete required-resource selection, protected maintenance, preserved reasons, or runtime race safety. None of those software validations was executed by this evaluator.

The default-off `prevent_simultaneous_bookings` policy limits one user's concurrent rooms; ordinary same-room overlap checks are separate. [The #3965 fix](https://github.com/meeting-room-booking-system/mrbs-code/commit/9586b7a9324fb0d362d4aa5821efb3a0f09b9208) ignores the existing recurring series in that user policy. A default-off policy is not evidence that MRBS lacks room-conflict checking.

Upstream code quotation attribution/license: MRBS project, [COPYING, GPL v2](https://github.com/meeting-room-booking-system/mrbs-code/blob/v1.12.2/COPYING). Exact independently retrieved source fingerprints and access windows are in each arm's primary-source-index.json. Source files were read; no downloaded code was executed.

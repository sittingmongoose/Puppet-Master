# Independent critic review — A4-02-treatment

**Stage:** critic  
**Disposition:** The investigator package substantially covers the brief and responds to the released plan. One material-incomplete issue should be corrected before a final proposal is relied on: the Outlook refresh guidance is grouped across two different web operations. A smaller reminder-source omission is noted below. This critique does not draft or repair a final.

## Review basis and limits

I read the complete brief, discovery record, draft, investigator source map and index, released plan, and plan-reveal record from the paths in input-map.json. I reopened the governing public primary sources listed in the critic source map, including the standards, current product help, Nextcloud 35 manuals, Mozilla issue history, and the immutable Mozilla changeset. The changeset was read as text and not executed.

No calendar product was operated; no account, member calendar, production service, feed, or test calendar was accessed. No local product-discriminating check was run. Public documentation and source-history review were executed as research only. Product/client validation remains NOT_RUN. The plan is treated as a fallible draft, not as an assessor key.

## Findings requiring attention

### F1 — Material incomplete: Outlook refresh guidance is not separated by web operation

**Draft locator:** Clause 3, “bind recurrence/refresh to exact operations and versions,” Outlook.com/Outlook on the web row; also Clause 2, “Client and protocol boundaries.”  
**Released-plan locator:** clause 3, which requires refresh claims to be bound to the exact client/server operation and investigated version.  
**Evidence:** R09’s current Microsoft support page gives separate guidance. Under Outlook.com’s “Subscribe from web” flow it says updates may take more than 24 hours but should happen approximately every 3 hours. Under the Outlook on the web flow it says updates may take more than 24 hours and should happen approximately every 6 hours. Neither is a maximum or a promise. The page does not state numeric builds. See [R09 in the critic evidence index](sources/index.md#r09), especially the separate Outlook.com and Outlook on the web sections.
**Assessment:** The draft’s combined “Outlook.com/Outlook on the web” row carries the 3-hour expectation across both operations. That is an overgeneralization against the source and weakens an exact-operation claim required by clause 3. The broader recommendation not to promise immediate refresh remains correct. The proposed validation table names Outlook.com web; if Outlook on the web is also in scope, its separate approximately 6-hour documentation and its own runtime test should be recorded independently. No hard service level should be inferred.

### F2 — Minor locator/wording: add the iPhone subscription-alert control to the reminder evidence

**Draft locator:** Clause 6, member-reminder paragraph; reminder validation row.  
**Released-plan locator:** clause 6, preserving member ownership of local reminders.  
**Evidence:** R10’s iPhone guide documents an external, read-only .ics subscription and separately lets a user turn event alerts on or off for calendars they create or subscribe to. The Mac guide documents auto-refresh and “Ignore alerts.” See [R10 in the critic evidence index](sources/index.md#r10).
**Assessment:** The draft correctly avoids feed-level policy alarms and proposes client checks. Its reminder discussion cites the Mac control but omits the iPhone’s explicit per-calendar event-alert toggle. Add that locator and distinguish the documented calendar-level toggle from an unverified promise about per-event alert timing or behavior. This does not undermine the member-control recommendation.

## Obligation and plan-disposition review

| Obligation / released-plan clause | Critic assessment |
|---|---|
| **1 — series, moved/cancelled instances, identity, zones** | Adequately corrects the plan’s “an import receives edits” and “rebuild identifiers” assumptions. RFC 5545 supports a stable series UID, RECURRENCE-ID at the original scheduled instance time, and recurrence-set exclusion; Google API v3’s originalStartTime and instance cancellation are kept within API scope. The venue-zone recommendation is identified as a local choice, with a matching VTIMEZONE and client checks. No material issue found. |
| **2 — two routes and one analogy; import/feed/sync** | Compares Google public-calendar/iCal and Nextcloud 35 publishing without selecting a winner; bounds WebSub as an analogy rather than a calendar-client mechanism. It distinguishes a static .ics import, a URL subscription, and CalDAV/WebDAV synchronization. Google’s setup limitations and public-visibility conditions are appropriately attributed. |
| **3 — operation/version and uncertainty** | Strong source/operation separation overall: RFC 5545 versus Google Calendar API v3, consumer help versus API behavior, and host cache versus external client polling. Numeric builds are honestly unavailable in the cited help. F1 is the exception: separate Outlook.com and Outlook on the web refresh statements. |
| **4 — released issue/fix history** | Adequately corrects the plan’s “no history” assertion and rejects a single desktop import as cross-client proof. Bug 1595332 reports inherited LOCATION loss on a remote recurring-instance edit in Thunderbird/Lightning 68.2.1/68.2.0; the first patch was backed out after recurrence-test failures, a later fix landed, and the issue records uplift to Thunderbird 91.0b4. The source patch adds inherited-property tests, including LOCATION; the draft does not claim those tests ran or generalize the defect to other products. The proposed room-only exception regression check is a reasonable inference. |
| **5 — optional one-season snapshot** | Correctly preserves the authorized option as optional, not mandatory or already proven. Google and Outlook.com documentation support .ics file import as a snapshot; the draft keeps CSV flattening and iPhone direct-file-import uncertainty visible, proposes same-source generation/replacement tests, and identifies no evidence-based exclusion. |
| **6 — ownership and reminders** | Preserves the secretary’s identity/amendment authority, manager’s room-publicity decision, and member-owned reminders. The owner decisions remain unresolved rather than invented. F2 is a small evidence/locator gap, not a change to the decision boundary. |
| **7 — negative constraints** | Preserves all four constraints: no member-calendar access, no required account migration, no immediate-refresh promise, and no conflation of import with subscription. Its public/permissioned route condition is explicit. |
| **8 — coherent proposal and validation status** | The draft is a coherent evidence-linked proposal, not only a patch list. It separates observed evidence, inference, owner input, proposed choice, executed research, and proposed/NOT_RUN checks. Source retrieval and code-text review are not mislabeled as product validation. |

## Other source-boundary checks

- The source map’s Nextcloud distinction is appropriately bounded: the Nextcloud 35 user manual describes weekly refresh for the Calendar app’s own feed subscription; the admin manual describes server-cached upstream subscriptions, honoring a feed interval or defaulting to one day. They are different documented operations, but the pages do not establish a single runtime value for a particular deployment. The draft preserves the discrepancy without applying either default to Google, Outlook, Apple, or other external clients.
- The RFC 5545 UNTIL rule is type-sensitive: when DTSTART is a local time with a time-zone reference, UNTIL is UTC. The draft states that constraint; it does not treat UNTIL as an arbitrary local season-end string.
- Google API v3 recurrence-zone and instance-update evidence is correctly not presented as proof of downstream feed-import behavior. The Microsoft “more than 24 hours” wording is not a maximum. Apple and Google help pages do not establish a universal refresh interval.
- The WebSub analogy is accurate at the intended level: publisher/hub notification and subscriber callback/verification with expiring leases; no evidence is claimed that common calendar clients use WebSub for .ics.
- The privacy decision and venue zone, existing source host, season dates, and supported client matrix remain honestly unresolved owner inputs. Those unknowns do not excuse public research; the draft has investigated the answerable questions.

## Overall judgment

The draft is broadly faithful to the full brief and released plan, with no other material wrong or unsupported claim identified in this review. Fix F1’s operation boundary and tighten F2’s reminder locator before treating the proposal as complete. Keep all product validation marked NOT_RUN until the proposed synthetic-calendar checks are actually performed. No scope reduction is warranted by these findings.

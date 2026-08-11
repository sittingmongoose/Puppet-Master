/* ============================================================================
   Kimi K3 — demo data augmentation overlay (window.K3_DEMO_AUGMENT).

   This file EXTENDS _shared/demo-data.js. It never reduces supplied
   coverage: patches only set or add fields on existing messages, inserts
   only append new messages, and lens examples only add Context Lens state.

   VALIDATION EXPECTATIONS (checked by _shared/data.js at init):
   - original dataset counts: 15 threads / 400 messages / 22 scripted
     replies. This overlay must not shrink any of them.
   - net effect after merge: 15 threads / 401 messages / 22 replies
     (one inserted long message in thread-09).
   - every patched or referenced id below exists in the supplied dataset.

   Patch semantics (implemented by K3Data.init):
   - messagePatches: {id, set} — `set` is shallow-merged into the message;
     `set.runtime` is merged key-by-key into the existing runtime object.
   - messageInserts: {threadId, afterMessageId, message} — the message is
     spliced into the thread immediately after `afterMessageId`.
   - lensExamples: {threadId, applied} — pre-applied Context Lens state,
     merged into the store 'lens' slice at init when no user state exists.
   ========================================================================== */
(function () {
  'use strict';

  window.K3_DEMO_AUGMENT = {

    messagePatches: [
      // (a) Long user message (851 chars) that ends with the phrase
      // "blue lantern checkpoint" — ships collapsed so search can reveal it.
      {
        id: 't03-m0005',
        set: { collapsedByDefault: true }
      },

      // (b) Paused / questionnaire-wait turns: total elapsed exceeds worked
      // time because the turn sat idle waiting on a person or a paused goal.
      {
        id: 't01-m0006', // waited on the import-sources questionnaire
        set: { runtime: { totalElapsedSeconds: 312 } } // worked 44s
      },
      {
        id: 't01-m0010', // user stepped away mid-review
        set: { runtime: { totalElapsedSeconds: 208 } } // worked 70s
      },
      {
        id: 't06-m0008', // goal paused before mutation, turn left open
        set: { runtime: { totalElapsedSeconds: 264 } } // worked 57s
      },

      // (c) Completed activity groups on assistant turns that shipped
      // without one.
      {
        id: 't05-m0008',
        set: {
          activityGroup: {
            id: 'activity-research-compare-01',
            status: 'complete',
            workedSeconds: 57,
            compactLabel: '4 stages completed',
            stages: [
              {
                kind: 'thought',
                label: 'Thinking',
                durationSeconds: 6,
                status: 'complete',
                summary: 'Framed the comparison around coding tools, general assistants, and open-source chat platforms.'
              },
              {
                kind: 'exploration',
                label: 'Reviewed sources',
                count: 9,
                durationSeconds: 28,
                status: 'complete',
                summary: 'Read vendor documentation and release notes for the three comparison tracks.'
              },
              {
                kind: 'edit',
                label: 'Updated research notes',
                count: 3,
                durationSeconds: 17,
                status: 'complete',
                summary: 'Revised the comparison table and flagged claims that still need a primary source.'
              },
              {
                kind: 'completion',
                label: 'Delegated follow-up work',
                durationSeconds: 6,
                status: 'complete',
                summary: 'Handed the three tracks to child agents and collapsed the group to aggregate progress.'
              }
            ]
          }
        }
      },
      {
        id: 't10-m0010',
        set: {
          activityGroup: {
            id: 'activity-pr-live-updates-01',
            status: 'complete',
            workedSeconds: 70,
            compactLabel: '4 stages completed',
            stages: [
              {
                kind: 'thought',
                label: 'Thinking',
                durationSeconds: 5,
                status: 'complete',
                summary: 'Decided live updates must patch existing activity and subagent records rather than append new ones.'
              },
              {
                kind: 'exploration',
                label: 'Inspected pull request',
                count: 6,
                durationSeconds: 31,
                status: 'complete',
                summary: 'Read the diff and the review comments covering live-update rendering.'
              },
              {
                kind: 'edit',
                label: 'Adjusted update handling',
                count: 2,
                durationSeconds: 26,
                status: 'complete',
                summary: 'Changed the reducer so in-place record updates leave the scroll anchor untouched.'
              },
              {
                kind: 'completion',
                label: 'Confirmed scroll stability',
                durationSeconds: 8,
                status: 'complete',
                summary: 'Verified the conversation no longer jumps to the bottom when a record updates.'
              }
            ]
          }
        }
      },

      // (d) Provider-exposed thought segments on a goal-run turn: one
      // finished, one still active.
      {
        id: 't11-m0006',
        set: {
          thoughtSegments: [
            {
              id: 'thought-goal-run-1',
              status: 'complete',
              label: 'Theme matrix check',
              summary: 'Verified that all 32 theme-width configurations have a recorded task entry before continuing.',
              providerExposed: true,
              collapsed: true
            },
            {
              id: 'thought-goal-run-2',
              status: 'active',
              label: 'Rail behavior review',
              summary: 'Checking the fake application rail in both open and closed states against the recorded task.',
              providerExposed: true,
              collapsed: true
            }
          ]
        }
      }
    ],

    messageInserts: [
      // One long assistant turn in the retention-review thread, placed in the
      // middle of the history and shipped collapsed. Search must be able to
      // surface the phrase "canonical source history" from inside the
      // collapsed body.
      {
        threadId: 'thread-09',
        afterMessageId: 't09-m0060',
        message: {
          id: 't09-m0060a',
          role: 'assistant',
          body: 'Here is the reconstruction of the retention decision you asked about. The short version: the thread kept every archived exchange intact and added review notes on top of it, rather than rewriting the older turns.\n\nThree rules fell out of the review. First, display shaping is thread-local. Collapsing, muting, and condensation change what is rendered, never what is stored, so a later session can always expand the thread back to the full record. Second, every condensation note carries a pointer to the exchanges it covers. The cedar markers in this thread are exactly that: small, unique anchors that let a reviewer jump from a summary straight to the original turn without guessing. Third, the oldest material is never deleted to save space. When the thread grew past what the window should eagerly render, the prototype loaded only the newest slice and left the rest indexed for search, which is why a query can still surface a decision from the first dozen exchanges.\n\nThe one place this got expensive was review time. Reading twenty review notes in order is slower than reading one synthesis, so the review notes themselves became candidates for condensation once their decisions were confirmed. That is the step you are seeing now: a second-pass note that cites the earlier reviews instead of repeating them.\n\nIf you want to audit any of this, expand the collapsed regions and compare them against the review notes. Each claim above traces back to a specific stored exchange, and the stored exchanges remain, unedited, in the canonical source history.',
          sentAt: '2026-07-30T18:41:22Z',
          runtime: {
            provider: 'Moonshot',
            model: 'Kimi K3',
            persona: 'Research analyst',
            mode: 'Agent',
            effort: 'Medium',
            workedSeconds: 96,
            totalElapsedSeconds: 141,
            tokenCount: 3650,
            contextUsed: 17820,
            contextLimit: 128000,
            estimatedCost: 0.04
          },
          eligibleForEdit: false,
          collapsedByDefault: true
        }
      }
    ],

    lensExamples: [
      // A focus/mute pass on the billing-projection thread: two superseded
      // turns muted, the confirmed decision focused.
      {
        threadId: 'thread-02',
        applied: {
          muted: ['t02-m0004', 't02-m0006'],
          focused: ['t02-m0010'],
          subcompacted: []
        }
      },
      // A subcompaction in the long retention thread: three consecutive
      // early exchanges condensed, sources preserved in place.
      {
        threadId: 'thread-09',
        applied: {
          muted: [],
          focused: [],
          subcompacted: [
            {
              ids: ['t09-m0031', 't09-m0032', 't09-m0033'],
              summary: 'Earlier retention discussion condensed into this summary. Source messages remain in canonical history.'
            }
          ]
        }
      }
    ]
  };
})();

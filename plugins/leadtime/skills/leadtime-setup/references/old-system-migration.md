# Old-System Migration

Offer this when the customer previously used another ticketing, helpdesk, CRM, or project system.

## Principle

Migrations should be repeatable and reviewable. Always start with a small sample, let the user review it in Leadtime, then run the full batch.

## Source Ticket Number

Create a text custom field named **Source ticket number** with `POST /administration/task-settings/custom-fields` and attach it to the relevant task types. Store the old system's ticket number there.

Use that field for:

- Traceability back to the old system.
- Idempotency: before creating a task, search existing tasks by source ticket number and update/skip instead of duplicating.

## Migration Shape

1. Inspect the old system: API access, exports, fields, users, projects/queues, statuses, priorities, comments, attachments.
2. Map old queues/groups to Leadtime projects.
3. Map old ticket types, statuses, priorities, and assignees to Leadtime values.
4. Match users by email where possible.
5. Prepare data with normalized dates, HTML-rich descriptions/comments where needed, and the source ticket number.
6. Run a sample import or API migration.
7. Review in Leadtime through deeplinks.
8. Run the batch, verify counts, and offer repair passes.

## Guardrails

- Keep source IDs and source ticket numbers in the migrated records.
- Never show UUIDs to the user.
- Do not bulk-write until the sample is approved.
- If attachments are involved, test one attachment path before batch migration.
- If comments are migrated, preserve author and timestamp when the API supports it; otherwise clearly label imported comments.

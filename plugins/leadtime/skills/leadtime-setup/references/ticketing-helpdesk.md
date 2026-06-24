# Chapter E: Ticketing And Helpdesk

Use this chapter after projects exist and when the customer works with ticketing or support. The guiding principle: Leadtime should adapt to the customer's workflow, not the other way around.

Explain first, interview briefly, configure, then roll the settings out to existing projects.

## Ticketing Customization

Help the customer define:

- **Task types**: the kind of work, such as support case, bug, feature, request, change, or internal task.
- **Statuses**: the workflow stages for tasks.
- **Priorities**: how urgent or important a task is.
- **Activities**: what kind of work time was spent on, used during time booking.
- **Custom fields**: structured fields needed for the customer's workflow.
- **Templates**: default descriptions or documents for repeated task types.

Typical APIs/actions live under task/project administration. Always use `list-actions` and `action-details` instead of relying on hard-coded endpoints.

## Roll Out To Projects

New task types and activities often need to be enabled per project.

When patching project arrays such as `taskTypes` or `activities`, remember that arrays may replace the existing list. Send the complete intended list, not only the new item.

For small workspaces, the practical approach is to enable the desired superset of task types and activities on each relevant project. This usually adds missing options without removing real ones, but still verify the schema and current state first.

## Review Checkpoint

After configuration:

- Provide a deeplink to task settings.
- Provide a deeplink to one project board.
- Create or ask the user to create a test ticket of the new type.
- Verify that template, fields, status, and activities look right.
- Offer to adjust anything immediately.

For support cases and similar types, explicitly confirm billability behavior. For hourly billing, a support case may be billable. For flat-rate support, it may be non-billable.

## Helpdesk

Helpdesk connects incoming customer emails to tickets and lets replies go back from the ticket. Explain it as a closed support loop with organization/project routing.

Configuration may include:

- Email account connection.
- Default task type, status, priority, assignee, and reply body.
- Routing rules based on organization/domain/project.
- Default project for incoming helpdesk tickets.
- Whether automatic replies are sent.

Some parts are UI-only because they require OAuth or global UI switches. If MCP has no action for a setting, provide the exact deeplink and wait for confirmation.

Common UI handoffs:

- Connecting Google Workspace or Microsoft 365 mailboxes through OAuth.
- Enabling a workspace-level helpdesk switch if no API action exists.
- Selecting a default/routing target project when the API does not expose it.

## Guardrails

- Read the current settings before writing.
- Use HTML for default reply bodies when the schema expects rich text.
- Never guess status/type IDs.
- Patch arrays carefully.
- Test one incoming/outgoing path where possible before calling the setup complete.

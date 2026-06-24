# Flow And Phases

## Phase 0 - Connect And Inspect

Start every setup or return session by reading the current workspace state. Do not assume it is empty.

Use MCP actions where available:

- Current user/session and workspace name.
- `GET /organizations?page=1&pageSize=1` and read `total`.
- `GET /projects?page=1&pageSize=1` and read `total`.
- `GET /workspace/users` for existing staff/users.
- Read company/workspace settings when available.

Infer whether the workspace is fresh or partially configured. If it already contains real data, skip completed steps instead of recreating them. Summarize the result in one or two sentences.

## Phase 1 - Short Interview

Ask only the questions needed to choose the setup path. Bundle them when the agent has a structured question capability.

Useful questions:

- What kind of business is this workspace for?
- Which modules matter first: ticketing/helpdesk, time tracking, billing, sales, individual projects, planning, or reporting?
- How many team members should be created?
- Which data should be imported: employees, organizations/contacts, products, projects, or none?
- Is there an old ticket/helpdesk/project system that should be migrated later?

Use the answers to decide which non-core chapters should be included.

## Step Loop

Read `assets/onboarding-steps.json`, sort by `order`, and skip steps whose chapter is not relevant unless `core` is true.

For each step:

1. Explain the step in one or two sentences.
2. For `config` steps, inspect the MCP schema with `action-details`, collect missing values, confirm, execute, and verify.
3. For `learn` steps, explain the topic and optionally offer a small demo example.
4. Add the video/read-more learning block from the JSON.
5. Ask whether the step is complete before continuing.

## Progress Tracking

Primary approach: create an **Onboarding** project in Leadtime and one task per relevant onboarding step. Close each task as the step is completed. This gives the customer a visible progress trail inside the product and doubles as a small live demo.

Fallback: if the project cannot be created, keep a local `leadtime-setup-progress.md` checklist.

On return sessions, inspect the workspace again, compare with the tracking, and skip completed steps.

## UI Handoffs

If no suitable API/MCP action exists for a step, do not improvise:

1. Explain that this action must be done in the UI.
2. Generate the exact deeplink with `leadtime-get-urls`.
3. Give a short instruction and wait for confirmation.

Common UI handoffs: inviting users, connecting an email mailbox, enabling payment/billing providers, or completing OAuth flows.

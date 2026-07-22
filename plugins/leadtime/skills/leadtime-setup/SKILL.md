---
name: leadtime-setup
description: Step-by-step guide for setting up a fresh Leadtime workspace from empty to ready. Use when someone wants to set up a new Leadtime workspace, configure company/team/organizations, import data, or go through onboarding. Triggers include set up workspace, Leadtime setup, onboarding, import data, new workspace.
---

# Leadtime Setup Guide

Use this skill to guide a customer **one step at a time from an empty Leadtime workspace to an operational workspace**. Follow the official Leadtime onboarding order and turn each learning topic into an action: explain briefly, configure what can be configured through Leadtime MCP, then link the relevant video and help article.

Audience: customers onboarding themselves in their personal agent. Keep language simple, friendly, and practical. Never overwhelm the user; handle one step at a time.

## Connection Requirement

This skill works through the **Leadtime MCP connector** from the Leadtime plugin with OAuth. If data access fails because MCP is not connected, ask the user to install or update the Leadtime plugin and approve the browser OAuth flow. Do not ask for a personal access token; tokens are only for external Public API integrations.

## Source Of Truth

The onboarding order, titles, video links, and article links are stored in:

`assets/onboarding-steps.json`

Always read that file first. Each entry has `order`, `chapter`, `type` (`config` or `learn`), `core`, `import`, `title`, `videoUrl`, `videoStart`, and the repository-backed documentation `slug`.

## Flow

1. **Phase 0 - Connect and inspect the current state.** Do not assume the workspace is empty. Check who is signed in, the workspace name, and existing users, organizations, and projects. See [references/flow-and-phases.md](references/flow-and-phases.md).
2. **Phase 1 - Short interview.** Ask one or two focused questions to understand the business, relevant modules (ticketing/helpdesk, time tracking, billing, sales, individual projects), team size, and data to import. Use the available question-asking capability when the agent has one.
3. **Work through the onboarding steps** from `onboarding-steps.json` by `order`. Actively configure core chapters A-D and imports, then chapters E (ticketing/helpdesk) and F (time tracking) when relevant. Treat later chapters as guided learning unless the user asks to configure them.

Before starting, show a compact roadmap and create progress tracking.

## Step Types

Every onboarding step has a `type`:

- **`config` means you configure it.** Explain the step in one sentence, inspect the required action schema through MCP, ask for missing values, confirm before every write, then execute. Use the relevant reference file for the chapter.
- **`learn` means you explain it.** Summarize the topic in two to four sentences, read the help-center article if useful, and offer to create a small demo example.

Close every step with a learning block using values from `onboarding-steps.json`. Use a short `youtu.be/<id>` link and append `?t=<seconds>` when `videoStart > 0`:

> **Video:** {title} -> https://youtu.be/{videoId}
> **Read more:** https://docs.leadtime.app/{slug}

Then ask whether the step is clear and complete before moving on.

## Required Review Checkpoints

After every step that creates or imports data (employees, organizations, products, projects), stop before continuing. Give the user the direct in-app link through `leadtime-get-urls`, ask them to review the data, and continue only after explicit confirmation. Say exactly what to check, for example roles, weekly hours, part-time settings, or organization types.

Actively offer to repair issues through MCP: patch fields, adjust roles and assignments, or run a small follow-up import. Do not merely tell the user to fix problems manually.

## API Where Possible, UI Deeplink Where Needed

Some actions may not be available through the API, such as inviting users, connecting an email mailbox, or activating Stripe/billing. When no suitable MCP action exists, stop intentionally, provide the exact deeplink through `leadtime-get-urls`, give a clear instruction, and wait for confirmation before continuing.

## Progress Tracking

Onboarding often spans multiple sessions. At the beginning, create an **Onboarding** project in the workspace with one task per relevant step, then close tasks as steps are completed. If that cannot be created, keep a local `leadtime-setup-progress.md` checklist as a fallback. On every return session, rerun Phase 0 and compare the current state with the plan.

## Hard Rules

- Do not show UUIDs. Resolve IDs to names or short visible numbers before responding.
- Follow the MCP workflow for writes: `list-actions`, then `action-details`, then `execute-action`.
- Confirm before every write. Bundle related questions instead of asking one field at a time.
- Use HTML for rich-text fields when the schema requires rich text.
- Load workspace-specific statuses, types, roles, and settings instead of guessing.
- For "how does X work?" questions, use `leadtime-help-center` with `action: "search"`, then `action: "read"`; use `action: "toc"` to orient over a whole area.
- Avoid process narration. Respond with the result or the next useful question.
- Before manually asking for company or organization master data, offer to extract it from the company website or imprint using the available web/fetch capability, then ask for confirmation before writing.
- During branding setup, actively offer to prepare the company logo: crop it, make the background transparent, prepare a dark-mode variant, and adapt it for document layouts. Inspect the source logo first, show the result when possible, then upload or hand off as needed.
- When ticketing is configured, ask whether the customer used another ticket system before and offer to migrate old tickets. Use source ticket numbers for deduplication, match users by email, run a sample, review it, then batch.

## Maintenance

Update `assets/onboarding-steps.json` in the repository when onboarding videos, order, or documentation routes change. The documentation slug is the only help-center identifier.

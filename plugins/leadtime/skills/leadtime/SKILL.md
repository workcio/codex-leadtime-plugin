---
name: leadtime
description: Use when the user asks to work with Leadtime, inspect/update Leadtime data, manage tasks, summarize work, or sends a Leadtime link. Explains what Leadtime is and how its building blocks fit together.
---

# Leadtime

Use this skill when the user asks Codex to work with Leadtime, inspect or update tasks/projects/workspace data, plan task work, draft comments, create tasks, summarize reports, or sends a Leadtime link.

## What Leadtime is

Leadtime is a B2B work-management platform (lightweight ERP) for service companies. Each tenant is a **workspace**. Core building blocks:

- **Organizations** — clients, prospects, suppliers (CRM "companies" mean organizations, not objects).
- **Projects** — all work lives here; external vs internal; single (fixed scope) vs ongoing (support).
- **Sales opportunities** — external projects in a sales-stage status, not a separate CRM entity.
- **Components & products** — reusable project templates and catalog items for scoping, quotes, and tickets.
- **Tasks (tickets)** — every task belongs to a project; only status type `Closed` means closed.
- **Planning** — Big Picture → Pool → Pipeline → Stack.
- **Time & billing** — attendance vs booked time; customer time feeds invoices.

Typical flow: organization → opportunity → offer → delivery project → time/tasks → invoice → ongoing support project.

Permissions are per user/role — never assume admin access.

## Default Tool Path

Prefer the bundled Leadtime MCP server for real workspace data. Do not tell the user to create a personal access token for normal in-product work; use the plugin MCP OAuth connection instead. Ask for an API key only when the user wants to build scripts, automations, or third-party integrations outside Codex.

If the user asks for Leadtime data and MCP is not authenticated, tell them to reinstall or upgrade the Leadtime plugin and approve the Leadtime browser OAuth flow. If Codex still does not start the OAuth flow, the fallback is adding the Leadtime MCP server manually with OAuth, but that is a troubleshooting path rather than the default plugin experience.

For MCP/API work, use this sequence:

1. Discover focused actions/tools when needed.
2. Read action/tool details and request schema before executing.
3. Identify required inputs.
4. Ask for missing required data before mutations.
5. Request only useful fields when field selection is available.
6. Resolve IDs to names before presenting results.
7. Show one clean final result.

For vague action requests like "create a task" without details, ask a short clarifying question first.

## Rich Text And Editor Fields

Many Leadtime fields store ProseMirror editor content. When creating or updating descriptions, comments, journals, product descriptions, document content, or similar rich-text fields:

- Use HTML unless the tool schema explicitly asks for another format.
- Read the action/tool schema first and use only supported nodes/marks for that field.
- Do not assume all editor fields support the same HTML.
- Minimum empty content is `<p></p>` or `<p class="paragraph-base"></p>` if required.
- Common safe HTML: paragraphs, headings, lists, links, bold/italic/code. Use tables, callouts, collapses, images, or files only when the schema says the field supports them.

## Domain Rules

- Tasks always belong to a project.
- Task types and statuses are workspace-specific; load them from Leadtime instead of assuming names.
- A task is closed only when its status has canonical type `Closed`; names like Done or Completed are not enough.
- For open task requests, default to open tasks unless the user explicitly asks for closed/all tasks.
- Use open/closed status filters when available instead of comparing status names.
- Resolve status, type, project, assignee, accountable, and organization IDs to readable names.

## Task Creation

Before creating a task, resolve:

- current user if assigning to "me"
- project
- allowed task types for that project
- valid statuses for the selected type

Required task fields usually include title, project, type, status, priority, and description. Default priority to `Normal` and empty description to `<p></p>` when allowed. If project or title is missing, ask the user.

When the user asks you to create follow-up work for "you", "yourself", "Leadtime agent", or the internal agent, create a normal task assigned to the built-in bot named `Leadtime Agent` if available. Make that task self-contained: include outcome, constraints, source links, and prior decisions.

## Task Reports And Summaries

For task reports, avoid generic boilerplate. Use actual task details, comments, history, status changes, time, assignee/accountable, blockers, and next steps.

Use this order:

1. Current situation
2. Overview
3. Key details
4. Next steps

For "my tasks" summaries, resolve the current user, default to open assigned tasks, group by project or status, highlight overdue/high-priority items, and resolve IDs before presenting.

## Links And Output

When using Leadtime MCP tools, call `leadtime-get-urls` in the same turn before returning any Leadtime entity or navigation links. Do not hand-compose app URLs from memory.

Use full Leadtime URLs when you know the workspace URL. Entity links:

- Task: `/task/[taskNumber]` using singular `task`; never `/tasks/` for a single task.
- Project: `/project/[projectId]/overview`
- Organization: `/organizations/[organizationId]/overview`
- Invoice: `/billing/receivables/new/[invoiceId]/overview`
- Planning list: `/planning/tasks`

For one entity, use concise prose or bullets. For two or more rows, use a markdown table with practical columns. Default task columns: task number/link, title, status, type, assignee, project, due date. Avoid raw UUIDs in user-facing output unless explicitly requested.

For implementation work in a Leadtime repository, follow that repository's local instructions and domain docs first.

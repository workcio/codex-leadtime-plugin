---
name: leadtime-public-api
description: Use only when the user wants to build scripts, automations, or external integrations against the Leadtime Public API.
---

# Leadtime Public API

Use this skill only when the user asks Codex to build, debug, or plan scripts, automations, Zapier/n8n-style connectors, or other external integrations with the Leadtime Public API.

For normal Leadtime workspace operations inside Codex, prefer the bundled Leadtime MCP server instead of telling the user to create a personal access token.

For integration work, check the user's available API docs, workspace-specific credentials, and integration requirements before proposing endpoints. Keep credentials out of prompts, source files, logs, and generated examples. Use bearer-token examples with placeholders unless the user has explicitly provided a safe local test token.

When writing rich content through the Public API, use HTML for Leadtime editor fields unless the endpoint schema says otherwise. Read action details for the endpoint and follow the field's supported nodes and marks.

When updating official Leadtime integrations, keep Zapier, n8n, public API DTOs/controllers, and integration docs aligned with the changed API surface.

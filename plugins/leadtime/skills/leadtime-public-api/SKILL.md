---
name: leadtime-public-api
description: Use when building or debugging integrations against the Leadtime Public API.
---

# Leadtime Public API

Use this skill when the user asks Codex to build, debug, or plan an integration with the Leadtime Public API.

Check the user's available API docs, workspace-specific credentials, and integration requirements before proposing endpoints. Keep credentials out of prompts, source files, logs, and generated examples. Use bearer-token examples with placeholders unless the user has explicitly provided a safe local test token.

When updating official Leadtime integrations, keep Zapier, n8n, public API DTOs/controllers, and integration docs aligned with the changed API surface.

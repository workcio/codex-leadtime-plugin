---
name: leadtime-tasks
description: Use when the user asks to work with Leadtime, inspect/update Leadtime data, plan tasks, or sends a Leadtime link.
---

# Leadtime

Use this skill when the user asks Codex to work with Leadtime, inspect or update tasks/projects/workspace data, plan task work, draft task comments, or sends a Leadtime link.

Prefer the bundled Leadtime MCP server for real workspace data. Do not tell the user to create a personal access token for normal in-product work if MCP is available; use OAuth/MCP login instead. Ask for an API key only when the user wants to build scripts, automations, or third-party integrations outside Codex.

When planning work, prefer concrete task titles, acceptance criteria, owner assumptions, and dependencies over broad prose. When the user references existing Leadtime data, use MCP before guessing current state.

For implementation work in a Leadtime repository, follow that repository's local instructions and domain docs first.

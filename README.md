# Leadtime Codex Plugin

This folder is the source of truth for the public Leadtime Codex plugin marketplace.

The public repository is generated from this project and should not be edited directly.

Common Leadtime skills are generated from `libs/integrations/agent-plugin-core` during build. Keep shared behavior there, and put Codex-only packaging or MCP behavior in this package.

The plugin bundles the production Leadtime MCP endpoint:

```text
https://leadtime.app/api/mcp
```

Codex should start the Leadtime OAuth browser flow when the plugin is installed or upgraded. Personal access tokens are not needed for normal task/project work inside Codex.

Personal access tokens are only for users building scripts, automations, or external integrations against the Public API.

## Local validation

From the Leadtime monorepo root:

```bash
npx nx lint codex-leadtime-plugin
npx nx build codex-leadtime-plugin
node libs/integrations/codex-leadtime-plugin/scripts/codex-mcp-compat-probe.mjs
```

From the generated public repository root:

```bash
node scripts/codex-mcp-compat-probe.mjs
```

## Public sync

The deploy workflow runs this only when the project is affected:

```bash
npx nx affected --target=integration-sync
```

The sync script publishes the generated artifact to:

```text
https://github.com/workcio/codex-leadtime-plugin
```

Set `AGENT_PLUGIN_SYNC_TOKEN` in CI to a token that can write to all public plugin repositories:

- `workcio/codex-leadtime-plugin`
- `workcio/claude-leadtime-plugin`
- `workcio/cursor-leadtime-plugin`

For backward compatibility, the sync scripts also accept `CODEX_PLUGIN_SYNC_TOKEN`.

# Leadtime Codex Plugin

This folder is the source of truth for the public Leadtime Codex plugin marketplace.

The public repository is generated from this project and should not be edited directly.

The bundled MCP server uses the production Leadtime MCP endpoint with OAuth:

```text
https://leadtime.app/api/mcp
```

Codex should prompt users to sign in through the MCP OAuth flow. Personal access tokens are only for users building scripts, automations, or external integrations against the Public API.

## Local validation

```bash
npx nx lint codex-leadtime-plugin
npx nx build codex-leadtime-plugin
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

Set `CODEX_PLUGIN_SYNC_TOKEN` in CI to a token that can write to that public repository.

# Leadtime Codex Plugin

This folder is the source of truth for the public Leadtime Codex plugin marketplace.

The public repository is generated from this project and should not be edited directly.

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

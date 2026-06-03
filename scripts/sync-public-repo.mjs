import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const artifactRoot = join(
  repoRoot,
  'dist/libs/integrations/codex-leadtime-plugin',
);
const repo =
  process.env.CODEX_PLUGIN_PUBLIC_REPO || 'workcio/codex-leadtime-plugin';
const branch = process.env.CODEX_PLUGIN_PUBLIC_BRANCH || 'main';
const token =
  process.env.AGENT_PLUGIN_SYNC_TOKEN ||
  process.env.CODEX_PLUGIN_SYNC_TOKEN ||
  '';
const dryRun =
  process.argv.includes('--dry-run') ||
  process.env.CODEX_PLUGIN_SYNC_DRY_RUN === 'true';

function run(command, args, options = {}) {
  const output = execFileSync(command, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    ...options,
  });
  return typeof output === 'string' ? output.trim() : '';
}

if (!existsSync(artifactRoot)) {
  throw new Error(
    `Missing build artifact at ${artifactRoot}. Run nx build codex-leadtime-plugin first.`,
  );
}

if (process.env.CI && !token && !dryRun) {
  throw new Error(
    'AGENT_PLUGIN_SYNC_TOKEN or CODEX_PLUGIN_SYNC_TOKEN is required in CI to push the public Codex plugin repository.',
  );
}

const workRoot = join(tmpdir(), `leadtime-codex-plugin-sync-${Date.now()}`);
const cloneUrl = token
  ? `https://x-access-token:${encodeURIComponent(token)}@github.com/${repo}.git`
  : `https://github.com/${repo}.git`;

await rm(workRoot, { recursive: true, force: true });
await mkdir(workRoot, { recursive: true });

try {
  run(
    'git',
    ['clone', '--depth', '1', '--branch', branch, cloneUrl, workRoot],
    { stdio: 'inherit' },
  );
} catch (error) {
  if (dryRun) {
    console.log(
      `Dry run: public repository ${repo}@${branch} is not cloneable yet.`,
    );
    console.log(
      'Dry run: build artifact is ready and would be pushed after the repository is created.',
    );
    process.exit(0);
  }
  throw error;
}

for (const entry of [
  '.agents',
  'plugins',
  'scripts',
  'README.md',
  'LICENSE',
  '.generated-from',
]) {
  await rm(join(workRoot, entry), { recursive: true, force: true });
  await cp(join(artifactRoot, entry), join(workRoot, entry), {
    recursive: true,
    force: true,
  });
}

run('git', ['add', '.'], { cwd: workRoot });
const status = run('git', ['status', '--porcelain'], { cwd: workRoot });

if (!status) {
  console.log('Public Codex plugin repository is already up to date.');
  process.exit(0);
}

if (dryRun) {
  console.log('Dry run: public Codex plugin repository would be updated:');
  console.log(status);
  process.exit(0);
}

const sourceSha =
  process.env.GITHUB_SHA ||
  run('git', ['rev-parse', '--short', 'HEAD'], { cwd: repoRoot });
run('git', ['config', 'user.name', 'leadtime-bot'], { cwd: workRoot });
run('git', ['config', 'user.email', 'bot@leadtime.app'], { cwd: workRoot });
run(
  'git',
  [
    'commit',
    '-m',
    `chore: sync Codex plugin from Leadtime ${sourceSha.slice(0, 12)}`,
  ],
  {
    cwd: workRoot,
    stdio: 'inherit',
  },
);
run('git', ['push', 'origin', branch], { cwd: workRoot, stdio: 'inherit' });

console.log(`Synced Codex plugin marketplace to ${repo}@${branch}.`);

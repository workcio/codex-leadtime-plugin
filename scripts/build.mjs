import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAgentPluginAssets } from '../../agent-plugin-core/scripts/generate-plugin-assets.mjs';

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const projectRoot = join(repoRoot, 'libs/integrations/codex-leadtime-plugin');
const outputRoot = join(
  repoRoot,
  'dist/libs/integrations/codex-leadtime-plugin',
);

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const entry of ['.agents', 'plugins', 'scripts', 'README.md', 'LICENSE']) {
  await cp(join(projectRoot, entry), join(outputRoot, entry), {
    recursive: true,
    force: true,
  });
}

await generateAgentPluginAssets({
  agent: 'codex',
  outputRoot,
  skillsPath: 'plugins/leadtime/skills',
});

await writeFile(
  join(outputRoot, '.generated-from'),
  [
    'Generated from Leadtime monorepo.',
    `Source project: libs/integrations/codex-leadtime-plugin`,
    `Generated at: ${new Date().toISOString()}`,
    '',
  ].join('\n'),
);

console.log(`Built Codex plugin marketplace at ${outputRoot}`);

import { access, readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const projectRoot = join(
  repoRoot,
  'dist/libs/integrations/codex-leadtime-plugin',
);
const pluginRoot = join(projectRoot, 'plugins/leadtime');
const errors = [];

function fail(message) {
  errors.push(message);
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    fail(`${relative(repoRoot, path)} is not valid JSON: ${error.message}`);
    return null;
  }
}

function isStrictSemver(value) {
  return /^\d+\.\d+\.\d+$/.test(value);
}

function isHttpsUrl(value) {
  return typeof value === 'string' && value.startsWith('https://');
}

const marketplace = await readJson(
  join(projectRoot, '.agents/plugins/marketplace.json'),
);
const manifest = await readJson(join(pluginRoot, '.codex-plugin/plugin.json'));

if (marketplace) {
  if (marketplace.name !== 'leadtime')
    fail('Marketplace name must be "leadtime".');
  if (!marketplace.interface?.displayName)
    fail('Marketplace interface.displayName is required.');
  const entry = marketplace.plugins?.find(
    (plugin) => plugin.name === 'leadtime',
  );
  if (!entry) fail('Marketplace must include the leadtime plugin entry.');
  if (entry?.source?.path !== './plugins/leadtime')
    fail('Marketplace source.path must be ./plugins/leadtime.');
  if (entry?.policy?.installation !== 'AVAILABLE')
    fail('Marketplace policy.installation must be AVAILABLE.');
  if (entry?.policy?.authentication !== 'ON_INSTALL')
    fail('Marketplace policy.authentication must be ON_INSTALL.');
}

if (manifest) {
  if (manifest.name !== 'leadtime')
    fail('Plugin manifest name must be "leadtime".');
  if (!isStrictSemver(manifest.version))
    fail('Plugin manifest version must be strict semver, e.g. 0.1.0.');
  if (manifest.skills !== './skills/')
    fail('Plugin manifest skills path must be ./skills/.');
  for (const field of ['websiteURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
    if (manifest.interface?.[field] && !isHttpsUrl(manifest.interface[field])) {
      fail(`Plugin interface.${field} must be an https URL.`);
    }
  }
  if (manifest.mcpServers && !manifest.mcpServers.startsWith('./')) {
    fail('Plugin manifest mcpServers path must be relative and start with ./.');
  }
}

if (!manifest?.mcpServers) {
  fail('Plugin manifest must include bundled Leadtime MCP via mcpServers.');
} else {
  const mcpPath = join(pluginRoot, manifest.mcpServers);
  try {
    await access(mcpPath);
  } catch {
    fail('Plugin manifest mcpServers file does not exist.');
  }

  const mcpConfig = await readJson(mcpPath);
  const leadtimeMcp = mcpConfig?.mcpServers?.leadtime;
  if (leadtimeMcp?.url !== 'https://leadtime.app/api/mcp') {
    fail('Bundled Leadtime MCP url must be https://leadtime.app/api/mcp.');
  }
  if (leadtimeMcp?.oauth_resource !== 'https://leadtime.app/api/mcp') {
    fail(
      'Bundled Leadtime MCP must set oauth_resource to https://leadtime.app/api/mcp.',
    );
  }
  const scopes = leadtimeMcp?.scopes ?? [];
  for (const scope of ['api:read', 'api:write']) {
    if (!scopes.includes(scope))
      fail(`Bundled Leadtime MCP must request ${scope}.`);
  }
}

const skillsRoot = join(pluginRoot, 'skills');
let skillDirs = [];
try {
  skillDirs = (await readdir(skillsRoot)).sort();
} catch {
  fail('Plugin must include a skills directory.');
}

for (const dir of skillDirs) {
  const skillPath = join(skillsRoot, dir);
  if (!(await stat(skillPath)).isDirectory()) continue;

  const skillFile = join(skillPath, 'SKILL.md');
  let content = '';
  try {
    content = await readFile(skillFile, 'utf8');
  } catch {
    fail(`Skill ${dir} is missing SKILL.md.`);
    continue;
  }

  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    fail(`Skill ${dir} is missing YAML frontmatter.`);
    continue;
  }

  const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter[1]
    .match(/^description:\s*(.+)$/m)?.[1]
    ?.trim();
  if (name !== dir)
    fail(`Skill ${dir} frontmatter name must match folder name.`);
  if (!description) fail(`Skill ${dir} must include a description.`);
  if (content.includes('[TODO'))
    fail(`Skill ${dir} contains a TODO placeholder.`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('Leadtime Codex plugin validation passed.');

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptRoot, '..');
const pluginRoot = join(projectRoot, 'plugins/leadtime');
const manifestPath = join(pluginRoot, '.codex-plugin/plugin.json');

const args = new Set(process.argv.slice(2));
const verbose = args.has('--verbose');

function fail(message) {
  throw new Error(message);
}

function log(message) {
  console.log(message);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function codexDiscoveryPaths(basePath) {
  const trimmed = basePath.replace(/^\/+/, '').replace(/\/+$/, '');
  const canonical = '/.well-known/oauth-authorization-server';

  if (!trimmed) return [canonical];

  const candidates = [
    `${canonical}/${trimmed}`,
    `/${trimmed}/.well-known/oauth-authorization-server`,
    canonical,
  ];

  return [...new Set(candidates)];
}

function rootProtectedResourcePaths(basePath) {
  const trimmed = basePath.replace(/^\/+/, '').replace(/\/+$/, '');
  const canonical = '/.well-known/oauth-protected-resource';
  return trimmed ? [`${canonical}/${trimmed}`, canonical] : [canonical];
}

function withPath(baseUrl, path) {
  const url = new URL(baseUrl);
  url.pathname = path;
  url.search = '';
  return url.toString();
}

async function getJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { response, text, json };
}

function parseAuthenticateHeader(header) {
  if (!header?.startsWith('Bearer ')) {
    fail(`Expected Bearer WWW-Authenticate header, got: ${header ?? '<missing>'}`);
  }

  const params = {};
  const input = header.slice('Bearer '.length);
  const pattern = /([a-zA-Z_][a-zA-Z0-9_-]*)="([^"]*)"/g;
  for (const match of input.matchAll(pattern)) {
    params[match[1]] = match[2];
  }
  return params;
}

function assertRequiredScopes(scopes, source) {
  const set = new Set(Array.isArray(scopes) ? scopes : String(scopes ?? '').split(/\s+/));
  for (const scope of ['api:read', 'api:write']) {
    if (!set.has(scope)) fail(`${source} must include ${scope}`);
  }
}

async function assertCodexOAuthDiscovery(mcpUrl) {
  const base = new URL(mcpUrl);
  const headers = { 'MCP-Protocol-Version': '2024-11-05' };
  const tried = [];

  for (const path of codexDiscoveryPaths(base.pathname)) {
    const url = withPath(mcpUrl, path);
    tried.push(url);
    const { response, json, text } = await getJson(url, headers);
    if (verbose) log(`discovery ${response.status} ${url}`);
    if (response.status !== 200) continue;
    if (!json) fail(`Discovery response is not JSON at ${url}: ${text.slice(0, 200)}`);
    if (!json.authorization_endpoint || !json.token_endpoint) {
      fail(`Discovery JSON at ${url} is missing authorization_endpoint/token_endpoint`);
    }
    if (!json.registration_endpoint) {
      fail(`Discovery JSON at ${url} is missing registration_endpoint for dynamic OAuth clients`);
    }
    assertRequiredScopes(json.scopes_supported, `Discovery JSON at ${url}`);
    return url;
  }

  fail(`Codex OAuth discovery failed. Tried: ${tried.join(', ')}`);
}

async function assertProtectedResourceMetadata(mcpUrl) {
  const base = new URL(mcpUrl);
  const tried = [];

  for (const path of rootProtectedResourcePaths(base.pathname)) {
    const url = withPath(mcpUrl, path);
    tried.push(url);
    const { response, json, text } = await getJson(url);
    if (verbose) log(`protected-resource ${response.status} ${url}`);
    if (response.status !== 200) continue;
    if (!json) fail(`Protected resource response is not JSON at ${url}: ${text.slice(0, 200)}`);
    if (json.resource !== mcpUrl) {
      fail(`Protected resource metadata has resource=${json.resource}, expected ${mcpUrl}`);
    }
    if (!json.authorization_servers?.includes('https://leadtime.app/api')) {
      fail(`Protected resource metadata must include https://leadtime.app/api authorization server`);
    }
    assertRequiredScopes(json.scopes_supported, `Protected resource JSON at ${url}`);
    return url;
  }

  fail(`Protected resource metadata failed. Tried: ${tried.join(', ')}`);
}

async function assertCodexUnauthenticatedStartup(mcpUrl) {
  const response = await fetch(mcpUrl, {
    method: 'POST',
    headers: {
      accept: 'text/event-stream, application/json',
      'content-type': 'application/json',
      'MCP-Protocol-Version': '2025-06-18',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'leadtime-codex-compat-probe', version: '0' },
      },
    }),
  });

  const text = await response.text();
  const authenticate = response.headers.get('www-authenticate');
  if (response.status !== 401) {
    fail(`Unauthenticated initialize must return 401 for Codex AuthRequired handling, got ${response.status}: ${text.slice(0, 300)}`);
  }

  const params = parseAuthenticateHeader(authenticate);
  if (!params.authorization_uri) fail('WWW-Authenticate must include authorization_uri');
  if (params.resource !== mcpUrl) fail(`WWW-Authenticate resource must be ${mcpUrl}, got ${params.resource}`);
  if (!params.resource_metadata) fail('WWW-Authenticate must include resource_metadata');
  assertRequiredScopes(params.scope, 'WWW-Authenticate scope');

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    fail(`401 body should be JSON for non-Codex clients, got: ${text.slice(0, 200)}`);
  }
  if (body.error !== 'invalid_token') {
    fail(`401 body error should be invalid_token, got ${body.error}`);
  }
}

async function assertHeadProbe(mcpUrl) {
  const response = await fetch(mcpUrl, { method: 'HEAD' });
  if (response.status !== 401) fail(`HEAD probe must return 401, got ${response.status}`);
  parseAuthenticateHeader(response.headers.get('www-authenticate'));
}

async function main() {
  const manifest = await readJson(manifestPath);
  if (manifest.mcpServers !== './.mcp.json') {
    fail(`Plugin manifest must point mcpServers at ./.mcp.json, got ${manifest.mcpServers}`);
  }

  const mcpConfig = await readJson(join(pluginRoot, manifest.mcpServers));
  const server = mcpConfig.mcpServers?.leadtime;
  if (!server) fail('Plugin .mcp.json must contain mcpServers.leadtime');
  if (server.url !== 'https://leadtime.app/api/mcp') fail(`Unexpected MCP URL: ${server.url}`);
  if (server.oauth_resource !== server.url) {
    fail(`oauth_resource must match MCP URL for Codex OAuth login, got ${server.oauth_resource}`);
  }
  assertRequiredScopes(server.scopes, 'Plugin MCP scopes');

  const discoveryUrl = await assertCodexOAuthDiscovery(server.url);
  const resourceUrl = await assertProtectedResourceMetadata(server.url);
  await assertCodexUnauthenticatedStartup(server.url);
  await assertHeadProbe(server.url);

  log('Leadtime MCP Codex compatibility probe passed.');
  log(`Codex OAuth discovery matched: ${discoveryUrl}`);
  log(`Protected resource metadata matched: ${resourceUrl}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

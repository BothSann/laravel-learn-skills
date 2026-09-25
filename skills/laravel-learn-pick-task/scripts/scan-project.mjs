#!/usr/bin/env node
// Scan a Laravel app and print facts as JSON on stdout.
// Read-only: never writes files, never changes the database.
//
// Usage: node scan-project.mjs <repo-root> [--no-artisan] [--no-gh] [--merged-prs=<file.json>]
//
// --no-gh          skip `gh pr list` (the merged-lesson check)
// --merged-prs=F   read merged PRs from a JSON file instead of `gh` (for tests)
//
// Same input, same output: every list is sorted, no timestamps.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'vendor', 'storage', 'public', 'learn',
  'cache', '.idea', '.vscode', 'dist', 'build',
]);

const CLASS_KINDS = [
  ['Http/Controllers', 'controllers'],
  ['Http/Requests', 'requests'],
  ['Http/Resources', 'resources'],
  ['Http/Middleware', 'middleware'],
  ['Models', 'models'],
  ['Repositories', 'repositories'],
  ['Services', 'services'],
  ['Events', 'events'],
  ['Listeners', 'listeners'],
  ['Policies', 'policies'],
  ['Jobs', 'jobs'],
  ['Enums', 'enums'],
  ['Exceptions', 'exceptions'],
];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

function log(msg) {
  process.stderr.write(`[scan] ${msg}\n`);
}

function toPosix(p) {
  return p.split(sep).join('/');
}

function readText(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function readJson(path) {
  const text = readText(path);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    log(`bad JSON in ${path}: ${error.message}`);
    return null;
  }
}

function isDir(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function sortedObject(obj) {
  return Object.fromEntries(Object.keys(obj).sort().map((key) => [key, obj[key]]));
}

// ---------- config ----------

function loadConfig(root) {
  const path = join(root, 'learn', 'learn.config.json');
  if (!existsSync(path)) return null;
  return readJson(path);
}

// ---------- modules ----------

function scanModules(root, modulesPath) {
  if (!modulesPath) return [];
  const dir = join(root, modulesPath);
  if (!isDir(dir)) return [];
  const enabled = readJson(join(dir, 'modules.json')) ?? {};
  const modules = [];
  for (const name of readdirSync(dir).sort()) {
    const moduleDir = join(dir, name);
    if (!isDir(moduleDir)) continue;
    const manifest = readJson(join(moduleDir, 'module.json'));
    if (!manifest && !existsSync(join(moduleDir, 'composer.json'))) continue;
    modules.push({
      name: manifest?.name ?? name,
      path: toPosix(relative(root, moduleDir)),
      description: manifest?.description ?? null,
      enabled: name in enabled ? Boolean(enabled[name]) : null,
    });
  }
  return modules;
}

// Which module owns a file. "app" when outside modulesPath.
function moduleOf(root, modulesPath, file) {
  if (!modulesPath) return 'app';
  const rel = toPosix(relative(join(root, modulesPath), file));
  if (rel.startsWith('..')) return 'app';
  return rel.split('/')[0];
}

// ---------- classes ----------

function scanClasses(root, modulesPath, phpFiles) {
  const byModule = {};
  for (const file of phpFiles) {
    const rel = `/${toPosix(relative(root, file))}`;
    if (rel.includes('/tests/') || rel.includes('/database/')) continue;
    const kind = CLASS_KINDS.find(([segment]) => rel.includes(`/${segment}/`));
    if (!kind) continue;
    const module = moduleOf(root, modulesPath, file);
    const name = rel.split('/').pop().replace(/\.php$/, '');
    byModule[module] ??= {};
    byModule[module][kind[1]] ??= [];
    byModule[module][kind[1]].push(name);
  }
  for (const module of Object.keys(byModule)) {
    for (const kind of Object.keys(byModule[module])) byModule[module][kind].sort();
    byModule[module] = sortedObject(byModule[module]);
  }
  return sortedObject(byModule);
}

// ---------- migrations ----------

function scanMigrations(root, modulesPath, phpFiles) {
  const migrations = [];
  for (const file of phpFiles) {
    const rel = toPosix(relative(root, file));
    if (!rel.includes('database/migrations/')) continue;
    const text = readText(file) ?? '';
    const creates = [...text.matchAll(/Schema::create\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    const alters = [...text.matchAll(/Schema::table\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    migrations.push({
      file: rel,
      module: moduleOf(root, modulesPath, file),
      creates: [...new Set(creates)].sort(),
      alters: [...new Set(alters)].sort(),
    });
  }
  migrations.sort((a, b) => a.file.split('/').pop().localeCompare(b.file.split('/').pop()));
  const tables = [...new Set(migrations.flatMap((m) => m.creates))].sort();
  return { migrations, tables };
}

// ---------- routes ----------

function routesFromArtisan(appDir) {
  const result = spawnSync('php', ['artisan', 'route:list', '--json'], {
    cwd: appDir,
    encoding: 'utf8',
    timeout: 60_000,
    shell: false,
  });
  if (result.status !== 0 || !result.stdout) {
    log(`route:list failed: ${(result.stderr || result.error?.message || 'no output').trim().split('\n')[0]}`);
    return null;
  }
  const start = result.stdout.indexOf('[');
  let rows;
  try {
    rows = JSON.parse(result.stdout.slice(start));
  } catch {
    log('route:list gave output that is not JSON');
    return null;
  }
  return rows.map((row) => ({
    methods: row.method.split('|').filter((m) => m !== 'HEAD').sort(),
    uri: row.uri,
    name: row.name ?? null,
    action: row.action,
    stub: row.action === 'Closure',
    middleware: [...(row.middleware ?? [])].sort(),
  }));
}

function routesFromRegex(root, phpFiles) {
  const routes = [];
  for (const file of phpFiles) {
    const rel = toPosix(relative(root, file));
    if (!/(^|\/)routes\//.test(rel)) continue;
    const text = readText(file) ?? '';
    for (const match of text.matchAll(/Route::(get|post|put|patch|delete)\(\s*['"]([^'"]*)['"]\s*,\s*([^\n]*)/gi)) {
      routes.push({
        methods: [match[1].toUpperCase()],
        uri: match[2].replace(/^\//, ''),
        name: null,
        action: match[3].trim().startsWith('fn') || match[3].trim().startsWith('function') ? 'Closure' : 'Controller',
        stub: match[3].trim().startsWith('fn') || match[3].trim().startsWith('function'),
        middleware: [],
        file: rel,
      });
    }
  }
  return routes;
}

function sortRoutes(routes) {
  return routes.sort((a, b) => a.uri.localeCompare(b.uri) || a.methods.join().localeCompare(b.methods.join()));
}

// ---------- docs ----------

function parseDoc(text) {
  const endpoints = [];
  const buildOrder = [];
  let section = null;
  let inBuildOrder = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^#{2,3}\s+(.*)$/);
    if (heading) {
      section = heading[1].trim();
      inBuildOrder = /build order/i.test(section);
      continue;
    }

    if (inBuildOrder) {
      const item = line.match(/^(\d+)[.)]\s+(.*)$/);
      if (item) buildOrder.push({ step: Number(item[1]), title: item[2].trim() });
      continue;
    }

    // Table row: | GET | `/api/v1/me` | user | Does ... |
    if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      if (cells.length >= 2 && HTTP_METHODS.includes(cells[0].toUpperCase())) {
        endpoints.push({
          section,
          method: cells[0].toUpperCase(),
          path: cells[1].replace(/`/g, '').trim(),
          auth: cells[2] ?? null,
          does: cells[3] ?? null,
        });
      }
      continue;
    }

    // Plain line: GET /api/v1/me or - `POST /api/v1/posts`
    const plain = line.match(/^[-*]?\s*`?(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s`]*)`?/);
    if (plain) {
      endpoints.push({ section, method: plain[1], path: plain[2], auth: null, does: null });
    }
  }
  return { endpoints, buildOrder };
}

function normalizePath(path) {
  return path.toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '').replace(/\{[^}]+\}/g, '{}');
}

function matchEndpoints(endpoints, routes, fromRegex) {
  const done = [];
  const stubs = [];
  const missing = [];
  for (const endpoint of endpoints) {
    const docPath = normalizePath(endpoint.path);
    const route = routes.find((r) => {
      if (!r.methods.includes(endpoint.method)) return false;
      const routePath = normalizePath(r.uri);
      if (routePath === docPath) return true;
      // Regex routes miss group prefixes, so match on the tail.
      return fromRegex && routePath !== '' && docPath.endsWith(`/${routePath}`);
    });
    const row = { section: endpoint.section, method: endpoint.method, path: endpoint.path };
    if (!route) missing.push(row);
    else if (route.stub) stubs.push({ ...row, route: route.uri });
    else done.push({ ...row, route: route.uri, action: route.action });
  }
  return { done, stubs, missing };
}

// ---------- tests ----------

function scanTests(root, modulesPath, allFiles) {
  const byModule = {};
  for (const file of allFiles) {
    const rel = toPosix(relative(root, file));
    if (!rel.includes('tests/') || !rel.endsWith('Test.php')) continue;
    const text = readText(file) ?? '';
    const count = (text.match(/^\s*(it|test)\(/gm) ?? []).length
      + (text.match(/public function test\w*\(/g) ?? []).length;
    const module = moduleOf(root, modulesPath, file);
    byModule[module] ??= { files: [], testCalls: 0 };
    byModule[module].files.push(rel);
    byModule[module].testCalls += count;
  }
  for (const module of Object.keys(byModule)) byModule[module].files.sort();
  return sortedObject(byModule);
}

// ---------- lessons ----------

function frontmatter(text) {
  const match = text?.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([\w-]+):\s*(.*)$/);
    if (pair) data[pair[1]] = pair[2].trim().replace(/^["']|["']$/g, '');
  }
  return data;
}

function firstHeading(text) {
  return text?.match(/^#\s+(.+)$/m)?.[1].trim() ?? null;
}

function scanLessons(root) {
  const dir = join(root, 'learn');
  if (!isDir(dir)) return [];
  const lessons = [];
  for (const name of readdirSync(dir).sort()) {
    const match = name.match(/^(\d{2,})-(.+)$/);
    if (!match || !isDir(join(dir, name))) continue;
    const ticket = readText(join(dir, name, 'TICKET.md'));
    const readme = readText(join(dir, name, 'README.md'));
    const meta = frontmatter(ticket);
    lessons.push({
      number: Number(match[1]),
      slug: match[2],
      folder: `learn/${name}`,
      id: meta.id ?? null,
      status: meta.status ?? 'unknown',
      branch: meta.branch ?? null,
      title: firstHeading(ticket) ?? firstHeading(readme),
      files: ['TICKET.md', 'README.md', 'GUIDE.md', 'check-yourself.md', 'ref']
        .filter((f) => existsSync(join(dir, name, f))),
    });
  }
  return lessons;
}

// ---------- quality sources ----------

const BOOST_SKILLS = ['laravel-best-practices', 'testing-best-practices'];

function markdownIn(dir) {
  return walk(dir).filter((f) => f.endsWith('.md')).sort();
}

function scanQualitySources(root, config, appPath) {
  const rel = (path) => toPosix(relative(root, path));
  const inApp = (...parts) => join(root, appPath ?? '.', ...parts);
  const existing = (paths) => paths.filter((p) => existsSync(p));

  const rulesDirs = config?.rulesDirs
    ? config.rulesDirs.map((p) => join(root, p))
    : existing([inApp('.claude', 'rules'), inApp('.ai', 'rules')]);
  const rules = rulesDirs.flatMap((dir) => markdownIn(dir).map((file) => ({
    path: rel(file),
    title: firstHeading(readText(file)),
  })));

  const skillsDirs = config?.skillsDirs
    ? config.skillsDirs.map((p) => join(root, p))
    : existing([inApp('.claude', 'skills')]);
  const skills = [];
  for (const dir of skillsDirs) {
    if (!isDir(dir)) continue;
    for (const name of readdirSync(dir).sort()) {
      const skillFile = join(dir, name, 'SKILL.md');
      if (!existsSync(skillFile)) continue;
      const meta = frontmatter(readText(skillFile));
      skills.push({
        name: meta.name ?? name,
        path: rel(join(dir, name)),
        boost: BOOST_SKILLS.includes(meta.name ?? name),
        ruleFiles: markdownIn(join(dir, name))
          .filter((f) => f !== skillFile)
          .map((f) => toPosix(relative(join(dir, name), f))),
      });
    }
  }

  const guidelineFiles = config?.guidelines
    ? config.guidelines.map((p) => join(root, p))
    : existing([inApp('CLAUDE.md'), inApp('AGENTS.md')]);
  const guidelines = guidelineFiles.filter((f) => existsSync(f)).map((file) => ({
    path: rel(file),
    boost: (readText(file) ?? '').includes('<laravel-boost-guidelines>'),
  }));

  const mcpFiles = [...new Set([inApp('.mcp.json'), join(root, '.mcp.json')])];
  const laravelBoostMcp = mcpFiles.some((file) => {
    const servers = readJson(file)?.mcpServers ?? {};
    return Object.entries(servers).some(([key, server]) => key.includes('laravel-boost')
      || (server.args ?? []).includes('boost:mcp'));
  });

  const found = new Set(skills.map((s) => s.name));
  return {
    rules,
    skills,
    guidelines,
    laravelBoostMcp,
    missingBoostSkills: BOOST_SKILLS.filter((name) => !found.has(name)),
  };
}

// ---------- git ----------

function scanGit(root) {
  const run = (args) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 15_000 });
  const branch = run(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch.status !== 0) return null;
  const status = run(['status', '--porcelain']);
  return {
    branch: branch.stdout.trim(),
    changedFiles: status.stdout.split('\n').filter(Boolean).length,
  };
}

// ---------- merged lessons ----------

// Merged PRs as [{ number, headRefName }], or null when unknown.
// Remote branches are often deleted after merge, so ask GitHub, not git.
function loadMergedPrs(root, args) {
  const file = args.find((a) => a.startsWith('--merged-prs='));
  if (file) return JSON.parse(readFileSync(file.slice('--merged-prs='.length), 'utf8'));
  if (args.includes('--no-gh')) return null;
  const result = spawnSync('gh', ['pr', 'list', '--state', 'merged', '--limit', '200', '--json', 'number,headRefName'], {
    cwd: root, encoding: 'utf8', timeout: 20_000, shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    log('gh pr list failed; merged-lesson check skipped');
    return null;
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

// A lesson that is not done but whose branch is merged: its status is stale.
// Match the ticket's `branch:` exactly, else a head branch named after the slug.
function markMerged(lessons, mergedPrs) {
  for (const lesson of lessons) {
    lesson.mergedPr = null;
    if (!mergedPrs || lesson.status === 'done' || lesson.status === 'dropped') continue;
    const pr = mergedPrs.find((p) => (lesson.branch
      ? p.headRefName === lesson.branch
      : p.headRefName === lesson.slug || p.headRefName.endsWith(`/${lesson.slug}`)));
    if (pr) lesson.mergedPr = { number: pr.number, branch: pr.headRefName };
  }
}

// ---------- main ----------

function main() {
  const args = process.argv.slice(2);
  const root = args.find((a) => !a.startsWith('--')) ?? process.cwd();
  const useArtisan = !args.includes('--no-artisan');
  const blockers = [];

  if (!isDir(root)) {
    log(`not a folder: ${root}`);
    process.exit(2);
  }

  const config = loadConfig(root);
  if (!config) blockers.push('no_config');

  const appPath = config?.appPath ?? (existsSync(join(root, 'artisan')) ? '.' : null);
  const appDir = appPath ? join(root, appPath) : root;
  const hasArtisan = existsSync(join(appDir, 'artisan'));
  if (!hasArtisan) blockers.push('no_artisan');

  const modulesPath = config?.modulesPath ?? null;
  log(`scanning ${appDir}`);
  const allFiles = walk(appDir).sort();
  const phpFiles = allFiles.filter((f) => f.endsWith('.php'));

  let routes = null;
  let routesSource = 'none';
  if (hasArtisan && useArtisan) {
    routes = routesFromArtisan(appDir);
    if (routes) routesSource = 'artisan';
  }
  if (!routes) {
    routes = routesFromRegex(root, phpFiles);
    routesSource = 'regex';
    blockers.push('routes_from_regex');
  }
  sortRoutes(routes);

  const docPath = config?.buildOrderDoc ?? null;
  const docText = docPath ? readText(join(root, docPath)) : null;
  if (!docText) blockers.push('no_build_order_doc');
  const doc = docText ? parseDoc(docText) : { endpoints: [], buildOrder: [] };
  const endpoints = matchEndpoints(doc.endpoints, routes, routesSource === 'regex');

  const { migrations, tables } = scanMigrations(root, modulesPath, phpFiles);
  const lessons = scanLessons(root);
  markMerged(lessons, loadMergedPrs(root, args));
  const qualitySources = scanQualitySources(root, config, appPath);
  if (qualitySources.missingBoostSkills.length) blockers.push('no_boost_skills');

  const output = {
    root: toPosix(root),
    config,
    blockers,
    git: scanGit(root),
    modules: scanModules(root, modulesPath),
    routesSource,
    routes,
    tables,
    migrations,
    classes: scanClasses(root, modulesPath, phpFiles),
    tests: scanTests(root, modulesPath, allFiles),
    buildOrderDoc: docPath,
    buildOrder: doc.buildOrder,
    endpoints,
    lessons,
    qualitySources,
    summary: {
      routes: routes.length,
      tables: tables.length,
      docEndpoints: doc.endpoints.length,
      endpointsDone: endpoints.done.length,
      endpointsStub: endpoints.stubs.length,
      endpointsMissing: endpoints.missing.length,
      lessons: lessons.length,
      lessonsInProgress: lessons.filter((l) => l.status === 'in-progress').length,
      staleLessons: lessons.filter((l) => l.mergedPr).map((l) => l.number),
      nextLessonNumber: lessons.reduce((max, l) => Math.max(max, l.number), 0) + 1,
    },
  };

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  log(`done: ${output.summary.endpointsMissing} missing, ${output.summary.endpointsStub} stub, ${output.summary.endpointsDone} done`);
}

main();

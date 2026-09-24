#!/usr/bin/env node
// Check every skill follows the repo rules in AGENTS.md.
// Exit 1 on any error.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { listShared, listSkills, log, repoRoot, sharedCopy, sharedDir, skillsDir } from './lib.mjs';

const MAX_SKILL_LINES = 500;
const MAX_DESCRIPTION = 1024;
const errors = [];

function fail(file, msg) {
  errors.push(`${relative(repoRoot, file).split('\\').join('/')}: ${msg}`);
}

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([\w-]+):\s*(.*)$/);
    if (pair) data[pair[1]] = pair[2].trim();
  }
  return data;
}

function markdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(path));
    else if (entry.name.endsWith('.md')) out.push(path);
  }
  return out;
}

// Relative links like [x](references/scoring.md) must point to a real file.
function checkLinks(file) {
  const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const match of text.matchAll(/\]\(([^)\s#]+)(#[^)]*)?\)/g)) {
    const target = match[1];
    if (/^[a-z]+:/i.test(target)) continue;
    if (!existsSync(join(dirname(file), target))) fail(file, `broken link: ${target}`);
  }
}

const skills = listSkills();
const shared = listShared();

for (const skill of skills) {
  const dir = join(skillsDir, skill);
  const skillFile = join(dir, 'SKILL.md');

  if (!existsSync(skillFile)) {
    fail(dir, 'missing SKILL.md');
    continue;
  }

  const text = readFileSync(skillFile, 'utf8');
  const meta = frontmatter(text);
  if (!meta) fail(skillFile, 'missing frontmatter');
  else {
    if (meta.name !== skill) fail(skillFile, `name "${meta.name}" does not match folder "${skill}"`);
    if (!meta.description) fail(skillFile, 'missing description');
    else if (meta.description.length > MAX_DESCRIPTION) {
      fail(skillFile, `description is ${meta.description.length} chars, max ${MAX_DESCRIPTION}`);
    }
  }

  const lines = text.split('\n').length;
  if (lines > MAX_SKILL_LINES) fail(skillFile, `${lines} lines, max ${MAX_SKILL_LINES}`);

  for (const extra of ['README.md', 'metadata.json']) {
    if (!existsSync(join(dir, extra))) fail(dir, `missing ${extra}`);
  }
  if (existsSync(join(dir, 'metadata.json'))) {
    try {
      JSON.parse(readFileSync(join(dir, 'metadata.json'), 'utf8'));
    } catch (error) {
      fail(join(dir, 'metadata.json'), `bad JSON: ${error.message}`);
    }
  }

  for (const name of shared) {
    const copy = join(dir, 'references', 'shared', name);
    const expected = sharedCopy(name, readFileSync(join(sharedDir, name), 'utf8'));
    if (!existsSync(copy)) fail(copy, 'missing. Run: npm run sync');
    else if (readFileSync(copy, 'utf8') !== expected) fail(copy, 'out of date. Run: npm run sync');
  }

  for (const file of markdownFiles(dir)) checkLinks(file);

  const scripts = join(dir, 'scripts');
  if (existsSync(scripts) && statSync(scripts).isDirectory()) {
    for (const name of readdirSync(scripts)) {
      const body = readFileSync(join(scripts, name), 'utf8');
      if (name.endsWith('.mjs') && !body.startsWith('#!/usr/bin/env node')) {
        fail(join(scripts, name), 'must start with #!/usr/bin/env node');
      }
    }
  }
}

const listing = JSON.parse(readFileSync(join(repoRoot, 'skills.sh.json'), 'utf8'));
const listed = new Set(listing.groupings.flatMap((g) => g.skills));
for (const skill of skills) {
  if (!listed.has(skill)) fail(join(repoRoot, 'skills.sh.json'), `skill "${skill}" not listed`);
}

if (errors.length) {
  for (const error of errors) log(`✖ ${error}`);
  log(`\n${errors.length} error(s)`);
  process.exit(1);
}
log(`✔ ${skills.length} skills valid`);

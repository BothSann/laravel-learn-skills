// Shared helpers for repo scripts.

import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
export const skillsDir = join(repoRoot, 'skills');
export const sharedDir = join(repoRoot, 'shared');

export function listSkills() {
  return readdirSync(skillsDir)
    .filter((name) => statSync(join(skillsDir, name)).isDirectory())
    .sort();
}

export function listShared() {
  return readdirSync(sharedDir).filter((name) => name.endsWith('.md')).sort();
}

// The text a skill's copy of a shared file must hold.
export function sharedCopy(name, content) {
  return `<!-- Copied from shared/${name} by scripts/sync-shared.mjs. Edit that file, not this one. -->\n\n${content}`;
}

export function log(msg) {
  process.stderr.write(`${msg}\n`);
}

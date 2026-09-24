#!/usr/bin/env node
// Copy shared/*.md into skills/*/references/shared/.
// Each skill installs alone, so it must carry its own copy.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { listShared, listSkills, log, sharedCopy, sharedDir, skillsDir } from './lib.mjs';

const shared = listShared();
let written = 0;

for (const skill of listSkills()) {
  const target = join(skillsDir, skill, 'references', 'shared');
  mkdirSync(target, { recursive: true });

  // Drop copies of shared files that no longer exist.
  for (const old of readdirSync(target)) {
    if (!shared.includes(old)) {
      rmSync(join(target, old));
      log(`removed ${skill}/references/shared/${old}`);
    }
  }

  for (const name of shared) {
    const content = sharedCopy(name, readFileSync(join(sharedDir, name), 'utf8'));
    const path = join(target, name);
    if (existsSync(path) && readFileSync(path, 'utf8') === content) continue;
    writeFileSync(path, content);
    written += 1;
    log(`wrote ${skill}/references/shared/${name}`);
  }
}

log(`sync done: ${written} file(s) written`);

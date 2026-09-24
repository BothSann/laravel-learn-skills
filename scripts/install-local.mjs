#!/usr/bin/env node
// Link each skill into ~/.claude/skills/ so Claude Code finds it.
// Uses junctions on Windows (no admin needed). Edits in this repo show up at once.
//
// Usage: node scripts/install-local.mjs [--remove]

import { existsSync, lstatSync, mkdirSync, rmdirSync, symlinkSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { listSkills, log, skillsDir } from './lib.mjs';

const target = join(homedir(), '.claude', 'skills');
const remove = process.argv.includes('--remove');
mkdirSync(target, { recursive: true });

for (const skill of listSkills()) {
  const link = join(target, skill);
  const exists = existsSync(link) || lstatSafe(link);

  if (exists && !lstatSync(link).isSymbolicLink()) {
    log(`skip ${skill}: ${link} is a real folder, not a link. Move it away first.`);
    continue;
  }
  if (exists) removeLink(link);
  if (remove) {
    log(`removed ${link}`);
    continue;
  }

  symlinkSync(join(skillsDir, skill), link, 'junction');
  log(`linked ${link} -> skills/${skill}`);
}

function lstatSafe(path) {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

// Remove only the link, never the folder it points to.
function removeLink(path) {
  try {
    unlinkSync(path);
  } catch {
    rmdirSync(path);
  }
}

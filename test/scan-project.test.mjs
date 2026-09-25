import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, '..', 'skills', 'laravel-learn-pick-task', 'scripts', 'scan-project.mjs');
const fixture = join(here, 'fixtures', 'tiny-laravel');

function scan(root = fixture, extra = ['--no-gh']) {
  const result = spawnSync(process.execPath, [script, root, '--no-artisan', ...extra], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return { json: JSON.parse(result.stdout), raw: result.stdout };
}

test('reads the config; blockers are regex routes and one missing Boost skill', () => {
  const { json } = scan();
  assert.equal(json.config.buildOrderDoc, 'docs/scope.md');
  assert.deepEqual(json.blockers, ['routes_from_regex', 'no_boost_skills']);
  assert.equal(json.routesSource, 'regex');
});

test('finds tables, classes, and tests', () => {
  const { json } = scan();
  assert.deepEqual(json.tables, ['posts']);
  assert.deepEqual(json.classes.app.models, ['Post']);
  assert.deepEqual(json.classes.app.controllers, ['PostController']);
  assert.deepEqual(json.classes.app.requests, ['StorePostRequest']);
  assert.equal(json.tests.app.testCalls, 2);
});

test('splits doc endpoints into done, stub, and missing', () => {
  const { json } = scan();
  const short = (rows) => rows.map((r) => `${r.method} ${r.path}`);
  assert.deepEqual(short(json.endpoints.done), ['GET /api/posts']);
  assert.deepEqual(short(json.endpoints.stubs), ['GET /api/posts/{post}']);
  assert.deepEqual(short(json.endpoints.missing), ['POST /api/posts', 'POST /api/posts/{post}/comments']);
});

test('reads build order and lessons', () => {
  const { json } = scan();
  assert.deepEqual(json.buildOrder.map((b) => b.title), ['Posts', 'Comments']);
  assert.deepEqual(json.lessons.map((l) => `${l.number}:${l.status}`), ['1:done', '2:in-progress']);
  assert.equal(json.summary.lessonsInProgress, 1);
  assert.equal(json.summary.nextLessonNumber, 3);
});

test('same input gives the same output', () => {
  assert.equal(scan().raw, scan().raw);
});

test('no config gives the no_config blocker', () => {
  const { json } = scan(join(fixture, 'docs'));
  assert.ok(json.blockers.includes('no_config'));
  assert.ok(json.blockers.includes('no_artisan'));
});

test('finds project rules, Boost skills, guidelines, and the Boost MCP', () => {
  const { json } = scan();
  const q = json.qualitySources;
  assert.deepEqual(q.rules, [{ path: '.claude/rules/api.md', title: 'API rules' }]);
  assert.deepEqual(q.skills, [{
    name: 'laravel-best-practices',
    path: '.claude/skills/laravel-best-practices',
    boost: true,
    ruleFiles: ['rules/validation.md'],
  }]);
  assert.deepEqual(q.guidelines, [{ path: 'CLAUDE.md', boost: true }]);
  assert.equal(q.laravelBoostMcp, true);
  assert.deepEqual(q.missingBoostSkills, ['testing-best-practices']);
  assert.ok(json.blockers.includes('no_boost_skills'));
});

test('flags a lesson whose branch is already merged', () => {
  const { json } = scan(fixture, [`--merged-prs=${join(here, 'fixtures', 'merged-prs.json')}`]);
  const byNumber = Object.fromEntries(json.lessons.map((l) => [l.number, l.mergedPr]));
  assert.equal(byNumber[1], null, 'a done lesson is never flagged');
  assert.deepEqual(byNumber[2], { number: 7, branch: 'feature/post-show' });
  assert.deepEqual(json.summary.staleLessons, [2]);
});

test('without merged-PR data, nothing is flagged', () => {
  const { json } = scan();
  assert.ok(json.lessons.every((l) => l.mergedPr === null));
  assert.deepEqual(json.summary.staleLessons, []);
});

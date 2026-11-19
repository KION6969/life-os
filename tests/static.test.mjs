import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const APP_FILES = [
  'index.html',
  'styles.css',
  'sw.js',
  'manifest.webmanifest',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  'js/core.js',
  'js/food.js',
  'js/gym.js',
  'js/study.js',
  'js/profile.js',
  'js/schedule.js',
  'js/init.js'
];

test('required app files and docs are present', () => {
  for (const file of APP_FILES) {
    assert.ok(exists(file), `${file} is missing`);
  }
  for (const file of ['LICENSE', 'README.md', 'docs/screenshot.png', 'docs/mobile.png', 'docs/gym.png']) {
    assert.ok(exists(file), `${file} is missing`);
  }
});

test('the web manifest is valid and its icons exist', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.short_name, 'Life OS');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.start_url);
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 3);
  for (const icon of manifest.icons) {
    assert.ok(exists(icon.src.replace(/^\.\//, '')), `${icon.src} is missing`);
  }
});

test('every local asset referenced by index.html exists', () => {
  const html = read('index.html');
  const refs = [...html.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)].map((match) => match[1]);
  assert.ok(refs.length > 0, 'no local assets found in index.html');
  for (const ref of new Set(refs)) {
    assert.ok(exists(ref), `${ref} is referenced but missing`);
  }
});

test('the service worker shell is complete', () => {
  const sw = read('sw.js');
  const shell = [...sw.matchAll(/'\.\/([^']+)'/g)].map((match) => match[1]);
  assert.ok(shell.includes('index.html'));
  assert.ok(shell.includes('styles.css'));
  assert.ok(shell.includes('js/core.js'));
  for (const file of new Set(shell)) {
    assert.ok(exists(file), `${file} is in the service worker shell but missing`);
  }
});

test('every JavaScript file parses', () => {
  for (const file of APP_FILES.filter((name) => name.endsWith('.js'))) {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), `${file} has a syntax error`);
  }
});

test('source files contain no mojibake', () => {
  for (const file of APP_FILES.filter((name) => /\.(html|css|js|webmanifest)$/.test(name))) {
    assert.doesNotMatch(read(file), /â€|Ã.|Â|�/, `${file} contains mojibake`);
  }
});

test('README points at the live demo and screenshots', () => {
  const readme = read('README.md');
  assert.match(readme, /https:\/\/life-os-two-pied\.vercel\.app/);
  assert.match(readme, /docs\/screenshot\.png/);
  assert.match(readme, /KION6969/);
  assert.match(readme, /MIT/);
});

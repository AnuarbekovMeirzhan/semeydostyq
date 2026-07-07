import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const requiredAssets = [
  'assets/images/teacher-placeholder.svg',
  'assets/images/gallery-placeholder-1.svg',
  'assets/images/gallery-placeholder-2.svg',
  'assets/images/gallery-placeholder-3.svg',
];

for (const path of requiredAssets) {
  test(`${path} exists`, () => {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)));
  });
}

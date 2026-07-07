import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');

const requiredIds = [
  'header', 'hero', 'courses', 'stats', 'advantages',
  'team', 'gallery', 'testimonials', 'prices', 'faq',
  'lead-form', 'footer',
];

for (const id of requiredIds) {
  test(`index.html has element with id="${id}"`, () => {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  });
}

test('index.html links css/style.css', () => {
  assert.match(html, /href=["']css\/style\.css["']/);
});

test('index.html loads js/main.js as a module', () => {
  assert.match(html, /<script[^>]+type=["']module["'][^>]+src=["']js\/main\.js["']/);
});

const requiredTokens = [
  '--color-primary', '--color-accent', '--color-background',
  '--color-surface', '--font-family-base', '--radius-2xl', '--radius-full',
];

for (const token of requiredTokens) {
  test(`style.css defines ${token}`, () => {
    assert.match(css, new RegExp(`${token}\\s*:`));
  });
}

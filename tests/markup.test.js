import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

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

const requiredMetaProperties = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];

for (const property of requiredMetaProperties) {
  test(`index.html has an og:${property.split(':')[1]} meta tag`, () => {
    assert.match(html, new RegExp(`<meta property=["']${property}["'][^>]+content=["'][^"']+["']`));
  });
}

test('index.html og:image points to an absolute URL', () => {
  const match = html.match(/<meta property=["']og:image["'][^>]+content=["']([^"']+)["']/);
  assert.ok(match, 'og:image meta tag not found');
  assert.match(match[1], /^https:\/\//);
});

test('index.html has a twitter:card meta tag set to summary_large_image', () => {
  assert.match(html, /<meta name=["']twitter:card["'][^>]+content=["']summary_large_image["']/);
});

test('index.html has a required consent checkbox in the lead form', () => {
  assert.match(html, /id=["']lead-consent["'][^>]*type=["']checkbox["']/);
  assert.match(html, /id=["']lead-consent-error["']/);
});

test('index.html consent checkbox links to privacy.html', () => {
  assert.match(html, /href=["']privacy\.html["']/);
});

test('index.html loads the Yandex.Metrika counter with the correct id', () => {
  assert.match(html, /mc\.yandex\.ru\/metrika\/tag\.js\?id=110793751/);
  assert.match(html, /ym\(110793751,\s*'init'/);
});

test('privacy.html exists and describes how form data is handled', () => {
  const privacyPath = new URL('../privacy.html', import.meta.url);
  assert.ok(existsSync(privacyPath), 'privacy.html should exist next to index.html');
  const privacyHtml = readFileSync(privacyPath, 'utf8');
  assert.match(privacyHtml, /WhatsApp/);
  assert.match(privacyHtml, /77071911372/);
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

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');

const requiredSelectors = [
  '.site-header', '.hero', '.button--cta', '.whatsapp-float', '.lang-toggle',
  '.course-card', '.stat-card', '.advantage-card', '.team-card',
  '.gallery__image', '.testimonial-card', '.price-card', '.faq-item',
];

for (const selector of requiredSelectors) {
  test(`style.css styles ${selector}`, () => {
    assert.match(css, new RegExp(selector.replace('.', '\\.')));
  });
}

test('style.css defines a tablet breakpoint at 768px', () => {
  assert.match(css, /@media[^{]*min-width:\s*768px/);
});

test('style.css defines a desktop breakpoint at 1024px', () => {
  assert.match(css, /@media[^{]*min-width:\s*1024px/);
});

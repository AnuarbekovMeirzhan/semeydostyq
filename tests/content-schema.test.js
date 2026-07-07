import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ru = JSON.parse(readFileSync(new URL('../data/content.ru.json', import.meta.url), 'utf8'));
const kk = JSON.parse(readFileSync(new URL('../data/content.kk.json', import.meta.url), 'utf8'));

const requiredTopKeys = [
  'header', 'hero', 'courses', 'stats', 'advantages', 'team',
  'gallery', 'testimonials', 'prices', 'faq', 'form', 'footer',
];

for (const lang of [['ru', ru], ['kk', kk]]) {
  const [name, data] = lang;
  for (const key of requiredTopKeys) {
    test(`content.${name}.json has top-level key "${key}"`, () => {
      assert.ok(Object.prototype.hasOwnProperty.call(data, key));
    });
  }

  test(`content.${name}.json courses has at least 3 items with name/grades/description`, () => {
    assert.ok(data.courses.items.length >= 3);
    for (const item of data.courses.items) {
      assert.equal(typeof item.name, 'string');
      assert.equal(typeof item.grades, 'string');
      assert.equal(typeof item.description, 'string');
    }
  });

  test(`content.${name}.json form.directions has 6 options`, () => {
    assert.equal(data.form.directions.length, 6);
  });

  test(`content.${name}.json marks placeholder sections`, () => {
    for (const section of ['stats', 'team', 'gallery', 'testimonials', 'prices']) {
      assert.equal(data[section]._placeholder, true, `${section} should be marked _placeholder`);
    }
  });

  test(`content.${name}.json footer has real Semey branch data`, () => {
    assert.match(data.footer.address, /Семей|Семей қаласы/);
    assert.equal(data.footer.phoneDigits, '77071911372');
  });
}

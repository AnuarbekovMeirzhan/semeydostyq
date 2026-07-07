import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { getNested, applyTranslations } from '../js/lib/i18n.js';

test('getNested resolves a dotted path', () => {
  const data = { hero: { title: 'Готовим к ЕНТ' } };
  assert.equal(getNested(data, 'hero.title'), 'Готовим к ЕНТ');
});

test('getNested returns undefined for a missing path', () => {
  const data = { hero: { title: 'x' } };
  assert.equal(getNested(data, 'hero.subtitle'), undefined);
});

test('getNested returns undefined when an intermediate key is missing', () => {
  const data = {};
  assert.equal(getNested(data, 'a.b.c'), undefined);
});

test('applyTranslations sets textContent for matching data-i18n nodes', () => {
  const dom = new JSDOM('<div><h1 data-i18n="hero.title"></h1><p data-i18n="hero.subtitle"></p></div>');
  const root = dom.window.document;
  applyTranslations(root, { hero: { title: 'Готовим к ЕНТ', subtitle: 'Быстро и с гарантией' } });
  assert.equal(root.querySelector('h1').textContent, 'Готовим к ЕНТ');
  assert.equal(root.querySelector('p').textContent, 'Быстро и с гарантией');
});

test('applyTranslations leaves node untouched when path resolves to non-string', () => {
  const dom = new JSDOM('<div><span data-i18n="courses.items"></span></div>');
  const root = dom.window.document;
  applyTranslations(root, { courses: { items: [1, 2, 3] } });
  assert.equal(root.querySelector('span').textContent, '');
});

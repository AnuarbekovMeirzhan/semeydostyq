import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { initApp, renderSections } from '../js/main.js';

const RU = {
  header: { cta: 'Оставить заявку' },
  hero: { title: 'RU заголовок', subtitle: 'RU подзаголовок', cta: 'RU кнопка' },
  courses: { title: 'RU курсы', items: [{ name: 'ЕНТ', grades: '10-11', description: 'd' }] },
  stats: { title: 'RU стата', items: [{ value: '1', label: 'l' }] },
  advantages: { title: 'RU преимущества', items: [{ title: 't', description: 'd' }] },
  team: { title: 'RU команда', items: [{ name: 'n', subject: 's', experience: 'e', photo: 'p.svg' }] },
  gallery: { title: 'RU галерея', images: ['g.svg'] },
  testimonials: { title: 'RU отзывы', items: [{ author: 'a', text: 't' }] },
  prices: { title: 'RU цены', note: 'n', items: [{ direction: 'd', price: 'p' }] },
  faq: { title: 'RU faq', items: [{ question: 'q', answer: 'a' }] },
  form: { title: 'RU форма', nameLabel: 'l', phoneLabel: 'l', directionLabel: 'l', directions: ['A', 'B'], submit: 's', errorName: 'e', errorPhone: 'e' },
  footer: { rights: 'RU rights' },
};

const KK = JSON.parse(JSON.stringify(RU));
KK.hero.title = 'KK заголовок';

function makeDom() {
  const dom = new JSDOM(`
    <div id="hero"><h1 data-i18n="hero.title"></h1></div>
    <div id="courses-list"></div>
    <div id="stats-list"></div>
    <div id="advantages-list"></div>
    <div id="team-list"></div>
    <div id="gallery-list"></div>
    <div id="testimonials-list"></div>
    <div id="prices-list"></div>
    <div id="faq-list"></div>
    <select id="lead-direction"></select>
    <button id="lang-toggle" type="button">KK</button>
  `, { url: 'http://localhost/' });
  return dom.window.document;
}

function makeFetch(langToData) {
  return async (url) => {
    const lang = url.includes('.kk.') ? 'kk' : 'ru';
    return { json: async () => langToData[lang] };
  };
}

function makeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
  };
}

test('renderSections populates all dynamic list sections', () => {
  const document = makeDom();
  renderSections(document, RU);
  assert.equal(document.querySelectorAll('#courses-list .course-card').length, 1);
  assert.equal(document.querySelectorAll('#stats-list .stat-card').length, 1);
  assert.equal(document.querySelectorAll('#advantages-list .advantage-card').length, 1);
  assert.equal(document.querySelectorAll('#team-list .team-card').length, 1);
  assert.equal(document.querySelectorAll('#gallery-list .gallery__image').length, 1);
  assert.equal(document.querySelectorAll('#testimonials-list .testimonial-card').length, 1);
  assert.equal(document.querySelectorAll('#prices-list .price-card').length, 1);
  assert.equal(document.querySelectorAll('#faq-list .faq-item').length, 1);
  assert.equal(document.querySelectorAll('#lead-direction option').length, 2);
});

test('initApp loads Russian by default and applies translations', async () => {
  const document = makeDom();
  await initApp({ document, fetchImpl: makeFetch({ ru: RU, kk: KK }), storage: makeStorage() });
  assert.equal(document.querySelector('[data-i18n="hero.title"]').textContent, 'RU заголовок');
});

test('initApp switches to Kazakh on lang-toggle click and persists the choice', async () => {
  const document = makeDom();
  const storage = makeStorage();
  await initApp({ document, fetchImpl: makeFetch({ ru: RU, kk: KK }), storage });
  document.getElementById('lang-toggle').dispatchEvent(new document.defaultView.Event('click'));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(document.querySelector('[data-i18n="hero.title"]').textContent, 'KK заголовок');
  assert.equal(storage.getItem('dostyq-lang'), 'kk');
});

test('initApp restores a previously persisted language', async () => {
  const document = makeDom();
  const storage = makeStorage();
  storage.setItem('dostyq-lang', 'kk');
  await initApp({ document, fetchImpl: makeFetch({ ru: RU, kk: KK }), storage });
  assert.equal(document.querySelector('[data-i18n="hero.title"]').textContent, 'KK заголовок');
});

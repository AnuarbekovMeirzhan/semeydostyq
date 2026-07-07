import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  renderItems, courseCardHTML, statCardHTML, advantageCardHTML,
  teamCardHTML, galleryImageHTML, testimonialCardHTML, priceCardHTML,
  faqItemHTML, directionOptionHTML,
} from '../js/lib/render.js';

function makeContainer() {
  const dom = new JSDOM('<div id="c"></div>');
  return dom.window.document.getElementById('c');
}

test('renderItems fills container with mapped HTML and clears previous content', () => {
  const container = makeContainer();
  renderItems(container, [1, 2], (n) => `<span>${n}</span>`);
  assert.equal(container.querySelectorAll('span').length, 2);
  renderItems(container, [1], (n) => `<span>${n}</span>`);
  assert.equal(container.querySelectorAll('span').length, 1);
});

test('courseCardHTML includes name, grades, and description', () => {
  const html = courseCardHTML({ name: 'ЕНТ', grades: '10–11 классы', description: 'x' });
  assert.match(html, /ЕНТ/);
  assert.match(html, /10–11 классы/);
});

test('statCardHTML includes value and label', () => {
  const html = statCardHTML({ value: '20+', label: 'лет опыта' });
  assert.match(html, /20\+/);
  assert.match(html, /лет опыта/);
});

test('advantageCardHTML includes title and description', () => {
  const html = advantageCardHTML({ title: 'Малые группы', description: 'x' });
  assert.match(html, /Малые группы/);
});

test('teamCardHTML includes photo src and name', () => {
  const html = teamCardHTML({ name: 'Иван Иванов', subject: 'Математика', experience: '5 лет', photo: 'a.svg' });
  assert.match(html, /src="a\.svg"/);
  assert.match(html, /Иван Иванов/);
});

test('galleryImageHTML includes src', () => {
  assert.match(galleryImageHTML('b.svg'), /src="b\.svg"/);
});

test('testimonialCardHTML includes author and text', () => {
  const html = testimonialCardHTML({ author: 'Родитель', text: 'Отлично' });
  assert.match(html, /Родитель/);
  assert.match(html, /Отлично/);
});

test('priceCardHTML includes direction and price', () => {
  const html = priceCardHTML({ direction: 'ЕНТ', price: 'от 25 000 ₸' });
  assert.match(html, /ЕНТ/);
  assert.match(html, /25 000/);
});

test('faqItemHTML includes question, answer, and data-faq-index', () => {
  const html = faqItemHTML({ question: 'Q?', answer: 'A.' }, 2);
  assert.match(html, /data-faq-index="2"/);
  assert.match(html, /Q\?/);
  assert.match(html, /A\./);
});

test('directionOptionHTML includes value index and label text', () => {
  const html = directionOptionHTML('ЕНТ — 10 класс', 0);
  assert.match(html, /value="0"/);
  assert.match(html, /ЕНТ — 10 класс/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { attachFormHandler, attachFaqHandlers } from '../js/main.js';

function makeFormDom() {
  const dom = new JSDOM(`
    <form id="lead-form-el">
      <input id="lead-name" name="name" type="text">
      <p id="lead-name-error" hidden></p>
      <input id="lead-phone" name="phone" type="tel">
      <p id="lead-phone-error" hidden></p>
      <select id="lead-direction"><option value="0">ЕНТ — 10 класс</option></select>
      <button type="submit">Send</button>
    </form>
  `, { url: 'http://localhost/' });
  return dom.window.document;
}

test('attachFormHandler blocks submit and shows errors when fields are empty', () => {
  const document = makeFormDom();
  let navigated = null;
  attachFormHandler(document, '77071911372', (url) => { navigated = url; });
  document.getElementById('lead-form-el').dispatchEvent(new document.defaultView.Event('submit', { cancelable: true }));
  assert.equal(navigated, null);
  assert.equal(document.getElementById('lead-name-error').hidden, false);
  assert.equal(document.getElementById('lead-phone-error').hidden, false);
});

test('attachFormHandler navigates to a wa.me link when fields are valid', () => {
  const document = makeFormDom();
  document.getElementById('lead-name').value = 'Айгуль';
  document.getElementById('lead-phone').value = '87071911372';
  let navigated = null;
  attachFormHandler(document, '77071911372', (url) => { navigated = url; });
  document.getElementById('lead-form-el').dispatchEvent(new document.defaultView.Event('submit', { cancelable: true }));
  assert.match(navigated, /^https:\/\/wa\.me\/77071911372\?text=/);
  assert.match(decodeURIComponent(navigated.split('text=')[1]), /Айгуль/);
});

test('attachFormHandler shows the name error on blur, before any submit attempt', () => {
  const document = makeFormDom();
  attachFormHandler(document, '77071911372', () => {});
  const nameInput = document.getElementById('lead-name');
  nameInput.value = '';
  nameInput.dispatchEvent(new document.defaultView.Event('blur', { bubbles: true }));
  assert.equal(document.getElementById('lead-name-error').hidden, false);
});

test('attachFormHandler keeps the phone error hidden on blur when the phone is valid', () => {
  const document = makeFormDom();
  attachFormHandler(document, '77071911372', () => {});
  const phoneInput = document.getElementById('lead-phone');
  phoneInput.value = '87071911372';
  phoneInput.dispatchEvent(new document.defaultView.Event('input', { bubbles: true }));
  phoneInput.dispatchEvent(new document.defaultView.Event('blur', { bubbles: true }));
  assert.equal(document.getElementById('lead-phone-error').hidden, true);
});

test('attachFormHandler clears a shown error live once the field becomes valid', () => {
  const document = makeFormDom();
  attachFormHandler(document, '77071911372', () => {});
  const nameInput = document.getElementById('lead-name');
  const nameError = document.getElementById('lead-name-error');
  nameInput.dispatchEvent(new document.defaultView.Event('blur', { bubbles: true }));
  assert.equal(nameError.hidden, false);
  nameInput.value = 'Айгуль';
  nameInput.dispatchEvent(new document.defaultView.Event('input', { bubbles: true }));
  assert.equal(nameError.hidden, true);
});

test('attachFaqHandlers toggles the answer visibility and aria-expanded on click', () => {
  const dom = new JSDOM(`
    <div id="faq-list">
      <div class="faq-item" data-faq-index="0">
        <button class="faq-item__question" type="button" aria-expanded="false">Q</button>
        <div class="faq-item__answer" hidden>A</div>
      </div>
    </div>
  `, { url: 'http://localhost/' });
  const document = dom.window.document;
  attachFaqHandlers(document);
  const button = document.querySelector('.faq-item__question');
  button.dispatchEvent(new document.defaultView.Event('click', { bubbles: true }));
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(document.querySelector('.faq-item__answer').hidden, false);
  button.dispatchEvent(new document.defaultView.Event('click', { bubbles: true }));
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(document.querySelector('.faq-item__answer').hidden, true);
});

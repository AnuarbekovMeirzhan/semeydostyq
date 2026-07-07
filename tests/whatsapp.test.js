import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPhoneInput, isValidPhone, buildLeadMessage, buildWhatsAppLink } from '../js/lib/whatsapp.js';

test('formatPhoneInput formats progressively as digits are typed', () => {
  assert.equal(formatPhoneInput('7'), '+7');
  assert.equal(formatPhoneInput('7707'), '+7 (707');
  assert.equal(formatPhoneInput('7707191'), '+7 (707) 191');
  assert.equal(formatPhoneInput('77071911372'), '+7 (707) 191-13-72');
});

test('formatPhoneInput normalizes a leading 8 to 7', () => {
  assert.equal(formatPhoneInput('87071911372'), '+7 (707) 191-13-72');
});

test('formatPhoneInput ignores non-digit characters in input', () => {
  assert.equal(formatPhoneInput('+7 (707) 191-13-72'), '+7 (707) 191-13-72');
});

test('formatPhoneInput caps at 11 significant digits', () => {
  assert.equal(formatPhoneInput('770719113729999'), '+7 (707) 191-13-72');
});

test('isValidPhone accepts a fully formatted KZ number', () => {
  assert.equal(isValidPhone('+7 (707) 191-13-72'), true);
});

test('isValidPhone rejects a partial number', () => {
  assert.equal(isValidPhone('+7 (707'), false);
});

test('buildLeadMessage interpolates name, direction, and phone', () => {
  const message = buildLeadMessage({ name: 'Айгуль', phone: '+7 (707) 191-13-72', direction: 'ЕНТ — 11 класс' });
  assert.match(message, /Айгуль/);
  assert.match(message, /ЕНТ — 11 класс/);
  assert.match(message, /\+7 \(707\) 191-13-72/);
});

test('buildWhatsAppLink builds a wa.me URL with url-encoded text', () => {
  const message = 'Здравствуйте! Меня зовут Айгуль';
  const link = buildWhatsAppLink('77071911372', message);
  assert.equal(link, `https://wa.me/77071911372?text=${encodeURIComponent(message)}`);
  assert.equal(decodeURIComponent(link.split('?text=')[1]), message);
});

test('buildWhatsAppLink strips non-digits from the center phone', () => {
  const link = buildWhatsAppLink('+7 707 191 1372', 'hi');
  assert.equal(link, 'https://wa.me/77071911372?text=hi');
});

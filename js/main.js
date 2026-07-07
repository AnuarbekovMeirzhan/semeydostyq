import { applyTranslations } from './lib/i18n.js';
import {
  renderItems, courseCardHTML, statCardHTML, advantageCardHTML,
  teamCardHTML, galleryImageHTML, testimonialCardHTML, priceCardHTML,
  faqItemHTML, directionOptionHTML,
} from './lib/render.js';
import { formatPhoneInput, isValidPhone, buildLeadMessage, buildWhatsAppLink } from './lib/whatsapp.js';

const LANG_STORAGE_KEY = 'dostyq-lang';
const CENTER_PHONE_DIGITS = '77071911372';

export function renderSections(document, data) {
  applyTranslations(document, data);
  renderItems(document.getElementById('courses-list'), data.courses.items, courseCardHTML);
  renderItems(document.getElementById('stats-list'), data.stats.items, statCardHTML);
  renderItems(document.getElementById('advantages-list'), data.advantages.items, advantageCardHTML);
  renderItems(document.getElementById('team-list'), data.team.items, teamCardHTML);
  renderItems(document.getElementById('gallery-list'), data.gallery.images, galleryImageHTML);
  renderItems(document.getElementById('testimonials-list'), data.testimonials.items, testimonialCardHTML);
  renderItems(document.getElementById('prices-list'), data.prices.items, priceCardHTML);
  renderItems(document.getElementById('faq-list'), data.faq.items, faqItemHTML);
  renderItems(document.getElementById('lead-direction'), data.form.directions, directionOptionHTML);
}

async function loadContent(lang, fetchImpl) {
  const res = await fetchImpl(`data/content.${lang}.json`);
  return res.json();
}

export function attachFormHandler(document, centerPhoneDigits, navigate) {
  const form = document.getElementById('lead-form-el');
  if (!form) return;
  const nameInput = document.getElementById('lead-name');
  const phoneInput = document.getElementById('lead-phone');
  const directionSelect = document.getElementById('lead-direction');
  const nameError = document.getElementById('lead-name-error');
  const phoneError = document.getElementById('lead-phone-error');

  phoneInput.addEventListener('input', () => {
    phoneInput.value = formatPhoneInput(phoneInput.value);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const phone = formatPhoneInput(phoneInput.value);
    const nameValid = name.length > 0;
    const phoneValid = isValidPhone(phone);

    nameError.hidden = nameValid;
    phoneError.hidden = phoneValid;

    if (!nameValid || !phoneValid) return;

    const direction = directionSelect.options[directionSelect.selectedIndex]?.textContent || '';
    const message = buildLeadMessage({ name, phone, direction });
    navigate(buildWhatsAppLink(centerPhoneDigits, message));
  });
}

export function attachFaqHandlers(document) {
  const list = document.getElementById('faq-list');
  if (!list) return;
  list.addEventListener('click', (event) => {
    const button = event.target.closest('.faq-item__question');
    if (!button) return;
    const answer = button.parentElement.querySelector('.faq-item__answer');
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    answer.hidden = expanded;
  });
}

export async function initApp({ document, fetchImpl, storage, navigate }) {
  let lang = storage.getItem(LANG_STORAGE_KEY) || 'ru';

  async function setLanguage(nextLang) {
    lang = nextLang;
    const data = await loadContent(nextLang, fetchImpl);
    renderSections(document, data);
    storage.setItem(LANG_STORAGE_KEY, nextLang);
    const toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.textContent = nextLang === 'ru' ? 'KK' : 'RU';
  }

  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      setLanguage(lang === 'ru' ? 'kk' : 'ru');
    });
  }

  await setLanguage(lang);
  attachFormHandler(document, CENTER_PHONE_DIGITS, navigate || ((url) => { document.defaultView.location.href = url; }));
  attachFaqHandlers(document);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initApp({
    document,
    fetchImpl: window.fetch.bind(window),
    storage: window.localStorage,
    navigate: (url) => { window.location.href = url; },
  });
}

import { applyTranslations } from './lib/i18n.js';
import {
  renderItems, courseCardHTML, statCardHTML, advantageCardHTML,
  teamCardHTML, galleryImageHTML, testimonialCardHTML, priceCardHTML,
  faqItemHTML, directionOptionHTML,
} from './lib/render.js';

const LANG_STORAGE_KEY = 'dostyq-lang';

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

export async function initApp({ document, fetchImpl, storage }) {
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
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initApp({ document, fetchImpl: window.fetch.bind(window), storage: window.localStorage });
}

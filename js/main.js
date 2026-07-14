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
  const consentInput = document.getElementById('lead-consent');
  const nameError = document.getElementById('lead-name-error');
  const phoneError = document.getElementById('lead-phone-error');
  const consentError = document.getElementById('lead-consent-error');

  const validateName = () => {
    const valid = nameInput.value.trim().length > 0;
    nameError.hidden = valid;
    nameInput.setAttribute('aria-invalid', String(!valid));
    return valid;
  };
  const validatePhone = () => {
    const valid = isValidPhone(formatPhoneInput(phoneInput.value));
    phoneError.hidden = valid;
    phoneInput.setAttribute('aria-invalid', String(!valid));
    return valid;
  };
  const validateConsent = () => {
    const valid = consentInput.checked;
    consentError.hidden = valid;
    consentInput.setAttribute('aria-invalid', String(!valid));
    return valid;
  };

  nameInput.addEventListener('blur', validateName);
  nameInput.addEventListener('input', () => {
    if (!nameError.hidden) validateName();
  });

  phoneInput.addEventListener('input', () => {
    phoneInput.value = formatPhoneInput(phoneInput.value);
    if (!phoneError.hidden) validatePhone();
  });
  phoneInput.addEventListener('blur', validatePhone);

  consentInput.addEventListener('change', () => {
    if (!consentError.hidden) validateConsent();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const phone = formatPhoneInput(phoneInput.value);
    const nameValid = validateName();
    const phoneValid = validatePhone();
    const consentValid = validateConsent();

    if (!nameValid) { nameInput.focus(); return; }
    if (!phoneValid) { phoneInput.focus(); return; }
    if (!consentValid) { consentInput.focus(); return; }

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

export async function initApp({ document, fetchImpl, storage, navigate, onRender }) {
  let lang = storage.getItem(LANG_STORAGE_KEY) || 'ru';

  async function setLanguage(nextLang) {
    lang = nextLang;
    const data = await loadContent(nextLang, fetchImpl);
    renderSections(document, data);
    storage.setItem(LANG_STORAGE_KEY, nextLang);
    document.documentElement.lang = nextLang;
    const toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.textContent = nextLang === 'ru' ? 'KK' : 'RU';
    if (typeof onRender === 'function') onRender();
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

// ---------- Browser-only motion enhancements ----------
// These are never called from tests (only from the browser bootstrap below),
// so they can safely rely on window / IntersectionObserver.

function setupScrollHeader(document) {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function observeReveals(document, reduceMotion) {
  const targets = document.querySelectorAll('.reveal, .stagger');
  const supportsObserver = typeof IntersectionObserver !== 'undefined';
  if (reduceMotion || !supportsObserver) {
    targets.forEach((el) => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((el) => {
    if (el.__revealObserved) return;
    el.__revealObserved = true;
    observer.observe(el);
  });
}

function animateCounts(document, reduceMotion) {
  const values = document.querySelectorAll('.stat-card__value');
  const supportsObserver = typeof IntersectionObserver !== 'undefined';

  values.forEach((el) => {
    if (el.dataset.counted) return;
    const finalText = el.textContent.trim();
    const match = finalText.match(/^(\d+)(.*)$/);
    if (!match) { el.dataset.counted = 'skip'; return; }
    const target = Number(match[1]);
    const suffix = match[2];

    if (reduceMotion || !supportsObserver || target === 0) {
      el.dataset.counted = 'done';
      return;
    }

    el.dataset.counted = 'pending';
    const run = () => {
      const duration = 1100;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { run(); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  setupScrollHeader(document);
  initApp({
    document,
    fetchImpl: window.fetch.bind(window),
    storage: window.localStorage,
    navigate: (url) => { window.location.href = url; },
    onRender: () => {
      observeReveals(document, reduceMotion);
      animateCounts(document, reduceMotion);
    },
  });
}

# Dostyq Landing (Semey Branch) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, bilingual (RU/KK) one-page landing site for the Dostyq education center's Semey branch that captures leads via a WhatsApp-deep-link form.

**Architecture:** Plain HTML/CSS/JS (ES modules, no bundler). Content lives in per-language JSON files and is rendered into the DOM at load time by small, independently testable library modules (`js/lib/*.js`). A thin `js/main.js` wires those libraries to the actual page. Automated tests run on Node's built-in test runner (`node --test`), using `jsdom` as a dev-only dependency to exercise DOM code without a browser.

**Tech Stack:** HTML5, CSS3 (custom properties, no preprocessor), vanilla JavaScript (ES modules), Node.js built-in test runner, `jsdom` (devDependency only — not shipped to the browser).

## Global Constraints

- No build step for the deployed site: `index.html` must work when opened directly or served as static files — no bundler, no transpilation.
- Bilingual RU/KK via language toggle; default language is Russian; choice persists in `localStorage`.
- Lead form has no backend: submission builds a `https://wa.me/<phone>?text=...` link client-side and navigates there. No PII is stored or sent anywhere else.
- Real branch data (use exactly): address `г. Семей, БЦ Достык, пр. Шакарима, 67/1`; phone/WhatsApp `+7 707 191 1372` (digits for wa.me: `77071911372`); Instagram `@dostyq.semey`; directions ЕНТ (10–11 классы) and НИШ/БИЛ (5–6 классы).
- Placeholder content (prices, testimonials, team photos, gallery photos, email) must be marked with a `"_placeholder": true` field in the JSON so it is trivially greppable and swappable later. Never present placeholder data as if it were real.
- Mobile-first responsive design; primary breakpoint additions for tablet (`min-width: 768px`) and desktop (`min-width: 1024px`).
- Design tokens (exact values, from the approved spec):
  - Primitive colors: plum `#F5EEF6, #E6D2E9, #A65AAE, #7A2D82, #5B1A5E, #45134A, #2A0C2E`; amber `#FFCF8A, #FFA23C, #F5821F`; neutral `#FDFBFA, #FAF5F3, #6E6470, #2A2230`.
  - Semantic: `--color-primary` = plum-600 (`#5B1A5E`), `--color-accent` = amber-500 (`#FFA23C`, only for CTA buttons), `--color-background` = cream-50 (`#FDFBFA`), `--color-surface` = white.
  - Typography: `Manrope, Nunito, sans-serif`.
  - Radius: cards `1.25rem`, CTA buttons `9999px` (full).
- The Kazakh copy in this plan is a best-effort AI translation — flag to the user that a native speaker should review it before the site goes live (do not silently treat it as final).

---

### Task 1: Project scaffold, tooling, and page skeleton

**Files:**
- Create: `package.json`
- Modify: `.gitignore` (add `node_modules/`)
- Create: `index.html`
- Create: `css/style.css`
- Create: `tests/markup.test.js`

**Interfaces:**
- Produces: section landmarks by `id` — `header`, `hero`, `courses`, `stats`, `advantages`, `team`, `gallery`, `testimonials`, `prices`, `faq`, `lead-form`, `footer` — that every later task's JS targets by `document.getElementById(...)`.
- Produces: CSS custom properties on `:root` (listed in Global Constraints) that every later styling task references — never hardcode raw color values in later tasks.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "dostyq-landing-semey",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  },
  "devDependencies": {
    "jsdom": "^24.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` created, no errors.

- [ ] **Step 3: Add `node_modules/` to `.gitignore`**

Append to the existing `.gitignore`:

```
node_modules/
```

- [ ] **Step 4: Write the failing markup test**

Create `tests/markup.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');

const requiredIds = [
  'header', 'hero', 'courses', 'stats', 'advantages',
  'team', 'gallery', 'testimonials', 'prices', 'faq',
  'lead-form', 'footer',
];

for (const id of requiredIds) {
  test(`index.html has element with id="${id}"`, () => {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  });
}

test('index.html links css/style.css', () => {
  assert.match(html, /href=["']css\/style\.css["']/);
});

test('index.html loads js/main.js as a module', () => {
  assert.match(html, /<script[^>]+type=["']module["'][^>]+src=["']js\/main\.js["']/);
});

const requiredTokens = [
  '--color-primary', '--color-accent', '--color-background',
  '--color-surface', '--font-family-base', '--radius-2xl', '--radius-full',
];

for (const token of requiredTokens) {
  test(`style.css defines ${token}`, () => {
    assert.match(css, new RegExp(`${token}\\s*:`));
  });
}
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `index.html` and `css/style.css` do not exist yet (`ENOENT`).

- [ ] **Step 6: Create `css/style.css` with design tokens and base styles**

```css
/* ===== PRIMITIVE ===== */
:root {
  --color-plum-50:  #F5EEF6;
  --color-plum-100: #E6D2E9;
  --color-plum-300: #A65AAE;
  --color-plum-500: #7A2D82;
  --color-plum-600: #5B1A5E;
  --color-plum-700: #45134A;
  --color-plum-900: #2A0C2E;

  --color-amber-300: #FFCF8A;
  --color-amber-500: #FFA23C;
  --color-amber-600: #F5821F;

  --color-cream-50:  #FDFBFA;
  --color-cream-100: #FAF5F3;
  --color-gray-500:  #6E6470;
  --color-gray-800:  #2A2230;

  --space-2: 0.5rem;  --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem;  --space-8: 2rem;    --space-12: 3rem; --space-20: 5rem;

  --font-family-base: 'Manrope', 'Nunito', sans-serif;
  --font-size-sm: 0.875rem; --font-size-base: 1rem; --font-size-lg: 1.125rem;
  --font-size-2xl: 1.5rem;  --font-size-4xl: 2.25rem; --font-size-5xl: 3rem;

  --radius-lg: 0.75rem; --radius-2xl: 1.25rem; --radius-full: 9999px;
  --shadow-md: 0 4px 16px rgb(91 26 94 / 0.10);
  --shadow-lg: 0 12px 32px rgb(91 26 94 / 0.14);
}

/* ===== SEMANTIC ===== */
:root {
  --color-background: var(--color-cream-50);
  --color-surface: white;
  --color-foreground: var(--color-gray-800);

  --color-primary: var(--color-plum-600);
  --color-primary-hover: var(--color-plum-700);
  --color-primary-foreground: white;

  --color-accent: var(--color-amber-500);
  --color-accent-hover: var(--color-amber-600);
  --color-accent-foreground: var(--color-plum-900);

  --color-muted: var(--color-cream-100);
  --color-muted-foreground: var(--color-gray-500);
  --color-border: var(--color-plum-100);
}

/* ===== COMPONENT ===== */
:root {
  --button-cta-bg: var(--color-accent);
  --button-cta-fg: var(--color-accent-foreground);
  --button-cta-hover-bg: var(--color-accent-hover);
  --button-cta-radius: var(--radius-full);

  --card-bg: var(--color-surface);
  --card-radius: var(--radius-2xl);
  --card-shadow: var(--shadow-md);
  --card-padding: var(--space-6);
}

/* ===== RESET & BASE ===== */
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--font-family-base);
  color: var(--color-foreground);
  background: var(--color-background);
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
.container {
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 var(--space-4);
}
section { padding: var(--space-12) 0; }
```

- [ ] **Step 7: Create `index.html` skeleton**

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dostyq — подготовка к ЕНТ, НИШ, БИЛ в Семее</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header id="header" class="site-header">
    <div class="container site-header__inner">
      <div class="site-header__logo" data-i18n-alt="header.logoAlt"></div>
      <button id="lang-toggle" class="lang-toggle" type="button">KK</button>
      <a id="header-phone" class="site-header__phone" href="tel:+77071911372">+7 707 191 1372</a>
      <a class="button button--cta" href="#lead-form" data-i18n="header.cta"></a>
    </div>
  </header>

  <main>
    <section id="hero" class="hero">
      <div class="container">
        <h1 data-i18n="hero.title"></h1>
        <p data-i18n="hero.subtitle"></p>
        <a class="button button--cta" href="#lead-form" data-i18n="hero.cta"></a>
      </div>
    </section>

    <section id="courses" class="container">
      <h2 data-i18n="courses.title"></h2>
      <div id="courses-list" class="courses-list"></div>
    </section>

    <section id="stats" class="container">
      <h2 data-i18n="stats.title"></h2>
      <div id="stats-list" class="stats-list"></div>
    </section>

    <section id="advantages" class="container">
      <h2 data-i18n="advantages.title"></h2>
      <div id="advantages-list" class="advantages-list"></div>
    </section>

    <section id="team" class="container">
      <h2 data-i18n="team.title"></h2>
      <div id="team-list" class="team-list"></div>
    </section>

    <section id="gallery" class="container">
      <h2 data-i18n="gallery.title"></h2>
      <div id="gallery-list" class="gallery-list"></div>
    </section>

    <section id="testimonials" class="container">
      <h2 data-i18n="testimonials.title"></h2>
      <div id="testimonials-list" class="testimonials-list"></div>
    </section>

    <section id="prices" class="container">
      <h2 data-i18n="prices.title"></h2>
      <div id="prices-list" class="prices-list"></div>
      <p class="prices-note" data-i18n="prices.note"></p>
    </section>

    <section id="faq" class="container">
      <h2 data-i18n="faq.title"></h2>
      <div id="faq-list" class="faq-list"></div>
    </section>

    <section id="lead-form" class="container">
      <h2 data-i18n="form.title"></h2>
      <form id="lead-form-el" novalidate>
        <label data-i18n="form.nameLabel" for="lead-name"></label>
        <input id="lead-name" name="name" type="text" required>
        <p id="lead-name-error" class="form-error" hidden data-i18n="form.errorName"></p>

        <label data-i18n="form.phoneLabel" for="lead-phone"></label>
        <input id="lead-phone" name="phone" type="tel" required>
        <p id="lead-phone-error" class="form-error" hidden data-i18n="form.errorPhone"></p>

        <label data-i18n="form.directionLabel" for="lead-direction"></label>
        <select id="lead-direction" name="direction"></select>

        <button type="submit" class="button button--cta" data-i18n="form.submit"></button>
      </form>
    </section>
  </main>

  <footer id="footer">
    <div class="container">
      <p id="footer-address" data-i18n="footer.address"></p>
      <a id="footer-phone" href="tel:+77071911372">+7 707 191 1372</a>
      <a id="footer-instagram" href="https://instagram.com/dostyq.semey" target="_blank" rel="noopener">@dostyq.semey</a>
      <p id="footer-rights" data-i18n="footer.rights"></p>
    </div>
  </footer>

  <a id="whatsapp-float" class="whatsapp-float" href="https://wa.me/77071911372" target="_blank" rel="noopener" aria-label="WhatsApp"></a>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all assertions in `tests/markup.test.js` succeed.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .gitignore index.html css/style.css tests/markup.test.js
git commit -m "Add project scaffold, design tokens, and page skeleton"
```

---

### Task 2: i18n library (nested lookup + DOM translation)

**Files:**
- Create: `js/lib/i18n.js`
- Test: `tests/i18n.test.js`

**Interfaces:**
- Consumes: nothing (pure module, no dependency on other tasks).
- Produces: `getNested(obj, path): unknown` and `applyTranslations(root: Element|Document, data: object): void`, both imported by `js/main.js` in Task 6.

- [ ] **Step 1: Write the failing tests**

Create `tests/i18n.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/lib/i18n.js'`.

- [ ] **Step 3: Implement `js/lib/i18n.js`**

```js
export function getNested(obj, path) {
  return path.split('.').reduce(
    (acc, key) => (acc != null && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined),
    obj,
  );
}

export function applyTranslations(root, data) {
  const nodes = root.querySelectorAll('[data-i18n]');
  nodes.forEach((node) => {
    const key = node.getAttribute('data-i18n');
    const value = getNested(data, key);
    if (typeof value === 'string') {
      node.textContent = value;
    }
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `i18n.test.js` assertions succeed.

- [ ] **Step 5: Commit**

```bash
git add js/lib/i18n.js tests/i18n.test.js
git commit -m "Add i18n lookup and DOM translation library"
```

---

### Task 3: Bilingual content data

**Files:**
- Create: `data/content.ru.json`
- Create: `data/content.kk.json`
- Test: `tests/content-schema.test.js`

**Interfaces:**
- Produces: the JSON shape consumed by `js/main.js` (Task 6) via `getNested` (Task 2) and by the render functions (Task 4). The shape below is authoritative — later tasks must not invent additional top-level keys without updating this task.

- [ ] **Step 1: Write the failing schema test**

Create `tests/content-schema.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — JSON files do not exist yet (`ENOENT`).

- [ ] **Step 3: Create `data/content.ru.json`**

```json
{
  "header": { "cta": "Оставить заявку", "logoAlt": "Dostyq — образовательный центр" },
  "hero": {
    "title": "Готовим к ЕНТ, НИШ и БИЛ в Семее",
    "subtitle": "20+ лет опыта сети Dostyq. Небольшие группы, кураторы и ежемесячные пробные тесты — покажем реальный прогресс вашего ребёнка.",
    "cta": "Оставить заявку"
  },
  "courses": {
    "title": "Направления подготовки",
    "items": [
      { "name": "ЕНТ", "grades": "10–11 классы", "description": "Грамотность чтения, математическая грамотность, история Казахстана и 2 профильных предмета на выбор." },
      { "name": "НИШ", "grades": "5–6 классы", "description": "Математика, логика, казахский, английский, русский языки — подготовка ко вступительным экзаменам Назарбаев Интеллектуальных школ." },
      { "name": "БИЛ", "grades": "5–6 классы", "description": "Подготовка к экзаменам Білім-Инновация Лицея (казахско-турецкие лицеи) по ключевым предметам." }
    ]
  },
  "stats": {
    "title": "Результаты",
    "_placeholder": true,
    "items": [
      { "value": "20+", "label": "лет опыта сети Dostyq" },
      { "value": "—", "label": "выпускников филиала (уточняется)" },
      { "value": "—", "label": "средний балл ЕНТ (уточняется)" },
      { "value": "—", "label": "поступивших в НИШ/БИЛ (уточняется)" }
    ]
  },
  "advantages": {
    "title": "Почему выбирают Dostyq Семей",
    "items": [
      { "title": "Небольшие группы", "description": "До 15 учеников в группе — куратор успевает уделить внимание каждому." },
      { "title": "Авторские методики", "description": "Учебные материалы, проверенные 20-летним опытом сети по всему Казахстану." },
      { "title": "Ежемесячные пробные тесты", "description": "Отслеживаем прогресс каждого ученика и корректируем программу." },
      { "title": "Опытные преподаватели", "description": "Педагоги специализируются именно на подготовке к ЕНТ/НИШ/БИЛ, а не на общей школьной программе." }
    ]
  },
  "team": {
    "title": "Наши преподаватели",
    "_placeholder": true,
    "items": [
      { "name": "Преподаватель 1", "subject": "Математика", "experience": "Стаж уточняется", "photo": "assets/images/teacher-placeholder.svg" },
      { "name": "Преподаватель 2", "subject": "Казахский язык", "experience": "Стаж уточняется", "photo": "assets/images/teacher-placeholder.svg" },
      { "name": "Преподаватель 3", "subject": "История Казахстана", "experience": "Стаж уточняется", "photo": "assets/images/teacher-placeholder.svg" }
    ]
  },
  "gallery": {
    "title": "Фото центра",
    "_placeholder": true,
    "images": [
      "assets/images/gallery-placeholder-1.svg",
      "assets/images/gallery-placeholder-2.svg",
      "assets/images/gallery-placeholder-3.svg"
    ]
  },
  "testimonials": {
    "title": "Отзывы родителей и учеников",
    "_placeholder": true,
    "items": [
      { "author": "Родитель ученика (имя уточняется)", "text": "Отзыв появится здесь после согласования с родителями." },
      { "author": "Выпускник (имя уточняется)", "text": "Отзыв появится здесь после согласования с выпускником." },
      { "author": "Родитель ученика (имя уточняется)", "text": "Отзыв появится здесь после согласования с родителями." }
    ]
  },
  "prices": {
    "title": "Стоимость обучения",
    "note": "Точные цены уточняйте у менеджера — стоимость зависит от направления и интенсивности занятий.",
    "_placeholder": true,
    "items": [
      { "direction": "ЕНТ", "price": "от 25 000 ₸/мес (уточняется)" },
      { "direction": "НИШ", "price": "от 20 000 ₸/мес (уточняется)" },
      { "direction": "БИЛ", "price": "от 20 000 ₸/мес (уточняется)" }
    ]
  },
  "faq": {
    "title": "Частые вопросы",
    "items": [
      { "question": "С какого класса можно начать подготовку?", "answer": "К ЕНТ мы готовим учеников 10–11 классов, к НИШ и БИЛ — 5–6 классов." },
      { "question": "Какой размер групп?", "answer": "До 15 учеников в группе, чтобы куратор мог уделить внимание каждому." },
      { "question": "Как узнать прогресс ребёнка?", "answer": "Каждый месяц проводится пробное тестирование, по итогам которого мы обсуждаем результаты с родителями." },
      { "question": "Можно ли оплачивать помесячно?", "answer": "Да, уточните варианты оплаты у менеджера при заявке." },
      { "question": "Как записаться на пробное занятие?", "answer": "Оставьте заявку в форме ниже — менеджер свяжется с вами в WhatsApp и подберёт удобное время." }
    ]
  },
  "form": {
    "title": "Оставить заявку",
    "nameLabel": "Имя",
    "phoneLabel": "Телефон",
    "phonePlaceholder": "+7 (___) ___-__-__",
    "directionLabel": "Направление",
    "directions": [
      "ЕНТ — 10 класс", "ЕНТ — 11 класс",
      "НИШ — 5 класс", "НИШ — 6 класс",
      "БИЛ — 5 класс", "БИЛ — 6 класс"
    ],
    "submit": "Отправить в WhatsApp",
    "errorName": "Введите имя",
    "errorPhone": "Введите корректный номер телефона"
  },
  "footer": {
    "address": "г. Семей, БЦ Достык, пр. Шакарима, 67/1",
    "phone": "+7 707 191 1372",
    "phoneDigits": "77071911372",
    "instagram": "@dostyq.semey",
    "email": "info@dostyq-semey.kz",
    "emailPlaceholder": true,
    "rights": "© 2026 Dostyq Bilim Beru Ortalygy — филиал Семей"
  }
}
```

- [ ] **Step 4: Create `data/content.kk.json`**

```json
{
  "header": { "cta": "Өтінім қалдыру", "logoAlt": "Dostyq — білім беру орталығы" },
  "hero": {
    "title": "Семейде ҰБТ, НЗМ және БІЛ-ге дайындаймыз",
    "subtitle": "Dostyq желісінің 20+ жылдық тәжірибесі. Шағын топтар, кураторлар және ай сайынғы сынақ тесттер — балаңыздың нақты нәтижесін көрсетеміз.",
    "cta": "Өтінім қалдыру"
  },
  "courses": {
    "title": "Дайындық бағыттары",
    "items": [
      { "name": "ҰБТ", "grades": "10–11 сынып", "description": "Оқу сауаттылығы, математикалық сауаттылық, Қазақстан тарихы және таңдау бойынша 2 бейіндік пән." },
      { "name": "НЗМ", "grades": "5–6 сынып", "description": "Математика, логика, қазақ, ағылшын, орыс тілдері — Назарбаев Зияткерлік мектептеріне түсу емтихандарына дайындық." },
      { "name": "БІЛ", "grades": "5–6 сынып", "description": "Білім-Инновация Лицейіне (қазақ-түрік лицейлері) түсу емтихандарына негізгі пәндер бойынша дайындық." }
    ]
  },
  "stats": {
    "title": "Нәтижелер",
    "_placeholder": true,
    "items": [
      { "value": "20+", "label": "Dostyq желісінің тәжірибе жылы" },
      { "value": "—", "label": "филиал түлектері (нақтыланады)" },
      { "value": "—", "label": "ҰБТ орташа балы (нақтыланады)" },
      { "value": "—", "label": "НЗМ/БІЛ-ге түскендер (нақтыланады)" }
    ]
  },
  "advantages": {
    "title": "Неге Dostyq Семей таңдайды",
    "items": [
      { "title": "Шағын топтар", "description": "Топта 15 оқушыға дейін — куратор әр балаға көңіл бөледі." },
      { "title": "Авторлық әдістемелер", "description": "Қазақстан бойынша желінің 20 жылдық тәжірибесімен тексерілген оқу материалдары." },
      { "title": "Ай сайынғы сынақ тесттер", "description": "Әр оқушының прогресін бақылап, бағдарламаны түзетеміз." },
      { "title": "Тәжірибелі мұғалімдер", "description": "Мұғалімдер жалпы мектеп бағдарламасына емес, дәл ҰБТ/НЗМ/БІЛ дайындығына маманданған." }
    ]
  },
  "team": {
    "title": "Біздің мұғалімдер",
    "_placeholder": true,
    "items": [
      { "name": "Мұғалім 1", "subject": "Математика", "experience": "Тәжірибесі нақтыланады", "photo": "assets/images/teacher-placeholder.svg" },
      { "name": "Мұғалім 2", "subject": "Қазақ тілі", "experience": "Тәжірибесі нақтыланады", "photo": "assets/images/teacher-placeholder.svg" },
      { "name": "Мұғалім 3", "subject": "Қазақстан тарихы", "experience": "Тәжірибесі нақтыланады", "photo": "assets/images/teacher-placeholder.svg" }
    ]
  },
  "gallery": {
    "title": "Орталық фотосуреттері",
    "_placeholder": true,
    "images": [
      "assets/images/gallery-placeholder-1.svg",
      "assets/images/gallery-placeholder-2.svg",
      "assets/images/gallery-placeholder-3.svg"
    ]
  },
  "testimonials": {
    "title": "Ата-аналар мен оқушылардың пікірлері",
    "_placeholder": true,
    "items": [
      { "author": "Оқушының ата-анасы (аты-жөні нақтыланады)", "text": "Пікір ата-анамен келісілгеннен кейін осында пайда болады." },
      { "author": "Түлек (аты-жөні нақтыланады)", "text": "Пікір түлекпен келісілгеннен кейін осында пайда болады." },
      { "author": "Оқушының ата-анасы (аты-жөні нақтыланады)", "text": "Пікір ата-анамен келісілгеннен кейін осында пайда болады." }
    ]
  },
  "prices": {
    "title": "Оқу құны",
    "note": "Нақты бағаны менеджерден сұраңыз — құны бағыты мен сабақ қарқынына байланысты.",
    "_placeholder": true,
    "items": [
      { "direction": "ҰБТ", "price": "25 000 ₸/ай бастап (нақтыланады)" },
      { "direction": "НЗМ", "price": "20 000 ₸/ай бастап (нақтыланады)" },
      { "direction": "БІЛ", "price": "20 000 ₸/ай бастап (нақтыланады)" }
    ]
  },
  "faq": {
    "title": "Жиі қойылатын сұрақтар",
    "items": [
      { "question": "Дайындықты қай сыныптан бастауға болады?", "answer": "ҰБТ-ға 10–11 сынып оқушыларын, НЗМ мен БІЛ-ге 5–6 сынып оқушыларын дайындаймыз." },
      { "question": "Топтың көлемі қандай?", "answer": "Топта 15 оқушыға дейін, куратор әр балаға көңіл бөле алады." },
      { "question": "Баланың прогресін қалай білуге болады?", "answer": "Әр ай сайын сынақ тестілеу өткізіледі, нәтижесін ата-анамен талқылаймыз." },
      { "question": "Айлық төлеуге бола ма?", "answer": "Иә, өтінім қалдырғанда менеджерден төлем түрлерін нақтылаңыз." },
      { "question": "Сынақ сабаққа қалай жазылуға болады?", "answer": "Төмендегі форма арқылы өтінім қалдырыңыз — менеджер WhatsApp арқылы хабарласып, ыңғайлы уақыт белгілейді." }
    ]
  },
  "form": {
    "title": "Өтінім қалдыру",
    "nameLabel": "Аты-жөні",
    "phoneLabel": "Телефон",
    "phonePlaceholder": "+7 (___) ___-__-__",
    "directionLabel": "Бағыты",
    "directions": [
      "ҰБТ — 10 сынып", "ҰБТ — 11 сынып",
      "НЗМ — 5 сынып", "НЗМ — 6 сынып",
      "БІЛ — 5 сынып", "БІЛ — 6 сынып"
    ],
    "submit": "WhatsApp-қа жіберу",
    "errorName": "Атыңызды енгізіңіз",
    "errorPhone": "Дұрыс телефон нөірін енгізіңіз"
  },
  "footer": {
    "address": "Семей қаласы, Достық БО, Шәкәрім даңғылы, 67/1",
    "phone": "+7 707 191 1372",
    "phoneDigits": "77071911372",
    "instagram": "@dostyq.semey",
    "email": "info@dostyq-semey.kz",
    "emailPlaceholder": true,
    "rights": "© 2026 Dostyq Bilim Beru Ortalygy — Семей филиалы"
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `content-schema.test.js` assertions succeed.

- [ ] **Step 6: Commit**

```bash
git add data/content.ru.json data/content.kk.json tests/content-schema.test.js
git commit -m "Add RU/KK content data for Semey branch with marked placeholders"
```

---

### Task 4: Render library (dynamic list sections)

**Files:**
- Create: `js/lib/render.js`
- Test: `tests/render.test.js`

**Interfaces:**
- Consumes: nothing (pure module).
- Produces: `renderItems(container, items, toHTML)` and `courseCardHTML`, `statCardHTML`, `advantageCardHTML`, `teamCardHTML`, `galleryImageHTML`, `testimonialCardHTML`, `priceCardHTML`, `faqItemHTML(item, index)`, `directionOptionHTML(label, index)` — all consumed by `js/main.js` in Task 6.

- [ ] **Step 1: Write the failing tests**

Create `tests/render.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/lib/render.js'`.

- [ ] **Step 3: Implement `js/lib/render.js`**

```js
export function renderItems(container, items, toHTML) {
  container.innerHTML = items.map(toHTML).join('');
}

export function courseCardHTML(item) {
  return `
    <article class="course-card">
      <h3 class="course-card__name">${item.name}</h3>
      <p class="course-card__grades">${item.grades}</p>
      <p class="course-card__description">${item.description}</p>
    </article>
  `;
}

export function statCardHTML(item) {
  return `
    <div class="stat-card">
      <span class="stat-card__value">${item.value}</span>
      <span class="stat-card__label">${item.label}</span>
    </div>
  `;
}

export function advantageCardHTML(item) {
  return `
    <article class="advantage-card">
      <h3 class="advantage-card__title">${item.title}</h3>
      <p class="advantage-card__description">${item.description}</p>
    </article>
  `;
}

export function teamCardHTML(item) {
  return `
    <article class="team-card">
      <img class="team-card__photo" src="${item.photo}" alt="${item.name}">
      <h3 class="team-card__name">${item.name}</h3>
      <p class="team-card__subject">${item.subject}</p>
      <p class="team-card__experience">${item.experience}</p>
    </article>
  `;
}

export function galleryImageHTML(src) {
  return `<img class="gallery__image" src="${src}" alt="">`;
}

export function testimonialCardHTML(item) {
  return `
    <blockquote class="testimonial-card">
      <p class="testimonial-card__text">${item.text}</p>
      <cite class="testimonial-card__author">${item.author}</cite>
    </blockquote>
  `;
}

export function priceCardHTML(item) {
  return `
    <div class="price-card">
      <h3 class="price-card__direction">${item.direction}</h3>
      <p class="price-card__value">${item.price}</p>
    </div>
  `;
}

export function faqItemHTML(item, index) {
  return `
    <div class="faq-item" data-faq-index="${index}">
      <button class="faq-item__question" type="button" aria-expanded="false">${item.question}</button>
      <div class="faq-item__answer" hidden>${item.answer}</div>
    </div>
  `;
}

export function directionOptionHTML(label, index) {
  return `<option value="${index}">${label}</option>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `render.test.js` assertions succeed.

- [ ] **Step 5: Commit**

```bash
git add js/lib/render.js tests/render.test.js
git commit -m "Add render library for dynamic content sections"
```

---

### Task 5: WhatsApp lead-form logic library

**Files:**
- Create: `js/lib/whatsapp.js`
- Test: `tests/whatsapp.test.js`

**Interfaces:**
- Consumes: nothing (pure module).
- Produces: `formatPhoneInput(rawValue): string`, `isValidPhone(formatted): boolean`, `buildLeadMessage({ name, phone, direction }): string`, `buildWhatsAppLink(centerPhoneDigits, message): string` — all consumed by `js/main.js` in Task 7.

- [ ] **Step 1: Write the failing tests**

Create `tests/whatsapp.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/lib/whatsapp.js'`.

- [ ] **Step 3: Implement `js/lib/whatsapp.js`**

```js
export function formatPhoneInput(rawValue) {
  let digits = rawValue.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const area = digits.slice(1, 4);
  const part1 = digits.slice(4, 7);
  const part2 = digits.slice(7, 9);
  const part3 = digits.slice(9, 11);

  let result = '+7';
  if (area) {
    result += ` (${area}`;
    if (part1) result += ')';
  }
  if (part1) result += ` ${part1}`;
  if (part2) result += `-${part2}`;
  if (part3) result += `-${part3}`;
  return result;
}

export function isValidPhone(formatted) {
  const digits = formatted.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('7');
}

export function buildLeadMessage({ name, phone, direction }) {
  return `Здравствуйте! Меня зовут ${name}, интересует направление: ${direction}. Телефон: ${phone}`;
}

export function buildWhatsAppLink(centerPhone, message) {
  const digits = centerPhone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `whatsapp.test.js` assertions succeed.

- [ ] **Step 5: Commit**

```bash
git add js/lib/whatsapp.js tests/whatsapp.test.js
git commit -m "Add WhatsApp lead-message and phone-formatting library"
```

---

### Task 6: Main wiring — load content, translate, render lists, language toggle

**Files:**
- Create: `js/main.js`
- Test: `tests/main.test.js`

**Interfaces:**
- Consumes: `getNested`, `applyTranslations` (Task 2, `js/lib/i18n.js`); `renderItems`, `courseCardHTML`, `statCardHTML`, `advantageCardHTML`, `teamCardHTML`, `galleryImageHTML`, `testimonialCardHTML`, `priceCardHTML`, `faqItemHTML`, `directionOptionHTML` (Task 4, `js/lib/render.js`); `data/content.ru.json` / `data/content.kk.json` shape (Task 3).
- Produces: `initApp({ document, fetchImpl, storage }): Promise<void>` — the entry point called from the bottom of `js/main.js` in the browser, and imported directly by tests. Also produces `renderSections(root, data)` used again in Task 7.

- [ ] **Step 1: Write the failing tests**

Create `tests/main.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/main.js'`.

- [ ] **Step 3: Implement `js/main.js`**

```js
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
    const data = await loadContent(lang, fetchImpl);
    renderSections(document, data);
    storage.setItem(LANG_STORAGE_KEY, lang);
    const toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.textContent = lang === 'ru' ? 'KK' : 'RU';
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `main.test.js` assertions succeed.

- [ ] **Step 5: Commit**

```bash
git add js/main.js tests/main.test.js
git commit -m "Wire content loading, translation, list rendering, and language toggle"
```

---

### Task 7: Lead-form validation + WhatsApp submit, and FAQ accordion

**Files:**
- Modify: `js/main.js` (append form and FAQ wiring, called from `initApp`)
- Test: `tests/form.test.js`

**Interfaces:**
- Consumes: `formatPhoneInput`, `isValidPhone`, `buildLeadMessage`, `buildWhatsAppLink` (Task 5, `js/lib/whatsapp.js`); `renderSections`, `initApp` (Task 6).
- Produces: `attachFormHandler(document, centerPhoneDigits, navigate)` and `attachFaqHandlers(document)`, both called from `initApp`. `navigate` defaults to `(url) => { window.location.href = url; }` but is injectable for testing.

- [ ] **Step 1: Write the failing tests**

Create `tests/form.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `attachFormHandler`/`attachFaqHandlers` are not exported yet.

- [ ] **Step 3: Append form and FAQ wiring to `js/main.js`**

Add this import at the top of `js/main.js` (alongside the existing imports):

```js
import { formatPhoneInput, isValidPhone, buildLeadMessage, buildWhatsAppLink } from './lib/whatsapp.js';

const CENTER_PHONE_DIGITS = '77071911372';
```

Add these exported functions to `js/main.js`:

```js
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
```

Modify the bottom of `initApp` to call both, and update the browser bootstrap call:

```js
export async function initApp({ document, fetchImpl, storage, navigate }) {
  let lang = storage.getItem(LANG_STORAGE_KEY) || 'ru';

  async function setLanguage(nextLang) {
    lang = nextLang;
    const data = await loadContent(lang, fetchImpl);
    renderSections(document, data);
    storage.setItem(LANG_STORAGE_KEY, lang);
    const toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.textContent = lang === 'ru' ? 'KK' : 'RU';
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
```

```js
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initApp({
    document,
    fetchImpl: window.fetch.bind(window),
    storage: window.localStorage,
    navigate: (url) => { window.location.href = url; },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `form.test.js` assertions succeed, and `main.test.js` from Task 6 still passes.

- [ ] **Step 5: Commit**

```bash
git add js/main.js tests/form.test.js
git commit -m "Add lead-form validation, WhatsApp submit, and FAQ accordion"
```

---

### Task 8: Full component styling and responsive layout

**Files:**
- Modify: `css/style.css` (append component + responsive rules)
- Test: `tests/style.test.js`

**Interfaces:**
- Consumes: design tokens from Task 1, class names produced by Task 4's HTML templates (`.course-card`, `.stat-card`, `.advantage-card`, `.team-card`, `.gallery__image`, `.testimonial-card`, `.price-card`, `.faq-item`) and Task 1's static markup (`.site-header`, `.hero`, `.button--cta`, `.whatsapp-float`, `.lang-toggle`).
- Produces: nothing consumed by later tasks — this is the last styling pass.

- [ ] **Step 1: Write the failing test**

Create `tests/style.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — component selectors and media queries not present yet.

- [ ] **Step 3: Append component and responsive styles to `css/style.css`**

```css
/* ===== HEADER ===== */
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-primary);
  color: white;
}
.site-header__inner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
}
.site-header__logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
  background: white;
}
.site-header__phone { color: white; margin-left: auto; text-decoration: none; }
.lang-toggle {
  background: transparent;
  border: 1px solid white;
  color: white;
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
}

/* ===== BUTTONS ===== */
.button {
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  text-decoration: none;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.button--cta {
  background: var(--button-cta-bg);
  color: var(--button-cta-fg);
}
.button--cta:hover { background: var(--button-cta-hover-bg); }

/* ===== HERO ===== */
.hero {
  background: var(--color-primary);
  color: white;
  text-align: center;
  padding: var(--space-20) 0;
}
.hero h1 { font-size: var(--font-size-4xl); margin-bottom: var(--space-4); }
.hero p { font-size: var(--font-size-lg); margin-bottom: var(--space-6); }

/* ===== CARDS (shared) ===== */
.course-card, .stat-card, .advantage-card, .team-card, .testimonial-card, .price-card, .faq-item {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: var(--card-padding);
}

.courses-list, .advantages-list, .team-list, .testimonials-list, .prices-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}
.stats-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}
.stat-card { text-align: center; }
.stat-card__value { display: block; font-size: var(--font-size-2xl); color: var(--color-primary); font-weight: 700; }

.team-card__photo {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
}

.gallery-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}
.gallery__image { border-radius: var(--radius-lg); object-fit: cover; aspect-ratio: 4 / 3; }

.faq-item__question {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.faq-item__answer { margin-top: var(--space-3); color: var(--color-muted-foreground); }

/* ===== WHATSAPP FLOAT ===== */
.whatsapp-float {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-full);
  background: #25D366;
  box-shadow: var(--shadow-lg);
  z-index: 20;
}

/* ===== RESPONSIVE ===== */
@media (min-width: 768px) {
  .courses-list, .advantages-list, .testimonials-list, .prices-list {
    grid-template-columns: repeat(2, 1fr);
  }
  .team-list { grid-template-columns: repeat(3, 1fr); }
  .stats-list { grid-template-columns: repeat(4, 1fr); }
  .gallery-list { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .courses-list { grid-template-columns: repeat(3, 1fr); }
  .hero h1 { font-size: var(--font-size-5xl); }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `style.test.js` assertions succeed, and every earlier test file still passes.

- [ ] **Step 5: Commit**

```bash
git add css/style.css tests/style.test.js
git commit -m "Add component styling and mobile/tablet/desktop responsive layout"
```

---

### Task 9: Placeholder assets and end-to-end verification

**Files:**
- Create: `assets/images/teacher-placeholder.svg`
- Create: `assets/images/gallery-placeholder-1.svg`, `gallery-placeholder-2.svg`, `gallery-placeholder-3.svg`
- Modify: `index.html` (replace empty `.site-header__logo` div with inline SVG text lockup)
- Create: `tests/assets.test.js`

**Interfaces:**
- Consumes: file paths already referenced by `data/content.ru.json` / `data/content.kk.json` (Task 3) — `assets/images/teacher-placeholder.svg`, `assets/images/gallery-placeholder-{1,2,3}.svg`.
- Produces: nothing further — this is the final task. Ends with a manual Playwright verification checklist instead of a unit test, since it exercises the whole page in a real browser.

- [ ] **Step 1: Write the failing test**

Create `tests/assets.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const requiredAssets = [
  'assets/images/teacher-placeholder.svg',
  'assets/images/gallery-placeholder-1.svg',
  'assets/images/gallery-placeholder-2.svg',
  'assets/images/gallery-placeholder-3.svg',
];

for (const path of requiredAssets) {
  test(`${path} exists`, () => {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)));
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — asset files do not exist yet.

- [ ] **Step 3: Create placeholder SVGs**

Create `assets/images/teacher-placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#F5EEF6"/>
  <circle cx="100" cy="80" r="35" fill="#A65AAE"/>
  <path d="M40 180 Q100 120 160 180 Z" fill="#A65AAE"/>
</svg>
```

Create `assets/images/gallery-placeholder-1.svg` (repeat with `-2`, `-3`, varying the fill color between `#F5EEF6`, `#E6D2E9`, `#FFCF8A` so the three placeholders are visually distinguishable):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#F5EEF6"/>
  <text x="200" y="150" font-family="sans-serif" font-size="20" fill="#5B1A5E" text-anchor="middle">Фото центра</text>
</svg>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `assets.test.js` assertions succeed, and the full suite (`tests/`) passes end to end.

- [ ] **Step 5: Replace the empty logo placeholder with an inline SVG lockup**

In `index.html`, replace:

```html
<div class="site-header__logo" data-i18n-alt="header.logoAlt"></div>
```

with:

```html
<svg class="site-header__logo" viewBox="0 0 64 64" role="img" aria-label="Dostyq">
  <circle cx="32" cy="32" r="32" fill="#5B1A5E"/>
  <text x="32" y="38" font-family="Manrope, sans-serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">D</text>
</svg>
```

(This is a temporary text-based lockup. Swap it for the real `logo.png` the user provided as soon as the file is available — save it to `assets/logo.png` and replace this `<svg>` with `<img src="assets/logo.png" alt="Dostyq">`.)

- [ ] **Step 6: Commit**

```bash
git add assets/images tests/assets.test.js index.html
git commit -m "Add placeholder gallery/team images and temporary logo lockup"
```

- [ ] **Step 7: Manual end-to-end verification**

Run: `npx serve .` (or `python -m http.server 8000`), then open the printed local URL in a browser (or drive it with the Playwright MCP tools already available in this session):

1. Confirm the hero, courses, stats, advantages, team, gallery, testimonials, prices, FAQ, and form sections all render Russian text by default.
2. Click the `RU`/`KK` toggle in the header — confirm all text switches to Kazakh, then reload the page and confirm it stays on Kazakh (persisted via `localStorage`).
3. Click a FAQ question — confirm the answer expands; click again — confirm it collapses.
4. Fill the lead form with a name, a phone typed as `87071911372` (confirm it auto-formats to `+7 (707) 191-13-72`), and a direction, then submit — confirm the browser navigates to a `https://wa.me/77071911372?text=...` URL whose decoded text contains the name, phone, and chosen direction.
5. Submit the form with empty fields — confirm both error messages appear and no navigation happens.
6. Resize the viewport to a mobile width (375px) — confirm the layout stays single-column and readable, and the floating WhatsApp button stays visible without overlapping the form.

Expected: all six checks pass. If any fails, fix the underlying code (not the test) and re-run `npm test` plus this checklist before considering the branch done.

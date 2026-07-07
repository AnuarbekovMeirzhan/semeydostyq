# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Landing page for a single branch (Semey) of Dostyq Bilim Beru Ortalygy — a Kazakhstani education center network offering ЕНТ/НИШ/БИЛ exam-prep courses. Goal: capture leads (name, phone, direction) and hand them to WhatsApp for managers to follow up manually.

The full design is in `docs/superpowers/specs/2026-07-07-dostyq-landing-design.md`; the implementation plan being executed is `docs/superpowers/plans/2026-07-07-dostyq-landing-semey.md`. Read the plan before making architectural decisions — it is the source of truth for exact file structure and interfaces.

## Architecture (per implementation plan)

- Static site, no build step: `index.html` + `css/style.css` + `js/main.js` + `js/lib/*.js` + `assets/`. Deployable by opening the file directly or uploading to any static host.
- Pure logic lives in `js/lib/i18n.js` (nested JSON lookup + DOM translation), `js/lib/render.js` (dynamic list section HTML), and `js/lib/whatsapp.js` (phone formatting + WhatsApp link building) — each independently unit-tested with Node's built-in test runner (`npm test`). `js/lib/*.js` never touches `document`/`window` directly; `js/main.js` wires those libraries to the real page.
- `jsdom` is a devDependency used only by tests (`tests/*.test.js`) — it is never shipped to the browser.
- Bilingual (RU/KK): all copy lives in `data/content.ru.json` / `data/content.kk.json`, keyed by `data-i18n` paths that `js/lib/i18n.js`'s `applyTranslations` reads and injects at load time. Language choice persists in `localStorage`. Do not hardcode copy into `index.html` — add it to both JSON files instead.
- Lead form has no backend: on submit, client-side JS builds a WhatsApp deep link (`https://wa.me/<number>?text=...`) from the form fields and redirects there. No server, no stored PII.
- Placeholder content (prices, testimonials, team photos, gallery photos, email) is marked with a `"_placeholder": true` field in the JSON so it's easy to find and swap for real data later — check for that marker before treating any of that content as final.

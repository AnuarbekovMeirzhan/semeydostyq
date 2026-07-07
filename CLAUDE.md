# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Landing page for a single branch (Semey) of Dostyq Bilim Beru Ortalygy — a Kazakhstani education center network offering ЕНТ/НИШ/БИЛ exam-prep courses. Goal: capture leads (name, phone, direction) and hand them to WhatsApp for managers to follow up manually.

Implementation has not started yet. The full design — page structure, tech stack, i18n approach, lead-form logic, and design tokens — is written up in `docs/superpowers/specs/2026-07-07-dostyq-landing-design.md`. Read that file before making architectural decisions; it is the source of truth until an implementation plan supersedes it.

## Architecture (per approved spec)

- Static site, no build step: `index.html` + `css/style.css` + `js/script.js` + `assets/`. Deployable by opening the file directly or uploading to any static host.
- Bilingual (RU/KK): all copy lives in `data/content.ru.json` / `data/content.kk.json`, keyed by `data-i18n` paths that `js/script.js` reads and injects at load time. Language choice persists in `localStorage`. Do not hardcode copy into `index.html` — add it to both JSON files instead.
- Lead form has no backend: on submit, client-side JS builds a WhatsApp deep link (`https://wa.me/<number>?text=...`) from the form fields and redirects there. No server, no stored PII.
- Placeholder content (prices, testimonials, teacher photos, email) is marked with a `_placeholder` field in the JSON so it's easy to find and swap for real data later — check for that marker before treating any of that content as final.

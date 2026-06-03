# Stock AI — Premium Russian Landing Redesign

Rebuild `src/routes/index.tsx` as a full premium landing page in Russian, matching the supplied `stock-ai-landing.html` reference and the accompanying brief. Light theme, Montserrat, orange→pink gradient accent, with smooth scroll/hover/marquee/counter animations. No backend, no payments — purely presentational.

## Design system (src/styles.css)

Replace tokens with light/warm palette:
- `--background` #ffffff, surfaces `--muted` #f6f4f0 / #fbf9f6
- `--foreground` #171310, `--muted-foreground` #6b6358
- `--primary` orange #ff5a1f, `--accent` pink #ff2d68, gold #bd8b3c
- Radius 24px, soft shadows, thin warm borders
- Load Montserrat via Google Fonts in `__root.tsx` head links (weights 400–900)
- Utility classes: `.grad-text` (animated orange→pink gradient clip), `.btn-primary` (gradient + shimmer), `.reveal` (fade+rise on scroll)

## Page sections (src/routes/index.tsx + components in src/components/landing/)

1. **Header** — sticky, blurred white. Logo (rounded gradient "S" square + "Stock AI"), nav links (Как работает, Типы карточек, Тарифы, FAQ), "Войти", primary CTA "Начать бесплатно".
2. **Hero** — eyebrow chip, H1 with "топ-1" in gradient, lead paragraph, two CTAs, 4 animated count-up stats (+47% CTR, 10 000+, <5 мин, 4 площадки), "before → after" card mockup pair.
3. **Marquee** — two opposite-direction rows of schematic infographic cards, pause on hover.
4. **Pain** — 4 cards (Дорого / Долго / Неубедительно / Не как у топов).
5. **How it works** — 3 steps, step 3 has "Видео — скоро" badge.
6. **Top of search** — split: copy + checklist left; SERP mock right with highlighted "ТОП-1 · ВЫ" card and dimmed competitors.
7. **Card types** — 4 preview cards: Инфографика / Мемные (yellow-orange) / Элитные (black + gold "LUXURY") / Примерка на модели (pink with AI model silhouette).
8. **Examples** — grid of 6–8 schematic cards across niches, with note "заготовки схематичные".
9. **Features** — 6 tiles (premium infographic, clean bg, copy, AI model, video soon, multi-marketplace sizes).
10. **Comparison table** — Дизайнер / Шаблонные / **Stock AI** (Stock AI column gradient-highlighted).
11. **Stats band** — dark panel with gradient glows, 4 large count-ups.
12. **Savings calculator** — 2 sliders (cards/month, designer price); live computes "у дизайнера / на Stock AI 990₽ / экономия".
13. **Pricing** — Бесплатно / Старт 490₽ / **Про 990₽ (Популярный)** / Премиум 1990₽ + Корпоративный 4990₽ note. Buttons link to "#" (no payment).
14. **FAQ** — accordion (shadcn `Accordion`), 5 questions per brief.
15. **Final CTA + Footer** — logo, links, copyright.

## Animations

- Scroll reveal via `IntersectionObserver` hook (`useReveal`) toggling `.in` class.
- Count-up hook (`useCountUp`) triggered on first intersection.
- Marquee via pure CSS keyframes (two tracks, opposite directions), `animation-play-state: paused` on hover.
- Button shimmer via `::after` translate on hover.
- Light parallax of hero background blobs following mouse (small transform).
- Respect `prefers-reduced-motion` — skip parallax/marquee animation.

## Tech notes

- All static content — no Lovable Cloud, no server functions, no payments.
- Update `head()` in `index.tsx`: Russian title "Stock AI — карточки для маркетплейсов в топ-1", description, og tags.
- Update `__root.tsx` head to set `lang="ru"` on `<html>` and add Montserrat `<link>` preconnect + stylesheet (keep existing `<Outlet />` and structure intact).
- Schematic card art done with inline SVG (matches reference).
- Use shadcn `Accordion`, `Slider`, `Button` where natural; otherwise custom presentational components in `src/components/landing/`.
- All copy in Russian, taken from the reference HTML and brief.

## Out of scope

- Real auth / login flow (CTAs are visual only).
- Real image generation / background removal.
- Payment integration.
- Additional routes — only `/` is rebuilt.

# Limitless Marketing Services — Angular 22

Premium, responsive marketing-agency website for **Limitless Marketing Services**.

The project is built with Angular 22, TypeScript and GSAP, with a bold editorial visual system, responsive navigation, project filtering, animated statistics, project lightbox, touch navigation and reduced-motion support.

## Tech Stack

- Angular 22.1.7
- TypeScript 6
- GSAP 3.13
- RxJS 7
- HTML5 / CSS3
- WebP image assets

## Run locally

Use Node.js 22.22.3 or newer.

```bash
npm install
npm start
```

Open the local Angular development URL shown by the CLI.

## Production build

```bash
npm run build
```

## What was improved

- Rebuilt the Limitless logo from the supplied source image with transparent, tightly cropped WebP assets.
- Fixed the broken logo and favicon references that previously pointed to missing assets.
- Added the Limitless logo to the loader, redesigned navigation lockup, hero brand lockup and footer.
- Rebuilt the header with a glass navigation shell, clearer hierarchy, responsive tablet behavior and a cleaner mobile menu.
- Changed the intro screen to auto-finish after the critical hero image is ready, with a short minimum display and a safe fallback timeout — no user click is required.
- Added a compact hero profile panel with experience, geography and service-format highlights.
- Improved the visual hierarchy of the hero and experience badge.
- Added refined hover states and interaction details for services, work cards, client blocks and the main CTA.
- Improved mobile logo sizing, spacing and hero branding.
- Added Open Graph metadata and stronger SEO description/keywords.
- Added a production-ready `.gitignore` for GitHub.
- Preserved GSAP animations, project filtering, lightbox navigation, touch gestures, scroll progress and reduced-motion behavior.

## Project structure

```text
src/
├── app.component.html
├── app.component.ts
├── styles.css
├── main.ts
├── index.html
└── assets/
    ├── Limitless logo.png
    ├── limitless-logo-clean.webp
    ├── limitless-favicon-clean.webp
    └── projects/
```

## Brand

Primary visual direction: black / warm off-white / Limitless red, with editorial typography, large-scale headlines, photography-led sections and restrained motion.

## Note

The source package was updated and statically validated in the available environment. A full Angular dependency installation/build could not be completed here because the environment could not finish downloading the Angular packages from npm within the available execution window.

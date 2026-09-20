# Limitless Marketing Portfolio — Final UX/Performance Pass

## What changed

- Reworked the project gallery to use a smaller curated set of stronger campaign/event visuals.
- Removed the weaker/generic duplicate gallery entries from the previous build.
- Re-cropped and recompressed the selected WebP images for consistent presentation and faster delivery.
- Kept the supplied Limitless brand logo in the navigation and footer.
- Increased typography scale across desktop and mobile for easier scanning.
- Reworked mobile navigation into a full-width, touch-friendly panel with a backdrop and automatic close behavior.
- Added real interactive work filters: All, Field, Activation, Production, Events.
- Added lightweight reveal animations, service hover motion, image zoom, scan-line motion, counters, marquee motion, and hero entrance animation.
- Removed the custom mouse-circle interaction and all WebGL/Three.js dependencies from the final build.
- Added requestAnimationFrame-throttled scroll progress/parallax handling.
- Added mobile swipe gestures for the project lightbox.
- Added a Back-to-top control after scrolling.
- Added focus-visible states and improved ARIA labels for menu, projects, buttons and lightbox.
- Added width/height attributes to major images to reduce layout shift.
- Added reduced-motion support.

## Assets

The final image folder contains only the curated WebP assets used by the page.

## Verification performed

- Angular template tag counts are balanced for section/div/button/nav elements.
- All referenced asset files exist.
- No Three.js, canvas, or custom mouse cursor references remain in `src`.
- Package versions remain pinned to Angular 22.1.7 and TypeScript 6.0.3.

## Build verification limitation

A full dependency installation/build was not completed in the sandbox because the environment uses Node 22.16.0 while the project requires Node >=22.22.3, and a package-lock-only install timed out. Run `npm install` and `npm run build` locally with the required Node version.

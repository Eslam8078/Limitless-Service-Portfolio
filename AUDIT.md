# Limitless Angular 22 — image, UX and animation pass

## What changed
- Replaced the previous gallery imagery with a curated set extracted from the supplied Limitless portfolio PDF, favoring clear daylight/indoor activation, production, retail and roadshow photography.
- Removed unused legacy image assets from the bundle.
- Rebuilt the logo asset from the supplied company logo image: transparent background, tighter crop, brighter graphite lettering, preserved red accent.
- Added a lightweight 96px WebP favicon based on the supplied logo mark.
- Preloaded the hero image and kept the remaining images lazy-loaded.
- Added GSAP ScrollTrigger for professional entrance, image-reveal, parallax, stagger and movement effects.
- Added nav hide-on-scroll-down / show-on-scroll-up behavior and preserved mobile menu locking.
- Improved mobile typography, touch targets, spacing, gallery sizing and readability.
- Added subtle project-card lift, image zoom, corner cue, client-logo hover, statement pulse and CTA sheen animations.
- Kept reduced-motion support and disabled the heavy parallax layer on reduced-motion devices.
- Removed the custom cursor / mouse ring entirely.

## Build note
The source is pinned to Angular 22.1.7 and TypeScript 6.0.3. Final dependency installation/build was not completed in the audit environment because its Node version is 22.16.0 and `npm install` timed out. Use Node 22.22.3+ on the target machine.

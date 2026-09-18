# Frontend Infrastructure, Styling, Fonts & Assets Survey Report

## 1. Observation

### A. Environment, Toolchain & Dependencies
- **Project Location**: `C:\Users\ASUS\Projects\wedding_portal\frontend`
- **Build & Compilation Command**: `npm run build` executed via `vite v8.3.0` with `@vitejs/plugin-react v6.1.1` and `@tailwindcss/vite v4.3.3`.
  - Result: Built in 428ms with exit code 0 (`../static/dist/index.html` 0.94 kB, `index-CsSKBHIv.css` 51.76 kB, `index-Ceceelo1.js` 433.77 kB).
- **Linter Status**: `npm run lint` (`oxlint v1.81.0`). Finished in 58ms with 0 errors and 22 warnings (unused imports in legacy/new components and `setState` inside effect in `App.jsx:83`).
- **Core Dependencies (`package.json:12-22`)**:
  - `react`: `^19.2.8`
  - `react-dom`: `^19.2.8`
  - `tailwindcss`: `^4.3.3` with `@tailwindcss/vite`: `^4.3.3`
  - `framer-motion`: `^13.3.0`
  - `lucide-react`: `^1.46.0`
  - `clsx`: `^2.1.1`
  - `tailwind-merge`: `^3.7.0`
  - `canvas-confetti`: `^1.9.4`
- **Tailwind Setup**:
  - There is **no** `tailwind.config.js` file in `frontend/`. The project uses Tailwind v4 via `@tailwindcss/vite` in `vite.config.js:3,9` and `@import "tailwindcss";` in `src/index.css:1`.
  - Current `src/index.css:3-25` defines CSS custom properties in `@layer base { :root { ... } }`, but has not declared `@theme` tokens for Tailwind utility generation.
  - `src/App.css` contains unused boilerplate Vite template CSS (`.hero`, `#next-steps`, `.ticks`).

### B. Typography & Google Fonts
- **`index.html:8-12`**:
  ```html
  <!-- High-Fashion Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  ```
- **`src/index.css:16,22-24`**:
  ```css
  body {
    font-family: 'Montserrat', sans-serif;
  }
  h1, h2, h3, .font-serif {
    font-family: 'Cormorant Garamond', Georgia, serif;
  }
  ```
- **Reference Image Analysis (`wedding-reference.png`)**:
  - **Heading Typography ("Kurmet & Balnur")**: Ultra-refined, high-contrast, editorial serif with generous kerning (`letter-spacing: 0.18em - 0.22em`), delicate serifs, and high stroke contrast. Cormorant Garamond (weights 300 / 400) perfectly matches this aesthetic when combined with wide tracking and uppercase or titlecase styling.
  - **Subtitles & Cues ("OUR STORY", "A MOMENT TO REMEMBER", "SCROLL", "A NEW CHAPTER BEGINS")**: Clean geometric sans-serif, uppercase, ultra-wide tracking (`tracking-[0.3em] - tracking-[0.4em]`), small font sizes (10px - 12px), in champagne / muted gold. Montserrat (weights 200 / 300 / 400) matches this cleanly.
- **Branding Audit ("Kurmet & Balnur" vs "Kurmet Balnur")**:
  - `index.html:6`: `<title>Kurmet Balnur • Wedding Gallery</title>` (Missing `&`)
  - `src/data/weddingPhotos.js:8,85`: `author: "Kurmet Balnur"` (Missing `&`)
  - `src/App.jsx:335`: `Kurmet Balnur` (Missing `&`)
  - `src/components/wedding/CinematicIntro.jsx:104`: `Kurmet Balnur` (Missing `&`)
  - `src/components/wedding/WeddingHeader.jsx:21`: `Kurmet Balnur` (Missing `&`)
  - `src/components/wedding/PhotoViewer.jsx:39,68`: `Kurmet Balnur` (Missing `&`)
  - `src/components/wedding/WeddingMenu.jsx:28,69`: `Kurmet Balnur` (Missing `&`)
  - Standalone "K B" count in `frontend/src`: 0 occurrences.

### C. Color System
- **Prompt Palette Specification**:
  - Deep Black: `#0D0C0B`
  - Soft Black: `#171513`
  - Warm Ivory: `#F5F1E9`
  - Champagne: `#E8E0D2`
  - Muted Gold: `#B39A72`
  - Pure White: `#FFFFFF`
- **Current `src/index.css:4-11`**:
  ```css
  :root {
    --bg-dark: #0D0C0B;
    --bg-surface: #171513;
    --text-light: #F5F1E9;
    --text-champagne: #E8E0D2;
    --gold-muted: #B39A72;
    --gold-glow: rgba(179, 154, 114, 0.2);
  }
  ```
  Values match the target palette, but can be integrated into Tailwind v4 `@theme` for utility usage (e.g. `bg-brand-dark`, `text-brand-gold`, `border-brand-champagne/30`).

### D. Assets Audit
- **`frontend/public/`**:
  - `favicon.svg` (9.5 kB)
  - `icons.svg` (5.0 kB)
  - Zero petal assets, zero wedding image assets.
- **`frontend/src/assets/`**:
  - `hero.png` (13.0 kB - placeholder graphic)
  - `react.svg` (4.1 kB)
  - `vite.svg` (8.7 kB)
  - Zero petal assets, zero particle/glow SVG assets.
- **Photo Data (`src/data/weddingPhotos.js`)**:
  - Contains 10 high-resolution Unsplash wedding photography objects (`PLACEHOLDER_WEDDING_PHOTOS`), with URLs and thumbnail URLs representing wedding couples, floral bouquets, ceremony rings, and reception candles. These closely correspond to the photo motifs in `wedding-reference.png`.

### E. Component Architecture Audit
- **Target Component Structure (R11)**:
  ```
  components/wedding/
    CinematicIntro.jsx
    GoldenCircleTransition.jsx
    FallingPetals.jsx
    WeddingHeader.jsx
    PhotoCarousel3D.jsx
    PhotoViewer.jsx
  ```
- **Existing Files in `src/components/wedding/`**:
  - `CinematicIntro.jsx` (exists, but contains emerging 3-card preview inside circle; needs refactoring to match reference circle + typography + scroll-linked scale)
  - `CylindricalCarousel.jsx` (exists, but has text captions on cards, section header text, and simple cylindrical geometry; needs replacement with photo-only perspective 3D carousel matching reference)
  - `GoldenCircleTransition.jsx` (MISSING)
  - `FallingPetals.jsx` (MISSING)
  - `PhotoCarousel3D.jsx` (MISSING)
  - `WeddingHeader.jsx` (exists; needs name fix `Kurmet & Balnur` and action button alignment: ГАЛЕРЕЯ, ♡, ЗАГРУЗИТЬ, MENU)
  - `PhotoViewer.jsx` (exists; needs name fix `Kurmet & Balnur`)
- **Unused Legacy Components in `src/components/`**:
  - `BackgroundBeams.jsx` (not imported)
  - `GalleryView.jsx` (not imported)
  - `LightboxModal.jsx` (only in `GalleryView.jsx`)
  - `Navbar.jsx` (not imported)
  - `UploadView.jsx` (not imported; `components/wedding/UploadPhotos.jsx` is used)

---

## 2. Logic Chain

1. **Build & Bundler Verification**:
   - `vite.config.js` and `package.json` show that the project is running modern React 19 + Tailwind v4 (`@tailwindcss/vite`).
   - `npm run build` completed cleanly in 428ms. Therefore, new components will compile smoothly under Vite 8 and React 19.

2. **Tailwind v4 Integration**:
   - Because Tailwind v4 does not read `tailwind.config.js` by default when using `@tailwindcss/vite`, all custom theme tokens (fonts, brand colors, custom keyframes/animations) should be declared directly in `src/index.css` using the `@theme` directive, alongside existing CSS variables.
   - This ensures arbitrary values like `text-[#B39A72]` continue working while also providing standard utility classes.

3. **Visual Reference Fidelity (`wedding-reference.png`)**:
   - **PAGE 1 (Cinematic Intro)**:
     - The reference shows a centered thin champagne circle (`#B39A72`) surrounded by micro-particle sparkles, star glints on the rim, and subtle warm ambient radial light against `#0D0C0B` / `#171513` with film grain.
     - Centered text must read:
       1. `Kurmet & Balnur` (editorial serif)
       2. Small diamond divider
       3. `OUR STORY` (tracked sans-serif)
       4. `A MOMENT TO REMEMBER` (tracked sans-serif)
     - Bottom scroll cue has a vertical line, `SCROLL`, and chevron (`∨`).
   - **Transition**:
     - As user scrolls, the circle scales up seamlessly using Framer Motion `useScroll`, `useTransform`, `useSpring`.
     - In the bottom half of the reference, the ring has expanded so that its upper crest forms an arch over the carousel scene, centered by a vertical tick and `A NEW CHAPTER BEGINS`.
   - **3D Photo Carousel**:
     - The carousel in the reference is **photo-only**: NO titles, NO author names, NO categories, NO quotes on the cards.
     - The center card is largest, sharpest, upright, closest to the camera with soft rounded corners.
     - Flanking cards are rotated inwards (`rotateY`), translated backwards in Z (`translateZ`), scaled down, and slightly dimmed.
     - An illuminated golden ring rests on the reflective floor plane beneath the photos, reflecting card images onto the dark marble/mirror floor.
     - Circular minimal navigation buttons (`<` and `>`) and pagination dashes appear below.
   - **Falling Petals**:
     - Petals appear across both PAGE 1 and the carousel section.
     - They have 3 distinct layers: foreground (large, out-of-focus blur `filter: blur(4px - 8px)`), midground (sharp, medium size, tumbling in 3D), and background (small, subtle, slow).
     - Because no petal PNGs or SVGs exist in the repo, creating organic SVG petal vector shapes directly inside `FallingPetals.jsx` (with satin champagne gradient fills and realistic petal curves) will deliver a zero-latency, high-performance, 60fps vector particle system.

4. **Page 2 Removal**:
   - The user request explicitly demands removing the intermediate section between the cinematic intro and the 3D carousel (`R5: Remove PAGE 2`).
   - The scroll flow must transition directly: `PAGE 1 (Cinematic Intro) → Golden Circle Expansion → 3D Photo Carousel`.

5. **Branding Correction**:
   - Search confirms 0 occurrences of "K B", but 9 occurrences of "Kurmet Balnur" missing the ampersand `&`. All must be updated to exactly `Kurmet & Balnur`.

---

## 3. Caveats

1. **Tailwind v4 Syntax**:
   - Tailwind v4 handles `@theme` differently than Tailwind v3 `tailwind.config.js`. Avoid creating an obsolete `tailwind.config.js` unless `@config` is linked; configure directly in `src/index.css`.
2. **Scroll Synchronization**:
   - When linking golden circle expansion to scroll, avoid updating React state (`useState`) during `onScroll`. Use Framer Motion's `useScroll`, `useTransform`, and `useSpring` to directly manipulate DOM node transforms via `MotionValue` for strict 60 FPS performance.
3. **Asset Availability**:
   - No local petal or particle image files exist in `public/` or `src/assets/`. Implementing vector SVG petals with CSS/Framer Motion 3D transforms avoids external asset 404s and ensures cross-device responsiveness.
4. **Backend Media Handling**:
   - The app fetches `/api/media` if available, and falls back to `PLACEHOLDER_WEDDING_PHOTOS`. The 3D carousel should handle both placeholder arrays and uploaded guest photos gracefully.

---

## 4. Conclusion & Recommendations

### Implementation Blueprint for Downstream Agents

1. **Typography & Styling**:
   - In `index.html`: update `<title>` to `Kurmet & Balnur • Wedding Gallery`. Keep Cormorant Garamond and Montserrat font links.
   - In `src/index.css`: declare `@theme` block mapping `--font-serif: 'Cormorant Garamond', Georgia, serif;` and `--font-sans: 'Montserrat', system-ui, sans-serif;` alongside the 6 hex palette colors (`#0D0C0B`, `#171513`, `#F5F1E9`, `#E8E0D2`, `#B39A72`, `#FFFFFF`).
   - Clean up dead code in `src/App.css`.

2. **Component Architecture (per R11)**:
   - **`FallingPetals.jsx`**: Create a persistent multi-layer petal animation with 3 depth layers (foreground with blur, midground, background) using organic SVG petal paths, 3D tumbling rotations (`rotateX`, `rotateY`, `rotateZ`), and subtle drift.
   - **`CinematicIntro.jsx`**: Redesign PAGE 1 to match `wedding-reference.png`:
     - Centered glowing golden circle with rim sparkle glints and golden dust.
     - Exact typography: "Kurmet & Balnur" + diamond divider + "OUR STORY" + "A MOMENT TO REMEMBER".
     - Bottom scroll indicator: hairline vertical line + "SCROLL" + downward chevron.
     - Scroll-driven circle expansion via Framer Motion `useScroll` + `useTransform`.
   - **`GoldenCircleTransition.jsx`**: Manage the seamless visual transition from fullscreen circle envelopment to the upper golden arc header ("A NEW CHAPTER BEGINS").
   - **`PhotoCarousel3D.jsx`**: Replace `CylindricalCarousel.jsx`:
     - True 3D perspective layout (`rotateY`, `translateZ`, `scale`, `opacity`, `filter`).
     - **Strictly photo-only cards** (zero text, captions, or names on cards; optional favorite heart).
     - Underneath golden reflective floor ring + dark mirror floor reflection.
     - Controls: Drag, swipe, mouse wheel, keyboard arrows, and minimal circular `<` / `>` buttons + bottom pagination dash indicators.
   - **`WeddingHeader.jsx`**: Update logo to `Kurmet & Balnur` in editorial serif, streamline right actions: ГАЛЕРЕЯ, ♡, ЗАГРУЗИТЬ, MENU.
   - **`PhotoViewer.jsx`**: Update title and branding to `Kurmet & Balnur`.
   - **`App.jsx`**: Integrate new components into flow: `PAGE 1 -> Golden Circle Expansion -> 3D Photo Carousel -> Guest Chronicle Gallery -> Footer`. Completely bypass intermediate Page 2.

3. **Branding Updates**:
   - Update all 9 files identified in the survey to use `Kurmet & Balnur` with the `&` symbol.

---

## 5. Verification Method

To independently verify the findings in this report:

1. **Verify Dependencies and Build**:
   ```bash
   cd C:\Users\ASUS\Projects\wedding_portal\frontend
   npm run build
   ```
   *Expected outcome*: Exit code 0, bundles generated into `../static/dist/`.

2. **Verify Linter**:
   ```bash
   cd C:\Users\ASUS\Projects\wedding_portal\frontend
   npm run lint
   ```
   *Expected outcome*: 0 errors.

3. **Verify Asset Presence**:
   Inspect `frontend/public/` and `frontend/src/assets/` via `dir` or `find_by_name`. Confirms absence of petal/particle files.

4. **Verify Current Branding Occurrences**:
   ```bash
   grep -rn "Kurmet Balnur" C:\Users\ASUS\Projects\wedding_portal\frontend\src
   ```
   *Expected outcome*: 9 occurrences across `App.jsx`, `weddingPhotos.js`, `CinematicIntro.jsx`, `PhotoViewer.jsx`, `WeddingMenu.jsx`, `WeddingHeader.jsx`.

# Project: Kurmet & Balnur Wedding Portal Redesign

## Architecture
- **Framework**: React 19 + Vite 8 + Tailwind CSS v4 (`@tailwindcss/vite`) + Framer Motion 13
- **Design Target**: Strict visual fidelity to `wedding-reference.png`
- **Visual Style**:
  - Palette: Deep Black `#0D0C0B`, Soft Black `#171513`, Warm Ivory `#F5F1E9`, Champagne `#E8E0D2`, Muted Gold `#B39A72`, Pure White `#FFFFFF`
  - Typography: High-fashion editorial serif (`Cormorant Garamond`) with wide kerning; clean modern sans-serif (`Montserrat`) with tracked uppercase for subtitles
  - Atmospheric: Radial golden glow, specular star flares, stardust embers, dark reflective mirror floor, 3D golden ring
- **User Flow**:
  - PAGE 1: Cinematic Intro (Hero typography "Kurmet & Balnur", centered golden ring with glints, falling petals, scroll cue)
  - Scroll Transition: Golden circle expands from small → medium → large → beyond viewport
  - PAGE 2 / 3D Photo Carousel: Directly revealed with overhead golden halo arch ("A NEW CHAPTER BEGINS"), 3D perspective photo arc, dark glossy reflective floor, 3D luminous champagne ring underneath
  - PAGE 3: Guest Chronicle & Editorial Gallery (Masonry grid from `/api/media`, category filters, upload CTA)
  - Modals & Overlays: Fullscreen PhotoViewer lightbox, Fullscreen WeddingMenu, UploadPhotos modal, FavoritesGallery
- **Component Layout (`frontend/src/components/wedding/`)**:
  - `CinematicIntro.jsx`
  - `GoldenCircleTransition.jsx`
  - `FallingPetals.jsx`
  - `WeddingHeader.jsx`
  - `PhotoCarousel3D.jsx`
  - `PhotoViewer.jsx`
  - `WeddingGallery.jsx`
  - `GalleryCategories.jsx`
  - `FavoritesGallery.jsx`
  - `UploadPhotos.jsx`
  - `WeddingMenu.jsx`
  - `AboutSection.jsx`
  - `WishesSection.jsx`

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Reference-Driven Visual Redesign | Match `wedding-reference.png` palette, atmosphere, editorial serif & sans-serif typography | M1, M2, M3 | R1 |
| F2 | Strict Name Branding ("Kurmet & Balnur") | Standardize all 9 occurrences to "Kurmet & Balnur" with ampersand | M1 | R2 |
| F3 | Theme & Typography Setup | Tailwind v4 `@theme` configuration in `src/index.css` with custom fonts and palette | M1 | R1 |
| F4 | Header Redesign | Editorial serif "Kurmet & Balnur", compact right-hand navigation (ГАЛЕРЕЯ, ♡, ЗАГРУЗИТЬ, MENU) | M1 | R8 |
| F5 | Lightbox & Data Branding | Fix branding in `PhotoViewer.jsx`, `WeddingMenu.jsx`, `weddingPhotos.js`, `index.html` | M1 | R2 |
| F6 | Multi-Layer Falling Petals | 3 depth layers (background, midground, blurred foreground), 60 FPS canvas/vector physics, persistent across all sections | M2 | R4 |
| F7 | Golden Circle Scroll Animation | Framer Motion `useScroll`, `useTransform`, `useSpring` expanding circle from small → fullscreen | M2 | R3 |
| F8 | Stardust & Specular Glints | Golden particle trail and 4-point diamond star flares on golden circle | M2 | R3 |
| F9 | Page 2 Elimination | Completely remove intermediate 3-photo preview glimpse from `CinematicIntro.jsx` and old carousel headers | M2, M3 | R5 |
| F10 | Perspective 3D Photo Carousel | True 3D perspective arc: center photo sharp/dominant, flanking cards rotated (`rotateY`), scaled, dimmed | M3 | R6 |
| F11 | Photo-Only Cards | Zero text overlays, zero captions, zero names, zero categories on carousel cards | M3 | R6, R7 |
| F12 | Reflective Floor & 3D Ring | Dark mirror glossy floor reflection + elliptical 3D luminous champagne ring underneath | M3 | R6 |
| F13 | Overhead Halo Arch | Upper crest of expanded golden circle forming overhead arch with "A NEW CHAPTER BEGINS" | M3 | R6 |
| F14 | Carousel Controls & Spring Physics | Mouse drag, mouse wheel, keyboard arrows, touch swipe, circular `<` `>` buttons, dash pagination | M3 | R6 |
| F15 | Responsive Design | Fluid layouts for mobile (390px-430px) and desktop (1366px-1920px) | M4 | R9 |
| F16 | 60 FPS & Motion Performance | MotionValues, no setState on scroll, GPU transforms, `prefers-reduced-motion` support | M4 | R10 |
| F17 | Functionality Preservation | Preserve `/api/media` loading, favorites, upload, lightbox viewer, and menu navigation | M4 | AC |
| F18 | Build & Council Verification | `npm run build` exits with code 0, FCC multi-model review, forensic integrity audit | M5 | AC |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Infrastructure, Branding & Typography Standardization | Standardize "Kurmet & Balnur" across all 9 files, configure `@theme` in `index.css`, update `WeddingHeader.jsx`, `PhotoViewer.jsx`, `index.html` | none | DONE |
| M2 | Falling Petals & Golden Circle Transition System | Create `FallingPetals.jsx` (3-layer depth with blurred foreground), implement `GoldenCircleTransition.jsx`, redesign `CinematicIntro.jsx` (remove 3 preview cards, add glints/stardust) | M1 | DONE |
| M3 | Perspective 3D Photo Carousel & Flow Integration | Create `PhotoCarousel3D.jsx` (photo-only cards, perspective arc, reflective floor, 3D ring, overhead arch, spring physics), wire in `App.jsx`, eliminate old Page 2 | M2 | DONE |
| M4 | Responsive Polish, 60 FPS Performance & Functionality Preservation | Mobile touch-swipe, desktop wheel/drag, prefers-reduced-motion, verify gallery, favorites, uploads, lightbox | M3 | DONE |
| M5 | Build Verification, Council Review & Forensic Audit | `npm run build` exit code 0, FCC council verification, forensic integrity audit, final handoff | M4 | DONE |

---

## Interface Contracts

### `FallingPetals.jsx`
- Props: none (self-contained, persistent canvas mounted at root `App.jsx`)
- Mount position: Root layout, spans fullscreen fixed with layers at `z-10` (bg/mid) and `z-35` (foreground bokeh)
- Supports: `window.matchMedia('(prefers-reduced-motion: reduce)')`

### `CinematicIntro.jsx` / `GoldenCircleTransition.jsx`
- Props:
  - `onComplete`: optional callback when scroll reaches completion
- Scroll driver: Container `260vh` or `280vh` using Framer Motion `useScroll({ target, offset: ["start start", "end end"] })`
- Exports: Smooth scroll progress, golden ring scale, stardust bloom, headline opacity

### `PhotoCarousel3D.jsx`
- Props:
  - `photos`: Array of photo objects `{ id, url, title, author, category, isFavorite }`
  - `onPhotoClick`: `(photo, index) => void` (opens `PhotoViewer`)
  - `onToggleFavorite`: `(photoId) => void`
  - `favorites`: Array of favorited IDs
- Behavior:
  - Photo-only cards (no text rendered on cards)
  - Multi-input: Drag, wheel, touch-swipe, keyboard, buttons
  - Reflective floor + 3D luminous ring underneath

### `WeddingHeader.jsx`
- Props:
  - `currentView`: string
  - `onNavigate`: `(view) => void`
  - `favoritesCount`: number
  - `onOpenUpload`: `() => void`
  - `onOpenMenu`: `() => void`
- Branding: "Kurmet & Balnur" in editorial serif

---

## Code Layout
- `frontend/index.html`: Title and Google Fonts links
- `frontend/src/index.css`: Tailwind `@theme` definitions, color tokens, font declarations
- `frontend/src/App.jsx`: Root component, view management, persistent `FallingPetals` mount
- `frontend/src/data/weddingPhotos.js`: Placeholder wedding photography array
- `frontend/src/components/wedding/CinematicIntro.jsx`: Page 1 hero and golden circle expander
- `frontend/src/components/wedding/GoldenCircleTransition.jsx`: Ring rendering, particle trail, star glints
- `frontend/src/components/wedding/FallingPetals.jsx`: 3-layer organic petals with foreground blur
- `frontend/src/components/wedding/PhotoCarousel3D.jsx`: 3D perspective photo arc, reflective floor, golden ring
- `frontend/src/components/wedding/WeddingHeader.jsx`: Minimalist luxury header
- `frontend/src/components/wedding/PhotoViewer.jsx`: Fullscreen photo modal

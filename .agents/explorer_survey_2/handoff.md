# Survey Report: Component Architecture, User Flow, State Management, and Branding Audit

**Agent**: `explorer_survey_2` (teamwork_explorer)  
**Working Directory**: `C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_2`  
**Date**: 2026-09-18  
**Scope**: Codebase audit and redesign survey covering visual reference analysis (`wedding-reference.png`), component hierarchy, state management, "PAGE 2" removal scope (R5), branding standardization to "Kurmet & Balnur" (R2), and functionality preservation.

---

## 1. Observation

### A. Target Visual Reference Analysis (`wedding-reference.png`)
Inspection of `wedding-reference.png` reveals a two-phase continuous cinematic composition:
1. **PAGE 1 (Cinematic Intro / Hero Stage)**:
   - **Background**: Deep rich charcoal/black (`#0D0C0B`, `#171513`), soft dark brown radial vignette, subtle film grain, and warm golden bokeh dust.
   - **Centerpiece**: A thin, luminous champagne gold circular ring (`#B39A72`) with shimmering light glints/lens flares and particle dust along its perimeter.
   - **Typography**: Hero title **"Kurmet & Balnur"** in a high-fashion editorial serif with generous tracking (`tracking-[0.2em]`), optical centering, and refined letterforms (no script/handwriting fonts).
   - **Subtitles**: Small diamond/dot separator, followed by uppercase clean sans-serif lines:
     - `OUR STORY`
     - `A MOMENT TO REMEMBER`
   - **Scroll Cue**: Fine vertical tick line, uppercase label `SCROLL`, and downward chevron `v`.
   - **Falling Petals**: Realistic ivory/cream rose petals drifting downward with multi-plane depth:
     - *Foreground*: Large, out-of-focus (depth-of-field blur 4–8px), passing in front of text.
     - *Midground*: In-focus, curled 3D orientation, rotating as they descend.
     - *Background*: Smaller, slower, darker particles giving continuous atmospheric depth.
2. **PAGE 2 / 3D Photo Carousel Stage (After Scroll Transition)**:
   - **Expanded Golden Halo**: As the circle expands beyond the viewport, its upper arc forms a luminous golden celestial ring curving across the top third of the screen.
   - **Sub-headline**: Beneath the golden arc apex sits a vertical tick mark and the text `A NEW CHAPTER BEGINS`.
   - **3D Photo Carousel**:
     - Cards arranged along a 3D perspective arc / ring (`perspective: 1000px–1200px`).
     - **Center card**: Largest, sharp, fully visible, facing the user directly in portrait orientation.
     - **Flanking cards**: Progressively rotated inward (`rotateY` ~20°–35°), scaled down (`scale: 0.85 → 0.7`), translated backward in Z-space, and slightly darkened/blurred.
     - **Card Content**: **PHOTO ONLY**. Absolute absence of text overlays, guest names, captions, dates, or category labels on the cards. Only photographs.
     - **Reflective Dais / Floor**: Glossy floor plane underneath the photos exhibiting realistic specular reflections.
     - **3D Golden Ring**: A luminous champagne gold ring on the floor plane beneath the cards, reinforcing the carousel's circular anchor.
     - **Controls**: Minimalist circular arrow buttons (`<` and `>`) at the edges, and horizontal dash/dot pagination at the bottom center.
     - **Petal Continuity**: Falling petals continue seamlessly across this scene.

---

### B. Current Frontend Component Hierarchy & State Management (`frontend/src/`)

1. **Root Hierarchy (`App.jsx`)**:
   - `CinematicIntro.jsx` mounted at root level (`h-[280vh]` scroll tracking).
   - Sticky anchor `<div id="wedding-content-start">` mounting `<WeddingHeader>`.
   - `<main>` container with `<AnimatePresence mode="wait">` switching between:
     - `currentView === 'gallery'`: Renders `CylindricalCarousel` + Chronicle Title + `GalleryCategories` + `WeddingGallery`.
     - `currentView === 'favorites'`: Renders `FavoritesGallery`.
     - `currentView === 'upload'`: Renders `UploadPhotos`.
     - `currentView === 'about'`: Renders `AboutSection`.
     - `currentView === 'wishes'`: Renders `WishesSection`.
     - `currentView === 'qr'`: Renders `QRView`.
     - `currentView === 'live'`: Returns standalone `ProjectorView`.
   - Global modals:
     - `PhotoViewer.jsx`: Fullscreen photo lightbox and share modal.
     - `WeddingMenu.jsx`: Fullscreen navigation overlay.
   - Editorial Footer: Couple branding and quick navigation links.

2. **State Management Architecture (`App.jsx`)**:
   - **`currentView`**: `'gallery' | 'favorites' | 'upload' | 'about' | 'wishes' | 'live' | 'qr'` (default `'gallery'`).
   - **`allPhotos`**: Holds exclusively guest-uploaded media fetched from `/api/media` via `loadMedia()`.
   - **`activeCategory`**: Filter string (`'Все'`, `'Банкет'`, `'Вечеринка'`, `'Друзья'`, `'Подготовка'`, `'Портреты'`).
   - **`favorites`**: Array of favorited photo IDs, persisted in `localStorage` under `'kurmet_balnur_wedding_favorites'`.
   - **`carouselPhotos`**: `useMemo` combining `PLACEHOLDER_WEDDING_PHOTOS` with live `allPhotos` to provide 8–10 slots.
   - **`filteredPhotos`**: `allPhotos` filtered by `activeCategory`, rendered in `WeddingGallery`.
   - **`viewerOpen`, `viewerIndex`, `viewerPhotos`**: Controls lightbox modal state across all gallery views.

---

### C. Diagnosis of "PAGE 2" Scheduled for Removal (R5)

1. **Definition and Location**:
   - In the prior implementation and mental model, "PAGE 2" represented the intermediate layout between the Hero Cinematic Intro and the 3D Carousel.
   - Specifically, inside `CinematicIntro.jsx` (lines 31–34 and 54–81):
     ```jsx
     {/* Emerging Photos Glimpse inside the expanding portal */}
     <motion.div style={{ opacity: previewPhotosOpacity, scale: previewPhotosScale }} ...>
       <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center gap-6 px-4">
         <div className="w-1/3 h-72 rounded-2xl ..."><img src="..." /></div>
         <div className="w-1/3 h-96 rounded-2xl ..."><img src="..." /></div>
         <div className="w-1/3 h-72 rounded-2xl ..."><img src="..." /></div>
       </div>
     </motion.div>
     ```
     This renders a static three-card photo preview row halfway through the scroll progress (`0.25` to `0.85`), acting as an intermediate "Page 2" screen before the carousel.
   - Additionally, `CylindricalCarousel.jsx` (lines 168–181) currently renders an intrusive intermediate text block:
     - Badge: `<Sparkles /> 3D Панорама любви`
     - Title: `Моменты вечности`
     - Subtitle: `Вращайте свайпом или прокруткой`
     - Bottom control label: `3D КОЛЬЦО`
   - In `AboutSection.jsx`:
     - This standalone view was previously considered an intermediate narrative page ("Page 2 / Our Story"). In the current flow it is safely tucked into `currentView === 'about'`, but must never appear in the primary vertical scroll path.

2. **Flow Impact of Removing PAGE 2**:
   - Eliminating the intermediate 3-photo preview glimpse from `CinematicIntro.jsx` allows the golden circle expansion to transition directly and continuously into the 3D Carousel.
   - Eliminating decorative title banners ("Моменты вечности", "3D Панорама любви") allows the 3D Carousel to immediately inherit the expanded golden arc and subtitle `A NEW CHAPTER BEGINS`, matching `wedding-reference.png`.
   - Resulting user flow:
     $$\text{PAGE 1 (Cinematic Intro)} \xrightarrow{\text{Scroll: Golden Circle Expands}} \text{3D Photo Carousel} \xrightarrow{\text{Scroll}} \text{Guest Media Gallery}$$

---

### D. Full Branding Audit: Standalone "Kurmet Balnur" Without '&'

A full scan across `frontend/` (`*.jsx`, `*.js`, `*.html`) identified the following exact occurrences that lack the mandatory `&` symbol:

| # | File Path | Line(s) | Current Content | Required Replacement |
|---|---|---|---|---|
| 1 | `frontend/index.html` | 6 | `<title>Kurmet Balnur • Wedding Gallery</title>` | `<title>Kurmet & Balnur • Wedding Gallery</title>` |
| 2 | `frontend/src/components/wedding/CinematicIntro.jsx` | 102–105 | `<h1 ...>Kurmet Balnur</h1>` | `<h1 ...>Kurmet & Balnur</h1>` |
| 3 | `frontend/src/components/wedding/WeddingHeader.jsx` | 16–21 | `<button ...>Kurmet Balnur</button>` | `<button ...>Kurmet & Balnur</button>` |
| 4 | `frontend/src/components/wedding/WeddingMenu.jsx` | 28 | `<span ...>Kurmet Balnur</span>` | `<span ...>Kurmet & Balnur</span>` |
| 5 | `frontend/src/components/wedding/WeddingMenu.jsx` | 69 | `<span>Kurmet Balnur • Wedding Celebration 2026</span>` | `<span>Kurmet & Balnur • Wedding Celebration 2026</span>` |
| 6 | `frontend/src/components/wedding/PhotoViewer.jsx` | 39 | `title: 'Kurmet Balnur Wedding Photo',` | `title: 'Kurmet & Balnur Wedding Photo',` |
| 7 | `frontend/src/components/wedding/PhotoViewer.jsx` | 68 | `<span ...>Kurmet Balnur</span>` | `<span ...>Kurmet & Balnur</span>` |
| 8 | `frontend/src/App.jsx` | 335 | `<span ...>Kurmet Balnur</span>` (Footer) | `<span ...>Kurmet & Balnur</span>` |
| 9 | `frontend/src/data/weddingPhotos.js` | 8, 85 | `author: "Kurmet Balnur",` | `author: "Kurmet & Balnur",` |

*Note*:
- `frontend/src/components/wedding/AboutSection.jsx` (Line 16) already contains `О свадьбе Kurmet & Balnur` (compliant).
- `frontend/src/components/wedding/CylindricalCarousel.jsx` (Line 254) already contains `'Kurmet & Balnur'` (compliant, though being replaced).
- Standalone "K B" occurrences across `frontend/src/` are currently **0** (already cleaned up in prior cycle).

---

### E. Inventory of Preserved Functionality

| Subsystem | Components Involved | Preservation Status & Wiring |
|---|---|---|
| **Guest Media Loading** | `App.jsx`, `WeddingGallery.jsx` | `/api/media` loads into `allPhotos`. Categories mapped to Russian labels. Empty state CTA prompts guests to upload. |
| **Favorites Management** | `App.jsx`, `FavoritesGallery.jsx`, `WeddingHeader.jsx` | Persisted via `localStorage` (`kurmet_balnur_wedding_favorites`). Heart toggle on header, carousel cards, masonry cards, and lightbox. Batch ZIP download via `/api/export/zip`. |
| **Upload Pipeline** | `UploadPhotos.jsx`, `App.jsx` | Multi-file dropzone, guest name/table/wishes input, `/api/guests` + `/api/upload` multipart dispatch, confetti celebration, cache refresh via `loadMedia()`. |
| **Photo Lightbox** | `PhotoViewer.jsx`, `App.jsx` | Fullscreen modal with index tracking (`viewerPhotos`, `viewerIndex`), keyboard arrows + ESC, download, web share API. |
| **Menu & Navigation** | `WeddingMenu.jsx`, `WeddingHeader.jsx` | Fullscreen backdrop menu navigating to 'intro', 'gallery', 'favorites', 'upload', 'about', 'wishes'. Header has quick links to gallery, favorites, and upload. |
| **Auxiliary Views** | `ProjectorView.jsx`, `QRView.jsx` | Live SSE stream slideshow (`/api/live/stream`) and printable table QR card mockup (`/api/qr`). |

---

## 2. Logic Chain

1. **Visual Target Alignment**:
   - The user request and `ТЗ.txt` require faithful reproduction of `wedding-reference.png` using pure React/CSS/Framer Motion rather than static images.
   - The reference composition requires three core visual systems:
     a. Scroll-linked expanding golden circle transitioning from a hero ring into an overhead halo arc.
     b. Continuous multi-layered falling petals with depth-of-field blur on foreground layers.
     c. A perspective-based 3D Photo Carousel with photo-only cards, reflective floor plane, and 3D golden ring.
2. **Elimination of PAGE 2**:
   - Requirement R5 mandates removing any intermediate screen between the intro and the carousel.
   - The current `CinematicIntro.jsx` contains an embedded 3-photo preview glimpse (`previewPhotosOpacity`) and `CylindricalCarousel.jsx` contains a prominent text header ("Моменты вечности").
   - Removing these two elements directly aligns the DOM and scroll flow with the reference image: Hero $\to$ Halo Arc $\to$ 3D Carousel.
3. **Card Cleanliness (R6 & R7)**:
   - `CylindricalCarousel.jsx` currently displays photo titles, categories, authors, and text gradients on cards.
   - The reference image and specifications explicitly forbid all text on cards ("PHOTO ONLY"). Removing these overlays leaves only the photograph and an unobtrusive favorite heart icon.
4. **Name Standardization (R2)**:
   - The nine identified files using "Kurmet Balnur" without `&` violate R2.
   - Replacing them with "Kurmet & Balnur" ensures complete consistency and satisfies the grep acceptance criterion.
5. **Functional Integrity**:
   - By retaining all existing props, handlers (`onPhotoClick`, `onToggleFavorite`, `favorites`, `loadMedia`), and view state in `App.jsx`, all existing features (masonry gallery, favorites, uploads, projector, QR) remain 100% operational.

---

## 3. Caveats

1. **Scroll Transition Coordinate Sync**:
   - The transition between `CinematicIntro` (sticky 280vh container) and the 3D Carousel must be tuned so that the golden circle reaches its expanded overhead arc right when the carousel becomes visible in the viewport, preventing awkward jump cuts or dead scroll zones.
2. **GPU & Animation Performance**:
   - Falling petals combined with 3D perspective transforms can stress mobile GPUs if implemented with heavy DOM nodes. Petals should be capped at ~20–25 elements with CSS hardware acceleration (`transform: translate3d`, `will-change: transform`).
3. **Reflective Floor Implementation**:
   - In modern browsers, `-webkit-box-reflect` is supported in WebKit/Blink (Chrome, Edge, Safari) but not in Firefox. A fallback using an inverted duplicate layer or gradient mask ensures consistent rendering across all desktop browsers.

---

## 4. Conclusion

- **Redesign Readiness**: The frontend architecture is modular, cleanly written, and ready for redesign without breaking backend media contracts.
- **Scope of PAGE 2 Removal**: Fully identified as the intermediate preview cards in `CinematicIntro.jsx` and the text headers in `CylindricalCarousel.jsx`.
- **Branding Corrections**: Nine specific files identified for immediate update to "Kurmet & Balnur".
- **Recommended Component Structure (per R11)**:
  - `components/wedding/FallingPetals.jsx` (New: multi-layer ambient petals)
  - `components/wedding/GoldenCircleTransition.jsx` (New or integrated into `CinematicIntro.jsx`)
  - `components/wedding/PhotoCarousel3D.jsx` (New: replacing `CylindricalCarousel.jsx` with reference-matching 3D perspective, reflective floor, and 3D golden ring)
  - `components/wedding/WeddingHeader.jsx` (Updated to new typography and layout)
  - `components/wedding/PhotoViewer.jsx` (Preserved and updated with "Kurmet & Balnur")
  - `components/wedding/WeddingGallery.jsx` (Preserved guest masonry gallery)

---

## 5. Verification Method

To independently verify all findings:

1. **Verify Name Branding**:
   - Search for standalone "Kurmet Balnur" without `&`:
     Check occurrences in `frontend/index.html`, `frontend/src/App.jsx`, `CinematicIntro.jsx`, `WeddingHeader.jsx`, `WeddingMenu.jsx`, `PhotoViewer.jsx`, `weddingPhotos.js`.
2. **Verify PAGE 2 Intermediate Elements**:
   - Inspect `frontend/src/components/wedding/CinematicIntro.jsx` lines 54–81 (`previewPhotosOpacity`).
   - Inspect `frontend/src/components/wedding/CylindricalCarousel.jsx` lines 168–181 (`title = "Моменты вечности"`).
3. **Verify Build**:
   - Run `npm run build` in `frontend/`. Verifies zero compilation errors with exit code 0.

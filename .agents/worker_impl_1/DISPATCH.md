# Worker Task Assignment: Implementation of R1, R2, R3, R4 & Build Verification

## Context
- Project: Kurmet & Balnur Wedding Portal
- Workspace: C:\Users\ASUS\Projects\wedding_portal
- Master Spec: C:\Users\ASUS\Projects\wedding_portal\PROJECT.md
- User Request: C:\Users\ASUS\Projects\wedding_portal\.agents\ORIGINAL_REQUEST.md
- Explorer 1 Survey: C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_1\handoff.md
- Explorer 2 Survey: C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_2\handoff.md
- Explorer 3 Survey: C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_3\handoff.md

## Scope & Objective
Implement all requirements R1, R2, R3, R4 with full fidelity:

### 1. Requirement R1: Branding & Name Update
Replace all occurrences of "K B" and "K & B" across the frontend with "Kurmet Balnur":
- `frontend/index.html`: Update `<title>` to "Kurmet Balnur • Wedding Gallery".
- `frontend/src/components/wedding/CinematicIntro.jsx`: Update hero centerpiece to "Kurmet Balnur", responsive font sizes `text-4xl sm:text-6xl md:text-7xl lg:text-8xl`, tracking `0.18em sm:0.22em`, `text-center`, zero horizontal scroll.
- `frontend/src/components/wedding/WeddingHeader.jsx`: Update logo button to "Kurmet Balnur", `text-lg sm:text-2xl`, `whitespace-nowrap`.
- `frontend/src/components/wedding/WeddingMenu.jsx`: Update header monogram and bottom info to "Kurmet Balnur".
- `frontend/src/components/wedding/PhotoViewer.jsx`: Update share title to "Kurmet Balnur Wedding Photo" and desktop monogram to "Kurmet Balnur".
- `frontend/src/components/wedding/App.jsx`: Update footer branding to "Kurmet Balnur", keep local storage backwards compatibility.
- `frontend/src/components/wedding/AboutSection.jsx`: Update heading to "О свадьбе Kurmet & Balnur".
- `frontend/src/data/weddingPhotos.js`: Update author metadata to "Kurmet Balnur".

### 2. Requirement R2: Middle 3D Cylindrical Carousel
Create `frontend/src/components/wedding/CylindricalCarousel.jsx` and mount in `frontend/src/App.jsx`:
- Follow the exact specification in Explorer 2's handoff (`explorer_survey_2/handoff.md`).
- 3D cylindrical geometry with `preserve-3d`, `perspective`, `rotateX(-5deg)`, `rotateY`, `translateZ` calculated from card width and facet count ($N=8..10$).
- Dual-engine rotation:
  - Scroll-driven rotation via Framer Motion `useScroll` + `useSpring`.
  - Manual drag/swipe via Pointer Events with pointer capture and release inertia decay ($0.93$ friction loop via `requestAnimationFrame`).
- Responsive styling: `touch-action: pan-y`, 6px drag threshold, `overflow-hidden` section container, zero horizontal overflow.
- Photo integration: Prepend live uploads from `/api/media` and fill remaining slots with curated placeholders from `PLACEHOLDER_WEDDING_PHOTOS`.
- Click on card opens `PhotoViewer` lightbox; heart button toggles favorites.
- Mount directly in `App.jsx` in the middle section between `WeddingHeader` and the guest media chronicle.

### 3. Requirement R3: Bottom Photo Gallery Cleanup
- In `frontend/src/App.jsx`: Initialize `allPhotos` as empty array (or purely from `/api/media`). In `loadMedia`, set `allPhotos` exclusively to `serverItems` (do NOT append `PLACEHOLDER_WEDDING_PHOTOS` to the bottom gallery).
- In `frontend/src/components/wedding/WeddingGallery.jsx`: Implement luxury champagne empty-state call-to-action when `photos.length === 0`, featuring an upload icon, Cormorant Garamond heading, invitation text, and a button triggering `onOpenUpload()` passed from `App.jsx`.

### 4. Requirement R4 & Verification: FCC Council Review & Build
- Check and apply the patch to `C:\Users\ASUS\fcc_agent_tools.py` from `C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_3\fcc_agent_tools.patch` (or ensure `codestral` maps to `mistral/codestral-latest`).
- Run the local FCC council commands across updated components:
  - `python C:\Users\ASUS\fcc_agent_tools.py -m mistral/codestral-latest "..."` auditing 60fps animation performance, responsive layout integrity on mobile and desktop, and code maintainability.
- Run `npm run build` in `C:\Users\ASUS\Projects\wedding_portal\frontend` and verify exit code 0.
- Run `npm run lint` (`oxlint`) and ensure 0 errors.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Deliverables
Deliver your complete work report to `C:\Users\ASUS\Projects\wedding_portal\.agents\worker_impl_1\handoff.md`.

## 2026-09-18T15:38:59Z
You are worker_impl_1 (teamwork_preview_worker).
Your working directory is C:\Users\ASUS\Projects\wedding_portal\.agents\worker_impl_1.
Your task assignment is at C:\Users\ASUS\Projects\wedding_portal\.agents\worker_impl_1\DISPATCH.md.
Read the authoritative user request at: C:\Users\ASUS\Projects\wedding_portal\.agents\ORIGINAL_REQUEST.md.
Read the master project spec at: C:\Users\ASUS\Projects\wedding_portal\PROJECT.md.
Read the survey handoffs at:
- C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_1\handoff.md (Branding & Gallery specs)
- C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_2\handoff.md (3D Cylindrical Carousel code & integration)
- C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_3\handoff.md (Build & FCC Council CLI invocations)

Execute the implementation across:
1. R1: Rebranding from "K B" to "Kurmet Balnur" across all 8 files with responsive typography.
2. R2: Implement CylindricalCarousel.jsx in frontend/src/components/wedding/ and mount in frontend/src/App.jsx.
3. R3: Bottom gallery cleanup in App.jsx (only guest uploads from /api/media) and luxury empty-state CTA in WeddingGallery.jsx.
4. R4: Apply patch to C:\Users\ASUS\fcc_agent_tools.py if needed, run FCC Council review across updated components, run npm run build in frontend/ ensuring exit code 0.

Write your detailed implementation report with verification evidence to C:\Users\ASUS\Projects\wedding_portal\.agents\worker_impl_1\handoff.md and report back when complete.


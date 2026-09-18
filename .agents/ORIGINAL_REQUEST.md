# Original User Request

## 2026-09-18T15:27:09Z

Requested team: Full team with FCC-Claude integration

Refine the wedding portal at C:\Users\ASUS\Projects\wedding_portal for Kurmet & Balnur: replace 'K B' branding with 'Kurmet Balnur', integrate an interactive 3D cylindrical carousel in the middle section that rotates on scroll and manual drag/swipe, clean up redundant bottom stock photos, and validate all changes via the local FCC-Claude council.

Working directory: C:\Users\ASUS\Projects\wedding_portal
Integrity mode: development

## Requirements

### R1. Branding & Name Update
Replace all occurrences of initials "K B" across the frontend codebase (including App.jsx, CinematicIntro.jsx, WeddingHeader.jsx, PhotoViewer.jsx, WeddingMenu.jsx, and footer metadata) with the full names "Kurmet Balnur". Retain high-fashion serif styling and wedding elegance.

### R2. Middle 3D Cylindrical Carousel
Implement a 3D cylindrical photo carousel in the middle section of the portal:
- Scroll-driven rotation: As the user scrolls vertically past this section, the photos rotate smoothly along a 3D axis (cylinder / 3D perspective).
- Manual interaction: The user can manually drag, swipe, or flick horizontally to rotate the cylinder forward and backward.
- Photo integration: Prepare designated image slots that support wedding photos (both placeholder slots and live user uploads).

### R3. Bottom Photo Gallery Cleanup
Remove redundant stock placeholder photos from the bottom masonry gallery so that it displays only guest-uploaded / backend media from /api/media (or a stylish call-to-action to upload memories if empty), keeping the page clean and unburdened by repetitive stock photos.

### R4. Multi-Model FCC-Claude Council Review
Run the local Free Claude Code council (python C:\Users\ASUS\fcc_agent_tools.py --council ... or fcc_council subagent) across the updated components to audit 60fps animation performance, responsive layout integrity on mobile and desktop, and code maintainability.

## Verification Resources
- Build script: npm run build in frontend/
- Council review tool: python C:\Users\ASUS\fcc_agent_tools.py --council
- Linting: npx oxlint (if configured) or Vite build validation

## Acceptance Criteria

### Branding & Typography
- [ ] grep / search for standalone "K B" in frontend/src/ returns zero instances.
- [ ] "Kurmet Balnur" appears with correct font sizing, tracking, and wedding styling across Intro, Header, Menu, Viewer, and Footer.

### 3D Cylindrical Carousel
- [ ] The carousel component is integrated into the middle section with CSS 3D transforms (preserve-3d, perspective, rotateY).
- [ ] Page scroll dynamically modulates the 3D rotation angle of the carousel.
- [ ] Mouse drag and touch swipe events enable manual spinning and inspection of photos with smooth damping.
- [ ] Carousel handles responsive viewport sizes without horizontal scrollbars breaking the page.

### Bottom Gallery Cleanup
- [ ] Redundant stock placeholder images are removed from the bottom gallery.
- [ ] Bottom section correctly renders user uploads from /api/media or an elegant upload prompt if no uploads exist.

### Quality & Build Verification
- [ ] npm run build in C:\Users\ASUS\Projects\wedding_portal\frontend completes successfully with exit code 0 and no compilation errors.
- [ ] FCC Council review executes and provides verification feedback on the code.

## 2026-09-18T16:34:05Z

Complete redesign of the existing wedding photo gallery at C:\Users\ASUS\Projects\wedding_portal. This is a working React + Vite + Tailwind + Framer Motion project. The task is REDESIGN, not rebuild from scratch. Preserve existing functionality (gallery, favorites, upload, photo viewer, navigation) while completely overhauling the visual experience to match the reference image.

Working directory: C:\Users\ASUS\Projects\wedding_portal
Integrity mode: development

**CRITICAL**: Before any implementation, open and study the reference image at `C:\Users\ASUS\Projects\wedding_portal\wedding-reference.png`. This is the primary visual target. Reproduce its composition, atmosphere, color palette, typography, golden circle, falling petals, cinematic lighting, 3D photo carousel, depth, spacing, and visual hierarchy using real HTML/CSS/React components — NOT as a background image or static screenshot.

## Requirements

### R1. Reference-Driven Visual Redesign
Study `wedding-reference.png` and redesign PAGE 1 (cinematic intro) to closely match:
- Deep cinematic black background (`#0D0C0B`, `#171513`) with soft brown/black gradients, subtle vignette, film grain, warm golden glow. No flat `#000000`.
- Color palette: Deep Black `#0D0C0B`, Soft Black `#171513`, Warm Ivory `#F5F1E9`, Champagne `#E8E0D2`, Muted Gold `#B39A72`, White `#FFFFFF`. No neon gold, bright yellow, purple, blue, or saturated gradients.
- Replace current font with an elegant high-fashion editorial serif (luxury, cinematic, sophisticated — NOT cheap wedding script fonts). Additional text uses clean modern sans-serif.

### R2. Names: "Kurmet & Balnur"
All name references must use exactly `Kurmet & Balnur` with the `&` symbol. Not "Kurmet Balnur", not "Kurmet + Balnur", not "Kurmet and Balnur". Do not use a logo image instead of text.

### R3. Golden Circle Scroll Animation (Framer Motion)
Center of PAGE 1 has a thin champagne gold circle (`#B39A72`) with subtle glow, slight blur, small golden particle trail. The circle MUST be scroll-linked using Framer Motion (`useScroll`, `useTransform`, `useSpring`) — NOT `setTimeout` or CSS `animation-duration`. Flow:
```
small circle → medium circle → large circle → circle larger than viewport → fullscreen transition → 3D Photo Carousel
```
Simultaneously: title fades, subtitle fades, background morphs, golden glow intensifies, next scene reveals.

### R4. Falling Petals
Animated falling petals on PAGE 1 AND continuing on the 3D carousel page:
- Multiple layers: background, midground, foreground petals
- Varying sizes, speeds, rotation, trajectory changes, depth/parallax
- Foreground petals can have blur
- Some pass in front of text/photos, some behind
- NOT identical PNGs moving on one trajectory — create depth sensation
- Petals persist across all pages with same visual style

### R5. Remove PAGE 2
The existing intermediate section between the cinematic intro and the 3D photo carousel must be completely removed from the user flow. After golden circle expansion, the user transitions directly to the 3D photo carousel. Delete its layout, text, components (if not used elsewhere), navigation, and animation logic.

Final flow: `PAGE 1 (Cinematic Intro) → Golden Circle Expansion → 3D Photo Carousel`

### R6. 3D Photo Carousel (Photo-Only)
Replace the current cylindrical carousel with a perspective-based 3D carousel matching the reference:
- Center: large, sharp, fully visible photo closest to user
- Left/right: progressively smaller, rotated, deeper, slightly darker/blurred photos with perspective
- 3D golden ring underneath (champagne gold, luminous, subtle, cinematic, reflective) creating the impression photos are arranged around a ring
- **PHOTO ONLY on cards**: No text overlays, no names, no captions, no categories, no descriptions, no quotes. Only the photograph. Favorite icon and navigation controls are allowed.
- Animation: `perspective`, `rotateY`, `translateX`, `scale`, `opacity`, `z-index/depth`, spring physics. Smooth spring transitions between photos, no abrupt switching.
- Controls: Desktop — mouse drag, mouse wheel, arrows, keyboard arrows. Mobile — swipe, touch drag (natural feel, no tiny buttons).

### R7. No Edge Text / No Extra Text
Do NOT add decorative captions, slogans, or labels on the edges of pages. No unnecessary text on the carousel page — photographs are the hero. Only minimal UI controls.

### R8. Header
Update existing header to new style: "Kurmet & Balnur" in editorial serif. Right side: ГАЛЕРЕЯ, ♡, ЗАГРУЗИТЬ, MENU. Header must not distract from photos. Compact navigation on mobile.

### R9. Responsive Design
Mobile (390×844, 393×852, 430×932): golden circle, petals, scroll transition, 3D carousel preserved. Swipe instead of mouse drag. Fewer visible cards. Center photo stays dominant. Not just a shrunk desktop.
Desktop (1366×768, 1440×900, 1536×864, 1920×1080): large typography, generous spacing, mouse parallax, full 3D perspective, fullscreen cinematic sections.

### R10. Performance & Accessibility
- Target 60 FPS. Use Framer Motion MotionValues, not React state updates on scroll. GPU-friendly animations (transform, opacity). Lazy loading, responsive images.
- `prefers-reduced-motion: reduce` support
- Keyboard navigation, focus states, aria labels, alt text

### R11. Component Structure
Organize into clear components:
```
components/wedding/
  CinematicIntro.jsx
  GoldenCircleTransition.jsx
  FallingPetals.jsx
  WeddingHeader.jsx
  PhotoCarousel3D.jsx
  PhotoViewer.jsx
```
Do not put all animation logic in one giant component.

### R12. 21st.dev Skills (Optional)
Before UI development, run `npx @21st-dev/cli install-skill` to check for suitable UI components. Only use components that genuinely fit the wedding design system.

## Acceptance Criteria

### Visual Fidelity
- [ ] PAGE 1 visually matches `wedding-reference.png` in composition, atmosphere, color palette, and typography
- [ ] Names display as "Kurmet & Balnur" (with &) everywhere — grep confirms no standalone "Kurmet Balnur" without &
- [ ] High-fashion editorial serif font is used for headings, clean sans-serif for body text

### Golden Circle
- [ ] Thin champagne gold circle in center of PAGE 1 with glow effect
- [ ] Circle scale is driven by `useScroll`/`useTransform`/`useSpring` — not setTimeout or CSS animation-duration
- [ ] Circle smoothly expands from small → beyond viewport → transition to carousel on scroll

### Falling Petals
- [ ] Multi-layer petals (background, midground, foreground) with varying sizes, speeds, rotation
- [ ] Petals appear on PAGE 1 AND on the 3D carousel page
- [ ] Foreground petals have depth-of-field blur effect

### Page 2 Removal
- [ ] No intermediate section between cinematic intro and 3D carousel — direct transition

### 3D Photo Carousel
- [ ] Center photo is largest, sharp, closest. Side photos are smaller, rotated, deeper, slightly darker
- [ ] Golden 3D ring effect underneath the carousel
- [ ] Cards contain ONLY photos — no text overlays, names, captions, or categories
- [ ] Desktop: mouse drag, wheel, arrows work. Mobile: swipe/touch drag works naturally
- [ ] Spring physics transitions between photos

### Quality
- [ ] `npm run build` in `frontend/` completes with exit code 0
- [ ] Responsive: tested at mobile (390px) and desktop (1920px) breakpoints
- [ ] 60 FPS scroll animations (MotionValues, no setState on scroll)
- [ ] `prefers-reduced-motion` respected
- [ ] Existing functionality preserved: gallery, favorites, upload, photo viewer, navigation

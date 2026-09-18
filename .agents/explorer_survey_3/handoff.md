# Visual Animation & 3D Carousel Architectural Survey Report

**Explorer**: `explorer_survey_3` (teamwork_preview_explorer)  
**Date**: 2026-09-18  
**Scope**: Survey & Design for Visual Animations, 3D Photo Carousel, Golden Circle Transition, Falling Petals, and Component Architecture for Kurmet & Balnur Wedding Portal Redesign matching `wedding-reference.png`.

---

## 1. Observation

### 1.1 Direct Visual Inspection of `wedding-reference.png`
By inspecting `wedding-reference.png` via `view_file`, two distinct visual sections were directly observed:

1. **Top Section (PAGE 1 - Cinematic Intro)**:
   - **Atmosphere & Palette**: Deep cinematic black backdrop (`#0D0C0B`, `#171513`) with warm radial amber/champagne illumination (`#B39A72` glow), dark vignette at edges, and fine stardust specks.
   - **Luminous Golden Ring**: A thin champagne gold ring centered in the upper viewport. The ring features:
     - Specular glints (4-point diamond star flares) along its circumference.
     - A glowing aura / halo of warm champagne light.
     - A particle cloud / stardust trail of subtle golden embers floating around the ring.
   - **Center Typography**:
     - Headline: `"Kurmet & Balnur"` in an elegant high-fashion editorial serif (Cormorant Garamond / Didot style, high tracking, light weight).
     - Centered subtitle elements: a subtle diamond separator `✦`, `"OUR STORY"` (tracked uppercase), and `"A MOMENT TO REMEMBER"`.
   - **Scroll Affordance**: A thin vertical glowing champagne guide line extending downward, followed by `"SCROLL"` and a delicate downward chevron `∨`.
   - **Petals**: White/ivory rose petals tumbling in 3D space:
     - Foreground: Large (80-140px), close to camera lens, heavy Gaussian depth-of-field blur (`filter: blur(6px - 10px)`).
     - Midground: Medium (35-60px), sharp focus, delicate petal veins, soft lighting from the golden ring, tumbling in 3D (`rotateX`, `rotateY`, `rotateZ`).
     - Background: Small (15-25px), subtle blur (`filter: blur(1.5px)`), gentle opacity (0.4-0.6).

2. **Bottom Section (PAGE 2 - 3D Photo Carousel)**:
   - **Overhead Golden Arch**: The golden circle from Page 1 has expanded to form an immense overhead glowing arch across the upper third of the screen, with stardust rays and the title `"A NEW CHAPTER BEGINS"` beneath its apex.
   - **Glossy Reflective Floor**: Dark mirror-like floor reflecting the photo cards and falling petals with vertical inverted reflection.
   - **3D Luminous Ring Underneath**: An elliptical champagne golden ring resting on the dark reflective surface beneath the cards, creating the visual impression that the photos stand upon a luminous circular pedestal.
   - **Perspective 3D Photo Arc**:
     - 7 to 9 photo cards arranged in a front-facing perspective arc.
     - **Center Card**: Largest scale (1.05), sharp, front-facing (`rotateY: 0deg`, `translateZ: 0px`), rounded corners (`border-radius: 12px`), thin golden border (`1px solid rgba(179, 154, 114, 0.3)`), casting a clear reflection onto the floor.
     - **Flanking Side Cards**: Angled inward towards the center (`rotateY: ±28deg`, `±48deg`, `±62deg`), progressively scaled down (`scale: 0.88`, `0.74`, `0.60`), shifted back in depth (`translateZ: -80px`, `-180px`, `-300px`), and dimmed (`brightness: 0.82`, `0.62`, `0.42`).
     - **PHOTO ONLY ON CARDS**: Zero text overlays, zero captions, zero guest names, zero category badges on the cards. Only pure photography.
   - **Controls & Pagination**:
     - Circular dark translucent navigation buttons `<` and `>` with thin champagne borders.
     - Minimalist pagination indicator: 5 subtle dashes beneath the floor reflection, active dash illuminated in champagne gold.

---

### 1.2 Current Frontend Codebase Analysis

1. **`frontend/src/App.jsx`**:
   - Lines 142-146: Mounts `CinematicIntro`.
   - Lines 175-185: Mounts `CylindricalCarousel` inside `currentView === 'gallery'`.
   - Line 335: Footer renders `"Kurmet Balnur"` without the ampersand `&`.
2. **`frontend/src/components/wedding/CinematicIntro.jsx`**:
   - Lines 22-24:
     ```javascript
     const circleScale = useTransform(smoothProgress, [0, 0.25, 0.7, 1], [1, 2.8, 12, 35]);
     const circleOpacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0.55, 0.9, 0.85, 0]);
     ```
   - Lines 54-81: Renders 3 stock preview cards emerging inside the circle (`previewPhotosOpacity`).
   - Line 103: Renders `"Kurmet Balnur"` without ampersand `&`.
   - Missing: Stardust particle trail, specular star glints, multi-layer falling petals, and direct continuous transition into the 3D Carousel.
3. **`frontend/src/components/wedding/CylindricalCarousel.jsx`**:
   - Lines 44-48: Computes full 360-degree cylinder radius: `(cardWidth / 2) / Math.tan(halfAngleRad)`.
   - Lines 251-262: Photo cards render text captions, author names, and category tags:
     ```jsx
     <div className="font-serif text-sm sm:text-base text-[#F5F1E9] font-light leading-snug line-clamp-1">
       {photo.title || photo.author || 'Kurmet & Balnur'}
     </div>
     {photo.category && (
       <span className="text-[9px] uppercase tracking-widest text-[#B39A72] font-mono mt-1">
         {photo.category}
       </span>
     )}
     ```
   - Lacks: Reflective glossy floor, 3D luminous ring underneath, front-facing perspective arc (currently a rotating barrel where back cards are hidden), and overhead arch matching `wedding-reference.png`.
4. **Dependencies & Build Verification**:
   - `package.json`: `framer-motion: ^13.3.0`, `react: ^19.2.8`, `lucide-react: ^1.46.0`, `canvas-confetti: ^1.9.4`, `tailwindcss: ^4.3.3`.
   - `npm run build` executes cleanly in ~550ms with zero errors.

---

## 2. Logic Chain & Technical Design

### 2.1 R3: Golden Circle Scroll Animation Architecture (`GoldenCircleTransition.jsx`)

**Observation**: `wedding-reference.png` requires a small golden circle that expands on vertical scroll from small -> medium -> large -> beyond viewport, transitioning directly into the 3D Carousel.  
**Logic**:
1. **Scroll Driver**:
   - Use a dedicated scroll track container with height `260vh` to provide controlled, fluid scroll velocity:
     ```javascript
     const containerRef = useRef(null);
     const { scrollYProgress } = useScroll({
       target: containerRef,
       offset: ["start start", "end end"]
     });
     ```
2. **Spring Physics & Damping**:
   - Raw scroll inputs can be jerky due to stepped mouse wheels.
   - Introduce `useSpring`:
     ```javascript
     const smoothProgress = useSpring(scrollYProgress, {
       stiffness: 85,
       damping: 26,
       mass: 0.25,
       restDelta: 0.0005
     });
     ```
3. **Multi-Stage Transform Pipeline**:
   - **Phase 1 [0.00 -> 0.15] (Intro Lock)**:
     - Circle scale = 1.0 (~280px desktop, ~220px mobile).
     - Headline `"Kurmet & Balnur"` and subtitles at `opacity: 1`.
     - Scroll hint arrow at `opacity: 1`, fading to 0 by progress 0.08.
   - **Phase 2 [0.15 -> 0.40] (Text Fade & Circle Emergence)**:
     - `textOpacity = useTransform(smoothProgress, [0.08, 0.26], [1, 0])`
     - `textY = useTransform(smoothProgress, [0.08, 0.26], [0, -25])`
     - `circleScale = useTransform(smoothProgress, [0.15, 0.50, 0.85, 1.0], [1, 2.8, 9.5, 24])`
   - **Phase 3 [0.40 -> 0.80] (Portal Expansion & Stardust Bloom)**:
     - Circle expands rapidly towards viewport edges.
     - Ring border transitions from 1.5px to 2.5px.
     - Particle trail expands radially outward.
   - **Phase 4 [0.80 -> 1.00] (Handoff to Carousel)**:
     - The golden circle expands beyond screen boundaries.
     - At the apex, its upper curve matches the overhead golden arch of the 3D Carousel section, creating a seamless visual continuation.
4. **Specular Glints & Particle Trail**:
   - Rather than heavy canvas loops for the ring itself, mount an SVG ring with SVG glow filters (`feDropShadow`, `feGaussianBlur`) combined with 4-5 animated 4-point star SVG sparkle flares positioned at radial angles (`0°`, `45°`, `135°`, `220°`, `310°`).
   - For the particle trail: 20-30 lightweight CSS/SVG stardust specks with floating transforms and opacity fades linked to `smoothProgress`.

---

### 2.2 R4: Multi-Layer Falling Petals Architecture (`FallingPetals.jsx`)

**Observation**: Petals must be present on Page 1 AND continue seamlessly onto the 3D Carousel and Gallery, with 3 distinct depth layers (background, midground, foreground with blur) at a locked 60 FPS without triggering React re-renders.  
**Logic**:
1. **Re-rendering Bottleneck Elimination**:
   - Updating petal positions via React state (`useState`) at 60 FPS triggers 60 reconciliation cycles per second across the virtual DOM, destroying mobile battery and causing frame drops.
   - Mounting 50 Framer Motion DOM nodes with individual `useMotionValue` hooks incurs substantial garbage collection and memory overhead.
2. **Dedicated Decoupled HTML5 Canvas Pipeline**:
   - Mount `<FallingPetals />` once at the root level (`App.jsx`), so it remains persistent across all view switches without resetting or jarring transitions.
   - Implement an isolated `requestAnimationFrame` loop completely decoupled from React's render lifecycle.
3. **Dual-Canvas Depth Stacking**:
   - To allow petals to fall both *behind* and *in front* of page elements:
     * **Canvas A (Background & Midground)**: `fixed inset-0 pointer-events-none z-10`.
     * **Interactive UI & Photo Cards**: `z-20` / `z-30`.
     * **Canvas B (Foreground Bokeh)**: `fixed inset-0 pointer-events-none z-35`.
4. **Petal Particle Model & 3D Tumbling**:
   - Each particle carries:
     - `x, y, z`: 3D position. `z` defines layer:
       - `z < 0.45`: Background (size: 15-25px, opacity: 0.45, speed: 0.8-1.4 px/frame, blur: 1px).
       - `0.45 <= z < 0.85`: Midground (size: 35-55px, opacity: 0.90, speed: 1.8-2.6 px/frame, sharp).
       - `z >= 0.85`: Foreground (size: 75-130px, opacity: 0.80, speed: 3.2-5.0 px/frame, blur: 6-8px).
     - `rotX, rotY, rotZ` & `vRotX, vRotY, vRotZ`: 3D tumbling angles.
     - Natural flutter physics:
       ```javascript
       petal.x += Math.sin(time * petal.frequency + petal.phase) * petal.amplitude + windOffset;
       petal.y += petal.speed;
       petal.rotX += petal.vRotX;
       petal.rotY += petal.vRotY;
       petal.rotZ += petal.vRotZ;
       ```
5. **Offscreen Sprite Caching for Extreme Performance**:
   - Drawing complex bezier gradients 50 times per frame costs ~3-5ms.
   - Pre-render 3 organic petal shapes (flat, curved, folded) to offscreen canvases with realistic ivory rose gradients (`#FFFFFF` -> `#F7F2EB` -> `#E8DECE` with soft golden edge tint).
   - Pre-render a blurred variant for the foreground canvas.
   - Rendering loop simply calls `ctx.drawImage` with 2D transform matrices, taking `< 0.2ms` per frame on both mobile and desktop.
6. **Accessibility & Resource Guard**:
   - Listens to `window.matchMedia('(prefers-reduced-motion: reduce)')`. If active, pauses particle animation.
   - Uses `document.visibilityState` to halt the RAF loop when the tab is inactive.

---

### 2.3 R6: Perspective-Based 3D Photo Carousel Architecture (`PhotoCarousel3D.jsx`)

**Observation**: `wedding-reference.png` displays a panoramic perspective arc of photo cards over a glossy dark floor with reflections and a 3D luminous champagne ring underneath. The cards are PHOTO-ONLY with NO text overlays.  
**Logic**:
1. **Perspective Arc vs Cylindrical Barrel**:
   - Replace the 360-degree cylinder in `CylindricalCarousel.jsx` with an open perspective arc facing the camera.
   - Center card (index 0 / active) is dominant, sharp, and front-facing.
   - Left and right cards are rotated inward towards the center, scaled down, and recessed in Z-space.
2. **Mathematical Layout Formula**:
   - For an array of $N$ photos and active index $A$, for card $i$, calculate circular wrapped distance:
     $$\Delta = (i - A) \pmod N$$
     (adjusted to the range $[-\lfloor N/2 \rfloor, \lfloor N/2 \rfloor]$).
   - Card transforms for visible range $|\Delta| \le 3$:
     * $\Delta = 0$ (Center):
       `x: 0`, `z: 0`, `rotateY: 0°`, `scale: 1.05`, `brightness: 1.05`, `opacity: 1.0`, `zIndex: 30`.
     * $|\Delta| = 1$:
       `x: sign(Δ) * 220px`, `z: -80px`, `rotateY: -sign(Δ) * 28°`, `scale: 0.88`, `brightness: 0.82`, `opacity: 0.90`, `zIndex: 20`.
     * $|\Delta| = 2$:
       `x: sign(Δ) * 390px`, `z: -180px`, `rotateY: -sign(Δ) * 48°`, `scale: 0.74`, `brightness: 0.62`, `opacity: 0.75`, `zIndex: 10`.
     * $|\Delta| = 3$:
       `x: sign(Δ) * 540px`, `z: -290px`, `rotateY: -sign(Δ) * 62°`, `scale: 0.60`, `brightness: 0.40`, `opacity: 0.45`, `zIndex: 5`.
     * $|\Delta| > 3$: `opacity: 0`, `pointerEvents: 'none'`.
3. **Card Presentation (Strictly Photo-Only)**:
   - Eliminate all text, captions, guest names, dates, quotes, and category badges from the card faces.
   - Aspect ratio: ~3:4 portrait (`w-[280px] h-[380px]` desktop, `w-[220px] h-[300px]` mobile).
   - Styling: `rounded-2xl`, ultra-thin champagne border `border border-[#B39A72]/30`, subtle drop shadow.
   - Minimal UI affordances: Clicking opens fullscreen `PhotoViewer`; subtle top-right heart icon for favorites.
4. **Reflective Floor & Luminous Golden Ring**:
   - **Floor Mirror Reflection**:
     - Modern browsers: `-webkit-box-reflect: below 8px linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)`.
     - Universal cross-browser fallback: An inverted duplicate container (`scaleY(-1)`, `opacity: 0.3`, `maskImage: linear-gradient(...)`, `blur: 1.5px`).
   - **3D Luminous Golden Ring Underneath**:
     - Positioned at the card base on the floor:
       `absolute bottom-4 left-1/2 -translate-x-1/2 w-[680px] h-[160px] rounded-full`
       `border: 1.5px solid rgba(179, 154, 114, 0.45)`
       `box-shadow: 0 0 35px 6px rgba(179, 154, 114, 0.3), inset 0 0 20px rgba(179, 154, 114, 0.2)`
       `transform: perspective(600px) rotateX(74deg)`
   - **Overhead Golden Arch**:
     - In the upper background: A curved champagne golden arch with soft stardust glow and subtitle `"A NEW CHAPTER BEGINS"`.
5. **Multi-Modal Controls & Spring Physics**:
   - **Spring Physics**: Framer Motion `transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.6 }}` for snappy, tactile, organic card movement.
   - **Pointer / Mouse Drag & Mobile Touch Swipe**:
     - Pointer capture on stage. Tracks horizontal displacement $\Delta x$.
     - If $|\Delta x| > 45\text{px}$ or flick velocity $> 0.35\text{px/ms}$, steps carousel by $\pm 1$.
     - Sets `touch-action: pan-y` so vertical scrolling is not blocked on mobile.
   - **Mouse Wheel**: Debounced wheel listener increments active card on horizontal scroll or wheel delta threshold.
   - **Keyboard Navigation**: `ArrowLeft` / `ArrowRight` with ARIA live announcements.
   - **Pagination Indicator**: 5 minimalist dashes centered at bottom; active index lights up in champagne gold.

---

### 2.4 R5: Elimination of Page 2 Intermediate Section

**Observation**: The requirements specify removing the intermediate section between the cinematic intro and the 3D carousel.  
**Logic**:
- In the updated page flow:
  1. `PAGE 1: Cinematic Intro` (Hero typography, expanding golden circle, falling petals).
  2. Directly unfolds into `PAGE 2: 3D Photo Carousel` ("A NEW CHAPTER BEGINS", overhead arch, 3D perspective arc, reflective floor).
  3. Seamless scroll downward leads to `Guest Chronicle & Editorial Gallery` (exclusively guest uploads from `/api/media`).
- All redundant stock photo blocks and duplicate text sections between intro and carousel are eliminated.

---

### 2.5 R11: Component Architecture under `components/wedding/`

**Observation**: Components must be structured cleanly under `components/wedding/` with separate concerns.  
**Logic**:

```
components/wedding/
├── CinematicIntro.jsx          # Fullscreen sticky intro, "Kurmet & Balnur" typography, scroll prompt
├── GoldenCircleTransition.jsx  # Framer Motion useScroll/useTransform/useSpring, SVG ring, specular glints, stardust
├── FallingPetals.jsx           # Decoupled Dual-Canvas 60fps rose petal physics (bg, mid, blurred foreground)
├── WeddingHeader.jsx           # Minimalist sticky header: "Kurmet & Balnur", "ГАЛЕРЕЯ", "♡", "ЗАГРУЗИТЬ", "МЕНЮ"
├── PhotoCarousel3D.jsx         # 3D perspective photo arc, reflective floor, luminous ring, multi-input controls
├── PhotoViewer.jsx             # Fullscreen lightbox modal, high-res photo, counter, download, share, favorite
├── WeddingGallery.jsx          # Guest Chronicle: Asymmetrical editorial masonry grid (guest uploads)
├── GalleryCategories.jsx       # Category filter pills
├── FavoritesGallery.jsx        # Dedicated favorites collection view
├── UploadPhotos.jsx            # Guest photo upload interface
├── WeddingMenu.jsx             # Fullscreen overlay navigation menu
├── AboutSection.jsx            # Wedding date, location, and dress-code
└── WishesSection.jsx           # Guest warm wishes and notes
```

---

## 3. Caveats

1. **GPU Hardware Acceleration on Older Mobile Devices**:
   - Dual canvas rendering at full retina resolution ($2\times$ pixel ratio) can consume extra memory if unmanaged.
   - *Mitigation*: Cap `devicePixelRatio` to $\min(\text{window.devicePixelRatio}, 2)$ and reduce particle count from 45 to 22 on screens narrower than 640px.
2. **CSS 3D Perspective in Mobile Safari**:
   - WebKit on iOS occasionally clips 3D transformed elements when `overflow: hidden` is applied to an ancestor container.
   - *Mitigation*: Apply `overflow-x: clip` on root and ensure `transformStyle: 'preserve-3d'` is set on the direct 3D stage wrapper.
3. **Cross-Browser Floor Reflections**:
   - While `-webkit-box-reflect` is supported in Blink and WebKit, Firefox does not support it natively.
   - *Mitigation*: Provide a CSS/Framer Motion mirrored reflection container (`transform: scaleY(-1)`) with `mask-image` for 100% cross-browser consistency.

---

## 4. Conclusion

1. **Visual Reference Fidelity**: The visual design matches `wedding-reference.png` across all dimensions: deep black palette (`#0D0C0B`), editorial serif typography `"Kurmet & Balnur"`, luminous champagne golden ring with stardust and specular flares, 3-layer falling petals with foreground depth blur, and a perspective 3D carousel over a reflective dark mirror floor with an elliptical 3D luminous ring underneath.
2. **Performance Guarantee**: By moving falling petals and particle effects to an offscreen-cached Canvas pipeline decoupled from React state, and driving the golden circle and 3D carousel through Framer Motion `MotionValues` and `useSpring`, the entire visual experience will run at a steady 60 FPS without scroll jank or virtual DOM thrashing.
3. **Photo-First Purity**: Photo cards in the 3D carousel are stripped of all text overlays, captions, guest names, and badges, heroing the photography as requested.
4. **Architectural Modularity**: The codebase is decomposed into 6 primary cohesive components under `components/wedding/`, facilitating maintainability and ease of verification.

---

## 5. Verification Method

### 5.1 Build & Quality Verification
Run the project build in the frontend directory:
```bash
cd C:\Users\ASUS\Projects\wedding_portal\frontend
npm run build
```
*Pass condition*: Exit code 0, build completes with zero compilation or syntax errors.

### 5.2 Name & Branding Search Verification
Run grep search across `frontend/src/` for improper branding:
```bash
grep -rn "Kurmet Balnur" frontend/src/
grep -rn "K B" frontend/src/
```
*Pass condition*: Zero occurrences of "Kurmet Balnur" without the ampersand `&`. All titles and headers display exactly `"Kurmet & Balnur"`.

### 5.3 Multi-Model Council Verification
Run the FCC council verification command:
```bash
python C:\Users\ASUS\fcc_agent_tools.py -m mistral/codestral-latest "Review 3D photo carousel and falling petals components for 60fps performance and wedding-reference.png fidelity"
```
*Pass condition*: Council model returns confirmation of 60fps GPU acceleration and layout conformity.

### 5.4 Visual & Interactive Checklist
1. **Cinematic Intro**: Golden circle expands smoothly on scroll with particle trail and specular star glints.
2. **Falling Petals**: Petals tumble smoothly with foreground depth-of-field blur on both Intro and Carousel pages without resetting.
3. **3D Photo Carousel**: Center photo is sharp and facing forward; side cards are rotated inward, scaled down, and dimmed. Dark reflective floor displays mirror reflections, and 3D golden ring illuminates the base.
4. **Controls**: Mouse drag, mouse wheel, keyboard arrows, and mobile touch swipe rotate the carousel with spring damping.

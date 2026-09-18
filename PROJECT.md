# Project: Kurmet & Balnur Wedding Portal Refinement

## Architecture
- **Framework**: React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion 13 + Lucide React.
- **Backend Integration**: FastAPI serving REST endpoints `/api/media`, `/api/upload`, and SQLite WAL database `data/wedding.db`.
- **Static Assets Target**: Vite builds into `../static/dist`, which FastAPI mounts and serves.
- **Visual Design**: High-fashion wedding elegance, dark charcoal `#0D0C0B`, champagne gold `#B39A72`, warm ivory `#F5F1E9`, Cormorant Garamond serif and Montserrat sans typography.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | index.html Document Title | Update `<title>` from "K & B • Wedding Gallery" to "Kurmet Balnur • Wedding Gallery" | M1 | Survey (explorer 1) |
| 2 | CinematicIntro Hero Centerpiece | Replace "K B" with "Kurmet Balnur" in Cormorant Garamond, responsive font scaling (`text-4xl sm:text-7xl lg:text-8xl`), tracking 0.18-0.22em, zero viewport overflow | M1 | Survey (explorer 1) |
| 3 | WeddingHeader Logo | Replace "K B" with "Kurmet Balnur" (`text-lg sm:text-2xl`, `whitespace-nowrap`), no collision with header action buttons | M1 | Survey (explorer 1) |
| 4 | WeddingMenu Monogram & Footer | Replace "K B" and "K & B • Wedding Celebration 2026" with "Kurmet Balnur" | M1 | Survey (explorer 1) |
| 5 | PhotoViewer Lightbox Branding | Update share title to "Kurmet Balnur Wedding Photo" and desktop monogram to "Kurmet Balnur" | M1 | Survey (explorer 1) |
| 6 | App.jsx Footer Branding | Update editorial footer "K B" to "Kurmet Balnur" (`text-2xl sm:text-3xl tracking-[0.2em]`) | M1 | Survey (explorer 1) |
| 7 | AboutSection Title | Update "О свадьбе K & B" to "О свадьбе Kurmet & Balnur" | M1 | Survey (explorer 1) |
| 8 | weddingPhotos.js Metadata | Update author "K & B" to "Kurmet Balnur" | M1 | Survey (explorer 1) |
| 9 | 3D Cylindrical Geometry & CSS Transforms | Implement 3D polygon ring (`preserve-3d`, `perspective`, `rotateX(-5deg)`, `rotateY`, `translateZ` apothem radius calculation for 8-10 cards) | M2 | Survey (explorer 2) |
| 10 | Scroll-Driven 3D Rotation | Scroll-driven cylinder rotation via Framer Motion `useScroll` + `useSpring` | M2 | Survey (explorer 2) |
| 11 | Manual Drag & Swipe Damping | Pointer Events drag/swipe with pointer capture, release inertia physics decay ($0.93$ friction loop via `requestAnimationFrame`) | M2 | Survey (explorer 2) |
| 12 | Responsive Layout & Zero Overflow | `touch-action: pan-y`, 6px drag threshold, overflow-hidden wrapper, zero horizontal scrollbar on mobile/desktop | M2 | Survey (explorer 2) |
| 13 | Photo Slots & Lightbox Integration | Support curated photos + live uploads from `/api/media`, card click opens `PhotoViewer`, favorite toggle support | M2 | Survey (explorer 2) |
| 14 | App.jsx Middle Section Mount | Place `CylindricalCarousel` between `WeddingHeader` and guest photo chronicle | M2 | Survey (explorer 2) |
| 15 | Bottom Gallery Stock Photo Removal | Remove `PLACEHOLDER_WEDDING_PHOTOS` from bottom masonry gallery; display exclusively guest uploads from `/api/media` | M3 | Survey (explorer 1 & 2) |
| 16 | Luxury Empty-State CTA | Render champagne upload prompt in `WeddingGallery.jsx` with upload button calling `onOpenUpload()` when guest media is empty | M3 | Survey (explorer 1) |
| 17 | Multi-Model FCC Council Review | Run local Free Claude Code council (`python C:\Users\ASUS\fcc_agent_tools.py`) auditing 60fps animation, responsiveness, and maintainability | M4 | Survey (explorer 3) |
| 18 | Frontend Build Verification | Verify `npm run build` in `frontend/` succeeds with exit code 0 and bundles cleanly into `../static/dist` | M4 | Survey (explorer 3) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Branding & Name Update | Features 1–8: Full rebranding from "K B" to "Kurmet Balnur" across all 8 files with responsive typography | none | DONE |
| 2 | M2: Middle 3D Cylindrical Carousel | Features 9–14: Create `CylindricalCarousel.jsx`, 3D CSS transforms, dual-engine scroll + drag damping, photo integration, and mount in `App.jsx` | M1 | DONE |
| 3 | M3: Bottom Photo Gallery Cleanup | Features 15–16: Remove stock photos from bottom gallery in `App.jsx`, implement luxury champagne upload CTA in `WeddingGallery.jsx` | M2 | DONE |
| 4 | M4: FCC Council Review & Build Verification | Features 17–18: Multi-model FCC Council audit (60fps, responsive, maintainability) and `npm run build` exit code 0 verification | M1, M2, M3 | DONE |

## Interface Contracts

### `CylindricalCarousel` Component (`frontend/src/components/wedding/CylindricalCarousel.jsx`)
```typescript
interface CylindricalCarouselProps {
  photos: Array<{
    id: string;
    url: string;
    thumbnail?: string;
    title?: string;
    author?: string;
    category?: string;
  }>;
  onPhotoClick?: (photo: any) => void;
  onToggleFavorite?: (photoId: string) => void;
  favorites?: string[];
  title?: string;
  subtitle?: string;
}
```

### `WeddingGallery` Empty-State Contract (`frontend/src/components/wedding/WeddingGallery.jsx`)
```typescript
interface WeddingGalleryProps {
  photos: PhotoItem[];
  onPhotoClick: (photo: PhotoItem) => void;
  onToggleFavorite: (photoId: string) => void;
  favorites: string[];
  onOpenUpload?: () => void; // New prop for empty state CTA
}
```

### `App.jsx` Photo State Partitioning
- `allPhotos`: strictly contains guest uploads from `/api/media` (empty array if no server items).
- `carouselPhotos`: combined curated placeholders (`PLACEHOLDER_WEDDING_PHOTOS`) + live uploads (`allPhotos`), ensuring 3D cylinder has 8-10 cards.
- `filteredPhotos`: derived from `allPhotos` filtered by `activeCategory`, passed to `WeddingGallery`.

## Code Layout
- `frontend/index.html`: Document title and viewport styling.
- `frontend/src/App.jsx`: State management, middle section carousel mount, media loading, footer.
- `frontend/src/components/wedding/CinematicIntro.jsx`: Fullscreen intro animation and hero title.
- `frontend/src/components/wedding/WeddingHeader.jsx`: Sticky header logo and navigation controls.
- `frontend/src/components/wedding/WeddingMenu.jsx`: Fullscreen navigation backdrop.
- `frontend/src/components/wedding/PhotoViewer.jsx`: Fullscreen lightbox and share modal.
- `frontend/src/components/wedding/AboutSection.jsx`: Couple story section title.
- `frontend/src/components/wedding/CylindricalCarousel.jsx`: [NEW] Middle 3D cylindrical carousel.
- `frontend/src/components/wedding/WeddingGallery.jsx`: Bottom guest media masonry grid and empty state CTA.
- `frontend/src/data/weddingPhotos.js`: Curated wedding photoshoot data and metadata.

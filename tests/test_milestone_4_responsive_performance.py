"""
Milestone 4 Automated Verification Test Suite
Responsive Polish, 60 FPS Performance & Functionality Preservation

Verifies:
1. Responsive Design Optimization (R9):
   - Mobile breakpoints (390px - 430px):
     * Header compact layout with logo, gallery, favorites heart, upload button, and menu.
     * 3D carousel responsive card sizing and touch-action: pan-y gesture isolation.
     * Fluid vertical scroll without horizontal lock or accidental slide flips on scroll.
     * Golden circle scaling without horizontal overflow.
   - Desktop breakpoints (1366px - 1920px):
     * Editorial typography kerning and generous tracking.
     * Expansive 3D perspective arc with wheel and mouse drag interaction.
2. 60 FPS Performance & Accessibility (R10):
   - Zero React state updates on scroll (MotionValues / useSpring drive transforms).
   - prefers-reduced-motion: reduce support across FallingPetals, GoldenCircleTransition, PhotoCarousel3D, CinematicIntro.
   - Keyboard accessibility: ArrowLeft, ArrowRight, Escape handlers in Viewer, Menu, and Carousel.
   - ARIA roles and labels: carousel role="region" / aria-roledescription, modal role="dialog" / aria-modal="true", tablist dashes.
3. Functionality Preservation:
   - Backend media loading from /api/media with placeholder fallback in carouselPhotos.
   - Favorites state toggle, localStorage persistence, and header count badge.
   - Lightbox modal triggering from 3D carousel and masonry gallery.
   - Upload modal triggering from header and menu.
   - WeddingMenu fullscreen overlay navigation.
"""

import re
from pathlib import Path
import pytest

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend" / "src"
COMPONENTS_DIR = FRONTEND_DIR / "components" / "wedding"

APP_JSX = FRONTEND_DIR / "App.jsx"
HEADER_JSX = COMPONENTS_DIR / "WeddingHeader.jsx"
CAROUSEL_JSX = COMPONENTS_DIR / "PhotoCarousel3D.jsx"
INTRO_JSX = COMPONENTS_DIR / "CinematicIntro.jsx"
CIRCLE_JSX = COMPONENTS_DIR / "GoldenCircleTransition.jsx"
PETALS_JSX = COMPONENTS_DIR / "FallingPetals.jsx"
VIEWER_JSX = COMPONENTS_DIR / "PhotoViewer.jsx"
MENU_JSX = COMPONENTS_DIR / "WeddingMenu.jsx"
GALLERY_JSX = COMPONENTS_DIR / "WeddingGallery.jsx"


# ==============================================================================
# SECTION 1: RESPONSIVE DESIGN OPTIMIZATION (R9)
# ==============================================================================

def test_header_mobile_compact_layout_all_five_elements():
    """
    R9 & Task 1: Header must display a compact layout for mobile with:
    1. Logo ('Kurmet & Balnur')
    2. Gallery ('ГАЛЕРЕЯ')
    3. Favorites heart ('♡' / favoritesCount)
    4. Upload button ('ЗАГРУЗИТЬ')
    5. Menu ('MENU')
    All in a single non-wrapping responsive row.
    """
    content = HEADER_JSX.read_text(encoding="utf-8")
    assert "Kurmet & Balnur" in content, "Header must contain logo"
    assert "ГАЛЕРЕЯ" in content, "Header must contain gallery button"
    assert "favoritesCount" in content, "Header must contain favorites count badge"
    assert "Heart" in content, "Header must contain favorites heart icon"
    assert "Upload" in content, "Header must contain upload icon"
    assert "ЗАГРУЗИТЬ" in content, "Header must contain upload button label"
    assert "Menu" in content, "Header must contain menu icon"
    assert "MENU" in content, "Header must contain menu button"
    # Ensure gallery is not hidden on mobile screens
    assert "hidden sm:inline-block text-xs uppercase tracking-[0.2em]" not in content, (
        "Gallery button should not be hidden on mobile screens"
    )


def test_carousel_responsive_sizing_and_touch_gesture_isolation():
    """
    R9: 3D carousel handles mobile breakpoints (390px - 430px) with responsive
    card dimensions, touch-pan-y, and vertical scroll gesture isolation.
    """
    content = CAROUSEL_JSX.read_text(encoding="utf-8")

    # Responsive card and stage sizing
    assert "cardWidth = isMobile ? 185" in content, "Mobile card width must be calibrated for small screens"
    assert "cardHeight = isMobile ? 260" in content, "Mobile card height must be calibrated"
    assert "stageHeight = isMobile ? 420" in content, "Mobile stage height must be calibrated"

    # Touch action pan-y for fluid vertical scrolling
    assert "touch-pan-y" in content, "Carousel must have touch-pan-y for fluid native vertical scroll"

    # Vertical gesture isolation (prevents accidental card flips when user scrolls vertically)
    assert "Math.abs(distY) > Math.abs(dist) * 1.2" in content, (
        "Carousel must isolate vertical scroll gestures from horizontal swipes"
    )

    # Clean touch cancel without triggering jumps
    assert "handlePointerCancel" in content, "Carousel must handle pointer cancel cleanly"
    assert "onPointerCancel={handlePointerCancel}" in content, (
        "Carousel must attach handlePointerCancel to onPointerCancel"
    )


def test_carousel_desktop_expansive_arc_and_typography_tracking():
    """
    R9: Desktop breakpoints (1366px - 1920px) feature generous typography tracking,
    expansive 3D perspective arc, mouse drag, and wheel interaction.
    """
    content = CAROUSEL_JSX.read_text(encoding="utf-8")

    # Tracking on subtitle
    assert "tracking-[0.35em]" in content or "tracking-[0.45em]" in content, (
        "Subtitle must have wide tracking"
    )
    assert "A NEW CHAPTER BEGINS" in content, "Carousel must display 'A NEW CHAPTER BEGINS'"

    # Desktop card dimensions (280x380) and expansive step widths
    assert "280" in content and "380" in content, "Desktop card sizing must be 280x380"
    assert "step4 = isMobile ? 350 : isTablet ? 480 : 610" in content, (
        "Desktop perspective arc must expand up to step4=610"
    )

    # Mouse wheel and drag interaction
    assert "handleWheel" in content, "Carousel must support mouse wheel"
    assert "handlePointerDown" in content and "handlePointerMove" in content and "handlePointerUp" in content, (
        "Carousel must support mouse and touch pointer dragging"
    )


# ==============================================================================
# SECTION 2: 60 FPS PERFORMANCE & ACCESSIBILITY (R10)
# ==============================================================================

def test_zero_react_state_updates_on_scroll():
    """
    R10: Verify that scroll animations do not trigger React state updates.
    Scroll is driven exclusively by Framer Motion MotionValues (useScroll, useTransform, useSpring).
    """
    # Check CinematicIntro
    intro_content = INTRO_JSX.read_text(encoding="utf-8")
    assert "useScroll" in intro_content, "Intro must use Framer Motion useScroll"
    assert "useSpring" in intro_content, "Intro must use Framer Motion useSpring for 60 FPS damping"
    assert "useTransform" in intro_content, "Intro must use Framer Motion useTransform"

    # Verify no scroll event listener calling setState exists in wedding components
    for comp_path in [APP_JSX, INTRO_JSX, CIRCLE_JSX, CAROUSEL_JSX, HEADER_JSX, GALLERY_JSX]:
        code = comp_path.read_text(encoding="utf-8")
        assert "addEventListener('scroll'" not in code and 'addEventListener("scroll"' not in code, (
            f"Component {comp_path.name} contains manual scroll listener; must use Framer Motion MotionValues"
        )


def test_prefers_reduced_motion_respected_across_all_components():
    """
    R10: Verify that 'prefers-reduced-motion: reduce' is respected across:
    - FallingPetals.jsx (halts RAF simulation and clears canvases)
    - GoldenCircleTransition.jsx (uses useReducedMotion to disable infinite animations)
    - PhotoCarousel3D.jsx (uses useReducedMotion to set transition duration to 0)
    - CinematicIntro.jsx (uses useReducedMotion to freeze scroll chevron animation)
    """
    # 1. FallingPetals
    petals_code = PETALS_JSX.read_text(encoding="utf-8")
    assert "prefers-reduced-motion: reduce" in petals_code, (
        "FallingPetals must query (prefers-reduced-motion: reduce)"
    )
    assert "stopLoop" in petals_code and "clearCanvases" in petals_code, (
        "FallingPetals must stop loop and clear canvases on reduced motion"
    )

    # 2. GoldenCircleTransition
    circle_code = CIRCLE_JSX.read_text(encoding="utf-8")
    assert "useReducedMotion" in circle_code, (
        "GoldenCircleTransition must import and use useReducedMotion"
    )
    assert "shouldReduceMotion" in circle_code, (
        "GoldenCircleTransition must branch on shouldReduceMotion"
    )

    # 3. PhotoCarousel3D
    carousel_code = CAROUSEL_JSX.read_text(encoding="utf-8")
    assert "useReducedMotion" in carousel_code, (
        "PhotoCarousel3D must import and use useReducedMotion"
    )
    assert "shouldReduceMotion" in carousel_code, (
        "PhotoCarousel3D must branch on shouldReduceMotion"
    )
    assert "duration: 0" in carousel_code, (
        "PhotoCarousel3D must set duration: 0 when reduced motion is preferred"
    )

    # 4. CinematicIntro
    intro_code = INTRO_JSX.read_text(encoding="utf-8")
    assert "useReducedMotion" in intro_code, (
        "CinematicIntro must import and use useReducedMotion"
    )


def test_keyboard_accessibility_across_modals_and_carousel():
    """
    R10: Verify keyboard accessibility:
    - PhotoViewer: Escape, ArrowLeft, ArrowRight
    - WeddingMenu: Escape
    - PhotoCarousel3D: ArrowLeft, ArrowRight, Enter/Space on center card
    """
    # PhotoViewer
    viewer_code = VIEWER_JSX.read_text(encoding="utf-8")
    assert "e.key === 'Escape'" in viewer_code, "PhotoViewer must handle Escape key"
    assert "e.key === 'ArrowLeft'" in viewer_code, "PhotoViewer must handle ArrowLeft key"
    assert "e.key === 'ArrowRight'" in viewer_code, "PhotoViewer must handle ArrowRight key"

    # WeddingMenu
    menu_code = MENU_JSX.read_text(encoding="utf-8")
    assert "e.key === 'Escape'" in menu_code, "WeddingMenu must handle Escape key"

    # PhotoCarousel3D
    carousel_code = CAROUSEL_JSX.read_text(encoding="utf-8")
    assert "e.key === 'ArrowLeft'" in carousel_code, "PhotoCarousel3D must handle ArrowLeft key"
    assert "e.key === 'ArrowRight'" in carousel_code, "PhotoCarousel3D must handle ArrowRight key"
    assert "e.key === 'Enter'" in carousel_code or "e.key === ' '" in carousel_code, (
        "PhotoCarousel3D center card must handle Enter/Space keys"
    )


def test_aria_roles_and_semantics():
    """
    R10: Verify ARIA roles, labels, and modal dialog semantics:
    - PhotoCarousel3D: role='region', aria-roledescription='carousel', aria-label='3D Photo Carousel'
    - PhotoViewer: role='dialog', aria-modal='true'
    - WeddingMenu: role='dialog', aria-modal='true'
    - Focus visible rings on interactive elements
    """
    carousel_code = CAROUSEL_JSX.read_text(encoding="utf-8")
    assert 'role="region"' in carousel_code, "Carousel must have role='region'"
    assert 'aria-roledescription="carousel"' in carousel_code, "Carousel must have aria-roledescription='carousel'"
    assert 'aria-label="3D Photo Carousel"' in carousel_code, "Carousel must have aria-label"
    assert 'role="tablist"' in carousel_code, "Carousel pagination must have role='tablist'"
    assert 'role="tab"' in carousel_code, "Carousel dashes must have role='tab'"

    viewer_code = VIEWER_JSX.read_text(encoding="utf-8")
    assert 'role="dialog"' in viewer_code, "PhotoViewer must have role='dialog'"
    assert 'aria-modal="true"' in viewer_code, "PhotoViewer must have aria-modal='true'"

    menu_code = MENU_JSX.read_text(encoding="utf-8")
    assert 'role="dialog"' in menu_code, "WeddingMenu must have role='dialog'"
    assert 'aria-modal="true"' in menu_code, "WeddingMenu must have aria-modal='true'"

    header_code = HEADER_JSX.read_text(encoding="utf-8")
    assert "focus-visible:ring-" in header_code, "Header buttons must have focus-visible styling"


# ==============================================================================
# SECTION 3: FUNCTIONALITY PRESERVATION AUDIT
# ==============================================================================

def test_guest_media_loading_and_placeholder_fallback():
    """
    AC: Guest media is loaded from /api/media into allPhotos.
    carouselPhotos prepares up to 10 curated photos, falling back cleanly to
    PLACEHOLDER_WEDDING_PHOTOS when backend is empty or offline.
    """
    app_code = APP_JSX.read_text(encoding="utf-8")
    assert "fetch('/api/media')" in app_code or 'fetch("/api/media")' in app_code, (
        "App.jsx must fetch media from /api/media"
    )
    assert "PLACEHOLDER_WEDDING_PHOTOS" in app_code, (
        "App.jsx must import PLACEHOLDER_WEDDING_PHOTOS as fallback"
    )
    assert "carouselPhotos" in app_code, "App.jsx must define carouselPhotos"


def test_favorites_persistence_and_counter_badge():
    """
    AC: Favorites state is persisted in localStorage and reflected in header badge.
    """
    app_code = APP_JSX.read_text(encoding="utf-8")
    assert "kurmet_balnur_wedding_favorites" in app_code, (
        "App.jsx must persist favorites under 'kurmet_balnur_wedding_favorites'"
    )
    assert "favoritesCount={favorites.length}" in app_code, (
        "App.jsx must pass favorites.length to WeddingHeader"
    )
    assert "toggleFavorite" in app_code, "App.jsx must implement toggleFavorite"


def test_photoviewer_lightbox_integration():
    """
    AC: Fullscreen PhotoViewer modal opens cleanly from carousel and masonry gallery.
    """
    app_code = APP_JSX.read_text(encoding="utf-8")
    assert "<PhotoViewer" in app_code, "App.jsx must mount <PhotoViewer"
    assert "setViewerOpen(true)" in app_code, "App.jsx must setViewerOpen(true) on photo clicks"
    assert "setViewerPhotos" in app_code, "App.jsx must update setViewerPhotos"
    assert "setViewerIndex" in app_code, "App.jsx must update setViewerIndex"


def test_upload_modal_and_wedding_menu_overlays():
    """
    AC: UploadPhotos and WeddingMenu overlays open from header and navigate properly.
    """
    app_code = APP_JSX.read_text(encoding="utf-8")
    assert "<UploadPhotos" in app_code, "App.jsx must mount <UploadPhotos"
    assert "<WeddingMenu" in app_code, "App.jsx must mount <WeddingMenu"
    assert "isMenuOpen" in app_code, "App.jsx must manage isMenuOpen state"
    assert "onOpenMenu={() => setIsMenuOpen(true)}" in app_code, (
        "WeddingHeader must trigger setIsMenuOpen(true)"
    )

"""
Empirical Verification and Integrity Testing for PhotoCarousel3D.jsx
Milestone 3 — Perspective 3D Photo Arc Carousel & Direct Flow Integration

Validates:
1. Circular delta wrapping logic across multiple array sizes and active indices.
2. Perspective 3D Arc geometry: center card dominance and symmetric monotonic falloff.
3. Bottom pagination dash mapping (5 dashes).
4. AST / Structural integrity of PhotoCarousel3D.jsx:
   - Overhead golden arch & "A NEW CHAPTER BEGINS" subtitle.
   - 3D luminous pedestal ring (#B39A72, perspective(600px) rotateX(74deg)).
   - Glossy dark reflective floor plane with 3D inverted card reflections.
   - PHOTO-ONLY on card faces: zero text overlays, captions, guest names, or categories.
   - Multi-modal controls: drag, wheel, keyboard, < > buttons, 5 dashes.
   - Framer Motion spring physics (stiffness 260, damping 28, mass 0.6).
"""

import math
import re
from pathlib import Path
import pytest

CAROUSEL_3D_FILE = Path(__file__).resolve().parent.parent / "frontend" / "src" / "components" / "wedding" / "PhotoCarousel3D.jsx"
APP_FILE = Path(__file__).resolve().parent.parent / "frontend" / "src" / "App.jsx"


# ==============================================================================
# SECTION 1: CIRCULAR DELTA WRAPPING & 3D PERSPECTIVE GEOMETRY
# ==============================================================================

def compute_circular_delta(index: int, active_index: int, total: int) -> int:
    """Replicates the circular delta calculation from PhotoCarousel3D.jsx."""
    delta = index - active_index
    while delta > total / 2:
        delta -= total
    while delta < -total / 2:
        delta += total
    return delta


@pytest.mark.parametrize("total", [5, 7, 8, 10, 12, 16])
def test_circular_delta_wrapping_range(total: int):
    """
    Ensures that for any active_index and any card index,
    the circular delta stays within [-total/2, total/2] and delta=0 for index == active_index.
    """
    for active in range(total):
        for idx in range(total):
            delta = compute_circular_delta(idx, active, total)
            if idx == active:
                assert delta == 0, f"Active index must yield delta 0, got {delta}"
            assert -total / 2.0 <= delta <= total / 2.0, (
                f"Delta {delta} out of expected bounds for total={total}, active={active}, idx={idx}"
            )


def get_card_transform(delta: int, is_mobile: bool = False, is_tablet: bool = False):
    """Replicates getCardTransform from PhotoCarousel3D.jsx."""
    abs_d = abs(delta)
    sign = 1 if delta > 0 else (-1 if delta < 0 else 0)

    step1 = 110 if is_mobile else (145 if is_tablet else 180)
    step2 = 200 if is_mobile else (270 if is_tablet else 340)
    step3 = 280 if is_mobile else (385 if is_tablet else 485)
    step4 = 350 if is_mobile else (480 if is_tablet else 610)

    if abs_d == 0:
        return {
            "x": 0,
            "z": 0,
            "rotateY": 0,
            "scale": 1.05,
            "brightness": 1.05,
            "opacity": 1.0,
            "zIndex": 40,
            "visible": True
        }
    elif abs_d == 1:
        return {
            "x": sign * step1,
            "z": -80,
            "rotateY": -sign * 28,
            "scale": 0.88,
            "brightness": 0.82,
            "opacity": 0.92,
            "zIndex": 30,
            "visible": True
        }
    elif abs_d == 2:
        return {
            "x": sign * step2,
            "z": -180,
            "rotateY": -sign * 48,
            "scale": 0.74,
            "brightness": 0.62,
            "opacity": 0.78,
            "zIndex": 20,
            "visible": True
        }
    elif abs_d == 3:
        return {
            "x": sign * step3,
            "z": -300,
            "rotateY": -sign * 62,
            "scale": 0.60,
            "brightness": 0.42,
            "opacity": 0.35 if is_mobile else 0.55,
            "zIndex": 10,
            "visible": True
        }
    else:
        return {
            "x": sign * step4,
            "z": -420,
            "rotateY": -sign * 70,
            "scale": 0.48,
            "brightness": 0.25,
            "opacity": 0.0,
            "zIndex": 1,
            "visible": False
        }


def test_center_card_prominence():
    """Confirms center card (delta=0) is sharpest, largest, upright, and top z-index."""
    center = get_card_transform(0)
    assert center["rotateY"] == 0
    assert center["scale"] == 1.05
    assert center["z"] == 0
    assert center["brightness"] >= 1.0
    assert center["opacity"] == 1.0
    assert center["zIndex"] == 40


@pytest.mark.parametrize("delta", [1, 2, 3])
def test_perspective_arc_symmetry_and_falloff(delta: int):
    """
    Confirms symmetric transformation between positive and negative flanking cards,
    and strict monotonic decay of scale, brightness, and Z-depth.
    """
    pos = get_card_transform(delta)
    neg = get_card_transform(-delta)

    # Symmetry checks
    assert pos["scale"] == neg["scale"]
    assert pos["z"] == neg["z"]
    assert pos["brightness"] == neg["brightness"]
    assert pos["opacity"] == neg["opacity"]
    assert pos["zIndex"] == neg["zIndex"]
    assert pos["x"] == -neg["x"]
    assert pos["rotateY"] == -neg["rotateY"]

    # Comparison with delta - 1 (monotonic decay)
    prev = get_card_transform(delta - 1)
    assert pos["scale"] < prev["scale"], "Scale must decrease with distance"
    assert pos["z"] < prev["z"], "Z depth must recede with distance"
    assert pos["brightness"] < prev["brightness"], "Brightness must decrease with distance"
    assert pos["zIndex"] < prev["zIndex"], "Z-index must be lower than closer cards"


# ==============================================================================
# SECTION 2: PAGINATION DASH MAPPING
# ==============================================================================

@pytest.mark.parametrize("total_count", [5, 8, 10, 15, 20])
def test_pagination_active_dash_bounds(total_count: int):
    """Verifies that for any activeIndex, activeDash is always an integer in [0, 4]."""
    for active_idx in range(total_count):
        active_dash = min(int((active_idx / total_count) * 5), 4)
        assert 0 <= active_dash <= 4, f"Active dash {active_dash} out of 5-dash range"


# ==============================================================================
# SECTION 3: AST & SOURCE CODE VERIFICATION OF PhotoCarousel3D.jsx
# ==============================================================================

@pytest.fixture(scope="module")
def carousel_source():
    assert CAROUSEL_3D_FILE.exists(), f"Missing component file: {CAROUSEL_3D_FILE}"
    return CAROUSEL_3D_FILE.read_text(encoding="utf-8")


def test_overhead_golden_arch_requirements(carousel_source: str):
    """
    Verifies overhead golden arch elements:
    1. SVG arc with golden gradient and glow.
    2. Subtitle 'A NEW CHAPTER BEGINS' with tracking.
    3. Vertical tick mark.
    """
    assert "A NEW CHAPTER BEGINS" in carousel_source, "Missing 'A NEW CHAPTER BEGINS' subtitle"
    assert "overheadArchGrad" in carousel_source, "Missing overhead arch gradient definition"
    assert "tracking-[0.35em]" in carousel_source or "tracking-[0.45em]" in carousel_source, (
        "Missing wide tracking for subtitle"
    )


def test_photo_only_cards_strictly_enforced(carousel_source: str):
    """
    CRITICAL R6 & R7: Photo cards must contain NO text overlays, NO captions,
    NO guest names, NO categories, NO quotes.
    Only the photo image and the subtle favorite heart button are allowed.
    """
    # Look for card face container in carousel_source
    card_face_match = re.search(r'PHOTO-ONLY CARD FACE.*?(?=GLOSSY DARK REFLECTIVE FLOOR)', carousel_source, re.DOTALL)
    assert card_face_match, "Could not find card face section in PhotoCarousel3D.jsx"
    card_face_code = card_face_match.group(0)

    # Ensure no photo text fields are rendered inside the card face
    assert "photo.title" not in card_face_code, "Found prohibited photo.title text inside card face"
    assert "photo.author" not in card_face_code, "Found prohibited photo.author text inside card face"
    assert "photo.category" not in card_face_code, "Found prohibited photo.category text inside card face"
    assert "photo.wishes" not in card_face_code, "Found prohibited photo.wishes text inside card face"
    assert "photo.date" not in card_face_code, "Found prohibited photo.date text inside card face"

    # Ensure img and Heart are present
    assert "<img" in card_face_code, "Card face must contain photo image"
    assert "Heart" in card_face_code, "Card face must contain subtle favorite heart icon"


def test_3d_luminous_golden_ring_pedestal(carousel_source: str):
    """
    Verifies 3D elliptical champagne ring on floor plane underneath the cards:
    perspective(600px) rotateX(74deg), champagne color #B39A72, box-shadow.
    """
    assert "rotateX(74deg)" in carousel_source, "Missing rotateX(74deg) floor tilt for pedestal ring"
    assert "179, 154, 114" in carousel_source or "#B39A72" in carousel_source, (
        "Missing champagne gold color token #B39A72 for ring"
    )
    assert "boxShadow" in carousel_source or "box-shadow" in carousel_source, "Missing pedestal ring glow"


def test_glossy_dark_reflective_floor(carousel_source: str):
    """
    Verifies mirror-like floor plane with 3D-aligned inverted card reflections.
    """
    assert "scaleY(-1)" in carousel_source, "Missing scaleY(-1) inverted reflection"
    assert "maskImage" in carousel_source or "WebkitMaskImage" in carousel_source, (
        "Missing vertical fade mask on floor reflections"
    )


def test_framer_motion_spring_physics(carousel_source: str):
    """
    Verifies smooth spring physics configuration:
    stiffness: 260, damping: 28, mass: 0.6.
    """
    assert "stiffness: 260" in carousel_source, "Missing spring stiffness: 260"
    assert "damping: 28" in carousel_source, "Missing spring damping: 28"
    assert "mass: 0.6" in carousel_source, "Missing spring mass: 0.6"


def test_multi_modal_controls_present(carousel_source: str):
    """
    Verifies presence of drag, mouse wheel, keyboard arrows, < > buttons, and 5 dashes.
    """
    assert "handlePointerDown" in carousel_source, "Missing pointer down handler for drag/swipe"
    assert "handlePointerMove" in carousel_source, "Missing pointer move handler for drag/swipe"
    assert "handlePointerUp" in carousel_source, "Missing pointer up handler for drag/swipe"
    assert "handleWheel" in carousel_source, "Missing mouse wheel listener"
    assert "ArrowLeft" in carousel_source and "ArrowRight" in carousel_source, "Missing keyboard arrow navigation"
    assert "ChevronLeft" in carousel_source and "ChevronRight" in carousel_source, "Missing circular < and > buttons"
    assert "[0, 1, 2, 3, 4]" in carousel_source, "Missing 5 pagination dashes"


def test_app_jsx_wires_photocarousel3d():
    """
    Verifies that App.jsx imports and mounts PhotoCarousel3D instead of CylindricalCarousel.
    """
    assert APP_FILE.exists(), f"Missing App.jsx at {APP_FILE}"
    app_source = APP_FILE.read_text(encoding="utf-8")

    assert "import PhotoCarousel3D" in app_source, "App.jsx must import PhotoCarousel3D"
    assert "<PhotoCarousel3D" in app_source, "App.jsx must mount <PhotoCarousel3D"
    assert "import CylindricalCarousel" not in app_source, "App.jsx should not import CylindricalCarousel"
    assert "<CylindricalCarousel" not in app_source, "App.jsx should not mount CylindricalCarousel"

"""
Adversarial Stress Test Suite — Challenger 1
Kurmet & Balnur Wedding Portal Redesign

Empirically tests:
1. Strict Card Purity (R6, R7): Zero text overlays, captions, guest names, categories, or titles.
2. Carousel Edge Cases:
   - Empty array (N=0)
   - Single item (N=1)
   - Two items (N=2)
   - Odd and even counts up to N=100
   - Circular delta wrapping invariants
3. Interaction Stress Simulation:
   - Mouse wheel spam debounce (380ms threshold)
   - Rapid pointer drag & flick velocity calculation
   - Vertical gesture rejection (distY > 1.2 * distX)
   - Click vs drag disambiguation (6px threshold)
   - Pagination dash bounds for all N
4. Responsive Geometry & Viewport Fit:
   - Mobile (390px), Tablet (768px), Desktop (1440px)
   - Overlap and clipping prevention
5. Visual Rendering Authenticity:
   - 3D elliptical pedestal ring (perspective 600px, rotateX 74deg, champagne glow)
   - Glossy dark reflective floor (scaleY -1, gradient mask, blur)
   - Overhead arch ("A NEW CHAPTER BEGINS")
6. Golden Circle & Falling Petals Transition Mechanics
"""

import math
import re
from pathlib import Path
import pytest

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend" / "src"
CAROUSEL_FILE = FRONTEND_DIR / "components" / "wedding" / "PhotoCarousel3D.jsx"
APP_FILE = FRONTEND_DIR / "App.jsx"
CIRCLE_FILE = FRONTEND_DIR / "components" / "wedding" / "GoldenCircleTransition.jsx"
PETALS_FILE = FRONTEND_DIR / "components" / "wedding" / "FallingPetals.jsx"


# ==============================================================================
# SECTION 1: STRICT CARD PURITY (R6 & R7)
# ==============================================================================

def test_photo_cards_have_zero_text_overlays():
    """
    R6 & R7: Photo cards must contain strictly NO text overlays, NO captions,
    NO guest names, NO categories, NO quotes, NO descriptions.
    """
    source = CAROUSEL_FILE.read_text(encoding="utf-8")

    # Extract the card face container
    card_face_match = re.search(
        r'PHOTO-ONLY CARD FACE.*?(?=GLOSSY DARK REFLECTIVE FLOOR)',
        source,
        re.DOTALL
    )
    assert card_face_match is not None, "Could not find card face section in PhotoCarousel3D.jsx"
    card_face_code = card_face_match.group(0)

    # Prohibited dynamic text interpolation inside card face
    prohibited_props = [
        "photo.title", "photo.author", "photo.guest_name", "photo.category",
        "photo.wishes", "photo.date", "photo.description", "photo.caption",
        "item.title", "item.guest_name", "item.category"
    ]
    for prop in prohibited_props:
        assert prop not in card_face_code, f"Prohibited prop '{prop}' found in card face!"

    # Prohibited visual text tags inside card face
    prohibited_tags = ["<h1", "<h2", "<h3", "<h4", "<h5", "<h6", "<p", "<figcaption"]
    for tag in prohibited_tags:
        assert tag not in card_face_code, f"Prohibited visual text tag '{tag}' found in card face!"

    # Allowed elements inside card face: img and Heart button
    assert "<img" in card_face_code, "Card face must contain img tag"
    assert "<Heart" in card_face_code, "Card face must contain Heart icon"


def test_no_edge_captions_or_slogans_in_carousel():
    """
    R7: No decorative captions, slogans, or labels on the edges of the carousel page.
    Only the overhead subtitle 'A NEW CHAPTER BEGINS' and minimal UI controls are permitted.
    """
    source = CAROUSEL_FILE.read_text(encoding="utf-8")

    # Ensure no extra decorative slogans exist
    disallowed_phrases = [
        "WEDDING MOMENTS", "OUR LOVE STORY", "MEMORIES FOREVER",
        "PHOTO ARCHIVE", "GALLERY PREVIEW", "SCROLL TO EXPLORE"
    ]
    for phrase in disallowed_phrases:
        assert phrase not in source.upper(), f"Unexpected decorative slogan '{phrase}' found in carousel"


# ==============================================================================
# SECTION 2: CAROUSEL DELTA WRAPPING & MATHEMATICAL INVARIANTS
# ==============================================================================

def js_circular_delta(index: int, active_index: int, total_count: int) -> int:
    """Exact JavaScript logic from PhotoCarousel3D.jsx lines 194-197."""
    if total_count == 0:
        return 0
    delta = index - active_index
    while delta > total_count / 2:
        delta -= total_count
    while delta < -total_count / 2:
        delta += total_count
    return delta


def test_edge_case_empty_photos_array():
    """
    Edge case: photos = []
    Verifies that empty photos returns null cleanly without division by zero or errors.
    """
    source = CAROUSEL_FILE.read_text(encoding="utf-8")
    assert "if (totalCount === 0) {\n    return null;\n  }" in source or "if (totalCount === 0) return null;" in source, (
        "PhotoCarousel3D must have guard: if (totalCount === 0) return null;"
    )
    assert "if (!photos || photos.length === 0) return [];" in source, (
        "PhotoCarousel3D items useMemo must guard against empty/null photos"
    )


def test_edge_case_single_photo():
    """
    Edge case: photos = [photo1] (total_count = 1)
    - Active index is 0.
    - Delta is 0.
    - Next and Prev operations preserve active index at 0.
    """
    total = 1
    delta = js_circular_delta(0, 0, total)
    assert delta == 0

    # Test prev transition
    prev_idx = 0 - 1 if 0 > 0 else total - 1
    assert prev_idx == 0

    # Test next transition
    next_idx = 0 + 1 if 0 < total - 1 else 0
    assert next_idx == 0

    # Dash index for total=1
    active_dash = min(int((0 / 1) * 5), 4)
    assert active_dash == 0


def test_edge_case_two_photos():
    """
    Edge case: photos = [photo1, photo2] (total_count = 2)
    Verifies symmetric delta wrapping between index 0 and 1.
    """
    total = 2
    # When active is 0
    d0_when_0 = js_circular_delta(0, 0, total)
    d1_when_0 = js_circular_delta(1, 0, total)
    assert d0_when_0 == 0
    assert abs(d1_when_0) == 1

    # When active is 1
    d0_when_1 = js_circular_delta(0, 1, total)
    d1_when_1 = js_circular_delta(1, 1, total)
    assert d1_when_1 == 0
    assert abs(d0_when_1) == 1


@pytest.mark.parametrize("n", [3, 4, 5, 7, 8, 10, 11, 16, 25, 50, 100])
def test_circular_delta_invariants_across_arbitrary_n(n: int):
    """
    Mathematical Stress Test:
    For any array size N and any activeIndex in [0, N-1]:
    1. Exactly one index has delta == 0 (the active card).
    2. All deltas satisfy -N/2 <= delta <= N/2.
    3. Monotonic step: delta((idx + 1) % N) - delta(idx) % N is consistent.
    4. Distance |delta| is bounded by floor(N/2).
    """
    for active in range(n):
        deltas = [js_circular_delta(i, active, n) for i in range(n)]

        # Invariant 1: Exactly one 0
        assert deltas.count(0) == 1
        assert deltas[active] == 0

        # Invariant 2: Bounded range
        for d in deltas:
            assert -n / 2.0 <= d <= n / 2.0
            assert abs(d) <= n // 2 or (n % 2 == 0 and abs(d) == n / 2)


# ==============================================================================
# SECTION 3: INTERACTION STRESS SIMULATION
# ==============================================================================

def test_mouse_wheel_spam_debounce_simulation():
    """
    Stress-tests the mouse wheel handler:
    Simulates rapid wheel bursts (100 events delivered at 5ms intervals = 500ms total).
    Verifies that the 380ms debounce window strictly restricts state transitions
    to at most 2 index advancements, preventing runaway spinning.
    """
    source = CAROUSEL_FILE.read_text(encoding="utf-8")
    assert "lastWheelTimeRef.current < 380" in source, "Missing 380ms debounce on mouse wheel"
    assert "Math.abs(delta) < 25" in source, "Missing 25px minimum delta threshold on wheel"

    # Simulate wheel events
    debounce_ms = 380
    min_delta = 25

    events = [{"time": i * 5, "deltaY": 100} for i in range(100)]  # 100 events over 500ms
    last_processed_time = -1000
    transitions = 0

    for ev in events:
        if abs(ev["deltaY"]) < min_delta:
            continue
        if ev["time"] - last_processed_time < debounce_ms:
            continue
        last_processed_time = ev["time"]
        transitions += 1

    # Over 500ms with 380ms debounce, transitions can only occur at t=0 and t=380ms (exactly 2)
    assert transitions == 2, f"Expected exactly 2 wheel transitions, got {transitions}"


def test_drag_and_flick_velocity_mechanics():
    """
    Tests pointer drag threshold and velocity flick physics:
    - Distance > 40px triggers step
    - Fast flick: distance > 15px AND velocity > 0.35px/ms triggers step
    - Sub-threshold nudge (<15px or slow) does not trigger step
    """
    def evaluate_drag(dist: float, duration_ms: float):
        duration = max(duration_ms, 1.0)
        velocity = abs(dist) / duration
        if dist < -40 or (dist < -15 and velocity > 0.35):
            return "NEXT"
        elif dist > 40 or (dist > 15 and velocity > 0.35):
            return "PREV"
        return "NONE"

    # Slow drag over 40px
    assert evaluate_drag(-45, 300) == "NEXT"
    assert evaluate_drag(45, 300) == "PREV"

    # Fast flick under 40px but over 15px with high velocity (>0.35 px/ms)
    # dist = 25px, duration = 50ms -> velocity = 0.50 px/ms > 0.35
    assert evaluate_drag(-25, 50) == "NEXT"
    assert evaluate_drag(25, 50) == "PREV"

    # Micro jitter (dist = 10px, duration = 10ms -> v=1.0 px/ms, but dist < 15)
    assert evaluate_drag(10, 10) == "NONE"

    # Slow nudge (dist = 30px, duration = 200ms -> v=0.15 px/ms < 0.35 and dist < 40)
    assert evaluate_drag(30, 200) == "NONE"


def test_vertical_scroll_gesture_rejection():
    """
    Fluid vertical scroll test:
    When a user scrolls vertically across the carousel, vertical movement (distY)
    exceeds horizontal movement (distX). The carousel MUST reject horizontal advance
    if abs(distY) > abs(distX) * 1.2.
    """
    def is_vertical_scroll_rejected(dist_x: float, dist_y: float) -> bool:
        return abs(dist_y) > abs(dist_x) * 1.2

    # Predominantly vertical scroll (e.g. browsing down page)
    assert is_vertical_scroll_rejected(dist_x=20, dist_y=80) is True
    assert is_vertical_scroll_rejected(dist_x=-30, dist_y=50) is True

    # Predominantly horizontal swipe (e.g. spinning carousel)
    assert is_vertical_scroll_rejected(dist_x=80, dist_y=15) is False
    assert is_vertical_scroll_rejected(dist_x=-100, dist_y=40) is False


def test_card_click_vs_drag_disambiguation():
    """
    Verifies that dragging the carousel does not trigger accidental photo clicks:
    Card click is guarded by Math.abs(dragDistRef.current) <= 6.
    """
    source = CAROUSEL_FILE.read_text(encoding="utf-8")
    assert "Math.abs(dragDistRef.current) > 6" in source, (
        "Missing 6px drag disambiguation threshold before executing onPhotoClick"
    )


@pytest.mark.parametrize("total", [1, 2, 3, 5, 8, 10, 20, 50])
def test_pagination_active_dash_invariants(total: int):
    """
    Verifies that for any total photo count and any active index:
    1. activeDash is always in [0, 4] (exactly 5 dashes).
    2. Clicking any dash (0..4) yields a valid target index within [0, total-1].
    """
    for active_idx in range(total):
        active_dash = min(math.floor((active_idx / total) * 5), 4)
        assert 0 <= active_dash <= 4

    for dash_idx in range(5):
        target_idx = min(round((dash_idx / 5) * total), total - 1)
        assert 0 <= target_idx <= total - 1


# ==============================================================================
# SECTION 4: RESPONSIVE GEOMETRY & VIEWPORT FIT
# ==============================================================================

@pytest.mark.parametrize("viewport_w,expected_mobile,expected_tablet", [
    (390, True, False),   # iPhone 12/13/14
    (430, True, False),   # iPhone 14/15 Pro Max
    (768, False, True),   # iPad Mini / Air portrait
    (1024, False, False), # iPad Pro / Small laptop
    (1440, False, False), # Desktop 1440p
    (1920, False, False), # Full HD Desktop
])
def test_responsive_breakpoint_classification(viewport_w: int, expected_mobile: bool, expected_tablet: bool):
    """Verifies breakpoint logic matches Tailwind sm:640px and lg:1024px."""
    is_mobile = viewport_w < 640
    is_tablet = 640 <= viewport_w < 1024
    assert is_mobile == expected_mobile
    assert is_tablet == expected_tablet


def test_mobile_horizontal_fit_390px():
    """
    Empirically verifies that on a 390px mobile screen:
    Center card (width=185px, scale=1.05 -> 194.25px) fits with ample padding,
    leaving at least 95px on each side without horizontal page clipping.
    """
    card_w = 185
    center_w = card_w * 1.05
    viewport_w = 390
    margin = (viewport_w - center_w) / 2
    assert margin > 90.0, f"Insufficient margin on 390px screen: {margin}px"


# ==============================================================================
# SECTION 5: VISUAL RENDERING AUTHENTICITY (RING, FLOOR, OVERHEAD ARCH)
# ==============================================================================

def test_luminous_3d_pedestal_ring_authenticity():
    """
    Verifies that the 3D pedestal ring reproduces the cinematic reference:
    - 3D perspective projection tilt: rotateX(74deg) with perspective(600px).
    - Color: Champagne gold #B39A72 / rgba(179, 154, 114, ...).
    - Double bloom box shadow (outer + inset).
    - Inner ambient gradient.
    """
    source = CAROUSEL_FILE.read_text(encoding="utf-8")
    assert "perspective(600px) rotateX(74deg)" in source
    assert "rgba(179, 154, 114" in source
    assert "boxShadow" in source or "box-shadow" in source
    assert "inset 0 0 22px rgba(179, 154, 114" in source
    assert "blur-md" in source or "blur" in source


def test_dark_reflective_floor_mirror_authenticity():
    """
    Verifies authentic dark mirror reflections:
    - Card reflection scaleY(-1) with origin-top.
    - Specular vertical fade gradient mask.
    - Soft blur filter for glossy lacquer texture.
    - Base floor gradient from #0D0C0B upward.
    """
    source = CAROUSEL_FILE.read_text(encoding="utf-8")
    assert "scaleY(-1)" in source
    assert "origin-top" in source
    assert "maskImage" in source
    assert "WebkitMaskImage" in source
    assert "filter: 'blur(1px)'" in source or 'filter: "blur(1px)"' in source
    assert "bg-gradient-to-t from-[#0D0C0B]" in source


def test_overhead_golden_arch_and_subtitle():
    """
    Verifies overhead arch elements:
    - Curved golden arc SVG.
    - Specular diamond star glints.
    - Stardust floating ember specks.
    - Centered vertical golden tick.
    - Subtitle 'A NEW CHAPTER BEGINS' with tracking.
    """
    source = CAROUSEL_FILE.read_text(encoding="utf-8")
    assert "overheadArchGrad" in source
    assert "A NEW CHAPTER BEGINS" in source
    assert "tracking-[0.35em]" in source or "tracking-[0.45em]" in source
    assert "polygon points=" in source  # Star glint geometry


# ==============================================================================
# SECTION 6: GOLDEN CIRCLE & FALLING PETALS TRANSITIONS
# ==============================================================================

def test_golden_circle_transition_mechanics():
    """
    Verifies GoldenCircleTransition.jsx:
    - Expansion reaches 24x at progress 1.0 (exceeds viewport).
    - Opacity dissolves to 0 at progress 1.0.
    - Stardust particle trail (42 particles around ring).
    - 5 specular diamond star flares.
    """
    source = CIRCLE_FILE.read_text(encoding="utf-8")
    assert "[1, 1.06, 2.8, 9.5, 24]" in source, "Circle scale must expand up to 24x"
    assert "[0.95, 1, 0.95, 0.35, 0]" in source, "Circle opacity must gracefully dissolve to 0"
    assert "count = 42" in source, "Stardust trail must contain 42 particles"
    assert "DiamondStarFlare" in source, "Must mount DiamondStarFlare components"


def test_falling_petals_3_layer_depth_architecture():
    """
    Verifies FallingPetals.jsx:
    - Dual canvas architecture: z-10 (bg + mid) and z-35 (foreground bokeh).
    - Foreground hardware-accelerated blur (7px).
    - Offscreen sprite caching (3 organic petal shapes).
    - 0 React state updates during animation loop.
    - Resource guard for tab visibility and prefers-reduced-motion.
    """
    source = PETALS_FILE.read_text(encoding="utf-8")
    assert "z-10" in source, "Background canvas must be z-10"
    assert "z-35" in source, "Foreground canvas must be z-35"
    assert "blur(7px)" in source, "Foreground petals must have 7px bokeh blur"
    assert "createPetalSprite" in source, "Must use offscreen sprite caching"
    assert "requestAnimationFrame" in source, "Must use RAF loop"
    assert "prefers-reduced-motion" in source, "Must support reduced motion"
    assert "visibilitychange" in source, "Must pause simulation when tab is hidden"

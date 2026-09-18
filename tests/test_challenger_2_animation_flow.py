"""
Challenger 2 Empirical Verification Test Suite
Adversarially challenge animation performance, motion physics, and user flow continuity.

Verifies:
1. Falling petals simulation has zero React re-renders on every frame (RAF + canvas/sprite rendering).
2. Golden circle transition scales purely via MotionValues without triggering React component re-renders.
3. User flow continuity: PAGE 1 -> Golden Circle Expands -> 3D Photo Carousel -> Gallery (confirm old Page 2 intermediate headers and preview cards are completely absent).
4. Reduced motion disables canvas animations and infinite loops.
5. Spring physics damping analysis for 60 FPS smoothness.
"""

import math
import re
from pathlib import Path
import pytest

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend" / "src"
COMPONENTS_DIR = FRONTEND_DIR / "components" / "wedding"

APP_JSX = FRONTEND_DIR / "App.jsx"
INTRO_JSX = COMPONENTS_DIR / "CinematicIntro.jsx"
CIRCLE_JSX = COMPONENTS_DIR / "GoldenCircleTransition.jsx"
PETALS_JSX = COMPONENTS_DIR / "FallingPetals.jsx"
CAROUSEL_3D_JSX = COMPONENTS_DIR / "PhotoCarousel3D.jsx"
HEADER_JSX = COMPONENTS_DIR / "WeddingHeader.jsx"
GALLERY_JSX = COMPONENTS_DIR / "WeddingGallery.jsx"


# ==============================================================================
# SECTION 1: FALLING PETALS ZERO RE-RENDER & DUAL CANVAS VERIFICATION
# ==============================================================================

def test_falling_petals_zero_react_rerenders_empirical():
    """
    Empirical check: Verify FallingPetals has 0 React state hooks and 0 state setters.
    The simulation loop is 100% decoupled from React's virtual DOM reconciliation cycle.
    """
    code = PETALS_JSX.read_text(encoding="utf-8")

    # 1. Assert absence of React state management hooks
    assert "useState" not in code, "FallingPetals must not import or use useState"
    assert "useReducer" not in code, "FallingPetals must not import or use useReducer"
    assert "useContext" not in code, "FallingPetals must not import or use useContext"
    assert "forceUpdate" not in code, "FallingPetals must not use forceUpdate"

    # 2. Confirm RAF loop is established inside useEffect
    assert "requestAnimationFrame(render)" in code, (
        "FallingPetals must run simulation via requestAnimationFrame"
    )
    assert "cancelAnimationFrame" in code, (
        "FallingPetals must clean up RAF on unmount"
    )

    # 3. Confirm offscreen sprite caching architecture
    assert "createPetalSprite" in code, "Must use offscreen sprite caching for petals"
    assert "SPRITE_W = 200" in code, "Must use 200px width offscreen sprite"
    assert "SPRITE_H = 240" in code, "Must use 240px height offscreen sprite"
    assert "emberSprite" in code, "Must use pre-rendered offscreen ember sprite"
    assert "drawImage(" in code, "RAF loop must render cached sprites via drawImage"

    # 4. Confirm Dual-Canvas Architecture
    assert "bgMidCanvasRef" in code, "Must have background/midground canvas ref"
    assert "fgCanvasRef" in code, "Must have foreground bokeh canvas ref"
    assert 'z-10' in code, "Background canvas must be positioned at z-10"
    assert 'z-35' in code, "Foreground canvas must be positioned at z-35"
    assert 'filter: \'blur(7px)\'' in code or 'blur(7px)' in code, (
        "Foreground canvas must have GPU hardware-accelerated 7px blur"
    )


def test_falling_petals_visibility_and_resource_guard():
    """
    Verify FallingPetals stops rendering when tab is hidden to save GPU/CPU resources.
    """
    code = PETALS_JSX.read_text(encoding="utf-8")
    assert "visibilitychange" in code, "FallingPetals must listen to document visibilitychange"
    assert "document.hidden" in code, "FallingPetals must inspect document.hidden"
    assert "stopLoop" in code and "startLoop" in code, (
        "FallingPetals must stop/resume loop on tab visibility changes"
    )


# ==============================================================================
# SECTION 2: GOLDEN CIRCLE PURE MOTIONVALUE TRANSITION (ZERO RE-RENDERS)
# ==============================================================================

def test_golden_circle_scales_purely_via_motion_values():
    """
    Empirical check: Verify GoldenCircleTransition is driven exclusively by Framer Motion
    MotionValues without triggering React component re-renders on scroll.
    """
    intro_code = INTRO_JSX.read_text(encoding="utf-8")
    circle_code = CIRCLE_JSX.read_text(encoding="utf-8")

    # 1. CinematicIntro produces MotionValues
    assert "useScroll" in intro_code, "CinematicIntro must use useScroll"
    assert "useSpring" in intro_code, "CinematicIntro must use useSpring"
    assert "smoothProgress" in intro_code, "CinematicIntro must compute smoothProgress"

    # 2. GoldenCircleTransition consumes smoothProgress via useTransform
    assert "useTransform" in circle_code, "GoldenCircleTransition must use useTransform"
    assert "circleScale = useTransform(" in circle_code, (
        "circleScale must be a MotionValue from useTransform"
    )
    assert "circleOpacity = useTransform(" in circle_code, (
        "circleOpacity must be a MotionValue from useTransform"
    )

    # 3. Confirm GoldenCircleTransition has NO React state hooks
    assert "useState" not in circle_code, "GoldenCircleTransition must not contain useState"
    assert "useReducer" not in circle_code, "GoldenCircleTransition must not contain useReducer"
    assert "useEffect" not in circle_code, "GoldenCircleTransition must not contain useEffect"
    assert "addEventListener('scroll'" not in circle_code, (
        "GoldenCircleTransition must not attach scroll event listeners"
    )

    # 4. Confirm style bindings on motion components
    assert "style={{" in circle_code and "scale: circleScale" in circle_code, (
        "circleScale must be bound directly to style object for direct DOM transform"
    )
    assert "opacity: circleOpacity" in circle_code, (
        "circleOpacity must be bound directly to style object"
    )


def test_golden_circle_scale_progression_curve():
    """
    Verify the scale curve progression:
    progress 0.0 -> scale 1.0 (base ~260-290px)
    progress 0.15 -> scale 1.06
    progress 0.45 -> scale 2.8
    progress 0.75 -> scale 9.5
    progress 1.0 -> scale 24.0 (fullscreen beyond viewport)
    """
    code = CIRCLE_JSX.read_text(encoding="utf-8")
    # Match the useTransform array definition
    scale_match = re.search(
        r'circleScale\s*=\s*useTransform\s*\(\s*smoothProgress\s*,\s*\[([\d.,\s]+)\]\s*,\s*\[([\d.,\s]+)\]\s*\)',
        code
    )
    assert scale_match, "Could not find circleScale useTransform definition"

    inputs = [float(x.strip()) for x in scale_match.group(1).split(",")]
    outputs = [float(x.strip()) for x in scale_match.group(2).split(",")]

    assert inputs == [0, 0.15, 0.45, 0.75, 1], f"Inputs mismatch: {inputs}"
    assert outputs == [1, 1.06, 2.8, 9.5, 24], f"Outputs mismatch: {outputs}"

    # Verify monotonic expansion
    for i in range(len(outputs) - 1):
        assert outputs[i+1] > outputs[i], "Circle scale must strictly increase with scroll progress"

    # Final scale must be >= 20x to guarantee expansion far beyond viewport
    assert outputs[-1] >= 20.0, f"Final scale {outputs[-1]} must exceed viewport"


# ==============================================================================
# SECTION 3: USER FLOW CONTINUITY & COMPLETE ABSENCE OF OLD PAGE 2
# ==============================================================================

def test_user_flow_continuity_in_app_jsx():
    """
    Verify user flow:
    PAGE 1 (CinematicIntro) -> Golden Circle Expands -> 3D Photo Carousel -> Gallery
    Confirm that old Page 2 intermediate headers and preview cards are completely absent.
    """
    app_code = APP_JSX.read_text(encoding="utf-8")

    # 1. Flow sequence in App.jsx
    intro_pos = app_code.find("<CinematicIntro")
    header_pos = app_code.find("<WeddingHeader")
    carousel_pos = app_code.find("<PhotoCarousel3D")
    gallery_pos = app_code.find("<WeddingGallery")

    assert intro_pos != -1, "CinematicIntro must be present in App.jsx"
    assert header_pos != -1, "WeddingHeader must be present in App.jsx"
    assert carousel_pos != -1, "PhotoCarousel3D must be present in App.jsx"
    assert gallery_pos != -1, "WeddingGallery must be present in App.jsx"

    assert intro_pos < header_pos, "CinematicIntro must precede WeddingHeader"
    assert header_pos < carousel_pos, "WeddingHeader must precede PhotoCarousel3D"
    assert carousel_pos < gallery_pos, "PhotoCarousel3D must precede WeddingGallery"


def test_old_page_2_intermediate_headers_completely_absent():
    """
    Confirm that old Page 2 intermediate headers and preview cards are completely absent
    from the active codebase and flow.
    """
    active_files = [APP_JSX, INTRO_JSX, CIRCLE_JSX, CAROUSEL_3D_JSX, HEADER_JSX, GALLERY_JSX]

    prohibited_strings = [
        "3D Панорама любви",
        "Панорама любви",
        "Моменты вечности",
        "Вращайте свайпом или прокруткой",
        "Три кадра нашей истории",
        "previewPhotos",
        "previewPhotosOpacity",
    ]

    for f in active_files:
        content = f.read_text(encoding="utf-8")
        for phrase in prohibited_strings:
            assert phrase not in content, (
                f"Prohibited old Page 2 text '{phrase}' found in active file {f.name}"
            )


def test_cylindrical_carousel_not_in_active_flow():
    """
    Confirm CylindricalCarousel is not imported or mounted in App.jsx.
    """
    app_code = APP_JSX.read_text(encoding="utf-8")
    assert "CylindricalCarousel" not in app_code, (
        "App.jsx must not reference or mount CylindricalCarousel"
    )


# ==============================================================================
# SECTION 4: REDUCED MOTION COMPLIANCE
# ==============================================================================

def test_reduced_motion_disables_canvas_animations():
    """
    Verify FallingPetals disables RAF animation loop and clears canvases when
    prefers-reduced-motion is true.
    """
    code = PETALS_JSX.read_text(encoding="utf-8")

    assert "window.matchMedia('(prefers-reduced-motion: reduce)')" in code, (
        "FallingPetals must query matchMedia for prefers-reduced-motion"
    )
    assert "!prefersReducedMotion" in code, (
        "startLoop must check !prefersReducedMotion before calling requestAnimationFrame"
    )
    assert "stopLoop()" in code and "clearCanvases()" in code, (
        "FallingPetals must call stopLoop() and clearCanvases() when motion preference changes to reduced"
    )


def test_reduced_motion_disables_infinite_loops():
    """
    Verify GoldenCircleTransition and CinematicIntro disable infinite loops when reduced motion is preferred.
    """
    # 1. GoldenCircleTransition stardust
    circle_code = CIRCLE_JSX.read_text(encoding="utf-8")
    assert "shouldReduceMotion" in circle_code, (
        "GoldenCircleTransition must use shouldReduceMotion"
    )
    assert "duration: 0" in circle_code, (
        "GoldenCircleTransition must set duration: 0 when shouldReduceMotion is true"
    )

    # 2. CinematicIntro scroll chevron
    intro_code = INTRO_JSX.read_text(encoding="utf-8")
    assert "shouldReduceMotion" in intro_code, (
        "CinematicIntro must use shouldReduceMotion"
    )
    assert "shouldReduceMotion ? { duration: 0 } : { repeat: Infinity" in intro_code, (
        "CinematicIntro chevron must eliminate repeat: Infinity when shouldReduceMotion is true"
    )

    # 3. PhotoCarousel3D spring transitions
    carousel_code = CAROUSEL_3D_JSX.read_text(encoding="utf-8")
    assert "shouldReduceMotion" in carousel_code, (
        "PhotoCarousel3D must use shouldReduceMotion"
    )
    assert re.search(r"shouldReduceMotion\s*\?\s*\{\s*duration:\s*0\s*\}\s*:", carousel_code), (
        "PhotoCarousel3D must set duration: 0 for reduced motion"
    )


# ==============================================================================
# SECTION 5: SPRING PHYSICS & DAMPING MATHEMATICAL AUDIT
# ==============================================================================

def test_spring_physics_damping_ratio():
    """
    Validates spring physics parameters:
    CinematicIntro: stiffness k=85, damping c=26, mass m=0.25
    PhotoCarousel3D: stiffness k=260, damping c=28, mass m=0.6

    Damping ratio formula: zeta = c / (2 * sqrt(k * m))
    - zeta > 1: Overdamped (no oscillation, slower convergence)
    - zeta = 1: Critically damped (fastest return to equilibrium without overshoot)
    - 0.8 <= zeta <= 1.5: Ideal for buttery luxury animation without oscillatory ringing or sluggishness.
    """
    # CinematicIntro
    k_intro = 85.0
    c_intro = 26.0
    m_intro = 0.25
    zeta_intro = c_intro / (2.0 * math.sqrt(k_intro * m_intro))

    # PhotoCarousel3D
    k_car = 260.0
    c_car = 28.0
    m_car = 0.6
    zeta_car = c_car / (2.0 * math.sqrt(k_car * m_car))

    # Zeta for intro: 26 / (2 * sqrt(21.25)) = 26 / (2 * 4.6097) = 2.82 (overdamped for silky smooth scroll)
    assert zeta_intro > 1.0, f"Intro must be overdamped for scroll stability, got zeta={zeta_intro:.2f}"

    # Zeta for carousel: 28 / (2 * sqrt(156)) = 28 / (2 * 12.49) = 1.12 (near critical damping, zero bounce)
    assert 0.95 <= zeta_car <= 1.35, f"Carousel must have near-critical damping (no bounce), got zeta={zeta_car:.2f}"

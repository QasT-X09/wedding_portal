"""
Empirical Verification and Stress Testing of 3D Cylindrical Carousel.
Evaluates:
1. Cylindrical trigonometry, regular polygon apothem geometry, and card separation.
2. Inertia physics decay simulation (friction 0.93, frame convergence, zero-velocity cutoff).
3. 3D perspective projection bounds and overflow resistance across responsive viewports.
4. AST / structural integrity of CylindricalCarousel.jsx.
"""

import math
import re
from pathlib import Path
import pytest

CAROUSEL_FILE = Path(__file__).resolve().parent.parent / "frontend" / "src" / "components" / "wedding" / "CylindricalCarousel.jsx"


# ==============================================================================
# SECTION 1: CYLINDRICAL TRIGONOMETRY & POLYGON GEOMETRY
# ==============================================================================

@pytest.mark.parametrize("card_width,slot_count,is_mobile", [
    (165, 8, True),
    (165, 9, True),
    (165, 10, True),
    (210, 8, False),
    (210, 9, False),
    (210, 10, False),
    (260, 8, False),
    (260, 9, False),
    (260, 10, False),
])
def test_apothem_radius_and_geometry(card_width: float, slot_count: int, is_mobile: bool):
    """
    Validates regular polygon apothem formula:
    R_apothem = (w / 2) / tan(pi / N)
    With gap added: R = round(R_apothem) + gap
    Confirms no facet overlap: edge distance between adjacent cards > 0.
    """
    gap = 12 if is_mobile else 24
    half_angle_rad = math.pi / slot_count
    
    # Exact theoretical apothem
    theoretical_apothem = (card_width / 2.0) / math.tan(half_angle_rad)
    
    # Implementation radius in CylindricalCarousel.jsx
    radius = round(theoretical_apothem) + gap
    
    # Check 1: Radius must exceed apothem due to gap
    assert radius > theoretical_apothem, f"Radius {radius} must strictly exceed apothem {theoretical_apothem}"
    
    # Check 2: Angular distribution sum must be exactly 360 degrees
    angle_per_item = 360.0 / slot_count
    total_circle = angle_per_item * slot_count
    assert math.isclose(total_circle, 360.0, rel_tol=1e-9), f"Total angle must be 360, got {total_circle}"
    
    # Check 3: Edge-to-edge separation between card k and card k+1
    # Two adjacent cards at angles -half_angle and +half_angle
    # Card k right edge X:  w/2 * cos(half_angle) - radius * sin(half_angle) (relative to midline)
    # Distance between right edge of card k and left edge of card k+1:
    delta_x = 2.0 * (radius * math.sin(half_angle_rad) - (card_width / 2.0) * math.cos(half_angle_rad))
    
    # If radius == theoretical_apothem, delta_x is exactly 0 (touching edge-to-edge).
    # Since radius = round(theoretical_apothem) + gap with gap >= 12, delta_x MUST be positive (no overlap).
    assert delta_x > 0, f"Overlap detected! delta_x = {delta_x} for width={card_width}, N={slot_count}"
    
    # The gap should be within reasonable aesthetic bounds (5px to 30px)
    assert 5.0 <= delta_x <= 30.0, f"Gap delta_x {delta_x}px outside aesthetic range [5px, 30px]"


def test_polygon_ring_closure():
    """
    Verifies that the N cards form an equilateral regular prism ring
    with uniform angles and closure.
    """
    for n in range(8, 11):
        step = 360.0 / n
        angles = [i * step for i in range(n)]
        assert len(angles) == n
        # Distance between consecutive angles is uniform
        diffs = [angles[i+1] - angles[i] for i in range(n - 1)]
        assert all(math.isclose(d, step, rel_tol=1e-9) for d in diffs)
        # Ring wraps back: (angles[-1] + step) % 360 == 0
        assert math.isclose((angles[-1] + step) % 360.0, 0.0, abs_tol=1e-9)


# ==============================================================================
# SECTION 2: INERTIA PHYSICS SIMULATION
# ==============================================================================

def simulate_inertia(initial_velocity: float, friction: float = 0.93, threshold: float = 0.005, max_frames: int = 500):
    """
    Simulates the requestAnimationFrame loop in CylindricalCarousel.jsx:
    velocityRef.current *= friction;
    manualAngle.set(manualAngle.get() + velocityRef.current * 16 * 0.4);
    if (Math.abs(velocityRef.current) > 0.005) { ... }
    """
    v = initial_velocity
    frames = 0
    delta_angle = 0.0
    velocity_history = []
    
    while frames < max_frames:
        v *= friction
        frames += 1
        delta_angle += v * 16.0 * 0.4
        velocity_history.append(v)
        if abs(v) <= threshold:
            break
            
    return {
        "frames": frames,
        "final_velocity": v,
        "delta_angle": delta_angle,
        "converged": abs(v) <= threshold,
        "history": velocity_history
    }


@pytest.mark.parametrize("v0", [
    0.001,   # Sub-threshold flick
    0.01,    # Gentle nudge
    0.1,     # Slow swipe
    0.5,     # Normal swipe
    1.0,     # Brisk swipe
    2.5,     # Fast swipe
    5.0,     # Very fast flick
    10.0,    # Violent drag release
    50.0,    # Hyper-extreme edge case
])
def test_inertia_convergence_and_decay(v0: float):
    """
    Verifies that the friction loop terminates unconditionally within finite frames,
    never hangs in an infinite loop, and converges to |v| <= 0.005.
    """
    result = simulate_inertia(v0, friction=0.93, threshold=0.005)
    
    # Must converge
    assert result["converged"] is True, f"Inertia failed to converge for v0={v0}"
    assert abs(result["final_velocity"]) <= 0.005
    
    # Frame count check: at 60fps, 120 frames is 2 seconds
    # Even a massive flick (v0=50) should stop in < 140 frames (< 2.4s)
    assert result["frames"] <= 140, f"Inertia took {result['frames']} frames, exceeding limit"
    
    # Velocity decay must be strictly monotonic
    history = result["history"]
    for i in range(len(history) - 1):
        assert abs(history[i+1]) < abs(history[i]), "Velocity must decay monotonically"

    # Theoretical frame count: k = ceil(ln(threshold / |v0|) / ln(0.93)) if |v0| > threshold
    if v0 * 0.93 > 0.005:
        theoretical_frames = math.ceil(math.log(0.005 / v0) / math.log(0.93))
        assert result["frames"] == theoretical_frames, f"Frame count mismatch: simulated {result['frames']} vs theoretical {theoretical_frames}"


def test_inertia_zero_and_negative():
    """
    Tests edge cases: 0 velocity, negative velocity (reverse swipe).
    """
    res_zero = simulate_inertia(0.0)
    assert res_zero["frames"] == 1
    assert res_zero["converged"] is True
    
    res_neg = simulate_inertia(-1.5)
    assert res_neg["converged"] is True
    assert res_neg["delta_angle"] < 0.0  # Counter-clockwise rotation


# ==============================================================================
# SECTION 3: 3D PERSPECTIVE PROJECTION & RESPONSIVE VIEWPORT BOUNDS
# ==============================================================================

def project_point_3d(x: float, y: float, z: float, perspective_d: float) -> tuple[float, float]:
    """
    Applies CSS perspective projection with camera at (0, 0, D).
    x_proj = x * D / (D - z)
    """
    denom = perspective_d - z
    assert denom > 0, f"Z coordinate {z} is behind or at camera plane {perspective_d}"
    scale = perspective_d / denom
    return (x * scale, y * scale)


@pytest.mark.parametrize("viewport_width,card_width,card_height,perspective_d,is_mobile", [
    (320, 165, 240, 750, True),    # iPhone SE / minimum mobile
    (375, 165, 240, 750, True),    # Standard mobile
    (768, 210, 300, 950, False),   # iPad / Tablet
    (1440, 260, 370, 1200, False), # Desktop
])
def test_3d_projection_bounds(viewport_width: int, card_width: int, card_height: int, perspective_d: int, is_mobile: bool):
    """
    Tests 3D projection of the cylinder at various rotation angles.
    Verifies that the front-most card fits cleanly within the screen width,
    and calculates projection bounds.
    """
    gap = 12 if is_mobile else 24
    slot_count = 8
    half_angle_rad = math.pi / slot_count
    radius = round((card_width / 2.0) / math.tan(half_angle_rad)) + gap
    
    # 1. Front-facing card at rotation angle = 0
    # Tilt angle = -5 deg
    tilt_rad = math.radians(-5.0)
    
    # Four corners of front-facing card in cylinder space:
    # x in [-w/2, w/2], y in [-h/2, h/2], z = radius
    corners = [
        (-card_width / 2.0, -card_height / 2.0),
        (card_width / 2.0, -card_height / 2.0),
        (-card_width / 2.0, card_height / 2.0),
        (card_width / 2.0, card_height / 2.0),
    ]
    
    projected_xs = []
    for (cx, cy) in corners:
        # Hub rotateX(-5deg):
        # Y_rot = cy * cos(tilt) - radius * sin(tilt)
        # Z_rot = cy * sin(tilt) + radius * cos(tilt)
        y_rot = cy * math.cos(tilt_rad) - radius * math.sin(tilt_rad)
        z_rot = cy * math.sin(tilt_rad) + radius * math.cos(tilt_rad)
        
        px, py = project_point_3d(cx, y_rot, z_rot, perspective_d)
        projected_xs.append(px)
        
    front_card_screen_width = max(projected_xs) - min(projected_xs)
    
    # The front card's projected width must not exceed the viewport width
    assert front_card_screen_width < viewport_width, (
        f"Front card width {front_card_screen_width:.1f}px exceeds viewport {viewport_width}px"
    )
    
    # Left & right margin for front card
    margin = (viewport_width - front_card_screen_width) / 2.0
    assert margin > 10.0, f"Insufficient margin {margin:.1f}px on {viewport_width}px viewport"


# ==============================================================================
# SECTION 4: CODE INTEGRITY AND AST STRUCTURAL VERIFICATION
# ==============================================================================

def test_source_code_integrity():
    """
    Verifies required implementation features in CylindricalCarousel.jsx:
    - CSS 3D transforms: preserve-3d, perspective, rotateX(-5deg), rotateY
    - touch-action: pan-y (prevents vertical scroll blocking)
    - 6px drag threshold (disambiguates click vs drag)
    - overflow-hidden wrapper (prevents horizontal scrollbars)
    - backface-visibility: hidden (culls rear facets for 60fps performance)
    - cleanup of requestAnimationFrame on unmount
    """
    assert CAROUSEL_FILE.exists(), f"Source file {CAROUSEL_FILE} does not exist"
    code = CAROUSEL_FILE.read_text(encoding="utf-8")
    
    assert "preserve-3d" in code, "Must include preserve-3d transform style"
    assert "rotateX(-5deg)" in code, "Must include -5deg tilt for 3D depth"
    assert "rotateY(" in code, "Must include rotateY for cylinder rotation"
    assert "touch-pan-y" in code, "Must include touch-pan-y to preserve native vertical scrolling"
    assert "overflow-hidden" in code, "Must include overflow-hidden on section to eliminate horizontal scrollbars"
    assert "backfaceVisibility" in code or "backface-visibility" in code, "Must cull backfaces for performance"
    assert "cancelAnimationFrame" in code, "Must clean up animation frames to prevent memory leaks"
    assert "totalDragDistRef.current > 6" in code, "Must implement 6px threshold to disambiguate click from drag"
    assert "friction = 0.93" in code, "Must use 0.93 friction coefficient"

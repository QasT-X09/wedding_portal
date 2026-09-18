# Survey Task Assignment: Explorer 3 (Build, Verification & FCC Council Integration)

## Context
Project: Kurmet & Balnur Wedding Portal
Workspace: C:\Users\ASUS\Projects\wedding_portal
Original Request: C:\Users\ASUS\Projects\wedding_portal\.agents\ORIGINAL_REQUEST.md

## Scope & Objective
1. Investigate the frontend build configuration (package.json, vite.config.js or build tooling, dependencies, framer-motion or lucide-react or three if present, npm scripts).
2. Investigate the local FCC Council tools (`python C:\Users\ASUS\fcc_agent_tools.py --council ...` or fcc-council skill/script) and determine exact CLI usage, parameters, and expected output format.
3. Determine how build verification (`npm run build` in frontend/) should be executed and what quality metrics/audits are required.
4. Deliver your structured findings and verification strategy to handoff.md in your directory.

## 2026-09-18T15:28:21Z
You are explorer_survey_3 (teamwork_preview_explorer).
Your working directory is C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_3.
Your task assignment is in C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_3\DISPATCH.md.
Read the authoritative user request at: C:\Users\ASUS\Projects\wedding_portal\.agents\ORIGINAL_REQUEST.md.

Examine the codebase at C:\Users\ASUS\Projects\wedding_portal:
1. Check frontend/package.json, build tools, vite configuration, npm scripts, and dependencies.
2. Investigate the local FCC council tool at C:\Users\ASUS\fcc_agent_tools.py (run `python C:\Users\ASUS\fcc_agent_tools.py --help` or view the file, and check the fcc-council skill at C:\Users\ASUS\.agents\skills\fcc-council\SKILL.md).
3. Determine exact CLI invocation for auditing components with the council.
4. Detail build verification (`npm run build` in frontend/) requirements.
5. Record your findings in C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_3\handoff.md and report back when finished.

## 2026-09-18T16:35:37Z
You are an Explorer for the wedding portal redesign project.
Your working directory is C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_3.

Task: Survey and design the visual animations, 3D Photo Carousel, Golden Circle transition, and Falling Petals.
1. Read the user request at C:\Users\ASUS\Projects\wedding_portal\.agents\ORIGINAL_REQUEST.md (focus on header ## 2026-09-18T16:34:05Z).
2. View and study the target visual reference at C:\Users\ASUS\Projects\wedding_portal\wedding-reference.png.
3. Investigate the visual animation requirements and current animation components:
   - R3: Golden Circle Scroll Animation using Framer Motion (useScroll, useTransform, useSpring). Small circle -> medium -> large -> beyond viewport -> transition to 3D carousel. How should the scroll range, spring damping, glow, and particle trail be built?
   - R4: Multi-layer falling petals (background, midground, foreground with depth blur) across Page 1 and the 3D carousel page. How can we achieve silky 60fps performance without re-rendering? (e.g. CSS animation / Canvas / MotionValues).
   - R6: Perspective-based 3D photo carousel matching wedding-reference.png:
     - Center photo: largest, sharp, facing camera.
     - Side photos: rotated (rotateY), scaled down, perspective, slight darkness/depth.
     - Champagne golden 3D luminous ring underneath on a dark reflective surface.
     - Photo-only cards (NO text overlays, NO captions, NO names).
     - Controls: mouse drag, wheel, keyboard arrows, touch swipe for mobile.
     - Spring physics transitions.
   - R11: Component architecture under `components/wedding/`:
     - CinematicIntro.jsx
     - GoldenCircleTransition.jsx
     - FallingPetals.jsx
     - WeddingHeader.jsx
     - PhotoCarousel3D.jsx
     - PhotoViewer.jsx
4. Write your detailed architectural and animation design to C:\Users\ASUS\Projects\wedding_portal\.agents\explorer_survey_3\handoff.md.
5. Send a message to the orchestrator when completed.

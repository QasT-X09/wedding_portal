# Dispatch Log

## 2026-09-18T15:27:37Z

Refine the wedding portal at C:\Users\ASUS\Projects\wedding_portal for Kurmet & Balnur:
1. R1. Branding & Name Update: Replace all occurrences of initials "K B" across the frontend codebase (including App.jsx, CinematicIntro.jsx, WeddingHeader.jsx, PhotoViewer.jsx, WeddingMenu.jsx, and footer metadata) with full names "Kurmet Balnur". Retain high-fashion serif styling and wedding elegance.
2. R2. Middle 3D Cylindrical Carousel: Implement a 3D cylindrical photo carousel in the middle section of the portal with scroll-driven rotation along 3D axis (cylinder / 3D perspective), manual drag/swipe interaction with smooth damping, and photo integration (supporting wedding photos and live user uploads). Ensure responsiveness without horizontal scrollbars breaking the page.
3. R3. Bottom Photo Gallery Cleanup: Remove redundant stock placeholder photos from the bottom masonry gallery so that it displays only guest-uploaded / backend media from /api/media (or a stylish call-to-action to upload memories if empty).
4. R4. Multi-Model FCC-Claude Council Review: Run the local Free Claude Code council (using `python C:\Users\ASUS\fcc_agent_tools.py --council ...` or fcc-council skill/tool) across the updated components to audit 60fps animation performance, responsive layout integrity on mobile and desktop, and code maintainability.
5. Verification: Ensure `npm run build` in `C:\Users\ASUS\Projects\wedding_portal\frontend` completes successfully with exit code 0.

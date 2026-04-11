```markdown
# Design System Specification: The Digital Atelier

## 1. Overview & Creative North Star: "The Digital Atelier"
This design system rejects the "templated" nature of the modern web in favor of an editorial, high-end experience that feels curated rather than constructed. We move away from rigid, boxy layouts to embrace the **Digital Atelier**—a space defined by breathable white space, intentional asymmetry, and the tactile quality of premium stationery.

**The North Star:** High-Contrast Elegance.
By pairing the geometric precision of modern Arabic headlines with the academic soul of serif body text, we create a "New Luxury" aesthetic. The interface should feel like a physical gallery: elements are layered, not just placed, and boundaries are felt through light and shadow rather than drawn with ink.

---

## 2. Colors & Tonal Depth
We utilize a palette rooted in a "Clean White" philosophy, punctuated by the authoritative `primary` (#512DA8).

### The Hierarchy of Light
Instead of lines, we use the "Tonal Layering" method to define structure:
*   **Base Layer:** `surface` (#faf9fc) — The canvas of the application.
*   **Secondary Sections:** `surface-container-low` (#f5f3f7) — Used for large structural blocks to subtly recede from the main content.
*   **Floating Elements:** `surface-container-lowest` (#ffffff) — Used for high-priority cards or "Hero" modules to make them appear to catch the light.

### Design Laws
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Use background shifts (e.g., a `surface-container-high` card sitting on a `surface` background) to define containment.
*   **Signature Textures:** For high-impact CTAs or Hero backgrounds, use a linear gradient: `primary` (#3a0891) to `primary-container` (#512da8) at a 135-degree angle. This adds "soul" and depth that flat hex codes lack.
*   **The Glass & Gradient Rule:** For navigation bars or floating action menus, use `surface-bright` with an 80% opacity and a `20px` backdrop-blur. This "frosted glass" effect ensures the UI feels integrated into the environment.

---

## 3. Typography: The Editorial Voice
The typography scale is designed to create a rhythmic "Stop and Read" experience.

*   **Headlines (Arabic: IBM Plex Sans Arabic / Latin: Plus Jakarta Sans):**
    The `display` and `headline` tiers must be set with tight letter-spacing (-0.02em) and high weight. This provides a modern, architectural counterpoint to the "Royal" purple accents.
*   **Body & Titles (Noto Serif):**
    All `body` and `title` tokens utilize Noto Serif. This injects a sense of heritage and trustworthiness. Ensure `body-lg` has a generous line-height (1.6) to maintain the editorial feel.
*   **Scale Contrast:**
    Always pair a `display-lg` headline with a significantly smaller `body-md` subtext. This dramatic jump in scale is what defines "high-end" design versus "standard" UI.

---

## 4. Elevation & Depth: Atmospheric Layering
We do not "drop shadows"; we simulate "ambient occlusion."

*   **The Layering Principle:** Depth is achieved by stacking surface-container tiers. An inner module should always be at least one tier "brighter" or "dimmer" than its parent container to create a soft, natural lift.
*   **Ambient Shadows:** For floating components (Modals, Dropdowns), use a multi-layered shadow:
    `0 4px 20px rgba(81, 45, 168, 0.04), 0 12px 40px rgba(27, 27, 30, 0.08)`.
    The hint of Purple in the shadow ensures the shadow feels like a reflection of the brand color.
*   **The "Ghost Border" Fallback:** If a divider is essential for accessibility, use the `outline-variant` (#cbc3d5) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: The Primitive Set

### Buttons: The Weighted Anchor
*   **Primary:** Background: `primary` (#3a0891); Text: `on-primary` (#ffffff); Corner Radius: `md` (0.375rem). Use a subtle inner-glow (top-down) for a tactile feel.
*   **Secondary:** Background: `secondary-container` (#d6c7fe); Text: `on-secondary-container` (#5d5180). No border.
*   **Tertiary:** No background. Text: `primary`. Use for low-emphasis actions.

### Cards & Lists: The Negative Space Method
*   **Cards:** Use `surface-container-lowest` (#ffffff). **Forbid dividers.** Separate card header from body using an 8px increase in vertical padding or a subtle shift to `surface-container-low` for the footer.
*   **Inputs:** Text fields should use a "pill" or `md` radius. The background should be `surface-container-highest` (#e3e2e6) with no border. On focus, transition the background to `surface` and add a 1.5px `primary` "Ghost Border."

### Specialized Component: The Signature Pull-Quote
In an editorial system, use the `title-lg` (Noto Serif) in `primary-fixed-variant` (#502ba7) with an oversized, 10% opacity `primary` quotation mark as a background element to break up long-form content.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins. For example, a wider left margin (in LTR) or right margin (in RTL) for headlines to create a "whitespace gutter."
*   **Do** use `surface-tint` sparingly to highlight active states in navigation.
*   **Do** overlap elements. Let a card sit 20px over a hero image to create a sense of physical layering.

### Don't:
*   **Don't** use pure black (#000000). Use `on-background` (#1b1b1e) to keep the contrast sophisticated rather than jarring.
*   **Don't** use standard "Material Design" shadows. They are too heavy for this aesthetic.
*   **Don't** use icons as the primary driver of meaning. Let the high-end typography do the work; icons should be decorative and thin-stroked (0.75px to 1px weight).

### Accessibility & Readability
While we prioritize aesthetics, the `on-surface` (#1b1b1e) on `surface` (#faf9fc) provides a high contrast ratio (17:1), far exceeding WCAG AAA standards. Always ensure that the "Ghost Borders" are not the only indicator of an interactive state—use weight shifts or the Royal Purple color to signal focus.```
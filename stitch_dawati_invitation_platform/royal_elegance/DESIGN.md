# Design System Document: High-End Editorial Wedding Experience

## 1. Overview & Creative North Star: "The Digital Calligrapher"
This design system is built to transform a digital wedding platform into a curated editorial masterpiece. The Creative North Star is **"The Digital Calligrapher"**—a philosophy that treats digital space like premium heavy-stock paper and high-end wedding stationary. 

We are moving away from the "app-like" rigid grid. Instead, we embrace **intentional asymmetry** and **tonal depth**. The layout should feel like a bespoke invitation: headlines should breathe, elements should overlap with purpose, and the interaction between the clean white surfaces and the royal purple accents should evoke a sense of heritage and modern luxury.

## 2. Colors: Royal Tones & Ethereal Surfaces
The color palette is anchored in the deep, authoritative `primary` (#3a0891) and `primary_container` (#512da8), balanced against a clean, "Gallery White" environment.

*   **The "No-Line" Rule:** To maintain a premium editorial feel, **1px solid borders are strictly prohibited** for sectioning content. Boundaries must be defined through background color shifts. For example, a `surface_container_low` section should sit directly on a `surface` background to denote a change in context.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers.
    *   **Level 0 (Base):** `surface` (#f9f9fc)
    *   **Level 1 (Sections):** `surface_container_low` (#f3f3f6)
    *   **Level 2 (Cards/Interaction):** `surface_container_lowest` (#ffffff)
*   **The "Glass & Gradient" Rule:** Main CTAs or Hero sections should utilize a subtle linear gradient from `primary` to `primary_container`. For floating navigation or modal overlays, use **Glassmorphism**: apply `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur.
*   **Signature Textures:** Use `tertiary_fixed_dim` (#ffb787) sparingly as a "gold-leaf" highlight for small accents like dates or icons to complement the royal purple.

## 3. Typography: The New Arabic Editorial
We are transitioning to **Almarai** (or Cairo) to achieve a sophisticated, modern Arabic aesthetic that mirrors the elegance of traditional calligraphy while remaining perfectly legible.

*   **Display & Headline (Almarai Bold):** Used for names and titles. These should be oversized to create an editorial impact. Use `primary` for headlines to establish a royal presence.
*   **Title & Body (Almarai Regular/Light):** Body text must use `on_surface_variant` (#494553) to reduce visual harshness. The contrast between the deep purple headlines and the soft charcoal body text creates a high-end "printed" feel.
*   **Hierarchy Note:** Always utilize the `display-lg` scale (3.5rem) for the couple's names, ensuring ample letter-spacing and line-height (1.4+) to let the Arabic script breathe.

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too "software-heavy" for a wedding platform. We use light to create emotion.

*   **The Layering Principle:** Depth is achieved by "stacking." Place a `surface_container_lowest` card on a `surface_container_low` section. This creates a "soft lift" that feels like paper on paper.
*   **Ambient Shadows:** If a card must float, the shadow must be invisible to the untrained eye. Use the `on_surface` color at 4% opacity with a `40px` blur and `8px` Y-offset. This mimics natural, ambient light.
*   **The "Ghost Border" Fallback:** If a container requires definition against a white background, use the `outline_variant` token at **15% opacity**. This provides a "suggestion" of a border rather than a hard line.

## 5. Components: Bespoke Elements

*   **Buttons:**
    *   **Primary:** A gradient from `primary` to `primary_container` with `lg` (1rem) roundedness. No border. Text in `on_primary`.
    *   **Tertiary (Editorial):** All caps (for Latin) or Bold Almarai (for Arabic), no background, with a `primary` underline that sits 4px below the text.
*   **Cards & Lists:**
    *   **Rule:** Forbid divider lines. Use `48px` of vertical white space from the Spacing Scale to separate list items.
    *   **Style:** Use `surface_container_lowest` with a `xl` (1.5rem) corner radius for a soft, inviting touch.
*   **Input Fields:**
    *   Background should be `surface_container_high`. No border in the rest state. Upon focus, transition the background to `surface_container_lowest` with a `1px` ghost-border in `primary`.
*   **Invitation Chips:**
    *   Small, elegant pill-shaped containers using `primary_fixed` with `on_primary_fixed` text for tags like "RSVP Confirmed" or "VIP."
*   **Signature Components (The "Wedding Specialized"):**
    *   **The "Vellum" Overlay:** A semi-transparent modal using `surface_bright` with a 90% opacity to mimic vellum paper overlays in physical invitations.
    *   **The "Gold" Divider:** Instead of a line, use a small 4px centered dot in `tertiary_fixed`.

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts where the headline is slightly offset from the body text.
*   **Do** use large amounts of white space (margins of 64px+ on desktop) to signify luxury.
*   **Do** use `on_surface_variant` for long-form reading to maintain a "soft" visual texture.
*   **Do** ensure all Arabic text is perfectly aligned with appropriate `line-height`—Arabic script requires 20% more vertical space than Latin.

### Don't:
*   **Don't** use 100% black (#000000). Use `on_surface` (#1a1c1e) for the deepest tones.
*   **Don't** use "Drop Shadows" with high opacity or dark grey colors.
*   **Don't** use sharp `none` or `sm` corners; weddings are soft events, use `lg` to `xl` roundedness.
*   **Don't** use dividers to separate content. Let the space and background shifts do the work.
# FILTHY FRIDAY — Brand Design Guidelines
### Extracted from filthyfriday.rocks | April 2026

---

## 1. COLOR PALETTE

### Primary Colors

| Role | HEX | RGB | Usage |
|------|-----|-----|-------|
| **Hot Pink (Primary Accent)** | `#FA2BA9` | rgb(250, 43, 169) | Announcement bar, CTA buttons ("BOOK"), primary highlights, brand energy |
| **Neon Yellow** | `#FFF200` | rgb(255, 242, 0) | Announcement text, accent highlights on pink backgrounds |
| **Neon Green** | `#9DFF60` | rgb(157, 255, 96) | Countdown headings ("ready to join the fun?"), countdown numbers, secondary accent |
| **Gold / Warm Yellow** | `#F7DA64` | rgb(247, 218, 100) | Navigation links, secondary text highlights |

### Neutral Colors

| Role | HEX | RGB | Usage |
|------|-----|-----|-------|
| **Near-Black (Background)** | `#090A0B` | rgb(9, 10, 11) | Primary page background, navigation background, footer background |
| **Dark Gray** | `#1E1E1E` | rgb(30, 30, 30) | Secondary backgrounds, subtle separation |
| **Pure White** | `#FFFFFF` | rgb(255, 255, 255) | Primary body text, headings (H1), nav links |
| **Pure Black** | `#000000` | rgb(0, 0, 0) | CTA button text on pink background |

### Special Effects Colors

| Role | Value | Usage |
|------|-------|-------|
| **Warm Orange Glow** | `rgba(217, 119, 87, 0.5)` | Inset box-shadow glow effects |
| **Semi-transparent Black** | `rgba(9, 10, 11, 0.7)` | Overlay backgrounds on video sections |
| **Semi-transparent White** | `rgba(255, 255, 255, 0.2)` | Subtle border/divider effects |

### Color Distribution (approx. 70/20/10 rule)

- **70% — Near-Black** (`#090A0B`): Dominant background throughout the site
- **20% — White** (`#FFFFFF`): Primary text color, headline text
- **10% — Accents**: Hot Pink (`#FA2BA9`), Neon Yellow (`#FFF200`), Neon Green (`#9DFF60`), Gold (`#F7DA64`) as energetic highlights

---

## 2. TYPOGRAPHY

### Font Families

| Role | Font Family | Fallback | Notes |
|------|-------------|----------|-------|
| **Headings (Display)** | `Cheddargothic-sansitalic` | — | Custom font, bold/edgy, italic feel. Used for all H1–H4 elements |
| **Body / UI** | `Anodyne` | — | Custom font. Used for body text, navigation, buttons, paragraphs, footer |
| **Icons** | `Font Awesome 6 Free` / `Font Awesome 6 Brands` | FontAwesome 5 fallback | Social icons and UI iconography |

### Heading Hierarchy

| Element | Font | Size | Weight | Line Height | Letter Spacing | Color | Example |
|---------|------|------|--------|-------------|----------------|-------|---------|
| **H1 (Hero)** | Cheddargothic-sansitalic | ~128px | 400 | ~115px (0.9em) | -3.84px | `#FFFFFF` | "3 TROPICAL ISLANDS 1 CRAZY PARTY IN PARADISE!!" |
| **H1 (Large Display)** | Cheddargothic-sansitalic | ~224px | 400 | ~246px (1.1em) | -6.72px | `#FA2BA9` | "MERCHANTS OF HAPPINESS" |
| **H3 (Section)** | Cheddargothic-sansitalic | ~68px | 400 | ~65px (0.95em) | -1.37px | `#9DFF60` | "ready to join the fun?" |
| **H4 (Countdown)** | Cheddargothic-sansitalic | ~51px | 400 | ~49px (0.95em) | -1.02px | `#9DFF60` | Countdown numbers |

### Body & UI Text

| Element | Font | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|------|--------|-------------|----------------|-------|
| **Body text** | Anodyne | ~17px | 400 | ~25.6px (1.5em) | normal | `#FFFFFF` |
| **Announcement bar** | Anodyne | ~25.6px | 400 | ~37px (1.45em) | normal | `#FFF200` |
| **Nav links** | Anodyne | ~12.8px | 400 | — | — | `#FFFFFF` |
| **CTA Button ("BOOK")** | Anodyne | ~12.8px | 400 | — | — | `#090A0B` (dark on pink) |
| **Footer** | Anodyne | ~17px | 400 | — | — | `#FFFFFF` |

### Typography Notes
- All heading text uses **negative letter-spacing** (tight tracking) for a compressed, impactful look
- Headings have **tight line-height** (0.9–1.1em) creating dense, stacked text blocks
- Navigation uses **italic/bold appearance** from the Cheddargothic font itself (weight 400 but visually bold)
- Text transform is **not** explicitly uppercase — the fonts themselves have an all-caps visual character

---

## 3. VISUAL IDENTITY

### Logo
- **Style:** Custom hand-drawn/graffiti typographic logo
- **Text:** "Filthy Friday Bocas" with "ISLAND PARTY CRAWL" and "PANAMA" beneath
- **Colors:** Hot Pink (`#FA2BA9`) for main text, White details/accents
- **Character:** Loose, party-style, hand-lettered with decorative swirls and curves
- **Placement:** Top-left of navigation bar
- **Approximate dimensions:** ~150px wide in nav context

### Favicon / Brand Mark
- Small circular emblem used as favicon and secondary brand mark

### Icon System
- **Library:** Font Awesome 6 (Free + Brands)
- **Fallback:** Font Awesome 5
- **Usage:** Social media links, UI elements
- **Weight:** Regular (400) and Solid (900)

### Imagery Style
- **Video-heavy:** Full-screen background videos as hero sections
- **Dark atmosphere:** Near-black backgrounds with vibrant neon accent overlays
- **Party/tropical aesthetic:** Beach, island, nightlife imagery
- **High contrast:** Bright neon colors against deep black

---

## 4. BUTTONS & CTAs

### Primary CTA ("BOOK" button)

| Property | Value |
|----------|-------|
| Background | `#FA2BA9` (Hot Pink) |
| Text color | `#090A0B` (Near-Black) |
| Font | Anodyne, ~12.8px |
| Border radius | `5.33px` |
| Padding | `13.65px 25.6px` |
| Border | `1.71px solid #090A0B` |
| Text transform | Uppercase visual (font-driven) |

### Announcement Bar CTA

| Property | Value |
|----------|-------|
| Background | `#FA2BA9` (Hot Pink) |
| Text color | `#FFF200` (Neon Yellow) |
| Padding | `3.4px` |
| Full-width | Yes (flex container) |
| Font | Anodyne, ~25.6px |

### Box Shadow / Glow Effect
```css
box-shadow: rgba(217, 119, 87, 0.5) 0px 0px 10px 0px inset,
            rgba(217, 119, 87, 0.3) 0px 0px 20px 0px inset;
```
Warm orange inset glow used on certain interactive elements.

---

## 5. LAYOUT & SPACING

### Grid System
- **Display:** CSS Grid for navigation and main layout
- **Navigation grid gap:** ~21px
- **Content containers:** `.content-container--padded` pattern
- **Nav padding:** `34px 42.7px`

### Section Spacing (page flow, top to bottom)

| Section | Height | Offset | Notes |
|---------|--------|--------|-------|
| Announcement bar | 44px | 0px | Fixed pink bar at top |
| Hero (video + logo + CTA) | 855px | 317px | Full-viewport hero with video bg |
| Countdown block | 323px | 1172px | Neon green countdown timer |
| H2 content block | 610px | 1495px | Content section |
| Image/text slider | 696px | 2105px | Swiper-based carousel |
| Image/text offset | 527px | 2801px | Alternating layout |
| H3 content block | 607px | 3328px | Content section |
| H4 content block | variable | 3935px+ | Additional content |
| Footer | — | bottom | T&Cs, Privacy Policies |

### Container Padding
- **Footer:** `53.3px 42.7px 42.7px`
- **Content sections:** `~42.7px` horizontal padding
- **Announcement bar:** `3.4px` vertical

### Border Radius Values
- **Buttons:** `5.33px`
- **Circular elements:** `50%` (avatars, icons)

### Component Libraries
- **Swiper.js** — Carousel/slider functionality
- **Font Awesome 6** — Icon system

---

## 6. VOICE & TONE

- **Personality:** Wild, fun, unapologetic, tropical, energetic
- **Writing style:** Casual, exclamatory, bold uppercase statements
- **Key phrases:** "Merchants of Happiness", "Island Party Crawl", "1 Crazy Party in Paradise"
- **Tone:** Hype-driven, event marketing, FOMO-inducing ("EARLY BIRD DISCOUNTS!!")

---

## 7. CSS CUSTOM PROPERTIES

```css
:root {
  --header-height: 0rem;
  --fixed-header-height: 0rem;
  --announcement-height: 0rem;
  --header-padding: 1.5rem;
  --header-padding-reduction: 0.625rem;
  --swiper-theme-color: #007aff;
  --swiper-navigation-size: 44px;
}
```

---

## 8. PLATFORM & TECH STACK

- **Platform:** Squarespace (based on class naming conventions and block structure)
- **Block types:** hero-video-logo-cta, countdown-block, h2-block, h3-block, h4-block, img-txt-slider-block, img-txt-offset-block
- **Carousel:** Swiper.js
- **Icons:** Font Awesome 6
- **Custom fonts:** Cheddargothic-sansitalic, Anodyne (uploaded custom fonts)
- **Video:** Background video embeds as hero sections

---

*Extracted on April 9, 2026 from https://www.filthyfriday.rocks/*

# FitClub Design System

Single source of truth for colors, spacing, radius, and shadows. Used by:

- **Tailwind** — `tailwind.config.js` extends from `tokens.js` (use classes like `bg-primary-500`, `text-neutral-900`).
- **React Native theme** — `src/theme/theme.ts` builds light/dark theme from here; components use `useTheme()` from `src/theme` (no hex in app code).

## Tokens

| Token | Description |
|-------|-------------|
| **neutral** | 50–950 slate scale (backgrounds, text, borders). |
| **primary** | Blue scale 50–950 (buttons, links, brand). |
| **success / warning / error** | Semantic colors + muted variants. |
| **accent** | Lime (points, highlights). |
| **medals** | Gold, silver, bronze (leaderboard). |
| **spacing** | 8pt system (4, 8, 16, 24, 32, 40, 48, 64…). |
| **borderRadius** | sm(8), md(12), lg(16), xl(24), full. |
| **boxShadow** | sm, DEFAULT, md, lg, xl (Tailwind). |
| **shadowsRN** | React Native shadow objects (shadowColor from neutral). |
| **lightTheme / darkTheme** | Semantic maps (background, surface, text, primary, auth gradients, etc.). |

## Dark mode (class strategy)

Tailwind is configured with **`darkMode: 'class'`**.

- **Web:** Add the class `dark` to a root element (e.g. `<html class="dark">`) to enable dark theme. All utilities like `bg-surface` and `dark:bg-surface-dark` (or semantic tokens) will switch.
- **React Native:** Dark mode is driven by `ThemeContext` (useTheme()); no class. For NativeWind, you can bind `dark` class to the theme preference so the same tokens apply.

No inline hex or purple gradients — auth gradients use the **primary blue** scale (e.g. primary-500 → primary-700). **app.json** splash and adaptiveIcon `backgroundColor` use `#2563eb` (primary[600]); keep in sync with this file.

## Usage in components

- **With Tailwind (web or NativeWind):** Use theme tokens only, e.g. `bg-primary-500`, `text-neutral-900`, `rounded-lg`, `p-4`, `shadow-md`. For dark: `dark:bg-neutral-800`, `dark:text-neutral-100`.
- **With React Native StyleSheet:** Use `useTheme()` and `theme.colors`, `theme.spacing`, `theme.radius`, `theme.shadows` — all derived from this design system.

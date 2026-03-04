# Theme (Expo / React Native structure)

All UI colors, spacing, typography, and shadows are driven from this folder. Single source of raw values: **`frontend/design-system/tokens.js`**.

## Folder structure

| File | Purpose |
|------|--------|
| **`tokens.ts`** | Shared design tokens: spacing (8pt), radius, typography, shadows, animation. No colors. |
| **`light.ts`** | Light theme: light colors (from design-system) + tokens. Exports `lightTheme`, `Theme`, `ThemeColors`. |
| **`dark.ts`** | Dark theme: dark colors + tokens. Exports `darkTheme`. |
| **`ThemeContext.tsx`** | Provider + `useTheme()` / `useThemeContext()`. Picks light or dark by preference/system. |
| **`index.ts`** | Public API: re-exports tokens, lightTheme, darkTheme, Theme types, ThemeProvider, useTheme, useThemeContext. |
| **`theme.ts`** | Backward compat: re-exports tokens + light/dark (no context). Prefer importing from `../theme` or `./light` / `./dark` / `./tokens`. |

## Usage

- **Components / screens**: `import { useTheme } from '../theme'` or `import { useTheme } from '../hooks'`. Use `theme.colors`, `theme.spacing`, `theme.radius`, `theme.typography`, `theme.shadows`.
- **Theme types**: `import type { Theme, ThemeColors } from '../theme'`.
- **Raw tokens** (e.g. for non-React code): `import { spacing, radius } from '../theme/tokens'`.

To rebrand: update **`design-system/tokens.js`** (and optionally extend in `light.ts` / `dark.ts`), then reload. No need to touch individual screens.

/**
 * Re-exports for backward compatibility.
 * Prefer importing from '../theme' (index) or from '../theme/light' / '../theme/dark' / '../theme/tokens'.
 */

export { spacing, radius, shadows, animation } from './tokens';
export { lightTheme, type Theme, type ThemeColors } from './light';
export { darkTheme } from './dark';

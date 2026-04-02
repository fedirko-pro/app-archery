/**
 * Canonical brand/UI color constants.
 * MUI palette (createTheme) consumes these.
 * SCSS mirrors the brand values via _variables.scss.
 */
export const COLORS = {
  // Brand
  primary: '#000080', // $blue — navy, main actions
  primaryBright: '#0057b8', // $blue-bright — button borders, card accents
  primaryDark: '#004a9e', // $blue-dark — gradient ends
  secondary: '#ffcc00', // $yellow / $gold
  secondaryContrastText: '#212121',

  // Text
  textBody: '#333333', // $text-body — body copy
  textPrimary: '#212121', // $black
  textSecondary: '#666666', // $text-secondary
  textDisabled: '#999999', // $text-disabled

  // Surfaces / borders
  surface: '#f0f0f0', // $surface — uploader / input bg
  border: '#e0e0e0', // $border
  dividerOnDark: '#333333', // $divider-on-dark — menu hr lines
  white: '#ffffff', // $white

  // Accent
  adminAccent: '#ffb347', // sub-menu admin items (orange)
} as const;

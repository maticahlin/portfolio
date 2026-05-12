// lib/theme.ts
// Central design tokens for the dark Win98 theme.
// Import { t, border, anim } from '@/lib/theme' in any component.

export const t = {
  bgWindow:    '#474747',   // Window background
  bgInner:     '#323232',   // Inputs, title bar, buttons, inner panels
  text:        '#E2E2E2',   // Primary text
  textMuted:   '#9F9F9F',   // Muted / placeholder text
  borderLight: '#9F9F9F',   // Light edge of Win98 bevel
  borderDark:  '#000000',   // Dark edge of Win98 bevel
} as const;

// Border style objects — spread these into inline style props
export const border = {

  // Outer window frame — 1px raised
  window: {
    borderTop:    `1px solid ${t.borderLight}`,
    borderLeft:   `1px solid ${t.borderLight}`,
    borderRight:  `1px solid ${t.borderDark}`,
    borderBottom: `1px solid ${t.borderDark}`,
  },

  // Raised — buttons, active tabs (embossed)
  raised: {
    borderTopColor:    t.borderLight,
    borderLeftColor:   t.borderLight,
    borderRightColor:  t.borderDark,
    borderBottomColor: t.borderDark,
    boxShadow: `inset 1px 1px 0 0 ${t.borderLight}, inset -1px -1px 0 0 ${t.borderDark}`,
  },

  // Pressed — button on mousedown (inset)
  pressed: {
    borderTopColor:    t.borderDark,
    borderLeftColor:   t.borderDark,
    borderRightColor:  t.borderLight,
    borderBottomColor: t.borderLight,
    boxShadow: `inset 1px 1px 0 0 ${t.borderDark}, inset -1px -1px 0 0 ${t.borderLight}`,
  },

  // Inset — inputs, textareas, preview panes (recessed)
  inset: {
    borderTopColor:    t.borderDark,
    borderLeftColor:   t.borderDark,
    borderRightColor:  t.borderLight,
    borderBottomColor: t.borderLight,
  },

  // Table header cell inner div
  tableHeader: {
    borderTopColor:    t.borderLight,
    borderLeftColor:   t.borderLight,
    borderRightColor:  t.borderDark,
    borderBottomColor: 'transparent',  // No bottom — lets the row border handle it
  },

  // Buttons additional border sizings
  button: {
    raised: {
      borderTopColor:    t.borderLight,
      borderLeftColor:   t.borderLight,
      borderRightColor:  t.borderDark,
      borderBottomColor: t.borderDark,
    },
    pressed: {
      borderTopColor:    t.borderDark,
      borderLeftColor:   t.borderDark,
      borderRightColor:  t.borderLight,
      borderBottomColor: t.borderLight,
    },
  },

} as const;

// Framer Motion animation variants — spread into motion components
export const anim = {

  window: {
    initial:    { scale: 0.95, opacity: 0 },
    animate:    { scale: 1,    opacity: 1 },
    exit:       { scale: 0.95, opacity: 0 },
    transition: { duration: 0.15, ease: [0.32, 0.72, 0, 1] as const },
  },

  fade: {
    initial:    { opacity: 0 },
    animate:    { opacity: 1 },
    exit:       { opacity: 0 },
    transition: { duration: 0.15 },
  },

} as const;

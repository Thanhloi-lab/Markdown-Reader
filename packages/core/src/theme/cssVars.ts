import { ThemeConfig } from './types';

export function generateCssVariables(theme: ThemeConfig): Record<string, string> {
  return {
    '--md-bg-primary': theme.colors.backgroundPrimary,
    '--md-bg-secondary': theme.colors.backgroundSecondary,
    '--md-bg-sidebar': theme.colors.backgroundSidebar,
    '--md-bg-code': theme.colors.backgroundCode,
    '--md-bg-hover': theme.colors.backgroundHover,
    '--md-bg-active': theme.colors.backgroundActive,
    '--md-border': theme.colors.border,
    '--md-border-muted': theme.colors.borderMuted,
    '--md-text-primary': theme.colors.textPrimary,
    '--md-text-secondary': theme.colors.textSecondary,
    '--md-text-muted': theme.colors.textMuted,
    '--md-text-heading': theme.colors.textHeading,
    '--md-accent': theme.colors.accent,
    '--md-accent-hover': theme.colors.accentHover,
    '--md-accent-foreground': theme.colors.accentForeground,
    '--md-code-text': theme.colors.codeText,
    '--md-font-family': theme.typography.fontFamily,
    '--md-heading-font-family': theme.typography.headingFontFamily,
    '--md-code-font-family': theme.typography.codeFontFamily,
    '--md-font-size': theme.typography.fontSize,
    '--md-line-height': theme.typography.lineHeight
  };
}

export function generateCssStyleString(theme: ThemeConfig): string {
  const vars = generateCssVariables(theme);
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}

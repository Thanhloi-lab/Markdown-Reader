export interface ThemeColors {
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundSidebar: string;
  backgroundCode: string;
  backgroundHover: string;
  backgroundActive: string;
  border: string;
  borderMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textHeading: string;
  accent: string;
  accentHover: string;
  accentForeground: string;
  codeText: string;
}

export interface DiagramThemeConfig {
  theme: 'dark' | 'default' | 'forest' | 'neutral' | 'base';
  primaryColor?: string;
  primaryTextColor?: string;
  primaryBorderColor?: string;
  lineColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  background?: string;
}

export interface TypographyConfig {
  fontFamily: string;
  headingFontFamily: string;
  codeFontFamily: string;
  fontSize: string;
  lineHeight: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  colors: ThemeColors;
  diagram: DiagramThemeConfig;
  typography: TypographyConfig;
}

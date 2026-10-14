import { ThemeConfig } from './types';

export const defaultDarkTheme: ThemeConfig = {
  id: 'obsidian-dark',
  name: 'Obsidian Dark (Mặc định)',
  isDark: true,
  colors: {
    backgroundPrimary: '#0d0f14',
    backgroundSecondary: '#12151c',
    backgroundSidebar: '#0b0c10',
    backgroundCode: '#161c27',
    backgroundHover: 'rgba(255, 255, 255, 0.05)',
    backgroundActive: 'rgba(99, 102, 241, 0.15)',
    border: '#1f242e',
    borderMuted: '#161920',
    textPrimary: '#cdd3df',
    textSecondary: '#8d96a7',
    textMuted: '#586274',
    textHeading: '#f3f5f8',
    accent: '#5a67f6',
    accentHover: '#4c58e0',
    accentForeground: '#ffffff',
    codeText: '#82b1ff'
  },
  diagram: {
    theme: 'dark',
    primaryColor: '#1e2433',
    primaryTextColor: '#cdd3df',
    primaryBorderColor: '#5a67f6',
    lineColor: '#6e7a96',
    secondaryColor: '#151922',
    tertiaryColor: '#0f1218',
    background: '#0d0f14'
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    headingFontFamily: 'Merriweather, Charter, Georgia, "Times New Roman", serif',
    codeFontFamily: '"JetBrains Mono", "Fira Code", Consolas, Monaco, monospace',
    fontSize: '16px',
    lineHeight: '1.75'
  }
};

export const defaultLightTheme: ThemeConfig = {
  id: 'clean-light',
  name: 'Clean Light',
  isDark: false,
  colors: {
    backgroundPrimary: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundSidebar: '#f3f4f6',
    backgroundCode: '#edf2f7',
    backgroundHover: 'rgba(0, 0, 0, 0.04)',
    backgroundActive: 'rgba(99, 102, 241, 0.12)',
    border: '#e2e8f0',
    borderMuted: '#edf2f7',
    textPrimary: '#1a202c',
    textSecondary: '#4a5568',
    textMuted: '#a0aec0',
    textHeading: '#111827',
    accent: '#4f46e5',
    accentHover: '#4338ca',
    accentForeground: '#ffffff',
    codeText: '#2563eb'
  },
  diagram: {
    theme: 'default',
    primaryColor: '#e0e7ff',
    primaryTextColor: '#1e1b4b',
    primaryBorderColor: '#4f46e5',
    lineColor: '#6366f1',
    background: '#ffffff'
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    headingFontFamily: 'Merriweather, Charter, Georgia, serif',
    codeFontFamily: '"JetBrains Mono", Consolas, monospace',
    fontSize: '16px',
    lineHeight: '1.75'
  }
};

export const availableThemes: ThemeConfig[] = [defaultDarkTheme, defaultLightTheme];

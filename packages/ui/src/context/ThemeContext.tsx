import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ThemeConfig,
  defaultDarkTheme,
  availableThemes,
  generateCssVariables
} from '@markdown-reader/core';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  updateThemeColors: (colors: Partial<ThemeConfig['colors']>) => void;
  updateDiagramTheme: (diagram: Partial<ThemeConfig['diagram']>) => void;
  updateTypography: (typography: Partial<ThemeConfig['typography']>) => void;
  resetToDefault: () => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  initialTheme?: ThemeConfig;
  children: React.ReactNode;
}> = ({ initialTheme = defaultDarkTheme, children }) => {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    // Thử load từ localStorage nếu ở môi trường web
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('markdown_reader_theme');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Cannot load theme from localStorage:', e);
      }
    }
    return initialTheme;
  });

  const saveTheme = (newTheme: ThemeConfig) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('markdown_reader_theme', JSON.stringify(newTheme));
      } catch (e) {
        console.warn('Cannot save theme to localStorage:', e);
      }
    }
  };

  const updateThemeColors = (colors: Partial<ThemeConfig['colors']>) => {
    saveTheme({
      ...theme,
      colors: {
        ...theme.colors,
        ...colors
      }
    });
  };

  const updateDiagramTheme = (diagram: Partial<ThemeConfig['diagram']>) => {
    saveTheme({
      ...theme,
      diagram: {
        ...theme.diagram,
        ...diagram
      }
    });
  };

  const updateTypography = (typography: Partial<ThemeConfig['typography']>) => {
    saveTheme({
      ...theme,
      typography: {
        ...theme.typography,
        ...typography
      }
    });
  };

  const resetToDefault = () => {
    saveTheme(defaultDarkTheme);
  };

  // Áp dụng CSS variables vào root element mỗi khi theme thay đổi
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const cssVars = generateCssVariables(theme);

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: saveTheme,
        updateThemeColors,
        updateDiagramTheme,
        updateTypography,
        resetToDefault,
        availableThemes
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

import React from 'react';
import { X, RotateCcw, Palette, Check, Settings, Type, Globe } from 'lucide-react';
import { supportedFonts } from '@markdown-reader/core';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/I18nContext';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    theme,
    setTheme,
    updateThemeColors,
    updateDiagramTheme,
    updateTypography,
    resetToDefault,
    availableThemes
  } = useTheme();

  const { locale, setLocale, t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none font-sans">
      <div
        className="w-full max-w-lg rounded-xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: 'var(--md-bg-secondary)',
          borderColor: 'var(--md-border)',
          color: 'var(--md-text-primary)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{ borderColor: 'var(--md-border)' }}
        >
          <div className="flex items-center gap-2">
            <Settings size={18} style={{ color: 'var(--md-accent)' }} />
            <h3 className="font-semibold text-base" style={{ color: 'var(--md-text-heading)' }}>
              {t.settings.modalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
          {/* Lựa chọn Ngôn ngữ hiển thị (Display Language) */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Globe size={14} style={{ color: 'var(--md-accent)' }} />
              <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                {t.settings.languageSection}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocale('vi')}
                className="flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer"
                style={{
                  backgroundColor: locale === 'vi' ? 'var(--md-bg-active)' : 'var(--md-bg-primary)',
                  borderColor: locale === 'vi' ? 'var(--md-accent)' : 'var(--md-border)',
                  color: locale === 'vi' ? 'var(--md-accent)' : 'var(--md-text-primary)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇻🇳</span>
                  <span className="font-medium text-xs">Tiếng Việt</span>
                </div>
                {locale === 'vi' && <Check size={15} />}
              </button>

              <button
                type="button"
                onClick={() => setLocale('en')}
                className="flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer"
                style={{
                  backgroundColor: locale === 'en' ? 'var(--md-bg-active)' : 'var(--md-bg-primary)',
                  borderColor: locale === 'en' ? 'var(--md-accent)' : 'var(--md-border)',
                  color: locale === 'en' ? 'var(--md-accent)' : 'var(--md-text-primary)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇺🇸</span>
                  <span className="font-medium text-xs">English</span>
                </div>
                {locale === 'en' && <Check size={15} />}
              </button>
            </div>
          </div>

          {/* Preset Themes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5 opacity-70">
              {t.settings.themePresets}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableThemes.map(item => {
                const themeName =
                  item.id === 'obsidian-dark'
                    ? t.themes.obsidianDark
                    : item.id === 'clean-light'
                    ? t.themes.cleanLight
                    : item.name;

                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item)}
                    className="flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer"
                    style={{
                      backgroundColor: item.id === theme.id ? 'var(--md-bg-active)' : 'var(--md-bg-primary)',
                      borderColor: item.id === theme.id ? 'var(--md-accent)' : 'var(--md-border)',
                      color: item.id === theme.id ? 'var(--md-accent)' : 'var(--md-text-primary)'
                    }}
                  >
                    <span className="font-medium text-xs">{themeName}</span>
                    {item.id === theme.id && <Check size={15} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Customization */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-3 opacity-70">
              {t.settings.customColors}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs block mb-1 opacity-80">{t.settings.textColor}:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.colors.textPrimary}
                    onChange={e => updateThemeColors({ textPrimary: e.target.value })}
                    className="w-8 h-8 rounded border cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono">{theme.colors.textPrimary}</span>
                </div>
              </div>

              <div>
                <span className="text-xs block mb-1 opacity-80">{t.settings.headingColor}:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.colors.textHeading}
                    onChange={e => updateThemeColors({ textHeading: e.target.value })}
                    className="w-8 h-8 rounded border cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono">{theme.colors.textHeading}</span>
                </div>
              </div>

              <div>
                <span className="text-xs block mb-1 opacity-80">{t.settings.bgColor}:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.colors.backgroundPrimary}
                    onChange={e => updateThemeColors({ backgroundPrimary: e.target.value })}
                    className="w-8 h-8 rounded border cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono">{theme.colors.backgroundPrimary}</span>
                </div>
              </div>

              <div>
                <span className="text-xs block mb-1 opacity-80">{t.settings.accentColor}:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.colors.accent}
                    onChange={e => updateThemeColors({ accent: e.target.value })}
                    className="w-8 h-8 rounded border cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono">{theme.colors.accent}</span>
                </div>
              </div>

              <div>
                <span className="text-xs block mb-1 opacity-80">{t.settings.codeTextColor}:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.colors.codeText || '#82b1ff'}
                    onChange={e => updateThemeColors({ codeText: e.target.value })}
                    className="w-8 h-8 rounded border cursor-pointer bg-transparent"
                  />
                  <code
                    className="px-1.5 py-0.5 rounded text-[11px] font-mono border"
                    style={{
                      backgroundColor: 'var(--md-bg-code)',
                      borderColor: 'var(--md-border)',
                      color: theme.colors.codeText || '#82b1ff'
                    }}
                  >
                    `abc`
                  </code>
                  <span className="text-xs font-mono">{theme.colors.codeText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagram Customization */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-3 opacity-70">
              Mermaid Diagrams
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs block mb-1 opacity-80">Diagram Theme:</span>
                <select
                  value={theme.diagram.theme}
                  onChange={e =>
                    updateDiagramTheme({
                      theme: e.target.value as any
                    })
                  }
                  className="w-full p-2 text-xs rounded border outline-none cursor-pointer"
                  style={{
                    backgroundColor: 'var(--md-bg-primary)',
                    borderColor: 'var(--md-border)',
                    color: 'var(--md-text-primary)'
                  }}
                >
                  <option value="dark">Dark</option>
                  <option value="default">Default</option>
                  <option value="forest">Forest (Green)</option>
                  <option value="neutral">Neutral</option>
                  <option value="base">Base (Custom)</option>
                </select>
              </div>

              <div>
                <span className="text-xs block mb-1 opacity-80">Line Color:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.diagram.lineColor || '#6e7a96'}
                    onChange={e => updateDiagramTheme({ lineColor: e.target.value })}
                    className="w-8 h-8 rounded border cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono">{theme.diagram.lineColor || '#6e7a96'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Typography - Phông chữ & Cỡ chữ */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-70">
                <Type size={14} style={{ color: 'var(--md-accent)' }} />
                <span>{t.settings.typography}</span>
              </label>
              <span className="text-[11px] opacity-60">
                5 fonts • Multilingual
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {supportedFonts.map(font => {
                const isSelected =
                  theme.typography.fontId === font.id ||
                  theme.typography.fontFamily === font.fontFamily;

                const fontDesc = t.fonts[font.id]?.description || font.description;

                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() =>
                      updateTypography({
                        fontId: font.id,
                        fontFamily: font.fontFamily,
                        headingFontFamily: font.fontFamily
                      })
                    }
                    className="w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1.5 cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? 'var(--md-bg-active)' : 'var(--md-bg-primary)',
                      borderColor: isSelected ? 'var(--md-accent)' : 'var(--md-border)',
                      color: isSelected ? 'var(--md-accent)' : 'var(--md-text-primary)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-normal not-italic"
                          style={{
                            fontFamily: font.fontFamily,
                            fontWeight: 400,
                            fontStyle: 'normal'
                          }}
                        >
                          {font.name}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded border font-normal not-italic"
                          style={{
                            borderColor: 'var(--md-border)',
                            backgroundColor: 'var(--md-bg-secondary)',
                            color: 'var(--md-text-secondary)',
                            fontWeight: 400,
                            fontStyle: 'normal'
                          }}
                        >
                          {font.provider}
                        </span>
                      </div>
                      {isSelected && <Check size={15} className="shrink-0" />}
                    </div>

                    <div
                      className="text-xs font-normal not-italic opacity-80 truncate"
                      style={{
                        fontFamily: font.fontFamily,
                        fontWeight: 400,
                        fontStyle: 'normal',
                        color: 'var(--md-text-secondary)'
                      }}
                    >
                      {locale === 'vi'
                        ? 'Cộng hòa Xã hội Chủ nghĩa Việt Nam • Markdown Reader 123'
                        : 'The quick brown fox jumps over the lazy dog • Markdown Reader 123'}
                    </div>

                    <div className="text-[11px] opacity-60">
                      {fontDesc}
                    </div>
                  </button>
                );
              })}
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">
              Font Size
            </label>
            <div className="flex items-center gap-3">
              {['14px', '16px', '18px', '20px'].map(size => (
                <button
                  key={size}
                  onClick={() => updateTypography({ fontSize: size })}
                  className="px-3 py-1.5 rounded border text-xs font-medium transition-colors"
                  style={{
                    backgroundColor:
                      theme.typography.fontSize === size ? 'var(--md-bg-active)' : 'var(--md-bg-primary)',
                    borderColor:
                      theme.typography.fontSize === size ? 'var(--md-accent)' : 'var(--md-border)',
                    color:
                      theme.typography.fontSize === size ? 'var(--md-accent)' : 'var(--md-text-primary)'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: 'var(--md-border)', backgroundColor: 'var(--md-bg-primary)' }}
        >
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw size={13} />
            <span>{t.settings.resetDefault}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-medium text-white transition-opacity shadow"
            style={{ backgroundColor: 'var(--md-accent)' }}
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};

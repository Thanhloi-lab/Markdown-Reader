import React from 'react';
import { X, RotateCcw, Palette, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
            <Palette size={18} style={{ color: 'var(--md-accent)' }} />
            <h3 className="font-semibold text-base" style={{ color: 'var(--md-text-heading)' }}>
              Tùy chỉnh Giao diện & Màu sắc động
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
          {/* Preset Themes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5 opacity-70">
              Chủ đề cài sẵn (Theme Presets)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableThemes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t)}
                  className="flex items-center justify-between p-3 rounded-lg border text-left transition-all"
                  style={{
                    backgroundColor: t.id === theme.id ? 'var(--md-bg-active)' : 'var(--md-bg-primary)',
                    borderColor: t.id === theme.id ? 'var(--md-accent)' : 'var(--md-border)',
                    color: t.id === theme.id ? 'var(--md-accent)' : 'var(--md-text-primary)'
                  }}
                >
                  <span className="font-medium text-xs">{t.name}</span>
                  {t.id === theme.id && <Check size={15} />}
                </button>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-3 opacity-70">
              Màu sắc văn bản & Giao diện (Dynamic Colors)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs block mb-1 opacity-80">Màu chữ nội dung:</span>
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
                <span className="text-xs block mb-1 opacity-80">Màu chữ tiêu đề (Heading):</span>
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
                <span className="text-xs block mb-1 opacity-80">Màu nền chính (Reader):</span>
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
                <span className="text-xs block mb-1 opacity-80">Màu điểm nhấn (Accent/TOC):</span>
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
            </div>
          </div>

          {/* Diagram Customization */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-3 opacity-70">
              Tùy chỉnh biểu đồ (Mermaid Diagrams)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs block mb-1 opacity-80">Chủ đề biểu đồ:</span>
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
                <span className="text-xs block mb-1 opacity-80">Màu đường nối (Line Color):</span>
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

          {/* Typography */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">
              Cỡ chữ đọc (Font Size)
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
            <span>Khôi phục mặc định</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-medium text-white transition-opacity shadow"
            style={{ backgroundColor: 'var(--md-accent)' }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

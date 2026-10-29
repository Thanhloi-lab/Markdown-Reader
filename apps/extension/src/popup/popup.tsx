import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Cpu,
  HelpCircle,
  FolderOpen,
  Globe
} from 'lucide-react';
import { I18nProvider, useTranslation } from '@markdown-reader/ui';
import { checkFileSchemeAccess, openExtensionSettings } from '../utils/permissionManager';

export const Popup: React.FC = () => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const { locale, toggleLocale, t } = useTranslation();

  useEffect(() => {
    checkFileSchemeAccess().then(setIsAllowed);

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
          setCurrentUrl(tabs[0].url);
        }
      });
    }
  }, []);

  const isLocalFile = currentUrl.startsWith('file:///');
  const isWebUrl = currentUrl.startsWith('http://') || currentUrl.startsWith('https://');
  const isMarkdown = currentUrl.toLowerCase().includes('.md') || currentUrl.toLowerCase().includes('.markdown');

  const openOnboarding = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('onboarding.html', '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1f242e]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <FileText size={15} />
          </div>
          <span className="font-bold text-sm text-white">{t.extension.appName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#12151c] border border-[#1f242e] text-neutral-300 hover:text-white hover:border-indigo-500 transition-colors cursor-pointer"
            title={`${t.common.language}: ${locale === 'vi' ? 'Tiếng Việt' : 'English'}`}
          >
            {locale.toUpperCase()}
          </button>
          <button
            onClick={openOnboarding}
            className="text-neutral-400 hover:text-white transition-colors"
            title={t.extension.guidePage}
          >
            <HelpCircle size={15} />
          </button>
        </div>
      </div>

      {/* Trạng thái quyền File URL */}
      <div className="p-3 rounded-xl bg-[#12151c] border border-[#1f242e]">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-neutral-400 font-medium">{t.extension.fileAccessPerm}</span>
          {isAllowed ? (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 size={12} /> {t.extension.permissionGranted}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <AlertTriangle size={12} /> {t.extension.permissionDenied}
            </span>
          )}
        </div>

        {!isAllowed && (
          <button
            onClick={openExtensionSettings}
            className="w-full mt-2.5 py-1.5 px-3 rounded-lg text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink size={12} />
            <span>{t.extension.enableInSettings}</span>
          </button>
        )}
      </div>

      {/* Thông tin trang hiện tại */}
      <div className="p-3 rounded-xl bg-[#12151c] border border-[#1f242e] text-xs space-y-2">
        <div className="text-neutral-400 font-medium flex items-center gap-1.5">
          {isLocalFile ? (
            <>
              <FolderOpen size={13} className="text-amber-400" />
              <span>
                {locale === 'vi' ? (
                  <>Chế độ: <strong>File cục bộ (Máy tính)</strong></>
                ) : (
                  <>Mode: <strong>Local File (Computer)</strong></>
                )}
              </span>
            </>
          ) : isWebUrl ? (
            <>
              <Globe size={13} className="text-indigo-400" />
              <span>
                {locale === 'vi' ? (
                  <>Chế độ: <strong>Web URL (Chỉ hiện TOC)</strong></>
                ) : (
                  <>Mode: <strong>Web URL (TOC only)</strong></>
                )}
              </span>
            </>
          ) : (
            <span>{locale === 'vi' ? 'Trạng thái: Sẵn sàng' : 'Status: Ready'}</span>
          )}
        </div>

        {isMarkdown ? (
          <div className="text-[11px] text-emerald-400 font-mono truncate bg-emerald-500/10 py-1 px-2 rounded border border-emerald-500/20">
            {locale === 'vi' ? '✓ Đang đọc tài liệu Markdown' : '✓ Viewing Markdown document'}
          </div>
        ) : (
          <p className="text-[11px] text-neutral-400">
            {locale === 'vi'
              ? 'Mở hoặc kéo thả bất kỳ file .md nào vào trình duyệt để tự động xem dạng formatted.'
              : 'Open or drop any .md file into browser to view formatted.'}
          </p>
        )}
      </div>

      {/* Tối ưu bộ nhớ */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
        <span className="flex items-center gap-1.5">
          <Cpu size={12} className="text-indigo-400" />
          <span>{locale === 'vi' ? 'Tự động dọn RAM khi đổi root:' : 'Auto RAM cleanup:'}</span>
        </span>
        <span className="text-emerald-400 font-semibold">{locale === 'vi' ? 'Hoạt động' : 'Active'}</span>
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <I18nProvider>
      <Popup />
    </I18nProvider>
  );
}

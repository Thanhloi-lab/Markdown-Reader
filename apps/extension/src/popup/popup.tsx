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
import { checkFileSchemeAccess, openExtensionSettings } from '../utils/permissionManager';

export const Popup: React.FC = () => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');

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
          <span className="font-bold text-sm text-white">Markdown Reader</span>
        </div>
        <button
          onClick={openOnboarding}
          className="text-neutral-400 hover:text-white transition-colors"
          title="Trang hướng dẫn"
        >
          <HelpCircle size={15} />
        </button>
      </div>

      {/* Trạng thái quyền File URL */}
      <div className="p-3 rounded-xl bg-[#12151c] border border-[#1f242e]">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-neutral-400 font-medium">Quyền đọc file máy tính:</span>
          {isAllowed ? (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 size={12} /> Đã bật
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <AlertTriangle size={12} /> Chưa bật
            </span>
          )}
        </div>

        {!isAllowed && (
          <button
            onClick={openExtensionSettings}
            className="w-full mt-2.5 py-1.5 px-3 rounded-lg text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink size={12} />
            <span>Kích hoạt trong Cài đặt</span>
          </button>
        )}
      </div>

      {/* Thông tin trang hiện tại */}
      <div className="p-3 rounded-xl bg-[#12151c] border border-[#1f242e] text-xs space-y-2">
        <div className="text-neutral-400 font-medium flex items-center gap-1.5">
          {isLocalFile ? (
            <>
              <FolderOpen size={13} className="text-amber-400" />
              <span>Chế độ: <strong>File cục bộ (Máy tính)</strong></span>
            </>
          ) : isWebUrl ? (
            <>
              <Globe size={13} className="text-indigo-400" />
              <span>Chế độ: <strong>Web URL (Chỉ hiện TOC)</strong></span>
            </>
          ) : (
            <span>Trạng thái: Sẵn sàng</span>
          )}
        </div>

        {isMarkdown ? (
          <div className="text-[11px] text-emerald-400 font-mono truncate bg-emerald-500/10 py-1 px-2 rounded border border-emerald-500/20">
            ✓ Đang đọc tài liệu Markdown
          </div>
        ) : (
          <p className="text-[11px] text-neutral-400">
            Mở hoặc kéo thả bất kỳ file <code>.md</code> nào vào trình duyệt để tự động xem dạng formatted.
          </p>
        )}
      </div>

      {/* Tối ưu bộ nhớ */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
        <span className="flex items-center gap-1.5">
          <Cpu size={12} className="text-indigo-400" />
          <span>Tự động dọn RAM khi đổi root:</span>
        </span>
        <span className="text-emerald-400 font-semibold">Hoạt động</span>
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Popup />);
}

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  FileText,
  Sparkles
} from 'lucide-react';
import { checkFileSchemeAccess, openExtensionSettings } from '../utils/permissionManager';

export const Onboarding: React.FC = () => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const performCheck = async () => {
    setIsChecking(true);
    const allowed = await checkFileSchemeAccess();
    setIsAllowed(allowed);
    setIsChecking(false);
  };

  useEffect(() => {
    performCheck();
    // Tự động kiểm tra lại khi người dùng quay lại tab này từ trang chrome://extensions
    window.addEventListener('focus', performCheck);
    return () => window.removeEventListener('focus', performCheck);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <FileText size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Markdown Reader <Sparkles size={18} className="text-amber-400" />
          </h1>
          <p className="text-xs text-neutral-400">Trình đọc và định dạng Markdown đa nền tảng</p>
        </div>
      </div>

      {/* Card trạng thái chính */}
      <div className="bg-[#12151c] border border-[#1f242e] rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              isAllowed
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {isAllowed ? <CheckCircle2 size={26} /> : <ShieldAlert size={26} />}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-1">
              {isAllowed
                ? 'Đã bật quyền truy cập file máy tính thành công!'
                : 'Yêu cầu kích hoạt: Cho phép truy cập vào các URL của tệp'}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isAllowed
                ? 'Bạn đã sẵn sàng! Bây giờ bất cứ khi nào bạn mở file .md hoặc kéo thả file từ máy tính vào trình duyệt, tiện ích sẽ tự động định dạng và nạp cây thư mục đầy đủ.'
                : 'Trình duyệt Chromium (Chrome/Edge/Brave) yêu cầu bạn bật tùy chọn "Allow access to file URLs" để tiện ích có thể đọc và định dạng các file .md trực tiếp từ ổ đĩa của bạn.'}
            </p>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              {!isAllowed ? (
                <button
                  onClick={openExtensionSettings}
                  className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
                >
                  <ExternalLink size={14} />
                  <span>Mở trang Cài đặt để Bật quyền</span>
                </button>
              ) : null}

              <button
                onClick={performCheck}
                disabled={isChecking}
                className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-medium bg-[#161c27] hover:bg-[#1f2635] text-neutral-300 border border-[#2b3548] transition-all"
              >
                <RefreshCw size={13} className={isChecking ? 'animate-spin text-indigo-400' : ''} />
                <span>{isChecking ? 'Đang kiểm tra...' : 'Kiểm tra lại quyền'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hướng dẫn 3 bước */}
      {!isAllowed && (
        <div className="bg-[#12151c] border border-[#1f242e] rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-neutral-400">
            Hướng dẫn bật quyền trong 30 giây
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <p className="text-white font-medium">Nhấp nút "Mở trang Cài đặt để Bật quyền" ở trên</p>
                <p className="text-neutral-400 mt-0.5">Trình duyệt sẽ mở trang thông tin chi tiết của tiện ích Markdown Reader.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <p className="text-white font-medium">Cuộn xuống và tìm mục: <code className="text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">Allow access to file URLs</code></p>
                <p className="text-neutral-400 mt-0.5">(Hoặc tiếng Việt: <em>"Cho phép truy cập vào các URL của tệp"</em>)</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <p className="text-white font-medium">Gạt công tắc sang BẬT (ON)</p>
                <p className="text-neutral-400 mt-0.5">Quay lại đây và bạn sẽ thấy trạng thái chuyển sang màu xanh ngay lập tức!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Khối giới thiệu tính năng thông minh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-[#1f242e] bg-[#12151c]/60">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <ExternalLink size={14} />
            <span>Chế độ Web URL</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Tự động format khi đọc link Markdown online trên web. Tối ưu hiển thị gọn gàng, chỉ bật mục lục TOC và ẩn cây thư mục.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-[#1f242e] bg-[#12151c]/60">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <FolderOpen size={14} />
            <span>Chế độ File máy tính</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Tự động nạp cây thư mục đa tầng, ghi nhớ file ghim và tự động giải phóng RAM khi chuyển sang dự án khác.
          </p>
        </div>
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Onboarding />);
}

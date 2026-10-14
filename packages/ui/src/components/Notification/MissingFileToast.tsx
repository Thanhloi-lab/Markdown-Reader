import React from 'react';
import { AlertCircle, FolderPlus, X } from 'lucide-react';

interface MissingFileToastProps {
  missingPath: string | null;
  onClose: () => void;
  onAddFolder?: () => void;
}

export const MissingFileToast: React.FC<MissingFileToastProps> = ({
  missingPath,
  onClose,
  onAddFolder
}) => {
  if (!missingPath) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-200 select-none font-sans">
      <div
        className="p-4 rounded-xl shadow-2xl border flex flex-col gap-3 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--md-bg-secondary)',
          borderColor: 'rgba(239, 68, 68, 0.4)',
          color: 'var(--md-text-primary)'
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-400">
                Không tìm thấy tệp trong Workspace
              </h4>
              <p className="text-xs leading-relaxed mt-1 opacity-80 break-all">
                Liên kết trỏ tới tệp <code className="px-1.5 py-0.5 rounded font-mono bg-black/20 text-indigo-400">{missingPath}</code> nhưng tệp này chưa nằm trong bất kỳ thư mục nào bạn đang mở.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-white/10 transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--md-border-muted)' }}>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs transition-colors hover:bg-white/5 opacity-70 hover:opacity-100"
          >
            Bỏ qua
          </button>
          {onAddFolder && (
            <button
              onClick={() => {
                onClose();
                onAddFolder();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white shadow-xs transition-opacity hover:opacity-95"
              style={{ backgroundColor: 'var(--md-accent)' }}
            >
              <FolderPlus size={13} />
              <span>Thêm thư mục chứa tệp này...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

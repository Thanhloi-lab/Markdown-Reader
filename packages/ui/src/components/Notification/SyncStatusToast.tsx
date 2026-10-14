import React from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, X } from 'lucide-react';

export type SyncToastType = 'success' | 'updated' | 'deleted';

export interface SyncNotification {
  id: string;
  type: SyncToastType;
  message: string;
}

interface SyncStatusToastProps {
  notifications: SyncNotification[];
  onDismiss: (id: string) => void;
}

export const SyncStatusToast: React.FC<SyncStatusToastProps> = ({
  notifications,
  onDismiss
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm w-full select-none font-sans">
      {notifications.map(n => {
        let borderClass = 'border-emerald-500/40';
        let IconComp = CheckCircle;
        let iconColor = '#10b981';

        if (n.type === 'updated') {
          borderClass = 'border-indigo-500/40';
          IconComp = RefreshCw;
          iconColor = '#6366f1';
        } else if (n.type === 'deleted') {
          borderClass = 'border-amber-500/40';
          IconComp = AlertTriangle;
          iconColor = '#f59e0b';
        }

        return (
          <div
            key={n.id}
            className={`p-3 rounded-xl shadow-xl border flex items-center justify-between gap-3 backdrop-blur-md animate-in slide-in-from-left-4 fade-in duration-200 ${borderClass}`}
            style={{
              backgroundColor: 'var(--md-bg-secondary)',
              color: 'var(--md-text-primary)'
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <IconComp size={16} style={{ color: iconColor }} className="shrink-0" />
              <span className="text-xs leading-snug truncate" title={n.message}>
                {n.message}
              </span>
            </div>
            <button
              onClick={() => onDismiss(n.id)}
              className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

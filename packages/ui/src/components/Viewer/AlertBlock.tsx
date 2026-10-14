import React from 'react';
import { Info, Lightbulb, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

export type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution';

interface AlertBlockProps {
  type: AlertType;
  title?: string;
  children: React.ReactNode;
}

const alertConfig: Record<
  AlertType,
  {
    icon: React.ElementType;
    borderColor: string;
    bgColor: string;
    textColor: string;
    titleDefault: string;
  }
> = {
  note: {
    icon: Info,
    borderColor: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    textColor: '#60a5fa',
    titleDefault: 'Lưu ý (Note)'
  },
  tip: {
    icon: Lightbulb,
    borderColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    textColor: '#34d399',
    titleDefault: 'Mẹo hữu ích (Tip)'
  },
  important: {
    icon: AlertCircle,
    borderColor: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.08)',
    textColor: '#a78bfa',
    titleDefault: 'Quan trọng (Important)'
  },
  warning: {
    icon: AlertTriangle,
    borderColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    textColor: '#fbbf24',
    titleDefault: 'Cảnh báo (Warning)'
  },
  caution: {
    icon: ShieldAlert,
    borderColor: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    textColor: '#f87171',
    titleDefault: 'Nguy hiểm (Caution)'
  }
};

export const AlertBlock: React.FC<AlertBlockProps> = ({ type, title, children }) => {
  const config = alertConfig[type] || alertConfig.note;
  const IconComponent = config.icon;

  return (
    <div
      className="my-5 p-4 rounded-r-lg border-l-4 text-sm leading-relaxed"
      style={{
        borderLeftColor: config.borderColor,
        backgroundColor: config.bgColor
      }}
    >
      <div className="flex items-center gap-2 font-semibold mb-2" style={{ color: config.textColor }}>
        <IconComponent size={16} />
        <span>{title || config.titleDefault}</span>
      </div>
      <div className="opacity-90">{children}</div>
    </div>
  );
};

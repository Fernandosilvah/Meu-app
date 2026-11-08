import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Render Container positioned inside max-w-lg mobile viewport */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pointer-events-none z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          let bgClass = 'bg-[#EEF4FD] text-[#1F66C4] border-[#C3D8F7]';
          let IconComponent = Info;

          if (toast.type === 'success') {
            bgClass = 'bg-[#E9F7F1] text-[#0F7A52] border-[#A9DFC7]';
            IconComponent = CheckCircle2;
          } else if (toast.type === 'error') {
            bgClass = 'bg-[#FDF0EF] text-[#C62F2A] border-[#F6C3C0]';
            IconComponent = AlertCircle;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-[#FDF6E7] text-[#9A6A0F] border-[#F0DBA6]';
            IconComponent = AlertTriangle;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-[12px] border text-sm font-medium shadow-md transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${bgClass}`}
            >
              <div className="flex items-center gap-2.5">
                <IconComponent className="w-5 h-5 shrink-0" />
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-full hover:bg-black/5 active:scale-95 transition-colors"
                aria-label="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

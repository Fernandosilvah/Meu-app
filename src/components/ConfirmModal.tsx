import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Confirmação',
  message,
  confirmLabel = 'Sim, continuar',
  cancelLabel = 'Voltar',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Push history state so back button closes modal
    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCancelClick = () => {
    // If we pushed state, back up in history
    if (window.history.state?.modalOpen) {
      window.history.back();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#FDFDFE] rounded-[18px] p-5 shadow-2xl animate-in zoom-in-95 duration-200 border border-[#E3E6EC]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-full ${isDestructive ? 'bg-[#FDF0EF] text-[#C62F2A]' : 'bg-[#E8F0FD] text-[#1A5FD6]'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#0D0F14]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={isLoading}
            className="p-1 rounded-full text-[#5B6472] hover:bg-black/5 active:scale-95 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#5B6472] leading-relaxed mb-6">{message}</p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full h-14 rounded-[12px] font-semibold text-sm transition-all flex items-center justify-center ${
              isDestructive
                ? 'bg-[#C62F2A] hover:bg-[#b02824] text-white active:scale-[0.98]'
                : 'bg-[#1A5FD6] hover:bg-[#1450B8] text-white active:scale-[0.98]'
            } disabled:opacity-50`}
          >
            {isLoading ? 'Aguarde...' : confirmLabel}
          </button>

          <button
            type="button"
            onClick={handleCancelClick}
            disabled={isLoading}
            className="w-full h-12 rounded-[12px] font-medium text-sm text-[#0D0F14] bg-transparent hover:bg-black/5 active:scale-[0.98] transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

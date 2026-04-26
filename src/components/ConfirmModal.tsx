import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="glass w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-2xl ${danger ? 'bg-danger/20' : 'bg-primary/20'}`}>
            <AlertTriangle className={danger ? 'text-danger' : 'text-primary'} size={20} />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-white/5 rounded-2xl text-white/60 font-semibold active:scale-95 transition-transform"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-2xl font-bold text-white active:scale-95 transition-transform shadow-lg ${
              danger
                ? 'bg-danger shadow-danger/20'
                : 'bg-primary shadow-primary/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

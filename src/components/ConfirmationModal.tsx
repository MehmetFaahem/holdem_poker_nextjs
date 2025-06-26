"use client";

import { useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonStyle = "primary",
  onConfirm,
  onCancel,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getConfirmButtonStyles = () => {
    switch (confirmButtonStyle) {
      case "danger":
        return "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border-red-400/30 text-white";
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-amber-400/30 text-white";
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border-blue-400/30 text-white";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-slideInUp">
        <div className="glass-dark border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              {confirmButtonStyle === "danger" && (
                <div className="w-8 h-8 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
                  <span className="text-red-400 text-sm">⚠️</span>
                </div>
              )}
              {confirmButtonStyle === "warning" && (
                <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
                  <span className="text-amber-400 text-sm">⚠️</span>
                </div>
              )}
              {confirmButtonStyle === "primary" && (
                <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 text-sm">ℹ️</span>
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-300 text-base leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg border ${getConfirmButtonStyles()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { toast } from "react-toastify";

// Track recent messages to prevent duplicates
const recentMessages = new Map<string, number>();
const DUPLICATE_TIMEOUT = 3000; // 3 seconds

const shouldShowToast = (message: string): boolean => {
  const now = Date.now();
  const lastShown = recentMessages.get(message);

  if (lastShown && now - lastShown < DUPLICATE_TIMEOUT) {
    return false; // Don't show duplicate within timeout period
  }

  recentMessages.set(message, now);

  // Clean up old entries
  for (const [msg, timestamp] of recentMessages.entries()) {
    if (now - timestamp > DUPLICATE_TIMEOUT) {
      recentMessages.delete(msg);
    }
  }

  return true;
};

export const showToast = {
  success: (message: string) => {
    if (!shouldShowToast(message)) return;

    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      className:
        "!bg-green-500/20 !border !border-green-500/30 !text-green-400 !backdrop-blur-sm",
      progressClassName: "!bg-green-500",
    });
  },

  error: (message: string) => {
    if (!shouldShowToast(message)) return;

    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      className:
        "!bg-red-500/20 !border !border-red-500/30 !text-red-400 !backdrop-blur-sm",
      progressClassName: "!bg-red-500",
    });
  },

  warning: (message: string) => {
    if (!shouldShowToast(message)) return;

    toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      className:
        "!bg-amber-500/20 !border !border-amber-500/30 !text-amber-400 !backdrop-blur-sm",
      progressClassName: "!bg-amber-500",
    });
  },

  info: (message: string) => {
    if (!shouldShowToast(message)) return;

    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      className:
        "!bg-blue-500/20 !border !border-blue-500/30 !text-blue-400 !backdrop-blur-sm",
      progressClassName: "!bg-blue-500",
    });
  },

  // Custom poker-specific toasts
  chips: (message: string) => {
    if (!shouldShowToast(message)) return;

    toast.error(`💰 ${message}`, {
      position: "top-right",
      autoClose: 4000,
      className:
        "!bg-purple-500/20 !border !border-purple-500/30 !text-purple-400 !backdrop-blur-sm",
      progressClassName: "!bg-purple-500",
    });
  },

  action: (message: string) => {
    if (!shouldShowToast(message)) return;

    toast.info(`🎲 ${message}`, {
      position: "top-right",
      autoClose: 2000,
      className:
        "!bg-cyan-500/20 !border !border-cyan-500/30 !text-cyan-400 !backdrop-blur-sm",
      progressClassName: "!bg-cyan-500",
    });
  },

  gameUpdate: (message: string) => {
    if (!shouldShowToast(message)) return;

    toast.success(`🃏 ${message}`, {
      position: "top-center",
      autoClose: 2000,
      className:
        "!bg-emerald-500/20 !border !border-emerald-500/30 !text-emerald-400 !backdrop-blur-sm",
      progressClassName: "!bg-emerald-500",
    });
  },
};

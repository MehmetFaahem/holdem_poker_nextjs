"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ConfirmationModal } from "@/components/ConfirmationModal";

interface ConfirmationModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: "danger" | "warning" | "primary";
}

interface ConfirmationModalContextType {
  showConfirmation: (options: ConfirmationModalOptions) => Promise<boolean>;
}

const ConfirmationModalContext = createContext<
  ConfirmationModalContextType | undefined
>(undefined);

/**
 * Hook to use the global confirmation modal
 *
 * @example
 * ```tsx
 * const { showConfirmation } = useConfirmationModal();
 *
 * const handleDelete = async () => {
 *   const confirmed = await showConfirmation({
 *     title: "Delete Item",
 *     message: "Are you sure you want to delete this item?",
 *     confirmText: "Delete",
 *     cancelText: "Cancel",
 *     confirmButtonStyle: "danger"
 *   });
 *
 *   if (confirmed) {
 *     // Proceed with deletion
 *   }
 * };
 * ```
 */
export const useConfirmationModal = () => {
  const context = useContext(ConfirmationModalContext);
  if (!context) {
    throw new Error(
      "useConfirmationModal must be used within a ConfirmationModalProvider"
    );
  }
  return context;
};

interface ConfirmationModalProviderProps {
  children: ReactNode;
}

/**
 * Provider component that makes the confirmation modal available globally
 * This should be wrapped around your app in the layout.tsx file
 */
export const ConfirmationModalProvider: React.FC<
  ConfirmationModalProviderProps
> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<ConfirmationModalOptions>({
    title: "",
    message: "",
  });
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showConfirmation = (
    options: ConfirmationModalOptions
  ): Promise<boolean> => {
    setModalOptions(options);
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  };

  return (
    <ConfirmationModalContext.Provider value={{ showConfirmation }}>
      {children}
      <ConfirmationModal
        isOpen={isOpen}
        title={modalOptions.title}
        message={modalOptions.message}
        confirmText={modalOptions.confirmText}
        cancelText={modalOptions.cancelText}
        confirmButtonStyle={modalOptions.confirmButtonStyle}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationModalContext.Provider>
  );
};

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ErrorModal } from "@/components/ConfirmDialog";

interface ErrorContextType {
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title?: string;
    message: string;
    type: "error" | "warning" | "info" | "success";
  }>({
    open: false,
    message: "",
    type: "error",
  });

  const showError = (message: string, title?: string) => {
    setErrorModal({
      open: true,
      message,
      title,
      type: "error",
    });
  };

  const showSuccess = (message: string, title?: string) => {
    setErrorModal({
      open: true,
      message,
      title,
      type: "success",
    });
  };

  const showWarning = (message: string, title?: string) => {
    setErrorModal({
      open: true,
      message,
      title,
      type: "warning",
    });
  };

  const showInfo = (message: string, title?: string) => {
    setErrorModal({
      open: true,
      message,
      title,
      type: "info",
    });
  };

  return (
    <ErrorContext.Provider value={{ showError, showSuccess, showWarning, showInfo }}>
      {children}
      <ErrorModal
        open={errorModal.open}
        onOpenChange={(open) => setErrorModal({ ...errorModal, open })}
        title={errorModal.title}
        message={errorModal.message}
        type={errorModal.type}
      />
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}

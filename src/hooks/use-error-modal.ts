import { useState } from "react";

interface ErrorModalState {
  open: boolean;
  title?: string;
  message: string;
  type: "error" | "warning" | "info" | "success";
}

export function useErrorModal() {
  const [errorModal, setErrorModal] = useState<ErrorModalState>({
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

  const closeModal = () => {
    setErrorModal({ ...errorModal, open: false });
  };

  return {
    errorModal,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    closeModal,
    setErrorModal,
  };
}

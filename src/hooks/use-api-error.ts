import { useError } from "@/contexts/ErrorContext";
import { ApiError } from "@/services/api";

export function useApiError() {
  const { showError, showWarning, showInfo } = useError();

  const handleApiError = (error: unknown) => {
    const apiError = error as ApiError;
    
    if (apiError.type === "warning") {
      showWarning(apiError.message);
    } else if (apiError.type === "info") {
      showInfo(apiError.message);
    } else {
      showError(apiError.message);
    }
  };

  return { handleApiError };
}

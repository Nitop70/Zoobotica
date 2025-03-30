import { useState } from "react";

interface UseGeminiProps {
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
}

export function useGemini({ onSuccess, onError }: UseGeminiProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = async (prompt: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate content");
      }

      const data = await response.json();
      onSuccess?.(data.response);
      return data.response;
    } catch (err: any) {
      const error = new Error(err.message || "Failed to generate content");
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generate,
    isLoading,
    error,
  };
}

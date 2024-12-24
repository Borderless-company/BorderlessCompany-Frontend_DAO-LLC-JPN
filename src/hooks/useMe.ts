import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

export const useMe = () => {
  const {
    data: me,
    error,
    isLoading,
    isError,
    refetch
  } = useQuery<{isLogin: boolean} | null, Error>({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error || "Failed to fetch current user");
      }
      const data = await response.json();
      return data;
    },
  });

  return { me, error, isLoading, isError, refetch };
};

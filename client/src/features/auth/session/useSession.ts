import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@entities/user/api/userApi";
import { isApiSuccess } from "@shared/types/api";

export const SESSION_QUERY_KEY = ["session"] as const;

/** Current authenticated user, backed by GET /api/auth/me (session_status.php equivalent). */
export function useSession() {
  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const result = await userApi.me();
      return isApiSuccess(result) ? result.data.user : null;
    },
    retry: false,
    staleTime: 60_000,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: Boolean(query.data),
  };
}

export function useInvalidateSession() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
}

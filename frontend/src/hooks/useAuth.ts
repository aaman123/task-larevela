import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  UserProfileResponse,
  UserProfileUpdateRequest,
  UserProfileUpdateResponse,
} from "../types";

const ME_KEY = ["auth", "me"] as const;

/** Fetch the signed-in user's profile (used to gate auth state). */
export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: () => api.get<UserProfileResponse>("/api/v1/users/me"),
    retry: false, // a 401 is not a transient error
    staleTime: 5 * 60_000, // re-fetch every 5 min in the background
  });
}

/** POST /api/v1/auth/login */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequest) =>
      api.post<LoginResponse>("/api/v1/auth/login", body),
    onSuccess: () => {
      // Invalidate so useMe re-fetches and the app knows the user is now logged in
      queryClient.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}

/** POST /api/v1/auth/logout */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<LogoutResponse>("/api/v1/auth/logout"),
    onSuccess: () => {
      queryClient.clear(); // wipe all cached data on logout
    },
  });
}

/** PUT /api/v1/users/me */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UserProfileUpdateRequest) =>
      api.put<UserProfileUpdateResponse>("/api/v1/users/me", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}

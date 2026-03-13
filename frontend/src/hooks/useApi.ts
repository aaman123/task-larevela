import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type {
  WebsiteListResponse,
  WebsiteDetailResponse,
  WebsiteCreateRequest,
  WebsiteCreateResponse,
  WebsiteUpdateRequest,
  WebsiteDeleteResponse,
} from "../types";

const WEBSITES_KEY = ["websites"] as const;

/** GET /api/v1/websites – paginated list */
export function useWebsites(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...WEBSITES_KEY, params],
    queryFn: () =>
      api.get<WebsiteListResponse>("/api/v1/websites", {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

/** GET /api/v1/websites/:id – detail */
export function useWebsite(id: string | null) {
  return useQuery({
    queryKey: [...WEBSITES_KEY, id],
    queryFn: () => api.get<WebsiteDetailResponse>(`/api/v1/websites/${id}`),
    enabled: !!id,
  });
}

/** POST /api/v1/websites */
export function useCreateWebsite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: WebsiteCreateRequest) =>
      api.post<WebsiteCreateResponse>("/api/v1/websites", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WEBSITES_KEY }),
  });
}

/** PUT /api/v1/websites/:id */
export function useUpdateWebsite(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: WebsiteUpdateRequest) =>
      api.put<WebsiteDetailResponse>(`/api/v1/websites/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WEBSITES_KEY }),
  });
}

/** DELETE /api/v1/websites/:id */
export function useDeleteWebsite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<WebsiteDeleteResponse>(`/api/v1/websites/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WEBSITES_KEY }),
  });
}

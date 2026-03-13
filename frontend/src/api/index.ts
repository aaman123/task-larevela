/**
 * API module – export client and (when available) generated types from Swagger/OpenAPI.
 */

export { api, apiRequest, isApiError } from "./client";
export type { RequestConfig, ApiError } from "./client";

// When you have OpenAPI types/codegen, re-export here, e.g.:
// export * from './generated';

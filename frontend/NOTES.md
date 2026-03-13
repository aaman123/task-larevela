# Notes – Design Decisions & Future Improvements

## Design Decisions

### API Client

- **Fetch over axios**: Used the native `fetch` API (already in the scaffold) with `credentials: 'include'` for session-cookie auth. This avoids an extra dependency and keeps the bundle lean.
- **No codegen**: The OpenAPI spec is clean with clear naming — hand-writing the types from it was faster and more readable than setting up `orval` or `openapi-typescript-codegen` for a focused task scope. With more time, I'd add `orval` to auto-generate types + React Query hooks and keep them in sync with the spec automatically.
- **React Query**: `@tanstack/react-query` v5 for server-state management — handles caching, background refetching, loading/error states, and cache invalidation after mutations out of the box.

### Auth Strategy

- On app load, `GET /api/v1/users/me` determines whether the user is logged in (200 → logged in, 401 → redirect to `/login`). This is a standard session-check pattern that avoids storing tokens in `localStorage`.
- `useMe` has `retry: false` because a 401 is not a transient error — retrying it just adds latency before showing the login screen.
- On logout, `queryClient.clear()` wipes all cached data so the next user starts clean.

### Routing

- `react-router-dom` v7 with auth-gated routes. A `<Navigate>` wrapper pattern is used rather than a higher-order component, keeping routes declarative and easy to follow.

### Blockchain

- Used **viem** (already in the scaffold) over ethers.js — it's TypeScript-first, tree-shakeable, and has better type inference for ABIs. `wagmi` would be more ergonomic but adds a larger dependency footprint not warranted for a single page.

---

## What I'd Improve With More Time

1. **OpenAPI codegen**: Set up `orval` to auto-generate typed hooks from `docs/api-spec.json`. Types would never drift from the API.
2. **AuthContext**: Elevate user session state into a React context so any component can read `currentUser` without a hook call.
3. **Error toasts**: Replace inline `ErrorMessage` components with a toast system (e.g. `sonner`) for non-blocking, dismissible error notifications.
4. **Request cancellation**: Add AbortController support in `apiRequest` to cancel in-flight requests on unmount, avoiding state-update-on-unmounted-component warnings.
5. **Optimistic updates**: For website delete/update, apply optimistic UI updates so the list reflects changes immediately before the server confirms.
6. **Testing**: Add Vitest + React Testing Library for unit tests on hooks, and Playwright for end-to-end auth + CRUD flows.
7. **Refresh token handling**: Implement a 401 interceptor that triggers token refresh before retrying the original request (if the API supports refresh tokens).
8. **Account ID on create**: Currently the `POST /api/v1/websites` endpoint requires an `account_id`. The cleaner solution is to read it from the `GET /api/v1/users/me` response and store it in auth context, rather than deriving it from the existing websites list.
9. **Accessibility**: Add ARIA labels, focus management on modal/form open, and keyboard navigation for the websites table.
10. **Pagination UI**: The websites list fetches the first 20 items. With more time, I'd add a paginated table with next/prev controls driven by the API's `pagination.has_next` flag.

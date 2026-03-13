import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage, WebsitesPage, ProfilePage, BlockchainDemo } from "./pages";
import { useMe, useLogout } from "./hooks";
import { Loading } from "./components";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401 – user needs to log in
        if ((error as { status?: number })?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const { data, isLoading } = useMe();
  const isLoggedIn = !!data?.data?.user_id;

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Loading />
      </div>
    );
  }

  return (
    <>
      {isLoggedIn && <NavBar />}
      <div className={isLoggedIn ? "main-content" : ""}>
        <Routes>
          <Route
            path="/login"
            element={
              isLoggedIn ? <Navigate to="/websites" replace /> : <LoginPage />
            }
          />
          <Route
            path="/websites"
            element={
              isLoggedIn ? <WebsitesPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/profile"
            element={
              isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/blockchain"
            element={
              isLoggedIn ? <BlockchainDemo /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="*"
            element={
              <Navigate to={isLoggedIn ? "/websites" : "/login"} replace />
            }
          />
        </Routes>
      </div>
    </>
  );
}

function NavBar() {
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate("/login") });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="url(#brandGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        LaRevela
      </div>
      <div className="navbar-links">
        <NavLink to="/websites" className="nav-link">
          Websites
        </NavLink>
        <NavLink to="/profile" className="nav-link">
          Profile
        </NavLink>
        <NavLink to="/blockchain" className="nav-link">
          Blockchain
        </NavLink>
        <button
          className="logout-btn"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          {logout.isPending ? "Logging out…" : "Logout"}
        </button>
      </div>
    </nav>
  );
}

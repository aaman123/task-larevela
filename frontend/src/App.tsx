import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Loading />
      </div>
    );
  }

  return (
    <>
      {isLoggedIn && <NavBar />}
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/websites" replace /> : <LoginPage />} />
        <Route path="/websites" element={isLoggedIn ? <WebsitesPage /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />} />
        <Route path="/blockchain" element={isLoggedIn ? <BlockchainDemo /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={isLoggedIn ? "/websites" : "/login"} replace />} />
      </Routes>
    </>
  );
}

function NavBar() {
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate("/login") });
  };

  const linkStyle: React.CSSProperties = { color: "inherit", textDecoration: "none", fontWeight: 500 };
  const activeStyle: React.CSSProperties = { ...linkStyle, textDecoration: "underline" };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>LaRevela</span>
      <div style={styles.links}>
        <NavLink to="/websites" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Websites</NavLink>
        <NavLink to="/profile" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Profile</NavLink>
        <NavLink to="/blockchain" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Blockchain</NavLink>
      </div>
      <button style={styles.logoutBtn} onClick={handleLogout} disabled={logout.isPending}>
        {logout.isPending ? "Logging out…" : "Logout"}
      </button>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    padding: "0.875rem 2rem",
    background: "#0f172a",
    color: "#f8fafc",
    fontSize: "0.9rem",
  },
  brand: { fontWeight: 700, fontSize: "1.1rem", marginRight: "auto" },
  links: { display: "flex", gap: "1.25rem" },
  logoutBtn: {
    padding: "0.4rem 0.875rem",
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
};

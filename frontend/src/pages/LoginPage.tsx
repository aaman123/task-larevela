import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks";
import { ErrorMessage } from "../components";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password, remember_me: false },
      { onSuccess: () => navigate("/websites") },
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>LaRevela</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {login.isError && (
          <ErrorMessage
            message={
              login.error instanceof Error
                ? login.error.message
                : "Sign in failed"
            }
            onDismiss={() => login.reset()}
          />
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label style={styles.label}>
            Email
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={styles.input}
              placeholder="you@example.com"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={8}
              style={styles.input}
              placeholder="••••••••"
            />
          </label>

          <button
            id="sign-in-btn"
            type="submit"
            disabled={login.isPending || !email || !password}
            style={{
              ...styles.btn,
              opacity: login.isPending || !email || !password ? 0.6 : 1,
            }}
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)",
    padding: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    margin: "0 0 0.25rem",
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  subtitle: {
    margin: "0 0 1.75rem",
    color: "#64748b",
    fontSize: "0.95rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "0.625rem 0.875rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.15s",
  },
  btn: {
    marginTop: "0.5rem",
    padding: "0.7rem 1rem",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
  },
};

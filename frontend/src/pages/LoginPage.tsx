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
    <div className="auth-page">
      <div className="card auth-card">
        <h1
          style={{
            background: "var(--brand-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            marginBottom: "0.5rem",
          }}
        >
          LaRevela
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            marginBottom: "2rem",
          }}
        >
          Sign in to your account
        </p>

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

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          noValidate
        >
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontWeight: 500,
            }}
          >
            Email
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontWeight: 500,
            }}
          >
            Password
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={8}
              placeholder="••••••••"
            />
          </label>

          <button
            id="sign-in-btn"
            type="submit"
            disabled={login.isPending || !email || !password}
            style={{
              marginTop: "0.5rem",
              background: "var(--brand-gradient)",
              color: "#fff",
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

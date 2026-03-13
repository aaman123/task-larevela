import { useState, type FormEvent } from "react";
import { useMe, useUpdateProfile } from "../hooks";
import { ErrorMessage, Loading } from "../components";
import type { UserProfileUpdateRequest } from "../types";

export function ProfilePage() {
  const { data: meData, isLoading, error } = useMe();
  const updateProfile = useUpdateProfile();

  const profile = meData?.data;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserProfileUpdateRequest>({});
  const [saved, setSaved] = useState(false);

  const startEdit = () => {
    setForm({
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      job_title: profile?.job_title ?? "",
      phone: profile?.phone ?? "",
      department: profile?.department ?? "",
    });
    setEditing(true);
    setSaved(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(form, {
      onSuccess: () => {
        setEditing(false);
        setSaved(true);
      },
    });
  };

  if (isLoading) return <Loading />;
  if (error)
    return (
      <ErrorMessage
        message={
          error instanceof Error ? error.message : "Failed to load profile"
        }
      />
    );
  if (!profile) return null;

  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—";

  return (
    <div className="fade-in">
      <div className="card" style={{ maxWidth: "560px", margin: "0 auto" }}>
        <div style={styles.header}>
          <div style={styles.avatar}>
            {(profile.first_name?.[0] ?? profile.email[0]).toUpperCase()}
          </div>
          <div>
            <h2 style={styles.name}>{fullName}</h2>
            <p style={styles.email}>{profile.email}</p>
            {profile.role && <span style={styles.badge}>{profile.role}</span>}
          </div>
        </div>

        {!editing ? (
          <>
            <dl style={styles.dl}>
              {[
                ["Job Title", profile.job_title],
                ["Department", profile.department],
                ["Phone", profile.phone],
                ["Account", profile.account_name],
                ["Timezone", profile.timezone],
              ].map(([label, value]) => (
                <div key={label} style={styles.dlRow}>
                  <dt style={styles.dt}>{label}</dt>
                  <dd style={styles.dd}>{value || "—"}</dd>
                </div>
              ))}
            </dl>
            {saved && <p style={styles.savedMsg}>✓ Profile updated</p>}
            <button
              id="edit-profile-btn"
              style={{ background: "#f1f5f9", color: "#334155" }}
              onClick={startEdit}
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {updateProfile.isError && (
              <ErrorMessage
                message={
                  updateProfile.error instanceof Error
                    ? updateProfile.error.message
                    : "Update failed"
                }
                onDismiss={() => updateProfile.reset()}
              />
            )}
            {[
              { key: "first_name", label: "First Name", type: "text" },
              { key: "last_name", label: "Last Name", type: "text" },
              { key: "job_title", label: "Job Title", type: "text" },
              { key: "department", label: "Department", type: "text" },
              { key: "phone", label: "Phone", type: "tel" },
            ].map(({ key, label, type }) => (
              <label
                key={key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  fontWeight: 500,
                }}
              >
                {label}
                <input
                  id={`profile-${key}`}
                  type={type}
                  value={
                    (form[key as keyof UserProfileUpdateRequest] as string) ??
                    ""
                  }
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                />
              </label>
            ))}
            <div style={styles.actions}>
              <button
                id="save-profile-btn"
                type="submit"
                disabled={updateProfile.isPending}
                style={{ background: "#3b82f6", color: "#fff" }}
              >
                {updateProfile.isPending ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{ background: "#f1f5f9", color: "#374151" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    gap: "1.25rem",
    alignItems: "center",
    marginBottom: "2rem",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "var(--brand-gradient)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: 700,
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
  },
  name: {
    margin: "0 0 0.25rem",
    fontSize: "1.4rem",
    color: "var(--text-main)",
  },
  email: {
    margin: "0 0 0.5rem",
    color: "var(--text-muted)",
    fontSize: "0.95rem",
  },
  badge: {
    display: "inline-block",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "6px",
    padding: "0.2rem 0.6rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  dl: {
    margin: "0 0 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  dlRow: {
    display: "flex",
    gap: "1.5rem",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "0.75rem",
  },
  dt: {
    width: "120px",
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    flexShrink: 0,
    fontWeight: 500,
  },
  dd: {
    margin: 0,
    color: "var(--text-main)",
    fontSize: "0.95rem",
    fontWeight: 500,
  },
  savedMsg: {
    color: "#16a34a",
    fontSize: "0.9rem",
    marginBottom: "1rem",
    fontWeight: 500,
  },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  actions: { display: "flex", gap: "1rem", marginTop: "1rem" },
};

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
    <div style={styles.page}>
      <div style={styles.card}>
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
              style={styles.btn}
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
              <label key={key} style={styles.label}>
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
                  style={styles.input}
                />
              </label>
            ))}
            <div style={styles.actions}>
              <button
                id="save-profile-btn"
                type="submit"
                disabled={updateProfile.isPending}
                style={styles.btn}
              >
                {updateProfile.isPending ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{
                  ...styles.btn,
                  background: "#f1f5f9",
                  color: "#374151",
                }}
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
  page: { padding: "2rem", maxWidth: "640px", margin: "0 auto" },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    padding: "2rem",
  },
  header: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#3b82f6",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  name: {
    margin: "0 0 0.2rem",
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#0f172a",
  },
  email: { margin: "0 0 0.35rem", color: "#64748b", fontSize: "0.875rem" },
  badge: {
    display: "inline-block",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "999px",
    padding: "0.15rem 0.6rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "capitalize",
  },
  dl: {
    margin: "0 0 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  dlRow: { display: "flex", gap: "1rem" },
  dt: { width: "120px", color: "#64748b", fontSize: "0.875rem", flexShrink: 0 },
  dd: { margin: 0, color: "#0f172a", fontSize: "0.875rem", fontWeight: 500 },
  savedMsg: { color: "#16a34a", fontSize: "0.875rem", marginBottom: "1rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.875rem" },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  actions: { display: "flex", gap: "0.75rem", marginTop: "0.5rem" },
  btn: {
    padding: "0.6rem 1.25rem",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
  },
};

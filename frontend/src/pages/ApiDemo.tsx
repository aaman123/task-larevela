import { useState, type FormEvent } from "react";
import {
  useWebsites,
  useCreateWebsite,
  useUpdateWebsite,
  useDeleteWebsite,
} from "../hooks";
import { ErrorMessage, Loading } from "../components";
import type { WebsiteDetail, WebsiteCreateRequest } from "../types";

type EditState = { id: string; platform: string; display_name: string } | null;

export function WebsitesPage() {
  const { data, isLoading, error, refetch } = useWebsites({
    limit: 20,
    offset: 0,
  });
  const createWebsite = useCreateWebsite();
  const deleteWebsite = useDeleteWebsite();

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newPlatform, setNewPlatform] = useState("shopify");

  // Edit state
  const [editState, setEditState] = useState<EditState>(null);

  const websites: WebsiteDetail[] = data?.data ?? [];

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    // We need the account_id — grab from the first website or from a fallback
    const accountId = websites[0]?.account_id ?? "";
    const body: WebsiteCreateRequest = {
      account_id: accountId,
      domain: newDomain.trim(),
      platform: newPlatform.trim() || "shopify",
    };
    createWebsite.mutate(body, {
      onSuccess: () => {
        setNewDomain("");
        setNewPlatform("shopify");
        setShowCreate(false);
      },
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this website?")) return;
    deleteWebsite.mutate(id);
  };

  return (
    <div style={styles.page}>
      <div style={styles.titleBar}>
        <h1 style={styles.h1}>Websites</h1>
        <button
          id="add-website-btn"
          style={styles.btnPrimary}
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "Cancel" : "+ Add Website"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add Website</h2>
          {createWebsite.isError && (
            <ErrorMessage
              message={
                createWebsite.error instanceof Error
                  ? createWebsite.error.message
                  : "Failed to create"
              }
              onDismiss={() => createWebsite.reset()}
            />
          )}
          <form onSubmit={handleCreate} style={styles.formRow}>
            <input
              id="new-domain"
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="store.example.com"
              required
              style={styles.input}
            />
            <select
              id="new-platform"
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              style={styles.select}
            >
              {[
                "shopify",
                "woocommerce",
                "bigcommerce",
                "magento",
                "custom",
              ].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              id="create-website-submit"
              type="submit"
              disabled={createWebsite.isPending || !newDomain.trim()}
              style={{
                ...styles.btnPrimary,
                opacity: createWebsite.isPending ? 0.6 : 1,
              }}
            >
              {createWebsite.isPending ? "Creating…" : "Create"}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      {isLoading && <Loading />}
      {error && (
        <ErrorMessage
          message={
            error instanceof Error ? error.message : "Failed to load websites"
          }
          onDismiss={() => refetch()}
        />
      )}

      {!isLoading && websites.length === 0 && !error && (
        <div style={styles.empty}>
          <p>No websites yet. Add your first website above.</p>
        </div>
      )}

      {websites.map((site) => (
        <WebsiteRow
          key={site.id}
          site={site}
          editState={editState?.id === site.id ? editState : null}
          onEdit={() =>
            setEditState({
              id: site.id,
              platform: site.platform ?? "",
              display_name: site.domain,
            })
          }
          onCancelEdit={() => setEditState(null)}
          onSaved={() => setEditState(null)}
          onDelete={() => handleDelete(site.id)}
        />
      ))}

      {data?.pagination && (
        <p style={styles.pagination}>
          Showing {websites.length} of {data.pagination.total} websites
        </p>
      )}
    </div>
  );
}

// ─── Row component ────────────────────────────────────────────────────────────

interface RowProps {
  site: WebsiteDetail;
  editState: { id: string; platform: string; display_name: string } | null;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaved: () => void;
  onDelete: () => void;
}

function WebsiteRow({
  site,
  editState,
  onEdit,
  onCancelEdit,
  onSaved,
  onDelete,
}: RowProps) {
  const updateWebsite = useUpdateWebsite(site.id);
  const [localPlatform, setLocalPlatform] = useState(
    editState?.platform ?? site.platform ?? "",
  );

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateWebsite.mutate({ platform: localPlatform }, { onSuccess: onSaved });
  };

  const statusColor: Record<string, string> = {
    live: "#16a34a",
    verifying: "#d97706",
    pending: "#6b7280",
    error: "#dc2626",
    disabled: "#9ca3af",
  };

  return (
    <div style={styles.card}>
      {editState ? (
        <form onSubmit={handleSave} style={styles.formRow}>
          {updateWebsite.isError && (
            <ErrorMessage
              message={
                updateWebsite.error instanceof Error
                  ? updateWebsite.error.message
                  : "Update failed"
              }
              onDismiss={() => updateWebsite.reset()}
            />
          )}
          <span style={styles.domain}>{site.domain}</span>
          <select
            value={localPlatform}
            onChange={(e) => setLocalPlatform(e.target.value)}
            style={styles.select}
          >
            {["shopify", "woocommerce", "bigcommerce", "magento", "custom"].map(
              (p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ),
            )}
          </select>
          <button
            type="submit"
            disabled={updateWebsite.isPending}
            style={styles.btnPrimary}
          >
            {updateWebsite.isPending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onCancelEdit} style={styles.btnGhost}>
            Cancel
          </button>
        </form>
      ) : (
        <div style={styles.rowContent}>
          <div>
            <span style={styles.domain}>{site.domain}</span>
            <span style={styles.platform}>{site.platform ?? "—"}</span>
          </div>
          <div style={styles.rowActions}>
            <span
              style={{
                ...styles.statusBadge,
                color: statusColor[site.status] ?? "#6b7280",
              }}
            >
              ● {site.status}
            </span>
            <button
              id={`edit-${site.id}`}
              onClick={onEdit}
              style={styles.btnGhost}
            >
              Edit
            </button>
            <button
              id={`delete-${site.id}`}
              onClick={onDelete}
              style={styles.btnDanger}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: "2rem", maxWidth: "900px", margin: "0 auto" },
  titleBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },
  h1: { margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" },
  card: {
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    padding: "1rem 1.25rem",
    marginBottom: "0.75rem",
  },
  cardTitle: {
    margin: "0 0 0.875rem",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#374151",
  },
  formRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  input: {
    flex: "1 1 200px",
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.875rem",
  },
  select: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.875rem",
    background: "#fff",
  },
  rowContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  rowActions: { display: "flex", gap: "0.5rem", alignItems: "center" },
  domain: {
    fontWeight: 600,
    color: "#0f172a",
    fontSize: "0.9rem",
    marginRight: "0.5rem",
  },
  platform: { color: "#64748b", fontSize: "0.8rem" },
  statusBadge: { fontSize: "0.8rem", fontWeight: 500 },
  btnPrimary: {
    padding: "0.5rem 1rem",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnGhost: {
    padding: "0.45rem 0.875rem",
    background: "#f1f5f9",
    color: "#374151",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontWeight: 500,
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  btnDanger: {
    padding: "0.45rem 0.875rem",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontWeight: 500,
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  empty: { textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" },
  pagination: {
    marginTop: "1rem",
    color: "#94a3b8",
    fontSize: "0.8rem",
    textAlign: "right",
  },
};

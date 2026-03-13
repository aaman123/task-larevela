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
    <div className="fade-in">
      <div style={styles.titleBar}>
        <h1>Websites</h1>
        <button
          id="add-website-btn"
          style={{
            background: showCreate ? "#f1f5f9" : "var(--brand-gradient)",
            color: showCreate ? "#333" : "#fff",
          }}
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "Cancel" : "+ Add Website"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div
          className="card"
          style={{ marginBottom: "1.5rem", borderLeft: "4px solid #3b82f6" }}
        >
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
            Add New Website
          </h2>
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
                background: "#3b82f6",
                color: "#fff",
                opacity: createWebsite.isPending ? 0.6 : 1,
                whiteSpace: "nowrap",
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

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
      </div>

      {data?.pagination && (
        <p
          style={{
            marginTop: "1.5rem",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            textAlign: "right",
          }}
        >
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
    <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
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
            style={{ background: "#10b981", color: "#fff" }}
          >
            {updateWebsite.isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            style={{ background: "#f1f5f9", color: "#475569" }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div style={styles.rowContent}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            <span style={styles.domain}>{site.domain}</span>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 600,
              }}
            >
              {site.platform ?? "Unspecified"}
            </span>
          </div>
          <div style={styles.rowActions}>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "0.25rem 0.6rem",
                borderRadius: "12px",
                background: `${statusColor[site.status] ?? "#6b7280"}1a`, // 10% opacity bg
                color: statusColor[site.status] ?? "#6b7280",
                marginRight: "0.5rem",
              }}
            >
              ● {site.status.toUpperCase()}
            </span>
            <button
              id={`edit-${site.id}`}
              onClick={onEdit}
              style={{ background: "#f1f5f9", color: "#475569" }}
            >
              Edit
            </button>
            <button
              id={`delete-${site.id}`}
              onClick={onDelete}
              style={{ background: "#fef2f2", color: "#dc2626" }}
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
  titleBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "2rem",
  },
  formRow: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  select: {
    padding: "0.6rem 0.875rem",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    fontSize: "0.95rem",
    background: "#fff",
    outline: "none",
  },
  rowContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  },
  rowActions: { display: "flex", gap: "0.5rem", alignItems: "center" },
  domain: {
    fontWeight: 600,
    fontSize: "1.05rem",
    color: "var(--text-main)",
  },
  empty: {
    textAlign: "center",
    padding: "4rem 1rem",
    color: "var(--text-muted)",
  },
};

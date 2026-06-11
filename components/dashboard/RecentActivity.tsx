interface ActivityItem {
    id: string
    type: "demande" | "devis" | "message" | "notification"
    title: string
    description: string
    date: string
    status?: string
  }
  
  const icons: Record<string, string> = {
    demande: "📋",
    devis: "📄",
    message: "💬",
    notification: "🔔",
  }
  
  const statusColors: Record<string, string> = {
    "En attente": "var(--color-warning-500)",
    "Ouvert": "var(--color-info-500)",
    "En cours": "var(--color-primary-500)",
    "Terminé": "var(--color-success-500)",
    "Annulé": "var(--color-error-500)",
  }
  
  interface RecentActivityProps {
    items: ActivityItem[]
    title: string
  }
  
  export default function RecentActivity({ items, title }: RecentActivityProps) {
    return (
      <div style={{
        background: "var(--color-neutral-0)",
        border: "1px solid var(--color-neutral-200)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
      }}>
        <h2 style={{
          fontSize: "var(--text-base)",
          fontWeight: "var(--font-semibold)",
          color: "var(--color-neutral-900)",
          margin: "0 0 var(--space-5)",
          fontFamily: "var(--font-display)",
        }}>
          {title}
        </h2>
  
        {items.length === 0 ? (
          <p style={{ color: "var(--color-neutral-400)", fontSize: "var(--text-sm)", textAlign: "center", padding: "var(--space-8) 0" }}>
            Aucune activité récente
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {items.map((item) => (
              <div key={item.id} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-neutral-50)",
              }}>
                <span style={{ fontSize: "1.2rem" }}>{icons[item.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", color: "var(--color-neutral-800)", margin: "0 0 2px" }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-500)", margin: 0 }}>
                    {item.description}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {item.status && (
                    <span style={{
                      fontSize: "var(--text-xs)",
                      color: statusColors[item.status] || "var(--color-neutral-500)",
                      fontWeight: "var(--font-medium)",
                    }}>
                      {item.status}
                    </span>
                  )}
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-400)", margin: "2px 0 0" }}>
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
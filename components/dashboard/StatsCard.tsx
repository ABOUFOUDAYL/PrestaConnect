interface StatsCardProps {
    label: string
    value: number | string
    icon: string
    color?: string
  }
  
  export default function StatsCard({ label, value, icon, color = "var(--color-primary-500)" }: StatsCardProps) {
    return (
      <div style={{
        background: "var(--color-neutral-0)",
        border: "1px solid var(--color-neutral-200)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "var(--radius-lg)",
          background: color + "15",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-500)", margin: "0 0 var(--space-1)", fontFamily: "var(--font-body)" }}>
            {label}
          </p>
          <p style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", color: "var(--color-neutral-900)", margin: 0, fontFamily: "var(--font-display)" }}>
            {value}
          </p>
        </div>
      </div>
    )
  }
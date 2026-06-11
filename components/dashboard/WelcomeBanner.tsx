"use client"

interface WelcomeBannerProps {
  userName?: string
}

export default function WelcomeBanner({ userName = "Client" }: WelcomeBannerProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"

  return (
    <div style={{
      background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))",
      borderRadius: "var(--radius-2xl)",
      padding: "var(--space-8)",
      color: "white",
      marginBottom: "var(--space-8)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", opacity: 0.8, marginBottom: "var(--space-1)" }}>
          {greeting} 👋
        </p>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", fontFamily: "var(--font-display)", margin: 0 }}>
          {userName}
        </h1>
        <p style={{ fontSize: "var(--text-sm)", opacity: 0.75, marginTop: "var(--space-2)", margin: "var(--space-2) 0 0" }}>
          Que recherchez-vous aujourd'hui ?
        </p>
      </div>
      <div style={{ fontSize: "3rem", opacity: 0.9 }}>🏗️</div>
    </div>
  )
}
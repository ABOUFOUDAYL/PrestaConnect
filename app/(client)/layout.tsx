import ClientSidebar from "@/components/client/ClientSidebar"
import ClientHeader from "@/components/client/ClientHeader"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-neutral-50)" }}>
      <ClientSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <ClientHeader />
        <main style={{ flex: 1, padding: "var(--space-8)" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
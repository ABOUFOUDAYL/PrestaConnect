import ClientSidebar from "@/components/client/ClientSidebar"
import ClientHeader from "@/components/client/ClientHeader"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-neutral-50)" }}>
      <ClientSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <ClientHeader />
        <main className="client-main-content" style={{
          flex: 1,
          minWidth: 0,
          paddingTop: "var(--space-8)",
          paddingLeft: "var(--space-4)",
          paddingRight: "var(--space-4)",
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
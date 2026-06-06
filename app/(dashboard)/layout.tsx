import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}// app/layout.tsx
import { ImpersonationProvider } from "../contexts/ImpersonationContext";
import { ImpersonationBanner } from "../components/layout/ImpersonationBanner";

// Ton layout actuel ressemble probablement à ça,
// tu ajoutes juste les 2 lignes manquantes :

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ImpersonationProvider currentUser={currentUser}>
          <ImpersonationBanner />   {/* ← ajoute cette ligne */}
          <Navbar />
          <div style={{ display: "flex" }}>
            <Sidebar />
            <main>{children}</main>
          </div>
        </ImpersonationProvider>
      </body>
    </html>
  );
}// app/layout.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.user_metadata?.name ?? session.user.email,
        email: session.user.email,
        role: session.user.user_metadata?.role ?? "visiteur",
      }
    : null;

  return (
    <html lang="fr">
      <body>
        <Providers currentUser={currentUser}>
          <ImpersonationBanner />
          <Navbar />
          <div style={{ display: "flex" }}>
            <Sidebar />
            <main style={{ flex: 1 }}>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
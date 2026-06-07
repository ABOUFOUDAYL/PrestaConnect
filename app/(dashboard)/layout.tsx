import Sidebar from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthProvider } from "@/contexts/auth-context";
import { ImpersonationProvider } from "@/contexts/impersonation-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ImpersonationProvider>
        <div className="min-h-screen bg-background flex">
          <div className="hidden md:block">
            <Sidebar userRole="client" />
          </div>
          <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
            {children}
          </main>
          <BottomNav />
        </div>
      </ImpersonationProvider>
    </AuthProvider>
  );
}
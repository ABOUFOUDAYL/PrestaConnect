import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ImpersonationProvider } from "@/contexts/impersonation-context";
import { ImpersonationBar } from "@/components/layout/impersonation-bar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImpersonationProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <ImpersonationBar />
        <div className="flex flex-1">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </ImpersonationProvider>
  );
}
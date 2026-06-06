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
}
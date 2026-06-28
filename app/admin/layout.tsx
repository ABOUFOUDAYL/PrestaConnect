import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-100 md:flex-row">
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <AdminSidebar mobile />
      </div>
    </div>
  );
}
import ArtisanSidebar from '@/components/artisan/ArtisanSidebar'
import ArtisanTopbar from '@/components/artisan/ArtisanTopbar'

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <ArtisanSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ArtisanTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
export default function ArtisanDetailPage({ params }: { params: { id: string } }) {
    return (
      <div>
        <h1>Profil Artisan</h1>
        <p>ID : {params.id}</p>
      </div>
    )
  }
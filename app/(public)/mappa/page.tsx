import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase-server'
import MappaWrapper from '@/components/MappaWrapper'
import type { MapMarker } from '@/components/MappaLeaflet'

export const metadata: Metadata = {
  title: "Mappa cantine d'Italia — cantine.app",
  description: 'Esplora sulla mappa tutte le cantine italiane. Trova cantine vicino a te e pianifica la tua visita.',
}

export default async function MappaPage() {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('cantine')
    .select('id, slug, nome, lat, lng, regione, foto_principale')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  const markers: MapMarker[] = (data ?? [])
    .filter((c): c is typeof c & { lat: number; lng: number } => c.lat !== null && c.lng !== null)
    .map(c => ({
      id: c.id,
      slug: c.slug,
      nome: c.nome,
      lat: c.lat,
      lng: c.lng,
      regione: c.regione,
      foto_principale: c.foto_principale,
    }))

  return (
    <main className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900">Mappa cantine d&apos;Italia</h1>
          <p className="text-xs text-gray-500">{markers.length} cantine sulla mappa</p>
        </div>
      </div>
      <div className="flex-1">
        <MappaWrapper markers={markers} />
      </div>
    </main>
  )
}

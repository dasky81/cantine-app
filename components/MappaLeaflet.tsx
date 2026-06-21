'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

export interface MapMarker {
  id: string
  slug: string
  nome: string
  lat: number
  lng: number
  regione: string
  foto_principale?: string | null
}

function getIcon(color = '#722F37') {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;background:${color};border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -24],
  })
}

interface Props {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  className?: string
}

export default function MappaLeaflet({ markers, center, zoom = 6, className = 'h-full w-full' }: Props) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
  }, [])

  const mapCenter: [number, number] = center ?? [42.5, 12.5]

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className={className}
      style={{ minHeight: 300 }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={getIcon()}>
          <Popup>
            <div className="text-sm min-w-[160px]">
              {m.foto_principale && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.foto_principale} alt={m.nome} className="w-full h-24 object-cover rounded mb-2" />
              )}
              <p className="font-semibold text-[#722F37] mb-0.5">{m.nome}</p>
              <p className="text-gray-500 text-xs mb-2">{m.regione}</p>
              <Link href={`/cantine/${m.slug}`}
                className="text-xs bg-[#722F37] text-white px-3 py-1 rounded-full hover:bg-[#5a1f25]">
                Vedi scheda
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

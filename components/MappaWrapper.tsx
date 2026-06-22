'use client'
import dynamic from 'next/dynamic'
import type { MapMarker } from '@/components/MappaLeaflet'
const MappaLeaflet = dynamic(() => import('@/components/MappaLeaflet'), { ssr: false })
export default function MappaWrapper({ markers }: { markers: MapMarker[] }) {
  return <MappaLeaflet markers={markers} />
}

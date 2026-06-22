'use client'

import dynamic from 'next/dynamic'
import type { MapMarker } from '@/components/MappaLeaflet'

const MappaLeaflet = dynamic(() => import('@/components/MappaLeaflet'), { ssr: false })

export default function MappaWrapper({
  markers,
  center,
  zoom,
  className,
}: {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  className?: string
}) {
  return <MappaLeaflet markers={markers} center={center} zoom={zoom} className={className} />
}

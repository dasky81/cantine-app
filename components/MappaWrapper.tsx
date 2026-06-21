'use client'

import dynamic from 'next/dynamic'
import type { MapMarker } from '@/components/MappaLeaflet'

const MappaLeaflet = dynamic(() => import('@/components/MappaLeaflet'), { ssr: false })

interface Props {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  className?: string
}

export default function MappaWrapper({ markers, center, zoom, className }: Props) {
  return <MappaLeaflet markers={markers} center={center} zoom={zoom} className={className} />
}

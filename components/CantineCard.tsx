import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Wine, Leaf, Euro } from 'lucide-react'
import type { Cantina } from '@/lib/supabase'

const CERT_STYLE: Record<string, string> = {
  Biologico: 'bg-green-100 text-green-800',
  Biodinamico: 'bg-emerald-100 text-emerald-800',
  Sostenibile: 'bg-teal-100 text-teal-800',
}

export default function CantineCard({ cantina }: { cantina: Cantina }) {
  const luogo = [cantina.comune, cantina.regione].filter(Boolean).join(', ')

  return (
    <Link
      href={`/cantine/${cantina.slug}`}
      className="group block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white"
    >
      <div className="relative h-48">
        {cantina.foto_principale ? (
          <Image
            src={cantina.foto_principale}
            alt={cantina.nome}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#722F37] to-[#5a1f25]">
            <Wine className="w-14 h-14 text-[#C9A84C]/50" />
          </div>
        )}
        {cantina.verified && (
          <span className="absolute top-3 right-3 bg-[#C9A84C] text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            Verificata
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-[#722F37] transition-colors line-clamp-2">
            {cantina.nome}
          </h3>
          {luogo && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{luogo}</span>
            </div>
          )}
        </div>

        {cantina.vini_prodotti && cantina.vini_prodotti.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cantina.vini_prodotti.slice(0, 3).map((vino) => (
              <span
                key={vino}
                className="text-xs px-2 py-0.5 rounded-full bg-[#722F37]/10 text-[#722F37] font-medium"
              >
                {vino}
              </span>
            ))}
            {cantina.vini_prodotti.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                +{cantina.vini_prodotti.length - 3}
              </span>
            )}
          </div>
        )}

        {cantina.certificazioni && cantina.certificazioni.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cantina.certificazioni.map((cert) => (
              <span
                key={cert}
                className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${CERT_STYLE[cert] ?? 'bg-gray-100 text-gray-600'}`}
              >
                <Leaf className="w-3 h-3" />
                {cert}
              </span>
            ))}
          </div>
        )}

        {cantina.prezzo_degustazione && (
          <div className="flex items-center gap-1 text-sm text-gray-500 pt-2 border-t border-gray-100">
            <Euro className="w-3.5 h-3.5 shrink-0" />
            <span>Degustazione {cantina.prezzo_degustazione}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { MapPin, Phone, Mail, Globe, Clock, Euro, Grape, Languages, CheckCircle } from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import FavoritoButton from '@/components/FavoritoButton'
import type { Cantina } from '@/lib/supabase'

const MappaLeaflet = dynamic(() => import('@/components/MappaLeaflet'), { ssr: false })

const CERT_STYLE: Record<string, string> = {
  Biologico: 'bg-green-100 text-green-800 border-green-200',
  Biodinamico: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Sostenibile: 'bg-teal-100 text-teal-800 border-teal-200',
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerClient()
  const { data } = await supabase.from('cantine').select('nome, descrizione_breve, regione, foto_principale').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: `${data.nome} — cantine.app`,
    description: data.descrizione_breve ?? `Scopri ${data.nome} in ${data.regione}`,
    openGraph: {
      title: data.nome,
      description: data.descrizione_breve ?? '',
      images: data.foto_principale ? [data.foto_principale] : [],
      type: 'website',
    },
  }
}

export default async function CantinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerClient()
  const { data: cantina } = await supabase.from('cantine').select('*').eq('slug', slug).single()

  if (!cantina) notFound()

  const c = cantina as Cantina

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Winery'],
    name: c.nome,
    description: c.descrizione_breve ?? '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.indirizzo ?? '',
      addressLocality: c.comune ?? '',
      addressRegion: c.regione,
      addressCountry: 'IT',
    },
    telephone: c.telefono ?? undefined,
    email: c.email ?? undefined,
    url: c.sito_web ?? undefined,
    geo: c.lat && c.lng ? { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng } : undefined,
    image: c.foto_principale ?? undefined,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="bg-[#FAF7F2] min-h-screen">
        {/* Hero image */}
        <div className="relative h-72 md:h-96 bg-[#722F37]">
          {c.foto_principale && (
            <Image src={c.foto_principale} alt={c.nome} fill className="object-cover" priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {c.verified && (
                <span className="bg-[#C9A84C] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verificata
                </span>
              )}
              {c.denominazioni?.map(d => (
                <span key={d} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">{d}</span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{c.nome}</h1>
            <div className="flex items-center gap-1.5 text-white/80 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{[c.comune, c.provincia, c.regione].filter(Boolean).join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Galleria foto */}
        {c.foto_galleria && c.foto_galleria.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {c.foto_galleria.slice(0, 5).map((f, i) => (
                <div key={i} className="relative w-40 h-28 shrink-0 rounded-xl overflow-hidden">
                  <Image src={f} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Descrizione */}
            {(c.descrizione || c.descrizione_breve) && (
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Chi siamo</h2>
                <p className="text-gray-600 leading-relaxed">{c.descrizione ?? c.descrizione_breve}</p>
              </section>
            )}

            {/* Vini prodotti */}
            {c.vini_prodotti && c.vini_prodotti.length > 0 && (
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Grape className="w-5 h-5 text-[#722F37]" /> Vini prodotti
                </h2>
                <div className="flex flex-wrap gap-2">
                  {c.vini_prodotti.map(v => (
                    <span key={v} className="px-3 py-1.5 bg-[#722F37]/10 text-[#722F37] rounded-full text-sm font-medium">{v}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Certificazioni */}
            {c.certificazioni && c.certificazioni.length > 0 && (
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Certificazioni</h2>
                <div className="flex flex-wrap gap-2">
                  {c.certificazioni.map(cert => (
                    <span key={cert} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${CERT_STYLE[cert] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {cert}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Servizi */}
            {c.servizi && c.servizi.length > 0 && (
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Servizi offerti</h2>
                <div className="grid grid-cols-2 gap-2">
                  {c.servizi.map(s => (
                    <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-[#722F37] shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Numeri */}
            {(c.ettari_vigneto || c.bottiglie_anno) && (
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">La cantina in numeri</h2>
                <div className="grid grid-cols-2 gap-4">
                  {c.ettari_vigneto && (
                    <div className="text-center p-4 bg-[#FAF7F2] rounded-xl">
                      <p className="text-3xl font-bold text-[#722F37]">{c.ettari_vigneto}</p>
                      <p className="text-sm text-gray-500 mt-1">ettari di vigneto</p>
                    </div>
                  )}
                  {c.bottiglie_anno && (
                    <div className="text-center p-4 bg-[#FAF7F2] rounded-xl">
                      <p className="text-3xl font-bold text-[#722F37]">{c.bottiglie_anno.toLocaleString('it')}</p>
                      <p className="text-sm text-gray-500 mt-1">bottiglie all&apos;anno</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Mappa */}
            {c.lat && c.lng && (
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Come raggiungerci</h2>
                {c.indirizzo && <p className="text-gray-500 text-sm mb-3">{c.indirizzo}</p>}
                <div className="h-56 rounded-xl overflow-hidden">
                  <MappaLeaflet
                    markers={[{ id: c.id, slug: c.slug, nome: c.nome, lat: c.lat, lng: c.lng, regione: c.regione, foto_principale: c.foto_principale }]}
                    center={[c.lat, c.lng]}
                    zoom={13}
                    className="h-full w-full"
                  />
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
              <FavoritoButton cantinaId={c.id} />
              <Link href={`/rivendica-scheda?cantina=${c.id}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#722F37] hover:text-[#722F37] transition-colors">
                Sei il titolare? Rivendica la scheda
              </Link>
            </div>

            {/* Info pratiche */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900">Informazioni pratiche</h3>

              {c.orari_apertura && (
                <div className="flex gap-3">
                  <Clock className="w-4 h-4 text-[#722F37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Orari</p>
                    <p className="text-sm text-gray-700">{c.orari_apertura}</p>
                  </div>
                </div>
              )}

              {c.prezzo_degustazione && (
                <div className="flex gap-3">
                  <Euro className="w-4 h-4 text-[#722F37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Degustazione</p>
                    <p className="text-sm text-gray-700">{c.prezzo_degustazione}</p>
                  </div>
                </div>
              )}

              {c.lingua_visita && c.lingua_visita.length > 0 && (
                <div className="flex gap-3">
                  <Languages className="w-4 h-4 text-[#722F37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Lingue visita</p>
                    <p className="text-sm text-gray-700">{c.lingua_visita.join(', ')}</p>
                  </div>
                </div>
              )}

              {c.telefono && (
                <a href={`tel:${c.telefono}`} className="flex gap-3 hover:text-[#722F37] transition-colors group">
                  <Phone className="w-4 h-4 text-[#722F37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Telefono</p>
                    <p className="text-sm text-gray-700 group-hover:text-[#722F37]">{c.telefono}</p>
                  </div>
                </a>
              )}

              {c.email && (
                <a href={`mailto:${c.email}`} className="flex gap-3 hover:text-[#722F37] transition-colors group">
                  <Mail className="w-4 h-4 text-[#722F37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Email</p>
                    <p className="text-sm text-gray-700 group-hover:text-[#722F37] break-all">{c.email}</p>
                  </div>
                </a>
              )}

              {c.sito_web && (
                <a href={c.sito_web} target="_blank" rel="noopener noreferrer"
                  className="flex gap-3 hover:text-[#722F37] transition-colors group">
                  <Globe className="w-4 h-4 text-[#722F37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Sito web</p>
                    <p className="text-sm text-gray-700 group-hover:text-[#722F37] break-all">
                      {c.sito_web.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                </a>
              )}

              {c.instagram && (
                <a href={`https://instagram.com/${c.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex gap-3 hover:text-[#722F37] transition-colors group">
                  <svg className="w-4 h-4 text-[#722F37] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Instagram</p>
                    <p className="text-sm text-gray-700 group-hover:text-[#722F37]">{c.instagram}</p>
                  </div>
                </a>
              )}
            </div>

            {/* Back link */}
            <Link href="/cantine" className="block text-center text-sm text-gray-500 hover:text-[#722F37] py-2">
              ← Torna all&apos;elenco cantine
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

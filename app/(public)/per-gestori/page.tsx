import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, TrendingUp, Users, Star, Globe, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Per i gestori di cantina — cantine.app',
  description: 'Sei il titolare di una cantina? Rivendica la tua scheda su cantine.app e raggiungi migliaia di appassionati di vino.',
}

const VANTAGGI = [
  { Icon: Globe, titolo: 'Visibilità online', desc: 'La tua cantina appare nelle ricerche Google e nell\'AI search di cantine.app, raggiungendo appassionati di vino in tutta Italia e nel mondo.' },
  { Icon: Users, titolo: 'Nuovi visitatori', desc: 'Connettiti con enoturisti e appassionati che cercano esperienze di degustazione autentiche nella tua zona.' },
  { Icon: TrendingUp, titolo: 'SEO gratuito', desc: 'La scheda ottimizzata per i motori di ricerca ti garantisce traffico organico continuativo senza spese pubblicitarie.' },
  { Icon: Star, titolo: 'Scheda verificata', desc: 'Il badge "Verificata" aumenta la fiducia degli utenti e migliora il posizionamento nella nostra directory.' },
  { Icon: BarChart3, titolo: 'Statistiche visite', desc: 'Monitora quante persone visitano la tua scheda e da dove arrivano. Dati reali per decisioni migliori.' },
  { Icon: CheckCircle, titolo: 'Controllo totale', desc: 'Aggiorna foto, orari, prezzi e descrizioni in qualsiasi momento. La tua scheda rispecchia sempre la realtà.' },
]

export default function PerGestoriPage() {
  return (
    <main className="bg-[#FAF7F2]">
      {/* Hero */}
      <section className="bg-[#722F37] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-4">Per i titolari di cantina</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            La tua cantina merita<br />di essere scoperta
          </h1>
          <p className="text-xl text-white/75 max-w-2xl mx-auto mb-8 leading-relaxed">
            Unisciti a cantine.app e raggiungi migliaia di appassionati di vino che ogni giorno cercano esperienze autentiche in tutta Italia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/rivendica-scheda"
              className="bg-[#C9A84C] text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-[#b8943d] transition-colors inline-block">
              Rivendica la tua scheda — Gratis
            </Link>
            <Link href="/cantine"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-white/10 transition-colors inline-block">
              Guarda come appari già
            </Link>
          </div>
        </div>
      </section>

      {/* Vantaggi */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Perché scegliere cantine.app</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">La directory gratuita che mette in contatto le cantine italiane con gli appassionati di vino</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VANTAGGI.map(({ Icon, titolo, desc }) => (
              <div key={titolo} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-11 h-11 rounded-full bg-[#722F37]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#722F37]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{titolo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Come funziona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', titolo: 'Cerca la tua cantina', desc: 'La tua cantina è già nella nostra directory. Clicca su "Rivendica la scheda" e invia i tuoi dati di contatto.' },
              { num: '02', titolo: 'Verifichiamo la richiesta', desc: 'Il nostro team verifica la tua identità come titolare o responsabile entro 48 ore lavorative.' },
              { num: '03', titolo: 'Gestisci la tua scheda', desc: 'Una volta approvato, puoi aggiornare foto, informazioni, orari e tutto il resto in autonomia.' },
            ].map(({ num, titolo, desc }) => (
              <div key={num} className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#722F37] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{titolo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Inizia oggi, è completamente gratuito</h2>
          <p className="text-gray-500 mb-8">Nessun abbonamento, nessuna commissione. Cantine.app è gratuito per le cantine nella fase di lancio.</p>
          <Link href="/rivendica-scheda"
            className="bg-[#722F37] text-white px-10 py-4 rounded-full text-base font-semibold hover:bg-[#5a1f25] transition-colors inline-block">
            Rivendica la tua scheda ora →
          </Link>
        </div>
      </section>
    </main>
  )
}

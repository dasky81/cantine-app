'use client'

import { useState, useEffect } from 'react'
import { MapPin, Search, Loader2, Navigation } from 'lucide-react'

interface ForecastDay {
  date: Date
  maxTemp: number
  minTemp: number
  code: number
}

function weatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0)  return { emoji: '☀️', label: 'Soleggiato' }
  if (code <= 3)   return { emoji: '⛅', label: 'Parz. nuvoloso' }
  if (code <= 48)  return { emoji: '🌫️', label: 'Nebbia' }
  if (code <= 55)  return { emoji: '🌦️', label: 'Pioggerella' }
  if (code <= 67)  return { emoji: '🌧️', label: 'Pioggia' }
  if (code <= 77)  return { emoji: '🌨️', label: 'Neve' }
  if (code <= 82)  return { emoji: '🌦️', label: 'Rovesci' }
  return { emoji: '⛈️', label: 'Temporale' }
}

const GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

async function fetchWeather(lat: number, lon: number): Promise<ForecastDay[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe%2FRome&forecast_days=7`
  const res = await fetch(url)
  const data = await res.json()
  return data.daily.time.map((dateStr: string, i: number) => ({
    date: new Date(dateStr + 'T12:00:00'),
    maxTemp: Math.round(data.daily.temperature_2m_max[i]),
    minTemp: Math.round(data.daily.temperature_2m_min[i]),
    code: data.daily.weathercode[i],
  }))
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&countrycodes=it`
  const res = await fetch(url, { headers: { 'User-Agent': 'cantine.app/1.0' } })
  const data = await res.json()
  if (!data.length) return null
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  const res = await fetch(url, { headers: { 'User-Agent': 'cantine.app/1.0' } })
  const data = await res.json()
  return data.address?.city ?? data.address?.town ?? data.address?.county ?? 'La tua posizione'
}

export default function MeteoWidget() {
  const [time, setTime] = useState<Date | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [cityInput, setCityInput] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTime(new Date())
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  async function handleGeo() {
    if (!navigator.geolocation) { setError('Geolocalizzazione non disponibile'); return }
    setGeoLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          const [days, name] = await Promise.all([fetchWeather(lat, lon), reverseGeocode(lat, lon)])
          setForecast(days)
          setLocationName(name)
        } catch { setError('Errore nel caricamento meteo') }
        finally { setGeoLoading(false) }
      },
      () => { setError('Permesso negato'); setGeoLoading(false) }
    )
  }

  async function handleCitySearch(e: React.FormEvent) {
    e.preventDefault()
    if (!cityInput.trim()) return
    setSearchLoading(true)
    setError(null)
    try {
      const coords = await geocodeCity(cityInput)
      if (!coords) { setError('Città non trovata — prova con un nome diverso'); return }
      const days = await fetchWeather(coords.lat, coords.lon)
      setForecast(days)
      setLocationName(cityInput)
    } catch { setError('Errore nella ricerca') }
    finally { setSearchLoading(false) }
  }

  const hh = time ? time.getHours().toString().padStart(2, '0') : '--'
  const mm = time ? time.getMinutes().toString().padStart(2, '0') : '--'
  const dateLabel = time
    ? time.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
    : ''

  return (
    <section className="bg-[#F0FBF0] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-green-700/60 mb-2">
          Meteo Vacanze
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Pianifica la tua visita</h2>
        <p className="text-gray-500 text-sm mb-8">Controlla il meteo prima di partire per la cantina</p>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Pannello sinistro — clock + geolocalizzazione */}
          <div className="bg-gray-900 text-white rounded-2xl p-8 flex flex-col gap-4">
            <div>
              <div className="text-5xl font-bold font-mono tabular-nums">{hh}:{mm}</div>
              <div className="text-gray-400 text-sm mt-1 capitalize">{dateLabel}</div>
            </div>
            {locationName && (
              <div className="flex items-center gap-1.5 text-sm text-gray-300">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {locationName}
              </div>
            )}
            <button
              onClick={handleGeo}
              disabled={geoLoading}
              className="mt-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white text-sm px-4 py-2.5 rounded-xl transition-colors border border-white/10"
            >
              {geoLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Ricerca in corso…</>
                : <><Navigation className="w-4 h-4" /> Usa la mia posizione</>
              }
            </button>
          </div>

          {/* Pannello destro — ricerca città + previsioni */}
          <div className="bg-white rounded-2xl p-8 flex flex-col gap-5">
            <form onSubmit={handleCitySearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={cityInput}
                  onChange={e => setCityInput(e.target.value)}
                  placeholder="es. Firenze, Montalcino, Barolo…"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 focus:border-[#722F37]/50"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="px-4 py-2.5 bg-[#722F37] text-white text-sm rounded-xl hover:bg-[#5a1f25] disabled:opacity-60 transition-colors whitespace-nowrap"
              >
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cerca'}
              </button>
            </form>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            {forecast ? (
              <div>
                <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">
                  Previsioni 7 giorni
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {forecast.map((day) => {
                    const { emoji } = weatherInfo(day.code)
                    return (
                      <div key={day.date.toISOString()} className="flex flex-col items-center gap-0.5 text-center">
                        <span className="text-[11px] text-gray-400">{GIORNI[day.date.getDay()]}</span>
                        <span className="text-xl leading-none my-0.5">{emoji}</span>
                        <span className="text-xs font-bold text-gray-800">{day.maxTemp}°</span>
                        <span className="text-[11px] text-gray-400">{day.minTemp}°</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm text-center py-4">
                Inserisci una città o usa la geolocalizzazione per vedere le previsioni
              </div>
            )}
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Per previsioni complete, mappe e Travel News →{' '}
          <a
            href="https://meteo.travel"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 font-medium hover:underline"
          >
            Visita meteo.travel ↗
          </a>
        </p>
      </div>
    </section>
  )
}

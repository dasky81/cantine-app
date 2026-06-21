'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const SLIDES = [
  'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=1600',
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600',
  'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=1600',
]

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/65" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 pb-12">
        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-4">
          cantine.app by viaggi.app
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg mb-4">
          Scopri le cantine<br className="hidden sm:block" /> d&apos;Italia
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl">
          Il motore di ricerca italiano per degustazioni, visite e scoperta del vino
        </p>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((src, i) => (
          <button
            key={src}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-[#C9A84C]' : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

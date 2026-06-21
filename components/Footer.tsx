import Link from 'next/link'
import { Wine } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#722F37] text-white/60 text-sm py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-[#C9A84C]" />
            <span className="text-white font-semibold">cantine.app</span>
            <span className="text-[#C9A84C] text-xs">by viaggi.app</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
            <Link href="https://agriturismi.app" className="hover:text-white transition-colors">agriturismi.app</Link>
            <span className="text-white/30">·</span>
            <Link href="https://crociera.app" className="hover:text-white transition-colors">crociera.app</Link>
            <span className="text-white/30">·</span>
            <Link href="https://bnb.london" className="hover:text-white transition-colors">bnb.london</Link>
            <span className="text-white/30">·</span>
            <Link href="https://green.camp" className="hover:text-white transition-colors">green.camp</Link>
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} viaggi.app</p>
        </div>
      </div>
    </footer>
  )
}

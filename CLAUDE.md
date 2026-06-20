# CLAUDE.md — cantine.app

> Leggi questo file integralmente prima di iniziare qualsiasi sessione.
> Ogni decisione tecnica deve essere coerente con l'architettura e la visione qui descritta.

---

## 🎯 VISIONE DEL PRODOTTO

**cantine.app** è il motore di ricerca e discovery italiano per cantine vinicole.
Modello: **Google-first** — directory gratuita al lancio, crescita organica SEO, monetizzazione differita.
Parte della rete **viaggi.app** (insieme a agriturismi.app, crociera.app, bnb.london, green.camp).

### Fasi di prodotto

| Fase | Obiettivo | Monetizzazione |
|------|-----------|----------------|
| **Alpha** (ora) | Motore funzionante, dati reali, UX solida | ❌ nessuna |
| **Beta** | 500+ cantine indicizzate, utenti registrati | ❌ nessuna |
| **V1** | Traffico organico consolidato | Scheda premium opzionale |
| **V2** | Lead generation, prenotazioni degustazioni | Commissione o SaaS B2B |

---

## 🏗️ STACK TECNICO

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Mappe**: Leaflet.js (open source, zero costi)
- **Lingua UI**: Italiano (it-IT)
- **Font**: Inter (Google Fonts)

### Backend
- **Database**: Supabase (PostgreSQL) — **NUOVO PROGETTO separato da agriturismi.app**
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Storage**: Supabase Storage (foto cantine, avatar utenti)
- **API**: Next.js API Routes

### AI
- **Motore ricerca AI**: Claude API (`claude-sonnet-4-6`)
- **Generazione contenuti**: Claude API per descrizioni e post blog
- **Vettori**: pgvector in Supabase per ricerca semantica

### Deploy & Infra
- **Hosting**: Vercel (piano hobby → pro con crescita)
- **Dominio**: cantine.app
- **CDN**: automatico via Vercel Edge Network
- **Analytics**: Vercel Analytics (gratuito)

---

## 🗄️ SCHEMA DATABASE

```sql
-- Profili utenti (estende Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  nome TEXT,
  cognome TEXT,
  role TEXT DEFAULT 'user', -- 'user' | 'admin' | 'cantina_owner'
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cantine vinicole
CREATE TABLE cantine (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descrizione TEXT,
  descrizione_breve TEXT,
  regione TEXT NOT NULL,       -- es. 'Toscana', 'Piemonte'
  provincia TEXT,              -- es. 'Siena', 'Cuneo'
  comune TEXT,
  indirizzo TEXT,
  lat FLOAT,
  lng FLOAT,
  telefono TEXT,
  email TEXT,
  sito_web TEXT,
  instagram TEXT,
  orari_apertura TEXT,
  prezzo_degustazione TEXT,    -- es. '€15–25 a persona'
  vini_prodotti TEXT[],        -- es. ['Chianti', 'Brunello', 'Vernaccia']
  denominazioni TEXT[],        -- es. ['DOCG', 'DOC', 'IGT']
  ettari_vigneto INTEGER,
  bottiglie_anno INTEGER,
  certificazioni TEXT[],       -- es. ['Biologico', 'Biodinamico', 'Sostenibile']
  lingua_visita TEXT[],        -- es. ['Italiano', 'Inglese', 'Tedesco']
  servizi TEXT[],              -- es. ['Vendita diretta', 'Ristorante', 'Pernottamento', 'Enoteca']
  foto_principale TEXT,
  foto_galleria TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  embedding vector(1536)       -- pgvector per ricerca semantica
);

-- Post blog
CREATE TABLE post (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  titolo TEXT NOT NULL,
  contenuto TEXT,
  excerpt TEXT,
  cover_url TEXT,
  autore_id UUID REFERENCES profiles(id),
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  tag TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log ricerche AI
CREATE TABLE ricerche_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  risultati_ids UUID[],
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preferiti utenti
CREATE TABLE preferiti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  cantina_id UUID REFERENCES cantine(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cantina_id)
);

-- Rivendicazioni schede
CREATE TABLE rivendicazioni (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cantina_id UUID REFERENCES cantine(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  nome_referente TEXT,
  email_referente TEXT,
  telefono TEXT,
  messaggio TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cantine ENABLE ROW LEVEL SECURITY;
ALTER TABLE post ENABLE ROW LEVEL SECURITY;
ALTER TABLE ricerche_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferiti ENABLE ROW LEVEL SECURITY;
ALTER TABLE rivendicazioni ENABLE ROW LEVEL SECURITY;

-- Cantine: lettura pubblica, scrittura admin
CREATE POLICY "cantine_select_public" ON cantine FOR SELECT USING (true);
CREATE POLICY "cantine_insert_admin" ON cantine FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "cantine_update_admin" ON cantine FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Profili: ogni utente vede/modifica il proprio
CREATE POLICY "profiles_own" ON profiles USING (auth.uid() = id);

-- Preferiti: ogni utente gestisce i propri
CREATE POLICY "preferiti_own" ON preferiti USING (auth.uid() = user_id);
```

---

## 📁 STRUTTURA DIRECTORY

```
cantine-app/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Homepage con ricerca AI
│   │   ├── cantine/
│   │   │   ├── page.tsx                # Lista cantine (con filtri)
│   │   │   └── [slug]/page.tsx         # Scheda cantina
│   │   ├── regioni/
│   │   │   └── [regione]/page.tsx      # SEO pages regionali
│   │   ├── vini/
│   │   │   └── [tipo]/page.tsx         # SEO pages per tipo vino
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── mappa/page.tsx              # Mappa interattiva cantine
│   │   └── rivendica-scheda/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── registrati/page.tsx
│   │   └── benvenuto/page.tsx
│   ├── admin/
│   │   ├── page.tsx                    # Dashboard KPI
│   │   ├── cantine/page.tsx
│   │   ├── rivendicazioni/page.tsx
│   │   ├── blog/page.tsx
│   │   └── utenti/page.tsx
│   └── api/
│       ├── cerca/route.ts              # AI search endpoint
│       ├── genera-articoli-seed/route.ts
│       └── sitemap/route.ts
├── components/
│   ├── CantinCard.tsx
│   ├── SearchBar.tsx
│   ├── MappaLeaflet.tsx
│   ├── FiltriRegione.tsx
│   └── ui/                             # shadcn components
├── lib/
│   ├── supabase.ts
│   ├── claude.ts
│   └── utils.ts
└── CLAUDE.md
```

---

## 🎨 IDENTITÀ VISIVA

- **Brand**: `cantine.app by viaggi.app`
- **Palette primaria**: bordeaux/vino `#722F37`, oro `#C9A84C`, bianco sporco `#FAF7F2`
- **Tono**: elegante ma accessibile, non snob — per tutti gli appassionati
- **Footer network**: viaggi.app · agriturismi.app · crociera.app · bnb.london · green.camp

---

## 🔍 RICERCA AI — SYSTEM PROMPT

```
Sei un esperto di vino italiano e cantine. Aiuti gli utenti a trovare la cantina perfetta.
Interpreti ricerche in linguaggio naturale come:
- "cantina con degustazione biologica in Toscana con bambini"
- "Brunello di Montalcino visita guidata weekend"
- "cantina biodinamica Piemonte sotto i 20 euro"

Restituisci SOLO un JSON con:
{
  "regione": string | null,
  "vini": string[],
  "certificazioni": string[],
  "servizi": string[],
  "prezzo_max": number | null,
  "lingua": string | null,
  "query_friendly": string
}
```

---

## 📍 SEO PAGES AL LANCIO

### Regionali (20 pagine)
Toscana, Piemonte, Veneto, Sicilia, Puglia, Campania, Lombardia, Trentino-Alto Adige,
Friuli-Venezia Giulia, Sardegna, Umbria, Marche, Abruzzo, Lazio, Emilia-Romagna,
Calabria, Basilicata, Liguria, Molise, Valle d'Aosta

### Per tipo di vino (10 pagine)
Brunello di Montalcino, Barolo, Chianti Classico, Amarone, Prosecco,
Nero d'Avola, Primitivo, Vermentino, Montepulciano, Franciacorta

---

## 🔑 VARIABILI D'AMBIENTE

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
SEED_SECRET=cantine2026
NEXT_PUBLIC_SITE_URL=https://cantine.app
```

---

## ⛔ REGOLE FISSE

- **NO Stripe/PayPal** nella fase attuale — modello Google-first
- **NO** dipendenze a pagamento (mappe, API esterne con costo)
- **Leaflet** per le mappe (open source)
- **Tiptap** per l'editor blog
- **shadcn/ui** per i componenti UI
- Tutto in **italiano** (UI, messaggi di errore, placeholder)
- Ogni scheda cantina deve avere **Open Graph** per condivisione social
- **sitemap.xml** dinamico aggiornato ad ogni nuova cantina

---

## 🌱 SEED DATI INIZIALI

Al lancio: **40 cantine reali** distribuite geograficamente:
- 8 Toscana (Chianti, Brunello, Vernaccia)
- 6 Piemonte (Barolo, Barbaresco, Moscato)
- 5 Veneto (Amarone, Prosecco, Soave)
- 4 Sicilia (Nero d'Avola, Etna, Marsala)
- 4 Puglia (Primitivo, Negroamaro)
- 3 Campania (Taurasi, Greco di Tufo, Fiano)
- 2 Friuli (Collio, Ramato)
- 2 Sardegna (Cannonau, Vermentino)
- 2 Umbria (Sagrantino, Orvieto)
- 4 altre regioni

Fonte dati: siti ufficiali delle cantine, Consorzio vini regionali, Wine Spectator IT.

# cantine.app

Portale italiano per scoprire cantine, vini, territori e visite enoturistiche.

## Funzioni incluse

- catalogo di cantine con filtri per regione e certificazione;
- ricerca in linguaggio naturale con fallback locale e AI opzionale;
- schede cantina, mappe, meteo e pagine SEO per regioni e vini;
- registrazione, profilo, preferiti e rivendicazione delle schede;
- area titolare e pannello amministrativo;
- blog, sitemap dinamica e tracciamento visite interno.

## Stack

- Next.js 16, React 19 e Tailwind CSS 4;
- Supabase per PostgreSQL, Auth, RLS e Storage;
- GitHub per il versionamento;
- Vercel per build, preview e produzione.

## Avvio locale

1. Copia `.env.example` in `.env.local`.
2. Inserisci URL e publishable key del progetto Supabase.
3. Installa e avvia:

```bash
npm ci
npm run dev
```

## Verifiche

```bash
npm run lint
npm run build
```

La chiave `ANTHROPIC_API_KEY` è opzionale. Senza chiave, la ricerca usa il parser locale e tutte le funzioni principali restano disponibili.

## Database

Lo schema iniziale e i dati dimostrativi sono in `schema.sql`. Tutte le tabelle esposte hanno Row Level Security attiva. Il primo account verificato con l'email del proprietario configurata nello schema riceve il ruolo amministratore.

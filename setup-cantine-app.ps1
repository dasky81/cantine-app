# ============================================================
# SETUP CANTINE.APP — PowerShell (Windows)
# Esegui in PowerShell come amministratore
# ============================================================

# 0. Fix execution policy se necessario
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# 1. Crea progetto Next.js
npx create-next-app@latest cantine-app `
  --typescript `
  --tailwind `
  --eslint `
  --app `
  --src-dir=false `
  --import-alias="@/*" `
  --no-git

Set-Location cantine-app

# 2. Installa dipendenze
npm install `
  @supabase/supabase-js `
  @supabase/ssr `
  @anthropic-ai/sdk `
  leaflet `
  react-leaflet `
  @types/leaflet `
  @tiptap/react `
  @tiptap/starter-kit `
  @tiptap/extension-image `
  @tiptap/extension-link `
  lucide-react `
  clsx `
  tailwind-merge `
  date-fns `
  next-seo

# 3. Installa shadcn/ui
npx shadcn@latest init --defaults
npx shadcn@latest add button input textarea card badge select dialog sheet tabs toast avatar separator skeleton

# 4. Crea struttura directory
New-Item -ItemType Directory -Force -Path `
  "app/(public)/cantine/[slug]", `
  "app/(public)/regioni/[regione]", `
  "app/(public)/vini/[tipo]", `
  "app/(public)/blog/[slug]", `
  "app/(public)/mappa", `
  "app/(auth)/login", `
  "app/(auth)/registrati", `
  "app/(auth)/benvenuto", `
  "app/admin/cantine", `
  "app/admin/rivendicazioni", `
  "app/admin/blog", `
  "app/admin/utenti", `
  "app/api/cerca", `
  "app/api/genera-articoli-seed", `
  "components/ui", `
  "lib"

# 5. Crea .env.local
@"
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
SEED_SECRET=cantine2026
NEXT_PUBLIC_SITE_URL=https://cantine.app
"@ | Out-File -FilePath ".env.local" -Encoding UTF8

# 6. Copia CLAUDE.md nella root
Copy-Item "$PSScriptRoot\CLAUDE.md" -Destination "CLAUDE.md"

# 7. Init Git e push GitHub
git init
git add .
git commit -m "init: cantine.app — Next.js 14 + Supabase + Claude AI"

# Crea repo su GitHub (richiede gh auth login fatto in precedenza)
gh repo create cantine-app --public --push --source=.

Write-Host ""
Write-Host "✅ Setup completato!" -ForegroundColor Green
Write-Host ""
Write-Host "PROSSIMI PASSI:" -ForegroundColor Yellow
Write-Host "1. Vai su https://supabase.com e crea un nuovo progetto 'cantine-app'"
Write-Host "2. Copia URL e chiavi in .env.local"
Write-Host "3. Esegui lo schema SQL (file schema.sql incluso)"
Write-Host "4. Vai su https://vercel.com e connetti la repo GitHub"
Write-Host "5. Aggiungi le env vars su Vercel"
Write-Host "6. Avvia Claude Code: claude"

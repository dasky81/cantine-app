import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

async function cambiaRuolo(formData: FormData) {
  'use server'
  const userId = formData.get('userId') as string
  const role = formData.get('role') as string
  if (!RUOLI.includes(role)) return
  const supabase = await createServerClient()
  await supabase.from('profiles').update({ role }).eq('id', userId)
  revalidatePath('/admin/utenti')
}

const RUOLI = ['user', 'cantina_owner', 'admin']
const RUOLO_LABEL: Record<string, string> = {
  user: 'Degustatore',
  cantina_owner: 'Titolare cantina',
  admin: 'Super Admin',
}

export default async function UtentiPage() {
  const supabase = await createServerClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, role, nome, cognome, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Utenti</h1>
      <p className="text-gray-500 text-sm mb-6">{profiles?.length ?? 0} utenti registrati</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Utente</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Registrato</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Ruolo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(profiles ?? []).map(prof => {
              const nome = [prof?.nome, prof?.cognome].filter(Boolean).join(' ') || '—'
              return (
                <tr key={prof.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{nome}</p>
                    <p className="text-xs text-gray-400">{prof.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-sm">
                    {prof.created_at ? format(new Date(prof.created_at), 'd MMM yyyy', { locale: it }) : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <form action={cambiaRuolo} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={prof.id} />
                      <select name="role" defaultValue={prof?.role ?? 'user'}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#722F37]/30">
                        {RUOLI.map(r => <option key={r} value={r}>{RUOLO_LABEL[r]}</option>)}
                      </select>
                      <button type="submit" className="text-xs text-[#722F37] hover:underline">Salva</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

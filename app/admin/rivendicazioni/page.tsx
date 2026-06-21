import { createServerClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

async function approva(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const cantina_id = formData.get('cantina_id') as string
  const user_id = formData.get('user_id') as string
  const admin = createAdminClient()
  await admin.from('rivendicazioni').update({ status: 'approved' }).eq('id', id)
  await admin.from('cantine').update({ owner_id: user_id, verified: true }).eq('id', cantina_id)
  revalidatePath('/admin/rivendicazioni')
}

async function rifiuta(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin.from('rivendicazioni').update({ status: 'rejected' }).eq('id', id)
  revalidatePath('/admin/rivendicazioni')
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default async function RivendicazioniPage() {
  const supabase = await createServerClient()
  const { data: rivendicazioni } = await supabase
    .from('rivendicazioni')
    .select('*, cantine(nome)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Rivendicazioni</h1>
      <p className="text-gray-500 text-sm mb-6">
        Richieste di gestione schede da parte dei titolari delle cantine
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {(rivendicazioni ?? []).length === 0 ? (
          <div className="text-center py-16 text-gray-400">Nessuna rivendicazione</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(rivendicazioni ?? []).map((r: {
              id: string; cantina_id: string; user_id: string; nome_referente: string | null;
              email_referente: string | null; telefono: string | null; messaggio: string | null;
              status: string; created_at: string; cantine: { nome: string } | null
            }) => (
              <div key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{(r.cantine as { nome: string } | null)?.nome ?? 'Cantina sconosciuta'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {r.nome_referente} · {r.email_referente}
                      {r.telefono && ` · ${r.telefono}`}
                    </p>
                    {r.messaggio && (
                      <p className="text-sm text-gray-500 mt-1 italic">&quot;{r.messaggio}&quot;</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(r.created_at), "d MMM yyyy 'alle' HH:mm", { locale: it })}
                    </p>
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <form action={approva}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="cantina_id" value={r.cantina_id} />
                        <input type="hidden" name="user_id" value={r.user_id} />
                        <button type="submit"
                          className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Approva
                        </button>
                      </form>
                      <form action={rifiuta}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit"
                          className="flex items-center gap-1.5 text-xs bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Rifiuta
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

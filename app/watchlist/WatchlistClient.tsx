'use client'
import { useState } from 'react'
import { WatchlistItem, WatchlistType } from '@/types'
import { useI18n } from '@/lib/i18n'

interface Props {
  initialItems: WatchlistItem[]
  isPro: boolean
  defaultWhatsapp: string
}

const TYPE_OPTIONS: { value: WatchlistType; emoji: string; key: keyof typeof import('@/locales/en').default }[] = [
  { value: 'train_seat',   emoji: '🚆', key: 'trainSeat' },
  { value: 'darshan_slot', emoji: '🛕', key: 'darshanSlot' },
  { value: 'hotel_price',  emoji: '🏨', key: 'hotelPrice' },
  { value: 'bus_seat',     emoji: '🚌', key: 'busSeat' },
  { value: 'flight_price', emoji: '✈️', key: 'flightPrice' },
]

export default function WatchlistClient({ initialItems, isPro, defaultWhatsapp }: Props) {
  const { t } = useI18n()
  const [items, setItems]       = useState<WatchlistItem[]>(initialItems)
  const [form, setForm]         = useState({ type: 'train_seat' as WatchlistType, label: '', params: '', target_price: '', whatsapp: defaultWhatsapp })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const add = async () => {
    if (!form.label || !form.params) return
    setSaving(true); setError('')
    let params: Record<string, any> = {}
    try { params = JSON.parse(form.params) } catch { setError('Params must be valid JSON'); setSaving(false); return }

    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: form.type,
        label: form.label,
        params,
        target_price: form.target_price ? parseInt(form.target_price) : undefined,
        whatsapp_number: form.whatsapp || undefined,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setItems(prev => [data, ...prev])
      setForm(f => ({ ...f, label: '', params: '', target_price: '' }))
    } else {
      setError(data.error)
    }
    setSaving(false)
  }

  const remove = async (id: string) => {
    await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">{t.watchlistTitle}</h1>
        <p className="text-gray-400 mb-8 text-sm">{t.watchlistHint}</p>

        {!isPro && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-8 flex items-center justify-between">
            <span className="text-sm text-orange-300">WhatsApp alerts need Pro</span>
            <a href="/upgrade" className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg">Upgrade</a>
          </div>
        )}

        {/* Add form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 space-y-4">
          <h2 className="font-semibold text-lg">{t.alertWhen}</h2>

          <div className="flex gap-2 flex-wrap">
            {TYPE_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setForm(f => ({ ...f, type: o.value }))}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${form.type === o.value ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-700 text-gray-400 hover:border-orange-500'}`}
              >
                {o.emoji} {t[o.key] as string}
              </button>
            ))}
          </div>

          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
            placeholder="Alert label (e.g. Tirupati trip — Train seat)"
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          />

          <textarea
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 font-mono"
            rows={3}
            placeholder={`Params JSON, e.g.\n{"train_no":"12723","date":"2025-08-15","class":"3A"}`}
            value={form.params}
            onChange={e => setForm(f => ({ ...f, params: e.target.value }))}
          />

          {(form.type === 'hotel_price' || form.type === 'flight_price') && (
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
              placeholder="Target price in ₹ (alert when below this)"
              type="number"
              value={form.target_price}
              onChange={e => setForm(f => ({ ...f, target_price: e.target.value }))}
            />
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">{t.whatsappNumber} {!isPro && '(Pro only)'}</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 disabled:opacity-50"
              placeholder={t.whatsappHint}
              value={form.whatsapp}
              onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
              disabled={!isPro}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={add}
            disabled={saving || !form.label}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
          >
            {saving ? 'Saving...' : t.save}
          </button>
        </div>

        {/* Items list */}
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-12">{t.watchlistEmpty}</p>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-orange-400 text-xs font-medium uppercase tracking-wide">{item.type.replace('_', ' ')}</span>
                    {item.notified && <span className="text-green-400 text-xs">✓ Notified</span>}
                    {!item.active && <span className="text-gray-500 text-xs">Inactive</span>}
                  </div>
                  <p className="font-medium text-sm truncate">{item.label}</p>
                  {item.whatsapp_number && <p className="text-xs text-gray-500 mt-0.5">{item.whatsapp_number}</p>}
                  {item.last_checked_at && (
                    <p className="text-xs text-gray-600 mt-0.5">Last checked {new Date(item.last_checked_at).toLocaleString('en-IN')}</p>
                  )}
                </div>
                <button
                  onClick={() => remove(item.id)}
                  className="text-gray-600 hover:text-red-400 text-sm transition shrink-0"
                >
                  {t.remove}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'

interface Props {
  tripId: string
  initialShareEnabled: boolean
  initialShareToken?: string
}

export default function SharePanel({ tripId, initialShareEnabled, initialShareToken }: Props) {
  const { t } = useI18n()
  const supabase = createClient()
  const [enabled, setEnabled]   = useState(initialShareEnabled)
  const [token, setToken]       = useState(initialShareToken ?? '')
  const [loading, setLoading]   = useState(false)
  const [copied, setCopied]     = useState(false)

  const shareUrl = token ? `${window.location.origin}/share/${token}` : ''

  const toggle = async () => {
    setLoading(true)
    if (!enabled) {
      // Generate a token and enable
      const newToken = crypto.randomUUID().replace(/-/g, '')
      const { error } = await supabase
        .from('trips')
        .update({ share_enabled: true, share_token: newToken })
        .eq('id', tripId)

      if (!error) { setEnabled(true); setToken(newToken) }
    } else {
      // Disable sharing
      const { error } = await supabase
        .from('trips')
        .update({ share_enabled: false })
        .eq('id', tripId)

      if (!error) { setEnabled(false) }
    }
    setLoading(false)
  }

  const copy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">{t.shareTrip}</h2>
      <p className="text-sm text-gray-400">{t.sharePublic}</p>

      <button
        onClick={toggle}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition ${enabled ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
      >
        {loading ? '...' : enabled ? t.disableSharing : t.enableSharing}
      </button>

      {enabled && shareUrl && (
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
          <span className="text-xs text-gray-400 flex-1 truncate">{shareUrl}</span>
          <button onClick={copy} className="text-orange-400 text-xs shrink-0 font-medium">
            {copied ? t.linkCopied : t.copyLink}
          </button>
        </div>
      )}
    </div>
  )
}

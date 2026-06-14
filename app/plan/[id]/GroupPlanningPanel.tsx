'use client'
import { useState, useEffect } from 'react'
import { TripMember, MemberRole } from '@/types'
import { useI18n } from '@/lib/i18n'

interface Props {
  tripId: string
  destination: string
}

export default function GroupPlanningPanel({ tripId, destination }: Props) {
  const { t } = useI18n()
  const [members, setMembers]   = useState<TripMember[]>([])
  const [email, setEmail]       = useState('')
  const [role, setRole]         = useState<MemberRole>('viewer')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied]     = useState(false)

  useEffect(() => {
    fetch(`/api/group/invite?trip_id=${tripId}`)
      .then(r => r.json())
      .then(data => setMembers(Array.isArray(data) ? data : []))
  }, [tripId])

  const invite = async () => {
    if (!email) return
    setLoading(true)
    const res = await fetch('/api/group/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_id: tripId, email, role }),
    })
    const data = await res.json()
    if (res.ok) {
      setMembers(prev => [...prev, data.member])
      setInviteLink(data.invite_link)
      setSent(true)
      setEmail('')
      setTimeout(() => setSent(false), 3000)
    }
    setLoading(false)
  }

  const removeMember = async (id: string) => {
    await fetch(`/api/group/invite?id=${id}`, { method: 'DELETE' })
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-semibold">{t.groupPlanning}</h2>

      {/* Invite form */}
      <div className="space-y-3">
        <p className="text-sm text-gray-400">{t.inviteMembers}</p>
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
          placeholder={t.inviteEmail}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="flex gap-2">
          <select
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            value={role}
            onChange={e => setRole(e.target.value as MemberRole)}
          >
            <option value="editor">{t.editor}</option>
            <option value="viewer">{t.viewer}</option>
          </select>
          <button
            onClick={invite}
            disabled={loading || !email}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-sm transition"
          >
            {sent ? t.inviteSent : t.sendInvite}
          </button>
        </div>
        {inviteLink && (
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
            <span className="text-xs text-gray-400 flex-1 truncate">{inviteLink}</span>
            <button onClick={() => copyLink(inviteLink)} className="text-orange-400 text-xs shrink-0">
              {copied ? t.linkCopied : t.copyLink}
            </button>
          </div>
        )}
      </div>

      {/* Members list */}
      {members.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">{t.members}</h3>
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{m.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.role === 'owner' ? 'bg-orange-500/20 text-orange-400' : m.role === 'editor' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                      {m.role}
                    </span>
                    {!m.accepted && <span className="text-xs text-gray-500">Pending</span>}
                  </div>
                </div>
                {m.role !== 'owner' && (
                  <button onClick={() => removeMember(m.id)} className="text-gray-600 hover:text-red-400 text-sm transition">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useI18n } from '@/lib/i18n'
import { Lang } from '@/types'

const LANGS: { value: Lang; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'hi', label: 'हिन्दी',   flag: '🇮🇳' },
  { value: 'te', label: 'తెలుగు',   flag: '🇮🇳' },
]

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500 mr-1">{t.language}:</span>
      {LANGS.map(l => (
        <button
          key={l.value}
          onClick={() => setLang(l.value)}
          title={l.label}
          className={`text-sm px-2 py-1 rounded-lg transition ${lang === l.value ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-gray-500 hover:text-white'}`}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  )
}

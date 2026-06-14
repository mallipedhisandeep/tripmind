'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import en, { Strings } from '@/locales/en'
import hi from '@/locales/hi'
import te from '@/locales/te'
import { Lang } from '@/types'

const locales: Record<Lang, Strings> = { en, hi, te }

interface I18nContext {
  lang: Lang
  setLang: (l: Lang) => void
  t: Strings
}

const Ctx = createContext<I18nContext>({ lang: 'en', setLang: () => {}, t: en })

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('tripmind_lang') as Lang | null
    if (stored && locales[stored]) setLangState(stored)
  }, [])

  const setLang = (l: Lang) => {
    localStorage.setItem('tripmind_lang', l)
    setLangState(l)
  }

  return (
    <Ctx.Provider value={{ lang, setLang, t: locales[lang] }}>
      {children}
    </Ctx.Provider>
  )
}

export const useI18n = () => useContext(Ctx)

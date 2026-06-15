import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Language = 'en' | 'zh'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lang')
    return (saved === 'en' || saved === 'zh') ? saved : 'en'
  })

  const changeLang = useCallback((newLang: Language) => {
    localStorage.setItem('lang', newLang)
    setLang(newLang)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

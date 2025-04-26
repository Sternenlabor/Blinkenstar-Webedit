import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './i18n/en.json'
import de from './i18n/de.json'

i18n.use(initReactI18next) // ← hooks up the React plugin (adds hasLoadedNamespace, etc.)
    .init({
        resources: {
            en: { translation: en },
            de: { translation: de }
        },
        lng: 'en',
        fallbackLng: 'en',
        debug: __DEV__,
        ns: ['translation'],
        defaultNS: 'translation',
        interpolation: { escapeValue: false },
        react: { useSuspense: false }
    })

export default i18n

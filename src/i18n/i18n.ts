import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import 'intl-pluralrules'
import AsyncStoragePlugin from 'i18next-react-native-async-storage'

import { en, fr } from './locales';

// export const defaultNS = 'ns1';

// i18next
//   .use(initReactI18next)
//   .init({
//     debug: true,
//     fallbackLng: 'en',
//     defaultNS,
//   });

// export default i18next;


const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  }
}


i18next
  .use(initReactI18next)
  .use(AsyncStoragePlugin('en'))
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources
  })

export default i18next;
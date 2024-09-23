import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import 'intl-pluralrules'
import AsyncStoragePlugin from 'i18next-react-native-async-storage'
import ICU from 'i18next-icu'
import * as Localization from 'expo-localization';

import { en, fr } from './locales';

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
  .use(ICU)
  .init({
    debug: true,
    fallbackLng: 'en',
    lng: Localization.getLocales()[0]?.languageCode,
    interpolation: {
      escapeValue: false,
    },
    resources
  })


export default i18next;
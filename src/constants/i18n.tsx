import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import English from '../constants/Multilanguage/English.json';
import Hindi from '../constants/Multilanguage/Hindi.json';
import Marathi from '../constants/Multilanguage/Marathi.json';
import Kannada from '../constants/Multilanguage/Kannada.json';
import Telugu from '../constants/Multilanguage/Telugu.json';
import Urdu from '../constants/Multilanguage/Urdu.json';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: English },
      hi: { translation: Hindi },
      mr: { translation: Marathi },
      kn: { translation: Kannada },
      te: { translation: Telugu },  
      ur: { translation: Urdu },    
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

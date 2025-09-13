import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import pt from "./locales/pt/translation.json";
import es from "./locales/es/translation.json";
import de from "./locales/de/translation.json";
import fr from "./locales/fr/translation.json";
import zh from "./locales/zh/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
      de: { translation: de },
      fr: { translation: fr },
      zh: { translation: zh }
    },
    fallbackLng: "pt",
    interpolation: {
      escapeValue: false, // o React já protege contra XSS
    },
  });

export default i18n;

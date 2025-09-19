import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
    const {i18n} = useTranslation();
    return (
        <div className="fixed bottom-4 right-4 opacity-70 text-sm">
            <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
            >
            <option value="pt">🇵🇹 PT</option>
            <option value="en">🇬🇧 EN</option>
            <option value="es">🇪🇸 ES</option>
            <option value="fr">🇫🇷 FR</option>
            <option value="de">🇩🇪 DE</option>
            <option value="zh">🇨🇳 ZH</option>
            </select>
      </div>
    );
};

export default LanguageSelector;
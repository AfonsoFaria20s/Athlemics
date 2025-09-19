// Home.jsx
import React, { useState } from "react";
import AuthModal from "./AuthModal";
import { useTranslation } from 'react-i18next';
import LanguageSelector from "../LanguageSelector";

const Home = () => {
  const [showAuth, setShowAuth] = useState(false);
  const {t} = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-800">{t("welcome_home")}</h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
        {t("welcomeDesc_home")}
      </p>
      <button
        onClick={() => setShowAuth(true)}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
      >
        {t("enter_register")}
      </button>

      {showAuth && <AuthModal close={() => setShowAuth(false)} />}

        <LanguageSelector/>
    </div>
  );
};

export default Home;

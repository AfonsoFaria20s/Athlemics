// Home.jsx
import React, { useState } from "react";
import AuthModal from "./AuthModal";

const Home = () => {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-800">Bem-vindo ao Athlemics</h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
        A tua ferramenta para organizar o teu tempo, treinos e estudos com um calendário visual, objetivos e tarefas personalizadas.
      </p>
      <button
        onClick={() => setShowAuth(true)}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
      >
        Entrar / Registar
      </button>

      {showAuth && <AuthModal close={() => setShowAuth(false)} />}
    </div>
  );
};

export default Home;

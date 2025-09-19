// AuthModal.jsx
import React, { useState } from "react";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

const AuthModal = ({ close }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      close(); // fecha modal após login/registo
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm relative">
        <button onClick={close} className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl">×</button>
        <h2 className="text-xl font-bold mb-4 text-blue-700">
          {isRegister ? "Criar Conta" : "Iniciar Sessão"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mb-3"
        >
          {isRegister ? "Registar" : "Entrar"}
        </button>

        <p className="text-center text-sm text-gray-500">
          {isRegister ? "Já tens conta?" : "Ainda não tens conta?"}{" "}
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-600 underline">
            {isRegister ? "Entrar" : "Registar"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;

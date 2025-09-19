import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaBook, FaRunning } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../firebase";
import LanguageSelector from '../LanguageSelector';

const db = getFirestore(app);
const auth = getAuth();

const camposPerfil = ['nome', 'email', 'curso', 'modalidade'];

const Account = () => {
  const { t, i18n } = useTranslation();

  const [perfil, setPerfil] = useState(null); // perfil carregado do Firebase
  const [editing, setEditing] = useState(false);
  const [blocos, setBlocos] = useState([]);

  // Função para calcular minutos de blocos
  function calcularMinutos(inicio, fim) {
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fim.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }

  // Carregar dados do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userDoc = doc(db, "users", user.uid);
      const snap = await getDoc(userDoc);

      if (snap.exists()) {
        const data = snap.data();
        setPerfil(data.profile || camposPerfil.reduce((acc, c) => ({ ...acc, [c]: '' }), {}));
        setBlocos(data.blocks || []);
      } else {
        const perfilInicial = camposPerfil.reduce((acc, c) => ({ ...acc, [c]: '' }), {});
        await setDoc(userDoc, { profile: perfilInicial, blocks: [], goals: [] });
        setPerfil(perfilInicial);
        setBlocos([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const salvarPerfil = async () => {
    if (!perfil) return;
    const user = auth.currentUser;
    if (!user) return;
    const userDoc = doc(db, "users", user.uid);

    await setDoc(userDoc, { profile: perfil }, { merge: true });
    setEditing(false);
    alert(t("profile_saved"));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // opcional: redirecionar ou resetar estado
      setPerfil(null);
      setPerfilSalvo(null);
      setBlocos([]);
      alert(t("logged_out")); // podes adicionar tradução
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Estatísticas com base nos blocos
  const totalBlocos = blocos.length;
  const totalMinEstudo = blocos.filter(b => b.type === 'study').reduce((acc, b) => acc + calcularMinutos(b.start, b.end), 0);
  const totalMinTreino = blocos.filter(b => b.type === 'train').reduce((acc, b) => acc + calcularMinutos(b.start, b.end), 0);
  const ultimaAtividade = blocos.map(b => new Date(`${b.date}T${b.start}`)).sort((a, b) => b - a)[0]?.toLocaleString('pt-PT');

  if (!perfil) return <div>Carregando...</div>; // evita TypeError

  const perfilEstaPreenchido = camposPerfil.every(c => perfil[c]?.trim() !== '');

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-white to-blue-50">
      {perfilEstaPreenchido && !editing ? (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-4xl font-bold">
              {perfil.nome[0]}
            </div>
            <h2 className="text-2xl font-bold text-blue-800">{t("welcome")}, {perfil.nome}!</h2>
            <p className="text-slate-500">
              {t("student_of")} {perfil.curso} | {t("modality")}: {perfil.modalidade}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
            <p><FaUser className="inline mr-2 text-blue-600" />{t("name")}: <span className="font-semibold">{perfil.nome}</span></p>
            <p><FaEnvelope className="inline mr-2 text-blue-600" />Email: <span className="font-semibold">{perfil.email}</span></p>
            <p><FaBook className="inline mr-2 text-blue-600" />{t("course")}: <span className="font-semibold">{perfil.curso}</span></p>
            <p><FaRunning className="inline mr-2 text-blue-600" />{t("modality")}: <span className="font-semibold">{perfil.modalidade}</span></p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg shadow-inner text-sm">
            <h3 className="font-semibold text-blue-800 mb-2">{t("activity_summary")}</h3>
            <ul className="space-y-1">
              <li><strong>{totalBlocos}</strong> {t("blocks_created")}</li>
              <li><strong>{Math.round(totalMinEstudo / 60)}h</strong> {t("total_study")}</li>
              <li><strong>{Math.round(totalMinTreino / 60)}h</strong> {t("total_training")}</li>
              <li>{t("last_activity")}: {ultimaAtividade || t("no_data")}</li>
            </ul>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow transition-colors duration-200"
            >
              {t("edit_profile")}
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition-colors duration-200"
            >
              {t("logout")}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow space-y-6">
          <h2 className="text-2xl font-bold text-blue-800 text-center">{perfilEstaPreenchido ? t("edit_profile") : t("create_profile")}</h2>
          <div className="space-y-4">
            {camposPerfil.map(campo => (
              <div key={campo}>
                <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{t(campo)}</label>
                <input
                  className="border border-slate-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  name={campo}
                  value={perfil[campo]}
                  onChange={handleChange}
                  placeholder={`${t("enter")} ${t(campo)}`}
                />
              </div>
            ))}
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
              onClick={salvarPerfil}
            >
              {t("save_profile")}
            </button>
          </div>
        </div>
      )}

      <LanguageSelector/>
    </div>
  );
};

export default Account;

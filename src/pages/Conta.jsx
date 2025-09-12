import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaBook, FaRunning } from 'react-icons/fa';

const camposPerfil = ['nome', 'email', 'curso', 'modalidade'];

const Conta = () => {
  const perfilVazio = camposPerfil.reduce((acc, campo) => ({ ...acc, [campo]: '' }), {});
  const [perfil, setPerfil] = useState(perfilVazio);
  const [perfilSalvo, setPerfilSalvo] = useState(null);
  const [blocos, setBlocos] = useState([]);

  useEffect(() => {
    const storedPerfil = localStorage.getItem('perfil');
    if (storedPerfil) {
      try {
        const parsed = JSON.parse(storedPerfil);
        setPerfil(parsed);
        setPerfilSalvo(parsed);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      }
    }

    const storedBlocos = localStorage.getItem('blocks');
    if (storedBlocos) {
      try {
        setBlocos(JSON.parse(storedBlocos));
      } catch (err) {
        console.error('Erro ao carregar blocos:', err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const salvarPerfil = () => {
    localStorage.setItem('perfil', JSON.stringify(perfil));
    setPerfilSalvo(perfil);
    alert('Perfil salvo com sucesso!');
  };

  const editarPerfil = () => {
    setPerfilSalvo(null);
  };

  const perfilEstaSalvo = perfilSalvo && camposPerfil.every(c => perfilSalvo[c]?.trim() !== '');

  // Estatísticas com base nos blocos
  const totalBlocos = blocos.length;
  const totalMinEstudo = blocos
    .filter(b => b.type === 'study')
    .reduce((acc, b) => acc + calcularMinutos(b.start, b.end), 0);

  const totalMinTreino = blocos
    .filter(b => b.type === 'train')
    .reduce((acc, b) => acc + calcularMinutos(b.start, b.end), 0);

  const ultimaAtividade = blocos
    .map(b => new Date(`${b.date}T${b.start}`))
    .sort((a, b) => b - a)[0]?.toLocaleString('pt-PT');

  function calcularMinutos(inicio, fim) {
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fim.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-white to-blue-50">
      {perfilEstaSalvo ? (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-4xl font-bold">
              {perfilSalvo.nome[0]}
            </div>
            <h2 className="text-2xl font-bold text-blue-800">Olá, {perfilSalvo.nome}!</h2>
            <p className="text-slate-500">Estudante de {perfilSalvo.curso} | Modalidade: {perfilSalvo.modalidade}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
            <p><FaUser className="inline mr-2 text-blue-600" />Nome: <span className="font-semibold">{perfilSalvo.nome}</span></p>
            <p><FaEnvelope className="inline mr-2 text-blue-600" />Email: <span className="font-semibold">{perfilSalvo.email}</span></p>
            <p><FaBook className="inline mr-2 text-blue-600" />Curso: <span className="font-semibold">{perfilSalvo.curso}</span></p>
            <p><FaRunning className="inline mr-2 text-blue-600" />Modalidade: <span className="font-semibold">{perfilSalvo.modalidade}</span></p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg shadow-inner text-sm">
            <h3 className="font-semibold text-blue-800 mb-2">Resumo da Atividade</h3>
            <ul className="space-y-1">
              <li><strong>{totalBlocos}</strong> blocos criados</li>
              <li><strong>{Math.round(totalMinEstudo / 60)}h</strong> de estudo total</li>
              <li><strong>{Math.round(totalMinTreino / 60)}h</strong> de treino total</li>
              <li>Última atividade: {ultimaAtividade || 'Sem dados'}</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={editarPerfil}
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded shadow"
            >
              Editar Perfil
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow space-y-6">
          <h2 className="text-2xl font-bold text-blue-800 text-center">Criar Perfil</h2>
          <div className="space-y-4">
            {camposPerfil.map(campo => (
              <div key={campo}>
                <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{campo}</label>
                <input
                  className="border border-slate-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  name={campo}
                  value={perfil[campo]}
                  onChange={handleChange}
                  placeholder={`Insira o seu ${campo}`}
                />
              </div>
            ))}
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
              onClick={salvarPerfil}
            >
              Salvar Perfil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conta;

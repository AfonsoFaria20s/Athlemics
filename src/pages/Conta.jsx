import React, { useState, useEffect } from 'react';
import '../styles/NavBar.css';
import '../styles/colors.css';
import Navbar from '../components/Navbar';

const camposPerfil = ['nome', 'email', 'curso', 'modalidade'];

const Conta = () => {
  const perfilVazio = camposPerfil.reduce((acc, campo) => ({ ...acc, [campo]: '' }), {});
  const [perfil, setPerfil] = useState(perfilVazio);
  const [perfilSalvo, setPerfilSalvo] = useState(null); // <- novo estado

  // Carregar perfil salvo do localStorage ao entrar
  useEffect(() => {
    const stored = localStorage.getItem('perfil');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPerfil(parsed);
        setPerfilSalvo(parsed);
      } catch (err) {
        console.error('Erro ao ler perfil:', err);
      }
    }
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setPerfil(prev => ({ ...prev, [name]: value }));
  };

  const salvarPerfil = () => {
    localStorage.setItem('perfil', JSON.stringify(perfil));
    setPerfilSalvo(perfil); // <- agora está oficialmente salvo
    alert('Perfil salvo com sucesso!');
  };

  const editarPerfil = () => {
    setPerfilSalvo(null); // <- volta ao modo formulário
  };

  const perfilEstaSalvo = perfilSalvo && camposPerfil.every(c => perfilSalvo[c]?.trim() !== '');

  return (
    <>
      {perfilEstaSalvo ? (
        // MODO VISUAL
        <div className="p-6">
          <div className="bg-white p-8 rounded shadow max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">
              Bem-vindo, {perfilSalvo.nome}!
            </h2>
            {camposPerfil.map(campo => (
              <p key={campo}>
                <strong>{campo.charAt(0).toUpperCase() + campo.slice(1)}:</strong> {perfilSalvo[campo]}
              </p>
            ))}
            <button
              className="mt-6 bg-yellow-500 text-white px-4 py-2 rounded w-full"
              onClick={editarPerfil}
            >
              Editar perfil
            </button>
          </div>
        </div>
      ) : (
        // MODO FORMULÁRIO
        <div className="p-6">
          <div className="container mx-auto">
            <h2 className="text-primary text-2xl font-bold mb-4 text-center">Criar Perfil</h2>
            <div className="space-y-4 max-w-md mx-auto">
              {camposPerfil.map(campo => (
                <input
                  key={campo}
                  className="border rounded p-2 w-full"
                  name={campo}
                  placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                  value={perfil[campo]}
                  onChange={handleChange}
                />
              ))}
              <button className="bg-primary text-white px-4 py-2 rounded w-full" onClick={salvarPerfil}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Conta;

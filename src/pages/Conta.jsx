import React, { useState, useEffect } from 'react';
import '../styles/NavBar.css';
import '../styles/colors.css';
import Navbar from '../components/Navbar';

const Conta = () => {
    const [perfil, setPerfil] = useState({ nome: '', email: '', curso: '', modalidade: '' });

    useEffect(() => {
        const storedPerfil = JSON.parse(localStorage.getItem('perfil')) || perfil;
        setPerfil(storedPerfil);
    }, []);

    const handleChange = e => {
        setPerfil({ ...perfil, [e.target.name]: e.target.value });
    };

    const salvarPerfil = () => {
        localStorage.setItem('perfil', JSON.stringify(perfil));
    };

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-primary text-2xl font-bold mb-4">Minha Conta</h2>
            <div className="space-y-4 max-w-md">
                <input className="border rounded p-2 w-full" name="nome" placeholder="Nome" value={perfil.nome} onChange={handleChange} />
                <input className="border rounded p-2 w-full" name="email" placeholder="Email" value={perfil.email} onChange={handleChange} />
                <input className="border rounded p-2 w-full" name="curso" placeholder="Curso" value={perfil.curso} onChange={handleChange} />
                <input className="border rounded p-2 w-full" name="modalidade" placeholder="Modalidade esportiva" value={perfil.modalidade} onChange={handleChange} />
                <button className="bg-primary text-white px-4 py-2 rounded" onClick={salvarPerfil}>Salvar</button>
            </div>
        </div>
    );
};

export default Conta;

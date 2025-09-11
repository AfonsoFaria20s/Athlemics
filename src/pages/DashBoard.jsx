import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/DashBoard.css"

const DashBoard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blocks, setBlocks] = useState([]);
  const [blockTitle, setBlockTitle] = useState("");
  const [blockDesc, setBlockDesc] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockType, setBlockType] = useState("study");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [account, setAccount] = useState({ 
    nome: '', 
    email: '', 
    curso: '', 
    modalidade: '' 
  });

  // LocalStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("blocks")) || [];
    setBlocks(stored);

    const storedAccountDetails = JSON.parse(localStorage.getItem("perfil") || account);
    setAccount(storedAccountDetails);
  }, []);

  useEffect(() => {
    localStorage.setItem("blocks", JSON.stringify(blocks));
  }, [blocks]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => new Date(year, month, i + 1));
  };

  const daysInMonth = getDaysInMonth(selectedDate);

  const handleMonthChange = (dir) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(dir === "prev" ? newDate.getMonth() - 1 : newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const formattedSelectedDate = selectedDate.toISOString().split("T")[0];
  const filteredBlocks = blocks.filter((b) => b.date === formattedSelectedDate);

  const handleAddBlock = () => {
    if (!blockTitle || !blockStart || !blockEnd) return;
    if (editId) {
      // Edita bloco existente
      setBlocks(blocks.map(b => b.id === editId ? {
        ...b,
        title: blockTitle,
        desc: blockDesc,
        start: blockStart,
        end: blockEnd,
        type: blockType
      } : b));
    } else {
      // Adiciona novo bloco
      const newBlock = {
        id: Date.now(),
        title: blockTitle,
        desc: blockDesc,
        start: blockStart,
        end: blockEnd,
        type: blockType,
        date: formattedSelectedDate,
        completed: false,
      };
      setBlocks([...blocks, newBlock]);
    }
    setBlockTitle("");
    setBlockDesc("");
    setBlockStart("");
    setBlockEnd("");
    setBlockType("others");
    setShowForm(false);
    setEditId(null);
  };

  const toggleCompleted = (id) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b)));
  };

  const removeBlock = (id) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  // Definições para timeline
  const HOUR_HEIGHT = 32; // altura base de cada hora
  const HOUR_GAP = 8; // espaço extra entre horas
  const TOTAL_HEIGHT = (HOUR_HEIGHT + HOUR_GAP) * 24;

  return (
    <div className="">
      {/* Boas vindas */}
      <div className="px-20 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-blue-800">Bem-vindo {account.nome}!</h1>
        <p className="text-slate-600">Organize o seu dia e acompanhe o seu progresso.</p>
      </div>
      <div className="container-all flex flex-wrap gap-4 px-20 pb-20">
        {/* 3 Cartões em linha */}
        <div className="flex gap-6 mb-8 w-full">
          <div className="flex-1 bg-blue-50 p-6 rounded-2xl shadow-lg border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-2">Próximos Blocos</h3>
            <ul className="space-y-2 text-gray-700">
              {blocks.filter(b => new Date(b.date) >= new Date()).slice(0,3).map(b => (
                <li key={b.id}>{b.time} - {b.title}</li>
              ))}
              {blocks.filter(b => new Date(b.date) >= new Date()).length === 0 && <li className="text-slate-500">Nenhum bloco próximo</li>}
            </ul>
          </div>
          <div className="flex-1 bg-blue-50 p-6 rounded-2xl shadow-lg border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-2">Tarefas</h3>
            <ul className="space-y-2 text-gray-700">
              <li>Submeter ensaio de História</li>
              <li>Revisão de Capítulo de Biologia</li>
            </ul>
          </div>
          <div className="flex-1 bg-blue-50 p-6 rounded-2xl shadow-lg border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-2">Metas</h3>
            <ul className="space-y-2 text-gray-700">
              <li>Estudar 2h por dia</li>
              <li>Treinar 3x por semana</li>
            </ul>
          </div>
        </div>
        {/* Calendário */}
        <div className="bg-white rounded p-4 shadow flex-1 max-w-lg">
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => handleMonthChange("prev")} className="px-3 py-1 rounded hover:bg-slate-200">‹</button>
            <h2 className="font-semibold">{selectedDate.toLocaleString("pt-PT", { month: "long", year: "numeric" })}</h2>
            <button onClick={() => handleMonthChange("next")} className="px-3 py-1 rounded hover:bg-slate-200">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["D","S","T","Q","Q","S","S"].map((d) => (
              <span key={d} className="font-semibold ratio-1">{d}</span>
            ))}
            {Array(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay())
              .fill(null)
              .map((_, i) => <span key={"e"+i}></span>)}
            {daysInMonth.map((day) => {
              const isSelected = day.toDateString() === selectedDate.toDateString();
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`ratio-1 px-2 py-1 rounded hover:bg-slate-200
                    ${isSelected ? "bg-blue-500 text-white font-bold" : ""}
                    ${isToday ? "bg-blue-200 text-blue-600" : ""}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
        {/* Vista do Dia */}
        <div className="bg-white rounded p-4 shadow flex-1 min-w-[350px]">
          <h2 className="mb-2 font-semibold">Dia {selectedDate.toLocaleDateString("pt-PT")}</h2>
          <div className="flex flex-col gap-2 mb-4">
            <button onClick={() => setShowForm(true)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition w-fit">
              Adicionar
            </button>
          </div>
          {/* Timeline moderna hora a hora com blocos contínuos */}
          <div className="p-4 relative overflow-y-scroll max-h-[400px] rounded bg-slate-50 mb-4" style={{minWidth: 220, height: TOTAL_HEIGHT}}>
            {/* Horas à esquerda */}
            <div className="absolute w-14 flex flex-col z-10 pointer-events-none">
              {Array.from({ length: 24 }).map((_, hour) => (
                <span key={hour} className="text-slate-500 font-mono text-xs flex items-center" style={{height: `${HOUR_HEIGHT}px`, marginBottom: `${HOUR_GAP}px`}}>{hour.toString().padStart(2, "0") + ":00"}</span>
              ))}
            </div>
            {/* Blocos posicionados */}
            <div className="relative ml-14" style={{height: TOTAL_HEIGHT}}>
              {filteredBlocks.map(block => {
                // Calcula posição e altura do bloco considerando gap
                const startParts = block.start.split(":");
                const endParts = block.end.split(":");
                const startHour = parseInt(startParts[0], 10) + parseInt(startParts[1], 10)/60;
                const endHour = parseInt(endParts[0], 10) + parseInt(endParts[1], 10)/60;
                const top = startHour * (HOUR_HEIGHT + HOUR_GAP);
                const height = Math.max(20, (endHour-startHour) * (HOUR_HEIGHT + HOUR_GAP));
                return (
                  <div key={block.id}
                    className={`mt-4 absolute left-2 right-2 flex items-center px-3 py-2 rounded-lg shadow-lg transition-all
                      ${block.type === "study" ? "bg-blue-400/80 text-white" : ""}
                      ${block.type === "train" ? "bg-green-400/80 text-white" : ""}
                      ${block.type === "rest" ? "bg-slate-400/80 text-white" : ""}
                      ${block.type === "class" ? "bg-yellow-300/80 text-white" : ""}
                      ${block.completed ? "line-through opacity-70" : ""}`}
                    style={{top: top, height: height, zIndex: 20}}
                  >
                    <span className="font-semibold mr-2 text-xs">{block.start} - {block.end}</span>
                    <span className="flex-1 text-sm">{block.title}</span>
                    <button onClick={() => {
                      setBlockTitle(block.title);
                      setBlockStart(block.start);
                      setBlockEnd(block.end);
                      setBlockType(block.type);
                      setShowForm(true);
                      setEditId(block.id);
                    }} className="text-white px-1 py-0.5 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                        <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                      </svg>
                    </button>
                    <button onClick={() => toggleCompleted(block.id)} className="bg-white text-black px-1 py-0.5 rounded hover:bg-slate-200">✔</button>
                    <button onClick={() => removeBlock(block.id)} className="bg-red-500 text-white px-1 py-0.5 rounded hover:bg-red-600">✖</button>
                  </div>
                );
              })}
              {/* Se não houver blocos */}
              {filteredBlocks.length === 0 && (
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-slate-400 text-center">Nenhum bloco para este dia</div>
              )}
            </div>
          </div>
          {/* Form para adicionar/editar bloco como modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-[90vw] relative">
                <button onClick={() => {setShowForm(false); setBlockTitle(""); setBlockStart(""); setBlockEnd(""); setBlockType("study"); setEditId(null);}} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-xl">
                  ×
                </button>
                <h2 className="text-lg font-bold mb-4 text-blue-800">{editId ? "Editar bloco" : "Adicionar bloco"}</h2>
                <input 
                  type="text" 
                  placeholder="Título do bloco" 
                  value={blockTitle} 
                  onChange={e => setBlockTitle(e.target.value)} 
                  className="border border-slate-400 rounded px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="text" 
                  placeholder="Descrição do Bloco" 
                  value={blockDesc} 
                  onChange={e => setBlockDesc(e.target.value)} 
                  className="border border-slate-400 rounded px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 mb-2">
                  <input 
                    type="time" 
                    value={blockStart} 
                    onChange={e => setBlockStart(e.target.value)} 
                    className="border border-slate-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/2"
                    placeholder="Início"
                  />
                  <input 
                    type="time" 
                    value={blockEnd} 
                    onChange={e => setBlockEnd(e.target.value)} 
                    className="border border-slate-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/2"
                    placeholder="Fim"
                  />
                </div>
                <select 
                  value={blockType} 
                  onChange={e => setBlockType(e.target.value)}
                  className="border border-slate-400 rounded px-2 py-1 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="study">Estudo</option>
                  <option value="train">Treino</option>
                  <option value="rest">Descanso</option>
                  <option value="class">Aula</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={handleAddBlock} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
                    {editId ? "Guardar alterações" : "Guardar"}
                  </button>
                  <button onClick={() => {setShowForm(false); setBlockTitle(""); setBlockStart(""); setBlockEnd(""); setBlockType("study"); setEditId(null);}} className="bg-slate-400 text-white px-3 py-1 rounded hover:bg-slate-500 transition">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;

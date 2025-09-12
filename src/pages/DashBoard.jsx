import React, { useState, useEffect } from "react";
import "../styles/DashBoard.css";

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
    nome: "",
    email: "",
    curso: "",
    modalidade: "",
  });

  const HOUR_HEIGHT = 32;
  const HOUR_GAP = 8;
  const TOTAL_HEIGHT = (HOUR_HEIGHT + HOUR_GAP) * 24;
  const PADDING_TOP = 16; // compensar padding do container

  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  function groupOverlappingBlocks(blocks) {
    const sorted = [...blocks].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    const groups = [];

    sorted.forEach(block => {
      const start = toMinutes(block.start);
      const end = toMinutes(block.end);
      let placed = false;

      for (const group of groups) {
        const hasOverlap = group.some(b => {
          const s = toMinutes(b.start);
          const e = toMinutes(b.end);
          return !(end <= s || start >= e);
        });

        if (hasOverlap) {
          group.push(block);
          placed = true;
          break;
        }
      }

      if (!placed) {
        groups.push([block]);
      }
    });

    return groups.flatMap(group =>
      group.map((b, i) => ({
        ...b,
        overlapIndex: i,
        overlapCount: group.length,
      }))
    );
  }

  const isSameDate = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("blocks")) || [];
    setBlocks(stored);

    const storedAccount = localStorage.getItem("perfil");
    if (storedAccount) setAccount(JSON.parse(storedAccount));
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

  const filteredBlocks = blocks
    .filter(b => isSameDate(new Date(b.date), selectedDate))
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const nextBlocks = blocks
    .filter(b => new Date(`${b.date}T${b.start}`) >= new Date())
    .sort((a, b) => new Date(`${a.date}T${a.start}`) - new Date(`${b.date}T${b.start}`))
    .slice(0, 3);

  const handleAddBlock = () => {
    if (!blockTitle || !blockStart || !blockEnd) return;

    const newBlock = {
      id: editId || Date.now(),
      title: blockTitle,
      desc: blockDesc,
      start: blockStart,
      end: blockEnd,
      type: blockType,
      date: selectedDate.toISOString().split("T")[0],
      completed: false,
    };

    setBlocks(prev => {
      let updated;
      if (editId) {
        updated = prev.map(b => b.id === editId ? newBlock : b);
      } else {
        updated = [...prev, newBlock];
      }
      localStorage.setItem("blocks", JSON.stringify(updated)); // salva no localStorage
      return updated;
    });

    setBlockTitle(""); setBlockDesc(""); setBlockStart(""); setBlockEnd(""); setBlockType("study");
    setShowForm(false); setEditId(null);
  };

  const toggleCompleted = (id) => setBlocks(blocks.map(b => b.id === id ? { ...b, completed: !b.completed } : b));
  const removeBlock = (id) => setBlocks(blocks.filter(b => b.id !== id));

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const minuteHeight = HOUR_HEIGHT / 60 + HOUR_GAP / 60;
  const currentTop = currentMinutes * minuteHeight + PADDING_TOP;

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-16">
        {/* Header */}
        {account.nome ? (
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-blue-800">Bem-vindo {account.nome}!</h1>
            <p className="text-slate-600 mt-1 text-base">Organize o seu dia e acompanhe o seu progresso de atleta-estudante.</p>
          </div>
        ) : (
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-blue-800">
              Bem-vindo! Comece por introduzir os seus dados <a href="/conta" className="text-blue-600 underline hover:text-blue-800">aqui</a>
            </h1>
          </div>
        )}

        {/* Cards */}
        <div className="flex flex-wrap gap-6 mb-12">
          <div className="flex-1 min-w-[280px] bg-white p-6 rounded-2xl shadow border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-4">Próximos Blocos</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              {nextBlocks.length > 0 ? nextBlocks.map(b => (
                <li key={b.id} className="flex gap-2 items-center">
                  <span className="font-mono text-xs text-blue-600">{b.start}</span> - {b.title}
                </li>
              )) : (
                <li className="text-slate-500">Nenhum bloco próximo</li>
              )}
            </ul>
          </div>

          <div className="flex-1 min-w-[280px] bg-white p-6 rounded-2xl shadow border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-4">Tarefas</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              {blocks
                .filter(b => {
                  if (!isSameDate(new Date(b.date), selectedDate)) return false;
                  if (!(b.type === "task" || b.type === "meeting")) return false;

                  // se for hoje, filtra apenas os blocos depois da hora atual
                  if (isSameDate(selectedDate, currentTime)) {
                    const blockMinutes = toMinutes(b.start);
                    return blockMinutes >= currentTime.getHours() * 60 + currentTime.getMinutes();
                  }
                  return true; // se for outro dia, mostra todos
                })
                .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
                .map(b => (
                  <li key={b.id} className="flex gap-2 items-center">
                    <span className="font-mono text-xs text-blue-600">{b.start}</span> - {b.title} {b.type === "meeting" && "(Reunião)"}
                  </li>
                ))
                .length === 0 && <li className="text-slate-500">Nenhuma tarefa ou reunião futura</li>}
            </ul>
          </div>

          <div className="flex-1 min-w-[280px] bg-white p-6 rounded-2xl shadow border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-4">Metas</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>Sem metas definidas.</li>
            </ul>
          </div>
        </div>

        {/* Calendário + Timeline */}
        <div className="flex flex-wrap gap-6">
          {/* Calendário */}
          <div className="bg-white rounded-2xl p-6 shadow flex-1 min-w-[320px] max-w-lg border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => handleMonthChange("prev")} className="px-3 py-1 rounded hover:bg-slate-200 text-xl">‹</button>
              <h2 className="font-semibold text-lg text-blue-800">{selectedDate.toLocaleString("pt-PT", { month: "long", year: "numeric" })}</h2>
              <button onClick={() => handleMonthChange("next")} className="px-3 py-1 rounded hover:bg-slate-200 text-xl">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-slate-500 mb-2">
              {["D","S","T","Q","Q","S","S"].map(d => <span id={d} key={d}>{d}</span>)}
              {Array(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay()).fill(null).map((_, i) => <span key={"e" + i}></span>)}
              {daysInMonth.map(day => {
                const isSelected = day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                    className={`rounded-full aspect-square w-8 mx-auto
                      ${isSelected ? "bg-blue-500 text-white font-bold" : ""}
                      ${isToday && !isSelected ? "bg-blue-100 text-blue-600" : ""}
                      hover:bg-blue-200 transition`}>
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow flex-1 min-w-[350px] border border-blue-100">
            <h2 className="text-lg font-bold text-blue-800 mb-4">Dia {selectedDate.toLocaleDateString("pt-PT")}</h2>
            <button onClick={() => setShowForm(true)} className="mb-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition w-fit">
              + Adicionar Bloco
            </button>

            <div className="relative overflow-y-scroll max-h-[400px] rounded bg-slate-50 border border-slate-200" style={{ minWidth: 220, height: TOTAL_HEIGHT, paddingTop: PADDING_TOP, paddingLeft: 16 }}>
              {/* Horas */}
              <div className="absolute w-14 flex flex-col z-10 pointer-events-none">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <span key={hour} className="text-slate-500 font-mono text-xs flex items-center" style={{ height: `${HOUR_HEIGHT}px`, marginBottom: `${HOUR_GAP}px` }}>
                    {hour.toString().padStart(2,"0") + ":00"}
                  </span>
                ))}
              </div>

              {/* Blocos */}
              <div className="relative ml-14" style={{ height: TOTAL_HEIGHT }}>
                {groupOverlappingBlocks(filteredBlocks).map(block => {
                const start = toMinutes(block.start);
                const end = toMinutes(block.end);

                const minuteHeight = HOUR_HEIGHT / 60 + HOUR_GAP / 60;
                const top = start * minuteHeight;
                const height = Math.max(20, (end - start) * minuteHeight);

                const blockWidth = 100 / block.overlapCount;
                const leftOffset = block.overlapIndex * blockWidth;

                // Handler de drag
                const handleMouseDown = (e) => {
                  e.preventDefault();
                  const startY = e.clientY;
                  const initialTop = top;

                  const onMouseMove = (moveEvent) => {
                    const delta = moveEvent.clientY - startY;
                    const newTop = initialTop + delta;
                    const newStartMinutes = Math.round((newTop - PADDING_TOP) / minuteHeight);

                    // Atualiza temporariamente a posição (visual)
                    setBlocks(prev =>
                      prev.map(b => b.id === block.id ? { ...b, tempTop: newStartMinutes } : b)
                    );
                  };

                  const onMouseUp = () => {
                    setBlocks(prev =>
                      prev.map(b => {
                        if (b.id === block.id) {
                          const newStart = Math.max(0, Math.min(24*60-1, b.tempTop || start));
                          const duration = toMinutes(b.end) - toMinutes(b.start);
                          const newEndHour = Math.floor((newStart + duration) / 60).toString().padStart(2, "0");
                          const newEndMin = ((newStart + duration) % 60).toString().padStart(2, "0");
                          const newStartHour = Math.floor(newStart / 60).toString().padStart(2, "0");
                          const newStartMin = (newStart % 60).toString().padStart(2, "0");

                          return {
                            ...b,
                            start: `${newStartHour}:${newStartMin}`,
                            end: `${newEndHour}:${newEndMin}`,
                            tempTop: undefined
                          };
                        }
                        return b;
                      })
                    );

                    window.removeEventListener("mousemove", onMouseMove);
                    window.removeEventListener("mouseup", onMouseUp);
                  };

                  window.addEventListener("mousemove", onMouseMove);
                  window.addEventListener("mouseup", onMouseUp);
                };

                const displayTop = PADDING_TOP + (block.tempTop !== undefined ? block.tempTop * minuteHeight : start * minuteHeight);

                return (
                  <div
                    key={block.id}
                    className={`timeline-block absolute flex items-center px-3 py-2 rounded-lg shadow-md text-sm
                      ${block.type === "study" ? "bg-slate-500 text-white" : ""}
                      ${block.type === "train" ? "bg-yellow-300 text-white" : ""}
                      ${block.type === "class" ? "bg-blue-300 text-white" : ""}
                      ${block.type === "task" ? "bg-brown-300 text-white" : ""}
                      ${block.type === "meeting" ? "bg-green-300 text-white" : ""}
                      ${block.completed ? "line-through opacity-70" : ""}`}
                    style={{ top: displayTop, height, zIndex:20, width:`${blockWidth}%`, left:`${leftOffset}%`, cursor: "grab" }}
                    onMouseDown={handleMouseDown}
                  >
                    <span className="font-semibold mr-2 text-xs">{block.start} - {block.end}</span>
                    <span className="flex-1 truncate">{block.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); setBlockTitle(block.title); setBlockStart(block.start); setBlockEnd(block.end); setBlockType(block.type); setShowForm(true); setEditId(block.id); }} className="ml-2 text-white hover:text-yellow-100">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>

                    </button>
                    <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="ml-2 text-white hover:text-red-100">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>

                    </button>
                  </div>
                );
              })}


                {/* Linha da hora atual */}
                {isSameDate(selectedDate, currentTime) && (
                  <>
                    <div
                      className="absolute left-0 right-0 h-[2px] bg-red-500 z-30"
                      style={{ top: currentTop }}
                    />
                    <div
                      className="absolute left-0 z-40 px-1 bg-red-500 text-white text-xs font-bold rounded"
                      style={{ top: currentTop - 8 }} // -8 para centralizar verticalmente
                    >
                      {currentTime.getHours().toString().padStart(2, "0")}:
                      {currentTime.getMinutes().toString().padStart(2, "0")}
                    </div>
                  </>
                )}


                {filteredBlocks.length === 0 && (
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-slate-400 text-center text-sm">
                    Nenhum bloco para este dia
                  </div>
                )}
              </div>
            </div>

            {/* Modal Form */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-[90vw] relative">
                  <button onClick={() => { setShowForm(false); setBlockTitle(""); setBlockStart(""); setBlockEnd(""); setBlockType("study"); setEditId(null); }} 
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-xl">×</button>
                  <h2 className="text-lg font-bold mb-4 text-blue-800">{editId ? "Editar bloco" : "Adicionar bloco"}</h2>
                  <input type="text" placeholder="Título do bloco" value={blockTitle} onChange={e => setBlockTitle(e.target.value)}
                    className="border border-slate-400 rounded px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Descrição do bloco" value={blockDesc} onChange={e => setBlockDesc(e.target.value)}
                    className="border border-slate-400 rounded px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex gap-2 mb-2">
                    <input type="time" value={blockStart} onChange={e => setBlockStart(e.target.value)}
                      className="border border-slate-400 rounded px-2 py-1 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="time" value={blockEnd} onChange={e => setBlockEnd(e.target.value)}
                      className="border border-slate-400 rounded px-2 py-1 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <select value={blockType} onChange={e => setBlockType(e.target.value)}
                      className="border border-slate-400 rounded px-2 py-1 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="study">Estudo</option>
                      <option value="train">Treino</option>
                      <option value="class">Aula</option>
                      <option value="task">Tarefa</option>
                      <option value="meeting">Reunião</option>
                    </select>
                  <div className="flex gap-2">
                    <button onClick={handleAddBlock} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition">
                      {editId ? "Guardar alterações" : "Guardar"}
                    </button>
                    <button onClick={() => { setShowForm(false); setBlockTitle(""); setBlockStart(""); setBlockEnd(""); setBlockType("study"); setEditId(null); }}
                      className="bg-slate-400 text-white px-4 py-1 rounded hover:bg-slate-500 transition">Cancelar</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;

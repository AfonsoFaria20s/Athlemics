import React, { useState, useEffect, useRef } from "react";

// Constantes da Timeline
const HOUR_HEIGHT = 32;
const HOUR_GAP = 8;
const TOTAL_HEIGHT = (HOUR_HEIGHT + HOUR_GAP) * 24;
const PADDING_TOP = 16;
const MINUTE_HEIGHT = (HOUR_HEIGHT + HOUR_GAP) / 60;
const SNAP_MINUTES = 15; // Arrastar de 15 em 15 minutos

const Timeline = ({ selectedDate, filteredBlocks, setBlocks, setShowForm, openEditModal, removeBlock, toMinutes, t }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dragging, setDragging] = useState(null); // { id, startY, originalStart, originalEnd }

  const containerRef = useRef(null);
  const initialCentered = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (initialCentered.current) return;
    const el = containerRef.current;
    if (!el) return;
    if (! (new Date().toDateString() === selectedDate.toDateString()) ) {
      initialCentered.current = true;
      return;
    }
    const raf = requestAnimationFrame(() => {
      const currentTop = (currentTime.getHours() * 60 + currentTime.getMinutes()) * MINUTE_HEIGHT + PADDING_TOP;
      const target = Math.max(0, currentTop - el.clientHeight / 2);
      el.scrollTop = target;
    });
    initialCentered.current = true;
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      const deltaY = e.clientY - dragging.startY;
      const deltaMinutes = Math.round(deltaY / MINUTE_HEIGHT / SNAP_MINUTES) * SNAP_MINUTES;

      setBlocks(prev =>
        prev.map(b => {
          if (b.id !== dragging.id) return b;
          const newStart = Math.max(0, dragging.originalStart + deltaMinutes);
          const newEnd = Math.max(newStart + 5, dragging.originalEnd + deltaMinutes); // mínimo 5 min
          return {
            ...b,
            start: `${String(Math.floor(newStart / 60)).padStart(2,'0')}:${String(newStart % 60).padStart(2,'0')}`,
            end: `${String(Math.floor(newEnd / 60)).padStart(2,'0')}:${String(newEnd % 60).padStart(2,'0')}`
          };
        })
      );
    };

    const handleMouseUp = () => {
      if (dragging) setDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, setBlocks]);

  const handleMouseDown = (e, block) => {
    e.preventDefault();
    const startY = e.clientY;
    setDragging({
      id: block.id,
      startY,
      originalStart: toMinutes(block.start),
      originalEnd: toMinutes(block.end),
    });
  };

  const isToday = new Date().toDateString() === selectedDate.toDateString();
  const currentTop = (currentTime.getHours() * 60 + currentTime.getMinutes()) * MINUTE_HEIGHT + PADDING_TOP;

  function groupOverlappingBlocks(blocks) {
    if (!blocks) return [];
    const sorted = [...blocks].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    const groups = [];

    sorted.forEach(block => {
      let placed = false;
      for (const group of groups) {
        const hasOverlap = group.some(b =>
          toMinutes(block.start) < toMinutes(b.end) && toMinutes(block.end) > toMinutes(b.start)
        );
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
      group.map((b, i) => ({ ...b, overlapIndex: i, overlapCount: group.length }))
    );
  }

  const positionedBlocks = groupOverlappingBlocks(filteredBlocks);

  return (
    <div className="bg-white rounded-2xl p-6 shadow flex-1 min-w-[350px] border border-blue-100">
      <h2 className="text-lg font-bold text-blue-800 mb-4">{t("day")} {selectedDate.toLocaleDateString("pt-PT")}</h2>
      <button 
        onClick={() => setShowForm(true)} 
        className="mb-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition w-fit">
        + {t("add_block")}
      </button>

      <div ref={containerRef} className="relative overflow-y-scroll max-h-[400px] rounded bg-slate-50 border border-slate-200" style={{ height: TOTAL_HEIGHT, paddingTop: PADDING_TOP, paddingLeft: 16 }}>
        {/* Horas */}
        <div className="absolute w-14 flex flex-col z-10 pointer-events-none">
          {Array.from({ length: 24 }).map((_, hour) => (
            <span key={hour} className="text-slate-500 font-mono text-xs flex items-center" style={{ height: `${HOUR_HEIGHT}px`, marginBottom: `${HOUR_GAP}px` }}>
              {`${String(hour).padStart(2, '0')}:00`}
            </span>
          ))}
        </div>
        
        {/* Blocos */}
        <div className="relative ml-14" style={{ height: TOTAL_HEIGHT }}>
            {positionedBlocks.map(block => {
                const start = toMinutes(block.start);
                const end = toMinutes(block.end);
                const top = start * MINUTE_HEIGHT + PADDING_TOP;
                const height = Math.max(20, (end - start) * MINUTE_HEIGHT);
                const width = 100 / block.overlapCount;
                const left = block.overlapIndex * width;
                
                return (
                    <div
                        key={block.id}
                        onMouseDown={(e) => handleMouseDown(e, block)}
                        className={`timeline-block absolute flex items-center px-3 py-2 rounded-lg shadow-md text-sm
                            ${block.type === "study" ? "bg-slate-500 text-white" : ""}
                            ${block.type === "train" ? "bg-yellow-300 text-black" : ""}
                            ${block.type === "class" ? "bg-yellow-700 text-white" : ""}
                            ${block.type === "task" ? "bg-sky-600 text-white" : ""}
                            ${block.type === "meeting" ? "bg-green-300 text-black" : ""}`
                        }
                        style={{ top, height, width: `${width}%`, left: `${left}%`, zIndex: 20, cursor: "grab" }}
                    >
                        <span className="font-semibold mr-2 text-xs">{block.start} - {block.end}</span>
                        <span className="flex-1 truncate">{block.title}</span>
                        <button onClick={() => openEditModal(block)} className="ml-auto text-white hover:text-yellow-100 p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button onClick={() => removeBlock(block.id)} className="text-white hover:text-red-100 p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                    </div>
                );
            })}

            {isToday && (
              <>
                <div className="absolute left-0 right-0 h-[2px] bg-red-500 z-30" style={{ top: currentTop }} />
                <div className="absolute left-[-10px] z-40 px-1 bg-red-500 text-white text-xs font-bold rounded" style={{ top: currentTop - 8 }}>
                    {currentTime.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </>
            )}

            {filteredBlocks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-center text-sm">{t("no_blocks")}</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;

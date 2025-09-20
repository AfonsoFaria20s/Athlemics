import React from "react";

const Calendar = ({ selectedDate, setSelectedDate, handleMonthChange, i18n, t }) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => new Date(year, month, i + 1));
  };
  const daysInMonth = getDaysInMonth(selectedDate);
  const startDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

  return (
    <div className="bg-white flex-1 min-w-[320px] max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => handleMonthChange("prev")} className="px-3 py-1 rounded hover:bg-slate-200 text-xl">‹</button>
        <h2 className="font-semibold text-lg text-blue-800">
          {selectedDate.toLocaleString(i18n.language, { month: "long", year: "numeric" })}
        </h2>
        <button onClick={() => handleMonthChange("next")} className="px-3 py-1 rounded hover:bg-slate-200 text-xl">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-slate-500 mb-2">
        {/* Adicionei as traduções dos dias da semana como exemplo */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array(startDayOfMonth).fill(null).map((_, i) => <span key={`empty-${i}`}></span>)}
        {daysInMonth.map(day => {
          const isSelected = day.toDateString() === selectedDate.toDateString();
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`rounded-full aspect-square w-8 mx-auto hover:bg-blue-200 transition
                ${isSelected ? "bg-blue-500 text-white font-bold" : ""}
                ${isToday && !isSelected ? "bg-blue-100 text-blue-600" : ""}`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
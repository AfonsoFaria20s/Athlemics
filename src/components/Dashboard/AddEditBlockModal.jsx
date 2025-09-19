import React from "react";

const AddEditBlockModal = ({
  editId,
  formData,
  setFormData,
  handleAddBlock,
  resetForm,
  t
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gera opções de tempo com intervalos de 15 minutos
  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-[90vw] relative">
        <button
          onClick={resetForm}
          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-xl"
        >
          ×
        </button>

        <h2 className="text-lg font-bold mb-4 text-blue-800">
          {editId ? t("edit_block") : t("add_block")}
        </h2>

        <input
          name="title"
          type="text"
          placeholder={t("block_title")}
          value={formData.title}
          onChange={handleChange}
          className="border border-slate-400 rounded px-2 py-1 mb-2 w-full"
        />

        <input
          name="desc"
          type="text"
          placeholder={t("block_description")}
          value={formData.desc}
          onChange={handleChange}
          className="border border-slate-400 rounded px-2 py-1 mb-2 w-full"
        />

        <div className="flex gap-2 mb-2">
          <select
            name="start"
            value={formData.start}
            onChange={handleChange}
            className="border border-slate-400 rounded px-2 py-1 w-1/2"
          >
            {timeOptions.map((time) => (
              <option key={`start-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>

          <select
            name="end"
            value={formData.end}
            onChange={handleChange}
            className="border border-slate-400 rounded px-2 py-1 w-1/2"
          >
            {timeOptions.map((time) => (
              <option key={`end-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="border border-slate-400 rounded px-2 py-1 mb-2 w-full"
        >
          <option value="study">{t("type_study")}</option>
          <option value="train">{t("type_train")}</option>
          <option value="class">{t("type_class")}</option>
          <option value="task">{t("type_task")}</option>
          <option value="meeting">{t("type_meeting")}</option>
        </select>

        <select
          name="repeat"
          value={formData.repeat || "none"}
          onChange={handleChange}
          className="border border-slate-400 rounded px-2 py-1 mb-4 w-full"
        >
          <option value="none">{t("repeat_none") || "Não repetir"}</option>
          <option value="every_day">{t("repeat_every_day") || "Todos os dias"}</option>
          <option value="weekdays">{t("repeat_weekdays") || "Todos os dias da semana"}</option>
          <option value="weekly">{t("repeat_weekly") || "Toda a semana"}</option>
          <option value="monthly">{t("repeat_monthly") || "Todo o mês"}</option>
          <option value="yearly">{t("repeat_yearly") || "Todo o ano"}</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={handleAddBlock}
            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition"
          >
            {editId ? t("save_changes") : t("save")}
          </button>

          <button
            onClick={resetForm}
            className="bg-slate-400 text-white px-4 py-1 rounded hover:bg-slate-500 transition"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditBlockModal;

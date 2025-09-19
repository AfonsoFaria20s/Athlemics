import React from "react";

const AddEditBlockModal = ({ editId, formData, setFormData, handleAddBlock, resetForm, t }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-[90vw] relative">
        <button onClick={resetForm} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-xl">×</button>
        <h2 className="text-lg font-bold mb-4 text-blue-800">{editId ? t("edit_block") : t("add_block")}</h2>
        
        <input name="title" type="text" placeholder={t("block_title")} value={formData.title} onChange={handleChange} className="border border-slate-400 rounded px-2 py-1 mb-2 w-full" />
        <input name="desc" type="text" placeholder={t("block_description")} value={formData.desc} onChange={handleChange} className="border border-slate-400 rounded px-2 py-1 mb-2 w-full" />
        
        <div className="flex gap-2 mb-2">
          <input name="start" type="time" value={formData.start} onChange={handleChange} className="border border-slate-400 rounded px-2 py-1 w-1/2" />
          <input name="end" type="time" value={formData.end} onChange={handleChange} className="border border-slate-400 rounded px-2 py-1 w-1/2" />
        </div>
        
        <select name="type" value={formData.type} onChange={handleChange} className="border border-slate-400 rounded px-2 py-1 mb-4 w-full">
          <option value="study">{t("type_study")}</option>
          <option value="train">{t("type_train")}</option>
          <option value="class">{t("type_class")}</option>
          <option value="task">{t("type_task")}</option>
          <option value="meeting">{t("type_meeting")}</option>
        </select>
        
        <div className="flex gap-2">
          <button onClick={handleAddBlock} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition">
            {editId ? t("save_changes") : t("save")}
          </button>
          <button onClick={resetForm} className="bg-slate-400 text-white px-4 py-1 rounded hover:bg-slate-500 transition">
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditBlockModal;
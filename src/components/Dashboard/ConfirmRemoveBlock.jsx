import React from 'react';

const ConfirmRemoveBlock = ({ onCancel, onRemoveOne, onRemoveAll, onRemoveFrom, t }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl p-6 min-w-[600px] relative">
        <h2 className="text-lg font-bold text-red-600 mb-4">{t("confirm_deletion") || "Tens a certeza?"}</h2>
        <p className="text-sm text-gray-700 mb-6">
          {t("choose_delete_option") || "Queres apagar apenas este bloco ou todos os blocos repetidos?"}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRemoveOne}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            {t("delete_one")}
          </button>
          <button
            onClick={onRemoveAll}
            className="flex-1 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition"
          >
            {t("delete_all_repeated")}
          </button>
          <button
            onClick={onRemoveFrom}
            className="flex-1 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition"
          >
          
            {t("delete_all_repeated_from")}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg transition"
          >
            {t("cancel") || "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRemoveBlock;

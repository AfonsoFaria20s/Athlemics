import React from "react";

const InfoCards = ({ nextBlocks, taskBlocks, goals, setGoals, t }) => {
  return (
    <>
      <div className="h-full">
        <div className="bg-white rounded-2xl shadow-md p-4 h-full flex gap-3 items-stretch">
          {/* Próximos Blocos */}
          <div className="flex-1 bg-gray-50 rounded-lg p-3 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">{t("next_blocks")}</div>
              <div className="text-xs text-gray-400">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="mt-3 flex-1 overflow-auto">
              {nextBlocks && nextBlocks.length > 0 ? (
                <ul className="space-y-2">
                  {nextBlocks.map(b => (
                    <li key={b.id} className="flex items-center justify-between bg-white/60 px-3 py-2 rounded">
                      <div className="text-sm font-medium">{b.title}</div>
                      <div className="text-xs text-gray-500">{b.start}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-500">{t("no_next_blocks")}</div>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-400">{t("shows_3_next_blocks")}</div>
          </div>

          {/* Tarefas */}
          <div className="flex-1 bg-gray-50 rounded-lg p-3 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">{t("tasks")}</div>
              <div className="text-xs text-gray-400">{t("today")}</div>
            </div>
            <div className="mt-3 flex-1 overflow-auto">
              {taskBlocks && taskBlocks.length > 0 ? (
                <ul className="space-y-2">
                  {taskBlocks.map(b => (
                    <li key={b.id} className="flex items-center justify-between bg-white/60 px-3 py-2 rounded">
                      <div className="text-sm">{b.title}</div>
                      <div className="text-xs text-gray-500">{b.start}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-500">{t("no_tasks")}</div>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-400">{t("click_timeline_to_edit")}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoCards;
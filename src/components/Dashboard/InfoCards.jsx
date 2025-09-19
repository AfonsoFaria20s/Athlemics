import React from "react";

const InfoCards = ({ nextBlocks, taskBlocks, t }) => {
  return (
    <>
      {/* Next Blocks Card */}
      <div className="flex-1 min-w-[280px] bg-white p-6 rounded-2xl shadow border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-4">{t("next_blocks")}</h3>
        <ul className="space-y-2 text-gray-700 text-sm">
          {nextBlocks.length > 0 ? (
            nextBlocks.map((b) => (
              <li key={b.id} className="flex gap-2 items-center">
                <span className="font-mono text-xs text-blue-600">{b.start}</span> - {b.title}
              </li>
            ))
          ) : (
            <li className="text-slate-500">{t("no_next_blocks")}</li>
          )}
        </ul>
      </div>

      {/* Tasks Card */}
      <div className="flex-1 min-w-[280px] bg-white p-6 rounded-2xl shadow border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-4">{t("tasks")}</h3>
        <ul className="space-y-2 text-gray-700 text-sm">
          {taskBlocks.length === 0 ? (
            <li className="text-slate-500">{t("no_tasks")}</li>
          ) : (
            taskBlocks.map((b) => (
              <li key={b.id} className="flex gap-2 items-center text-black">
                <span className="font-mono text-xs text-blue-600">{b.start}</span> - {b.title}{" "}
                {b.type === "meeting" && `(${t("type_meeting")})`}
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
};

export default InfoCards;
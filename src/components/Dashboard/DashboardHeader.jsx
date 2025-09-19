import React from "react";

const DashboardHeader = ({ account, t }) => {
  return (
    <div className="mb-10">
      {account.nome ? (
        <>
          <h1 className="text-3xl font-extrabold text-blue-800">
            {t("welcome_dashboard")} {account.nome}!
          </h1>
          <p className="text-slate-600 mt-1 text-base">{t("organize_your_day")}</p>
        </>
      ) : (
        <h1 className="text-2xl font-bold text-blue-800">
          {t("welcome_dashboard")} {t("start_by_entering_data")}{" "}
          <a href="/conta" className="text-blue-600 underline hover:text-blue-800">
            {t("here")}
          </a>
        </h1>
      )}
    </div>
  );
};

export default DashboardHeader;
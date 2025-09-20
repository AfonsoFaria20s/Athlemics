import React from "react";

const formatLocalDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const Sparkline = ({ values = [], color = "#3b82f6", h = 28 }) => {
  const w = Math.max(80, values.length * 6);
  if (!values.length) {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
        <rect x="0" y="0" width={w} height={h} rx="4" fill="rgba(0,0,0,0.03)"/>
      </svg>
    );
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = w / (values.length - 1 || 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const HealthOverview = ({ blocks = [], healthRecords = {}, t }) => {
  // format decimal hours (e.g. 8.5) to "H:MM" (e.g. "8:30")
  const formatHoursToHHMM = (val) => {
    if (val == null) return null;
    // val is hours as decimal (e.g. 8.5). Convert to total minutes and format.
    const totalMinutes = Math.round(Number(val) * 60);
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return `${hh}:${String(mm).padStart(2, "0")}`;
  };

  const todayStr = formatLocalDate(new Date());
  const todayRec = healthRecords && healthRecords[todayStr] ? healthRecords[todayStr] : null;

  // Sono hoje (preferir healthRecords)
  const sleepHoursToday = todayRec && todayRec.sleepHours != null ? todayRec.sleepHours : null;

  // Bem-estar / Fadiga (hoje)
  const wellbeingToday = todayRec && todayRec.wellbeing != null ? todayRec.wellbeing : null;
  const fatigueToday = todayRec && todayRec.fatigue != null ? todayRec.fatigue : null;

  // completion rate last 7 days (a partir de blocks como no /health)
  const lastNDates = (n) => {
    const arr = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(formatLocalDate(d));
    }
    return arr;
  };
  const days7 = lastNDates(7);

  // training hours last 7 days (sum durations of training blocks per day)
  const isTrainingBlock = (b) => {
    if (!b) return false;
    const type = (b.type || "").toString().toLowerCase();
    if (type.includes("work") || type.includes("train") || type.includes("exercise")) return true;
    const title = (b.title || "").toString().toLowerCase();
    if (title.includes("train") || title.includes("workout") || title.includes("gym") || title.includes("exerc")) return true;
    return false;
  };

  const trainingHoursPerDay = days7.map(d => {
    const mins = (blocks || [])
      .filter(b => b && b.date === d && isTrainingBlock(b))
      .reduce((sum, b) => {
        if (!b.start || !b.end) return sum;
        const s = timeToMinutes(b.start || "00:00");
        const e = timeToMinutes(b.end || "00:00");
        if (Number.isNaN(s) || Number.isNaN(e)) return sum;
        let diff = e - s;
        if (diff < 0) diff += 24 * 60;
        return sum + Math.max(0, diff);
      }, 0);
    return Math.round((mins / 60) * 10) / 10; // hours, 1 decimal
  });
  const trainingHoursTotal7 = Math.round((trainingHoursPerDay.reduce((s, h) => s + h, 0)) * 10) / 10;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{t ? t("Health Overview") : "Health Overview"}</h3>
          <div className="text-xs text-gray-400">{new Date().toLocaleDateString()}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="col-span-1 bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">{t ? t("sleep_today") : "Sleep (today)"}</div>
            <div className="mt-1 text-xl font-bold text-indigo-600">
              {sleepHoursToday != null
                ? `${formatHoursToHHMM(sleepHoursToday)} ${t ? t("hours") : "h"}`
                : (t ? t("no_data") : "—")}
            </div>
            <div className="text-xs text-gray-400 mt-1">{t ? t("sleep_recorded") : "recorded"}</div>
          </div>

          <div className="col-span-1 bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">{t ? t("wellbeing_today") : "Wellbeing (today)"}</div>
            <div className="mt-1 text-xl font-bold text-amber-600">{wellbeingToday != null ? wellbeingToday : (t ? t("no_data") : "—")}</div>
            <div className="text-xs text-gray-400 mt-1">{t ? t("wellbeing_label") : "scale 1-5"}</div>
          </div>

          <div className="col-span-1 bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">{t ? t("fatigue_today") : "Fatigue (today)"}</div>
            <div className="mt-1 text-xl font-bold text-red-600">{fatigueToday != null ? fatigueToday : (t ? t("no_data") : "—")}</div>
            <div className="text-xs text-gray-400 mt-1">{t ? t("fatigue_label") : "scale 1-5"}</div>
          </div>

          <div className="col-span-1 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">{t ? t("training_total_7d") : "Training (total 7d)"}</div>
                <div className="mt-1 text-xl font-bold text-teal-600">{trainingHoursTotal7} {t ? t("hours") : "h"}</div>
              </div>
              <div className="w-24">
                <Sparkline values={trainingHoursPerDay} color="#14b8a6" h={28} />
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">{t ? t("hours_this_week") : "hours this week"}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        {t ? t("use_health_records_note") : "Use Health records for detailed metrics; adjust them in /health."}
      </div>
    </div>
  );
};

export default HealthOverview;

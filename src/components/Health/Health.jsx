import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/DashBoard.css";

import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";

const db = getFirestore(app);
const auth = getAuth();

const Health = () => {
  const { t } = useTranslation();

  // state
  const [loaded, setLoaded] = useState(false);
  const [healthRecords, setHealthRecords] = useState({}); // { "YYYY-MM-DD": { ... } }
  const [dayOffset, setDayOffset] = useState(0); // 0 = today, negative = past
  const [selectedDateStr, setSelectedDateStr] = useState("");

  const [form, setForm] = useState({
    sleepStart: "",
    sleepEnd: "",
    weight: "",
    fatigue: 3,
    wellbeing: 3,
    musclePain: false,
    sleepQuality: 3,
    trainingIntensity: 5, // New: Manual input
    diary: "",
  });

  // helpers
  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const minutesToHours = (mins) => {
    if (mins == null) return 0;
    return Math.round((mins / 60) * 10) / 10;
  };

  // load user data from Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const userDoc = doc(db, "users", user.uid);
      const snap = await getDoc(userDoc);
      if (snap.exists()) {
        const data = snap.data();
        setHealthRecords(data.healthRecords || {});
      } else {
        await setDoc(userDoc, { healthRecords: {} });
        setHealthRecords({});
      }
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  // update selected date and form state when dayOffset or records change
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    const s = formatLocalDate(d);
    setSelectedDateStr(s);

    if (healthRecords[s]) {
      const today = healthRecords[s];
      setForm({
        sleepStart: today.sleepStart || "",
        sleepEnd: today.sleepEnd || "",
        weight: today.weight || "",
        fatigue: today.fatigue || 3,
        wellbeing: today.wellbeing || 3,
        musclePain: today.musclePain || false,
        sleepQuality: today.sleepQuality || 3,
        trainingIntensity: today.trainingIntensity || 5, // New: manual input
        diary: today.diary || "",
      });
    } else {
      // reset form to defaults for new dates
      setForm({
        sleepStart: "",
        sleepEnd: "",
        weight: "",
        fatigue: 3,
        wellbeing: 3,
        musclePain: false,
        sleepQuality: 3,
        trainingIntensity: 5, // Default for new records
        diary: "",
      });
    }
  }, [dayOffset, loaded, healthRecords]);

  // save to firestore
  const saveHealthRecords = async (newRecords) => {
    const user = auth.currentUser;
    if (!user) return;
    const userDoc = doc(db, "users", user.uid);
    await setDoc(userDoc, { healthRecords: newRecords }, { merge: true });
  };

  const handleChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const computeSleepHours = (start, end) => {
    if (!start || !end) return null;
    const s = timeToMinutes(start);
    const e = timeToMinutes(end);
    let diff = e - s;
    if (diff < 0) diff += 24 * 60;
    return minutesToHours(diff);
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    const sleepHours = computeSleepHours(form.sleepStart, form.sleepEnd);

    const newRec = {
      sleepStart: form.sleepStart,
      sleepEnd: form.sleepEnd,
      sleepHours,
      weight: form.weight,
      fatigue: Number(form.fatigue),
      wellbeing: Number(form.wellbeing),
      musclePain: !!form.musclePain,
      sleepQuality: Number(form.sleepQuality),
      trainingIntensity: Number(form.trainingIntensity), // Save manual input
      diary: form.diary,
      updatedAt: new Date().toISOString(),
    };

    const newRecords = { ...healthRecords, [selectedDateStr]: newRec };
    setHealthRecords(newRecords);
    await saveHealthRecords(newRecords);
  };

  // weekly helpers
  const lastNDates = (n) => {
    const arr = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(formatLocalDate(d));
    }
    return arr;
  };

  const weeklySleepData = () => {
    const days = lastNDates(7);
    return days.map((d) => ({
      date: d,
      hours: healthRecords[d] ? healthRecords[d].sleepHours || 0 : 0,
    }));
  };

  const weeklyWellbeingAndFatigueData = () => {
    const days = lastNDates(7);
    return days.map((d) => ({
      date: d,
      wellbeing: healthRecords[d] ? healthRecords[d].wellbeing || 0 : 0,
      fatigue: healthRecords[d] ? healthRecords[d].fatigue || 0 : 0,
    }));
  };

  const SleepBarChart = ({ data }) => {
    const w = 340, h = 80, pad = 20;
    const max = Math.max(8, ...data.map((d) => d.hours));
    const bw = (w - pad * 2) / data.length;
    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width={w} height={h} rx="8" fill="rgba(59,130,246,0.04)" />
          {data.map((d, i) => {
            const barH = (d.hours / max) * (h - pad * 2);
            const x = pad + i * bw + 6;
            const y = h - pad - barH;
            return (
              <g key={d.date}>
                <rect x={x} y={y} width={bw - 12} height={barH} fill="#3b82f6" rx="4" />
                <text x={x + (bw - 12) / 2} y={h - 6} fontSize="10" fill="#374151" textAnchor="middle">{d.date.slice(5)}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const WellbeingAndFatigueChart = ({ data }) => {
    const w = 340, h = 100, pad = 24;
    const max = 5;
    const stepX = (w - pad * 2) / (data.length - 1 || 1);
    const linePath = (key) => {
      return data
        .map((d, i) => {
          const x = pad + i * stepX;
          const y = pad + (1 - d[key] / max) * (h - pad * 2);
          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ");
    };
    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width={w} height={h} rx="8" fill="rgba(34,197,94,0.04)" />
          <path d={linePath("wellbeing")} fill="none" stroke="#f97316" strokeWidth="2" />
          <path d={linePath("fatigue")} fill="none" stroke="#22c55e" strokeWidth="2" />
          {data.map((d, i) => {
            const x = pad + i * stepX;
            const yW = pad + (1 - d.wellbeing / max) * (h - pad * 2);
            const yF = pad + (1 - d.fatigue / max) * (h - pad * 2);
            return (
              <g key={d.date}>
                <circle cx={x} cy={yW} r="3" fill="#f97316" />
                <circle cx={x} cy={yF} r="3" fill="#22c55e" />
                <text x={x} y={h - 6} fontSize="10" textAnchor="middle" fill="#374151">{d.date.slice(5)}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // aggregation helpers and sparkline component
  const avgOverRange = (dates, key) => {
    if (!dates || dates.length === 0) return 0;
    const sum = dates.reduce((s, d) => {
      const rec = healthRecords[d];
      return s + (rec && rec[key] != null ? rec[key] : 0);
    }, 0);
    return Math.round((sum / dates.length) * 10) / 10;
  };

  const last12Months = () => {
    const res = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      res.push({ year: d.getFullYear(), month: d.getMonth() }); // month 0-11
    }
    return res;
  };

  const avgByMonth = (year, month, key) => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const days = Object.keys(healthRecords).filter((dd) =>
      dd.startsWith(prefix)
    );
    if (days.length === 0) return 0;
    const sum = days.reduce((s, d) => {
      const rec = healthRecords[d];
      return s + (rec && rec[key] != null ? rec[key] : 0);
    }, 0);
    return Math.round((sum / days.length) * 10) / 10;
  };

  const Sparkline = ({ values = [], color = "#3b82f6", h = 36 }) => {
    const w = Math.max(80, values.length * 4);
    if (!values || values.length === 0) {
      return (
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width={w} height={h} rx="4" fill="rgba(0,0,0,0.03)" />
        </svg>
      );
    }
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const stepX = w / (values.length - 1 || 1);
    const points = values
      .map((v, i) => {
        const x = i * stepX;
        const y = h - ((v - min) / range) * (h - 6) - 3;
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="xMidYMid meet">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // quick overview (use selectedDateStr)
  const Overview = () => {
    const today = healthRecords[selectedDateStr] || {};
    const sleepAvg = weeklySleepData().reduce((s, d) => s + d.hours, 0) / 7 || 0;
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm w-full">
        <h3 className="text-lg font-semibold mb-2">{t ? t("overview") : "Overview"}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-xs text-gray-500">{t ? t("sleep") : "Sono"} ({selectedDateStr})</div>
            <div className="text-xl font-bold">{today.sleepHours != null ? `${today.sleepHours} ${t ? t("hours") : "h"}` : "—"}</div>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <div className="text-xs text-gray-500">{t ? t("wellbeing") : "Bem-estar"}</div>
            <div className="text-xl font-bold">{today.wellbeing || "—"}</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded">
            <div className="text-xs text-gray-500">{t ? t("fatigue") : "Fadiga"}</div>
            <div className="text-xl font-bold">{today.fatigue || "—"}</div>
          </div>
          <div className="p-3 bg-indigo-50 rounded">
            <div className="text-xs text-gray-500">{t ? t("weight") : "Peso"}</div>
            <div className="text-xl font-bold">{today.weight || "—"}</div>
          </div>
          <div className="col-span-2 p-3 bg-white/75 rounded">
            <div className="text-xs text-gray-500">{t ? t("avg_sleep_7d") : "Média sono (7d)"}</div>
            <div className="text-lg font-medium">{Math.round(sleepAvg * 10) / 10} {t ? t("hours") : "h"}</div>
          </div>
        </div>
      </div>
    );
  };

  // navigation handlers
  const handlePrevDay = () => setDayOffset((prev) => Math.max(prev - 1, -30));
  const handleNextDay = () => setDayOffset((prev) => Math.min(prev + 1, 0));
  const handleJumpToday = () => setDayOffset(0);

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">{t("health_title")}</h1>
          <p className="text-sm text-gray-500">{t("health_desc")}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              {/* navigation for day selection */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t("daily_record")}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrevDay} className="px-3 py-1 rounded border text-sm">◀</button>
                  <div className="text-sm px-3">{selectedDateStr}</div>
                  <button onClick={handleNextDay} disabled={dayOffset === 0} className="px-3 py-1 rounded border text-sm disabled:opacity-40">▶</button>
                  <button onClick={handleJumpToday} className="ml-2 px-3 py-1 rounded bg-blue-50 text-sm">{t("today")}</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">{t("sleep_time_label")}</label>
                    <input type="time" value={form.sleepStart} onChange={e => handleChange("sleepStart", e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">{t("wake_time_label")}</label>
                    <input type="time" value={form.sleepEnd} onChange={e => handleChange("sleepEnd", e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">{t("weight_label")}</label>
                    <input type="number" step="0.1" value={form.weight} onChange={e => handleChange("weight", e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">{t("fatigue_label")}</label>
                    <input type="range" min="1" max="5" value={form.fatigue} onChange={e => handleChange("fatigue", e.target.value)} />
                    <div className="text-xs text-gray-500">{t("fatigue_label")}: {form.fatigue}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">{t("wellbeing_label")}</label>
                    <input type="range" min="1" max="5" value={form.wellbeing} onChange={e => handleChange("wellbeing", e.target.value)} />
                    <div className="text-xs text-gray-500">{t("wellbeing_label")}: {form.wellbeing}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">{t("muscle_pain_label")}</label>
                    <div className="mt-1">
                      <label className="inline-flex items-center">
                        <input type="checkbox" checked={form.musclePain} onChange={e => handleChange("musclePain", e.target.checked)} className="mr-2" />
                        <span className="text-sm">{t("yes")}</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">{t("sleep_quality_label")}</label>
                    <input type="range" min="1" max="5" value={form.sleepQuality} onChange={e => handleChange("sleepQuality", e.target.value)} />
                    <div className="text-xs text-gray-500">{t("sleep_quality_label")}: {form.sleepQuality}</div>
                  </div>
                </div>

                {/* New: Training Intensity Input */}
                <div>
                  <label className="text-sm text-gray-600">{t("training_intensity_label")}</label>
                  <input type="range" min="1" max="10" value={form.trainingIntensity} onChange={e => handleChange("trainingIntensity", e.target.value)} />
                  <div className="text-xs text-gray-500">{t("training_intensity_label")}: {form.trainingIntensity}</div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">{t("diary_label")}</label>
                  <textarea value={form.diary} onChange={e => handleChange("diary", e.target.value)} rows="4" className="mt-1 w-full rounded border px-3 py-2" placeholder={t("tip_diary")} />
                </div>

                <div className="flex items-center gap-3">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{t("save_record")}</button>
                  <button type="button" onClick={() => { setForm({ sleepStart: "", sleepEnd: "", weight: "", fatigue: 3, wellbeing: 3, musclePain: false, sleepQuality: 3, trainingIntensity: 5, diary: "" }); }} className="px-4 py-2 rounded border">{t("clear")}</button>
                </div>
              </form>
            </div>

            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">{t("weekly_history")}</h3>
              <div className="flex gap-6 flex-col lg:flex-row">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500 mb-2">{t("sleep_hours_7d")}</div>
                  <div className="overflow-hidden">
                    <SleepBarChart data={weeklySleepData()} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500 mb-2">{t("wellbeing_vs_fatigue")}</div>
                  <div className="overflow-hidden">
                    <WellbeingAndFatigueChart data={weeklyWellbeingAndFatigueData()} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">{t("monthly_history")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const days30 = lastNDates(30);
                  const sleepAvg = avgOverRange(days30, "sleepHours");
                  const wellbeingAvg = avgOverRange(days30, "wellbeing");
                  const trainingAvg = avgOverRange(days30, "trainingIntensity");
                  const sleepValues = days30.map(d => (healthRecords[d] ? healthRecords[d].sleepHours || 0 : 0));
                  const wellbeingValues = days30.map(d => healthRecords[d] ? healthRecords[d].wellbeing || 0 : 0);
                  const trainingValues = days30.map(d => healthRecords[d] ? healthRecords[d].trainingIntensity || 0 : 0);
                  return (
                    <>
                      <div className="p-3 bg-blue-50 rounded">
                        <div className="text-xs text-gray-500">{t("sleep_30d")}</div>
                        <div className="text-xl font-bold">{sleepAvg} {t("hours")}</div>
                        <div className="mt-2"><Sparkline values={sleepValues} color="#3b82f6" h={36} /></div>
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        <div className="text-xs text-gray-500">{t("wellbeing_30d")}</div>
                        <div className="text-xl font-bold">{wellbeingAvg}</div>
                        <div className="mt-2"><Sparkline values={wellbeingValues} color="#f97316" h={36} /></div>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded">
                        <div className="text-xs text-gray-500">{t("training_30d")}</div>
                        <div className="text-xl font-bold">{trainingAvg}</div>
                        <div className="mt-2"><Sparkline values={trainingValues} color="#10b981" h={36} /></div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">{t("annual_history")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const days365 = lastNDates(365);
                  const sleepAvgY = avgOverRange(days365, "sleepHours");
                  const wellbeingAvgY = avgOverRange(days365, "wellbeing");
                  const trainingAvgY = avgOverRange(days365, "trainingIntensity");
                  const months = last12Months();
                  const sleepPerMonth = months.map(m => avgByMonth(m.year, m.month, "sleepHours"));
                  const wellbeingPerMonth = months.map(m => avgByMonth(m.year, m.month, "wellbeing"));
                  const trainingPerMonth = months.map(m => avgByMonth(m.year, m.month, "trainingIntensity"));
                  return (
                    <>
                      <div className="p-3 bg-blue-50 rounded">
                        <div className="text-xs text-gray-500">{t("sleep_annual")}</div>
                        <div className="text-xl font-bold">{sleepAvgY} {t("hours")}</div>
                        <div className="mt-2"><Sparkline values={sleepPerMonth} color="#3b82f6" h={36} /></div>
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        <div className="text-xs text-gray-500">{t("wellbeing_annual")}</div>
                        <div className="text-xl font-bold">{wellbeingAvgY}</div>
                        <div className="mt-2"><Sparkline values={wellbeingPerMonth} color="#f97316" h={36} /></div>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded">
                        <div className="text-xs text-gray-500">{t("training_annual")}</div>
                        <div className="text-xl font-bold">{trainingAvgY}</div>
                        <div className="mt-2"><Sparkline values={trainingPerMonth} color="#10b981" h={36} /></div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          <div>
            <Overview />
            <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
              <h4 className="text-sm font-medium mb-2">{t("how_to_use")}</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>- {t("tip_daily_records")}</li>
                <li>- {t("tip_diary")}</li>
                <li>- {t("tip_training_manual")}</li>
                <li>- {t("record_navigation")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;
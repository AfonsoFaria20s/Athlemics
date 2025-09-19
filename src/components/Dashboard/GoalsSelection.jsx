import React, { useState } from "react";

const GoalsSection = ({ goals, setGoals, t }) => {
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [editingGoalId, setEditingGoalId] = useState(null);

  const handleAddOrUpdateGoal = () => {
    if (!goalTitle) return;

    if (editingGoalId) {
      // Update existing goal
      setGoals(goals.map(g => g.id === editingGoalId ? {...g, title: goalTitle, description: goalDescription} : g));
    } else {
      // Add new goal
      const newGoal = {
        id: Date.now(),
        title: goalTitle,
        description: goalDescription,
        createdAt: new Date(),
        completedAt: null,
      };
      setGoals(prev => [...prev, newGoal]);
    }
    resetForm();
  };
  
  const resetForm = () => {
    setGoalTitle("");
    setGoalDescription("");
    setEditingGoalId(null);
    setShowAddGoalModal(false);
  };

  const openEditModal = (goal) => {
    setGoalTitle(goal.title);
    setGoalDescription(goal.description);
    setEditingGoalId(goal.id);
    setShowAddGoalModal(true);
  };

  const toggleGoalCompleted = (id) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === id ? { ...goal, completedAt: goal.completedAt ? null : new Date() } : goal
      )
    );
  };

  const uncompletedGoals = goals.filter(goal => !goal.completedAt);
  const completedGoals = goals.filter(goal => goal.completedAt);

  return (
    <>
      {/* Goals Card */}
      <div className="flex-1 min-w-[280px] bg-white p-6 rounded-2xl shadow border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-4">{t("goals")}</h3>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setShowAddGoalModal(true)} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm">
            + {t("add_goal")}
          </button>
          <button onClick={() => setShowGoalsModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
            {t("completed_goals")}
          </button>
        </div>
        <ul className="space-y-2 text-gray-700 text-sm">
          {uncompletedGoals.length === 0 ? (
            <li className="text-slate-500">{t("no_goals")}</li>
          ) : (
            uncompletedGoals.map(goal => (
              <li key={goal.id} className="flex justify-between items-center">
                <span className="cursor-pointer" onClick={() => openEditModal(goal)}>
                  {goal.title}
                </span>
                <button onClick={() => toggleGoalCompleted(goal.id)} className="ml-2 text-dark px-2 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Add/Edit Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] max-w-full">
            <h2 className="text-lg font-bold mb-4 text-blue-800">{editingGoalId ? t("edit_goal") : t("add_goal")}</h2>
            <input type="text" placeholder={t("goal_title")} value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} className="border border-slate-400 rounded px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder={t("goal_description")} value={goalDescription} onChange={(e) => setGoalDescription(e.target.value)} className="border border-slate-400 rounded px-2 py-1 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex gap-2">
              <button onClick={handleAddOrUpdateGoal} className="bg-purple-500 text-white px-4 py-1 rounded hover:bg-purple-600">{editingGoalId ? t("save_changes") : t("create_goal")}</button>
              <button onClick={resetForm} className="bg-gray-300 text-black px-4 py-1 rounded hover:bg-gray-400">{t("cancel")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] max-w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{t("completed_goals")}</h3>
            {completedGoals.length === 0 ? (
              <p className="text-slate-500">{t("no_completed_goals")}</p>
            ) : (
              completedGoals.map(goal => (
                <div key={goal.id} className="mb-4 p-3 border rounded">
                  <h4 className="font-semibold">{goal.title}</h4>
                  <p className="text-sm text-slate-600">{goal.description}</p>
                  <p className="text-xs text-slate-400">{t("completed")}: {new Date(goal.completedAt).toLocaleString()}</p>
                </div>
              ))
            )}
            <button onClick={() => setShowGoalsModal(false)} className="mt-4 bg-gray-300 px-4 py-1 rounded hover:bg-gray-400">{t("close")}</button>
          </div>
        </div>
      )}
    </>
  );
};

export default GoalsSection;
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/DashBoard.css";

import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase"; // ajusta o caminho
const db = getFirestore(app);
const auth = getAuth();


import DashboardHeader from "./DashboardHeader";
import InfoCards from "./InfoCards";
import GoalsSection from "./GoalsSelection";
import Calendar from "./Calendar";
import Timeline from "./Timeline";
import AddEditBlockModal from "./AddEditBlockModal";
import ConfirmRemoveBlock from "./ConfirmRemoveBlock";

const DashBoard = () => {
  const { t, i18n } = useTranslation();

  // State Management
  const [blocks, setBlocks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [account, setAccount] = useState({ nome: "", email: "", curso: "", modalidade: "" });
  const [blockToDelete, setBlockToDelete] = useState(null);

  // Modal and Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    start: "",
    end: "",
    type: "study",
    repeat: "none",
  });


  // Load data from localStorage on initial render
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userDoc = doc(db, "users", user.uid);
      const snap = await getDoc(userDoc);

      if (snap.exists()) {
        const data = snap.data();
        setBlocks(data.blocks || []);
        setGoals(data.goals || []);
        setAccount(data.profile || { nome: "", email: "", curso: "", modalidade: "" });
      } else {
        await setDoc(userDoc, { blocks: [], goals: [], profile: {} });
        setBlocks([]);
        setGoals([]);
        setAccount({ nome: "", email: "", curso: "", modalidade: "" });
      }

      setLoaded(true);
    });

    return () => unsubscribe();
  }, []);


  // Persist data to localStorage when it changes
  const saveToFirestore = async (field, value) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = doc(db, "users", user.uid);
    await setDoc(userDoc, { [field]: value }, { merge: true });
  };

  useEffect(() => {
    if (!loaded) return;
    saveToFirestore("blocks", blocks);
  }, [blocks, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveToFirestore("goals", goals);
  }, [goals, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveToFirestore("profile", account);
  }, [account, loaded]);

  // Helper Functions
  const toMinutes = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const isSameDate = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // meses vão de 0-11
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dateStringToFilter = formatLocalDate(selectedDate);
  const filteredBlocks = blocks
    .filter(b => b.date === dateStringToFilter)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  // Próximos blocos apenas do dia atual (até 3)
  const todayStr = formatLocalDate(new Date());
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const nextBlocks = blocks
    .filter(b => b.date === todayStr && toMinutes(b.start) >= nowMinutes)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
    .slice(0, 3);

  const taskBlocks = blocks
    .filter(b => {
      if (!isSameDate(new Date(b.date), new Date())) return false; // Only for today
      if (!(b.type === "task" || b.type === "meeting")) return false;
      const blockMinutes = toMinutes(b.start);
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      return blockMinutes >= nowMinutes;
    })
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  // Event Handlers
  const handleMonthChange = (dir) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(dir === "prev" ? newDate.getMonth() - 1 : newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const resetForm = () => {
    setFormData({ title: "", desc: "", start: "", end: "", type: "study" });
    setEditId(null);
    setShowForm(false);
  };

  const handleAddBlock = () => {
    if (!formData.title || !formData.start || !formData.end) return;

    const baseDate = new Date(selectedDate);
    const repeat = formData.repeat || "none";
    const repeatId = repeat !== "none" ? Date.now() + "-" + Math.random() : null;
    const newBlocks = [];

    const addBlockForDate = (date) => {
      newBlocks.push({
        id: Date.now() + Math.random(), // garantir IDs únicos
        ...formData,
        date: formatLocalDate(date),
        completed: false,
        repeatId: repeatId,
      });
    };

    if (editId) {
      // Atualizar apenas o bloco editado
      setBlocks(prev =>
        prev.map(b =>
          b.id === editId
            ? { ...b, ...formData, date: formatLocalDate(baseDate) }
            : b
        )
      );
      resetForm();
      return;
    }

    // Criar blocos com base na repetição
    if (repeat === "none") {
      addBlockForDate(baseDate);
    } else if (repeat === "every_day") {
      for (let i = 0; i < 30; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        addBlockForDate(date);
      }
    } else if (repeat === "weekdays") {
      for (let i = 0; i < 30; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        const day = date.getDay();
        if (day >= 1 && day <= 5) addBlockForDate(date);
      }
    } else if (repeat === "weekly") {
      for (let i = 0; i < 8; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i * 7);
        addBlockForDate(date);
      }
    } else if (repeat === "monthly") {
      for (let i = 0; i < 6; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);
        addBlockForDate(date);
      }
    } else if (repeat === "yearly") {
      for (let i = 0; i < 3; i++) {
        const date = new Date(baseDate);
        date.setFullYear(date.getFullYear() + i);
        addBlockForDate(date);
      }
    }

    setBlocks(prev => [...prev, ...newBlocks]);
    resetForm();
  };

  const handleCancelDelete = () => setBlockToDelete(null);

  const handleConfirmRemoveOne = () => {
    setBlocks(prev => prev.filter(b => b.id !== blockToDelete.id));
    setBlockToDelete(null);
  };

  const handleConfirmRemoveAll = () => {
    setBlocks(prev => prev.filter(b => b.repeatId !== blockToDelete.repeatId));
    setBlockToDelete(null);
  };

  // Remove todas as ocorrências a partir (e incluindo) o bloco selecionado
  const handleConfirmRemoveFrom = () => {
    if (!blockToDelete) return;
    const baseDate = new Date(blockToDelete.date);
    setBlocks(prev =>
      prev.filter(b => {
        const bDate = new Date(b.date);
        if (blockToDelete.repeatId) {
          // para blocos repetidos: remove todos com o mesmo repeatId e data >= baseDate
          return !(b.repeatId === blockToDelete.repeatId && bDate >= baseDate);
        }
        // fallback: para blocos não repetidos, remove blocos com mesmo título e data >= baseDate
        return !(b.title === blockToDelete.title && bDate >= baseDate);
      })
    );
    setBlockToDelete(null);
  };

  const removeBlock = (id) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    setBlockToDelete(block); // abre modal
  };
  
  const openEditModal = (block) => {
    setEditId(block.id);
    setFormData({
      title: block.title,
      desc: block.desc,
      start: block.start,
      end: block.end,
      type: block.type,
      repeat: block.repeat || "none",
    });

    setShowForm(true);
  };
  
  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-16">
        <DashboardHeader account={account} t={t} />

        <div className="flex flex-wrap gap-6 mb-12">
          <InfoCards nextBlocks={nextBlocks} taskBlocks={taskBlocks} t={t} />
          <GoalsSection goals={goals} setGoals={setGoals} t={t} />
        </div>

        <div className="flex flex-wrap gap-6">
          <Calendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            handleMonthChange={handleMonthChange}
            i18n={i18n}
            t={t}
          />
          <Timeline
            selectedDate={selectedDate}
            filteredBlocks={filteredBlocks}
            setBlocks={setBlocks}
            setShowForm={setShowForm}
            openEditModal={openEditModal}
            removeBlock={removeBlock}
            toMinutes={toMinutes}
            t={t}
          />
        </div>

        {showForm && (
          <AddEditBlockModal
            showForm={showForm}
            editId={editId}
            formData={formData}
            setFormData={setFormData}
            handleAddBlock={handleAddBlock}
            resetForm={resetForm}
            t={t}
          />
          
        )}
        {blockToDelete && (
          <ConfirmRemoveBlock
            onCancel={handleCancelDelete}
            onRemoveOne={handleConfirmRemoveOne}
            onRemoveAll={handleConfirmRemoveAll}
            onRemoveFrom={handleConfirmRemoveFrom}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

export default DashBoard;
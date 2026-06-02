import { useState, useEffect } from "react";

// ── CONSTANTS ───────────────────────────────────────────────
const DEFAULT_HABITS = [
  { id: "morning", label: "Morning Routine", icon: "🌅" },
  { id: "read", label: "Read a Book", icon: "📖" },
  { id: "creative", label: "Creative 15min", icon: "🎨" },
];

const DEFAULT_SCHEDULE = [
  { day: "Mon", label: "Legs", exercises: ["Goblet squats / Summo Squats", "Leg press", "Leg curl", "Hip Thrust", "Abductor / Adductor Workout (Hinge)"] },
  { day: "Tue", label: "Cardio Day", exercises: ["30 min of Interval treadmill incline walking"] },
  { day: "Wed", label: "Back & Core", exercises: ["Standing marches with Kettle ball", "Dead bugs with kettle ball", "Leg ups / flutter kicks", "Low rows (machine or dumbbells)", "Lat pull down"] },
  { day: "Thu", label: "Cardio", exercises: ["30 min of Interval treadmill incline walking"] },
  { day: "Fri", label: "Arms Upper", exercises: ["Tricep Kickbacks", "Incline bench press", "Dumbbell raises front and side", "Shoulder Press", "Hammer Curl"] },
  { day: "Sat", label: "Trainer Day / Full Body", exercises: ["Squats", "Standing Marches", "Rows", "Shoulder press"] },
  { day: "Sun", label: "Rest", exercises: [] },
];

const PROTEIN_FOODS = [
  { label: "Chicken breast 6oz", g: 54 },
  { label: "Ground beef 6oz", g: 42 },
  { label: "Greek yogurt 1 cup", g: 20 },
  { label: "Cottage cheese 1 cup", g: 25 },
  { label: "Eggs x3", g: 18 },
  { label: "Tuna 1 can", g: 27 },
  { label: "Shrimp 6oz", g: 36 },
  { label: "Protein shake", g: 25 },
];

const DEFAULT_BEAUTY = [
  { id: "hair-wash", label: "Hair Wash", icon: "🚿", category: "Hair", freqDays: 7 },
  { id: "deep-cond", label: "Deep Condition", icon: "💆", category: "Hair", freqDays: 14 },
  { id: "nails", label: "Nails", icon: "💅", category: "Nails", freqDays: 14 },
  { id: "facial", label: "Facial", icon: "✨", category: "Skin", freqDays: 30 },
  { id: "body-care", label: "Body Care", icon: "🧴", category: "Body", freqDays: 3 },
  { id: "supplements", label: "Supplements", icon: "💊", category: "Wellness", freqDays: 1 },
];

const PROGRAM_CATEGORIES = ["Fitness", "Nutrition", "Wellness", "Beauty", "Mental", "Other"];

const PROTEIN_GOAL = 80;
const WATER_GOAL = 80;
const WEIGHT_GOAL = 200;
const BF_GOAL = 35;
const MILES_GOAL = 30;
const CHALLENGE_DAYS = 30;

const todayKey = () => new Date().toISOString().split("T")[0];
const todayDayIdx = () => new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

// ── HOOKS ───────────────────────────────────────────────────
function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? init; }
    catch { return init; }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(val)), [key, val]);
  return [val, setVal];
}

// ── SHARED COMPONENTS ───────────────────────────────────────
function CardLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#b5a898", marginBottom: 14 }}>{children}</div>;
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 6, background: "#f0ede9", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 99, background: color, transition: "width 0.4s ease" }} />
    </div>
  );
}

function NavBar({ page, setPage }) {
  const tabs = [
    { id: "today", label: "Today", icon: "🏠" },
    { id: "fitness", label: "Fitness", icon: "💪" },
    { id: "meals", label: "Meals", icon: "🍽️" },
    { id: "beauty", label: "Beauty", icon: "✨" },
    { id: "programs", label: "Programs", icon: "🗂️" },
    { id: "progress", label: "Progress", icon: "📈" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "#fff", borderTop: "1px solid #f0ede9",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
      boxShadow: "0 -2px 16px rgba(0,0,0,0.06)",
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setPage(t.id)}
          style={{
            border: "none", background: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "4px 12px", borderRadius: 10,
            color: page === t.id ? "#1a1a1a" : "#bbb",
            transition: "color 0.15s",
          }}>
          <div style={{ fontSize: 20 }}>{t.icon}</div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em" }}>{t.label}</div>
          {page === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1a1a1a", marginTop: 1 }} />}
        </button>
      ))}
    </div>
  );
}

// ── GLOBAL CSS ───────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html { -webkit-text-size-adjust: 100%; }
  body { background: #f7f5f2; overscroll-behavior: none; }
  .card { background: #fff; border-radius: 18px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04); }
  .btn-sm { border: none; cursor: pointer; border-radius: 8px; padding: 8px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.15s; min-height: 36px; }
  .btn-sm:active { opacity: 0.7; }
  .hbtn { border: none; cursor: pointer; }
  .hbtn:active { opacity: 0.8; }
  .food-chip { border: 1.5px solid #e8e4df; background: #fafaf9; border-radius: 20px; padding: 8px 14px; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; color: #444; min-height: 38px; }
  .food-chip:active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
  .wrow { display: flex; align-items: flex-start; gap: 12px; padding: 11px 13px; border-radius: 12px; border: 1.5px solid transparent; transition: background 0.14s; }
  .ninput { border: 1.5px solid #e8e4df; border-radius: 10px; padding: 10px 12px; font-family: 'DM Sans', sans-serif; font-size: 16px; outline: none; width: 100%; background: #fff; }
  .ninput:focus { border-color: #b5a898; }
  .edit-input { border: 1.5px solid #e8e4df; border-radius: 10px; padding: 10px; font-family: 'DM Sans', sans-serif; font-size: 16px; outline: none; background: #fff; width: 100%; }
  .edit-input:focus { border-color: #b5a898; }
  .ex-tag { display: flex; align-items: center; justify-content: space-between; background: #f7f5f2; border-radius: 8px; padding: 8px 10px; font-size: 13px; color: #555; gap: 8px; }
  .rm { background: none; border: none; cursor: pointer; color: #bbb; font-size: 20px; padding: 4px; line-height: 1; min-width: 32px; min-height: 32px; display: flex; align-items: center; justify-content: center; }
  .dash-grid { display: flex; flex-direction: column; gap: 14px; }
  .beauty-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .prog-card { padding: 16px; background: #fff; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  select.ninput { appearance: none; }
  @media (min-width: 700px) {
    .dash-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .card { padding: 24px; }
    .span-2 { grid-column: span 2; }
    .span-3 { grid-column: span 3; }
    .span-1 { grid-column: span 1; }
  }
`;

const pageStyle = {
  fontFamily: "'DM Sans', sans-serif",
  background: "#f7f5f2",
  minHeight: "100vh",
  padding: "24px 16px 100px",
  maxWidth: 980,
  margin: "0 auto",
};

// ── PAGE: TODAY ──────────────────────────────────────────────
function TodayPage({ habits, setHabits, habitList, setHabitList, protein, setProtein, waterLog, setWaterLog, milesLog, setMilesLog, challengeStart }) {
  const [proteinInput, setProteinInput] = useState("");
  const [milesInput, setMilesInput] = useState("");
  const [time, setTime] = useState(new Date());
  const [editingHabits, setEditingHabits] = useState(false);
  const [newHabit, setNewHabit] = useState({ label: "", icon: "⭐" });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const todayHabits = habits[todayKey()] || {};
  const toggleHabit = (id) => setHabits(prev => ({ ...prev, [todayKey()]: { ...todayHabits, [id]: !todayHabits[id] } }));
  const getStreak = (id) => {
    let n = 0, d = new Date();
    while (true) {
      const k = d.toISOString().split("T")[0];
      if (habits[k]?.[id]) { n++; d.setDate(d.getDate() - 1); } else break;
    }
    return n;
  };
  const completedToday = habitList.filter(h => todayHabits[h.id]).length;
  const addHabit = () => {
    if (!newHabit.label.trim()) return;
    const id = `habit-${Date.now()}`;
    setHabitList(prev => [...prev, { ...newHabit, id }]);
    setNewHabit({ label: "", icon: "⭐" });
  };
  const removeHabit = (id) => setHabitList(prev => prev.filter(h => h.id !== id));
  const updateHabit = (id, field, val) => setHabitList(prev => prev.map(h => h.id === id ? { ...h, [field]: val } : h));

  const todayProtein = protein[todayKey()] || 0;
  const addProtein = (g) => setProtein(prev => ({ ...prev, [todayKey()]: (prev[todayKey()] || 0) + g }));
  const resetProtein = () => setProtein(prev => ({ ...prev, [todayKey()]: 0 }));
  const proteinPct = Math.min(100, Math.round((todayProtein / PROTEIN_GOAL) * 100));

  const todayWater = waterLog[todayKey()] || 0;
  const addWater = (oz) => setWaterLog(prev => ({ ...prev, [todayKey()]: (prev[todayKey()] || 0) + oz }));
  const resetWater = () => setWaterLog(prev => ({ ...prev, [todayKey()]: 0 }));
  const waterPct = Math.min(100, Math.round((todayWater / WATER_GOAL) * 100));

  const todayMiles = milesLog[todayKey()] || 0;
  const addMiles = (m) => setMilesLog(prev => ({ ...prev, [todayKey()]: Math.round(((prev[todayKey()] || 0) + m) * 100) / 100 }));
  const resetMiles = () => setMilesLog(prev => ({ ...prev, [todayKey()]: 0 }));

  // Challenge progress
  const totalMiles = Object.values(milesLog).reduce((a, v) => a + v, 0);
  const milesPct = Math.min(100, Math.round((totalMiles / MILES_GOAL) * 100));
  const daysElapsed = challengeStart ? Math.min(CHALLENGE_DAYS, daysBetween(challengeStart, todayKey()) + 1) : 0;
  const daysLeft = challengeStart ? Math.max(0, CHALLENGE_DAYS - daysElapsed) : CHALLENGE_DAYS;

  const formatTime = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const formatDate = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={pageStyle}>
      <style>{globalCSS}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1a1a1a", lineHeight: 1.1 }}>Good {greetingTime()}, Ostyn</div>
          <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>{formatDate(time)}</div>
        </div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#888" }}>{formatTime(time)}</div>
      </div>

      <div className="dash-grid">

        {/* HABITS */}
        <div className="card span-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <CardLabel>Daily Habits</CardLabel>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#888", background: "#f0ede9", borderRadius: 20, padding: "4px 12px" }}>
                {completedToday}/{habitList.length} today
              </div>
              <button className="btn-sm" onClick={() => setEditingHabits(e => !e)}
                style={{ background: editingHabits ? "#1a1a1a" : "#f0ede9", color: editingHabits ? "#fff" : "#555", fontSize: 12, padding: "4px 12px" }}>
                {editingHabits ? "Done" : "Edit"}
              </button>
            </div>
          </div>

          {editingHabits ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {habitList.map(h => (
                <div key={h.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input className="edit-input" value={h.icon} onChange={e => updateHabit(h.id, "icon", e.target.value)} style={{ width: 56, textAlign: "center" }} />
                  <input className="edit-input" value={h.label} onChange={e => updateHabit(h.id, "label", e.target.value)} style={{ flex: 1 }} />
                  <button className="rm" onClick={() => removeHabit(h.id)}>×</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input className="edit-input" placeholder="✨" value={newHabit.icon} onChange={e => setNewHabit(p => ({ ...p, icon: e.target.value }))} style={{ width: 56, textAlign: "center" }} />
                <input className="edit-input" placeholder="New habit..." value={newHabit.label} onChange={e => setNewHabit(p => ({ ...p, label: e.target.value }))} onKeyDown={e => e.key === "Enter" && addHabit()} style={{ flex: 1 }} />
                <button className="btn-sm" onClick={addHabit} style={{ background: "#1a1a1a", color: "#fff", padding: "8px 14px" }}>+ Add</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {habitList.map(h => {
                const done = !!todayHabits[h.id];
                const streak = getStreak(h.id);
                return (
                  <button key={h.id} className="hbtn" onClick={() => toggleHabit(h.id)}
                    style={{ borderRadius: 14, padding: "16px 13px", textAlign: "left", display: "flex", flexDirection: "column", width: "100%", minHeight: 110, background: done ? "#1a1a1a" : "#f7f5f2", color: done ? "#fff" : "#1a1a1a" }}>
                    <div style={{ fontSize: 26, marginBottom: 7 }}>{h.icon}</div>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 3 }}>{h.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.55 }}>{streak > 0 ? `🔥 ${streak} day streak` : "Start today"}</div>
                    <div style={{ marginTop: 8, width: 20, height: 20, borderRadius: "50%", border: `2px solid ${done ? "rgba(255,255,255,0.3)" : "#d4cdc7"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, marginLeft: "auto", color: done ? "#fff" : "transparent" }}>✓</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 30 IN 30 CHALLENGE SUMMARY */}
        <div className="card span-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <CardLabel>30 Miles in 30 Days</CardLabel>
            <div style={{ fontSize: 12, color: "#aaa" }}>{daysLeft} days left</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
            {/* Ring */}
            <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
              <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="45" cy="45" r="36" fill="none" stroke="#f0ede9" strokeWidth="9" />
                <circle cx="45" cy="45" r="36" fill="none" stroke="#4caf82" strokeWidth="9"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - milesPct / 100)}`}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, lineHeight: 1 }}>{totalMiles.toFixed(1)}</div>
                <div style={{ fontSize: 10, color: "#aaa" }}>mi</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>Today: <strong style={{ color: "#1a1a1a" }}>{todayMiles} mi</strong></div>
              <ProgressBar pct={milesPct} color="#4caf82" />
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                {milesPct >= 100 ? "🎉 Challenge complete!" : `${(MILES_GOAL - totalMiles).toFixed(1)} miles to go`}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {[0.5, 1, 2, 3].map(m => (
                  <button key={m} className="btn-sm" onClick={() => addMiles(m)}
                    style={{ background: "#edf7f1", color: "#2d7a56", fontSize: 12, padding: "6px 12px" }}>+{m} mi</button>
                ))}
                <div style={{ display: "flex", gap: 6, flex: 1 }}>
                  <input className="ninput" type="number" placeholder="Custom..." value={milesInput}
                    onChange={e => setMilesInput(e.target.value)} style={{ flex: 1 }} />
                  <button className="btn-sm" onClick={() => { if (milesInput) { addMiles(parseFloat(milesInput)); setMilesInput(""); } }}
                    style={{ background: "#1a1a1a", color: "#fff" }}>+ Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PROTEIN */}
        <div className="card span-2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <CardLabel>Protein · {PROTEIN_GOAL}g goal</CardLabel>
            <button className="btn-sm" onClick={resetProtein} style={{ background: "#f0ede9", color: "#888", marginBottom: 14 }}>Reset</button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#888" }}>Today</span>
              <span style={{ fontWeight: 700, color: proteinPct >= 100 ? "#4caf82" : "#1a1a1a" }}>{todayProtein}g <span style={{ color: "#bbb", fontWeight: 400 }}>/ {PROTEIN_GOAL}g</span></span>
            </div>
            <ProgressBar pct={proteinPct} color={proteinPct >= 100 ? "#4caf82" : "#1a1a1a"} />
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{proteinPct >= 100 ? "🎉 Goal hit!" : `${PROTEIN_GOAL - todayProtein}g to go`}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input className="ninput" type="number" placeholder="Add grams..." value={proteinInput} onChange={e => setProteinInput(e.target.value)} style={{ flex: 1 }} />
            <button className="btn-sm" onClick={() => { if (proteinInput) { addProtein(Number(proteinInput)); setProteinInput(""); } }} style={{ background: "#1a1a1a", color: "#fff", padding: "8px 18px" }}>+ Add</button>
          </div>
          <div style={{ fontSize: 11, color: "#b5a898", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 9 }}>Quick Add</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {PROTEIN_FOODS.map((f, i) => (
              <button key={i} className="food-chip" onClick={() => addProtein(f.g)}>{f.label} <span style={{ color: "#4caf82", fontWeight: 700 }}>+{f.g}g</span></button>
            ))}
          </div>
        </div>

        {/* WATER */}
        <div className="card span-1">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <CardLabel>Water</CardLabel>
            <button className="btn-sm" onClick={resetWater} style={{ background: "#f0ede9", color: "#888", marginBottom: 14, fontSize: 11, padding: "4px 10px" }}>Reset</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: "#888" }}>Today</span>
            <span style={{ fontWeight: 700, color: waterPct >= 100 ? "#4caf82" : "#1a1a1a" }}>{todayWater} oz <span style={{ color: "#bbb", fontWeight: 400 }}>/ {WATER_GOAL}</span></span>
          </div>
          <ProgressBar pct={waterPct} color={waterPct >= 100 ? "#4caf82" : "#5ba4cf"} />
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4, marginBottom: 14 }}>{waterPct >= 100 ? "🎉 Goal hit!" : `${WATER_GOAL - todayWater} oz to go`}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[8, 16, 20, 24, 32].map(oz => (
              <button key={oz} className="btn-sm" onClick={() => addWater(oz)} style={{ background: "#e8f4fb", color: "#2e7fb5", fontSize: 12, padding: "6px 10px" }}>+{oz}</button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── PAGE: FITNESS ────────────────────────────────────────────
function FitnessPage({ workoutPlan, setWorkoutPlan, workoutDone, setWorkoutDone }) {
  const [expandedDays, setExpandedDays] = useState({});
  const [editingDay, setEditingDay] = useState(null);
  const [editDraft, setEditDraft] = useState({ label: "", exercises: [] });
  const [newExercise, setNewExercise] = useState("");

  const toggleWorkoutDone = (idx) => setWorkoutDone(prev => ({ ...prev, [idx]: !prev[idx] }));
  const toggleExpand = (idx) => setExpandedDays(prev => ({ ...prev, [idx]: !prev[idx] }));
  const startEdit = (idx) => { setEditDraft({ label: workoutPlan[idx].label, exercises: [...workoutPlan[idx].exercises] }); setEditingDay(idx); setNewExercise(""); };
  const saveEdit = () => { setWorkoutPlan(prev => prev.map((d, i) => i === editingDay ? { ...d, label: editDraft.label, exercises: editDraft.exercises } : d)); setEditingDay(null); };
  const addExercise = () => { if (!newExercise.trim()) return; setEditDraft(p => ({ ...p, exercises: [...p.exercises, newExercise.trim()] })); setNewExercise(""); };
  const removeExercise = (i) => setEditDraft(p => ({ ...p, exercises: p.exercises.filter((_, j) => j !== i) }));

  const todayIdx = todayDayIdx();
  const todayWorkout = workoutPlan[todayIdx];
  const todayDone = !!workoutDone[todayIdx];

  return (
    <div style={pageStyle}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1a1a1a", marginBottom: 22 }}>Fitness</div>
      <div className="dash-grid">

        {/* TODAY'S WORKOUT SNAPSHOT */}
        <div className="card span-3" style={{ background: todayDone ? "#1a1a1a" : "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <CardLabel>Today's Workout</CardLabel>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: todayDone ? "#fff" : "#1a1a1a", marginBottom: 6 }}>
                {todayWorkout.label}
              </div>
              <div style={{ fontSize: 12, color: todayDone ? "rgba(255,255,255,0.5)" : "#aaa", marginBottom: todayWorkout.exercises.length > 0 ? 16 : 0 }}>
                {todayWorkout.exercises.length === 0 ? "Rest day — recover well 🧘" : `${todayWorkout.exercises.length} exercises`}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div onClick={() => toggleWorkoutDone(todayIdx)} style={{
                width: 44, height: 44, borderRadius: "50%", cursor: "pointer",
                border: `2.5px solid ${todayDone ? "rgba(255,255,255,0.4)" : "#ddd"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: todayDone ? "#fff" : "transparent",
                background: todayDone ? "rgba(255,255,255,0.1)" : "transparent",
                transition: "all 0.2s",
              }}>✓</div>
              {todayDone && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>DONE</div>}
            </div>
          </div>
          {todayWorkout.exercises.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {todayWorkout.exercises.map((ex, i) => (
                <div key={i} style={{
                  background: todayDone ? "rgba(255,255,255,0.1)" : "#f7f5f2",
                  borderRadius: 20, padding: "6px 14px", fontSize: 13,
                  color: todayDone ? "rgba(255,255,255,0.7)" : "#555",
                  fontWeight: 500,
                }}>
                  {ex}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FULL WEEK SCHEDULE */}
        <div className="card span-3">
          <CardLabel>Weekly Schedule</CardLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {workoutPlan.map((w, idx) => {
              const isToday = idx === todayIdx;
              const done = !!workoutDone[idx];
              const expanded = !!expandedDays[idx];
              const isEditing = editingDay === idx;

              if (isEditing) return (
                <div key={idx} style={{ border: "1.5px solid #e0dbd5", borderRadius: 14, padding: "14px 16px", background: "#fdfcfb" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#b5a898", letterSpacing: "0.07em", marginBottom: 10 }}>{w.day} — EDITING</div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 5 }}>Workout name</div>
                    <input className="edit-input" value={editDraft.label} onChange={e => setEditDraft(p => ({ ...p, label: e.target.value }))} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Exercises</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
                      {editDraft.exercises.map((ex, i) => (
                        <div key={i} className="ex-tag"><span>{ex}</span><button className="rm" onClick={() => removeExercise(i)}>×</button></div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input className="edit-input" placeholder="Add exercise..." value={newExercise}
                        onChange={e => setNewExercise(e.target.value)} onKeyDown={e => e.key === "Enter" && addExercise()} style={{ flex: 1 }} />
                      <button className="btn-sm" onClick={addExercise} style={{ background: "#f0ede9", color: "#555" }}>+ Add</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-sm" onClick={saveEdit} style={{ background: "#1a1a1a", color: "#fff", flex: 1, padding: "8px" }}>Save</button>
                    <button className="btn-sm" onClick={() => setEditingDay(null)} style={{ background: "#f0ede9", color: "#888" }}>Cancel</button>
                  </div>
                </div>
              );

              return (
                <div key={idx} className="wrow" style={{ background: done ? "#1a1a1a" : isToday ? "#f7f5f2" : "transparent", borderColor: isToday && !done ? "#e0dbd5" : "transparent" }}>
                  <div style={{ width: 32, paddingTop: 2, textAlign: "center", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em", flexShrink: 0, color: done ? "#fff" : isToday ? "#1a1a1a" : "#ccc" }}>{w.day}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: done ? "#fff" : "#1a1a1a" }}>{w.label}</span>
                      {isToday && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: done ? "rgba(255,255,255,0.4)" : "#b5a898" }}>TODAY</span>}
                    </div>
                    {expanded && w.exercises.length > 0 && (
                      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                        {w.exercises.map((ex, i) => <span key={i} style={{ fontSize: 11, color: done ? "rgba(255,255,255,0.55)" : "#888" }}>· {ex}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    {w.exercises.length > 0 && (
                      <button className="btn-sm" onClick={() => toggleExpand(idx)} style={{ background: done ? "rgba(255,255,255,0.12)" : "#f0ede9", color: done ? "rgba(255,255,255,0.6)" : "#888", fontSize: 11, padding: "4px 9px" }}>
                        {expanded ? "▲" : "▼"}
                      </button>
                    )}
                    <button className="btn-sm" onClick={() => startEdit(idx)} style={{ background: done ? "rgba(255,255,255,0.12)" : "#f0ede9", color: done ? "rgba(255,255,255,0.6)" : "#888", fontSize: 11, padding: "4px 9px" }}>Edit</button>
                    <div onClick={() => toggleWorkoutDone(idx)} style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: `2px solid ${done ? "rgba(255,255,255,0.35)" : "#ddd"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: done ? "#fff" : "transparent", cursor: "pointer" }}>✓</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── PAGE: BEAUTY ─────────────────────────────────────────────
function BeautyPage({ beautyLog, setBeautyLog, beautyRoutines, setBeautyRoutines, providers, setProviders }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [editingDateId, setEditingDateId] = useState(null);
  const [newRoutine, setNewRoutine] = useState({ label: "", icon: "💄", category: "Hair", freqDays: 7 });
  const [newProvider, setNewProvider] = useState({ name: "", service: "", phone: "", next: "" });

  const logRoutine = (id) => {
    setBeautyLog(prev => ({ ...prev, [id]: todayKey() }));
    if (editingDateId === id) setEditingDateId(null);
  };
  const setLastDone = (id, date) => setBeautyLog(prev => ({ ...prev, [id]: date }));

  const getDaysAgo = (dateStr) => dateStr ? daysBetween(dateStr, todayKey()) : null;

  const getNextDue = (routine) => {
    const last = beautyLog[routine.id];
    if (!last) return null;
    const d = new Date(last);
    d.setDate(d.getDate() + routine.freqDays);
    return d.toISOString().split("T")[0];
  };

  const getStatus = (routine) => {
    const last = beautyLog[routine.id];
    if (!last) return { label: "Never done", badge: "OVERDUE", color: "#d4614e", bg: "#fdf0ee", urgent: true };
    const ago = getDaysAgo(last);
    const next = getNextDue(routine);
    const daysUntil = next ? daysBetween(todayKey(), next) : 0;
    if (ago === 0) return { label: "Done today", badge: "DONE", color: "#4caf82", bg: "#edf7f1", urgent: false };
    if (daysUntil < 0) return { label: `${Math.abs(daysUntil)}d overdue`, badge: "OVERDUE", color: "#d4614e", bg: "#fdf0ee", urgent: true };
    if (daysUntil === 0) return { label: "Due today", badge: "TODAY", color: "#e8a84a", bg: "#fef7e8", urgent: true };
    if (daysUntil <= 3) return { label: `Due in ${daysUntil}d`, badge: "SOON", color: "#e8a84a", bg: "#fef7e8", urgent: false };
    return { label: `Due in ${daysUntil}d`, badge: null, color: "#4caf82", bg: "#edf7f1", urgent: false };
  };

  const addRoutine = () => {
    if (!newRoutine.label.trim()) return;
    setBeautyRoutines(prev => [...prev, { ...newRoutine, id: `custom-${Date.now()}` }]);
    setNewRoutine({ label: "", icon: "💄", category: "Hair", freqDays: 7 });
    setShowAdd(false);
  };
  const removeRoutine = (id) => setBeautyRoutines(prev => prev.filter(r => r.id !== id));

  const addProvider = () => {
    if (!newProvider.name.trim()) return;
    setProviders(prev => [...prev, { ...newProvider, id: `prov-${Date.now()}` }]);
    setNewProvider({ name: "", service: "", phone: "", next: "" });
    setShowAddProvider(false);
  };
  const removeProvider = (id) => setProviders(prev => prev.filter(p => p.id !== id));

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const daysUntilNext = (next) => {
    if (!next) return null;
    return daysBetween(todayKey(), next);
  };

  const categories = [...new Set(beautyRoutines.map(r => r.category))];

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1a1a1a" }}>Beauty & Wellness</div>
        <button className="btn-sm" onClick={() => { setShowAdd(f => !f); setShowAddProvider(false); }}
          style={{ background: showAdd ? "#1a1a1a" : "#f0ede9", color: showAdd ? "#fff" : "#555" }}>
          {showAdd ? "Cancel" : "+ Routine"}
        </button>
      </div>

      {/* Add routine form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 16 }}>
          <CardLabel>New Routine</CardLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="ninput" placeholder="✨" value={newRoutine.icon}
                onChange={e => setNewRoutine(p => ({ ...p, icon: e.target.value }))} style={{ width: 60, textAlign: "center" }} />
              <input className="ninput" placeholder="Routine name" value={newRoutine.label}
                onChange={e => setNewRoutine(p => ({ ...p, label: e.target.value }))} style={{ flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select className="ninput" value={newRoutine.category} onChange={e => setNewRoutine(p => ({ ...p, category: e.target.value }))} style={{ flex: 1 }}>
                {["Hair", "Nails", "Skin", "Body", "Wellness", "Other"].map(c => <option key={c}>{c}</option>)}
              </select>
              <input className="ninput" type="number" placeholder="Every X days" value={newRoutine.freqDays}
                onChange={e => setNewRoutine(p => ({ ...p, freqDays: Number(e.target.value) }))} style={{ flex: 1 }} />
            </div>
            <button className="btn-sm" onClick={addRoutine} style={{ background: "#1a1a1a", color: "#fff", padding: "10px" }}>Add Routine</button>
          </div>
        </div>
      )}

      {/* Routines by category */}
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b5a898", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{cat}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {beautyRoutines.filter(r => r.category === cat).map(r => {
              const status = getStatus(r);
              const last = beautyLog[r.id];
              const next = getNextDue(r);
              const isEditingDate = editingDateId === r.id;

              return (
                <div key={r.id} style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: status.urgent ? `1.5px solid ${status.color}22` : "1.5px solid transparent" }}>
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 26, flexShrink: 0 }}>{r.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{r.label}</span>
                        {status.badge && (
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", background: status.bg, color: status.color, borderRadius: 20, padding: "2px 8px" }}>
                            {status.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#aaa" }}>Every {r.freqDays} day{r.freqDays > 1 ? "s" : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button className="btn-sm" onClick={() => logRoutine(r.id)}
                        style={{ background: "#edf7f1", color: "#2d7a56", fontSize: 12, padding: "6px 10px" }}>✓ Done</button>
                      <button className="rm" onClick={() => removeRoutine(r.id)}>×</button>
                    </div>
                  </div>

                  {/* Date row */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#f9f7f5", borderRadius: 10, padding: "8px 12px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#b5a898", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>Last Done</div>
                      {isEditingDate ? (
                        <input type="date" className="ninput" style={{ padding: "4px 8px", fontSize: 13, background: "#fff" }}
                          value={last || ""}
                          onChange={e => setLastDone(r.id, e.target.value)}
                          onBlur={() => setEditingDateId(null)} autoFocus />
                      ) : (
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#555" }}>{last ? formatDate(last) : "Not logged"}</div>
                      )}
                    </div>
                    <div style={{ width: 1, height: 32, background: "#eee" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#b5a898", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>Next Due</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: status.color }}>{next ? formatDate(next) : "—"}</div>
                    </div>
                    <button className="btn-sm" onClick={() => setEditingDateId(isEditingDate ? null : r.id)}
                      style={{ background: isEditingDate ? "#1a1a1a" : "#f0ede9", color: isEditingDate ? "#fff" : "#888", fontSize: 11, padding: "5px 10px", flexShrink: 0 }}>
                      {isEditingDate ? "Done" : "Edit"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Providers */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b5a898", letterSpacing: "0.08em", textTransform: "uppercase" }}>My Providers</div>
          <button className="btn-sm" onClick={() => { setShowAddProvider(f => !f); setShowAdd(false); }}
            style={{ background: showAddProvider ? "#1a1a1a" : "#f0ede9", color: showAddProvider ? "#fff" : "#555", fontSize: 11, padding: "4px 12px" }}>
            {showAddProvider ? "Cancel" : "+ Provider"}
          </button>
        </div>

        {showAddProvider && (
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="ninput" placeholder="Name" value={newProvider.name} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))} style={{ flex: 1 }} />
                <input className="ninput" placeholder="Service (e.g. Nails)" value={newProvider.service} onChange={e => setNewProvider(p => ({ ...p, service: e.target.value }))} style={{ flex: 1 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="ninput" placeholder="Phone" type="tel" value={newProvider.phone} onChange={e => setNewProvider(p => ({ ...p, phone: e.target.value }))} style={{ flex: 1 }} />
                <input className="ninput" placeholder="Next appt" type="date" value={newProvider.next} onChange={e => setNewProvider(p => ({ ...p, next: e.target.value }))} style={{ flex: 1 }} />
              </div>
              <button className="btn-sm" onClick={addProvider} style={{ background: "#1a1a1a", color: "#fff", padding: "10px" }}>Add Provider</button>
            </div>
          </div>
        )}

        {providers.length === 0 && !showAddProvider && (
          <div style={{ textAlign: "center", padding: "24px", color: "#ccc", fontSize: 13, background: "#fff", borderRadius: 16 }}>
            Tap + Provider to add your go-to people
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {providers.map(p => {
            const daysUntil = p.next ? daysUntilNext(p.next) : null;
            const apptSoon = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
            return (
              <div key={p.id} style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#f0ede9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {p.service?.[0] || "💼"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>{p.service}</div>
                    </div>
                    <button className="rm" onClick={() => removeProvider(p.id)}>×</button>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {p.phone && (
                      <a href={`tel:${p.phone}`} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f0ede9", borderRadius: 20, padding: "5px 12px", fontSize: 12, color: "#555", textDecoration: "none", fontWeight: 500 }}>
                        📞 {p.phone}
                      </a>
                    )}
                    {p.next && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: apptSoon ? "#fef7e8" : "#f0ede9", borderRadius: 20, padding: "5px 12px", fontSize: 12, color: apptSoon ? "#e8a84a" : "#555", fontWeight: apptSoon ? 600 : 400 }}>
                        📅 {formatDate(p.next)}{daysUntil !== null ? ` · ${daysUntil === 0 ? "today!" : daysUntil < 0 ? `${Math.abs(daysUntil)}d ago` : `in ${daysUntil}d`}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── PAGE: PROGRAMS ───────────────────────────────────────────
function ProgramsPage({ programs, setPrograms }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newProg, setNewProg] = useState({ name: "", category: "Fitness", status: "interested", notes: "", startDate: "" });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const addProgram = () => {
    if (!newProg.name.trim()) return;
    setPrograms(prev => [...prev, { ...newProg, id: Date.now() }]);
    setNewProg({ name: "", category: "Fitness", status: "interested", notes: "", startDate: "" });
    setShowAdd(false);
  };

  const updateStatus = (id, status) => setPrograms(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  const removeProgram = (id) => setPrograms(prev => prev.filter(p => p.id !== id));

  const startEdit = (p) => { setEditDraft({ ...p }); setEditingId(p.id); setShowAdd(false); };
  const saveEdit = () => {
    setPrograms(prev => prev.map(p => p.id === editingId ? { ...editDraft } : p));
    setEditingId(null);
  };

  const statusGroups = [
    { key: "active", label: "Active Now", color: "#4caf82", bg: "#edf7f1" },
    { key: "interested", label: "Want to Try", color: "#5ba4cf", bg: "#e8f4fb" },
    { key: "done", label: "Completed", color: "#aaa", bg: "#f7f5f2" },
  ];

  const statusEmoji = { active: "🟢", interested: "🔵", done: "✅" };

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1a1a1a" }}>Programs</div>
        <button className="btn-sm" onClick={() => { setShowAdd(f => !f); setEditingId(null); }}
          style={{ background: showAdd ? "#1a1a1a" : "#f0ede9", color: showAdd ? "#fff" : "#555" }}>
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 16 }}>
          <CardLabel>New Program</CardLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="ninput" placeholder="Program name" value={newProg.name} onChange={e => setNewProg(p => ({ ...p, name: e.target.value }))} />
            <div style={{ display: "flex", gap: 8 }}>
              <select className="ninput" value={newProg.category} onChange={e => setNewProg(p => ({ ...p, category: e.target.value }))} style={{ flex: 1 }}>
                {PROGRAM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="ninput" value={newProg.status} onChange={e => setNewProg(p => ({ ...p, status: e.target.value }))} style={{ flex: 1 }}>
                <option value="interested">Want to Try</option>
                <option value="active">Active Now</option>
                <option value="done">Completed</option>
              </select>
            </div>
            <input className="ninput" placeholder="Start date (optional)" type="date" value={newProg.startDate} onChange={e => setNewProg(p => ({ ...p, startDate: e.target.value }))} />
            <input className="ninput" placeholder="Notes (optional)" value={newProg.notes} onChange={e => setNewProg(p => ({ ...p, notes: e.target.value }))} />
            <button className="btn-sm" onClick={addProgram} style={{ background: "#1a1a1a", color: "#fff", padding: "10px" }}>Add Program</button>
          </div>
        </div>
      )}

      {statusGroups.map(group => {
        const items = programs.filter(p => p.status === group.key);
        if (items.length === 0) return null;
        return (
          <div key={group.key} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#b5a898", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              {group.label} · {items.length}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map(p => {
                const isEditing = editingId === p.id;
                return (
                  <div key={p.id} className="prog-card">
                    {isEditing ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#b5a898", letterSpacing: "0.07em", marginBottom: 2 }}>EDITING</div>
                        <input className="edit-input" placeholder="Program name" value={editDraft.name}
                          onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <select className="ninput" value={editDraft.category} onChange={e => setEditDraft(d => ({ ...d, category: e.target.value }))} style={{ flex: 1 }}>
                            {PROGRAM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                          <select className="ninput" value={editDraft.status} onChange={e => setEditDraft(d => ({ ...d, status: e.target.value }))} style={{ flex: 1 }}>
                            <option value="interested">Want to Try</option>
                            <option value="active">Active Now</option>
                            <option value="done">Completed</option>
                          </select>
                        </div>
                        <input className="ninput" type="date" value={editDraft.startDate || ""} onChange={e => setEditDraft(d => ({ ...d, startDate: e.target.value }))} />
                        <input className="ninput" placeholder="Notes" value={editDraft.notes || ""} onChange={e => setEditDraft(d => ({ ...d, notes: e.target.value }))} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn-sm" onClick={saveEdit} style={{ background: "#1a1a1a", color: "#fff", flex: 1, padding: "8px" }}>Save</button>
                          <button className="btn-sm" onClick={() => setEditingId(null)} style={{ background: "#f0ede9", color: "#888" }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a", marginBottom: 3 }}>{p.name}</div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ fontSize: 11, background: group.bg, color: group.color, borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>{p.category}</span>
                              {p.startDate && <span style={{ fontSize: 11, color: "#aaa" }}>Started {p.startDate}</span>}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn-sm" onClick={() => startEdit(p)}
                              style={{ background: "#f0ede9", color: "#666", fontSize: 11, padding: "4px 10px" }}>Edit</button>
                            <button className="rm" onClick={() => removeProgram(p.id)}>×</button>
                          </div>
                        </div>
                        {p.notes && <div style={{ fontSize: 12, color: "#888", marginBottom: 10, lineHeight: 1.5 }}>{p.notes}</div>}
                        <div style={{ display: "flex", gap: 6 }}>
                          {statusGroups.filter(g => g.key !== group.key).map(g => (
                            <button key={g.key} className="btn-sm" onClick={() => updateStatus(p.id, g.key)}
                              style={{ background: "#f0ede9", color: "#666", fontSize: 11, padding: "4px 10px" }}>
                              {statusEmoji[g.key]} {g.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {programs.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#ccc" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗂️</div>
          <div style={{ fontSize: 15 }}>No programs yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Tap + Add to start your pipeline</div>
        </div>
      )}
    </div>
  );
}

// ── PAGE: PROGRESS ───────────────────────────────────────────
function ProgressPage({ habits, habitList, protein, waterLog, measurements, setMeasurements, milesLog, challengeStart, workoutDone, workoutPlan }) {
  const [measInput, setMeasInput] = useState({ weight: "", bf: "" });
  const [showMeasForm, setShowMeasForm] = useState(false);

  const latestMeas = measurements.length > 0 ? measurements[measurements.length - 1] : null;
  const addMeasurement = () => {
    const w = parseFloat(measInput.weight), b = parseFloat(measInput.bf);
    if (!w && !b) return;
    setMeasurements(prev => [...prev, { date: todayKey(), weight: w || null, bf: b || null }]);
    setMeasInput({ weight: "", bf: "" }); setShowMeasForm(false);
  };
  const weightPct = latestMeas?.weight ? Math.round((latestMeas.weight / WEIGHT_GOAL) * 100) : 0;
  const bfPct = latestMeas?.bf ? Math.round((latestMeas.bf / BF_GOAL) * 100) : 0;
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });

  function BarChart({ data, goal, color }) {
    const max = Math.max(...data.map(d => d.val), goal, 1);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 70, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: `${(goal / max) * 70}px`, borderTop: "1.5px dashed #e0dbd5", zIndex: 1 }} />
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, zIndex: 2, borderRadius: "3px 3px 0 0", height: `${Math.max(2, (d.val / max) * 70)}px`, background: d.val >= goal ? "#4caf82" : color, transition: "height 0.3s ease" }} />
        ))}
      </div>
    );
  }

  function LineChart({ data, goal, color }) {
    if (data.length < 2) return <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 13 }}>Log 2+ entries to see chart</div>;
    const vals = data.map(d => d.val);
    const min = Math.min(...vals) * 0.97, max = Math.max(...vals) * 1.03;
    const W = 300, H = 80;
    const x = (i) => (i / (data.length - 1)) * W;
    const y = (v) => H - ((v - min) / (max - min)) * H;
    const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.val)}`).join(" ");
    const goalY = y(goal);
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        {goalY >= 0 && goalY <= H && <line x1="0" y1={goalY} x2={W} y2={goalY} stroke="#4caf82" strokeWidth="1.5" strokeDasharray="4 3" />}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.val)} r="3" fill={color} />)}
      </svg>
    );
  }

  function HabitGrid({ habitId, habitLabel, icon }) {
    // Build exactly 28 days going back from today
    const grid = Array.from({ length: 28 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (27 - i));
      return d.toISOString().split("T")[0];
    });

    // Calculate streak
    const streak = (() => {
      let n = 0, d = new Date();
      while (true) {
        const k = d.toISOString().split("T")[0];
        if (habits[k]?.[habitId]) { n++; d.setDate(d.getDate() - 1); } else break;
      }
      return n;
    })();
    const total = grid.filter(k => habits[k]?.[habitId]).length;

    // Streak dates for amber highlight
    const streakDates = new Set();
    if (streak > 0) {
      const d = new Date();
      for (let i = 0; i < streak; i++) {
        streakDates.add(d.toISOString().split("T")[0]);
        d.setDate(d.getDate() - 1);
      }
    }

    // Display as 4 rows of 7 (week rows, day columns) — simple and reliable
    const weeks = Array.from({ length: 4 }, (_, w) => grid.slice(w * 7, w * 7 + 7));

    return (
      <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #f0ede9" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{habitLabel}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {streak > 0 && (
              <div style={{ background: "#fff8e8", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 14 }}>🔥</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#e8a84a" }}>{streak} day streak</span>
              </div>
            )}
            <div style={{ background: "#f0ede9", borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{total}/28</span>
            </div>
          </div>
        </div>

        {/* Day of week labels */}
        <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
          {weeks[0].map((k, di) => {
            const d = new Date(k + "T00:00:00");
            const label = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
            return (
              <div key={di} style={{ width: 32, textAlign: "center", fontSize: 9, fontWeight: 700, color: "#ccc", letterSpacing: "0.04em" }}>{label}</div>
            );
          })}
        </div>

        {/* Grid: 4 rows (weeks) × 7 cols (days) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", gap: 4 }}>
              {week.map((k, di) => {
                const done = habits[k]?.[habitId];
                const isStreak = streakDates.has(k);
                const isToday = k === todayKey();
                return (
                  <div key={di} style={{
                    width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                    background: done ? (isStreak ? "#f59e0b" : "#1a1a1a") : "#f0ede9",
                    border: isToday ? "2px solid #b5a898" : "2px solid transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s",
                  }}>
                    {done && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#f59e0b" }} />
            <span style={{ fontSize: 11, color: "#aaa" }}>Current streak</span>
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#1a1a1a" }} />
            <span style={{ fontSize: 11, color: "#aaa" }}>Completed</span>
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#f0ede9" }} />
            <span style={{ fontSize: 11, color: "#aaa" }}>Missed</span>
          </div>
        </div>
      </div>
    );
  }

  function WorkoutGrid({ workoutDone, workoutPlan }) {
    const grid = Array.from({ length: 28 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (27 - i));
      return { date: d.toISOString().split("T")[0], dayIdx: ((d.getDay() + 6) % 7) };
    });
    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

    // Count streak of consecutive days with workoutDone
    const streak = (() => {
      let n = 0, d = new Date();
      while (true) {
        const dayIdx = (d.getDay() + 6) % 7;
        const k = d.toISOString().split("T")[0];
        const inGrid = grid.find(g => g.date === k);
        if (inGrid && workoutDone[dayIdx]) { n++; d.setDate(d.getDate() - 7); } else break;
      }
      return n;
    })();

    const totalDone = Object.values(workoutDone).filter(Boolean).length;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 20 }}>💪</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>Workouts Completed</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ background: "#f0ede9", borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{totalDone}/7 this week</span>
            </div>
          </div>
        </div>

        {/* Day labels */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
            const done = !!workoutDone[i];
            const isToday = i === todayDayIdx();
            const plan = workoutPlan[i];
            return (
              <div key={i} style={{
                flex: 1, borderRadius: 12, padding: "10px 6px", textAlign: "center",
                background: done ? "#1a1a1a" : isToday ? "#f7f5f2" : "#f0ede9",
                border: isToday && !done ? "1.5px solid #e0dbd5" : "1.5px solid transparent",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: done ? "rgba(255,255,255,0.5)" : "#aaa", letterSpacing: "0.04em", marginBottom: 4 }}>{d}</div>
                <div style={{ fontSize: done ? 16 : 11, color: done ? "#fff" : "#bbb" }}>
                  {done ? "✓" : "—"}
                </div>
                {plan && <div style={{ fontSize: 9, color: done ? "rgba(255,255,255,0.45)" : "#ccc", marginTop: 3, lineHeight: 1.2 }}>{plan.label}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Miles calendar
  const milesDays = Array.from({ length: CHALLENGE_DAYS }, (_, i) => {
    const d = new Date(challengeStart || todayKey());
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
  const totalMiles = Object.values(milesLog).reduce((a, v) => a + v, 0);

  const proteinData = last14.map(d => ({ label: d.slice(5), val: protein[d] || 0 }));
  const waterData = last14.map(d => ({ label: d.slice(5), val: waterLog[d] || 0 }));

  return (
    <div style={pageStyle}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1a1a1a", marginBottom: 22 }}>Progress</div>
      <div className="dash-grid">

        {/* BODY MEASUREMENTS */}
        <div className="card span-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <CardLabel>Body Measurements</CardLabel>
            <button className="btn-sm" onClick={() => setShowMeasForm(f => !f)}
              style={{ background: showMeasForm ? "#1a1a1a" : "#f0ede9", color: showMeasForm ? "#fff" : "#1a1a1a", marginBottom: 14 }}>
              {showMeasForm ? "Cancel" : "+ Log"}
            </button>
          </div>
          {showMeasForm && (
            <div style={{ marginBottom: 16, padding: 14, background: "#f9f7f5", borderRadius: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 5 }}>Weight (lbs)</div>
                  <input className="ninput" type="number" placeholder="e.g. 215" value={measInput.weight} onChange={e => setMeasInput(p => ({ ...p, weight: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 5 }}>Body Fat (%)</div>
                  <input className="ninput" type="number" placeholder="e.g. 38" value={measInput.bf} onChange={e => setMeasInput(p => ({ ...p, bf: e.target.value }))} />
                </div>
              </div>
              <button className="btn-sm" onClick={addMeasurement} style={{ background: "#1a1a1a", color: "#fff", padding: "10px", width: "100%", borderRadius: 10 }}>Save Entry</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 500, color: "#555" }}>⚖️ Weight</span>
                <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{latestMeas?.weight ? `${latestMeas.weight} lbs` : "—"}<span style={{ color: "#ccc", fontWeight: 400 }}> / {WEIGHT_GOAL}</span></span>
              </div>
              <ProgressBar pct={weightPct} color={latestMeas?.weight <= WEIGHT_GOAL ? "#4caf82" : "#1a1a1a"} />
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{latestMeas?.weight ? latestMeas.weight <= WEIGHT_GOAL ? "🎯 Goal reached!" : `${(latestMeas.weight - WEIGHT_GOAL).toFixed(1)} lbs above goal` : "Log your first entry"}</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 500, color: "#555" }}>📊 Body Fat</span>
                <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{latestMeas?.bf ? `${latestMeas.bf}%` : "—"}<span style={{ color: "#ccc", fontWeight: 400 }}> / {BF_GOAL}%</span></span>
              </div>
              <ProgressBar pct={bfPct} color={latestMeas?.bf <= BF_GOAL ? "#4caf82" : "#1a1a1a"} />
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{latestMeas?.bf ? latestMeas.bf <= BF_GOAL ? "🎯 Goal reached!" : `${(latestMeas.bf - BF_GOAL).toFixed(1)}% above goal` : "Log your first entry"}</div>
            </div>
          </div>
          {measurements.length > 0 && (
            <div style={{ borderTop: "1px solid #f0ede9", paddingTop: 12, marginTop: 16 }}>
              <div style={{ fontSize: 11, color: "#b5a898", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>History</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[...measurements].reverse().slice(0, 5).map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
                    <span>{m.date}</span><span>{m.weight ? `${m.weight} lbs` : "—"} · {m.bf ? `${m.bf}%` : "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* HABIT GRIDS */}
        <div className="card span-3">
          <CardLabel>Habit Calendar · Last 28 Days</CardLabel>
          {habitList.map((h, i) => (
            <div key={h.id} style={{ ...(i === habitList.length - 1 ? { marginBottom: 0, paddingBottom: 0, border: "none" } : {}) }}>
              <HabitGrid habitId={h.id} habitLabel={h.label} icon={h.icon} />
            </div>
          ))}
        </div>

        {/* WORKOUT TRACKER */}
        <div className="card span-3">
          <CardLabel>Workout Tracker · This Week</CardLabel>
          <WorkoutGrid workoutDone={workoutDone} workoutPlan={workoutPlan} />
        </div>

        {/* MILES PROGRESS */}
        <div className="card span-3">
          <CardLabel>30 Miles in 30 Days</CardLabel>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: "#888" }}>Total logged</span>
            <span style={{ fontWeight: 700, color: totalMiles >= MILES_GOAL ? "#4caf82" : "#1a1a1a" }}>{totalMiles.toFixed(1)} / {MILES_GOAL} mi</span>
          </div>
          <ProgressBar pct={Math.round((totalMiles / MILES_GOAL) * 100)} color="#4caf82" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 14 }}>
            {milesDays.map((d, i) => {
              const mi = milesLog[d] || 0;
              const isFuture = d > todayKey();
              return (
                <div key={i} title={`${d}: ${mi} mi`} style={{
                  width: 28, height: 28, borderRadius: 6, fontSize: 9, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isFuture ? "#f7f5f2" : mi > 0 ? "#4caf82" : "#f0ede9",
                  color: isFuture ? "#ddd" : mi > 0 ? "#fff" : "#ccc",
                }}>
                  {!isFuture && mi > 0 ? mi.toFixed(1) : i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* PROTEIN */}
        <div className="card span-2">
          <CardLabel>Protein · Last 14 Days</CardLabel>
          <BarChart data={proteinData} goal={PROTEIN_GOAL} color="#c9a87a" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 13 }}>
            <span style={{ color: "#888" }}>Avg</span>
            <span style={{ fontWeight: 600 }}>{Math.round(proteinData.reduce((a, d) => a + d.val, 0) / proteinData.length)}g/day</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
            <span style={{ color: "#888" }}>Days hit goal</span>
            <span style={{ fontWeight: 600, color: "#4caf82" }}>{proteinData.filter(d => d.val >= PROTEIN_GOAL).length}/{proteinData.length}</span>
          </div>
        </div>

        {/* WATER */}
        <div className="card span-1">
          <CardLabel>Water · Last 14 Days</CardLabel>
          <BarChart data={waterData} goal={WATER_GOAL} color="#5ba4cf" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 13 }}>
            <span style={{ color: "#888" }}>Avg</span>
            <span style={{ fontWeight: 600 }}>{Math.round(waterData.reduce((a, d) => a + d.val, 0) / waterData.length)} oz</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── PAGE: MEALS ──────────────────────────────────────────────
const MEAL_SLOTS = [
  { id: "breakfast", label: "Breakfast", icon: "🌅", time: "7–9 AM" },
  { id: "snack1", label: "Morning Snack", icon: "🍎", time: "10–11 AM" },
  { id: "lunch", label: "Lunch", icon: "🥗", time: "12–2 PM" },
  { id: "snack2", label: "Afternoon Snack", icon: "🥜", time: "3–4 PM" },
  { id: "dinner", label: "Dinner", icon: "🍽️", time: "6–8 PM" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MealPage({ mealPlan, setMealPlan }) {
  const [selectedDay, setSelectedDay] = useState(todayDayIdx());
  const [editingSlot, setEditingSlot] = useState(null); // { day, slotId }
  const [editDraft, setEditDraft] = useState({ name: "", protein: "" });

  const getMeal = (day, slotId) => mealPlan?.[day]?.[slotId] || null;

  const saveMeal = () => {
    if (!editDraft.name.trim()) { setEditingSlot(null); return; }
    setMealPlan(prev => ({
      ...prev,
      [editingSlot.day]: {
        ...(prev?.[editingSlot.day] || {}),
        [editingSlot.slotId]: {
          name: editDraft.name.trim(),
          protein: editDraft.protein ? Number(editDraft.protein) : 0,
        }
      }
    }));
    setEditingSlot(null);
  };

  const clearMeal = (day, slotId) => {
    setMealPlan(prev => {
      const d = { ...(prev?.[day] || {}) };
      delete d[slotId];
      return { ...prev, [day]: d };
    });
  };

  const startEdit = (day, slotId) => {
    const existing = getMeal(day, slotId);
    setEditDraft({ name: existing?.name || "", protein: existing?.protein || "" });
    setEditingSlot({ day, slotId });
  };

  const dayTotalProtein = (day) =>
    MEAL_SLOTS.reduce((sum, s) => sum + (getMeal(day, s.id)?.protein || 0), 0);

  const dayComplete = (day) =>
    MEAL_SLOTS.filter(s => getMeal(day, s.id)).length;

  const weekTotalProtein = DAYS.reduce((sum, _, i) => sum + dayTotalProtein(i), 0);

  return (
    <div style={pageStyle}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1a1a1a", marginBottom: 6 }}>Meal Planner</div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 22 }}>Weekly avg protein: <strong style={{ color: "#1a1a1a" }}>{Math.round(weekTotalProtein / 7)}g/day</strong></div>

      {/* Weekly overview strip */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {DAYS.map((day, idx) => {
          const isToday = idx === todayDayIdx();
          const isSelected = idx === selectedDay;
          const filled = dayComplete(idx);
          const prot = dayTotalProtein(idx);
          return (
            <button key={idx} onClick={() => setSelectedDay(idx)}
              style={{
                border: "none", cursor: "pointer", borderRadius: 14, padding: "10px 12px",
                minWidth: 58, flexShrink: 0, textAlign: "center",
                background: isSelected ? "#1a1a1a" : isToday ? "#f7f5f2" : "#fff",
                boxShadow: isSelected ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
                outline: isToday && !isSelected ? "1.5px solid #e0dbd5" : "none",
                transition: "all 0.15s",
              }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: isSelected ? "rgba(255,255,255,0.6)" : "#aaa", marginBottom: 4 }}>{day}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: isSelected ? "#fff" : "#1a1a1a", lineHeight: 1 }}>{filled}</div>
              <div style={{ fontSize: 9, color: isSelected ? "rgba(255,255,255,0.5)" : "#bbb", marginTop: 3 }}>{filled}/5 meals</div>
              {prot > 0 && <div style={{ fontSize: 10, color: isSelected ? "#4caf82" : "#4caf82", fontWeight: 700, marginTop: 3 }}>{prot}g</div>}
            </button>
          );
        })}
      </div>

      {/* Day detail */}
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
          {DAYS[selectedDay]} {selectedDay === todayDayIdx() ? "· Today" : ""}
        </div>
        <div style={{ fontSize: 13, color: "#888" }}>
          Total protein: <strong style={{ color: dayTotalProtein(selectedDay) >= PROTEIN_GOAL ? "#4caf82" : "#1a1a1a" }}>{dayTotalProtein(selectedDay)}g</strong>
          <span style={{ color: "#ccc" }}> / {PROTEIN_GOAL}g goal</span>
        </div>
      </div>

      <ProgressBar pct={Math.min(100, Math.round((dayTotalProtein(selectedDay) / PROTEIN_GOAL) * 100))} color="#4caf82" />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {MEAL_SLOTS.map(slot => {
          const meal = getMeal(selectedDay, slot.id);
          const isEditing = editingSlot?.day === selectedDay && editingSlot?.slotId === slot.id;

          return (
            <div key={slot.id} style={{
              background: "#fff", borderRadius: 16, padding: "14px 16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: meal ? "1.5px solid #f0ede9" : "1.5px dashed #eee",
            }}>
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#b5a898", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    {slot.icon} {slot.label}
                  </div>
                  <input className="edit-input" placeholder="What are you eating?" value={editDraft.name}
                    onChange={e => setEditDraft(p => ({ ...p, name: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && saveMeal()} autoFocus />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input className="edit-input" type="number" placeholder="Protein (g)" value={editDraft.protein}
                      onChange={e => setEditDraft(p => ({ ...p, protein: e.target.value }))}
                      style={{ flex: 1 }} />
                    <span style={{ fontSize: 12, color: "#aaa", flexShrink: 0 }}>grams protein</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-sm" onClick={saveMeal} style={{ background: "#1a1a1a", color: "#fff", flex: 1, padding: "8px" }}>Save</button>
                    <button className="btn-sm" onClick={() => setEditingSlot(null)} style={{ background: "#f0ede9", color: "#888" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{slot.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#b5a898", letterSpacing: "0.05em", textTransform: "uppercase" }}>{slot.label}</span>
                      <span style={{ fontSize: 11, color: "#ddd" }}>{slot.time}</span>
                    </div>
                    {meal ? (
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a", marginBottom: 2 }}>{meal.name}</div>
                        {meal.protein > 0 && (
                          <div style={{ fontSize: 12, color: "#4caf82", fontWeight: 600 }}>+{meal.protein}g protein</div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: "#ccc" }}>Not planned yet</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button className="btn-sm" onClick={() => startEdit(selectedDay, slot.id)}
                      style={{ background: "#f0ede9", color: "#666", fontSize: 12, padding: "6px 10px" }}>
                      {meal ? "Edit" : "+ Add"}
                    </button>
                    {meal && <button className="rm" onClick={() => clearMeal(selectedDay, slot.id)}>×</button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly summary */}
      <div className="card" style={{ marginTop: 20 }}>
        <CardLabel>Weekly Protein Summary</CardLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DAYS.map((day, idx) => {
            const prot = dayTotalProtein(idx);
            const pct = Math.min(100, Math.round((prot / PROTEIN_GOAL) * 100));
            const isToday = idx === todayDayIdx();
            return (
              <div key={idx} onClick={() => setSelectedDay(idx)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: isToday ? 700 : 400, color: isToday ? "#1a1a1a" : "#888" }}>{day}{isToday ? " · Today" : ""}</span>
                  <span style={{ fontWeight: 600, color: prot >= PROTEIN_GOAL ? "#4caf82" : "#1a1a1a" }}>
                    {prot}g <span style={{ color: "#ccc", fontWeight: 400 }}>/ {PROTEIN_GOAL}g</span>
                  </span>
                </div>
                <ProgressBar pct={pct} color={prot >= PROTEIN_GOAL ? "#4caf82" : "#c9a87a"} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── ROOT APP ─────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("today");
  const [habits, setHabits] = useLocalStorage("habits_log", {});
  const [habitList, setHabitList] = useLocalStorage("habit_list", DEFAULT_HABITS);
  const [workoutPlan, setWorkoutPlan] = useLocalStorage("workout_plan_v2", DEFAULT_SCHEDULE.map(d => ({ ...d })));
  const [workoutDone, setWorkoutDone] = useLocalStorage("workout_done", {});
  const [protein, setProtein] = useLocalStorage("protein_log", {});
  const [waterLog, setWaterLog] = useLocalStorage("water_log", {});
  const [milesLog, setMilesLog] = useLocalStorage("miles_log", {});
  const [challengeStart] = useLocalStorage("challenge_start", todayKey());
  const [measurements, setMeasurements] = useLocalStorage("measurements", []);
  const [beautyLog, setBeautyLog] = useLocalStorage("beauty_log", {});
  const [beautyRoutines, setBeautyRoutines] = useLocalStorage("beauty_routines", DEFAULT_BEAUTY);
  const [providers, setProviders] = useLocalStorage("providers", []);
  const [programs, setPrograms] = useLocalStorage("programs", []);
  const [mealPlan, setMealPlan] = useLocalStorage("meal_plan", {});

  const shared = { habits, setHabits, habitList, setHabitList, protein, setProtein, waterLog, setWaterLog, milesLog, setMilesLog, challengeStart, measurements, setMeasurements, workoutPlan, setWorkoutPlan, workoutDone, setWorkoutDone, beautyLog, setBeautyLog, beautyRoutines, setBeautyRoutines, providers, setProviders, programs, setPrograms };

  return (
    <>
      <style>{globalCSS}</style>
      {page === "today" && <TodayPage {...shared} />}
      {page === "fitness" && <FitnessPage workoutPlan={shared.workoutPlan} setWorkoutPlan={shared.setWorkoutPlan} workoutDone={shared.workoutDone} setWorkoutDone={shared.setWorkoutDone} />}
      {page === "meals" && <MealPage mealPlan={mealPlan} setMealPlan={setMealPlan} />}
      {page === "programs" && <ProgramsPage {...shared} />}
      {page === "progress" && <ProgressPage habits={shared.habits} habitList={shared.habitList} protein={shared.protein} waterLog={shared.waterLog} measurements={shared.measurements} setMeasurements={shared.setMeasurements} milesLog={shared.milesLog} challengeStart={shared.challengeStart} workoutDone={shared.workoutDone} workoutPlan={shared.workoutPlan} />}
      <NavBar page={page} setPage={setPage} />
    </>
  );
}

function greetingTime() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

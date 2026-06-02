import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

const Ctx = createContext(null);

// ── Auth gate ────────────────────────────────────────────────
export function RequireAuth({ children }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) return <Splash text="Loading…" />;
  if (!session) return <Login />;
  return (
    <CloudStateProvider userId={session.user.id}>
      <SignOutButton />
      {children}
    </CloudStateProvider>
  );
}

// ── Cloud state store ────────────────────────────────────────
function CloudStateProvider({ userId, children }) {
  const [store, setStore] = useState({});
  const [loaded, setLoaded] = useState(false);
  const storeRef = useRef({});
  const timers = useRef({});

  useEffect(() => {
    let active = true;
    supabase.from("aura_state").select("key, value").eq("user_id", userId)
      .then(({ data, error }) => {
        if (!active) return;
        const map = {};
        if (!error && data) for (const row of data) map[row.key] = row.value;
        if (error) console.error("Aura load failed:", error.message);
        storeRef.current = map;
        setStore(map);
        setLoaded(true);
      });
    return () => { active = false; };
  }, [userId]);

  const setKey = (key, next, initial) => {
    const cur = storeRef.current[key] !== undefined ? storeRef.current[key] : initial;
    const resolved = typeof next === "function" ? next(cur) : next;
    const updated = { ...storeRef.current, [key]: resolved };
    storeRef.current = updated;
    setStore(updated);
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      supabase.from("aura_state")
        .upsert(
          { user_id: userId, key, value: resolved, updated_at: new Date().toISOString() },
          { onConflict: "user_id,key" }
        )
        .then(({ error }) => { if (error) console.error("Aura save failed:", error.message); });
    }, 400);
  };

  if (!loaded) return <Splash text="Syncing…" />;
  return <Ctx.Provider value={{ store, setKey }}>{children}</Ctx.Provider>;
}

// ── Drop-in replacement for useLocalStorage ──────────────────
export function useCloudState(key, initial) {
  const { store, setKey } = useContext(Ctx);
  const value = store[key] !== undefined ? store[key] : initial;
  useEffect(() => {
    if (store[key] === undefined) setKey(key, initial, initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const setValue = (next) => setKey(key, next, initial);
  return [value, setValue];
}

// ── Login screen ─────────────────────────────────────────────
function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendLink = async () => {
    if (!email.trim()) return;
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    error ? setError(error.message) : setSent(true);
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: "#1a1a1a", marginBottom: 6 }}>Aura</div>
        <div style={{ fontSize: 14, color: "#aaa", marginBottom: 24 }}>Your private wellness tracker</div>
        {sent ? (
          <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
            Check your email — we sent a sign-in link to <strong>{email}</strong>. Tap it on this device to log in.
          </div>
        ) : (
          <>
            <input type="email" placeholder="you@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendLink()} style={input} />
            {error && <div style={{ color: "#d4614e", fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <button onClick={sendLink} disabled={loading} style={btn}>
              {loading ? "Sending…" : "Email me a magic link"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SignOutButton() {
  return (
    <button onClick={() => supabase.auth.signOut()} style={{
      position: "fixed", top: 12, right: 12, zIndex: 200, border: "none", background: "#fff",
      color: "#bbb", borderRadius: 20, padding: "6px 12px", fontSize: 11, fontWeight: 600,
      cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", fontFamily: "'DM Sans', sans-serif",
    }}>Sign out</button>
  );
}

function Splash({ text }) {
  return (
    <div style={wrap}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#bbb" }}>{text}</div>
    </div>
  );
}

const wrap = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f5f2", padding: 20, fontFamily: "'DM Sans', sans-serif" };
const card = { background: "#fff", borderRadius: 20, padding: "36px 28px", width: "100%", maxWidth: 360, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 28px rgba(0,0,0,0.06)" };
const input = { width: "100%", border: "1.5px solid #e8e4df", borderRadius: 12, padding: "12px 14px", fontSize: 16, fontFamily: "'DM Sans', sans-serif", outline: "none", marginBottom: 12, background: "#fff" };
const btn = { width: "100%", border: "none", background: "#1a1a1a", color: "#fff", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
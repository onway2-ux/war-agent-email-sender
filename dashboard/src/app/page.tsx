"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    const { data, error } = await supabase
      .from("bot_config")
      .select("*")
      .single();

    if (data) {
      setConfig(data);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("bot_config")
      .update({
        news_topic: config.news_topic,
        language: config.language,
        is_active: config.is_active,
      })
      .eq("id", config.id);

    if (!error) {
      setMessage("Settings saved successfully! 🚀");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Error saving settings. ❌");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-pulse text-xl font-bold">Initing AI Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-[family-name:var(--font-outfit)]">
      <div className="max-w-xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 to-rose-300 bg-clip-text text-transparent uppercase mb-2">
            AI Agent Command Center
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            REMOTELY MANAGE YOUR WAR UPDATES BOT
          </p>
        </header>

        <main className="space-y-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
          {/* Status Section */}
          <div className="flex items-center justify-between pb-6 border-bottom border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Bot Status
              </p>
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${config.is_active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                <span className="font-bold text-lg">{config.is_active ? "Live & active" : "Disabled"}</span>
              </div>
            </div>
            <button
              onClick={() => setConfig({ ...config, is_active: !config.is_active })}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${
                config.is_active 
                ? "bg-slate-800 text-slate-400 hover:bg-rose-900/40 hover:text-rose-400" 
                : "bg-emerald-600 text-white hover:bg-emerald-500"
              }`}
            >
              {config.is_active ? "Disable Bot" : "Enable Bot"}
            </button>
          </div>

          <hr className="border-slate-800" />

          {/* Form Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                News Topic (Focus)
              </label>
              <input
                type="text"
                value={config.news_topic}
                onChange={(e) => setConfig({ ...config, news_topic: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-semibold"
                placeholder="e.g. Iran vs Israel / US updates"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Output Language
              </label>
              <select
                value={config.language}
                onChange={(e) => setConfig({ ...config, language: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-semibold appearance-none"
              >
                <option value="Roman Urdu">Roman Urdu</option>
                <option value="English">English</option>
                <option value="Urdu (Native Script)">Urdu (Native Script)</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-rose-950/20 transition-all active:scale-[0.98]"
            >
              {saving ? "Saving Changes..." : "Deploy Settings"}
            </button>
            {message && (
              <p className="text-center mt-4 text-xs font-bold tracking-tight animate-bounce capitalize text-emerald-400">
                {message}
              </p>
            )}
          </div>
        </main>

        <footer className="mt-12 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          Powered by Next.js & Gemini AI • 2026 Shift
          <p className="mt-1">Last Sync: {new Date(config.last_run_timestamp).toLocaleString()}</p>
        </footer>
      </div>
    </div>
  );
}

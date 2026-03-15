"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
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
        tone: config.tone,
        receiver_emails: config.receiver_emails,
        run_hours: config.run_hours
      })
      .eq("id", config.id);

    if (!error) {
      setMessage("Bot successfully re-configured! 🚀");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Error saving settings. ❌");
    }
    setSaving(false);
  }

  async function handleTest() {
    setTesting(true);
    setMessage("AI is aggregating news... 🤖");
    try {
      const res = await fetch('/api/test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage("Test email sent successfully! 📧");
        fetchConfig(); // Refresh timestamp
      } else {
        setMessage(`Test failed: ${data.message || data.error} ❌`);
      }
    } catch (e) {
      setMessage("Network error occurred. ❌");
    }
    setTesting(false);
    setTimeout(() => setMessage(""), 5000);
  }

  const toggleHour = (hour: number) => {
    let hours = config.run_hours.split(',').map((h: string) => parseInt(h.trim())).filter((h: any) => !isNaN(h));
    if (hours.includes(hour)) {
      hours = hours.filter((h: number) => h !== hour);
    } else {
      hours.push(hour);
    }
    setConfig({ ...config, run_hours: hours.sort((a: number, b: number) => a - b).join(',') });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm font-bold tracking-widest uppercase text-slate-500">Connecting to Bot...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-[family-name:var(--font-outfit)]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex border-b border-slate-900 pb-8 items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent uppercase">
              Agent Command Center
            </h1>
            <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase mt-1">
              Enterprise Level AI Newsletter Control
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900/50 p-2 pr-4 rounded-2xl border border-slate-800">
             <div className="relative flex h-3 w-3 ml-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${config.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase leading-none">Status</p>
                <p className="text-xs font-bold leading-tight">{config.is_active ? "OPERATIONAL" : "PAUSED"}</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
              <h2 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-6">Content Configuration</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">News Topic Context</label>
                  <input
                    type="text"
                    value={config.news_topic}
                    onChange={(e) => setConfig({ ...config, news_topic: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-semibold"
                    placeholder="e.g. Iran vs Israel Strategy"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Target Language</label>
                    <select
                      value={config.language}
                      onChange={(e) => setConfig({ ...config, language: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-semibold appearance-none cursor-pointer"
                    >
                      <option value="Roman Urdu">Roman Urdu</option>
                      <option value="English">English</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">AI Tone</label>
                    <select
                      value={config.tone}
                      onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-semibold appearance-none cursor-pointer"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Urgent & Critical">Urgent</option>
                      <option value="Short & Concise">Concise</option>
                      <option value="Analytical & Deep">Analytical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Recipients (Comma separated)</label>
                  <textarea
                    value={config.receiver_emails}
                    onChange={(e) => setConfig({ ...config, receiver_emails: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-semibold h-24 resize-none"
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar: Schedule & Actions */}
          <div className="space-y-6">
            <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
              <h2 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4">Mailing Schedule (24H)</h2>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 24 }).map((_, i) => {
                  const isActive = config.run_hours.split(',').map((h: string) => parseInt(h.trim())).includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleHour(i)}
                      className={`py-2 text-[10px] font-black rounded-lg border transition-all ${
                        isActive 
                        ? "bg-rose-600 border-rose-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.3)]" 
                        : "bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700"
                      }`}
                    >
                      {i < 10 ? `0${i}` : i}:00
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] text-slate-600 mt-4 font-bold uppercase text-center">Bot checks every hour</p>
            </section>

            <div className="space-y-3">
               <button
                onClick={handleSave}
                disabled={saving || testing}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-rose-950/20 transition-all active:scale-[0.98] text-xs"
              >
                {saving ? "Processing..." : "Sync All Settings"}
              </button>

              <button
                onClick={handleTest}
                disabled={testing || saving}
                className="w-full bg-slate-100 hover:bg-white disabled:opacity-50 text-slate-950 font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-white/5 transition-all active:scale-[0.98] text-xs"
              >
                {testing ? "Running Test..." : "Run Manual Test"}
              </button>
              
              <button
                onClick={() => setConfig({ ...config, is_active: !config.is_active })}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  config.is_active 
                  ? "bg-slate-950 border-slate-800 text-rose-500 hover:bg-rose-950/10" 
                  : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500"
                }`}
              >
                {config.is_active ? "Stop Newsletter Service" : "Start Newsletter Service"}
              </button>
            </div>

            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                <p className="text-xs font-bold text-emerald-400 tracking-tight animate-pulse underline decoration-2 underline-offset-4">
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
          Command Center v2.0 • Last Sync: {new Date(config.last_run_timestamp).toLocaleTimeString()}
        </footer>
      </div>
    </div>
  );
}

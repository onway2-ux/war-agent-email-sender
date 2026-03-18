"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");

  const currentConfig = configs.find(c => c.id === selectedId) || null;

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    const { data, error } = await supabase
      .from("bot_config")
      .select("*")
      .order('id', { ascending: true });

    if (data && data.length > 0) {
      setConfigs(data);
      if (!selectedId) setSelectedId(data[0].id);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!currentConfig) return;
    setSaving(true);
    const { error } = await supabase
      .from("bot_config")
      .update({
        news_topic: currentConfig.news_topic,
        language: currentConfig.language,
        is_active: currentConfig.is_active,
        tone: currentConfig.tone,
        receiver_emails: currentConfig.receiver_emails,
        run_hours: currentConfig.run_hours
      })
      .eq("id", currentConfig.id);

    if (!error) {
      setMessage("Settings synced successfully! 🚀");
      setTimeout(() => setMessage(""), 3000);
      fetchConfigs();
    } else {
      setMessage("Error saving settings. ❌");
    }
    setSaving(false);
  }

  async function handleAddNew() {
    const newConfig = {
      news_topic: "New Topic",
      language: "Roman Urdu",
      tone: "Professional",
      receiver_emails: "",
      run_hours: "6,14,21",
      is_active: true,
      last_run_timestamp: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from("bot_config")
      .insert([newConfig])
      .select();

    if (data) {
      setConfigs([...configs, data[0]]);
      setSelectedId(data[0].id);
      setMessage("New stream added! 🌟");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  async function handleTest() {
    if (!currentConfig) return;
    setTesting(true);
    setMessage(`Aggregating "${currentConfig.news_topic}"... 🤖`);
    try {
      const res = await fetch('/api/test', { 
        method: 'POST',
        body: JSON.stringify({ id: currentConfig.id }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Test email sent successfully! 📧");
        fetchConfigs(); 
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
    if (!currentConfig) return;
    let hours = currentConfig.run_hours.split(',').map((h: string) => parseInt(h.trim())).filter((h: any) => !isNaN(h));
    if (hours.includes(hour)) {
      hours = hours.filter((h: number) => h !== hour);
    } else {
      hours.push(hour);
    }
    const updated = { ...currentConfig, run_hours: hours.sort((a: number, b: number) => a - b).join(',') };
    setConfigs(configs.map(c => c.id === selectedId ? updated : c));
  };

  const updateCurrent = (field: string, value: any) => {
    if (!currentConfig) return;
    setConfigs(configs.map(c => c.id === selectedId ? { ...c, [field]: value } : c));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm font-bold tracking-widest uppercase text-slate-500">Initializing Engine...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-[family-name:var(--font-outfit)]">
      <div className="flex flex-col lg:flex-row min-h-screen opacity-1">
        
        {/* Stream Sidebar */}
        <aside className="w-full lg:w-72 bg-slate-950 border-r border-slate-900 p-6 flex flex-col gap-6">
          <div className="mb-4">
            <h1 className="text-xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent uppercase">
              Pro Engine
            </h1>
            <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase mt-1">Multi-Stream Control</p>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {configs.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                  selectedId === c.id 
                  ? "bg-rose-600/10 border-rose-500/50" 
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${selectedId === c.id ? 'text-rose-500' : 'text-slate-500'}`}>
                    ID: {c.id}
                  </p>
                </div>
                <p className={`text-xs font-bold truncate ${selectedId === c.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {c.news_topic}
                </p>
              </button>
            ))}
            
            <button 
              onClick={handleAddNew}
              className="w-full p-4 rounded-2xl border border-dashed border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              + Add New Stream
            </button>
          </div>

          <div className="pt-6 border-t border-slate-900">
             <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-600/20 flex items-center justify-center text-rose-500 font-black text-[10px]">PKT</div>
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase leading-none">Local Sync</p>
                   <p className="text-[10px] font-bold text-white mt-1">GMT +5.00</p>
                </div>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 overflow-y-auto">
          {currentConfig ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Stream Details</h2>
                  <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mt-1">Configuring ID: {selectedId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${currentConfig.is_active ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-rose-500/30 text-rose-400 bg-rose-500/10'}`}>
                    {currentConfig.is_active ? 'ACTIVE' : 'PAUSED'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor */}
                <div className="lg:col-span-2 space-y-6">
                  <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] backdrop-blur-md">
                    <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                       <span className="w-4 h-[1px] bg-rose-500 shadow-[0_0_10px_#e11d48]"></span> Payload Settings
                    </h3>
                    
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">News Topic Context</label>
                        <input
                          type="text"
                          value={currentConfig.news_topic}
                          onChange={(e) => updateCurrent('news_topic', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-semibold"
                          placeholder="e.g. Iran vs Israel Strategy"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Target Language</label>
                          <select
                            value={currentConfig.language}
                            onChange={(e) => updateCurrent('language', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-semibold cursor-pointer"
                          >
                            <option value="Roman Urdu">Roman Urdu</option>
                            <option value="English">English</option>
                            <option value="Arabic">Arabic</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">AI Tone Style</label>
                          <select
                            value={currentConfig.tone}
                            onChange={(e) => updateCurrent('tone', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-semibold cursor-pointer"
                          >
                            <option value="Professional">Professional</option>
                            <option value="Urgent & Critical">Urgent</option>
                            <option value="Short & Concise">Concise</option>
                            <option value="Analytical & Deep">Analytical</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Receiver Emails</label>
                        <textarea
                          value={currentConfig.receiver_emails}
                          onChange={(e) => updateCurrent('receiver_emails', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-semibold h-32 resize-none custom-scrollbar"
                          placeholder="email1@example.com, email2@example.com"
                        />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Sidebar controls */}
                <div className="space-y-6">
                  <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-md">
                    <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-6">Mailing Schedule (24H)</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const isActive = currentConfig.run_hours.split(',').map((h: string) => parseInt(h.trim())).includes(i);
                        return (
                          <button
                            key={i}
                            onClick={() => toggleHour(i)}
                            className={`py-2 text-[10px] font-black rounded-xl border transition-all ${
                              isActive 
                              ? "bg-rose-600 border-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.2)]" 
                              : "bg-slate-950 border-slate-900 text-slate-700 hover:border-slate-800"
                            }`}
                          >
                            {i < 10 ? `0${i}` : i}:00
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <div className="space-y-4">
                    <button
                      onClick={handleSave}
                      disabled={saving || testing}
                      className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black uppercase tracking-widest py-6 rounded-3xl shadow-xl shadow-rose-950/20 transition-all active:scale-[0.98] text-[11px]"
                    >
                      {saving ? "Updating Cloud..." : "Save Stream Settings"}
                    </button>

                    <button
                      onClick={handleTest}
                      disabled={testing || saving}
                      className="w-full bg-white hover:bg-slate-200 disabled:opacity-50 text-slate-950 font-black uppercase tracking-widest py-6 rounded-3xl shadow-xl transition-all active:scale-[0.98] text-[11px]"
                    >
                      {testing ? "Engine Running..." : "Run Instant Test"}
                    </button>
                    
                    <button
                      onClick={() => updateCurrent('is_active', !currentConfig.is_active)}
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        currentConfig.is_active 
                        ? "bg-slate-950 border-slate-900 text-rose-500 hover:bg-rose-950/10" 
                        : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500"
                      }`}
                    >
                      {currentConfig.is_active ? "Pause This Stream" : "Resume This Stream"}
                    </button>
                  </div>

                  {message && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl text-center animate-bounce">
                      <p className="text-[10px] font-black text-emerald-400 leading-tight uppercase tracking-widest">
                        {message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <footer className="pt-8 border-t border-slate-900 text-center text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
                Last Engine Run: {currentConfig.last_run_timestamp ? new Date(currentConfig.last_run_timestamp).toLocaleString() : 'Never'}
              </footer>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-16 h-16 rounded-full border border-dashed border-slate-800 flex items-center justify-center">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
               </div>
               <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Select a stream or create one to begin</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

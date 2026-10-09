import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import type { Profile, SkillLevel } from "../types";
import { createProfile, deleteProfile, listProfiles } from "../services/profileService";
import { useProfileContext } from "../contexts/ProfileContext";
import profileBackground from "../assets/profile-background.png";

export function ProfileSelectPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const deletingRef = useRef(false);
  const { activeProfile, setActiveProfile } = useProfileContext();
  const navigate = useNavigate();
  const refresh = async () => setProfiles(await listProfiles());
  useEffect(() => { void refresh().catch(() => setError("Could not load profiles. Check device storage and try again.")); }, []);
  const chooseProfile = (p: Profile) => { setActiveProfile(p); navigate("/dashboard"); };
  const removeProfile = async (id: number) => {
    if (deletingRef.current || !window.confirm("Delete this profile and all of its progress? This cannot be undone.")) return;
    deletingRef.current = true; setDeleting(id); setError(null);
    try {
      await deleteProfile(id);
      if (activeProfile?.id === id) setActiveProfile(null);
      await refresh();
    } catch { setError("Could not finish deleting this profile. Please try again."); }
    finally { deletingRef.current = false; setDeleting(null); }
  };
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 bg-cover bg-center p-6 dark:bg-slate-950" style={{ backgroundImage: `url(${profileBackground})` }}>
    <div className="w-full max-w-xl rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur-sm dark:bg-slate-950/80 sm:p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">TG</div>
        <h1 className="text-2xl font-bold">TypeGuru Pro</h1><p className="text-slate-500 dark:text-slate-400">Who&apos;s practicing today?</p>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {profiles.map((p) => <div key={p.id} className="relative rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button disabled={deleting !== null} onClick={() => chooseProfile(p)} className="flex min-h-32 w-full flex-col items-center gap-2 rounded-xl p-4 pt-12 transition hover:shadow-md disabled:opacity-50">
            <div className="grid h-14 w-14 place-items-center rounded-full text-xl font-semibold text-white" style={{ backgroundColor: p.avatarColor }}>{p.displayName.slice(0, 1).toUpperCase()}</div>
            <span className="max-w-full break-words text-sm font-medium">{p.displayName}</span>
          </button>
          {!p.isDemo && <button type="button" disabled={deleting !== null} aria-label={`Delete profile ${p.displayName}`} onClick={() => void removeProfile(p.id as number)} className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 size={18} /></button>}
        </div>)}
        <button disabled={deleting !== null} onClick={() => setShowForm(true)} className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-4 text-slate-500 hover:border-brand-400 hover:text-brand-500 dark:border-slate-700"><Plus size={28} /><span className="text-sm font-medium">New Profile</span></button>
      </div>
      {showForm && <NewProfileForm onCreated={(p) => { setShowForm(false); chooseProfile(p); }} onCancel={() => setShowForm(false)} />}
    </div>
  </div>;
}
function NewProfileForm({ onCreated, onCancel }: { onCreated: (p: Profile) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [typingLanguage, setTypingLanguage] = useState<"en" | "hi">("en");
  const [interfaceLang, setInterfaceLang] = useState<"en" | "hi">("en");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current || !name.trim()) return;
    savingRef.current = true; setSaving(true); setError(null);
    try {
      const profile = await createProfile({ displayName: name.trim(), preferredInterfaceLanguage: interfaceLang, preferredTypingLanguage: typingLanguage, preferredLayout: typingLanguage === "hi" ? "kruti-dev-010" : "en-qwerty", skillLevel, dailyGoalMinutes: 15 });
      onCreated(profile);
    } catch { setError("Could not create the profile. Check device storage and try again."); }
    finally { savingRef.current = false; setSaving(false); }
  };
  return <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <label className="block text-sm font-medium">Name<input required maxLength={80} autoFocus value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="e.g. Priya" /></label>
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="block text-sm font-medium">Typing language<select value={typingLanguage} onChange={(e) => setTypingLanguage(e.target.value as "en" | "hi")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="en">English</option><option value="hi">Hindi</option></select></label>
      <label className="block text-sm font-medium">Interface language<select value={interfaceLang} onChange={(e) => setInterfaceLang(e.target.value as "en" | "hi")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="en">English</option><option value="hi">हिन्दी</option></select></label>
      <label className="block text-sm font-medium">Skill level<select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value as SkillLevel)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
    </div>
    <div className="flex justify-end gap-2 pt-2"><button type="button" disabled={saving} onClick={onCancel} className="rounded-md px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button><button type="submit" disabled={saving || !name.trim()} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">{saving ? "Creating..." : "Create Profile"}</button></div>
  </form>;
}

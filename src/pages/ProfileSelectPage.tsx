import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import type { Profile, SkillLevel } from "../types";
import { createProfile, deleteProfile, listProfiles } from "../services/profileService";
import { useProfileContext, ACTIVE_PROFILE_STORAGE_KEY } from "../contexts/ProfileContext";
import profileBackground from "../assets/profile-background.png";

export function ProfileSelectPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { setActiveProfile } = useProfileContext();
  const navigate = useNavigate();

  const refresh = async () => setProfiles(await listProfiles());

  useEffect(() => {
    void refresh();
  }, []);

  const chooseProfile = (p: Profile) => {
    setActiveProfile(p);
    navigate("/dashboard");
  };

  const removeProfile = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this profile and all of its progress? This cannot be undone.")) return;
    await deleteProfile(id);
    if (localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY) === String(id)) {
      setActiveProfile(null);
    }
    await refresh();
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50 bg-cover bg-center p-6 dark:bg-slate-950"
      style={{ backgroundImage: `url(${profileBackground})` }}
    >
      <div className="w-full max-w-xl rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur-sm dark:bg-slate-950/80 sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">
            TG
          </div>
          <h1 className="text-2xl font-bold">TypeGuru Pro</h1>
          <p className="text-slate-500 dark:text-slate-400">Who&apos;s practicing today?</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => chooseProfile(p)}
              className="group relative flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div
                className="grid h-14 w-14 place-items-center rounded-full text-xl font-semibold text-white"
                style={{ backgroundColor: p.avatarColor }}
              >
                {p.displayName.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{p.displayName}</span>
              {!p.isDemo && (
                <span
                  onClick={(e) => removeProfile(p.id as number, e)}
                  className="absolute right-2 top-2 hidden rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 group-hover:block"
                >
                  <Trash2 size={14} />
                </span>
              )}
            </button>
          ))}

          <button
            onClick={() => setShowForm(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-4 text-slate-400 hover:border-brand-400 hover:text-brand-500 dark:border-slate-700"
          >
            <Plus size={28} />
            <span className="text-sm font-medium">New Profile</span>
          </button>
        </div>

        {showForm && (
          <NewProfileForm
            onCreated={async (p) => {
              setShowForm(false);
              await refresh();
              chooseProfile(p);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}

function NewProfileForm({
  onCreated,
  onCancel,
}: {
  onCreated: (p: Profile) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [typingLanguage, setTypingLanguage] = useState<"en" | "hi">("en");
  const [interfaceLang, setInterfaceLang] = useState<"en" | "hi">("en");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const profile = await createProfile({
      displayName: name.trim(),
      preferredInterfaceLanguage: interfaceLang,
      preferredTypingLanguage: typingLanguage,
      preferredLayout: typingLanguage === "hi" ? "unicode-inscript" : "en-qwerty",
      skillLevel,
      dailyGoalMinutes: 15,
    });
    onCreated(profile);
  };

  return (
    <form
      onSubmit={submit}
      className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          placeholder="e.g. Priya"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Typing language</label>
          <select
            value={typingLanguage}
            onChange={(e) => setTypingLanguage(e.target.value as "en" | "hi")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Interface language</label>
          <select
            value={interfaceLang}
            onChange={(e) => setInterfaceLang(e.target.value as "en" | "hi")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Skill level</label>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          Cancel
        </button>
        <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Create Profile
        </button>
      </div>
    </form>
  );
}

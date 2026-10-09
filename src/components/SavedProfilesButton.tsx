"use client";

import { useEffect, useState } from "react";
import { listSavedProfiles, removeSavedProfile, SAVED_PROFILES_CHANGED_EVENT, type SavedBirthProfile } from "@/lib/saved-profiles";

export default function SavedProfilesButton() {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<SavedBirthProfile[]>([]);
  const [error, setError] = useState("");

  const refresh = () => {
    try {
      setProfiles(listSavedProfiles());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read saved profiles.");
    }
  };

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(SAVED_PROFILES_CHANGED_EVENT, onUpdate);
    return () => window.removeEventListener(SAVED_PROFILES_CHANGED_EVENT, onUpdate);
  }, []);

  const remove = (id: string) => {
    try {
      removeSavedProfile(id);
      refresh();
      window.dispatchEvent(new Event(SAVED_PROFILES_CHANGED_EVENT));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove this profile.");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { refresh(); setOpen((current) => !current); }}
        aria-expanded={open}
        aria-controls="saved-profiles-panel"
        className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-amber-400 hover:text-amber-100"
      >
        Saved Profiles
      </button>
      {open && (
        <div id="saved-profiles-panel" className="absolute right-0 z-50 mt-2 w-[min(26rem,90vw)] rounded-2xl border border-white/15 bg-[#0b0a1f]/95 p-4 shadow-2xl backdrop-blur-xl">
          <h2 className="font-serif text-xl text-slate-100">Saved profiles</h2>
          <p className="mt-1 text-xs text-slate-400">Available across calculators in this browser.</p>
          {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
          {!error && profiles.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No profiles saved yet. Use “Save profile” on any calculator.</p>
          ) : (
            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {profiles.map((profile) => (
                <li key={profile.id} className="flex items-center gap-2 rounded-xl border border-slate-700/70 px-3 py-2">
                  <div className="min-w-0 flex-1 text-sm">
                    <span className="block truncate font-medium text-slate-100">{profile.name}</span>
                    <span className="block truncate text-xs text-slate-400">{profile.date} · {profile.time} · {profile.place}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(profile.id)}
                    aria-label={`Remove ${profile.name} profile`}
                    className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-200"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 border-t border-white/10 pt-3 text-[11px] text-slate-500">Profiles are stored only on this device and browser.</p>
        </div>
      )}
    </div>
  );
}

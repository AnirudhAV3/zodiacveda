"use client";

import { useEffect, useState } from "react";
import type { BirthDraft } from "@/components/calculators/BirthDetailsFields";
import { listSavedProfiles, saveBirthProfile, SAVED_PROFILES_CHANGED_EVENT, type SavedBirthProfile } from "@/lib/saved-profiles";

export default function BirthProfileControls({ value, onSelect }: { value: BirthDraft; onSelect: (profile: SavedBirthProfile) => void }) {
  const [profiles, setProfiles] = useState<SavedBirthProfile[]>([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"success" | "error">("success");

  const refresh = () => {
    try {
      setProfiles(listSavedProfiles());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load saved profiles.");
      setMessageKind("error");
    }
  };

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(SAVED_PROFILES_CHANGED_EVENT, onUpdate);
    return () => window.removeEventListener(SAVED_PROFILES_CHANGED_EVENT, onUpdate);
  }, []);

  const save = () => {
    setMessage("");
    try {
      const result = saveBirthProfile({
        name: value.name.trim(),
        gender: value.gender,
        date: value.date,
        time: value.time,
        place: value.place.trim(),
        lat: value.lat.trim(),
        lon: value.lon.trim(),
        tz: value.tz.trim(),
      });
      setMessage(result.status === "duplicate" ? "This profile is already saved." : "Profile saved on this device.");
      setMessageKind("success");
      refresh();
      window.dispatchEvent(new Event(SAVED_PROFILES_CHANGED_EVENT));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this profile.");
      setMessageKind("error");
    }
  };

  return (
    <div className="mb-5 rounded-xl border border-slate-700/70 bg-slate-950/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => { refresh(); setOpen((current) => !current); setMessage(""); }}
          aria-expanded={open}
          className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-100"
        >
          Open profiles{profiles.length ? ` (${profiles.length})` : ""}
        </button>
        <button
          type="button"
          onClick={save}
          className="rounded-full border border-amber-400/40 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/10"
        >
          Save profile
        </button>
        {message && <span role="status" className={`basis-full text-xs ${messageKind === "error" ? "text-rose-300" : "text-emerald-300"}`}>{message}</span>}
      </div>
      {open && (
        <div className="mt-3 space-y-1" role="list" aria-label="Saved profiles">
          {profiles.length === 0 ? (
            <p className="py-2 text-xs text-slate-400">No profiles saved in this browser yet.</p>
          ) : profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => { onSelect(profile); setOpen(false); setMessage(`${profile.name}'s details added to this calculator.`); setMessageKind("success"); }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-amber-400/10"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-100">{profile.name}</span>
                <span className="block truncate text-xs text-slate-400">{profile.date} · {profile.time} · {profile.place}</span>
              </span>
              <span className="shrink-0 text-xs text-amber-200">Use</span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-[11px] text-slate-500">Profiles are stored only in this browser on this device.</p>
    </div>
  );
}

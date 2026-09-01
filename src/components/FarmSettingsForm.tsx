"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { farmSettingsSchema, type FarmSettingsInput } from "@/schemas/farm";
import { updateFarmSettings } from "@/server/actions/farm";

export function FarmSettingsForm({ existing }: { existing: FarmSettingsInput }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FarmSettingsInput>({
    resolver: zodResolver(farmSettingsSchema),
    defaultValues: existing,
  });

  async function onSubmit(data: FarmSettingsInput) {
    await updateFarmSettings(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div>
        <label className="text-sm font-medium text-stone-700">Farm name</label>
        <input {...register("name")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-stone-700">Climate zone</label>
        <input {...register("climateZone")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
      </div>
      <div>
        <label className="text-sm font-medium text-stone-700">Hero image URL</label>
        <input {...register("heroImageUrl")} placeholder="https://..." className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        <p className="mt-1 text-xs text-stone-400">Shown at the top of the public &quot;How We Grow&quot; page.</p>
      </div>
      <div>
        <label className="text-sm font-medium text-stone-700">Our story</label>
        <textarea {...register("publicStory")} rows={4} className="mt-1 w-full rounded-lg border border-stone-300 p-3" placeholder="Tell customers who you are and why you farm this way..." />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {isSubmitting ? "Saving..." : saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}

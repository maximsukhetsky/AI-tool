import { Suspense } from "react";

import { SettingsLoader } from "@/components/settings/SettingsLoader";
import { SettingsSkeleton } from "@/components/settings/SettingsSkeleton";

export default function SettingsPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsLoader />
      </Suspense>
    </section>
  );
}

import { CustomPromptList } from "@/components/settings/CustomPromptList";
import { PreferencesForm } from "@/components/settings/PreferencesForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { listCustomPrompts } from "@/lib/db/custom-prompts";
import { getPreferences } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/server";

export async function SettingsLoader() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [preferences, prompts] = await Promise.all([
    getPreferences(supabase, user.id),
    listCustomPrompts(supabase),
  ]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Editor defaults</CardTitle>
          <CardDescription>Prefilled every time you open the editor.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm initialPreferences={preferences} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Custom instructions</CardTitle>
          <CardDescription>
            Extra instructions for a mode. Pick one in the editor to refine the style, format or length of the
            result.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomPromptList prompts={prompts} />
        </CardContent>
      </Card>
    </>
  );
}

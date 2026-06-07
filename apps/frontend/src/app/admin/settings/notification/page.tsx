import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { getCategoryByRoute, SETTINGS_FIELDS } from "@/components/admin/settings/settings-schema";

const category = getCategoryByRoute("notification");

export default function SettingsPage() {
  if (!category) return null;
  return <SettingsForm category={category} fields={SETTINGS_FIELDS[category.key] || []} />;
}

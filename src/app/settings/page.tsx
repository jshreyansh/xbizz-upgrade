import { redirect } from "next/navigation";

/** /settings has no content of its own — the first tab is the landing place. */
export default function SettingsPage() {
  redirect("/settings/workspace");
}

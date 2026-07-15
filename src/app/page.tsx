import { redirect } from "next/navigation";
import { getSiteSettings, publicDefaultLocale } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const settings = await getSiteSettings().catch(() => null);
  redirect(`/${publicDefaultLocale(settings?.defaultLocale)}`);
}

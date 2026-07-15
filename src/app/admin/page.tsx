import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminLogin } from "@/components/admin/admin-login";
import { hasAdminSession, isAdminEnabled } from "@/lib/admin/auth";
import { loadAdminDashboard } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Control Room — QULTURE",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const enabled = isAdminEnabled();
  const authenticated = enabled ? await hasAdminSession() : false;

  if (!authenticated) {
    return <AdminLogin disabled={!enabled} />;
  }

  const data = await loadAdminDashboard();
  return <AdminDashboard data={data} />;
}

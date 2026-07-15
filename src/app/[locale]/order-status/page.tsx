import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderStatusPage } from "@/components/commerce/order-status-page";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Order status",
  referrer: "no-referrer",
  robots: { index: false, follow: false, nocache: true },
};

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ order?: string }> }) { const [{ locale }, query] = await Promise.all([params, searchParams]); if (!isLocale(locale)) notFound(); return <OrderStatusPage initialOrder={query.order} locale={locale} />; }

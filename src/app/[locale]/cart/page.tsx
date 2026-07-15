import { notFound } from "next/navigation";
import { CartPage } from "@/components/commerce/cart-page";
import { isLocale } from "@/lib/i18n";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <CartPage locale={locale} />; }


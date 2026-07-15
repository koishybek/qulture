import { hasAdminSession } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  let text = value == null ? "" : value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function csv(rows: unknown[][]) {
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export async function GET(request: Request) {
  if (!await hasAdminSession()) return jsonError("unauthorized", 401);
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type === "waitlist") {
    const product = url.searchParams.get("product")?.trim();
    const color = url.searchParams.get("color")?.trim();
    const size = url.searchParams.get("size")?.trim();
    const city = url.searchParams.get("city")?.trim();
    const leads = await db.waitlistLead.findMany({
      where: {
        ...(product ? { product: { slug: { contains: product } } } : {}),
        ...(color ? { color: { contains: color } } : {}),
        ...(size ? { size: { contains: size } } : {}),
        ...(city ? { city: { contains: city } } : {}),
      },
      include: { product: { select: { slug: true } }, variant: { select: { sku: true } } },
      orderBy: { createdAt: "desc" },
    });
    const rows: unknown[][] = [["createdAt", "name", "email", "phone", "city", "product", "variant", "color", "size", "purpose", "serviceConsent", "restockConsent", "marketingConsent", "policyVersion", "language", "source", "submissions"]];
    for (const lead of leads) rows.push([lead.createdAt, lead.name, lead.email, lead.phone, lead.city, lead.product?.slug, lead.variant?.sku, lead.color, lead.size, lead.contactPurpose, lead.serviceConsent, lead.restockConsent, lead.marketingConsent, lead.policyVersion, lead.language, lead.source, lead.submissionCount]);
    return new Response(csv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=qulture-waitlist.csv", "Cache-Control": "no-store" } });
  }

  if (type === "handoff") {
    const tickets = await db.handoffTicket.findMany({ include: { product: { select: { slug: true } }, selectedVariant: { select: { sku: true } } }, orderBy: { createdAt: "desc" } });
    const rows: unknown[][] = [["createdAt", "status", "reason", "question", "summary", "product", "variant", "confidence", "contactName", "contactEmail", "contactPhone", "contactConsent", "policyVersion", "conversationId"]];
    for (const ticket of tickets) rows.push([ticket.createdAt, ticket.status, ticket.reason, ticket.userQuestion, ticket.summary, ticket.product?.slug, ticket.selectedVariant?.sku, ticket.aiConfidence, ticket.contactName, ticket.contactEmail, ticket.contactPhone, ticket.contactConsent, ticket.policyVersion, ticket.conversationId]);
    return new Response(csv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=qulture-ai-handoffs.csv", "Cache-Control": "no-store" } });
  }

  return jsonError("unknown_export", 400);
}

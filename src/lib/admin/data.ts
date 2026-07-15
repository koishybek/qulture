import { db } from "@/lib/db";

export async function loadAdminDashboard() {
  const [
    settings,
    products,
    bundles,
    collections,
    profiles,
    knowledge,
    journal,
    translations,
    contentPages,
    waitlist,
    handoffs,
    activeConversations,
    orders,
    audit,
  ] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "default" } }),
    db.product.findMany({ include: { variants: { orderBy: [{ colorCode: "asc" }, { sizeLabel: "asc" }] }, collections: true }, orderBy: { updatedAt: "desc" } }),
    db.bundle.findMany({ include: { components: { include: { product: true }, orderBy: { sortOrder: "asc" } } }, orderBy: { updatedAt: "desc" } }),
    db.collection.findMany({ include: { _count: { select: { products: true } } }, orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }] }),
    db.sizeProfile.findMany({ include: { rules: { orderBy: { version: "desc" } } }, orderBy: { updatedAt: "desc" } }),
    db.knowledgeItem.findMany({ orderBy: { updatedAt: "desc" }, take: 100 }),
    db.journalArticle.findMany({ orderBy: { updatedAt: "desc" }, take: 100 }),
    db.translation.findMany({ orderBy: [{ namespace: "asc" }, { key: "asc" }, { locale: "asc" }], take: 500 }),
    db.contentPage.findMany({ orderBy: [{ slug: "asc" }, { locale: "asc" }], take: 200 }),
    db.waitlistLead.findMany({ include: { product: { select: { slug: true, nameEn: true, nameRu: true } }, variant: { select: { sku: true } } }, orderBy: { createdAt: "desc" }, take: 250 }),
    db.handoffTicket.findMany({ include: { product: { select: { slug: true, nameEn: true, nameRu: true } } }, orderBy: { createdAt: "desc" }, take: 250 }),
    db.conversation.findMany({
      where: { status: "ACTIVE", handoffs: { none: {} } },
      select: {
        language: true,
        currentPage: true,
        messages: {
          where: { role: { in: ["USER", "ASSISTANT"] } },
          select: { id: true, content: true, createdAt: true, conversationId: true, role: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    db.order.findMany({ include: { _count: { select: { items: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  const unanswered = activeConversations.flatMap((conversation) => {
    const latest = conversation.messages[0];
    if (!latest || latest.role !== "USER") return [];
    return [{
      id: latest.id,
      content: latest.content,
      createdAt: latest.createdAt,
      conversationId: latest.conversationId,
      conversation: { language: conversation.language, currentPage: conversation.currentPage },
    }];
  });

  return {
    settings,
    products,
    bundles,
    collections,
    profiles,
    knowledge,
    journal,
    translations,
    contentPages,
    waitlist,
    handoffs,
    unanswered,
    orders,
    audit,
  };
}

export type AdminDashboardData = Awaited<ReturnType<typeof loadAdminDashboard>>;

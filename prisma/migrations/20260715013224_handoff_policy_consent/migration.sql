/*
  Warnings:

  - Existing tickets are marked as having no recorded contact consent and are backfilled with the policy version active before this migration.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HandoffTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idempotencyKey" TEXT,
    "conversationId" TEXT,
    "reason" TEXT NOT NULL,
    "userQuestion" TEXT NOT NULL,
    "productId" TEXT,
    "selectedVariantId" TEXT,
    "aiConfidence" TEXT,
    "summary" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactConsent" BOOLEAN NOT NULL DEFAULT false,
    "policyVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    CONSTRAINT "HandoffTicket_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HandoffTicket_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HandoffTicket_selectedVariantId_fkey" FOREIGN KEY ("selectedVariantId") REFERENCES "Variant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_HandoffTicket" ("aiConfidence", "contactConsent", "contactEmail", "contactName", "contactPhone", "conversationId", "createdAt", "id", "idempotencyKey", "policyVersion", "productId", "reason", "resolvedAt", "selectedVariantId", "status", "summary", "updatedAt", "userQuestion") SELECT "aiConfidence", false, "contactEmail", "contactName", "contactPhone", "conversationId", "createdAt", "id", "idempotencyKey", '2026-07-draft', "productId", "reason", "resolvedAt", "selectedVariantId", "status", "summary", "updatedAt", "userQuestion" FROM "HandoffTicket";
DROP TABLE "HandoffTicket";
ALTER TABLE "new_HandoffTicket" RENAME TO "HandoffTicket";
CREATE UNIQUE INDEX "HandoffTicket_idempotencyKey_key" ON "HandoffTicket"("idempotencyKey");
CREATE INDEX "HandoffTicket_status_createdAt_idx" ON "HandoffTicket"("status", "createdAt");
CREATE INDEX "HandoffTicket_conversationId_idx" ON "HandoffTicket"("conversationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

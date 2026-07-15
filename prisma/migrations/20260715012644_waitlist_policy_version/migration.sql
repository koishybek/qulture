/*
  Warnings:

  - Existing leads are backfilled with the policy version that was active before this migration.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WaitlistLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "variantId" TEXT,
    "color" TEXT,
    "size" TEXT,
    "city" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "contactPurpose" TEXT NOT NULL,
    "serviceConsent" BOOLEAN NOT NULL,
    "restockConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "policyVersion" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "dedupKey" TEXT NOT NULL,
    "submissionCount" INTEGER NOT NULL DEFAULT 1,
    "lastSubmittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WaitlistLead_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WaitlistLead_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WaitlistLead" ("city", "color", "contactPurpose", "createdAt", "dedupKey", "email", "id", "language", "lastSubmittedAt", "marketingConsent", "name", "phone", "policyVersion", "productId", "restockConsent", "serviceConsent", "size", "source", "submissionCount", "updatedAt", "variantId") SELECT "city", "color", "contactPurpose", "createdAt", "dedupKey", "email", "id", "language", "lastSubmittedAt", "marketingConsent", "name", "phone", '2026-07-draft', "productId", "restockConsent", "serviceConsent", "size", "source", "submissionCount", "updatedAt", "variantId" FROM "WaitlistLead";
DROP TABLE "WaitlistLead";
ALTER TABLE "new_WaitlistLead" RENAME TO "WaitlistLead";
CREATE UNIQUE INDEX "WaitlistLead_dedupKey_key" ON "WaitlistLead"("dedupKey");
CREATE INDEX "WaitlistLead_productId_color_size_city_idx" ON "WaitlistLead"("productId", "color", "size", "city");
CREATE INDEX "WaitlistLead_createdAt_idx" ON "WaitlistLead"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

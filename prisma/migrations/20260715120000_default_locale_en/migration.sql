-- Make English the schema-level default for fresh QULTURE installations.
-- Existing settings rows are deliberately preserved; the seed/updater controls
-- the active default for an already-initialised environment.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "siteMode" TEXT NOT NULL DEFAULT 'PRE_LAUNCH',
    "demoMode" BOOLEAN NOT NULL DEFAULT false,
    "catalogVisible" BOOLEAN NOT NULL DEFAULT false,
    "controlledPreview" BOOLEAN NOT NULL DEFAULT true,
    "defaultLocale" TEXT NOT NULL DEFAULT 'EN',
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    "sectionVisibility" JSONB,
    "homeContent" JSONB,
    "brandAssets" JSONB,
    "paletteTokens" JSONB,
    "typographySettings" JSONB,
    "legalLinks" JSONB,
    "aiTeaserEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiTeaserDelayMs" INTEGER NOT NULL DEFAULT 6500,
    "aiTeaserFrequency" TEXT NOT NULL DEFAULT 'once_per_session',
    "aiQuickActions" JSONB,
    "consentPolicyVersion" TEXT NOT NULL DEFAULT '2026-07-draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_SiteSettings" (
    "aiQuickActions", "aiTeaserDelayMs", "aiTeaserEnabled", "aiTeaserFrequency",
    "brandAssets", "catalogVisible", "consentPolicyVersion", "controlledPreview",
    "createdAt", "currency", "defaultLocale", "demoMode", "homeContent", "id",
    "legalLinks", "paletteTokens", "sectionVisibility", "siteMode",
    "typographySettings", "updatedAt"
)
SELECT
    "aiQuickActions", "aiTeaserDelayMs", "aiTeaserEnabled", "aiTeaserFrequency",
    "brandAssets", "catalogVisible", "consentPolicyVersion", "controlledPreview",
    "createdAt", "currency", "defaultLocale", "demoMode", "homeContent", "id",
    "legalLinks", "paletteTokens", "sectionVisibility", "siteMode",
    "typographySettings", "updatedAt"
FROM "SiteSettings";

DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

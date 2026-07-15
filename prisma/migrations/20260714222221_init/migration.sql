-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "siteMode" TEXT NOT NULL DEFAULT 'PRE_LAUNCH',
    "demoMode" BOOLEAN NOT NULL DEFAULT false,
    "catalogVisible" BOOLEAN NOT NULL DEFAULT false,
    "controlledPreview" BOOLEAN NOT NULL DEFAULT true,
    "defaultLocale" TEXT NOT NULL DEFAULT 'RU',
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

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameKz" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionRu" TEXT NOT NULL,
    "descriptionKz" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "category" TEXT NOT NULL,
    "priceMinor" INTEGER,
    "comparePriceMinor" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    "isPreorder" BOOLEAN NOT NULL DEFAULT false,
    "preorderEta" DATETIME,
    "media" JSONB,
    "technologyTags" JSONB,
    "careRu" TEXT,
    "careKz" TEXT,
    "careEn" TEXT,
    "fitProfileId" TEXT,
    "seoTitleRu" TEXT,
    "seoTitleKz" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionRu" TEXT,
    "seoDescriptionKz" TEXT,
    "seoDescriptionEn" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_fitProfileId_fkey" FOREIGN KEY ("fitProfileId") REFERENCES "SizeProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "colorNameRu" TEXT NOT NULL,
    "colorNameKz" TEXT NOT NULL,
    "colorNameEn" TEXT,
    "sizeLabel" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "incomingEta" DATETIME,
    "leadTimeDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priceMinor" INTEGER,
    "comparePriceMinor" INTEGER,
    "media" JSONB,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameKz" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionRu" TEXT,
    "descriptionKz" TEXT,
    "descriptionEn" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "heroMedia" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameKz" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionRu" TEXT,
    "descriptionKz" TEXT,
    "descriptionEn" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "discountType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    "media" JSONB,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BundleComponent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bundleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "requiredQuantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "allowSeparatePurchase" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "BundleComponent_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BundleComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SizeProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fitType" TEXT NOT NULL,
    "sizeChart" JSONB,
    "garmentMeasurements" JSONB,
    "garmentMeasurementsApproved" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SizeRuleVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sizeProfileId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rules" JSONB NOT NULL,
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "effectiveAt" DATETIME,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SizeRuleVersion_sizeProfileId_fkey" FOREIGN KEY ("sizeProfileId") REFERENCES "SizeProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "language" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceOwner" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reviewDate" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JournalArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleKz" TEXT NOT NULL,
    "titleEn" TEXT,
    "excerptRu" TEXT NOT NULL,
    "excerptKz" TEXT NOT NULL,
    "excerptEn" TEXT,
    "contentRu" TEXT NOT NULL,
    "contentKz" TEXT NOT NULL,
    "contentEn" TEXT,
    "coverImage" TEXT,
    "author" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "seoTitleRu" TEXT,
    "seoTitleKz" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionRu" TEXT,
    "seoDescriptionKz" TEXT,
    "seoDescriptionEn" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WaitlistLead" (
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

-- CreateTable
CREATE TABLE "HandoffTicket" (
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
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    CONSTRAINT "HandoffTicket_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HandoffTicket_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HandoffTicket_selectedVariantId_fkey" FOREIGN KEY ("selectedVariantId") REFERENCES "Variant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPage" TEXT,
    "entryPoint" TEXT,
    "productId" TEXT,
    "context" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastMessageAt" DATETIME,
    CONSTRAINT "Conversation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "correlationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "sessionId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'RU',
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceMinor" INTEGER NOT NULL,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "bundleId" TEXT,
    "bundleGroupId" TEXT,
    "componentRole" TEXT,
    "priceSnapshotAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CartItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "statusTokenHash" TEXT,
    "cartId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "requestFingerprint" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "fiscalStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    "subtotalMinor" INTEGER NOT NULL,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "deliveryMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "customerComment" TEXT,
    "paymentMethod" TEXT,
    "paymentProvider" TEXT,
    "paymentReference" TEXT,
    "language" TEXT NOT NULL DEFAULT 'RU',
    "consentPolicyVersion" TEXT NOT NULL,
    "termsAcceptedAt" DATETIME NOT NULL,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "confirmedAt" DATETIME,
    "fulfilledAt" DATETIME,
    "cancelledAt" DATETIME,
    CONSTRAINT "Order_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "bundleId" TEXT,
    "bundleGroupId" TEXT,
    "componentRole" TEXT,
    "productName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceMinor" INTEGER NOT NULL,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "necessary" BOOLEAN NOT NULL DEFAULT true,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "policyVersion" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "consentCategory" TEXT NOT NULL,
    "sessionId" TEXT,
    "anonymousId" TEXT,
    "language" TEXT,
    "correlationId" TEXT,
    "payload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContentPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "correlationId" TEXT,
    "ipHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "resourceId" TEXT,
    "response" JSONB,
    "errorCode" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_CollectionToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CollectionToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CollectionToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_status_isDemo_idx" ON "Product"("status", "isDemo");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_sku_key" ON "Variant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_barcode_key" ON "Variant"("barcode");

-- CreateIndex
CREATE INDEX "Variant_productId_active_idx" ON "Variant"("productId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_productId_colorCode_sizeLabel_key" ON "Variant"("productId", "colorCode", "sizeLabel");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_status_isDemo_sortOrder_idx" ON "Collection"("status", "isDemo", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_slug_key" ON "Bundle"("slug");

-- CreateIndex
CREATE INDEX "Bundle_status_isDemo_idx" ON "Bundle"("status", "isDemo");

-- CreateIndex
CREATE INDEX "BundleComponent_bundleId_sortOrder_idx" ON "BundleComponent"("bundleId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BundleComponent_bundleId_productId_role_key" ON "BundleComponent"("bundleId", "productId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "SizeProfile_slug_key" ON "SizeProfile"("slug");

-- CreateIndex
CREATE INDEX "SizeRuleVersion_sizeProfileId_status_idx" ON "SizeRuleVersion"("sizeProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SizeRuleVersion_sizeProfileId_version_key" ON "SizeRuleVersion"("sizeProfileId", "version");

-- CreateIndex
CREATE INDEX "KnowledgeItem_language_scope_status_isDemo_idx" ON "KnowledgeItem"("language", "scope", "status", "isDemo");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeItem_sourceId_language_version_key" ON "KnowledgeItem"("sourceId", "language", "version");

-- CreateIndex
CREATE UNIQUE INDEX "JournalArticle_slug_key" ON "JournalArticle"("slug");

-- CreateIndex
CREATE INDEX "JournalArticle_status_isDemo_publishedAt_idx" ON "JournalArticle"("status", "isDemo", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistLead_dedupKey_key" ON "WaitlistLead"("dedupKey");

-- CreateIndex
CREATE INDEX "WaitlistLead_productId_color_size_city_idx" ON "WaitlistLead"("productId", "color", "size", "city");

-- CreateIndex
CREATE INDEX "WaitlistLead_createdAt_idx" ON "WaitlistLead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HandoffTicket_idempotencyKey_key" ON "HandoffTicket"("idempotencyKey");

-- CreateIndex
CREATE INDEX "HandoffTicket_status_createdAt_idx" ON "HandoffTicket"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HandoffTicket_conversationId_idx" ON "HandoffTicket"("conversationId");

-- CreateIndex
CREATE INDEX "Conversation_sessionId_status_idx" ON "Conversation"("sessionId", "status");

-- CreateIndex
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_correlationId_idx" ON "Message"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_token_key" ON "Cart"("token");

-- CreateIndex
CREATE INDEX "Cart_sessionId_status_idx" ON "Cart"("sessionId", "status");

-- CreateIndex
CREATE INDEX "Cart_status_expiresAt_idx" ON "Cart"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_bundleGroupId_idx" ON "CartItem"("bundleGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Order_statusTokenHash_key" ON "Order"("statusTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Order_cartId_key" ON "Order"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");

-- CreateIndex
CREATE INDEX "Order_customerPhone_idx" ON "Order"("customerPhone");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_bundleGroupId_idx" ON "OrderItem"("bundleGroupId");

-- CreateIndex
CREATE INDEX "ConsentRecord_subjectId_createdAt_idx" ON "ConsentRecord"("subjectId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_createdAt_idx" ON "AnalyticsEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "Translation_locale_namespace_status_idx" ON "Translation"("locale", "namespace", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_namespace_key_locale_key" ON "Translation"("namespace", "key", "locale");

-- CreateIndex
CREATE INDEX "ContentPage_status_locale_idx" ON "ContentPage"("status", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPage_slug_locale_key" ON "ContentPage"("slug", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_adminUserId_createdAt_idx" ON "AuditLog"("adminUserId", "createdAt");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_status_expiresAt_idx" ON "IdempotencyRecord"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_scope_key_key" ON "IdempotencyRecord"("scope", "key");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToProduct_AB_unique" ON "_CollectionToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToProduct_B_index" ON "_CollectionToProduct"("B");

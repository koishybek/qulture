export type SiteModeValue = "PRE_LAUNCH" | "COMMERCE";

export interface SiteModeSettings {
  siteMode: SiteModeValue;
  demoMode?: boolean;
  catalogVisible?: boolean;
  controlledPreview?: boolean;
}

export interface SiteCapabilities {
  mode: SiteModeValue;
  canBrowseCatalog: boolean;
  canCheckout: boolean;
  canShowPrices: boolean;
  controlledPreview: boolean;
  demoMode: boolean;
}

export function getSiteCapabilities(settings: SiteModeSettings): SiteCapabilities {
  const commerce = settings.siteMode === "COMMERCE";
  const controlledPreview = !commerce && Boolean(settings.controlledPreview);
  const canBrowseCatalog = commerce
    ? settings.catalogVisible !== false
    : Boolean(settings.catalogVisible) && controlledPreview;

  return {
    mode: settings.siteMode,
    canBrowseCatalog,
    canCheckout: commerce && canBrowseCatalog,
    canShowPrices: commerce && canBrowseCatalog,
    controlledPreview,
    demoMode: Boolean(settings.demoMode),
  };
}

export interface ProductVisibilityInput {
  status: "DRAFT" | "PREVIEW" | "COMING_SOON" | "ACTIVE" | "ARCHIVED";
  isDemo: boolean;
  priceMinor?: number | null;
}

export interface ProductVisibilityContext {
  allowDemoRoute?: boolean;
}

export function canExposeProduct(
  product: ProductVisibilityInput,
  settings: SiteModeSettings,
  context: ProductVisibilityContext = {},
): boolean {
  const capabilities = getSiteCapabilities(settings);

  if (product.isDemo) {
    return capabilities.demoMode && context.allowDemoRoute === true && product.status !== "ARCHIVED";
  }

  if (!capabilities.canBrowseCatalog) {
    return false;
  }

  if (capabilities.mode === "COMMERCE") {
    return product.status === "ACTIVE";
  }

  return product.status === "PREVIEW" || product.status === "COMING_SOON";
}

export function canExposeProductPrice(
  product: ProductVisibilityInput,
  settings: SiteModeSettings,
  context: ProductVisibilityContext = {},
): boolean {
  if (product.priceMinor == null || !canExposeProduct(product, settings, context)) {
    return false;
  }

  if (product.isDemo) {
    return Boolean(settings.demoMode) && context.allowDemoRoute === true;
  }

  return getSiteCapabilities(settings).canShowPrices;
}

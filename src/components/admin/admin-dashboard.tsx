"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import type { AdminDashboardData } from "@/lib/admin/data";

type AdminSection =
  | "settings"
  | "catalog"
  | "sizing"
  | "knowledge"
  | "content"
  | "operations";

type Payload = Record<string, unknown> & { action: string };
type SubmitForm = (
  event: FormEvent<HTMLFormElement>,
  build: (form: FormData) => Payload,
  resetOnSuccess?: boolean,
) => void;

const sections: Array<{ id: AdminSection; label: string }> = [
  { id: "settings", label: "Site settings" },
  { id: "catalog", label: "Catalog" },
  { id: "sizing", label: "Sizing" },
  { id: "knowledge", label: "Knowledge" },
  { id: "content", label: "Content" },
  { id: "operations", label: "Operations" },
];

const productStatuses = ["DRAFT", "PREVIEW", "COMING_SOON", "ACTIVE", "ARCHIVED"];
const publishStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const knowledgeStatuses = ["DRAFT", "APPROVED", "PUBLISHED", "ARCHIVED"];
const ruleStatuses = ["DRAFT", "APPROVED", "ARCHIVED"];
const locales = ["EN", "RU", "KZ"];
const handoffStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function text(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

function optionalText(form: FormData, name: string) {
  return text(form, name) || null;
}

function integer(form: FormData, name: string) {
  return Number.parseInt(text(form, name), 10);
}

function nullableInteger(form: FormData, name: string) {
  const value = text(form, name);
  return value === "" ? null : Number.parseInt(value, 10);
}

function checked(form: FormData, name: string) {
  return form.has(name);
}

function optionalId(form: FormData) {
  const id = text(form, "id");
  return id ? { id } : {};
}

function isoOrNull(form: FormData, name: string) {
  const value = text(form, name);
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function inputDate(value: unknown) {
  if (!value) return "";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.valueOf())) return "";
  const local = new Date(date.valueOf() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function stamp(value: unknown) {
  if (!value) return "";
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.valueOf()) ? String(value) : date.toISOString();
}

function formatDate(value: unknown) {
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.valueOf())
    ? "—"
    : `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 16)} UTC`;
}

function json(value: unknown, fallback: unknown = {}) {
  return JSON.stringify(value ?? fallback, null, 2);
}

function shortId(value: string) {
  return value.length > 14 ? `${value.slice(0, 7)}…${value.slice(-5)}` : value;
}

function englishProductName(
  product: { nameEn?: string | null; nameRu?: string | null } | null | undefined,
  fallback = "Untitled product",
) {
  return product?.nameEn?.trim() || product?.nameRu?.trim() || fallback;
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  readOnly,
  min,
  max,
  step,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <label className="q-field">
      <span>{label}</span>
      <input
        className="q-input"
        defaultValue={defaultValue ?? ""}
        max={max}
        min={min}
        name={name}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        step={step}
        type={type}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  required,
  code,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
  code?: boolean;
}) {
  return (
    <label className="q-field admin-field--wide">
      <span>{label}</span>
      <textarea
        className={`q-textarea${code ? " admin-code" : ""}`}
        defaultValue={defaultValue ?? ""}
        name={name}
        required={required}
        rows={rows}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: Array<string | { value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <label className="q-field">
      <span>{label}</span>
      <select className="q-select" defaultValue={defaultValue ?? ""} name={name} required={required}>
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={item.value || "empty"} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="q-checkbox admin-checkbox">
      <input defaultChecked={defaultChecked} name={name} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

function Editor({
  title,
  meta,
  children,
  open = false,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="admin-editor" open={open || undefined}>
      <summary>
        <span>{title}</span>
        {meta ? <small>{meta}</small> : null}
      </summary>
      <div className="admin-editor__body">{children}</div>
    </details>
  );
}

function SaveButton({ busy, label = "Save" }: { busy: boolean; label?: string }) {
  return (
    <button className="q-button q-button--solid admin-save" disabled={busy} type="submit">
      {busy ? "Saving…" : `${label} →`}
    </button>
  );
}

function FormActions({ busy, note, label }: { busy: boolean; note?: string; label?: string }) {
  return (
    <div className="admin-form-actions">
      {note ? <p>{note}</p> : <span />}
      <SaveButton busy={busy} label={label} />
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="admin-section-header">
      <p className="q-meta">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

function SettingsPanel({
  data,
  submit,
  busy,
}: {
  data: AdminDashboardData;
  submit: SubmitForm;
  busy: boolean;
}) {
  const settings = data.settings;

  return (
    <section aria-labelledby="admin-settings-title" className="admin-panel">
      <SectionHeader
        description="Public mode, controlled preview, AI teaser and every structured homepage token stored in SiteSettings."
        eyebrow="01 / Foundation"
        title="Site settings"
      />
      <form
        className="admin-form admin-settings-form"
        key={`settings:${stamp(settings?.updatedAt)}`}
        onSubmit={(event) =>
          submit(event, (form) => ({
            action: "settings.save",
            siteMode: text(form, "siteMode"),
            demoMode: checked(form, "demoMode"),
            catalogVisible: checked(form, "catalogVisible"),
            controlledPreview: checked(form, "controlledPreview"),
            defaultLocale: text(form, "defaultLocale"),
            aiTeaserEnabled: checked(form, "aiTeaserEnabled"),
            aiTeaserDelayMs: integer(form, "aiTeaserDelayMs"),
            aiTeaserFrequency: text(form, "aiTeaserFrequency"),
            consentPolicyVersion: text(form, "consentPolicyVersion"),
            sectionVisibility: text(form, "sectionVisibility"),
            homeContent: text(form, "homeContent"),
            brandAssets: text(form, "brandAssets"),
            paletteTokens: text(form, "paletteTokens"),
            typographySettings: text(form, "typographySettings"),
            legalLinks: text(form, "legalLinks"),
            aiQuickActions: text(form, "aiQuickActions"),
          }))
        }
      >
        <div className="admin-form-grid">
          <SelectField
            defaultValue={settings?.siteMode ?? "PRE_LAUNCH"}
            label="Public site mode"
            name="siteMode"
            options={["PRE_LAUNCH", "COMMERCE"]}
            required
          />
          <SelectField
            defaultValue={settings?.defaultLocale ?? "EN"}
            label="Default public locale"
            name="defaultLocale"
            options={locales}
            required
          />
          <Field
            defaultValue={settings?.aiTeaserDelayMs ?? 6500}
            label="AI teaser delay, ms"
            max={60000}
            min={0}
            name="aiTeaserDelayMs"
            required
            type="number"
          />
          <Field
            defaultValue={settings?.aiTeaserFrequency ?? "once_per_session"}
            label="AI teaser frequency"
            name="aiTeaserFrequency"
            required
          />
          <Field
            defaultValue={settings?.consentPolicyVersion ?? "2026-07-draft"}
            label="Consent policy version"
            name="consentPolicyVersion"
            required
          />
        </div>
        <div className="admin-check-grid">
          <Checkbox defaultChecked={settings?.demoMode ?? false} label="Local demo data enabled (ignored in production)" name="demoMode" />
          <Checkbox defaultChecked={settings?.catalogVisible ?? false} label="Catalog publicly visible" name="catalogVisible" />
          <Checkbox defaultChecked={settings?.controlledPreview ?? true} label="Controlled preview" name="controlledPreview" />
          <Checkbox defaultChecked={settings?.aiTeaserEnabled ?? true} label="AI teaser enabled" name="aiTeaserEnabled" />
        </div>
        <div className="admin-readonly-strip" aria-label="System defaults">
          <span>Currency <strong>{settings?.currency ?? "KZT"}</strong></span>
          <span>ID <strong>{settings?.id ?? "default"}</strong></span>
        </div>
        <div className="admin-json-grid">
          <TextArea code defaultValue={json(settings?.sectionVisibility)} label="Section visibility / JSON" name="sectionVisibility" rows={10} required />
          <TextArea code defaultValue={json(settings?.homeContent)} label="Home content / JSON" name="homeContent" rows={10} required />
          <TextArea code defaultValue={json(settings?.brandAssets)} label="Brand assets / JSON" name="brandAssets" rows={8} required />
          <TextArea code defaultValue={json(settings?.paletteTokens)} label="Palette tokens / JSON" name="paletteTokens" rows={8} required />
          <TextArea code defaultValue={json(settings?.typographySettings)} label="Typography settings / JSON" name="typographySettings" rows={8} required />
          <TextArea code defaultValue={json(settings?.legalLinks)} label="Legal links / JSON" name="legalLinks" rows={8} required />
          <TextArea code defaultValue={json(settings?.aiQuickActions, [])} label="AI quick actions / JSON" name="aiQuickActions" rows={8} required />
        </div>
        <FormActions busy={busy} note="Invalid JSON is rejected server-side; nothing is partially saved." />
      </form>
    </section>
  );
}

type ProductRecord = AdminDashboardData["products"][number];
type VariantRecord = ProductRecord["variants"][number];

function ProductForm({ product, submit, busy }: { product?: ProductRecord; submit: SubmitForm; busy: boolean }) {
  return (
    <form
      className="admin-form"
      key={product ? `product:${product.id}:${stamp(product.updatedAt)}` : "product:new"}
      onSubmit={(event) =>
        submit(
          event,
          (form) => ({
            action: "product.save",
            ...optionalId(form),
            slug: text(form, "slug"),
            nameRu: text(form, "nameRu"),
            nameKz: text(form, "nameKz"),
            nameEn: optionalText(form, "nameEn"),
            descriptionRu: text(form, "descriptionRu"),
            descriptionKz: text(form, "descriptionKz"),
            descriptionEn: optionalText(form, "descriptionEn"),
            category: text(form, "category"),
            status: text(form, "status"),
            priceMinor: nullableInteger(form, "priceMinor"),
            comparePriceMinor: nullableInteger(form, "comparePriceMinor"),
            isPreorder: checked(form, "isPreorder"),
            preorderEta: isoOrNull(form, "preorderEta"),
            isDemo: checked(form, "isDemo"),
            media: text(form, "media"),
            technologyTags: text(form, "technologyTags"),
            careRu: optionalText(form, "careRu"),
            careKz: optionalText(form, "careKz"),
            careEn: optionalText(form, "careEn"),
          }),
          !product,
        )
      }
    >
      {product ? <input name="id" type="hidden" value={product.id} /> : null}
      <div className="admin-form-grid">
        <Field defaultValue={product?.slug} label="Slug" name="slug" placeholder="city-shell" required />
        <Field defaultValue={product?.category} label="Category" name="category" required />
        <SelectField defaultValue={product?.status ?? "DRAFT"} label="Lifecycle" name="status" options={productStatuses} required />
        <Field defaultValue={product?.priceMinor} label="Price, minor KZT" min={0} name="priceMinor" type="number" />
        <Field defaultValue={product?.comparePriceMinor} label="Compare price, minor KZT" min={0} name="comparePriceMinor" type="number" />
        <Field defaultValue={inputDate(product?.preorderEta)} label="Preorder ETA" name="preorderEta" type="datetime-local" />
        <Field defaultValue={product?.nameEn} label="Name / EN" name="nameEn" />
        <Field defaultValue={product?.nameRu} label="Name / RU" name="nameRu" required />
        <Field defaultValue={product?.nameKz} label="Name / KZ" name="nameKz" required />
      </div>
      <div className="admin-check-grid">
        <Checkbox defaultChecked={product?.isPreorder ?? false} label="Preorder" name="isPreorder" />
        <Checkbox defaultChecked={product?.isDemo ?? false} label="Demo-only record" name="isDemo" />
      </div>
      <div className="admin-form-grid admin-form-grid--copy">
        <TextArea defaultValue={product?.descriptionEn} label="Description / EN" name="descriptionEn" rows={6} />
        <TextArea defaultValue={product?.descriptionRu} label="Description / RU" name="descriptionRu" required rows={6} />
        <TextArea defaultValue={product?.descriptionKz} label="Description / KZ" name="descriptionKz" required rows={6} />
        <TextArea defaultValue={product?.careEn} label="Care / EN" name="careEn" rows={4} />
        <TextArea defaultValue={product?.careRu} label="Care / RU" name="careRu" rows={4} />
        <TextArea defaultValue={product?.careKz} label="Care / KZ" name="careKz" rows={4} />
        <TextArea code defaultValue={json(product?.media, [])} label="Media / JSON" name="media" required rows={6} />
        <TextArea code defaultValue={json(product?.technologyTags, [])} label="Technology tags / JSON" name="technologyTags" required rows={6} />
      </div>
      <FormActions busy={busy} label={product ? "Save product" : "Create product"} />
    </form>
  );
}

function VariantForm({
  productId,
  variant,
  submit,
  busy,
}: {
  productId: string;
  variant?: VariantRecord;
  submit: SubmitForm;
  busy: boolean;
}) {
  return (
    <form
      className="admin-form admin-subform"
      key={variant ? `variant:${variant.id}:${stamp(variant.updatedAt)}` : `variant:new:${productId}`}
      onSubmit={(event) =>
        submit(
          event,
          (form) => ({
            action: "variant.save",
            ...optionalId(form),
            productId: text(form, "productId"),
            colorCode: text(form, "colorCode"),
            colorNameRu: text(form, "colorNameRu"),
            colorNameKz: text(form, "colorNameKz"),
            colorNameEn: optionalText(form, "colorNameEn"),
            sizeLabel: text(form, "sizeLabel"),
            sku: text(form, "sku"),
            stock: integer(form, "stock"),
            reservedStock: integer(form, "reservedStock"),
            incomingEta: isoOrNull(form, "incomingEta"),
            leadTimeDays: nullableInteger(form, "leadTimeDays"),
            active: checked(form, "active"),
            isDemo: checked(form, "isDemo"),
            priceMinor: nullableInteger(form, "priceMinor"),
            media: text(form, "media"),
          }),
          !variant,
        )
      }
    >
      {variant ? <input name="id" type="hidden" value={variant.id} /> : null}
      <input name="productId" type="hidden" value={productId} />
      <div className="admin-form-grid admin-form-grid--dense">
        <Field defaultValue={variant?.sku} label="SKU" name="sku" required />
        <Field defaultValue={variant?.colorCode} label="Color code" name="colorCode" required />
        <Field defaultValue={variant?.colorNameEn} label="Color / EN" name="colorNameEn" />
        <Field defaultValue={variant?.colorNameRu} label="Color / RU" name="colorNameRu" required />
        <Field defaultValue={variant?.colorNameKz} label="Color / KZ" name="colorNameKz" required />
        <Field defaultValue={variant?.sizeLabel} label="Size" name="sizeLabel" required />
        <Field defaultValue={variant?.stock ?? 0} label="Stock" min={0} name="stock" required type="number" />
        <Field defaultValue={variant?.reservedStock ?? 0} label="Reserved" min={0} name="reservedStock" required type="number" />
        <Field defaultValue={variant?.priceMinor} label="Override price, minor" min={0} name="priceMinor" type="number" />
        <Field defaultValue={variant?.leadTimeDays} label="Lead time, days" min={0} name="leadTimeDays" type="number" />
        <Field defaultValue={inputDate(variant?.incomingEta)} label="Incoming ETA" name="incomingEta" type="datetime-local" />
      </div>
      <div className="admin-check-grid">
        <Checkbox defaultChecked={variant?.active ?? true} label="Active variant" name="active" />
        <Checkbox defaultChecked={variant?.isDemo ?? false} label="Demo-only variant" name="isDemo" />
      </div>
      <TextArea code defaultValue={json(variant?.media, [])} label="Variant media / JSON" name="media" required rows={4} />
      <FormActions busy={busy} label={variant ? "Save variant" : "Add variant"} />
    </form>
  );
}

function CollectionForm({
  collection,
  submit,
  busy,
}: {
  collection?: AdminDashboardData["collections"][number];
  submit: SubmitForm;
  busy: boolean;
}) {
  return (
    <form
      className="admin-form"
      key={collection ? `collection:${collection.id}:${stamp(collection.updatedAt)}` : "collection:new"}
      onSubmit={(event) =>
        submit(
          event,
          (form) => ({
            action: "collection.save",
            ...optionalId(form),
            slug: text(form, "slug"),
            nameRu: text(form, "nameRu"),
            nameKz: text(form, "nameKz"),
            nameEn: optionalText(form, "nameEn"),
            descriptionRu: optionalText(form, "descriptionRu"),
            descriptionKz: optionalText(form, "descriptionKz"),
            descriptionEn: optionalText(form, "descriptionEn"),
            status: text(form, "status"),
            isDemo: checked(form, "isDemo"),
            sortOrder: integer(form, "sortOrder"),
          }),
          !collection,
        )
      }
    >
      {collection ? <input name="id" type="hidden" value={collection.id} /> : null}
      <div className="admin-form-grid">
        <Field defaultValue={collection?.slug} label="Slug" name="slug" required />
        <Field defaultValue={collection?.nameEn} label="Name / EN" name="nameEn" />
        <Field defaultValue={collection?.nameRu} label="Name / RU" name="nameRu" required />
        <Field defaultValue={collection?.nameKz} label="Name / KZ" name="nameKz" required />
        <SelectField defaultValue={collection?.status ?? "DRAFT"} label="Lifecycle" name="status" options={publishStatuses} required />
        <Field defaultValue={collection?.sortOrder ?? 0} label="Sort order" name="sortOrder" required type="number" />
      </div>
      <Checkbox defaultChecked={collection?.isDemo ?? false} label="Demo-only collection" name="isDemo" />
      <div className="admin-form-grid admin-form-grid--copy">
        <TextArea defaultValue={collection?.descriptionEn} label="Description / EN" name="descriptionEn" rows={4} />
        <TextArea defaultValue={collection?.descriptionRu} label="Description / RU" name="descriptionRu" rows={4} />
        <TextArea defaultValue={collection?.descriptionKz} label="Description / KZ" name="descriptionKz" rows={4} />
      </div>
      <FormActions busy={busy} label={collection ? "Save collection" : "Create collection"} />
    </form>
  );
}

function BundleForm({
  bundle,
  products,
  submit,
  busy,
}: {
  bundle?: AdminDashboardData["bundles"][number];
  products: AdminDashboardData["products"];
  submit: SubmitForm;
  busy: boolean;
}) {
  const productOptions = [
    { value: "", label: "Not selected" },
    ...products.map((product) => ({ value: product.id, label: `${englishProductName(product)} / ${product.slug}` })),
  ];
  const top = bundle?.components.find((component) => component.role === "TOP")?.productId;
  const bottom = bundle?.components.find((component) => component.role === "BOTTOM")?.productId;

  return (
    <form
      className="admin-form"
      key={bundle ? `bundle:${bundle.id}:${stamp(bundle.updatedAt)}` : "bundle:new"}
      onSubmit={(event) =>
        submit(
          event,
          (form) => ({
            action: "bundle.save",
            ...optionalId(form),
            slug: text(form, "slug"),
            nameRu: text(form, "nameRu"),
            nameKz: text(form, "nameKz"),
            nameEn: optionalText(form, "nameEn"),
            descriptionRu: optionalText(form, "descriptionRu"),
            descriptionKz: optionalText(form, "descriptionKz"),
            descriptionEn: optionalText(form, "descriptionEn"),
            status: text(form, "status"),
            discountType: text(form, "discountType"),
            discountValue: integer(form, "discountValue"),
            isDemo: checked(form, "isDemo"),
            topProductId: text(form, "topProductId") || undefined,
            bottomProductId: text(form, "bottomProductId") || undefined,
            media: text(form, "media"),
          }),
          !bundle,
        )
      }
    >
      {bundle ? <input name="id" type="hidden" value={bundle.id} /> : null}
      <div className="admin-form-grid">
        <Field defaultValue={bundle?.slug} label="Slug" name="slug" required />
        <Field defaultValue={bundle?.nameEn} label="Name / EN" name="nameEn" />
        <Field defaultValue={bundle?.nameRu} label="Name / RU" name="nameRu" required />
        <Field defaultValue={bundle?.nameKz} label="Name / KZ" name="nameKz" required />
        <SelectField defaultValue={bundle?.status ?? "DRAFT"} label="Lifecycle" name="status" options={productStatuses} required />
        <SelectField defaultValue={bundle?.discountType ?? "PERCENTAGE"} label="Discount type" name="discountType" options={["PERCENTAGE", "FIXED"]} required />
        <Field defaultValue={bundle?.discountValue ?? 0} label="Discount value (bp/minor)" min={0} name="discountValue" required type="number" />
        <SelectField defaultValue={top} label="Top product" name="topProductId" options={productOptions} />
        <SelectField defaultValue={bottom} label="Bottom product" name="bottomProductId" options={productOptions} />
      </div>
      <Checkbox defaultChecked={bundle?.isDemo ?? false} label="Demo-only bundle" name="isDemo" />
      <div className="admin-form-grid admin-form-grid--copy">
        <TextArea defaultValue={bundle?.descriptionEn} label="Description / EN" name="descriptionEn" rows={4} />
        <TextArea defaultValue={bundle?.descriptionRu} label="Description / RU" name="descriptionRu" rows={4} />
        <TextArea defaultValue={bundle?.descriptionKz} label="Description / KZ" name="descriptionKz" rows={4} />
        <TextArea code defaultValue={json(bundle?.media, [])} label="Media / JSON" name="media" required rows={5} />
      </div>
      <FormActions busy={busy} label={bundle ? "Save bundle" : "Create bundle"} />
    </form>
  );
}

function CatalogPanel({ data, submit, busy }: { data: AdminDashboardData; submit: SubmitForm; busy: boolean }) {
  return (
    <section className="admin-panel">
      <SectionHeader
        description="Products, stock-bearing variants, collections and bundle composition. Prices are stored in minor KZT units."
        eyebrow="02 / Commerce data"
        title="Catalog"
      />
      <div className="admin-block">
        <h3>Products & variants <span>{data.products.length}</span></h3>
        <Editor meta="New record" open title="Create product">
          <ProductForm busy={busy} submit={submit} />
        </Editor>
        {data.products.map((product) => (
          <Editor key={product.id} meta={`${product.status} · ${product.variants.length} variants`} title={englishProductName(product)}>
            <ProductForm busy={busy} product={product} submit={submit} />
            <div className="admin-nested">
              <h4>Variants</h4>
              {product.variants.map((variant) => (
                <Editor key={variant.id} meta={`${variant.sizeLabel} · stock ${variant.stock}`} title={variant.sku}>
                  <VariantForm busy={busy} productId={product.id} submit={submit} variant={variant} />
                </Editor>
              ))}
              <Editor meta="New SKU" title="Add variant">
                <VariantForm busy={busy} productId={product.id} submit={submit} />
              </Editor>
            </div>
          </Editor>
        ))}
      </div>
      <div className="admin-block">
        <h3>Collections <span>{data.collections.length}</span></h3>
        <Editor meta="New record" title="Create collection">
          <CollectionForm busy={busy} submit={submit} />
        </Editor>
        {data.collections.map((collection) => (
          <Editor key={collection.id} meta={`${collection.status} · ${collection._count.products} products`} title={collection.nameEn || collection.nameRu}>
            <CollectionForm busy={busy} collection={collection} submit={submit} />
          </Editor>
        ))}
      </div>
      <div className="admin-block">
        <h3>Bundles <span>{data.bundles.length}</span></h3>
        <Editor meta="New record" title="Create bundle">
          <BundleForm busy={busy} products={data.products} submit={submit} />
        </Editor>
        {data.bundles.map((bundle) => (
          <Editor key={bundle.id} meta={`${bundle.status} · ${bundle.components.length} components`} title={bundle.nameEn || bundle.nameRu}>
            <BundleForm bundle={bundle} busy={busy} products={data.products} submit={submit} />
          </Editor>
        ))}
      </div>
    </section>
  );
}

function ProfileForm({
  profile,
  submit,
  busy,
}: {
  profile?: AdminDashboardData["profiles"][number];
  submit: SubmitForm;
  busy: boolean;
}) {
  return (
    <form
      className="admin-form"
      key={profile ? `profile:${profile.id}:${stamp(profile.updatedAt)}` : "profile:new"}
      onSubmit={(event) =>
        submit(
          event,
          (form) => ({
            action: "sizeProfile.save",
            ...optionalId(form),
            slug: text(form, "slug"),
            name: text(form, "name"),
            fitType: text(form, "fitType"),
            sizeChart: text(form, "sizeChart"),
            garmentMeasurements: text(form, "garmentMeasurements"),
            garmentMeasurementsApproved: checked(form, "garmentMeasurementsApproved"),
            isDemo: checked(form, "isDemo"),
          }),
          !profile,
        )
      }
    >
      {profile ? <input name="id" type="hidden" value={profile.id} /> : null}
      <div className="admin-form-grid">
        <Field defaultValue={profile?.slug} label="Slug" name="slug" required />
        <Field defaultValue={profile?.name} label="Profile name" name="name" required />
        <Field defaultValue={profile?.fitType} label="Fit type" name="fitType" required />
      </div>
      <div className="admin-check-grid">
        <Checkbox defaultChecked={profile?.garmentMeasurementsApproved ?? false} label="Garment measurements approved" name="garmentMeasurementsApproved" />
        <Checkbox defaultChecked={profile?.isDemo ?? false} label="Demo-only profile" name="isDemo" />
      </div>
      <div className="admin-json-grid">
        <TextArea code defaultValue={json(profile?.sizeChart)} label="Size chart / JSON" name="sizeChart" required rows={10} />
        <TextArea code defaultValue={json(profile?.garmentMeasurements)} label="Garment measurements / JSON" name="garmentMeasurements" required rows={10} />
      </div>
      <FormActions busy={busy} label={profile ? "Save profile" : "Create profile"} />
    </form>
  );
}

function RuleForm({ profileId, submit, busy }: { profileId: string; submit: SubmitForm; busy: boolean }) {
  return (
    <form
      className="admin-form admin-subform"
      onSubmit={(event) =>
        submit(
          event,
          (form) => ({
            action: "sizeRule.create",
            sizeProfileId: profileId,
            rules: text(form, "rules"),
            notes: optionalText(form, "notes"),
            status: text(form, "status"),
            isDemo: checked(form, "isDemo"),
          }),
          true,
        )
      }
    >
      <div className="admin-form-grid">
        <SelectField defaultValue="DRAFT" label="Lifecycle" name="status" options={ruleStatuses} required />
        <Checkbox label="Demo-only version" name="isDemo" />
      </div>
      <TextArea code defaultValue="{}" label="Rules / JSON" name="rules" required rows={9} />
      <TextArea label="Version notes" name="notes" rows={3} />
      <FormActions busy={busy} label="Create next version" note="Rule versions are append-only. Approval metadata is set by the server." />
    </form>
  );
}

function SizingPanel({ data, submit, busy }: { data: AdminDashboardData; submit: SubmitForm; busy: boolean }) {
  return (
    <section className="admin-panel">
      <SectionHeader
        description="Editable fit profiles with an immutable, auditable rule-version ledger."
        eyebrow="03 / Recommendation engine"
        title="Sizing"
      />
      <Editor meta="New record" open title="Create size profile">
        <ProfileForm busy={busy} submit={submit} />
      </Editor>
      {data.profiles.map((profile) => (
        <Editor key={profile.id} meta={`${profile.fitType} · ${profile.rules.length} versions`} title={profile.name}>
          <ProfileForm busy={busy} profile={profile} submit={submit} />
          <div className="admin-nested">
            <h4>Rule version ledger</h4>
            {profile.rules.length ? (
              <div className="admin-ledger">
                {profile.rules.map((rule) => (
                  <article key={rule.id}>
                    <div>
                      <strong>v{rule.version} / {rule.status}</strong>
                      <span>{formatDate(rule.createdAt)}</span>
                    </div>
                    <pre>{json(rule.rules)}</pre>
                    {rule.notes ? <p>{rule.notes}</p> : null}
                  </article>
                ))}
              </div>
            ) : <p className="admin-empty">No rule versions yet.</p>}
            <Editor meta="Append-only" title="Create next rule version">
              <RuleForm busy={busy} profileId={profile.id} submit={submit} />
            </Editor>
          </div>
        </Editor>
      ))}
    </section>
  );
}

function KnowledgeForm({
  item,
  submit,
  busy,
}: {
  item?: AdminDashboardData["knowledge"][number];
  submit: SubmitForm;
  busy: boolean;
}) {
  return (
    <form
      className="admin-form"
      key={item ? `knowledge:${item.id}:${stamp(item.updatedAt)}` : "knowledge:new"}
      onSubmit={(event) =>
        submit(
          event,
          (form) => ({
            action: "knowledge.save",
            ...optionalId(form),
            language: text(form, "language"),
            scope: text(form, "scope"),
            title: text(form, "title"),
            content: text(form, "content"),
            sourceOwner: text(form, "sourceOwner"),
            sourceId: text(form, "sourceId"),
            status: text(form, "status"),
            reviewDate: isoOrNull(form, "reviewDate"),
            version: integer(form, "version"),
            isDemo: checked(form, "isDemo"),
          }),
          !item,
        )
      }
    >
      {item ? <input name="id" type="hidden" value={item.id} /> : null}
      <div className="admin-form-grid">
        <SelectField defaultValue={item?.language ?? "EN"} label="Language" name="language" options={locales} required />
        <Field defaultValue={item?.scope} label="Knowledge scope" name="scope" required />
        <Field defaultValue={item?.title} label="Title" name="title" required />
        <Field defaultValue={item?.sourceOwner} label="Source owner" name="sourceOwner" required />
        <Field defaultValue={item?.sourceId} label="Source ID" name="sourceId" required />
        <Field defaultValue={item?.version ?? 1} label="Version" min={1} name="version" required type="number" />
        <SelectField defaultValue={item?.status ?? "DRAFT"} label="Lifecycle" name="status" options={knowledgeStatuses} required />
        <Field defaultValue={inputDate(item?.reviewDate)} label="Review date" name="reviewDate" type="datetime-local" />
      </div>
      <Checkbox defaultChecked={item?.isDemo ?? false} label="Demo-only knowledge" name="isDemo" />
      <TextArea defaultValue={item?.content} label="Approved knowledge content" name="content" required rows={12} />
      <FormActions busy={busy} label={item ? "Save knowledge" : "Create knowledge"} note="Only published, in-scope records should feed customer answers." />
    </form>
  );
}

function KnowledgePanel({ data, submit, busy }: { data: AdminDashboardData; submit: SubmitForm; busy: boolean }) {
  return (
    <section className="admin-panel">
      <SectionHeader
        description="Lifecycle, provenance, accountable owner and review date for every AI knowledge source."
        eyebrow="04 / AI governance"
        title="Knowledge base"
      />
      <Editor meta="New source" open title="Create knowledge item">
        <KnowledgeForm busy={busy} submit={submit} />
      </Editor>
      {data.knowledge.map((item) => (
        <Editor key={item.id} meta={`${item.language} · ${item.status} · v${item.version}`} title={item.title}>
          <KnowledgeForm busy={busy} item={item} submit={submit} />
        </Editor>
      ))}
    </section>
  );
}

function JournalForm({
  article,
  submit,
  busy,
}: {
  article?: AdminDashboardData["journal"][number];
  submit: SubmitForm;
  busy: boolean;
}) {
  return (
    <form
      className="admin-form"
      key={article ? `journal:${article.id}:${stamp(article.updatedAt)}` : "journal:new"}
      onSubmit={(event) =>
        submit(
          event,
          (form) => ({
            action: "journal.save",
            ...optionalId(form),
            slug: text(form, "slug"),
            titleRu: text(form, "titleRu"),
            titleKz: text(form, "titleKz"),
            titleEn: optionalText(form, "titleEn"),
            excerptRu: text(form, "excerptRu"),
            excerptKz: text(form, "excerptKz"),
            excerptEn: optionalText(form, "excerptEn"),
            contentRu: text(form, "contentRu"),
            contentKz: text(form, "contentKz"),
            contentEn: optionalText(form, "contentEn"),
            coverImage: optionalText(form, "coverImage"),
            author: optionalText(form, "author"),
            status: text(form, "status"),
            isDemo: checked(form, "isDemo"),
          }),
          !article,
        )
      }
    >
      {article ? <input name="id" type="hidden" value={article.id} /> : null}
      <div className="admin-form-grid">
        <Field defaultValue={article?.slug} label="Slug" name="slug" required />
        <Field defaultValue={article?.author} label="Author" name="author" />
        <Field defaultValue={article?.coverImage} label="Cover image path" name="coverImage" />
        <SelectField defaultValue={article?.status ?? "DRAFT"} label="Lifecycle" name="status" options={publishStatuses} required />
        <Field defaultValue={article?.titleEn} label="Title / EN" name="titleEn" />
        <Field defaultValue={article?.titleRu} label="Title / RU" name="titleRu" required />
        <Field defaultValue={article?.titleKz} label="Title / KZ" name="titleKz" required />
      </div>
      <Checkbox defaultChecked={article?.isDemo ?? false} label="Demo-only article" name="isDemo" />
      <div className="admin-form-grid admin-form-grid--copy">
        <TextArea defaultValue={article?.excerptEn} label="Excerpt / EN" name="excerptEn" rows={4} />
        <TextArea defaultValue={article?.excerptRu} label="Excerpt / RU" name="excerptRu" required rows={4} />
        <TextArea defaultValue={article?.excerptKz} label="Excerpt / KZ" name="excerptKz" required rows={4} />
        <TextArea defaultValue={article?.contentEn} label="Content / EN" name="contentEn" rows={12} />
        <TextArea defaultValue={article?.contentRu} label="Content / RU" name="contentRu" required rows={12} />
        <TextArea defaultValue={article?.contentKz} label="Content / KZ" name="contentKz" required rows={12} />
      </div>
      <FormActions busy={busy} label={article ? "Save article" : "Create article"} />
    </form>
  );
}

function TranslationForm({
  translation,
  submit,
  busy,
}: {
  translation?: AdminDashboardData["translations"][number];
  submit: SubmitForm;
  busy: boolean;
}) {
  return (
    <form
      className="admin-form admin-inline-form"
      key={translation ? `translation:${translation.id}:${stamp(translation.updatedAt)}` : "translation:new"}
      onSubmit={(event) =>
        submit(
          event,
          (form) => ({
            action: "translation.save",
            namespace: text(form, "namespace"),
            key: text(form, "key"),
            locale: text(form, "locale"),
            value: text(form, "value"),
            status: text(form, "status"),
          }),
          !translation,
        )
      }
    >
      <div className="admin-form-grid">
        <Field defaultValue={translation?.namespace} label="Namespace" name="namespace" readOnly={Boolean(translation)} required />
        <Field defaultValue={translation?.key} label="Key" name="key" readOnly={Boolean(translation)} required />
        <SelectField defaultValue={translation?.locale ?? "EN"} label="Locale" name="locale" options={locales} required />
        <SelectField defaultValue={translation?.status ?? "DRAFT"} label="Lifecycle" name="status" options={publishStatuses} required />
      </div>
      <TextArea defaultValue={translation?.value} label="Value" name="value" required rows={4} />
      <FormActions
        busy={busy}
        label={translation ? "Save translation" : "Create translation"}
        note="Public page namespaces use page.<slug>; supported keys are title, lead, seo.*, section.<id>.* and item.<id>.*."
      />
    </form>
  );
}

function ContentPageForm({
  page,
  submit,
  busy,
}: {
  page?: AdminDashboardData["contentPages"][number];
  submit: SubmitForm;
  busy: boolean;
}) {
  return (
    <form
      className="admin-form"
      key={page ? `page:${page.id}:${stamp(page.updatedAt)}` : "page:new"}
      onSubmit={(event) =>
        submit(
          event,
          (form) => ({
            action: "contentPage.save",
            slug: text(form, "slug"),
            locale: text(form, "locale"),
            title: text(form, "title"),
            excerpt: optionalText(form, "excerpt"),
            content: text(form, "content"),
            status: text(form, "status"),
            requiresApproval: checked(form, "requiresApproval"),
            seoTitle: optionalText(form, "seoTitle"),
            seoDescription: optionalText(form, "seoDescription"),
          }),
          !page,
        )
      }
    >
      <div className="admin-form-grid">
        <Field defaultValue={page?.slug} label="Slug" name="slug" readOnly={Boolean(page)} required />
        <SelectField defaultValue={page?.locale ?? "EN"} label="Locale" name="locale" options={locales} required />
        <Field defaultValue={page?.title} label="Title" name="title" required />
        <SelectField defaultValue={page?.status ?? "DRAFT"} label="Lifecycle" name="status" options={publishStatuses} required />
      </div>
      <Checkbox defaultChecked={page?.requiresApproval ?? true} label="Requires approval" name="requiresApproval" />
      <TextArea defaultValue={page?.excerpt} label="Excerpt" name="excerpt" rows={4} />
      <div className="admin-form-grid">
        <Field defaultValue={page?.seoTitle} label="SEO title" name="seoTitle" />
        <Field defaultValue={page?.seoDescription} label="SEO description" name="seoDescription" />
      </div>
      <TextArea defaultValue={page?.content} label="Page content (plain text or structured JSON)" name="content" required rows={14} />
      <FormActions
        busy={busy}
        label={page ? "Save page" : "Create page"}
        note="Only PUBLISHED records render publicly. Legal routes retain the draft warning; sections/items JSON is rendered as text, never raw HTML."
      />
    </form>
  );
}

function ContentPanel({ data, submit, busy }: { data: AdminDashboardData; submit: SubmitForm; busy: boolean }) {
  return (
    <section className="admin-panel">
      <SectionHeader
        description="Journal stories, managed pages and translation keys. Composite identifiers remain stable while their content is edited."
        eyebrow="05 / Publishing"
        title="Content"
      />
      <div className="admin-block">
        <h3>Journal <span>{data.journal.length}</span></h3>
        <Editor meta="New story" title="Create journal article">
          <JournalForm busy={busy} submit={submit} />
        </Editor>
        {data.journal.map((article) => (
          <Editor key={article.id} meta={`${article.status} · ${article.slug}`} title={article.titleEn || article.titleRu}>
            <JournalForm article={article} busy={busy} submit={submit} />
          </Editor>
        ))}
      </div>
      <div className="admin-block">
        <h3>Content pages <span>{data.contentPages.length}</span></h3>
        <Editor meta="New page" title="Create content page">
          <ContentPageForm busy={busy} submit={submit} />
        </Editor>
        {data.contentPages.map((page) => (
          <Editor key={page.id} meta={`${page.locale} · ${page.status} · v${page.version}`} title={page.title}>
            <ContentPageForm busy={busy} page={page} submit={submit} />
          </Editor>
        ))}
      </div>
      <div className="admin-block">
        <h3>Translations <span>{data.translations.length}</span></h3>
        <Editor meta="New key" title="Create translation">
          <TranslationForm busy={busy} submit={submit} />
        </Editor>
        {data.translations.map((translation) => (
          <Editor key={translation.id} meta={`${translation.locale} · ${translation.status} · v${translation.version}`} title={`${translation.namespace}.${translation.key}`}>
            <TranslationForm busy={busy} submit={submit} translation={translation} />
          </Editor>
        ))}
      </div>
    </section>
  );
}

function WaitlistTable({ waitlist }: { waitlist: AdminDashboardData["waitlist"] }) {
  const [filters, setFilters] = useState({ product: "", color: "", size: "", city: "" });
  const deferredFilters = useDeferredValue(filters);
  const normalized = Object.fromEntries(
    Object.entries(deferredFilters).map(([key, value]) => [key, value.trim().toLocaleLowerCase("en")]),
  );
  const filtered = waitlist.filter((lead) => {
    const product = `${lead.product?.slug ?? ""} ${englishProductName(lead.product, "")}`.toLocaleLowerCase("en");
    return (
      product.includes(normalized.product) &&
      (lead.color ?? "").toLocaleLowerCase("ru").includes(normalized.color) &&
      (lead.size ?? "").toLocaleLowerCase("ru").includes(normalized.size) &&
      (lead.city ?? "").toLocaleLowerCase("ru").includes(normalized.city)
    );
  });
  const params = new URLSearchParams({ type: "waitlist" });
  for (const [key, value] of Object.entries(filters)) {
    if (value.trim()) params.set(key, value.trim());
  }

  return (
    <div className="admin-operation-block">
      <div className="admin-operation-heading">
        <div>
          <h3>Waitlist</h3>
          <p>{filtered.length} of {waitlist.length} records</p>
        </div>
        <Link className="q-button" href={`/api/admin/export?${params.toString()}`} prefetch={false}>Export filtered CSV ↓</Link>
      </div>
      <div className="admin-filter-grid">
        {(["product", "color", "size", "city"] as const).map((key) => (
          <label className="q-field" key={key}>
            <span>{key}</span>
            <input
              className="q-input"
              onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
              placeholder={`Filter by ${key}`}
              type="search"
              value={filters[key]}
            />
          </label>
        ))}
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Contact</th><th>Intent</th><th>Product</th><th>Color / size</th><th>Consent</th></tr></thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id}>
                <td>{formatDate(lead.createdAt)}</td>
                <td><strong>{lead.name}</strong><small>{lead.email || lead.phone || "No channel"}</small><small>{lead.city || "—"}</small></td>
                <td>{lead.contactPurpose}<small>{lead.source} · {lead.language}</small></td>
                <td>{englishProductName(lead.product, "General")}<small>{lead.product?.slug || lead.variant?.sku || "—"}</small></td>
                <td>{lead.color || "—"} / {lead.size || "—"}</td>
                <td>S:{lead.serviceConsent ? "yes" : "no"} R:{lead.restockConsent ? "yes" : "no"} M:{lead.marketingConsent ? "yes" : "no"}<small>policy {lead.policyVersion}</small><small>{lead.submissionCount} submissions</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HandoffTable({
  handoffs,
  submit,
  busy,
}: {
  handoffs: AdminDashboardData["handoffs"];
  submit: SubmitForm;
  busy: boolean;
}) {
  return (
    <div className="admin-operation-block">
      <div className="admin-operation-heading">
        <div><h3>AI handoffs</h3><p>{handoffs.length} tickets</p></div>
        <Link className="q-button" href="/api/admin/export?type=handoff" prefetch={false}>Export CSV ↓</Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Question</th><th>Context</th><th>Contact</th><th>Status</th></tr></thead>
          <tbody>
            {handoffs.map((ticket) => (
              <tr key={ticket.id}>
                <td>{formatDate(ticket.createdAt)}<small>{shortId(ticket.id)}</small></td>
                <td><strong>{ticket.userQuestion}</strong><small>{ticket.reason}</small>{ticket.summary ? <small>{ticket.summary}</small> : null}</td>
                <td>{englishProductName(ticket.product, "General")}<small>confidence: {ticket.aiConfidence || "—"}</small></td>
                <td>{ticket.contactName || "—"}<small>{ticket.contactEmail || ticket.contactPhone || "No channel"}</small><small>consent {ticket.contactConsent ? "yes" : "no"} · policy {ticket.policyVersion}</small></td>
                <td>
                  <form
                    className="admin-status-form"
                    onSubmit={(event) => submit(event, (form) => ({ action: "handoff.status", id: ticket.id, status: text(form, "status") }))}
                  >
                    <select aria-label={`Status for ${shortId(ticket.id)}`} className="q-select" defaultValue={ticket.status} name="status">
                      {handoffStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <button className="admin-table-button" disabled={busy} type="submit">Update</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OperationsPanel({ data, submit, busy }: { data: AdminDashboardData; submit: SubmitForm; busy: boolean }) {
  return (
    <section className="admin-panel">
      <SectionHeader
        description="Live operational records only: consented leads, AI escalations, open questions, test orders and immutable audit events."
        eyebrow="06 / Daily control"
        title="Operations"
      />
      <WaitlistTable waitlist={data.waitlist} />
      <HandoffTable busy={busy} handoffs={data.handoffs} submit={submit} />
      <div className="admin-operation-block">
        <div className="admin-operation-heading"><div><h3>Unanswered user questions</h3><p>{data.unanswered.length} active conversation messages without handoff</p></div></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Question</th><th>Conversation</th><th>Locale / page</th></tr></thead>
            <tbody>{data.unanswered.map((message) => (
              <tr key={message.id}><td>{formatDate(message.createdAt)}</td><td><strong>{message.content}</strong></td><td>{shortId(message.conversationId)}</td><td>{message.conversation.language}<small>{message.conversation.currentPage || "—"}</small></td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="admin-operation-block">
        <div className="admin-operation-heading"><div><h3>Orders</h3><p>{data.orders.length} most recent</p></div></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Number</th><th>Customer</th><th>Delivery</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{data.orders.map((order) => (
              <tr key={order.id}>
                <td>{formatDate(order.createdAt)}<small>{order.isTest ? "TEST" : "LIVE"}</small></td>
                <td><strong>{order.number}</strong><small>{order._count.items} items</small></td>
                <td>{order.customerName}<small>{order.customerEmail || order.customerPhone || "—"}</small></td>
                <td>{order.city}<small>{order.deliveryMethod}</small></td>
                <td>{(order.totalMinor / 100).toLocaleString("en-KZ")} {order.currency}</td>
                <td>{order.status}<small>{order.paymentStatus} · {order.fiscalStatus}</small></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="admin-operation-block">
        <div className="admin-operation-heading"><div><h3>Audit log</h3><p>{data.audit.length} most recent write events</p></div></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Action</th><th>Entity</th><th>Change snapshot</th></tr></thead>
            <tbody>{data.audit.map((entry) => (
              <tr key={entry.id}>
                <td>{formatDate(entry.createdAt)}<small>{shortId(entry.id)}</small></td>
                <td><strong>{entry.action}</strong></td>
                <td>{entry.entityType}<small>{entry.entityId ? shortId(entry.entityId) : "—"}</small></td>
                <td><details className="admin-audit-detail"><summary>Inspect JSON</summary><pre>{json({ before: entry.before, after: entry.after })}</pre></details></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>("settings");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  const submit: SubmitForm = (event, build, resetOnSuccess = false) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const payload = build(new FormData(formElement));
    const mutationKey = `${payload.action}:${String(payload.id ?? payload.slug ?? payload.key ?? "new")}`;

    async function run() {
      setBusyKey(mutationKey);
      setFeedback(null);
      try {
        const response = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await response.json().catch(() => null) as { error?: string; message?: string } | null;
        if (!response.ok) throw new Error(body?.message || body?.error || `Request failed (${response.status})`);
        if (resetOnSuccess) formElement.reset();
        setFeedback({ kind: "success", message: `${payload.action} saved.` });
        startTransition(() => router.refresh());
      } catch (error) {
        setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Save failed." });
      } finally {
        setBusyKey(null);
      }
    }

    void run();
  };

  async function logout() {
    setBusyKey("logout");
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Logout failed.");
      window.location.reload();
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Logout failed." });
      setBusyKey(null);
    }
  }

  const busy = busyKey !== null || isRefreshing;

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <Link aria-label="QULTURE public site" className="q-wordmark" href="/en">QULTURE</Link>
          <span>Control room</span>
        </div>
        <div className="admin-topbar__actions">
          <span className="admin-mode-pill" data-mode={data.settings?.siteMode ?? "PRE_LAUNCH"}>
            {data.settings?.siteMode ?? "PRE_LAUNCH"}
          </span>
          <button className="q-button" disabled={busyKey === "logout"} onClick={() => void logout()} type="button">
            {busyKey === "logout" ? "Leaving…" : "Log out →"}
          </button>
        </div>
      </header>

      <div className="admin-layout">
        <nav aria-label="Admin sections" className="admin-nav">
          <p className="q-meta">Workspace</p>
          {sections.map((section, index) => (
            <button
              aria-current={activeSection === section.id ? "page" : undefined}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {section.label}
            </button>
          ))}
          <div className="admin-nav__counts">
            <span><b>{data.products.length}</b> products</span>
            <span><b>{data.waitlist.length}</b> leads</span>
            <span><b>{data.handoffs.filter((ticket) => ["OPEN", "IN_PROGRESS"].includes(ticket.status)).length}</b> open handoffs</span>
          </div>
        </nav>

        <div className="admin-content">
          <div aria-atomic="true" aria-live="polite" className="admin-feedback" data-kind={feedback?.kind ?? "idle"}>
            {feedback?.message ?? (isRefreshing ? "Refreshing dashboard…" : "All changes are validated and audited server-side.")}
          </div>
          {activeSection === "settings" ? <SettingsPanel busy={busy} data={data} submit={submit} /> : null}
          {activeSection === "catalog" ? <CatalogPanel busy={busy} data={data} submit={submit} /> : null}
          {activeSection === "sizing" ? <SizingPanel busy={busy} data={data} submit={submit} /> : null}
          {activeSection === "knowledge" ? <KnowledgePanel busy={busy} data={data} submit={submit} /> : null}
          {activeSection === "content" ? <ContentPanel busy={busy} data={data} submit={submit} /> : null}
          {activeSection === "operations" ? <OperationsPanel busy={busy} data={data} submit={submit} /> : null}
        </div>
      </div>
    </main>
  );
}

# QULTURE digital commerce

Production-oriented pre-launch website and isolated commerce prototype for QULTURE, an Astana-based urban clothing system. The public experience is deliberately conservative: unapproved prices, stock, specifications, launch dates, and reviews are not published. Russian (`/ru`) and Kazakh (`/kz`) are first-class locales; the content and database models are ready for an English locale later.

The repository also contains a database-backed AI product consultant, waitlist and consent flows, a password-protected control room, and a no-index demo path that exercises a complete test order without charging money.

## Stack

- Next.js App Router, React, TypeScript in strict mode
- Tailwind CSS/PostCSS plus a project design-token layer in `src/app/globals.css`
- Prisma with SQLite through `@prisma/adapter-better-sqlite3`
- OpenAI Responses API with typed tools and Zod structured output
- Zod validation at HTTP and domain boundaries
- Vitest for domain/service tests
- Playwright for browser smoke tests

## Architecture

```text
src/app/                 App Router pages, metadata, API routes
src/components/          public UI, commerce, AI, consent, admin UI
src/content/             reviewed RU/KZ editorial and policy copy
src/lib/domain/          deterministic cart, bundle, size, mode rules
src/lib/commerce/        catalog gates, server pricing, orders, proof tokens
src/lib/ai/              prompt, schemas, tools, persistence, provider adapter
src/lib/admin/           session and dashboard data access
prisma/                  schema, migrations, deterministic seed
e2e/                     Playwright public and demo-commerce smoke flows
public/media/            optimized site media
docs/design/             generated visual concepts used during implementation
```

Server components read publishable data and decide which surface can render. Client components own transient interaction state such as the cart drawer, AI panel, cookie preferences, and forms. All commerce totals are recalculated on the server from database variants; browser-provided prices are never authoritative. AI tools can read only approved/published non-demo records and return an explicit unavailable/handoff state when evidence is missing.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- A writable local directory for SQLite
- An OpenAI API key only if live AI responses are required

## Local installation

```powershell
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open <http://localhost:3000>; the root redirects to the RU/KZ locale selected in `SiteSettings.defaultLocale` (`/ru` by default). Do not overwrite an existing `.env`: copy only the missing variable names from `.env.example`.

The seed is deterministic. It sets the site to `PRE_LAUNCH`, keeps the public catalog hidden, and creates draft-only demo products, variants, a bundle, reviewed knowledge records, translations, and journal content. Demo records never become public merely because they exist.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | No | Prisma file URL. Defaults to `file:./prisma/qulture.db`. |
| `OPENAI_KEY` | No | Preferred server-only OpenAI credential. Never prefix with `NEXT_PUBLIC_`. |
| `OPENAI_API_KEY` | No | Supported fallback credential name when `OPENAI_KEY` is absent. |
| `OPENAI_MODEL` | No | Model override; defaults to `gpt-5.6-luna`. |
| `ADMIN_PASSWORD` | Admin only | Control-room password. Use a long unique value. |
| `SESSION_SECRET` | Admin/orders in production | Independent high-entropy secret used to sign admin sessions and order ownership tokens. |
| `NEXT_PUBLIC_SITE_URL` | Production | HTTPS public origin used for canonical metadata and links. |
| `QULTURE_DEMO_COMMERCE` | Local test only | Enables demo commerce without `?demo=1`; never set in production. |
| `QULTURE_ALLOW_DRAFT_PII_CAPTURE` | Preview exception only | Set to `1`/`true` only for an explicitly approved production-like preview. Production waitlist/handoff PII is otherwise rejected while `consentPolicyVersion` contains `draft`. |
| `TRUST_PROXY_HEADERS` | Trusted-proxy deployments only | Enables forwarded client-IP headers for rate limits. Leave false unless the app is behind a proxy you operate and configure. Vercel/Cloudflare platform headers are handled separately. |
| `PAYMENT_PROVIDER` | No | Optional intended-provider label; does not enable checkout without a concrete payment adapter. |
| `DELIVERY_PROVIDER` | No | Optional intended-provider label; does not enable checkout without a concrete delivery adapter. |
| `ADDRESS_PROVIDER` | No | Optional intended-provider label; does not enable checkout without a concrete address adapter. |
| `FISCAL_PROVIDER` | No | Optional intended-provider label; does not enable checkout without a concrete fiscal adapter. |

`.env` and all `.env.*` files are ignored except `.env.example`. Do not commit credentials or paste their values into logs, screenshots, issues, or client-side code.

## Database lifecycle

For local schema work:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

For a deployed database, apply committed migrations non-interactively:

```powershell
npx prisma migrate deploy
```

Do not run the development seed against production without reviewing it: the seed intentionally restores pre-launch settings and inserts test-only fixtures. Back up the database before production migrations.

## Application modes

`SiteSettings` is the single mode authority.

- `PRE_LAUNCH` is the default. It shows editorial/product-system previews and waitlist actions, but no public price, stock, preorder promise, or checkout.
- `COMMERCE` is intended for launch. Public catalog rendering additionally requires `catalogVisible = true` and individually approved non-demo products with `status = ACTIVE`.
- `controlledPreview` keeps the non-transactional product-system presentation available while commerce is closed.
- `demoMode` and draft records are not a publication mechanism. The smoke path uses an explicit demo gate and is isolated from public records.

Change mode in `/admin` under site settings, review the resulting public pages in both locales, and only then publish. Prisma Studio is useful for local inspection, but production mode changes should go through the audited admin action.

## Admin control room

Open `/admin` (the route is intentionally not localized). Admin is disabled when its credential configuration is absent; the page explains which local variables are needed instead of exposing a login form. Set both `ADMIN_PASSWORD` and `SESSION_SECRET`, restart the server, and sign in with the configured password.

Successful authentication creates a signed, `HttpOnly`, `SameSite=Strict` session cookie with an eight-hour maximum age. Admin writes are same-origin checked and recorded in `AuditLog`. The current password gate is appropriate for a controlled prototype; before giving multiple people production access, replace it with individual identities/SSO, MFA, role enforcement, session revocation, and an external audit-log sink.

The control room manages site settings, products and variants, collections, bundles, size profiles/rule versions, knowledge, journal/content/translations, and AI handoff status. CSV exports are authenticated and should be treated as personal data.

Public FAQ and legal routes consume only `PUBLISHED` `ContentPage` records for the matching locale. Supported slugs are `faq`, `privacy`, `terms`, `cookies`, `consent`, and `delivery-and-returns`; the combined delivery page also merges published `delivery` and `returns` records. Content may be plain text or structured JSON with `sections` (and `items` for FAQ), and is always rendered as escaped text rather than raw HTML. A missing, malformed, draft, archived, or unavailable CMS record falls back to the reviewed static draft. Publishing CMS copy does not remove the legal draft warning because the current model has no evidence-backed legal approval record.

Published `Translation` records can override known fields without replacing the page structure. Use namespace `page.<slug>` and keys such as `title`, `lead`, `seo.title`, `seo.description`, `section.<id>.title`, `section.<id>.paragraphs`, `item.<id>.question`, and `item.<id>.answer`. Paragraph/answer list values may be JSON string arrays. The admin UI repeats this contract next to the editors.

## AI consultant

The AI endpoint uses the server-side key, the Responses API, bounded tool rounds, structured output, and explicit data adapters. Its tools are restricted to published, non-demo catalog/stock, approved size rules, reviewed knowledge, consented waitlist/handoff mutations, and ownership-checked order status.

If no OpenAI key is configured, a request times out, or the provider is unavailable, `/api/ai` returns a localized, renderable fallback and a handoff action. The rest of the site remains fully usable. The Playwright suite mocks this provider boundary, so smoke tests never spend API credits or depend on network availability.

Before production, review the chosen `OPENAI_MODEL` against the account's available models, define retention/observability policy, and monitor correlation IDs and handoff outcomes without logging credentials or unnecessary body measurements.

## Routes

All public content routes are available under both `/:locale` prefixes (`ru`, `kz`).

| Route | Purpose |
| --- | --- |
| `/` | Redirect to the RU/KZ locale selected in `SiteSettings.defaultLocale` |
| `/:locale` | Long-form landing page |
| `/:locale/shop` | Controlled catalog preview; public commerce when approved |
| `/:locale/collections/:slug` | Collection landing |
| `/:locale/product/:slug` | Product preview/PDP |
| `/:locale/build-a-set` | Independent top/pants size builder |
| `/:locale/technology` | Technology overview |
| `/:locale/technology/materials` | Materials policy/content |
| `/:locale/technology/climate-logic` | Climate and layering logic |
| `/:locale/journal` | Progress journal index |
| `/:locale/journal/:slug` | Journal article |
| `/:locale/about` | Brand story |
| `/:locale/waitlist` | Consent-specific waitlist form |
| `/:locale/cart` | Cart |
| `/:locale/checkout` | Checkout; real payment remains disabled |
| `/:locale/order-status` | Ownership-checked test-order lookup |
| `/:locale/account` | Account/status entry surface |
| `/:locale/delivery-and-returns` | Delivery and returns draft |
| `/:locale/faq` | FAQ |
| `/:locale/contacts` | Contact information |
| `/:locale/privacy` | Privacy notice |
| `/:locale/terms` | Terms draft |
| `/:locale/cookies` | Cookie notice/settings entry |
| `/:locale/consent` | Consent details |
| `/admin` | Protected control room |

Server APIs live under `/api/ai`, `/api/handoff`, `/api/waitlist`, `/api/consent`, `/api/analytics`, `/api/orders`, `/api/orders/status`, and `/api/admin/*`.

## Isolated demo commerce

The deterministic smoke path is opt-in:

```text
/ru/shop?demo=1
/ru/collections/demo-commerce-fixtures?demo=1
/ru/product/demo-city-top?demo=1
/ru/product/demo-city-trousers?demo=1
/ru/build-a-set?demo=1
```

The builder supports different top and pants sizes, adds two linked cart lines, applies the seeded bundle rule, and proceeds through checkout to a local test order and signed status URL. The payment adapter is `development_mock`; it cannot charge a card.

Demo pages render a visible warning, expose only `isDemo`/`DRAFT` fixtures, set no-index metadata, and are disallowed in `robots.txt`. The `?demo=1` query and the admin `demoMode` setting work only outside production. A production preview requires the explicit server-only `QULTURE_DEMO_COMMERCE=1` override; demo checkout additionally obeys the draft-policy PII gate. Keep the override disabled for a public launch, never promote seeded records, and verify demo prices/stock are absent from public HTML and sitemap output.

## Commands and tests

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
npm run check
```

Install Chromium once, then run the browser smoke suite against a migrated and seeded local database:

```powershell
npx playwright install chromium
npm run test:smoke
```

Playwright starts an isolated `npm run dev` on `127.0.0.1:3100` unless that test server is already running. Set `PLAYWRIGHT_BASE_URL` to test an explicitly managed deployment instead. Coverage includes desktop/mobile home rendering, RU/KZ switching, an offline AI quick action, a valid waitlist submission, and the complete independent-size demo order/status flow. Test leads, orders, items, and idempotency records are removed in teardown.

## Security and privacy notes

- HTTP input is size-bounded where appropriate and Zod-validated; mutation endpoints are rate-limited and idempotent where retries matter.
- Order totals and variant availability are resolved again on the server. Status lookup requires the signed proof token or matching contact evidence.
- Admin cookies are signed and inaccessible to JavaScript; admin mutations reject cross-origin requests.
- Necessary consent is separated from optional analytics and marketing. Waitlist service/restock consent and handoff contact consent are explicit; marketing consent is independent. Every stored lead/ticket records the exact policy version shown by its form.
- Waitlist and handoff PII writes are same-origin checked. In production, a draft policy version disables these writes unless the explicit `QULTURE_ALLOW_DRAFT_PII_CAPTURE` preview exception is enabled; stale form versions are rejected and must be re-read.
- AI context is not a source of product truth. Unapproved facts produce an unavailable/handoff response rather than a guess.
- Security headers include a self-only Content Security Policy, frame denial, feature restrictions, referrer policy, MIME protection, and production HSTS. Extend the CSP allowlist deliberately when approved analytics/payment domains are introduced.
- The local rate limiter and SQLite database are process-local. Multi-instance production needs a shared rate-limit store and a managed/persistent database.
- Define production retention/deletion rules for leads, conversations, orders, consent records, analytics, exports, and audit logs. Encrypt backups and restrict operator access.

## What is still required for real sales

No real payment, fiscalization, delivery booking, or transactional messaging credential is present. Before switching to production commerce, the operator must provide and approve:

- a Kazakhstan-compatible payment provider account, API credentials, signed webhooks, 3-D Secure/Apple Pay policy, refunds, reconciliation, and failure handling;
- fiscal receipt/online cash-register integration where legally required;
- delivery zones, tariff/ETA API, courier credentials, pickup rules, labels, tracking webhooks, return workflow, and support SLA;
- transactional email/SMS provider credentials and approved message templates;
- final legal, privacy, consent, returns, pricing, inventory, size, material, and care data;
- production domains, analytics destinations, consent configuration, monitoring, backups, incident contacts, and a go-live rollback plan.

The `development_mock` payment method must be removed or hard-disabled before accepting real orders.

## Deployment guide

1. Choose a Node.js 22 host. With the current SQLite adapter, use one writable application instance with a persistent volume and backups. For serverless or horizontally scaled deployment, migrate the Prisma datasource/adapter and migrations to managed PostgreSQL first.
2. Configure production secrets in the host's secret manager, set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin, and ensure both demo override variables are unset.
3. Build the immutable application image:

   ```sh
   npm ci
   npm run db:generate
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```

4. Back up the database and run `npx prisma migrate deploy` as a one-off release step. Do not automatically run the development seed.
5. Start with `npm run start` behind HTTPS. Persist the database separately from the release directory and serve the bundled `public/media` assets through the application or a controlled CDN.
6. Run smoke checks in both locales, confirm `/admin` protection, verify OpenAI fallback/live behavior, submit and delete a test lead, and confirm public HTML/sitemap contain no demo prices or stock.
7. Keep `PRE_LAUNCH` until payment, delivery, legal, content, stock, monitoring, backup restoration, and rollback acceptance checks are signed off.

## Visual assets and concepts

- `public/media/hero/hero-video.mp4` and `public/media/hero/hero-poster.png` are the production hero media derived from the supplied project assets. The component has a reduced-motion/static fallback.
- `public/media/editorial/city-scenarios.png` is a coordinated editorial scenario strip generated with GPT Image 2 for the landing page.
- `docs/design/concepts/01-hero.png` through `08-admin.png` preserve the generated direction for the landing, PDP, builder, and control room.
- `docs/design-system.md` records tokens, layout principles, and the image-generation direction used during implementation.

Keep source licensing/provenance with every replacement asset, provide meaningful alternative text for informative imagery, and re-run responsive visual QA after changing crop, dimensions, or compression.
"# qulture" 

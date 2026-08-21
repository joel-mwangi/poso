# DukaFlow

## Offline-first POS for Kenyan shops

DukaFlow is a merchant-first point-of-sale and shop-management platform designed around how ordinary Kenyan shops operate.

The product is designed for a long-term target of **100,000 shop owners**, while keeping the first release simple: a merchant should be able to run essential daily sales from a smartphone, continue selling without internet, and synchronize safely when connectivity returns.

> **DukaFlow adapts to the shop. The shop does not have to become a computer system.**

## Product thesis

DukaFlow is not designed around an idealized retailer with permanent broadband, barcode scanners, a desktop computer, and dedicated POS hardware.

The product is built around:

- **Smartphone-first** — Android-sized screens are the primary merchant experience.
- **Offline-first** — loss of internet must not stop ordinary selling.
- **Simple by default** — a merchant should reach a first sale quickly.
- **Cash + M-Pesa + Deni are first-class flows.**
- **Inventory follows transactions** — valid sales create inventory movements automatically.
- **Trust before feature count** — sales, stock, payments, Deni and sync must be explainable.
- **Flexible staffing** — the system adapts from one-person dukas to staffed multi-shop retailers.
- **Public storefront later** — public exposure is an explicit publication layer.
- **Offline-first operations** — supported shop work is recorded locally, synchronized safely, and made explainable when connectivity returns.

The detailed offline/online architecture is defined in [Offline-Online Capability Model](docs/offline-online-capability-model.md). The implementation-ready PWA structure is defined in [PWA Architecture and Implementation Plan](docs/pwa-architecture-and-implementation-plan.md).

### Implementation status

The first implementation foundation is now present in this repository. DukaFlow has an installable PWA shell, the approved visual system, a Dexie/IndexedDB local store, a durable local outbox, an offline-first sale flow for Cash, M-Pesa reference recording, and Deni, a stock reduction projection, synchronization states, and a browser-safe Supabase client boundary. The current sync service acknowledges operations locally as a development placeholder; the Supabase Edge Function ingestion contract and production server reconciliation still need to be implemented.

To verify the application locally:

```text
npm install
npm run build
npm run dev
```

## General landing page

DukaFlow must have a simple general landing page that every visitor can see before authentication. This page is the common entry point for owners, helpers, invited staff, and returning users. It must explain DukaFlow without exposing private shop data or role-specific operations. The complete research-informed copy and information architecture are defined in [General Landing Page Content](docs/general-landing-page-content.md).

The recommended public positioning is:

> **Run your shop with confidence.**
>
> DukaFlow is a simple POS for Kenyan shops that helps you sell, track your stock, understand your money, and make better decisions from your real business history.

The page should lead with the four owner outcomes, then address smartphone use, unreliable connectivity, Cash, M-Pesa, Deni, helpers, and multi-shop growth. It should use truthful claims only and avoid unsupported statements about market leadership, customer counts, certifications, compliance, pricing, or live integrations.

### Approved homepage visual direction

The approved landing-page reference uses a calm, high-contrast, smartphone-first composition: DukaFlow branding and navigation at the top, the owner-focused hero message on the left, and a fictional smartphone product visual on the right. The visual reference is stored at [docs/assets/dukaflow-landing-page-palette-refined.png](docs/assets/dukaflow-landing-page-palette-refined.png).

The primary brand palette is:

| Color | Hex | Use |
|---|---|---|
| **Growth Green** | `#0D7A56` | Primary CTA, active states, success states, and growth actions. |
| **Trust Blue** | `#00408F` | Logo contrast, headings, navigation, links, and structural emphasis. |
| **Savanna Orange** | `#FF9F1C` | Low-stock warnings, pending payments, and urgent attention indicators; use dark text on orange. |
| **Market Charcoal** | `#1E242B` | Default body text, dark surfaces, labels, and high-legibility content. |

Market Charcoal is the default body-text color. Trust Blue is reserved for headings, navigation, links, and structural emphasis so the two colors do not compete for the same role. Savanna Orange must not be used as small text on a white background; warnings must include a label or icon in addition to color.

The first visual asset set should remain restrained: one smartphone hero visual, four consistent outcome icons, an optional realistic Kenyan shop image, and small numbered illustrations for the setup steps. Product visuals must use fictional demo data and must not expose real customer names, phone numbers, Till numbers, balances, or private records.

```text
DukaFlow
Simple POS for Kenyan shops

Sell offline. Know your stock. Know your cash.
Understand your customers. Grow your business.

[Log in]
[Create owner account]
[Accept invitation]

Works on your phone and continues when internet is unavailable.
```

The public landing page may explain the product, supported business flows, offline-first behavior, Cash, M-Pesa, Deni, inventory, and multi-shop support. It may include general help and contact information. It must not show organization names, shop balances, customer Deni, sales, staff records, M-Pesa credentials, or private reports.

The landing page has one common public experience, but the destination after authentication depends on the current user:

```text
General landing page
       ↓
[Log in / Register / Accept invitation]
       ↓
Authenticate
       ↓
Resolve organization, shop, permissions, visibility, and lifecycle state
       ↓
Owner home, helper workspace, setup, invitation activation, or restricted-access screen
```

A returning owner normally enters the organization homepage. A newly registered owner without an organization enters the owner setup checklist. An invited helper enters account activation and then the assigned shop workspace. A helper with one shop opens that shop automatically; a helper with multiple shops chooses from only their assigned shops. A suspended, removed, or unassigned user receives a clear access-status screen rather than an empty dashboard.

The public landing page is therefore different from the authenticated landing page:

| Experience | Audience | Purpose |
|---|---|---|
| **General public landing page** | Every visitor before login | Explain DukaFlow and provide Log in, Register, and Accept invitation entry points. |
| **Owner authenticated landing page** | Active owner | Show combined organization summary, urgent attention, cash, stock, customers, and growth decisions. |
| **Helper authenticated landing page** | Active invited helper | Show only permitted work for the active assigned shop. |
| **Setup landing page** | New owner without organization/shop | Start the Yes/No checklist and shop setup. |
| **Invitation activation page** | Invited helper | Confirm email, set password, and activate the owner-created account. |
| **Restricted-access page** | Suspended, removed, unassigned, or unavailable user | Explain why operations are unavailable and what next step is required. |

## Owner onboarding and setup classification

After account registration and verification, but before organization and shop bootstrap, DukaFlow should ask a short checklist to recommend the simplest suitable setup path:

1. Do you have more than one shop? **Yes / No**
2. Do you accept M-Pesa? **Yes / No**
3. Do you allow Deni? **Yes / No**
4. Do you buy stock from suppliers? **Yes / No**

If the answer to question 1 is **No**, ask:

5. Do you run the shop alone? **Yes / No**

If the answer is **Yes**, DukaFlow automatically records **Other people use the system: No**. If the answer is **No**, DukaFlow automatically records **Other people use the system: Yes**. Do not ask the duplicate staff-use question.

If the answer to question 1 is **Yes**, continue with multi-shop creation. Do not ask the helping-person question during the initial quiz. That question appears later in the settings for each specific shop after the owner taps **Set up shop**.

The owner confirms the recommendation by choosing either **Start with simple setup** or **Use recommended setup**. The checklist should not force complex configuration. It should reveal only relevant follow-up steps: M-Pesa Till Number configuration, staff access, additional shops, customer/Deni tracking, or supplier/purchasing tools.

The owner remains an **Owner** regardless of the selected setup. Complexity is enabled as organization capabilities, not stored as a permanent person type. The owner can add staff, shops, permissions, shifts, approvals, reconciliation, purchasing, and other controls later.

When the owner answers **Do you run the shop alone? Yes**, the initial shop starts with:

```text
people_access_enabled = false
```

If the business later needs help, the owner can open **Shop Settings → People and access**, enable people access, and add a helper without repeating registration or recreating the organisation:

```text
Shop Settings
   ↓
People and access
   ↓
[Enable people to use this shop]
   ↓
Add helping person
```

After the first helper is added, `people_access_enabled` becomes `true`. The capability may be enabled separately for each shop.

After the organization is created, the first shop form must include:

```text
Shop name
[ Enter shop name ]

Shop location
[ Enter town, estate, street, or area ]

[Create shop]
```

Shop location should be simple and flexible rather than requiring a formal postal address. For additional shops, the same name-and-location form is shown with **Add shop** and **Do this later** options.

After shop creation is complete, show the owner the created shop or shops first. The owner must tap **Set up shop** before entering profile settings.

For one shop, show the shop name, location, optional photo, and **Set up shop** action. For multiple shops, show a list of created shops with each shop's name, location, optional photo, and **Set up shop** action. The owner configures one selected shop at a time and may return to the list.

After the owner taps **Set up shop**, the owner enters one **Shop Profile Settings** area:

```text
Shop Profile
├── Shop photo, optional
├── Shop name
├── Shop location
└── Contact information, where collected

Business Preferences
├── Currency: KSh
├── Language: English
└── Timezone: East Africa Time

Payments
├── Cash: enabled by default
├── M-Pesa: enabled / not configured / connected
└── Deni / Pay later: enabled if selected
```

M-Pesa configuration is conditional. If enabled, the owner selects Till Number or PayBill, enters the payment number, chooses Sandbox or Live, and securely configures Daraja credentials obtained through the official Safaricom Daraja Live process. The Till Number is a payment destination and does not itself confirm that the integration is connected or that a payment has settled.

Customer/Deni, supplier/purchasing, staff, and additional-shop sections appear only when relevant or when the owner chooses to activate them. The owner may set up M-Pesa and optional capabilities later while continuing with supported cash operations.

The setup experience keeps the same content sequence on every screen size. Mobile uses single-column vertical steps, tablets use a centered flexible form, and desktop uses a step rail with a wider work area. One primary action, a short step indicator, large touch targets, no horizontal scrolling, and **Set up later** for optional configuration are required across sizes. Advanced credentials and administration remain separate screens.

## Owner Homepage and Daily Priority

After setup, the owner lands on a daily business homepage. It is not a wall of analytics; it is a command centre that answers: **Is anything urgent, and what should I do next?**

The display priority is:

1. **Needs attention now** — low stock, pending or failed M-Pesa, cash variance, Deni follow-up, synchronization problems, and approvals.
2. **Know your cash** — sales, cash received, confirmed M-Pesa, pending M-Pesa, and outstanding Deni shown separately.
3. **Know your stock** — low-stock products, fast-moving products, and restocking work.
4. **Understand your customers** — outstanding Deni, returning customers, and useful customer activity.
5. **Grow your business** — explainable recommendations based on sufficient business history.

For one shop, the owner sees the active shop name and location, sync status, attention items, today’s money, quick actions, stock, customers, and business decisions:

```text
DukaFlow
Welcome back, Mary
Mwangaza Duka · Kawangware Market
[Switch shop]                         Sync: OK

NEEDS ATTENTION
⚠ 6 products are low
⚠ 1 M-Pesa payment pending
⚠ Deni needs follow-up
[View attention]

TODAY'S MONEY
Sales          KSh 18,450
Cash received  KSh  7,200
M-Pesa         KSh 10,850
Deni           KSh    400
[View money]

QUICK ACTIONS
[New sale] [Products]
[Stock]    [Customers]

STOCK
6 products low in stock · Cooking oil moving quickly
[View stock]

CUSTOMERS
3 Deni balances outstanding · 12 returning customers
[View customers]

BUSINESS DECISIONS
Restock cooking oil · Follow up outstanding Deni
[View insights]

[Home] [Sell] [Stock] [More]
```

For multiple shops, the owner first sees a combined organization summary and then a traceable shop breakdown. Combined totals must never hide differences between shops:

```text
ALL SHOPS — TODAY                              Sync: OK

NEEDS ATTENTION
8 low-stock products · 2 pending M-Pesa · 3 Deni follow-ups

COMBINED MONEY
Sales: KSh 31,250   Cash: KSh 13,900
M-Pesa: KSh 16,750  Deni: KSh 600

SHOP BREAKDOWN
Mavueni Shop   KSh 18,450 sales   6 low-stock   [Open shop]
Kilifi Shop    KSh 12,800 sales   2 pending     [Open shop]

BUSINESS DECISIONS
Restock cooking oil at Mavueni
Review pending M-Pesa at Kilifi
```

Every total and recommendation must drill down to the shop and records behind it. If there is not enough history, show that limitation clearly instead of inventing an insight. Mobile uses one vertical flow; tablet uses a flexible centered layout; desktop may use a sidebar and wider cards. The content order and business rules remain the same, with no horizontal scrolling.

## Navigation and tabs

The homepage is the owner’s daily business command centre. The tabs are the work areas reached from that homepage.

### Main tabs

| Tab | Purpose | Typical users |
|---|---|---|
| **Home** | Daily summary, urgent attention, cash, stock alerts, customers, and business decisions. | Owner and authorized helpers |
| **Sell** | Create sales, select products, choose Cash, M-Pesa, or Deni, and issue receipts. | Owner and sales helpers |
| **Products** | Manage product definitions, categories, prices, units, SKU/barcode, and active status. | Owner and authorized product users |
| **Inventory** | View stock balances, receive stock, count stock, adjust stock, transfer stock, and inspect movement history. | Owner and inventory users |
| **Customers** | View customer history, repeat customers, Deni balances, and customer activity. | Owner and authorized customer users |
| **Payments** | Review Cash, M-Pesa, Deni, pending payments, references, and reconciliation. | Owner and payment-authorized users |
| **Tasks / Approvals** | Show refunds, stock adjustments, price changes, transfers, and reconciliation work requiring attention. | Owners and approvers |
| **Reports / Insights** | Show sales, stock, cash, customer history, and explainable growth recommendations. | Owner and authorized managers |
| **People / Access** | Invite helpers, assign shops, create permission templates, edit access, and manage invitations. | Owner or authorized administrator |
| **Settings** | Manage shop profile, location, photo, M-Pesa, Deni, suppliers, business preferences, and organization settings. | Owner and authorized administrators |

### Mobile navigation

Mobile shows only the most frequent actions in the bottom navigation:

```text
[Home] [Sell] [Stock] [More]
```

The **Stock** item opens Inventory. **More** contains less frequent areas:

```text
More
├── Products
├── Customers
├── Payments
├── Tasks / Approvals
├── Reports / Insights
├── People / Access       owner or authorized administrator
└── Settings              authorized users
```

### Desktop navigation

Desktop may display the full sidebar because there is more space:

```text
Home
Sell
Products
Inventory
Customers
Payments
Tasks / Approvals
Reports / Insights
People / Access
Settings
```

The desktop layout must not introduce different business questions or workflows. It only provides more room to show the same information.

### Products versus Inventory

These areas must remain separate:

```text
Products
= What the item is

Inventory
= How many of that item each shop has
```

For example, Products stores the name, category, unit, selling price, cost, and active state for `Unga Jogoo 2kg`. Inventory stores the separate quantity for each shop, such as 30 packets at Mwangaza Duka and 12 packets at Kilifi Shop.

### Access and visibility

The owner normally has access to all tabs, but the homepage remains the first screen. A helper sees only tabs allowed by the helper’s active shop assignment, effective permissions, visibility, availability, and approval authority. Hidden navigation is not a security boundary; Supabase RLS and server-side authorization must enforce the same restrictions.

### MVP priority

The first MVP should prioritize **Home, Sell, Products, Inventory, Customers, Payments, and Settings**. Tasks / Approvals, Reports / Insights, People / Access, and advanced organization controls appear progressively as the shop becomes more complex.

## User and access model

DukaFlow does not require every business to have a manager, cashier, and inventory operator. The detailed access contract is operation-based: every area defines separate **Read**, **Write**, **Request**, **Approve**, and **Restricted** capabilities. See [User responsibilities and access model](docs/user-responsibilities.md#operation-level-permission-model) for the canonical permission matrix and restriction rules.

The fundamental model is:

```text
User identity
   ↓
Organization
   ↓
Owner OR Staff
   ↓
Shop assignment(s)
   ↓
Permissions
   ↓
Data visibility
   ↓
Approval authority
   ↓
Shift / operational responsibility
   ↓
Device / session
   ↓
Audit trail
```

### Owner

The owner creates and manages the organization, creates shops, adds workers, assigns workers to one or more shops, grants permissions, and oversees business operations.

### Staff

Staff are invited by the owner and can be assigned to one or more shops. A staff member can receive any combination of permissions required by the actual business.

Terms such as **Cashier, Inventory, Manager/Supervisor, or Sales Attendant** are optional permission templates only. They are not mandatory user identities and do not replace explicit authorization checks.

### Shop selection

```text
One assigned shop
    ↓
open shop automatically after login

Multiple assigned shops
    ↓
show shop selector

No active assignment
    ↓
deny operational access and instruct staff to contact the owner/administrator
```

## Primary MVP merchant

The reference merchant is an **owner-operated general retail duka / small shop**.

The design can grow into minimarkets, agrovets, hardware shops, specialized retailers, supermarkets, and multi-branch businesses without changing the core transaction semantics.

## Core merchant workflow

```text
AUTHENTICATE
   ↓
ORGANIZATION / SHOP CONTEXT
   ↓
ADD PRODUCTS
   ↓
SELL
   ├── CASH
   ├── M-PESA
   └── DENI
   ↓
UPDATE INVENTORY
   ↓
RECEIPT
   ↓
CONTINUE OFFLINE
   ↓
LOCAL OUTBOX
   ↓
RECONNECT
   ↓
SAFE SYNCHRONIZATION
   ↓
BUSINESS HISTORY
   ↓
INSIGHTS
```

## Architecture

```text
DUKAFLOW
   │
   ├── Identity: Supabase Auth
   │
   ├── Tenant: Organization → Shops
   │
   ├── Access: Staff → Shop assignments → Permissions
   │
   ├── Merchant POS: React + Vite
   │
   ├── Local-first data: Dexie / IndexedDB
   │
   ├── Outbox + idempotent synchronization
   │
   └── Cloud authority: Supabase PostgreSQL + RLS
```

The local database is operational state. Supabase/PostgreSQL is the synchronized server-side business boundary.

## Technology foundation

- React + TypeScript + Vite
- Dexie + IndexedDB
- Supabase Auth
- Supabase PostgreSQL
- PostgreSQL RLS
- Supabase Storage
- Supabase Edge Functions where privileged server operations are required
- Zod
- Vitest

The architecture starts as a modular monolith and introduces additional infrastructure only when measured scale or risk requires it.

## Inventory and transaction truth

Inventory is movement-based:

```text
Opening stock
   ↓
Purchases / receiving
   ↓
Sales
   ↓
Adjustments / returns / transfers
```

A completed sale should create the relevant payment, inventory, receipt, audit and synchronization effects through a controlled transaction path.

## Security

Security is part of the foundation:

```text
Supabase Auth
   ↓
Organization membership
   ↓
Owner / Staff
   ↓
Shop assignment
   ↓
Permissions
   ↓
Data visibility / approval
   ↓
PostgreSQL RLS
   ↓
Server-side validation
   ↓
Audit + device + sync controls
```

Client-side checks are UX controls, not security boundaries. Privileged secrets stay server-side.

## MVP scope

### Build first

- Shop bootstrap
- Authentication and sessions
- Organization/store membership
- Owner/staff access model
- Shop assignment
- Permission enforcement
- Products and categories
- Cash sales
- M-Pesa payment/reference capture
- Deni/customer credit
- Inventory movements
- Receipts
- Daily sales visibility
- Offline operation
- Outbox and safe synchronization
- Security/audit foundations

### Later

- Expanded purchasing and supplier workflows
- Expenses and richer reporting
- Automated M-Pesa reconciliation
- Hardware integrations
- Public storefront
- Online ordering
- Multi-branch operations
- Advanced analytics
- Delivery/commerce services
- Embedded financial services

## Current status

The repository is in the **foundation-building stage**.

Established areas include the Kenyan merchant/product thesis, authentication and tenant architecture, Postgres/RLS foundation, local Dexie data layer, transaction/domain boundaries, synchronization model, public-store boundary, and security documentation.

The foundation is not considered production-complete until the security verification checklist and end-to-end transaction/synchronization tests are exercised.

## Next implementation milestone

```text
Sign in
  ↓
Bootstrap / select organization context
  ↓
Create/select shop
  ↓
Add product
  ↓
Opening stock
  ↓
Create sale
  ↓
Cash / M-Pesa / Deni
  ↓
Inventory update
  ↓
Receipt
  ↓
Offline restart
  ↓
Sync
```

## Important architectural rules

1. The UI must not own business truth.
2. Every business record must have a clear organization/store ownership path.
3. Owner/staff identity is separate from shop assignment and permissions.
4. Permission templates are convenience bundles; explicit permissions are the actual authorization boundary.
5. Shop scope, data visibility, and approval authority are separate controls.
6. One assigned shop opens automatically; multiple assignments require a shop selector.
7. Financial and inventory corrections are explicit and auditable.
8. Offline operations require stable operation identity and idempotent synchronization.
9. External services such as M-Pesa and WhatsApp are adapters, not dependencies of the core POS workflow.
10. Public storefront data is explicitly published and isolated from private merchant data.

## Why DukaFlow exists

The goal is not to make a small shop look like a large enterprise.

The goal is to give an ordinary Kenyan shop owner a dependable digital operating system that fits the reality of the shop today and can grow with the business tomorrow.

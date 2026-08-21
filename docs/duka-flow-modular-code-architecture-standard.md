# DukaFlow Modular Code Architecture Standard

**Source of truth for repository structure, module ownership, folder naming, file naming, dependency boundaries, and technical organization.**

## 1. Architecture decision

DukaFlow uses a **modular monolith**.

The primary unit of organization is the **business capability**, not a global technical layer.

We do not organize the whole application as:

```text
src/domain/
src/application/
src/infrastructure/
src/presentation/
```

with every capability scattered across those folders.

Instead, each capability owns its own domain rules, use cases, infrastructure, and presentation:

```text
src/modules/<capability>/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

This keeps sales, inventory, payments, Deni, purchasing, reconciliation, and other capabilities understandable as independent modules while remaining in one deployable application.

## 2. Target repository structure

```text
/
├── docs/
├── public/
├── src/
│   ├── app/
│   │   ├── bootstrap/
│   │   ├── config/
│   │   ├── providers/
│   │   ├── routes/
│   │   └── app.tsx
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── organizations/
│   │   ├── shops/
│   │   ├── staff/
│   │   ├── catalog/
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── payments/
│   │   ├── customers/
│   │   ├── deni/
│   │   ├── purchasing/
│   │   ├── suppliers/
│   │   ├── cash/
│   │   ├── reconciliation/
│   │   ├── subscriptions/
│   │   ├── sync/
│   │   ├── audit/
│   │   ├── notifications/
│   │   └── insights/
│   │
│   ├── platform/
│   │   ├── database/
│   │   ├── auth/
│   │   ├── secrets/
│   │   ├── telemetry/
│   │   └── runtime/
│   │
│   ├── shared/
│   │   ├── ui/
│   │   ├── errors/
│   │   ├── formatting/
│   │   ├── validation/
│   │   └── time/
│   │
│   ├── main.tsx
│   └── styles/
│       └── globals.css
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── config.toml
│
├── tests/
│   ├── integration/
│   └── e2e/
│
├── architecture.md
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

Only create a directory when code actually needs it.

## 3. Module ownership

Each business fact has one clear owning module.

```text
organizations → merchant business identity
shops         → physical/operational shop
staff         → merchant staff relationships and access
catalog       → products and product configuration
inventory     → stock movements and stock state
sales         → what was sold
payments      → money/payment events
customers     → customer identity/relationship
 deni         → customer receivable ledger
purchasing    → purchases and receiving workflow
suppliers     → supplier relationships
cash          → cash movements
reconciliation → comparison and settlement verification
subscriptions → DukaFlow commercial entitlement
sync          → offline/remote synchronization
 audit         → audit evidence
notifications → communication intents/delivery boundaries
insights      → derived intelligence
```

A module must not quietly create a competing source of truth owned by another module.

## 4. Internal module structure

Example:

```text
src/modules/sales/
├── domain/
│   ├── sale.ts
│   ├── sale-item.ts
│   ├── settlement.ts
│   ├── sale-policy.ts
│   └── sale-events.ts
├── application/
│   ├── complete-sale.ts
│   ├── return-sale.ts
│   ├── refund-sale.ts
│   └── ports.ts
├── infrastructure/
│   ├── local/
│   ├── remote/
│   └── mappers/
├── presentation/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── view-models/
└── index.ts
```

A small capability may use fewer folders. Structure follows responsibility, not symmetry.

## 5. `domain/`

Contains pure business truth:

- entities;
- value objects;
- invariants;
- state transitions;
- policies;
- pure calculations;
- domain events.

Domain code must not import React, Supabase SDKs, Dexie, browser APIs, or payment-provider SDKs.

Example:

```text
sales/domain/settlement.ts
```

may enforce:

```text
paid_now + pay_later = sale_total
```

It must not know how M-Pesa or a bank works.

## 6. `application/`

Contains use cases and orchestration for the module.

Use business verbs:

```text
complete-sale.ts
record-payment.ts
record-deni-repayment.ts
receive-purchase.ts
reconcile-cash.ts
assign-shop.ts
```

Use cases may depend on module domain rules and explicit ports/contracts. They must not depend on concrete Supabase, Dexie, or provider SDK implementations.

## 7. `infrastructure/`

Contains technical implementations for the module.

Examples:

```text
sales/infrastructure/local/
sales/infrastructure/remote/
payments/infrastructure/providers/
payments/infrastructure/mappers/
```

Provider-specific terminology stays here.

For the current MVP, M-Pesa is only a **recorded payment method**. No live M-Pesa adapter, STK Push, callback, or provider credential code should exist until the integration phase is approved and implemented.

## 8. `presentation/`

The UI for a capability lives with that capability.

Example:

```text
src/modules/sales/presentation/
├── components/
│   ├── cart.tsx
│   ├── sale-summary.tsx
│   └── payment-method-picker.tsx
├── pages/
│   └── checkout-page.tsx
├── hooks/
│   └── use-sale-cart.ts
└── view-models/
    └── checkout-view-model.ts
```

Pages and components must not perform direct business database mutations or call provider APIs directly.

## 9. `src/app/`

Application composition only:

- bootstrap;
- global providers;
- dependency wiring;
- routing;
- application shell;
- top-level error handling.

`src/app/app.tsx` is not a business module and must not become another giant business file.

## 10. `src/platform/`

Technical services belonging to DukaFlow itself:

- Supabase client/database setup;
- runtime/environment handling;
- secret access;
- telemetry;
- generic platform infrastructure.

Platform code is not a replacement for business modules.

## 11. `src/shared/`

Only genuinely cross-cutting code with no business owner.

Good examples:

- generic UI primitives;
- date/time formatting;
- generic error/result types;
- generic validation helpers.

`shared/` must never become a dumping ground.

## 12. Dependency rules

Inside a module:

```text
presentation
    ↓
application
    ↓
domain
```

Infrastructure implements the contracts required by application/domain code.

Across modules:

```text
module A application
        ↓
explicit public contract of module B
        ↓
module B application/domain
```

Never import another module's private repository, provider implementation, UI internals, or database details.

Prohibited examples:

```text
sales → payments private repository
sales → Supabase table directly
UI → M-Pesa SDK
inventory → payment provider internals
domain → browser API
```

## 13. Naming conventions

### Folders

Use **lowercase kebab-free nouns** for folders:

```text
sales
payments
inventory
reconciliation
```

Use plural nouns for capability modules.

### TypeScript files

Use **kebab-case**:

```text
complete-sale.ts
sale-repository.ts
payment-status.ts
use-active-shop.ts
```

### React files

Also use kebab-case:

```text
checkout-page.tsx
sale-summary.tsx
shop-switcher.tsx
```

Component identifiers use PascalCase.

### Functions

Use precise verbs:

```text
completeSale()
recordPayment()
assignUserToShop()
reconcileCash()
```

Avoid generic names such as `process`, `handle`, `manager`, and `utils` when a precise business name exists.

### Types

Use PascalCase without unnecessary prefixes:

```text
Sale
Payment
PaymentStatus
ShopAssignment
```

### Tests

Colocate focused unit tests:

```text
complete-sale.ts
complete-sale.test.ts
```

Use `tests/integration` and `tests/e2e` for cross-module/infrastructure journeys.

## 14. Naming business concepts

Use DukaFlow's agreed vocabulary consistently.

- `sale` = commercial event of goods being sold.
- `payment` = money received or external payment workflow.
- `deni` = customer receivable ledger.
- `pay-later` = checkout decision/action.
- `shop` = merchant operating location.
- `organization` = merchant business boundary.
- `user` = authenticated person identity.
- `staff` = merchant operating relationship.

Do not use `cashier`, `manager`, or `supervisor` as identity types. Those remain template/permission terminology.

## 15. Provider adapters

External services must never become the domain model.

Future payment structure:

```text
src/modules/payments/
├── domain/
├── application/
└── infrastructure/
    └── providers/
        ├── mpesa/
        ├── bank/
        └── card/
```

Provider fields such as `CheckoutRequestID`, shortcode identifiers, callback payloads, or provider status codes remain inside the adapter boundary.

The core `payments` module exposes DukaFlow payment concepts, not provider-specific payloads.

## 16. Database standard

Durable business data is PostgreSQL through Supabase.

Tables use snake_case plural nouns:

```text
organizations
shops
organization_memberships
shop_assignments
permission_templates
products
shop_products
sales
sale_items
payments
deni_ledger_entries
inventory_movements
customers
suppliers
purchases
purchase_items
cash_movements
reconciliation_records
subscriptions
audit_events
```

Primary keys normally use `id`.

Foreign keys use `<entity>_id`.

Business timestamps use explicit names such as `created_at`, `updated_at`, `occurred_at`, `settled_at`, and `recorded_at`.

## 17. Supabase migrations

Use chronological descriptive filenames:

```text
YYYYMMDDHHMMSS_short_description.sql
```

One migration should have one coherent schema purpose.

Never rewrite an applied migration. Add a new migration.

## 18. Edge Functions

`supabase/functions/` contains narrow server-side boundaries.

Examples:

```text
complete-sale/
sync-operations/
payment-webhook/
process-notification/
```

An Edge Function may invoke application use cases, but it must not become a second copy of the domain model.

## 19. Offline-first structure

Dexie/IndexedDB remains local persistence, not canonical business truth.

Module-specific local persistence belongs with the module:

```text
src/modules/sales/infrastructure/local/
src/modules/inventory/infrastructure/local/
```

Synchronization belongs to the `sync` module:

```text
src/modules/sync/
```

Every remote-bound mutation must have a stable operation identity, retry behavior, and explicit synchronization state.

## 20. Transitional migration of the current repository

The current repository already has:

```text
src/application/
src/domain/
src/infrastructure/
src/App.tsx
```

These are transitional and must not be expanded further as the permanent architecture.

Migration must be incremental:

```text
1. Identify the owning business module.
2. Move the domain rules into that module.
3. Move use cases into that module.
4. Move infrastructure adapters into that module.
5. Move its UI into that module.
6. Update imports and public module contracts.
7. Add/adjust tests.
8. Verify behavior.
9. Remove the old duplicate location.
```

Do not perform a blind mass move.

## 21. Current MVP payment boundary

The current implementation intentionally uses:

```text
Seller
 ↓
Cart
 ↓
Cash or M-Pesa
 ↓
Record payment
 ↓
Complete sale
```

There is **no live M-Pesa integration yet**.

Therefore the current code must not contain fake STK Push, callback, Daraja credential, or provider-confirmation behavior.

Future integration will plug into the `payments` module without changing the meaning of a sale.

## 22. Large-file rule

No file is a permanent dumping ground.

In particular:

- `src/App.tsx` must be decomposed;
- presentation must not own business rules;
- business modules must not depend on each other's private internals;
- provider handlers must remain narrow;
- database schemas must not be duplicated in unrelated TypeScript modules.

## 23. Final placement test

For any new code, ask:

1. **Which business capability owns this fact?**
2. **Is it domain, application, infrastructure, or presentation code?**
3. **What public contract does another module need?**
4. **Can the implementation change without rewriting the business rule?**

If these answers are unclear, the code is not ready to be placed.

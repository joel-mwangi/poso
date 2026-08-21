# DukaFlow Code Structure & Naming Standard

**This document is the source of truth for repository structure, folder ownership, file naming, module boundaries, import direction, and naming conventions in the DukaFlow codebase.**

## 1. Purpose

DukaFlow is an offline-first POS and shop operating system that must grow from a one-person Kenyan shop to staffed and multi-shop businesses without turning the codebase into a collection of tightly coupled screens.

This standard exists to keep the codebase:

- predictable;
- modular;
- searchable;
- testable;
- easy to review;
- safe to extend;
- aligned with the domain model;
- independent of provider-specific details where possible.

The repository already has the beginnings of this separation with `src/application`, `src/domain`, and `src/infrastructure`, while the current top-level `src/App.tsx` remains large and is transitional. The current structure should be treated as a baseline to refactor toward this standard, not as the final arrangement.

## 2. Current technical baseline

The repository currently uses:

- React;
- TypeScript;
- Vite;
- Supabase;
- PostgreSQL through Supabase;
- Dexie / IndexedDB for local persistence;
- Zod;
- Vitest;
- ESLint.

The target architecture keeps these technologies unless a separate architecture decision explicitly replaces one.

## 3. High-level repository structure

The preferred repository structure is:

```text
/
├── docs/
├── public/
├── src/
│   ├── app/
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   ├── presentation/
│   ├── shared/
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── config.toml
├── tests/
│   ├── integration/
│   └── e2e/
├── architecture.md
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

Not every directory must exist on day one. A directory is added when the codebase actually needs it.

## 4. Folder ownership

### `src/app/`

Application composition and bootstrapping.

Use for:

- application providers;
- routing;
- dependency wiring;
- environment loading;
- global application configuration;
- top-level error boundaries;
- application initialization.

Do not put domain rules here.

### `src/application/`

Use-case orchestration.

This layer answers:

> **What operation is the user/system trying to perform?**

Examples:

```text
application/
├── auth/
├── catalog/
├── sales/
├── payments/
├── inventory/
├── customers/
├── deni/
├── purchasing/
├── reconciliation/
├── staff/
├── shops/
└── sync/
```

A use case coordinates domain rules and ports. It should not know how PostgreSQL, Dexie, or a specific payment provider works.

### `src/domain/`

Core business truth and rules.

Use for:

- entities;
- value objects;
- domain types;
- domain invariants;
- domain services;
- domain events;
- pure calculations;
- business policies that must hold regardless of UI or infrastructure.

The domain must not import React, Supabase, Dexie, browser APIs, or provider SDKs.

### `src/infrastructure/`

Implementations of external or technical concerns.

Preferred structure:

```text
infrastructure/
├── local/
│   ├── dexie/
│   ├── repositories/
│   └── outbox/
├── supabase/
│   ├── client/
│   ├── repositories/
│   ├── auth/
│   └── functions/
├── integrations/
│   ├── mpesa/
│   ├── bank/
│   ├── card/
│   ├── sms/
│   └── whatsapp/
├── device/
├── printing/
└── telemetry/
```

Infrastructure owns provider-specific implementation details.

For the current MVP, M-Pesa is a **recorded payment method**, not a live integration. The `mpesa` integration adapter should only be introduced when live integration is actually approved and implemented.

### `src/presentation/`

User-facing React code.

Preferred structure:

```text
presentation/
├── routes/
├── layouts/
├── pages/
├── features/
├── components/
└── hooks/
```

Presentation code may call application use cases through approved interfaces, but it must not directly implement database writes, payment-provider calls, or business invariants.

### `src/shared/`

Small cross-cutting utilities that genuinely have no business ownership.

Examples:

- date/time utilities;
- formatting;
- generic result types;
- logging interfaces;
- small validation helpers;
- constants shared across multiple layers.

Do not turn `shared/` into a dumping ground. If code belongs to a domain, keep it in that domain.

## 5. Domain-oriented modules inside each layer

DukaFlow should use stable business vocabulary in folder names.

Preferred domains:

- `auth`
- `organizations`
- `shops`
- `staff`
- `catalog`
- `inventory`
- `sales`
- `payments`
- `deni`
- `customers`
- `purchasing`
- `suppliers`
- `cash`
- `reconciliation`
- `subscriptions`
- `notifications`
- `sync`
- `audit`
- `insights`

Singular/plural rule:

- Use **plural nouns for feature/domain directories**: `sales`, `payments`, `customers`.
- Use **singular nouns for an individual type/file when that is the natural name**: `sale.ts`, `payment.ts`, `customer.ts`.

## 6. Recommended internal module structure

A mature domain may use:

```text
src/application/sales/
├── complete-sale.ts
├── calculate-sale-total.ts
├── return-sale.ts
├── refund-sale.ts
└── ports.ts

src/domain/sales/
├── sale.ts
├── sale-item.ts
├── sale-status.ts
├── settlement.ts
├── sales-policy.ts
└── index.ts

src/infrastructure/local/repositories/
├── local-sale-repository.ts
└── local-payment-repository.ts

src/infrastructure/supabase/repositories/
├── supabase-sale-repository.ts
└── supabase-payment-repository.ts

src/presentation/features/sales/
├── components/
├── hooks/
├── pages/
└── view-models/
```

Do not create every folder automatically. Create the structure as the domain grows.

## 7. Import direction

The allowed dependency direction is:

```text
Presentation
      ↓
Application
      ↓
Domain
      ↑
Infrastructure implements application/domain ports
```

More concretely:

```text
presentation → application
presentation → shared
application → domain
application → ports/interfaces
infrastructure → application/domain
shared → no domain-specific layer
```

The following are prohibited:

```text
Domain → Supabase
Domain → Dexie
Domain → React
Domain → browser APIs
Domain → M-Pesa SDK

UI → Supabase tables directly for business mutations
UI → provider SDK directly
```

## 8. Naming standard

### TypeScript files

Use **kebab-case** for file names.

Examples:

```text
complete-sale.ts
sale-repository.ts
payment-status.ts
shop-assignment.ts
use-active-shop.ts
```

Do not use:

```text
CompleteSale.ts
saleRepository.ts
payment_status.ts
```

### React components

React component identifiers use **PascalCase**.

Examples:

```text
CheckoutPage
SaleSummary
PaymentMethodPicker
ShopSwitcher
```

File names for React components remain kebab-case:

```text
checkout-page.tsx
sale-summary.tsx
payment-method-picker.tsx
shop-switcher.tsx
```

### Hooks

Use the `use-` prefix in file names and `useX` in identifiers.

```text
use-active-shop.ts
use-sale-cart.ts
use-sync-status.ts
```

### Tests

Prefer adjacent unit tests for focused modules:

```text
complete-sale.ts
complete-sale.test.ts
```

Use `__tests__/` for grouped integration-style tests when useful.

End-to-end tests belong under the top-level `tests/e2e/` directory.

### Constants

Use descriptive names rather than generic abbreviations.

```text
MAX_OFFLINE_RETRY_COUNT
DEFAULT_CURRENCY
```

### Types

Type names use PascalCase.

```ts
Sale
SaleItem
PaymentStatus
ShopAssignment
SubscriptionEntitlement
```

Avoid prefixes such as `IUser`, `IShop`, or `TPayment` unless a specific technical constraint justifies them.

### Functions

Use verbs for operations.

```ts
completeSale()
recordPayment()
createCustomer()
assignUserToShop()
reconcileCash()
```

Avoid vague names:

```ts
process()
handle()
manage()
doIt()
```

when a more precise business verb exists.

## 9. Naming business concepts

Use the agreed DukaFlow vocabulary consistently.

### Sale

Use `sale`, not `transaction`, when referring to the commercial event of goods being sold.

### Payment

Use `payment` for money actually received or an external payment workflow.

### Pay Later / Deni

Use `deni` for the customer receivable ledger and `payLater` for the action/decision where appropriate.

Do not model Deni as a payment method enum.

### Shop

Use `shop` in the domain vocabulary even if external providers or technical code use terms such as `store`, `shortcode`, `till`, or `branch`.

Provider-specific terminology should remain inside the relevant adapter or integration module.

### Organization

Use `organization` for the merchant business tenant.

Never use `tenant` in merchant-facing domain code unless there is a specific infrastructure reason.

### User / Staff

`User` means authenticated person identity.

`Staff` means a person's merchant operating relationship.

Do not use `cashier`, `manager`, or `supervisor` as primary identity types.

## 10. Use-case naming

Application use cases should use clear business verbs.

Preferred:

```text
create-organization.ts
create-shop.ts
invite-staff.ts
assign-shop.ts
set-permissions.ts
create-product.ts
record-opening-stock.ts
complete-sale.ts
record-payment.ts
record-deni-repayment.ts
receive-purchase.ts
record-expense.ts
reconcile-cash.ts
```

Avoid generic service files such as:

```text
shop-service.ts
business-service.ts
helper.ts
manager.ts
utils.ts
```

unless the file has a genuinely shared responsibility that cannot be named more precisely.

## 11. Repository naming

Repository interfaces should describe the domain object and capability.

Examples:

```text
sale-repository.ts
payment-repository.ts
inventory-movement-repository.ts
customer-repository.ts
```

Implementations should identify the infrastructure:

```text
local-sale-repository.ts
supabase-sale-repository.ts
```

Do not call every implementation `repository.ts`.

## 12. Provider adapter naming

External integrations must be isolated behind provider-neutral application interfaces.

Example:

```text
src/application/payments/
├── payment-provider.ts
├── initiate-payment.ts
└── record-external-payment.ts

src/infrastructure/integrations/
├── mpesa/
│   ├── mpesa-payment-provider.ts
│   ├── mpesa-client.ts
│   └── mpesa-mappers.ts
├── bank/
│   └── bank-payment-provider.ts
└── card/
    └── card-payment-provider.ts
```

Provider-specific field names such as `CheckoutRequestID`, `BusinessShortCode`, or provider callback payload types must not leak into core sales/domain types.

## 13. Database naming

PostgreSQL table names should use **snake_case plural nouns**.

Examples:

```text
organizations
shops
users
organization_memberships
shop_assignments
permissions
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
audit_events
```

Primary keys should normally be named `id`.

Foreign keys should follow:

```text
organization_id
shop_id
user_id
sale_id
product_id
```

Timestamps should use explicit names such as:

```text
created_at
updated_at
occurred_at
settled_at
```

Avoid ambiguous fields such as `date` or `time` for business events.

## 14. Database migration naming

Supabase migrations must be chronological and descriptive.

Preferred pattern:

```text
YYYYMMDDHHMMSS_short_description.sql
```

Examples:

```text
20260818120000_create_organizations.sql
20260818121500_create_sales.sql
20260818123000_create_inventory_movements.sql
```

One migration should have one coherent schema purpose.

Never rewrite an already-applied migration to change historical schema evolution. Add a new migration.

## 15. Supabase Edge Functions

Each Edge Function should represent a server-side capability or integration boundary.

Preferred naming:

```text
supabase/functions/
├── complete-sale/
├── reconcile-payment/
├── sync-operations/
├── process-notification/
└── payment-webhook/
```

Use kebab-case directory names.

A function should have one clear responsibility.

Examples:

`complete-sale` enforces a server-authoritative sale completion boundary.

`payment-webhook` handles provider callback ingress and normalization.

It should not contain the entire business domain in one giant function.

## 16. Local/offline structure

Dexie/IndexedDB code belongs under infrastructure/local.

Preferred pattern:

```text
src/infrastructure/local/
├── dexie/
│   ├── database.ts
│   ├── schema.ts
│   └── tables/
├── repositories/
├── outbox/
└── sync/
```

Local storage schemas should not become the domain model automatically.

The local database is an implementation of offline persistence, not the canonical business definition.

## 17. Presentation structure

Prefer feature-oriented UI structure.

```text
src/presentation/features/sales/
├── components/
│   ├── cart.tsx
│   ├── sale-summary.tsx
│   ├── payment-method-picker.tsx
│   └── customer-picker.tsx
├── pages/
│   └── checkout-page.tsx
├── hooks/
│   └── use-sale-cart.ts
└── view-models/
    └── checkout-view-model.ts
```

Keep reusable global UI separate:

```text
src/presentation/components/
├── button.tsx
├── modal.tsx
├── input.tsx
└── empty-state.tsx
```

A component belongs in global `components/` only when it is genuinely reusable across unrelated features.

## 18. Large-file rule

No file should become a permanent dumping ground.

As a practical rule:

- a file that mixes multiple domain responsibilities must be split;
- UI pages should not contain database schema definitions;
- application use cases should not contain large React components;
- domain modules should remain framework-independent;
- provider callbacks should not contain unrelated business workflows.

The current `src/App.tsx` is large and transitional. It should be decomposed gradually into `presentation/`, `application/`, and domain modules without changing business behavior during the refactor.

## 19. Test structure

### Unit tests

Keep business-rule tests close to their modules.

```text
src/domain/sales/sale.ts
src/domain/sales/sale.test.ts
```

### Application tests

Test use-case orchestration and authorization.

```text
src/application/sales/complete-sale.ts
src/application/sales/complete-sale.test.ts
```

### Integration tests

Use `tests/integration/` for tests involving actual infrastructure boundaries such as PostgreSQL/RLS or sync flows.

### End-to-end tests

Use `tests/e2e/` for realistic merchant journeys:

- one-person shop;
- staffed shop;
- multi-shop user;
- sale with cash;
- sale with recorded M-Pesa;
- full Deni;
- partial payment + Deni;
- stock receiving;
- reconciliation;
- offline sale and synchronization.

## 20. Environment and secrets

Never commit provider credentials or production secrets.

Use environment variables only for non-secret configuration that is safe for the relevant runtime and protected secret stores for actual sensitive secrets.

Client-side environment variables must never contain server-only credentials.

Provider secrets belong to server/infrastructure boundaries, not React components.

## 21. Import aliases

Use a single stable alias convention for `src` imports once configured.

Preferred:

```text
@/app/...
@/application/...
@/domain/...
@/infrastructure/...
@/presentation/...
@/shared/...
```

Avoid long chains of relative imports such as:

```text
../../../../../../domain/...
```

Do not introduce multiple competing alias styles.

## 22. Naming abbreviations

Avoid abbreviations unless they are universally understood within the project.

Preferred:

```text
customer
organization
payment
inventory
reconciliation
subscription
```

Avoid:

```text
cust
org
pmt
inv
recon
sub
```

External-provider abbreviations such as `M-Pesa`, `OTP`, `API`, and `RLS` are acceptable where they are the established external term.

## 23. Comments and documentation in code

Code should explain **why**, not repeat obvious syntax.

Good:

```ts
// Preserve the original sale amount; Deni repayments are separate ledger events.
```

Avoid:

```ts
// Add two numbers.
const total = a + b;
```

Business invariants that are easy to misunderstand should be documented near the implementation or referenced from the relevant source-of-truth document.

## 24. Source-of-truth rule

Code structure must follow the documented architecture, not the other way around.

The relationship is:

```text
Product / domain documents
        ↓
Technical architecture
        ↓
Code structure
        ↓
Implementation
```

If implementation constraints reveal a genuine architectural problem, update the architecture/documentation first or together with the code change.

Do not silently change domain meaning because the current folder structure is inconvenient.

## 25. Transitional refactor rule

Existing code may temporarily violate this standard while the repository is being reorganized.

Refactors should be incremental:

```text
Existing behavior
      ↓
Characterization tests
      ↓
Move code to correct layer/domain
      ↓
Update imports
      ↓
Verify behavior
      ↓
Remove obsolete structure
```

Do not combine large structural rewrites with unrelated business-rule changes unless necessary.

## 26. Proposed target tree

The repository should converge toward:

```text
src/
├── app/
│   ├── providers/
│   ├── router/
│   ├── config/
│   └── bootstrap.ts
│
├── application/
│   ├── auth/
│   ├── organizations/
│   ├── shops/
│   ├── staff/
│   ├── catalog/
│   ├── inventory/
│   ├── sales/
│   ├── payments/
│   ├── deni/
│   ├── customers/
│   ├── purchasing/
│   ├── suppliers/
│   ├── cash/
│   ├── reconciliation/
│   ├── subscriptions/
│   ├── audit/
│   └── sync/
│
├── domain/
│   ├── organizations/
│   ├── shops/
│   ├── staff/
│   ├── catalog/
│   ├── inventory/
│   ├── sales/
│   ├── payments/
│   ├── deni/
│   ├── customers/
│   ├── purchasing/
│   ├── suppliers/
│   ├── cash/
│   ├── reconciliation/
│   ├── subscriptions/
│   └── shared/
│
├── infrastructure/
│   ├── local/
│   │   ├── dexie/
│   │   ├── repositories/
│   │   ├── outbox/
│   │   └── sync/
│   ├── supabase/
│   │   ├── auth/
│   │   ├── repositories/
│   │   └── clients/
│   ├── integrations/
│   │   ├── mpesa/
│   │   ├── bank/
│   │   ├── card/
│   │   └── communications/
│   ├── device/
│   ├── printing/
│   └── telemetry/
│
├── presentation/
│   ├── routes/
│   ├── layouts/
│   ├── pages/
│   ├── features/
│   ├── components/
│   └── hooks/
│
└── shared/
    ├── formatting/
    ├── validation/
    ├── logging/
    ├── result/
    └── utilities/
```

## 27. Non-negotiable rules

1. **Business vocabulary in code must match the DukaFlow domain vocabulary.**
2. **The domain layer must remain independent of React, Supabase, Dexie, and external providers.**
3. **Presentation code does not directly own business mutations.**
4. **Provider-specific code stays behind integration adapters.**
5. **Database tables use snake_case plural nouns.**
6. **TypeScript files use kebab-case.**
7. **React components use PascalCase identifiers.**
8. **Use-case names are explicit business verbs.**
9. **No generic dumping-ground files or folders such as `utils.ts` for unrelated logic.**
10. **M-Pesa integration code is not part of the current manual-M-Pesa MVP until live integration is explicitly activated.**
11. **Tests must follow the same domain/layer boundaries as production code.**
12. **Existing large files are refactored incrementally with behavior preserved and verified.**
13. **Dependencies flow inward toward domain rules; infrastructure stays replaceable.**
14. **Production credentials never belong in source code or client bundles.**
15. **The main branch's current architecture and source-of-truth documents take precedence over obsolete implementation patterns.**

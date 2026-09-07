# DukaFlow Documentation Catalog & Architecture Blueprint

Welcome to the **DukaFlow** documentation suite. DukaFlow is a smartphone-first, offline-first point-of-sale (POS) and virtual shop manager designed for Kenyan retailers—scaling seamlessly from single-person neighborhood dukas to multi-branch enterprises.

This index organizes all architecture, security, domain, UX, and implementation specifications across the repository.

---

## 1. System Philosophy & Core Invariants

Before writing or modifying any code in DukaFlow, review these non-negotiable foundations:

1. **Smartphone-First & Low-Bandwidth**: Android mobile viewports are the primary interface. Workflows must be fast, legible, and simple with zero unnecessary taps.
2. **Offline-First by Design**: Ordinary retail selling never halts due to lost connectivity. Sales are committed locally to Dexie/IndexedDB, queued in a durable Outbox, and synchronized idempotently when connectivity returns.
3. **Server Authority (PostgreSQL + RLS)**: The browser/IndexedDB store is an operational projection. Supabase PostgreSQL and Row Level Security (RLS) remain the sole canonical source of business truth.
4. **Append-Oriented Ledger Truth**:
   - **Sales** are immutable historical business events.
   - **Inventory** is derived from an append-only movement ledger (`inventory_movements`), never silent stock edits.
   - **Deni (Credit)** is an auditable customer ledger (`deni_ledger_entries`), not a mutable balance column.
   - **Payments** are separate commercial records from sales, supporting split settlements (Cash + M-Pesa + Deni).
5. **Modular Monolith**: Business capabilities (`sales`, `inventory`, `payments`, `deni`, `staff`, etc.) own their internal `domain/`, `application/`, `infrastructure/`, and `presentation/` layers inside `src/modules/<capability>/`.

---

## 2. Master Document Directory

### Category A: Vision, Strategy & Core Principles
High-level direction, business strategy, and product values.

| Document | Description |
|---|---|
| [architecture.md](/architecture.md) | High-level system architecture, boundaries, and layer definitions. |
| [vision.md](/vision.md) | Long-term commercial and operational vision for 100,000 Kenyan merchants. |
| [ideas.md](/ideas.md) | Product principles, merchant realities, and usability insights. |
| [docs/individual-first-growth-principle.md](individual-first-growth-principle.md) | Designing for the one-person shop first; scaling without forced enterprise complexity. |

---

### Category B: Code Architecture & Engineering Standards
Repository layout, module design, naming conventions, and technical boundaries.

| Document | Description |
|---|---|
| [docs/foundation-contract.md](foundation-contract.md) | Non-negotiable engineering rules, dependency directions, and scale strategy. |
| [docs/duka-flow-modular-code-architecture-standard.md](duka-flow-modular-code-architecture-standard.md) | Detailed capability-first modular monolith architecture specification (`src/modules/*`). |
| [docs/duka-flow-code-structure-and-naming-standard.md](duka-flow-code-structure-and-naming-standard.md) | Naming conventions (kebab-case files, PascalCase React), folder ownership, and import rules. |

---

### Category C: Identity, Tenancy, Access Governance & Security
Authentication, authorization, staff permissions, RLS policies, and platform operations.

| Document | Description |
|---|---|
| [docs/access-control-foundation.md](access-control-foundation.md) | Canonical separation between DukaFlow platform administrators and merchant organizations. |
| [docs/post-authentication-access-and-first-screen.md](post-authentication-access-and-first-screen.md) | Authentication lifecycle, organization/shop membership resolution, and post-login landing logic. |
| [docs/user-responsibilities.md](user-responsibilities.md) | Operation-level permission matrix, responsibility templates (Cashier, Supervisor), and approval authorities. |
| [docs/user-lifecycle-and-access-governance.md](user-lifecycle-and-access-governance.md) | Staff onboarding, invitations, shop assignments, suspension, and account deactivation. |
| [docs/security-controls.md](security-controls.md) | Technical controls: Supabase RLS, session handling, secrets management, MFA, and audit trails. |
| [docs/security-readiness.md](security-readiness.md) | Verification standards for auth, tenant isolation, offline integrity, and external adapters. |
| [docs/security-verification-checklist.md](security-verification-checklist.md) | Release gate checklist for production hardening. |

---

### Category D: Domain Capabilities & Data Models
Authoritative specifications of business entities, ledger models, and state transitions.

| Document | Description |
|---|---|
| [docs/duka-flow-domain-and-data-model.md](duka-flow-domain-and-data-model.md) | Unified entity relationship definitions, primary keys, schemas, and source-of-truth rules. |
| [docs/sales-and-settlement-model.md](sales-and-settlement-model.md) | Sale creation, item lines, split payments, receipts, and void/refund transaction flows. |
| [docs/inventory-and-stock-model.md](inventory-and-stock-model.md) | Movement types (receive, sell, adjust, transfer, return), balances, and low-stock alerts. |
| [docs/customer-and-crm-model.md](customer-and-crm-model.md) | Customer profiles, repeat tracking, Deni credit ledger, repayments, and statements. |
| [docs/cash-and-financial-reconciliation-model.md](cash-and-financial-reconciliation-model.md) | Cash drawer ledger, shifts, opening/closing cash counts, expenses, and variance detection. |
| [docs/purchasing-and-suppliers-model.md](purchasing-and-suppliers-model.md) | Supplier records, purchase orders, actual physical receiving, payables, and purchase returns. |
| [docs/duka-flow-subscription-and-entitlement-model.md](duka-flow-subscription-and-entitlement-model.md) | Tiered merchant entitlements, subscription states, feature flags, and limits. |
| [docs/business-insights-and-growth-model.md](business-insights-and-growth-model.md) | Explainable owner metrics, reorder suggestions, dead-stock warnings, and cash flow forecasts. |

---

### Category E: Payment Systems & Integrations
Payment capture, merchant credentials, and Safaricom M-Pesa integration lifecycles.

| Document | Description |
|---|---|
| [docs/merchant-owned-payment-integration-model.md](merchant-owned-payment-integration-model.md) | Security boundary ensuring merchant ownership of Daraja credentials, sandbox vs live. |
| [docs/mpesa-merchant-configuration-and-scope-model.md](mpesa-merchant-configuration-and-scope-model.md) | Organization-wide vs shop-specific Till Number / PayBill configuration and permission rules. |
| [docs/mpesa-integration-model.md](mpesa-integration-model.md) | Technical Daraja integration lifecycle: STK Push, C2B confirmation, webhooks, and manual reference fallback. |
| [docs/bank-payment-integration-model.md](bank-payment-integration-model.md) | Recording bank transfers, cards, and future electronic settlement reconciliation. |

---

### Category F: Offline-First, PWA & Synchronization
Local database architecture, Service Worker lifecycle, outbox pattern, and reconciliation.

| Document | Description |
|---|---|
| [docs/pwa-architecture-and-implementation-plan.md](pwa-architecture-and-implementation-plan.md) | Service worker caching, IndexedDB/Dexie schema, manifest configuration, and offline UX. |
| [docs/offline-online-capability-model.md](offline-online-capability-model.md) | Matrix of offline-supported operations (sales, stock check) vs online-required operations (invites, Daraja). |
| [docs/sync-model.md](sync-model.md) | Durable outbox pattern, idempotency keys, conflict policies, background retry, and server ingestion. |

---

### Category G: User Experience, Onboarding & Workspaces
Product interfaces, responsive UX layouts, onboarding quiz, and operator interfaces.

| Document | Description |
|---|---|
| [docs/general-landing-page-content.md](general-landing-page-content.md) | Public unauthenticated homepage: messaging, brand palette, and visitor journeys. |
| [docs/duka-flow-product-experience-model.md](duka-flow-product-experience-model.md) | Mobile-first UX philosophy, daily rhythm, color tokens, and navigation paradigms. |
| [docs/user-workspace-and-daily-workflow.md](user-workspace-and-daily-workflow.md) | Daily workflows: Owner command center vs Staff shop operations. |
| [docs/platform-administration-and-operations-model.md](platform-administration-and-operations-model.md) | Platform administrator interface: merchant oversight, audit, and support delegation. |

---

### Category H: Roadmap, Implementation Order & Delivery
Execution phases, milestones, dependencies, and database foundations.

| Document | Description |
|---|---|
| [docs/implementation-order.md](implementation-order.md) | Step-by-step dependency-driven implementation plan from Phase 0 foundation to Phase 15 hardening. |
| [docs/duka-flow-mvp-and-implementation-roadmap.md](duka-flow-mvp-and-implementation-roadmap.md) | MVP definition, onboarding setup quiz, Phase 0-8 feature scope, definitions of done, and acceptance journeys. |
| [docs/live-supabase-foundation.md](live-supabase-foundation.md) | Status of live PostgreSQL schema, tables, policies, and pending migration tasks. |

---

## 3. Developer Reading Paths

Select your role or objective to follow the recommended document sequence:

### Path 1: Initializing the Project (Phase 0 & Scaffolding)
1. [docs/foundation-contract.md](foundation-contract.md)
2. [docs/duka-flow-modular-code-architecture-standard.md](duka-flow-modular-code-architecture-standard.md)
3. [docs/duka-flow-code-structure-and-naming-standard.md](duka-flow-code-structure-and-naming-standard.md)
4. [docs/implementation-order.md](implementation-order.md)

### Path 2: Implementing Auth, Tenancy & Access Control (Phase 1)
1. [docs/access-control-foundation.md](access-control-foundation.md)
2. [docs/post-authentication-access-and-first-screen.md](post-authentication-access-and-first-screen.md)
3. [docs/user-responsibilities.md](user-responsibilities.md)
4. [docs/security-controls.md](security-controls.md)

### Path 3: Implementing Products, Inventory & Sales (Phases 2 & 3)
1. [docs/duka-flow-domain-and-data-model.md](duka-flow-domain-and-data-model.md)
2. [docs/inventory-and-stock-model.md](inventory-and-stock-model.md)
3. [docs/sales-and-settlement-model.md](sales-and-settlement-model.md)
4. [docs/sync-model.md](sync-model.md)

### Path 4: Implementing Payments, Cash & Deni (Phases 4 & 5)
1. [docs/cash-and-financial-reconciliation-model.md](cash-and-financial-reconciliation-model.md)
2. [docs/merchant-owned-payment-integration-model.md](merchant-owned-payment-integration-model.md)
3. [docs/mpesa-integration-model.md](mpesa-integration-model.md)
4. [docs/customer-and-crm-model.md](customer-and-crm-model.md)

### Path 5: Offline-First PWA & Synchronization Engine
1. [docs/offline-online-capability-model.md](offline-online-capability-model.md)
2. [docs/pwa-architecture-and-implementation-plan.md](pwa-architecture-and-implementation-plan.md)
3. [docs/sync-model.md](sync-model.md)

---

## 4. Non-Negotiable Foundational Invariants

| Invariant | Enforced By | Description |
|---|---|---|
| **No UI Business Truth** | Application Use Cases | React components only render and collect user actions; they never perform direct database calculations or invent domain logic. |
| **Multi-Tenant RLS** | PostgreSQL Policies | Every browser query must be constrained by `organization_id` and assigned `shop_id` through server RLS. |
| **Money Minor Units** | Integer KES Cents | All monetary calculations in code and database use integer minor units (KES cents), never floating-point arithmetic. |
| **Idempotent Mutations** | UUID `operation_id` | Every mutation dispatched from local clients must contain a stable `operation_id` to guarantee exactly-once execution. |
| **Zero Mock Logic in Prod** | Integration Adapters | No fake M-Pesa or payment status falsification. Offline recording captures manual references until Daraja credentials are confirmed. |

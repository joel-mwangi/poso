# DukaFlow POS Architecture

> Architecture baseline for `joel-mwangi/pos`.
> DukaFlow is an offline-first POS and Virtual Shop Manager that must scale from a one-person Kenyan duka to larger multi-shop retail operations without forcing every merchant into a supermarket-style organization.

## 1. Architectural Goal

Build DukaFlow around a durable transaction ledger and a flexible authorization model.

Primary rule:

`Core transaction truth -> domain events -> integrations/automation -> analytics`

No external integration becomes the source of truth for a sale.

## 2. Application Layers

### Presentation

- POS checkout
- Business home/dashboard
- Products/catalog
- Inventory
- Customers/Deni
- Suppliers
- Staff
- Reports
- Settings
- Offline/sync status

The UI must work naturally on low-end smartphones and scale to tablets and desktop.

### Application

Use cases include creating/completing sales, recording payments and Deni, receiving/adjusting stock, creating customers/suppliers/products, void/refund, payment reconciliation, staff onboarding, shop assignment, permission changes, shift operations, synchronization, and future public-store publication.

### Domain

Core domains:

- Organization / Tenant
- Store
- User / Staff identity
- Shop assignment
- Permissions / permission templates
- Data visibility
- Approval authority
- Shift / operational responsibility
- Product / Catalog
- Sale
- Payment
- Inventory
- Customer / Deni
- Supplier
- Purchase
- Reconciliation
- Audit
- Communication intent/preferences
- Public storefront publication boundary

Downstream automation domains include restock rules, Deni reminder suggestions, liquidity insights, and exception detection.

### Infrastructure

Infrastructure implements local persistence, remote database/API, authentication, synchronization, payment providers, customer communication, printing, notifications, logging/monitoring, and future public web delivery.

Adapters remain replaceable without changing domain rules.

## 3. System Boundary

The POS owns products/prices, sales, recorded payment events, inventory movements, Deni ledger entries, staff assignments and permission metadata, audit events, reconciliation state, communication intents/preferences, and explicit public publication state.

External systems own their external records. The POS stores references and reconciliation results rather than fabricating external truth.

The public storefront is a separate consumption layer. It may read only fields explicitly marked public and must never become a source of private merchant, customer, employee, Deni, payment, cost, or audit data.

## 4. Core Access Model

DukaFlow has two fundamental human categories:

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

The owner has organization-level authority, creates shops, adds staff, assigns shop access, grants permissions, configures the business, and oversees the organization's operations.

### Staff

Staff are invited by the owner to operate one or more shops. A worker may have multiple permissions and may combine responsibilities in ways that match the actual business.

Names such as Cashier, Inventory, Manager/Supervisor, or Sales Attendant are **permission templates**, not mandatory identity types. The template never replaces the underlying permission checks.

### Shop scope

- One assigned shop -> open directly after login.
- Multiple assigned shops -> select the active shop after login.
- No assigned shop -> deny operational access and instruct the worker to contact the owner/authorized administrator.

### Permissions

Examples:

`can_operate_sales, can_record_payments, can_use_pay_later, can_manage_inventory, can_receive_stock, can_manage_products, can_manage_customers, can_view_reports, can_manage_staff, can_change_prices, can_void_sale, can_refund_sale, can_reconcile_payments, can_publish_store`

### Visibility

Capability and visibility are separate. A sales worker may sell without seeing supplier cost prices or organization-wide reports.

### Approval authority

High-risk actions may require a separate approval capability. Examples include large stock adjustments, large refunds, price changes, sale voids, staff permission changes, stock transfers, and reconciliation overrides.

### Operational responsibility

Where shifts/tills are used, the system records who was responsible for the shift/device, opening/closing status, and reconciliation outcome.

## 5. Core Domain Model

### Organization

`id, name, status, created_at, updated_at`

### Store

`id, organization_id, name, business_name, phone, location, currency, timezone, language, status, created_at, updated_at`

### User / Staff

`id, organization_id, auth_user_id, name, phone/email, status, created_at, updated_at`

User identity is separate from shop assignment and permissions.

### Shop Assignment

Conceptually associates a staff member with an organization store and records status, optional effective dates for temporary access, and audit metadata.

### Permission / Permission Template

A template is a reusable bundle of explicit capabilities. Templates are convenience mechanisms only; authorization evaluates the underlying permissions.

### Shift / Operational Responsibility

Conceptually records user, store, device, opening/closing times, till/cash responsibility where applicable, and reconciliation state.

### Product

Product identity is separate from shop-specific configuration where applicable. Shop-specific configuration may include selling price, reorder threshold, and active state.

Barcode is optional. Search/tap-to-add must work without scanning hardware.

### Sale

`id, organization_id, store_id, sale_number, operator_user_id, customer_id, status, subtotal, discount, total, settlement_status, sold_at, created_at, updated_at`

A sale records what the customer took. It is separate from payment records and the Deni ledger.

### Sale Item

`id, sale_id, product_id, quantity, unit_price, unit_cost_snapshot, discount, line_total`

Historical cost is snapshotted so old profitability does not change when current cost changes.

### Payment

`id, organization_id, store_id, sale_id, method, amount, external_reference, provider, status, received_at, metadata`

Payment records represent money received or an external payment workflow. Initial immediate methods include cash and M-Pesa/mobile money, with other configured methods added later.

**Deni/Pay Later is not a payment method.** A sale may have zero or more immediate payment records plus a separate Pay Later/Deni amount represented by the customer Deni ledger.

### Customer / Deni

Customers are lightweight relationship records. Deni is ledger-derived. Entries include credit sale, repayment, adjustment, and reversal/correction where applicable.

### Inventory Movement

Movement types include sale, purchase/receipt, adjustment in/out, refund/return, opening balance, and future transfer. Stock on hand is derived from movement history.

### Purchase / Supplier

Purchases represent stock acquired from suppliers. Receiving records actual goods received, which drives inventory increases. Supplier balances are derived from purchases, supplier payments, returns, and other approved payable events.

### Audit Event

Sensitive mutations generate audit events, including sales, payments, refunds, stock adjustments, Deni repayments, permission changes, shop assignments, approvals, sync conflicts, reconciliation overrides, communication intents, and public publication changes.

## 6. Transaction Flows

### Standard Sale

`Select products -> cart -> calculate totals -> choose settlement -> confirm -> create sale -> create immediate payment records where applicable -> create Pay Later/Deni ledger entry where applicable -> create inventory movements -> finalize -> receipt -> audit`

### Pay Now

The customer settles the sale immediately using one or more supported immediate payment methods.

Examples:

```text
Cash only
M-Pesa only
Cash + M-Pesa
```

### Take Pay Later

The shop deliberately allows the customer to owe part or all of the sale.

Valid cases include:

```text
Sale KSh 1,000
Paid now KSh 0
Deni KSh 1,000
```

and:

```text
Sale KSh 1,000
Cash KSh 300
Deni KSh 700
```

The Deni amount is recorded in the customer receivable ledger. A later repayment is a separate financial event and never creates a new sale.

### Split settlement

Where enabled, a sale may combine multiple immediate payment methods and Pay Later/Deni, provided:

```text
Paid now + Pay later = Sale total
```

### Refund/Void

Use compensating records rather than silently mutating historical transactions. Sensitive refunds/voids are permission- and approval-controlled.

## 7. Offline-First Model

The device must be able to read catalog data, create sales, calculate totals, record supported payments, update local inventory state, record supported Deni operations, generate receipts, and queue synchronization work.

Every remote-bound mutation has a stable operation identity and outbox record.

Synchronization requirements:

- idempotent operations;
- deterministic operation IDs;
- retry with backoff;
- visible sync health;
- explicit conflict handling;
- remote reauthorization against current user/shop permissions;
- no silent dropping of failures.

Offline operation never creates new permissions or shop access. Supported Pay Later/Deni operations remain bounded by locally provisioned authority and are revalidated during synchronization.

## 8. Conflict Strategy

Financial transactions use immutable history and compensating events.

Low-risk catalog configuration may use controlled last-write-wins with audit history.

Stock is derived from movements. Deni is derived from ledger entries.

## 9. Payment and M-Pesa

Use a provider-neutral payment interface. M-Pesa references entered by staff are evidence, not automatic proof of settlement when provider confirmation is unavailable. Provider callbacks and reconciliation must be verified and idempotent.

The payment lifecycle may distinguish:

```text
Initiated -> Pending -> Confirmed
                    ↘ Failed / Exception
```

A pending external payment must not silently be presented as confirmed.

## 10. Inventory Intelligence

Phase 1 is deterministic: low-stock alerts, rolling sales averages, reorder suggestions, shopping lists, safety stock, and dead-stock flags. Predictive ML comes later after sufficient trustworthy transaction history.

## 11. Customer Communication

Communication is optional and provider-neutral. Deni reminders create merchant-reviewed communication intents; WhatsApp/SMS/share are adapters and never block core POS transactions.

## 12. Public Storefront

The public storefront is opt-in and reads an explicit publication projection. It must never expose private customers, Deni, employees, payments, costs, inventory movement history, or audit data.

## 13. Security

Minimum controls:

- Supabase Auth identity and session lifecycle;
- organization/store membership and explicit shop assignments;
- permission and visibility enforcement;
- separate approval authority for high-risk actions;
- PostgreSQL RLS;
- server-side business validation;
- stable device identity;
- idempotent synchronization;
- audit trail;
- protected secrets;
- explicit public/private boundary.

The client enables the merchant to work; the server protects the business.

## 14. Scalability

Target scale is 100,000 independent shop owners. Start with PostgreSQL and strong indexes, local-first operation, batched sync, and asynchronous reporting/notifications. Introduce pooling, read replicas, partitioning, analytics infrastructure, or separate public read models only when measured workloads justify them.

## 15. Implementation Order

1. Project foundation.
2. Authentication and organization/shop bootstrap.
3. Owner/staff identity, shop assignment, permission and visibility model.
4. Catalog.
5. Transaction engine.
6. Inventory.
7. Payments, Pay Later/Deni, and settlement lifecycle.
8. Offline synchronization.
9. Shift/reconciliation and operational audit.
10. Business intelligence.
11. Public storefront and advanced features.

## 16. Non-Negotiable Invariants

1. A completed sale has a valid store and authorized operator context.
2. Sale totals reconcile to finalized line totals.
3. A sale is separate from its payment records and Deni ledger effects.
4. Inventory effects are represented by inventory movements.
5. Deni effects are represented by ledger entries.
6. Historical profitability uses historical cost snapshots.
7. Financial corrections are explicit and auditable.
8. Sync retries cannot duplicate financial effects.
9. Sensitive actions are authorized server-side.
10. Shop assignments and permissions are enforced independently of UI labels.
11. Visibility rules cannot be bypassed by client-supplied IDs.
12. Public storefront data is explicitly published.
13. Public web traffic cannot compromise checkout or synchronization availability.
14. `Paid now + Pay later = Sale total` for every accepted settled sale.
15. `Paid now = 0` is valid for an authorized full-Deni sale.
16. A Deni repayment never creates a new sale.

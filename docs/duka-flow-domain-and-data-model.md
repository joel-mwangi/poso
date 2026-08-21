# DukaFlow Domain & Data Model

**This document is the source of truth for the core business entities in DukaFlow, how they relate, which record owns each business fact, and which records are derived from others.**

**Source relationships:**

- `docs/user-responsibilities.md` defines the User Access Model.
- `docs/user-lifecycle-and-access-governance.md` defines how access is administered and changed.
- `docs/post-authentication-access-and-first-screen.md` defines how current access context is resolved.
- `docs/user-workspace-and-daily-workflow.md` and `docs/duka-flow-product-experience-model.md` define how these domains are presented to users.
- `docs/inventory-and-stock-model.md` defines stock behavior.
- `docs/sales-and-settlement-model.md` defines sales and settlement behavior.
- `docs/cash-and-financial-reconciliation-model.md` defines financial movement and reconciliation.
- `docs/customer-and-crm-model.md` defines customer relationships.
- `docs/purchasing-and-suppliers-model.md` defines purchasing and supplier relationships.
- `docs/business-insights-and-growth-model.md` defines derived intelligence.

---

## 1. Core principle

DukaFlow must have **one clear source of truth for every important business fact**.

The system must not maintain multiple competing balances such as:

- stock quantity in one table and a different stock quantity in another;
- Deni balance stored independently from the Deni ledger;
- cash balance that is unrelated to recorded cash movements;
- customer purchase totals that cannot be traced back to sales;
- supplier balances that cannot be traced back to purchases and supplier payments.

The authoritative record and any derived summaries must be clearly distinguished.

---

## 2. Core entity map

The target model is:

```text
Organization
   │
   ├── Shops
   │     │
   │     ├── Users / Staff Assignments
   │     ├── Products / Shop Product Configuration
   │     ├── Inventory Movements
   │     ├── Sales
   │     ├── Payments
   │     ├── Cash Movements / Reconciliation
   │     ├── Purchases / Receiving
   │     └── Expenses
   │
   ├── Users
   │     ├── Permissions
   │     ├── Shop Assignments
   │     └── Approval / Operational Context
   │
   ├── Customers
   │     └── Deni Ledger Entries
   │
   └── Suppliers
         └── Purchase / Payable History
```

Cross-domain business events connect these records without collapsing them into one giant entity.

---

## 3. Organization

### Meaning

The organization is the business tenant that owns the DukaFlow data.

It may represent:

- one duka owner with one shop;
- a business with several shops;
- a growing retail organization.

### Authoritative facts

The organization owns:

- organization identity;
- business-level settings;
- organization membership relationships;
- shop relationships;
- organization-scoped configuration.

### Relationship

```text
Organization 1 ─── N Shops
Organization 1 ─── N Users
Organization 1 ─── N Customers
Organization 1 ─── N Suppliers
```

Customers and suppliers may be organization-scoped even when their activity occurs at one particular shop.

---

## 4. Shop

### Meaning

A shop is a physical/operational selling location inside an organization.

### Authoritative facts

The shop owns:

- shop identity;
- name and location metadata;
- optional shop photo/media reference;
- shop operational configuration;
- business preferences such as currency, language, and timezone;
- payment enablement and shop-specific payment configuration references;
- shop-level product/price configuration where applicable;
- shop-scoped transactions and movements.

The owner-facing shop profile should present these settings in one area:

```text
Shop Profile
├── Shop photo, optional
├── Shop name
├── Shop location
└── Contact information, where collected

Business Preferences
├── Currency
├── Language
└── Timezone

Payments
├── Cash
├── M-Pesa configuration, if enabled
└── Deni / Pay later, if enabled

Optional capabilities
├── Customers and Deni
├── Suppliers and purchasing
├── Staff access
└── Additional shops
```

Sensitive M-Pesa credentials are not ordinary shop profile data. The shop stores safe configuration metadata and references to the protected server-side secret boundary.

### Relationship

```text
Organization 1 ─── N Shops
Shop 1 ─── N Sales
Shop 1 ─── N Inventory Movements
Shop 1 ─── N Purchases
Shop 1 ─── N Cash Movements
```

A shop is the normal operational scope for selling and stock.

---

## 5. User and staff membership

A user represents an authenticated person.

A user is not the same thing as a job title.

The access model is:

```text
User
  ↓
Organization Membership
  ↓
Shop Assignment(s)
  ↓
Permission(s)
  ↓
Visibility / Approval / Operational Context
```

### Important rule

`Cashier`, `Manager`, `Inventory`, and similar labels are optional permission templates only.

They are not the primary identity model.

### Authoritative facts

User/access records own:

- identity reference;
- organization membership;
- shop assignments;
- effective permissions;
- lifecycle/availability status;
- approval authority;
- relevant device/session relationships.

---

## 6. Shop assignment

A staff member may be assigned to:

- one shop;
- several shops;
- a shop temporarily for coverage.

This entity answers:

> **Where may this person currently operate?**

It must not be inferred from a role label or from the user's last selected shop.

For one valid shop, the application should open it automatically. For multiple valid shops, the application asks the user to choose the active shop.

### Direct assignments and permission templates

For a simple shop, the owner may assign responsibilities directly to an individual for a selected shop:

```text
Person
   ↓
Selected shop
   ↓
Sell products: Yes / No
Receive payments: Yes / No
Manage stock: Yes / No
```

For a structured organization, the owner may create reusable permission templates and assign them to individuals with an explicit shop scope:

```text
Permission template
   ↓
Individual user
   ↓
One or more shop assignments
   ↓
Effective permissions
```

Templates are convenience bundles, not identity types and not a substitute for effective authorization. The owner must be able to customize, replace, suspend, or remove a person’s assignment later.

---

## 7. Permissions

Permissions answer:

> **What may this user do in the current scope?**

Examples:

- operate sales;
- record payments;
- use Pay Later/Deni;
- view customer balances;
- receive stock;
- adjust stock;
- manage suppliers;
- reconcile cash;
- approve refunds;
- manage staff.

Permissions are authoritative access data.

A product screen or role label is not an authorization source.

---

## 8. Product

A product represents the item the business sells or stocks.

### Organization-level versus shop-level data

The model should distinguish reusable product identity from shop-specific configuration.

Conceptually:

```text
Product
   ↓
Shop Product Configuration
```

The product identity may include:

- product ID;
- name;
- category;
- unit/packaging information;
- identifiers/barcodes where available.

Shop-specific configuration may include:

- selling price;
- reorder level;
- active/inactive state;
- shop-specific stock settings.

This prevents one shop's price or stock state from accidentally becoming another shop's state.

---

## 9. Inventory movement

The inventory ledger is the authoritative source for stock movement history.

Typical movement types include:

- opening balance;
- purchase/receiving;
- sale;
- return;
- adjustment in;
- adjustment out;
- transfer out;
- transfer in;
- damage/expiry where modeled explicitly.

### Core principle

```text
Current stock = derived from authoritative inventory movements
```

A cached quantity may exist for performance, but it must be reconstructable and reconcileable from the ledger.

The movement should reference its source business event where one exists.

Example:

```text
Inventory movement
   ↓
source_type = sale
source_id   = sale_123
```

---

## 10. Customer

A customer represents the shop's relationship with a person who may purchase goods or owe money.

The customer record should remain lightweight.

It may include:

- customer ID;
- name;
- phone/contact details;
- status;
- organization scope;
- optional notes.

The customer record is not the source of truth for purchase history or Deni balance by itself.

Those are derived from authoritative transactional records.

---

## 11. Customer purchase history

Purchase history is derived from sales linked to the customer.

```text
Customer
   ↓
Sales
   ↓
Sale lines
   ↓
Purchased products / quantities / value
```

Do not maintain a manually editable “lifetime spend” number that can drift from actual sales.

A cached lifetime-spend metric is acceptable only as a derived projection that can be rebuilt.

---

## 12. Deni ledger

Deni must be modeled as a ledger.

Typical entry types include:

- credit_sale;
- repayment;
- adjustment;
- reversal/refund-related correction where applicable.

Conceptually:

```text
Customer
   ↓
Deni Ledger Entries
   ↓
Current outstanding balance
```

### Source of truth

The Deni balance is **derived from ledger entries**.

The customer record should not contain an independently editable balance that becomes the authoritative number.

Example:

```text
Opening balance         +200
Pay Later sale          +500
Repayment               -300
Adjustment               +50
--------------------------------
Current balance         +450
```

---

## 13. Sale

A sale is the authoritative business record of what the customer took from the shop.

It contains:

- sale identity;
- organization;
- shop;
- selling actor;
- sale lines;
- quantities;
- authoritative sale prices;
- discounts;
- total;
- customer where applicable;
- sale status;
- transaction timestamp;
- operation/idempotency identity.

A sale is not the payment record and not the Deni ledger.

---

## 14. Sale lines

Sale lines represent the products included in a sale.

Each line should preserve historical commercial facts such as:

- product reference;
- quantity;
- unit selling price used;
- discount applied;
- relevant cost snapshot where required for trustworthy margin reporting.

The completed sale must remain historically explainable even if the product price later changes.

---

## 15. Payment

Payment represents money received or a payment workflow associated with a sale.

Payment records should include information such as:

- payment identity;
- sale reference;
- shop;
- method;
- amount;
- status;
- external reference where applicable;
- confirmation metadata;
- timestamps.

### Important

A sale may have multiple payments.

Examples:

```text
Cash + M-Pesa
Cash + M-Pesa + Deni
```

Deni itself is represented by the customer receivable ledger, not by forcing every sale into a single payment-method enum.

---

## 16. Pay Later / Deni relationship to sales and payments

The transaction relationship is:

```text
Sale total
   ↓
Paid now through one or more Payment records
   +
Pay Later amount through Deni ledger entry
```

Valid case:

```text
Sale total = KSh 1,000
Payments now = KSh 0
Deni = KSh 1,000
```

The original sale remains KSh 1,000.

A later KSh 300 repayment is a Deni ledger event, not a new sale.

---

## 17. Purchase

A purchase represents goods acquired from a supplier.

A purchase may include:

- purchase identity;
- organization;
- shop;
- supplier;
- purchase lines;
- expected quantities where ordering is supported;
- received quantities;
- purchase cost;
- payment state;
- supplier payable reference;
- timestamps.

A purchase must distinguish:

```text
Ordered
vs.
Received
vs.
Paid
vs.
Still owed
```

---

## 18. Purchase lines and receiving

Purchase lines represent products expected or received from suppliers.

Receiving should record the **actual quantity received**.

Inventory movements should reference the purchase/receipt event that caused stock to enter the shop.

A purchase order of 100 units does not mean inventory increased by 100 units if only 70 arrived.

---

## 19. Supplier

A supplier represents the business relationship from which the shop acquires stock.

Supplier data may include:

- supplier ID;
- organization scope;
- display/business name;
- contacts;
- status;
- notes.

Supplier profile is not the source of truth for supplier payable balance.

---

## 20. Supplier payable ledger

The amount owed to a supplier should be derived from supplier-related financial events.

Conceptually:

```text
Purchases / accepted supplier invoices
        +
Other approved payable events
        -
Supplier payments
        -
Supplier credits / returns
        =
Outstanding supplier payable
```

The supplier profile must not contain an independently editable authoritative balance.

---

## 21. Cash movement

Cash should be modeled as movements, not as one mutable balance field.

Examples:

- cash sale receipt;
- cash expense;
- supplier cash payment;
- owner withdrawal;
- cash deposit/withdrawal;
- approved cash adjustment;
- shift opening float;
- shift closing count.

### Source of truth

```text
Cash balance/state = derived from authorized cash movements + reconciliation state
```

A counted cash figure is a physical observation, not a replacement for the movement history.

---

## 22. M-Pesa / external payment settlement

M-Pesa and other external payment providers require an explicit settlement record distinct from a typed reference.

The domain should be able to distinguish:

```text
Initiated
Pending
Confirmed
Failed
Reversed/Refunded
Exception
```

The payment record owns the payment state.

The sale owns what was sold.

The cash/reconciliation domain owns how the financial movement was reconciled.

---

## 23. Expense

An expense represents money leaving the business for an operating purpose.

Examples:

- transport;
- electricity;
- airtime/data;
- rent;
- small operational purchases;
- approved miscellaneous expense.

An expense is not a sale and should not reduce sales totals.

An expense may create a cash movement or another financial movement according to the settlement method.

---

## 24. Reconciliation

Reconciliation compares recorded expectations with observed reality.

Examples:

```text
Expected cash
vs.
Counted cash
```

```text
Expected M-Pesa
vs.
Provider/reconciliation records
```

Reconciliation is not the source of truth for the original sale or payment. It is the process that identifies agreement or variance.

---

## 25. Shift and till

Where enabled, a shift represents a period of operational responsibility.

A shift may link:

- user;
- shop;
- till/device;
- opening time;
- closing time;
- expected cash;
- counted cash;
- reconciliation result.

A shift does not replace the authenticated user or the underlying sale/payment records.

---

## 26. Device and session

A device/session relationship helps DukaFlow answer:

> **Which device and session performed this operation?**

This is important for:

- offline operations;
- synchronization;
- device revocation;
- auditability;
- support investigations.

Device/session data is operational context, not business truth for sales, stock, or cash.

---

## 27. Audit event

Sensitive or material business events should produce audit records.

An audit event may reference:

- actor/user;
- organization;
- shop;
- action;
- object/entity;
- object ID;
- timestamp;
- device/session where available;
- relevant reason/approval information.

Audit history is append-oriented and should not be used as a mutable business balance.

---

## 28. Business-event relationships

The main flows are:

### Selling

```text
User
 ↓
Shop
 ↓
Sale
 ├── Sale Lines → Products
 ├── Customer (optional)
 ├── Payment(s)
 └── Deni Ledger Entry (if Pay Later)
        ↓
Inventory Movement
```

### Purchasing

```text
User
 ↓
Shop
 ↓
Purchase
 ├── Purchase Lines → Products
 ├── Supplier
 ├── Supplier Payable
 └── Supplier Payment(s)
        ↓
Inventory Movement
```

### Deni repayment

```text
Customer
 ↓
Deni Ledger
 ↓
Repayment
 ↓
Payment / Cash Movement where applicable
```

### Cash reconciliation

```text
Sales / Payments / Expenses / Other Cash Movements
                    ↓
             Expected Cash
                    ↓
             Physical Count
                    ↓
               Variance
```

### Insights

```text
Authoritative domain records
            ↓
       Derived metrics
            ↓
        Insights
            ↓
     Recommendations
```

---

## 29. Source-of-truth matrix

| Business fact | Authoritative source | Derived from |
|---|---|---|
| User identity | Auth/user identity | Identity provider |
| Organization membership | Membership record | User + organization |
| Shop access | Shop assignment | Membership + assignment state |
| Permissions | Permission records | Assignment/templates + explicit grants |
| Product identity | Product | Product master |
| Shop stock | Inventory ledger | Inventory movements |
| Sale history | Sale + sale lines | Direct transaction records |
| Money received | Payment + cash/payment movement records | Settlement events |
| Deni balance | Deni ledger | Ledger entries |
| Customer purchase history | Sales linked to customer | Sales |
| Supplier balance | Payable/payment records | Purchases + supplier payments/credits |
| Cash expected | Cash movement records | Payments + expenses + other movements |
| Cash variance | Reconciliation | Expected vs counted |
| Profit estimate | Derived | Sales + authoritative cost + expenses where supported |
| Insights | Derived | Domain facts + rules |

A derived field must be rebuildable from its authoritative sources whenever practical.

---

## 30. Things that must not become competing sources of truth

Do not make these independently authoritative:

### Stock balance

Bad:

```text
products.stock_quantity
```

and separately:

```text
inventory.current_quantity
```

with no reconciliation rule.

Preferred:

```text
Inventory ledger = source of truth
Current quantity = derived/materialized view
```

### Deni balance

Bad:

```text
customer.deni_balance
```

as an independently edited balance.

Preferred:

```text
Deni ledger = source of truth
Current balance = derived/materialized view
```

### Supplier payable

Same principle:

```text
Payable ledger/events = source of truth
Current balance = derived/materialized view
```

### Business insights

Do not write an insight back into a table and then treat it as if it were a raw business fact.

Insights are derived interpretations.

---

## 31. Transaction boundaries

The system should define durable transaction boundaries around business events.

For a normal accepted sale, the system must be able to connect:

```text
Sale
+ relevant inventory effect
+ settlement/receivable effect
+ audit effect
```

without creating contradictory outcomes.

For a purchase:

```text
Purchase/receipt
+ inventory receipt effect
+ supplier payable/payment effect
+ audit effect
```

The technical implementation may use database transactions, event/outbox patterns, or equivalent mechanisms. The domain requirement is consistency and traceability.

---

## 32. Idempotency and operation identity

Business mutations that may be retried must have stable operation identity.

Examples:

- sale completion;
- Deni creation;
- Deni repayment;
- purchase receiving;
- stock adjustment;
- cash movement;
- synchronization.

Retrying the same operation must not create duplicate business effects.

---

## 33. Multi-shop isolation

Every shop-scoped transactional record must identify its shop where appropriate.

A user operating in Shop A must not be able to create or read Shop B transactions unless their current authorization explicitly permits it.

The data model must support organization-wide visibility for owners and authorized users without collapsing shop-specific transaction ownership.

---

## 34. Offline and synchronization

Offline-created business records must retain stable identifiers and operation identities so they can synchronize safely.

An offline record should preserve:

- actor;
- organization;
- shop;
- source event;
- creation timestamp;
- operation ID;
- local synchronization state.

When reconnecting, server authority must revalidate authorization and business invariants.

Offline state is operational metadata, not a replacement for business truth.

---

## 35. Current implementation status

The current repository is only partially aligned with this target model.

For example, the current domain core already has IDs for organization, store, user, product, customer, sale, payment, and operation, but `CompleteSaleInput` still models one payment object and does not yet expose the full domain described here. fileciteturn129file0

The documentation therefore describes the **target domain model**, not a claim that all entities or relationships are already implemented.

Implementation work must progressively close the gap between this model and the current code.

---

## 36. What the data model should enable

The model should allow DukaFlow to answer, with traceable source records:

> **What stock do I have?**

> **What did I sell?**

> **Who paid?**

> **Who still owes me?**

> **What did I buy?**

> **What do I owe suppliers?**

> **Where is my money?**

> **What should I investigate?**

> **What should I reorder?**

> **What is actually happening in each shop?**

No insight should require inventing a new parallel source of truth to answer these questions.

---

## 37. Source-of-truth boundaries

Use:

- `docs/user-responsibilities.md` for **who can access or perform actions**.
- `docs/user-lifecycle-and-access-governance.md` for **who may grant/change that access**.
- `docs/post-authentication-access-and-first-screen.md` for **runtime authorization context**.
- `docs/duka-flow-product-experience-model.md` for **overall product experience**.
- The domain-specific documents for **business rules inside each domain**.
- This document for **entity ownership, relationships, and source-of-truth boundaries across domains**.

No domain document should invent a second entity model that conflicts with this one.

## 38. Completion definition

The domain/data model is complete enough for implementation when:

- every core business fact has an identified authoritative owner;
- every derived balance has a rebuildable source;
- multi-shop scope is explicit;
- user access does not depend on job-title labels;
- sales, payments, Deni, inventory, purchases, supplier payables, customers, expenses, and cash movements are distinguishable;
- refunds, returns, reversals, and adjustments reference original business events where applicable;
- offline operations have stable identities;
- auditability is possible for sensitive operations;
- the model can support one-person dukas through multi-shop organizations without redesigning the fundamentals;
- the actual implementation can be measured against the target model without pretending missing entities already exist.

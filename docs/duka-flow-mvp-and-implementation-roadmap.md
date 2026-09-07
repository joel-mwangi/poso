# DukaFlow MVP & Implementation Roadmap

**This document is the source of truth for what DukaFlow builds first, what is deferred, how the work is sequenced, and what evidence is required before a capability is considered complete.**

**Source relationships:**

- `docs/user-responsibilities.md` defines the User Access Model.
- `docs/user-lifecycle-and-access-governance.md` defines how access is administered.
- `docs/post-authentication-access-and-first-screen.md` defines post-login routing.
- `docs/user-workspace-and-daily-workflow.md` and `docs/duka-flow-product-experience-model.md` define the product experience.
- `docs/duka-flow-domain-and-data-model.md` defines the target entity and source-of-truth model.
- The domain documents define the business behavior for inventory, sales/settlement, cash, customers, purchasing, and insights.

---

## 1. Core principle

DukaFlow must be built as a sequence of **complete business capabilities**, not as disconnected screens.

The objective is:

```text
Trusted foundation
      ↓
One useful shop workflow
      ↓
End-to-end transaction integrity
      ↓
Connected business domains
      ↓
Useful insight
```

A phase is not complete because a UI exists. It is complete when the underlying business operation, authorization, persistence, offline/sync behavior where applicable, auditability, and tests all agree.

---

## 2. Current repository baseline

The current repository is a partial foundation, not a completed implementation of the target model.

The existing domain currently includes identifiers for organization, shop, user, product, customer, sale, payment, and operation; a payment-method union currently includes cash, M-Pesa, and Deni; and there is a `CompleteSaleInput` with one payment object. fileciteturn129file0

The target model is broader. It requires first-class handling of shop assignments, permissions, inventory movements, customer/Deni ledger entries, suppliers, purchases/receiving, expenses, cash movements, reconciliation, audit events, and multi-payment settlement semantics. Those capabilities must be built deliberately rather than inferred from the current lightweight domain types.

**Rule:** the roadmap describes the target product. Current code is treated as partial implementation evidence, not as proof that a documented capability already exists.

---

## 3. MVP definition

The DukaFlow MVP should let a real small Kenyan shop answer and act on four essential questions:

1. **Who can use the shop and what are they allowed to do?**
2. **What stock do we have?**
3. **What did we sell and how was it settled?**
4. **What money do we actually have or are we still owed?**

Customer, purchasing, and business insights then make those foundations useful and scalable.

The MVP should support a one-person shop first while keeping the data model capable of growing into staffed and multi-shop operation without a rewrite.

---

## 4. Owner onboarding setup classification

After account registration and verification, but before organization and first-shop bootstrap, the owner completes a short ticking checklist:

1. Do you have more than one shop? **Yes / No**
2. Do you accept M-Pesa? **Yes / No**
3. Do you allow Deni? **Yes / No**
4. Do you buy stock from suppliers? **Yes / No**

If the answer to question 1 is **No**, ask:

5. Do you run the shop alone? **Yes / No**

If the answer is **Yes**, DukaFlow automatically records **Other people use the system: No**. If the answer is **No**, DukaFlow automatically records **Other people use the system: Yes**. Do not ask the duplicate staff-use question.

If the answer to question 1 is **Yes**, continue with multi-shop creation. Do not ask the helping-person question during the initial quiz. That question appears later in the settings for each specific shop after the owner taps **Set up shop**.

The answers recommend a starting setup. The owner may choose **Start with simple setup** or **Use recommended setup**. Follow-up configuration is conditional: M-Pesa Till Number, staff access, additional shops, customer/Deni tracking, or supplier/purchasing tools are shown only when relevant.

The checklist must support progressive disclosure. It recommends organization capabilities but does not permanently classify the owner or force complex setup during registration.

After organization creation, the first shop setup must collect:

```text
Shop name
[ Enter shop name ]

Shop location
[ Enter town, estate, street, or area ]

[Create shop]
```

For owners with more than one shop, the same form supports adding another shop now or choosing **Do this later**. The location is a simple identifier and does not require a formal postal address.

After shop creation is complete, show the owner the created shop or shops first. The owner must tap **Set up shop** before entering profile settings.

For one shop, show the shop name, location, optional photo, and **Set up shop** action. For multiple shops, show a list of created shops with each shop's name, location, optional photo, and **Set up shop** action. The owner configures one selected shop at a time and may return to the list.

After the owner taps **Set up shop**, enter one **Shop Profile Settings** area:

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

M-Pesa configuration is conditional. The owner chooses Till Number or PayBill, enters the payment number, chooses Sandbox or Live, and securely configures Daraja credentials obtained through Safaricom Daraja Live. The owner may choose **Set up later** and continue with cash operations. Customer/Deni, supplier/purchasing, staff, and additional-shop sections remain conditional.

The setup flow must be responsive without changing its content or business rules:

```text
Mobile  → single-column vertical steps
Tablet  → centered flexible form
Desktop → step rail and wider work area
```

Use one primary action per screen, a short step indicator, large touch targets, no horizontal scrolling, and **Set up later** for optional configuration. Advanced M-Pesa credentials, staff permissions, supplier controls, and reconciliation remain separate screens.

---

## 5. Build order and phases

```text
Phase 0  Foundation / authorization
   ↓
Phase 1  Organization + shop + staff access
   ↓
Phase 2  Product + inventory foundation
   ↓
Phase 3  Sales + Pay Now / Pay Later
   ↓
Phase 4  Cash + M-Pesa + reconciliation
   ↓
Phase 5  Customers + Deni lifecycle
   ↓
Phase 6  Purchasing + suppliers
   ↓
Phase 7  Insights + owner intelligence
   ↓
Phase 8  Scale / multi-shop / advanced operations
```

Each phase should leave the previous phase working. Avoid building later screens on top of placeholders that have not yet established domain truth.

---

## 6. Phase 0 — Foundation

### Goal

Establish the technical and security foundation required for every later domain.

### Build

- Authentication.
- Session lifecycle.
- Organization membership model.
- Shop model.
- Owner identity/relationship.
- Staff membership.
- Shop assignments.
- Explicit permissions.
- Basic lifecycle states: active, invited, suspended/removed, leave.
- Server-side authorization boundaries.
- Audit foundation.
- Stable operation/idempotency identity.
- Basic device/session context.

### Required behavior

```text
Login
 ↓
Identify user
 ↓
Resolve organization
 ↓
Resolve owner/staff
 ↓
Check lifecycle
 ↓
Resolve shop(s)
 ↓
Resolve permissions
 ↓
Open correct first workspace
```

### Must prove

- Owner can create an organization and shop.
- Owner can add staff.
- Owner can assign one or more shops.
- Owner can assign permissions.
- One-shop staff opens automatically.
- Multi-shop staff selects a shop.
- Staff on leave cannot operate.
- Suspended staff cannot operate.
- A client cannot forge organization/shop/permission scope.

### Out of scope

- Advanced staff scheduling.
- Complex approval workflows.
- Payroll.
- Enterprise identity features beyond the current product need.

### Definition of done

No business-domain feature proceeds unless its actor, organization, shop, and permission scope can be enforced reliably.

---

## 7. Phase 1 — Organization, Shop, Staff Access & Workspace

### Goal

Make the product usable after login before adding full retail operations.

### Build

- Organization home.
- Shop workspace.
- Owner organization view.
- Staff shop workspace.
- One-shop automatic entry.
- Multi-shop selector.
- Context indicator for active shop.
- Basic permission-driven navigation.
- Leave/access-status experience.

### Must prove

```text
Owner
→ Organization Home
→ Shop

Staff, one shop
→ Login
→ Shop

Staff, two shops
→ Login
→ Select Shop
→ Shop
```

### Out of scope

- Full reporting.
- Advanced dashboards.
- Full purchasing.
- Multi-shop analytics.

### Definition of done

A user always lands in a context they are authorized to use and can understand where they are operating.

---

## 8. Phase 2 — Products & Inventory

### Goal

Make **Know My Stock** trustworthy.

### Build

- Product creation.
- Product categories.
- Shop-specific product configuration.
- Selling price configuration.
- Opening stock.
- Inventory movement ledger.
- Current stock projection.
- Stock count.
- Stock adjustment.
- Low-stock threshold.
- Basic stock history.

### Core flow

```text
Create product
 ↓
Enter opening stock
 ↓
Sell / receive / adjust
 ↓
Inventory movements
 ↓
Current stock
```

### Must prove

- Stock is never changed silently.
- Every material movement has a source.
- Current quantity can be reconstructed from the movement history.
- Products are shop-scoped correctly.
- One shop cannot see another shop's stock.

### Out of scope

- Predictive reorder intelligence.
- Complex transfers.
- Batch/expiry workflows unless required by a specific product category.
- Advanced warehouse management.

### Definition of done

The owner can trust the stock number enough to make a reorder or selling decision.

---

## 9. Phase 3 — Sales & Settlement

### Goal

Make the core retail transaction work end to end.

### Build

- Mobile-first product selection/search.
- Cart.
- Quantity changes.
- Authoritative price validation.
- Discounts according to permission.
- Optional customer attachment.
- Pay Now.
- Take Pay Later / Deni.
- Full payment now.
- Zero payment now + full Deni.
- Partial payment + Deni.
- Multiple immediate payment methods where supported.
- Receipt/reference.
- Idempotency.
- Sale history.
- Refund/return/reversal foundation.

### Critical transaction cases

```text
A. KSh 500 cash

B. KSh 500 M-Pesa

C. KSh 500 total
   Paid now KSh 0
   Deni KSh 500

D. KSh 1,000 total
   Cash KSh 300
   Deni KSh 700

E. KSh 1,000 total
   Cash KSh 400
   M-Pesa KSh 600
```

### Must prove

- A completed sale is immutable history.
- Stock effect is created automatically.
- Deni creation is separate from payment records.
- A Deni repayment never creates a new sale.
- An M-Pesa reference is not treated as confirmation unless trusted confirmation exists.
- Retrying the same operation cannot duplicate the sale or stock movement.

### Out of scope

- Advanced loyalty.
- Complex price books.
- Full procurement.
- Advanced promotions engine.

### Definition of done

A shop can reliably sell goods and preserve the commercial truth of what happened.

---

## 10. Phase 4 — Cash, M-Pesa & Reconciliation

### Goal

Make **Know My Cash** trustworthy.

### Build

- Cash movement ledger.
- Shift/till foundation where enabled.
- Cash tender and change.
- M-Pesa payment lifecycle.
- Payment confirmation states.
- Expected cash.
- Physical cash count.
- Cash variance.
- Expenses.
- Basic financial reconciliation.
- Payment exceptions.

### Core distinction

```text
Sales value
≠
Money received
≠
Cash in drawer
≠
M-Pesa balance
≠
Deni owed
```

### Must prove

Example:

```text
Sales value:  KSh 10,000
Paid now:     KSh  6,000
Deni:         KSh  4,000
Expenses:     KSh  1,000
```

The system must never report KSh 10,000 as cash received.

### Out of scope

- Full accounting package.
- Bank reconciliation beyond supported payment flows.
- Complex tax accounting unless required by the compliance plan.

### Definition of done

Owner and authorized staff can reconcile recorded money against physical/confirmed money and identify discrepancies.

---

## 11. Phase 5 — Customers & Deni Lifecycle

### Goal

Make **Know My Customer** useful without turning a duka into a CRM project.

### Build

- Lightweight customer creation.
- Search and duplicate detection.
- Customer history derived from sales.
- Deni ledger.
- Repayments.
- Customer statements.
- Deni balance visibility.
- Credit limits/policies where configured.
- Return/reversal effects on Deni.

### Must prove

```text
Customer
 ↓
Sale on Deni
 ↓
Balance increases
 ↓
Customer later pays
 ↓
Balance decreases
```

The original sale remains unchanged.

### Out of scope

- Full marketing automation.
- Campaign management.
- Enterprise CRM.
- Loyalty points unless separately prioritized.

### Definition of done

The owner can answer: **Who owes me, how much, and why?**

---

## 12. Phase 6 — Purchasing & Suppliers

### Goal

Complete the stock lifecycle from supplier to shop.

### Build

- Supplier profile.
- Purchase record.
- Purchase lines.
- Actual receiving.
- Partial delivery.
- Purchase cost capture.
- Supplier payable/credit.
- Supplier payments.
- Purchase returns.
- Supplier statement/history.

### Core flow

```text
Supplier
 ↓
Purchase
 ↓
Receive actual goods
 ↓
Inventory increases
 ↓
Pay supplier now OR owe supplier
 ↓
Supplier balance reconciles
```

### Must prove

- Ordered quantity does not equal received quantity automatically.
- Received stock is what enters inventory.
- Supplier payment is not confused with inventory receipt.
- Supplier balance is traceable to purchases/payments/returns.

### Out of scope

- Enterprise purchase-order approval chains.
- Supplier marketplace.
- Automated supplier ordering.

### Definition of done

The owner can answer: **Where did this stock come from, what did it cost, and what do I still owe?**

---

## 13. Phase 7 — Insights & Growth

### Goal

Move from recording events to understanding the shop.

### Build

- Daily owner summary.
- Sales trends.
- Stock alerts.
- Simple reorder suggestions.
- Deni attention items.
- Cash variance alerts.
- Supplier cost comparisons.
- Basic profitability estimates where cost data is trustworthy.
- Action-oriented recommendations.
- Explainable insights.
- Confidence/missing-data indicators.

### Must prove

Every material insight can be traced back to source records and calculations.

Example:

```text
LOW STOCK
Unga 2kg
Stock: 4
Recent sales: ~3/day

Recommendation:
Consider reordering soon.
```

The product must not claim certainty when the data is insufficient.

### Out of scope

- Autonomous business decisions.
- Fully automated purchasing without owner authorization.
- Black-box predictions presented as facts.

### Definition of done

The owner gets useful answers to **What is happening? Why? What needs attention? What should I do next?**

---

## 14. Phase 8 — Scale & Advanced Operations

This phase follows the MVP and is only built when justified by real usage.

Potential capabilities include:

- multi-shop comparisons;
- shop-to-shop stock transfers;
- delegated administration;
- advanced approvals;
- richer supplier analytics;
- advanced purchasing workflows;
- advanced forecasting;
- richer audit/support tooling;
- advanced staff scheduling;
- additional payment integrations;
- deeper compliance/invoicing integrations.

No Phase 8 capability should distort the simple one-shop experience.

---

## 15. Cross-phase engineering rules

Every business mutation must have:

- authenticated actor context;
- organization scope;
- shop scope where relevant;
- explicit authorization;
- validation of server-authoritative business facts;
- stable idempotency where mutation retries are possible;
- auditability for sensitive actions;
- deterministic handling of failure;
- tests covering the business invariant.

Every offline-capable mutation must additionally have:

- stable local operation identity;
- explicit local state;
- synchronization status;
- conflict policy;
- revalidation at synchronization.

---

## 16. Definition of done for a phase

A phase is complete only when all applicable conditions are satisfied:

### Business behavior

The domain rules in the corresponding source-of-truth document are implemented.

### Authorization

Allowed and denied actions are tested for Owner and Staff contexts, including shop scope and permissions.

### Data integrity

The authoritative records can explain the resulting state.

### Failure behavior

Timeouts, duplicates, rejected operations, and partial external confirmation are handled explicitly.

### Offline behavior

Only where supported by that phase, offline operation, synchronization, and conflict behavior are tested.

### Auditability

Sensitive or financially material actions have traceable actor/context history.

### UX

The workflow works on the expected mobile form factor and does not require unnecessary setup or hardware.

### Tests

Automated tests cover happy paths, permission boundaries, important edge cases, and idempotency.

### Verification

The capability is tested end-to-end from user action to persisted domain state and back to visible result.

---

## 17. Required end-to-end acceptance journeys

The implementation must eventually pass at least these realistic journeys.

### Journey A — One-person duka

```text
Owner signs up
 ↓
Creates organization
 ↓
Creates shop
 ↓
Adds products
 ↓
Enters opening stock
 ↓
Makes cash sale
 ↓
Stock decreases
 ↓
Cash increases
 ↓
Owner sees today's state
```

### Journey B — Staff member, one shop

```text
Owner adds worker
 ↓
Assigns one shop
 ↓
Assigns sales permissions
 ↓
Worker logs in
 ↓
Shop opens automatically
 ↓
Worker sells
 ↓
Owner can see sale
```

### Journey C — Staff member, two shops

```text
Owner assigns worker to Shop A + Shop B
 ↓
Worker logs in
 ↓
Selects Shop B
 ↓
Operates in Shop B
 ↓
Shop A data remains outside active scope
```

### Journey D — Full Deni sale

```text
Customer takes KSh 1,000 of goods
 ↓
Pays KSh 0 now
 ↓
Authorized worker selects Pay Later
 ↓
Customer is identified
 ↓
Sale completes
 ↓
Stock decreases
 ↓
Deni balance increases KSh 1,000
```

### Journey E — Partial payment + Deni

```text
Sale = KSh 1,000
Cash = KSh 300
Deni = KSh 700
 ↓
Sale complete
 ↓
Stock decreases
 ↓
Cash movement = +KSh 300
 ↓
Deni ledger = +KSh 700
```

### Journey F — Deni repayment

```text
Customer pays KSh 400 later
 ↓
Repayment recorded
 ↓
Deni balance reduces by KSh 400
 ↓
Original sale remains unchanged
 ↓
Cash/M-Pesa movement reflects repayment
```

### Journey G — Purchase and receiving

```text
Supplier delivers 70 units
 ↓
Purchase/receipt recorded
 ↓
Inventory increases by 70
 ↓
Supplier payable/payment state updated
```

### Journey H — Reconciliation

```text
Sales/payments/expenses
 ↓
Expected cash
 ↓
Physical count
 ↓
Variance
 ↓
Authorized review
```

### Journey I — Offline sale

```text
Worker loses connection
 ↓
Supported sale recorded locally
 ↓
Operation marked pending sync
 ↓
Connection returns
 ↓
Server revalidates authorization
 ↓
Operation synchronizes once
 ↓
No duplicate sale/stock/cash effect
```

---

## 18. Explicit non-goals for the MVP

The MVP should not attempt to become:

- a full ERP;
- a payroll system;
- a banking product;
- a marketplace;
- a full enterprise CRM;
- a procurement marketplace;
- an autonomous purchasing agent;
- an accounting replacement for every business need.

The MVP wins by being extremely reliable at the core retail loop.

---

## 19. Priority rule when trade-offs occur

When time or complexity forces a choice, prioritize in this order:

```text
1. Data correctness
2. Security / authorization
3. Transaction integrity
4. Offline reliability where promised
5. Mobile usability
6. Operational speed
7. Insight quality
8. Advanced convenience features
```

A beautiful feature that can corrupt stock or money is never higher priority than a plain feature that preserves business truth.

---

## 20. Source-of-truth boundary

This roadmap does not redefine business rules.

Use the domain documents for **what each capability means**.

Use this roadmap for:

- build order;
- MVP scope;
- dependencies;
- phase acceptance;
- definition of done;
- end-to-end verification.

If the roadmap conflicts with a domain source-of-truth document, update the roadmap rather than silently changing the domain rule.

---

## 21. Final product direction

The implementation path should ultimately produce this loop:

```text
Know who can operate the business
        ↓
Know the stock
        ↓
Sell reliably
        ↓
Know where the money went
        ↓
Know the customer / Deni
        ↓
Know where stock came from
        ↓
Understand what is happening
        ↓
Help the owner decide what to do next
```

The objective is not to build the largest POS system.

The objective is to build a system the owner can trust because **its understanding of the shop is grounded in the shop's actual business events.**

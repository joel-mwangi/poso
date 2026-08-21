# DukaFlow Trust & Business Vision

## Purpose

DukaFlow is designed to become more than a conventional POS. It should become the trusted operating memory of an ordinary Kenyan shop: helping the owner sell, understand stock, understand cash, understand customers, and make better decisions.

> **DukaFlow adapts to the shop. The shop does not have to become a computer system.**

The product must remain practical for owner-operated dukas and small retailers that may primarily use a smartphone, cash and M-Pesa, have intermittent connectivity, and may not have barcode scanners or dedicated POS hardware.

## The Core Promise

DukaFlow should progressively help a merchant:

1. **Know your stock** — what is available, what is moving, what is low, and when to restock.
2. **Know your cash** — what was sold, how customers paid, what is owed, and what the business actually earned.
3. **Understand your customers** — repeat customers, purchase history, credit/Deni relationships, and useful buying patterns.
4. **Grow your business** — turn accumulated business data into simple, actionable decisions rather than complicated reports.

The long-term goal is for a merchant to think:

> **“I cannot run my shop without DukaFlow because it knows my business.”**

That dependency must be earned through accuracy, reliability, security and usefulness—not through lock-in.

## Trust Means

### Accurate

- A completed sale produces the correct inventory movement.
- Payment status is explainable.
- Financial corrections are explicit reversals or adjustments.
- Inventory history is auditable.

### Reliable

- Ordinary selling continues when the internet is unavailable.
- Offline operations persist locally.
- Synchronization safely retries.
- A single offline operation cannot become duplicate server transactions.

### Secure

- Supabase Auth is responsible for identity and sessions.
- PostgreSQL/RLS protects tenant and shop boundaries.
- Shop assignments, permissions, data visibility and approval authority are enforced server-side.
- Privileged secrets remain server-side.
- Staff actions are attributable to their authenticated identity.

### Private

Merchant and customer information is entrusted business data. Customer records, Deni, employee records, internal stock controls, payments, costs and audit information do not become public merely because a merchant uses DukaFlow.

## User and Responsibility Model

DukaFlow does not force every business into fixed job identities.

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
Audit
```

The owner creates the organization and shops, adds workers, assigns each worker to one or more shops, and grants permissions.

One worker assigned to one shop enters that shop directly after login. A worker assigned to multiple shops selects the active shop. A worker with no assignment is denied operational access until the owner fixes the assignment.

Terms such as **Cashier, Inventory, Manager/Supervisor, or Sales Attendant** are optional permission templates. They are not mandatory user categories and do not themselves determine authorization.

## Owner Onboarding Setup Checklist

Immediately after account registration and verification, and before organization/shop bootstrap, DukaFlow should ask the owner a short ticking checklist:

1. Do you have more than one shop? **Yes / No**
2. Do you accept M-Pesa? **Yes / No**
3. Do you allow Deni? **Yes / No**
4. Do you buy stock from suppliers? **Yes / No**

If the answer to question 1 is **No**, ask:

5. Do you run the shop alone? **Yes / No**

If the answer is **Yes**, DukaFlow automatically records **Other people use the system: No**. If the answer is **No**, DukaFlow automatically records **Other people use the system: Yes**. Do not ask the duplicate staff-use question.

If the answer to question 1 is **Yes**, continue with multi-shop creation. Do not ask the helping-person question during the initial quiz. That question appears later in the settings for each specific shop after the owner taps **Set up shop**.

The answers recommend a starting setup. The owner may choose **Start with simple setup** or **Use recommended setup**. Follow-up configuration should appear only when relevant, such as an M-Pesa Till Number, staff access, additional shops, customer/Deni tracking, or supplier tools. The answers must guide progressive disclosure rather than permanently classify the owner or force advanced setup.

After organization creation, the first shop must be created with both a name and a simple location:

```text
Shop name
[ Enter shop name ]

Shop location
[ Enter town, estate, street, or area ]

[Create shop]
```

Additional shops use the same form and may be added immediately or later. Location should be flexible and should not require a formal postal address.

After the first shop is created, the owner enters one **Shop Profile Settings** area:

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

M-Pesa configuration is conditional. The owner selects Till Number or PayBill, enters the payment number, chooses Sandbox or Live, and securely configures Daraja credentials obtained through Safaricom Daraja Live. The owner may set it up later and continue with cash operations. Customer/Deni, supplier/purchasing, staff, and additional-shop sections remain conditional.

## Individual-First Growth Principle

DukaFlow must work completely for **one individual running one shop** before it introduces organizational complexity. Every later capability is additive rather than mandatory.

```text
LEVEL 1 — INDIVIDUAL

Owner
└── Shop
    ├── Products
    ├── Stock
    ├── Sales
    ├── Cash
    ├── Customers
    └── Deni

LEVEL 2 — SMALL TEAM

Owner
└── Shop
    ├── Owner
    ├── Staff
    ├── Permissions
    └── Operational responsibility

LEVEL 3 — STRUCTURED SHOP

Owner
└── Shop
    ├── Multiple staff
    ├── Shifts
    ├── Approvals
    ├── Reconciliation
    └── Delegated responsibilities

LEVEL 4 — MULTI-SHOP BUSINESS

Organization
├── Shop A
├── Shop B
├── Shop C
├── Shared staff
├── Shop-specific permissions
├── Cross-shop visibility
└── Organization-level intelligence
```

The one-person merchant should experience the product as:

```text
You
 ↓
Your shop
 ↓
Products
 ↓
Stock
 ↓
Sell
```

The underlying organization, membership, permission, audit, and security structures may exist from day one, but they must remain mostly invisible until they become relevant.

Growth must preserve the Level 1 workflow. Adding staff, approvals, shifts, supplier controls, or multiple shops must not make the single-owner workflow harder.

## Useful Intelligence

DukaFlow should eventually explain business history rather than only displaying numbers.

### Stock

> **Unga 2kg: 12 units left. You normally sell about 4 per day. You may run out in about 3 days.**

Recommendations are estimates based on actual transaction history and should be clearly presented as such.

### Cash

```text
TODAY
Sales             KSh 18,450
Cash              KSh  7,200
M-Pesa            KSh 10,850
Deni              KSh    400
Estimated profit  KSh  3,900
```

DukaFlow should distinguish recorded facts from estimates and should never invent cost information.

### Customers

Useful information should emerge naturally:

> **Mary has purchased 8 times this month.**

> **John has an outstanding Deni balance of KSh 850.**

## Strategic Moat

The moat should not be a giant feature list, artificial complexity, expensive hardware, or proprietary lock-in.

It should become:

```text
DAILY USE
   ↓
ACCURATE TRANSACTIONS
   ↓
CLEAN BUSINESS HISTORY
   ↓
BETTER STOCK / CASH / CUSTOMER UNDERSTANDING
   ↓
BETTER DECISIONS
   ↓
MORE BUSINESS VALUE
   ↓
MORE TRUST
   ↓
MORE DAILY USE
```

Over time, DukaFlow can understand a shop's products, sales rhythms, stock movement, payment mix, customers, staff activity and business trends.

## Product Principles

### 1. Trust before feature count

A small number of reliable workflows is better than dozens of unreliable features.

### 2. Smartphone first

The core merchant workflow should work naturally on an Android-sized screen. A barcode scanner, desktop computer, receipt printer or dedicated terminal is optional.

### 3. Offline first

Internet loss must not stop ordinary selling.

### 4. Cash, M-Pesa and Deni are first-class

These are core merchant workflows.

### 5. Permissions over titles

Job titles are convenience templates. The real security boundary is the explicit permission plus organization/shop scope.

### 6. Explain the business

Reports should answer:

- What sold today?
- What made money?
- What is running low?
- Who owes me?
- What should I restock?
- How am I doing compared with normal?

### 7. Never surprise the merchant

Important changes, sync failures, stock adjustments, refunds, approvals and corrections should be visible and explainable.

### 8. Earn intelligence from history

Advanced recommendations become useful only after trustworthy transaction history accumulates.

### 9. Individual first, structure later

A one-person owner must be able to operate without creating staff accounts, assigning themselves permissions, configuring shifts, or setting up approval hierarchies.

Advanced structure is introduced only when the business needs it:

```text
One person
→ Staff
→ Permissions
→ Approvals / shifts
→ Multiple shops
```

The product's internal architecture may be highly structured, but the merchant's daily workflow should remain simple.

## Architecture Direction

```text
Supabase Auth
     ↓
User / Organization
     ↓
Owner OR Staff
     ↓
Shop assignment(s)
     ↓
Permissions / Visibility / Approval
     ↓
React POS
     ↓
Domain + Application Rules
     ↓
Dexie / IndexedDB
     ↓
Local Outbox
     ↓
Idempotent Synchronization
     ↓
Supabase PostgreSQL + RLS
```

The local database is operational state, not final authority. Supabase remains the durable cloud boundary while the local-first layer allows the merchant to continue working.

## What DukaFlow Should Not Become

DukaFlow should not require:

- A desktop computer to make the first sale.
- A barcode scanner to operate.
- Permanent broadband.
- Accounting expertise to understand daily performance.
- A large setup before a merchant can sell.
- Mandatory manager/cashier/inventory accounts in a one-person shop.
- Staff, permission, shift, or approval configuration when there is only one owner/operator.
- Enterprise-style organization administration as a prerequisite for ordinary shop operations.

Hardware, advanced accounting, purchasing, multi-branch management, public storefronts and advanced analytics can be added as the merchant's needs grow.

## Long-Term Vision

```text
SELL
 ↓
RECORD
 ↓
KNOW STOCK
 ↓
KNOW CASH
 ↓
UNDERSTAND CUSTOMERS
 ↓
UNDERSTAND THE BUSINESS
 ↓
MAKE BETTER DECISIONS
 ↓
GROW
```

DukaFlow wins when the technology becomes almost invisible and the merchant simply feels that the shop is easier to understand and control.

## Evidence and Research Notes

The primary MVP merchant is an owner-operated Kenyan general retail duka / small shop. This is a product-design reference model, not a claim that every Kenyan shop operates identically.

Typical working assumptions to validate through direct field research include:

- The owner may be directly involved in daily operations.
- A shop may have family members or a small number of helpers.
- The smartphone is often the primary digital device.
- Cash and mobile money are normal payment paths.
- Customer credit/Deni may be used.
- Formal digital bookkeeping may be limited.
- Simple stock visibility is more important initially than complex inventory accounting.
- Internet and electricity interruptions can matter operationally.

DukaFlow should also be able to grow into small minimarkets, agrovets, hardware shops, specialized retailers, and small multi-branch retailers without changing its core transaction semantics.

Digital maturity should be treated as a ladder rather than a gate:

```text
Mostly manual
   ↓
Smartphone-enabled
   ↓
Digitally managed
```

The product should work at the first level and become progressively more powerful at the later levels without forcing merchants to become accounting experts.

Useful validation questions include:

- What did I sell today?
- How much cash should I have?
- Which payments were mobile money?
- Who owes me Deni?
- What stock do I have?
- What is running out?
- What did I buy from suppliers?
- Did my sale reduce stock correctly?
- What happened while the device was offline?

Market facts and product assumptions must remain separate. Direct merchant interviews and observation are required to validate exact transaction volumes, basket sizes, Deni frequency, supplier-credit behavior, device constraints, internet/electricity failure patterns, willingness to pay, support expectations, and demand for future public-store capabilities.

## Reference Sources

- Office of the Data Protection Commissioner — Guidance Note on Processing by MSMEs (2025): https://www.odpc.go.ke/wp-content/uploads/2025/11/ODPC-%E2%80%93-Guidance-Note-on-Processing-by-MSMEs.pdf
- State Department for MSMEs Development: https://www.msme.go.ke/
- dPOS Kenya: https://dpos.co.ke/
- Asili ERP: https://asilierp.com/
- Retaela: https://www.retaela.co.ke/

## Final Principle

> **DukaFlow should not try to make the Kenyan shop look like a corporate retail store. It should make the ordinary Kenyan shop stronger while respecting the way it already works.**

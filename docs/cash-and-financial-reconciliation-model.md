# DukaFlow Cash & Financial Reconciliation Model

**This document is the source of truth for how DukaFlow distinguishes sales value, money actually received, Deni owed, expenses, cash movement, and reconciliation.**

**Source relationships:**

- `docs/user-responsibilities.md` defines who may perform cash, payment, expense, and reconciliation actions.
- `docs/user-lifecycle-and-access-governance.md` defines who may grant or change those permissions.
- `docs/post-authentication-access-and-first-screen.md` defines the user's authorized runtime context.
- `docs/user-workspace-and-daily-workflow.md` defines where cash and financial work appears.
- `docs/inventory-and-stock-model.md` defines inventory consequences that support cost and stock valuation.
- `docs/sales-and-settlement-model.md` defines the sale, Pay Now, Pay Later/Deni, and payment lifecycle.

---

## 1. Core question

DukaFlow must help the merchant answer:

> **How much money should this shop have, where should it be, what is still owed to the shop, what has left the shop, and does the recorded money agree with reality?**

The system must never confuse:

```text
Sales value
≠
Money received
≠
Cash physically in the shop
≠
M-Pesa balance
≠
Deni owed by customers
≠
Profit
```

These are related but different business facts.

---

## 2. The financial picture

For a shop, DukaFlow should be able to reason about at least:

```text
SALES VALUE
   ↓
What customers purchased

PAYMENTS RECEIVED
   ↓
Cash / M-Pesa / other confirmed money

DENI / RECEIVABLES
   ↓
What customers still owe

EXPENSES / OUTGOINGS
   ↓
Money spent by the business

CASH POSITION
   ↓
What should physically be in the controlled cash location

M-PESA / OTHER BALANCES
   ↓
What should exist in the relevant payment channel

RECONCILIATION
   ↓
What is actually present vs what DukaFlow expects
```

---

## 3. Sales value is not cash

Example:

```text
Today's sales                  KSh 10,000
Cash paid                      KSh 4,000
M-Pesa confirmed               KSh 2,000
Deni created                   KSh 4,000
```

DukaFlow must **not** tell the owner:

> “You have KSh 10,000 cash.”

The business has KSh 6,000 received today across those payment channels, and KSh 4,000 remains a customer receivable.

The sales figure describes commercial activity. It does not describe physical cash.

---

## 4. Money movement types

DukaFlow should distinguish financial movements by what actually happened.

### Money received

Examples:

- cash from a sale;
- confirmed M-Pesa payment;
- Deni repayment;
- other configured business income.

### Money paid out

Examples:

- supplier payment;
- operating expense;
- transport expense;
- utilities;
- owner withdrawal/draw where explicitly supported;
- refunds to customers;
- other approved business outflows.

### Non-cash business events

Examples:

- sale placed on Deni;
- stock adjustment without a cash movement;
- accounting correction;
- transfer between controlled payment locations.

The financial model must not create fake cash movements for non-cash events.

---

## 5. Cash drawer / physical cash

Where the shop uses a physical cash drawer, DukaFlow should maintain an expected cash position.

A conceptual model is:

```text
Opening cash
+ cash sales received
+ Deni repayments received in cash
+ other approved cash-in
- cash refunds
- approved cash expenses
- other approved cash-out
---------------------------------
Expected physical cash
```

The expected amount is not automatically the actual amount.

At reconciliation, the worker counts the physical cash.

```text
Expected cash:  KSh 12,500
Actual cash:    KSh 12,300
Difference:     -KSh 200
```

The KSh 200 variance must be visible and explainable rather than silently hidden.

---

## 6. Cash tender versus cash kept in the drawer

Cash tendered by a customer is not always equal to the amount that stays in the drawer.

Example:

```text
Sale total:       KSh 800
Customer gives:   KSh 1,000
Change returned:  KSh 200
Cash retained:    KSh 800
```

DukaFlow must use the **retained/accepted amount** for the financial effect of the sale, while retaining tendered/change facts when needed for operational reconciliation.

---

## 7. M-Pesa and other digital payments

DukaFlow must distinguish:

```text
Payment initiated / reference entered
        ↓
Payment pending
        ↓
Trusted payment confirmed
```

Only a confirmed receipt under the chosen payment integration rules should increase the confirmed digital-payment balance.

A worker typing a transaction reference should not automatically increase the shop's confirmed M-Pesa position.

### Reconciliation

Where the shop reconciles M-Pesa:

```text
DukaFlow expected M-Pesa
          vs
Actual/provider statement
          ↓
Variance / match
```

The system should preserve the evidence used for reconciliation where available.

---

## 8. Deni is a receivable, not cash

When a customer takes goods on Pay Later:

```text
Sale value increases
Inventory decreases
Cash received = KSh 0 if no initial payment
Deni receivable increases
```

Example:

```text
Sale total:        KSh 1,000
Paid now:          KSh 0
Deni created:      KSh 1,000
```

The shop has earned a receivable from the transaction, but it does **not** have KSh 1,000 in cash.

When the customer later pays:

```text
Deni decreases
Cash/M-Pesa received increases
```

The repayment is not another sale.

---

## 9. Deni repayments

A Deni repayment must be its own financial event.

Example:

```text
Customer balance: KSh 1,000
Repayment in cash: KSh 300
--------------------------
Remaining Deni:     KSh 700
```

DukaFlow should retain:

- customer;
- amount;
- payment method;
- date/time;
- actor;
- shop;
- originating customer balance/ledger;
- reference/idempotency identity.

The repayment must update the appropriate money position.

---

## 10. Expenses and business outflows

DukaFlow should distinguish business expenses from sales refunds and from inventory purchases where the purchasing model treats stock procurement separately.

An expense should capture, where applicable:

- amount;
- payment source;
- category;
- description/note;
- date/time;
- shop;
- user;
- approval state;
- reference/receipt evidence where available.

Example:

```text
Morning cash sales:        KSh 8,000
Cash expense:              KSh   500
Expected cash contribution:KSh 7,500
```

Recording an expense must reduce the relevant money position but must not alter historical sales.

---

## 11. Supplier purchases and stock-related money

A stock purchase may have both:

1. an inventory effect; and
2. a financial effect.

Example:

```text
Receive 20 cartons
        ↓
Inventory increases
        ↓
Supplier payment KSh 10,000
        ↓
Cash/bank/M-Pesa position decreases
```

If a supplier balance is supported, the amount owed to the supplier must remain distinct from customer Deni.

The system should not assume every stock receipt was paid immediately.

---

## 12. Refunds and returns

Refunds affect money differently from returns.

A product return may:

- restore stock;
- change the sale outcome.

A monetary refund may:

- reduce the shop's cash or payment balance;
- reverse or reduce a receivable where appropriate.

Example:

```text
Original sale:          KSh 1,000
Customer refund:        KSh   300

Shop money position:    -KSh 300
Original sale history:   remains visible
```

DukaFlow must not “delete” the original sale to make the refund disappear from history.

---

## 13. Owner withdrawals and non-sales cash movement

A shop may have money leaving the business for reasons that are not expenses or refunds.

Examples may include an owner taking money from the drawer.

If DukaFlow supports such movements, they must be explicitly categorized rather than appearing as unexplained cash shortages.

```text
Opening cash        5,000
Cash sales          8,000
Owner withdrawal    1,000
Expected cash      12,000
```

The owner withdrawal should not reduce sales or invent an expense unless the business rules explicitly classify it that way.

---

## 14. Shifts and cash responsibility

Where the shop uses shifts or tills, DukaFlow should know who was responsible for the cash during a period.

A shift can provide the operational boundary for reconciliation:

```text
Opening float
   ↓
Sales / repayments / other cash-in
   ↓
Expenses / refunds / authorized cash-out
   ↓
Cash count
   ↓
Close shift
```

A shift should preserve:

- opening amount;
- responsible worker;
- shop;
- start time;
- end time;
- expected closing amount;
- actual closing amount;
- variance;
- resolution/approval when required.

The exact shift model may remain optional for tiny shops.

---

## 15. One-person duka

A one-person shop should not be forced into complicated accounting screens.

The owner may simply see:

```text
Today's sales
Cash received
M-Pesa received
Deni created
Deni collected
Expenses
Expected cash
```

The detailed ledger exists underneath for trust and reconciliation, but the default experience should remain simple.

---

## 16. Multiple workers

For a staffed shop, DukaFlow should be able to distinguish:

- which worker received cash;
- which worker processed a sale;
- which worker recorded an expense;
- who opened/closed a shift;
- who performed reconciliation;
- who approved a variance.

Staff responsibility should be attributable to authenticated identities, not shared accounts.

---

## 17. Multi-shop organization

Every financial movement should have the correct shop scope where applicable.

Example:

```text
Organization
├── Shop A
│   ├── Cash position
│   ├── M-Pesa position
│   └── Deni activity
└── Shop B
    ├── Cash position
    ├── M-Pesa position
    └── Deni activity
```

The owner may view combined organization-level summaries, but shop-level financial records must remain distinguishable.

A worker must never see or reconcile another shop merely because they know its identifier.

---

## 18. Reconciliation

Reconciliation answers:

> **Does what DukaFlow says should exist agree with what actually exists?**

It should be possible for each relevant money channel.

### Cash reconciliation

```text
Expected cash
vs.
Actual counted cash
```

### M-Pesa reconciliation

```text
Expected confirmed M-Pesa
vs.
Provider/statement evidence
```

### Other payment channels

Use the same principle where supported.

### Variance

A variance should record:

- expected amount;
- actual amount;
- difference;
- actor;
- timestamp;
- reason where provided;
- approval/resolution where required.

DukaFlow must never silently overwrite expected balances with counted amounts.

---

## 19. Reconciliation does not rewrite history

Suppose:

```text
Expected cash: KSh 10,000
Actual count:   KSh 9,700
Variance:      -KSh 300
```

DukaFlow should record the variance.

It should not change yesterday's sales from KSh 10,000 to KSh 9,700 simply to make the numbers match.

The historical business events remain intact, and the variance becomes its own explainable event.

---

## 20. Financial statuses

DukaFlow should distinguish at least:

- recorded;
- pending;
- confirmed;
- failed;
- reversed;
- refunded;
- reconciled;
- exception/variance.

A pending payment must not be counted as confirmed money.

A Deni balance must not be counted as cash.

A recorded expense is not proof that money was physically removed unless the relevant payment movement was recorded under the chosen workflow.

---

## 21. Profit is not cash position

The owner may eventually ask:

> “How much did I make?”

That is different from:

> “How much cash do I have?”

A simplified distinction is:

```text
Sales revenue
- cost of goods sold
- applicable business expenses
= profit measure
```

while:

```text
Cash received
- cash paid out
= cash movement/position
```

A shop can have good sales and low cash because customers bought on Deni or money was used for stock/expenses.

The financial model must preserve this distinction so future analytics are trustworthy.

---

## 22. Offline financial operations

Offline operation may allow supported cash and Deni workflows using locally provisioned data.

However:

- offline does not create new authority;
- offline confirmed M-Pesa should not be claimed without trusted confirmation;
- offline money movements need stable operation identities;
- synchronization must be idempotent;
- revoked users/devices must not gain permanent financial authority from stale offline state;
- conflicts must be surfaced rather than silently merged when business meaning would be lost.

---

## 23. Audit requirements

Sensitive financial events must be attributable.

Retain, where applicable:

- actor;
- organization;
- shop;
- shift/till;
- money channel;
- amount;
- direction (in/out);
- source business event;
- timestamp;
- device/session context;
- reason/reference;
- approval;
- reconciliation state.

Important events include:

- cash received;
- M-Pesa confirmation;
- Deni repayment;
- expense;
- refund;
- owner withdrawal;
- shift opening/closing;
- cash count;
- variance creation/resolution;
- reconciliation.

---

## 24. Non-negotiable rules

1. Sales value is not the same as cash.
2. Deni is not cash.
3. Pending external payment is not confirmed money.
4. Cash tendered is not necessarily cash retained because of change.
5. Every financial movement must be explainable.
6. Reconciliation records differences; it does not rewrite history.
7. Historical sales remain attributable after refunds, reversals, or repayments.
8. Shop scope is mandatory for shop-specific financial operations.
9. Shared staff accounts are not acceptable for attributable financial actions.
10. Offline operation does not create new authority.
11. Duplicate retries must not duplicate money movements.
12. Financial permissions and approval authority are separate concepts.

---

## 25. Real-world examples

### Example A — Sales versus cash

```text
Sales:          KSh 10,000
Cash:           KSh 4,000
M-Pesa:         KSh 2,000
Deni:           KSh 4,000

Cash position does NOT become KSh 10,000.
```

### Example B — Full Deni sale

```text
Sale:           KSh 2,000
Paid today:     KSh 0
Deni:           KSh 2,000

Inventory leaves shop.
Cash does not increase.
Receivable increases.
```

### Example C — Cash expense

```text
Opening cash:   KSh 5,000
Cash sales:     KSh 3,000
Cash expense:   KSh   500
Expected cash:  KSh 7,500
```

### Example D — Cash variance

```text
Expected:       KSh 7,500
Counted:        KSh 7,300
Variance:      -KSh 200

History stays intact.
Variance is recorded for investigation.
```

---

## 26. Source-of-truth boundaries

Use:

- `docs/sales-and-settlement-model.md` for **what the customer bought and whether the amount is paid now or placed on Deni**.
- `docs/inventory-and-stock-model.md` for **stock movements tied to those transactions**.
- `docs/user-responsibilities.md` for **who may perform financial operations**.
- `docs/user-lifecycle-and-access-governance.md` for **who may grant/change financial permissions**.
- `docs/user-workspace-and-daily-workflow.md` for **where financial operations appear**.
- This document for **money movement, cash position, Deni collections, expenses, shifts/tills, and reconciliation**.

Any conflicting cash/reconciliation rule must be resolved in favor of this document for this domain.

## 27. Completion definition

Cash and financial reconciliation is not implemented merely because a sales total is displayed.

It is complete when DukaFlow can reliably distinguish, record, reconcile, and explain:

- sales value;
- money actually received;
- cash position;
- digital-payment position;
- Deni receivables;
- Deni repayments;
- expenses and other approved outflows;
- refunds;
- shifts/tills where supported;
- variances;
- reconciliation history;
- offline financial operations where supported;
- auditability;
- duplicate prevention.

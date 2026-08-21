# DukaFlow Sales & Settlement Model

**This document is the source of truth for what a sale means in DukaFlow and how a customer settles, partially settles, or takes the goods on Deni/Pay Later.**

**Source relationships:**

- `docs/user-responsibilities.md` defines who may perform sales, payments, and Deni actions.
- `docs/user-lifecycle-and-access-governance.md` defines who may grant/change those permissions.
- `docs/post-authentication-access-and-first-screen.md` defines the authorized runtime context.
- `docs/user-workspace-and-daily-workflow.md` defines where selling is presented.
- `docs/inventory-and-stock-model.md` defines the stock effect of a completed sale, return, or reversal.

---

## 1. Core principle

A customer transaction has **two distinct business questions**:

1. **What did the customer take?** → the **sale**.
2. **How is the customer settling the amount?** → **payment now, payment later, or a combination**.

Deni/Pay Later is not merely a payment-method label.

It is a deliberate decision by the shop to allow a customer to owe money after taking the goods.

---

## 2. The transaction model

```text
Customer selects goods
        ↓
      SALE
        ↓
Settlement decision
   ┌────────┴────────┐
   ↓                 ↓
PAY NOW          TAKE PAY LATER
   ↓                 ↓
Cash / M-Pesa      Customer owes
other supported      amount
payment              ↓
   │               Deni ledger
   └───────┬─────────┘
           ↓
     Sale + stock + financial history
```

The model must also handle a combination of the two.

```text
Sale total = KSh 1,000

Pay now      = KSh 400
Pay later    = KSh 600
```

And it must handle **zero initial payment**:

```text
Sale total = KSh 1,000

Pay now      = KSh 0
Pay later    = KSh 1,000
```

That is a valid Deni sale when the shop permits it.

---

## 3. Real-world settlement scenarios

DukaFlow must be able to represent these real scenarios without creating fake or contradictory transactions.

### Scenario A — Full payment in cash

```text
Sale:       KSh 500
Cash now:   KSh 500
Deni:       KSh 0
```

The sale is settled immediately.

### Scenario B — Full payment through M-Pesa

```text
Sale:       KSh 500
M-Pesa:     KSh 500
Deni:       KSh 0
```

The settlement is complete only according to the trusted M-Pesa confirmation rules.

### Scenario C — Customer takes everything on Deni

```text
Sale:       KSh 500
Cash now:   KSh 0
M-Pesa:     KSh 0
Pay later:  KSh 500
```

The sale is accepted and the customer receives the goods, while the customer's Deni balance increases by KSh 500.

This is **not an unpaid failed sale**.

### Scenario D — Partial payment + Deni

```text
Sale:       KSh 1,000
Cash now:   KSh 300
Pay later:  KSh 700
```

The sale is accepted, KSh 300 is settled now, and KSh 700 is added to the customer's Deni balance.

### Scenario E — Cash + M-Pesa

```text
Sale:       KSh 1,000
Cash:       KSh 400
M-Pesa:     KSh 600
Deni:       KSh 0
```

This is a split payment with the entire sale settled now.

### Scenario F — M-Pesa + Deni

```text
Sale:       KSh 1,000
M-Pesa:     KSh 400
Pay later:  KSh 600
```

The sale is accepted with KSh 600 remaining as Deni.

### Scenario G — Cash + M-Pesa + Deni

```text
Sale:       KSh 1,500
Cash:       KSh 300
M-Pesa:     KSh 500
Pay later:  KSh 700
```

DukaFlow should support this kind of combination if split settlement is enabled.

### Scenario H — Customer later pays Deni

The later payment is **not a new sale**.

```text
Original sale
      ↓
Deni balance KSh 700
      ↓
Customer pays KSh 300 later
      ↓
Deni balance KSh 400
```

The repayment creates a separate financial event linked to the customer's Deni ledger and originating balance.

---

## 4. Cart, sale, payment, and Deni are different records/concepts

### Cart

Temporary working state before the shop accepts the transaction.

### Sale

The commercial record of goods/items the customer took.

### Payment

Money actually received or confirmed against the sale.

### Deni / Pay Later

An amount intentionally left outstanding and owed by a specific customer.

A simple conceptual relationship is:

```text
Sale total
   ↓
Amount paid now
   ↓
Amount placed on Deni
```

For a normal transaction:

```text
Amount paid now + Amount placed on Deni = Sale total
```

The first amount may be zero.

---

## 5. “Pay Now” and “Take Pay Later” are different decisions

The checkout should make this distinction visible to the worker.

The business decision is:

```text
How is this sale being settled?

[ Pay Now ]
[ Take Pay Later ]
```

However, “Pay Now” does not have to mean there is only one method.

The pay-now branch may support:

- Cash;
- M-Pesa;
- other configured payment methods;
- split payment among supported methods.

“Take Pay Later” means an approved amount is intentionally recorded as Deni.

It may be:

- 100% Deni;
- partly Deni and partly paid now;
- Deni combined with more than one immediate payment method.

---

## 6. Customer requirement for Pay Later

Deni must normally be attached to a known customer.

The system should not create an anonymous Deni balance that nobody can identify.

The worker should be able to:

```text
Choose Pay Later
       ↓
Find existing customer
       OR
Create customer
       ↓
Confirm amount owed
       ↓
Complete sale
```

If the shop wants a controlled anonymous-credit process in future, that must be an explicit business feature with its own safeguards rather than an accidental side effect.

---

## 7. Customer balance

The Deni balance is a ledger, not a number silently overwritten on the customer profile.

Example:

```text
Opening Deni balance       KSh 200
New Pay Later sale         KSh 500
Repayment                  -KSh 300
Adjustment                 +KSh  50
-----------------------------------
Current Deni balance       KSh 450
```

Each movement should reference the business event that caused it.

The system should be able to explain:

> “Why does this customer owe KSh 450?”

---

## 8. Payment lifecycle

Payment and external payment confirmation have their own lifecycle.

### Cash

Usually immediate:

```text
Tendered
 ↓
Accepted
 ↓
Settled
```

The system should calculate change where applicable.

### M-Pesa

Possible lifecycle:

```text
Initiated
 ↓
Pending confirmation
 ↓
Confirmed
```

or:

```text
Pending
 ↓
Failed / expired / exception
```

A reference typed by a worker or customer does not automatically prove payment.

### Deni

Deni is not a pending M-Pesa transaction. It is a deliberate receivable:

```text
Approved Pay Later
 ↓
Customer owes amount
 ↓
Deni ledger increases
```

---

## 9. Sale completion and settlement state

The UI must distinguish the sale from the settlement state.

A sale can be:

- fully settled now;
- partially settled with Deni remaining;
- fully placed on Deni;
- awaiting external payment confirmation, where the business rules allow a pending state;
- failed/rejected before acceptance;
- later refunded/reversed.

The system must never display “Paid” when the trusted settlement state is still pending.

---

## 10. Stock effect

When the business accepts the sale and the customer takes the goods, the inventory effect is governed by `docs/inventory-and-stock-model.md`.

The system must not require a cashier to manually reduce stock after the sale.

The critical distinction is:

> **Payment timing does not automatically define whether a sale happened.**

A customer may receive goods on Deni with KSh 0 paid now, and the stock still needs to move according to the accepted-sale inventory rules.

Likewise, a pending external payment must not silently produce a stock deduction unless the product explicitly defines that behavior.

---

## 11. Sale history must remain immutable

Once a sale is accepted, it becomes historical business data.

Do not rewrite the original sale simply because the customer later pays Deni.

Example:

```text
Aug 18
Sale: KSh 1,000
Pay later: KSh 1,000

Aug 25
Customer pays KSh 600

Aug 30
Customer pays KSh 400
```

The original Aug 18 sale remains KSh 1,000.

The later repayments are separate ledger events.

---

## 12. Discounts and price authority

A discount is an explicit commercial adjustment.

A worker must not be able to manipulate the sale price simply by changing a client-side value.

The system should preserve:

- product price used;
- permitted discount;
- final sale amount;
- actor who applied the discount;
- approval where required.

Cost price is separate from selling price and should come from authoritative inventory/purchasing information rather than an untrusted checkout field.

---

## 13. Returns, refunds, and reversals

These are separate events.

### Product return

Goods come back into the shop and inventory may increase.

### Refund

Money previously received is returned to the customer, subject to permission/approval.

### Deni reversal/adjustment

An outstanding customer balance is corrected through an explicit ledger event.

### Void/reversal

The original transaction is invalidated according to the shop's rules, while history remains auditable.

None of these should mean “delete the original sale.”

---

## 14. Offline operation

The normal selling flow should work offline where supported by the product.

Offline state must distinguish:

```text
Locally accepted
vs.
Cloud synchronized
```

A local Deni sale may be recorded only when the device has the required customer/shop data and the user is authorized to perform that action.

A device must never gain new Deni authority simply because it is offline.

When synchronization resumes, server-side authorization and domain validation apply again.

---

## 15. Duplicate prevention

Every sale and Deni/payment mutation needs a stable operation identity or equivalent idempotency mechanism.

Retrying the same operation must not create:

- duplicate sales;
- duplicate stock reductions;
- duplicate Deni increases;
- duplicate repayments.

---

## 16. Permissions

The access model determines which users may perform which settlement actions.

Examples of underlying permissions may include:

- operate sales;
- receive cash;
- record M-Pesa payments;
- use Pay Later/Deni;
- apply discounts;
- issue refunds;
- perform Deni adjustments;
- record Deni repayments;
- view customer balances;
- reconcile payments.

Permission templates such as Sales/Cashier remain convenience bundles only.

---

## 17. Approval rules

The owner may require approval for risky actions, for example:

- allowing Deni above a configured amount;
- increasing a customer's credit limit;
- large Deni adjustments;
- refunds above a threshold;
- unusual discounts;
- reversing a completed transaction.

Request and approval are separate capabilities.

A worker requesting Pay Later should not automatically be allowed to approve their own exceptional credit request.

---

## 18. Receipts and customer statements

A receipt should show the real settlement state.

Examples:

```text
TOTAL       KSh 1,000
PAID NOW    KSh     0
PAY LATER   KSh 1,000
BALANCE     KSh 1,000
```

Or:

```text
TOTAL       KSh 1,000
CASH        KSh   300
M-PESA      KSh   200
PAY LATER   KSh   500
BALANCE     KSh   500
```

Customer statements should later explain the Deni ledger independently of individual receipt presentation.

---

## 19. What the checkout must never assume

DukaFlow must never assume:

- every customer pays immediately;
- every Pay Later transaction includes an initial payment;
- every Deni customer is already registered;
- every sale has exactly one payment method;
- an M-Pesa reference means confirmed payment;
- a Deni balance is the same thing as a failed payment;
- receiving money later creates a new sale;
- returning goods means deleting the original sale;
- a receipt being displayed proves external settlement;
- being offline creates new authority.

---

## 20. Core business invariants

For an accepted sale:

```text
Sale total
=
Paid now
+
Pay later / Deni
```

with:

```text
Paid now >= 0
Pay later >= 0
```

and:

```text
Paid now = 0
```

is valid when the customer is allowed to take the entire sale on Deni.

For a fully paid sale:

```text
Pay later = 0
Paid now = Sale total
```

For a fully Deni sale:

```text
Paid now = 0
Pay later = Sale total
```

For a mixed sale:

```text
0 < Paid now < Sale total
Pay later = Sale total - Paid now
```

For a multi-method immediate payment:

```text
Cash + M-Pesa + other immediate payments = Paid now
```

These invariants are business rules. The implementation may use different database structures, but the behavior must remain equivalent.

---

## 21. Real-world examples DukaFlow must support

```text
1. KSh 100 item → customer pays KSh 100 cash

2. KSh 1,000 basket → customer pays KSh 1,000 M-Pesa

3. KSh 1,000 basket → customer pays nothing today → KSh 1,000 Deni

4. KSh 1,000 basket → KSh 300 cash + KSh 700 Deni

5. KSh 1,000 basket → KSh 400 cash + KSh 600 M-Pesa

6. KSh 1,500 basket → KSh 300 cash + KSh 500 M-Pesa + KSh 700 Deni

7. Customer later pays KSh 400 against an existing Deni balance

8. Customer returns one item from a Deni sale

9. Customer makes a repayment while another sale is happening

10. Staff completes a Deni sale while offline and it synchronizes later
```

The model must not require the shop to pretend that all these cases are the same transaction type.

---

## 22. Source-of-truth boundaries

Use:

- `docs/user-responsibilities.md` for **who may perform each action**.
- `docs/user-lifecycle-and-access-governance.md` for **who may grant/change that access**.
- `docs/post-authentication-access-and-first-screen.md` for **the current authorized runtime context**.
- `docs/user-workspace-and-daily-workflow.md` for **where the workflow appears in the product**.
- `docs/inventory-and-stock-model.md` for **inventory consequences**.
- This document for **sales, immediate settlement, Pay Later/Deni, and their connected financial lifecycle**.

Any conflicting sales/settlement rule must be resolved in favor of this document for this domain.

## 23. Completion definition

Sales and settlement are not implemented merely because a checkout screen can create a sale.

They are complete when the system can reliably handle, test, audit, and synchronize:

- full payment now;
- zero payment now + full Deni;
- partial payment + Deni;
- multiple immediate payment methods;
- M-Pesa confirmation states;
- Deni creation;
- Deni repayment;
- returns/refunds/reversals;
- stock effects;
- offline operation;
- idempotency;
- authorization;
- auditability.

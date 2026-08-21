# DukaFlow Customer & CRM Model

**This document is the source of truth for how DukaFlow identifies, remembers, serves, protects, and learns from customers without making a small shop operate like an enterprise CRM.**

**Source relationships:**

- `docs/user-responsibilities.md` defines who may view or manage customer information.
- `docs/user-lifecycle-and-access-governance.md` defines who may grant or change those permissions.
- `docs/post-authentication-access-and-first-screen.md` defines the authorized runtime context.
- `docs/user-workspace-and-daily-workflow.md` defines where customer work appears.
- `docs/inventory-and-stock-model.md` defines the products involved in customer purchases.
- `docs/sales-and-settlement-model.md` defines sales, immediate payment, Pay Later/Deni, repayments, returns, and reversals.
- `docs/cash-and-financial-reconciliation-model.md` defines financial reconciliation related to payments and Deni.

---

## 1. Core question

DukaFlow should help the merchant answer:

> **Who is this customer, what have they bought, what do they currently owe, what have they paid, and what useful relationship should the shop remember?**

The system should become more useful as trustworthy customer history accumulates, but customer management must remain lightweight enough for an ordinary Kenyan duka.

---

## 2. Customer is not required for every sale

Ordinary retail selling must remain fast.

A merchant should be able to make:

```text
Anonymous sale
```

without creating a customer record unnecessarily.

Customer identification becomes important when the shop wants to:

- track purchase history;
- create Pay Later/Deni;
- record repayments;
- issue customer statements;
- provide customer-specific service;
- understand repeat buying;
- support loyalty or promotions where implemented.

The system must not force CRM work into every transaction.

---

## 3. Customer identity

A customer record should represent a real customer relationship, not merely a phone number stored next to a sale.

A practical customer profile may include:

- customer ID;
- display name;
- phone number where provided;
- optional alternate contact information;
- notes where permitted;
- organization/tenant scope;
- status;
- creation and update timestamps.

The minimum viable customer profile should be small.

A shop should be able to create a useful customer record quickly while serving the customer.

---

## 4. Customer creation

A worker with the required permission should be able to create a customer from normal shop workflows.

Typical flow:

```text
Need customer identity
      ↓
Search existing customer
      ↓
Found?
 ┌────┴────┐
Yes       No
 ↓         ↓
Use       Create
          ↓
      Continue sale
```

Customer creation should avoid requiring information that is not needed for the immediate business purpose.

For example, a small shop should not need a long registration form just to remember a customer's phone number for Deni.

---

## 5. Customer search

Customer search must work well on phone-sized devices and under ordinary shop conditions.

Useful search signals may include:

- name;
- phone number;
- partial phone number;
- customer code/reference where used.

Search must respect organization, shop, and data-visibility boundaries.

A worker must not discover a customer from another organization merely because they know a phone number.

---

## 6. Duplicate customer prevention

Duplicate customers are harmful because they fragment:

- purchase history;
- Deni balances;
- repayments;
- customer statements;
- customer insights.

Before creating a new customer, DukaFlow should make it easy to notice likely matches.

Example:

```text
Create customer: Jane Wanjiku
Phone: 0712 123 456

Possible existing customer found:
Jane Wanjiku — 0712 123 456

[Use existing] [Create anyway]
```

The system must not automatically merge customers merely because two records have similar names.

---

## 7. Customer identity changes

Customer information may change over time.

For example:

- phone number changes;
- name spelling is corrected;
- customer adds an alternate contact;
- notes change.

Profile changes must not rewrite historical transaction facts.

Historical sales continue to point to the customer identity that existed at the time of the transaction.

Where data corrections are needed, the system should preserve appropriate audit history.

---

## 8. Customer and shop scope

The customer model must define whether a customer belongs to:

- one shop;
- several shops in the same organization;
- an organization-wide customer directory.

For DukaFlow, the preferred model should support **organization-level customer identity with shop-scoped activity**, while allowing the product to keep the interface simple for one-shop businesses.

Conceptually:

```text
Organization
   ↓
Customer
   ├── Shop A purchase history
   ├── Shop B purchase history
   └── Shared customer identity where permitted
```

This supports a future multi-shop owner without forcing separate customer records for the same person across every branch.

Access to customer information must still follow the user's visibility scope.

---

## 9. Customer purchase history

A customer profile may show relevant transaction history, such as:

- date;
- shop;
- products;
- sale total;
- payment/settlement state;
- Deni created;
- refunds/returns;
- repayments related to Deni.

The history is derived from business events.

The system should not maintain a second manually edited “purchase total” that can drift from transaction history.

---

## 10. Deni and customer responsibility

Deni must be tied to a known customer in normal operation.

The relationship is:

```text
Customer
   ↓
Sale
   ↓
Pay Later amount
   ↓
Deni ledger
   ↓
Repayments / adjustments
   ↓
Current outstanding balance
```

A customer profile should make it easy to answer:

> **How much does this customer currently owe?**

and:

> **Why do they owe that amount?**

The balance must be explainable from ledger events.

---

## 11. Customer Deni balance

The current Deni balance should be derived from customer ledger events rather than silently overwritten.

Example:

```text
Previous balance      KSh 500
New Pay Later sale    +KSh 800
Repayment             -KSh 300
Adjustment            -KSh 100
--------------------------------
Current balance       KSh 900
```

The system must retain the underlying entries.

A repayment is not a new sale.

A Deni adjustment is not an ordinary sale.

A corrected balance must remain explainable.

---

## 12. Customer repayment

A customer may return later to pay part or all of their Deni.

Typical flow:

```text
Find customer
   ↓
View current Deni balance
   ↓
Enter repayment amount
   ↓
Choose payment method
   ↓
Confirm repayment
   ↓
Customer balance decreases
   ↓
Record financial event
   ↓
Provide receipt/reference
```

The repayment should support relevant payment methods, subject to the same payment confirmation rules defined elsewhere.

A repayment must reference the customer and the Deni ledger context.

---

## 13. Partial repayments

Customers may pay Deni in installments.

Example:

```text
Deni balance: KSh 1,000

Repayment 1: KSh 300
Balance:     KSh 700

Repayment 2: KSh 200
Balance:     KSh 500

Repayment 3: KSh 500
Balance:     KSh 0
```

The history must preserve each repayment separately.

---

## 14. Customer statements

A statement should explain the customer's financial relationship with the shop.

It may include:

- opening balance;
- Pay Later sales;
- repayments;
- adjustments;
- returns/refunds affecting Deni;
- current balance.

The statement should be understandable to the merchant and, where supported, shareable with the customer.

Example:

```text
Customer: Jane Wanjiku

Aug 10  Pay Later sale     +KSh 800
Aug 15  Repayment          -KSh 300
Aug 20  Pay Later sale     +KSh 500
-------------------------------
Balance                   KSh 1,000
```

---

## 15. Credit controls

A shop may choose to control how much Deni it is willing to allow for a customer.

Potential controls include:

- maximum outstanding balance;
- approval required above a threshold;
- customer-specific credit limit;
- blocked/new-credit status;
- overdue follow-up state.

These controls are business policies, not inherent properties of all customers.

A customer with no configured credit limit should not accidentally receive unlimited credit merely because the field is blank.

The exact policy must be explicit.

---

## 16. Customer-specific pricing

Future versions may support customer-specific pricing or offers.

Examples:

- wholesale buyer pricing;
- loyal customer discount;
- special negotiated price;
- promotion.

These features must never bypass ordinary price authority and discount permissions.

A customer identity should not automatically grant a staff member permission to change prices.

---

## 17. Customer loyalty

Loyalty should be additive, not mandatory.

DukaFlow may later support:

- repeat-customer recognition;
- points;
- rewards;
- customer segments;
- targeted offers.

These should be derived from trustworthy business history where possible.

A shop should still receive the core value of customer tracking without needing a formal loyalty programme.

---

## 18. Customer activity and useful memory

DukaFlow should gradually remember useful, decision-relevant information such as:

- last purchase date;
- purchase frequency;
- frequently purchased items;
- recent spend;
- outstanding Deni balance;
- repayment behavior;
- shop most frequently visited where appropriate;
- customer-specific notes where permitted.

The product should avoid collecting information merely because it is technically possible.

The principle is:

> **Remember what helps the shop serve the customer or make a better business decision.**

---

## 19. Privacy and visibility

Customer information is business data and may also be personal information.

Visibility must follow the User Access Model.

Examples:

- A sales worker may find a customer needed for a sale.
- A worker may be allowed to attach a customer to a sale without seeing all historical financial information.
- Deni-sensitive information may be restricted to authorized users.
- Organization-wide customer information may not be visible to workers assigned only to one shop unless explicitly permitted.

The backend/database must enforce these boundaries.

---

## 20. Customer deletion and retention

Deleting a customer must not destroy historical business evidence.

Because sales, Deni, payments, and repayments depend on customer relationships, the default model should favor:

- deactivate/archive customer;
- restrict future use;
- preserve historical references.

Hard deletion should be exceptional and governed by the system's data-retention requirements.

---

## 21. Customer merge

Duplicate customer records may eventually need to be merged.

A merge operation should:

- identify the source and destination customer;
- preserve historical transaction references;
- combine permitted profile information;
- prevent duplicate Deni balances;
- create an audit event;
- remain reversible where technically appropriate.

The merge must not simply add two balances together without verifying that the underlying ledger entries are being represented correctly.

---

## 22. Offline customer workflows

Offline use should remain practical but restrained.

A device may need locally available customer records for:

- attaching a known customer to a sale;
- creating a Pay Later transaction;
- viewing the local context required for a sale.

Offline creation/update must use the same authorization scope as online work.

When synchronization resumes:

- duplicate customers must be detected safely;
- Deni entries must remain idempotent;
- customer updates must resolve conflicts deliberately;
- revoked access must not continue indefinitely through stale local data.

---

## 23. Customer search during sale

Customer lookup must not turn every sale into a CRM workflow.

The preferred flow is:

```text
Build sale
   ↓
Choose customer only when useful/required
   ↓
Continue checkout
```

For Deni:

```text
Choose Pay Later
   ↓
Customer required
   ↓
Select/create customer
   ↓
Confirm Deni amount
```

This keeps ordinary cash/M-Pesa sales fast.

---

## 24. Customer service scenarios

DukaFlow should support realistic cases such as:

### New customer

```text
Customer buys normally
 ↓
No customer record required
```

### Repeat customer

```text
Customer returns
 ↓
Worker searches by phone/name
 ↓
Existing profile found
 ↓
Attach to sale
```

### New Deni customer

```text
Customer requests Pay Later
 ↓
Create/find customer
 ↓
Check credit/approval rules
 ↓
Record sale + Deni
```

### Existing Deni customer repays

```text
Find customer
 ↓
View balance
 ↓
Receive repayment
 ↓
Update ledger
 ↓
Provide receipt/reference
```

### Customer returns goods

```text
Find original sale
 ↓
Process return/refund according to permissions
 ↓
Adjust stock/financial state
 ↓
Update customer history
```

---

## 25. Customer data must not become a second source of financial truth

The customer profile should not independently store arbitrary financial numbers that can diverge from the ledger.

For example, do not treat:

```text
customer.balance = 10,000
```

as authoritative unless it is a controlled projection derived from ledger events.

The authoritative history is:

```text
Sales / Pay Later events
+
Repayments
+
Approved adjustments
+
Returns/reversals
```

The current balance is derived from those events.

---

## 26. Permissions and customer access

Underlying permissions may include:

- create customer;
- edit customer;
- search customer;
- attach customer to sale;
- view purchase history;
- create Pay Later/Deni;
- record Deni repayment;
- view Deni balance;
- adjust Deni;
- issue customer statement;
- merge duplicate customers.

These are permissions, not mandatory user identities.

Templates may package them for convenience, but the authorization engine must use the underlying permissions and shop/organization scope.

---

## 27. Audit requirements

Sensitive customer events should be attributable.

Important events include:

- customer creation;
- customer profile changes;
- Pay Later/Deni creation;
- Deni repayment;
- Deni adjustment;
- customer merge;
- customer archival/deactivation;
- credit-limit change;
- customer visibility changes;
- statement generation where sensitive access requires auditing.

Audit records should retain the actor, relevant shop/organization scope, event, timestamp, and references needed to understand the change.

---

## 28. Customer experience principle

DukaFlow should make the merchant feel:

> **“I know who my customers are, what they buy, and what they owe me — without having to become a CRM administrator.”**

The product should collect complexity only when the business needs it.

---

## 29. What DukaFlow must never do

DukaFlow must not:

- require customer creation for every ordinary sale;
- create anonymous Deni balances by accident;
- merge customers based only on name similarity;
- delete historical sales when a profile is archived;
- overwrite Deni balances without ledger history;
- treat a repayment as a sale;
- expose Deni balances to unauthorized workers;
- let offline state create new customer permissions;
- lose the relationship between a Deni entry and its originating customer/sale.

---

## 30. Source-of-truth boundaries

Use:

- `docs/user-responsibilities.md` for **who may access customer data and perform customer actions**.
- `docs/user-lifecycle-and-access-governance.md` for **who may grant/change those permissions**.
- `docs/post-authentication-access-and-first-screen.md` for **authorized runtime context**.
- `docs/user-workspace-and-daily-workflow.md` for **where customer work appears**.
- `docs/sales-and-settlement-model.md` for **sales, Pay Later/Deni, and repayment transaction semantics**.
- `docs/cash-and-financial-reconciliation-model.md` for **financial reconciliation effects**.
- This document for **customer identity, profile, history, relationship, visibility, and CRM behavior**.

Any conflicting customer-domain rule should be resolved in favor of this document for customer/CRM behavior.

---

## 31. Completion definition

Customer/CRM capability is not considered complete because a customer form exists.

It is complete when the system can reliably handle:

- creating/searching customers;
- attaching customers to sales;
- Pay Later/Deni customer requirements;
- Deni balances and repayments;
- customer history;
- statements;
- duplicate prevention;
- archival rather than destructive deletion;
- customer merge where supported;
- permission/visibility enforcement;
- offline behavior where supported;
- auditability;
- automated tests.

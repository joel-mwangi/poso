# DukaFlow Subscription & Entitlement Model

**This document is the source of truth for DukaFlow subscription lifecycle, organization entitlements, billing state, and capability availability. It does not replace merchant user permissions or merchant business ownership.**

## 1. Core principle

A DukaFlow subscription is a **platform commercial relationship with a merchant organization**.

It is not:

- a subscription for an individual worker;
- a subscription for an individual shop;
- a merchant job role;
- a permission grant;
- ownership of merchant business data.

The fundamental relationship is:

```text
Organization
    ↓
Subscription
    ↓
Entitlements
    ↓
Merchant configuration
    ↓
User / shop permissions
    ↓
Actual operation
```

> **Subscription controls what the organization can use from DukaFlow. Permissions control what a person may do.**

## 2. Who is the customer?

The **organization** is the normal subscription customer.

Do not model ordinary access as:

```text
Owner subscription
Staff subscription
Shop A subscription
Shop B subscription
```

Instead:

```text
Organization
    ↓
One subscription relationship
    ↓
Plan / entitlement state
    ↓
All authorized shops and users operate within that entitlement
```

A multi-shop organization therefore does not need a separate subscription merely because it has additional shops, unless a specific plan rule says the number of active shops is part of entitlement limits.

## 3. When subscription state begins

When an organization is created, DukaFlow establishes an explicit entitlement state.

A new organization may begin in one of these states according to the commercial policy:

```text
FREE
TRIAL
ACTIVE PAID
```

The commercial state must be machine-readable and should be independent of UI assumptions.

A one-person shop should reach useful product value without being forced through enterprise-style subscription administration.

## 4. What subscription controls

Subscription and entitlement rules answer:

> **What DukaFlow capabilities are available to this organization?**

Examples of capability-level entitlements include:

- number of active shops supported;
- structured staff-management capabilities;
- approval workflows;
- shifts and advanced operational controls;
- multi-shop reporting;
- advanced reconciliation;
- premium integrations;
- advanced analytics;
- other explicitly defined platform capabilities.

Entitlements should be based on meaningful product capability and operating scale rather than arbitrary restrictions that make the core product painful for small merchants.

## 5. What subscription does not control

Subscription status must not be used as a substitute for merchant authorization.

It does not answer:

> **Can this particular person perform this action?**

That remains a merchant access decision governed by:

- organization membership;
- shop assignment;
- explicit permissions;
- visibility rules;
- approval authority;
- operational context.

For example, an organization may be entitled to structured inventory operations, but only workers with the appropriate inventory permissions can perform them.

## 6. Authorization chain

Every protected capability should conceptually pass through:

```text
Platform feature availability
        ↓
Organization entitlement
        ↓
Merchant configuration
        ↓
User / shop authorization
        ↓
Business operation
```

A platform operator enabling a feature does not authorize every merchant employee to use it.

A merchant subscription does not bypass merchant permissions.

## 7. Subscription lifecycle

DukaFlow should represent an explicit lifecycle such as:

```text
FREE / TRIAL
      ↓
ACTIVE
      ↓
PAST DUE / GRACE PERIOD
      ↓
RESTRICTED
      ↓
SUSPENDED
      ↓
CANCELLED / EXPIRED
```

The exact commercial states may evolve, but transitions and meanings must be explicit and machine-readable.

## 8. Criteria for entitlement control

Plan and entitlement decisions may consider:

- number of active shops;
- organization operating structure;
- need for staff management;
- need for approvals;
- need for shifts;
- need for multi-shop reporting;
- advanced reconciliation requirements;
- premium integrations;
- advanced analytics;
- other clearly documented DukaFlow capabilities.

These criteria should be transparent and predictable.

Do not make large-business complexity the default experience for small shops.

## 9. Failed payment and grace period

A failed subscription payment should **not immediately lock a merchant out of its business**.

The preferred flow is:

```text
Payment problem
      ↓
PAST DUE / GRACE PERIOD
      ↓
Billing warnings + recovery attempts
      ↓
Premium capabilities restricted according to policy
      ↓
Final suspension if unresolved
```

Each plan should define:

- grace-period duration;
- notification schedule;
- retry behavior;
- which premium capabilities are restricted first;
- when full platform suspension can occur;
- how reactivation works after payment recovery.

The restrictions must be explicit and predictable.

## 10. What remains preserved during restriction or suspension

Subscription status does not transfer ownership of merchant data to DukaFlow.

Subject to lawful retention rules, the platform should preserve:

- sales history;
- stock history;
- customers;
- Deni ledger history;
- receipts;
- synchronization history;
- audit history;
- other merchant business records.

A failed DukaFlow subscription payment must not delete merchant business data.

## 11. Subscription cancellation is not organization deletion

These are separate events.

```text
Cancel subscription
        ↓
Entitlements change
        ↓
Merchant data remains preserved
        ↓
Organization remains recoverable according to policy
        ↓
Retention / export rules apply
```

Organization closure has its own lifecycle governed by merchant lifecycle, privacy, legal, and retention rules.

## 12. DukaFlow billing is separate from merchant cash

DukaFlow subscription billing is platform accounting.

Merchant cash is merchant business accounting.

```text
DUKAFLOW SUBSCRIPTION BILLING
        ≠
MERCHANT SHOP CASH
```

A failed DukaFlow subscription payment does not become a merchant shop expense unless the merchant explicitly records that business expense through merchant operations.

## 13. Required subscription records

The platform should maintain, as needed:

- organization ID;
- plan ID;
- subscription status;
- entitlement state;
- billing period;
- renewal date;
- invoice references;
- payment state;
- payment attempts;
- refunds;
- credits;
- billing exceptions;
- restriction state;
- suspension state;
- cancellation reason;
- timestamps;
- audit history.

Subscription records must be attributable and protected from ordinary merchant modification.

## 14. Plan design principle

DukaFlow plans should sell **useful business capability**, not permission complexity.

A small merchant should not need a paid plan merely to understand their own sales, stock, customers, or historical business records when those are part of the product's base capability.

Larger plans may add capabilities that become valuable as the organization grows, for example:

```text
One-person shop
→ core POS / inventory / cash / Deni

Structured shop
→ staff controls / templates / approvals / shifts

Multi-shop business
→ multi-shop controls / cross-shop reporting / advanced reconciliation
```

These are illustrative capability groups; the actual commercial plan catalog remains a product decision.

## 15. Merchant impact rule

Every subscription change must be tested against three merchant shapes:

### One-person shop

Can the owner still operate simply and understand what is happening?

### Structured shop

Do staff permissions, approvals, shifts, and shop assignments remain coherent?

### Multi-shop organization

Do shop isolation and authorized cross-shop controls remain coherent?

Subscription design must not force the smallest customer to behave like the largest.

## 16. Non-negotiable rules

1. **Subscription belongs to the organization.**
2. **Entitlements control platform capability availability.**
3. **Permissions control individual user authority.**
4. **Subscription state must not silently rewrite merchant business truth.**
5. **Payment failure follows a defined recovery and grace path before suspension.**
6. **Merchant business data remains preserved during subscription restriction or suspension, subject to lawful retention rules.**
7. **Cancellation and organization deletion are separate events.**
8. **DukaFlow subscription billing is separate from merchant cash accounting.**
9. **Plans should scale with meaningful capability and business need.**
10. **Subscription design must preserve the individual-first experience while supporting structured and multi-shop businesses.**

## 17. Source-of-truth boundaries

Use this document for:

- subscription lifecycle;
- billing state;
- plan rules;
- organization entitlements;
- capability availability;
- restriction and suspension behavior.

Use `docs/user-responsibilities.md` for merchant user access and permissions.

Use `docs/individual-first-growth-principle.md` for how merchant complexity grows.

Use `docs/duka-flow-domain-and-data-model.md` for merchant business entities and business truth.

Use `docs/duka-flow-platform-operating-model.md` for the wider platform operating model.

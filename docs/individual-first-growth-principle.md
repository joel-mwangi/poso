# DukaFlow Individual-First Growth Principle

**This document is a cross-cutting product principle. It governs how DukaFlow grows from one individual operating one shop into a staffed and multi-shop business.**

## Core rule

> **DukaFlow must work completely for one individual running one shop before it introduces organizational complexity. Every later capability must be additive, not mandatory.**

The system should grow with the merchant:

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
    ├── Permission templates
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

## 1. Individual-first means the first experience stays simple

For a one-person shop, DukaFlow should feel like:

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

The owner should not need to:

- create staff accounts;
- assign themselves permissions;
- configure roles or templates;
- create approval workflows;
- configure shifts;
- understand organization administration before making the first sale.

Those capabilities may exist in the underlying model, but they should remain out of the merchant's way until they become relevant.

## 2. Structural complexity must not become operational complexity

DukaFlow may have an organization, shop, membership, permission, template, and audit model internally from the beginning.

That is architectural scalability.

It must not mean that the one-person merchant experiences all of those concepts explicitly.

The distinction is:

```text
Strong underlying structure
        ≠
Complex everyday workflow
```

## 3. Ownership is implicit for the owner

For the one-person business, the owner is already the highest-authority operator.

The product should not require the owner to grant themselves ordinary operating permissions.

Conceptually:

```text
Authenticated owner
 ↓
Organization ownership
 ↓
Shop ownership
 ↓
Immediate operating capability
```

Explicit permissions become most important when additional people are introduced.

## 4. Staff complexity appears only when staff exist

The progression should be:

```text
One person
→ no staff setup required

Second person joins
→ staff identity + shop assignment

Different responsibilities emerge
→ explicit permissions

Repeated responsibility patterns emerge in a structured shop
→ optional permission template

Higher-risk work emerges
→ approvals

Busy operations emerge
→ shifts / tills / reconciliation

More shops emerge
→ multi-shop organization controls
```

The presence of an enterprise-capable data model must never force the one-person merchant through these steps early.

## 5. Permission templates belong to structured shops

Permission templates are **convenience tools for structured shops**, not mandatory user identities and not part of the Level 1 operating experience.

A template represents a useful starting bundle for a recurring responsibility. Examples may include:

- Sales / Cashier;
- Stock / Inventory;
- Manager / Supervisor;
- Sales Attendant;
- Customer / Sales;
- Reconciliation;
- other merchant-defined patterns.

But a template is never the final authorization contract.

The flow is:

```text
Structured shop
      ↓
Owner describes the person's intended responsibility
      ↓
DukaFlow suggests a suitable permission template
      ↓
Owner reviews the suggested permissions
      ↓
Owner adds/removes permissions to fit the person's actual intent
      ↓
Shop assignment + explicit permissions become the authorization contract
```

The same template may therefore produce different effective permissions for different people or shops.

For example:

```text
Intent: "Sell and receive deliveries, but do not change prices"
                  ↓
Suggested: Sales / Inventory template
                  ↓
Owner removes price-management permission
                  ↓
Effective permissions = sales + payments + receiving
```

The person's intent and the final explicit permissions matter more than the template name.

Templates must therefore be:

- optional;
- editable;
- replaceable;
- scoped to the relevant shop assignment;
- auditable when applied or changed;
- subordinate to explicit permissions.

A template must never silently grant authority that the owner did not intend.

## 6. Roles are not identities

Labels such as Cashier, Inventory, Manager, Supervisor, or Sales Attendant may be shown as template names when useful in structured shops.

They are never mandatory organizational structures and never replace explicit authorization.

The security model remains:

```text
Template
   ↓
Suggested permissions
   ↓
Owner/admin review and customization
   ↓
Explicit permissions
   ↓
Shop assignment + visibility + approval rules
   ↓
Backend authorization
```

## 7. Product surfaces must use progressive disclosure

The same rule applies to the UI.

A one-person merchant should primarily see:

```text
Sell
Stock
Cash
Customers
Deni
```

As the business grows, additional surfaces become relevant:

```text
Staff
Permission templates
Approvals
Shifts
Suppliers
Reconciliation
Multiple shops
Organization reporting
```

Do not place every advanced control in the primary navigation merely because the underlying system supports it.

## 8. The first sale is the first proof of value

A merchant should be able to experience meaningful value before completing enterprise-style setup.

Preferred direction:

```text
Create account
 ↓
Create / enter shop
 ↓
Add first product or starter product
 ↓
Record opening stock when needed
 ↓
Make first sale
 ↓
Immediately see the result
```

The first sale should not depend on:

- staff configuration;
- permission-template selection;
- shift setup;
- supplier setup;
- accounting setup;
- approval hierarchy;
- public storefront setup.

## 9. Every added layer must preserve the Level 1 workflow

When a new capability is introduced, ask:

> **Does this improve larger shops without making the one-person shop harder to operate?**

If not, the capability should be hidden behind configuration, progressive disclosure, or a later phase.

## 10. Templates must fit intent, not force intent

A structured shop may have recurring responsibilities, so templates make setup faster. But DukaFlow must never assume that a person holding a familiar responsibility has an identical permission set to everyone else.

The system should start from the owner's intent:

```text
What should this person be able to do?
        ↓
Suggest useful permission bundle
        ↓
Review the bundle
        ↓
Customize
        ↓
Apply to the shop assignment
```

The template is therefore a **recommendation and configuration accelerator**, not a rigid role hierarchy.

## 11. Domain model requirement

The underlying data model must support growth without redesigning core transaction semantics.

This means the same sale, inventory movement, payment, Deni ledger, customer, and supplier concepts should work for:

```text
one person
→ one shop
→ several staff
→ several shops
```

Growth should add relationships and authorization scope, not replace the original domain model.

## 12. Roadmap requirement

The implementation sequence must validate Level 1 before investing heavily in higher-complexity workflows.

Required progression:

```text
Level 1 complete
 ↓
Validate with real merchants
 ↓
Add Level 2 capabilities
 ↓
Validate again
 ↓
Add Level 3 capabilities and templates where justified
 ↓
Add Level 4 capabilities when multi-shop demand exists
```

The existence of a future feature in documentation is not a reason to build it now.

## 13. Security does not justify merchant complexity

Security controls may be sophisticated internally—RLS, server-side authorization, device revocation, audit logs, idempotency, approval controls—but those mechanisms should remain mostly invisible to a simple owner-operated shop.

Security should protect the simple workflow rather than replace it with an administrative workflow.

## 14. Source-of-truth boundaries

This principle governs all other product documents.

- `fire.md` defines the overall vision.
- `docs/user-responsibilities.md` defines access and permissions.
- `docs/duka-flow-product-experience-model.md` defines product experience.
- `docs/duka-flow-domain-and-data-model.md` defines the scalable entity model.
- `docs/duka-flow-mvp-and-implementation-roadmap.md` defines build order.
- Domain-specific documents define individual business capabilities.
- Security and technical documents define enforcement mechanisms, not merchant-facing complexity.

When documents conflict with this principle, they must be revised so that advanced structure remains optional for Level 1 merchants and templates remain editable permission shortcuts rather than fixed roles.

## 15. Final test

Before shipping any capability, ask:

> **Would a person running one ordinary shop alone be able to continue working naturally if this feature did not exist?**

If yes, the feature may be additive.

If no, it is probably becoming a hidden requirement and needs to be reconsidered.

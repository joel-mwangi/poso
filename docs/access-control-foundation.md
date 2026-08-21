# DukaFlow Access-Control Foundation

**Canonical foundation for the separation between DukaFlow platform administration and merchant organization access.**

## 1. Canonical hierarchy

```text
DUKAFLOW PLATFORM
│
└── Administration
      │
      └── DukaFlow Administrator / General Manager
            │
            └── Platform permissions

MERCHANT SIDE
│
└── Organization
      │
      ├── Owner
      │     └── Organization ownership authority
      │
      └── Staff
            ├── Shop assignment(s)
            ├── Permissions
            ├── Data visibility
            ├── Approval authority
            └── Operational responsibility
```

## 2. Identity boundaries

There are two independent control planes.

### Platform identity

A platform operator is represented by `platform_operators` and receives capabilities through `platform_operator_permissions`.

The current primary platform role is:

```text
platform_operator_role = general_manager
```

The display identity is **DukaFlow Administrator / General Manager**.

A platform operator is not automatically a member, owner, or staff member of any merchant organization.

### Merchant identity

Merchant users belong to an organization through `organization_memberships`.

The only fundamental merchant member types are:

```text
owner
staff
```

Job labels such as Cashier, Manager, Inventory Operator, Supervisor, Sales Attendant, or Reconciliation are responsibility descriptions or permission templates. They are not the primary identity boundary.

## 3. Merchant authorization model

Merchant authorization is calculated from:

```text
Authenticated user
      ↓
Organization membership
      ↓
Member type: owner | staff
      ↓
Shop assignment/scope
      ↓
Explicit permissions
      ↓
Data visibility
      ↓
Approval authority
```

Owner authority is organization-level. Staff capabilities are explicit grants in `organization_membership_permissions`.

Permission checks must be enforced by backend/database authorization, not only by UI visibility.

## 4. Platform authorization model

Platform authorization is separate:

```text
Authenticated user
      ↓
platform_operators
      ↓
Platform role
      ↓
platform_operator_permissions
      ↓
Platform action
```

Platform permissions are stored in `platform_permissions`.

Examples include:

- `platform.view`
- `platform.configure`
- `platform.manage_operators`
- `platform.manage_organization_lifecycle`
- `platform.view_health`
- `support.view_diagnostics`
- `support.start_assisted_session`
- `security.view_events`
- `billing.view`
- `product.manage`

Sensitive merchant-data permissions are separate and explicit, for example:

- `merchant.view_sales`
- `merchant.view_inventory`
- `merchant.view_customers`
- `merchant.view_customer_credit`
- `merchant.view_financial_data`

## 5. Database foundation

### Platform tables

```text
platform_permissions
platform_operators
platform_operator_permissions
```

### Merchant access tables

```text
organization_memberships
permissions
organization_membership_permissions
employees
```

The platform tables must never be used as an alternative representation of merchant membership.

The merchant membership tables must never be used to grant platform authority.

## 6. Support and intervention boundary

A DukaFlow Administrator may require temporary access to a merchant context for support, security, compliance, or repair.

That access must be:

- explicitly authorized;
- purpose-bound;
- scope-bound;
- time-limited where possible;
- attributable;
- auditable;
- separate from merchant ownership.

Platform administration must not become ordinary merchant operational authority.

## 7. Permission-template rule

Permission templates are configuration accelerators only:

```text
Business intent
   ↓
Suggested permission template
   ↓
Owner/admin review
   ↓
Explicit final permissions
   ↓
Authorization
```

The template name is never the backend security boundary.

## 8. Non-negotiable rules

1. DukaFlow Administrator / General Manager is a platform identity.
2. Organization Owner is a merchant ownership identity.
3. Staff are merchant workforce identities.
4. `owner | staff` is the merchant member-type boundary.
5. Platform and merchant permission catalogs are separate.
6. Platform administrators do not automatically inherit merchant permissions.
7. Merchant owners do not automatically become platform administrators.
8. Shop access is independent of job-title labels.
9. Explicit permissions determine staff capability.
10. Backend/database checks remain authoritative.
11. Support access is controlled and auditable.
12. Historical merchant business records retain merchant attribution even when platform personnel perform approved support actions.

## 9. Source-of-truth relationships

- `docs/platform-administration-and-operations-model.md` — platform administration and operator boundaries.
- `docs/user-responsibilities.md` — merchant Owner/Staff responsibilities and permissions.
- `docs/user-lifecycle-and-access-governance.md` — lifecycle, approvals, and access changes.
- `docs/duka-flow-domain-and-data-model.md` — merchant domain/data ownership.
- `docs/post-authentication-access-and-first-screen.md` — post-login access resolution.

This document defines the cross-domain access foundation that connects those models.

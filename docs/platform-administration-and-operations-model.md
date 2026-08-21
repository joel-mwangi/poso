# DukaFlow Platform Administration & Operations Model

**This document is the source of truth for the people and controls that operate the DukaFlow platform itself. It is separate from the merchant User Access Model.**

## Canonical hierarchy

DukaFlow has a platform administration layer above the merchant organization layer.

```text
DUKAFLOW PLATFORM
│
└── Administration
      └── DukaFlow Administrator / General Manager
            │
            ├── Platform operations
            ├── Support
            ├── Security / Compliance
            ├── Billing / Finance
            ├── Product operations
            └── Other explicitly delegated platform functions

MERCHANT SIDE
│
└── Organization
      │
      ├── Owner
      │
      └── Staff
            ├── Shop assignment(s)
            ├── Permissions
            ├── Data visibility
            └── Approval authority
```

The **DukaFlow Administrator / General Manager is a platform identity**. They administer DukaFlow itself and are not the owner of any merchant organization merely because they administer the platform.

Within a merchant organization, the fundamental business relationship is **Owner + Staff**. Cashier, Manager, Inventory Operator, Supervisor, and similar labels are responsibility descriptions or permission templates, not mandatory merchant identity types.

## Core distinction

DukaFlow has two control planes:

```text
NATIONAL DUKAFLOW PLATFORM
        ↓
DukaFlow Administration / General Manager
        ↓
Platform operators, support, security, compliance, billing, operations
        ↓
DukaFlow service and platform resources

MERCHANT BUSINESS
        ↓
Organization
        ↓
Owner
        ↓
Staff
        ↓
Shops / assignments / permissions
        ↓
Business operations
```

DukaFlow is intended to connect shops across Kenya, from one-person dukas to large multi-branch retailers. The platform therefore provides **centralized service governance** while each merchant business retains **operational sovereignty** over its own shops, people, stock, customers, cash, Deni, suppliers, and transactions.

A platform operator does **not** become the owner of a merchant organization merely because they can administer the DukaFlow service.

Merchant ownership and platform administration are separate authorities, identities, permissions, audit trails, and data-access boundaries.

> **Centralized platform governance; decentralized merchant business control.**

---

## Explicit platform-versus-merchant boundary

DukaFlow is a **national platform, not a national business operator**.

The platform provides infrastructure, connectivity, security, shared services, governance, support, integrations, intelligence, and other platform capabilities. It does not ordinarily run the businesses connected to it.

### DukaFlow platform controls

DukaFlow may centrally control:

- platform identity infrastructure;
- platform security;
- platform availability and reliability;
- synchronization infrastructure;
- shared integrations;
- platform billing and entitlements;
- platform feature availability and rollout;
- abuse and fraud controls;
- platform compliance processes;
- disaster recovery;
- platform-wide operational monitoring;
- appropriately aggregated network intelligence.

### Merchant business controls

Each merchant organization remains responsible for:

- its organization and shops;
- its owner and staff;
- shop assignments;
- staff permissions and responsibilities;
- products and prices;
- inventory and stock adjustments;
- sales and settlements;
- customers and Deni;
- suppliers and purchases;
- cash and reconciliation;
- merchant approvals;
- day-to-day business decisions.

### Non-negotiable rule

> **Platform administration must never become ordinary operational authority over a merchant business.**

A platform administrator must not routinely be able to create, edit, delete, reverse, approve, or rewrite merchant sales, stock, Deni, cash, customer balances, supplier balances, or other historical merchant transactions.

Platform support or repair access, where genuinely necessary, must use a specifically authorized, narrowly scoped, time-bound, attributable, and auditable mechanism.

### Secrets have an even stronger boundary

Merchant credentials, API keys, webhook secrets, private keys, encryption keys, passwords, and similar secrets are not routine platform-admin data. Platform infrastructure may manage their lifecycle through controlled secret-management systems without exposing the raw secret to a human operator.

### Network intelligence does not equal merchant-data ownership

DukaFlow may operate on aggregate or appropriately protected network-level information to improve service health, security, reliability, or product intelligence. This does not create unrestricted permission to inspect individual merchant businesses.

```text
Platform telemetry
      ≠
Individual merchant business records
      ≠
Merchant ownership
```

---

## 1. Purpose

This model answers:

> **Who operates DukaFlow itself, what are they allowed to do, what merchant data may they access, what actions require approval, and how is privileged platform access controlled and audited?**

It covers:

- platform identities;
- platform administration and general management;
- platform operating categories;
- platform permissions;
- national platform scope;
- merchant-data access;
- support access;
- assisted access;
- security and compliance operations;
- billing and subscription operations;
- platform configuration;
- feature flags and rollout controls;
- incident response;
- break-glass access;
- auditability;
- separation of duties;
- platform staff lifecycle;
- offboarding;
- platform and merchant boundary rules;
- secret and credential boundaries.

It does not redefine merchant owner/staff permissions. Those remain governed by `docs/user-responsibilities.md` and `docs/user-lifecycle-and-access-governance.md`.

---

## 2. DukaFlow is a national platform, not the owner of every shop

The long-term DukaFlow platform may serve shops across Kenya, including:

- one-person kiosks and dukas;
- family-run shops;
- small staffed minimarts;
- larger supermarkets;
- specialized retailers;
- multi-shop and multi-branch businesses.

The platform should therefore maintain a common technical and governance layer while preserving each merchant's business boundary.

Conceptually:

```text
                    DUKAFLOW PLATFORM
                           │
             DukaFlow Administration
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
     Business A       Business B       Business C
          │                │                │
       Owner            Owner            Owner
          │                │                │
       Staff            Staff            Staff
          │                │                │
       Shops            Shops            Shops
```

DukaFlow should know enough about the network to operate the service safely and effectively, but platform knowledge does not become permission to operate every merchant business.

### Platform may know about the network

Examples:

- platform availability and health;
- synchronization health;
- payment-integration health;
- security events and abuse patterns;
- service adoption and feature usage metrics;
- billing/entitlement state;
- platform-wide incidents;
- anonymized or appropriately aggregated operational trends where policy permits.

### Platform does not automatically own merchant operations

Platform operators do not automatically gain authority to:

- create merchant sales;
- alter merchant stock;
- change customer Deni;
- rewrite merchant cash;
- approve merchant refunds;
- edit merchant staff permissions;
- change supplier balances;
- access merchant secrets.

---

## 3. Platform identity is separate from merchant identity

A DukaFlow Administrator / General Manager is an authenticated platform person with platform authorization.

Conceptually:

```text
DukaFlow Administrator / General Manager
      ↓
Platform membership / employment relationship
      ↓
Platform permissions
      ↓
Platform operational scope
      ↓
Optional approved merchant-support context
```

A merchant organization owner remains a separate business identity:

```text
Merchant user identity
      ↓
Organization ownership
      ↓
Shop ownership / management authority
      ↓
Owner business operations
```

A merchant staff member is a separate business identity:

```text
Merchant user identity
      ↓
Organization membership
      ↓
Staff status
      ↓
Shop assignment(s)
      ↓
Permissions
```

The system must never infer platform authority from merchant ownership, and must never infer merchant ownership from platform authority.

Platform administrators require their own privileged identities, authentication policy, lifecycle, device/session controls, and audit trail. A normal merchant account must not silently become a platform administrator account.

---

## 4. DukaFlow Administrator / General Manager

The **DukaFlow Administrator / General Manager** is the primary platform administration function.

This person is responsible for the overall operation and governance of DukaFlow as a service. Their authority is over the **platform**, not ownership of merchant organizations.

Typical responsibilities include:

- platform governance;
- platform configuration;
- platform operational oversight;
- coordination of support, operations, security, compliance, billing and product functions;
- platform health and incident oversight;
- platform policy enforcement;
- platform-level maintenance and service continuity;
- organization lifecycle oversight according to platform policy;
- oversight of platform entitlements and subscriptions;
- ensuring platform controls and auditability are functioning.

The General Manager may delegate specific responsibilities to platform operators, but delegated platform permissions remain platform permissions and do not become merchant ownership.

### General Manager boundary

The General Manager does **not** automatically:

- become the owner of an organization;
- become a merchant owner/staff member;
- receive all merchant permissions;
- see raw merchant payment secrets;
- operate merchant sales as an ordinary worker;
- rewrite merchant business history.

Where a platform-level intervention affecting a merchant is required, it must use the controlled platform mechanisms defined by this document.

---

## 5. Platform operating functions delegated by the General Manager

The DukaFlow Administrator / General Manager may delegate platform permissions into specialized functions. These are platform operating functions, not merchant roles.

### Platform Operations

Responsible for keeping the service operating.

Typical capabilities:

- service health;
- operational incidents;
- jobs and queues;
- synchronization health;
- deployment/rollout status;
- system-level configuration within scope.

Merchant business records should not be accessible unless separately authorized for a specific operational investigation.

### Customer Support

Responsible for helping merchants solve problems.

Typical capabilities:

- view merchant account metadata necessary for support;
- review support tickets and diagnostics;
- initiate controlled support-access requests;
- inspect allowed operational context;
- help with account recovery procedures where permitted.

Support should receive the minimum merchant-data access necessary to solve a problem.

### Security / Compliance

Responsible for security events, abuse, privacy, audit, and compliance investigations.

Typical capabilities:

- inspect security events;
- investigate suspicious access;
- review audit evidence;
- suspend or protect platform accounts according to procedure;
- investigate data-protection incidents;
- manage compliance evidence within scope.

Security/compliance authority does not imply unrestricted merchant operational access.

### Billing / Finance

Responsible for commercial administration of the DukaFlow service.

Typical capabilities:

- subscriptions;
- invoices;
- platform billing records;
- platform payment/refund operations;
- credits/adjustments;
- plan status.

Billing access should not automatically expose merchant sales, customers, Deni, inventory, or supplier data.

### Product Operations

Responsible for controlled product-wide configuration.

Typical capabilities may include:

- feature flags;
- rollout groups;
- experiments;
- product configuration;
- supportable capability enablement.

A feature flag must never be used as a substitute for merchant authorization.

### Auditor / Read-only

Read-only visibility into defined platform evidence.

This category should not change business state.

---

## 6. Platform permissions

Examples include:

### Platform administration

- `platform.view`
- `platform.configure`
- `platform.manage_operators`
- `platform.manage_feature_flags`
- `platform.view_health`
- `platform.manage_organization_lifecycle`

### Merchant account administration

- `merchant.view_account_metadata`
- `merchant.view_subscription`
- `merchant.suspend_account`
- `merchant.restore_account`
- `merchant.request_support_access`

### Merchant-data access

- `merchant.view_operational_data`
- `merchant.view_sales`
- `merchant.view_inventory`
- `merchant.view_customers`
- `merchant.view_customer_credit`
- `merchant.view_financial_data`

These should be separately scoped rather than collapsed into one unrestricted support permission.

### Support actions

- `support.create_case`
- `support.view_diagnostics`
- `support.start_assisted_session`
- `support.execute_approved_action`

### Security / compliance

- `security.view_events`
- `security.investigate_incident`
- `security.revoke_session`
- `security.revoke_device`
- `security.freeze_platform_account`
- `compliance.view_audit_evidence`
- `compliance.manage_data_request`

### Billing

- `billing.view`
- `billing.issue_refund`
- `billing.apply_credit`
- `billing.change_plan`
- `billing.manage_subscription`

Every permission must have a defined scope, owner, audit behavior, and approval requirement where applicable.

---

## 7. Platform operators should not inherit merchant powers

A platform operator should not automatically be able to:

- change a merchant's stock;
- create a merchant sale;
- change customer Deni;
- change merchant cash;
- change merchant supplier balances;
- grant themselves merchant permissions;
- become merchant owner;
- silently impersonate a merchant;
- edit historical merchant transactions directly.

When support needs to act on merchant data, it must use a controlled, auditable support-access mechanism with explicit scope and reason.

If the platform discovers a merchant-side problem, the normal goal is to **diagnose, preserve, and guide**, not to take over daily business operations.

---

## 8. Merchant-data access hierarchy

Merchant data should be classified so the minimum necessary access can be granted.

Suggested classes:

### Class A — Account metadata

Examples:

- organization name;
- shop count;
- account status;
- subscription plan;
- support identifiers.

Normally suitable for broader support access.

### Class B — Operational diagnostics

Examples:

- sync errors;
- device status;
- application version;
- job failures;
- integration status.

Accessible to operations/support within scope.

### Class C — Merchant business data

Examples:

- products;
- stock;
- sales;
- purchases;
- suppliers;
- expenses.

Requires explicit business-data access permission.

### Class D — Sensitive business/customer data

Examples:

- customer contact details;
- Deni/credit balances;
- detailed payments;
- financial reconciliation.

Requires stronger justification, narrower scope, and stronger approval where applicable.

### Class E — Secrets and credentials

Examples:

- provider API secrets;
- authentication secrets;
- database/service credentials;
- encryption keys;
- webhook signing secrets;
- private keys.

These should not be exposed to routine platform administrators or support users.

The preferred pattern is that humans manage the **secret lifecycle and permissions**, while services consume secrets through controlled secret-management mechanisms. Human-readable secret retrieval should be exceptional, separately authorized, and audited.

---

## 9. Secret and credential boundary

Merchant secrets must be treated differently from ordinary merchant business data.

### Platform operator normally cannot

- view the raw M-Pesa credential value;
- view a merchant's OAuth client secret;
- view webhook signing secrets;
- retrieve merchant passwords;
- retrieve encryption master keys;
- export merchant private keys.

### Platform may manage the lifecycle

Authorized platform infrastructure can support:

- credential registration;
- validation;
- rotation;
- revocation;
- expiry;
- integration disablement;
- health/status checks without revealing the raw secret.

Where an operational flow requires human involvement, prefer:

```text
Operator request
   ↓
Scoped authorization
   ↓
Secret-management service
   ↓
Perform required action
   ↓
Return non-secret result
   ↓
Audit
```

Do not design a general-purpose platform screen called **"Show merchant secret"**.

Human access to production secrets should be minimized, narrowly scoped, monitored, and temporary where possible.

---

## 10. Support access

Support access exists to solve merchant problems without turning support staff into permanent merchant administrators.

### Normal support flow

```text
Merchant reports problem
        ↓
Support case created
        ↓
Support reviews account metadata + diagnostics
        ↓
More data needed?
        ↓
Request scoped support access
        ↓
Merchant consent OR approved support procedure
        ↓
Time-limited access
        ↓
Investigate
        ↓
Access expires / is revoked
        ↓
Audit record retained
```

### Support access must define

- platform operator;
- merchant organization;
- optional shop scope;
- permitted data classes;
- permitted actions;
- reason/case ID;
- start time;
- expiry time;
- approval/consent evidence;
- all accessed or changed resources.

Support access should default to read-only where possible.

---

## 11. Assisted sessions / impersonation

DukaFlow may need an assisted-session capability for difficult support cases.

This must not be silent impersonation.

The platform should represent:

```text
Real operator identity
        ↓
Assisted merchant context
        ↓
Explicit support reason
        ↓
Time-bound access
        ↓
Full audit trail
```

The system should preserve both identities in the audit trail:

- who the actual platform operator was;
- which merchant account was accessed;
- why;
- what was viewed;
- what was changed;
- when;
- under whose approval.

A support operator must not be able to make an action look as though the merchant personally performed it.

Sensitive financial or customer changes should require additional approval or be completely disallowed from assisted sessions unless a specific operational procedure exists.

---

## 12. Break-glass access

Break-glass access is for serious incidents where normal authorization paths are unavailable and immediate action is necessary to protect the platform or merchant.

Examples:

- active security incident;
- account takeover response;
- severe data-integrity incident;
- service-wide operational failure.

Break-glass access must be:

- explicitly invoked;
- restricted in scope;
- time-limited;
- strongly authenticated;
- separately audited;
- reviewed after the incident;
- unable to become a permanent permission through the exception itself.

Break-glass access should not be used for ordinary support convenience.

---

## 13. Platform versus merchant authority

The following separation is non-negotiable:

| Capability | Organization Owner | DukaFlow Administrator / General Manager |
|---|---|---|
| Create/manage merchant shops | Yes | No routine merchant authority |
| Manage merchant staff | Yes | No routine merchant authority |
| Assign merchant permissions | Yes | No routine merchant authority |
| Run merchant sales | Yes | No |
| Change merchant stock | Yes | No |
| Change merchant Deni | Yes | No |
| View platform health | No | Yes |
| Manage platform configuration | No | Yes, within platform scope |
| Manage platform operator access | No | Yes, within platform policy |
| Manage DukaFlow billing | No | Yes, if delegated/authorized |
| Investigate platform security | No | Yes, through authorized platform functions |
| Access merchant data | Their own organization scope | Only explicit, justified, scoped access |
| Access merchant secrets | Their configured integration scope | No routine human access |

The platform layer supports the merchant business but does not become a hidden owner of it.

---

## 14. Platform feature flags and rollout

Platform operators may need to control product rollout.

Examples:

- enable a capability for a pilot group;
- disable a broken integration;
- roll out new functionality gradually;
- restrict a feature to eligible plan tiers.

Feature flags are platform configuration, not merchant permissions.

The evaluation order should conceptually be:

```text
Platform feature availability
        ↓
Merchant entitlement / configuration
        ↓
Merchant user authorization
        ↓
Allow feature usage
```

A platform operator enabling a feature does not automatically authorize every merchant user to perform every action inside it.

---

## 15. Billing and subscription operations

Billing is part of the platform control plane.

Platform billing capabilities may include:

- plan lifecycle;
- subscription status;
- invoices;
- payment collection state;
- credits;
- refunds;
- billing exceptions;
- entitlement changes.

Billing events must not silently alter merchant business records.

For example, a failed DukaFlow subscription payment should not delete merchant sales, customers, Deni, inventory, or historical records.

Premium expiry should change entitled features according to the product policy while preserving merchant data.

---

## 16. Security operations

Platform security staff should be able to investigate:

- suspicious authentication;
- privilege escalation;
- abnormal support access;
- unusual device activity;
- repeated synchronization anomalies;
- payment integration abuse;
- data-access incidents;
- suspected account takeover.

Security actions may include:

- session revocation;
- device revocation;
- platform-account suspension;
- forced reauthentication;
- incident containment.

Security controls should be enforced independently of the application UI.

Security authority still does not mean routine permission to change merchant business records.

---

## 17. Compliance and privacy operations

DukaFlow should maintain platform procedures for:

- data-access requests;
- correction requests;
- deletion/retention processes where legally applicable;
- security incident response;
- audit evidence;
- legal holds where required;
- merchant-data export processes;
- subprocessor/provider governance.

Platform compliance staff should not have unrestricted data access merely because they are responsible for privacy.

A privacy request should be handled through controlled workflows with purpose, scope, approvals, and auditability.

---

## 18. Platform operator lifecycle

Platform operator access should have its own lifecycle.

```text
Invited
  ↓
Active
  ↓
Temporarily restricted
  ↓
Transferred / scope changed
  ↓
Suspended
  ↓
Removed
```

When a platform operator leaves DukaFlow:

- platform sessions are revoked;
- privileged access is removed;
- support-access sessions are terminated;
- API credentials/keys used by the operator are rotated where applicable;
- pending approvals are reassigned;
- audit history remains intact.

Platform access changes must not rewrite merchant business history.

---

## 19. Separation of duties

High-risk platform operations should be divided where practical.

Examples:

```text
Support operator
  requests privileged merchant-data access
        ↓
Authorized reviewer
  approves access
        ↓
Support operator
  performs limited investigation
```

Or:

```text
Billing operator
  prepares refund
        ↓
Authorized finance approver
  approves refund above threshold
```

No platform role should automatically combine unrestricted merchant-data access, security control, billing authority, and platform configuration authority.

---

## 20. Platform audit trail

Every privileged platform action should record at least:

- platform operator identity;
- action;
- scope;
- target organization/shop/resource;
- reason/case/incident reference where applicable;
- approval state;
- timestamp;
- session/device context;
- result;
- before/after values for material changes where appropriate.

For support access, retain a separate access trail showing what data categories were accessed.

For secrets, record access attempts, lifecycle operations, rotations, and failures without writing the secret value into the audit trail.

The audit system itself must be protected from ordinary operator modification.

---

## 21. Operational dashboards

Platform operators should receive platform-level views rather than merchant business dashboards.

Examples:

- service health;
- authentication failure rate;
- synchronization backlog;
- integration health;
- payment-provider callback health;
- error rates;
- queue depth;
- database health;
- backup health;
- security alerts;
- support case volume;
- billing exceptions.

Merchant metrics should be shown only when needed for an approved operational purpose and should remain scoped.

At national scale, platform dashboards may show aggregate or appropriately protected network-level trends across shops, but aggregate visibility does not create permission to inspect individual merchants.

---

## 22. Incident response

A platform incident should follow a controlled process:

```text
Detect
 ↓
Classify
 ↓
Contain
 ↓
Investigate
 ↓
Communicate
 ↓
Recover
 ↓
Review
 ↓
Improve controls
```

Merchant-impacting incidents should preserve business data even when the platform is degraded.

When emergency access is needed, the break-glass rules apply.

---

## 23. Platform actions affecting merchants

Some platform actions can affect an entire merchant account or capability.

Examples:

- account suspension for abuse;
- plan/entitlement changes;
- service maintenance;
- forced security reset;
- integration disablement;
- migration or data-repair operation.

Such actions must:

- have a defined authority;
- have explicit scope;
- be logged;
- communicate impact where appropriate;
- preserve merchant business records;
- avoid silently changing historical transactions.

Data repair must use controlled migration/repair procedures, not ad-hoc edits by support operators.

---

## 24. Platform architecture boundary

The technical model should preserve a boundary between platform administration and merchant application authorization.

Conceptually:

```text
Platform identity / authorization
        ↓
Platform admin APIs / console
        ↓
Approved scoped service operations
        ↓
Merchant business services
        ↓
Merchant authorization checks
        ↓
Merchant data
```

A platform console should not bypass the same business invariants that protect merchant data merely because it is an administrative interface.

Where a repair operation genuinely needs elevated capability, it should be implemented as an explicit controlled operation with its own authorization and audit requirements.

A platform admin console must not become a second, unrestricted route into merchant business logic.

---

## 25. National-platform governance principles

Because DukaFlow is intended to connect shops across Kenya, platform administration must operate at the platform level while preserving merchant independence.

### Platform-wide responsibilities

DukaFlow platform governance may manage:

- service availability;
- security standards;
- platform authentication policy;
- platform-wide integrations;
- platform billing and entitlements;
- platform feature rollout;
- abuse prevention;
- compliance processes;
- disaster recovery;
- infrastructure and deployment controls;
- national-level aggregate operational monitoring.

### Merchant-level responsibilities

Each merchant remains responsible for:

- who works in its shops;
- shop assignments;
- staff permissions;
- product and stock operations;
- sales and settlements;
- customer relationships and Deni;
- purchasing and suppliers;
- cash and reconciliation;
- business approvals;
- merchant-specific configuration.

### Principle

```text
DukaFlow Administration
        ↓
Platform governance and protection
        ↓
Organizations
        ↓
Organization Owners
        ↓
Staff + permissions
        ↓
Shops and business operations
```

The platform should be able to support thousands or millions of shops without turning its central control plane into a universal merchant superuser.

---

## 26. Platform scale must not change merchant sovereignty

As the number of shops grows, the authorization boundary becomes more important, not less.

The platform should support:

```text
1 shop
→ 10 shops
→ 1,000 shops
→ 100,000+ shops
```

without creating a single human administrator who casually has unrestricted access to every merchant.

Scale should be handled through:

- scoped service permissions;
- automated controls;
- service-to-service authorization;
- audit and monitoring;
- controlled support workflows;
- segmentation of duties;
- automated provisioning and revocation;
- aggregation where individual merchant access is unnecessary.

---

## 27. Non-negotiable rules

1. **DukaFlow Administration is the platform layer above merchant organizations.**
2. **The DukaFlow Administrator / General Manager operates DukaFlow itself, not the merchant businesses.**
3. **Every merchant organization is owned by an Organization Owner.**
4. **Merchant staff operate under the Owner through shop assignments and explicit permissions.**
5. **Cashier, Manager, Inventory Operator, Supervisor, and similar labels are not mandatory merchant identities.**
6. **Platform authority is not merchant ownership.**
7. **Platform operators do not automatically inherit unrestricted merchant-data access.**
8. **Merchant secrets are not routine platform-admin data.**
9. **Secret lifecycle management does not mean human-readable secret access.**
10. **Support access is scoped, justified, time-limited, and audited.**
11. **Impersonation is never silent.**
12. **Break-glass access is exceptional and reviewed.**
13. **Platform feature flags do not replace merchant permissions.**
14. **Billing authority does not imply business-data authority.**
15. **Security authority does not imply unrestricted merchant operational access.**
16. **Platform operators cannot silently rewrite merchant financial history.**
17. **All privileged platform actions are attributable.**
18. **High-risk platform capabilities should use separation of duties where practical.**
19. **Centralized platform governance must not become centralized merchant ownership.**

---

## 28. Source-of-truth boundaries

Use this document for **who operates DukaFlow itself and what platform authority exists**.

Use:

- `docs/user-responsibilities.md` for **merchant Owner/Staff access and permissions**.
- `docs/user-lifecycle-and-access-governance.md` for **merchant staff access lifecycle and delegated administrative permissions**.
- `docs/individual-first-growth-principle.md` for **how merchant complexity should grow**.
- `docs/security-controls.md` and `docs/security-readiness.md` for **security enforcement and release gates**.
- `architecture.md` and `docs/foundation-contract.md` for **technical enforcement boundaries**.

No platform document should redefine merchant business permissions.

## Final principle

> **DukaFlow Administration runs and governs the platform. The Organization Owner runs the merchant organization. Staff run the assigned business operations through explicit permissions.**

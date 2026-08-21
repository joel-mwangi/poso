# DukaFlow Platform Operating Model

**This document is the source of truth for how DukaFlow operates as a national platform connecting Kenyan shops, while preserving each merchant organization's operational sovereignty.**

**Relationship to other documents:**

- `docs/platform-administration-and-operations-model.md` defines who may operate the DukaFlow platform and the authority boundaries for platform operators.
- `docs/user-responsibilities.md` defines the merchant owner/staff access model.
- `docs/individual-first-growth-principle.md` defines how merchant complexity grows from one person to structured businesses.
- `docs/duka-flow-domain-and-data-model.md` defines merchant business entities and source-of-truth relationships.
- `docs/duka-flow-mvp-and-implementation-roadmap.md` defines the product build sequence.
- `architecture.md`, `docs/foundation-contract.md`, and `docs/sync-model.md` define technical enforcement and synchronization boundaries.
- `docs/live-supabase-foundation.md` describes current implementation/deployment evidence and does not override this target operating model.

---

## 1. National platform principle

DukaFlow is designed to become a platform connecting shops across Kenya, from a one-person kiosk or duka to large structured retailers and multi-branch businesses.

The platform must therefore provide strong centralized governance for the **service** while preserving decentralized control of each **merchant business**.

The fundamental relationship is:

```text
ONE DUKAFLOW PLATFORM
        ↓
MANY INDEPENDENT MERCHANT BUSINESSES
        ↓
Each business owns its operational decisions
        ↓
Each business may have one or many shops
        ↓
Each shop has its own authorized people and business records
```

The key rule is:

> **DukaFlow operates the platform. Merchants operate their businesses.**

Centralized platform governance must never become centralized merchant ownership.

---

## 2. Two control planes

DukaFlow must maintain a strict separation between two control planes.

### Platform control plane

Responsible for the health, security, commercial operation, governance, and evolution of DukaFlow itself.

```text
Platform identity
 ↓
Platform permissions
 ↓
Platform resources
 ↓
Platform health / security / billing / operations
```

### Merchant control plane

Responsible for the business operations of an individual merchant organization.

```text
Merchant identity
 ↓
Organization
 ↓
Owner / Staff
 ↓
Shop assignment
 ↓
Permissions
 ↓
Products / Stock / Sales / Cash / Customers / Suppliers
```

A platform operator does not become a merchant owner simply because they can administer DukaFlow infrastructure.

---

## 3. Platform operational domains

The platform must explicitly own the following operational domains:

1. Platform identity and privileged access.
2. Merchant organization lifecycle.
3. Shop lifecycle controls.
4. Tenant isolation and data boundaries.
5. Platform entitlements and plans.
6. Billing and subscription operations.
7. Support operations.
8. Platform observability.
9. Incident management.
10. Security operations.
11. Data governance and privacy operations.
12. Secrets and external integrations.
13. Change management and release operations.
14. Backup and disaster recovery.
15. Data repair and migration.
16. Abuse and fraud prevention.
17. Platform communications.
18. Network-level analytics and intelligence.
19. Compliance and legal operations.
20. Platform governance and evolution.

No one platform role should automatically control every one of these domains. High-risk authority should be separated where practical.

---

## 4. Platform identity and privileged access

All platform operators must have platform identities separate from merchant identities.

Platform access must be:

- explicitly granted;
- least-privilege;
- scope-limited;
- strongly authenticated;
- auditable;
- revocable;
- reviewed periodically.

Recommended platform access capabilities include:

- platform administration;
- operations;
- customer support;
- security/compliance;
- billing/finance;
- product operations;
- read-only audit.

These are convenience categories. Actual authorization comes from explicit platform permissions.

Privileged platform access should require stronger authentication than ordinary merchant operations and should use separate administrative sessions where practical.

---

## 5. Merchant organization lifecycle

DukaFlow needs a controlled lifecycle for every merchant organization.

```text
Prospect / Registration
        ↓
Created
        ↓
Activated
        ↓
Active
        ↓
Restricted / Suspended if necessary
        ↓
Closed / Deactivated
        ↓
Retained / Archived according to policy
```

### Organization creation

A merchant owner creates or is established as the owner of the organization through the merchant onboarding flow.

Platform operations may validate account integrity and platform eligibility but should not normally create the merchant's business records on the merchant's behalf.

### Organization activation

Activation establishes the minimum state required for the merchant to operate.

A one-person merchant should not be forced through enterprise-style administration before being able to reach useful value.

### Organization suspension

Suspension may be necessary for:

- security threats;
- abuse;
- legal requirements;
- severe billing/entitlement conditions according to policy;
- integrity or platform-safety incidents.

Suspension must not silently erase merchant data.

### Organization closure

Closure should distinguish:

- stopping new operations;
- disabling active access;
- retention requirements;
- export availability;
- billing closure;
- legal/compliance retention.

Closing an organization must never silently rewrite historical business transactions.

---

## 6. Shop lifecycle

A merchant organization may contain one or many shops.

The platform must support a shop lifecycle without confusing shop closure with organization closure.

```text
Shop setup
 ↓
Active
 ↓
Temporarily suspended if necessary
 ↓
Closed / inactive
 ↓
Archived according to policy
```

The merchant owner remains the business authority for ordinary shop creation and management.

Platform intervention in shop state is exceptional and must be governed by platform policy, legal requirements, security incidents, or controlled support/repair procedures.

Closing one shop must not automatically close the organization or other shops.

---

## 7. Tenant isolation and sovereignty

Every merchant organization must be treated as an independent tenant boundary.

The platform must ensure:

```text
Organization A
    X
Organization B
```

There must be no ordinary path for one merchant to read or modify another merchant's private business data.

Within an organization:

```text
Shop A
    X
Restricted Shop B data
```

unless explicit organization/shop visibility allows it.

Platform administration must not weaken tenant isolation simply because the operator is a privileged platform user.

Where a platform investigation requires merchant-data access, the access must use the controlled support/incident-access mechanisms defined by the platform administration model.

---

## 8. Merchant business data sovereignty

Merchant business data includes, at minimum:

- products;
- stock;
- sales;
- payments;
- cash movements;
- customers;
- Deni;
- purchases;
- suppliers;
- expenses;
- reconciliations;
- staff activity;
- audit history related to the merchant business.

DukaFlow stores and processes this information to operate the service, but platform personnel do not gain unrestricted operational control over it merely because DukaFlow hosts it.

The merchant owner and authorized staff remain responsible for ordinary business operations.

Platform systems should preserve merchant data even when:

- subscription status changes;
- a shop is temporarily unavailable;
- a platform incident occurs;
- a feature is disabled;
- an integration fails.

---

## 9. Platform entitlements and plans

DukaFlow may provide different plans or entitlements as the platform grows.

Entitlements answer:

> **What capabilities does this merchant organization have available from DukaFlow?**

Merchant permissions answer:

> **What may this specific user do?**

These are separate.

```text
Platform availability
        ↓
Merchant entitlement
        ↓
Merchant configuration
        ↓
User authorization
        ↓
Actual operation
```

A platform operator enabling a capability does not authorize every merchant employee to use it.

A merchant plan should not change historical ownership of business records.

---

## 10. Billing and subscription operations

The platform must maintain a separate commercial model for DukaFlow subscriptions.

Billing records should include, as needed:

- plan;
- subscription status;
- billing period;
- invoice;
- payment state;
- refund;
- credit;
- entitlement state;
- billing exception;
- timestamps.

### Important separation

DukaFlow billing is not merchant cash accounting.

```text
DUKAFLOW SUBSCRIPTION BILLING
        ≠
MERCHANT SHOP CASH
```

A merchant's failed DukaFlow subscription payment must not be represented as a shop expense unless the merchant explicitly records the business expense through merchant operations.

Subscription expiry should affect DukaFlow entitlements according to policy while preserving merchant business history.

---

## 11. Support operations

Support should follow a controlled workflow.

```text
Merchant reports problem
        ↓
Case created
        ↓
Account metadata / diagnostics
        ↓
Can issue be resolved without business-data access?
        ├── Yes → resolve
        └── No
              ↓
        Scoped access request
              ↓
        Approval / consent according to policy
              ↓
        Time-limited access
              ↓
        Investigation / approved action
              ↓
        Access expires
              ↓
        Audit + resolution record
```

Support should default to read-only access.

Support operators must not become hidden merchant owners.

---

## 12. Assisted support and merchant impersonation

If DukaFlow needs an assisted session, it must preserve the distinction between the human operator and the merchant identity.

Every assisted session must record:

- actual platform operator;
- merchant organization;
- optional shop scope;
- purpose/case ID;
- allowed data classes;
- allowed actions;
- start time;
- expiry time;
- approval/consent evidence;
- resulting actions.

An assisted session must never make a platform operator appear to have been the merchant owner or staff member who normally performed the action.

Sensitive financial and customer changes should be read-only or require a separate controlled repair procedure unless a specific approved workflow exists.

---

## 13. Platform observability

DukaFlow must know whether the platform is healthy.

Platform observability should cover, where applicable:

### Application

- error rate;
- latency;
- availability;
- client crash rate;
- version distribution.

### Authentication

- login failures;
- unusual authentication patterns;
- session failures;
- credential-abuse signals.

### Synchronization

- pending operations;
- synchronization failure rate;
- retry volume;
- conflict rate;
- stale devices;
- queue/backlog health.

### Data services

- database health;
- query failures;
- storage health;
- backup health;
- replication health where used.

### Integrations

- M-Pesa/payment-provider health;
- callback health;
- external API failures;
- webhook backlog.

Observability should primarily expose platform health metrics, not merchant business details.

---

## 14. Incident management

Platform incidents must follow a repeatable lifecycle.

```text
Detect
 ↓
Classify severity
 ↓
Assign incident owner
 ↓
Contain
 ↓
Investigate
 ↓
Communicate
 ↓
Recover
 ↓
Validate
 ↓
Post-incident review
 ↓
Prevent recurrence
```

Suggested severity dimensions:

- number of affected merchants;
- inability to sell;
- data integrity risk;
- financial integrity risk;
- security/privacy impact;
- external-provider dependency;
- duration.

Merchant-facing communication should state:

- what is affected;
- what is not affected;
- what merchants should do;
- whether offline operation remains available;
- when the next update is expected.

Do not expose unnecessary internal security details.

---

## 15. Security operations

Security operations must protect both the platform and merchant organizations.

Monitor for:

- account takeover;
- privilege escalation;
- abnormal support access;
- suspicious device activity;
- credential abuse;
- synchronization manipulation;
- payment-integration abuse;
- cross-tenant access attempts;
- unusual data extraction;
- malicious automation.

Security actions may include:

- session revocation;
- device revocation;
- platform-account suspension;
- forced reauthentication;
- support-access termination;
- containment of compromised integrations.

Security operators should not gain unrestricted merchant transaction privileges as a side effect of having security authority.

---

## 16. Secrets and integration management

DukaFlow will eventually connect to external services such as payment providers and other business integrations.

Secrets must be managed as platform infrastructure, not ordinary user-visible data.

Examples include:

- M-Pesa credentials;
- provider API keys;
- webhook signing secrets;
- OAuth client secrets;
- encryption keys;
- service credentials.

The platform should:

- minimize human visibility of raw secrets;
- store secrets in appropriate protected infrastructure;
- separate secret ownership from merchant-data permissions;
- rotate secrets when required;
- audit secret lifecycle events;
- prevent secrets from entering logs or ordinary merchant records.

Platform administrators should manage the **lifecycle** of integrations without routinely reading raw merchant credentials.

---

## 17. Change management and releases

The platform must be changed safely because a single release can affect many shops.

Changes should be classified as:

- routine;
- low-risk;
- high-risk;
- security-critical;
- data migration;
- emergency.

For meaningful changes, require:

```text
Change proposal
 ↓
Impact assessment
 ↓
Testing
 ↓
Approval
 ↓
Staged rollout
 ↓
Observe
 ↓
Expand rollout
 ↓
Validate
```

Feature flags may be used to limit blast radius.

Rollback plans must exist before high-risk releases.

Database changes must preserve compatibility with supported application versions during rollout.

---

## 18. Data migrations and repairs

Platform-wide data repair is a special operational capability.

Examples:

- correcting data produced by a software defect;
- rebuilding derived stock projections;
- repairing synchronization state;
- migrating schema versions;
- repairing malformed integration records.

The workflow should be:

```text
Detect
 ↓
Diagnose
 ↓
Define repair scope
 ↓
Approve repair
 ↓
Dry run / validation where possible
 ↓
Execute controlled repair
 ↓
Validate affected records
 ↓
Audit result
 ↓
Communicate where merchant impact exists
```

A platform operator must not manually change thousands of merchant transactions through a support screen.

Repairs should preserve original historical events wherever possible and use explicit correction/reversal mechanisms rather than silently rewriting history.

---

## 19. Backup and disaster recovery

DukaFlow must plan for loss of service and loss of infrastructure.

The operating model must define:

- backup frequency;
- backup retention;
- restoration testing;
- disaster-recovery owner;
- recovery objectives;
- dependencies;
- failover procedures;
- communication procedures.

Recovery must preserve merchant business truth.

A successful recovery is not merely “the website is back.” It must also establish that:

- sales were not duplicated;
- stock movements remain consistent;
- Deni ledger entries remain consistent;
- payments remain traceable;
- synchronization state is safe;
- audit history remains intact.

---

## 20. Offline and synchronization operations

Because DukaFlow is offline-first, synchronization is a platform-critical service.

The platform should monitor:

- outbox backlog;
- operation age;
- failed operation rate;
- duplicate/replay detection;
- conflict frequency;
- authorization revalidation failures;
- stale-device patterns.

The server remains the durable synchronized business boundary, while local devices remain operational state for supported offline work.

Offline operation must never become a permanent authorization bypass.

When devices reconnect, server-side authorization and domain invariants are re-evaluated.

---

## 21. Platform abuse and fraud controls

As DukaFlow connects more shops, the platform must detect misuse without turning ordinary merchants into suspects by default.

Possible signals include:

- abnormal authentication patterns;
- repeated account creation abuse;
- suspicious support-access attempts;
- payment-provider abuse;
- unusual API usage;
- automated scraping;
- cross-tenant probing;
- device farms;
- repeated synchronization manipulation.

Controls should be risk-based and should minimize false positives.

Where a merchant is restricted, the platform should preserve legitimate business data and provide an appropriate operational path for review.

---

## 22. Platform communications

DukaFlow should distinguish between:

### Platform-wide communication

Examples:

- major service incident;
- scheduled maintenance;
- platform-wide security notice;
- general terms/policy change.

### Merchant-specific communication

Examples:

- account billing issue;
- shop-specific integration problem;
- support response;
- security event affecting one organization;
- entitlement change.

### In-product operational notices

Examples:

- synchronization problem;
- integration delay;
- required reauthentication;
- service degradation.

Communications should be attributable, relevant, and explain required merchant action.

---

## 23. Network analytics and intelligence

DukaFlow may eventually learn from the aggregate network of shops, but network intelligence must not become silent access to individual merchant businesses.

The platform should distinguish:

```text
Platform telemetry
        ≠
Merchant business records
        ≠
Aggregated / anonymized network intelligence
```

Network-level analytics should have defined purpose, privacy boundaries, aggregation rules, and access controls.

Individual merchant-level insights belong to the merchant unless the merchant explicitly participates in a feature or process that changes the applicable data-use terms.

---

## 24. Compliance and privacy operations

DukaFlow should maintain operational procedures for:

- data-access requests;
- correction requests;
- export requests;
- deletion/retention processes where legally applicable;
- security/privacy incidents;
- audit evidence;
- legal holds;
- provider/subprocessor governance;
- policy changes.

A privacy or compliance function does not automatically receive unrestricted merchant-data access.

Each request must have:

- purpose;
- legal/policy basis where applicable;
- scope;
- responsible operator;
- approval;
- evidence;
- outcome;
- audit record.

---

## 25. Platform operator lifecycle

Platform personnel have their own controlled lifecycle.

```text
Invited
 ↓
Active
 ↓
Scope changed / temporarily restricted
 ↓
Suspended
 ↓
Removed
```

When privileged personnel leave:

- platform sessions are revoked;
- privileged permissions are removed;
- support-access sessions end;
- outstanding privileged approvals are reassigned;
- relevant credentials are rotated;
- audit history remains intact.

Merchant business history is never deleted because a platform operator left.

---

## 26. Separation of duties

High-risk operations should have independent authorization where practical.

Examples:

```text
Support operator
 ↓
Requests merchant-data access
 ↓
Authorized reviewer
 ↓
Access granted
 ↓
Support investigation
```

```text
Engineer
 ↓
Prepares production migration
 ↓
Authorized reviewer
 ↓
Migration approved
 ↓
Controlled execution
```

```text
Billing operator
 ↓
Prepares high-value platform refund
 ↓
Finance approver
 ↓
Refund executed
```

Avoid a single platform identity holding unrestricted security, billing, data-access, deployment, and platform-configuration authority unless an exceptional break-glass procedure is explicitly invoked.

---

## 27. Break-glass operations

Break-glass is an exception for urgent events where ordinary approval paths cannot protect the platform or merchants quickly enough.

It must be:

- explicitly invoked;
- limited in time;
- limited in scope;
- strongly authenticated;
- independently logged;
- reviewed after use.

Break-glass access is not a convenience mechanism for routine support or engineering work.

---

## 28. Platform audit model

All privileged platform activity must be attributable.

At minimum, record:

- operator identity;
- operation;
- target scope;
- reason or case/incident reference;
- approval state;
- timestamp;
- device/session context where applicable;
- result;
- material before/after values where appropriate.

For merchant-data access, also record the data class accessed.

The audit trail itself must be protected from ordinary operator modification.

---

## 29. Platform health dashboard

Platform leadership and operations should have a single health view covering the service as a whole.

Suggested areas:

```text
AUTHENTICATION
SYNC
DATABASE
STORAGE
PAYMENTS
INTEGRATIONS
APPLICATION
SECURITY
BACKUPS
BILLING
SUPPORT
INCIDENTS
```

The dashboard should support drill-down from platform aggregate to technical evidence without exposing unnecessary merchant business data.

---

## 30. Merchant impact assessment

Every significant platform change or incident should ask:

> **How does this affect a one-person shop, a staffed shop, and a multi-shop organization?**

This prevents platform decisions from being optimized only for large customers.

Examples:

### One-person shop

Must still be able to perform core supported selling and understand status simply.

### Structured shop

Must preserve staff access, permissions, shifts, approvals, and reconciliation behavior.

### Multi-shop organization

Must preserve shop isolation, cross-shop authorized visibility, and organization-level controls.

---

## 31. Platform scalability model

DukaFlow should scale in layers.

```text
More shops
   ↓
More business events
   ↓
More synchronization traffic
   ↓
More support / security signals
   ↓
More platform operational requirements
```

Scaling decisions must preserve the merchant experience.

The product architecture should introduce additional infrastructure only when measured load, reliability, security, or operational requirements justify it.

Do not make large-shop complexity the default merchant experience merely because the platform can serve large-scale customers.

---

## 32. Platform change and feature governance

A new platform capability should be assessed for:

- merchant value;
- security impact;
- data impact;
- operational impact;
- support impact;
- billing impact;
- migration impact;
- compliance impact;
- scalability impact;
- impact on the one-person shop.

No new platform capability is complete until its authority model and operating procedures are clear.

---

## 33. Source-of-truth boundaries

Use this document for **how the DukaFlow platform is operated as a service**.

Use:

- `docs/platform-administration-and-operations-model.md` for **who may exercise platform authority**.
- `docs/user-responsibilities.md` for **merchant owner/staff access**.
- `docs/individual-first-growth-principle.md` for **merchant complexity growth**.
- `docs/duka-flow-domain-and-data-model.md` for **merchant business truth**.
- `docs/duka-flow-mvp-and-implementation-roadmap.md` for **product build order**.
- `docs/security-controls.md` and `docs/security-verification-checklist.md` for **security controls and verification**.
- `architecture.md`, `docs/foundation-contract.md`, and `docs/sync-model.md` for **technical enforcement**.
- `docs/live-supabase-foundation.md` for **current deployment/implementation evidence only**.

If an implementation-status document conflicts with this operating model, the implementation is incomplete or stale; it does not redefine the target operating model.

---

## 34. Operating readiness definition

DukaFlow should not consider the platform operationally mature merely because merchant features work.

Platform readiness requires evidence that the service can:

- authenticate and authorize platform operators safely;
- isolate merchant organizations;
- operate merchant lifecycle processes;
- support merchants without unrestricted access;
- monitor platform health;
- detect and respond to incidents;
- protect secrets;
- roll out changes safely;
- back up and restore data;
- execute controlled repairs;
- manage billing independently of merchant business truth;
- maintain auditable privileged operations;
- respond to security/privacy events;
- scale as shop count and transaction volume grow;
- preserve a simple experience for one-person shops.

---

## Final principle

> **One national DukaFlow platform, many independent businesses. DukaFlow governs and protects the network, while every merchant remains in control of its own shop operations and business data.**

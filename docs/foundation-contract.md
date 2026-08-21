# DukaFlow Foundation Contract

## Purpose

This document is the non-negotiable foundation contract for DukaFlow as it grows from the first merchant toward 100,000 shops.

## Architectural rules

1. The merchant POS is smartphone-first and offline-first.
2. React components do not own business truth.
3. Business operations are expressed as application use cases.
4. Domain types define shared business semantics.
5. Local persistence is the immediate operating store for the POS.
6. The outbox is the durable boundary between local work and synchronization.
7. Server-side validation and PostgreSQL are authoritative for durable cloud state.
8. Tenant/store authorization is enforced server-side with RLS; UI checks are convenience only.
9. Financial records are append-oriented; corrections are explicit transactions, not silent edits.
10. Inventory truth is represented by inventory movements; derived balances may be cached/rebuilt.
11. Every syncable mutation requires a stable operation ID and idempotent handling.
12. External integrations are adapters. M-Pesa, SMS and WhatsApp must never become core domain dependencies.
13. Public storefront data is an explicit projection of published merchant data and never exposes private POS data.
14. The system starts as a modular monolith. New infrastructure services are introduced only when measured scale requires them.
15. Observability is part of the foundation: audit, sync health, errors and operational metrics are required before production scale.

## Dependency direction

```text
UI
 ↓
Application / use cases
 ↓
Domain contracts
 ↓
Ports / repositories
 ↓
Local or server infrastructure
```

Infrastructure may implement domain ports; the domain must not import UI, Supabase clients, Dexie, or provider SDKs.

## First vertical slice

```text
Shop bootstrap
 → Product
 → Cart
 → Complete sale
 → Cash / M-Pesa reference / Deni
 → Inventory movement
 → Receipt data
 → Local outbox
 → Restart offline
 → Synchronize
```

No dashboard, advanced analytics, public storefront, delivery marketplace or complex accounting work should displace completion and verification of this slice.

## Scale strategy

The first deployment remains deliberately simple: Vite/React merchant client, local IndexedDB/Dexie storage, Supabase/PostgreSQL backend, RLS, and an explicit sync layer. Scale is achieved progressively through measurement, indexing, background workers, queues, read models, partitioning and regional strategies only when required.

## Money

Domain money is represented as integer minor units (KES cents). Floating-point arithmetic must not be used for financial calculations.

## Authorization and identity foundation

DukaFlow uses Supabase Auth for human identity and sessions. Authorization is a separate server-enforced decision based on:

```text
Authenticated user
   ↓
User profile
   ↓
Organization membership
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
Operational context
```

Owner and Staff are the two fundamental human categories. Labels such as Cashier, Inventory, or Manager are optional permission templates only; they are not security boundaries.

Shop assignment and capability are separate. A worker normally belongs to one shop and enters it automatically. A worker assigned to multiple shops must select the active shop. A worker with no valid shop assignment must not be placed into an arbitrary shop.

The backend must never trust client-supplied organization IDs, shop IDs, roles, or permissions as authorization proof. PostgreSQL RLS and server-side business rules remain authoritative.

### Bootstrap

New merchant bootstrap should be one controlled, idempotent or safely repeatable operation:

```text
Create Auth user
      ↓
Create organization
      ↓
Create first shop
      ↓
Create owner membership/profile
      ↓
Create default configuration
      ↓
Enter POS
```

The owner then creates additional shops and invites/assigns staff with explicit permissions.

### Owner setup checklist before bootstrap

After account registration and verification, and before organization/shop bootstrap, show the owner a short ticking checklist:

1. Do you have more than one shop? **Yes / No**
2. Do you accept M-Pesa? **Yes / No**
3. Do you allow Deni? **Yes / No**
4. Do you buy stock from suppliers? **Yes / No**

If the answer to question 1 is **No**, ask:

5. Do you run the shop alone? **Yes / No**

If the answer is **Yes**, DukaFlow automatically records **Other people use the system: No**. If the answer is **No**, DukaFlow automatically records **Other people use the system: Yes**. Do not ask the duplicate staff-use question.

If the answer to question 1 is **Yes**, continue with multi-shop creation. Do not ask the helping-person question during the initial quiz. That question appears later in the settings for each specific shop after the owner taps **Set up shop**.

The answers recommend a starting setup. The owner may choose **Start with simple setup** or **Use recommended setup**. Only relevant follow-ups should appear, including M-Pesa Till Number configuration, staff access, additional shops, customer/Deni tracking, or supplier tools. The checklist must not force advanced setup during registration.

The owner remains an **Owner** regardless of setup complexity. Complexity is represented by enabled organization capabilities and can be added later.

After organization creation, the first shop bootstrap must collect a shop name and simple location:

```text
Shop name
[ Enter shop name ]

Shop location
[ Enter town, estate, street, or area ]

[Create shop]
```

Additional shops use the same name-and-location form and may be added immediately or later. A formal postal address is not required.

After the first shop is created, the owner-facing settings area includes:

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

M-Pesa setup is conditional. The owner selects Till Number or PayBill, enters the payment number, chooses Sandbox or Live, and securely configures Daraja credentials obtained through Safaricom Daraja Live. Raw credentials remain in the protected server-side secret boundary and are never stored in ordinary shop records or local POS storage. Customer/Deni, supplier/purchasing, staff, and additional-shop sections are enabled only when relevant.

### Helper invitation contract

The owner creates a helper’s access from Shop Settings. The helper does not create an organisation or shop. The browser submits the request to a server-side function, which creates a first-class application invitation and validates the owner’s organisation, selected shop, and permissions.

```text
Owner saves helper
   ↓
Application invitation: Pending
   ↓
Existing Auth user?
   ├── Yes → invitation to existing account
   └── No  → Supabase Auth invites by email
   ↓
Pending membership, shop assignment, and permission grants
   ↓
Invitation sent
   ↓
Helper accepts and activates account
   ↓
Membership becomes Active
   ↓
Helper logs in to the assigned shop workspace
```

The service-role key remains server-side. Email is the primary login identifier and phone is optional. Existing users receive an application invitation to their existing Auth account; a second Auth user must not be created. Invitation, membership, and processing states are separate, and Auth provisioning plus application-record writes are not treated as one database transaction. Retries must be idempotent and recoverable through retry and cleanup metadata.

The owner-facing Yes/No controls map to canonical permission grants such as `sales.operate`, `payments.receive`, and `inventory.manage`. They are not ad hoc authorization columns on shop assignments. RLS and server-side authorization enforce active membership, shop assignment, and effective permission.

The owner setup flow must be responsive without changing its content or business rules:

```text
Mobile  → single-column vertical steps
Tablet  → centered flexible form
Desktop → step rail and wider work area
```

Use one primary action per screen, a short step indicator, large touch targets, no horizontal scrolling, and **Set up later** for optional configuration. Advanced credentials and administration remain separate screens.

### Session and offline authorization

Authentication state and offline operating state are separate concepts. Local data may support approved offline work for a previously authorized shop, but offline state must not become permanent unrestricted authorization.

When reconnecting or synchronizing, revalidate:

- authenticated identity;
- organization membership;
- shop assignment;
- permissions;
- approval authority where applicable;
- device/session state;
- domain invariants.

### Staff lifecycle

Access should support:

```text
Invited
   ↓
Active
   ↓
Suspended / Temporarily restricted
   ↓
Transferred / Reassigned
   ↓
Removed
```

Temporary shop coverage may use effective dates and explicit authorization without creating a new identity.

### Device identity

Devices have stable application-level device IDs separate from human authentication credentials. Where operational responsibility requires it, shifts/sessions may record user, organization, shop, device, opening/closing state, and reconciliation information.

### Security requirements

- Never store passwords or provider secrets in application tables or local POS storage.
- Never authorize through hidden UI routes alone.
- Never make an employee row the sole proof of tenant membership.
- Never allow a client-supplied tenant/store scope to bypass server validation.
- Treat local storage as operational state, not a security boundary.
- Record sensitive actions with sufficient identity, scope, device/session, and approval metadata.
- Public storefront access must use an explicit published projection and must never inherit private merchant permissions.

## Transaction invariants

A completed sale must have:
- at least one line;
- a non-negative total;
- valid payment semantics;
- corresponding inventory movements;
- a stable operation ID;
- an outbox record when created locally.

Repeated delivery of the same operation must not create a second financial transaction.

## Required verification

Before a business feature is considered production-ready, verify the security and operational boundaries relevant to it. The foundation must cover at minimum:

- signup/login/logout;
- password recovery;
- expired/revoked session behavior;
- owner bootstrap;
- tenant isolation;
- one-shop automatic entry;
- multi-shop selector behavior;
- unassigned staff denial;
- permission allow/deny behavior;
- visibility restrictions;
- approval-required actions;
- revoked membership behavior;
- revoked device sync denial;
- offline transaction followed by authenticated reconnect;
- public storefront isolation from private tenant records.

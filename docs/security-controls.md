# DukaFlow Security Controls

## Security objective

DukaFlow handles merchant identity, customer information, sales, payments, Deni, inventory and future public commerce data. Security protects confidentiality, integrity, availability, and accountability.

The security model follows:

```text
Authenticated identity
        ↓
Organization membership
        ↓
Owner / Staff
        ↓
Shop assignment
        ↓
Permissions
        ↓
Data visibility / Approval authority
        ↓
PostgreSQL + RLS + server validation
```

## Threat model

Assets include authenticated accounts, organization/store memberships, staff permissions, customers, products, inventory, sales, payments, Deni, audit records, device-local data, synchronization state, and integration secrets.

Threats include unauthorized users, horizontal tenant access, privilege escalation, stolen sessions/devices, manipulated IndexedDB data, replayed sync requests, forged payment callbacks, accidental destructive updates, secret leakage, and service outages.

## Authentication controls

- Supabase Auth is the identity provider.
- Passwords and authentication secrets are not duplicated in application tables or local POS storage.
- Session refresh, expiry, logout, recovery and revocation are handled through the Auth boundary.
- Higher-risk staff/owners should have MFA policy defined before production use of sensitive operations.

## Tenant and shop isolation

Every private business record has a deterministic organization/store ownership path.

Rules:

1. The UI is never trusted to choose an authorized `store_id`.
2. Organization membership is checked server-side.
3. Staff shop assignments are explicit.
4. A one-shop worker is limited to that shop.
5. A multi-shop worker may operate only within selected assigned shop context.
6. Owner organization access does not grant unrelated organization access.
7. Removed/suspended assignments lose access without relying on UI cleanup.

## Authorization controls

DukaFlow has two human categories: **owner** and **staff**.

Staff capabilities are controlled by explicit permissions. Names such as Cashier, Inventory, or Manager/Supervisor are only optional permission templates.

Examples:

```text
can_access_store
can_operate_sales
can_record_payments
can_manage_inventory
can_manage_products
can_manage_customers
can_view_reports
can_manage_staff
can_change_prices
can_void_sale
can_refund_sale
can_reconcile_payments
```

Authorization must be evaluated by capability, not by hidden UI state or a role label.

### Data visibility

Capability and visibility are separate where needed. A staff member may operate sales without seeing supplier cost prices or organization-wide reports.

### Approval authority

Some operations require a separate approval capability, such as large stock adjustments, high-value refunds, price changes, completed-sale voids, staff permission changes, stock transfers, or shift reconciliation overrides.

### Shift / operational responsibility

Where a shop uses shifts or tills, the system should record who was responsible for the shift/device and whether reconciliation was completed.

## RLS controls

- RLS is enabled on every browser-exposed private table.
- Policies use trusted authenticated identity and membership/assignment helpers.
- Client-supplied organization/store IDs are never authorization proof.
- Public functions are narrow and deliberate.
- `SECURITY DEFINER` functions use fixed search paths and explicit grants.
- Anonymous users cannot call private authorization helpers.
- RLS performance is reviewed as tenant count grows.

## Offline/device controls

Each device has a stable device identity separate from the human identity.

A locally created operation should include, conceptually:

```text
organization_id
store_id
user_id / employee_id
device_id
operation_id
created_at
entity_id
operation_type
payload
```

The client may generate identifiers, but the server validates the authenticated identity, shop assignment, permissions, and business invariants when synchronizing.

Revoked devices cannot successfully synchronize new mutations.

Local storage is operational state, not an authorization boundary. Cache only necessary operational data and never store provider secrets or service-role credentials in the browser.

## Transaction integrity

Completed sales validate:

- authorized operator;
- authorized shop context;
- product ownership;
- valid quantities/prices;
- payment state;
- Deni conditions where applicable;
- unique operation identity;
- permitted state transitions.

Inventory movements are authoritative. Deni is ledger-based. Historical corrections use explicit reversals/adjustments rather than silent edits.

## Idempotency / replay controls

Every offline mutation has a stable operation identity.

```text
same store + same operation_id
        ↓
never apply financial effect twice
```

Retries, duplicate callbacks, timeouts and restarts must be safe.

## M-Pesa / external payment controls

- Provider secrets remain server-side.
- Client-entered references are evidence, not automatic proof of settlement.
- Provider callbacks are authenticated/verified.
- Callback replay is idempotent.
- External reference uniqueness is enforced where appropriate.
- Payment exceptions are auditable.

## Public storefront controls

Public exposure is opt-in and limited to an explicit public projection.

Never expose customers, Deni, internal sales, payments, employees, suppliers, cost prices, private inventory, or audit logs.

## Audit controls

Important events should identify:

```text
actor user
organization
store
permission/approval context where relevant
device/session
entity
when
what changed
reason/reference
```

Audit logs must never contain passwords, access tokens, provider secrets, or unnecessary sensitive data.

## Staff lifecycle and temporary access

Track staff lifecycle states such as invited, active, suspended, transferred/reassigned, and removed.

Temporary cross-shop access should be time-bounded where supported and fully auditable.

## Security monitoring

Monitor authentication failures, authorization failures, permission changes, unusual shop-assignment changes, sync failures/conflicts, payment exceptions, abnormal stock adjustments, device revocation activity, and database health.

## Secrets management

Never commit or ship:

- Supabase service-role keys;
- database passwords;
- M-Pesa consumer secrets;
- webhook signing secrets;
- SMS/WhatsApp provider secrets;
- encryption master secrets.

Use deployment/provider secret stores and separate development/test/production credentials.

## Operational controls

- Schema changes are version-controlled migrations.
- CI runs type checking/builds, tests, lint and dependency vulnerability checks.
- Security/performance advisors are reviewed after material database changes.
- Backups and restore procedures are tested.
- Rate limits and abuse controls are introduced as public usage grows.
- Incident response includes account, staff-assignment, permission, and device revocation.

## Security gates

| Gate | Requirement | Status target |
| --- | --- | --- |
| A | Authentication + session lifecycle | Verified |
| B | Tenant + shop assignment isolation + RLS | Verified |
| C | Permission + visibility + approval enforcement | Verified |
| D | Transaction integrity/idempotency | Tested |
| E | Device registration/revocation | Tested |
| F | Offline tamper/replay resistance | Tested |
| G | Payment callback protection | Tested before integration |
| H | Public projection isolation | Verified |
| I | Audit coverage | Tested |
| J | CI dependency/type/test checks | Passing |
| K | Backup + restore test | Passing |
| L | Incident/revocation procedure | Documented + exercised |

## Final principle

> **The client enables the merchant to work; the server protects the merchant's business.**

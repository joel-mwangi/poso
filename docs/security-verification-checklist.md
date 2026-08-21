# DukaFlow Security Verification Checklist

This checklist is the release gate for authentication, tenancy, staff scope, permissions, offline operation, transactions and integrations.

## Identity

- [ ] Sign-up creates exactly one application profile.
- [ ] Sign-in restores the correct session.
- [ ] Sign-out invalidates the usable client session.
- [ ] Password recovery works through configured Auth flow.
- [ ] Expired/revoked sessions cannot continue protected operations.
- [ ] Higher-risk owner/staff actions have an MFA policy before production use.

## Organization and shop scope

- [ ] User from Organization A cannot select/read Organization B data.
- [ ] Worker cannot access a shop that is not assigned to them.
- [ ] Worker assigned to one shop opens that shop automatically.
- [ ] Worker assigned to multiple shops must select the active shop.
- [ ] Worker with no active assignment is denied access rather than placed in an arbitrary shop.
- [ ] Organization owner can manage all shops belonging to the organization.
- [ ] Removed/suspended shop assignments revoke access without UI-only cleanup.
- [ ] Cross-organization references are rejected.

## Permissions and templates

- [ ] Permissions are the actual authorization boundary.
- [ ] Cashier/Sales, Inventory, Manager/Supervisor and similar labels are only permission templates.
- [ ] Removing a permission removes the capability even if a template label remains.
- [ ] Staff can receive custom combinations of permissions.
- [ ] Permission changes are audited.
- [ ] Direct API/RPC requests receive the same authorization decision as UI actions.
- [ ] Staff cannot grant themselves permissions.

## Data visibility

- [ ] A worker cannot see data outside their permitted scope.
- [ ] Sales capability does not automatically reveal cost prices.
- [ ] Shop-level access does not automatically grant organization-wide reports.
- [ ] Sensitive customer, payment, Deni and employee data is visibility-controlled.

## Approval authority

- [ ] Approval-required actions are separately enforced.
- [ ] Large stock adjustments cannot bypass approval rules.
- [ ] High-value refunds/voids cannot bypass approval rules.
- [ ] Restricted price changes cannot bypass approval rules.
- [ ] Staff permission changes are approval-controlled where required.
- [ ] Stock transfers and reconciliation overrides follow configured authority.

## RLS

- [ ] Every private browser-exposed table has RLS enabled.
- [ ] SELECT policies prevent cross-store reads.
- [ ] INSERT policies prevent cross-store writes.
- [ ] UPDATE policies prevent cross-store changes.
- [ ] DELETE policies prevent cross-store deletion.
- [ ] Security-definer helpers cannot be called anonymously unless deliberately public.
- [ ] Security-definer functions use fixed search paths and minimal grants.

## Shop bootstrap and staff onboarding

- [ ] Only authenticated users can bootstrap an organization/shop.
- [ ] Identity comes from `auth.uid()` rather than caller-provided user IDs.
- [ ] Bootstrap creates owner membership consistently.
- [ ] Owner can create additional shops under the organization.
- [ ] Owner can invite/add staff.
- [ ] Owner can assign staff to one or more shops.
- [ ] Owner/authorized administrator can assign permissions or a permission template.
- [ ] Staff can be suspended, reassigned or removed.
- [ ] Temporary access is bounded and auditable where supported.

## Offline/device

- [ ] Device receives a stable local identity.
- [ ] Device identity is not human authentication.
- [ ] Revoked device cannot synchronize new mutations.
- [ ] Local database does not contain privileged secrets.
- [ ] Only necessary operational records are cached.
- [ ] Local manipulation cannot bypass server authorization.
- [ ] Reconnect revalidates identity, shop assignment and permissions.

## Shifts / operational responsibility

- [ ] Where shifts are enabled, the responsible user and device are recorded.
- [ ] Shift opening/closing is permission-controlled.
- [ ] Cash/payment reconciliation is attributable to the responsible user.
- [ ] Handover/reconciliation exceptions are auditable.

## Transactions

- [ ] Sale totals are server/domain validated.
- [ ] Payment amount matches permitted sale state.
- [ ] Product and customer belong to the same store.
- [ ] Inventory movements are generated atomically with the intended sale workflow.
- [ ] Deni entries are linked to valid customer/store context.
- [ ] Historical financial records are corrected through explicit reversals/adjustments.

## Idempotency / sync

- [ ] Same `operation_id` cannot create duplicate financial effects.
- [ ] Retry after timeout is safe.
- [ ] Duplicate callback is safe.
- [ ] Partial failure is recoverable.
- [ ] Failed operations remain visible for recovery.
- [ ] Conflict outcomes are explicit and auditable.

## M-Pesa / integrations

- [ ] Secrets exist only in server-side secret storage.
- [ ] Client-entered references are not automatically treated as confirmed payments.
- [ ] Provider callbacks are verified.
- [ ] Callback replay is idempotent.
- [ ] Provider references have appropriate uniqueness constraints.
- [ ] Payment exceptions are auditable.

## Public storefront

- [ ] Anonymous user can only access the explicit public projection.
- [ ] Unpublished products are excluded.
- [ ] Customers, Deni, payments, employees, suppliers and audit data are excluded.
- [ ] Public RPC/function cannot be used to query arbitrary private tables.

## Audit / monitoring

- [ ] Permission changes are auditable.
- [ ] Shop assignments are auditable.
- [ ] Approval actions are auditable.
- [ ] Product-price changes are auditable.
- [ ] Stock adjustments are auditable.
- [ ] Sale void/refund is auditable.
- [ ] Deni adjustments are auditable.
- [ ] Payment exceptions are auditable.
- [ ] Device registration/revocation is auditable.
- [ ] Sync failures/conflicts are observable.
- [ ] Secrets/tokens are excluded from logs.

## Operations

- [ ] CI runs typecheck/build.
- [ ] CI runs tests.
- [ ] CI runs lint.
- [ ] CI runs dependency vulnerability checks.
- [ ] Database migrations are version-controlled.
- [ ] Live schema can be reproduced from migrations.
- [ ] Supabase security advisor is reviewed after material migrations.
- [ ] Backup exists.
- [ ] Restore has been tested.
- [ ] Incident/revocation procedure has been exercised.

## Release decision

A production release should not be approved while a critical or high-risk control above is unverified. Intentional exceptions must be documented with an owner, rationale and remediation/monitoring plan.

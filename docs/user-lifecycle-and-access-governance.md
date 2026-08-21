# DukaFlow User Lifecycle & Access Governance

**This document defines who is allowed to create, change, approve, suspend, transfer, and revoke access within the DukaFlow User Access Model.**

**Source relationship: `docs/user-responsibilities.md` remains the source of truth for what the access model is. This document defines how that access is administered over the user's lifecycle.**

## 1. Scope

This document answers the next question after defining the User Access Model:

> **Who is allowed to create, change, and revoke each part of a user's access?**

It covers:

- user lifecycle;
- organization membership;
- shop assignments;
- permission assignment;
- data visibility;
- approval authority;
- operational context;
- temporary access;
- staff availability and leave;
- suspension and revocation;
- access changes and auditability.

It does not redefine the underlying user-access model. For that, refer to `docs/user-responsibilities.md`.

---

## 2. Fundamental ownership rule

The owner controls the organization's people and access.

```text
Owner
  ↓
Organization
  ↓
Shops
  ↓
Staff
  ↓
Assignments
  ↓
Permissions
  ↓
Visibility / Approval
```

The system must never allow a staff member to grant themselves access, expand their own permissions, move themselves into another shop, or promote themselves to owner-level authority.

---

## 3. User lifecycle

Every staff relationship follows a controlled lifecycle.

```text
Invited
   ↓
Activated
   ↓
Active
   ↓
On Leave / Unavailable (temporary)
   ↓
Suspended / Temporarily restricted
   ↓
Transferred / Reassigned
   ↓
Removed
```

Leave is a planned temporary availability state. Suspension is an access-control action. They must not be treated as the same event.

### Invited

The owner or authorized administrator creates the staff invitation.

The invitation should define, where applicable:

- organization;
- intended shop assignment(s);
- permission template or proposed permissions;
- any approval authority;
- invitation expiry.

The invited person does not receive operational access until the invitation is accepted and required account setup is complete.

### Activated

The staff member accepts the invitation and completes the required authentication/account setup.

The system then establishes the relationship between:

```text
Authenticated identity
      ↓
Organization membership
      ↓
Staff profile
      ↓
Shop assignment(s)
      ↓
Permissions
```

### Active

The staff member can operate only within their current authorized scope and availability.

### On Leave / Unavailable

The owner or appropriately authorized administrator may record a planned period when a staff member will not be available to work.

Example:

```text
Worker: John
Normal shop: Mavueni
Normal permissions: Sales + Payments
Leave start: 2026-08-24
Leave end: 2026-08-26
Return: 2026-08-27
```

During the leave period:

- John remains a staff member.
- His historical identity and permissions remain intact.
- His normal permanent assignments are preserved unless separately changed.
- DukaFlow should prevent new shop operations for the leave period where the business policy requires availability enforcement.
- Another worker may be temporarily assigned to cover the shop.
- The leave should end automatically at the configured return time.

Leave is **not** permission revocation and should not require recreating the worker when they return.

The system should distinguish at minimum:

```text
Access status: Active
Availability: On Leave
```

rather than changing the worker to a permanently suspended state.

### Suspended / Temporarily restricted

The owner or authorized administrator can prevent new protected operations while retaining the historical identity and business records.

Suspension is appropriate for security, disciplinary, or administrative reasons where the person should not operate until explicitly restored.

### Transferred / Reassigned

The person's identity remains the same. Their shop assignment(s), permissions, visibility, or approval authority may change.

### Removed

The staff member loses active access to the organization or specific shop(s), but historical business events remain attributable to the original identity.

---

## 4. Who may administer access?

### Owner

The owner can:

- create and manage the organization;
- create and manage shops;
- invite staff;
- assign staff to shops;
- remove shop assignments;
- grant and revoke permissions;
- define data visibility;
- grant or revoke approval authority;
- schedule or record staff leave/unavailability;
- approve or cancel leave where a leave workflow is introduced;
- suspend or remove staff;
- configure temporary access;
- revoke devices/sessions where supported;
- review access and audit history.

### Authorized staff administrator

A staff member may be given explicit permission to perform limited staff administration.

This access must be granted by the owner and must be narrower than the owner's authority unless the owner intentionally delegates a defined scope.

For example, an authorized administrator might be able to:

- invite staff;
- assign staff to their own shop;
- apply approved permission templates;
- schedule or record leave for staff within their allowed shop scope;
- disable staff access within that shop.

They should not automatically be able to:

- change their own permissions;
- promote themselves;
- change organization ownership;
- access another shop without assignment;
- grant permissions they do not possess;
- grant owner-level authority;
- override organization-wide leave policy unless explicitly permitted.

### Ordinary staff

Ordinary staff cannot administer their own access and cannot grant access to others unless they explicitly hold the required permission.

A staff member may request leave or report an unplanned absence, but that request does not itself grant, revoke, or expand access. The resulting availability state is governed by the owner or authorized administrator.

---

## 5. Access administration matrix

| Access element | Owner | Authorized administrator | Ordinary staff |
|---|---|---|---|
| Create organization | Yes | No | No |
| Create shop | Yes | Only if explicitly permitted | No |
| Invite staff | Yes | If permitted | No |
| Assign staff to shop | Yes | If permitted within scope | No |
| Remove staff shop access | Yes | If permitted within scope | No |
| Grant permissions | Yes | If explicitly permitted | No |
| Change own permissions | No direct self-escalation | No direct self-escalation | No |
| Grant approval authority | Yes | Only if explicitly delegated | No |
| Schedule/record staff leave | Yes | If permitted within scope | Request only |
| Cancel/override staff leave | Yes | If permitted within scope | No |
| Suspend staff | Yes | If permitted | No |
| Remove staff | Yes | If permitted within scope | No |
| Revoke device | Yes | If permitted | No |
| Change organization ownership | Controlled owner-level action | No | No |

The owner remains the ultimate authority over organization membership and access governance.

---

## 6. Shop assignment administration

Shop assignment answers:

> **Where may this person operate?**

It is separate from what the person can do and separate from whether they are currently available to work.

### Adding a staff member to a shop

```text
Owner / authorized administrator
      ↓
Select staff member
      ↓
Select shop
      ↓
Define shop-specific permissions
      ↓
Save assignment
      ↓
Staff can operate in that shop when available
```

### Removing a shop assignment

Removing a shop assignment should immediately prevent new protected access to that shop once the updated authorization reaches the server.

Historical transactions remain intact.

### Multiple shop assignments

A staff member may have several active shop assignments.

- One valid shop + available → open automatically.
- Multiple valid shops + available → select active shop.
- No valid shop → deny shop operations and explain what must be fixed.
- On leave → do not offer the worker for normal operational entry during the leave window, subject to the product's availability policy.

---

## 7. Permission administration

Permissions answer:

> **What may this person do?**

The owner can assign a template for convenience, but the resulting explicit permissions are the actual authorization contract.

```text
Template
   ↓
Suggested permissions
   ↓
Owner/admin review
   ↓
Explicit permissions stored
   ↓
Backend authorization
```

A permission can be:

- granted;
- revoked;
- temporarily granted;
- limited by shop;
- limited by data sensitivity;
- subject to approval;
- unavailable while the worker is on leave, where availability is part of the operational access decision.

### Self-escalation rule

A user must never be able to grant themselves a permission they do not already hold authority to grant.

This must be enforced on the backend/database layer, not only in the UI.

---

## 8. Data visibility administration

Data visibility answers:

> **What information may this person see?**

A user can have a permission without unrestricted access to every field.

Examples:

- A sales worker may sell without seeing cost prices.
- A stock worker may see quantities without seeing sensitive customer balances.
- A shop manager may see shop reporting without seeing another organization's data.

Visibility rules must be enforced server-side and through the database authorization boundary.

Staff leave should not erase or hide historical information. It only affects current operational access and availability.

---

## 9. Approval authority administration

Approval authority answers:

> **Which sensitive actions may this person approve?**

The owner can explicitly delegate approval authority.

Examples include:

- high-value refunds;
- large stock adjustments;
- price changes;
- stock transfers;
- financial corrections;
- shift reconciliation overrides;
- permission changes.

Request and approval are distinct capabilities.

```text
Worker
  ↓
Requests action
  ↓
Authorized approver
  ↓
Approves / rejects
  ↓
System records decision
```

The person requesting a sensitive action should not automatically be able to approve their own request.

A worker's approval authority becomes unavailable for new operational decisions during a leave period unless the organization explicitly supports a separate delegated approver arrangement.

---

## 10. Temporary access

The owner may grant temporary shop access or temporary permissions for a defined period.

Example:

```text
Worker: John
Permanent shop: Mavueni
Temporary shop: Kilifi
Start: 2026-08-20
End: 2026-08-22
Permissions: Sales + Inventory
```

After the expiry time, the temporary authorization is no longer valid.

Temporary authorization should be auditable and should not silently become permanent.

Temporary access should also be checked against the worker's availability. A leave period must take precedence over temporary operational access unless an authorized administrator explicitly changes the leave/assignment state.

---

## 11. Staff leave and availability

Staff availability is a first-class operational concept.

### Planned leave

A planned leave record should contain, at minimum:

- staff member;
- organization;
- applicable shop or shops, if leave is shop-specific;
- start date/time;
- end date/time;
- status;
- created by;
- created at;
- optional note/reason where appropriate.

Suggested statuses:

```text
Scheduled
   ↓
Active
   ↓
Completed
```

Possible additional administrative states:

```text
Cancelled
Rejected
```

### Unplanned absence

A worker may report that they are unavailable unexpectedly.

The system may record this as an availability event or absence request, but the owner/authorized administrator remains responsible for determining the operational status and coverage plan.

### Leave does not delete access

Leave should preserve:

- user identity;
- organization membership;
- shop assignments;
- permission history;
- historical transactions;
- audit history.

It temporarily affects whether the person is eligible for normal operational activity.

### Return from leave

At the configured return date/time:

```text
Leave expires
   ↓
Availability returns to active
   ↓
Existing assignments + permissions resume
   ↓
Worker can operate again
```

No new invitation or permission setup should be required unless the owner changed the person's access while they were away.

### Coverage

The owner can assign another worker temporarily to cover the absent staff member's shop responsibilities.

Example:

```text
John — Shop A — Leave for 3 days
        ↓
Owner assigns Mary — temporary Shop A access
        ↓
Mary operates under her own identity and permissions
        ↓
John's leave expires
        ↓
John returns to normal access
```

The system must never transfer John's identity or credentials to Mary.

---

## 12. Suspension and revocation

Suspension and revocation must be treated as access-control events, not deletion of identity.

### Suspension

Use when the person should temporarily lose protected access.

### Removal

Use when the person's active organization/shop relationship ends.

### Device revocation

A device can be revoked independently of the person.

```text
User remains active
      ↓
Device revoked
      ↓
That device cannot synchronize new protected operations
```

The user's other authorized devices may remain active if policy allows.

Leave and suspension have different meanings:

- **Leave:** planned temporary unavailability with an expected return.
- **Suspension:** administrative/security restriction that requires explicit restoration.

---

## 13. Access changes must not rewrite history

Changing access does not rewrite previous business activity.

For example:

```text
John was assigned to Shop A
John completed 120 sales
 ↓
Owner moves John to Shop B
 ↓
Old sales remain attributed to John + Shop A
New operations occur under Shop B
```

Similarly, removing a permission or recording leave does not remove historical actions taken while the worker was active.

---

## 14. Operational context

A user's permanent access is not the same as their active operational context.

At runtime DukaFlow may need to know:

- active shop;
- active shift;
- till/device;
- current session;
- operational responsibility;
- current availability state.

For a single-shop worker:

```text
Login
 ↓
One assigned shop
 ↓
Check availability
 ↓
If available → open automatically
If on leave → deny operational entry
```

For a multi-shop worker:

```text
Login
 ↓
Multiple assigned shops
 ↓
Check availability
 ↓
If available → select active shop
If on leave → deny operational entry
```

The selected shop becomes the context for shop-specific work.

---

## 15. Authorization decision

Every protected operation should conceptually evaluate:

```text
Authenticated identity
        ↓
Organization membership
        ↓
Shop assignment
        ↓
Availability
        ↓
Permission
        ↓
Data visibility
        ↓
Approval requirement
        ↓
Operational/device constraints
        ↓
Allow / deny
```

A client-supplied shop ID, role label, template name, permission flag, or availability flag is not proof of authorization.

---

## 16. Offline access governance

Offline capability does not create new authority.

When offline, a device may perform only the operations that the product explicitly supports for its locally provisioned context.

Administrative actions that require fresh authorization may need connectivity.

When synchronization resumes, the server must re-evaluate:

- identity/session validity;
- organization membership;
- shop assignment;
- current availability/leave status;
- permission;
- approval requirements;
- device status;
- domain invariants.

A previously valid offline context must not become a permanent bypass after access is revoked or a leave period begins.

---

## 17. Audit requirements

Every sensitive access-control event should be attributable.

At minimum, retain where applicable:

- actor user;
- organization;
- shop;
- affected staff member;
- action;
- previous state;
- new state;
- timestamp;
- device/session context;
- reason/reference;
- approval decision.

Important events include:

- staff invitation;
- invitation acceptance;
- shop assignment;
- permission grant/revoke;
- visibility change;
- approval-authority change;
- leave creation;
- leave cancellation;
- leave start/end;
- suspension;
- removal;
- temporary-access creation/expiry;
- device registration/revocation.

---

## 18. Lifecycle examples

### Example A — Owner hires first worker

```text
Owner creates organization
 ↓
Owner creates shop
 ↓
Owner invites Mary
 ↓
Mary accepts invitation
 ↓
Owner assigns Mary to Shop A
 ↓
Owner chooses Sales template
 ↓
Owner reviews/adjusts permissions
 ↓
Mary becomes active
 ↓
Mary logs in
 ↓
Shop A opens automatically
```

### Example B — Worker receives a second shop

```text
John already works in Shop A
 ↓
Owner assigns John to Shop B
 ↓
John now has two active shops
 ↓
Next login presents Shop A / Shop B selector
 ↓
John chooses the shop he is currently working in
```

### Example C — Worker takes planned leave

```text
John is active in Shop A
 ↓
Owner records leave: 2026-08-24 to 2026-08-26
 ↓
John remains a staff member
 ↓
Operational entry is blocked during the leave window
 ↓
Owner temporarily assigns Mary to cover Shop A
 ↓
Mary operates under her own identity and permissions
 ↓
August 27
 ↓
John's availability returns to active
 ↓
John resumes his existing Shop A access
```

### Example D — Worker is suspended

```text
Owner suspends John
 ↓
New protected operations are denied
 ↓
Historical sales remain intact
 ↓
Owner restores access later
```

### Example E — Worker changes responsibility

```text
Amina
Shop A
Sales permissions
 ↓
Owner changes assignment
 ↓
Shop A + Shop B
 ↓
Sales + Inventory permissions
 ↓
New authorization takes effect
```

### Example F — Sensitive refund

```text
Cashier
 ↓
Requests refund
 ↓
System sees approval required
 ↓
Authorized approver reviews
 ↓
Approved
 ↓
Refund recorded + audit event
```

---

## 19. Non-negotiable rules

1. A staff member cannot grant themselves access.
2. A staff member cannot grant themselves permissions they are not authorized to grant.
3. Shop access is explicit.
4. Permissions are explicit.
5. Data visibility can be narrower than action permissions.
6. Approval authority is separate from ordinary operating permission.
7. One-shop available workers enter directly; multi-shop available workers select the active shop.
8. Owner-level authority is organization-scoped.
9. Access changes do not rewrite historical transactions.
10. Revocation must prevent new protected operations from continuing through synchronization.
11. Temporary access must expire automatically.
12. Planned leave must end automatically according to its configured return time.
13. Leave is not the same as suspension.
14. Staff covering another worker operate under their own identity and permissions.
15. Sensitive access changes are auditable.
16. The backend/database is the authorization boundary.
17. Offline capability must not create new authority.
18. Permission templates are convenience bundles, not security identities.

---

## 20. Relationship to the User Access Model

`docs/user-responsibilities.md` defines the **structure and meaning of DukaFlow access**.

This document defines the **governance and lifecycle of that access**.

When implementing a feature:

- Use `docs/user-responsibilities.md` to determine **what access means**.
- Use this document to determine **who may create, change, approve, suspend, transfer, schedule leave, restore, or revoke that access**.
- Use the technical authentication/security documents to determine **how those rules are enforced in Supabase, PostgreSQL/RLS, the application, and synchronization**.

Any conflicting access-governance rule must be resolved in favor of this document, while the underlying access model remains defined by `docs/user-responsibilities.md`.

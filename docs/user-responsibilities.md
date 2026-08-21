# DukaFlow User Responsibilities & Access Model

**DukaFlow User Access Model — source of truth for merchant identity, organization ownership, shop access, permissions, visibility, approvals, and user responsibility.**

**Platform Administration → Organization → Owner → Staff → Shop assignment(s) → Permissions → Data visibility → Approval authority → Operational context.**

## Platform boundary

DukaFlow has a platform administration layer above the merchant organization layer.

```text
DUKAFLOW PLATFORM
        ↓
DukaFlow Administration / General Manager
        ↓
Organizations
        ↓
Organization Owner
        ↓
Staff
        ↓
Shop assignment(s)
        ↓
Permissions
```

The **DukaFlow Administrator / General Manager** belongs to the platform control plane and is not a merchant user inside an organization.

This document starts at the **merchant organization boundary**. It defines the Organization Owner and Staff model. Platform administration is defined separately in `docs/platform-administration-and-operations-model.md`.

## Purpose

DukaFlow must work for the reality of Kenyan retail: from a one-person kiosk or duka to a staffed mini-market, supermarket, or multi-branch retailer.

The system therefore must **not assume that every shop has a manager, cashier, and inventory operator**. Kenyan businesses vary greatly in size.

DukaFlow should model **people, shop assignments, permissions, approvals, visibility, operational responsibility, and auditability**, rather than forcing businesses into artificial job structures.

## Core model

```text
Merchant user identity
      ↓
Organization
      ↓
Owner or Staff
      ↓
Shop assignment(s)
      ↓
Permissions
      ↓
Data visibility
      ↓
Approval authority
      ↓
Shift / operational responsibility
      ↓
Device / session
      ↓
Audit trail
```

The business workflow remains:

```text
Authentication
    ↓
Organization
    ↓
Shop
    ↓
Products
    ↓
Inventory
    ↓
Sales
    ↓
Payments
    ↓
Customers
    ↓
Insights & Growth
```

## 1. The most important rule: Organization Owner + Staff, not mandatory job roles

Within each merchant organization, DukaFlow has two fundamental merchant user categories:

### Organization Owner

The owner controls the organization and its shops.

### Staff

Staff are people invited by the owner to help operate one or more shops.

A staff member can have one or many permissions. Their permissions determine what they can do.

Terms such as **cashier, manager, stock clerk, salesperson, supervisor, or inventory operator** are useful descriptions of responsibilities, but they should not be mandatory merchant system identities.

For example, a small duka might have:

```text
Organization
└── Owner
      └── Does everything
```

A slightly larger shop might have:

```text
Organization
├── Owner
├── Staff: Amina — selling + payments
└── Staff: Brian — selling + stock receiving
```

A larger shop might have:

```text
Organization
├── Owner
├── Staff: Peter — structured-shop permission template, customized to intent
├── Staff: John — structured-shop permission template, customized to intent
├── Staff: Mary — stock-focused permissions
└── Staff: Asha — custom sales + customers
```

This model lets DukaFlow grow with the business instead of forcing a small shop to behave like a supermarket.

## 2. Organization Owner responsibilities

The Organization Owner has organization-level business authority.

### Organization

The owner:

- Creates the organization through merchant onboarding.
- Maintains organization information.
- Controls organization membership.
- Controls access to the organization's shops.
- Can manage all shops belonging to the organization.
- Can view organization-level summaries where supported.

### Shops

The owner:

- Creates shops under the organization.
- Names and configures each shop.
- Defines shop-specific settings.
- Adds or removes staff access to each shop.
- Assigns workers to one or more shops.
- Can operate across all shops without needing to be assigned like ordinary staff.

### Staff

The owner:

- Invites staff.
- Creates or completes staff profiles.
- Assigns each staff member to one or more shops.
- Grants permissions appropriate to the person's actual responsibilities.
- Can use a permission template for convenience in a structured shop.
- Reviews the suggested permissions from the template and customizes them to fit the person's actual intended responsibilities.
- Can assign permissions directly without using a template.
- Removes shop access when employment or responsibility changes.
- Reviews staff activity where audit information is available.

### Business operations

The owner can manage or oversee:

- Products and prices.
- Opening stock.
- Inventory movements.
- Sales.
- Payments.
- Customers and Deni.
- Suppliers and purchasing where implemented.
- Reports and insights.
- Business configuration.
- Sensitive approvals.
- Merchant payment integrations, including configured M-Pesa relationships, according to the payment-integration model.

### Owner example

A merchant owns three shops:

```text
Organization: Mwangi Retail

Shop A — Mavueni
Shop B — Kilifi
Shop C — Mtwapa
```

The owner may start with direct permissions:

```text
John  → Shop A → Sales + Payments
Mary  → Shop B → Sales + Inventory
Peter → Shop A + Shop B → structured-shop template suggested, then customized
```

The owner does **not** need to select a shop just to manage the organization. The owner has organization-level authority and can work with whichever shop is relevant.

## 3. Staff responsibilities are permission-based

A staff member's job title should not determine security by itself.

DukaFlow should use explicit permissions.

### Sales

- Create sale.
- Add/remove items from a cart.
- Apply permitted discounts.
- Complete sale.
- Issue receipt.
- View permitted sales history.

### Payments

- Accept cash.
- Use/record M-Pesa according to the active shop configuration and granted payment permissions.
- Record other supported payment methods.
- Record Deni when authorized.
- Perform permitted shift reconciliation.

### Inventory

- View stock.
- Receive stock.
- Record stock movements.
- Perform stock counts.
- Record damaged/expired stock.
- Request or perform stock adjustments according to permission.
- View low-stock alerts.

### Products

- View products.
- Create products.
- Edit selling prices where authorized.
- Edit product details.
- Deactivate products.
- Manage product categories.

### Customers

- Find customers.
- Create customers.
- Attach customers to sales.
- Record Deni when authorized.
- View permitted customer history.

### Staff management

Some staff may be explicitly granted delegated staff-administration permissions by the owner. Such a person remains **Staff** and only receives the administrative capabilities explicitly delegated to them.

They may be permitted to:

- View staff.
- Invite staff.
- Assign staff to shops within their authorized scope.
- Change staff permissions within their authorized scope.
- Disable staff access within their authorized scope.

A delegated staff administrator must not be able to promote themselves, change their own permissions, become owner, or grant authority beyond the permissions they have been explicitly authorized to delegate.

These permissions are the actual capability/security layer. A label such as "cashier", "manager", or "administrator" never overrides or replaces the underlying permission checks.

## Operation-level permission model

DukaFlow must define access at the operation level. A visible tab does not automatically grant the ability to change its data.

Each permission is evaluated using four separate capabilities:

| Capability | Meaning |
|---|---|
| **Read** | View permitted records and information. |
| **Write** | Create, edit, complete, receive, record, or otherwise change permitted records. |
| **Request** | Submit a sensitive operation for approval without applying it directly. |
| **Approve** | Approve or reject a requested operation. |
| **Restricted** | Explicitly denied or hidden because the user lacks scope, permission, sensitivity clearance, or approval authority. |

A user may read a record without being able to write it. A user may request an action without being able to approve it. A user may write ordinary records while being restricted from sensitive changes.

### Operation matrix by business area

| Business area | Read examples | Write examples | Request examples | Approve examples | Typical restrictions |
|---|---|---|---|---|---|
| **Products** | View product name, unit, price, and status. | Create product, edit details, manage categories. | Request price change or deactivation if configured. | Approve sensitive price changes or deactivation. | Cost price may be hidden; inactive products cannot be sold. |
| **Inventory** | View shop balances, low-stock status, and movement history. | Receive stock, count stock, record damage, expiry, or permitted adjustment. | Request large adjustment, write-off, or stock transfer. | Approve sensitive adjustment, write-off, or transfer. | Cannot change another shop; cannot erase movements. |
| **Sales** | View permitted sales and receipts. | Create sale, edit an uncompleted cart, complete sale, issue receipt. | Request void, refund, or correction after completion. | Approve configured refund, void, or correction. | Cannot silently edit completed sales or sell inactive products. |
| **Payments** | View permitted payment status, references, and totals. | Record cash, M-Pesa reference, Deni, and permitted reconciliation entries. | Request payment correction or reconciliation adjustment. | Approve financial correction or close a variance. | Daraja credentials are owner/server restricted; users cannot approve their own variance. |
| **Customers** | View permitted customer profile, history, and Deni balance. | Create customer, update permitted details, attach customer to sale, record authorized Deni payment. | Request Deni write-off or sensitive customer correction. | Approve configured write-off or correction. | Private customer data may be restricted from stock-only users. |
| **Reports / Insights** | View reports within assigned shop and sensitivity level. | Usually no direct business-data write; may save filters or notes. | Request report export or sensitive report access if configured. | Approve access to organization-wide or sensitive reports. | No user can edit historical facts through a report. |
| **People / Access** | View staff and invitation status within delegated scope. | Invite, assign shops, edit permissions, suspend access where delegated. | Request access change outside delegated scope. | Approve membership, permission, or shop-access changes. | A staff administrator cannot promote themselves, change their own permissions, or become owner. |
| **Settings** | View permitted shop and organization settings. | Edit allowed profile, business, payment, and operational settings. | Request sensitive setting change. | Approve M-Pesa, reconciliation, policy, or organization-level changes. | M-Pesa secrets, owner transfer, and platform settings are restricted. |

### Permission matrix by user type

The following are starting templates only. The owner may customize the final permission set for each person.

| User type | Read | Write | Request | Approve | Restricted by default |
|---|---|---|---|---|---|
| **Owner** | All organization and assigned-shop data. | All permitted business operations. | All supported sensitive operations. | Organization and configured shop approvals. | Platform administration remains outside merchant-owner access. |
| **Sales attendant** | Products needed for selling, own/assigned-shop sales, receipts, permitted customer data. | Carts, sales, receipts, and permitted customer attachment. | Refund, void, price override, or Deni exceptions. | None by default. | Inventory adjustments, cost prices, payment configuration, reports, staff, settings. |
| **Cashier / payment operator** | Sales totals, payment status, receipts, own shift, permitted Deni. | Cash and payment recording, permitted M-Pesa references, shift entries. | Reconciliation correction, refund, or payment correction. | None by default; never own variance. | M-Pesa credentials, product cost, inventory adjustment, staff, organization settings. |
| **Inventory assistant** | Products, shop stock, low-stock alerts, movement history, supplier delivery information as authorized. | Product creation if granted, receiving, counts, damage/expiry records, permitted adjustments. | Large adjustment, write-off, transfer, or correction. | None by default. | Customer Deni, payment records, financial reports, M-Pesa configuration, staff. |
| **Shop supervisor** | Broad assigned-shop operational data. | Sales, products, inventory, customers, payments, and operational tasks according to grants. | Sensitive operational changes. | Only explicitly assigned approvals. | Organization-wide administration, own-request approval, owner transfer. |
| **Finance / reconciliation user** | Payment records, cash, M-Pesa status, Deni, reconciliation, permitted reports. | Reconciliation entries and permitted payment corrections. | Financial correction, refund, or variance resolution. | Only explicitly assigned financial approvals. | Product and stock changes, staff, M-Pesa credentials unless separately granted. |
| **Staff administrator** | Staff, invitations, assignments, and permissions within delegated scope. | Invite, assign, edit, suspend, or remove staff within delegated scope. | Changes outside delegated scope. | Only if explicitly granted and never for self-escalation. | Owner transfer, own permission changes, platform administration, unrelated business data. |

### Restriction precedence

Restrictions must be evaluated before allowing an operation:

```text
User identity
   ↓
Organization membership active?
   ↓
Shop assigned?
   ↓
Read permission or write permission?
   ↓
Data sensitivity allowed?
   ↓
Request or approval requirement?
   ↓
User allowed to approve this operation?
   ↓
Server authorization and RLS
   ↓
Allow or deny
```

The effective permission is the most restrictive result of organization membership, shop assignment, explicit permission, visibility rules, availability or leave, approval authority, and business policy.

### Non-negotiable operation rules

- Read access does not imply write access.
- Write access does not imply approval authority.
- Request access does not imply approval access.
- A user cannot approve their own sensitive operation unless an explicit policy safely permits it; financial variances, refunds, and high-risk changes should require separation of duties.
- A helper cannot access another shop merely by changing a client-side shop ID.
- A hidden tab is not a security control; every read and write request must be checked server-side and by Supabase RLS.
- Completed sales, payments, and stock movements cannot be silently overwritten.
- Sensitive values such as M-Pesa credentials and supplier costs may have separate visibility permissions.
- Permission changes, approvals, rejections, and denied attempts must be auditable.

## 4. Permission templates are structured-shop configuration accelerators

Permission templates are **optional conveniences for structured shops**. They are not user identities, mandatory setup steps, or authorization boundaries.

They are most useful when a shop has recurring responsibilities and the owner is setting up several people with similar intended capabilities.

### Example template intentions

A structured shop may use starting templates such as:

- Sales / Cashier — common sales and payment permissions.
- Stock / Inventory — common stock receiving and counting permissions.
- Manager / Supervisor — broader operating and oversight permissions.
- Sales Attendant — common customer-facing sales permissions.
- Reconciliation — common cash/payment reconciliation permissions.
- Staff Administration — common staff-management permissions for an explicitly delegated staff administrator.

The template name is only a starting point.

### Intent-first template flow

```text
Owner describes intended responsibility
        ↓
DukaFlow suggests a useful template or permission bundle
        ↓
Owner reviews suggested permissions
        ↓
Owner adds/removes permissions to fit the person's actual intent
        ↓
Shop assignment + explicit permissions become the authorization contract
```

For example:

> "This employee sells, receives deliveries, and records customers, but cannot change prices or issue refunds."

DukaFlow may suggest a Sales/Inventory-style template, but the owner must be able to remove price-change and refund permissions before activation.

Another employee at the same shop may use the same template but receive a different final permission set.

### Critical rules

```text
Template
   ↓
Suggested permission bundle
   ↓
Owner/admin confirms or edits
   ↓
Explicit permissions
   ↓
Shop scope + visibility + approval rules
   ↓
Backend authorization
```

Templates must be:

- optional;
- editable;
- replaceable;
- scoped to the shop assignment where appropriate;
- auditable when applied or changed;
- subordinate to explicit permissions.

The role/template name is **never** the security boundary.

## 5. Shop assignment and scope

Shop assignment and permissions are separate concepts.

A user may be allowed to perform an action but only inside shops to which they have access.

### Normal case: one worker, one shop

This should be the default experience.

```text
John
 ↓
Assigned to Mavueni Shop
 ↓
John logs in
 ↓
DukaFlow opens Mavueni Shop directly
```

There should be **no unnecessary shop selector**.

### Multi-shop case: one worker, multiple shops

If the owner assigns John to two shops:

```text
John
├── Mavueni Shop
└── Kilifi Shop
```

then:

```text
John logs in
 ↓
DukaFlow detects multiple assigned shops
 ↓
Show shop selector
 ↓
John selects active shop
 ↓
John operates inside that shop
```

The selected shop becomes the active operational context for shop-specific actions.

### Owner case

The owner has organization-level access. The owner can manage all shops and does not need an ordinary worker assignment.

### No assignment case

If staff has no active shop assignment:

```text
Login
 ↓
No shop access found
 ↓
Block shop operations
 ↓
Explain that the owner/authorized administrator must assign a shop
```

DukaFlow must never guess a shop or accept a client-supplied shop ID as proof of access.

## 6. Data visibility is separate from action permission

Being allowed to perform an action does not automatically mean a user should see every piece of business data.

DukaFlow should distinguish:

**Can do X**

from:

**Can see Y**

Examples:

- A sales worker can complete a sale but may not see wholesale cost prices.
- A cashier can view today's sales but may not see organization-wide profit reports.
- A stock worker can see inventory quantities but may not see private customer balances unless authorized.
- A manager may see shop-level performance but not another organization's information.

Data visibility should be scoped by organization, shop, permission, and where necessary by sensitivity level.

## 7. Approval authority is separate from ordinary permission

Some actions should be requestable but require approval.

Examples:

- Large stock adjustments.
- High-value refunds.
- Voiding completed sales.
- Changing sensitive prices.
- Stock transfers between shops.
- Changing staff permissions.
- Closing/reopening reconciled shifts.
- Financial corrections.

For example:

```text
Staff
 ↓
Request refund
 ↓
Owner/authorized approver
 ↓
Refund applied
 ↓
Audit event
```

A user may have permission to **request** an action without having permission to **approve** it.

This makes the model suitable for small shops and larger businesses without hard-coding a mandatory manager hierarchy.

## 8. Shift and operational responsibility

In larger or busier shops, DukaFlow should know who is responsible for a shift or operational period.

Examples:

- Which worker opened the till?
- Which worker accepted the cash?
- Who closed the shift?
- Who reconciled the cash?
- Who received the delivery?
- Who performed the physical stock count?

This is different from permanent shop assignment.

A worker may be permanently assigned to Shop A while today's operational responsibility is:

```text
Active shift
 ↓
Till 02
 ↓
Staff: John
```

Shift responsibility should be auditable and should support handover where needed.

## 9. Device and session responsibility

A human identity and a device identity are different.

```text
User
 ↓
Shop assignment
 ↓
Device registration
 ↓
Session
 ↓
Offline operations
```

DukaFlow should track, where supported:

- Active device.
- Device ID.
- Session state.
- Device revocation.
- Operations created by the device.

A device ID must never replace user authentication.

A revoked device must not be able to synchronize new protected operations.

## 10. Offline responsibility

Offline capability must follow permissions, not bypass them.

A worker may be allowed to continue ordinary operational work offline, such as:

- Create supported sales.
- Record supported payment information.
- Access locally provisioned product/shop data.
- Continue the supported shop workflow.

Administrative or high-risk actions may require an online authorization check, such as:

- Adding/removing staff.
- Changing permissions.
- Changing organization settings.
- Certain high-risk refunds or approvals.
- Changing payment-integration configuration or merchant secrets.

When the device reconnects, pending operations must be revalidated against current authorization and domain rules before the server accepts them.

## 11. Staff lifecycle

A staff member's relationship with the organization should have a lifecycle.

```text
Invited
  ↓
Active
  ↓
Suspended / temporarily disabled
  ↓
Transferred or reassigned
  ↓
Removed
```

Changing a worker's shop should normally change their assignment, not create a new person record.

When staff access is removed:

- New protected operations should be blocked.
- Existing business records should remain intact.
- Historical actions should remain attributable to the original user.
- Device/session access should be revoked where required.

## 12. Temporary shop access

DukaFlow should eventually support temporary access without permanently changing a worker's normal assignment.

Example:

```text
John
Permanent shop: Mavueni

Temporary assignment:
Kilifi
Valid: 2026-08-20 to 2026-08-22
```

During the approved period, John can operate in Kilifi according to the permissions granted for that temporary assignment.

After expiry, access ends automatically.

This is useful for staff covering another shop, stocktaking, training, or temporary operational support.

## 13. One-person duka

This is a critical DukaFlow use case.

A one-person business should not be forced to create staff accounts or configure complicated permissions.

Example:

```text
Organization
└── Owner
      └── M-Pesa / cash / stock / customers / sales / management
```

The owner logs in and goes directly to the shop.

The owner can:

- Sell.
- Receive stock.
- Count stock.
- Record expenses or other supported business events.
- Manage customers.
- See cash/payment information.
- View business insights.

DukaFlow should make this the simplest onboarding path.

## 14. Small staffed duka / minimart

As the business grows, the owner adds staff without changing the underlying business model.

Example:

```text
Organization
├── Owner
└── Shop
      ├── Staff A — Sales + Payments
      ├── Staff B — Sales + Customers
      └── Staff C — Inventory
```

Workers can still perform overlapping duties.

For example, one shop assistant may both sell products and help receive stock. This is why permissions should be composable.

## 15. Larger shop / supermarket

A larger operation may need stronger separation of duties.

Example:

```text
Organization
├── Owner
└── Staff with structured-shop permission templates
      ├── Staff with sales-focused template, customized
      ├── Staff with sales-focused template, customized
      ├── Staff with stock-focused template, customized
      ├── Staff with customer/sales permissions
      ├── Staff with reconciliation permissions
      └── Staff with delegated administration permissions
```

At this scale DukaFlow should support:

- Multiple tills.
- Individual staff identities.
- Shifts.
- Cash reconciliation.
- Stock receiving.
- Stock counts.
- Stock variance investigation.
- Approval workflows.
- Refund/void controls.
- Staff activity/audit history.
- Branch-level reporting.
- Organization-level reporting.

The important point remains: these are **permissions and operating responsibilities**, not mandatory merchant user types.

## 16. Why DukaFlow should not copy supermarket roles into every duka

The system must scale **down as well as up**.

Bad design:

```text
Create shop
 ↓
Create manager
 ↓
Create cashier
 ↓
Create inventory operator
 ↓
Assign everyone
```

That creates unnecessary friction for a merchant who runs a small shop alone.

Better design:

```text
Create organization
 ↓
Owner creates shop
 ↓
Owner starts operating immediately
 ↓
Add staff only when needed
 ↓
When the shop becomes structured, use optional templates if useful
 ↓
Customize the template to the person's actual intent
 ↓
Add more structure as the business grows
```

The software should adapt to the business, not force the business to adapt to the software.

### Helping-person setup

When a shop needs another person, the owner adds that person from the settings of the specific shop. This is not part of the initial registration quiz.

```text
Add helping person

Name
[ Enter name ]

Email address — primary login
[ Enter email address ]

Phone number — optional for now
[ Enter phone number ]

What can this person do?

Sell products
[ Yes / No ]

Receive payments
[ Yes / No ]

Manage stock
[ Yes / No ]

[Save person]
```

Email is the primary login identifier for now. Phone number is optional. Each responsibility is an explicit Yes/No decision for the selected shop.

If the owner initially chooses to run the shop alone, the shop starts with people access disabled:

```text
people_access_enabled = false
```

The owner can later open **Shop Settings → People and access**, enable the capability, and add a helper without repeating registration or recreating the organisation:

```text
Shop Settings
   ↓
People and access
   ↓
[Enable people to use this shop]
   ↓
Add helping person
```

The owner can edit the operator setting later from that shop’s settings. They can add, replace, or remove the helping person, update the email or optional phone number, and change each responsibility between **Yes / No**. Returning the shop to owner-operated status must remove or suspend the helper’s shop access according to the organization’s access lifecycle rules. All changes require authorization and an audit event. The capability is controlled separately for each shop.

For a simple operation, assign responsibilities directly to each person. For a structured organization, the owner may create reusable responsibility templates and assign them to individuals with explicit shop scope:

```text
Create responsibility template

Template name
[ Cashier ]

Sell products
[ Yes / No ]

Receive payments
[ Yes / No ]

Manage stock
[ Yes / No ]

[Save template]
```

```text
Person
[ Select person ]

Template
[ Select template ]

Shop access
[ Select shop or shops ]

[Assign template]
```

Templates are convenience bundles, not identity types. The owner can customize, replace, suspend, or remove a person’s assignment later.

### Supabase invitation and access lifecycle

The owner creates the helper’s access from Shop Settings. The helper does not create an organisation or shop. The invitation is a first-class DukaFlow record and is created before or alongside Auth provisioning.

```text
Owner submits helper form
   ↓
Create application invitation: Pending
   ↓
Server validates owner, organisation, shop, and permission scope
   ↓
Existing Auth user?
   ├── Yes → invite existing account; do not create a second Auth user
   └── No  → Supabase Auth invites by email
   ↓
Prepare pending membership, shop assignment, and permission grants
   ↓
Invitation sent
   ↓
Helper accepts and activates the account
   ↓
Membership and assignment become Active
   ↓
Helper logs in and sees only authorized shop features
```

Supabase Auth is responsible for authentication. DukaFlow application records are responsible for invitations, organisation membership, shop assignment, and effective permissions. The service-role key and Auth Admin operation remain server-side; the browser must never receive the service-role key.

The helper’s email is the primary login identifier and phone is optional. Invitation processing must be idempotent so retries do not create duplicate accounts, memberships, assignments, grants, or invitations. Auth provisioning and application-record writes are not treated as one database transaction; processing status, retry, and cleanup metadata must make partial failure recoverable.

Use separate lifecycle states:

| Layer | States |
|---|---|
| Invitation | `pending`, `sent`, `accepted`, `expired`, `cancelled`, `failed` |
| Membership/access | `pending`, `active`, `suspended`, `removed` |
| Processing metadata | Attempt count, last attempt, Auth user ID, and last error |

The invitation should be stored conceptually as `organization_invitations` with organisation, email, inviter, optional Auth user ID, status, expiry, acceptance, cancellation, and failure metadata. Pending or suspended helpers must not receive an active shop session.

The owner-facing Yes/No controls map to canonical permission grants, for example `sales.operate`, `payments.receive`, and `inventory.manage`; they are not ad hoc authorization columns on the shop assignment. Templates bundle canonical grants but do not replace effective user-, shop-, and lifecycle-scoped authorization.

RLS and server-side authorization remain the final enforcement boundary. They must enforce active organisation membership, active shop assignment, and effective permission.

The helper workspace must be assembled from effective permissions. Authorized areas are shown; unauthorized areas are hidden from navigation and denied if the helper reaches them through a direct URL or API request. For example, `sales.operate` may expose Sales, while `inventory.manage` may expose Inventory. Owner-only areas such as Staff / Access, organisation settings, shop creation, and M-Pesa credentials remain unavailable unless separately authorized.

### Owner confirmation and helper activation

After the owner submits the helper form, show a confirmation with the invitation status:

```text
Invitation sent

Amina Hassan has been invited to:
Mwangaza Duka

Email: amina@example.com
Status: Invitation pending

[Done]
```

People and Access must show the invitation lifecycle:

```text
Amina Hassan
amina@example.com
Mwangaza Duka
Status: Invitation pending

[Resend invitation]
[Edit access]
[Cancel invitation]
```

The helper receives an email invitation and activates the account created by the owner:

```text
Accept invitation
   ↓
Confirm email
   ↓
Set password
   ↓
Activate account
   ↓
Membership and shop assignment become Active
   ↓
Log in
```

After activation, the helper opens only the assigned shop workspace:

```text
Welcome, Amina

Mwangaza Duka
Kawangware Market

[Sell]
[Payments]
[Products, if allowed]
[Stock, if allowed]
```

The helper must not see owner onboarding, organisation creation, shop creation, M-Pesa credentials, or owner-only administration.

## 17. What every user should experience after login

### DukaFlow Administrator / General Manager

```text
Authenticate
 ↓
Recognize platform identity
 ↓
Open DukaFlow Administration
 ↓
Work within platform permissions
 ↓
Use controlled support/merchant context only when explicitly authorized
```

### Organization Owner

```text
Authenticate
 ↓
Recognize owner + organization
 ↓
Open organization/business home
 ↓
Manage or enter any authorized shop
```

### Staff assigned to one shop

```text
Authenticate
 ↓
Recognize staff member
 ↓
Find exactly one assigned shop
 ↓
Open that shop directly
 ↓
Show only permitted functions and data
```

### Staff assigned to multiple shops

```text
Authenticate
 ↓
Recognize staff member
 ↓
Find multiple assigned shops
 ↓
Ask which shop they are working in
 ↓
Open selected shop
 ↓
Show only permitted functions and data
```

### Staff with no active shop assignment

```text
Authenticate
 ↓
No shop assignment
 ↓
Do not open a shop
 ↓
Explain what must be fixed
```

### Temporary assignment

```text
Authenticate
 ↓
Permanent + temporary assignments checked
 ↓
Available shops shown
 ↓
Select active shop when multiple are valid
 ↓
Operate under active permissions until access expires
```

## 18. Permissions must be enforced at the backend

Hiding a button is not authorization.

DukaFlow must enforce:

```text
Authenticated user
      ↓
Organization membership / ownership
      ↓
Shop assignment
      ↓
Permission
      ↓
Data visibility
      ↓
Approval authority
      ↓
Operational state
```

The server/database is authoritative.

Platform administration is evaluated separately at the platform control plane and must not be confused with merchant permissions.

## 19. Access changes and auditability

Access changes should be recorded.

Examples:

- Staff invitation.
- Staff acceptance.
- Shop assignment.
- Shop removal.
- Permission grant.
- Permission removal.
- Template application.
- Template customization.
- Visibility changes.
- Approval-authority changes.
- Delegated administrative permission changes.
- Staff suspension.
- Staff removal.
- Temporary assignment creation/expiry.
- Device revocation.

A permission change must not rewrite historical business activity.

## 20. Practical principle

The system should always answer five questions clearly:

```text
Who is this person?
What business are they part of?
Which shop(s) can they access?
What may they do there?
What information / approvals are they allowed to have?
```

And the platform layer must additionally answer:

```text
Is this person a DukaFlow platform administrator or a merchant user?
```

> **DukaFlow Administration operates the platform. The Organization Owner controls the merchant organization. Staff operate assigned business functions through explicit permissions.**

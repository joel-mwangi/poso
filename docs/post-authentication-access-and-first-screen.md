# DukaFlow Post-Authentication Access & First-Screen Model

**This document defines what DukaFlow does immediately after authentication: how it determines the user's current access and what first experience the user receives.**

**Source relationship:** `docs/user-responsibilities.md` defines the User Access Model. `docs/user-lifecycle-and-access-governance.md` defines how that access is administered. This document defines how DukaFlow evaluates the current state at login and routes the user into the correct experience.

## General landing page before authentication

DukaFlow has one general public landing page that every visitor can see before authentication. It is not an operational workspace and must not reveal private merchant data.

```text
DukaFlow
Simple POS for Kenyan shops

Sell offline. Know your stock. Know your cash.
Understand your customers. Grow your business.

[Log in]
[Create owner account]
[Accept invitation]
```

The page may explain DukaFlow, offline-first operation, Cash, M-Pesa, Deni, inventory, multi-shop support, help, and contact options. It must not show shop balances, sales, customer Deni, staff records, M-Pesa credentials, or private reports.

The landing-page routing model is:

```text
General landing page
       ↓
Log in, register, or accept invitation
       ↓
Authenticate
       ↓
Resolve current access state
       ↓
Owner home / owner setup / helper workspace / activation / restricted access
```

The authenticated destination is selected from current server-authoritative state:

| User state | Destination |
|---|---|
| Active owner with organization | Organization home with combined summary and owner actions. |
| New owner without organization | Owner setup checklist and organization/shop bootstrap. |
| Invited helper not activated | Invitation activation and password setup. |
| Active helper with one shop | Assigned shop workspace opens automatically. |
| Active helper with multiple shops | Shop selector showing only assigned shops. |
| Suspended, removed, on leave, or unassigned user | Restricted-access screen with a clear explanation and next action. |

## 1. Purpose

The first screen after authentication must be determined by the user's real current access, not by assumptions, stale client state, hidden UI rules, or job-title labels.

The central question is:

> **After authentication, what is this user currently allowed to do, and what should DukaFlow show them?**

DukaFlow must evaluate the current authorization context before opening an operational workspace.

---

## 2. Runtime access decision

The runtime decision is:

```text
Authenticate
   ↓
Identify user
   ↓
Load current organization membership
   ↓
Determine Owner OR Staff
   ↓
Check account/lifecycle status
   ↓
Check leave / temporary restrictions
   ↓
Resolve active shop assignments
   ↓
Resolve current permissions
   ↓
Resolve data visibility
   ↓
Resolve approval authority
   ↓
Resolve operational context
   ↓
Build authorized workspace
```

Every decision uses current server-authoritative information when connectivity is available.

---

## 3. Step 1 — Authentication

Supabase Auth establishes the authenticated identity.

Authentication answers:

> **Who is this person?**

Authentication does not answer:

- Which organization they can access.
- Which shop they can access.
- What permissions they have.
- Whether they are currently on leave.
- What data they may see.

Those are authorization and lifecycle questions.

---

## New owner setup checklist

For a newly authenticated owner with no organization, show a short checklist before organization and first-shop bootstrap:

1. Do you have more than one shop? **Yes / No**
2. Do you accept M-Pesa? **Yes / No**
3. Do you allow Deni? **Yes / No**
4. Do you buy stock from suppliers? **Yes / No**

If the answer to question 1 is **No**, ask:

5. Do you run the shop alone? **Yes / No**

If the answer is **Yes**, DukaFlow automatically records **Other people use the system: No**. If the answer is **No**, DukaFlow automatically records **Other people use the system: Yes**. Do not ask the duplicate staff-use question.

If the answer to question 1 is **Yes**, continue with multi-shop creation. Do not ask the helping-person question during the initial quiz. That question appears later in the settings for each specific shop after the owner taps **Set up shop**.

The checklist recommends a starting setup, but the owner chooses either **Start with simple setup** or **Use recommended setup**. It must not force staff, multi-shop, Deni, supplier, or advanced configuration. Relevant follow-ups are shown conditionally: M-Pesa Till Number, staff access, additional shops, customer/Deni tracking, or supplier/purchasing tools.

The owner remains an organization **Owner** regardless of the selected setup. Setup complexity is enabled through organization capabilities and can be expanded later.

After the organization is created, the first shop form includes:

```text
Shop name
[ Enter shop name ]

Shop location
[ Enter town, estate, street, or area ]

[Create shop]
```

For additional shops, the same form is used with **Add shop** and **Do this later** options. Location is a simple business identifier and does not require a formal postal address.

After shop creation is complete, show the owner the created shop or shops first. The owner must tap **Set up shop** before entering profile settings.

For one shop:

```text
Your shop is ready

[ Shop photo placeholder ]
Mwangaza Duka
Kawangware Market

[Set up shop]
```

For multiple shops:

```text
Your shops are ready

[ Shop photo ]  Mavueni Shop
                 Mavueni
                 [Set up shop]

[ Shop photo ]  Kilifi Shop
                 Kilifi Town
                 [Set up shop]

[Continue]
```

The shop list confirms what was created. Selecting **Set up shop** opens the settings for that shop. For multiple shops, configure one shop at a time and return to the shop list when finished.

After the owner taps **Set up shop**, enter one **Shop Profile Settings** area. For the selected shop, include:

```text
Who will operate this shop?

[ I will operate it myself ]
[ Someone else will help operate it ]
```

If the owner selects **Someone else will help operate it**, show:

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

Email is the primary login identifier for now. Phone number is optional. This setting belongs to the selected shop and is not part of the initial registration quiz.

If the owner initially chose to operate the shop alone, people access starts disabled. The owner can later open **Shop Settings → People and access**, enable people access, and add a helper without repeating registration or recreating the organisation. This capability is controlled per shop.

The owner can edit this setting later from Shop Settings. They can add, replace, or remove the helping person, update the email or optional phone number, and change each responsibility between **Yes / No**. Changes require authorization and must be recorded in the audit trail.

When a helper is added, the browser sends the form to a server-side function. The function creates a first-class application invitation, validates the owner’s organisation, selected shop, and permissions, then handles the Auth path:

```text
Owner saves helper
   ↓
Application invitation: Pending
   ↓
Existing Auth user?
   ├── Yes → invitation to existing account
   └── No  → Supabase Auth invite by email
   ↓
Pending membership, shop assignment, and permission grants
   ↓
Invitation sent
   ↓
Helper accepts and activates account
   ↓
Membership becomes Active
   ↓
Assigned shop workspace opens
```

The helper does not create an organisation or shop. The service-role key remains server-side. Invitation and membership state are separate, and Auth provisioning plus application-record writes are not treated as one database transaction. Retries must be idempotent. RLS and server-side authorization enforce active membership, shop assignment, and effective permissions.

After the owner saves a helper, show an invitation confirmation:

```text
Invitation sent

Amina Hassan has been invited to this shop.

Email: amina@example.com
Status: Invitation pending

[Done]
```

People and Access must expose pending invitation actions: **Resend invitation**, **Edit access**, and **Cancel invitation**. After the helper accepts the email invitation, confirms the email, and sets a password, route them directly to the assigned shop workspace. The helper does not create an organisation or shop and must not see owner-only onboarding, M-Pesa credentials, or administration.

After this shop-specific responsibility setting, show the remaining profile settings:

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

M-Pesa settings are shown only when selected in onboarding. The owner chooses Till Number or PayBill, enters the payment number, chooses Sandbox or Live, and securely configures Daraja credentials obtained through Safaricom Daraja Live. The owner may choose **Set up later** and continue with cash operations. Customer/Deni, supplier/purchasing, staff, and additional-shop sections remain conditional.

The owner setup experience must be responsive without changing the workflow:

```text
Mobile  → single-column vertical steps
Tablet  → centered flexible form
Desktop → step rail and wider work area
```

Use one primary action per screen, a short step indicator, large touch targets, no horizontal scrolling, and **Set up later** for optional configuration. Advanced credentials and administration remain separate screens.

```text
Shop profile
   ↓
Essential preferences
   ↓
Relevant payment setup
   ↓
First product
   ↓
Opening stock
   ↓
Start selling
```

```text
Authenticate and verify account
   ↓
New owner with no organization
   ↓
Show short setup checklist
   ↓
Owner confirms simple or recommended setup
   ↓
Create organization and first shop
   ↓
Open owner onboarding/workspace
```

## 4. Step 2 — Organization membership

After identity is established, DukaFlow resolves the user's current organization membership.

Expected outcomes:

### One active organization

Continue to authorization evaluation.

### Multiple active organizations

Show an organization selector before shop/workspace selection.

### No active organization

Do not open an operational shop.

The user should receive a clear next action, such as completing merchant setup or waiting for an organization invitation.

A client must never choose an arbitrary organization ID to bypass membership checks.

---

## 5. Step 3 — Owner or Staff

DukaFlow determines whether the authenticated person is:

- **Owner** — organization-level authority.
- **Staff** — access governed by shop assignment and explicit permissions.

Job labels such as Cashier, Manager, Inventory, or Sales Attendant are not used as the primary identity decision.

They may describe permission templates, but the runtime engine evaluates the underlying permissions.

---

## 6. Step 4 — Lifecycle and availability check

Before opening a shop, DukaFlow checks whether the account is currently eligible to operate.

Possible states include:

- Active.
- Invited/not yet activated.
- Suspended.
- Removed.
- On planned leave.
- Temporarily restricted.

### Active

Continue.

### Invited / not activated

Show the account-activation experience rather than the POS workspace.

### Suspended or removed

Block operational access and explain that access must be restored by the appropriate administrator.

### On leave

Do not allow normal operational access during the leave period.

The system should show the scheduled return information where appropriate and preserve the person's account, history, assignments, and permissions for automatic restoration when the leave period ends.

### Temporary restriction

Apply the restriction defined by the governance rules. Do not silently fall back to full access.

---

## 7. Step 5 — Resolve shop access

Shop assignment determines where a staff user may operate.

### Owner

The owner has organization-level authority and is not treated as an ordinary shop-assigned worker.

The owner can manage all shops and may choose the shop they want to operate or inspect.

### Staff with no active shop assignment

```text
Login
 ↓
No active shop
 ↓
No operational workspace
 ↓
Explain that the owner/authorized administrator must assign a shop
```

Never guess a shop.

### Staff with exactly one active shop

```text
Login
 ↓
Exactly one valid shop
 ↓
Open that shop automatically
```

There should be no unnecessary shop selector.

### Staff with multiple active shops

```text
Login
 ↓
Multiple valid shops
 ↓
Show shop selector
 ↓
User selects active shop
 ↓
Open selected shop
```

The selected shop becomes the active operational scope for shop-specific actions.

---

## 8. Step 6 — Resolve current permissions

After shop scope is known, DukaFlow resolves the permissions currently effective for that user in that shop.

Conceptually:

```text
User
 + Organization membership
 + Shop assignment
 + Explicit permissions
 + Temporary permissions
 + Lifecycle status
 = Effective permissions
```

Permission templates are expanded into explicit capabilities. The runtime does not authorize an action merely because a user is labeled "cashier" or "manager."

Examples:

- Can create sales.
- Can record payments.
- Can receive stock.
- Can adjust stock.
- Can change prices.
- Can view reports.
- Can manage staff.
- Can approve refunds.

---

## 9. Step 7 — Resolve data visibility

DukaFlow separately determines what information the user may see.

Examples:

```text
Sales worker
→ Can sell
→ Can see required product prices
→ May not see cost prices
```

```text
Stock worker
→ Can see stock quantities
→ May not see private customer balances
```

```text
Owner
→ Can see organization-level business information according to policy
```

Visibility must be enforced by the backend/database authorization layer and not simply by hiding UI controls.

---

## 10. Step 8 — Resolve approval authority

DukaFlow determines whether the user may approve sensitive actions.

Examples:

- High-value refunds.
- Large stock adjustments.
- Price changes.
- Financial corrections.
- Stock transfers.
- Permission changes.
- Shift reconciliation overrides.

A user may have the ability to request an action without the ability to approve it.

Self-approval must be prevented where policy requires separation of duties.

---

## 11. Step 9 — Resolve operational context

The final runtime context may include:

- Active organization.
- Active shop.
- Active shift.
- Till/device.
- Session.
- Current operational responsibility.
- Offline/online state.

For a normal single-shop worker, most of this should be resolved automatically with minimal interruption.

For a multi-shop worker, the active shop must be selected before shop-specific work begins.

---

## 12. First-screen routing

The first screen should reflect the result of the access decision.

### Case A — New owner with no organization

```text
Authenticate
 ↓
No organization
 ↓
Organization setup
```

The owner is guided to create the organization and first shop.

### Case B — Owner with organization

```text
Authenticate
 ↓
Owner recognized
 ↓
Organization home
```

The owner can then manage or enter the relevant shop.

The owner should see high-level business status without being forced through a worker-style shop selector.

### Case C — Staff with one active shop

```text
Authenticate
 ↓
One shop
 ↓
Open shop workspace directly
```

This is the fastest path.

### Case D — Staff with multiple active shops

```text
Authenticate
 ↓
Multiple shops
 ↓
Shop selector
 ↓
Open selected shop workspace
```

### Case E — Staff on leave

```text
Authenticate
 ↓
Leave is active
 ↓
Leave/access-status screen
```

Normal shop operations are unavailable until the leave period ends or an authorized administrator changes the status.

### Case F — Staff suspended/removed

```text
Authenticate
 ↓
Access denied
 ↓
Explain current account status
```

No operational data should be exposed through the denied state.

### Case G — Staff with no shop assignment

```text
Authenticate
 ↓
No shop assignment
 ↓
Assignment-required screen
```

The worker should be told that the owner/authorized administrator must assign a shop.

---

## 13. The first operational workspace

Once authorization is resolved, the user should arrive at the simplest workspace appropriate for their permissions.

For an ordinary staff member, this should prioritize the work they are actually allowed to perform.

Example:

```text
Shop: Mavueni

[ Sell ]
[ Stock ]
[ Customers ]
[ Sales History ]
```

Only authorized functions should appear as usable actions.

The UI is not the security layer; it is the user experience built from the authorization result.

---

## 14. Owner first workspace

The owner is different from ordinary staff.

The first owner workspace should provide an organization-level view with access to shop operations.

Conceptually:

```text
Organization: Mwangi Retail

Shops
├── Mavueni
├── Kilifi
└── Mtwapa

Business overview
- Today's sales
- Stock alerts
- Payment summary
- Outstanding Deni
- Operational alerts
```

The owner can enter a shop when shop-specific work is required.

This is different from making the owner select a shop immediately after every login.

---

## 15. Staff first workspace

The staff workspace should be permission-driven.

Examples:

### Sales-focused worker

Prioritize:

- Sell.
- Product lookup.
- Customer lookup.
- Payment.
- Receipt.
- Relevant sales history.

### Stock-focused worker

Prioritize:

- Stock levels.
- Receiving.
- Counts.
- Stock movements.
- Low-stock alerts.

### Mixed-responsibility worker

Show the functions represented by their explicit permissions without requiring a job-title choice.

---

## 16. Shop selector rules

The shop selector must appear only when necessary.

### Show selector when

- Staff has multiple valid active shops.
- An owner explicitly chooses to enter a particular shop from the organization view.
- Multiple temporary/permanent assignments are simultaneously valid.

### Do not show selector when

- Staff has exactly one active shop.
- Staff has no shop access.
- The account is suspended/removed/on leave.

The selector must display only shops the user is currently authorized to access.

---

## 17. Leave and return behavior

A planned leave must not destroy access configuration.

Example:

```text
John
Permanent shop: Mavueni
Permissions: Sales + Payments
Leave: 2026-08-24 → 2026-08-26
```

On August 24:

```text
Login
 ↓
Leave active
 ↓
No operational shop access
```

On August 27:

```text
Login
 ↓
Leave ended
 ↓
Mavueni access restored according to current permissions
 ↓
Shop opens automatically
```

If the owner changed John's permissions or shop assignment during leave, the post-leave access uses the **current** authorization, not a stale copy from before leave.

---

## 18. Offline behavior at login

Authentication and authorization must be handled carefully when connectivity is unavailable.

The client may use previously provisioned local state to continue an explicitly supported offline workflow, but local state is not permanent authorization.

At the next successful connection, DukaFlow must revalidate:

- user identity/session;
- organization membership;
- shop assignment;
- permissions;
- leave/suspension status;
- device status;
- pending operation authorization.

If access has been revoked while the device was offline, synchronization must not allow newly unauthorized protected operations to be accepted merely because they were created locally.

---

## 19. Context must be visible to the user

The active context should be clear without becoming noisy.

At minimum, a staff user should be able to see:

```text
Current shop: Mavueni
User: John
```

Where relevant, also show:

```text
Shift: Till 02
Connection: Offline
Sync: 3 pending
```

This helps prevent staff from accidentally operating in the wrong shop or misunderstanding offline state.

---

## 20. Navigation after the first screen

The first screen is an access result, not the final product dashboard specification.

After entering the authorized workspace, DukaFlow may provide navigation such as:

```text
Home
Sell
Products
Stock
Customers
Sales
Payments
Reports
Settings
```

Only authorized sections should be actionable.

The exact navigation and dashboard content should be defined in the future product/workspace specification, not here.

---

## 21. Non-negotiable rules

1. Authentication identifies the user; it does not grant business access by itself.
2. Organization membership must be resolved before business data is exposed.
3. Owner and Staff are fundamental human categories.
4. Shop assignment determines operational scope for Staff.
5. One active shop → open automatically.
6. Multiple active shops → ask for shop selection.
7. No active shop → deny shop operations.
8. Leave, suspension, and removal must be checked before opening the workspace.
9. Effective permissions are resolved from current authorization state, not job-title labels.
10. Data visibility is evaluated separately from action permissions.
11. Approval authority is evaluated separately from ordinary permissions.
12. The owner is not forced through a worker-style shop selector.
13. A client-supplied organization/shop/role/permission value is never proof of authorization.
14. Offline state may support approved operations but cannot create new authority.
15. Revoked access must be revalidated at the server/synchronization boundary.
16. The active shop and important operational context must be visible to the user.

---

## 22. Relationship to the other access documents

### `docs/user-responsibilities.md`

Defines:

> **What the User Access Model is.**

### `docs/user-lifecycle-and-access-governance.md`

Defines:

> **Who may create, change, approve, suspend, transfer, and revoke access.**

### This document

Defines:

> **How DukaFlow evaluates current access after authentication and what first experience it provides.**

### Technical authentication/security documentation

Defines:

> **How those decisions are enforced through Supabase Auth, PostgreSQL/RLS, application authorization, local state, and synchronization.**

These documents must remain complementary rather than becoming competing definitions of the same rule.

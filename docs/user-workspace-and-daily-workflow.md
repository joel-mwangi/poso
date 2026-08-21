# DukaFlow User Workspace & Daily Workflow

**This document defines what an authorized user can do after entering DukaFlow, which workspace they see, how they navigate the shop, and how their daily work flows from one action to the next.**

**Source relationship:** `docs/user-responsibilities.md` defines the User Access Model. `docs/user-lifecycle-and-access-governance.md` defines how that access is administered. `docs/post-authentication-access-and-first-screen.md` defines how the current access state is evaluated after login. This document defines the authenticated workspace and daily operating experience that follows.

## 1. Purpose

DukaFlow should make the user's next useful action obvious.

The workspace must reflect the user's current organization, shop, permissions, data visibility, approval authority, availability, and operational context.

The interface must not expose actions that the user cannot perform, but hiding a control is never a substitute for backend authorization.

---

## 2. Core principle

DukaFlow should answer this question immediately:

> **"What do I need to do now to run this shop?"**

For ordinary retail work, the system should prioritize the most frequent actions and keep administrative complexity out of the way.

```text
Authorized context
      ↓
Workspace
      ↓
Relevant next action
      ↓
Business operation
      ↓
Business record updated
      ↓
Shop becomes easier to understand
```

---

## 3. Workspace is context-driven

The workspace is assembled from current authorization, not from a fixed role dashboard.

```text
Identity
  ↓
Organization
  ↓
Active shop
  ↓
Permissions
  ↓
Visibility
  ↓
Approval authority
  ↓
Availability / leave
  ↓
Shift / device context
  ↓
Workspace
```

A user may therefore see a different workspace even when two users belong to the same shop.

Example:

- A sales-focused worker sees selling and customer actions prominently.
- A stock-focused worker sees stock receiving, counts, and low-stock work prominently.
- An owner sees organization/shop management and business performance.
- A worker on leave should not receive an operational workspace for the leave period.

---

## 4. Owner workspace

The owner has organization-level authority.

The owner should enter an **organization/business home** rather than being forced into a worker-style shop screen.

### Owner home should provide

- Organization identity.
- Shop list.
- High-level business summary where available.
- Alerts requiring attention.
- Quick access to a selected shop.
- Staff/access management.
- Products and inventory management.
- Sales and payment visibility.
- Customer/Deni visibility.
- Reports and insights.
- Business configuration.
- Shop profile settings, including photo, name, location, business preferences, and enabled payment capabilities.

### Owner shop settings

After shop creation is complete, show the owner the created shop or shops first. The owner must tap **Set up shop** before entering profile settings.

For one shop:

```text
Your shop is ready

[ Shop photo placeholder ]
Mwangaza Duka
Kawangware Market

[Set up shop]
```

For multiple shops, show a shop list with each shop's photo, name, location, and **Set up shop** action. The owner configures one selected shop at a time and returns to the list when finished.

After the owner taps **Set up shop**, the owner can open one settings area:

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

M-Pesa settings are shown only when relevant. The owner chooses Till Number or PayBill, enters the payment number, chooses Sandbox or Live, and configures Daraja credentials obtained through Safaricom Daraja Live. Sensitive credentials remain in the protected server-side secret boundary. Staff do not manage these credentials during checkout.

Customer/Deni, supplier/purchasing, staff, and additional-shop settings appear according to the organization's enabled capabilities.

### Responsive owner setup

The owner setup flow keeps the same sequence on every screen size:

```text
Mobile  → single-column vertical steps
Tablet  → centered flexible form
Desktop → step rail and wider work area
```

The layout must not introduce different questions or business rules. Use one primary action per screen, a short step indicator, large touch targets, no horizontal scrolling, and **Set up later** for optional configuration. Advanced M-Pesa credentials, staff permissions, supplier controls, and reconciliation should open as separate settings screens.

The detailed setup presentation is:

```text
Mobile
Set up your shop                         1 of 3
[ Shop photo ]
Shop name       [ Mwangaza Duka ]
Shop location   [ Kawangware Market ]
[Continue]

Payments                                2 of 3
[ Cash ]  [ M-Pesa ]  [ Deni / Pay later ]
[Continue]

M-Pesa setup                            3 of 3
M-Pesa Till Number [ Enter number ]
[Set up later] [Continue]
```

On desktop, use the same steps with a setup rail on the left and the current form on the right. On tablets, use a centered form with two columns only where helpful. If the screen becomes narrow, stack the columns automatically. No layout should require zooming or horizontal scrolling.

### Owner shop entry

When the owner chooses a shop, that shop becomes the active operational context for shop-specific work.

The owner may move between shops without changing ownership or creating worker-style assignments.

---

## 5. Staff workspace

A staff workspace is always constrained by:

- current shop assignment;
- permissions;
- data visibility;
- approval authority;
- current availability;
- operational context.

### One-shop worker

```text
Login
  ↓
One valid assigned shop
  ↓
Shop opens automatically
  ↓
Workspace loads
```

No unnecessary shop selector should appear.

### Multi-shop worker

```text
Login
  ↓
Multiple valid assigned shops
  ↓
Select active shop
  ↓
Workspace loads for that shop
```

Changing the active shop must re-evaluate shop-scoped permissions and visibility.

---

## 6. Workspace structure

The exact visual design can evolve, but the information architecture should remain stable.

Recommended top-level areas:

```text
Home
Sales
Products
Inventory
Customers
Payments
Tasks / Approvals
Reports / Insights
Staff / Access (authorized users only)
Settings (authorized users only)
```

Not every user sees every area.

Areas appear only when the user has relevant access, while the backend remains the final authority.

### Responsive navigation and tab behavior

The complete workspace areas are:

```text
Home
Sales
Products
Inventory
Customers
Payments
Tasks / Approvals
Reports / Insights
Staff / Access
Settings
```

On mobile, the bottom navigation shows only the most frequent actions:

```text
[Home] [Sell] [Stock] [More]
```

**Stock** opens Inventory. **More** contains Products, Customers, Payments, Tasks / Approvals, Reports / Insights, Staff / Access, and Settings according to the user’s permissions.

On desktop, DukaFlow may display the full sidebar. Tablet layouts may use a compact sidebar, top navigation, or an overflow menu. The business questions, labels, permissions, and workflows must remain the same at every screen size. Narrow screens must stack content and must not require horizontal scrolling.

Products and Inventory are separate areas:

```text
Products
= What the item is

Inventory
= How many of that item each shop has
```

Products manages name, category, base unit, prices, SKU/barcode, photo, and active status. Inventory manages shop-specific quantities, receiving, counts, adjustments, transfers, low-stock status, and movement history.

The owner normally has access to all areas. A helper sees only the areas allowed by active shop assignment, effective permissions, visibility, availability, and approval authority. Hidden navigation is not a security boundary; backend authorization and Supabase RLS must enforce every restriction.

The first MVP prioritizes Home, Sales, Products, Inventory, Customers, Payments, and Settings. Tasks / Approvals, Reports / Insights, Staff / Access, and advanced organization controls appear progressively as the business requires them.

### Operation-level access in the workspace

A visible tab does not automatically grant permission to change its data. Each area evaluates separate capabilities:

| Capability | Meaning |
|---|---|
| **Read** | View records permitted by shop scope and data visibility. |
| **Write** | Create or change records permitted by the user’s assigned operations. |
| **Request** | Submit a sensitive action for review without applying it directly. |
| **Approve** | Approve or reject a requested action. |
| **Restricted** | Denied or hidden because scope, permission, sensitivity, availability, or approval authority is insufficient. |

Examples:

```text
Sales helper
  Read: products, permitted customers, own-shop sales
  Write: carts, sales, receipts
  Request: refund or void
  Approve: none by default
  Restricted: inventory adjustments, cost prices, M-Pesa settings, staff access

Inventory helper
  Read: products, shop stock, movement history
  Write: receiving, counts, damage and permitted adjustments
  Request: large adjustment or transfer
  Approve: none by default
  Restricted: payments, Deni, financial reports, staff access

Cashier
  Read: payment status, receipts, shift totals
  Write: cash and permitted M-Pesa records
  Request: reconciliation correction
  Approve: none by default
  Restricted: M-Pesa credentials, stock changes, staff access
```

Read access does not imply write access. Write access does not imply approval authority. A user must not approve their own sensitive operation when separation of duties is required. Completed sales, payments, and stock movements cannot be silently overwritten. Every operation is enforced by server authorization and Supabase RLS, not only by hiding a tab.

### Permission-based helper navigation

After login, DukaFlow resolves the helper’s active organisation membership, shop assignment, effective permissions, visibility, and availability before assembling the workspace:

```text
Helper login
   ↓
Active membership
   ↓
Assigned shop(s)
   ↓
Effective permissions
   ↓
Show authorized areas
   ↓
Hide unauthorized areas
   ↓
Enforce every action with server authorization and RLS
```

For example, a helper with `sales.operate` and `payments.receive` may see **Home**, **Sales**, and **Payments**, but should not see Inventory management, Staff / Access, M-Pesa credentials, Shop creation, or owner reports. A helper with `inventory.manage` may see Products and Inventory according to that grant.

Hidden navigation is not a security boundary. A direct URL or API request to a hidden area must also be denied by application authorization and Supabase RLS.

---

## 7. Home / Today

The Home screen should summarize what matters for the user's current responsibility.

For an ordinary shop this can include:

- today's sales;
- payment mix;
- low-stock alerts;
- pending approvals;
- pending stock work;
- Deni attention items;
- shift status;
- sync/offline status;
- important warnings.

The screen should not become a wall of analytics.

The first priority is operational clarity.

### Example owner view

```text
TODAY
Sales        KSh 18,450
Cash         KSh  7,200
M-Pesa       KSh 10,850
Deni         KSh    400

Attention
- 6 products low in stock
- 1 refund awaiting approval
- Shop B reconciliation incomplete
```

### Example sales worker view

```text
TODAY
Sales        KSh 4,850
Transactions 31

Quick actions
[ New Sale ]
[ Customers ]
[ My Shift ]
```

---

## 8. Owner Homepage Priority and Responsive Layout

The owner homepage is the daily business command centre. It must answer **Is anything urgent, and what should I do next?** before presenting broader business history.

The priority order is:

1. **Needs attention now** — low stock, pending or failed M-Pesa, cash variance, Deni follow-up, synchronization problems, and approvals.
2. **Know your cash** — sales, cash received, confirmed M-Pesa, pending M-Pesa, and outstanding Deni shown separately.
3. **Know your stock** — low-stock products, fast-moving products, and restocking work.
4. **Understand your customers** — outstanding Deni, returning customers, and useful customer activity.
5. **Grow your business** — explainable recommendations based on sufficient business history.

### Single-shop owner view

```text
DukaFlow
Welcome back, Mary
Mwangaza Duka · Kawangware Market
[Switch shop]                         Sync: OK

NEEDS ATTENTION
⚠ 6 products are low
⚠ 1 M-Pesa payment pending
⚠ Deni needs follow-up
[View attention]

TODAY'S MONEY
Sales          KSh 18,450
Cash received  KSh  7,200
M-Pesa         KSh 10,850
Deni           KSh    400
[View money]

QUICK ACTIONS
[New sale] [Products]
[Stock]    [Customers]

STOCK
6 products low in stock · Cooking oil moving quickly
[View stock]

CUSTOMERS
3 Deni balances outstanding · 12 returning customers
[View customers]

BUSINESS DECISIONS
Restock cooking oil · Follow up outstanding Deni
[View insights]

[Home] [Sell] [Stock] [More]
```

### Multi-shop owner view

A multi-shop owner first sees the combined organization summary. The owner can open a shop to inspect its details. Every total must be traceable to a shop and the business records behind it.

```text
ALL SHOPS — TODAY                              Sync: OK

NEEDS ATTENTION
8 low-stock products · 2 pending M-Pesa · 3 Deni follow-ups

COMBINED MONEY
Sales: KSh 31,250   Cash: KSh 13,900
M-Pesa: KSh 16,750  Deni: KSh 600

SHOP BREAKDOWN
Mavueni Shop   KSh 18,450 sales   6 low-stock   [Open shop]
Kilifi Shop    KSh 12,800 sales   2 pending     [Open shop]

BUSINESS DECISIONS
Restock cooking oil at Mavueni
Review pending M-Pesa at Kilifi
```

The combined view must not hide shop differences. A total, alert, or recommendation must support drill-down to the relevant shop, product, sale, payment, customer, or stock history.

### Responsive behavior

Mobile uses one vertical flow with large touch targets and the priority order above. Tablet uses a centered flexible layout and may use two columns where helpful. Desktop may use a sidebar, wider cards, and a shop breakdown beside the combined summary. The content sequence, labels, business rules, permissions, and available actions remain the same at every size. Narrow screens must stack content automatically and never require horizontal scrolling or zooming.

The homepage must not invent insights when there is insufficient history. It should explain the limitation:

```text
Not enough sales history yet to identify fast-moving products.
Continue recording sales to receive better recommendations.
```

## 9. Sales workflow

Selling is the highest-frequency operational workflow and should be optimized for a phone.

```text
Open Sales
  ↓
Find product
  ↓
Add quantity
  ↓
Review cart
  ↓
Optional customer
  ↓
Choose payment
  ↓
Confirm sale
  ↓
Receipt
```

Supported payment flows can include:

- Cash.
- M-Pesa.
- Deni when authorized.
- Other supported methods as implemented.

A completed sale should drive the appropriate downstream business records according to the transaction model.

The cashier/sales worker should not manually edit inventory after every completed sale.

---

## 9. Inventory workflow

Inventory work should separate normal selling from stock control.

### Normal sale

```text
Sale completed
  ↓
Inventory movement generated
  ↓
Stock balance updates
```

### Receiving stock

```text
Inventory
  ↓
Receive stock
  ↓
Select supplier/source where supported
  ↓
Enter quantities
  ↓
Confirm
  ↓
Inventory movement recorded
```

### Stock count

```text
Inventory
  ↓
Start count
  ↓
Count physical stock
  ↓
Compare with expected quantity
  ↓
Variance identified
  ↓
Reason / approval if required
  ↓
Adjustment recorded
```

Stock adjustments must preserve history and should not silently overwrite the prior balance.

---

## 10. Customer workflow

Customer management should remain lightweight.

The worker should be able to find or create a customer during the normal sales process without leaving the transaction unnecessarily.

Typical flow:

```text
Sale
  ↓
Customer optional
  ↓
Find existing OR create
  ↓
Complete transaction
  ↓
Customer history updated
```

Deni actions should require the relevant permissions and should remain auditable.

---

## 11. Payment workflow

Payment handling should distinguish normal collection from reconciliation.

### Normal payment

```text
Sale
  ↓
Payment method
  ↓
Payment details
  ↓
Confirm
```

### Reconciliation

Authorized users may review:

- expected cash;
- recorded M-Pesa payments;
- exceptions;
- unmatched payments;
- shift differences;
- approved corrections.

Historical payment records should not be silently edited.

---

## 12. Tasks and approvals

The workspace should surface work that requires the current user.

Examples:

- Refund awaiting approval.
- Stock adjustment awaiting approval.
- Price change awaiting approval.
- Stock transfer awaiting approval.
- Reconciliation difference requiring review.

A user who can only request an action should see its status and outcome, but should not see an approval control unless they have approval authority.

---

## 13. Staff and access management

Only authorized users should see staff/access administration.

Typical owner flow:

```text
Staff
  ↓
Invite worker
  ↓
Worker accepts
  ↓
Assign shop(s)
  ↓
Choose permission template
  ↓
Review / customize permissions
  ↓
Define visibility / approval authority where needed
  ↓
Activate
```

A staff administrator may perform a smaller subset only when explicitly authorized.

Users must not see controls that imply they can grant themselves access.

---

## 14. Staff leave and availability

A staff member can be scheduled as unavailable without deleting their account or permanently changing their permissions.

Example:

```text
John
Permanent shop: Shop A
Permissions: Sales + Payments

Leave:
24 Aug → 26 Aug
```

During leave:

- John remains an existing staff member.
- His historical activity remains unchanged.
- His normal permissions remain defined.
- Operational access is blocked for the leave interval unless an explicit exception is authorized.
- Another worker may be given temporary coverage access.
- Access returns automatically after the leave period ends.

The workspace should reflect leave state clearly rather than presenting a misleading operational dashboard.

---

## 15. Shift workflow

Where shifts are enabled, the workspace should make operational responsibility explicit.

```text
Open shift
  ↓
Operate
  ↓
Monitor shift state
  ↓
Handover if needed
  ↓
Close shift
  ↓
Reconcile
```

A shift may record:

- staff member;
- shop;
- till/device where applicable;
- start time;
- end time;
- cash expected;
- cash counted;
- reconciliation outcome.

Shift functionality should only be presented when relevant to the user's permissions and shop setup.

---

## 16. Offline workspace

DukaFlow is designed to continue ordinary operational work when connectivity is unavailable.

The workspace should clearly communicate:

- online/offline state;
- pending synchronization;
- failed operations requiring attention;
- last successful synchronization where useful.

Offline mode must not create new permissions.

The client can use locally provisioned data only within the supported operational scope.

When reconnecting:

```text
Reconnect
  ↓
Authenticate / refresh session
  ↓
Revalidate membership
  ↓
Revalidate shop assignment
  ↓
Revalidate permissions
  ↓
Revalidate approvals / device state
  ↓
Synchronize allowed operations
```

---

## 17. Navigation rules

### Rule 1 — Do not navigate users into dead ends

If a user cannot perform or access a feature, the normal workspace should not present it as an available action.

### Rule 2 — Do not rely on hidden UI for authorization

A hidden button does not protect an operation.

### Rule 3 — Preserve operational context

If the user is operating in Shop A, navigating between sales, inventory, customers, and payments should retain Shop A as the active context unless the user intentionally switches shops.

### Rule 4 — Make shop changes explicit

Switching active shops should be visible and should trigger re-evaluation of shop-specific access.

### Rule 5 — Keep frequent actions close

Sales, product search, customer lookup, payment completion, and stock visibility should require minimal navigation on mobile.

---

## 18. Owner versus staff workspace

The distinction is not that one user has a dashboard and the other does not.

The difference is authority and context.

| Area | Owner | Staff |
|---|---|---|
| Organization management | Yes | Only if explicitly permitted |
| Shop management | Yes | Only if explicitly permitted |
| Shop switching | Any organization shop | Assigned shops only |
| Sales | Yes | Permission-based |
| Payments | Yes | Permission-based |
| Inventory | Yes | Permission-based |
| Customers | Yes | Permission-based |
| Reports | Organization/shop scope | Permission + visibility |
| Staff access management | Yes | Only if delegated |
| Approvals | Owner/delegated | Only if granted |
| Settings | Yes | Only if delegated |

The authorization engine, not the label, determines actual access.

---

## 19. First-screen expectations

The first screen should be useful immediately.

### Owner with organization and one shop

```text
Login
 ↓
Organization Home
 ↓
See shop + key business state
 ↓
Enter shop or manage organization
```

### Owner with multiple shops

```text
Login
 ↓
Organization Home
 ↓
See all shops / organization summary
 ↓
Choose a shop when shop-specific work is needed
```

### Staff with one shop

```text
Login
 ↓
Shop opens automatically
 ↓
Today / operational workspace
```

### Staff with multiple shops

```text
Login
 ↓
Shop selector
 ↓
Today / operational workspace for selected shop
```

### Staff on leave

```text
Login
 ↓
Leave state detected
 ↓
No normal operational workspace
 ↓
Show leave information / appropriate non-operational account area
```

### Suspended staff

```text
Login
 ↓
Suspension detected
 ↓
Protected operations blocked
 ↓
Explain access is currently unavailable
```

---

## 20. Error and exception states

The workspace must handle authorization changes gracefully.

Examples:

### Shop access removed while user is active

```text
Current session
 ↓
Shop access revoked
 ↓
Current operation safely completes or is denied according to transaction state
 ↓
Workspace refreshes authorization
 ↓
User is removed from that shop context
```

### Permission removed

The user should lose the affected capability without gaining a workaround through another UI route.

### Leave begins while user is active

The application should prevent new protected operations after the leave boundary is reached and refresh the workspace state.

### Device revoked

New synchronization from that device must be denied.

---

## 21. Design for Kenyan retail reality

The workspace should remain useful for businesses that:

- primarily use Android phones;
- may not have barcode scanners;
- may use cash and M-Pesa heavily;
- may operate with intermittent internet;
- may be owner-operated;
- may have only one or two workers;
- may grow into several shops later.

The workspace must therefore support fast search and selection instead of requiring hardware.

The product should not require the merchant to behave like a supermarket administrator before the first sale.

---

## 22. Daily workflow summary

### Owner

```text
Login
 ↓
Organization Home
 ↓
Check what needs attention
 ↓
Enter selected shop when necessary
 ↓
Review sales / stock / cash / customers
 ↓
Manage staff or approvals when required
 ↓
Make business decisions
```

### Sales-focused staff

```text
Login
 ↓
Shop opens
 ↓
Start sale
 ↓
Find products
 ↓
Payment
 ↓
Receipt
 ↓
Next sale
```

### Stock-focused staff

```text
Login
 ↓
Shop opens
 ↓
Check stock
 ↓
Receive / count / reconcile
 ↓
Resolve approved variances
 ↓
Continue operations
```

### Multi-purpose staff

```text
Login
 ↓
Shop opens
 ↓
Choose next useful task
 ↓
Sales / Customers / Stock / Payments
 ↓
Continue operations
```

---

## 23. Reference daily operating loop

The workspace should support the merchant's complete daily operating rhythm without turning every step into an administrative workflow:

```text
OPEN SHOP
  ↓
Review opening position
  ↓
Check fast-moving / low-stock items
  ↓
Receive supplier stock when applicable
  ↓
Record received stock
  ↓
CUSTOMER SALE
  ↓
Select products
  ↓
Calculate total
  ↓
Choose settlement: Pay Now / Take Pay Later (Deni)
  ↓
Commit sale
  ↓
Create inventory movements
  ↓
Issue/display receipt
  ↓
Next customer
  ↓
END OF DAY
  ↓
Review sales, cash, mobile money and Deni
```

A completed sale should create the required business records according to the sales/settlement and domain models. Offline operation should use the local database and outbox, then synchronize safely after connectivity returns.

### Offline operating loop

```text
POS
 ↓
Local database
 ↓
Local transaction
 ↓
Outbox event
 ↓
Network restored
 ↓
Batch synchronization
 ↓
Server acknowledgement
```

The user should see simple synchronization state, retries, and unresolved errors without needing to understand distributed-systems mechanics.

### End-of-day visibility

The first useful daily summary should make these distinctions visible:

- total sales value;
- cash received;
- mobile-money received;
- Deni created;
- Deni repayments;
- key stock changes;
- synchronization state.

Advanced accounting and analytics should not displace the core operating workflow.

---

## 24. Source-of-truth boundaries

This document must not redefine access rules.

Use:

- `docs/user-responsibilities.md` for **what access means**.
- `docs/user-lifecycle-and-access-governance.md` for **who administers access and how access changes over time**.
- `docs/post-authentication-access-and-first-screen.md` for **how the application determines the current post-login state**.
- This document for **what the authorized user sees and does after entering the workspace**.
- Technical authentication/security documentation for **how the backend enforces those decisions**.

A workspace feature must not invent its own user, shop, permission, visibility, approval, or lifecycle rules.

---

## 25. Implementation completion rule

A workspace feature is not considered complete merely because the screen renders.

It must be verified for:

- correct user context;
- correct organization scope;
- correct shop scope;
- correct permissions;
- correct data visibility;
- correct approval behavior;
- leave/suspension behavior where applicable;
- offline behavior;
- synchronization behavior;
- mobile usability;
- backend authorization;
- auditability for sensitive actions;
- automated tests.

The desired result is simple:

> **After login, DukaFlow should show the user exactly what they are allowed to do, exactly where they are allowed to do it, and make the next useful shop action obvious.**


## Helper first login and assigned-shop workspace

After accepting the owner’s invitation, the helper confirms the email, sets a password, and activates the account created by the owner. The helper does not create an organisation or shop.

```text
Helper accepts invitation
   ↓
Confirms email and sets password
   ↓
Account becomes active
   ↓
Logs in with email and password
   ↓
One assigned shop → open automatically
Several assigned shops → show authorized shop selector
   ↓
Open helper workspace
```

The helper sees only actions allowed by effective permissions:

```text
Welcome, Amina

Mwangaza Duka
Kawangware Market

[Sell]
[Payments]
[Products, if allowed]
[Stock, if allowed]
```

The helper must not see owner onboarding, organisation creation, shop creation, M-Pesa credentials, staff management, or owner-only administration. The owner manages invitations, shop assignments, permissions, suspension, removal, and audit history from **People and Access**.

Navigation and access are enforced by server-side authorization and RLS, not only by hiding menu items.

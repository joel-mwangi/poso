# DukaFlow Product Experience Model

**This document is the source of truth for how DukaFlow turns the authorized user context and trusted business domains into one simple, mobile-first product experience.**

**Source relationships:**

- `docs/user-responsibilities.md` defines the User Access Model.
- `docs/user-lifecycle-and-access-governance.md` defines how access is administered over time.
- `docs/post-authentication-access-and-first-screen.md` defines how the current access state is resolved after authentication.
- `docs/user-workspace-and-daily-workflow.md` defines the authenticated workspace and daily operating flows.
- `docs/inventory-and-stock-model.md` defines stock facts and inventory behavior.
- `docs/sales-and-settlement-model.md` defines sales, Pay Now, Pay Later/Deni, and settlement behavior.
- `docs/cash-and-financial-reconciliation-model.md` defines actual money movement and reconciliation.
- `docs/customer-and-crm-model.md` defines customer relationship information.
- `docs/purchasing-and-suppliers-model.md` defines purchasing, suppliers, receiving, and supplier balances.
- `docs/business-insights-and-growth-model.md` defines derived insights and recommendations.

## 1. Core principle

DukaFlow should not make a small shop owner learn an enterprise system before they can sell a packet of unga.

The product should answer one question at a time:

> **What is the most useful thing this user needs to see or do right now?**

The experience should be:

```text
Authorized context
      ↓
Relevant information
      ↓
Most useful next action
      ↓
Business operation
      ↓
Trusted business record
      ↓
Useful feedback / next action
```

The product should progressively expose more capability as the shop becomes more complex.

## General landing page and first entry

DukaFlow must provide one general public landing page before authentication. It is the common entry point for owners, helpers, invited staff, and returning users.

```text
DukaFlow
Simple POS for Kenyan shops

Sell offline. Know your stock. Know your cash.
Understand your customers. Grow your business.

[Log in]
[Create owner account]
[Accept invitation]
```

The public page may explain offline-first selling, Cash, M-Pesa, Deni, inventory, multi-shop support, general help, and contact information. It must never expose private organization, shop, customer, sales, staff, payment, or report data.

After authentication, DukaFlow resolves the user’s current state before selecting the next landing experience:

```text
General public landing page
       ↓
Authenticate
       ↓
Resolve identity, membership, lifecycle, shop, permissions, visibility, and approval authority
       ↓
Select destination
```

Possible destinations are:

| Destination | Condition | First purpose |
|---|---|---|
| **Owner organization home** | Active owner with an organization | Combined summary, urgent attention, cash, stock, customers, and growth decisions. |
| **Owner setup** | New owner without an organization or shop | Yes/No setup checklist, organization creation, shop creation, and setup. |
| **Helper activation** | Invited helper who has not activated the account | Confirm email and set password for the owner-created account. |
| **Helper shop workspace** | Active helper with one assigned shop | Open the assigned shop with permitted operations. |
| **Helper shop selector** | Active helper with multiple assigned shops | Show only assigned shops before entering a workspace. |
| **Restricted-access screen** | Suspended, removed, on leave, or without active shop assignment | Explain why operations are unavailable and what action is required. |

## 2. Owner setup checklist

After account registration and verification, and before organization/shop bootstrap, show a short ticking checklist:

1. Do you have more than one shop? **Yes / No**
2. Do you accept M-Pesa? **Yes / No**
3. Do you allow Deni? **Yes / No**
4. Do you buy stock from suppliers? **Yes / No**

If the answer to question 1 is **No**, ask:

5. Do you run the shop alone? **Yes / No**

If the answer is **Yes**, DukaFlow automatically records **Other people use the system: No**. If the answer is **No**, DukaFlow automatically records **Other people use the system: Yes**. Do not ask the duplicate staff-use question.

If the answer to question 1 is **Yes**, continue with multi-shop creation. Do not ask the helping-person question during the initial quiz. That question appears later in the settings for each specific shop after the owner taps **Set up shop**.

Use the answers to recommend a starting setup. The owner can choose **Start with simple setup** or **Use recommended setup**. Show only relevant follow-ups, such as M-Pesa Till Number configuration, staff access, additional shops, customer/Deni tracking, or supplier tools. The checklist should reduce typing and setup friction, not create a complex registration form.

After organization creation, the first shop form should ask for:

```text
Shop name
[ Enter shop name ]

Shop location
[ Enter town, estate, street, or area ]

[Create shop]
```

For additional shops, use the same form with **Add shop** and **Do this later** options. Keep location flexible and avoid requiring a formal postal address.

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

The shop list confirms what was created. Selecting **Set up shop** opens the settings for that selected shop. For multiple shops, the owner configures one shop at a time and returns to the shop list when finished.

After the owner taps **Set up shop**, enter one **Shop Profile Settings** area. For each selected shop, include:

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

This setting belongs to the selected shop, not the initial registration quiz. If the owner initially selected **I will operate it myself**, the shop starts with people access disabled:

```text
people_access_enabled = false
```

The owner can later open **Shop Settings → People and access** and enable it:

```text
Shop Settings
   ↓
People and access
   ↓
[Enable people to use this shop]
   ↓
Add helping person
```

Enabling people access does not require repeating registration or recreating the organisation. It can be enabled separately for each shop. It becomes `true` after the first person is added.

This setting is editable from Shop Settings at any time:

```text
Who will operate this shop?

Current setting: I will operate it myself

[Edit operator setting]
```

The owner can change the shop to **Someone else will help operate it**, add or replace the helping person, edit the person’s email or optional phone number, change each responsibility between **Yes / No**, or remove the helping person and return the shop to owner-operated status. Changes must be authorized, saved, and recorded in the audit trail.

For a simple operation, the owner assigns responsibilities directly to each person. For a structured organization, the owner can create reusable templates:

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

The owner then assigns the template to an individual and selects the shop or shops where it applies:

```text
Person
[ Select person ]

Template
[ Select template ]

Shop access
[ Select shop or shops ]

[Assign template]
```

The owner can customize, replace, suspend, or remove the assignment later. Templates are convenience bundles; actual access remains person-, shop-, and permission-scoped.

When the owner saves a helping person, the browser submits the request to a server-side function. The function creates a first-class application invitation, validates the owner’s organisation, selected shop, and permissions, then handles the Auth path:

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

The helper does not create an organisation or shop. The service-role key remains server-side. Invitation and membership state must remain separate, and Auth provisioning plus application-record writes must not be treated as one database transaction. Retries must be idempotent. The Yes/No controls map to canonical permission grants, while RLS and server-side authorization enforce active shop assignment and effective permissions.

After the owner saves a helper, show:

```text
Invitation sent

Amina Hassan has been invited to:
Mwangaza Duka

Email: amina@example.com
Status: Invitation pending

[Done]
```

The People and Access screen must show pending invitations with actions to resend, edit access, or cancel. The helper receives the email invitation, confirms the email, sets a password, and activates the account created by the owner. The helper does not create an organisation or shop.

After activation, route the helper directly to the assigned shop workspace. If the helper has one active shop assignment, open that shop automatically. If the helper has several authorized shops, show only those shops in the shop selector.

```text
Welcome, Amina

Mwangaza Duka
Kawangware Market

[Sell]
[Payments]
[Products, if allowed]
[Stock, if allowed]
```

Navigation and actions must be permission-based. After login, DukaFlow resolves the helper’s active membership, assigned shop(s), effective permissions, visibility, and availability before assembling the workspace.

```text
Helper login
   ↓
Active membership and shop assignment
   ↓
Effective permissions
   ↓
Show authorized areas
   ↓
Hide unauthorized areas
   ↓
Enforce actions with server authorization and RLS
```

A helper must not see owner onboarding, organisation creation, shop creation, M-Pesa credentials, staff management, or owner-only administration. Hidden navigation is not a security boundary; direct URLs and API requests to unauthorized areas must also be denied.

The helper’s daily flow is:

```text
Log in
   ↓
Open assigned shop or choose an authorized shop
   ↓
View sync status
   ↓
Use permitted sales, payment, product, or stock actions
   ↓
Sign out or close the session
```

The owner can later manage access from **People and Access** by editing permissions, changing shop assignments, resending or cancelling invitations, suspending access, removing access, or reviewing the audit history.

The remaining profile settings are:

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

M-Pesa configuration is conditional. The owner chooses Till Number or PayBill, enters the payment number, chooses Sandbox or Live, and securely configures Daraja credentials obtained through Safaricom Daraja Live. The owner may choose **Set up later** and continue with cash operations. Customer/Deni, supplier/purchasing, staff, and additional-shop sections remain conditional.

## 3. Responsive setup experience

The owner setup flow must keep the same content sequence on mobile, tablet, desktop, and other screen sizes. Only the layout changes:

```text
Mobile  → single-column vertical steps
Tablet  → centered form with flexible columns
Desktop → step rail plus wider work area
```

The owner should see one primary action per screen, a short step indicator, large touch targets, no horizontal scrolling, and clear **Set up later** actions for optional configuration. The same wording, validation, and business rules apply at every size. Advanced M-Pesa credentials, staff permissions, supplier controls, and reconciliation remain separate screens rather than one crowded form.

The setup sequence remains:

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

### Mobile layout

On a phone, use a single vertical flow with large touch targets:

```text
Set up your shop                         1 of 3

[ Shop photo ]

Shop name
[ Mwangaza Duka             ]

Shop location
[ Kawangware Market         ]

[Continue]
```

The next step is:

```text
Payments                                2 of 3

How do customers pay?

[ Cash ]
[ M-Pesa ]
[ Deni / Pay later ]

[Continue]
```

If M-Pesa is selected, show a short screen rather than long Daraja credential forms:

```text
M-Pesa setup                            3 of 3

M-Pesa Till Number
[ Enter number             ]

[Set up later]     [Continue]
```

The owner should be able to finish the basic setup in a few taps and start using the shop immediately.

### Desktop layout

On a desktop, use the same steps in a wider layout:

```text
┌──────────────────────────────────────────────────────────┐
│ DukaFlow                         Setup 1 of 3             │
├───────────────────────┬──────────────────────────────────┤
│ Setup steps            │ Shop profile                     │
│ ✓ Organisation         │ [Shop photo]                     │
│ ● Shop profile         │                                  │
│ ○ Payments             │ Shop name                        │
│ ○ First product        │ [ Mwangaza Duka ]                │
│                       │                                  │
│                       │ Shop location                    │
│                       │ [ Kawangware Market ]             │
│                       │                                  │
│                       │                         [Continue]│
└───────────────────────┴──────────────────────────────────┘
```

The desktop version may show the step list and supporting information beside the form, but it must not introduce different questions or a more complicated process.

### Tablet layout

On tablets, use a comfortable centered form with two columns only where helpful:

```text
┌─────────────────────────────────────────────┐
│ Set up your shop                             │
├──────────────────────┬──────────────────────┤
│ Shop photo           │ Shop name            │
│ [ Upload ]           │ [ Mwangaza Duka ]    │
│                      │                      │
│                      │ Shop location       │
│                      │ [ Kawangware ]      │
├──────────────────────┴──────────────────────┤
│                              [Continue]      │
└─────────────────────────────────────────────┘
```

If the screen becomes narrow, the columns stack automatically. The owner should never need to zoom or scroll horizontally.

## Owner Homepage Priority and Summary

After setup, the owner enters a daily business homepage rather than a worker-style task screen. It must answer: **Is anything urgent, and what should I do next?**

The homepage priority is:

1. **Needs attention now** — low stock, pending or failed M-Pesa, cash variance, Deni follow-up, synchronization problems, and approvals.
2. **Know your cash** — sales, cash received, confirmed M-Pesa, pending M-Pesa, and outstanding Deni shown separately.
3. **Know your stock** — low-stock products, fast-moving products, and restocking work.
4. **Understand your customers** — outstanding Deni, returning customers, and useful customer activity.
5. **Grow your business** — explainable recommendations based on sufficient business history.

For a single shop, the owner sees the active shop context, sync status, attention items, money position, quick actions, stock, customer activity, and business decisions:

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
```

For multiple shops, the owner first sees the combined organization summary and then the shop breakdown:

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

Combined totals must not hide shop differences. Totals, alerts, and recommendations must drill down to the relevant shop and records. If there is insufficient history, show an explanatory empty state rather than inventing an insight.

The same content sequence applies to mobile, tablet, and desktop. Mobile uses one vertical flow with large touch targets. Tablet uses a centered flexible layout. Desktop may use a sidebar and wider summary cards. Narrow screens stack automatically and never require horizontal scrolling or zooming.

## 4. Product experience is context-driven

The product experience is not one fixed dashboard.

It is assembled from:

```text
User identity
Organization
Active shop
Permissions
Data visibility
Approval authority
Availability
Shift / device context
Business state
```

Two users in the same shop may therefore have different starting points and different available actions without requiring different products.

## 3. Mobile-first is a product requirement

DukaFlow should assume that many shops primarily operate from a phone.

The experience should therefore optimize for:

- touch interaction;
- small screens;
- limited typing;
- fast product search;
- readable numbers;
- clear one-step actions;
- intermittent connectivity;
- modest devices;
- operation without specialist hardware.

A barcode scanner can accelerate work where available, but the product must not depend on one for ordinary sales.

## 4. Progressive complexity

DukaFlow should grow with the merchant.

### Stage 1 — One-person duka

The owner may need only:

```text
Sell
Stock
Cash
Customers / Deni
Today
```

The owner should not be required to configure advanced staff, approval, supplier, or multi-shop features before they are needed.

### Stage 2 — Small staffed shop

The product can introduce:

- staff access;
- permissions;
- shifts;
- reconciliation;
- approvals;
- purchasing;
- supplier balances.

### Stage 3 — Multi-shop business

The product can introduce:

- organization-level overview;
- shop comparison;
- cross-shop stock movement;
- delegated administration;
- more structured approvals;
- multi-shop insights.

The underlying domain model remains the same.

## 5. First experience after login

The post-authentication document determines the routing decision.

This document begins after that decision.

### Owner

Normally enter:

```text
Organization Home
```

### Staff with one shop

Normally enter:

```text
Shop Workspace
```

### Staff with multiple shops

Select the shop first, then enter:

```text
Shop Workspace
```

The product must not add extra selectors when the correct context is already unambiguous.

## 6. The home screen should be “Today”

The default operational home should emphasize what matters today, not every metric the system knows.

A useful owner-oriented shape is:

```text
TODAY

Sales        KSh 18,450
Paid now     KSh 15,200
Deni         KSh  3,250

Attention
- 5 items low in stock
- 1 cash variance
- 2 supplier deliveries pending

Quick actions
[ Sell ] [ Stock ] [ Customers ]
```

A staff-oriented shape should be narrower:

```text
TODAY

Current shop: Mavueni

[ New Sale ]
[ Customers ]
[ Stock ]

Shift
- Open
- 3 pending sync operations
```

The exact numbers and cards depend on permissions and available data.

## 7. What should always be visible

Where relevant, the interface should keep important context visible:

- active organization for organization-level users;
- active shop for shop-scoped users;
- current shift/till where enabled;
- connection state;
- synchronization state;
- account/leave state when it affects operation.

The user should not need to remember which shop is active.

## 8. Primary navigation

The complete DukaFlow information architecture is:

```text
Home
Sell
Products
Inventory
Customers
Payments
Tasks / Approvals
Reports / Insights
People / Access
Settings
```

These are product areas, not permissions or user roles. The exact visible navigation is derived from the user’s organization, active shop, permissions, visibility, availability, approval authority, and current business context.

On mobile, show only the most frequent actions:

```text
[Home] [Sell] [Stock] [More]
```

**Stock** opens Inventory. **More** contains Products, Customers, Payments, Tasks / Approvals, Reports / Insights, People / Access, and Settings according to authorization. Desktop may display the full list in a sidebar; tablet may use a compact sidebar or overflow menu. The workflow and business rules remain identical across layouts.

Products and Inventory are intentionally separate:

```text
Products
= What the item is

Inventory
= How many of that item each shop has
```

Products manages product definitions, categories, base units, prices, SKU/barcode, photos, and active status. Inventory manages shop-specific balances, receiving, counts, adjustments, transfers, low-stock status, and movement history.

The owner normally has access to all areas and enters Home first. Helpers see only authorized areas for their active shop assignment. Hidden navigation is not a security boundary; server-side authorization and Supabase RLS enforce every action.

The first MVP prioritizes Home, Sell, Products, Inventory, Customers, Payments, and Settings. Tasks / Approvals, Reports / Insights, People / Access, and advanced organization controls appear progressively as the business requires them.

### Home

What needs attention now.

### Sell

Fast transaction creation.

### Stock

Products, stock levels, receiving, counts, adjustments.

### Customers

Customer lookup, history, Deni, repayments, statements.

### Money

Payments, cash, M-Pesa, reconciliation, expenses where authorized.

### Purchasing

Suppliers, purchases, receiving, supplier balances.

### Insights

Sales, stock, cash, customer, supplier, and business recommendations.

### More

Secondary administration such as staff, settings, audit, and advanced configuration.

## 9. Primary action hierarchy

At any point, DukaFlow should have a clear primary action.

Examples:

```text
Sales screen
→ New Sale

Stock screen
→ Receive Stock / Count Stock

Customers screen
→ Find Customer / Add Customer

Money screen
→ Reconcile / Record Expense

Purchasing screen
→ New Purchase / Receive Delivery

Insights screen
→ Review Attention Items
```

The interface should not present twelve equally prominent buttons when one action is clearly dominant.

## 10. Sales experience

Selling is normally the highest-frequency workflow.

The product should minimize navigation:

```text
Open Sell
   ↓
Search / select product
   ↓
Set quantity
   ↓
Review total
   ↓
Optional customer
   ↓
Pay Now OR Take Pay Later
   ↓
Complete
   ↓
Receipt / reference
   ↓
Back to New Sale
```

The sales experience must follow `sales-and-settlement-model.md`.

In particular, it must support:

- full payment now;
- zero payment now + full Deni;
- partial payment + Deni;
- multiple immediate payment methods where supported;
- payment pending states;
- explicit completion state.

## 11. Inventory experience

Inventory should answer the merchant's practical questions quickly:

> What do I have?

> What is running low?

> What came in?

> What changed?

The default stock view should prioritize:

- product search;
- current quantity;
- low-stock status;
- recent stock movement;
- receiving;
- count/reconcile;
- product details.

Normal sales must update stock automatically according to the inventory model.

## 12. Customer experience

Customer work should remain lightweight.

The preferred pattern is:

```text
Search customer
   ↓
See useful summary
   ↓
Take action if needed
```

A useful customer summary may show:

- name;
- phone where available;
- current Deni balance;
- recent purchases;
- recent repayments;
- important permitted notes.

Do not turn customer lookup into a full CRM workflow for an ordinary cash customer.

## 13. Money experience

Money screens must make distinctions clear.

The user should never have to infer whether a number means:

- sales value;
- cash received;
- confirmed M-Pesa;
- Deni owed;
- expense;
- expected cash;
- counted cash;
- variance.

A simple presentation might be:

```text
TODAY

Sales value        KSh 20,000
Paid now           KSh 14,500
New Deni           KSh  5,500
Expenses           KSh  2,000

Cash expected      KSh  8,300
Cash counted       KSh  8,050
Variance           KSh   -250
```

The actual values and visible fields depend on the user's access and shop configuration.

## 14. Purchasing experience

Purchasing should mirror the real shop workflow rather than an enterprise procurement process by default.

Typical flow:

```text
New Purchase
   ↓
Choose supplier / source
   ↓
Add products and quantities
   ↓
Record actual cost
   ↓
Receive goods
   ↓
Record payment now OR supplier balance
   ↓
Complete purchase
```

The product must distinguish:

```text
Ordered
vs.
Actually received
vs.
Paid
vs.
Still owed
```

See `purchasing-and-suppliers-model.md` for domain rules.

## 15. Insights experience

Insights should be action-oriented, not dashboard-heavy.

Instead of showing:

```text
17 charts
```

the product should surface:

```text
ATTENTION

Low stock
3 products need reorder

Deni
2 customers have overdue balances

Cash
KSh 300 variance needs review

Supplier
Cooking oil cost increased 8%
```

Each item should lead directly to the relevant workflow.

## 16. Alerts, tasks, and recommendations

DukaFlow should distinguish three concepts.

### Alert

Something may require attention soon or immediately.

### Task

A known action the user needs to complete.

### Recommendation

A suggested improvement based on available evidence.

Example:

```text
ALERT
Cash variance: KSh 300

TASK
Complete end-of-day reconciliation

RECOMMENDATION
Reorder 24 units of Product X
```

These should not all look equally urgent.

## 17. Search should be universal enough for retail work

Search is often faster than navigation for a small shop.

DukaFlow should make it easy to find, within the user's visibility scope:

- products;
- customers;
- suppliers;
- sales;
- purchase records;
- transaction references.

Search results should make the object type obvious.

Example:

```text
Unga 2kg        Product
John Kamau      Customer
Sale #1042      Sale
Nashon Traders  Supplier
```

## 18. Avoid dead ends

A screen should always provide a next useful action.

Examples:

### Empty inventory

Do not just show:

```text
No products
```

Show:

```text
No products yet

[ Add Product ]
```

### No customers

```text
No customers yet

You can still make anonymous sales.

[ New Sale ] [ Add Customer ]
```

### No suppliers

```text
No suppliers yet

[ Add Supplier ] [ Record Cash Purchase ]
```

### No Deni

```text
No outstanding Deni
```

No unnecessary setup flow should block normal sales.

## 19. Progressive disclosure

Advanced controls should appear when they become relevant.

Examples:

- A one-person shop should not be forced to configure shifts.
- A shop with no credit sales should not be flooded with Deni analytics.
- A shop without multiple locations should not see cross-shop dashboards everywhere.
- An owner should only see advanced approval controls when the business has configured them.

The product should remain simple because complexity is available, not because complexity has been deleted.

## 20. Permissions and product experience

The product experience must use permissions to determine action availability.

Examples:

```text
can_operate_sales
→ show Sell action

can_receive_stock
→ show Receive Stock

can_view_customer_balances
→ show Deni balance

can_reconcile_cash
→ show Reconcile

can_manage_staff
→ show Staff administration
```

But the UI must never be treated as the security layer.

Every sensitive operation must still be authorized by the backend.

## 21. Owner experience

The owner should be able to move between organization and shop perspectives without losing context.

### Organization perspective

Useful for:

- all shops;
- high-level performance;
- staff/access management;
- cross-shop alerts;
- organization settings.

### Shop perspective

Useful for:

- selling;
- stock;
- customers;
- cash;
- purchasing;
- shop-specific insights.

The owner should not have to log out or change identity to move between these perspectives.

## 22. Staff experience

Staff should see the work their current access actually enables.

A staff member may combine responsibilities without selecting a job title each time.

For example:

```text
Staff
Shop: Mavueni
Permissions:
Sales + Customers + Receive Stock
```

Their workspace can expose all three relevant areas.

A worker assigned to one shop should enter it automatically. A worker assigned to multiple shops should select the active shop.

## 23. Leave, suspension, and access changes

The experience must reflect lifecycle changes immediately when known.

### On leave

Show the leave/access-status state rather than a normal operating dashboard.

### Suspended

Block protected operations and avoid exposing operational data.

### Shop assignment removed

Remove that shop from selectable context.

### Permission removed

Remove or disable the affected capability, and ensure backend authorization also rejects it.

The product should never leave a user believing they still have authority they no longer have.

## 24. Offline experience

Offline is a normal product state, not just a technical error.

The interface should make it obvious:

```text
OFFLINE
3 operations waiting to sync
```

or:

```text
ONLINE
All changes synced
```

Offline operation should prioritize supported daily tasks such as:

- selling;
- viewing locally provisioned products;
- supported customer operations;
- supported stock operations.

High-risk administration should normally require current authorization and connectivity unless a specific design explicitly supports otherwise.

## 25. Trust and transparency

DukaFlow should be highly trustworthy because business data affects real money.

The interface should clearly communicate:

- whether a sale completed;
- whether an M-Pesa payment is confirmed or pending;
- whether a Deni balance was created;
- whether a stock adjustment was recorded;
- whether an operation is offline/pending sync;
- whether a reconciliation has a variance;
- where an important recommendation came from.

Do not replace uncertainty with confident-looking graphics.

## 26. Error recovery

The experience should help the user recover without repeating business actions accidentally.

Examples:

### Ambiguous sale completion

Show the transaction state and allow safe retry using idempotency rather than creating a second sale.

### Failed M-Pesa confirmation

Make the payment state explicit and provide the correct recovery path.

### Stock conflict after offline sync

Show the resulting variance/conflict and the next authorized action.

### Lost connectivity

Continue supported offline work and clearly indicate synchronization state.

## 27. Daily summary should be personalized

A daily summary should be derived from the user's access and operational responsibility.

### Owner

Focus on:

- business performance;
- stock risks;
- money risks;
- Deni exposure;
- supplier issues;
- decisions.

### Sales staff

Focus on:

- current shop;
- shift;
- selling;
- payment/transaction exceptions;
- stock warnings relevant to selling.

### Stock staff

Focus on:

- receiving;
- counts;
- low stock;
- variances;
- stock tasks.

The same underlying data can support different experiences without duplicating the business truth.

## 28. What DukaFlow should not become

DukaFlow should not:

- force a role selection before every task;
- require a barcode scanner for normal selling;
- force a customer record for every sale;
- make a one-person duka configure enterprise workflows;
- expose every feature on the home screen;
- confuse dashboards with source-of-truth business records;
- show financial certainty when the data is incomplete;
- hide important transaction states;
- create separate workflows for each staff title when permissions already describe the capabilities;
- make offline operation feel like a broken product;
- turn recommendations into automatic business decisions without authorization.

## 29. Relationship to business-domain documents

The experience layer never invents business facts.

For example:

```text
Sales & Settlement
→ defines what a sale/payment/Deni means

Inventory
→ defines what stock means

Cash & Reconciliation
→ defines what money movement means

Customers
→ defines what customer history means

Purchasing
→ defines what supplier/purchase/receiving means

Business Insights
→ defines what derived insights mean

Product Experience
→ defines how those truths are presented and connected
```

If the UI needs a new business rule, that rule belongs in the relevant domain document first.

## 30. Product experience success criteria

DukaFlow's experience is successful when:

1. A new owner can understand what to do without training-heavy setup.
2. A one-shop worker enters the shop without an unnecessary selector.
3. A multi-shop worker can deliberately choose the shop they are working in.
4. A normal sale takes as few steps as practical on a phone.
5. Pay Now and Take Pay Later are clearly distinguishable.
6. Stock, customer, and cash consequences are visible without forcing manual bookkeeping.
7. Important exceptions are actionable rather than hidden.
8. Offline state is understandable.
9. Users only see actions and data appropriate to their effective access.
10. Advanced features appear as the business grows rather than overwhelming the smallest shop.
11. Every important number can be traced back to its domain source.
12. The product helps the merchant act, not merely observe.

## 31. Source-of-truth boundary

This document is the source of truth for the **product experience and information architecture**.

It does not redefine:

- identity;
- access governance;
- authorization;
- inventory semantics;
- sales/settlement semantics;
- financial accounting semantics;
- customer ledger semantics;
- supplier/purchasing semantics;
- derived-metric definitions.

Those belong to their respective source-of-truth documents.

The product experience should make the underlying business model easier to use, not create a second one.

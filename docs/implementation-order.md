# DukaFlow implementation order

This document is the implementation contract after the repository and access-control foundation cleanup.

## 1. Platform foundation

Build and verify the DukaFlow control plane first:

- platform operator identity
- platform permissions
- platform administration entry point
- maintenance controls
- platform audit trail

Platform administrators are never represented as merchant organization members.

## 2. Merchant identity and organization foundation

Build the merchant tenancy boundary:

- authenticated user
- organization
- organization owner
- organization membership
- owner/staff member type
- shop ownership and shop membership
- shop assignment

There are no mandatory Cashier, Manager, Inventory Operator, or similar identity roles.

## 3. Merchant authorization

Implement and verify:

- permission catalog
- organization membership permissions
- permission evaluation
- data visibility rules
- approval authority
- staff administration permissions
- owner authority

All merchant authorization must resolve through owner authority or explicit staff permissions.

## 4. Owner setup checklist and organization/shop onboarding

Immediately after account registration and verification, and before organization/shop bootstrap, show the owner a short ticking checklist:

1. Do you have more than one shop? **Yes / No**
2. Do you accept M-Pesa? **Yes / No**
3. Do you allow Deni? **Yes / No**
4. Do you buy stock from suppliers? **Yes / No**

If the answer to question 1 is **No**, ask:

5. Do you run the shop alone? **Yes / No**

If the answer is **Yes**, DukaFlow automatically records **Other people use the system: No**. If the answer is **No**, DukaFlow automatically records **Other people use the system: Yes**. Do not ask the duplicate staff-use question.

If the answer to question 1 is **Yes**, continue with multi-shop creation. Do not ask the helping-person question during the initial quiz. That question appears later in the settings for each specific shop after the owner taps **Set up shop**.

Use the answers to recommend a starting setup. The owner may choose **Start with simple setup** or **Use recommended setup**. Ask only relevant follow-up questions, such as the M-Pesa Till Number, staff access, additional shops, customer/Deni tracking, or supplier tools. Do not force advanced setup during first registration.

The owner remains an **Owner** regardless of setup complexity. Complexity is represented by enabled organization capabilities and may be added later.

After organization creation, create the first shop with:

```text
Shop name
[ Enter shop name ]

Shop location
[ Enter town, estate, street, or area ]

[Create shop]
```

When the owner has more than one shop, the same form supports **Add another shop** or **Do this later**. A simple location is required to distinguish shops, but a formal postal address is not required.

After shop creation is complete, show the owner the created shop or shops first. The owner must tap **Set up shop** before entering profile settings.

For one shop, show the shop name, location, optional photo, and **Set up shop** action. For multiple shops, show a list of created shops with each shop's name, location, optional photo, and **Set up shop** action. The owner configures one selected shop at a time and may return to the list.

After the owner taps **Set up shop**, open one **Shop Profile Settings** area:

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

M-Pesa configuration is conditional. The owner chooses Till Number or PayBill, enters the payment number, chooses Sandbox or Live, and securely configures Daraja credentials obtained through Safaricom Daraja Live. The owner may set it up later. Customer/Deni, supplier/purchasing, staff, and additional-shop sections are also conditional.

The setup flow must be responsive without changing its content or business rules:

```text
Mobile  → single-column vertical steps
Tablet  → centered flexible form
Desktop → step rail and wider work area
```

Use one primary action per screen, a short step indicator, large touch targets, no horizontal scrolling, and **Set up later** for optional configuration. Advanced M-Pesa credentials, staff permissions, supplier controls, and reconciliation remain separate screens.

## 5. Organization and shop onboarding

Implement the first-login lifecycle:

Sign in
→ Create organization/shop when none exists
→ Owner established
→ Shop activated
→ Workspace opened

Then implement the second-login lifecycle:

Sign in
→ Load organization/shop memberships
→ Restore active shop when valid
→ Select shop when multiple shops exist
→ Open workspace

Offline cached shop access must remain a fallback, never the source of server authorization truth.

## 6. Catalog foundation

Implement and verify:

- product model
- categories
- product active/inactive state
- units
- selling price
- cost price
- product search
- product creation/editing

Product presentation stays inside `modules/catalog/presentation`.

## 7. Inventory foundation

Implement before production sales enforcement:

- opening stock
- stock ledger
- stock balance
- stock adjustments
- stock receiving
- stock movement audit

Sales must consume the inventory contract rather than directly mutating product quantities.

## 8. Sales foundation

Implement the canonical sale flow:

Select products
→ Cart
→ Customer context when needed
→ Payment method
→ Complete sale
→ Sale record
→ Sale lines
→ Payment record
→ Inventory effect
→ Receipt

The sale use case remains business logic; presentation components only render and collect input.

## 9. Payment foundation

Implement payment methods independently of the POS UI:

- cash
- M-Pesa
- Deni

For M-Pesa, keep provider configuration separate from the sale record. Organization owners configure the integration; shop-specific configuration is used only when explicitly enabled by the organization model.

Required M-Pesa configuration foundation:

- Till Number
- M-Pesa Passkey
- Consumer Key
- Consumer Secret
- Shortcode / Business Short Code where applicable
- Sandbox or Production environment

The configuration scope is organization-level by default, with explicit per-shop override support where the business requires it.

Never expose provider secrets to staff unless the permission model explicitly allows a controlled administrative operation. Store secrets in the platform secrets boundary, not in UI state or normal merchant records.

## 10. Customer and Deni foundation

Implement:

- customers
- customer identity per organization/shop
- Deni account/credit ledger
- Deni sale linkage
- repayments
- outstanding balance
- approval rules

Deni must remain an accounting/business capability, not merely a payment button.

## 11. Offline and synchronization

After the authoritative online flows are stable:

- local transaction persistence
- operation IDs/idempotency
- outbox
- reconnect detection
- synchronization
- retry handling
- server reconciliation
- exactly-once server sale enforcement

Offline UI must never bypass server authorization rules.

## 12. Receipts and operational records

Implement:

- receipt generation
- sale lookup
- transaction history
- audit records
- payment references
- reconciliation hooks

## 13. Staff administration

After authorization is stable:

- invite staff
- staff activation/deactivation
- shop assignments
- permission assignment
- visibility scope
- approval scope
- staff audit history

Role labels such as Cashier, Manager, or Inventory Operator may exist only as optional responsibility templates that map to explicit permissions.

## 14. Platform administration UI

Implement after core merchant authorization is stable:

- platform dashboard
- organization oversight
- support access
- maintenance mode
- platform controls
- subscription/entitlement administration
- platform audit

Any support access into a merchant organization must be explicit, scoped, temporary where appropriate, and auditable.

## 15. Hardening and verification

Before calling the foundation complete:

- database RLS verification
- permission boundary tests
- platform/merchant separation tests
- owner/staff authorization tests
- offline/online sale tests
- duplicate-operation tests
- payment integrity tests
- audit integrity tests
- build/lint/test/CI verification

## Dependency rule

Do not implement a later phase by creating a new shortcut around an earlier phase.

The dependency direction is:

```text
Platform
  ↓
Authentication
  ↓
Organization / Shop
  ↓
Owner / Staff / Permissions
  ↓
Catalog
  ↓
Inventory
  ↓
Sales
  ↓
Payments / Deni
  ↓
Offline Sync
  ↓
Receipts / Reconciliation / Reporting
```

The UI may be developed in parallel only when it consumes an already-defined application/domain contract.

# Live Supabase Foundation Status

Project: `sixobwjzflgslbmrplqe` (`pos`)
Region: `eu-west-1`

## Live deployment

The connected Supabase project is ACTIVE/HEALTHY and contains the DukaFlow foundation schema.

Applied live migrations:

1. `20260817061633_foundation_auth_tenancy_core`
2. `20260817061655_auth_security_hardening`
3. `20260817061721_foundation_performance_hardening`

## Live foundation

The live database contains the authentication/tenant/security boundary and core business domains:

- `user_profiles`
- `organizations`
- `organization_memberships`
- `stores`
- `employees`
- `categories`
- `products`
- `customers`
- `suppliers`
- `sales`
- `sale_items`
- `payments`
- `deni_transactions`
- `inventory_movements`
- `inventory_balances`
- `purchases`
- `purchase_items`
- `receipts`
- `audit_events`
- `sync_events`
- `communication_preferences`
- `communication_intents`
- `expenses`
- `store_public_profiles`

## Authentication and authorization

The live design is:

```text
Supabase Auth
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
Data visibility / approval authority
  ↓
RLS + domain operation
```

The model does **not** treat Cashier, Manager, or Inventory Operator as mandatory user identities. Such labels may be implemented as permission templates, while the underlying authorization is based on explicit permissions and shop scope.

Authenticated shop bootstrap is implemented through `bootstrap_shop(...)`.

## Security posture

Security advisors were run after deployment. Intentional security-definer boundaries include:

- `bootstrap_shop` — signed-in tenant bootstrap.
- `get_public_storefront` — narrow public projection.

Critical functions use fixed search paths and explicit grants.

## Performance posture

Foreign-key indexes were added for main operational relationships. RLS policies for identity-sensitive tables use trusted authenticated identity/membership helpers and performance-safe authorization expressions where applicable.

## Important migration note

The live project was initially empty, so the foundation was applied as a consolidated live baseline rather than executing historical repository migrations one-by-one. Before automated migration replay against a clean environment, repository migration history should be consolidated/rebased so a fresh database reproduces the live schema deterministically.

## Next verification

Before expanding the POS checkout UI, verify:

1. User signup/sign-in.
2. Authenticated `bootstrap_shop`.
3. Owner organization-level access.
4. Staff one-shop automatic entry.
5. Staff multi-shop selection.
6. Staff no-shop denial.
7. Permission/template expansion to explicit capabilities.
8. Cross-tenant and cross-store denial tests.
9. Product creation/read through authenticated client.
10. First local transaction -> outbox -> server synchronization contract.

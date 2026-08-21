# DukaFlow Security Readiness

## Purpose

Security is a release gate, not a later feature. This document defines the minimum controls DukaFlow must satisfy before onboarding real merchants and before scaling usage materially.

The detailed control specification is in [`security-controls.md`](./security-controls.md), and the executable verification list is in [`security-verification-checklist.md`](./security-verification-checklist.md).

## Security layers

1. **Identity** — Supabase Auth is the source of authenticated identity.
2. **Tenancy** — organization/store membership determines business scope.
3. **User model** — owner and staff are the fundamental human categories.
4. **Authorization** — explicit permissions, shop assignment, data visibility and approval authority determine allowed actions.
5. **Database** — PostgreSQL RLS is the non-negotiable tenant-isolation backstop.
6. **Application** — business invariants are enforced outside the UI and revalidated at server/sync boundaries.
7. **Device** — each offline client has a stable device identity that can be revoked.
8. **Offline** — local data is untrusted operational state; server validation remains authoritative.
9. **Integration** — payment/API secrets stay server-side and external callbacks are verified.
10. **Audit** — high-risk business and security actions are traceable.
11. **Availability** — migrations, backups and restore procedures protect business continuity.

## Required controls before growth

### Authentication

- Sign-up/sign-in/session restoration work.
- Password recovery is implemented.
- Session refresh/expiry is handled.
- Higher-risk owner/staff operations have an MFA policy before production use.
- Account/session revocation procedures exist.

### Tenancy and authorization

- Every private business record has a store/organization ownership path.
- Membership is the authorization foundation.
- Shop assignment determines where staff can operate.
- Explicit permissions determine what staff can do.
- Data visibility is enforced separately where required.
- Approval authority is enforced separately for high-risk actions.
- Store access is enforced server-side and in RLS, not only in React.
- Shop bootstrap derives the owner from `auth.uid()`.
- One-shop staff automatically enter that shop; multi-shop staff must select an active shop.

### Row Level Security

- Every browser-exposed private table has RLS enabled.
- Policies are store/organization scoped.
- Client-supplied tenant identifiers are never trusted as authorization proof.
- Helper functions use fixed search paths.
- `SECURITY DEFINER` functions have narrow privileges and explicit grants.
- Anonymous access exists only for intentionally public projections.
- RLS policies are reviewed for both correctness and query-plan performance.

### Offline/device security

- Dexie/IndexedDB is not an authority.
- Only minimum operational data is cached.
- Every mutation has a stable operation identity.
- Every synchronized mutation is authenticated and revalidated server-side.
- Device identity is separate from user identity.
- Device revocation blocks future synchronization from the revoked device.
- Local sensitive-data protection matches the chosen client platform; a browser/PWA must not claim native-keystore security it does not provide.

### Financial integrity

- Money uses integer minor units in domain/application logic.
- Sale/payment/inventory/Deni operations follow atomic semantics.
- Duplicate operations are rejected by idempotency keys.
- Corrections are reversals/adjustments rather than silent destructive edits.
- M-Pesa payment confirmation is not inferred solely from user-entered references.
- Provider credentials and callback secrets stay server-side.

### Public storefront

- Public access is opt-in.
- Public endpoints expose only an explicit public projection.
- Customer, Deni, sales, payments, employee, supplier, private-inventory and audit data are never public.
- Public functions have fixed search paths and narrow grants.

### Audit and monitoring

At minimum, record high-risk events such as:

- permission or membership changes;
- shop assignment changes;
- approval actions;
- product price changes;
- stock adjustments;
- sale completion/void/refund;
- Deni adjustments;
- payment exceptions;
- device registration/revocation;
- sync conflicts/failures;
- security events where appropriate.

Never log passwords, access tokens, provider secrets or unnecessary sensitive personal data.

### Operational security

- No service-role or privileged secret is shipped to the browser.
- CI runs type checking/builds, tests, lint and dependency vulnerability checks.
- Database migrations are version-controlled and reproducible.
- Security/performance advisories are reviewed after material database changes.
- Production backups and restore procedures are tested.
- Rate limiting/abuse controls are applied to authentication, bootstrap, synchronization and public endpoints as the platform grows.
- Incident response includes account, shop-assignment, permission, and device revocation procedures.

## Current live-state review

The live Supabase project is connected and the foundation migrations have been applied. The live foundation follows the owner/staff, shop-assignment and permission model described in `docs/auth-tenancy-foundation.md`.

Intentional `SECURITY DEFINER` boundaries currently include:

- `bootstrap_shop(...)` — authenticated initial tenant bootstrap.
- `get_public_storefront(...)` — future public storefront projection.

These must remain narrow, fixed-search-path entry points with explicit grants.

## Security gates

### Gate A — Foundation

Authentication, tenancy, owner/staff identity, shop assignment, permission enforcement, RLS, device identity and audit foundations are implemented.

**Release condition:** verified by automated tests and live database checks.

### Gate B — Transaction security

Cash, M-Pesa, Deni and inventory operations pass authorization, integrity and idempotency tests.

**Release condition:** no critical/high-risk transaction integrity failures.

### Gate C — Access security

Shop assignment, data visibility and approval authority cannot be bypassed through direct API/RPC calls or manipulated client state.

**Release condition:** authorization, visibility and approval tests pass.

### Gate D — Offline security

A modified local device cannot bypass server authorization or create duplicate financial effects through synchronization.

**Release condition:** tamper, replay and revoke-device tests pass.

### Gate E — Production security

Backups, restore testing, monitoring, dependency scanning, rate limiting and incident/revocation procedures are operational.

**Release condition:** documented and exercised, not merely planned.

## Current status

**Foundation:** established.

**Production security:** not yet declared complete. The remaining work is verification and hardening of the controls in `security-verification-checklist.md`, followed by live regression checks after each material schema/auth/sync change.

## Principle

> **The client improves the merchant experience; the server protects the business.**

No screen, local record, client-supplied identifier, role/template label, or browser-held permission is a trust boundary by itself.

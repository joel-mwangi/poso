# DukaFlow M-Pesa Merchant Configuration and Scope Model

**This document defines how an Organization Owner configures merchant-owned M-Pesa credentials and how that configuration is scoped across the organization's shops.**

## 1. Core decision

M-Pesa merchant integration is configured by the **Organization Owner** (or a user explicitly granted the appropriate payment-integration administration permission).

The configuration belongs to the merchant organization/payment relationship, not to a cashier or other ordinary worker.

DukaFlow must support both:

- one M-Pesa configuration shared across multiple shops in an organization; and
- separate M-Pesa configurations for individual shops.

## 2. Required merchant-entered configuration

For the supported M-Pesa integration, the authorized organization owner must provide the integration details required by the selected M-Pesa/Daraja capability, including:

1. **Till Number**
2. **M-Pesa Passkey**
3. **Consumer Key**
4. **Consumer Secret**
5. **Shortcode / Business Short Code**, where applicable
6. **Environment** — Sandbox or Production

The exact credential set required for a specific production M-Pesa product/capability must be validated against the current provider requirements at implementation time. DukaFlow must not assume that every M-Pesa product uses exactly the same credential set.

## 3. Shop-settings presentation

When the owner enables M-Pesa during onboarding, the shop profile should show a conditional payment-settings section:

```text
M-Pesa
[ Enabled / Not configured ]

Payment arrangement
( ) M-Pesa Till Number
( ) M-Pesa PayBill

Till Number / PayBill Number
[ Enter number ]

Environment
( ) Sandbox
( ) Live

Daraja credentials
[ Configure securely ]

Connection status
Not connected / Connected / Needs attention

[Test connection]
[Save M-Pesa configuration]
```

Live credentials must be obtained by the owner through the official Safaricom Daraja Live process. DukaFlow must not generate or infer provider credentials. The exact fields depend on the selected Daraja capability and current provider requirements.

The owner may choose **Set up later** and continue with supported cash operations. A Till Number identifies the payment destination; it does not by itself prove that the integration is connected or that a payment is confirmed.

The shop profile may also show safe metadata such as a masked Till Number, environment, connection status, and last validation time. Raw secrets remain outside ordinary shop records and client storage.

## 4. Configuration scope

When adding an M-Pesa integration, the owner selects its scope:

```text
Organization Owner
       ↓
Add M-Pesa integration
       ↓
Select scope
   ┌───────────────┐
   │ Organization  │ → shared by configured shops
   │ Shop          │ → applies only to one shop
   └───────────────┘
```

### Organization-wide configuration

One M-Pesa relationship may be configured for the organization and made available to all shops that are allowed to inherit it.

```text
Organization
├── Shop A ──┐
├── Shop B ──┼── Organization M-Pesa configuration
└── Shop C ──┘
```

This is appropriate where the organization uses one merchant payment relationship across its shops.

### Shop-specific configuration

A shop may have its own M-Pesa relationship and credentials.

```text
Organization
├── Shop A → M-Pesa configuration A
├── Shop B → M-Pesa configuration B
└── Shop C → M-Pesa configuration C
```

This is required where shops have different Till numbers, shortcodes, or provider credentials.

## 4. Configuration precedence

A shop-specific M-Pesa configuration **overrides** the organization-wide configuration for that shop.

The resolution order is:

```text
Current Shop
    ↓
Shop-specific active M-Pesa configuration?
    ├── YES → use it
    └── NO
         ↓
Organization-wide active M-Pesa configuration?
    ├── YES → use it
    └── NO → M-Pesa unavailable for that shop
```

The POS must never silently use credentials belonging to another shop.

## 5. Who enters the credentials?

The **Organization Owner** is responsible for entering and managing merchant M-Pesa integration credentials.

The owner can:

- create an organization-wide M-Pesa configuration;
- create a shop-specific M-Pesa configuration;
- validate/test a configuration;
- activate or deactivate a configuration;
- replace/rotate credentials;
- change configuration scope where permitted;
- disconnect the integration.

A separately authorized payment-integration administrator may perform these actions only when the organization's permission model explicitly grants that authority.

## 6. Worker and cashier boundary

Ordinary staff do **not** enter or manage M-Pesa API credentials during checkout.

A worker's checkout experience is simply:

```text
Cart
 ↓
Pay Now
 ↓
M-Pesa
 ↓
Use the active configuration for the current shop
 ↓
Payment flow
 ↓
Provider confirmation
```

The worker may be allowed to initiate or record payments according to assigned permissions, but must not receive access to:

- M-Pesa Passkey;
- Consumer Secret;
- other raw provider secrets;
- organization-level integration management controls.

## 7. Secure secret handling

M-Pesa credentials are secrets and must not be stored as ordinary exposed merchant data.

In particular:

- secrets must remain server-side/protected;
- raw secrets must not be returned to ordinary POS clients;
- secrets must not appear in logs;
- secrets must not be placed in audit records;
- access must be minimized and audited;
- credential rotation/revocation must be supported;
- connection tests must not expose secret values in UI responses.

The POS may display safe metadata such as provider, scope, masked Till Number, environment, status, and last validation time.

## 8. Connection lifecycle

Each M-Pesa configuration has an explicit lifecycle:

```text
NOT_CONFIGURED
      ↓
CONFIGURING
      ↓
VALIDATING
      ↓
ACTIVE
      ↓
DEGRADED / ACTION_REQUIRED
      ↓
DISABLED / DISCONNECTED
```

A configuration must not become `ACTIVE` merely because credentials were entered. The integration must pass the supported validation/connection process.

## 9. Organization-wide configuration and shop eligibility

An organization-wide configuration does not automatically mean every shop must use M-Pesa.

The system must still be able to determine whether a shop is eligible to use the shared configuration.

```text
Organization M-Pesa active
        ↓
Current shop eligible to inherit?
        ↓
Yes → M-Pesa available
No  → M-Pesa unavailable
```

This preserves future flexibility for organizations that intentionally exclude particular shops.

## 10. Shop-specific override

If an organization has a shared configuration but Shop B has its own Till, Shop B uses its own active configuration:

```text
Organization M-Pesa → Till 100001

Shop A → inherited Till 100001
Shop B → own Till 200002  ← override
Shop C → inherited Till 100001
```

Shop B's workers must never accidentally initiate payments through the organization's shared Till when Shop B's own configuration is active.

## 11. Credentials are not organization login passkeys

The **M-Pesa Passkey** in this document is a provider integration credential.

It is distinct from:

- a DukaFlow user password;
- a DukaFlow user passkey/WebAuthn credential;
- an owner's authentication credential;
- a staff PIN.

The M-Pesa Passkey authenticates the relevant provider integration flow; it does not authenticate a DukaFlow user.

## 12. Payment processing boundary

Once a configuration is active, the checkout system resolves the current shop's payment configuration before initiating an M-Pesa operation:

```text
Current user
    +
Current shop
    +
User payment permission
    +
M-Pesa integration scope
    +
Active integration state
    ↓
Can initiate M-Pesa?
```

The payment integration layer then performs provider-specific authentication and payment processing.

The sale/settlement domain remains authoritative for the sale, payment amount, Deni, stock, and customer ledger semantics.

## 13. Configuration changes

Changing an M-Pesa Till or credential must be treated as an integration lifecycle event.

```text
Existing configuration
        ↓
Owner edits/replaces credentials
        ↓
Validate new configuration
        ↓
Activate new configuration
        ↓
Retire old configuration where appropriate
        ↓
Audit event
```

Historical payments must retain their original provider/payment references and must not be rewritten merely because the merchant later changes credentials or Till configuration.

## 14. Audit requirements

For every M-Pesa configuration change, record at minimum:

- actor;
- organization;
- shop scope, if applicable;
- action;
- timestamp;
- resulting configuration status;
- provider/account metadata that is safe to record;
- validation result.

Never record raw M-Pesa secrets in the audit trail.

## 15. Non-negotiable rules

1. **The Organization Owner is responsible for M-Pesa merchant configuration.**
2. **The required merchant-entered fields are Till Number, M-Pesa Passkey, Consumer Key, Consumer Secret, Shortcode/Business Short Code where applicable, and Environment.**
3. **M-Pesa configuration can be organization-wide or shop-specific.**
4. **Shop-specific configuration overrides organization-wide configuration for that shop.**
5. **The POS resolves the correct active configuration from the current shop; it never guesses across shops.**
6. **Ordinary staff do not manage or see M-Pesa integration secrets during selling.**
7. **M-Pesa Passkey is a provider credential and is not a DukaFlow user authentication passkey.**
8. **Credentials are protected server-side and are never exposed through ordinary POS responses or logs.**
9. **A configuration must be validated before it becomes active.**
10. **Changing credentials or Till configuration must not rewrite historical payments or sales.**
11. **The exact production credential requirements must follow the current provider capability being integrated.**

# DukaFlow Merchant-Owned Payment Integration Model

**This document is the source of truth for how merchant-owned payment integrations are connected, scoped, operated, secured, monitored, disconnected, and transferred inside DukaFlow.**

## 1. Core principle

DukaFlow owns and operates the **platform**. The merchant organization owns its **business relationship with the payment provider and the money received through that relationship**.

For M-Pesa, card, bank, and future payment providers, DukaFlow should provide the integration infrastructure while the merchant controls which payment relationship is connected to its organization and shop.

> **DukaFlow connects the merchant to the payment provider; DukaFlow does not become the merchant's payment account.**

Safaricom's current Daraja platform provides APIs that bridge M-Pesa services to web and mobile applications, including Customer-to-Business capabilities. Safaricom also describes M-Pesa API integration as a way to automate payment processing and reconciliation. citeturn902402search0turn902402search2turn902402search24

For bank payments, DukaFlow should use a provider/network adapter rather than hard-code every bank into sales. PesaLink currently provides APIs for instant account-to-account payments, account validation, and merchant payments, with a single integration path to its interoperable network. citeturn902402search12turn902402search13

---

## 2. Platform-owned versus merchant-owned responsibilities

### DukaFlow platform owns

- the integration framework;
- provider adapters;
- webhook/callback infrastructure;
- payment-state processing;
- idempotency and duplicate protection;
- integration monitoring;
- secure secret-management infrastructure;
- payment-event audit infrastructure;
- provider error handling;
- reconciliation workflows;
- platform-level support tooling.

### Merchant organization owns

- the business relationship with the payment provider;
- the payment account/till/PayBill/bank relationship configured for the shop;
- the decision to connect or disconnect that relationship;
- merchant authorization for the connection;
- the business records generated from its payments;
- settlement ownership of the merchant funds.

DukaFlow does not own the merchant's M-Pesa or bank account merely because it can initiate or confirm transactions through an integration.

---

## 3. Integration scope

A payment integration must have an explicit scope.

```text
Organization
    ↓
Payment provider configuration
    ↓
Scope
    ├── Organization-wide
    └── Shop-specific
         ↓
Payment methods available to authorized users
```

The system must not assume every organization has exactly one payment account.

Examples:

- one M-Pesa relationship shared across several shops;
- one M-Pesa till per shop;
- separate bank accounts for different shops;
- one bank collection relationship used across the organization.

The configuration must state exactly which shop(s) may use the integration.

---

## 4. Who can connect an integration?

The normal authority is the **merchant owner** or another merchant user explicitly granted the appropriate administration permission.

The flow should be:

```text
Merchant owner
     ↓
Settings / Payments / Integrations
     ↓
Choose provider
     ↓
Select organization or shop scope
     ↓
Provider onboarding / authorization
     ↓
Test connection
     ↓
Activate
```

Platform support should not connect a merchant payment account on the merchant's behalf as a routine action.

Where assisted setup is genuinely necessary, the support operator acts through a controlled support workflow and does not become the owner of the provider account.

---

## 5. M-Pesa connection flow

For M-Pesa, the exact provider onboarding steps depend on the merchant's Safaricom business arrangement and the supported Daraja capability.

Conceptually:

```text
Owner chooses M-Pesa
        ↓
Select shop / organization scope
        ↓
Merchant authorizes connection
        ↓
DukaFlow receives integration authorization/configuration
        ↓
Credentials/secrets stored in protected infrastructure
        ↓
Connection test
        ↓
Activate payment method
```

The merchant's M-Pesa arrangement remains merchant-owned. Safaricom currently exposes M-Pesa APIs through Daraja and maintains provider-specific onboarding and API documentation. citeturn902402search0turn902402search3

---

## 6. Bank-payment connection flow

Bank payment integration should follow the same provider-adapter model.

Conceptually:

```text
Owner chooses Bank
        ↓
Choose provider / network
        ↓
Choose organization or shop scope
        ↓
Merchant authorizes bank/payment relationship
        ↓
DukaFlow establishes protected integration
        ↓
Connection test
        ↓
Activate
```

For account-to-account payments, PesaLink is one potential network integration path because its current developer platform offers APIs for instant account-to-account transfers, account validation, and merchant payments. citeturn902402search12turn902402search13

DukaFlow should not assume PesaLink is the only future bank integration path.

---

## 7. Payment flow after connection

Once an integration is active:

```text
Worker adds items to cart
        ↓
Checkout total
        ↓
Choose Pay Now
        ↓
Choose M-Pesa / Card / Bank
        ↓
Provider-specific payment flow
        ↓
Provider confirmation
        ↓
DukaFlow validates confirmation
        ↓
Payment = CONFIRMED
        ↓
Sale settlement completes
        ↓
Payment ledger + reconciliation record
```

The worker should not need access to merchant credentials.

The worker only needs the merchant permission to use the configured payment method.

---

## 8. Payment integration states

Every provider connection should have an explicit lifecycle.

```text
NOT_CONNECTED
      ↓
CONFIGURING
      ↓
CONNECTED / TESTED
      ↓
ACTIVE
      ↓
DEGRADED / ACTION_REQUIRED
      ↓
DISCONNECTED / REVOKED
```

Individual payment transactions have their own state:

```text
CREATED
  ↓
INITIATED
  ↓
PENDING
  ├── CONFIRMED
  ├── FAILED
  ├── EXPIRED
  └── REVERSED / REFUNDED
```

A connection state must never be confused with an individual payment state.

---

## 9. Secret handling

Merchant provider secrets are highly sensitive.

Examples:

- API keys;
- client secrets;
- webhook credentials;
- signing secrets;
- private keys;
- provider passwords;
- access tokens.

DukaFlow should:

- store secrets in protected secret-management infrastructure;
- encrypt them appropriately;
- minimize human access;
- avoid placing secrets in ordinary merchant tables;
- prevent secrets from appearing in logs;
- support rotation;
- support revocation;
- audit secret lifecycle operations.

### Platform administrators

Platform administrators should normally see:

- connected/not connected;
- provider;
- scope;
- health;
- last successful communication;
- error state;
- configuration metadata needed for operations.

They should not normally see raw merchant credentials.

### Merchant owner

The owner may initiate connection, replacement, rotation, or disconnection through the supported provider flow, but the product should reveal only what is operationally necessary.

---

## 10. Shop-scope enforcement

If an M-Pesa connection belongs only to Shop A:

```text
Shop A
→ M-Pesa available

Shop B
→ M-Pesa unavailable
```

unless the organization explicitly configures a shared integration.

A worker's shop assignment must therefore be evaluated together with the payment integration scope.

```text
User permission
      +
Active shop
      +
Integration scope
      +
Feature entitlement
      ↓
Payment method available?
```

---

## 11. Worker experience

Workers should not manage integrations during ordinary selling.

The worker should see:

```text
Cart
 ↓
Pay Now
 ↓
M-Pesa / Card / Bank / Cash
```

For M-Pesa, the configured provider flow may request a customer phone number before the payment request is initiated.

For a card integration, the worker may be instructed to use the connected terminal/provider flow.

For a bank integration, the provider flow may require the customer to authorize through their bank channel.

The worker should not see raw provider credentials or administrative connection controls unless separately authorized.

---

## 12. Integration failures

A failed provider connection must not corrupt the sale model.

Examples:

```text
M-Pesa unavailable
     ↓
Payment cannot be confirmed
     ↓
Worker may:
  - retry;
  - choose another supported payment method;
  - use Pay Later if authorized;
  - cancel checkout.
```

DukaFlow must not mark a payment as confirmed merely because a request was sent.

Likewise:

- provider timeout ≠ payment success;
- worker-entered reference ≠ trusted confirmation;
- callback received ≠ automatically trusted until validated;
- duplicate callback ≠ duplicate payment.

---

## 13. Reconciliation

Every integrated provider should feed the same reconciliation model.

```text
Provider event
      ↓
DukaFlow payment record
      ↓
Sale / supplier / repayment reference
      ↓
Reconciliation
      ↓
Confirmed / exception / unresolved
```

For merchant-facing reconciliation, DukaFlow should explain:

- what payment was expected;
- what provider confirmed;
- which business event it belongs to;
- whether the amounts match;
- whether any exception remains.

Safaricom describes M-Pesa API integration as supporting automated payment and reconciliation processes. citeturn902402search24

---

## 14. Merchant disconnects an integration

The owner must be able to disconnect an integration according to the provider's rules.

Disconnection should:

- prevent new payment requests through that connection;
- preserve historical payment records;
- preserve reconciliation history;
- revoke or disable credentials/tokens where supported;
- mark the connection inactive;
- notify affected authorized users;
- prevent the disconnected method from appearing in ordinary checkout.

Disconnecting M-Pesa must not delete old M-Pesa sales or payment history.

---

## 15. Merchant changes provider credentials

Credential replacement should be treated as an integration lifecycle event.

```text
Old connection active
        ↓
Owner starts replacement
        ↓
New credentials authorized
        ↓
Connection tested
        ↓
New connection activated
        ↓
Old credentials revoked / retired
        ↓
Audit
```

Avoid creating a period where the owner has to expose credentials to support staff manually.

---

## 16. Merchant ownership or staff changes

Payment integrations remain attached to the merchant organization/shop, not to the individual worker who happens to use them.

If a cashier leaves:

```text
Cashier removed
     ↓
Their shop/payment permission disappears
     ↓
M-Pesa connection remains with the merchant
```

If ownership of a merchant organization changes through a future supported business-transfer workflow, payment integrations must be reviewed and revalidated as part of that transfer.

The old owner must not retain active control of the payment connection after ownership transfer.

---

## 17. Platform support access

Support should normally diagnose integration problems through:

- connection state;
- provider error codes/messages where safe;
- last successful communication;
- callback health;
- transaction references;
- non-secret configuration metadata.

Support should not routinely ask the merchant to paste raw credentials into chat, tickets, logs, or support forms.

If provider support or technical repair requires privileged action, use a controlled, time-bound, audited support/repair workflow.

---

## 18. Platform administrators and merchant funds

DukaFlow platform administration must not become control of merchant funds.

A platform operator does not ordinarily:

- withdraw merchant M-Pesa funds;
- transfer merchant bank funds;
- change beneficiary ownership;
- change merchant collection accounts;
- approve merchant refunds merely because they are a platform administrator;
- view raw payment credentials.

Platform operators operate the integration service. The merchant controls the underlying payment relationship and money.

---

## 19. Subscription and entitlement interaction

Payment integrations can themselves be governed by DukaFlow entitlements.

For example:

```text
Organization entitlement
      ↓
M-Pesa integration capability available?
      ↓
Merchant connection active?
      ↓
Shop scope allows it?
      ↓
Worker permission allows payment method?
      ↓
Use integration
```

A subscription restriction should disable the applicable DukaFlow capability according to subscription policy without rewriting historical merchant payment records.

The merchant's underlying M-Pesa or bank relationship remains outside DukaFlow ownership.

---

## 20. Security and monitoring

DukaFlow should monitor the integration service for:

- authentication failures;
- expired credentials;
- callback failures;
- provider timeouts;
- duplicate events;
- unusual payment error rates;
- reconciliation exceptions;
- credential rotation failures;
- abnormal request volume.

Monitoring should prioritize provider/system health rather than exposing unnecessary merchant transaction detail.

---

## 21. Integration architecture

All payment providers should plug into a common integration boundary.

```text
                    DukaFlow
                        ↓
                Settlement Engine
                        ↓
              Payment Integration Layer
                        ↓
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
     M-Pesa           Bank              Card
     Adapter          Adapter           Adapter
        ↓               ↓                ↓
    Daraja       PesaLink / Bank     Card provider
```

The settlement engine owns the meaning of:

- sale;
- amount due;
- amount paid now;
- Pay Later/Deni;
- payment state;
- reversal/refund;
- reconciliation.

Provider adapters own:

- provider authentication;
- request/response translation;
- provider-specific identifiers;
- callback verification;
- retries;
- provider error mapping;
- provider-specific reversals/status checks.

DukaFlow should not create a separate sale implementation for each provider.

---

## 22. Offline behavior

Offline operation must not invent external payment confirmation.

For integrated payment methods that require real-time provider confirmation:

```text
Offline
 ↓
Provider confirmation unavailable
 ↓
Do not claim external payment is confirmed
```

The product may support separate manual business workflows where explicitly designed, but those must be clearly distinguished from provider-confirmed payments.

When connectivity returns, pending provider states must be reconciled safely without creating duplicate payments or sales.

---

## 23. Audit requirements

For connection management, record:

- merchant actor;
- organization/shop scope;
- provider;
- action;
- timestamp;
- result;
- reason where relevant;
- approval/consent evidence where required.

For payment transactions, record:

- provider;
- provider transaction/reference identifier where available;
- DukaFlow payment identifier;
- sale or business-event reference;
- amount;
- currency;
- state transitions;
- timestamps;
- confirmation source;
- reconciliation state.

Never place raw secrets in the audit trail.

---

## 24. Provider onboarding and regulatory readiness

Integration with payment networks may require provider-specific commercial, technical, security, legal, or regulatory prerequisites.

DukaFlow must verify those requirements before production launch rather than assuming that an API account alone is sufficient.

For example, current PesaLink fintech integration guidance lists licensing, sponsor-bank, National Payment System, information-security, and privacy requirements for applicable fintech integrations. citeturn902402search14

The exact obligations depend on the DukaFlow business model, provider arrangement, payment flow, and applicable Kenyan requirements and must be validated with the relevant providers and qualified legal/compliance advisors before production use.

---

## 25. Non-negotiable rules

1. **DukaFlow owns the integration platform; the merchant owns the payment relationship and funds.**
2. **Payment integrations are merchant-scoped, not platform-global merchant superuser connections.**
3. **The organization owner or explicitly authorized merchant administrator controls connection setup.**
4. **Shop scope must be explicit.**
5. **Workers use configured integrations; they do not manage merchant credentials during ordinary selling.**
6. **Platform administrators do not routinely see raw merchant payment credentials.**
7. **A payment request is not the same thing as a confirmed payment.**
8. **Provider adapters isolate provider-specific behavior from the core settlement model.**
9. **Disconnecting an integration never deletes historical merchant payment records.**
10. **Merchant ownership or staff changes must not leave former workers with payment authority.**
11. **Subscription restrictions may control DukaFlow capabilities but do not transfer ownership of the underlying merchant payment relationship.**
12. **Offline mode cannot manufacture external payment confirmation.**
13. **All privileged integration-management actions and payment state transitions must be auditable.**
14. **Secrets must be stored and handled through protected infrastructure and must not enter logs or ordinary support workflows.**

## 26. Source-of-truth boundaries

Use this document for:

- merchant-owned payment integrations;
- connection lifecycle;
- provider integration scope;
- credential handling;
- shop-level integration scope;
- payment provider architecture;
- provider confirmation and integration operations.

Use `docs/sales-and-settlement-model.md` for what a sale and settlement mean.

Use `docs/duka-flow-subscription-and-entitlement-model.md` for subscription effects on DukaFlow capabilities.

Use `docs/duka-flow-platform-operating-model.md` for platform-wide operational responsibilities.

Use `docs/platform-administration-and-operations-model.md` for who may exercise platform authority.

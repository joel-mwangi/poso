# DukaFlow Bank Payment Integration Model

**This document is the source of truth for how bank-based payments integrate into DukaFlow. It defines customer-to-shop payments, supplier payments, future merchant-bank connectivity, confirmation, reconciliation, and provider integration boundaries.**

## 1. Core principle

Bank payments are one payment capability inside the common DukaFlow settlement model.

They must not become a separate sales implementation.

```text
Sale
  ↓
Settlement
  ↓
Payment methods
  ├── Cash
  ├── M-Pesa
  ├── Card
  ├── Bank
  └── Pay Later / Deni
```

> **DukaFlow owns the meaning of the payment and settlement. The integration layer owns how a particular bank or payment network creates, confirms, reverses, or reconciles that payment.**

This keeps the core sales model provider-independent while allowing real bank integrations to be added and operated safely.

---

## 2. Bank payments are not the same as cash

Cash can normally be accepted immediately because the worker physically receives it.

A bank payment may require external confirmation.

Therefore the system must distinguish:

```text
Payment recorded
        ≠
Payment confirmed
```

A worker entering a bank reference must not automatically make DukaFlow treat the payment as confirmed.

A bank payment becomes `CONFIRMED` only when DukaFlow has trusted evidence from the configured payment provider, bank, or approved reconciliation process.

---

## 3. Primary customer-to-shop payment flow

When a customer pays a merchant for a sale through a bank-connected payment path:

```text
Worker adds products
        ↓
Cart
        ↓
Sale total
        ↓
Pay Now
        ↓
Bank
        ↓
Customer payment details / approved payment request
        ↓
Bank or payment-network authorization
        ↓
Trusted provider confirmation
        ↓
DukaFlow payment ledger
        ↓
Sale settlement updated
        ↓
Receipt / confirmation
        ↓
Reconciliation
```

The exact customer interaction depends on the selected bank/payment provider. It may use supported bank mobile, internet, USSD, account-to-account, merchant-payment, or other provider-specific flows.

DukaFlow must not assume every bank uses the same customer interaction.

---

## 4. DukaFlow must not become a bank

The merchant's money remains in the merchant's bank/payment account.

Conceptually:

```text
Customer
   ↓
Customer bank / payment network
   ↓
Provider or bank integration
   ↓
Merchant bank account
   ↓
DukaFlow trusted confirmation
   ↓
DukaFlow payment/business records
```

DukaFlow records and reconciles the business event. It does not become the depositor or custodian of customer funds merely because the transaction is recorded in DukaFlow.

---

## 5. Provider-adapter architecture

DukaFlow should use an integration layer instead of embedding a specific bank's API directly in sales logic.

```text
DukaFlow Settlement Engine
        ↓
Payment Integration Layer
        ↓
Bank / Network Adapter
        ↓
Provider API
        ↓
Bank / Payment Network
```

Examples of provider/network adapters may include:

- PesaLink;
- a specific bank payment API;
- another regulated payment provider;
- future account-to-account networks.

The initial architecture should prefer a network/provider capable of reaching multiple Kenyan financial institutions rather than creating a separate bespoke implementation for every bank where a suitable interoperable integration is available.

The exact provider choice remains an implementation and commercial decision.

---

## 6. Customer-to-shop payment states

A bank payment should use explicit states such as:

```text
INITIATED
   ↓
PENDING
   ↓
CONFIRMED
```

or:

```text
PENDING
   ├── FAILED
   ├── EXPIRED
   ├── CANCELLED
   └── EXCEPTION
```

A later correction may produce:

```text
CONFIRMED
   ↓
REVERSED / REFUNDED
```

These states must remain distinct from the sale itself.

For example:

```text
Sale = KSh 2,000
Payment = Bank KSh 2,000
Payment status = PENDING
```

must not be displayed as an already confirmed cash receipt.

---

## 7. Sale completion with bank payment

DukaFlow must define when an accepted sale changes inventory and settlement state.

The sales domain remains the source of truth for whether the customer has taken the goods.

Where a bank payment is required for a sale to be considered settled immediately, the checkout must wait for the required trusted confirmation or follow an explicitly defined pending-sale policy.

The product must never silently assume:

```text
Payment request sent = money received
```

The exact relationship between `SALE_ACCEPTED`, `PAYMENT_PENDING`, and `SETTLED` must remain explicit in the sales/settlement model.

---

## 8. Bank payment plus Deni

Bank payment can be combined with Pay Later / Deni.

Example:

```text
Sale = KSh 5,000
Bank payment = KSh 2,000
Deni = KSh 3,000
```

The settlement is:

```text
Paid now = KSh 2,000
Pay later = KSh 3,000
```

The bank payment still follows its own confirmation lifecycle, while the Deni amount is recorded in the customer Deni ledger according to the sales/settlement rules.

Zero initial payment is still valid:

```text
Sale = KSh 5,000
Bank payment = KSh 0
Deni = KSh 5,000
```

No bank payment request is necessary for that case.

---

## 9. Split payment across bank and other methods

DukaFlow must support supported split settlements without creating a different sale implementation for each combination.

Example:

```text
Sale = KSh 5,000

Bank      KSh 2,000
M-Pesa    KSh 1,500
Cash      KSh   500
Deni      KSh 1,000
                         ─────
                         5,000
```

Each payment component must retain its own:

- payment method;
- amount;
- status;
- external reference where applicable;
- confirmation source;
- timestamps;
- reconciliation state.

The sale/settlement engine calculates the overall settlement result.

---

## 10. Supplier bank payments

Bank integration is not only for customer sales.

DukaFlow should also support merchant-to-supplier payment flows as the purchasing domain matures.

Example:

```text
Supplier balance = KSh 30,000
        ↓
Owner selects supplier payment
        ↓
Bank payment initiated
        ↓
Provider confirmation
        ↓
Payment ledger updated
        ↓
Supplier balance decreases
        ↓
Supplier reconciliation
```

Supplier payment must remain separate from inventory receipt.

```text
Receive stock
    ≠
Pay supplier
```

A supplier may be paid before, after, or separately from receiving depending on the actual business arrangement.

---

## 11. Merchant bank-account connectivity

A later capability may allow a merchant to connect a bank account to DukaFlow for account visibility and reconciliation.

This is different from accepting a customer payment.

Conceptually:

```text
Merchant bank account
        ↓
Authorized bank/API connection
        ↓
Statements / transaction feed
        ↓
DukaFlow reconciliation layer
        ↓
Matched / unmatched business events
```

This capability must never be assumed merely because customer bank payments are supported.

It requires its own:

- consent/authorization flow;
- credential or token management;
- statement/transaction synchronization;
- data mapping rules;
- reconciliation model;
- revocation lifecycle;
- audit trail.

---

## 12. Why a network/provider integration is preferred

DukaFlow is intended to connect shops across Kenya.

Integrating every bank separately would create unnecessary technical and operational duplication where an interoperable network/provider can provide broad coverage.

Therefore, the platform should evaluate an interoperable integration path such as PesaLink before creating many bank-specific customer-payment integrations.

This is a design preference, not a requirement to use one provider forever.

A provider may be replaced or supplemented if commercial coverage, reliability, compliance, pricing, or merchant needs justify it.

---

## 13. External confirmation requirements

For any provider-backed bank payment, DukaFlow must define the trusted confirmation source.

Possible confirmation mechanisms may include:

- signed provider callback/webhook;
- provider transaction-status query;
- provider API response explicitly indicating confirmed completion;
- approved reconciliation feed;
- controlled manual reconciliation when no real-time confirmation exists.

A worker-typed reference alone is not sufficient proof of payment for a payment path that requires external verification.

---

## 14. Failure and uncertain states

Bank payments can remain uncertain.

Examples:

```text
Request sent
   ↓
Provider timeout
```

The system must not assume either success or failure merely because the request timed out.

It should preserve:

- operation identity;
- external reference if available;
- current payment state;
- retry/requery state;
- reconciliation state;
- timestamps;
- audit evidence.

Where the provider supports transaction-status queries, DukaFlow should be able to re-query before allowing a duplicate payment attempt when appropriate.

---

## 15. Reversal and refund

A confirmed bank payment may later be reversed or refunded according to provider capability and merchant authority.

The original payment event should remain historical.

```text
Original payment
      ↓
Reversal / refund event
      ↓
Updated financial state
```

Do not delete the original payment record.

Where a refund is only possible outside DukaFlow, the system should still record the relevant business event and reconciliation state according to the refund workflow.

---

## 16. Permissions and approvals

Bank payment actions must respect merchant permissions.

Potential permissions include:

- initiate customer bank payment;
- view pending payment state;
- retry/query payment status;
- record approved manual bank payment;
- initiate supplier bank payment;
- approve supplier payment;
- issue/refund bank payment where supported;
- reconcile bank payments;
- connect/revoke a merchant bank account.

Permissions remain merchant permissions; bank integration does not create user roles automatically.

High-risk actions may require separate approval.

For example:

```text
Worker requests supplier payment
        ↓
Authorized approver
        ↓
Payment initiated
```

A person requesting an exceptional payment should not automatically approve their own request when the merchant has configured separation of duties.

---

## 17. Secrets and bank credentials

Bank integrations must not expose raw credentials to ordinary staff or platform operators.

Where the provider supports OAuth or token-based authorization, DukaFlow should prefer scoped tokens over storing reusable user passwords.

Secret handling must follow the platform secret-management rules:

- minimize human visibility;
- store secrets in protected infrastructure;
- never place secrets in logs;
- rotate/revoke when required;
- audit lifecycle operations;
- separate secret access from merchant business permissions.

Connecting a merchant bank account must never grant the platform operator ordinary business authority over the merchant's shop.

---

## 18. Offline behavior

A bank payment that requires an external provider cannot be considered externally confirmed while the device is offline.

The system may preserve a pending/local business intention if the product explicitly supports it, but it must not fabricate a confirmed bank payment.

Offline capability therefore means:

```text
Offline
  ↓
No trusted bank confirmation available
  ↓
Cannot claim bank payment confirmed
```

The merchant can continue using other supported offline payment paths such as cash, and can use Deni when authorized.

---

## 19. Reconciliation model

Bank payment reconciliation should compare DukaFlow records with trusted provider/bank records.

Conceptually:

```text
DukaFlow payment record
        ↕
Provider / bank transaction
        ↓
MATCHED
UNMATCHED
DUPLICATE
MISSING
AMOUNT MISMATCH
REVERSAL MISMATCH
```

The reconciliation process should never silently rewrite the original transaction.

Exceptions must remain visible until resolved.

---

## 20. National-platform operational requirements

At national scale, bank integrations become a platform operational dependency.

DukaFlow should monitor, without exposing unnecessary merchant business details:

- provider availability;
- request latency;
- callback/webhook health;
- status-query health;
- failure rates;
- timeout rates;
- duplicate/replay signals;
- reconciliation backlog;
- credential/token expiry;
- integration configuration errors.

A provider outage must not be confused with a merchant transaction failure.

Merchant-facing messaging should explain when a payment provider is unavailable and offer supported alternatives where appropriate.

---

## 21. Provider abstraction rules

The DukaFlow sales and settlement model must not depend on:

- a particular bank;
- a particular payment network;
- a particular API request shape;
- a provider-specific status string;
- provider-specific credentials.

Instead, the integration adapter translates provider-specific behavior into DukaFlow's common payment concepts.

For example:

```text
Provider-specific
INITIATED / PROCESSING / COMPLETED / REVERSED

        ↓ adapter

DukaFlow
PENDING / CONFIRMED / FAILED / EXPIRED / REVERSED
```

The provider may use different terminology internally, but DukaFlow's domain remains stable.

---

## 22. Core business invariants

For an accepted sale:

```text
Sale total
=
Paid now
+
Pay later / Deni
```

Where a bank payment contributes to `Paid now`, the amount counted as confirmed payment must satisfy the configured confirmation rules.

A provider request that is still pending must not be treated as confirmed money simply because the requested amount equals the sale total.

For a supplier payment:

```text
Supplier payable
-
Confirmed supplier payment
=
Remaining supplier payable
```

A pending provider transaction must not silently reduce the payable as if the money were confirmed unless the supplier-payment domain explicitly defines a pending state.

---

## 23. Integration lifecycle

Every bank integration should have an explicit lifecycle:

```text
Provider selected
      ↓
Commercial / technical onboarding
      ↓
Sandbox / test environment
      ↓
Credentials or authorization configured
      ↓
Payment initiation tested
      ↓
Confirmation tested
      ↓
Failure/retry tested
      ↓
Reversal/refund tested where supported
      ↓
Reconciliation tested
      ↓
Production rollout
      ↓
Continuous monitoring
```

Production rollout should be staged and reversible where practical.

---

## 24. Security and privacy boundary

Bank integration increases the sensitivity of payment data.

DukaFlow must minimize the information stored and should avoid collecting unnecessary customer bank credentials.

The preferred model is:

```text
Customer authorizes payment with the bank/provider
        ↓
Provider confirms result
        ↓
DukaFlow stores the payment/business evidence needed for operations
```

DukaFlow should not ask customers to provide bank passwords or PINs to a DukaFlow worker.

---

## 25. Source-of-truth boundaries

Use this document for:

- bank payment integration architecture;
- customer-to-shop bank payments;
- supplier bank payments;
- merchant bank-account connectivity;
- provider confirmation;
- provider adapters;
- bank-payment reconciliation.

Use `docs/sales-and-settlement-model.md` for **what sales and settlement mean**.

Use the payment integration model for **how M-Pesa, cards, banks, and future payment providers integrate with the common settlement system**.

Use `docs/user-responsibilities.md` for **who may perform bank-related merchant actions**.

Use `docs/duka-flow-platform-operating-model.md` for **platform operational requirements**.

---

## Final principle

> **DukaFlow should make bank payments feel like a normal payment method inside one settlement system, while keeping bank/provider complexity behind a controlled integration layer.**

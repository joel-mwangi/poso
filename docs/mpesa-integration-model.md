# DukaFlow M-Pesa Integration Model

**This document is the source of truth for M-Pesa as a first-class DukaFlow payment capability and for its live external integration. M-Pesa is not omitted from the product model or treated as an optional afterthought.**

## 1. Core decision

DukaFlow will support M-Pesa as a first-class payment capability.

The payment domain must be designed around DukaFlow's own sale and settlement semantics, with M-Pesa implemented as an external payment integration behind that domain.

Safaricom's current Daraja platform provides M-Pesa APIs for application integrations, including Customer-to-Business and transaction-related capabilities. The exact production flow must follow the current Daraja requirements and approved integration pattern at implementation time. citeturn867889search1turn867889search2turn867889search0

## 2. M-Pesa does not define the sale model

DukaFlow owns the meaning of:

```text
Sale
↓
Settlement
├── Pay Now
│   ├── Cash
│   ├── M-Pesa
│   └── other supported immediate methods
└── Take Pay Later / Deni
```

M-Pesa is one settlement mechanism. It must not redefine what a sale, Deni, stock movement, customer balance, or merchant permission means.

## 3. Required integration boundary

```text
DukaFlow checkout
        ↓
DukaFlow sale / settlement domain
        ↓
Payment integration layer
        ↓
M-Pesa adapter
        ↓
Daraja / Safaricom
        ↓
Trusted provider response / callback
        ↓
DukaFlow payment state
        ↓
Reconciliation
```

The integration layer must isolate external-provider behavior from the merchant business domain.

## 4. Payment lifecycle

The integration must distinguish at least:

```text
Created / initiated
↓
Pending
↓
Confirmed
```

and failure/exception states such as:

```text
Failed
Expired
Rejected
Reversed
Refunded
Reconciliation exception
```

A worker-entered reference is not automatically equivalent to trusted provider confirmation.

## 5. Checkout behavior

DukaFlow must support:

### Full M-Pesa payment

```text
Sale = KSh 1,000
M-Pesa = KSh 1,000
Deni = KSh 0
```

### M-Pesa + Deni

```text
Sale = KSh 1,000
M-Pesa = KSh 300
Deni = KSh 700
```

### Cash + M-Pesa

```text
Sale = KSh 1,000
Cash = KSh 400
M-Pesa = KSh 600
Deni = KSh 0
```

### Cash + M-Pesa + Deni

```text
Sale = KSh 1,500
Cash = KSh 300
M-Pesa = KSh 500
Deni = KSh 700
```

### Full Deni without initial payment

```text
Sale = KSh 1,000
M-Pesa = KSh 0
Cash = KSh 0
Deni = KSh 1,000
```

M-Pesa availability must never make these Deni cases invalid.

## 6. Trusted confirmation

DukaFlow must distinguish:

**payment requested**
from
**payment actually confirmed**.

The system must not report an M-Pesa payment as confirmed merely because:

- the worker typed a transaction code;
- the customer showed a phone screen;
- the initiation request succeeded;
- the app timed out after sending a request.

The trusted settlement state must come from the approved M-Pesa integration flow and its verification rules.

## 7. Sale and inventory semantics

M-Pesa confirmation must not silently redefine when a sale exists.

The sales/settlement model remains authoritative for:

- when a sale is accepted;
- the sale total;
- payment-now amount;
- Deni amount;
- stock effect;
- customer ledger effect.

External payment states must be represented explicitly so a pending or failed M-Pesa interaction cannot accidentally create contradictory financial history.

## 8. Reconciliation

M-Pesa integration must support reconciliation between:

```text
DukaFlow payment records
        ↕
M-Pesa provider confirmation / transaction records
```

Reconciliation must identify:

- confirmed payments;
- missing confirmations;
- duplicate callbacks;
- failed or expired requests;
- reversals/refunds;
- mismatched amounts;
- unmatched references;
- other provider exceptions.

A reconciliation problem must create an explicit exception workflow rather than silently rewriting merchant sales.

## 9. Credentials and secrets

M-Pesa credentials and integration secrets are platform infrastructure.

They must:

- remain server-side;
- never be stored in ordinary merchant records;
- never be exposed in application logs;
- be scoped to the appropriate merchant/integration context;
- support rotation and revocation;
- have auditable lifecycle events.

Platform operators may manage the integration lifecycle without routinely seeing raw secret values, consistent with the platform administration model.

## 10. Failure handling

The integration must handle:

- provider timeout;
- unavailable provider;
- delayed confirmation;
- duplicate callbacks;
- callback delivery failure;
- wrong amount;
- wrong reference;
- rejected request;
- expired request;
- reversal/refund;
- merchant/device connectivity loss.

The merchant must be told clearly whether the payment is:

**confirmed, pending, failed, or requires attention.**

## 11. Offline operation

Offline selling must not depend on live M-Pesa connectivity.

When the merchant is offline:

- supported sales and Deni operations continue according to the normal offline rules;
- a live provider confirmation cannot be invented;
- M-Pesa payment operations requiring live external confirmation must remain explicitly pending/unavailable until connectivity returns;
- synchronization must revalidate authorization and domain rules.

The system must not turn offline status into false M-Pesa confirmation.

## 12. Merchant configuration

The owner may configure which supported payment methods the shop accepts.

M-Pesa configuration should include only the controls actually needed for the integration, such as:

- whether M-Pesa is enabled for the shop;
- the approved integration/account relationship;
- required settlement configuration;
- operational status.

Configuration must not expose provider secrets to ordinary shop staff.

## 13. Permissions

M-Pesa actions remain subject to the merchant access model.

Potential permissions include:

- record payment;
- initiate M-Pesa payment;
- view payment status;
- verify/reconcile payment;
- handle payment exceptions;
- process authorized reversal/refund workflows.

A permission template may bundle these for convenience, but explicit permissions remain the source of authorization.

## 14. Refunds and reversals

M-Pesa reversals/refunds are external payment operations and must be represented separately from the original sale.

The original sale remains historical business truth.

A reversal/refund creates an explicit financial event and must be reconciled against the provider response.

Safaricom currently exposes a Daraja reversal API, so the implementation should account for a provider-side reversal lifecycle rather than assuming payments are permanently final. citeturn867889search0

## 15. Platform operations

Once live integration is enabled, platform operations must monitor the integration at the service level, including:

- provider availability;
- callback health;
- failed requests;
- pending-payment age;
- reconciliation backlog;
- credential health;
- integration error rates;
- abnormal activity.

This is platform service monitoring, not permission to operate merchant sales directly.

## 16. National-platform scale

DukaFlow should be able to support many independent merchant organizations using M-Pesa without creating a single uncontrolled shared merchant credential or unrestricted administrator path.

The integration must scale through:

- tenant-scoped configuration;
- secure credential management;
- service-to-service authorization;
- idempotent payment operations;
- provider callback verification;
- reconciliation jobs;
- audit trails;
- operational monitoring.

## 17. Non-negotiable rules

1. **M-Pesa is a first-class DukaFlow payment capability.**
2. **Live M-Pesa integration is part of the intended product architecture, not a permanently deferred capability.**
3. **M-Pesa does not redefine the sale or Deni model.**
4. **Trusted M-Pesa confirmation must come from the approved integration flow, not a typed reference alone.**
5. **Pending, failed, confirmed, reversed, and refunded payment states must remain distinct.**
6. **M-Pesa integration must not make Deni or offline core selling depend on live provider availability.**
7. **Merchant secrets remain protected and server-side.**
8. **Every M-Pesa payment mutation must be idempotent and auditable.**
9. **Reconciliation exceptions must be explicit and recoverable.**
10. **The integration must scale across independent merchant organizations without creating unrestricted platform access to merchant transactions.**

## 18. Source-of-truth boundaries

Use this document for **M-Pesa integration behavior and operational requirements**.

Use `docs/sales-and-settlement-model.md` for **what sales, Pay Now, Pay Later/Deni, and settlement mean**.

Use `docs/duka-flow-platform-operating-model.md` for **platform-wide operations, secrets, incidents, and support boundaries**.

Use `docs/duka-flow-mvp-and-implementation-roadmap.md` for **implementation sequencing and completion criteria**.

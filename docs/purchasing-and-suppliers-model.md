# DukaFlow Purchasing & Suppliers Model

**This document is the source of truth for how DukaFlow records stock purchases, supplier relationships, received goods, purchase costs, supplier payments, supplier balances, returns, and purchase history.**

**Source relationships:**

- `docs/user-responsibilities.md` defines who may perform purchasing and supplier actions.
- `docs/user-lifecycle-and-access-governance.md` defines who may grant or change those permissions.
- `docs/post-authentication-access-and-first-screen.md` defines the authorized runtime context.
- `docs/user-workspace-and-daily-workflow.md` defines where purchasing work appears.
- `docs/inventory-and-stock-model.md` defines the stock created or changed by receiving purchases.
- `docs/sales-and-settlement-model.md` defines downstream sales and Pay Later/Deni activity.
- `docs/cash-and-financial-reconciliation-model.md` defines cash and financial effects of supplier payments and purchasing outflows.

## 1. Core question

DukaFlow should help the shop answer:

> **What did we buy, from whom, at what cost, what did we actually receive, what have we paid, and what do we still owe the supplier?**

Purchasing must work for a tiny duka buying a few items for cash and for a larger shop receiving regular deliveries from multiple suppliers.

## 2. Supplier is not the same as a purchase

A supplier is the business relationship.

A purchase is a specific business event.

```text
Supplier
   ↓
Purchase / order
   ↓
Received goods
   ↓
Inventory
   ↓
Supplier payable
   ↓
Payment / settlement
```

A supplier may have many purchases, payments, returns, and outstanding balances.

## 3. Supplier profile

A practical supplier record may include:

- supplier ID;
- business/display name;
- phone/contact details where provided;
- optional email/address;
- notes where permitted;
- organization scope;
- status;
- creation/update timestamps.

The system should not force a shop to enter a large enterprise supplier profile before making its first purchase.

## 4. Purchasing scenarios DukaFlow must support

### Scenario A — Cash purchase

```text
Supplier delivers goods
 ↓
Shop receives them
 ↓
Purchase recorded
 ↓
Shop pays supplier immediately
 ↓
Supplier balance = KSh 0
```

### Scenario B — Supplier credit

```text
Purchase received: KSh 20,000
Paid now: KSh 0
Supplier owes/payable: KSh 20,000
```

The shop has received the goods and now owes the supplier.

### Scenario C — Part payment

```text
Purchase: KSh 20,000
Paid now: KSh 8,000
Outstanding supplier balance: KSh 12,000
```

### Scenario D — Partial delivery

```text
Ordered: 100 units
Received: 70 units
Outstanding delivery: 30 units
```

The stock record must reflect what was actually received, not what was merely ordered.

### Scenario E — Purchase return

```text
Received: 50 units
Returned to supplier: 5
Net received: 45
```

The return should reference the originating purchase/receipt event.

### Scenario F — Multiple suppliers

The same product may be purchased from different suppliers at different costs. Supplier identity must not replace the product identity.

## 5. Purchase lifecycle

A purchase may move through states such as:

```text
Draft / planned
   ↓
Ordered (optional)
   ↓
Partially received
   ↓
Fully received
   ↓
Settled / outstanding
   ↓
Closed / historical
```

Not every shop needs an order workflow. A shop should be able to record a direct walk-in or delivered purchase without first creating a purchase order.

## 6. Purchase versus receipt

The domain must distinguish:

**What was ordered** from **what was physically received**.

A purchase order, where supported, is planning/commitment information.

A receiving event is evidence of goods entering the shop.

Inventory should increase based on accepted receiving information, not merely because an order was created.

## 7. Receiving stock

When goods arrive, the user should be able to confirm:

- supplier;
- shop receiving the goods;
- products;
- quantities actually received;
- purchase unit/cost;
- batch/expiry information where supported;
- delivery/reference information where useful;
- any quantity shortages or rejected goods.

The receiving event should create the corresponding inventory movements described in `docs/inventory-and-stock-model.md`.

## 8. Purchase cost

A purchase should preserve the actual cost information relevant to the received goods.

DukaFlow should distinguish:

- supplier quoted/expected price;
- actual received unit cost;
- additional costs where explicitly supported;
- historical cost used for inventory valuation/profit analysis.

The client must not be able to silently rewrite historical purchase cost after the purchase is accepted.

## 9. Supplier payment

Supplier payment is separate from receiving goods.

A shop may:

- pay immediately;
- pay partially;
- pay later;
- make multiple repayments against one supplier balance.

Example:

```text
Purchase = KSh 50,000
Paid today = KSh 20,000
Supplier payable = KSh 30,000
```

The later KSh 30,000 payment is a financial event linked to the supplier payable. It is not a new purchase.

## 10. Supplier payable ledger

Supplier balances should be explainable through ledger events rather than a single overwritten number.

Example:

```text
Opening payable          KSh 10,000
New purchase             +KSh 30,000
Supplier payment         -KSh 20,000
Purchase return          -KSh  5,000
Adjustment               +KSh  1,000
-----------------------------------
Current payable          KSh 16,000
```

The system should be able to answer:

> **Why do we currently owe this supplier KSh 16,000?**

## 11. Supplier payments must connect to cash

A supplier payment changes the shop's financial position.

The purchase domain should identify the payable being settled, while the cash/financial model records the actual money movement.

For example:

```text
Supplier payable
      ↓
Payment decision
      ↓
Cash / M-Pesa / other supported outflow
      ↓
Financial reconciliation
```

The same payment must not be counted twice in financial reporting.

## 12. Inventory effect

Accepted receiving events increase shop inventory according to the inventory model.

A purchase record by itself should not duplicate inventory.

The system should have one authoritative receiving event for the physical goods entering the shop.

Likewise, supplier returns should create the appropriate inventory out movement.

## 13. Returns and discrepancies

DukaFlow should support explicit handling of:

- damaged goods;
- short deliveries;
- excess deliveries;
- wrong products;
- rejected goods;
- supplier returns.

The system should record the reason and preserve the relationship to the original receiving/purchase event.

## 14. Supplier credit is not the same as customer Deni

These are mirror concepts but separate business relationships.

```text
Customer takes goods on Pay Later
→ shop has a receivable

Shop receives goods and pays supplier later
→ shop has a payable
```

They must not share a single generic “credit” field or ledger.

## 15. Multi-shop purchasing

A supplier may serve multiple shops within one organization.

Each purchase/receiving event must belong to a specific shop.

A central buyer may create a purchase intended for one shop or coordinate allocation across several shops, but inventory ownership and financial effects must remain explainable by shop.

Where stock is centrally received and later transferred, the inventory transfer rules should be used rather than pretending the second shop directly purchased the stock.

## 16. Product and supplier relationship

The same product may have:

- multiple suppliers;
- different supplier costs;
- different pack sizes;
- different lead times;
- different purchasing terms.

Supplier data should enrich the product record without making a product unique to one supplier.

Where useful, DukaFlow may remember:

- preferred supplier;
- last purchase cost;
- historical purchase costs;
- typical order quantity;
- supplier-specific pack/unit information.

These are purchasing insights, not the product's core identity.

## 17. Purchase corrections

Once a purchase or receiving event is accepted, it should become historical business data.

Corrections should use explicit events such as:

- receiving correction;
- supplier return;
- payable adjustment;
- payment reversal;
- purchase cancellation before receipt.

Do not silently edit history in a way that makes inventory, supplier balance, or financial reconciliation impossible to explain.

## 18. Approvals and permissions

The User Access Model remains the security boundary.

Possible underlying permissions may include:

- create supplier;
- create purchase;
- receive stock;
- edit draft purchase;
- confirm receipt;
- make supplier payment;
- record supplier return;
- view supplier balances;
- approve purchase above a threshold;
- approve purchasing corrections.

Permission templates are convenience bundles only.

High-risk purchasing actions may require explicit approval.

## 19. Offline purchasing

Where offline purchasing is supported, the device may record locally accepted receiving/purchase operations using locally provisioned data and permissions.

The device must not gain new purchasing authority while offline.

Synchronization must use stable operation identities to prevent duplicate inventory receipts or duplicate supplier payments.

External payment confirmation should not be invented because a supplier payment was entered while offline.

## 20. Duplicate prevention

Purchase and receiving mutations need stable operation identities or equivalent idempotency protection.

Retrying the same operation must not create:

- duplicate received stock;
- duplicate supplier payables;
- duplicate supplier payments;
- duplicate returns.

## 21. Supplier statements

The shop should be able to view an explainable supplier statement showing:

- purchases;
- receipts/returns;
- payments;
- adjustments;
- current outstanding balance.

The statement should distinguish goods received from money paid.

## 22. Purchasing insights

As reliable history accumulates, DukaFlow may help answer:

- What products are bought most often?
- Which supplier usually gives the best cost?
- Which supplier terms are most favorable?
- Which products are increasing in purchase cost?
- Which suppliers are consistently short-delivering?
- What purchases are due for payment?
- Which products may need reordering?

These insights should be derived from recorded purchasing history rather than guesses.

## 23. Real-world workflow for a small shop

A typical small-shop experience should remain simple:

```text
Goods arrive
 ↓
Tap Receive Stock
 ↓
Choose supplier / quick-add supplier
 ↓
Search or select products
 ↓
Enter quantities actually received
 ↓
Enter purchase cost
 ↓
Choose:
  Pay Now
  OR
  Pay Later / supplier credit
 ↓
Confirm
 ↓
Stock increases
 ↓
Supplier balance updates
 ↓
Financial records update
```

The shop should not be forced to create a formal purchase order if its real workflow is simply receiving goods from a supplier.

## 24. Real-world workflow for a larger shop

A larger shop may use:

```text
Purchase request
 ↓
Purchase order
 ↓
Supplier delivery
 ↓
Receiving check
 ↓
Partial/complete receipt
 ↓
Inventory update
 ↓
Supplier payable
 ↓
Payment approval
 ↓
Payment
 ↓
Reconciliation
```

Both small and large workflows should map to the same underlying business concepts.

## 25. Business invariants

For an accepted receiving event:

```text
Received quantity > 0 where a line is received
```

and:

```text
Inventory increase
=
Accepted received quantity
```

For supplier settlement:

```text
Opening payable
+
Purchases/approved payable increases
-
Payments
-
Returns/credits
+
Adjustments
=
Current payable
```

For a cash-paid purchase:

```text
Purchase/receipt recorded
+
Supplier payment recorded
+
Financial outflow recorded
```

The system must not duplicate one financial movement in multiple places.

## 26. What DukaFlow must never assume

DukaFlow must never assume:

- every purchase starts with a formal purchase order;
- every supplier requires credit;
- every purchase is paid immediately;
- everything ordered is actually received;
- receiving goods means the supplier has already been paid;
- supplier credit is the same thing as customer Deni;
- one product has only one supplier;
- a supplier payment is a purchase;
- a purchase return should delete the original purchase;
- offline supplier payment entry proves money was transferred;
- stock should increase merely because an order was created.

## 27. Source-of-truth boundaries

Use:

- `docs/user-responsibilities.md` for **who may perform purchasing/supplier actions**.
- `docs/user-lifecycle-and-access-governance.md` for **who may grant/change those permissions**.
- `docs/post-authentication-access-and-first-screen.md` for **current authorization context**.
- `docs/user-workspace-and-daily-workflow.md` for **where purchasing appears**.
- `docs/inventory-and-stock-model.md` for **inventory consequences of receiving/returning goods**.
- `docs/cash-and-financial-reconciliation-model.md` for **actual money movements and reconciliation**.
- This document for **purchases, suppliers, receiving, supplier payables, returns, and purchasing history**.

Any conflicting purchasing/supplier rule should be resolved in favor of this document for this domain.

## 28. Completion definition

Purchasing and supplier management are not complete merely because a user can enter a purchase form.

They are complete when DukaFlow can reliably handle, test, audit, and synchronize:

- supplier creation;
- direct purchases without purchase orders;
- purchase orders where useful;
- partial and complete receiving;
- actual received quantities;
- purchase cost history;
- supplier credit/payables;
- full and partial supplier payments;
- supplier returns;
- purchasing corrections;
- stock effects;
- financial effects;
- multi-shop purchasing scope;
- offline behavior where supported;
- idempotent synchronization;
- permission and approval enforcement;
- supplier statements and auditable history.

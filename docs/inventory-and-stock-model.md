# DukaFlow Inventory & Stock Model

**This document is the source of truth for how DukaFlow creates, represents, changes, reconciles, and explains shop stock.**

**Source relationships:** `docs/user-responsibilities.md` defines who may access inventory; `docs/user-lifecycle-and-access-governance.md` defines who may grant/change that access; `docs/post-authentication-access-and-first-screen.md` defines how the authorized operational context is established; `docs/user-workspace-and-daily-workflow.md` defines where inventory actions live in the authenticated workspace.

## 1. Purpose

DukaFlow must help the merchant answer one simple question:

> **What stock do I actually have right now?**

The answer must be trustworthy enough for a merchant to use DukaFlow every day to decide what to sell, reorder, count, receive, transfer, or investigate.

DukaFlow must work for:

- a one-person duka;
- a small staffed shop;
- a minimart;
- a supermarket;
- multiple shops under one organization.

The system must not require barcode scanners, desktop computers, or dedicated POS hardware for the core stock workflow.

---

## 2. Core inventory model

Stock is not just a number stored on a product.

DukaFlow should distinguish:

```text
Product definition
      ↓
Shop-specific stock record
      ↓
Opening / received / sold / adjusted movements
      ↓
Current stock balance
      ↓
Stock history
      ↓
Stock understanding / alerts
```

The current balance is derived from trustworthy stock events and is never changed silently.

---

## 3. Product versus shop stock

A product describes **what the item is**.

A shop stock record describes **how much of that product this shop currently has**.

Example:

```text
Product
  Name: Unga Jogoo 2kg
  SKU: UJ2KG
  Unit: packet

Shop A
  On hand: 18

Shop B
  On hand: 7
```

One product may therefore exist in multiple shops while each shop maintains its own stock balance.

---

## 4. Minimum product information

A product should be able to store at least:

- product ID;
- product name;
- category;
- selling unit;
- selling price;
- cost information where authorized;
- active/inactive state;
- SKU or barcode where available;
- low-stock threshold;
- optional supplier information when purchasing is implemented.

Barcode is optional.

A merchant must be able to find products by search, recent items, categories, favorites, or other phone-friendly selection methods.

---

## 5. Creating inventory

Creating a product does **not** automatically mean the shop has stock.

The merchant must establish the starting quantity.

For a new shop:

```text
Create product
   ↓
Set selling/cost information
   ↓
Enter opening quantity
   ↓
Record opening-stock event
   ↓
Current stock becomes available
```

Opening stock must be recorded as an explicit inventory event so that the origin of the current quantity is explainable.

---

## 6. Opening stock

Opening stock is the merchant's starting physical count when bringing a product into DukaFlow.

Example:

```text
Unga Jogoo 2kg
Opening quantity: 30
```

DukaFlow records:

```text
Opening stock +30
```

The system should retain:

- who entered it;
- when it was entered;
- which shop it belongs to;
- the quantity;
- the reason/context;
- device/session information where available.

Large opening-stock corrections may require approval depending on merchant configuration.

---

## 7. How stock increases

Stock may increase through several legitimate events.

### Receiving stock

```text
Supplier delivery
      ↓
Receive quantity
      ↓
Inventory movement +
      ↓
Stock balance increases
```

### Transfer in

```text
Shop A
  ↓
Transfer out
  ↓
Shop B
  ↓
Transfer in
```

The two shop balances must remain consistent with the transfer workflow.

### Approved adjustment

Used when physical stock differs from system stock and the difference has a documented reason.

### Return to stock

A valid customer return may increase stock when the returned item is physically saleable and the configured return rules allow it.

---

## 8. How stock decreases

Stock may decrease through:

- completed sales;
- approved stock write-offs;
- damaged/expired items;
- transfer out;
- other explicit inventory events.

A sale should normally create the stock reduction automatically.

The cashier should **not** need to manually reduce stock after completing a sale.

---

## 9. The sale-to-stock rule

This is one of DukaFlow's most important invariants.

```text
Sale completed
     ↓
Sale lines finalized
     ↓
Inventory movement generated
     ↓
Stock balance decreases
     ↓
Audit/history updated
```

A sale cannot silently complete while its inventory effect disappears.

The system must protect against:

- duplicate stock deductions;
- partial deductions;
- retry duplication;
- unauthorized shop IDs;
- selling an inactive product;
- cross-shop product references.

Offline sales must preserve the same business meaning when synchronized.

---

## 10. Stock movements are the history

DukaFlow should treat inventory movements as the explanation for stock.

Typical movement types include:

- `opening`
- `purchase_receive`
- `sale`
- `return_to_stock`
- `damage`
- `expiry`
- `transfer_in`
- `transfer_out`
- `count_adjustment`
- `manual_adjustment`
- `correction_reversal`

Every movement should have enough context to explain why the balance changed.

Example:

```text
Opening          +30
Purchase         +10
Sale              -7
Damage            -2
Transfer out      -5
--------------------
Current stock     26
```

The merchant should be able to inspect the history behind the current number.

---

## 11. Never silently overwrite stock

DukaFlow should avoid actions such as:

> Set Unga quantity from 26 to 20.

without context.

Instead:

> Physical count found 20; record a count adjustment of -6 with a reason.

This protects trust and makes investigation possible.

---

## 12. Physical stock counts

A stock count compares what is physically present with what DukaFlow expects.

```text
System stock: 26
Physical count: 20
Variance: -6
```

The worker should be able to record the count.

DukaFlow then determines whether the difference can be posted directly or requires approval.

Possible flow:

```text
Start count
   ↓
Count items
   ↓
Compare expected vs actual
   ↓
Show variances
   ↓
Enter reason
   ↓
Apply adjustment or request approval
   ↓
Record audit event
```

A count should not rewrite the old movement history.

---

## 13. Damaged, expired, lost, or stolen stock

Stock that cannot be sold should not simply disappear.

DukaFlow should support explicit reasons such as:

- damaged;
- expired;
- spoiled;
- broken;
- missing/lost;
- theft/suspected theft;
- other merchant-defined reason.

The exact reason may affect reporting and approval requirements.

Sensitive reasons such as suspected theft should have stronger audit controls.

---

## 14. Stock transfers between shops

For organizations with multiple shops, stock may move between shops.

A transfer should be treated as a controlled business event.

```text
Transfer requested
      ↓
Approval if required
      ↓
Source stock decreases
      ↓
Destination stock increases
      ↓
Transfer completed
      ↓
Audit trail
```

A partially completed transfer must have an explicit state rather than silently changing both balances.

---

## 15. Negative stock

Negative stock should not be treated as an invisible normal state.

The product should define a merchant policy such as:

- prevent selling when stock is insufficient;
- allow controlled negative stock with a visible warning; or
- allow negative stock only for selected products/configurations.

Whatever policy is chosen, it must be explicit and auditable.

The system should not unexpectedly block a merchant from completing a legitimate sale without explaining why.

---

## 16. Low-stock understanding

Low stock is not only a threshold.

DukaFlow should eventually combine:

- current quantity;
- sales velocity;
- supplier lead time;
- safety stock;
- recent demand patterns.

Basic first version:

```text
Current quantity <= merchant low-stock threshold
        ↓
Low-stock alert
```

Later:

```text
Current stock
   +
Recent sales rate
   +
Supplier lead time
   +
Safety stock
   ↓
Estimated days remaining
   ↓
Restock recommendation
```

Advanced recommendations are estimates and must be distinguishable from recorded facts.

---

## 17. Unit of measure

DukaFlow should support practical shop units.

Examples:

- piece;
- packet;
- bottle;
- kilogram;
- gram;
- litre;
- box;
- crate.

Products may eventually require conversions, such as:

```text
1 carton = 24 bottles
```

But conversion logic should be introduced carefully because incorrect conversions can corrupt stock.

The initial implementation should support a clear base unit and avoid hidden conversions.

---

## 18. Pricing and stock are different

Changing a selling price must not change stock quantity.

Changing cost information must not rewrite historic stock movement quantities.

Historical profitability should use the appropriate historical cost context where available.

Example:

```text
Yesterday:
Cost = KSh 90

Today:
Cost = KSh 100

Historic transactions remain based on their applicable historical context.
```

---

## 19. Who can do what with stock

Permissions come from `docs/user-responsibilities.md` and governance comes from `docs/user-lifecycle-and-access-governance.md`.

Typical capability boundaries:

### Sales permission

- sells products;
- causes automatic stock reduction through completed sales;
- should not directly rewrite stock quantity.

### Inventory permission

- views stock;
- receives stock;
- performs or records counts;
- records damages/expiry;
- performs permitted adjustments.

### Approval authority

- approves sensitive adjustments;
- approves high-risk corrections;
- handles configured transfer/refund or variance approvals.

### Owner

- has organization-level authority;
- configures inventory policy;
- can oversee all shop stock;
- controls who receives inventory permissions.

A template such as “Inventory” is only a convenience bundle. Explicit permissions and shop scope remain the actual authorization boundary.

---

## 20. Stock visibility

A user should see stock only within their authorized shop scope and data-visibility rules.

Examples:

- one-shop worker → that shop's stock;
- multi-shop worker → stock for the selected active shop, unless explicit broader visibility is granted;
- owner → organization/shop views according to owner-level capabilities;
- public users → no private stock unless explicitly published as public product availability.

Cost prices and sensitive inventory information may require narrower visibility than ordinary stock quantities.

---

## 21. Offline stock behavior

DukaFlow is offline-first for ordinary shop operations, but offline behavior must remain controlled.

### Allowed offline examples

- view locally provisioned stock;
- complete supported sales;
- generate local inventory movements associated with those sales;
- record supported receiving/count operations if the product explicitly permits them offline.

### Online-required or high-risk examples

Depending on configuration:

- changing permissions;
- changing inventory policy;
- approving high-risk adjustments;
- changing organization settings;
- administrative bulk operations.

When reconnecting:

```text
Local operation
   ↓
Authenticate/revalidate
   ↓
Check organization
   ↓
Check shop assignment
   ↓
Check permission
   ↓
Check business invariants
   ↓
Idempotently apply
```

A revoked user/device must not keep privileged inventory authority simply because it once had cached data.

---

## 22. Inventory integrity and idempotency

Inventory mutations must be safe under retries.

Every operation that changes stock should have a stable operation identity.

For example:

```text
operation_id = device/user generated stable ID
```

If the same operation is retried:

```text
First request  → applied
Retry          → recognized as duplicate
Result         → no second stock effect
```

This is essential for unreliable connectivity.

---

## 23. Cross-shop and cross-organization protection

Inventory must never cross tenant or shop boundaries accidentally.

A request such as:

```text
adjust stock in Shop B
```

must fail when the authenticated user is only authorized for Shop A.

The backend/database authorization layer must verify the organization, shop assignment, permission, and any approval requirements.

A client-provided `shop_id` is not authorization proof.

---

## 24. Stock auditability

Important stock events should record:

- user;
- organization;
- shop;
- product;
- movement type;
- quantity;
- reason where applicable;
- timestamp;
- device/session where available;
- related sale/purchase/transfer/count/reference;
- approval information where applicable.

The merchant should be able to answer:

> **Why did this product go from 26 units to 20 units?**

and get an explanation from the movement history.

---

## 25. The merchant's stock view

The primary inventory screen should be useful on a phone.

For each product, show the most important information first:

```text
Unga Jogoo 2kg
Stock: 18
Status: OK
Selling price: KSh 180
```

If low:

```text
Unga Jogoo 2kg
Stock: 4
Low stock
Selling price: KSh 180
```

Useful actions should include only what the current user is allowed to perform:

- search;
- filter;
- receive;
- count;
- adjust;
- view history;
- product details.

The interface should not overwhelm a small merchant with enterprise inventory terminology.

---

## 26. Product onboarding flow

A practical first-time setup should be:

```text
Add product
   ↓
Name it
   ↓
Choose unit/category
   ↓
Set selling price
   ↓
Optional cost/stock details
   ↓
Enter opening quantity
   ↓
Save
   ↓
Product is ready for sale
```

The merchant should be able to add another product quickly without navigating through a large administration form.

---

## 27. First stock workflow for a new shop

The initial inventory setup should be designed for a phone and a merchant standing inside the shop.

Example:

```text
Create shop
   ↓
Add common products
   ↓
Enter current quantities
   ↓
Review opening stock
   ↓
Confirm
   ↓
Start selling
```

A merchant should not need to know accounting or inventory terminology.

Use plain language such as:

- "How many do you have?"
- "Add stock"
- "Count stock"
- "Stock is low"
- "Why did the stock change?"

---

## 28. Daily stock loop

The core daily loop is:

```text
Open shop
   ↓
Check low stock / important items
   ↓
Sell
   ↓
Stock decreases automatically
   ↓
Receive deliveries
   ↓
Stock increases
   ↓
Handle damages/returns
   ↓
Count when needed
   ↓
Investigate variances
   ↓
Restock before shortages
```

The system should make the stock state progressively more accurate without demanding constant manual maintenance.

---

## 29. Stock trust principle

DukaFlow should never claim:

> **"You have 18 units."**

without a defensible path to that number.

The system should be able to explain:

```text
Opening
+ Receipts
+ Returns
- Sales
- Damages
- Transfers out
+ Transfers in
± Adjustments
= Current stock
```

The merchant's confidence in this calculation is more valuable than a large inventory feature list.

---

## 30. Future inventory intelligence

Once enough trustworthy history exists, DukaFlow can provide:

- estimated days of stock remaining;
- reorder suggestions;
- dead-stock warnings;
- unusual stock movement alerts;
- supplier-aware reorder recommendations;
- seasonal demand patterns;
- expected stock before a busy period.

These are decision-support features. They must not silently modify inventory.

---

## 31. Non-negotiable inventory rules

1. Product definition and shop stock are separate concepts.
2. Creating a product does not imply stock exists.
3. Opening stock is an explicit inventory event.
4. Completed sales automatically reduce stock.
5. Stock changes are explainable through movement history.
6. Stock is never silently overwritten.
7. Physical counts create explicit variances/adjustments.
8. Damaged/expired/missing stock has an explicit reason.
9. Transfers are controlled events between shops.
10. Inventory authorization follows organization scope + shop assignment + permissions + approval requirements.
11. Client-supplied shop IDs are never trusted as authorization proof.
12. Offline stock operations are revalidated during synchronization.
13. Inventory mutations are idempotent.
14. Historical stock events remain auditable.
15. Low-stock intelligence starts with simple rules before advanced prediction.
16. The mobile workflow must remain usable without barcode hardware.
17. The system must distinguish recorded stock facts from estimates/recommendations.
18. Inventory data must remain trustworthy enough to support DukaFlow's promise: **Know my stock.**

---

## 32. Implementation completion rule

Inventory is not considered implemented because an inventory screen exists.

The inventory capability is complete only when the full business path is verified:

```text
Create product
   ↓
Set opening stock
   ↓
Sell product
   ↓
Stock decreases
   ↓
Receive stock
   ↓
Stock increases
   ↓
Count stock
   ↓
Variance is explained
   ↓
Adjust with correct authorization
   ↓
History remains auditable
   ↓
Offline operation synchronizes safely
```

Verification must cover:

- UI behavior;
- domain rules;
- database/RLS authorization;
- shop boundaries;
- permissions;
- approval rules;
- idempotency;
- offline synchronization;
- audit history;
- automated tests.

---

## 33. Detailed inventory requirements

Adding inventory is not simply entering a number. DukaFlow must separate **product creation** from **recording how stock entered the shop**.

```text
Create or select product
      ↓
Choose shop
      ↓
Set product and price information
      ↓
Choose stock-entry method
      ↓
Enter quantity
      ↓
Confirm
      ↓
Create inventory movement
      ↓
Update shop stock balance
```

### 33.1 Required product information

| Field | Required? | Purpose |
|---|---:|---|
| Product name | Yes | Identifies the item, such as `Unga Jogoo 2kg`. |
| Category | Recommended | Groups products for searching and reporting. |
| Selling unit | Yes | Defines what is counted: piece, packet, bottle, kilogram, litre, box, or crate. |
| Selling price | Yes for selling | Allows the product to be sold immediately. |
| Cost price | Recommended | Supports margin and business performance calculations. |
| Opening quantity | Optional | Establishes starting physical stock when the product is first added. |
| Low-stock threshold | Recommended | Defines when the owner receives a stock alert. |
| SKU or barcode | Optional | Speeds up product search or scanning where available. |
| Supplier | Optional initially | Connects the product to purchasing when supplier workflows are enabled. |
| Product photo | Optional | Helps phone users identify products. |
| Active status | System-controlled | Determines whether the product can be sold. |

The first version must not require a barcode, supplier, photo, or advanced information before a merchant can create a product.

### 33.2 Mobile add-product flow

The first screen should collect only product information:

```text
Add product

Product name
[ Unga Jogoo 2kg              ]

Category
[ Food                      v ]

How is it sold?
[ Packet                    v ]

Selling price
[ KSh 150                    ]

Cost price
[ KSh 120                    ]

[Continue]
```

The second screen establishes stock:

```text
Starting stock

How much do you have now?
[ 30                         ]

Low-stock alert at
[ 10                         ]

Where did this stock come from?
[ Opening stock             v ]

[Save product and stock]
```

The owner must also be able to choose **Save product without stock**. The product then exists with a zero balance and cannot be sold unless the organization’s explicit negative-stock policy allows it.

### 33.3 Stock-entry methods

DukaFlow must support explicit methods for adding stock:

- **Opening stock** records the physical quantity already present when the shop begins using DukaFlow or when the product is first created.
- **Supplier receiving** records delivered products, quantities, costs, supplier, delivery date, and reference information where available.
- **Transfer in** records stock received from another shop in the same organization.
- **Return to stock** records a customer return only when the item is physically saleable and the return rules allow it.
- **Count adjustment** records a positive variance discovered during a physical count.
- **Approved correction** records a controlled correction with a reason and authorization.

Every method creates a typed inventory movement. No method may silently overwrite the current balance.

### 33.4 Receiving stock

The receiving workflow is:

```text
Inventory
   ↓
Receive stock
   ↓
Select supplier, if known
   ↓
Select product
   ↓
Enter quantity and unit cost
   ↓
Review delivery
   ↓
Confirm receipt
   ↓
Stock increases
```

A receiving record should support supplier, delivery date, invoice or reference number, product lines, quantities, unit cost, total cost, destination shop, and notes. The product’s stock balance must increase only after the receipt reaches its configured confirmed state.

### 33.5 Physical count and adjustment

A physical count compares the expected balance with the quantity physically present:

```text
System stock: 26
Physical count: 20
Variance: -6
Reason: Physical count variance
```

The user records an adjustment of `-6`; DukaFlow must not replace `26` with `20` or erase prior movements. Large or sensitive variances may require approval according to organization settings.

Adjustments for damage, expiry, loss, missing stock, or suspected theft must require an explicit reason. Suspected theft and other sensitive reasons should receive stronger audit controls.

### 33.6 Movement record requirements

Each stock movement must contain enough context to explain the balance:

| Field | Description |
|---|---|
| Movement ID | Unique identifier for the stock event. |
| Organization ID | Tenant ownership boundary. |
| Shop ID | Shop whose balance changes. |
| Product ID | Product affected. |
| Movement type | Opening, receiving, sale, return, damage, expiry, transfer, or adjustment. |
| Quantity delta | Positive for additions and negative for reductions. |
| Unit | The product’s base unit. |
| Balance after movement | Resulting balance for investigation and display. |
| Source reference | Sale, purchase, transfer, count, or adjustment reference. |
| Reason | Required for manual adjustments and losses. |
| Created by and created at | Actor and event time. |
| Device/session | Offline and audit investigation context where available. |
| Sync status | Local, queued, synchronized, rejected, or requiring review. |

The stock balance may be maintained as a protected projection for speed, but the movement history remains the explanation and audit source.

### 33.7 Validation requirements

Before an inventory mutation is accepted, DukaFlow must verify that:

- the product belongs to the current organization;
- the shop is accessible to the current user;
- the product is active when being added to saleable stock;
- the quantity is valid and uses the product’s base unit;
- the supplier or source exists when supplied;
- damage, expiry, loss, theft, and manual adjustment have a reason;
- a transfer has different source and destination shops;
- the user has the required inventory capability;
- the operation has a stable idempotency key; and
- the negative-stock policy is respected for stock reductions.

The client may provide immediate feedback, but Supabase server authorization and RLS remain the final security boundary.

### 33.8 Required first-version inventory screens

The MVP inventory area requires:

1. **Inventory home** with search, categories, current quantity, unit, price, and stock status.
2. **Add product** with optional opening stock.
3. **Product details** with current stock, price, threshold, and recent movement history.
4. **Receive stock** for supplier deliveries.
5. **Stock count** for physical counting and variance review.
6. **Adjust stock** for damage, expiry, loss, or authorized correction.
7. **Low-stock view** for products needing attention.
8. **Movement history** showing how the current balance was formed.
9. **Transfer screen** when the organization has multiple shops.
10. **Sync and exception state** showing local, pending, rejected, or conflict status.

### 33.9 Inventory permissions

Sales permission may cause an automatic stock reduction through a completed sale but must not directly rewrite stock. Inventory permission may view stock, receive stock, perform counts, record losses, and make permitted adjustments. Approval authority is required for configured sensitive adjustments, high-risk corrections, and selected transfers.

The interface should hide actions the user cannot perform, but hidden navigation is not a security boundary. Server-side authorization and RLS must enforce organization scope, shop assignment, permission, and approval requirements.

### 33.10 Offline inventory requirements

Supported inventory operations must work without connectivity:

```text
User enters stock
   ↓
Validate locally
   ↓
Create local movement and balance update
   ↓
Add operation to outbox
   ↓
Show local sync status
   ↓
Synchronize when online
   ↓
Server validates and deduplicates
```

The interface must distinguish **Saved on this device**, **Waiting to sync**, **Synced**, **Needs review**, and **Rejected**. Unique operation IDs and idempotent synchronization are required so that retries cannot add the same stock twice.

### 33.11 Owner homepage inventory summary

The homepage should show decisions rather than every product:

```text
STOCK
6 products are low in stock
Cooking oil is moving faster this week
3 products have not moved recently
[View stock]
```

For multiple shops:

```text
ALL SHOPS
8 products are low in stock
Mavueni: cooking oil is low
Kilifi: 2 products need review
[View stock by shop]
```

Recommendations must be explainable:

```text
Restock cooking oil at Mavueni Shop.
Reason: 18 units sold in the last 7 days and only 6 units remain.
```

When history is insufficient, show:

```text
Not enough sales history yet to estimate fast-moving products.
Continue recording sales to receive better recommendations.
```

### 33.12 Inventory acceptance criteria

Inventory is ready for implementation when an authorized user can create a product with a clear base unit, create it with opening stock or zero stock, receive stock, sell it and automatically reduce stock, count physical stock, record explained variances, record damage or expiry reasons, maintain separate balances across shops, perform controlled transfers, work offline, synchronize safely, and inspect the movement history behind the current balance.

> **The most important inventory rule is: every current stock number must be explainable by recorded stock movements.**

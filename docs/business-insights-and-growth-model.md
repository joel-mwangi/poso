# DukaFlow Business Insights & Growth Model

**This document is the source of truth for how DukaFlow turns trusted shop data into useful decisions, alerts, recommendations, and growth guidance without pretending that the system knows more than the underlying data supports.**

**Source relationships:**

- `docs/user-responsibilities.md` defines who may view business data and insights.
- `docs/user-lifecycle-and-access-governance.md` defines who may grant or change those permissions.
- `docs/post-authentication-access-and-first-screen.md` defines the authorized organization/shop context.
- `docs/user-workspace-and-daily-workflow.md` defines where insight and business-review work appears.
- `docs/inventory-and-stock-model.md` defines stock facts and stock movements.
- `docs/sales-and-settlement-model.md` defines sales, immediate settlement, Pay Later/Deni, repayments, returns, and reversals.
- `docs/cash-and-financial-reconciliation-model.md` defines actual money movement, cash, M-Pesa, expenses, and reconciliation.
- `docs/customer-and-crm-model.md` defines customer history and relationship data.
- `docs/purchasing-and-suppliers-model.md` defines purchases, suppliers, receiving, supplier balances, and purchase costs.

## 1. Core question

DukaFlow should help the merchant answer:

> **What is happening in my shop, why is it happening, what needs attention, and what should I do next?**

Insights are not the same thing as raw reports.

A report tells the merchant what happened.

An insight explains a useful implication.

A recommendation proposes an action.

An alert identifies something that may require attention.

DukaFlow should keep these concepts distinct.

## 2. From records to understanding

DukaFlow's information chain is:

```text
Trusted business events
        ↓
Reliable current state
        ↓
Metrics / summaries
        ↓
Insights
        ↓
Recommendations
        ↓
Merchant action
        ↓
New business events
        ↓
Better future understanding
```

The system should never invent an insight from incomplete or contradictory data.

## 3. Business truths DukaFlow should know

Subject to available data and permissions, DukaFlow should be able to determine things such as:

- what products are selling;
- how quickly products are selling;
- what stock is low or approaching a reorder point;
- which products have not sold recently;
- sales value for a period;
- amount actually received for a period;
- outstanding Deni owed by customers;
- major cash/M-Pesa variances;
- purchase activity and supplier costs;
- gross sales margin where trustworthy cost data exists;
- customer repeat activity where identifiable;
- shop-to-shop differences for multi-shop organizations;
- unusual events requiring review.

These should always be derived from authoritative domain records.

## 4. Sales insights

DukaFlow should help the owner understand sales beyond a single total.

### Useful sales views

- today;
- yesterday;
- current week;
- current month;
- comparison with a prior period where meaningful;
- by product;
- by category;
- by shop;
- by staff member where permitted;
- by payment/settlement state;
- by customer where customer identity exists.

### Example insight

Instead of only:

```text
Today's sales: KSh 18,400
```

DukaFlow may explain:

```text
KSh 18,400 in sales today.
28% came from the top 5 products.
KSh 3,200 was placed on Deni.
```

The underlying figures must remain inspectable.

## 5. Stock insights

Stock intelligence should be one of DukaFlow's strongest capabilities because inventory is directly tied to sales and purchasing.

### DukaFlow should identify

- low-stock products;
- products likely to run out soon;
- fast-moving products;
- slow-moving products;
- products with long periods without sales;
- stock discrepancies;
- unusual adjustments;
- stock sitting above expected demand;
- products with repeated stock-outs;
- products with increasing demand.

### Example recommendation

```text
Blue Band 500g
Current stock: 6
Average recent sales: 4/day

Likely to run out in about 1–2 days.
Consider reordering.
```

The recommendation should explain the data used instead of presenting a mysterious prediction.

## 6. Reorder intelligence

Reorder suggestions must not be based only on a fixed minimum-stock number.

Where sufficient data exists, DukaFlow may consider:

- current quantity;
- recent sales rate;
- seasonality where established;
- supplier lead time;
- recent purchase quantities;
- supplier availability;
- expected demand;
- known pending purchase orders;
- safety stock policy.

A simple shop should still be able to use a basic reorder threshold.

The system should become smarter as data accumulates rather than forcing advanced forecasting on day one.

## 7. Product performance

For each product, DukaFlow should be able to answer:

- how many units sold;
- sales value;
- estimated margin where cost data is reliable;
- current stock;
- average sales velocity;
- most recent sale;
- purchase cost history;
- supplier history;
- stock adjustments;
- return activity.

### Product categories of interest

The owner may eventually see products grouped into patterns such as:

- fast seller;
- steady seller;
- slow seller;
- dead/idle stock;
- high-margin seller;
- low-margin seller;
- frequently out-of-stock;
- high-variance stock item.

These are analytical classifications, not user roles or product identities.

## 8. Cash and financial insights

Business insight must distinguish revenue from cash.

For example:

```text
Sales value:       KSh 50,000
Paid now:          KSh 37,000
Deni created:      KSh 13,000
Expenses:          KSh  8,000
```

DukaFlow must not claim that the merchant has KSh 50,000 cash.

Useful financial insights may include:

- expected cash from transactions;
- actual reconciled cash;
- M-Pesa receipts and reconciliation state;
- outstanding Deni;
- supplier payables;
- expenses;
- owner withdrawals;
- cash variance;
- period-to-period movement.

## 9. Deni and customer insights

DukaFlow should help the owner understand credit risk without turning every customer interaction into an accounting exercise.

Useful insights may include:

- total outstanding Deni;
- customers with overdue balances;
- customers with increasing balances;
- recent repayments;
- customers repeatedly paying late where the data supports that conclusion;
- largest outstanding balances;
- concentration of Deni among a small number of customers.

### Important caution

The system should not label a customer a "bad payer" merely because one payment is late.

Insights should be evidence-based and explainable.

## 10. Purchasing and supplier insights

DukaFlow should connect purchasing information to sales and stock information.

The owner may need to know:

- what was recently purchased;
- purchase cost trends;
- supplier price differences;
- supplier outstanding balances;
- products frequently purchased from a supplier;
- supplier delivery reliability where enough history exists;
- purchase frequency;
- stock generated by recent purchases.

### Example

```text
Sunflower oil 1L

Supplier A: KSh 310
Supplier B: KSh 325

Recent purchase cost from Supplier A is lower.
```

The system must make clear when supplier-price comparisons are based on different quantities, dates, or packaging.

## 11. Margin and profitability

Profitability insights require trustworthy cost information.

DukaFlow should distinguish:

- sales revenue/value;
- purchase cost;
- estimated gross margin;
- operating expenses;
- owner withdrawals;
- cash movement.

The system should not show false precision when cost data is missing or stale.

For example:

```text
Estimated gross margin
```

is more honest than:

```text
Exact profit
```

when some costs have not been captured.

## 12. Multi-shop comparisons

For an organization with multiple shops, authorized users may compare:

- sales;
- stock turnover;
- stock-outs;
- Deni exposure;
- cash variance;
- purchasing;
- estimated margin;
- operating expenses.

Comparisons must preserve shop boundaries and should clearly state the time period.

The owner should be able to answer:

> **Which shop is performing better, and why?**

## 13. Daily owner summary

DukaFlow should provide a simple daily business summary.

A possible structure is:

```text
TODAY

Sales          KSh 18,400
Paid now       KSh 15,700
New Deni       KSh  2,700

Low stock      7 items
Pending buys   2
Cash variance  KSh 300

TOP ACTIONS
1. Reorder 3 fast-moving products
2. Review KSh 4,200 overdue Deni
3. Check KSh 300 cash variance
```

The owner should be able to drill into each figure.

## 14. Action-oriented insights

The goal is not to produce endless dashboards.

DukaFlow should prioritize insights that can lead to an action.

Examples:

```text
LOW STOCK
→ Reorder

OVERDUE DENI
→ Review customer balance

CASH VARIANCE
→ Reconcile shift

SLOW-MOVING STOCK
→ Review pricing or promotion

SUPPLIER COST INCREASE
→ Compare suppliers
```

Recommendations should lead to the relevant workflow instead of leaving the owner to figure out what to do next.

## 15. Confidence and explainability

Every material recommendation should be explainable.

For example:

```text
Why are you recommending this?

Because:
- current stock is 5;
- average sales are 3/day;
- supplier lead time is usually 2 days.
```

The merchant should be able to inspect the source records behind an insight.

## 16. Missing-data behavior

DukaFlow must be explicit when it lacks enough information.

Instead of:

```text
Your profit is KSh 24,000
```

it may need to say:

```text
Estimated gross margin is KSh 24,000.
Some purchase-cost data is missing for 6 products.
```

Or:

```text
Not enough sales history to estimate a reliable reorder date.
```

Missing data should reduce confidence, not produce fabricated certainty.

## 17. Alerts versus recommendations

These are different.

### Alert

Something may require immediate attention.

Examples:

- M-Pesa reconciliation exception;
- unusually large cash variance;
- critically low stock;
- unexpected stock adjustment;
- repeated failed synchronization.

### Recommendation

An optional action that may improve the business.

Examples:

- reorder a fast-moving item;
- review a supplier price;
- contact a customer about Deni;
- investigate a slow-moving product.

The UI should not make every recommendation feel like an emergency.

## 18. Trends and comparisons

DukaFlow should support meaningful comparisons such as:

- today versus yesterday;
- this week versus last week;
- this month versus last month;
- current sales velocity versus recent average;
- current purchase cost versus prior cost;
- current Deni balance versus prior period.

Comparisons should account for different time lengths and incomplete periods where necessary.

## 19. Seasonality and local context

Advanced intelligence may eventually account for:

- weekday patterns;
- month-of-year patterns;
- holidays;
- school seasons;
- weather-sensitive products;
- local events.

These should only influence recommendations when DukaFlow has enough trustworthy data to justify them.

A one-week shop history should not be presented as a meaningful seasonal pattern.

## 20. Merchant-controlled intelligence

The owner should be able to configure business policies that influence recommendations, such as:

- preferred reorder level;
- target stock coverage;
- maximum Deni exposure;
- approval threshold for refunds;
- preferred suppliers;
- low-stock urgency thresholds.

DukaFlow can provide defaults but should not silently override owner-defined policies.

## 21. What staff should see

Insights must follow the User Access Model.

A sales worker may see:

- today's sales relevant to their shop;
- their shift activity;
- operational low-stock warnings needed for selling.

They may not automatically see:

- organization-wide profitability;
- supplier pricing;
- owner withdrawals;
- confidential financial information.

The insight engine must respect both action permissions and data visibility.

## 22. Auditability

A material insight should be traceable to:

```text
Source records
   ↓
Calculation / rule
   ↓
Insight
   ↓
Recommendation
   ↓
Merchant action
```

For high-impact automated decisions, DukaFlow should record enough information to explain what data and rule produced the recommendation.

## 23. Offline and synchronization behavior

Insights may be incomplete while the device is offline.

DukaFlow should distinguish:

```text
Current local view
```

from:

```text
Fully synchronized business view
```

For example:

```text
Sales today: KSh 10,000

2 offline transactions pending synchronization.

This summary may change when synchronization completes.
```

The system should not present stale offline data as final when material uncertainty exists.

## 24. What DukaFlow should not do

DukaFlow must not:

- fabricate metrics;
- claim exact profit without sufficient cost data;
- confuse sales value with cash;
- treat Deni as cash received;
- make unsupported predictions from tiny samples;
- expose insights outside the user's authorized data scope;
- turn every anomaly into an alarm;
- make irreversible business decisions automatically without explicit authorization;
- hide the source of important recommendations;
- let a dashboard metric become a second source of truth separate from underlying business records.

## 25. Intelligence hierarchy

DukaFlow should mature from simple to advanced intelligence.

### Level 1 — Descriptive

```text
What happened?
```

Examples:

- sales today;
- stock remaining;
- Deni outstanding;
- cash variance.

### Level 2 — Diagnostic

```text
Why did it happen?
```

Examples:

- sales fell because a top product stocked out;
- cash variance came from a specific shift discrepancy.

### Level 3 — Predictive

```text
What may happen next?
```

Examples:

- product likely to run out tomorrow;
- supplier cost may be trending upward.

### Level 4 — Prescriptive

```text
What should I do?
```

Examples:

- reorder 24 units;
- review supplier B;
- follow up on overdue Deni.

DukaFlow should earn the right to reach higher levels through trustworthy data.

## 26. The owner should feel that DukaFlow understands the shop

The goal is not dependency created by lock-in.

The goal is usefulness created by understanding.

A successful DukaFlow owner should be able to ask:

> **What should I know about my shop today?**

and receive a concise answer backed by the shop's actual records.

That answer should help the owner act, not merely stare at graphs.

## 27. Source-of-truth boundaries

Use:

- access documents for **who may see and act on insights**;
- inventory documents for **stock facts**;
- sales/settlement documents for **commercial transactions**;
- cash/reconciliation documents for **actual financial movement**;
- customer documents for **customer relationship facts**;
- purchasing/supplier documents for **supplier and cost facts**;
- this document for **derived metrics, insights, alerts, recommendations, and growth guidance**.

Derived insight must always be explainable from the underlying domain records.

## 28. Completion definition

Business insights and growth are not complete merely because charts exist.

They are complete when DukaFlow can reliably:

- calculate trustworthy business metrics;
- explain material insights;
- respect user/shop/data visibility boundaries;
- distinguish facts from estimates;
- identify important exceptions;
- provide useful next actions;
- remain honest when data is incomplete;
- support both one-person dukas and multi-shop businesses;
- maintain traceability from insight back to source records;
- test key calculations and recommendations.

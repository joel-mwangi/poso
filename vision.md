# DukaFlow Vision

DukaFlow exists to help small retailers **know their business, operate with confidence, and grow from real business history**. It should feel simple enough for an individual shop owner while becoming powerful enough to support staffed and multi-shop organisations.

> DukaFlow should help the owner make the next useful business decision, not simply display data or produce complicated reports.

## The Four Outcomes

### 1. Know Your Stock

DukaFlow should help the owner understand:

- What stock is currently available.
- Which products are moving.
- Which products are running low.
- Which products are not moving.
- When the shop may need to restock.

Stock information should come from trustworthy product, sale, purchase, receiving, adjustment, and inventory-movement records. The system should explain alerts and restocking suggestions using the shop’s actual history.

Examples include:

```text
You have 12 units of cooking oil remaining.
Cooking oil is selling faster this week.
Sugar is low in stock.
This product has not moved recently.
```

### 2. Know Your Cash

DukaFlow should help the owner understand:

- What the shop sold.
- How customers paid.
- What cash was received.
- Which M-Pesa payments are confirmed or still pending.
- What customers owe through Deni.
- What money the business actually earned after relevant costs and expenses are known.

The system must keep these concepts distinct:

```text
Sales value
   ≠ Money received
   ≠ Physical cash
   ≠ Confirmed M-Pesa
   ≠ Deni receivable
   ≠ Profit
```

Financial information should remain traceable to sales, payment, cash, M-Pesa, Deni, expense, and reconciliation records. DukaFlow should never present an estimate as a confirmed fact.

### 3. Understand Your Customers

DukaFlow should help the owner understand:

- Which customers return often.
- What customers buy.
- Which customers have outstanding Deni.
- How customer relationships are changing.
- Which customer records need attention.

Customer management should remain practical and lightweight. DukaFlow should support useful customer history and Deni relationships without forcing a complex CRM onto a small shop.

### 4. Grow Your Business

DukaFlow should use accumulated business history to give the owner simple, useful decisions rather than complicated reports.

Examples include:

```text
You are running low on cooking oil.
Mavueni Shop is selling more flour than Kilifi Shop.
A product has not moved recently.
Deni outstanding has increased this week.
An M-Pesa payment needs confirmation.
This shop’s sales are improving compared with its normal pattern.
```

Every recommendation should be explainable. The owner should be able to understand which recorded facts produced the suggestion and open the relevant shop, product, sale, payment, customer, or stock history.

## Owner Homepage Expression

For one shop, the homepage should present these four outcomes through a simple daily operating view:

```text
Know your stock
Know your cash
Understand your customers
Grow your business
```

For multiple shops, the owner should first see a combined organisation summary and then a traceable shop-by-shop breakdown:

```text
All shops combined
   ├── Stock position
   ├── Cash and payment position
   ├── Customer and Deni position
   └── Business growth decisions

Shop breakdown
   ├── Mavueni Shop
   └── Kilifi Shop
```

The combined view must not hide differences between shops. Every total should be expandable to the shops and records that produced it.

## Owner Homepage Priority Model

The vision defines what DukaFlow helps the owner understand; the homepage defines what the owner sees first. These are related but not identical. The homepage must prioritize the next action that protects the business today.

The order is:

1. **Needs attention now** — low stock, pending or failed M-Pesa, cash variance, Deni follow-up, synchronization problems, and approvals.
2. **Know your cash** — sales, cash received, confirmed M-Pesa, pending M-Pesa, and outstanding Deni shown separately.
3. **Know your stock** — low-stock products, fast-moving products, and restocking work.
4. **Understand your customers** — outstanding Deni, returning customers, and useful customer activity.
5. **Grow your business** — explainable recommendations based on sufficient business history.

The first screen should answer:

> **Is anything urgent, and what should I do next?**

### Single-Shop Mobile Sketch

```text
DukaFlow
Welcome back, Mary
Mwangaza Duka · Kawangware Market
[Switch shop]                         Sync: OK

NEEDS ATTENTION
⚠ 6 products are low
⚠ 1 M-Pesa payment pending
⚠ Deni needs follow-up
[View attention]

TODAY'S MONEY
Sales          KSh 18,450
Cash received  KSh  7,200
M-Pesa         KSh 10,850
Deni           KSh    400
[View money]

QUICK ACTIONS
[New sale] [Products]
[Stock]    [Customers]

STOCK
6 products low in stock
Cooking oil moving quickly
[View stock]

CUSTOMERS
3 Deni balances outstanding
12 returning customers
[View customers]

BUSINESS DECISIONS
Restock cooking oil
Follow up outstanding Deni
[View insights]

[Home] [Sell] [Stock] [More]
```

### Multi-Shop Summary Sketch

For a multi-shop owner, show the combined organization summary first. Every total must be traceable to a shop and then to the relevant business records.

```text
Mary Wanjiku Retail                         [Manage shops]
ALL SHOPS — TODAY                              Sync: OK

NEEDS ATTENTION
8 low-stock products · 2 pending M-Pesa · 3 Deni follow-ups

COMBINED MONEY
Sales: KSh 31,250   Cash: KSh 13,900
M-Pesa: KSh 16,750  Deni: KSh 600

SHOP BREAKDOWN
Mavueni Shop   KSh 18,450 sales   6 low-stock   [Open shop]
Kilifi Shop    KSh 12,800 sales   2 pending     [Open shop]

BUSINESS DECISIONS
Restock cooking oil at Mavueni
Review pending M-Pesa at Kilifi
[View insights]
```

### Responsive Rules

Mobile uses one vertical flow with large touch targets. Tablet uses a centered flexible form or two columns where useful. Desktop may use a sidebar and wider summary cards. The content order, labels, business rules, and available actions must remain the same at every size. Narrow screens must stack content automatically and never require horizontal scrolling or zooming.

The homepage is a daily business command centre, not a wall of analytics. When there is insufficient history, DukaFlow should explain that limitation instead of inventing an insight:

```text
Not enough sales history yet to identify fast-moving products.
Continue recording sales to receive better recommendations.
```

Every recommendation must identify the recorded facts that support it and provide a path to the relevant shop, product, sale, payment, customer, or stock history.

## Product Principles

| Principle | Meaning |
|---|---|
| **Simple first** | An individual owner should reach daily operations without unnecessary administration. |
| **Trustworthy records** | Sales, payments, stock, Deni, cash, and expenses remain explainable and auditable. |
| **Progressive capability** | Staff, suppliers, reconciliation, approvals, and multi-shop controls appear when needed. |
| **Offline resilience** | Supported shop operations continue during connectivity interruptions and synchronize safely later. |
| **Permission clarity** | Each person sees and performs only what their active shop assignment and permissions allow. |
| **Action over reporting** | Insights should lead to a useful next action, not overwhelm the owner with dashboards. |
| **Growth without replacement** | A shop can begin simply and become a staffed or multi-shop organisation without changing systems. |

## Vision in One Flow

```text
Record daily business activity
   ↓
Know stock
   ↓
Know cash and payment position
   ↓
Understand customers and Deni
   ↓
Receive simple, explainable decisions
   ↓
Operate better
   ↓
Grow the business
```

## Final Vision Statement

> **DukaFlow helps the owner know their stock, know their cash, understand their customers, and grow their business through simple, trustworthy decisions built from real business history.**

This vision applies whether the organisation has one owner-operated shop, one staffed shop, or several shops with assigned people and permissions. The interface becomes more capable as the business grows, but the purpose remains the same: help the owner understand what is happening and decide what to do next.

## Related Documents

- [README](README.md) — product thesis, scope, and foundation.
- [Product experience model](docs/duka-flow-product-experience-model.md) — workspace and interaction model.
- [User workspace and daily workflow](docs/user-workspace-and-daily-workflow.md) — daily operating experience.
- [Business insights and growth model](docs/business-insights-and-growth-model.md) — derived insights and growth intelligence.
- [Cash and financial reconciliation model](docs/cash-and-financial-reconciliation-model.md) — financial truth and reconciliation.
- [Inventory and stock model](docs/inventory-and-stock-model.md) — stock truth and movement history.
- [Customer and CRM model](docs/customer-and-crm-model.md) — customer and Deni relationships.

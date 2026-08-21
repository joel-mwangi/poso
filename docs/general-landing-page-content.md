# DukaFlow General Landing Page Content

**This document defines the public landing page shown before authentication.** It is the common entry point for owners, helpers, invited staff, and returning visitors. It must introduce DukaFlow clearly without exposing private merchant data.

## 1. Landing-page objective

The page should answer three questions quickly:

1. **What is DukaFlow?**
2. **How will it help my shop?**
3. **What should I do next?**

The public page should not read like technical documentation or an enterprise software catalogue. It should lead with the owner’s daily reality: selling, stock, money, customers, and the next useful decision.

## 2. Recommended positioning

### Primary headline

> **Run your shop with confidence.**

### Supporting message

> **DukaFlow is a simple POS for Kenyan shops that helps you sell, track stock, understand your money, and make better decisions—even when internet access is unreliable.**

This wording is intentionally specific without making unsupported claims about market leadership, customer numbers, pricing, KRA compliance, certification, or live payment connectivity.

### Primary actions

```text
[Create owner account]
[Log in]

Already invited by an owner?
[Accept invitation]
```

**Create owner account** is the primary public conversion. **Log in** is the returning-user path. **Accept invitation** is a distinct path for helpers because helpers do not create an organization or shop.

## 3. Full recommended page copy

### Header

```text
DukaFlow

How it works     For shops     Help                         [Log in]
                                                    [Create account]
```

On mobile, collapse secondary links into a menu while keeping **Log in** and **Create account** visible where space allows.

### Hero section

```text
Run your shop with confidence.

A simple POS for Kenyan shops. Sell, track your stock, understand your money,
and make better decisions from your real business history.

[Create owner account]     [Log in]

Already invited by an owner? [Accept invitation]

Works on your phone. Designed for Cash, M-Pesa, and Deni.
```

The hero should show a calm, recognizable shop workflow rather than a dense analytics dashboard. A visual may show a phone with a simple sale, stock alert, and cash summary, but it must use clearly marked sample data so visitors do not mistake it for a real merchant account.

### Four owner outcomes

```text
Know your stock
See what you have, what is moving, and what may need restocking.

Know your cash
Separate sales, cash received, M-Pesa, pending payments, and Deni.

Understand your customers
Keep useful customer history and see who owes Deni.

Grow your business
Get simple, explainable decisions from the history of your shop.
```

These four outcomes are the core of the product and should appear before a long feature list.

### Built for the way shops operate

```text
Sell from your phone
Use a smartphone-first workflow with large, clear actions.

Keep working when connectivity is interrupted
Supported shop operations can continue offline and synchronize when connection returns.

Use the payments your customers use
Record Cash, M-Pesa, and Deni. Connect your M-Pesa Till or PayBill when the shop is ready.

Start simple and grow gradually
Begin with one shop and add helpers, suppliers, permissions, and more shops when needed.
```

The phrase **connect your M-Pesa Till or PayBill** is safer than implying that DukaFlow issues a Till or PayBill. Safaricom presents Business Till and Business PayBill as distinct business collection options, while Daraja is the developer platform used to connect M-Pesa APIs to applications.[3]

### How it works

```text
1. Create your owner account
Answer a few simple Yes/No questions.

2. Create and set up your shop
Add the shop name, location, payments, and basic preferences.

3. Add products and opening stock
Start with the products you sell and the stock you have.

4. Sell and learn from your business
Record sales and let DukaFlow build useful stock, cash, customer, and growth history.
```

This sequence reduces setup anxiety. It also makes clear that the owner can start with one shop and enable more advanced capability later.

### For one shop or several

```text
One shop
Start with a simple owner-operated setup.

A staffed shop
Invite helpers and decide exactly what each person can read, write, request, or approve.

Multiple shops
See a combined organization summary, then open each shop for detail.
```

The page should describe helpers as people invited by the owner. It should not suggest that every business needs a manager, cashier, or inventory department.

### Trust and clarity section

```text
Your records should make sense.

Every sale, payment, stock change, and Deni balance should have a clear history.
DukaFlow separates recorded facts from estimates and explains where business insights come from.
```

This section is more valuable than unsupported trust badges. If DukaFlow later has verified certifications, customer counts, reviews, support hours, pricing, or named integrations, those can be added with evidence.

### FAQ

#### Does DukaFlow work without internet?

DukaFlow is designed for offline-first shop operations. Supported work can continue on the device when connectivity is interrupted, and queued changes synchronize when connection returns. The product should clearly show whether a record is saved locally, waiting to sync, synchronized, rejected, or needs review.

#### Can I accept M-Pesa?

DukaFlow supports recording M-Pesa payments and can be configured to connect to a merchant’s selected Till or PayBill workflow when the relevant integration is available. The owner supplies the merchant payment details and credentials through the appropriate Safaricom process; DukaFlow does not issue the Till or PayBill.

#### Can I use Cash and Deni?

Yes. Cash and Deni are core shop workflows. DukaFlow should show sales value, money received, and outstanding Deni separately so the owner can understand what has actually been collected and what is still owed.

#### Do helpers create their own shops?

No. The owner creates the organization and shop, invites the helper by email, assigns the shop, and decides what the helper can do. The helper accepts the invitation and signs in to the assigned workspace.

#### Can I manage more than one shop?

Yes. The owner can create multiple shops and see a combined organization summary first. Each shop retains its own stock, sales, payments, customers, and permissions, with drill-down from combined totals to shop records.

#### Do I need a barcode scanner or computer?

No dedicated hardware is required for the core smartphone workflow. Barcodes and other hardware may improve speed where available, but DukaFlow should remain usable for ordinary shop operations from a phone.

#### Can I start with a simple setup?

Yes. DukaFlow asks a short Yes/No checklist and reveals only the setup that is relevant. Helpers, suppliers, M-Pesa configuration, approvals, and additional shops can be enabled when the business needs them.

## 4. Landing-page information architecture

| Section | Job to be done | Content priority |
|---|---|---:|
| Header | Establish identity and provide entry actions. | Essential |
| Hero | Explain the product and give the next step. | Essential |
| Four outcomes | Connect DukaFlow to owner priorities. | Essential |
| Built for real shops | Address phone use, connectivity, payments, and growth. | Essential |
| How it works | Reduce setup uncertainty. | Essential |
| One, staffed, or several shops | Explain progressive capability and helpers. | Important |
| Trust and clarity | Establish truthful, explainable records. | Important |
| FAQ | Address objections and local questions. | Important |
| Footer | Provide help, privacy, terms, and contact. | Essential |

## 5. Visual asset plan

The landing page should use a small number of purposeful visuals. Images should clarify the product and the shop context rather than decorate an otherwise unclear page.

### Hero product visual

Use one clean smartphone mockup beside or below the hero message. The mockup should show a fictional demonstration account with a simple sale, stock alert, and money summary:

```text
┌─────────────────────┐
│ DukaFlow            │
│ Mwangaza Demo Shop  │
├─────────────────────┤
│ Today               │
│ Sales   KSh 18,450  │
│ Stock   6 low       │
│ M-Pesa  Confirmed  │
│ Deni    KSh 400     │
└─────────────────────┘
```

The visual must communicate smartphone-first use without showing real customer names, phone numbers, Till numbers, sales, or Deni records.

### Four outcome icons

Use one consistent icon or simple illustration for each outcome:

| Outcome | Visual direction |
|---|---|
| **Know your stock** | Product shelf, box, basket, or stock list. |
| **Know your cash** | Cash and M-Pesa payment confirmation. |
| **Understand your customers** | Customer history or relationship record. |
| **Grow your business** | A simple trend with an explainable action suggestion. |

The icons should support the text and should not replace the outcome explanations.

### Local shop context image

An optional later section may show a realistic photograph or illustration of a Kenyan shop owner using a smartphone inside a small retail shop. The scene should look like a normal, believable duka rather than a corporate office. It should communicate a real owner serving customers while managing daily business.

### How-it-works visuals

The four setup steps may use small numbered cards or line illustrations:

```text
Create account  →  Set up shop  →  Add products  →  Start selling
```

Four large images are unnecessary. The first version should prioritize the hero visual and outcome icons.

### Asset safety rules

The landing page must not use random stock photographs, unreadable dashboard screenshots, fake partner logos, Safaricom branding without authorization, or visuals that imply a live M-Pesa connection before the integration is verified. All product data shown in images must be clearly fictional or generated specifically for the demonstration.

Recommended first-version asset set:

```text
Hero section              1 smartphone product visual
Four outcomes             4 consistent icons
Shop context              1 optional local-shop image
How it works              4 small illustrations or numbered cards
FAQ and footer            No additional imagery
```

## 6. Mobile and desktop behavior

Mobile should use a single vertical flow with the primary action visible near the top and repeated after the **How it works** section. Desktop may use a two-column hero and horizontal outcome cards, but it must not introduce different claims or a more complicated conversion path.

The public page must use large touch targets, readable text, strong contrast, fast loading, no horizontal scrolling, and no long registration form. Registration begins only after the visitor selects **Create owner account**.

## 6. Content restrictions

The public landing page must never display organization names, shop balances, customer names, Deni balances, sales records, staff details, M-Pesa credentials, supplier balances, private reports, or sample data that appears to be a real account.

It must not claim any of the following until independently verified and operationally available:

- a specific customer count;
- a “number one” or “best” market position;
- KRA/eTIMS compliance;
- official Safaricom certification or partnership;
- live M-Pesa integration;
- specific pricing or a free trial;
- guaranteed offline behavior for unsupported operations;
- guaranteed savings or revenue growth.

## 7. Research basis

The recommended structure follows patterns observed in established POS positioning: outcome-led headlines, prominent start and login actions, clear payment and product benefits, setup reassurance, business-type pathways, and concise FAQs.[1] A Kenyan POS example emphasizes local signals such as M-Pesa, live inventory, Android availability, support channels, onboarding, offline operation, multiple branches, and transparent pricing; these are useful content categories, but DukaFlow should not copy claims it cannot substantiate.[2] Safaricom’s official business pages distinguish Business Till and Business PayBill, and its Daraja platform describes the API connection and sandbox/testing pathway for M-Pesa integrations.[3]

## References

[1]: https://squareup.com/us/en/point-of-sale "Square Point of Sale"
[2]: https://sell.ke/ "sell.ke Kenya POS and ecommerce platform"
[3]: https://www.safaricom.co.ke/main-mpesa/for-your-business "Safaricom M-Pesa for Business"; https://developer.safaricom.co.ke/ "Safaricom Daraja Developer Portal"

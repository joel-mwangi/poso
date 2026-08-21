# DukaFlow POS — UI/UX Design Direction

## Approach 1: Counter Rhythm
**Very Brief Intro:** A tactile, warm, mobile-first retail workspace inspired by a well-organized shop counter: paper, ink, receipt green, and decisive actions. The interface should feel trustworthy during busy selling moments and calm during administration.
**Probability:** 0.07

## Approach 2: Market Ledger
**Very Brief Intro:** An editorial operations system using ledger-like rows, quiet neutrals, and strong typographic hierarchy to make stock, credit, and reconciliation feel legible and accountable.
**Probability:** 0.03

## Approach 3: Signal Grid
**Very Brief Intro:** A high-contrast operational interface with crisp status signals and compact information density for teams managing several shops and devices.
**Probability:** 0.08

## Chosen Approach: Counter Rhythm

### Design Movement
Contemporary service-design minimalism with tactile editorial cues: the clarity of a well-run checkout counter combined with the warmth of printed receipts and shop ledgers.

### Core Principles
1. **Thumb-first decisiveness:** Frequent actions use large targets, bottom-reachable controls, and clear one-step feedback.
2. **Operational calm:** Surface hierarchy separates selling, stock, credit, and administration without visual noise.
3. **Evidence over decoration:** Status, totals, sync state, and permissions are always visible when they affect a decision.
4. **Responsive continuity:** The same mental model survives from narrow phone to wide desktop; only the spatial arrangement changes.

### Color Philosophy
The base is warm mineral white and deep ink rather than sterile white and blue. A signature receipt green marks completed, trusted, or available actions; amber is reserved for attention and offline states; red is reserved for destructive or failed outcomes. Color is semantic, not ornamental.

### Layout Paradigm
A task-first workspace rather than a centered dashboard. On phones, use bottom navigation, a sticky action dock, and stacked sheets. On larger screens, expand the same flows into a left context rail, a central work area, and a right-side checkout/insight pane. Never hide the active shop or sync state.

### Responsive setup rules

The owner setup flow must keep one content sequence across mobile, tablet, desktop, and other screen sizes. Only the layout changes:

```text
Mobile  → single-column vertical steps
Tablet  → centered form with flexible columns
Desktop → step rail plus wider work area
```

The owner should see one primary action per screen, a short step indicator, large touch targets, no horizontal scrolling, and clear **Set up later** actions for optional configuration. The same wording, questions, validation, and business rules must apply at every size. M-Pesa credentials, staff permissions, supplier controls, and reconciliation remain separate advanced screens rather than being placed into one crowded form.

The detailed setup presentation is:

**Mobile:** a vertical `Set up your shop — 1 of 3` screen with shop photo, shop name, shop location, and `Continue`; a `Payments — 2 of 3` screen with Cash, M-Pesa, and Deni/Pay later; and, when M-Pesa is selected, a short `M-Pesa setup — 3 of 3` screen with the Till Number and **Set up later**.

**Desktop:** the same steps appear in a wider layout with a setup rail on the left and the current form on the right. The desktop layout may show supporting information but must not introduce different questions or a more complex workflow.

**Tablet:** use a centered form with two columns only where useful. If the screen becomes narrow, the columns stack automatically. No screen should require zooming or horizontal scrolling.

### Signature Elements

- Receipt-green action bar and confirmation moments.
- Soft ruled dividers and ledger rows for history, stock, and Deni.
- A compact “shop context + sync status” strip that stays visible across operational screens.

### Interaction Philosophy
Every interaction should answer one of three questions: what changed, can I trust it, and what can I do next? Buttons use clear verbs. Destructive actions require explicit confirmation. Permission failures explain the required access without exposing security details.

### Animation
Use 120–220ms ease-out transitions for pressed states, drawers, tabs, and status changes. Use short opacity/translate entrances for sheets and toasts. Never animate high-frequency cart updates in a way that delays checkout. Respect `prefers-reduced-motion` and keep keyboard actions instant.

### Typography System
Use **Plus Jakarta Sans** for UI labels and body copy, paired with **DM Serif Display** for occasional high-level page titles and empty-state moments. Body text stays 14–16px with 1.45–1.55 line height. Numeric totals use tabular figures and heavier weight. Avoid all-caps except for compact status labels.

### Brand Essence
A dependable pocket counter for independent retailers: sell quickly, know what moved, and stay in control when the network disappears. Personality: **grounded, decisive, protective**.

### Brand Voice
Headlines are specific and operational. CTAs use direct verbs. Microcopy explains state without blame.

- Example headline: “Today’s counter, in one view.”
- Example CTA: “Complete cash sale”.

### Wordmark & Logo
Use a compact mark based on a receipt slip folded into a forward arrow: a single bold geometric symbol with a small notch suggesting a shop counter. The mark should appear as an icon, not as text rendered in a default font.

### Signature Brand Color
**Receipt Green — `#167B5A`**, used sparingly for trusted completion, primary actions, and healthy sync states.

### File Reminder
Every new UI file should preserve this direction: mobile-first, warm mineral surfaces, deep ink typography, semantic receipt green, large thumb targets, explicit state, and responsive continuity. Ask: “Does this choice reinforce or dilute Counter Rhythm?”

## Style Decisions
- Use semantic color for business state; never use color as decoration without meaning.
- Keep the active shop, connectivity/sync state, and next action visible in operational contexts.
- Prefer bottom-reachable mobile actions and two-pane expansion at larger widths.
- Use Plus Jakarta Sans and DM Serif Display; do not use Inter as the primary typeface.


# Public Landing Page Extension — Nairobi Ledger

## Purpose
The public route is the pre-auth marketing page shown before registration, login, organization creation, or shop setup. It must feel like a polished product homepage, never like an admin dashboard or merchant POS screen.

## Selected Direction
Nairobi Ledger extends Counter Rhythm into a contemporary African editorial fintech surface: warm paper-white fields, deep navy and ink typography, DukaFlow green for operating momentum, and realistic product UI as the hero object. The landing page should be calm, premium, and specific to Kenyan retail rather than generic SaaS.

## Principles
- Make the product the hero: major sections explain real merchant tasks through believable UI and workflow compositions.
- Use contrast with purpose: deep navy for trust, DukaFlow green for actions and healthy operating states, warm mineral white for approachability, and amber only for Deni or attention states.
- Prefer asymmetric narrative layouts over repeated centered card stacks.
- Use concrete proof: Kenyan retail examples, offline transitions, payment methods, organization structure, and least-privilege access.

## Landing Page Structure
The page follows a narrative rail: public header, asymmetric hero with POS mockup and event cards, six value features, a three-part Sell/Manage/Understand product story, an Online/Offline/Sync flow, an Organization/Owner/Staff/Shop assignments/Permissions structure, Kenyan payment cards, a dark final CTA, and a concise footer.

## Public-Route Constraints
The public route must not show organization creation, shop selection, login forms in the hero, admin controls, platform administration, or merchant backend navigation. “Get started” and “Start free” route into the existing authentication entry; “Sign in” routes to the same auth surface with sign-in selected.

## Visual Asset Decision
The browser POS mockup, event cards, offline flow, organization hierarchy, and payment cards will be built as editable React/CSS compositions so labels, accessibility, and CTA behavior remain exact. The D mark remains a simple geometric inline mark and should be reused in the header and footer.


# DukaFlow-Owned Design System Refinement

## Position
DukaFlow will not imitate a generic startup dashboard or copy another Kenyan fintech interface. Its visual identity will come from the rhythm of a real retail counter: the handoff from product to basket, the receipt edge, the stock mark, and the shop context that makes every action accountable.

## Original Motifs

### The Counter Rail
A slim, recurring horizontal rail used for active shop, connection, and next-action context. It behaves like the edge of a shop counter: always present when an operational decision depends on location or connectivity.

### The Receipt Notch
A small asymmetric notch or stepped edge appears in selected primary action surfaces and confirmation moments. It is a DukaFlow-owned signature derived from a receipt slip, not a decorative generic rounded card.

### The Stock Mark
A compact quantity marker uses ruled lines and a single green mark to indicate movement, availability, or completion. It will appear in product tiles, inventory summaries, and public product storytelling.

### The Till Rhythm
The layout uses a deliberate 3-beat sequence for operational tasks: **Choose → Confirm → Record**. On the POS this maps to product, payment, and receipt. On onboarding it maps to product, opening stock, and first sale. This rhythm should shape copy, spacing, and interaction feedback.

## Owned Composition Rules

The public landing page should alternate between a wide product story and a narrow explanatory rail; it should not repeat the same 3-column SaaS card grid as its primary structure. The authenticated POS should keep the active shop and sync state in a recognizable Counter Rail, use ruled ledger surfaces for records, and reserve the Receipt Notch for primary actions. Marketing uses generous editorial whitespace; operations use denser counter rhythm.

## Owned Interaction Rules

Every main action should expose the next operational state: “Add product” leads to “Set opening stock”; “Complete sale” leads to “Receipt ready”; “Reconnect” leads to “Sync complete.” The interface should answer **what changed, can I trust it, and what do I do next** without relying on copied interaction patterns.

## Prohibited Shortcuts

Do not use purple gradients, generic glassmorphism, stock dashboard illustrations, arbitrary testimonial cards, fabricated reviews, or a copycat green fintech treatment. Do not use repeated rounded rectangles where a receipt edge, ruled ledger, or counter rail would communicate more meaningfully.

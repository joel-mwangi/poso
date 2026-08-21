# DukaFlow Progressive Web App Architecture

**Status:** Design approved for implementation planning  
**Product model:** Smartphone-first, offline-first POS for Kenyan retailers  
**Primary stack:** React, TypeScript, Vite, Supabase, Dexie/IndexedDB, Supabase Edge Functions

## 1. Architectural decision

DukaFlow will be an **offline-first Progressive Web App**. The application must install on supported smartphones and desktops, load a previously cached app shell without a network connection, and continue core shop operations from the local authorized workspace.

The design uses a hybrid boundary:

> **Online for identity, authority, configuration, external confirmation, and canonical storage; offline-first for daily selling, Cash, Deni, product lookup, stock movements, and local operational work.**

The first implementation must not build an online-only POS and retrofit offline support later. The first complete sales flow must already use local transactions, a durable outbox, idempotent server submission, and explicit synchronization states.

## 2. PWA responsibilities

The PWA has four distinct responsibilities.

| Layer | Responsibility |
|---|---|
| **App shell** | Load the application interface, routing, styles, icons, and safe static assets from the service worker cache. |
| **Local operational store** | Store the authorized product/shop snapshot, local projections, pending operations, sync cursor, and conflict records in Dexie/IndexedDB. |
| **Online synchronization** | Upload local operations to Supabase, pull missed server changes, receive connected-client notifications, and reconcile projections. |
| **Server authority** | Supabase Auth, Postgres, RLS, Edge Functions, audit records, payment callbacks, invitations, approvals, and canonical business history. |

IndexedDB is a transactional client-side data store, but it does not provide synchronization or server consistency automatically.[1] Those behaviors must be implemented explicitly by DukaFlow.

## 3. User experience states

The user must always understand whether DukaFlow is operating online, offline, or with pending work.

```text
Online and synchronized
  Sync: Up to date

Offline with local work
  Offline · 2 records saved on this device

Online with pending work
  Syncing · 3 records waiting

Synchronization exception
  Needs review · 1 record could not be applied
```

The application must never block an ordinary permitted sale only because the network is unavailable. It must block or clearly defer operations that require current authority or external confirmation.

## 4. PWA installation and app shell

The implementation must provide a web app manifest with the DukaFlow name, short name, approved logo, Growth Green theme color, light background color, standalone display mode, portrait-friendly orientation, and icons suitable for Android and desktop installation.

The service worker should use the following cache boundaries:

| Resource | Strategy | Reason |
|---|---|---|
| App shell: HTML, JS, CSS, icons | Precache with versioned release | The interface must open when offline. |
| Product and shop data | Dexie/IndexedDB, not Cache Storage | Data requires querying, permissions, projections, and synchronization. |
| Public landing-page assets | Cache-first with versioning | Public content can load quickly and remain available. |
| Supabase API responses | Do not blindly cache | Data must respect organization, shop, user, and permission scope. |
| Images uploaded by the owner | Store metadata locally and fetch/cache authorized files | Access and expiry must be controlled. |
| Dynamic reports | Network-first with cached fallback | Reports must show freshness and cannot pretend stale data is current. |

The service worker must use an explicit version. A new release must not silently delete pending local outbox operations. App-shell upgrades and local-database migrations must be coordinated.

## 5. Routes and authenticated entry

```text
/                         Public landing page
/login                    Email-first login
/register                 Owner registration
/accept-invitation        Helper invitation acceptance
/setup                    Owner setup and shop configuration
/app                      Authenticated role-based landing page
/app/sell                Sale creation
/app/products            Product definitions
/app/inventory            Stock operations
/app/customers            Customer and Deni records
/app/payments             Payment and reconciliation
/app/tasks               Requests and approvals
/app/reports              Reports and insights
/app/people              Helpers, templates, and access
/app/settings             Shop and organization settings
/app/sync                 Sync center and exceptions
```

The route guard must resolve the authenticated user, active organization membership, assigned shop or shops, effective permissions, onboarding state, and restriction state before opening the workspace. A helper must never gain access by typing another shop ID into the URL.

## 6. Local database design

Dexie/IndexedDB should contain a bounded, scoped local database. The local database is not a full copy of Supabase.

| Store | Purpose |
|---|---|
| `local_profile` | Current user, organization membership, assigned shops, and permission snapshot. |
| `local_shops` | Authorized shop profiles and settings required for operation. |
| `local_products` | Authorized active products, units, prices, categories, and thresholds. |
| `local_inventory_projection` | Current local stock projection by shop and product. |
| `local_inventory_movements` | Cached stock movement history needed for audit and explanation. |
| `local_customers` | Authorized customers and limited Deni information. |
| `local_sales` | Locally created and synchronized sales. |
| `local_sale_lines` | Product lines and prices captured at the time of sale. |
| `local_payments` | Cash, M-Pesa reference, and Deni payment events with confirmation state. |
| `outbox_operations` | Durable pending and completed operation records. |
| `sync_cursors` | Last server version/cursor for each organization/shop data stream. |
| `sync_conflicts` | Records requiring user or owner review. |
| `local_audit_events` | Device-side diagnostic events; server audit remains authoritative. |
| `local_metadata` | Database version, last successful sync, storage health, and device identity. |

Local data must be removed or re-scoped when the user logs out, loses access, or changes organization. Pending work must not be silently discarded during logout.

## 7. First offline-first vertical slice

The first implementation should complete one reliable flow before expanding to every tab.

```text
Open assigned shop from local snapshot
        ↓
Search cached product
        ↓
Add product quantity to cart
        ↓
Choose Cash, M-Pesa reference, or Deni
        ↓
Validate local permission and stock policy
        ↓
Commit sale, payment, stock reduction, and outbox record atomically
        ↓
Show receipt and “Saved on this device”
        ↓
Upload when online using idempotency key
        ↓
Server validates and applies transactionally
        ↓
Mark sale “Synced” and pull authoritative changes
```

A local sale must remain available after a browser refresh, tab close, device restart, or temporary network failure.

## 8. Sync coordinator

The sync coordinator is a domain service, not a component hidden inside a screen. It should run when the application starts, returns to the foreground, receives an online event, finishes a local write, receives a Realtime notification, or is triggered by **Sync now**.

```text
1. Check local session and access snapshot.
2. Read pending outbox operations in deterministic order.
3. Group only operations that can safely be submitted together.
4. Submit each operation with the same idempotency key on retry.
5. Process accepted, rejected, and conflict responses.
6. Pull server changes after the last cursor/version.
7. Rebuild or update local projections transactionally.
8. Persist the new cursor and sync timestamp.
9. Notify the UI of the final state.
```

Supabase Realtime can notify connected devices about Postgres changes, broadcasts, and presence, but it does not replace missed-change recovery.[2] After every reconnect, DukaFlow must perform a cursor/version pull even if Realtime reconnects successfully.

## 9. Operation contract

Every syncable write must be an operation with a stable identity.

```ts
interface SyncOperation {
  operationId: string;
  idempotencyKey: string;
  operationType: string;
  organizationId: string;
  shopId: string;
  actorUserId: string;
  clientCreatedAt: string;
  clientSchemaVersion: number;
  payload: unknown;
}
```

The server response must include a stable result.

```ts
interface SyncResult {
  operationId: string;
  status: 'accepted' | 'rejected' | 'conflict';
  serverOperationId?: string;
  serverVersion?: string;
  authoritativeRecords?: unknown[];
  errorCode?: string;
  userMessage?: string;
  retryable: boolean;
}
```

The server must return the same accepted result when it receives a duplicate idempotency key. A network timeout after server acceptance must never create a duplicate sale, payment, or stock movement.

## 10. Online Supabase boundary

Supabase Postgres is the canonical source of business history. RLS must enforce organization, shop, membership, and operation scope. Edge Functions should handle server-side workflows such as helper invitations, M-Pesa callbacks, synchronization ingestion, privileged approvals, and operations requiring secrets.[3]

The browser may use only the publishable Supabase key. Service-role credentials, database passwords, M-Pesa credentials, and other secrets must remain in server-side environment variables or Supabase Function secrets.

Every server operation must validate:

| Validation | Requirement |
|---|---|
| Authentication | The user session is valid and not revoked. |
| Organization | The user belongs to the organization. |
| Shop | The user is assigned to the affected shop. |
| Permission | The operation is allowed by effective Read/Write/Request/Approve rules. |
| Payload | The operation matches the schema and business rules. |
| Idempotency | The operation has not already been applied. |
| Approval | Sensitive changes have the required approver and separation of duties. |
| Audit | The actor, shop, device, time, result, and reason are recorded. |

## 11. Offline capability boundaries by domain

| Domain | Local-first support | Server-only or online confirmation |
|---|---|---|
| Sales | Create sale, calculate totals, capture sale price, and produce a local receipt. | Canonical acceptance and organization-wide totals. |
| Cash | Record Cash payment and local reconciliation note. | Final authoritative reconciliation when multiple devices are involved. |
| M-Pesa | Record customer reference or pending payment. | Safaricom confirmation, callback matching, and credential changes. |
| Inventory | Product lookup, sale reductions, receiving, counts, and permitted adjustments. | Cross-shop transfer finalization and approval-sensitive adjustments. |
| Customers | Create or update permitted customer records and Deni events. | Organization-wide merge and restricted customer data changes. |
| People | View last authorized helper scope. | Invitation, activation, role changes, suspension, and shop assignment. |
| Reports | Show local and cached summaries with freshness labels. | Final combined multi-shop reports and advanced analytics. |
| Settings | Read cached settings. | Change organization, shop, payment, security, and integration settings. |

## 12. Conflict rules

DukaFlow should not use one generic last-write-wins policy.

| Record | Conflict policy |
|---|---|
| Sale | Append-only event; duplicate operation IDs are ignored. |
| Sale price | Preserve the price captured at the time of sale. New price applies only to later sales. |
| Payment | Add correction or reversal events; do not silently edit completed history. |
| M-Pesa | External server confirmation is authoritative. |
| Stock | Preserve movements and reconcile the projection. |
| Deni | Use a ledger of credit, payment, write-off, and correction events. |
| Product name/category | Field-level merge may be allowed with audit history. |
| Permissions | Current server authority wins and removes unauthorized local data. |
| Stock transfer | Use explicit source, destination, quantities, dispatch, receipt, and approval states. |

## 13. PWA update and recovery rules

A new PWA release must display a safe update message instead of forcing an immediate reload while outbox operations are pending.

```text
New version available
Your local work is safe.
Sync pending records before updating.
[Sync now] [Update later]
```

The application must maintain compatibility between the local schema and the deployed application during migration. A failed local migration must preserve the outbox and show a recovery path. Storage quota pressure must be detected before new offline work is accepted, and the user should be directed to synchronize or export rather than lose records.

Background Sync can be used as an enhancement where the browser supports it, but it has limited availability and cannot be required for correctness.[4]

## 14. Implementation sequence

The implementation should proceed in this order:

| Phase | Deliverable |
|---|---|
| 1 | PWA manifest, installable app shell, service worker, offline route loading, and branded loading/error states. |
| 2 | Supabase Auth, organization/shop membership, RLS, permissions, and server schema. |
| 3 | Dexie schema, local projections, scoped cache, operation IDs, and outbox. |
| 4 | Offline-first sales slice with Cash, stock reduction, local receipt, upload, idempotency, and sync states. |
| 5 | Inventory receiving/counts/adjustments, customers, and Deni ledger. |
| 6 | Reconnect pull cursor, Realtime notifications, conflicts, and review tasks. |
| 7 | M-Pesa confirmation callbacks, helper invitations, approvals, reports, and multi-shop reconciliation. |
| 8 | PWA update lifecycle, storage recovery, device revocation, observability, and production hardening. |

## 15. Definition of ready for implementation

The PWA design is ready when the team agrees that the following are non-negotiable: core sales continue without connectivity; local writes are transactional; pending operations survive restarts; retries are idempotent; server authority and RLS cannot be bypassed; missed changes are recovered by cursor-based pulls; M-Pesa recorded is visibly different from M-Pesa confirmed; inventory and Deni are event-based; helper access cannot expand offline; and the interface exposes synchronization state in ordinary business language.

## References

[1]: https://rxdb.info/articles/local-first-future.html "Why Local-First Software Is the Future and its Limitations — RxDB"
[2]: https://supabase.com/docs/guides/realtime "Realtime — Supabase Documentation"
[3]: https://supabase.com/docs/guides/functions "Edge Functions — Supabase Documentation"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API "Background Synchronization API — MDN Web Docs"
[5]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API "IndexedDB API — MDN Web Docs"
[6]: https://powersync.com/blog/bringing-offline-first-to-supabase "PowerSync: Bringing Offline-First To Supabase, The Right Way"

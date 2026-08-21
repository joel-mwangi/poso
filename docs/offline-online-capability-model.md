# DukaFlow Offline-Online Capability Model

**This document defines how DukaFlow operates when connected, disconnected, and reconnecting.** It translates offline-first research into requirements for the smartphone POS, inventory, payments, customers, helpers, multi-shop access, and Supabase backend.

## 1. Core decision

DukaFlow should use a **local-first operational model**. The device must be able to read the shop data needed for the user’s assigned work and record supported operations locally before depending on a network request.

> **The network should improve freshness and collaboration; it should not be the precondition for recording an ordinary shop transaction.**

This is different from simply caching a page. Local-first software keeps relevant data on the device, reads and writes locally, and synchronizes with a server in the background. Research also shows that local-first introduces difficult responsibilities around conflict resolution, client schema migration, storage limits, and convergence.[1]

DukaFlow should therefore treat offline operation as a controlled system with explicit data states, an outbox, server validation, reconciliation, and user-visible exceptions.

## 2. Capability boundary

Not every operation has the same offline risk. The first release should support ordinary shop work offline while requiring an online connection for operations that depend on external confirmation, privileged authority, or current server state.

| Operation | Offline | Online | Rule |
|---|---:|---:|---|
| Open assigned shop workspace | Yes, using the last authorized local snapshot | Yes | Do not expand access while offline. |
| View cached products and prices | Yes | Yes | Show the snapshot time. |
| Create a sale | Yes | Yes | Use a local transaction and operation ID. |
| Record Cash payment | Yes | Yes | Cash is recorded locally and synchronized later. |
| Record Deni | Yes if the customer record is cached | Yes | Apply local policy and mark pending server validation. |
| Record M-Pesa reference manually | Yes | Yes | Recording a reference is not the same as confirming payment. |
| Confirm M-Pesa through an external callback/API | No guarantee | Yes | Requires the relevant online integration and server confirmation. |
| Reduce stock after sale | Yes | Yes | Apply atomically with the sale locally. |
| Receive stock | Yes | Yes | Supplier and product must be available locally. |
| Stock count or adjustment | Yes for permitted operations | Yes | Sensitive adjustments may become approval-pending. |
| Transfer stock between shops | Limited | Yes preferred | Offline source and destination cannot safely assume common current state. Use a request/approval flow unless policy explicitly allows a bounded offline transfer. |
| Invite helper or change permissions | No | Yes | Requires current server authorization and email/Auth handling. |
| Change M-Pesa credentials | No | Yes | Server-side secret handling is required. |
| Approve sensitive operation | Usually no | Yes preferred | Approval requires current authority and separation-of-duties checks. |
| View combined multi-shop summary | Cached only | Yes | Label the summary with its last synchronization time. |

Supabase Realtime can deliver broadcasts, presence, and Postgres changes to connected clients, but Realtime is not a complete offline synchronization system.[2] DukaFlow must recover missed changes with a cursor or version-based pull after reconnect.

## 3. System architecture

```text
React / TypeScript UI
        ↓
Domain service and permission gate
        ↓
Dexie / IndexedDB local database
        ├── Scoped data cache
        ├── Local projections
        ├── Outbox of pending operations
        ├── Sync cursor and server version
        └── Conflict and exception records
        ↓
Sync coordinator
        ├── Startup sync
        ├── Foreground/resume sync
        ├── Online-event sync
        ├── Manual “Sync now”
        └── Optional Background Sync enhancement
        ↓
Supabase Edge Function / authenticated API
        ├── Validate user, organization, shop, and permission
        ├── Check idempotency key
        ├── Apply domain operation transactionally
        ├── Record audit event
        └── Return accepted/rejected/conflict result
        ↓
Supabase Postgres with RLS
        ├── Canonical business records
        ├── Immutable business events/movements
        ├── Sync acknowledgements
        └── Audit trail
```

IndexedDB is appropriate for significant structured client-side data and supports transactional asynchronous operations, but it does not automatically synchronize with a server or guarantee consistency across devices.[3] The sync coordinator, server contract, and conflict policy are therefore required parts of DukaFlow rather than optional infrastructure.

Supabase Edge Functions are suitable for server-side TypeScript logic, authenticated requests, webhooks, integrations, and privileged operations.[4] They should handle sync ingestion, invitations, payment callbacks, approval actions, and other operations that must not trust the browser.

## 4. Local data scope

A device must store only the data needed for its current authorized work. The local database is not a copy of the entire Supabase project.

The local scope is:

```text
Authenticated user
   + active organization
   + assigned shop(s)
   + effective read permissions
   + permitted data sensitivity
   + current operational responsibility
   = downloadable local scope
```

For an owner, the device may cache organization-level summaries and assigned-shop records. For a helper, it should cache only the assigned shop or shops and the records required by the helper’s read permissions. If permissions or shop assignments change online, the next successful synchronization must update the local scope and remove records that are no longer permitted.

A Supabase offline-sync reference describes the same conceptual requirements: scoped data streams, a local database, an upload queue, and consistency checks.[5] DukaFlow may implement this with Dexie first and later evaluate a dedicated replication product if custom synchronization becomes too complex.

## 5. Local operation transaction

Every supported offline write should use one local transaction:

```text
1. Validate the user’s local permission and active shop.
2. Validate the input and current local projection.
3. Generate operation_id and idempotency_key.
4. Create the domain record or event locally.
5. Update the local read projection.
6. Append the operation to the outbox.
7. Commit all local changes atomically.
8. Show the result and sync state to the user.
```

For a sale, the sale, sale lines, payment record, stock reduction, local totals, and outbox operation should either be committed together or not committed at all.

Example:

```text
Sale S-123 created locally
Payment: Cash, recorded locally
Stock: Unga Jogoo reduced by 2
Outbox: waiting to sync
Display: Saved on this device
```

The server must never treat a client-provided current balance as authoritative. It should accept a typed operation or event, validate it, apply it to the canonical data, and return the authoritative result.

## 6. Outbox design

The outbox is a durable local queue for operations that have not yet been accepted by the server.

| Field | Purpose |
|---|---|
| `operation_id` | Unique ID for the operation. |
| `idempotency_key` | Prevents duplicate application after retries. |
| `operation_type` | Sale, payment, receive stock, adjustment, customer update, and so on. |
| `organization_id` | Tenant boundary. |
| `shop_id` | Operational scope. |
| `actor_user_id` | User who performed the action. |
| `payload` | Validated operation data. |
| `local_created_at` | Device time for user display and diagnostics. |
| `client_schema_version` | Supports local schema evolution. |
| `attempt_count` | Retry diagnostics. |
| `next_attempt_at` | Backoff scheduling. |
| `state` | Pending, sending, accepted, rejected, conflict, or needs review. |
| `server_receipt` | Server operation ID, version, and authoritative result. |
| `last_error_code` | Safe technical or domain error code. |

The outbox must be append-oriented. It must not silently discard an operation because the network failed, the tab closed, or the app restarted.

## 7. Synchronization lifecycle

```text
Local operation created
        ↓
Pending sync
        ↓
Attempt upload when online
        ↓
Server authenticates and authorizes
        ↓
Idempotency check
        ↓
Apply domain operation transactionally
        ↓
Return accepted / rejected / conflict
        ↓
Mark outbox and update local projection
        ↓
Pull server changes after the last cursor
        ↓
Reconcile local state
```

Synchronization must run at startup, when the app returns to the foreground, after the browser reports connectivity, after a successful write, and when the user taps **Sync now**. Browser Background Sync can defer work until connectivity returns, but MDN documents it as limited-availability functionality, so DukaFlow must not depend on it for correctness.[6]

Use exponential backoff for temporary failures. Do not retry permanent validation failures indefinitely.

## 8. User-visible sync states

The interface must make the state of the record understandable without exposing technical jargon.

| Internal state | User-facing label | Meaning |
|---|---|---|
| Local committed | **Saved on this device** | The operation is stored locally but has not reached the server. |
| Pending upload | **Waiting to sync** | The operation is queued for upload. |
| Uploading | **Syncing** | The server is processing the operation. |
| Server accepted | **Synced** | The server accepted the operation. |
| Temporary failure | **Will retry** | The operation remains safe and will retry later. |
| Permanent rejection | **Needs correction** | The server rejected the operation and explains the next action. |
| Conflict | **Needs review** | The server cannot safely merge the operation automatically. |
| Stale read snapshot | **Last updated [time]** | The displayed data may not include recent server changes. |

The homepage should show a compact status:

```text
Sync: Up to date
```

or:

```text
3 records waiting to sync
[Sync now]
```

A user must never be told that a payment is confirmed merely because it was recorded offline.

## 9. Conflict policy by domain

DukaFlow should not use one generic last-write-wins rule for every table. Conflict behavior must match the business meaning.

| Domain | Recommended policy |
|---|---|
| **Completed sale** | Append-only event. Do not merge by editing; duplicate operation IDs are ignored. |
| **Cash payment record** | Append payment event; corrections require a separate authorized correction. |
| **M-Pesa confirmation** | Server callback/API result is authoritative. An offline manual reference remains unconfirmed until matched. |
| **Stock movement** | Append movement events. Never overwrite history. Recalculate or reconcile the balance. |
| **Stock adjustment** | Require reason and, above a threshold, review/approval. |
| **Product name/category** | Field-level merge may be acceptable; preserve audit history. |
| **Selling price** | Server policy decides effective time; offline sale records the price used at sale time. |
| **Customer profile** | Field-level merge with audit trail; never silently replace Deni history. |
| **Deni balance** | Event-based ledger. Payments, credit, write-offs, and corrections are separate events. |
| **Permissions/shop assignment** | Server authority wins. Remove local access when the server says the user is no longer permitted. |
| **Shop transfer** | Explicit transfer state with source, destination, quantities, and receipt/approval. |

For inventory, the authoritative model should be event-based:

```text
Opening stock       +30
Offline sale         -2
Online receiving    +10
Damage adjustment    -1
-----------------------
Current projection   37
```

If another device records a conflicting stock adjustment, DukaFlow should preserve both events and create a review task rather than silently choose a number.

## 10. Online-only confirmation boundaries

Some actions may be recorded offline but cannot be treated as confirmed until online:

- M-Pesa transaction confirmation from Safaricom or a server callback.
- Helper invitation delivery and Auth account activation.
- Permission and shop-assignment changes.
- Approval of sensitive refunds, write-offs, transfers, and financial corrections.
- Final organization-wide combined totals.
- Server-generated reports that require complete history.

The user interface should distinguish:

```text
Recorded
≠
Confirmed by external system
```

## 11. Security requirements

Offline capability must not bypass authorization. The device may continue operating only within the last known authorized scope. It must not grant new shops, permissions, reports, or sensitive records while offline.

Server-side sync must validate the authenticated user, active organization membership, assigned shop, effective operation permission, data sensitivity, approval authority, payload schema, and idempotency key. Supabase RLS remains the database boundary, while Edge Functions handle trusted workflows and secrets. Service-role keys and payment credentials must never be stored in browser-exposed environment variables or local IndexedDB.

A device should be revocable. When it next connects, DukaFlow can receive a session or device restriction and stop synchronization. For high-risk changes, the system should require reauthentication or a recent online session.

## 12. Failure and recovery behavior

DukaFlow must handle the following cases explicitly:

| Failure | Required behavior |
|---|---|
| Device goes offline during sale | Finish the local transaction and mark it saved on device. |
| Browser closes after local save | Reopen the outbox and resume safely. |
| Upload request times out | Retry with the same idempotency key. |
| Server accepts but response is lost | Retry safely; server returns the existing result for the same key. |
| User lacks permission after reconnect | Reject and create a clear review state; do not apply the operation. |
| Another device changed the same record | Apply domain-specific conflict policy. |
| IndexedDB quota/storage problem | Stop new offline writes before data loss, explain the issue, and provide sync/recovery guidance. |
| User logs out with pending writes | Warn clearly and require sync or explicit local-device decision before clearing scoped data. |
| App schema changes | Migrate local data transactionally and retain an outbox compatibility path. |

## 13. Recommended delivery phases

### Phase 1: Reliable single-device offline sales

Implement scoped local product data, sale creation, Cash recording, stock reduction, an outbox, idempotent upload, sync status, retry, and a manual **Sync now** action.

### Phase 2: Offline inventory and customers

Add receiving, counts, adjustments, customer creation, Deni events, movement history, and review states.

### Phase 3: Multi-device and multi-shop reconciliation

Add server cursors, Realtime notifications, shop-scoped pull, stock transfers, combined-summary freshness indicators, and conflict tasks.

### Phase 4: External confirmations and advanced recovery

Add M-Pesa callbacks, payment matching, service-worker enhancements, device revocation, data export/recovery, and deeper observability.

## 14. Acceptance criteria

DukaFlow’s offline-online capability is ready for implementation when:

- A permitted user can open their assigned workspace from the last authorized local snapshot.
- A sale can be completed without internet and remains visible after app restart.
- Cash, stock, and the sale are committed atomically in the local database.
- Every offline write has a unique operation and idempotency key.
- Reconnecting cannot duplicate a sale, payment, or stock movement.
- The server validates every operation against current organization, shop, permission, and policy state.
- Missed server changes are recovered through a cursor/version pull, not only Realtime.
- M-Pesa recorded offline is visibly different from M-Pesa confirmed online.
- Inventory and Deni histories are event-based and explainable.
- Conflicts are preserved and routed to review rather than silently overwritten.
- Helpers cannot gain access to a new shop or hidden data while offline.
- The UI communicates Saved on this device, Waiting to sync, Synced, Needs correction, and Needs review.
- Local storage pressure, logout with pending writes, revocation, and schema migration have defined behavior.

## References

[1]: https://rxdb.info/articles/local-first-future.html "Why Local-First Software Is the Future and its Limitations — RxDB"
[2]: https://supabase.com/docs/guides/realtime "Realtime — Supabase Documentation"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API "IndexedDB API — MDN Web Docs"
[4]: https://supabase.com/docs/guides/functions "Edge Functions — Supabase Documentation"
[5]: https://powersync.com/blog/bringing-offline-first-to-supabase "PowerSync: Bringing Offline-First To Supabase, The Right Way"
[6]: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API "Background Synchronization API — MDN Web Docs"

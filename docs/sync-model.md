# DukaFlow Sync Model v1

## Source of truth by location

- During offline operation, the local device database is the operational transaction store.
- After synchronization, Supabase/PostgreSQL is the cloud system of record.
- Integrations such as M-Pesa or messaging do not become the source of truth for a sale.

## Local-first flow

```text
User action
  ↓
Validate domain command
  ↓
Write local transaction
  ↓
Write local outbox event
  ↓
UI reflects committed local state
  ↓
Connectivity available
  ↓
Batch outbox upload
  ↓
Server idempotency check
  ↓
Database transaction
  ↓
Acknowledgement
  ↓
Mark local outbox event synced
```

## Required local records

At minimum the local database should hold:

- products
- categories
- customers
- sales
- sale_items
- payments
- deni_transactions
- inventory_movements
- outbox_events
- sync_state

## Operation identity

Every mutation receives a client-generated `operation_id` and a stable entity `id` before network transmission.

The same operation may be sent multiple times. The server must produce the same business result rather than duplicate the financial effect.

## Retry

Use bounded exponential backoff and preserve failed operations for operator-visible recovery. Never silently delete a failed financial event.

## Batch synchronization

When connected, the client should upload a bounded batch of outbox events. The server returns per-operation success/failure so independent operations can continue even when one item needs manual resolution.

## Conflict strategy

### Financial transactions
Append and compensate. Never overwrite a completed financial record simply because a different copy was synchronized later.

### Catalog configuration
Controlled last-write-wins may be acceptable for low-risk fields, with updated timestamps and audit history.

### Inventory
Inventory is derived from movements. Do not resolve conflicts by overwriting an absolute stock number.

### Deni
Deni is derived from ledger entries. Do not overwrite a customer balance from a stale device snapshot.

## Recovery requirements

A device restart, browser restart, network timeout, or duplicate request must not create a second sale, second payment, second Deni entry, or second inventory effect.

## First implementation boundary

The initial sync engine should support the core vertical slice only:

`cash sale -> local sale/item/payment/inventory records -> outbox -> reconnect -> server acknowledgement`

Then extend the same engine to M-Pesa references and Deni.

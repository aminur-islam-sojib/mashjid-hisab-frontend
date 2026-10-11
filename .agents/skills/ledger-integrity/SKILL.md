---
name: ledger-integrity
description: Use when touching transactions, balances, funds, accounts, transfers, approvals, or reports.
---
- Amounts are integer paisa. Convert only at the UI edge.
- Balance is derived from transactions, never edited directly.
- Every write creates an audit_log row (who, when, old, new).
- Create endpoints accept an Idempotency-Key header.
- A reconciliation check (sum accounts minus sum funds) must exist and be tested.
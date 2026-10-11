# Mashjid Hisab: Product Brief

## Who uses it
Mosque treasurer/admin in Bangladesh. Often non-technical, mostly on phone. Bangla first, English second.

## Core principle
An admin must finish any daily task in under 10 seconds and never wonder
"is my money correct?"

## Domain rules (never violate)
- Money is stored as integer paisa, never floats.
- Accounts = where money is kept (cash, bank). Funds = purpose of money (Zakat, Sadaqah, Construction).
- Account totals must equal fund totals. Any gap is shown as "Unallocated".
- Restricted funds (Zakat) cannot pay general expenses.
- Transactions are never hard-deleted. Use soft delete plus audit log.
- Finalized months are locked.
- Dual-control: some items need a second person to approve.

## Navigation (target)
Dashboard / Daily Work (Income, Expenses, Transfers) / People (Members & Families,
Pledges & Dues, Campaigns) / Records (Ledger, Reports) / Setup (Accounts, Funds, Categories)

## Terminology (use these words in UI)
Total Balance, Money spent, Waiting for approval, Count Jummah Box, Cash & Bank, Funds, All Transactions
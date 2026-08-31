# StrataForge Project Checkpoint

## Current status
Functional implementation with Spring Boot/PostgreSQL backend and React/Vite frontend. This checkpoint contains the latest fixes for database-backed history, saved strategies, ticker names/currency formatting, and resilient schema initialization.

## Latest fixes
- Backtest history endpoints now use explicit owner-id queries and transactional read methods.
- Saved strategy endpoints use explicit user-id queries and support PUT updates.
- Saving a loaded strategy updates the existing saved record instead of silently creating another copy.
- `schema.sql` is idempotent and repairs existing databases with missing backtest columns.
- `spring.sql.init.mode=always` runs the repairable schema on each backend startup without deleting existing market data.
- BacktestRun owner relation is nullable at the JPA level so legacy rows can coexist; new runs are always owned by the authenticated user.
- Ticker summary now includes company names for the supported seeded tickers.
- Strategy Builder ticker dropdown shows ticker, company name, localized price, and day change.
- History and Saved Strategies pages now surface backend error messages instead of masking everything as a generic load failure.

## User environment
- Docker Compose project: `strataforge-dev`
- PostgreSQL host port: `5433`
- Backend host port: `8081`
- Frontend dev port: `5173`
- Database: `strataforge`
- Existing historical market-data volume must NOT be deleted.

## User-side rebuild
From project root:
```cmd
docker compose up -d --build backend
```
Then restart Vite:
```cmd
cd frontend
npm run dev
```

## Important
If the backend was already running, it must be rebuilt/restarted so the updated Java classes and schema initialization run. Existing PostgreSQL data should remain intact.

# StrataForge

StrataForge is a full-stack quantitative strategy research and backtesting platform for building trading strategies, testing them against historical market data, analyzing performance, and exploring parameter combinations.

The project supports two usage modes:

- **Deployed instance:** end users open the hosted StrataForge website and use it directly in a browser.
- **Local instance:** developers run the React frontend, Spring Boot backend, PostgreSQL database, and market-data ingestion locally.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How the Application Works](#how-the-application-works)
- [For Users: Deployed Instances](#for-users-deployed-instances)
- [For Developers: Local Setup](#for-developers-local-setup)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Clerk Authentication Setup](#clerk-authentication-setup)
- [Docker Setup](#docker-setup)
- [Database](#database)
- [Market Data Ingestion](#market-data-ingestion)
- [Historical Data Availability](#historical-data-availability)
- [Backtesting](#backtesting)
- [Parameter Sweeps](#parameter-sweeps)
- [User Data Isolation](#user-data-isolation)
- [Development Commands](#development-commands)
- [API Overview](#api-overview)
- [Production Deployment](#production-deployment)
- [Security](#security)
- [Implementation Checkpoint](#implementation-checkpoint)
- [Troubleshooting](#troubleshooting)
- [Current Status](#current-status)
- [License](#license)

---

# Overview

StrataForge provides a visual environment for quantitative strategy research.

A typical workflow is:

```text
User
  |
  v
Authentication
  |
  v
Strategy Builder
  |
  v
Backtest / Optimization
  |
  v
Results + Analytics
  |
  +------> History
  |
  +------> Saved Strategies
  |
  +------> Comparison
```

The application combines:

- React + TypeScript + Vite for the frontend
- Spring Boot + Java 21 for the backend
- PostgreSQL for application and market data
- Python + yfinance for market-data ingestion
- Clerk for authentication and account management
- Docker for local backend/database orchestration

---

# Features

## Authentication and Accounts

StrataForge uses Clerk as its identity provider and supports:

- Email sign-up and sign-in
- Password authentication
- Username support
- Google sign-in
- Email-based password recovery
- User profile management
- First name editing
- Last name editing
- Username editing
- Profile picture updates
- Password changes that require the current password
- Account-scoped application data

Authentication is owned by Clerk. StrataForge's PostgreSQL database stores application-owned records such as strategies, backtest runs, trades, and the local user mapping.

## Authentication UI

The landing page uses Clerk authentication overlays for the primary **Sign In** and **Get Started** actions. Dedicated sign-in/sign-up pages are retained for direct navigation and fallback use.

## Strategy Builder

The current strategy builder supports:

- Guided strategy creation
- Advanced JSON configuration
- SMA
- EMA
- RSI
- Indicator periods
- Crossover conditions
- Threshold conditions
- Stop loss
- Take profit
- Position sizing

## Backtesting

The backtesting engine currently supports:

- Historical daily OHLCV data
- Chronological bar-by-bar execution
- Long positions
- Position sizing
- Entry conditions
- Exit conditions
- Stop loss
- Take profit
- Equity curve generation
- Trade records
- Total return
- Maximum drawdown
- Sharpe ratio
- Win rate

## Parameter Sweeps

The optimization system can test combinations of:

- Indicator periods
- Stop-loss percentages
- Take-profit percentages
- Position-size percentages

Results can be ranked by metrics such as:

- Sharpe ratio
- Total return
- Win rate
- Maximum drawdown

## Research and Analytics

The current interface includes:

- Backtest result views
- Equity curves
- Drawdown charts
- Price charts
- Trade information
- Backtest history
- Saved strategies
- Result comparison
- Currency display/conversion support

## Historical Data Availability

The application queries PostgreSQL to determine the actual available date range for the selected ticker. The range is not hard-coded in the UI.

Users can be warned when they request dates outside the stored range, while the backend also validates the range server-side.

---

# How the Application Works

```text
                     Clerk
                Authentication
                      |
                      v
              React / Vite Frontend
                      |
                      | Clerk session token
                      v
              Spring Boot REST API
                      |
          +-----------+-----------+
          |                       |
          v                       v
     Backtest Engine          PostgreSQL
          |                       |
          |                       +-- app_user
          |                       +-- strategies
          |                       +-- backtest_runs
          |                       +-- trades
          |                       +-- ohlcv_bars
          |
          v
       Analytics
          |
          v
    Results / History / Compare
```

For protected requests, the browser obtains the current Clerk session token and sends it as a bearer token. Spring Security validates the token before protected controllers access user-owned resources.

---

# For Users: Deployed Instances

If you are using an already deployed StrataForge instance, you do **not** need to install Docker, PostgreSQL, Python, Node.js, Java, or Maven.

Simply open the StrataForge website in your browser.

## Create an Account

Click **Get Started** or **Sign Up**.

Depending on the deployment configuration, you can use:

- Email + password
- Username
- Google

## Sign In

Click **Sign In** and use your configured email/password account or Google sign-in.

## Forgot Password

For password-enabled accounts:

1. Open **Sign In**.
2. Select **Forgot Password?**.
3. Enter your registered email address.
4. Check your email for the recovery code/instructions from Clerk.
5. Enter the verification code when prompted.
6. Create a new password.
7. Sign in again.

Password recovery is handled by Clerk rather than a custom StrataForge SMTP implementation.

## Google Sign-In

Choose **Continue with Google** in the Clerk authentication interface.

Google authentication is handled by Clerk and the configured Google OAuth connection.

## Profile

Open **Profile** from the application navigation.

The profile area can be used to manage:

- First name
- Last name
- Username
- Profile picture

## Change Password

For accounts that have a password:

1. Open **Profile**.
2. Open the **Security** section.
3. Enter the current password.
4. Enter the new password.
5. Confirm the new password.
6. Save the change.

The current password must be correct before the password can be changed.

Google-only users may not have a Clerk password to change and are handled separately by the application.

## Build a Strategy

Open **Strategy Builder**.

A typical workflow is:

1. Select a ticker.
2. Review the historical data range displayed for the ticker.
3. Select the desired start and end dates.
4. Configure indicators and conditions.
5. Configure risk management.
6. Run the backtest.
7. Review the results and charts.

## Historical Date Range

StrataForge uses the data stored for the selected ticker as the source of truth.

For example:

```text
AAPL
Available from: 2010-01-04
Available to:   2026-08-31
```

The actual dates depend on the current database contents and can differ by ticker.

An out-of-range request should be rejected rather than silently running a shorter backtest.

## Results

A successful backtest can provide:

- Total return
- Maximum drawdown
- Sharpe ratio
- Win rate
- Equity curve
- Trade history
- Price/trade visualization

## History

Use **History** to review your stored backtests.

History is scoped to the authenticated account, so one user should not see another user's results.

## Saved Strategies

Use **Saved Strategies** to store and revisit strategies associated with the current account.

## Compare

Use comparison tools to inspect multiple strategy results and compare performance curves and metrics.

---

# For Developers: Local Setup

This section is for developers who want to run StrataForge locally.

## Prerequisites

Install:

- Git
- Docker Desktop
- Node.js and npm
- Python 3.x
- Java 21 if running Spring Boot outside Docker
- Maven if running the backend outside Docker

---

# Project Structure

The current repository is organized as follows:

```text
StrataForge/
|
+-- backend/
|   +-- src/
|   |   +-- main/
|   |       +-- java/
|   |           +-- com/strataforge/
|   +-- Dockerfile
|   +-- pom.xml
|
+-- data/
|   +-- ingest.py
|   +-- requirements.txt
|
+-- db/
|   +-- schema.sql
|
+-- frontend/
|   +-- src/
|   |   +-- api/
|   |   +-- components/
|   |   +-- context/
|   |   +-- pages/
|   |   +-- ...
|   +-- public/
|   +-- package.json
|   +-- vite.config.ts
|
+-- postman_data/
+-- scripts/
+-- .env.example
+-- .gitignore
+-- LICENSE
+-- README.md
+-- SECURITY.md
+-- docker-compose.yml
+-- package-lock.json
+-- render.yaml
+-- vercel.json
```

The repository no longer depends on separate setup/checkpoint documentation files; the relevant setup and implementation notes are consolidated in this README.

---

# Environment Variables

Use separate environment configuration for the backend/Docker environment and the frontend.

## Root `.env`

Create a `.env` file in the project root.

Example:

```env
# PostgreSQL
POSTGRES_DB=strataforge
POSTGRES_USER=strataforge
POSTGRES_PASSWORD=choose-a-secure-local-password

# Backend
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Clerk backend
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER_URL=https://YOUR_INSTANCE.clerk.accounts.dev
CLERK_JWKS_URL=https://YOUR_INSTANCE.clerk.accounts.dev/.well-known/jwks.json
```

Do not commit the root `.env` file.

## Frontend `frontend/.env`

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Only the Clerk **Publishable Key** belongs in the frontend.

Never expose:

```env
CLERK_SECRET_KEY=...
```

through a `VITE_*` variable.

---

# Clerk Authentication Setup

StrataForge uses Clerk for identity, authentication, password recovery, and profile management.

## Recommended Clerk Configuration

Enable:

```text
Email address   Enabled
Password        Enabled
Username        Enabled
Google          Enabled
```

Enable the relevant profile fields for first name and last name editing.

## Clerk Keys

Frontend:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Backend:

```env
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER_URL=https://YOUR_INSTANCE.clerk.accounts.dev
CLERK_JWKS_URL=https://YOUR_INSTANCE.clerk.accounts.dev/.well-known/jwks.json
```

For production, use the production Clerk instance and production credentials.

## Frontend Authentication Flow

The primary landing-page authentication buttons open Clerk's sign-in/sign-up overlays instead of navigating the user away from the landing page.

The intended flow is:

```text
Landing page
    |
    +-- Sign In ---------> Clerk Sign-In modal
    |
    +-- Get Started ------> Clerk Sign-Up modal
                               |
                               +-- Email + Password
                               +-- Google
                               +-- Username
```

The modal can be closed and the user remains on the landing page.

## Password Recovery

The project uses Clerk's built-in recovery flow:

```text
Sign In
   |
   +-- Forgot Password?
             |
             v
        Recovery email
             |
             v
        Verification code
             |
             v
         New password
```

The old application-level SMTP/password-reset implementation is not required for Clerk recovery.

## Profile Management

The `/profile` page supports:

- First name updates
- Last name updates
- Username updates
- Profile picture updates
- Primary email display
- Password changes for password-enabled accounts

Password changes require the current password to be accepted by Clerk.

Google-only accounts are handled without pretending that they have a local password.

## Local User Mapping

The application database keeps its local `app_user` record for ownership of StrataForge resources.

The Clerk user ID is mapped to that local user record. On first authenticated use, the backend can associate a Clerk account with an existing local user by verified email where appropriate or create a new local user.

This allows strategies and backtest history to remain application-owned while authentication remains Clerk-owned.

---

# Docker Setup

Docker runs the local PostgreSQL database and Spring Boot backend.

## Start the Services

From the project root:

```powershell
docker compose up --build
```

After the images are already built, normal restarts can use:

```powershell
docker compose up
```

To stop services:

```powershell
docker compose down
```

Do not use `docker compose down -v` unless you intentionally want to delete the current PostgreSQL volume.

## Local Ports

The current development environment uses:

```text
Frontend       http://localhost:5173
Backend        http://localhost:8081
PostgreSQL     localhost:5434
```

Inside Docker, Spring Boot connects to PostgreSQL using:

```text
postgres:5432
```

The backend listens on port `8080` inside its container and is exposed on port `8081` on the host.

The frontend Vite proxy should forward `/api` to:

```text
http://localhost:8081
```

---

# Database

The PostgreSQL database contains both application data and market data.

Important tables include:

```text
app_user
strategies
backtest_runs
trades
ohlcv_bars
```

The schema is initialized from:

```text
db/schema.sql
```

The project is designed so schema initialization can be rerun safely for current development usage without intentionally deleting stored market data.

---

# Market Data Ingestion

The `data/ingest.py` script downloads daily OHLCV history from Yahoo Finance using `yfinance` and loads it into PostgreSQL.

## Default Tickers

The current default list includes:

```text
AAPL
MSFT
GOOGL
AMZN
TSLA
NVDA
JPM
V
WMT
DIS
NFLX
INTC
AMD
KO
PEP
MCD
NKE
BA
XOM
CVX
USDINR=X
```

## Default Dates

The current ingestion configuration starts from:

```text
2010-01-01
```

and uses the configured ingestion end date.

## Python Requirements

Install the dependencies listed in:

```text
data/requirements.txt
```

For example:

```powershell
python -m pip install -r data/requirements.txt
```

## Run Ingestion

From the project root:

```powershell
python data/ingest.py
```

When the script runs directly on Windows against the new local Docker database, the PostgreSQL host port is:

```text
localhost:5434
```

If using the script's `DATABASE_URL` environment override, a PostgreSQL URL can be supplied like:

```powershell
$env:DATABASE_URL="postgresql://strataforge:YOUR_PASSWORD@localhost:5434/strataforge"
python data/ingest.py
```

The exact password must match the PostgreSQL credentials for the current local container.

## Upserts

Rows are inserted using `(ticker, date)` as the conflict target, so rerunning ingestion updates existing bars rather than creating duplicates.

---

# Historical Data Availability

StrataForge uses the actual SQL contents of `ohlcv_bars` to determine what historical data exists.

Conceptually, the backend uses:

```sql
SELECT MIN(date), MAX(date)
FROM ohlcv_bars
WHERE ticker = ?;
```

The resulting range is shown to the user for the selected ticker.

For example:

```text
AAPL
2010-01-04 → 2026-08-31
```

The exact range can differ by ticker.

## Range Validation

The frontend can warn users about selections outside the available data range.

The backend also validates the request so a caller cannot simply bypass the UI and force an invalid range.

An invalid request should be rejected instead of silently changing the requested start/end dates to the nearest available dates.

---

# Backtesting

The backtest engine processes bars in chronological order and evaluates strategy conditions using data available up to the current point in the simulation.

The current engine is primarily a simplified long-only research engine.

Supported behavior includes:

```text
Entry conditions
Exit conditions
Stop loss
Take profit
Position sizing
Equity tracking
Trade tracking
```

## Current Performance Metrics

```text
Total Return
Maximum Drawdown
Sharpe Ratio
Win Rate
```

## Result Routing and Ownership

A completed backtest should be navigated using the persisted run ID:

```text
/results?runId=<run-id>
```

The result is loaded from the backend for the currently authenticated user.

The application must not use an old browser `sessionStorage` result as a cross-account fallback.

---

# Parameter Sweeps

The parameter sweep system evaluates combinations of strategy parameters.

Current sweep parameters include:

```text
Indicator period
Stop-loss percentage
Take-profit percentage
Position-size percentage
```

Results can be ranked using:

```text
Sharpe ratio
Total return
Win rate
Maximum drawdown
```

The number of generated combinations is bounded to prevent unbounded local jobs.

---

# User Data Isolation

All user-owned application resources must be scoped to the authenticated Clerk user.

Examples include:

- Saved strategies
- Backtest runs
- Backtest history
- Trades associated with stored runs

The intended ownership flow is:

```text
Clerk user ID
     |
     v
Authenticated Spring Security context
     |
     v
Local app_user
     |
     v
Owner-scoped repository query
     |
     v
Current user's records only
```

A user must not be able to retrieve another user's result by changing a backtest ID in a URL or API request.

Transient client-side state is not a substitute for backend ownership checks.

---

# Development Commands

## Start Docker

```powershell
docker compose up
```

## Rebuild Docker

```powershell
docker compose up --build
```

## Stop Docker

```powershell
docker compose down
```

## Check Running Containers

```powershell
docker ps
```

## View Backend Logs

```powershell
docker logs -f strataforge-backend
```

## Install Frontend Dependencies

```powershell
cd frontend
npm install
```

## Start the Frontend

```powershell
npm run dev
```

## Run Market Data Ingestion

From the project root:

```powershell
python data/ingest.py
```

---

# API Overview

The backend exposes endpoints in areas such as:

```text
/api/health
/api/tickers/summary
/api/backtests/bars
/api/backtests/run
/api/backtests/sweep
/api/backtests/history
/api/backtests/history/{id}
/api/strategies
/api/strategies/{id}
```

Protected endpoints require a valid Clerk bearer token.

The exact request and response shapes should be taken from the current Spring controller/DTO implementations.

---

# Production Deployment

A recommended production architecture is:

```text
                     Clerk
                 Authentication
                       |
                       v
              React / Vite Frontend
                       |
                       v
               Spring Boot Backend
                       |
                       v
                Managed PostgreSQL
```

A platform such as Render can host the frontend, backend, and PostgreSQL, or equivalent hosting services can be used.

## Production Differences

Do not carry local values such as:

```text
localhost:5173
localhost:8081
localhost:5434
```

into production unless they are intentionally correct for that environment.

Production should use:

- HTTPS
- Production Clerk credentials
- Production Clerk domains
- Production Google OAuth configuration
- Production database credentials
- Correct production CORS origins
- Secure secret management

## Production Clerk

Use a production Clerk instance and production credentials for deployment.

Configure the production domain and Google OAuth connection appropriately before releasing the application.

## Frontend Deployment

Build the frontend with:

```powershell
cd frontend
npm install
npm run build
```

The generated production files are written to:

```text
dist/
```

Configure SPA routing so application routes resolve to `index.html` when using a static host.

## Backend Deployment

The backend can be deployed from its Dockerfile on a Docker-compatible host.

The production service must listen on the port expected by the hosting platform.

## Database Deployment

Use a managed PostgreSQL service or another production-grade PostgreSQL installation.

Keep database credentials private.

## Market Data in Production

Populate the production database using the ingestion process or another controlled ETL process.

Do not point a production ingestion job at a local developer database.

---

# Security

Never commit secrets to GitHub.

Never commit:

```text
.env
frontend/.env
Clerk Secret Keys
Database passwords
Production credentials
API secrets
```

Only the Clerk publishable key should be exposed to browser code.

The Clerk secret key must remain server-side.

## Authentication

Clerk is the source of truth for user authentication.

The backend must validate authenticated requests before returning protected resources.

## Resource Ownership

Every user-owned resource must be checked against the authenticated user.

Do not trust client-supplied IDs without an ownership check.

See `SECURITY.md` for additional project security notes.

---

# Implementation Checkpoint

The current repository incorporates the following important implementation changes and design decisions.

## Authentication

- Clerk is the authentication provider.
- Email/password, username, and Google sign-in are supported.
- Clerk handles email verification and password recovery.
- Landing-page authentication uses Clerk overlays for the primary Sign In/Get Started actions.
- Profile updates are handled through Clerk.
- Password changes require the current password for password-enabled accounts.
- Clerk bearer tokens are used instead of a custom browser-stored StrataForge JWT.

## Account Isolation

- Backtest history uses explicit owner-based queries.
- Saved strategy endpoints use explicit user ownership checks.
- Newly authenticated Clerk users are associated with a local `app_user` record.
- Result pages do not use stale cross-account session data as a fallback.
- Stored result URLs contain a run ID that is validated against the current authenticated user.

## Backtest Result Flow

The intended flow is:

```text
Run Backtest
     |
     v
Persist BacktestRun
     |
     v
Return runId
     |
     v
/results?runId=<id>
     |
     v
Load result for current authenticated user
```

## Historical Data Range

- The available range is derived from SQL data rather than hard-coded dates.
- The frontend can show the ticker's actual minimum/maximum dates.
- The backend rejects requests outside the stored range.
- The UI should present a clear warning instead of silently shortening the requested range.

## Database and Schema

- The schema is designed for repeatable initialization during development.
- Existing market data should not be deleted merely because the backend is rebuilt.
- New application records are associated with the authenticated local user.

## Local Development Environment

Current development ports:

```text
Frontend:   5173
Backend:    8081 externally / 8080 inside the container
Postgres:   5434 externally / 5432 inside the container
```

Python ingestion runs directly on the host and therefore uses the host PostgreSQL port.

---

# Troubleshooting

## Vite Reports `ECONNREFUSED`

Check:

1. The backend container is running.
2. Docker exposes host `8081` to container `8080`.
3. `frontend/vite.config.ts` points `/api` to `http://localhost:8081`.
4. Vite was restarted after changing its proxy configuration.

Check containers with:

```powershell
docker ps
```

A healthy backend should show a mapping similar to:

```text
0.0.0.0:8081->8080/tcp
```

## PostgreSQL Password Authentication Failed

PostgreSQL initializes its password when the database cluster is first created. Changing `.env` later does not automatically change the password in an existing Docker volume.

For a disposable development database:

```powershell
docker compose down -v
docker compose up --build
```

This deletes the current Compose PostgreSQL volume.

If the database must be preserved, do not use `-v`.

## Python Ingestion Cannot Connect

When `data/ingest.py` is run directly from Windows, use:

```text
localhost:5434
```

When Spring Boot runs inside Docker, it uses:

```text
postgres:5432
```

These values are different because they describe different network contexts.

## Backtest Returns `No historical market data is available`

Verify the database directly:

```powershell
docker exec -it strataforge-postgres psql -U strataforge -d strataforge -c "SELECT ticker, MIN(date) AS available_from, MAX(date) AS available_to FROM ohlcv_bars WHERE ticker = 'AAPL' GROUP BY ticker;"
```

If data exists but the API reports none, inspect the backend query/data-range service rather than changing the requested dates blindly.

## Backtest Request Returns HTTP 400

Check the browser developer tools:

```text
F12 → Network → /api/backtests/run → Response
```

Read the backend's returned error message.

A `400` response can represent a valid validation failure, including an invalid strategy or out-of-range historical dates.

## History Shows a Read-Only SQL Error

The authenticated local user must be established before running owner-scoped read-only queries. If this error appears after a Clerk login, inspect the local-user synchronization path and make sure user provisioning is not being attempted inside a read-only transaction.

## Clerk Authentication Fails

Check:

- Frontend Publishable Key
- Backend Secret Key
- Clerk issuer URL
- Clerk JWKS URL
- Allowed origins/domains
- Google social connection
- Development vs production Clerk instance

Never paste secret keys into source control or public issue trackers.

---

# Current Status

The project currently includes:

- Clerk authentication
- Email/password authentication
- Username support
- Google sign-in
- Clerk password recovery
- Profile management
- Password changes with current-password validation
- User-scoped backtest/history data
- Guided strategy builder
- Advanced strategy configuration
- Historical OHLCV data
- SQL-backed historical date-range detection
- Backtesting
- Parameter sweeps
- Performance analytics
- Result visualization
- Account-isolated result routing
- Dockerized PostgreSQL + Spring Boot local environment

The architecture is designed to be extended with additional indicators, strategy rules, analytics, execution models, optimization methods, and portfolio functionality.

---

# License

See `LICENSE` for the project's license and usage terms.

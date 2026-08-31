# StrataForge

StrataForge is a strategy research and backtesting MVP built around the uploaded product plan: multi-user authentication, saved strategies, historical OHLCV data, a strict bar-by-bar backtest engine, parallel parameter sweeps, and an analytics-first React interface.

## Stack

- Backend: Java 21, Spring Boot, Spring Web, Spring Data JPA, Spring Security, JJWT, PostgreSQL
- Frontend: React + TypeScript + Vite, Monaco Editor, Lightweight Charts
- Data: Stooq daily OHLCV ingestion script
- Local infrastructure: Docker Compose + PostgreSQL

## Local setup

1. Copy `.env.example` to `.env` and replace all placeholder values with secure secrets:
   - `POSTGRES_PASSWORD`: Generate with `openssl rand -base64 24`
   - `DATABASE_PASSWORD`: Must match `POSTGRES_PASSWORD`
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Install ingestion dependencies: `python -m pip install -r data/requirements.txt`.
4. Ingest historical data: `python data/ingest.py`.
5. Start the backend with Maven from `backend/` (`mvn spring-boot:run`) or package it first (`mvn package`).
6. Start the frontend from `frontend/`: `npm install` then `npm run dev`.
7. Open `http://localhost:5173`.

The Vite development server proxies `/api` to `http://localhost:8081` (Docker backend) or `http://localhost:8080` (local Maven). For a deployed frontend, set `VITE_API_URL` to the backend base URL plus `/api`.

## API

- `GET /api/health` — public health check
- `POST /api/auth/signup` — public registration
- `POST /api/auth/signin` — public login
- `GET/POST/DELETE /api/strategies` — authenticated saved strategies
- `POST /api/backtests/run` — authenticated single backtest
- `POST /api/backtests/sweep` — authenticated parallel parameter sweep
- `GET /api/backtests/bars` — authenticated OHLCV bars
- `GET /api/backtests/history` — authenticated persisted run history
- `GET /api/tickers/summary` — authenticated ticker tape data

## Security

⚠️ **IMPORTANT**: Before deploying to production, read [SECURITY.md](SECURITY.md) for critical security requirements.

**Development defaults in this repository are intentionally insecure** to prevent accidental production use. The default credentials like `strataforge_pass_dev_only` will not work in production.

### Required for Production:
- Set a strong `POSTGRES_PASSWORD` and matching `DATABASE_PASSWORD`
- Configure `CORS_ALLOWED_ORIGINS` to match your frontend domain
- Configure SMTP settings for password reset emails

The JWT secret is intentionally environment-backed. Do not commit real secrets or database passwords. Spring Security uses stateless JWT authentication, and protected resources require a valid bearer token.

## Notes on the plan vs implementation

The uploaded plan lists BacktestRun and Trade in the database schema but does not include their complete entity/controller implementation. This repository therefore adds those entities plus optional run persistence when a saved `strategyId` is supplied to `/api/backtests/run`.

The plan's comparison view is described as being used on the sweep results page; this build gives it a dedicated `/compare` route and stores the most recent sweep in browser session storage so up to three results can be compared visually.

## Current UI additions

- INR is the default display currency; the INR/USD toggle uses the latest `USDINR=X` daily close ingested from Yahoo Finance via yfinance.
- Currency switching changes displayed monetary values only; percentage metrics such as return, drawdown, Sharpe and win rate remain unchanged.
- Strategy Builder now exposes Simple and Advanced parameter sweep modes.
- Advanced sweeps can target indicator IDs and supported risk fields: `stopLossPercent`, `takeProfitPercent`, and `positionSizePercent`.
- Landing page uses the generated StrataForge research-workstation visual at `frontend/public/strataforge-hero.png`.

## Indicators

The guided strategy builder and backtest engine support SMA, EMA, and RSI indicators. RSI can be used with `ABOVE_THRESHOLD` and `BELOW_THRESHOLD` rules (for example 30/70); crossover rules remain available for indicator-to-indicator comparisons.

## Authentication

StrataForge uses Clerk for authentication. See `CLERK_SETUP.md` for local development, Google sign-in, email password recovery, profile management, and backend token verification setup.

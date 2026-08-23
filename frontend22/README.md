# StrataForge — Frontend (Member 3)

React + TypeScript frontend for StrataForge, an algorithmic trading backtesting
platform. Lets a user define a strategy through a form or raw JSON DSL, run a single
backtest or a parallel parameter sweep, and view equity curve / drawdown / trade log /
performance analytics.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · react-router-dom · axios ·
lightweight-charts · @monaco-editor/react (code-split, lazy-loaded)

## Feature set

- **Strategy builder** — form ↔ raw JSON DSL kept in sync, live validation, indicator/
  condition editor, risk-rule sliders
- **Quick-start templates** — SMA Crossover, EMA Trend Ride, RSI Mean Reversion, one click
- **Single backtest & parameter sweep modes**, with sweep results ranked and drillable
- **Results dashboard** — equity curve with hover tooltip, drawdown chart, sortable trade
  log, metric cards
- **Monte Carlo trade-sequence simulation** — reshuffles a run's own trades 200 times to
  show a percentile fan chart and outcome histogram, answering "how much was ordering
  luck vs. a real edge" (the differentiator called out in the project docs)
- **Edit & rerun** — jump from any result straight back into the builder, prefilled
- **Export** — trade log to CSV, strategy to JSON (download or copy to clipboard)
- **Local run history** (`/history`) — every run/sweep persists in the browser (not just
  the current tab), with delete / clear-all
- **Compare** (`/compare`) — pick two historical runs and see overlaid equity curves and
  a side-by-side metrics table
- **Bias-guard info strip** — persistent status bar + modal explaining the look-ahead and
  survivorship bias guarantees/caveats from the project docs
- `⌘/Ctrl + Enter` submits the strategy form from anywhere

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 — it lands on `/build`.

## Mock mode (default — no backend needed)

By default the app runs against a **built-in mock engine** (`src/api/mockApi.ts`)
that mirrors the real backend's API contract exactly: same request/response JSON
shapes for `/api/backtests/run` and `/api/backtests/sweep`. This means the whole app —
strategy builder, single backtests, parameter sweeps, results dashboard — is fully
usable and demoable today, before the backend exists.

A "MOCK MODE" badge appears in the nav bar whenever this is active.

## Switching to the real backend

Edit `.env`:

```
VITE_API_URL=http://localhost:8080/api   # or your deployed backend URL
VITE_USE_MOCK_API=false
```

No component code needs to change — every screen calls the endpoints in
`src/api/backtests.ts`, which routes to either the real axios client
(`src/api/client.ts`) or the mock depending on this flag.

### Expected backend endpoints

- `POST /api/backtests/run` — body: `{ strategy, ticker, startDate, endDate }`,
  returns `{ id, trades, equityCurve, drawdownCurve, metrics }`
- `GET /api/backtests/run/:id` — same shape as above
- `POST /api/backtests/sweep` — body:
  `{ strategyTemplate, parameterRanges, ticker, startDate, endDate, rankBy }`,
  returns `{ id, results, rankBy, timing? }`
- `GET /api/backtests/sweep/:id` — same shape as above

See `src/api/types.ts` for the exact TypeScript shapes (this is the source of truth
on the frontend side — keep it in sync with whatever Member 2 ships).

## Project structure

```
src/
├── api/          # types, real client, mock engine, unified backtests.ts
├── components/
│   ├── layout/    # AppShell, NavBar, BiasGuardStrip, Modal, StatusPanel
│   ├── strategy/  # StrategyForm + its sub-fields, DslEditor (lazy)
│   ├── results/   # charts, metrics cards, trade log, Monte Carlo panel/fan chart/histogram
│   └── sweep/     # sweep results table
├── pages/        # StrategyBuilderPage, ResultsPage, SweepResultsPage,
│                 # HistoryPage, ComparePage, NotFoundPage
├── data/         # tickers.ts, presets.ts
└── lib/          # validateStrategy, format, history, prefill, exportUtils,
                  # monteCarlo, storage
```

## Routes

- `/build` — strategy builder (templates, form + raw JSON DSL editor, single backtest or sweep mode)
- `/results/:id` — backtest results dashboard (equity curve, drawdown, trade log, metrics, Monte Carlo)
- `/sweeps/:id` — sweep results table, ranked, with drill-down into `/results/:runId`
- `/history` — locally-persisted past runs and sweeps
- `/compare` — side-by-side comparison of two past runs

## Local persistence

Mock-mode results and the run history index are stored in the browser's
`localStorage` so refreshing `/results/:id` or revisiting `/history` doesn't lose
data — this is purely a frontend/demo convenience; a real backend should persist
server-side instead. Sweep *child* runs (the many combinations inside one sweep)
are kept in-memory only, to stay well under localStorage's ~5MB quota — the sweep
*summary* (ranked table + timing) is still persisted.

## Build

```bash
npm run build   # type-checks with tsc -b, then builds to dist/
npm run preview # serve the production build locally
```

## Deploying (Vercel / Netlify)

1. Push this repo to GitHub.
2. Connect the repo on Vercel or Netlify, set the project root to `frontend/`.
3. Build command: `npm run build`. Output directory: `dist`.
4. Set environment variables in the hosting dashboard:
   - `VITE_API_URL` → the deployed backend URL (from Member 1's deployment)
   - `VITE_USE_MOCK_API` → `false`
5. Deploy, then test the live site end-to-end against the real backend.

## Notes for the team

- Ticker list (`src/data/tickers.ts`) matches the 25-ticker universe Member 1 seeds
  into TimescaleDB — don't add tickers here without also adding them there.
- The Strategy DSL shape (`src/api/types.ts` → `StrategyDefinition`) matches the
  JSON contract from the project docs (indicators/entryCondition/exitCondition/riskRules).
  If Member 2's implementation drifts from this, update `types.ts` and whoever
  changed it should post in the team channel per the API Contract process.
- The parameter-sweep "sequential vs parallel" timing card on the sweep results page
  is currently illustrative (generated client-side). Replace `timing` in the real
  `/api/backtests/sweep` response with Member 2's actual benchmark numbers and it
  will render automatically — no frontend change needed beyond that.

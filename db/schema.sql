CREATE TABLE IF NOT EXISTS app_user (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(64) UNIQUE,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_image_url VARCHAR(1024),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE app_user
  ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(64);

ALTER TABLE app_user
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);

ALTER TABLE app_user
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

ALTER TABLE app_user
  ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(1024);

ALTER TABLE app_user
  ALTER COLUMN password_hash DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_clerk_user_id
  ON app_user(clerk_user_id)
  WHERE clerk_user_id IS NOT NULL;


CREATE TABLE IF NOT EXISTS strategies (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  definition_json TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_strategy_user_created
  ON strategies(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS backtest_runs (
  id BIGSERIAL PRIMARY KEY,
  strategy_id BIGINT REFERENCES strategies(id) ON DELETE SET NULL,
  owner_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE,
  ticker VARCHAR(32) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  parameters TEXT,
  result_json TEXT,
  total_return DOUBLE PRECISION,
  max_drawdown DOUBLE PRECISION,
  sharpe_ratio DOUBLE PRECISION,
  win_rate DOUBLE PRECISION,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE backtest_runs
  ADD COLUMN IF NOT EXISTS owner_id BIGINT;

ALTER TABLE backtest_runs
  ADD COLUMN IF NOT EXISTS result_json TEXT;

ALTER TABLE backtest_runs
  ADD COLUMN IF NOT EXISTS parameters TEXT;

ALTER TABLE backtest_runs
  ADD COLUMN IF NOT EXISTS total_return DOUBLE PRECISION;

ALTER TABLE backtest_runs
  ADD COLUMN IF NOT EXISTS max_drawdown DOUBLE PRECISION;

ALTER TABLE backtest_runs
  ADD COLUMN IF NOT EXISTS sharpe_ratio DOUBLE PRECISION;

ALTER TABLE backtest_runs
  ADD COLUMN IF NOT EXISTS win_rate DOUBLE PRECISION;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_backtest_owner'
  ) THEN
    ALTER TABLE backtest_runs
      ADD CONSTRAINT fk_backtest_owner
      FOREIGN KEY (owner_id) REFERENCES app_user(id)
      ON DELETE CASCADE;
  END IF;
END $$;

UPDATE backtest_runs b
SET owner_id = s.user_id
FROM strategies s
WHERE b.owner_id IS NULL
  AND b.strategy_id = s.id;

CREATE INDEX IF NOT EXISTS idx_backtest_strategy_created
  ON backtest_runs(strategy_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_backtest_owner_created
  ON backtest_runs(owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS trades (
  id BIGSERIAL PRIMARY KEY,
  backtest_run_id BIGINT NOT NULL REFERENCES backtest_runs(id) ON DELETE CASCADE,
  entry_date DATE,
  exit_date DATE,
  entry_price NUMERIC(19,6),
  exit_price NUMERIC(19,6),
  quantity NUMERIC(19,8),
  pnl NUMERIC(19,6)
);

CREATE INDEX IF NOT EXISTS idx_trade_backtest
  ON trades(backtest_run_id);

CREATE TABLE IF NOT EXISTS ohlcv_bars (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(32) NOT NULL,
  date DATE NOT NULL,
  open NUMERIC(19,6) NOT NULL,
  high NUMERIC(19,6) NOT NULL,
  low NUMERIC(19,6) NOT NULL,
  close NUMERIC(19,6) NOT NULL,
  volume BIGINT,
  CONSTRAINT uk_ohlcv_ticker_date UNIQUE(ticker, date)
);

CREATE INDEX IF NOT EXISTS idx_ohlcv_ticker_date
  ON ohlcv_bars(ticker, date);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reset_token_hash
  ON password_reset_tokens(token_hash);

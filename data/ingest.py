"""Load daily OHLCV history from Yahoo Finance via yfinance into PostgreSQL."""

import os
import time
from datetime import date, timedelta

import psycopg2
import yfinance as yf


DEFAULT_TICKERS = [
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "TSLA",
    "NVDA",
    "JPM",
    "V",
    "WMT",
    "DIS",
    "NFLX",
    "INTC",
    "AMD",
    "KO",
    "PEP",
    "MCD",
    "NKE",
    "BA",
    "XOM",
    "CVX",
    "USDINR=X",
]

TICKERS = [
    ticker.strip()
    for ticker in os.getenv(
        "INGEST_TICKERS",
        ",".join(DEFAULT_TICKERS),
    ).split(",")
    if ticker.strip()
]

START_DATE = os.getenv(
    "INGEST_START",
    "2010-01-01",
)

# yfinance treats the `end` date as exclusive.
# Using tomorrow ensures today's available market data can be included.
END_DATE = os.getenv(
    "INGEST_END",
    (date.today() + timedelta(days=1)).isoformat(),
)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://strataforge:your-new-local-db-password@localhost:5434/strataforge",
)


def db_connection():
    """Create a PostgreSQL database connection."""
    return psycopg2.connect(DATABASE_URL)


def download(ticker: str):
    """Download daily OHLCV data for a ticker from Yahoo Finance."""
    return yf.download(
        ticker,
        start=START_DATE,
        end=END_DATE,
        interval="1d",
        auto_adjust=False,
        progress=False,
        actions=False,
        repair=False,
    )


def main():
    """Download and upsert OHLCV data for all configured tickers."""
    print(f"Date range: {START_DATE} -> {END_DATE}")
    print(f"Tickers: {', '.join(TICKERS)}")

    conn = db_connection()

    try:
        cur = conn.cursor()

        for ticker in TICKERS:
            print(f"Downloading {ticker}...")

            try:
                df = download(ticker)

                if df.empty:
                    print(f"  No data returned for {ticker}")
                    continue

                # yfinance can return MultiIndex columns.
                if getattr(df.columns, "nlevels", 1) > 1:
                    df.columns = df.columns.get_level_values(0)

                required_columns = ["Open", "High", "Low", "Close"]

                missing_columns = [
                    column
                    for column in required_columns
                    if column not in df.columns
                ]

                if missing_columns:
                    print(
                        f"  Missing columns for {ticker}: "
                        f"{', '.join(missing_columns)}"
                    )
                    continue

                count = 0

                valid_rows = df.dropna(
                    subset=["Open", "High", "Low", "Close"]
                )

                for index, row in valid_rows.iterrows():
                    volume = row.get("Volume")

                    if volume is None or volume != volume:
                        volume = None
                    else:
                        volume = int(volume)

                    cur.execute(
                        """
                        INSERT INTO ohlcv_bars (
                            ticker,
                            date,
                            open,
                            high,
                            low,
                            close,
                            volume
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (ticker, date) DO UPDATE SET
                                                              open = EXCLUDED.open,
                                                              high = EXCLUDED.high,
                                                              low = EXCLUDED.low,
                                                              close = EXCLUDED.close,
                                                              volume = EXCLUDED.volume
                        """,
                        (
                            ticker.upper(),
                            index.date(),
                            float(row["Open"]),
                            float(row["High"]),
                            float(row["Low"]),
                            float(row["Close"]),
                            volume,
                        ),
                    )

                    count += 1

                conn.commit()

                print(f"  Loaded {ticker}: {count} rows")

            except Exception as exc:
                conn.rollback()
                print(f"  Failed {ticker}: {exc}")

            # Small delay between Yahoo Finance requests.
            time.sleep(1)

        cur.close()

    finally:
        conn.close()

    print("Done.")


if __name__ == "__main__":
    main()
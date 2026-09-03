"""Load daily OHLCV history from Yahoo Finance into PostgreSQL."""

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

DEFAULT_START_DATE = "2010-01-01"

TICKERS = [
    ticker.strip()
    for ticker in os.getenv(
        "INGEST_TICKERS",
        ",".join(DEFAULT_TICKERS),
    ).split(",")
    if ticker.strip()
]

# Yahoo Finance's `end` parameter is exclusive, so using tomorrow's date
# ensures today's completed market data can be included when available.
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


def get_latest_date(cur, ticker):
    """
    Return the latest date already stored for a ticker.

    Returns:
        datetime.date | None
    """
    cur.execute(
        """
        SELECT MAX(date)
        FROM ohlcv_bars
        WHERE ticker = %s
        """,
        (ticker.upper(),),
    )

    return cur.fetchone()[0]


def get_start_date(cur, ticker):
    """
    Determine the first date that needs to be downloaded.

    If the ticker already exists in the database:
        latest database date + 1 day

    If the ticker has no data:
        DEFAULT_START_DATE
    """
    latest_date = get_latest_date(cur, ticker)

    if latest_date is None:
        return DEFAULT_START_DATE

    next_date = latest_date + timedelta(days=1)
    return next_date.isoformat()


def download(ticker, start_date):
    """Download daily OHLCV data from Yahoo Finance."""
    return yf.download(
        ticker,
        start=start_date,
        end=END_DATE,
        interval="1d",
        auto_adjust=False,
        progress=False,
        actions=False,
        repair=False,
    )


def main():
    """Run market-data ingestion for all configured tickers."""
    conn = db_connection()
    failed_tickers = []

    try:
        cur = conn.cursor()

        for ticker in TICKERS:
            ticker = ticker.upper()
            start_date = get_start_date(cur, ticker)

            print(
                f"Downloading {ticker}: "
                f"{start_date} -> {END_DATE}"
            )

            # Nothing new to download.
            if start_date >= END_DATE:
                print(f" {ticker}: already up to date")
                time.sleep(1)
                continue

            try:
                df = download(ticker, start_date)

                if df.empty:
                    print(f" {ticker}: no new market data")
                    time.sleep(1)
                    continue

                # yfinance can return MultiIndex columns.
                if getattr(df.columns, "nlevels", 1) > 1:
                    df.columns = df.columns.get_level_values(0)

                count = 0

                for index, row in df.dropna(
                        subset=["Open", "High", "Low", "Close"]
                ).iterrows():

                    volume = row.get("Volume")

                    # Convert NaN volume to NULL.
                    if volume is None or volume != volume:
                        volume = None
                    else:
                        volume = int(volume)

                    cur.execute(
                        """
                        INSERT INTO ohlcv_bars
                            (ticker, date, open, high, low, close, volume)
                        VALUES
                            (%s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (ticker, date) DO UPDATE SET
                                                              open = EXCLUDED.open,
                                                              high = EXCLUDED.high,
                                                              low = EXCLUDED.low,
                                                              close = EXCLUDED.close,
                                                              volume = EXCLUDED.volume
                        """,
                        (
                            ticker,
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
                print(f" Loaded {ticker}: {count} rows")

            except Exception as exc:
                conn.rollback()
                failed_tickers.append(ticker)
                print(f" Failed {ticker}: {exc}")

            time.sleep(1)

        cur.close()

    finally:
        conn.close()

    # Make GitHub Actions fail visibly if any ticker failed,
    # while still allowing all other tickers to finish.
    if failed_tickers:
        failed = ", ".join(failed_tickers)

        print(
            "Ingestion completed with failures: "
            + failed
        )

        raise RuntimeError(
            "Market-data ingestion failed for: "
            + failed
        )

    print("Done.")


if __name__ == "__main__":
    main()
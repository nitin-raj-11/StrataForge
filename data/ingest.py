"""Load daily OHLCV history from Yahoo Finance via yfinance into PostgreSQL."""
import os
import time
import yfinance as yf
import psycopg2

DEFAULT_TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "JPM", "V", "WMT", "DIS",
    "NFLX", "INTC", "AMD", "KO", "PEP", "MCD", "NKE", "BA", "XOM", "CVX",
    "USDINR=X",
]
TICKERS = [t.strip() for t in os.getenv("INGEST_TICKERS", ",".join(DEFAULT_TICKERS)).split(",") if t.strip()]
START_DATE = os.getenv("INGEST_START", "2010-01-01")
END_DATE = os.getenv("INGEST_END", "2026-09-01")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://strataforge:your-new-local-db-password@localhost:5434/strataforge",
)


def db_connection():
    return psycopg2.connect(DATABASE_URL)


def download(ticker: str):
    return yf.download(
        ticker,
        start=START_DATE,
        end=END_DATE,
        interval="1d",
        auto_adjust=False,
        progress=False,
        actions=False,
        repair=True,
    )


def main():
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
                if getattr(df.columns, "nlevels", 1) > 1:
                    df.columns = df.columns.get_level_values(0)

                count = 0
                for index, row in df.dropna(subset=["Open", "High", "Low", "Close"]).iterrows():
                    volume = row.get("Volume")
                    if volume is None or volume != volume:
                        volume = None
                    else:
                        volume = int(volume)
                    cur.execute(
                        """
                        INSERT INTO ohlcv_bars (ticker, date, open, high, low, close, volume)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (ticker, date) DO UPDATE SET
                          open=EXCLUDED.open, high=EXCLUDED.high, low=EXCLUDED.low,
                          close=EXCLUDED.close, volume=EXCLUDED.volume
                        """,
                        (
                            ticker.upper(), index.date(), float(row["Open"]), float(row["High"]),
                            float(row["Low"]), float(row["Close"]), volume,
                        ),
                    )
                    count += 1
                conn.commit()
                print(f"  Loaded {ticker}: {count} rows")
            except Exception as exc:
                conn.rollback()
                print(f"  Failed {ticker}: {exc}")
            time.sleep(1)
        cur.close()
    finally:
        conn.close()
    print("Done.")


if __name__ == "__main__":
    main()

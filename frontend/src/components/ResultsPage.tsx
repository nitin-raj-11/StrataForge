import { useParams } from "react-router-dom";

import MetricCard from "../components/MetricCard";
import EquityCurve from "../components/EquityCurve";
import DrawdownChart from "../components/DrawdownChart";
import TradeTable from "../components/TradeTable";

const equityData = [
  { time: "2020-01-01", value: 10000 },
  { time: "2020-04-01", value: 10400 },
  { time: "2020-07-01", value: 10150 },
  { time: "2020-10-01", value: 10800 },
  { time: "2021-01-01", value: 11250 },
  { time: "2021-04-01", value: 11700 },
  { time: "2021-07-01", value: 11400 },
  { time: "2021-10-01", value: 12100 },
  { time: "2022-01-01", value: 12700 },
  { time: "2022-04-01", value: 12400 },
  { time: "2022-07-01", value: 13100 },
  { time: "2022-10-01", value: 13800 },
  { time: "2023-01-01", value: 14300 },
  { time: "2023-04-01", value: 13900 },
  { time: "2023-07-01", value: 14700 },
  { time: "2023-10-01", value: 15200 },
  { time: "2024-01-01", value: 15800 },
  { time: "2024-04-01", value: 16500 },
  { time: "2024-07-01", value: 17100 },
  { time: "2024-10-01", value: 17600 },
  { time: "2025-01-01", value: 18100 },
];

const drawdownData = [
  { time: "2020-01-01", value: 0 },
  { time: "2020-04-01", value: -2.1 },
  { time: "2020-07-01", value: -4.8 },
  { time: "2020-10-01", value: -1.2 },
  { time: "2021-01-01", value: -0.5 },
  { time: "2021-04-01", value: -2.4 },
  { time: "2021-07-01", value: -5.1 },
  { time: "2021-10-01", value: -1.8 },
  { time: "2022-01-01", value: -0.9 },
  { time: "2022-04-01", value: -4.2 },
  { time: "2022-07-01", value: -2.1 },
  { time: "2022-10-01", value: -1.4 },
  { time: "2023-01-01", value: -0.7 },
  { time: "2023-04-01", value: -3.9 },
  { time: "2023-07-01", value: -1.1 },
  { time: "2023-10-01", value: -0.8 },
  { time: "2024-01-01", value: -1.2 },
  { time: "2024-04-01", value: -0.6 },
  { time: "2024-07-01", value: -2.8 },
  { time: "2024-10-01", value: -1.3 },
  { time: "2025-01-01", value: 0 },
];

const trades = [
  {
    id: 1,
    entryDate: "2020-02-12",
    exitDate: "2020-05-18",
    entryPrice: 315.42,
    exitPrice: 342.81,
    pnl: 27.39,
    pnlPercent: 8.68,
  },
  {
    id: 2,
    entryDate: "2020-08-04",
    exitDate: "2020-11-20",
    entryPrice: 329.11,
    exitPrice: 351.42,
    pnl: 22.31,
    pnlPercent: 6.78,
  },
  {
    id: 3,
    entryDate: "2021-01-14",
    exitDate: "2021-06-02",
    entryPrice: 376.22,
    exitPrice: 402.76,
    pnl: 26.54,
    pnlPercent: 7.05,
  },
  {
    id: 4,
    entryDate: "2021-08-11",
    exitDate: "2021-10-28",
    entryPrice: 418.32,
    exitPrice: 409.11,
    pnl: -9.21,
    pnlPercent: -2.20,
  },
  {
    id: 5,
    entryDate: "2022-02-10",
    exitDate: "2022-05-24",
    entryPrice: 391.41,
    exitPrice: 425.92,
    pnl: 34.51,
    pnlPercent: 8.82,
  },
];

function ResultsPage() {
  const { id } = useParams();

  return (
    <main className="results-page">
      <div className="results-container">

        <div className="results-header">
          <div>
            <p className="eyebrow">
              BACKTEST RESULTS
            </p>

            <h1>SMA Crossover</h1>

            <p className="results-subtitle">
              AAPL · 2020-01-01 → 2025-01-01
            </p>

            <p className="run-id">
              Run ID: {id}
            </p>
          </div>

          <div className="results-actions">
            <button className="secondary-button">
              Export
            </button>

            <button className="primary-button">
              New Backtest
            </button>
          </div>
        </div>

        <section className="metrics-grid">

          <MetricCard
            label="Total Return"
            value="+81.00%"
            description="Portfolio growth"
          />

          <MetricCard
            label="Sharpe Ratio"
            value="1.87"
            description="Risk-adjusted return"
          />

          <MetricCard
            label="Max Drawdown"
            value="-5.10%"
            description="Largest peak-to-trough decline"
          />

          <MetricCard
            label="Win Rate"
            value="64.20%"
            description="Winning trades"
          />

          <MetricCard
            label="Total Trades"
            value="47"
            description="Completed positions"
          />
        </section>

        <section className="result-card">
          <div className="section-heading">
            <div>
              <h2>Equity Curve</h2>
              <p>
                Portfolio value throughout the backtest
              </p>
            </div>
          </div>

          <EquityCurve data={equityData} />
        </section>

        <section className="result-card">
          <div className="section-heading">
            <div>
              <h2>Drawdown</h2>
              <p>
                Portfolio decline from previous peaks
              </p>
            </div>
          </div>

          <DrawdownChart data={drawdownData} />
        </section>

        <section className="result-card">
          <div className="section-heading">
            <div>
              <h2>Trade Log</h2>
              <p>
                Individual executed trades
              </p>
            </div>
          </div>

          <TradeTable trades={trades} />
        </section>

      </div>
    </main>
  );
}

export default ResultsPage;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MonacoEditor from "./MonacoEditor";
import api from "../api/api";

function StrategyForm() {

    const navigate = useNavigate();

  const [strategyName, setStrategyName] = useState("SMA Crossover");
  const [ticker, setTicker] = useState("AAPL");
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("2025-01-01");

  const [shortPeriod, setShortPeriod] = useState(10);
  const [longPeriod, setLongPeriod] = useState(50);

  const [stopLoss, setStopLoss] = useState(5);
  const [takeProfit, setTakeProfit] = useState(10);

const [strategyJson, setStrategyJson] = useState<string | null>(null);

const [isRunning, setIsRunning] = useState(false);
const [error, setError] = useState("");

  

  const strategy = {
    name: strategyName,
    indicators: [
      {
        id: "smaShort",
        type: "SMA",
        period: shortPeriod,
      },
      {
        id: "smaLong",
        type: "SMA",
        period: longPeriod,
      },
    ],
    entryCondition: {
      type: "CROSSOVER_ABOVE",
      a: "smaShort",
      b: "smaLong",
    },
    exitCondition: {
      type: "CROSSOVER_BELOW",
      a: "smaShort",
      b: "smaLong",
    },
    riskRules: {
      stopLossPercent: stopLoss,
      takeProfitPercent: takeProfit,
      positionSizePercent: 100,
    },
    ticker,
    startDate,
    endDate,
  };

const generatedStrategyJson = JSON.stringify(
  strategy,
  null,
  2
);

const editorValue =
  strategyJson ?? generatedStrategyJson;


const handleRunBacktest = async () => {
  setError("");

  let payload: Record<string, unknown>;

  try {
    payload = JSON.parse(editorValue);
  } catch {
    setError(
      "Invalid JSON. Please fix the strategy definition before running the backtest."
    );
    return;
  }

  try {
    setIsRunning(true);

    console.log("Sending backtest request:", payload);

    const response = await api.post(
      "/backtests/run",
      payload
    );

    console.log("Backtest response:", response.data);

    const resultId =
      response.data?.id ??
      response.data?.runId ??
      response.data?.data?.id;

    if (!resultId) {
      setError(
        "Backend responded, but no backtest result ID was returned."
      );
      return;
    }

    navigate(`/results/${resultId}`);
  } catch (error: any) {
    console.error("Backtest error:", error);

    setError(
      error?.response?.data?.message ??
        error?.message ??
        "Failed to run backtest."
    );
  } finally {
    setIsRunning(false);
  }
};


  return (
    <div className="strategy-builder">
      <div className="builder-header">
        <div>
          <p className="eyebrow">STRATEGY BUILDER</p>
          <h1>Build your strategy</h1>
          <p className="subtitle">
            Define your trading rules and prepare a backtest.
          </p>
        </div>

            <button
                className="primary-button"
                onClick={handleRunBacktest}
                disabled={isRunning}
>
  {isRunning ? "Running..." : "Run Backtest"}
            </button>

    {error && (
    <div className="error-message">
        {error}
    </div>
)}

      </div>

      <div className="builder-grid">
        <section className="builder-card">
          <h2>Strategy Configuration</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Strategy Name</label>
              <input
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Ticker</label>

              <select
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              >
                <option value="AAPL">AAPL</option>
                <option value="MSFT">MSFT</option>
                <option value="GOOGL">GOOGL</option>
                <option value="AMZN">AMZN</option>
                <option value="TSLA">TSLA</option>
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="builder-card">
          <h2>Indicators</h2>

          <div className="indicator-row">
            <div>
              <strong>SMA</strong>
              <span>Short moving average</span>
            </div>

            <div className="small-input">
              <label>Period</label>
              <input
                type="number"
                min="2"
                value={shortPeriod}
                onChange={(e) =>
                  setShortPeriod(Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="indicator-row">
            <div>
              <strong>SMA</strong>
              <span>Long moving average</span>
            </div>

            <div className="small-input">
              <label>Period</label>
              <input
                type="number"
                min="2"
                value={longPeriod}
                onChange={(e) =>
                  setLongPeriod(Number(e.target.value))
                }
              />
            </div>
          </div>
        </section>

        <section className="builder-card">
          <h2>Trading Rules</h2>

          <div className="rule-box">
            <span>ENTRY</span>
            <strong>SMA Short crosses above SMA Long</strong>
          </div>

          <div className="rule-box">
            <span>EXIT</span>
            <strong>SMA Short crosses below SMA Long</strong>
          </div>
        </section>

        <section className="builder-card">
          <h2>Risk Rules</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Stop Loss (%)</label>

              <input
                type="number"
                min="0"
                value={stopLoss}
                onChange={(e) =>
                  setStopLoss(Number(e.target.value))
                }
              />
            </div>

            <div className="form-group">
              <label>Take Profit (%)</label>

              <input
                type="number"
                min="0"
                value={takeProfit}
                onChange={(e) =>
                  setTakeProfit(Number(e.target.value))
                }
              />
            </div>
          </div>
        </section>
      </div>

    <section className="json-card">
        <div className="json-header">
          <div>
            <h2>Strategy JSON</h2>
            <p>Generated strategy definition</p>
          </div>

          <span className="json-status">VALID JSON</span>
        </div>

        
        <div className="monaco-container">
            <MonacoEditor
                value={editorValue}
                onChange={setStrategyJson}
            />
        </div>

    </section>
    </div>
  );
}

export default StrategyForm;
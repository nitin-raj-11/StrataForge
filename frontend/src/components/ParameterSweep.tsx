import { useState } from "react";

interface SweepResult {
  rank: number;
  shortPeriod: number;
  longPeriod: number;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
}

const mockResults: SweepResult[] = [
  {
    rank: 1,
    shortPeriod: 10,
    longPeriod: 40,
    totalReturn: 51.2,
    sharpeRatio: 2.14,
    maxDrawdown: -8.4,
    winRate: 68.2,
  },
  {
    rank: 2,
    shortPeriod: 15,
    longPeriod: 40,
    totalReturn: 48.7,
    sharpeRatio: 2.03,
    maxDrawdown: -9.1,
    winRate: 65.8,
  },
  {
    rank: 3,
    shortPeriod: 10,
    longPeriod: 60,
    totalReturn: 46.3,
    sharpeRatio: 1.96,
    maxDrawdown: -10.2,
    winRate: 64.1,
  },
  {
    rank: 4,
    shortPeriod: 20,
    longPeriod: 60,
    totalReturn: 43.9,
    sharpeRatio: 1.89,
    maxDrawdown: -11.3,
    winRate: 62.7,
  },
  {
    rank: 5,
    shortPeriod: 15,
    longPeriod: 80,
    totalReturn: 41.8,
    sharpeRatio: 1.82,
    maxDrawdown: -12.1,
    winRate: 61.4,
  },
];

function ParameterSweep() {
  const [shortMin, setShortMin] = useState(5);
  const [shortMax, setShortMax] = useState(20);
  const [shortStep, setShortStep] = useState(5);

  const [longMin, setLongMin] = useState(20);
  const [longMax, setLongMax] = useState(100);
  const [longStep, setLongStep] = useState(20);

  const [rankingMetric, setRankingMetric] =
    useState("sharpeRatio");

  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleRunSweep = () => {
    setIsRunning(true);

    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
    }, 800);
  };

  return (
    <main className="sweep-page">
      <div className="sweep-container">

        <div className="sweep-header">
          <div>
            <p className="eyebrow">
              PARAMETER SWEEP
            </p>

            <h1>Optimize your strategy</h1>

            <p className="sweep-subtitle">
              Test multiple parameter combinations and
              find the strongest configuration.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={handleRunBacktest}
            disabled={isRunning}
          >
            {isRunning ? "Running Sweep..." : "Run Sweep"}
          </button>
        </div>

        <section className="sweep-card">

          <div className="section-heading">
            <div>
              <h2>Parameter Ranges</h2>

              <p>
                Define the values that should be tested.
              </p>
            </div>
          </div>

          <div className="parameter-grid">

            <div className="parameter-group">

              <div className="parameter-title">
                <strong>SMA Short Period</strong>
                <span>Short moving average</span>
              </div>

              <div className="range-grid">

                <div className="form-group">
                  <label>Min</label>

                  <input
                    type="number"
                    min="1"
                    value={shortMin}
                    onChange={(e) =>
                      setShortMin(
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Max</label>

                  <input
                    type="number"
                    min="1"
                    value={shortMax}
                    onChange={(e) =>
                      setShortMax(
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Step</label>

                  <input
                    type="number"
                    min="1"
                    value={shortStep}
                    onChange={(e) =>
                      setShortStep(
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

              </div>
            </div>

            <div className="parameter-group">

              <div className="parameter-title">
                <strong>SMA Long Period</strong>
                <span>Long moving average</span>
              </div>

              <div className="range-grid">

                <div className="form-group">
                  <label>Min</label>

                  <input
                    type="number"
                    min="1"
                    value={longMin}
                    onChange={(e) =>
                      setLongMin(
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Max</label>

                  <input
                    type="number"
                    min="1"
                    value={longMax}
                    onChange={(e) =>
                      setLongMax(
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Step</label>

                  <input
                    type="number"
                    min="1"
                    value={longStep}
                    onChange={(e) =>
                      setLongStep(
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

              </div>
            </div>

          </div>

          <div className="sweep-options">

            <div className="form-group">
              <label>Rank Results By</label>

              <select
                value={rankingMetric}
                onChange={(e) =>
                  setRankingMetric(e.target.value)
                }
              >
                <option value="sharpeRatio">
                  Sharpe Ratio
                </option>

                <option value="totalReturn">
                  Total Return
                </option>

                <option value="maxDrawdown">
                  Max Drawdown
                </option>

                <option value="winRate">
                  Win Rate
                </option>
              </select>
            </div>

            <div className="combination-count">
              <span>Estimated combinations</span>

              <strong>
                {Math.max(
                  0,
                  Math.floor(
                    (shortMax - shortMin) /
                      shortStep
                  ) + 1
                ) *
                  Math.max(
                    0,
                    Math.floor(
                      (longMax - longMin) /
                        longStep
                    ) + 1
                  )}
              </strong>
            </div>

          </div>
        </section>

        {hasRun && (
          <section className="sweep-card">

            <div className="section-heading">
              <div>
                <h2>Sweep Results</h2>

                <p>
                  Ranked strategy configurations
                </p>
              </div>

              <span className="json-status">
                {mockResults.length} RESULTS
              </span>
            </div>

            <div className="trade-table-wrapper">

              <table className="trade-table">

                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Short SMA</th>
                    <th>Long SMA</th>
                    <th>Total Return</th>
                    <th>Sharpe</th>
                    <th>Max Drawdown</th>
                    <th>Win Rate</th>
                  </tr>
                </thead>

                <tbody>

                  {mockResults.map((result) => (
                    <tr key={result.rank}>

                      <td>
                        <strong>
                          #{result.rank}
                        </strong>
                      </td>

                      <td>
                        {result.shortPeriod}
                      </td>

                      <td>
                        {result.longPeriod}
                      </td>

                      <td className="profit">
                        +{result.totalReturn.toFixed(2)}%
                      </td>

                      <td>
                        {result.sharpeRatio.toFixed(2)}
                      </td>

                      <td className="loss">
                        {result.maxDrawdown.toFixed(2)}%
                      </td>

                      <td>
                        {result.winRate.toFixed(2)}%
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          </section>
        )}

      </div>
    </main>
  );
}

export default ParameterSweep;
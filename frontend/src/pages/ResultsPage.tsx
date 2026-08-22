import { useParams } from "react-router-dom";

function ResultsPage() {
  const { id } = useParams();

  return (
    <main className="results-page">
      <div className="results-container">
        <p className="eyebrow">BACKTEST RESULTS</p>

        <h1>Backtest Results</h1>

        <p className="results-subtitle">
          Results for backtest {id || "latest"}
        </p>

        <section className="results-card">
          <h2>Results Dashboard</h2>

          <p>
            Backtest results will appear here when the
            backend API is connected.
          </p>
        </section>
      </div>
    </main>
  );
}

export default ResultsPage;
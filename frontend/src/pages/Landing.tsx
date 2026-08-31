import { Link } from "react-router-dom";
import AuthModalButton from "../components/AuthModalButton";
import CurrencyToggle from "../components/CurrencyToggle";
import ThemeToggle from "../components/ThemeToggle";
import { useCurrency } from "../context/CurrencyContext";
import BrandMark from "../components/BrandMark";
import {
  ArrowIcon,
  BoltIcon,
  ChartIcon,
  ClockIcon,
  CompareIcon,
  LayersIcon,
  SaveIcon,
  SparkIcon,
} from "../components/Icons";

function MiniCandleChart() {
  const candles = [
    { o: 46, h: 34, l: 58, c: 39, up: true },
    { o: 40, h: 29, l: 51, c: 47, up: false },
    { o: 47, h: 21, l: 54, c: 30, up: true },
    { o: 31, h: 24, l: 45, c: 37, up: true },
    { o: 37, h: 18, l: 42, c: 24, up: true },
    { o: 25, h: 14, l: 32, c: 20, up: true },
    { o: 21, h: 12, l: 29, c: 26, up: false },
    { o: 26, h: 7, l: 33, c: 16, up: true },
    { o: 17, h: 10, l: 22, c: 12, up: true },
    { o: 13, h: 4, l: 20, c: 8, up: true },
    { o: 9, h: 6, l: 16, c: 14, up: false },
    { o: 14, h: 2, l: 19, c: 7, up: true },
  ];
  return (
    <svg className="hero-chart" viewBox="0 0 620 300" role="img" aria-label="Stylized market chart with candles and equity curve">
      <defs>
        <linearGradient id="heroGlow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--amber)" stopOpacity=".28" />
          <stop offset="1" stopColor="var(--amber)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[48, 96, 144, 192, 240].map((y) => <line key={y} x1="20" x2="600" y1={y} y2={y} className="chart-grid-line" />)}
      {candles.map((candle, i) => {
        const x = 32 + i * 48;
        return (
          <g key={i}>
            <line x1={x + 5} x2={x + 5} y1={candle.h} y2={candle.l} className={candle.up ? "candle-wick gain-stroke" : "candle-wick loss-stroke"} />
            <rect x={x} y={Math.min(candle.o, candle.c)} width="10" height={Math.max(8, Math.abs(candle.c - candle.o))} rx="2" className={candle.up ? "candle gain-fill" : "candle loss-fill"} />
          </g>
        );
      })}
      <path d="M20 255 C80 238 105 250 145 220 S220 205 250 180 S315 150 345 164 S410 115 450 110 S530 70 600 34 L600 280 L20 280 Z" fill="url(#heroGlow)" />
      <path d="M20 255 C80 238 105 250 145 220 S220 205 250 180 S315 150 345 164 S410 115 450 110 S530 70 600 34" className="equity-line" />
      <circle cx="250" cy="180" r="5" className="signal-dot" />
      <circle cx="450" cy="110" r="5" className="signal-dot" />
      <line x1="250" x2="250" y1="180" y2="268" className="signal-line" />
      <line x1="450" x2="450" y1="110" y2="268" className="signal-line" />
    </svg>
  );
}

function FloatingMetric({ label, value, tone = "gain", className = "" }: { label: string; value: string; tone?: "gain" | "loss" | "amber"; className?: string }) {
  return (
    <div className={`floating-metric ${className}`}>
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

function FeatureVisual({ type }: { type: "build" | "backtest" | "optimize" | "analyze" }) {
  if (type === "build") {
    return (
      <div className="feature-visual feature-visual-build">
        <div className="builder-node root"><span className="node-dot" />SMA crossover</div>
        <div className="builder-line line-a" />
        <div className="builder-line line-b" />
        <div className="builder-node child child-a"><span className="node-dot" />SMA 10</div>
        <div className="builder-node child child-b"><span className="node-dot" />SMA 50</div>
        <div className="builder-node child child-c"><span className="node-dot" />Risk 5 / 10</div>
      </div>
    );
  }

  if (type === "backtest") {
    return (
      <div className="feature-visual feature-visual-backtest">
        <svg viewBox="0 0 420 170" aria-hidden="true">
          <line x1="16" y1="145" x2="404" y2="145" className="chart-grid-line" />
          {[50, 90, 130, 170, 210, 250, 290, 330, 370].map((x) => <line key={x} x1={x} y1="25" x2={x} y2="145" className="chart-grid-line" />)}
          <path d="M18 120 C62 90 75 112 112 78 S174 92 210 72 S275 65 308 48 S355 54 402 22" className="feature-equity" />
          <circle cx="108" cy="80" r="5" className="signal-marker-buy" />
          <circle cx="210" cy="72" r="5" className="signal-marker-buy" />
          <circle cx="308" cy="48" r="5" className="signal-marker-sell" />
        </svg>
        <div className="mini-label buy">BUY</div>
        <div className="mini-label sell">SELL</div>
      </div>
    );
  }

  if (type === "optimize") {
    return (
      <div className="feature-visual feature-visual-optimize">
        <div className="heatmap-labels"><span>SMA Short</span><span>SMA Long</span></div>
        <div className="heatmap-grid">
          {[
            ".22", ".42", ".51", ".46", ".31",
            ".38", ".62", ".84", ".72", ".55",
            ".21", ".49", "1.31", ".91", ".66",
            ".18", ".36", ".77", ".68", ".44",
            ".10", ".24", ".48", ".55", ".35",
          ].map((value, i) => <span key={i} className={`heat-cell ${i === 12 ? "hot" : i % 4 === 2 ? "warm" : ""}`}>{value}</span>)}
        </div>
      </div>
    );
  }

  return (
    <div className="feature-visual feature-visual-analyze">
      <div className="analysis-ring"><span>1.31</span><small>Sharpe</small></div>
      <div className="analysis-bars">
        <span style={{ height: "44%" }} />
        <span style={{ height: "58%" }} />
        <span style={{ height: "36%" }} />
        <span style={{ height: "74%" }} />
        <span style={{ height: "86%" }} />
      </div>
      <div className="analysis-caption">Signal quality / risk / return</div>
    </div>
  );
}

export default function Landing() {
  const { formatMoney } = useCurrency();
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="container landing-nav">
          <Link to="/" className="landing-brand">
            <span className="landing-brand-mark"><BrandMark size={34} /></span>
            <span>StrataForge</span>
          </Link>
          <div className="landing-actions">
            <CurrencyToggle compact />
            <ThemeToggle compact />
            <AuthModalButton mode="signIn" className="button button-secondary">Sign in</AuthModalButton>
            <AuthModalButton mode="signUp" className="button button-primary">Get started</AuthModalButton>
          </div>
        </div>
      </header>

      <main className="container landing-inner">
        <section className="hero-wrap">
          <div className="hero-copy">
            <div className="eyebrow">Strategy research workstation</div>
            <h1>Turn trading ideas into <span>evidence.</span></h1>
            <p>Build strategies in plain language or JSON. Backtest against real historical data. Explore parameter spaces. Then inspect the exact trades, assumptions, and risks behind every result.</p>
            <div className="hero-actions">
              <AuthModalButton mode="signUp" className="button button-primary button-large">Start building <ArrowIcon size={17} /></AuthModalButton>
              <AuthModalButton mode="signIn" className="button button-secondary button-large">Explore workspace</AuthModalButton>
            </div>
            <div className="hero-trust-row">
              <span><BoltIcon size={14} /> No look-ahead</span>
              <span><CompareIcon size={14} /> Parallel sweeps</span>
              <span><SparkIcon size={14} /> INR default</span>
            </div>
          </div>

          <div className="hero-scene" aria-label="StrataForge strategy analytics visualization">
            <div className="hero-scene-grid" />
            <div className="scene-orb orb-a" />
            <div className="scene-orb orb-b" />
            <div className="scene-spark spark-a" />
            <div className="scene-spark spark-b" />
            <div className="scene-axis axis-one" />
            <div className="scene-axis axis-two" />
            <div className="hero-panel">
              <div className="hero-panel-top">
                <div><span className="panel-kicker">AAPL · SMA CROSSOVER</span><strong>Research run #018</strong></div>
                <span className="live-pill"><span /> live data</span>
              </div>
              <div className="hero-chart-frame">
                <MiniCandleChart />
                <div className="chart-price">{formatMoney(192.53)}</div>
                <div className="chart-buy">BUY</div>
                <div className="chart-sell">SELL</div>
              </div>
              <div className="hero-panel-footer">
                <span>2020—2024</span>
                <span className="gain">+46.00%</span>
                <span>Sharpe 0.90</span>
              </div>
            </div>
            <FloatingMetric label="Total return" value="+46.00%" className="metric-one" />
            <FloatingMetric label="Max drawdown" value="−9.51%" tone="loss" className="metric-two" />
            <FloatingMetric label="Optimization" value="60 tests" tone="amber" className="metric-three" />
            <div className="scene-tag scene-tag-one"><ClockIcon size={13} /> bar-by-bar</div>
            <div className="scene-tag scene-tag-two"><LayersIcon size={13} /> strategy graph</div>
            <div className="scene-currency"><span>₹ INR</span><i /><span>$ USD</span></div>
          </div>
        </section>

        <section className="value-strip">
          <div className="value-item"><span className="value-index">01</span><div><strong>Define</strong><p>Indicators, signals, and risk rules.</p></div></div>
          <div className="value-item"><span className="value-index">02</span><div><strong>Backtest</strong><p>Walk historical bars without look-ahead.</p></div></div>
          <div className="value-item"><span className="value-index">03</span><div><strong>Optimize</strong><p>Search parameter combinations in parallel.</p></div></div>
          <div className="value-item"><span className="value-index">04</span><div><strong>Review</strong><p>Keep every run and compare candidates.</p></div></div>
        </section>

        <section className="product-showcase">
          <div className="section-heading section-heading-split">
            <div><div className="eyebrow">Inside the workstation</div><h2>Built around how research actually happens.</h2></div>
            <p>Four surfaces. One continuous research loop.</p>
          </div>
          <div className="showcase-grid">
            <article className="showcase-card surface">
              <div className="showcase-top"><div><span className="showcase-number">01</span><h3>Build</h3></div><BoltIcon /></div>
              <FeatureVisual type="build" />
              <p>Start with guided controls for SMA, EMA, and RSI strategies, then move into Advanced JSON when you need exact control.</p>
            </article>
            <article className="showcase-card surface">
              <div className="showcase-top"><div><span className="showcase-number">02</span><h3>Backtest</h3></div><ChartIcon /></div>
              <FeatureVisual type="backtest" />
              <p>See price action, entries, exits, equity, and the trade ledger as one research artifact.</p>
            </article>
            <article className="showcase-card surface">
              <div className="showcase-top"><div><span className="showcase-number">03</span><h3>Optimize</h3></div><CompareIcon /></div>
              <FeatureVisual type="optimize" />
              <p>Use Simple or Advanced sweep modes to find promising parameter regions instead of guessing one set.</p>
            </article>
            <article className="showcase-card surface">
              <div className="showcase-top"><div><span className="showcase-number">04</span><h3>Analyze</h3></div><SparkIcon /></div>
              <FeatureVisual type="analyze" />
              <p>Compare results, preserve history, and keep currency presentation separate from performance math.</p>
            </article>
          </div>
        </section>

        <section className="research-band surface">
          <div className="research-copy">
            <div className="eyebrow">Simple → advanced</div>
            <h2>A parameter sweep that explains itself.</h2>
            <p>Start with intuitive min / max / step controls. Switch to Advanced when you want to search multiple indicators and risk parameters together.</p>
            <div className="research-points">
              <span><span className="point-icon"><ChartIcon size={14} /></span> Live test count</span>
              <span><span className="point-icon"><LayersIcon size={14} /></span> Parallel execution</span>
              <span><span className="point-icon"><SaveIcon size={14} /></span> Keep the winners</span>
            </div>
          </div>
          <div className="sweep-demo">
            <div className="sweep-demo-head"><span>Parameter Sweep</span><div className="mode-switch-static"><b>Simple</b><span>Advanced</span></div></div>
            <div className="sweep-demo-row"><strong>SMA Short</strong><span>5</span><div className="sweep-track"><i /></div><span>30</span><em>5</em></div>
            <div className="sweep-demo-row"><strong>SMA Long</strong><span>20</span><div className="sweep-track"><i style={{ width: "71%" }} /></div><span>100</span><em>10</em></div>
            <div className="sweep-demo-divider" />
            <div className="sweep-demo-results"><div><span>Estimated tests</span><strong>60</strong></div><div><span>Rank by</span><strong>Sharpe Ratio</strong></div><button>Run optimization <ArrowIcon size={14} /></button></div>
          </div>
        </section>

        <section className="currency-band">
          <div className="currency-copy">
            <div className="eyebrow">Presentation layer</div>
            <h2>Research in ₹ first. Switch to $ when you need it.</h2>
            <p>StrataForge defaults to INR for the workspace, with a one-click USD view using the stored USD/INR market rate. Performance percentages stay mathematically unchanged.</p>
          </div>
          <div className="currency-card surface">
            <div className="currency-toggle-large"><span className="active">INR</span><i /><span>USD</span></div>
            <div className="currency-rate"><span>USD / INR</span><strong>₹83.28</strong><small>from USDINR=X</small></div>
            <div className="currency-metric"><span>Backtest return</span><strong className="gain">+46.00%</strong></div>
          </div>
        </section>

        <section className="cta surface">
          <div><div className="eyebrow">Start with a real question</div><h2>Build a strategy worth questioning.</h2><p className="muted">Not a dashboard that hides the work. A workstation that lets you inspect it.</p></div>
          <AuthModalButton mode="signUp" className="button button-primary button-large">Create your workspace <ArrowIcon size={17} /></AuthModalButton>
        </section>

        <footer className="landing-footer"><span>StrataForge · strategy research workstation</span><span>INR default · USD available</span></footer>
      </main>
    </div>
  );
}

import StrategyForm from '../components/strategy/StrategyForm'

export default function StrategyBuilderPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-7">
        <p className="label-eyebrow mb-2">Backtest your edge, before you bet on it</p>
        <h1 className="text-2xl sm:text-[28px] font-semibold">Build a strategy</h1>
        <p className="text-ink-muted text-[14px] mt-1.5">
          Define indicators, entry/exit rules, and risk limits — then run a single backtest or a
          parallel parameter sweep against historical daily data.
        </p>
      </div>
      <StrategyForm />
    </div>
  )
}

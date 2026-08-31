import { useCurrency } from "../context/CurrencyContext";

export default function CurrencyToggle({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency, usdInr, loadingRate } = useCurrency();
  return (
    <div className={`currency-control ${compact ? "compact" : ""}`} title={usdInr ? `1 USD = ₹${usdInr.toFixed(2)}` : "USD/INR rate unavailable"}>
      <span className={currency === "INR" ? "active" : ""}>₹ INR</span>
      <button
        className={`currency-slider ${currency === "USD" ? "usd" : "inr"}`}
        onClick={() => setCurrency(currency === "INR" ? "USD" : "INR")}
        aria-label={`Switch display currency to ${currency === "INR" ? "$ USD" : "₹ INR"}`}
        aria-pressed={currency === "USD"}
        type="button"
      >
        <span className="currency-knob" />
      </button>
      <span className={currency === "USD" ? "active" : ""}>$ USD</span>
      {!compact && <small>{loadingRate ? "FX loading" : usdInr ? `1 USD = ₹${usdInr.toFixed(2)}` : "FX unavailable"}</small>}
    </div>
  );
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import client from "../api/client";

export type CurrencyCode = "INR" | "USD";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (value: CurrencyCode) => void;
  usdInr: number | null;
  loadingRate: boolean;
  formatMoney: (usdValue: number, options?: Intl.NumberFormatOptions) => string;
  convertFromUsd: (usdValue: number) => number;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem("displayCurrency");
    return saved === "USD" ? "USD" : "INR";
  });
  const [usdInr, setUsdInr] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  useEffect(() => {
    let mounted = true;
    client.get<{ usdInr: number | null; available: boolean }>("/currency/usdinr")
      .then((res) => mounted && setUsdInr(res.data.usdInr))
      .catch(() => mounted && setUsdInr(null))
      .finally(() => mounted && setLoadingRate(false));
    return () => { mounted = false; };
  }, []);

  const setCurrency = (value: CurrencyCode) => {
    setCurrencyState(value);
    localStorage.setItem("displayCurrency", value);
  };

  const convertFromUsd = (usdValue: number) => {
    if (currency === "USD") return usdValue;
    return usdInr ? usdValue * usdInr : usdValue;
  };

  const formatMoney = (usdValue: number, options?: Intl.NumberFormatOptions) => {
    const value = convertFromUsd(usdValue);
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      ...options,
    }).format(value);
  };

  const value = useMemo(() => ({ currency, setCurrency, usdInr, loadingRate, formatMoney, convertFromUsd }), [currency, usdInr, loadingRate]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}

package com.strataforge.engine;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;

public final class AnalyticsCalculator {
    private AnalyticsCalculator() {}

    public static BacktestResult.Metrics calculate(List<TradeRecord> trades, List<BigDecimal> equityCurve, BigDecimal startingCash) {
        BacktestResult.Metrics metrics = new BacktestResult.Metrics();
        metrics.totalTrades = trades.size();
        long wins = trades.stream().filter(t -> t.pnl != null && t.pnl.compareTo(BigDecimal.ZERO) > 0).count();
        metrics.winRate = trades.isEmpty() ? 0 : (wins * 100.0) / trades.size();

        BigDecimal finalEquity = equityCurve.isEmpty() ? startingCash : equityCurve.get(equityCurve.size() - 1);
        metrics.totalReturn = finalEquity.subtract(startingCash)
                .divide(startingCash, 8, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();

        BigDecimal peak = startingCash;
        double maxDrawdown = 0;
        for (BigDecimal value : equityCurve) {
            if (value.compareTo(peak) > 0) peak = value;
            double drawdown = peak.subtract(value).divide(peak, 8, RoundingMode.HALF_UP).doubleValue() * 100;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        }
        metrics.maxDrawdown = maxDrawdown;

        double[] dailyReturns = new double[Math.max(0, equityCurve.size() - 1)];
        for (int i = 1; i < equityCurve.size(); i++) {
            BigDecimal prev = equityCurve.get(i - 1);
            BigDecimal curr = equityCurve.get(i);
            dailyReturns[i - 1] = prev.signum() == 0 ? 0 : curr.subtract(prev).divide(prev, 10, RoundingMode.HALF_UP).doubleValue();
        }
        double mean = Arrays.stream(dailyReturns).average().orElse(0);
        double variance = Arrays.stream(dailyReturns).map(r -> Math.pow(r - mean, 2)).average().orElse(0);
        double stdDev = Math.sqrt(variance);
        metrics.sharpeRatio = stdDev == 0 ? 0 : (mean / stdDev) * Math.sqrt(252);
        return metrics;
    }
}

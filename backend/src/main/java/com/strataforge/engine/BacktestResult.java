package com.strataforge.engine;

import java.math.BigDecimal;
import java.util.List;

public class BacktestResult {
    public List<TradeRecord> trades;
    public List<BigDecimal> equityCurve;
    public Metrics metrics;

    public static class Metrics {
        public int totalTrades;
        public double winRate;
        public double totalReturn;
        public double maxDrawdown;
        public double sharpeRatio;
    }
}

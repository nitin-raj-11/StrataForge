package com.strataforge.engine;

import java.math.BigDecimal;

public class PerformanceMetrics {
    private int totalTrades;
    private BigDecimal winRate;
    private BigDecimal totalReturn;
    private BigDecimal maxDrawdown;
    private BigDecimal sharpeRatio;

    public PerformanceMetrics(int totalTrades, BigDecimal winRate, BigDecimal totalReturn, BigDecimal maxDrawdown, BigDecimal sharpeRatio) {
        this.totalTrades = totalTrades;
        this.winRate = winRate;
        this.totalReturn = totalReturn;
        this.maxDrawdown = maxDrawdown;
        this.sharpeRatio = sharpeRatio;
    }

    public int getTotalTrades() { return totalTrades; }
    public BigDecimal getWinRate() { return winRate; }
    public BigDecimal getTotalReturn() { return totalReturn; }
    public BigDecimal getMaxDrawdown() { return maxDrawdown; }
    public BigDecimal getSharpeRatio() { return sharpeRatio; }
}
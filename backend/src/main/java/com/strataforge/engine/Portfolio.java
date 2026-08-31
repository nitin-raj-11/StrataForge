package com.strataforge.engine;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class Portfolio {
    private BigDecimal cash;
    private BigDecimal positionQty = BigDecimal.ZERO;
    private BigDecimal entryPrice = BigDecimal.ZERO;

    public Portfolio(BigDecimal startingCash) { this.cash = startingCash; }
    public boolean inPosition() { return positionQty.compareTo(BigDecimal.ZERO) > 0; }

    public BigDecimal buy(BigDecimal price, double positionSizePercent) {
        BigDecimal allocation = cash.multiply(BigDecimal.valueOf(positionSizePercent / 100.0));
        positionQty = allocation.divide(price, 8, RoundingMode.HALF_UP);
        entryPrice = price;
        cash = cash.subtract(allocation);
        return positionQty;
    }

    public BigDecimal sell(BigDecimal price) {
        BigDecimal proceeds = positionQty.multiply(price);
        BigDecimal pnl = proceeds.subtract(positionQty.multiply(entryPrice));
        cash = cash.add(proceeds);
        positionQty = BigDecimal.ZERO;
        return pnl;
    }

    public BigDecimal totalValue(BigDecimal currentPrice) { return cash.add(positionQty.multiply(currentPrice)); }
    public BigDecimal getEntryPrice() { return entryPrice; }
    public BigDecimal getCash() { return cash; }
    public BigDecimal getPositionQty() { return positionQty; }
}

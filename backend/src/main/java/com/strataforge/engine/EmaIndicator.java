package com.strataforge.engine;

import com.strataforge.model.OhlcvBar;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class EmaIndicator implements Indicator {
    private final int period;

    public EmaIndicator(int period) { this.period = period; }

    @Override
    public BigDecimal calculate(List<OhlcvBar> barsUpToToday) {
        if (barsUpToToday.size() < period) return null;

        BigDecimal seed = BigDecimal.ZERO;
        for (int i = 0; i < period; i++) seed = seed.add(barsUpToToday.get(i).getClose());
        BigDecimal ema = seed.divide(BigDecimal.valueOf(period), 10, RoundingMode.HALF_UP);
        BigDecimal multiplier = BigDecimal.valueOf(2.0 / (period + 1.0));

        for (int i = period; i < barsUpToToday.size(); i++) {
            BigDecimal close = barsUpToToday.get(i).getClose();
            ema = close.subtract(ema).multiply(multiplier).add(ema);
        }
        return ema.setScale(4, RoundingMode.HALF_UP);
    }
}

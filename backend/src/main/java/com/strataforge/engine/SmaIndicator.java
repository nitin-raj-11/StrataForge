package com.strataforge.engine;

import com.strataforge.model.OhlcvBar;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class SmaIndicator implements Indicator {
    private final int period;
    public SmaIndicator(int period) { this.period = period; }

    @Override
    public BigDecimal calculate(List<OhlcvBar> barsUpToToday) {
        if (barsUpToToday.size() < period) return null;
        List<OhlcvBar> window = barsUpToToday.subList(barsUpToToday.size() - period, barsUpToToday.size());
        BigDecimal sum = BigDecimal.ZERO;
        for (OhlcvBar bar : window) sum = sum.add(bar.getClose());
        return sum.divide(BigDecimal.valueOf(period), 6, RoundingMode.HALF_UP);
    }
}

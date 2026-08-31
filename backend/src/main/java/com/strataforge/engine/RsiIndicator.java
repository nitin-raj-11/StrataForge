package com.strataforge.engine;

import com.strataforge.model.OhlcvBar;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class RsiIndicator implements Indicator {
    private final int period;

    public RsiIndicator(int period) { this.period = period; }

    @Override
    public BigDecimal calculate(List<OhlcvBar> barsUpToToday) {
        if (barsUpToToday.size() <= period) return null;

        double gain = 0.0;
        double loss = 0.0;
        int first = barsUpToToday.size() - period;
        for (int i = first; i < barsUpToToday.size(); i++) {
            double change = barsUpToToday.get(i).getClose().doubleValue()
                    - barsUpToToday.get(i - 1).getClose().doubleValue();
            if (change > 0) gain += change;
            else loss -= change;
        }

        double averageGain = gain / period;
        double averageLoss = loss / period;
        double rsi;
        if (averageGain == 0 && averageLoss == 0) rsi = 50.0;
        else if (averageLoss == 0) rsi = 100.0;
        else {
            double rs = averageGain / averageLoss;
            rsi = 100.0 - (100.0 / (1.0 + rs));
        }
        return BigDecimal.valueOf(rsi).setScale(4, RoundingMode.HALF_UP);
    }
}

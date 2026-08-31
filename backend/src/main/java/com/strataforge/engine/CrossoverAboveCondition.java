package com.strataforge.engine;

import java.math.BigDecimal;
import java.util.Map;

public class CrossoverAboveCondition implements Condition {
    private final String a;
    private final String b;

    public CrossoverAboveCondition(String a, String b) {
        this.a = a;
        this.b = b;
    }

    @Override
    public boolean evaluate(Map<String, BigDecimal> indicatorValues, Map<String, BigDecimal> previousIndicatorValues) {
        BigDecimal todayA = indicatorValues.get(a);
        BigDecimal todayB = indicatorValues.get(b);
        BigDecimal yesterdayA = previousIndicatorValues.get(a);
        BigDecimal yesterdayB = previousIndicatorValues.get(b);

        if (todayA == null || todayB == null || yesterdayA == null || yesterdayB == null) {
            return false;
        }

        return yesterdayA.compareTo(yesterdayB) <= 0 && todayA.compareTo(todayB) > 0;
    }
}
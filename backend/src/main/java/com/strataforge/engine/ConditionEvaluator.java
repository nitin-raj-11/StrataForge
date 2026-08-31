package com.strataforge.engine;

import com.strataforge.dsl.ConditionConfig;

import java.math.BigDecimal;
import java.util.Map;

public final class ConditionEvaluator {
    private ConditionEvaluator() {}

    public static boolean evaluate(ConditionConfig condition,
                                   Map<String, BigDecimal> today,
                                   Map<String, BigDecimal> yesterday) {
        if (condition == null || condition.getType() == null || condition.getA() == null) return false;

        BigDecimal aToday = today.get(condition.getA());
        BigDecimal bToday = condition.getB() == null ? null : today.get(condition.getB());
        BigDecimal aYesterday = yesterday.get(condition.getA());
        BigDecimal bYesterday = condition.getB() == null ? null : yesterday.get(condition.getB());

        return switch (condition.getType()) {
            case "CROSSOVER_ABOVE" ->
                    aToday != null && bToday != null && aYesterday != null && bYesterday != null
                            && aYesterday.compareTo(bYesterday) <= 0
                            && aToday.compareTo(bToday) > 0;
            case "CROSSOVER_BELOW" ->
                    aToday != null && bToday != null && aYesterday != null && bYesterday != null
                            && aYesterday.compareTo(bYesterday) >= 0
                            && aToday.compareTo(bToday) < 0;
            case "ABOVE_THRESHOLD" ->
                    aToday != null && condition.getThreshold() != null
                            && aToday.compareTo(BigDecimal.valueOf(condition.getThreshold())) > 0;
            case "BELOW_THRESHOLD" ->
                    aToday != null && condition.getThreshold() != null
                            && aToday.compareTo(BigDecimal.valueOf(condition.getThreshold())) < 0;
            default -> false;
        };
    }
}

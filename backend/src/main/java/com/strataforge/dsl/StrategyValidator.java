package com.strataforge.dsl;

import java.util.*;

public final class StrategyValidator {
    private StrategyValidator() {}

    private static final Set<String> SUPPORTED_INDICATORS = Set.of("SMA", "EMA", "RSI");
    private static final Set<String> CROSSOVER_TYPES = Set.of("CROSSOVER_ABOVE", "CROSSOVER_BELOW");
    private static final Set<String> THRESHOLD_TYPES = Set.of("ABOVE_THRESHOLD", "BELOW_THRESHOLD");

    public static List<String> validate(StrategyDefinition def) {
        List<String> errors = new ArrayList<>();
        if (def == null) return List.of("Strategy payload is required.");
        if (def.getName() == null || def.getName().isBlank()) errors.add("Strategy name is required.");
        if (def.getIndicators() == null || def.getIndicators().isEmpty()) {
            errors.add("At least one indicator is required.");
            return errors;
        }

        Set<String> ids = new HashSet<>();
        for (IndicatorConfig ind : def.getIndicators()) {
            if (ind == null || ind.getId() == null || ind.getId().isBlank()) {
                errors.add("Every indicator needs an id.");
                continue;
            }
            if (!ids.add(ind.getId())) errors.add("Indicator id '" + ind.getId() + "' is duplicated.");
            if (ind.getType() == null || ind.getType().isBlank()) errors.add("Indicator '" + ind.getId() + "' type is required.");
            else if (!SUPPORTED_INDICATORS.contains(ind.getType().toUpperCase())) errors.add("Indicator '" + ind.getId() + "' uses unsupported type '" + ind.getType() + "'.");
            if (ind.getPeriod() <= 0) errors.add("Indicator '" + ind.getId() + "' period must be positive.");
        }

        validateCondition("Entry", def.getEntryCondition(), ids, errors);
        validateCondition("Exit", def.getExitCondition(), ids, errors);

        RiskRules risk = def.getRiskRules();
        if (risk == null || risk.getStopLossPercent() <= 0 || risk.getStopLossPercent() > 100
                || risk.getTakeProfitPercent() <= 0 || risk.getTakeProfitPercent() > 100
                || risk.getPositionSizePercent() <= 0 || risk.getPositionSizePercent() > 100) {
            errors.add("Risk rules must have valid percentages between 0 and 100.");
        }
        return errors;
    }

    private static void validateCondition(String label, ConditionConfig condition, Set<String> ids, List<String> errors) {
        if (condition == null || condition.getType() == null || condition.getA() == null || !ids.contains(condition.getA())) {
            errors.add(label + " condition references an unknown indicator id.");
            return;
        }

        if (CROSSOVER_TYPES.contains(condition.getType())) {
            if (condition.getB() == null || !ids.contains(condition.getB())) {
                errors.add(label + " crossover condition references an unknown comparison indicator id.");
            }
        } else if (THRESHOLD_TYPES.contains(condition.getType())) {
            if (condition.getThreshold() == null || !Double.isFinite(condition.getThreshold())) {
                errors.add(label + " threshold condition requires a numeric threshold.");
            }
        } else {
            errors.add(label + " condition type is unsupported.");
        }
    }
}

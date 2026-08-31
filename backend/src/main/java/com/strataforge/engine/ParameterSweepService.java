package com.strataforge.engine;

import com.strataforge.dsl.ConditionConfig;
import com.strataforge.dsl.IndicatorConfig;
import com.strataforge.dsl.RiskRules;
import com.strataforge.dsl.StrategyDefinition;
import com.strataforge.model.OhlcvBar;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

public class ParameterSweepService {
    public static final int MAX_COMBINATIONS = 10_000;

    public static class SweepResult {
        public Map<String, Integer> parameters;
        public BacktestResult result;
        public long durationMs;
    }

    public List<SweepResult> runSweep(
            StrategyDefinition template,
            Map<String, int[]> parameterRanges,
            List<OhlcvBar> bars,
            String rankBy) {
        if (parameterRanges == null || parameterRanges.isEmpty()) {
            return List.of(runOne(template, Map.of(), bars));
        }

        validateKeys(template, parameterRanges);
        List<Map<String, Integer>> combinations = generateCombinations(parameterRanges);
        int cores = Math.max(1, Math.min(Runtime.getRuntime().availableProcessors(), 16));
        ExecutorService executor = Executors.newFixedThreadPool(cores);
        try {
            List<CompletableFuture<SweepResult>> futures = combinations.stream()
                    .map(combo -> CompletableFuture.supplyAsync(() -> runOne(template, combo, bars), executor))
                    .collect(Collectors.toList());
            List<SweepResult> results = futures.stream().map(CompletableFuture::join).collect(Collectors.toList());
            results.sort((a, b) -> Double.compare(metric(b.result, rankBy), metric(a.result, rankBy)));
            return results;
        } finally {
            executor.shutdown();
        }
    }

    private SweepResult runOne(StrategyDefinition template, Map<String, Integer> combo, List<OhlcvBar> bars) {
        long start = System.nanoTime();
        BacktestResult result = new BacktestEngine().run(applyParameters(template, combo), bars);
        SweepResult sr = new SweepResult();
        sr.parameters = combo;
        sr.result = result;
        sr.durationMs = (System.nanoTime() - start) / 1_000_000;
        return sr;
    }

    private double metric(BacktestResult result, String rankBy) {
        return switch (rankBy == null ? "sharpeRatio" : rankBy) {
            case "winRate" -> result.metrics.winRate;
            case "totalReturn" -> result.metrics.totalReturn;
            case "maxDrawdown" -> -result.metrics.maxDrawdown;
            default -> result.metrics.sharpeRatio;
        };
    }

    private void validateKeys(StrategyDefinition template, Map<String, int[]> ranges) {
        java.util.Set<String> allowed = new java.util.HashSet<>();
        for (IndicatorConfig ind : template.getIndicators()) allowed.add(ind.getId());
        allowed.add("stopLossPercent");
        allowed.add("takeProfitPercent");
        allowed.add("positionSizePercent");
        for (String key : ranges.keySet()) {
            if (!allowed.contains(key)) {
                throw new IllegalArgumentException("Unknown sweep parameter '" + key + "'. Use an indicator id or a supported risk field.");
            }
        }
    }

    private List<Map<String, Integer>> generateCombinations(Map<String, int[]> ranges) {
        List<Map<String, Integer>> combos = new ArrayList<>();
        combos.add(new LinkedHashMap<>());

        for (Map.Entry<String, int[]> entry : ranges.entrySet()) {
            int[] range = entry.getValue();
            if (range == null || range.length < 3 || range[2] <= 0 || range[0] > range[1]) {
                throw new IllegalArgumentException("Invalid parameter range for " + entry.getKey());
            }
            List<Map<String, Integer>> next = new ArrayList<>();
            for (Map<String, Integer> existing : combos) {
                for (int v = range[0]; v <= range[1]; v += range[2]) {
                    Map<String, Integer> copy = new LinkedHashMap<>(existing);
                    copy.put(entry.getKey(), v);
                    next.add(copy);
                    if (next.size() > MAX_COMBINATIONS) {
                        throw new IllegalArgumentException("Sweep is too large; limit it to 10,000 combinations.");
                    }
                }
            }
            combos = next;
        }
        return combos;
    }

    private StrategyDefinition applyParameters(StrategyDefinition template, Map<String, Integer> combo) {
        StrategyDefinition copy = new StrategyDefinition();
        copy.setName(template.getName());
        copy.setEntryCondition(copyCondition(template.getEntryCondition()));
        copy.setExitCondition(copyCondition(template.getExitCondition()));
        copy.setRiskRules(copyRisk(template.getRiskRules(), combo));

        List<IndicatorConfig> indicators = new ArrayList<>();
        for (IndicatorConfig ind : template.getIndicators()) {
            IndicatorConfig newInd = new IndicatorConfig();
            newInd.setId(ind.getId());
            newInd.setType(ind.getType());
            newInd.setPeriod(combo.getOrDefault(ind.getId(), ind.getPeriod()));
            indicators.add(newInd);
        }
        copy.setIndicators(indicators);
        return copy;
    }

    private ConditionConfig copyCondition(ConditionConfig source) {
        ConditionConfig c = new ConditionConfig();
        c.setType(source.getType());
        c.setA(source.getA());
        c.setB(source.getB());
        c.setThreshold(source.getThreshold());
        return c;
    }

    private RiskRules copyRisk(RiskRules source, Map<String, Integer> combo) {
        RiskRules r = new RiskRules();
        r.setStopLossPercent(combo.containsKey("stopLossPercent") ? combo.get("stopLossPercent") : source.getStopLossPercent());
        r.setTakeProfitPercent(combo.containsKey("takeProfitPercent") ? combo.get("takeProfitPercent") : source.getTakeProfitPercent());
        r.setPositionSizePercent(combo.containsKey("positionSizePercent") ? combo.get("positionSizePercent") : source.getPositionSizePercent());
        return r;
    }
}

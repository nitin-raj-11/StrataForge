package com.strataforge.engine;

import com.strataforge.dsl.*;
import com.strataforge.model.OhlcvBar;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class BacktestEngineTest {
    @Test
    void smaReturnsNullUntilEnoughBars() {
        SmaIndicator sma = new SmaIndicator(3);
        assertNull(sma.calculate(List.of(bar(1), bar(2))));
        assertEquals(0, sma.calculate(List.of(bar(1), bar(2), bar(3))).compareTo(new BigDecimal("2")));
    }

    @Test
    void emaReturnsNullUntilEnoughBarsAndUsesOnlyAvailableHistory() {
        EmaIndicator ema = new EmaIndicator(3);
        assertNull(ema.calculate(List.of(bar(1), bar(2))));
        assertEquals(3.0, ema.calculate(List.of(bar(1), bar(2), bar(3), bar(4))).doubleValue(), 0.0001);
    }

    @Test
    void rsiRecognizesStrongUpMove() {
        RsiIndicator rsi = new RsiIndicator(3);
        List<OhlcvBar> bars = List.of(bar(1), bar(2), bar(3), bar(4), bar(5));
        assertEquals(100.0, rsi.calculate(bars).doubleValue(), 0.0001);
    }

    @Test
    void thresholdConditionSupportsRsiStyleRules() {
        ConditionConfig c = new ConditionConfig();
        c.setType("BELOW_THRESHOLD"); c.setA("rsi"); c.setThreshold(30.0);
        assertTrue(ConditionEvaluator.evaluate(c, Map.of("rsi", bd(25)), Map.of("rsi", bd(26))));
        assertFalse(ConditionEvaluator.evaluate(c, Map.of("rsi", bd(35)), Map.of("rsi", bd(26))));
    }

    @Test
    void crossoverAboveRequiresPriorAtOrBelowAndCurrentAbove() {
        ConditionConfig c = new ConditionConfig(); c.setType("CROSSOVER_ABOVE"); c.setA("a"); c.setB("b");
        assertTrue(ConditionEvaluator.evaluate(c, Map.of("a", bd(12), "b", bd(10)), Map.of("a", bd(9), "b", bd(10))));
        assertFalse(ConditionEvaluator.evaluate(c, Map.of("a", bd(11), "b", bd(10)), Map.of("a", bd(12), "b", bd(10))));
    }

    @Test
    void engineProducesAnEquityPointForEveryBar() {
        StrategyDefinition s = new StrategyDefinition(); s.setName("test");
        IndicatorConfig a = new IndicatorConfig(); a.setId("short"); a.setType("SMA"); a.setPeriod(2);
        IndicatorConfig b = new IndicatorConfig(); b.setId("long"); b.setType("SMA"); b.setPeriod(3);
        s.setIndicators(List.of(a,b));
        ConditionConfig entry = new ConditionConfig(); entry.setType("CROSSOVER_ABOVE"); entry.setA("short"); entry.setB("long"); s.setEntryCondition(entry);
        ConditionConfig exit = new ConditionConfig(); exit.setType("CROSSOVER_BELOW"); exit.setA("short"); exit.setB("long"); s.setExitCondition(exit);
        RiskRules risk = new RiskRules(); risk.setPositionSizePercent(100); risk.setStopLossPercent(20); risk.setTakeProfitPercent(20); s.setRiskRules(risk);
        var result = new BacktestEngine().run(s, List.of(bar(10),bar(9),bar(8),bar(12),bar(14),bar(13)));
        assertEquals(6, result.equityCurve.size());
        assertNotNull(result.metrics);
    }

    @Test
    void sweepChangesRiskParameters() {
        StrategyDefinition s = new StrategyDefinition(); s.setName("risk");
        IndicatorConfig a = new IndicatorConfig(); a.setId("sma"); a.setType("SMA"); a.setPeriod(2);
        s.setIndicators(List.of(a));
        ConditionConfig entry = new ConditionConfig(); entry.setType("ABOVE_THRESHOLD"); entry.setA("sma"); entry.setThreshold(9.0); s.setEntryCondition(entry);
        ConditionConfig exit = new ConditionConfig(); exit.setType("BELOW_THRESHOLD"); exit.setA("sma"); exit.setThreshold(8.0); s.setExitCondition(exit);
        RiskRules risk = new RiskRules(); risk.setPositionSizePercent(100); risk.setStopLossPercent(5); risk.setTakeProfitPercent(10); s.setRiskRules(risk);
        var results = new ParameterSweepService().runSweep(s, Map.of("stopLossPercent", new int[]{5,10,5}), List.of(bar(10),bar(9),bar(8),bar(12),bar(7),bar(14)), "totalReturn");
        assertEquals(2, results.size());
    }

    private static OhlcvBar bar(int close) {
        OhlcvBar b = new OhlcvBar(); b.setTicker("TEST"); b.setDate(LocalDate.of(2020,1,1).plusDays(close)); BigDecimal p=bd(close); b.setOpen(p);b.setHigh(p);b.setLow(p);b.setClose(p);b.setVolume(1L); return b;
    }
    private static BigDecimal bd(int x) { return BigDecimal.valueOf(x); }
}

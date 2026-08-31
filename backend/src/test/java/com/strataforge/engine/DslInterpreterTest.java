package com.strataforge.engine;

import com.strataforge.model.OhlcvBar;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class DslInterpreterTest {

    // Helper method to quickly generate fake price bars
    private OhlcvBar createFakeBar(double closePrice) {
        OhlcvBar bar = new OhlcvBar();
        bar.setClose(BigDecimal.valueOf(closePrice));
        return bar;
    }

    @Test
    public void testSmaIndicatorMath() {
        SmaIndicator sma = new SmaIndicator(3); // 3-day SMA

        List<OhlcvBar> fakeHistory = List.of(
                createFakeBar(10.0),
                createFakeBar(20.0),
                createFakeBar(30.0),
                createFakeBar(40.0)
        );

        // The SMA should only look at the last 3 days (20, 30, 40).
        // Average = (20 + 30 + 40) / 3 = 30.0000
        BigDecimal result = sma.calculate(fakeHistory);

        BigDecimal expected = BigDecimal.valueOf(30.0).setScale(4, RoundingMode.HALF_UP);

        assertNotNull(result, "SMA should not be null when there are enough bars");
        assertEquals(0, expected.compareTo(result), "SMA math is incorrect!");
    }

    @Test
    public void testCrossoverAboveCondition() {
        Condition crossover = new CrossoverAboveCondition("fastSma", "slowSma");

        // Yesterday: Fast is strictly BELOW Slow
        Map<String, BigDecimal> yesterday = Map.of(
                "fastSma", BigDecimal.valueOf(10.0),
                "slowSma", BigDecimal.valueOf(15.0)
        );

        // Today: Fast crosses ABOVE Slow
        Map<String, BigDecimal> today = Map.of(
                "fastSma", BigDecimal.valueOf(20.0),
                "slowSma", BigDecimal.valueOf(18.0)
        );

        boolean isSignalTriggered = crossover.evaluate(today, yesterday);

        assertTrue(isSignalTriggered, "Crossover SHOULD be detected here!");
    }

    @Test
    public void testCrossoverAboveFailsWhenNoCrossHappens() {
        Condition crossover = new CrossoverAboveCondition("fastSma", "slowSma");

        // Yesterday: Fast is BELOW Slow
        Map<String, BigDecimal> yesterday = Map.of(
                "fastSma", BigDecimal.valueOf(10.0),
                "slowSma", BigDecimal.valueOf(15.0)
        );

        // Today: Fast is STILL BELOW Slow (no crossover occurred)
        Map<String, BigDecimal> today = Map.of(
                "fastSma", BigDecimal.valueOf(12.0),
                "slowSma", BigDecimal.valueOf(16.0)
        );

        boolean isSignalTriggered = crossover.evaluate(today, yesterday);

        assertFalse(isSignalTriggered, "Crossover should NOT be detected!");
    }
}
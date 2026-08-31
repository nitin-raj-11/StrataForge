package com.strataforge.engine;

import com.strataforge.dsl.IndicatorConfig;

public final class IndicatorFactory {
    private IndicatorFactory() {}

    public static Indicator create(IndicatorConfig config) {
        return switch (config.getType().toUpperCase()) {
            case "SMA" -> new SmaIndicator(config.getPeriod());
            case "EMA" -> new EmaIndicator(config.getPeriod());
            case "RSI" -> new RsiIndicator(config.getPeriod());
            default -> throw new IllegalArgumentException("Unknown indicator type: " + config.getType());
        };
    }
}

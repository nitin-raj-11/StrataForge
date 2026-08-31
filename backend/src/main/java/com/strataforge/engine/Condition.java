package com.strataforge.engine;

import java.math.BigDecimal;
import java.util.Map;

public interface Condition {
    boolean evaluate(Map<String, BigDecimal> indicatorValues, Map<String, BigDecimal> previousIndicatorValues);
}
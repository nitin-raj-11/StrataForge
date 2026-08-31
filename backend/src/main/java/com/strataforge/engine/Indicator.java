package com.strataforge.engine;

import com.strataforge.model.OhlcvBar;
import java.math.BigDecimal;
import java.util.List;

public interface Indicator {
    BigDecimal calculate(List<OhlcvBar> barsUpToToday);
}

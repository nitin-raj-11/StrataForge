package com.strataforge.engine;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TradeRecord {
    public LocalDate entryDate;
    public LocalDate exitDate;
    public BigDecimal entryPrice;
    public BigDecimal exitPrice;
    public BigDecimal quantity;
    public BigDecimal pnl;
}

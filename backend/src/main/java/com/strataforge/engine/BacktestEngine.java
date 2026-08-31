package com.strataforge.engine;

import com.strataforge.dsl.IndicatorConfig;
import com.strataforge.dsl.StrategyDefinition;
import com.strataforge.model.OhlcvBar;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

public class BacktestEngine {
    private static final BigDecimal STARTING_CASH = BigDecimal.valueOf(10_000);

    public BacktestResult run(StrategyDefinition definition, List<OhlcvBar> bars) {
        Map<String, Indicator> indicators = new LinkedHashMap<>();
        for (IndicatorConfig cfg : definition.getIndicators()) indicators.put(cfg.getId(), IndicatorFactory.create(cfg));

        Portfolio portfolio = new Portfolio(STARTING_CASH);
        List<TradeRecord> trades = new ArrayList<>();
        List<BigDecimal> equityCurve = new ArrayList<>();
        Map<String, BigDecimal> previousValues = new HashMap<>();
        TradeRecord openTrade = null;

        for (int i = 0; i < bars.size(); i++) {
            List<OhlcvBar> barsSoFar = bars.subList(0, i + 1); // strict no-look-ahead
            OhlcvBar today = bars.get(i);
            Map<String, BigDecimal> currentValues = new HashMap<>();
            for (Map.Entry<String, Indicator> entry : indicators.entrySet()) {
                currentValues.put(entry.getKey(), entry.getValue().calculate(barsSoFar));
            }

            if (i > 0 && !currentValues.containsValue(null) && !previousValues.containsValue(null)) {
                if (!portfolio.inPosition()
                        && ConditionEvaluator.evaluate(definition.getEntryCondition(), currentValues, previousValues)) {
                    BigDecimal qty = portfolio.buy(today.getClose(), definition.getRiskRules().getPositionSizePercent());
                    openTrade = new TradeRecord();
                    openTrade.entryDate = today.getDate();
                    openTrade.entryPrice = today.getClose();
                    openTrade.quantity = qty;
                } else if (portfolio.inPosition()) {
                    boolean exitSignal = ConditionEvaluator.evaluate(definition.getExitCondition(), currentValues, previousValues);
                    double changePercent = today.getClose().subtract(portfolio.getEntryPrice())
                            .divide(portfolio.getEntryPrice(), 8, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100)).doubleValue();
                    boolean hitStopLoss = changePercent <= -definition.getRiskRules().getStopLossPercent();
                    boolean hitTakeProfit = changePercent >= definition.getRiskRules().getTakeProfitPercent();
                    if (exitSignal || hitStopLoss || hitTakeProfit) {
                        BigDecimal pnl = portfolio.sell(today.getClose());
                        openTrade.exitDate = today.getDate();
                        openTrade.exitPrice = today.getClose();
                        openTrade.pnl = pnl;
                        trades.add(openTrade);
                        openTrade = null;
                    }
                }
            }
            equityCurve.add(portfolio.totalValue(today.getClose()));
            previousValues = currentValues;
        }

        // Mark any still-open trade to market at the last bar so results remain economically meaningful.
        if (openTrade != null && !bars.isEmpty()) {
            OhlcvBar last = bars.get(bars.size() - 1);
            openTrade.exitDate = last.getDate();
            openTrade.exitPrice = last.getClose();
            openTrade.pnl = last.getClose().subtract(openTrade.entryPrice).multiply(openTrade.quantity);
            trades.add(openTrade);
        }

        BacktestResult result = new BacktestResult();
        result.trades = trades;
        result.equityCurve = equityCurve;
        result.metrics = AnalyticsCalculator.calculate(trades, equityCurve, STARTING_CASH);
        return result;
    }
}

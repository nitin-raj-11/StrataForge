package com.strataforge.dsl;

import java.util.Map;

public class SweepRequest {
    private StrategyDefinition strategyTemplate;
    private Map<String, ParameterRange> parameterRanges;
    private String ticker;
    private String rankBy;

    public StrategyDefinition getStrategyTemplate() { return strategyTemplate; }
    public void setStrategyTemplate(StrategyDefinition strategyTemplate) { this.strategyTemplate = strategyTemplate; }

    public Map<String, ParameterRange> getParameterRanges() { return parameterRanges; }
    public void setParameterRanges(Map<String, ParameterRange> parameterRanges) { this.parameterRanges = parameterRanges; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getRankBy() { return rankBy; }
    public void setRankBy(String rankBy) { this.rankBy = rankBy; }
}
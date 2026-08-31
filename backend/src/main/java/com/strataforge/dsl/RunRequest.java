package com.strataforge.dsl;

public class RunRequest {
    private String ticker;
    private StrategyDefinition strategy;

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public StrategyDefinition getStrategy() { return strategy; }
    public void setStrategy(StrategyDefinition strategy) { this.strategy = strategy; }
}
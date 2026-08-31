package com.strataforge.dsl;

import java.util.List;

public class StrategyDefinition {
    private String name;
    private List<IndicatorConfig> indicators;
    private ConditionConfig entryCondition;
    private ConditionConfig exitCondition;
    private RiskRules riskRules;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<IndicatorConfig> getIndicators() { return indicators; }
    public void setIndicators(List<IndicatorConfig> indicators) { this.indicators = indicators; }
    public ConditionConfig getEntryCondition() { return entryCondition; }
    public void setEntryCondition(ConditionConfig condition) { this.entryCondition = condition; }
    public ConditionConfig getExitCondition() { return exitCondition; }
    public void setExitCondition(ConditionConfig condition) { this.exitCondition = condition; }
    public RiskRules getRiskRules() { return riskRules; }
    public void setRiskRules(RiskRules riskRules) { this.riskRules = riskRules; }
}

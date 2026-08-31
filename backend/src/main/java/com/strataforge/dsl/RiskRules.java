package com.strataforge.dsl;

public class RiskRules {
    private double stopLossPercent;
    private double takeProfitPercent;
    private double positionSizePercent;

    public double getStopLossPercent() { return stopLossPercent; }
    public void setStopLossPercent(double value) { this.stopLossPercent = value; }
    public double getTakeProfitPercent() { return takeProfitPercent; }
    public void setTakeProfitPercent(double value) { this.takeProfitPercent = value; }
    public double getPositionSizePercent() { return positionSizePercent; }
    public void setPositionSizePercent(double value) { this.positionSizePercent = value; }
}

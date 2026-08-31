package com.strataforge.dsl;

public class IndicatorConfig {
    private String id;
    private String type;
    private int period;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getPeriod() { return period; }
    public void setPeriod(int period) { this.period = period; }
}

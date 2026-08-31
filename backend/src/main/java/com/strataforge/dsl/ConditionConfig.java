package com.strataforge.dsl;

public class ConditionConfig {
    private String type;
    private String a;
    private String b;
    private Double threshold;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getA() { return a; }
    public void setA(String a) { this.a = a; }
    public String getB() { return b; }
    public void setB(String b) { this.b = b; }
    public Double getThreshold() { return threshold; }
    public void setThreshold(Double threshold) { this.threshold = threshold; }
}

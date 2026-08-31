package com.strataforge.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ohlcv_bars",
       uniqueConstraints = @UniqueConstraint(name = "uk_ohlcv_ticker_date", columnNames = {"ticker", "date"}),
       indexes = @Index(name = "idx_ohlcv_ticker_date", columnList = "ticker, date"))
public class OhlcvBar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    private String ticker;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal open;
    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal high;
    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal low;
    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal close;
    private Long volume;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public BigDecimal getOpen() { return open; }
    public void setOpen(BigDecimal open) { this.open = open; }
    public BigDecimal getHigh() { return high; }
    public void setHigh(BigDecimal high) { this.high = high; }
    public BigDecimal getLow() { return low; }
    public void setLow(BigDecimal low) { this.low = low; }
    public BigDecimal getClose() { return close; }
    public void setClose(BigDecimal close) { this.close = close; }
    public Long getVolume() { return volume; }
    public void setVolume(Long volume) { this.volume = volume; }
}

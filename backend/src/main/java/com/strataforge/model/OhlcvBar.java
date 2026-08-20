package com.strataforge.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ohlcv_bars")
public class OhlcvBar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ticker;
    private LocalDate date;
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal close;
    private Long volume;

    // Getters and setters
    // In IntelliJ: Right-click inside the class -> Generate -> Getters and Setters -> Select all fields -> OK
}

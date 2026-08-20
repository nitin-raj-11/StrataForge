package com.strataforge.repository;

import com.strataforge.model.OhlcvBar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OhlcvBarRepository extends JpaRepository<OhlcvBar, Long> {
    List<OhlcvBar> findByTickerAndDateBetween(String ticker, java.time.LocalDate start, java.time.LocalDate end);
}
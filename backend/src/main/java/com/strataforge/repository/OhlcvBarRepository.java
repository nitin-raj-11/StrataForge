package com.strataforge.repository;

import com.strataforge.model.OhlcvBar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface OhlcvBarRepository extends JpaRepository<OhlcvBar, Long> {
    List<OhlcvBar> findByTickerAndDateBetweenOrderByDateAsc(String ticker, LocalDate start, LocalDate end);
    List<OhlcvBar> findTop2ByTickerOrderByDateDesc(String ticker);

    @Query("select distinct o.ticker from OhlcvBar o order by o.ticker")
    List<String> findDistinctTickers();

    java.util.Optional<OhlcvBar> findFirstByTickerOrderByDateAsc(String ticker);
    java.util.Optional<OhlcvBar> findFirstByTickerOrderByDateDesc(String ticker);

    @Query("select o.ticker, min(o.date), max(o.date) from OhlcvBar o group by o.ticker order by o.ticker")
    List<Object[]> findTickerDateRanges();
}

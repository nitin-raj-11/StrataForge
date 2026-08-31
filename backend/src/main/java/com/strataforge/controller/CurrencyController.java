package com.strataforge.controller;

import com.strataforge.model.OhlcvBar;
import com.strataforge.repository.OhlcvBarRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/currency")
public class CurrencyController {
    private final OhlcvBarRepository ohlcvBarRepository;

    public CurrencyController(OhlcvBarRepository ohlcvBarRepository) {
        this.ohlcvBarRepository = ohlcvBarRepository;
    }

    public record FxRate(Double usdInr, String asOf, boolean available) {}

    @GetMapping("/usdinr")
    public FxRate usdInr() {
        List<OhlcvBar> latest = ohlcvBarRepository.findTop2ByTickerOrderByDateDesc("USDINR=X");
        if (latest.isEmpty() || latest.get(0).getClose() == null) {
            return new FxRate(null, null, false);
        }
        return new FxRate(latest.get(0).getClose().doubleValue(), latest.get(0).getDate().toString(), true);
    }
}

package com.strataforge.controller;

import com.strataforge.model.OhlcvBar;
import com.strataforge.repository.OhlcvBarRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickers")
public class TickerController {
    private static final Map<String, String> COMPANY_NAMES = Map.ofEntries(
            Map.entry("AAPL", "Apple Inc."), Map.entry("AMD", "Advanced Micro Devices, Inc."),
            Map.entry("AMZN", "Amazon.com, Inc."), Map.entry("BA", "The Boeing Company"),
            Map.entry("CVX", "Chevron Corporation"), Map.entry("DIS", "The Walt Disney Company"),
            Map.entry("GOOGL", "Alphabet Inc."), Map.entry("INTC", "Intel Corporation"),
            Map.entry("JPM", "JPMorgan Chase & Co."), Map.entry("KO", "The Coca-Cola Company"),
            Map.entry("MCD", "McDonald's Corporation"), Map.entry("MSFT", "Microsoft Corporation"),
            Map.entry("NFLX", "Netflix, Inc."), Map.entry("NKE", "NIKE, Inc."),
            Map.entry("NVDA", "NVIDIA Corporation"), Map.entry("PEP", "PepsiCo, Inc."),
            Map.entry("TSLA", "Tesla, Inc."), Map.entry("V", "Visa Inc."),
            Map.entry("WMT", "Walmart Inc."), Map.entry("XOM", "Exxon Mobil Corporation")
    );

    private final OhlcvBarRepository ohlcvBarRepository;

    public TickerController(OhlcvBarRepository ohlcvBarRepository) {
        this.ohlcvBarRepository = ohlcvBarRepository;
    }

    public record TickerSummary(
            String ticker,
            String companyName,
            double lastClose,
            double changePercent,
            LocalDate availableStartDate,
            LocalDate availableEndDate
    ) {}

    public record DataAvailability(
            String ticker,
            LocalDate startDate,
            LocalDate endDate
    ) {}

    @GetMapping("/summary")
    public List<TickerSummary> summary() {
        Map<String, LocalDate[]> ranges = new LinkedHashMap<>();
        for (Object[] row : ohlcvBarRepository.findTickerDateRanges()) {
            ranges.put((String) row[0], new LocalDate[]{(LocalDate) row[1], (LocalDate) row[2]});
        }

        List<TickerSummary> results = new ArrayList<>();
        for (Map.Entry<String, LocalDate[]> entry : ranges.entrySet()) {
            String ticker = entry.getKey();
            List<OhlcvBar> lastTwo = ohlcvBarRepository.findTop2ByTickerOrderByDateDesc(ticker);
            if (lastTwo.isEmpty()) continue;

            double changePercent = 0;
            if (lastTwo.size() == 2) {
                BigDecimal latest = lastTwo.get(0).getClose();
                BigDecimal previous = lastTwo.get(1).getClose();
                if (previous.signum() != 0) {
                    changePercent = latest.subtract(previous)
                            .divide(previous, 8, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();
                }
            }

            LocalDate[] range = entry.getValue();
            results.add(new TickerSummary(
                    ticker,
                    COMPANY_NAMES.getOrDefault(ticker, ticker),
                    lastTwo.get(0).getClose().doubleValue(),
                    changePercent,
                    range[0],
                    range[1]
            ));
        }

        results.sort(Comparator.comparing(TickerSummary::ticker));
        return results;
    }

    @GetMapping("/{ticker}/availability")
    public ResponseEntity<?> availability(@PathVariable String ticker) {
        String normalized = ticker == null ? "" : ticker.trim().toUpperCase();
        if (normalized.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ticker is required."));
        }

        var first = ohlcvBarRepository.findFirstByTickerOrderByDateAsc(normalized);
        var last = ohlcvBarRepository.findFirstByTickerOrderByDateDesc(normalized);
        if (first.isEmpty() || last.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new DataAvailability(
                normalized,
                first.get().getDate(),
                last.get().getDate()
        ));
    }
}

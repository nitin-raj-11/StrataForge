package com.strataforge.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.strataforge.dsl.StrategyDefinition;
import com.strataforge.dsl.StrategyValidator;
import com.strataforge.engine.BacktestEngine;
import com.strataforge.engine.BacktestResult;
import com.strataforge.engine.ParameterSweepService;
import com.strataforge.model.BacktestRun;
import com.strataforge.model.OhlcvBar;
import com.strataforge.model.Strategy;
import com.strataforge.model.Trade;
import com.strataforge.repository.BacktestRunRepository;
import com.strataforge.repository.OhlcvBarRepository;
import com.strataforge.repository.StrategyRepository;
import com.strataforge.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/backtests")
public class BacktestController {
    private final OhlcvBarRepository ohlcvBarRepository;
    private final StrategyRepository strategyRepository;
    private final BacktestRunRepository backtestRunRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    public BacktestController(OhlcvBarRepository ohlcvBarRepository, StrategyRepository strategyRepository,
                              BacktestRunRepository backtestRunRepository, CurrentUserService currentUserService,
                              ObjectMapper objectMapper) {
        this.ohlcvBarRepository = ohlcvBarRepository;
        this.strategyRepository = strategyRepository;
        this.backtestRunRepository = backtestRunRepository;
        this.currentUserService = currentUserService;
        this.objectMapper = objectMapper;
    }

    public static class RunRequest {
        public String ticker;
        public StrategyDefinition strategy;
        public Long strategyId;
        public LocalDate startDate;
        public LocalDate endDate;
    }

    @PostMapping("/run")
    @Transactional
    public ResponseEntity<?> runBacktest(@RequestBody RunRequest request, Authentication auth) {
        List<String> errors = validateRequest(request);
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(Map.of("errors", errors));
        String ticker = request.ticker.trim().toUpperCase();
        String rangeError = validateAvailableDataRange(ticker, request.startDate, request.endDate);
        if (rangeError != null) return ResponseEntity.badRequest().body(Map.of("errors", List.of(rangeError)));
        List<OhlcvBar> bars = ohlcvBarRepository.findByTickerAndDateBetweenOrderByDateAsc(ticker, request.startDate, request.endDate);
        if (bars.isEmpty()) return ResponseEntity.badRequest().body(Map.of("errors", List.of("No data for this ticker/date range.")));
        BacktestResult result = new BacktestEngine().run(request.strategy, bars);

        if (auth != null) {
            var owner = currentUserService.get(auth.getName());
            Strategy linkedStrategy = null;
            if (request.strategyId != null) {
                linkedStrategy = strategyRepository.findByIdAndUser(request.strategyId, owner).orElse(null);
            }
            BacktestRun savedRun = persistRun(owner, linkedStrategy, request, result, null);
            return ResponseEntity.ok(Map.of("runId", savedRun.getId(), "result", result));
        }
        return ResponseEntity.ok(result);
    }

    public static class SweepRequest {
        public String ticker;
        public String rankBy;
        public Map<String, int[]> parameterRanges;
        public StrategyDefinition strategyTemplate;
        public LocalDate startDate;
        public LocalDate endDate;
    }

    @PostMapping("/sweep")
    public ResponseEntity<?> runSweep(@RequestBody SweepRequest request) {
        if (request == null || request.strategyTemplate == null || request.ticker == null || request.startDate == null || request.endDate == null) {
            return ResponseEntity.badRequest().body(Map.of("errors", List.of("Ticker, date range, and strategy template are required.")));
        }
        List<String> errors = StrategyValidator.validate(request.strategyTemplate);
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(Map.of("errors", errors));
        String ticker = request.ticker.trim().toUpperCase();
        String rangeError = validateAvailableDataRange(ticker, request.startDate, request.endDate);
        if (rangeError != null) return ResponseEntity.badRequest().body(Map.of("errors", List.of(rangeError)));
        List<OhlcvBar> bars = ohlcvBarRepository.findByTickerAndDateBetweenOrderByDateAsc(ticker, request.startDate, request.endDate);
        if (bars.isEmpty()) return ResponseEntity.badRequest().body(Map.of("errors", List.of("No data for this ticker/date range.")));
        try {
            List<ParameterSweepService.SweepResult> results = new ParameterSweepService().runSweep(
                    request.strategyTemplate, request.parameterRanges, bars, request.rankBy);
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("errors", List.of(ex.getMessage())));
        }
    }

    @GetMapping("/bars")
    public ResponseEntity<?> getBars(@RequestParam String ticker, @RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        if (ticker.isBlank() || startDate.isAfter(endDate)) return ResponseEntity.badRequest().body(Map.of("error", "Invalid ticker or date range."));
        String normalized = ticker.trim().toUpperCase();
        String rangeError = validateAvailableDataRange(normalized, startDate, endDate);
        if (rangeError != null) return ResponseEntity.badRequest().body(Map.of("error", rangeError));
        return ResponseEntity.ok(ohlcvBarRepository.findByTickerAndDateBetweenOrderByDateAsc(normalized, startDate, endDate));
    }

    @GetMapping("/history")
    @Transactional
    public List<BacktestHistoryDto> history(Authentication auth) {
        return backtestRunRepository.findMine(currentUserService.get(auth.getName()).getId()).stream()
                .map(BacktestHistoryDto::from).toList();
    }

    @GetMapping("/history/{id}")
    @Transactional
    public ResponseEntity<?> historyDetail(@PathVariable Long id, Authentication auth) {
        var owner = currentUserService.get(auth.getName());
        var run = backtestRunRepository.findMineById(id, owner.getId());
        if (run.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        try {
            BacktestResult result = objectMapper.readValue(run.get().getResultJson(), BacktestResult.class);
            return ResponseEntity.ok(new BacktestDetailDto(run.get().getId(), run.get().getTicker(),
                    run.get().getStartDate(), run.get().getEndDate(), run.get().getStrategy() == null ? null : run.get().getStrategy().getName(), result));
        } catch (JsonProcessingException ex) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Stored backtest result could not be read."));
        }
    }

    public record BacktestDetailDto(Long id, String ticker, LocalDate startDate, LocalDate endDate, String strategyName, BacktestResult result) {}

    public record BacktestHistoryDto(Long id, String createdAt, String ticker, LocalDate startDate, LocalDate endDate,
                                     Double totalReturn, Double maxDrawdown, Double sharpeRatio, Double winRate, String strategyName) {
        static BacktestHistoryDto from(BacktestRun b) {
            return new BacktestHistoryDto(b.getId(), b.getCreatedAt().toString(), b.getTicker(), b.getStartDate(), b.getEndDate(),
                    b.getTotalReturn(), b.getMaxDrawdown(), b.getSharpeRatio(), b.getWinRate(),
                    b.getStrategy() == null ? null : b.getStrategy().getName());
        }
    }

    private String validateAvailableDataRange(String ticker, LocalDate requestedStart, LocalDate requestedEnd) {
        var first = ohlcvBarRepository.findFirstByTickerOrderByDateAsc(ticker);
        var last = ohlcvBarRepository.findFirstByTickerOrderByDateDesc(ticker);
        if (first.isEmpty() || last.isEmpty()) {
            return "No historical market data is available for " + ticker + ".";
        }
        LocalDate availableStart = first.get().getDate();
        LocalDate availableEnd = last.get().getDate();
        if (requestedStart.isBefore(availableStart) || requestedEnd.isAfter(availableEnd)) {
            return String.format(
                    "Data for %s is available only from %s to %s. Please select dates within this range.",
                    ticker, availableStart, availableEnd
            );
        }
        return null;
    }

    private List<String> validateRequest(RunRequest request) {
        if (request == null) return List.of("Request body is required.");
        List<String> errors = new ArrayList<>();
        if (request.ticker == null || request.ticker.isBlank()) errors.add("Ticker is required.");
        if (request.startDate == null || request.endDate == null || (request.startDate != null && request.endDate != null && request.startDate.isAfter(request.endDate))) errors.add("Start and end dates must form a valid range.");
        errors.addAll(StrategyValidator.validate(request.strategy));
        return errors;
    }

    private BacktestRun persistRun(com.strataforge.model.User owner, Strategy strategy, RunRequest request, BacktestResult result, Map<String, Integer> parameters) {
        BacktestRun run = new BacktestRun();
        run.setOwner(owner);
        run.setStrategy(strategy);
        run.setTicker(request.ticker.trim().toUpperCase());
        run.setStartDate(request.startDate);
        run.setEndDate(request.endDate);
        run.setTotalReturn(result.metrics.totalReturn);
        run.setMaxDrawdown(result.metrics.maxDrawdown);
        run.setSharpeRatio(result.metrics.sharpeRatio);
        run.setWinRate(result.metrics.winRate);
        try {
            run.setParameters(parameters == null ? null : objectMapper.writeValueAsString(parameters));
            run.setResultJson(objectMapper.writeValueAsString(result));
        } catch (JsonProcessingException ignored) {
            throw new IllegalStateException("Backtest result could not be serialized.", ignored);
        }
        for (var tr : result.trades) {
            Trade t = new Trade();
            t.setBacktestRun(run);
            t.setEntryDate(tr.entryDate); t.setExitDate(tr.exitDate);
            t.setEntryPrice(tr.entryPrice); t.setExitPrice(tr.exitPrice);
            t.setQuantity(tr.quantity); t.setPnl(tr.pnl);
            run.getTrades().add(t);
        }
        return backtestRunRepository.save(run);
    }
}

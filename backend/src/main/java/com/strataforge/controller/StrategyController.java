package com.strataforge.controller;

import com.strataforge.model.Strategy;
import com.strataforge.repository.StrategyRepository;
import com.strataforge.repository.BacktestRunRepository;
import com.strataforge.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/strategies")
public class StrategyController {
    private final StrategyRepository strategyRepository;
    private final CurrentUserService currentUserService;
    private final BacktestRunRepository backtestRunRepository;

    public StrategyController(StrategyRepository strategyRepository, CurrentUserService currentUserService, BacktestRunRepository backtestRunRepository) {
        this.strategyRepository = strategyRepository;
        this.currentUserService = currentUserService;
        this.backtestRunRepository = backtestRunRepository;
    }

    public record StrategyPayload(String name, String definitionJson) {}
    public record StrategyDto(Long id, String name, String definitionJson, LocalDateTime createdAt) {
        static StrategyDto from(Strategy s) { return new StrategyDto(s.getId(), s.getName(), s.getDefinitionJson(), s.getCreatedAt()); }
    }

    @GetMapping
    @Transactional
    public List<StrategyDto> listMine(Authentication auth) {
        return strategyRepository.findMine(currentUserService.get(auth.getName()).getId())
                .stream().map(StrategyDto::from).toList();
    }

    @GetMapping("/{id}")
    @Transactional
    public ResponseEntity<?> get(@PathVariable Long id, Authentication auth) {
        return strategyRepository.findMineById(id, currentUserService.get(auth.getName()).getId())
                .<ResponseEntity<?>>map(s -> ResponseEntity.ok(StrategyDto.from(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody StrategyPayload payload, Authentication auth) {
        if (payload == null || payload.name() == null || payload.name().isBlank() || payload.definitionJson() == null || payload.definitionJson().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Strategy name and definition are required."));
        }
        Strategy strategy = new Strategy();
        strategy.setUser(currentUserService.get(auth.getName()));
        strategy.setName(payload.name().trim());
        strategy.setDefinitionJson(payload.definitionJson());
        return ResponseEntity.ok(StrategyDto.from(strategyRepository.save(strategy)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody StrategyPayload payload, Authentication auth) {
        if (payload == null || payload.name() == null || payload.name().isBlank() || payload.definitionJson() == null || payload.definitionJson().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Strategy name and definition are required."));
        }
        var existing = strategyRepository.findMineById(id, currentUserService.get(auth.getName()).getId());
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        Strategy strategy = existing.get();
        strategy.setName(payload.name().trim());
        strategy.setDefinitionJson(payload.definitionJson());
        return ResponseEntity.ok(StrategyDto.from(strategyRepository.save(strategy)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        var strategy = strategyRepository.findMineById(id, currentUserService.get(auth.getName()).getId());
        if (strategy.isEmpty()) return ResponseEntity.notFound().build();

        // Preserve result history: detach any backtest runs from this strategy
        // before deleting it. This also works with databases created before
        // the FK was configured as ON DELETE SET NULL.
        backtestRunRepository.clearStrategyReference(id);
        strategyRepository.delete(strategy.get());

        return ResponseEntity.noContent().build();
    }
}

package com.strataforge.repository;

import com.strataforge.model.BacktestRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BacktestRunRepository extends JpaRepository<BacktestRun, Long> {
    @Query("select b from BacktestRun b left join fetch b.strategy where b.owner.id = :ownerId order by b.createdAt desc")
    List<BacktestRun> findMine(@Param("ownerId") Long ownerId);

    @Query("select b from BacktestRun b left join fetch b.strategy where b.id = :id and b.owner.id = :ownerId")
    Optional<BacktestRun> findMineById(@Param("id") Long id, @Param("ownerId") Long ownerId);

    @Modifying
    @Query("update BacktestRun b set b.strategy = null where b.strategy.id = :strategyId")
    int clearStrategyReference(@Param("strategyId") Long strategyId);
}

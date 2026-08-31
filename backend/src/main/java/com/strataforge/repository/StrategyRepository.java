package com.strataforge.repository;

import com.strataforge.model.Strategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StrategyRepository extends JpaRepository<Strategy, Long> {
    @Query("select s from Strategy s where s.user.id = :userId order by s.createdAt desc")
    List<Strategy> findMine(@Param("userId") Long userId);

    @Query("select s from Strategy s where s.id = :strategyId and s.user.id = :userId")
    Optional<Strategy> findMineById(@Param("strategyId") Long strategyId, @Param("userId") Long userId);

    List<Strategy> findByUserOrderByCreatedAtDesc(com.strataforge.model.User user);
    Optional<Strategy> findByIdAndUser(Long id, com.strataforge.model.User user);
}

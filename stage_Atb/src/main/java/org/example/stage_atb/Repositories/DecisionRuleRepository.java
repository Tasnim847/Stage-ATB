package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.DecisionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DecisionRuleRepository extends JpaRepository<DecisionRule, String> {
    List<DecisionRule> findByIsActiveTrueOrderByPriorityAsc();
    List<DecisionRule> findAllByOrderByPriorityAsc();
}
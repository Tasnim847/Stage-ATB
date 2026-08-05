package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.FinancialRatio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FinancialRatioRepository extends JpaRepository<FinancialRatio, String> {
    List<FinancialRatio> findByIsActiveTrueOrderByPriorityAsc();
}
package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.RiskModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RiskModelRepository extends JpaRepository<RiskModel, String> {
    List<RiskModel> findByIsActiveTrueOrderByPriorityAsc();
    List<RiskModel> findAllByOrderByPriorityAsc();
}
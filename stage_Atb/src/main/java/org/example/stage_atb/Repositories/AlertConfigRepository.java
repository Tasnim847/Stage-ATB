package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.AlertConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertConfigRepository extends JpaRepository<AlertConfig, String> {
    List<AlertConfig> findByIsActiveTrue();
}
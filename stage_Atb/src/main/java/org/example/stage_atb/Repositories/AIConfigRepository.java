package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.AIConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AIConfigRepository extends JpaRepository<AIConfig, String> {
    Optional<AIConfig> findByIsActiveTrue();
}
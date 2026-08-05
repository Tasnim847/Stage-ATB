package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.KycAmlConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KycAmlConfigRepository extends JpaRepository<KycAmlConfig, String> {
    List<KycAmlConfig> findByCategoryAndIsActiveTrue(String category);
    List<KycAmlConfig> findByIsActiveTrue();
}
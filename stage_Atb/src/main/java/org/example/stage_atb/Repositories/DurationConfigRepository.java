// Repositories/DurationConfigRepository.java
package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.DurationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DurationConfigRepository extends JpaRepository<DurationConfig, String> {

    List<DurationConfig> findByCreditTypeId(String creditTypeId);

    List<DurationConfig> findByCreditTypeIdAndIsActiveTrue(String creditTypeId);

    Optional<DurationConfig> findByCreditTypeIdAndIsDefaultTrue(String creditTypeId);

    List<DurationConfig> findByCreditTypeIdAndIsActiveTrueOrderByDurationMonthsAsc(String creditTypeId);

    // ✅ AJOUTER CETTE MÉTHODE
    Optional<DurationConfig> findByCreditTypeIdAndDurationMonths(String creditTypeId, Integer durationMonths);

    // ✅ AJOUTER CETTE MÉTHODE
    boolean existsByCreditTypeIdAndDurationMonths(String creditTypeId, Integer durationMonths);
}
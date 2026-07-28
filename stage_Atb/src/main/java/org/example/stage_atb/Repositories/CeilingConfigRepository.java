// Repositories/CeilingConfigRepository.java
package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.CeilingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CeilingConfigRepository extends JpaRepository<CeilingConfig, String> {

    List<CeilingConfig> findByCreditTypeId(String creditTypeId);

    List<CeilingConfig> findByCreditTypeIdAndIsActiveTrue(String creditTypeId);

    @Query("SELECT c FROM CeilingConfig c WHERE c.creditTypeId = :creditTypeId AND c.isActive = true AND :amount BETWEEN c.minAmount AND c.maxAmount")
    Optional<CeilingConfig> findByCreditTypeIdAndAmountBetween(String creditTypeId, Double amount);

    // ✅ AJOUTER CETTE MÉTHODE
    boolean existsByCreditTypeIdAndMinAmountLessThanEqualAndMaxAmountGreaterThanEqual(
            String creditTypeId, Double minAmount, Double maxAmount);
}
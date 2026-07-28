// Repositories/InterestRateRepository.java
package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.InterestRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterestRateRepository extends JpaRepository<InterestRate, String> {

    List<InterestRate> findByCreditTypeId(String creditTypeId);

    List<InterestRate> findByCreditTypeIdAndIsActiveTrue(String creditTypeId);

    Optional<InterestRate> findByCreditTypeIdAndIsDefaultTrue(String creditTypeId);

    @Query("SELECT i FROM InterestRate i WHERE i.creditTypeId = :creditTypeId AND i.isActive = true ORDER BY i.rate ASC")
    List<InterestRate> findActiveByCreditTypeIdOrderByRate(String creditTypeId);

    boolean existsByCreditTypeIdAndIsDefaultTrue(String creditTypeId);
}
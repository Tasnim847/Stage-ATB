package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.CreditSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CreditSimulationRepository extends JpaRepository<CreditSimulation, String> {

    List<CreditSimulation> findByUserId(String userId);

    List<CreditSimulation> findByClientId(String clientId);

    @Query("SELECT cs FROM CreditSimulation cs WHERE cs.amount BETWEEN :minAmount AND :maxAmount")
    List<CreditSimulation> findByAmountRange(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);

    @Query("SELECT cs FROM CreditSimulation cs WHERE cs.user.id = :userId ORDER BY cs.createdAt DESC")
    List<CreditSimulation> findLatestByUserId(@Param("userId") String userId);

    @Query("SELECT AVG(cs.monthlyPayment) FROM CreditSimulation cs")
    Double averageMonthlyPayment();
}
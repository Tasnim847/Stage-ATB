package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.FinancialAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialAnalysisRepository extends JpaRepository<FinancialAnalysis, String> {

    Optional<FinancialAnalysis> findByCreditRequestId(String creditRequestId);

    List<FinancialAnalysis> findByAnalystId(String analystId);

    @Query("SELECT fa FROM FinancialAnalysis fa WHERE fa.approvedByAnalyst = true")
    List<FinancialAnalysis> findApprovedAnalyses();

    @Query("SELECT fa FROM FinancialAnalysis fa WHERE fa.approvedByAnalyst = false")
    List<FinancialAnalysis> findPendingAnalyses();

    @Query("SELECT fa FROM FinancialAnalysis fa WHERE fa.creditRequest.client.id = :clientId")
    List<FinancialAnalysis> findByClientId(@Param("clientId") String clientId);

    @Query("SELECT AVG(fa.debtRatio) FROM FinancialAnalysis fa")
    Double averageDebtRatio();
}
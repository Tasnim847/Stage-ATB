// FinancialAnalysisRepository.java
package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.FinancialAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FinancialAnalysisRepository extends JpaRepository<FinancialAnalysis, String> {

    List<FinancialAnalysis> findByClientId(String clientId);

    List<FinancialAnalysis> findByCreditRequestId(String creditRequestId);

    List<FinancialAnalysis> findByAnalystId(String analystId);

    List<FinancialAnalysis> findByStatus(String status);

    List<FinancialAnalysis> findByApprovedByAnalyst(boolean approved);

    @Query("SELECT f FROM FinancialAnalysis f WHERE f.client.id = :clientId ORDER BY f.createdAt DESC")
    List<FinancialAnalysis> findLatestByClientId(@Param("clientId") String clientId);

    @Query("SELECT f FROM FinancialAnalysis f WHERE f.status = 'PENDING' ORDER BY f.createdAt ASC")
    List<FinancialAnalysis> findPendingAnalyses();

    @Query("SELECT AVG(f.overallScore) FROM FinancialAnalysis f WHERE f.client.id = :clientId")
    BigDecimal getAverageScoreByClient(@Param("clientId") String clientId);
}
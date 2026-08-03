// FinancialAnalysisRepository.java - CORRIGÉ
package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.FinancialAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;  // ✅ AJOUTER CET IMPORT

@Repository
public interface FinancialAnalysisRepository extends JpaRepository<FinancialAnalysis, String> {

    // ✅ AJOUTER CETTE MÉTHODE
    Optional<FinancialAnalysis> findByCreditRequestId(String creditRequestId);

    List<FinancialAnalysis> findByClientId(String clientId);

    // ⚠️ ATTENTION: Vous avez DUPLIQUÉ cette méthode !
    // Supprimez l'une des deux findByCreditRequestId
    // List<FinancialAnalysis> findByCreditRequestId(String creditRequestId);

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
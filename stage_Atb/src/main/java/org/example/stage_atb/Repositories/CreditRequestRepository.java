// Repositories/CreditRequestRepository.java - COMPLETE
package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.enums.CreditStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CreditRequestRepository extends JpaRepository<CreditRequest, String> {

    Optional<CreditRequest> findByRequestNumber(String requestNumber);

    List<CreditRequest> findByClientId(String clientId);

    List<CreditRequest> findByUserId(String userId);

    List<CreditRequest> findByStatus(CreditStatus status);

    @Query("SELECT cr FROM CreditRequest cr WHERE cr.client.id = :clientId AND cr.status IN :statuses")
    List<CreditRequest> findByClientIdAndStatuses(@Param("clientId") String clientId, @Param("statuses") List<CreditStatus> statuses);

    @Query("SELECT cr FROM CreditRequest cr WHERE cr.status = :status AND cr.createdAt BETWEEN :startDate AND :endDate")
    List<CreditRequest> findByStatusAndDateRange(@Param("status") CreditStatus status,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(cr.amount) FROM CreditRequest cr WHERE cr.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") CreditStatus status);

    @Query("SELECT SUM(cr.amount) FROM CreditRequest cr WHERE cr.status IN :statuses")
    BigDecimal sumAmountByStatuses(@Param("statuses") List<CreditStatus> statuses);

    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.status = :status AND cr.createdAt > :since")
    long countByStatusSince(@Param("status") CreditStatus status, @Param("since") LocalDateTime since);

    @Query("SELECT cr.status, COUNT(cr) FROM CreditRequest cr GROUP BY cr.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT cr.status, SUM(cr.amount) FROM CreditRequest cr GROUP BY cr.status")
    List<Object[]> sumAmountByStatusGrouped();

    @Query("SELECT cr FROM CreditRequest cr WHERE cr.amount BETWEEN :minAmount AND :maxAmount")
    List<CreditRequest> findByAmountRange(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);

    @Query("SELECT cr FROM CreditRequest cr WHERE cr.createdAt BETWEEN :startDate AND :endDate")
    List<CreditRequest> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.user.id = :userId")
    long countByUserId(@Param("userId") String userId);

    @Query("SELECT cr FROM CreditRequest cr WHERE cr.status IN :statuses ORDER BY cr.createdAt DESC")
    List<CreditRequest> findLatestByStatuses(@Param("statuses") List<CreditStatus> statuses);

    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.client.id = :clientId")
    long countByClientId(@Param("clientId") String clientId);

    // ============================================
    // ✅ NOUVELLES MÉTHODES POUR ANALYSTE MANAGEMENT
    // ============================================

    /**
     * Récupérer les demandes de crédit par analyste (via le client)
     */
    @Query("SELECT cr FROM CreditRequest cr WHERE cr.client.analyst.id = :analystId ORDER BY cr.createdAt DESC")
    List<CreditRequest> findByAnalystId(@Param("analystId") String analystId);

    /**
     * Récupérer les demandes de crédit par analyste et statut
     */
    @Query("SELECT cr FROM CreditRequest cr WHERE cr.client.analyst.id = :analystId AND cr.status = :status")
    List<CreditRequest> findByAnalystIdAndStatus(@Param("analystId") String analystId, @Param("status") CreditStatus status);

    /**
     * Compter les demandes de crédit par analyste avec plusieurs statuts
     */
    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.client.analyst.id = :analystId AND cr.status IN :statuses")
    long countByAnalystIdAndStatuses(@Param("analystId") String analystId, @Param("statuses") List<CreditStatus> statuses);

    /**
     * Compter les demandes de crédit par analyste
     */
    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.client.analyst.id = :analystId")
    long countByAnalystId(@Param("analystId") String analystId);

    /**
     * Récupérer les demandes de crédit sans analyste assigné avec un statut spécifique
     */
    @Query("SELECT cr FROM CreditRequest cr WHERE cr.status = :status AND cr.client.analyst IS NULL")
    List<CreditRequest> findByStatusAndAnalystIsNull(@Param("status") CreditStatus status);

    /**
     * Récupérer les demandes de crédit par analyste et période
     */
    @Query("SELECT cr FROM CreditRequest cr WHERE cr.client.analyst.id = :analystId AND cr.status = :status AND cr.createdAt BETWEEN :startDate AND :endDate")
    List<CreditRequest> findByAnalystIdAndStatusAndDateRange(
            @Param("analystId") String analystId,
            @Param("status") CreditStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Compter les demandes de crédit par analyste groupé
     */
    @Query("SELECT cr.client.analyst.id, COUNT(cr) FROM CreditRequest cr WHERE cr.status IN :statuses GROUP BY cr.client.analyst.id")
    List<Object[]> countGroupedByAnalystAndStatuses(@Param("statuses") List<CreditStatus> statuses);

    /**
     * Compter toutes les demandes de crédit par analyste groupé
     */
    @Query("SELECT cr.client.analyst.id, COUNT(cr) FROM CreditRequest cr GROUP BY cr.client.analyst.id")
    List<Object[]> countGroupedByAnalyst();

    // ✅ NOUVELLES MÉTHODES POUR LES VALIDATIONS MANAGER

    /**
     * Récupérer les crédits à valider par le manager (montant élevé ou risque élevé)
     */
    @Query("SELECT cr FROM CreditRequest cr WHERE cr.status = :status AND (cr.amount >= :highAmountThreshold OR cr.riskAnalysis.riskScore >= :highRiskThreshold)")
    List<CreditRequest> findPendingManagerValidation(@Param("status") CreditStatus status,
                                                     @Param("highAmountThreshold") BigDecimal highAmountThreshold,
                                                     @Param("highRiskThreshold") BigDecimal highRiskThreshold);

    /**
     * Récupérer les crédits à valider par le manager avec filtres
     */
    @Query("SELECT cr FROM CreditRequest cr WHERE cr.status = :status AND cr.amount >= :minAmount")
    List<CreditRequest> findHighAmountRequestsForManager(@Param("status") CreditStatus status,
                                                         @Param("minAmount") BigDecimal minAmount);

    /**
     * Récupérer les crédits à haut risque pour validation manager
     */
    @Query("SELECT cr FROM CreditRequest cr WHERE cr.status = :status AND cr.riskAnalysis.riskScore >= :riskThreshold")
    List<CreditRequest> findHighRiskRequestsForManager(@Param("status") CreditStatus status,
                                                       @Param("riskThreshold") BigDecimal riskThreshold);

    /**
     * Récupérer les crédits en attente de validation manager par période
     */
    @Query("SELECT cr FROM CreditRequest cr WHERE cr.status = :status AND cr.createdAt BETWEEN :startDate AND :endDate")
    List<CreditRequest> findPendingManagerValidationByDateRange(@Param("status") CreditStatus status,
                                                                @Param("startDate") LocalDateTime startDate,
                                                                @Param("endDate") LocalDateTime endDate);

    /**
     * Compter les crédits en attente de validation manager
     */
    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.status = :status AND (cr.amount >= :highAmountThreshold OR cr.riskAnalysis.riskScore >= :highRiskThreshold)")
    long countPendingManagerValidation(@Param("status") CreditStatus status,
                                       @Param("highAmountThreshold") BigDecimal highAmountThreshold,
                                       @Param("highRiskThreshold") BigDecimal highRiskThreshold);

    /**
     * Compter les crédits validés par le manager
     */
    @Query("SELECT COUNT(cr) FROM CreditRequest cr WHERE cr.status IN :validatedStatuses AND cr.managerValidationRequired = true")
    long countManagerValidated(@Param("validatedStatuses") List<CreditStatus> validatedStatuses);

}
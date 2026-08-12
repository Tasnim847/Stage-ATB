// Service/IAnalystManagementService.java
package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.AnalystAssignmentRequest;
import org.example.stage_atb.dto.request.BatchAssignmentRequest;
import org.example.stage_atb.dto.response.AnalystPerformanceDTO;
import org.example.stage_atb.dto.response.AnalystWorkloadDTO;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.dto.response.CreditRequestSummaryDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface IAnalystManagementService {

    // ============================================
    // GESTION DES DOSSIERS
    // ============================================

    /**
     * Voir tous les dossiers traités par les analystes
     */
    List<CreditResponseDTO> getAllProcessedFiles();

    /**
     * Voir les dossiers traités par un analyste spécifique
     */
    List<CreditResponseDTO> getProcessedFilesByAnalyst(String analystId);

    /**
     * Voir les dossiers traités par période
     */
    List<CreditResponseDTO> getProcessedFilesByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Récupérer les dossiers en attente d'affectation
     */
    List<CreditRequestSummaryDTO> getPendingAssignmentRequests();

    // ============================================
    // RÉPARTITION DES DOSSIERS
    // ============================================

    /**
     * Assigner un dossier à un analyste
     */
    CreditResponseDTO assignRequestToAnalyst(AnalystAssignmentRequest request);

    /**
     * Assigner plusieurs dossiers en lot
     */
    List<CreditResponseDTO> batchAssignRequests(BatchAssignmentRequest request);

    /**
     * Répartir automatiquement les dossiers entre les analystes
     */
    Map<String, List<CreditResponseDTO>> autoDistributeRequests(List<String> creditRequestIds);

    /**
     * Rééquilibrer la charge de travail entre les analystes
     */
    Map<String, List<CreditResponseDTO>> rebalanceWorkload();

    /**
     * Réaffecter un dossier d'un analyste à un autre
     */
    CreditResponseDTO reassignRequest(String creditRequestId, String newAnalystId, String reason);

    // ============================================
    // SUIVI DES PERFORMANCES
    // ============================================

    /**
     * Récupérer les performances de tous les analystes
     */
    List<AnalystPerformanceDTO> getAllAnalystPerformance();

    /**
     * Récupérer les performances d'un analyste spécifique
     */
    AnalystPerformanceDTO getAnalystPerformance(String analystId);

    /**
     * Récupérer la charge de travail de tous les analystes
     */
    List<AnalystWorkloadDTO> getAllAnalystWorkload();

    /**
     * Récupérer la charge de travail d'un analyste spécifique
     */
    AnalystWorkloadDTO getAnalystWorkload(String analystId);

    /**
     * Récupérer le classement des analystes
     */
    List<AnalystPerformanceDTO> getAnalystRanking();

    /**
     * Générer un rapport de performance pour le manager
     */
    String generatePerformanceReport(LocalDateTime startDate, LocalDateTime endDate);
}
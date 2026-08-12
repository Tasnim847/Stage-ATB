// Service/IManagerValidationService.java
package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.DecisionReturnRequest;
import org.example.stage_atb.dto.request.ValidationRequest;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.dto.response.ValidationResponseDTO;
import org.example.stage_atb.dto.response.ValidationSummaryDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface IManagerValidationService {

    // ============================================
    // VALIDER LES DÉCISIONS IMPORTANTES
    // ============================================

    /**
     * Récupérer tous les dossiers en attente de validation manager
     */
    List<ValidationSummaryDTO> getPendingValidations();

    /**
     * Récupérer les dossiers à valider par montant élevé
     */
    List<ValidationSummaryDTO> getHighAmountValidations(BigDecimal minAmount);

    /**
     * Récupérer les dossiers à valider par risque élevé
     */
    List<ValidationSummaryDTO> getHighRiskValidations(BigDecimal riskThreshold);

    /**
     * Récupérer les dossiers à valider par période
     */
    List<ValidationSummaryDTO> getPendingValidationsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Valider une décision importante
     */
    ValidationResponseDTO validateDecision(ValidationRequest request);

    /**
     * Approuver un crédit élevé
     */
    ValidationResponseDTO approveHighAmountCredit(String creditRequestId, String comments);

    /**
     * Refuser une décision
     */
    ValidationResponseDTO rejectDecision(String creditRequestId, String reason, String comments);

    /**
     * Retourner le dossier à l'analyste
     */
    ValidationResponseDTO returnToAnalyst(DecisionReturnRequest request);

    // ============================================
    // STATISTIQUES ET SUIVI
    // ============================================

    /**
     * Récupérer les statistiques de validation
     */
    Map<String, Object> getValidationStats();

    /**
     * Récupérer l'historique des validations
     */
    List<ValidationResponseDTO> getValidationHistory(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Récupérer les détails d'une validation
     */
    ValidationResponseDTO getValidationDetails(String creditRequestId);

    /**
     * Vérifier si un crédit nécessite une validation manager
     */
    boolean requiresManagerValidation(CreditResponseDTO creditRequest);

    /**
     * Générer un rapport de validation
     */
    String generateValidationReport(LocalDateTime startDate, LocalDateTime endDate);
}
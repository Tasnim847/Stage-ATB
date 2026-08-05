package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.FinancialAnalysisRequestDTO;
import org.example.stage_atb.dto.request.RatioCalculationRequestDTO;
import org.example.stage_atb.dto.response.FinancialAnalysisResponseDTO;
import org.example.stage_atb.dto.response.RatioCalculationResponseDTO;

import java.math.BigDecimal;
import java.util.List;

public interface IFinancialAnalysisService {

    // ============================================
    // ANALYSE FINANCIÈRE
    // ============================================

    /**
     * Calcule et sauvegarde une analyse financière complète
     */
    FinancialAnalysisResponseDTO calculateAndSaveAnalysis(FinancialAnalysisRequestDTO request);

    /**
     * Récupère une analyse par son ID
     */
    FinancialAnalysisResponseDTO getAnalysisById(String id);

    /**
     * Récupère toutes les analyses d'un client
     */
    List<FinancialAnalysisResponseDTO> getAnalysesByClient(String clientId);

    /**
     * Récupère les analyses par demande de crédit
     */
    List<FinancialAnalysisResponseDTO> getAnalysesByCreditRequest(String creditRequestId);

    /**
     * Récupère toutes les analyses
     */
    List<FinancialAnalysisResponseDTO> getAllAnalyses();

    /**
     * Récupère les analyses par analyste
     */
    List<FinancialAnalysisResponseDTO> getAnalysesByAnalyst(String analystId);

    /**
     * Met à jour une analyse existante
     */
    FinancialAnalysisResponseDTO updateAnalysis(String id, FinancialAnalysisRequestDTO request);

    /**
     * Supprime une analyse
     */
    void deleteAnalysis(String id);

    /**
     * Approuve une analyse
     */
    FinancialAnalysisResponseDTO approveAnalysis(String id, String analystId);

    /**
     * Rejette une analyse avec motif
     */
    FinancialAnalysisResponseDTO rejectAnalysis(String id, String analystId, String reason);

    // ============================================
    // CALCUL DES RATIOS
    // ============================================

    /**
     * Calcule tous les ratios financiers
     */
    RatioCalculationResponseDTO calculateRatios(RatioCalculationRequestDTO request);

    /**
     * Calcule la mensualité d'un crédit
     */
    BigDecimal calculateMonthlyPayment(BigDecimal amount, BigDecimal annualRate, Integer months);

    /**
     * Calcule le taux d'endettement
     */
    BigDecimal calculateDebtRatio(BigDecimal totalMonthlyIncome, BigDecimal existingPayments, BigDecimal newPayment);

    /**
     * Calcule la capacité de remboursement
     */
    BigDecimal calculateRepaymentCapacity(BigDecimal totalMonthlyIncome, BigDecimal charges, BigDecimal existingPayments);

    /**
     * Calcule le Loan To Value (LTV)
     */
    BigDecimal calculateLTV(BigDecimal creditAmount, BigDecimal collateralValue);

    /**
     * Calcule le Debt Service Coverage Ratio (DSCR)
     */
    BigDecimal calculateDSCR(BigDecimal cashFlow, BigDecimal annualDebtService);

    // ============================================
    // SCORE ET RECOMMANDATION
    // ============================================

    /**
     * Calcule le score global
     */
    BigDecimal calculateOverallScore(RatioCalculationResponseDTO ratios);

    /**
     * Détermine le niveau de risque
     */
    String determineRiskLevel(BigDecimal score);

    /**
     * Génère une recommandation
     */
    String generateRecommendation(RatioCalculationResponseDTO ratios);
}
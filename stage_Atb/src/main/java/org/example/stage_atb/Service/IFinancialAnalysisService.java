// IFinancialAnalysisService.java - CORRIGÉ
package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.FinancialAnalysisRequestDTO;
import org.example.stage_atb.dto.response.FinancialAnalysisResponseDTO;

import java.math.BigDecimal;
import java.util.List;

public interface IFinancialAnalysisService {

    FinancialAnalysisResponseDTO calculateAndSaveAnalysis(FinancialAnalysisRequestDTO request);

    FinancialAnalysisResponseDTO getAnalysisById(String id);

    List<FinancialAnalysisResponseDTO> getAnalysesByClient(String clientId);

    List<FinancialAnalysisResponseDTO> getAnalysesByCreditRequest(String creditRequestId);

    List<FinancialAnalysisResponseDTO> getAllAnalyses();

    List<FinancialAnalysisResponseDTO> getAnalysesByAnalyst(String analystId);

    FinancialAnalysisResponseDTO updateAnalysis(String id, FinancialAnalysisRequestDTO request);

    void deleteAnalysis(String id);

    // ✅ CORRECTION - Les deux méthodes doivent avoir la même signature
    // Option 1: Approve avec 2 paramètres (sans raison)
    FinancialAnalysisResponseDTO approveAnalysis(String id, String analystId);

    // Option 2: Approve avec 3 paramètres (avec raison optionnelle)
    // FinancialAnalysisResponseDTO approveAnalysis(String id, String analystId, String reason);

    // ✅ Reject avec 3 paramètres (raison obligatoire)
    FinancialAnalysisResponseDTO rejectAnalysis(String id, String analystId, String reason);

    // Méthodes de calcul
    BigDecimal calculateMonthlyPayment(BigDecimal amount, BigDecimal annualRate, Integer months);

    BigDecimal calculateDebtRatio(BigDecimal totalMonthlyIncome, BigDecimal existingPayments, BigDecimal newPayment);

    BigDecimal calculateRepaymentCapacity(BigDecimal totalMonthlyIncome, BigDecimal charges, BigDecimal existingPayments);

    BigDecimal calculateLTV(BigDecimal creditAmount, BigDecimal collateralValue);

    BigDecimal calculateDSCR(BigDecimal cashFlow, BigDecimal annualDebtService);
}